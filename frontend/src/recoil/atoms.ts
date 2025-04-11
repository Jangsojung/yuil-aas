import { atom } from 'recoil';
import dayjs, { Dayjs } from 'dayjs';

export const currentFactoryState = atom<number | null>({
  key: 'currentFactoryState',
  default: 3,
});

export const currentFileState = atom<number | null>({
  key: 'currentFileState',
  default: null,
});

export const currentFacilityGroupState = atom<number | null>({
  key: 'currentFacilityGroupState',
  default: null,
});

export const hasBasicsState = atom<boolean>({
  key: 'hasBasicsState',
  default: false,
});

export const selectedEdgeGatewaysState = atom<number[]>({
  key: 'selectedEdgeGatewaysState',
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

export const selectedConvertsState = atom<number[]>({
  key: 'selectedConvertsState',
  default: [],
});

export const selectedSensorsState = atom<number[]>({
  key: 'selectedSensorsState',
  default: [],
});

export const selectedDataFilesState = atom<number[]>({
  key: 'selectedDataFilesState',
  default: [],
});

export const userState = atom<string | null>({
  key: 'userState',
  default: localStorage.getItem('user') || null,
  effects: [
    ({ onSet }) => {
      onSet((newUser) => {
        if (newUser) {
          localStorage.setItem('user', newUser);
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
