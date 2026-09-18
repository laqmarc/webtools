import { process } from '../tools/image-core.js';
import { loadLocale } from '../i18n.js';

self.onmessage = async ({ data }) => {
  const { id, lang, ...payload } = data;
  try {
    // Memoised per language, so this only costs a fetch on the first job.
    await loadLocale(lang);
    const result = await process(payload);
    self.postMessage({ id, ok: true, result });
  } catch (e) {
    self.postMessage({ id, ok: false, error: e.message || String(e) });
  }
};
