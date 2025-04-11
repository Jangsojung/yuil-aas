import * as React from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import { SignInPage, type AuthProvider } from '@toolpad/core/SignInPage';
import { useTheme } from '@mui/material/styles';
import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/atoms';
import { useNavigate, NavigateFunction } from 'react-router';

const providers = [{ id: 'credentials', name: 'Email and Password' }];

const signIn: (
  provider: AuthProvider,
  formData: FormData,
  setUser: React.Dispatch<React.SetStateAction<string | null>>,
  nav: NavigateFunction
) => void = async (provider, formData, setUser, nav) => {
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

    if (response.ok) {
      setUser(`${data.user_name}님(${email})`);
      nav('/aas/dashboard');
    } else {
      alert(`로그인 실패: ${data.message}`);
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    alert('서버 오류 발생');
  }
};

export default function SignInView() {
  const theme = useTheme();
  const [user, setUser] = useRecoilState(userState);
  const nav = useNavigate();

  return (
    <AppProvider theme={theme}>
      <SignInPage
        signIn={(provider, formData) => signIn(provider, formData, setUser, nav)}
        providers={providers}
        slotProps={{ emailField: { autoFocus: false }, form: { noValidate: true } }}
      />
    </AppProvider>
  );
}
