# Bohrium-js

Api de skins de Minecraft con soporte para **Mojang** y **Ely.by**. Corre 100% en Cloudflare Workers, cero dependencias externas.

## Endpoints

### Auto-resolve (Mojang + Ely.by)

| Ruta | Descripción |
|------|-------------|
| `GET /api/skin/:username` | Skin por username |
| `GET /api/profile/:uuid` | Skin por UUID |
| `GET /api/head/:username` | Cabeza en SVG |
| `GET /api/head/:uuid` | Cabeza por UUID |

### Mojang

| Ruta | Descripción |
|------|-------------|
| `GET /api/mojang/skin/:username` | Skin via Mojang |
| `GET /api/mojang/profile/:uuid` | Profile via Mojang |
| `GET /api/mojang/head/:username` | Cabeza via Mojang |

### Ely.by

| Ruta | Descripción |
|------|-------------|
| `GET /api/elyby/skin/:username` | Skin via Ely.by |
| `GET /api/elyby/profile/:uuid` | Profile via Ely.by |
| `GET /api/elyby/head/:username` | Cabeza via Ely.by |

## Uso

```bash
curl https://bohrium-js.cubiclauncher.com/api/skin/Notch
curl https://bohrium-js.cubiclauncher.com/api/head/Notch?size=32
```

## Deploy

```bash
npm install
npm run deploy
```
