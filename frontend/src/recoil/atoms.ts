import { atom } from 'recoil';
import dayjs, { Dayjs } from 'dayjs';

export const currentFileState = atom<number | null>({
  key: 'currentFileState',
  default: null,
});

export const currentFacilityGroupState = atom<number | null>({
  key: 'currentFacilityGroupState',
  default: 6,
});

export const hasBasicsState = atom<boolean>({
  key: 'hasBasicsState',
  default: false,
});

export const selectedBasesState = atom<number[]>({
  key: 'selectedBasesState',
  default: [],
});

export const edgeGatewayRefreshState = atom<number>({
  key: 'edgeGatewayRefreshState',
  default: 0,
});

export const dataTableRefreshTriggerState = atom<number>({
  key: 'dataTableRefreshTriggerState',
  default: 0,
});

export const selectedSensorsState = atom<number[]>({
  key: 'selectedSensorsState',
  default: [],
});

export const selectedDataFilesState = atom<number[]>({
  key: 'selectedDataFilesState',
  default: [],
});

export interface User {
  user_id: string;
  user_name: string;
}

export const userState = atom<User | null>({
  key: 'userState',
  default: JSON.parse(localStorage.getItem('user') || 'null'),
  effects: [
    ({ onSet }) => {
      onSet((newUser) => {
        if (newUser) {
          localStorage.setItem('user', JSON.stringify(newUser));
        } else {
          localStorage.removeItem('user');
        }
      });
    },
  ],
});

export const dateRangeState = atom<{
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}>({
  key: 'dateRangeState',
  default: {
    startDate: dayjs().subtract(1, 'month'),
    endDate: dayjs(),
  },
});

export const dateRangeAASXState = atom<{
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}>({
  key: 'dateRangeAASXState',
  default: {
    startDate: dayjs().subtract(1, 'month'),
    endDate: dayjs(),
  },
});

export const baseEditModeState = atom<boolean>({
  key: 'baseEditModeState',
  default: false,
});

interface Base {
  ab_idx: number;
  ab_name: string;
  sn_length: number;
}

export const selectedBaseState = atom<Base>({
  key: 'selectedBaseState',
  default: {
    ab_idx: -1,
    ab_name: '',
    sn_length: -1,
  },
});

export const aasxDataState = atom<any>({
  key: 'aasxDataState',
  default: null,
});

export const isVerifiedState = atom<boolean>({
  key: 'isVerifiedState',
  default: false,
});
