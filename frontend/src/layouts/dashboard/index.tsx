import * as React from 'react';
import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Logo from '../../assets/yuil.png';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';

function CustomAppTitle() {
  return (
    <div className='logo'>
      <img src={Logo} alt='yuil' />
    </div>
  );
}

function ToolbarActionsAdmin({ user }) {
  return <div> {user} </div>;
}

export default function Layout() {
  const user = useRecoilValue(userState);

  return (
    <DashboardLayout
      disableCollapsibleSidebar
      slots={{
        appTitle: CustomAppTitle,
        toolbarActions: () => <ToolbarActionsAdmin user={user} />,
      }}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}
