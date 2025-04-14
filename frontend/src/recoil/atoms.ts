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

export const isEditModeState = atom({
  key: 'isEditModeState',
  default: false,
});

export const currentFacilityGroupState = atom<number | null>({
  key: 'currentFacilityGroupState',
  default: 6,
});

export const hasBasicsState = atom<boolean>({
  key: 'hasBasicsState',
  default: false,
});

export const selectedEdgeGatewaysState = atom<number[]>({
  key: 'selectedEdgeGatewaysState',
  default: [],
});

export const selectedFacilitiesState = atom<number[]>({
  key: 'selectedFacilitiesState',
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

export const shouldSaveChangesState = atom({
  key: 'shouldSaveChangesState',
  default: false,
});
