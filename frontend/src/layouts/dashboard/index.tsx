import * as React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import Container from '@mui/material/Container';
import { PageHeader } from '@toolpad/core/PageContainer';
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

const GrayButton = styled(Button)<ButtonProps>(() => ({
  color: '#637381',
  fontWeight: 'bold',
  backgroundColor: '#ffffff',
  borderColor: grey[200],
  '&:hover': {
    backgroundColor: grey[200],
  },
  padding: '2px 8px',
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
    <div className='d-flex align-center gap-10'>
      <p className='header-user'>{user}</p>
      <GrayButton variant='outlined' onClick={handleLogout}>
        로그아웃
      </GrayButton>
      <IconButton onClick={handleHelpOpen} sx={{p:0}} aria-label='도움말'>
        <HelpOutlineIcon sx={{fontSize: '1.8rem'}} />
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
      <Container>
        <PageHeader />
        <Outlet />
      </Container>
    </DashboardLayout>
  );
}
