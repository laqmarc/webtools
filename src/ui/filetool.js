import { h, clear } from '../core/dom.js';
import { formatBytes, downloadBlob, downloadZip, sniffType, matchesAccept } from '../core/files.js';
import { mapLimit, POOL_SIZE } from '../core/pool.js';
import { dropzone } from './dropzone.js';
import { paramsForm } from './params.js';
import { sendTo, targetsFor } from './sendto.js';
import { claim } from '../core/handoff.js';
import { t, tn } from '../i18n.js';

let seq = 0;

const homePath = () => window.__PAGE__?.home || '../';

/** Generic batch page: drop files, set parameters, run, download. */
export function mountFileTool(root, tool, mod) {
  const items = [];
  const urls = new Set();
  let running = false;
  let dragFrom = null;
  // Aggregate tools produce one result for the whole batch, not per input.
  let combined = [];

  const listPanel = h('div', { class: 'panel', style: { display: 'none' } });
  const list = h('ul', { class: 'files' });
  const listHead = h('h3');
  const progress = h('i');
  const bar = h('div', { class: 'bar', style: { display: 'none' } }, progress);
  const actions = h('div', { class: 'actions' });
  const notices = h('div');
  listPanel.append(listHead, list, bar, actions);

  const dz = dropzone({
    accepts: tool.accepts,
    label: t(tool.aggregate ? 'file.dropCombine' : 'file.drop'),
    hint: acceptHint(tool),
    onFiles: add,
    onRejected: (bad) => notify('err', tn('file.rejected', bad.length, {
      names: bad.slice(0, 3).map((f) => f.name).join(', ') + (bad.length > 3 ? '…' : ''),
    })),
  });

  const form = tool.params?.length
    ? paramsForm(tool.storeKey || tool.id, tool.params, reset, { preset: tool.preset, lock: tool.lock, presets: tool.presets })
    : null;
  const paramsPanel = form && !form.empty
    ? h('div', { class: 'panel' }, h('h3', null, t('params.title')), form.el)
    : null;

  function acceptHint(tl) {
    if (!tl.accepts?.length) return `${t('file.anyFile')} · ${t('file.orClick')}`;
    const nice = tl.accepts.map((a) => {
      if (a.startsWith('.')) return a.slice(1).toUpperCase();
      if (a === 'image/*') return t('file.anyImage');
      return a.replace(/^.*\//, '').toUpperCase();
    });
    return `${[...new Set(nice)].join(' · ')} · ${t('file.orClick')}`;
  }

  function notify(kind, text) {
    clear(notices).append(h('div', { class: `msg ${kind}` }, text));
    if (kind !== 'err') setTimeout(() => clear(notices), 4000);
  }

  function add(files) {
    for (const f of files) {
      const item = { key: ++seq, file: f, status: 'pending', outputs: [], error: null };
      if (sniffType(f).startsWith('image/')) {
        item.thumb = URL.createObjectURL(f);
        urls.add(item.thumb);
      }
      items.push(item);
    }
    clear(notices);
    render();
  }

  function remove(item) {
    const i = items.indexOf(item);
    if (i >= 0) items.splice(i, 1);
    render();
  }

  /** Parameters changed: previous results no longer describe the settings. */
  function reset() {
    let dirty = combined.length > 0;
    combined = [];
    for (const it of items) {
      if (it.status !== 'pending') { it.status = 'pending'; it.outputs = []; it.error = null; dirty = true; }
    }
    if (dirty) render();
  }

  function allOutputs() {
    return tool.aggregate ? combined : items.flatMap((it) => it.outputs);
  }

  function render() {
    listPanel.style.display = items.length ? '' : 'none';
    const done = items.filter((i) => i.status === 'done').length;
    const failed = items.filter((i) => i.status === 'error').length;
    listHead.textContent = (items.length === 1 ? t('file.countOne') : t('file.count', { n: items.length }))
      + (done ? ` · ${t('file.done', { n: done })}` : '')
      + (failed ? ` · ${t('file.failed', { n: failed })}` : '');

    clear(list);
    for (const it of items) list.append(row(it));
    for (const o of (tool.aggregate ? combined : [])) {
      list.append(h('li', null,
        h('div', { class: 'thumb' }, '✔'),
        h('div', { class: 'fname' }, h('b', null, o.name), h('span', null, t('file.combinedResult'))),
        h('span', { class: 'fsize' }, formatBytes(o.blob.size)),
        h('span', { class: 'delta good' }, `${items.length} → 1`),
        h('button', { class: 'x-btn', title: t('file.download'), onclick: () => downloadBlob(o.blob, o.name) }, '↓')));
    }

    clear(actions);
    const outs = allOutputs();
    // append() no filtra els nuls com fa h(): escriu literalment «null».
    const buttons = [
      h('button', { class: 'btn', disabled: running || !items.length, onclick: run },
        running ? t('file.processing') : t(tool.aggregate ? 'file.combine' : 'file.process')),
      h('button', { class: 'btn ghost', disabled: running, onclick: () => { items.length = 0; clear(notices); render(); } }, t('file.clear')),
      form ? h('button', { class: 'btn ghost', disabled: running, onclick: () => form.reset() }, t('file.defaults')) : null,
      h('span', { class: 'spacer' }),
      outs.length > 1
        ? h('button', { class: 'btn', onclick: () => downloadZip(outs, `${tool.id}.zip`) }, t('file.downloadAll', { n: outs.length }))
        : null,
      outs.length === 1
        ? h('button', { class: 'btn', onclick: () => downloadBlob(outs[0].blob, outs[0].name) }, t('file.download'))
        : null,
      outs.length && targetsFor(outs, tool.id).length
        ? h('button', {
          class: 'btn ghost',
          onclick: () => sendTo(outs, { excludeId: tool.id, home: homePath(), onFail: (m) => notify('err', m) }),
        }, t('chain.sendAll'))
        : null,
    ];
    actions.append(...buttons.filter(Boolean));
  }

  /**
   * Side-by-side under a wipe handle. A percentage saved means nothing until
   * you can see what it cost, and flicking between two downloads is no way
   * to judge that.
   */
  function compare(it, out) {
    const before = URL.createObjectURL(it.file);
    const after = URL.createObjectURL(out.blob);
    const clip = h('div', { class: 'cmp-after' }, h('img', { src: after, alt: t('text.output') }));
    const handle = h('input', {
      type: 'range', min: 0, max: 100, value: 50, class: 'cmp-range',
      'aria-label': t('file.compare'),
      oninput: (e) => { clip.style.clipPath = `inset(0 0 0 ${e.target.value}%)`; },
    });
    clip.style.clipPath = 'inset(0 0 0 50%)';

    const close = () => {
      overlay.remove();
      URL.revokeObjectURL(before);
      URL.revokeObjectURL(after);
      removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    addEventListener('keydown', onKey);

    const overlay = h('div', {
      class: 'cmp', onclick: (e) => { if (e.target === overlay) close(); },
    },
    h('div', { class: 'cmp-box' },
      h('div', { class: 'cmp-head' },
        h('span', null, `${it.file.name} · ${formatBytes(it.file.size)}`),
        h('span', { class: 'spacer' }),
        h('span', null, `${out.name} · ${formatBytes(out.blob.size)}`),
        h('button', { class: 'btn ghost sm', onclick: close }, t('cmp.close'))),
      h('div', { class: 'cmp-stage' },
        h('img', { src: before, alt: 'Original' }),
        clip,
        handle),
      h('p', { class: 'note' }, t('cmp.hint'))));

    document.body.append(overlay);
  }

  /**
   * Rows are draggable because for `Unir PDF` and `Imatges a PDF` the order of
   * the list *is* the result, and re-picking the files to change it is absurd.
   */
  const dragProps = (position) => ({
    draggable: !running,
    class: dragFrom === position ? 'dragging' : '',
    ondragstart: (e) => { dragFrom = position; e.dataTransfer.effectAllowed = 'move'; },
    ondragend: () => { dragFrom = null; render(); },
    ondragover: (e) => {
      e.preventDefault();
      if (dragFrom !== null && dragFrom !== position) { reorder(dragFrom, position); dragFrom = position; }
    },
    ondrop: (e) => e.preventDefault(),
  });

  /** Second line of a row: where it came from, and what the runner reports. */
  function subtitle(it, out) {
    if (it.status !== 'done') return sniffType(it.file) || t('file.plainFile');
    const bits = [];
    if (out && out.name !== it.file.name) bits.push(`${it.file.name} · ${formatBytes(it.file.size)}`);
    if (out?.note) bits.push(out.note);
    return bits.join(' · ') || sniffType(it.file) || t('file.plainFile');
  }


  function reorder(from, to) {
    if (from === to || from == null || to == null) return;
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    render();
  }

  function row(it) {
    const position = items.indexOf(it);
    const out = it.outputs[0];
    const thumb = it.thumb
      ? h('img', { class: 'thumb', src: it.thumb, alt: '' })
      : h('div', { class: 'thumb' }, (it.file.name.match(/\.([^.]+)$/)?.[1] || '?').slice(0, 4).toUpperCase());

    const name = it.outputs.length > 1
      ? `${it.outputs.length} fitxers`
      : (out?.name || it.file.name);

    const size = it.status === 'done'
      ? it.outputs.reduce((n, o) => n + o.blob.size, 0)
      : it.file.size;

    let third = null;
    if (tool.aggregate) {
      third = h('span', { class: 'status' }, it.status === 'done' ? t('file.included') : it.status === 'error' ? t('file.error').toLowerCase() : '');
      return h('li', dragProps(position),
        thumb,
        h('div', { class: 'fname' }, h('b', { title: it.file.name }, it.file.name), h('span', null, sniffType(it.file) || t('file.plainFile'))),
        h('span', { class: 'fsize' }, formatBytes(it.file.size)),
        third,
        h('button', { class: 'x-btn', title: t('file.remove'), onclick: () => remove(it) }, '×'));
    }
    if (it.status === 'done') {
      const pct = Math.round((1 - size / it.file.size) * 100);
      third = h('span', { class: `delta ${pct >= 0 ? 'good' : 'bad'}` }, `${pct >= 0 ? '−' : '+'}${Math.abs(pct)}%`);
    } else if (it.status === 'error') {
      third = h('span', { class: 'status err', title: it.error }, t('file.error'));
    } else if (it.status === 'running') {
      third = h('span', { class: 'status' }, it.note || t('file.processing'));
    }

    const comparable = it.status === 'done' && it.outputs.length === 1
      && sniffType(it.file).startsWith('image/') && out.blob.type.startsWith('image/');

    const action = it.status === 'done'
      ? h('span', { style: { display: 'flex', gap: '2px' } },
        comparable
          ? h('button', { class: 'x-btn', title: t('file.compare'), onclick: () => compare(it, out) }, '◑')
          : null,
        targetsFor(it.outputs, tool.id).length
          ? h('button', {
            class: 'x-btn', title: t('chain.send'), 'aria-label': t('chain.send'),
            onclick: () => sendTo(it.outputs, { excludeId: tool.id, home: homePath(), onFail: (m) => notify('err', m) }),
          }, '⇢')
          : null,
        h('button', {
          class: 'x-btn', title: t('file.download'), 'aria-label': t('file.download'),
          onclick: () => (it.outputs.length > 1
            ? downloadZip(it.outputs, `${it.file.name.replace(/\.[^.]+$/, '')}.zip`)
            : downloadBlob(out.blob, out.name)),
        }, '↓'))
      : h('button', { class: 'x-btn', title: t('file.remove'), 'aria-label': t('file.remove'), onclick: () => remove(it) }, '×');

    return h('li', dragProps(position),
      thumb,
      h('div', { class: 'fname' },
        h('b', { title: name }, name),
        h('span', { title: out?.note || '' }, subtitle(it, out))),
      h('span', { class: 'fsize' }, formatBytes(size)),
      third,
      action);
  }

  async function run() {
    if (running || !items.length) return;
    running = true;
    clear(notices);
    bar.style.display = '';
    progress.style.width = '0%';
    combined = [];
    for (const it of items) { it.status = 'pending'; it.outputs = []; it.error = null; it.note = null; }
    render();

    const params = form ? { ...form.values } : {};
    const runner = mod.runners[tool.id];
    let finished = 0;
    const tick = () => { progress.style.width = `${Math.round((++finished / items.length) * 100)}%`; };

    try {
      if (tool.aggregate) {
        for (const it of items) it.status = 'running';
        render();
        // The result belongs to the batch, so it is kept apart from the inputs.
        combined = [].concat(await runner(items.map(toInput), params, {}));
        for (const it of items) it.status = 'done';
      } else {
        await mapLimit(items, POOL_SIZE, async (it) => {
          it.status = 'running';
          render();
          // Slow runners narrate what they are doing; the list must not be
          // rebuilt on every word of it.
          let lastPaint = 0;
          const onProgress = (text) => {
            it.note = text;
            const now = performance.now();
            if (now - lastPaint > 150) { lastPaint = now; render(); }
          };
          try {
            const outs = await runner(toInput(it), params, { onProgress });
            it.outputs = [].concat(outs);
            it.status = 'done';
          } catch (e) {
            it.error = e.message;
            it.status = 'error';
          }
          it.note = null;
          tick();
          render();
        });
      }
    } catch (e) {
      notify('err', e.message);
      for (const it of items) if (it.status === 'running') { it.status = 'error'; it.error = e.message; }
    }

    running = false;
    bar.style.display = 'none';
    render();

    const failed = items.filter((i) => i.status === 'error');
    if (failed.length) notify('err', `${failed[0].file.name}: ${failed[0].error}`);
  }

  const toInput = (it) => ({ name: it.file.name, blob: it.file, file: it.file });

  // Opened from the desktop: "Obre amb → WebTools" on a .png or a .pdf lands
  // here, with the files waiting in the launch queue. Declared by
  // `file_handlers` in the manifest, and only available to an installed app.
  if (window.launchQueue && 'files' in LaunchParams.prototype) {
    window.launchQueue.setConsumer(async (params) => {
      if (!params.files?.length) return;
      const opened = await Promise.all(params.files.map((handle) => handle.getFile()));
      const usable = opened.filter((f) => matchesAccept(f, tool.accepts));
      if (usable.length) add(usable);
      if (usable.length < opened.length) {
        notify('err', tn('file.openedExternally', opened.length - usable.length));
      }
    });
  }

  // Venim d'un «envia-ho a…» d'una altra eina: els fitxers són a IndexedDB i
  // el paquet s'esborra en recollir-lo. El ?from= també marxa de l'URL, que
  // si no algú compartiria un enllaç que ja no porta enlloc.
  (async () => {
    let q;
    try { q = new URLSearchParams(location.search); } catch { return; }
    const from = q.get('from');
    if (!from) return;
    q.delete('from');
    const rest = q.toString();
    try { history.replaceState(history.state, '', location.pathname + (rest ? `?${rest}` : '')); } catch { /* ignore */ }
    const handed = await claim(from);
    const usable = handed.filter((f) => matchesAccept(f, tool.accepts));
    if (usable.length) {
      add(usable);
      notify('ok', tn('chain.received', usable.length));
    } else if (handed.length) {
      notify('err', tn('chain.wrongKind', handed.length));
    }
  })();

  // A screenshot in the clipboard is the most common way an image exists at
  // all, and saving it to disk first just to pick it again is busywork.
  const onPaste = (e) => {
    const pasted = [...(e.clipboardData?.files || [])];
    if (!pasted.length) return;
    const usable = pasted.filter((f) => matchesAccept(f, tool.accepts));
    if (!usable.length) return;
    e.preventDefault();
    add(usable);
    notify('ok', tn('file.pasted', usable.length));
  };
  document.addEventListener('paste', onPaste);

  root.append(
    h('div', { class: 'panel' }, dz),
    paramsPanel,
    listPanel,
    notices,
  );
  render();

  return () => {
    document.removeEventListener('paste', onPaste);
    for (const u of urls) URL.revokeObjectURL(u);
  };
}
