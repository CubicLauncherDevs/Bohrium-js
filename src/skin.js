import mojang from './providers/mojang';
import elyby from './providers/elyby';

const PROVIDERS = [mojang, elyby];

export async function getSkinData(username) {
  const results = await Promise.allSettled(
    PROVIDERS.map((p) => p.getSkinData(username)),
  );
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) return r.value;
  }
  return null;
}

export async function getSkinDataByUUID(uuid) {
  const results = await Promise.allSettled(
    PROVIDERS.map((p) => p.getSkinDataByUUID(uuid)),
  );
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) return r.value;
  }
  return null;
}

export async function getUUID(username) {
  const results = await Promise.allSettled(
    PROVIDERS.map((p) => p.getUUID(username)),
  );
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) return r.value;
  }
  return null;
}
