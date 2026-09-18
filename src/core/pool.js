// A tiny worker pool. Falls back to running on the main thread when workers
// or module-workers are unavailable, so no tool ever hard-fails because of it.

import { t } from '../i18n.js';

const SIZE = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1));

export function createPool(workerFactory, fallbackHandler) {
  const workers = [];
  const idle = [];
  const waiting = [];
  let broken = false;
  let seq = 0;

  function spawn() {
    const w = workerFactory();
    w.jobs = new Map();
    w.completed = 0;
    w.onmessage = (e) => {
      const { id, ok, result, error } = e.data;
      const job = w.jobs.get(id);
      if (!job) return;
      w.jobs.delete(id);
      w.completed++;
      ok ? job.resolve(result) : job.reject(new Error(error));
      release(w);
    };
    w.onerror = (e) => {
      // A worker that dies before it ever answered means the whole worker path
      // is unusable here (blocked module import, file:// origin…). Give up on
      // it once rather than failing every job.
      if (w.completed === 0) {
        broken = true;
        discard(w);
      }
      for (const job of w.jobs.values()) job.reject(new Error(e.message || t('err.workerFailed')));
      w.jobs.clear();
      if (!broken) release(w);
    };
    workers.push(w);
    return w;
  }

  function discard(w) {
    w.terminate();
    const i = workers.indexOf(w);
    if (i >= 0) workers.splice(i, 1);
    const j = idle.indexOf(w);
    if (j >= 0) idle.splice(j, 1);
  }

  function release(w) {
    const next = waiting.shift();
    if (next) next(w);
    else idle.push(w);
  }

  function acquire() {
    if (idle.length) return Promise.resolve(idle.pop());
    if (workers.length < SIZE) return Promise.resolve(spawn());
    return new Promise((res) => waiting.push(res));
  }

  async function viaWorker(payload, transfer) {
    let w;
    try {
      w = await acquire();
    } catch {
      broken = true;
      throw new Error(t('err.noWorkers'));
    }
    const id = ++seq;
    return new Promise((resolve, reject) => {
      w.jobs.set(id, { resolve, reject });
      try {
        w.postMessage({ id, ...payload }, transfer);
      } catch (err) {
        w.jobs.delete(id);
        release(w);
        reject(err);
      }
    });
  }

  return {
    async run(payload, transfer = []) {
      if (!broken) {
        try {
          return await viaWorker(payload, transfer);
        } catch (err) {
          // Only swallow the error if the worker path itself is what broke.
          if (!broken) throw err;
        }
      }
      return fallbackHandler(payload);
    },
    dispose() {
      for (const w of workers) w.terminate();
      workers.length = 0;
      idle.length = 0;
      waiting.length = 0;
    },
  };
}

/** Run `fn` over `items` with a bounded number in flight, in input order. */
export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

export const POOL_SIZE = SIZE;
