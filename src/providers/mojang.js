import { createProvider } from '../lib/provider';

const provider = createProvider('Mojang', {
  uuid: 'https://api.minetools.eu/uuid',
  profile: 'https://api.minetools.eu/profile',
});

export const { getUUID, getSkinData, getSkinDataByUUID } = provider;
export default provider;
