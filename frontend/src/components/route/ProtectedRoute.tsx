import React, { ReactNode, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/atoms';
import { useNavigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [, setUser] = useRecoilState(userState);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/signIn/sign');
    }
  }, [setUser, navigate]);

  return <>{children}</>;
}
