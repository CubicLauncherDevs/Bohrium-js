import { Cache } from './cache';
import { RateLimitError, NotFoundError, ApiError } from './errors';
import { toSkinResult } from './format';

const TIMEOUT = 5_000;

export function createProvider(name, endpoints) {
  const uuidCache = new Cache(600_000);
  const profileCache = new Cache(600_000);

  async function fetchJSON(url, signal, attempt = 1) {
    let res;
    const ua = attempt === 1
      ? 'Bohrium-js/1.0; Cloudflare-Workers'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MinecraftLauncher/2.0';
    try {
      res = await fetch(url, {
        signal,
        headers: { 'User-Agent': ua },
      });
    } catch (e) {
      if (e?.name === 'AbortError') throw new NotFoundError(`${name} timeout`);
      throw new NotFoundError(`${name} unreachable`);
    }
    if (!res.ok) {
      if (res.status === 429) throw new RateLimitError(name);
      if (res.status === 403 && attempt === 1) return fetchJSON(url, signal, 2);
      if (res.status === 204) throw new NotFoundError(`${name} empty response`);
      if (res.status === 404) throw new NotFoundError();
      throw new ApiError(name, res.status);
    }
    try {
      return await res.json();
    } catch {
      throw new NotFoundError(`${name} invalid response`);
    }
  }

  async function getUUID(username) {
    const key = username.toLowerCase();
    const cached = uuidCache.get(key);
    if (cached) return cached;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      const p = await fetchJSON(`${endpoints.uuid}/${encodeURIComponent(key)}`, ctrl.signal);
      if (p) uuidCache.set(key, p);
      return p;
    } finally {
      clearTimeout(timer);
    }
  }

  async function getRawProfile(uuid) {
    const cached = profileCache.get(uuid);
    if (cached) return cached;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      const raw = await fetchJSON(`${endpoints.profile}/${uuid}`, ctrl.signal);
      if (!raw) return null;
      const body = raw.raw || raw;
      const prop = body.properties?.find((p) => p.name === 'textures');
      if (!prop) return null;
      const data = JSON.parse(atob(prop.value));
      profileCache.set(uuid, data);
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  async function getSkinData(username) {
    const p = await getUUID(username);
    if (!p) return null;
    const d = await getRawProfile(p.id);
    return d ? toSkinResult(p.id, p.name, d) : null;
  }

  async function getSkinDataByUUID(uuid) {
    const d = await getRawProfile(uuid);
    return d ? toSkinResult(uuid, d.profileName, d) : null;
  }

  return { getUUID, getSkinData, getSkinDataByUUID };
}
