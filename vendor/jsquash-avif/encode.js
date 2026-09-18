// Escrit per scripts/vendor.mjs — no és codi original de @jsquash/avif.
// Equival al seu encode.js sense la branca multifil, que necessita
// SharedArrayBuffer i capçaleres COOP/COEP que un allotjament estàtic no envia.
import { defaultOptions } from './meta.js';
import { initEmscriptenModule } from './utils.js';

let module;

export async function encode(data, options = {}) {
  if (!module) {
    module = import('./codec/enc/avif_enc.js')
      .then((m) => initEmscriptenModule(m.default));
  }
  const mod = await module;
  const out = mod.encode(data.data, data.width, data.height, { ...defaultOptions, ...options });
  if (!out) throw new Error('El còdec AVIF no ha pogut codificar la imatge.');
  return out.buffer;
}

export default encode;
