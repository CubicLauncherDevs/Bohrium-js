export function formatUUID(raw) {
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

export function cleanUUID(raw) {
  return raw.replace(/-/g, '').toLowerCase();
}

export function toSkinResult(uuid, username, textureData) {
  const skin = textureData.textures.SKIN;
  const cape = textureData.textures.CAPE;
  return {
    uuid: formatUUID(uuid),
    username,
    skinUrl: skin?.url ?? null,
    model: skin?.metadata?.model ?? 'classic',
    capeUrl: cape?.url ?? null,
  };
}
