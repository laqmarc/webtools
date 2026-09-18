import { createPool } from '../core/pool.js';
import { withExt } from '../core/files.js';
import { currentLang } from '../i18n.js';
import { runners as extraRunners, mounts as extraMounts } from './imagetools.js';

// One pool for every raster tool: a batch of 40 photos saturates the cores
// instead of blocking the tab.
const pool = createPool(
  () => new Worker(new URL('../workers/image.worker.js', import.meta.url), { type: 'module' }),
  async (payload) => (await import('./image-core.js')).process(payload),
);

// The worker has to be told the language: an error thrown inside it comes
// back as a string, and by then there is nothing left to translate.
const op = (name) => async (input, params) => {
  const { blob, ext } = await pool.run({ op: name, blob: input.blob, params, lang: currentLang() });
  return { name: withExt(input.name, ext), blob };
};

export const mounts = {
  ...extraMounts,
  'image-crop': (root, tool) => import('../ui/cropeditor.js').then((m) => m.mount(root, tool)),
};

export const runners = {
  ...extraRunners,
  'image-convert': op('image-convert'),
  'image-compress': op('image-compress'),
  'image-resize': op('image-resize'),
  'image-crop': op('image-crop'),
  'image-rotate': op('image-rotate'),
  'image-strip': op('image-strip'),
};
