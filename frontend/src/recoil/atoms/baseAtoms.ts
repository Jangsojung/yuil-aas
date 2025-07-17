import { atom } from 'recoil';
import { Base } from '../../types/api';

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
    ab_note: '',
    sn_length: -1,
  },
});
