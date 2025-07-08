import * as React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Logo from '../../assets/sambo.png';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userState, navigationResetState } from '../../recoil/atoms';
import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

import { Link } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import IconButton from '@mui/material/IconButton';
import HelpGuideModal from '../../components/modal/HelpGuideModal';

const GreyButton = styled(Button)<ButtonProps>(() => ({
  color: '#637381',
  fontWeight: 'bold',
  backgroundColor: '#ffffff',
  borderColor: grey[300],
  '&:hover': {
    backgroundColor: grey[300],
  },
  padding: '3px 10px',
}));

function CustomAppTitle() {
  return (
    <div className='logo'>
      <Link to='/dashboard/dashboard'>
        <img src={Logo} alt='삼보에이앤티' />
      </Link>
    </div>
  );
}

interface ToolbarActionsAdminProps {
  user: string;
}

function ToolbarActionsAdmin({ user }: ToolbarActionsAdminProps) {
  const navigate = useNavigate();
  const [, setUser] = useRecoilState(userState);
  const [helpOpen, setHelpOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/signIn/sign');
  };

  const handleHelpOpen = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

  return (
    <div className='flex-center-gap'>
      <span>{user}</span>
      <GreyButton variant='outlined' onClick={handleLogout}>
        로그아웃
      </GreyButton>
      <IconButton onClick={handleHelpOpen} sx={{ ml: 1 }} aria-label='도움말'>
        <HelpOutlineIcon />
      </IconButton>
      <HelpGuideModal open={helpOpen} onClose={handleHelpClose} />
    </div>
  );
}

export default function Layout() {
  const user = useRecoilValue(userState);
  const location = useLocation();
  const [, setNavigationReset] = useRecoilState(navigationResetState);

  React.useEffect(() => {
    const handleNavigationClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.MuiListItemButton-root') || target.closest('[role="menuitem"]')) {
        const clickedElement = target.closest('a');
        if (clickedElement) {
          const href = clickedElement.getAttribute('href');
          if (href && href === location.pathname) {
            setNavigationReset((prev) => prev + 1);
          }
        }
      }
    };

    document.addEventListener('click', handleNavigationClick);

    return () => {
      document.removeEventListener('click', handleNavigationClick);
    };
  }, [location.pathname, setNavigationReset]);

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
