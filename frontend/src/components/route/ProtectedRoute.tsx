import React, { ReactNode, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/atoms';
import { useNavigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [, setUser] = useRecoilState(userState);
  const navigate = useNavigate();

  const handleUserLoad = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUser(user);
      } catch (error) {
        localStorage.removeItem('user');
        navigate('/signIn/sign');
      }
    } else {
      navigate('/signIn/sign');
    }
  };

  useEffect(() => {
    handleUserLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser, navigate]);

  return <>{children}</>;
}
