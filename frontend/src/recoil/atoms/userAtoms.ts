import { atom } from 'recoil';

export interface User {
  user_idx: number;
  user_id: string;
  user_name: string;
  cm_idx?: number;
}

export const userState = atom<User | null>({
  key: 'userState',
  default: (() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        return user;
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        return null;
      }
    }
    return null;
  })(),
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
