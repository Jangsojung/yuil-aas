import * as React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Logo from '../../assets/yuil.png';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';

function CustomAppTitle() {
  return (
    <div className='logo'>
      <img src={Logo} alt='yuil' />
    </div>
  );
}

function ToolbarActionsAdmin({ user }) {
  const navigate = useNavigate();
  const [, setUser] = useRecoilState(userState);

  const handleLogout = () => {
    localStorage.removeItem('user');

    setUser(null);

    navigate('/signIn/sign');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span>{user}</span>
      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
}

export default function Layout() {
  const user = useRecoilValue(userState);

  return (
    <DashboardLayout
      disableCollapsibleSidebar
      slots={{
        appTitle: CustomAppTitle,
        toolbarActions: () => <ToolbarActionsAdmin user={`${user?.user_name}님(${user?.user_id})`} />,
      }}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}
