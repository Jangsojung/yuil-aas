import { atom } from 'recoil';

export const currentFactoryState = atom<number | null>({
  key: 'currentFactoryState',
  default: null,
});
