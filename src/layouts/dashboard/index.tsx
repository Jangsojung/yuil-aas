import * as React from 'react';
import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Logo from '../../assets/yuil.png';


function CustomAppTitle() {
  return (
    <div className='logo'>
      <img src={Logo} alt='yuil' />
    </div>
  );
}

function ToolbarActionsAdmin() {
  return (
    <div> 관리자님(test@test.com) </div>
  );
}

export default function Layout() {
  return (
    <DashboardLayout 
      disableCollapsibleSidebar
      slots={{
        appTitle: CustomAppTitle,
        toolbarActions: ToolbarActionsAdmin,
      }}
    
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}