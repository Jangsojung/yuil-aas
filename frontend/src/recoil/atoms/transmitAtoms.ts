import { atom } from 'recoil';

export const aasxDataState = atom<any>({
  key: 'transmit/aasxDataState',
  default: null,
});

export const isVerifiedState = atom<boolean>({
  key: 'transmit/isVerifiedState',
  default: false,
});
