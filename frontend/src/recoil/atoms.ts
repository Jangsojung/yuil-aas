import { atom } from 'recoil';

export const currentFactoryState = atom<number | null>({
  key: 'currentFactoryState',
  default: 3,
});

export const currentFacilityGroupState = atom<number | null>({
  key: 'currentFacilityGroupState',
  default: null,
});

export const selectedEdgeGatewaysState = atom<number[]>({
  key: 'selectedEdgeGatewaysState',
  default: [],
});

export const edgeGatewayRefreshState = atom<number>({
  key: 'edgeGatewayRefreshState',
  default: 0,
});
