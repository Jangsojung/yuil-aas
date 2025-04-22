import { atom } from 'recoil';

export const currentFileState = atom<number | null>({
  key: 'current/currentFileState',
  default: null,
});

export const currentFacilityGroupState = atom<number | null>({
  key: 'current/currentFacilityGroupState',
  default: 6,
});
