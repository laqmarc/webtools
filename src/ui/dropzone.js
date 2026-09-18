import { h } from '../core/dom.js';
import { matchesAccept } from '../core/files.js';
import { t } from '../i18n.js';

/**
 * Click-or-drop file input. `onFiles` gets only the files that match the
 * tool's accept list; the rest are reported through `onRejected`.
 */
export function dropzone({ accepts = [], multiple = true, label, hint, onFiles, onRejected }) {
  const input = h('input', {
    type: 'file', multiple, style: { display: 'none' },
    accept: accepts.join(',') || undefined,
    onchange: (e) => { take(e.target.files); input.value = ''; },
  });

  function take(list) {
    const all = [...list];
    const ok = all.filter((f) => matchesAccept(f, accepts));
    const bad = all.filter((f) => !ok.includes(f));
    // Accepted first: adding files clears the notice area, and the warning
    // about the rejected ones has to survive that.
    if (ok.length) onFiles(ok);
    if (bad.length) onRejected?.(bad);
  }

  const el = h('div', {
    class: 'dz', tabindex: 0, role: 'button',
    onclick: () => input.click(),
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } },
    ondragover: (e) => { e.preventDefault(); el.classList.add('over'); },
    ondragleave: () => el.classList.remove('over'),
    ondrop: (e) => {
      e.preventDefault();
      el.classList.remove('over');
      if (e.dataTransfer?.files?.length) take(e.dataTransfer.files);
    },
  },
  h('strong', null, label || t('file.drop')),
  h('small', null, hint || t('file.orClick')),
  input);

  return el;
}
