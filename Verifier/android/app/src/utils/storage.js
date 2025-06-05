import AsyncStorage from '@react-native-async-storage/async-storage';

const VC_STORAGE_KEY = 'EUDI_WALLET_VCS';

export const storeVc = async (vc) => {
  const existing = await AsyncStorage.getItem(VC_STORAGE_KEY);
  const vcs = existing ? JSON.parse(existing) : [];
  vcs.push(vc);
  await AsyncStorage.setItem(VC_STORAGE_KEY, JSON.stringify(vcs));
};

export const getStoredVcs = async () => {
  const existing = await AsyncStorage.getItem(VC_STORAGE_KEY);
  return existing ? JSON.parse(existing) : [];
};
