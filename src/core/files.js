import { fflate } from './deps.js';

export function formatBytes(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (n < 1024) return `${n} B`;
  const u = ['kB', 'MB', 'GB'];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
  return `${n < 10 ? n.toFixed(1) : Math.round(n)} ${u[i]}`;
}

export const baseName = (name) => name.replace(/\.[^./\\]+$/, '');

export function withExt(name, ext) {
  return ext ? `${baseName(name)}.${ext}` : name;
}

/** Make `name` unique against a set of names already used. */
export function uniqueName(name, taken) {
  if (!taken.has(name)) { taken.add(name); return name; }
  const base = baseName(name);
  const ext = name.slice(base.length);
  let i = 2;
  while (taken.has(`${base}-${i}${ext}`)) i++;
  const out = `${base}-${i}${ext}`;
  taken.add(out);
  return out;
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Bundle outputs into a .zip. Stored (level 0) for already-compressed formats. */
export async function downloadZip(outputs, zipName = 'webtools.zip') {
  const { zipSync } = await fflate();
  const entries = {};
  const taken = new Set();
  for (const o of outputs) {
    const buf = new Uint8Array(await o.blob.arrayBuffer());
    const incompressible = /\.(png|jpe?g|webp|avif|gif|pdf|zip)$/i.test(o.name);
    entries[uniqueName(o.name, taken)] = [buf, { level: incompressible ? 0 : 6 }];
  }
  downloadBlob(new Blob([zipSync(entries)], { type: 'application/zip' }), zipName);
}

export const readText = (file) => file.text();

/** Best-effort mime for files the OS did not type (common with .svg, .avif). */
export function sniffType(file) {
  if (file.type) return file.type;
  const ext = (file.name.match(/\.([^.]+)$/)?.[1] || '').toLowerCase();
  return {
    svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', bmp: 'image/bmp',
    pdf: 'application/pdf', json: 'application/json', csv: 'text/csv',
    yaml: 'text/yaml', yml: 'text/yaml', css: 'text/css', js: 'text/javascript',
  }[ext] || '';
}

/** True when `file` satisfies one of the tool's accept patterns ("image/*", ".svg"). */
export function matchesAccept(file, accepts) {
  if (!accepts || !accepts.length) return true;
  const type = sniffType(file);
  const name = file.name.toLowerCase();
  return accepts.some((a) => {
    if (a.startsWith('.')) return name.endsWith(a);
    if (a.endsWith('/*')) return type.startsWith(a.slice(0, -1));
    return type === a;
  });
}
