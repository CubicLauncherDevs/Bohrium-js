import { createProvider } from '../lib/provider';

const provider = createProvider('Ely.by', {
  uuid: 'https://authserver.ely.by/api/users/profiles/minecraft',
  profile: 'https://authserver.ely.by/session/profile',
});

export const { getUUID, getSkinData, getSkinDataByUUID } = provider;
export default provider;
