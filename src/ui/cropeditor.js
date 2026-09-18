// Cropping with your eyes instead of with arithmetic.
//
// The old version asked for an aspect ratio and an anchor because there was no
// picture to point at; you found out what you had cropped after downloading
// it. Here the rectangle is on the image, and the numbers follow the mouse
// rather than the other way round.
//
// The crop is kept as fractions of the image, which is what makes "apply to
// all" mean something when the photos are not the same size.

import { h, clear } from '../core/dom.js';
import { formatBytes, downloadBlob, downloadZip } from '../core/files.js';
import { dropzone } from './dropzone.js';
import { t } from '../i18n.js';

// Built on mount, not at import: the language file has not arrived yet when
// this module is first evaluated.
const ratios = () => [
  { v: 0, label: t('crop.free') }, { v: 1, label: '1:1' }, { v: 4 / 3, label: '4:3' }, { v: 3 / 2, label: '3:2' },
  { v: 16 / 9, label: '16:9' }, { v: 3 / 4, label: '3:4' }, { v: 2 / 3, label: '2:3' }, { v: 9 / 16, label: '9:16' },
];
const HANDLES = [['nw', 0, 0], ['ne', 1, 0], ['sw', 0, 1], ['se', 1, 1]];
const clamp01 = (n) => Math.min(1, Math.max(0, n));

export function mount(root) {
  /** @type {{file:File,url:string,w:number,h:number,crop:{x,y,w,h}}[]} */
  const shots = [];
  let active = 0;
  let ratio = 0;
  let applyAll = true;
  let busy = false;

  const strip = h('div', { class: 'strip' });
  const stage = h('div', { class: 'crop-stage' });
  const readout = h('span', { class: 'hint' });
  const notices = h('div');
  const editor = h('div', { class: 'panel', style: { display: 'none' } });
  const actions = h('div', { class: 'actions' });

  const format = h('select', { onchange: () => paint() },
    [['same', t('crop.keep')], ['jpeg', 'JPEG'], ['png', 'PNG'], ['webp', 'WebP']]
      .map(([v, label]) => h('option', { value: v }, label)));
  const quality = h('input', { type: 'range', min: 40, max: 100, step: 1, value: 90, oninput: () => paint() });

  const note = (kind, text) => clear(notices).append(h('div', { class: `msg ${kind}` }, text));

  const dz = dropzone({
    accepts: ['image/*'],
    label: t('crop.drop'),
    hint: t('crop.dropHint'),
    onFiles: addFiles,
    onRejected: (bad) => note('err', t('crop.notImages', { n: bad.length })),
  });

  async function addFiles(files) {
    clear(notices);
    for (const file of files) {
      try {
        const bmp = await createImageBitmap(file);
        shots.push({
          file,
          url: URL.createObjectURL(file),
          w: bmp.width,
          h: bmp.height,
          crop: { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
        });
        bmp.close?.();
      } catch {
        note('err', t('crop.cannotOpen', { name: file.name }));
      }
    }
    if (shots.length) { editor.style.display = ''; paint(); }
  }

  /** Force the active crop back onto the chosen aspect ratio, keeping its centre. */
  function applyRatio() {
    const shot = shots[active];
    if (!ratio || !shot) return;
    const { crop } = shot;
    const cx = crop.x + crop.w / 2;
    const cy = crop.y + crop.h / 2;
    // Ratio is width:height in pixels, so convert through the image's shape.
    const target = ratio * (shot.h / shot.w);
    let w = crop.w;
    let hh = w / target;
    if (hh > 1) { hh = 1; w = hh * target; }
    crop.w = Math.min(1, w);
    crop.h = Math.min(1, hh);
    crop.x = clamp01(Math.min(cx - crop.w / 2, 1 - crop.w));
    crop.y = clamp01(Math.min(cy - crop.h / 2, 1 - crop.h));
  }

  function paint() {
    const shot = shots[active];
    if (!shot) return;

    clear(strip);
    shots.forEach((s, i) => strip.append(h('button', {
      class: `strip-item${i === active ? ' on' : ''}`,
      title: s.file.name,
      onclick: () => { active = i; paint(); },
    }, h('img', { src: s.url, alt: '' }))));

    clear(stage);
    const img = h('img', { src: shot.url, alt: shot.file.name, draggable: false });
    const box = h('div', { class: 'crop-box' });
    for (const [name] of HANDLES) box.append(h('i', { class: `grip ${name}`, 'data-grip': name }));
    const shade = h('div', { class: 'crop-shade' });
    stage.append(img, shade, box);

    const place = () => {
      const { x, y, w, h: ch } = shot.crop;
      for (const el of [box, shade]) {
        el.style.left = `${x * 100}%`;
        el.style.top = `${y * 100}%`;
        el.style.width = `${w * 100}%`;
        el.style.height = `${ch * 100}%`;
      }
      const px = {
        x: Math.round(x * shot.w), y: Math.round(y * shot.h),
        w: Math.round(w * shot.w), h: Math.round(ch * shot.h),
      };
      readout.textContent = t('crop.readout', { w: px.w, h: px.h, x: px.x, y: px.y, ow: shot.w, oh: shot.h });
    };
    place();

    // One pointer handler for the whole stage: which mode we are in depends on
    // where the gesture started.
    stage.onpointerdown = (e) => {
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const at = (ev) => ({ x: clamp01((ev.clientX - rect.left) / rect.width), y: clamp01((ev.clientY - rect.top) / rect.height) });
      const start = at(e);
      const grip = e.target.dataset?.grip;
      const inside = !grip && start.x >= shot.crop.x && start.x <= shot.crop.x + shot.crop.w
        && start.y >= shot.crop.y && start.y <= shot.crop.y + shot.crop.h;
      const origin = { ...shot.crop };
      stage.setPointerCapture(e.pointerId);
      e.preventDefault();

      const anchor = grip
        ? { x: grip.includes('w') ? origin.x + origin.w : origin.x, y: grip.includes('n') ? origin.y + origin.h : origin.y }
        : start;

      const onMove = (ev) => {
        const now = at(ev);
        if (inside) {
          shot.crop.x = clamp01(Math.min(origin.x + (now.x - start.x), 1 - origin.w));
          shot.crop.y = clamp01(Math.min(origin.y + (now.y - start.y), 1 - origin.h));
          shot.crop.w = origin.w;
          shot.crop.h = origin.h;
        } else {
          shot.crop.x = Math.min(anchor.x, now.x);
          shot.crop.y = Math.min(anchor.y, now.y);
          shot.crop.w = Math.max(0.02, Math.abs(now.x - anchor.x));
          shot.crop.h = Math.max(0.02, Math.abs(now.y - anchor.y));
          if (ratio) {
            const target = ratio * (shot.h / shot.w);
            shot.crop.h = shot.crop.w / target;
            if (shot.crop.y + shot.crop.h > 1) shot.crop.h = 1 - shot.crop.y;
            shot.crop.w = shot.crop.h * target;
          }
          shot.crop.w = Math.min(shot.crop.w, 1 - shot.crop.x);
          shot.crop.h = Math.min(shot.crop.h, 1 - shot.crop.y);
        }
        place();
      };
      const onUp = () => {
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerup', onUp);
      };
      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerup', onUp);
    };

    clear(actions);
    actions.append(
      h('button', { class: 'btn', disabled: busy, onclick: run }, busy ? t('crop.running') : `${t('crop.run')}${applyAll && shots.length > 1 ? ` (${shots.length})` : ''}`),
      h('button', { class: 'btn ghost', onclick: () => { shot.crop = { x: 0, y: 0, w: 1, h: 1 }; applyRatio(); paint(); } }, t('crop.whole')),
      h('button', {
        class: 'btn ghost',
        onclick: () => { shots.splice(active, 1); active = Math.max(0, active - 1); if (!shots.length) editor.style.display = 'none'; paint(); },
      }, t('crop.removeThis')),
      h('span', { class: 'spacer' }),
      readout,
    );
  }

  const field = (label, control) => h('div', { class: 'field' }, h('label', null, label), control);

  const ratioSelect = h('select', {
    onchange: (e) => { ratio = Number(e.target.value); applyRatio(); paint(); },
  }, ratios().map((r) => h('option', { value: r.v }, r.label)));

  const allBox = h('input', {
    type: 'checkbox', id: 'crop-all', checked: true,
    onchange: (e) => { applyAll = e.target.checked; paint(); },
  });

  /**
   * The crop that the active image's rectangle means for another image.
   *
   * With no ratio locked, the fractions are the shared thing and copy over
   * directly. With one locked they cannot: a square is a square in pixels, and
   * the same fractions on a portrait photo give a portrait rectangle. So the
   * ratio is re-imposed in pixel space around the same centre.
   */
  function shared(shot, src) {
    if (!ratio || shot === shots[active]) return src;
    const cx = src.x + src.w / 2;
    const cy = src.y + src.h / 2;
    let wpx = src.w * shot.w;
    let hpx = wpx / ratio;
    if (hpx > shot.h) { hpx = shot.h; wpx = hpx * ratio; }
    if (wpx > shot.w) { wpx = shot.w; hpx = wpx / ratio; }
    const w = wpx / shot.w;
    const hh = hpx / shot.h;
    return {
      x: clamp01(Math.min(cx - w / 2, 1 - w)),
      y: clamp01(Math.min(cy - hh / 2, 1 - hh)),
      w,
      h: hh,
    };
  }

  async function run() {
    if (busy || !shots.length) return;
    busy = true;
    clear(notices);
    paint();
    try {
      const { runners } = await import('../tools/image.js');
      const source = shots[active].crop;
      const outputs = [];
      for (const shot of applyAll ? shots : [shots[active]]) {
        const c = applyAll ? shared(shot, source) : shot.crop;
        const out = await runners['image-crop']({ name: shot.file.name, blob: shot.file }, {
          mode: 'pixels',
          x: Math.round(c.x * shot.w),
          y: Math.round(c.y * shot.h),
          w: Math.max(1, Math.round(c.w * shot.w)),
          h: Math.max(1, Math.round(c.h * shot.h)),
          format: format.value,
          quality: Number(quality.value),
        });
        outputs.push(out);
      }
      if (outputs.length === 1) downloadBlob(outputs[0].blob, outputs[0].name);
      else await downloadZip(outputs, 'retallades.zip');
      const total = outputs.reduce((n, o) => n + o.blob.size, 0);
      note('ok', t('crop.done', { n: outputs.length, size: formatBytes(total) }));
    } catch (e) {
      note('err', e.message);
    } finally {
      busy = false;
      paint();
    }
  }

  editor.append(
    h('h3', null, t('crop.title')),
    strip,
    stage,
    h('div', { class: 'params', style: { marginTop: '14px' } },
      field(t('crop.ratio'), ratioSelect),
      field(t('crop.format'), format),
      field(t('crop.quality'), quality),
      h('div', { class: 'field row' }, allBox, h('label', { for: 'crop-all' }, t('crop.applyAll')))),
    actions,
  );

  root.append(h('div', { class: 'panel' }, dz), editor, notices);

  return () => { for (const s of shots) URL.revokeObjectURL(s.url); };
}
