// Passar el resultat d'una eina a la següent sense tocar el disc.
//
// Cada eina és una pàgina de debò, o sigui que anar d'una a l'altra és una
// càrrega sencera: la memòria no serveix i sessionStorage no accepta blobs.
// IndexedDB sí, i és l'únic lloc del lloc web on es desa un fitxer — dins del
// navegador, i esborrat en recollir-lo.
//
//   const id = await stash(outputs);   // → 'k3f9a1'
//   location.href = `../altra-eina/?from=${id}`;
//   const files = await claim(id);     // i el registre desapareix

const DB = 'webtools';
const STORE = 'handoff';
// Prou perquè hi càpiga obrir l'eina següent i pensar-s'hi, i prou poc perquè
// ningú es trobi mitja hora després amb fitxers vells al disc.
const TTL = 30 * 60 * 1000;

function open() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(new Error('no indexedDB')); return; }
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run(mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let out;
    const req = fn(tx.objectStore(STORE));
    // addEventListener i no onsuccess: fn() ja n'hi pot haver posat un —claim()
    // ho fa per esborrar el que acaba de llegir— i assignar la propietat
    // l'esborraria sense dir res.
    if (req) req.addEventListener('success', () => { out = req.result; });
    tx.oncomplete = () => { db.close(); resolve(out); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  }));
}

/** Treu els paquets que ningú ha recollit. Cada escriptura escombra. */
async function sweep(store) {
  const all = store.getAll();
  all.onsuccess = () => {
    const cutoff = Date.now() - TTL;
    for (const row of all.result || []) if (!row.at || row.at < cutoff) store.delete(row.id);
  };
}

const newId = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);

/**
 * Desa una tongada de sortides i torna la clau per a l'URL. Si el navegador
 * no deixa fer servir IndexedDB —mode privat d'algun Safari, emmagatzematge
 * bloquejat— torna null i qui truqui ha de continuar oferint la descàrrega.
 */
export async function stash(outputs) {
  const files = outputs
    .filter((o) => o?.blob instanceof Blob)
    .map((o) => ({ name: o.name, blob: o.blob }));
  if (!files.length) return null;
  const id = newId();
  try {
    await run('readwrite', (store) => {
      sweep(store);
      store.put({ id, at: Date.now(), files });
      return null;
    });
    return id;
  } catch {
    return null;
  }
}

/** Recull un paquet i l'esborra. Un enllaç compartit no ha de portar fitxers. */
export async function claim(id) {
  if (!id) return [];
  try {
    const row = await run('readwrite', (store) => {
      const get = store.get(id);
      get.onsuccess = () => { if (get.result) store.delete(id); };
      return get;
    });
    if (!row?.files?.length) return [];
    return row.files.map(({ name, blob }) => new File([blob], name, {
      type: blob.type || 'application/octet-stream',
      lastModified: row.at,
    }));
  } catch {
    return [];
  }
}
