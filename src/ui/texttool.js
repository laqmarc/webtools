import { h, clear, debounce, copyBtn } from '../core/dom.js';
import { downloadBlob } from '../core/files.js';
import { paramsForm } from './params.js';
import { t } from '../i18n.js';

/** Generic text-in / text-out page. Recomputes as you type. */
export function mountTextTool(root, tool, mod) {
  const runner = mod.runners[tool.id];
  const notices = h('div');

  const input = h('textarea', {
    spellcheck: false, placeholder: t('text.placeholder'),
    oninput: () => schedule(),
  });
  const output = h('textarea', { spellcheck: false, readonly: true, placeholder: t('text.outPlaceholder') });

  const form = tool.params?.length
    ? paramsForm(tool.storeKey || tool.id, tool.params, () => go(), { preset: tool.preset, lock: tool.lock })
    : null;

  const fileInput = h('input', {
    type: 'file', style: { display: 'none' },
    onchange: async (e) => {
      const f = e.target.files[0];
      if (f) { input.value = await f.text(); go(); }
      e.target.value = '';
    },
  });

  const stats = h('span', { class: 'hint' });

  async function go() {
    clear(notices);
    const text = input.value;
    if (!text.trim()) { output.value = ''; stats.textContent = ''; return; }
    try {
      const res = await runner(text, form ? { ...form.values } : {});
      output.value = res;
      const d = res.length - text.length;
      stats.textContent = t('text.chars', {
        a: text.length.toLocaleString(),
        b: res.length.toLocaleString(),
        d: `${d <= 0 ? '−' : '+'}${Math.abs(Math.round((d / Math.max(1, text.length)) * 100))}`,
      });
    } catch (e) {
      output.value = '';
      stats.textContent = '';
      notices.append(h('div', { class: 'msg err' }, e.message));
    }
  }
  const schedule = debounce(go, 250);

  root.append(
    form && !form.empty ? h('div', { class: 'panel' }, h('h3', null, t('params.title')), form.el) : null,
    h('div', { class: 'io' },
      h('div', null,
        h('div', { class: 'io-head' },
          h('label', null, t('text.input')),
          h('span', { class: 'spacer' }),
          h('button', { class: 'btn ghost sm', onclick: () => fileInput.click() }, t('text.openFile')),
          tool.sample ? h('button', { class: 'btn ghost sm', onclick: () => { input.value = tool.sample; go(); } }, t('text.sample')) : null,
          h('button', { class: 'btn ghost sm', onclick: () => { input.value = ''; go(); } }, t('text.empty')),
          fileInput),
        input),
      h('div', null,
        h('div', { class: 'io-head' },
          h('label', null, t('text.output')),
          h('span', { class: 'spacer' }),
          stats,
          copyBtn(() => output.value),
          h('button', {
            class: 'btn ghost sm',
            onclick: () => output.value && downloadBlob(
              new Blob([output.value], { type: 'text/plain;charset=utf-8' }),
              `${tool.id}.${tool.outExt || 'txt'}`),
          }, t('text.save'))),
        output)),
    notices,
  );

  // Drop a file anywhere on the page to load it.
  const onDrop = async (e) => {
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    e.preventDefault();
    input.value = await f.text();
    go();
  };
  const onDragOver = (e) => { if (e.dataTransfer?.types?.includes('Files')) e.preventDefault(); };
  root.addEventListener('drop', onDrop);
  root.addEventListener('dragover', onDragOver);

  return () => {
    root.removeEventListener('drop', onDrop);
    root.removeEventListener('dragover', onDragOver);
  };
}
