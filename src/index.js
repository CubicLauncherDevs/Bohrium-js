import * as resolver from './skin';
import * as mojang from './providers/mojang';
import * as elyby from './providers/elyby';
import { renderHeadSVG } from './head';
import { cleanUUID } from './lib/format';
import { RateLimitError, NotFoundError } from './lib/errors';

const START = Date.now();
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (d, s = 200) => Response.json(d, { status: s, headers: CORS });
const html = (b, s = 200, h = {}) => new Response(b, { status: s, headers: { 'Content-Type': 'image/svg+xml', ...CORS, ...h } });

function handleError(err) {
  if (err instanceof RateLimitError) return json({ error: err.message }, 429);
  if (err instanceof NotFoundError) return json({ error: err.message }, 404);
  const msg = err instanceof Error ? err.message : 'Internal error';
  return json({ error: msg }, 500);
}

const U = (base) => (path) => {
  const re = new RegExp(`^${base}${path}$`);
  return { re };
};

const auto = U('/api');
const prov = (p) => U(`/api/${p}`);

function buildRoutes(prefix, prov) {
  return [
    { ...prefix('/skin/([\\w-]{2,16})'), handler(m) { return jsonOrErr(prov.getSkinData(m[1])); } },
    { ...prefix('/profile/([a-fA-F0-9-]{32,36})'), handler(m) { return jsonOrErr(prov.getSkinDataByUUID(cleanUUID(m[1]))); } },
    { ...prefix('/head/([\\w-]{2,16})'), handler(m, url) { return headByName(m[1], prov, url); } },
    { ...prefix('/head/([a-fA-F0-9-]{32,36})'), handler(m, url) { return headByUUID(m[1], prov, url); } },
  ];
}

async function jsonOrErr(promise) {
  try {
    const r = await promise;
    return r ? json(r) : json({ error: 'Not found' }, 404);
  } catch (e) { return handleError(e); }
}

async function headByName(input, prov, url) {
  try {
    const p = await prov.getUUID(input);
    if (!p) return json({ error: 'Player not found' }, 404);
    return serveHead(p.id, prov, url);
  } catch (e) { return handleError(e); }
}

async function headByUUID(input, prov, url) {
  try {
    return serveHead(cleanUUID(input), prov, url);
  } catch (e) { return handleError(e); }
}

async function serveHead(uuid, prov, url) {
  const d = await prov.getSkinDataByUUID(uuid);
  if (!d?.skinUrl) return json({ error: 'Skin not found' }, 404);
  const size = parseInt(url?.searchParams?.get('size') || '128', 10);
  return html(renderHeadSVG(d.skinUrl, size), 200, { 'Cache-Control': 'public, max-age=3600' });
}

const ROUTES = [
  ...buildRoutes(auto, resolver),
  ...buildRoutes(prov('mojang'), mojang),
  ...buildRoutes(prov('elyby'), elyby),
];

const INFO = {
  name: 'Bohrium-js',
  version: '1.0.0',
  description: 'Api Oficial de @Cubiclauncher de bohrium para javaScript',
  docs: 'https://github.com/CubiclauncherDevs/bohrium-js',
  endpoints: {
    'GET /': 'API info',
    'GET /health': 'Health check',
    'GET /api/skin/:username': 'Skin data (auto: Mojang + Ely.by)',
    'GET /api/profile/:uuid': 'Skin data by UUID',
    'GET /api/head/:username': 'Head SVG',
    'GET /api/head/:uuid': 'Head SVG by UUID',
    'GET /api/mojang/skin/:username': 'Skin via Mojang',
    'GET /api/mojang/profile/:uuid': 'Profile via Mojang',
    'GET /api/mojang/head/:username': 'Head via Mojang',
    'GET /api/elyby/skin/:username': 'Skin via Ely.by',
    'GET /api/elyby/profile/:uuid': 'Profile via Ely.by',
    'GET /api/elyby/head/:username': 'Head via Ely.by',
  },
};

async function handle(url, method) {
  if (method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (url.pathname === '/' || url.pathname === '/api') return json({ ...INFO, uptime: (Date.now() - START) / 1000 });
  if (url.pathname === '/health') return json({ status: 'ok', uptime: (Date.now() - START) / 1000 });

  for (const r of ROUTES) {
    const m = url.pathname.match(r.re);
    if (m && method === 'GET') return r.handler(m, url);
  }

  return json({ error: 'Not found' }, 404);
}

export default { fetch: (req) => handle(new URL(req.url), req.method) };
