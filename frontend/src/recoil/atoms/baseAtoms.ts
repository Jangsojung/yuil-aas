import { atom } from 'recoil';

interface Base {
  ab_idx: number;
  ab_name: string;
  ab_note: string;
  sn_length: number;
}

export const hasBasicsState = atom<boolean>({
  key: 'base/hasBasicsState',
  default: false,
});

export const selectedSensorsState = atom<number[]>({
  key: 'base/selectedSensorsState',
  default: [],
});

export const baseEditModeState = atom<boolean>({
  key: 'base/baseEditModeState',
  default: false,
});

export const selectedBaseState = atom<Base>({
  key: 'base/selectedBaseState',
  default: {
    ab_idx: -1,
    ab_name: '',
    sn_length: -1,
  },
});

export const selectedBasesState = atom<number[]>({
  key: 'base/selectedBasesState',
  default: [],
});
