import { atom } from 'recoil';

export const edgeGatewayRefreshState = atom<number>({
  key: 'edge/edgeGatewayRefreshState',
  default: 0,
});
