import { atom } from 'recoil';

export const currentFactoryState = atom<number | null>({
  key: 'currentFactoryState',
  default: null,
});

export const currentFacilityGroupState = atom<number | null>({
  key: 'currentFacilityGroupState',
  default: null,
});
