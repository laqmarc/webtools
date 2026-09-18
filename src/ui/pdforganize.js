// The visual PDF editor: see the pages, drag them around, turn them, drop the
// ones you do not want.
//
// The range-based tools (separar, girar, extreure) stay for batch work, but
// typing "1-3, 7" at a document you cannot see is guesswork. Here pdf.js draws
// the thumbnails and pdf-lib rebuilds the file, which is each library doing
// the half it is good at.

import { h, clear } from '../core/dom.js';
import { formatBytes, downloadBlob } from '../core/files.js';
import { pdfLib } from '../core/deps.js';
import { dropzone } from './dropzone.js';
import { t } from '../i18n.js';

const THUMB_WIDTH = 150;

export async function mount(root) {
  let pages = []; // { index, rotation, removed, canvas }
  let sourceBlob = null;
  let sourceName = '';
  let dragging = null;

  const grid = h('div', { class: 'pages' });
  const panel = h('div', { class: 'panel', style: { display: 'none' } });
  const head = h('h3');
  const actions = h('div', { class: 'actions' });
  const notices = h('div');
  panel.append(head, grid, actions);

  const dz = dropzone({
    accepts: ['.pdf', 'application/pdf'],
    multiple: false,
    label: t('org.drop'),
    hint: t('org.dropHint'),
    onFiles: ([file]) => open(file),
    onRejected: () => note('err', t('org.notPdf')),
  });

  function note(kind, text) {
    clear(notices).append(h('div', { class: `msg ${kind}` }, text));
  }

  async function open(file) {
    clear(notices);
    sourceBlob = file;
    sourceName = file.name;
    panel.style.display = '';
    clear(grid).append(h('p', { class: 'empty' }, t('org.drawing')));
    head.textContent = file.name;

    let render;
    try {
      render = await import('../core/pdfrender.js');
    } catch (e) {
      note('err', e.message);
      return;
    }

    let doc;
    try {
      doc = await render.openPdf(file);
    } catch (e) {
      clear(grid);
      note('err', e.message);
      return;
    }

    pages = [];
    try {
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const base = page.getViewport({ scale: 1 });
        page.cleanup();
        const canvas = await render.renderPage(doc, n, { scale: THUMB_WIDTH / base.width });
        pages.push({ index: n - 1, rotation: 0, removed: false, canvas });
        if (n % 4 === 0 || n === doc.numPages) draw();
      }
    } finally {
      doc.destroy();
    }
    draw();
  }

  function move(from, to) {
    if (from === to || from == null || to == null) return;
    const [item] = pages.splice(from, 1);
    pages.splice(to, 0, item);
    draw();
  }

  function draw() {
    const kept = pages.filter((p) => !p.removed).length;
    head.textContent = t('org.summary', { name: sourceName, kept, total: pages.length });

    clear(grid);
    pages.forEach((page, position) => {
      const card = h('figure', {
        class: `page${page.removed ? ' out' : ''}`,
        draggable: true,
        ondragstart: (e) => { dragging = position; e.dataTransfer.effectAllowed = 'move'; card.classList.add('dragging'); },
        ondragend: () => { dragging = null; card.classList.remove('dragging'); },
        ondragover: (e) => { e.preventDefault(); if (dragging !== null && dragging !== position) move(dragging, position), dragging = position; },
        ondrop: (e) => e.preventDefault(),
      });

      const shot = h('div', { class: 'page-thumb', style: { transform: `rotate(${page.rotation}deg)` } });
      shot.append(page.canvas);

      card.append(
        shot,
        h('figcaption', null,
          h('span', null, `${position + 1}`),
          h('small', null, page.index + 1 === position + 1 ? '' : t('org.wasPage', { n: page.index + 1 }))),
        h('div', { class: 'page-tools' },
          h('button', { class: 'x-btn', title: t('org.rotate'), onclick: () => { page.rotation = (page.rotation + 90) % 360; draw(); } }, '↻'),
          h('button', {
            class: 'x-btn', title: page.removed ? t('org.restore') : t('org.drop90'),
            onclick: () => { page.removed = !page.removed; draw(); },
          }, page.removed ? '↺' : '×')),
      );
      grid.append(card);
    });

    clear(actions);
    actions.append(
      h('button', { class: 'btn', disabled: !kept, onclick: exportPdf }, t('org.export')),
      h('button', { class: 'btn ghost', onclick: () => { pages.sort((a, b) => a.index - b.index); pages.forEach((p) => { p.rotation = 0; p.removed = false; }); draw(); } }, t('org.reset')),
      h('button', { class: 'btn ghost', onclick: () => { pages.reverse(); draw(); } }, t('org.reverse')),
      h('span', { class: 'spacer' }),
      h('span', { class: 'hint' }, t('org.dragHint')),
    );
  }

  async function exportPdf() {
    clear(notices);
    const keep = pages.filter((p) => !p.removed);
    if (!keep.length) { note('err', t('org.noPages')); return; }
    try {
      const { PDFDocument, degrees } = await pdfLib();
      const src = await PDFDocument.load(await sourceBlob.arrayBuffer(), { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, keep.map((p) => p.index));
      copied.forEach((page, i) => {
        const turn = keep[i].rotation;
        if (turn) page.setRotation(degrees((page.getRotation().angle + turn) % 360));
        out.addPage(page);
      });
      const bytes = await out.save({ useObjectStreams: true });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      downloadBlob(blob, `${sourceName.replace(/\.pdf$/i, '')}-organitzat.pdf`);
      note('ok', t('org.exported', { n: keep.length, size: formatBytes(blob.size) }));
    } catch (e) {
      note('err', t('org.buildFailed', { msg: e.message }));
    }
  }

  root.append(h('div', { class: 'panel' }, dz), panel, notices);
}
