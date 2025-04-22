import { atom } from 'recoil';

export interface User {
  user_id: string;
  user_name: string;
}

export const userState = atom<User | null>({
  key: 'user/userState',
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
