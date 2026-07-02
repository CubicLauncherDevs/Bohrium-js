export class Cache {
  #store = new Map();
  #ttl;
  #lastCleanup = 0;

  constructor(ttlMs = 300_000) {
    this.#ttl = ttlMs;
  }

  get(key) {
    this.#cleanup();
    const entry = this.#store.get(key);
    if (!entry) return;
    return entry.data;
  }

  set(key, data) {
    this.#store.set(key, { data, expiresAt: Date.now() + this.#ttl });
  }

  #cleanup() {
    const now = Date.now();
    if (now - this.#lastCleanup < this.#ttl) return;
    this.#lastCleanup = now;
    for (const [k, v] of this.#store) {
      if (now > v.expiresAt) this.#store.delete(k);
    }
  }

  get size() {
    return this.#store.size;
  }

  clear() {
    this.#store.clear();
  }
}
