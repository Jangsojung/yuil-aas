import React, { useEffect, Dispatch, SetStateAction, useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useRecoilState } from 'recoil';
import { userState, User } from '../../recoil/atoms';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import AlertModal from '../../components/modal/alert';
import { signInAPI } from '../../apis/api/signin';

const signIn = async (
  formData: FormData,
  setUser: Dispatch<SetStateAction<User | null>>,
  nav: NavigateFunction,
  setAlertModal: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      title: string;
      content: string;
      type: 'alert' | 'confirm';
      onConfirm: (() => void) | undefined;
    }>
  >
) => {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const data = await signInAPI(email, password);

    if (data.success) {
      const user: User = {
        user_idx: data.user_idx,
        user_id: data.user_id,
        user_name: data.user_name,
        cm_idx: data.cm_idx,
      };
      try {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        nav('/dashboard/dashboard');
      } catch (storageError) {
        setAlertModal({
          open: true,
          title: '저장 오류',
          content: '사용자 정보 저장 중 오류가 발생했습니다.',
          type: 'alert',
          onConfirm: undefined,
        });
      }
    } else {
      setAlertModal({
        open: true,
        title: '로그인 실패',
        content: data.message,
        type: 'alert',
        onConfirm: undefined,
      });
    }
  } catch (error) {
    setAlertModal({
      open: true,
      title: '오류',
      content: '서버 오류 발생',
      type: 'alert',
      onConfirm: undefined,
    });
  }
};

export default function CustomSignInView() {
  const [user, setUser] = useRecoilState(userState);
  const nav = useNavigate();
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });

  useEffect(() => {
    if (user) {
      nav('/dashboard/dashboard');
    }
  }, [user, nav]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    signIn(formData, setUser, nav, setAlertModal);
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
      }}
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

      <AlertModal
        open={alertModal.open}
        handleClose={handleCloseAlert}
        title={alertModal.title}
        content={alertModal.content}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </Box>
  );
}
