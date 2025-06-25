import React, { useEffect, Dispatch, SetStateAction } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useRecoilState } from 'recoil';
import { userState, User } from '../../recoil/atoms';
import { useNavigate, NavigateFunction } from 'react-router-dom';

const signIn = async (formData: FormData, setUser: Dispatch<SetStateAction<User | null>>, nav: NavigateFunction) => {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const response = await fetch('http://localhost:5001/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const user: User = {
        user_idx: data.user_idx,
        user_id: data.user_id,
        user_name: data.user_name,
      };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      nav('/dashboard/dashboard');
    } else {
      alert(`로그인 실패: ${data.message}`);
    }
  } catch (error) {
    console.error('로그인 에러:', error);
    alert('서버 오류 발생');
  }
};

export default function CustomSignInView() {
  const [user, setUser] = useRecoilState(userState);
  const nav = useNavigate();

  useEffect(() => {
    if (user) {
      nav('/dashboard/dashboard');
    }
  }, [user, nav]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    signIn(formData, setUser, nav);
  };

  return (
    <Box
      sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant='h4' fontWeight={'bold'} align='center' gutterBottom>
          LogIn
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            name='email'
            label='Email'
            type='email'
            fullWidth
            margin='normal'
            size='small'
            sx={{ mb: 0.1 }}
            required
          />
          <TextField
            name='password'
            label='Password'
            type='password'
            fullWidth
            margin='normal'
            size='small'
            sx={{ mb: 3 }}
            required
          />
          <Button type='submit' variant='contained' fullWidth color='primary' sx={{ mt: 2, mb: 3 }}>
            로그인
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
