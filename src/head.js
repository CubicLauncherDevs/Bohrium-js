const F = { offset: 8, overlay: 40, size: 8 };

function escapeXml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);
}

export function renderHeadSVG(skinUrl, size) {
  const s = Math.max(8, Math.min(512, size));
  const url = escapeXml(skinUrl);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${F.size} ${F.size}">
  <defs>
    <style>image{image-rendering:pixelated;image-rendering:crisp-edges}</style>
  </defs>
  <image href="${url}" x="-${F.offset}" y="-${F.offset}" width="64" height="64" />
  <image href="${url}" x="-${F.overlay}" y="-${F.offset}" width="64" height="64" />
</svg>`;
}
