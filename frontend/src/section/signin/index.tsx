import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage, type AuthProvider } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import { useRecoilState } from 'recoil';
import { User, userState } from '../../recoil/atoms';
import { useNavigate, NavigateFunction } from 'react-router-dom';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

const signIn = async (
  provider: AuthProvider,
  formData: FormData,
  setUser: Dispatch<SetStateAction<User | null>>,
  nav: NavigateFunction
) => {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const response = await fetch('http://localhost:5001/api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const user: User = {
        user_id: data.user_id,
        user_name: data.user_name,
      };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      nav('/aas/dashboard');
      return true;
    } else {
      alert(`로그인 실패: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    alert('서버 오류 발생');
    return false;
  }
};

export default function SignInView() {
  const theme = useTheme();
  const [user, setUser] = useRecoilState(userState);
  const nav = useNavigate();

  useEffect(() => {
    if (user) {
      nav('/aas/dashboard');
    }
  }, [user, nav]);

  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={(provider, formData) => signIn(provider, formData, setUser, nav)}
        providers={providers}
        slotProps={{
          emailField: { autoFocus: false },
          form: { noValidate: true },
          rememberMe: { style: { display: 'none' } },
        }}
      />
    </AppProvider>
  );
}
