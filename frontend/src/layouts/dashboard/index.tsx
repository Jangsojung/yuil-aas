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

import { Link as RouterLink } from 'react-router-dom';
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
      <RouterLink to='/dashboard/dashboard'>
        <img src={Logo} alt='삼보에이앤티' />
      </RouterLink>
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
      <IconButton onClick={handleHelpOpen} sx={{ p: 0 }} aria-label='도움말'>
        <HelpOutlineIcon sx={{ fontSize: '1.8rem' }} />
      </IconButton>
      <HelpGuideModal open={helpOpen} onClose={handleHelpClose} />
    </div>
  );
}

export default function Layout() {
  const user = useRecoilValue(userState);
  const location = useLocation();
  const [, setNavigationReset] = useRecoilState(navigationResetState);

  // 네브바 메뉴 활성화 설정
  React.useEffect(() => {
    const setActiveMenu = () => {
      // 모든 메뉴 아이템의 active 상태 제거
      const allMenuItems = document.querySelectorAll('.MuiListItemButton-root');
      allMenuItems.forEach((item) => {
        item.classList.remove('Mui-selected');
      });

      // 현재 경로에 따라 해당 메뉴 활성화
      const currentPath = location.pathname;

      if (currentPath.startsWith('/aas/basic')) {
        // 기초코드 관리 메뉴 활성화
        const basicMenuItems = document.querySelectorAll('a[href="/aas/basic"]');
        basicMenuItems.forEach((item) => {
          const listItem = item.closest('.MuiListItemButton-root');
          if (listItem) {
            listItem.classList.add('Mui-selected');
          }
        });
      } else if (currentPath.startsWith('/data/jsonManager')) {
        // JSON 파일 관리 메뉴 활성화
        const jsonMenuItems = document.querySelectorAll('a[href="/data/jsonManager"]');
        jsonMenuItems.forEach((item) => {
          const listItem = item.closest('.MuiListItemButton-root');
          if (listItem) {
            listItem.classList.add('Mui-selected');
          }
        });
      } else if (currentPath.startsWith('/aas/facility')) {
        // 설비 관리 메뉴 활성화
        const facilityMenuItems = document.querySelectorAll('a[href="/aas/facility"]');
        facilityMenuItems.forEach((item) => {
          const listItem = item.closest('.MuiListItemButton-root');
          if (listItem) {
            listItem.classList.add('Mui-selected');
          }
        });
      } else if (currentPath.startsWith('/aas/convert')) {
        // 기초코드 변환 메뉴 활성화
        const convertMenuItems = document.querySelectorAll('a[href="/aas/convert"]');
        convertMenuItems.forEach((item) => {
          const listItem = item.closest('.MuiListItemButton-root');
          if (listItem) {
            listItem.classList.add('Mui-selected');
          }
        });
      } else if (currentPath.startsWith('/data/dataManager')) {
        // 식별 ID 관리 메뉴 활성화
        const dataManagerMenuItems = document.querySelectorAll('a[href="/data/dataManager"]');
        dataManagerMenuItems.forEach((item) => {
          const listItem = item.closest('.MuiListItemButton-root');
          if (listItem) {
            listItem.classList.add('Mui-selected');
          }
        });
      } else if (currentPath.startsWith('/aasx/aasxManager')) {
        // AASX 관리 메뉴 활성화
        const aasxManagerMenuItems = document.querySelectorAll('a[href="/aasx/aasxManager"]');
        aasxManagerMenuItems.forEach((item) => {
          const listItem = item.closest('.MuiListItemButton-root');
          if (listItem) {
            listItem.classList.add('Mui-selected');
          }
        });
      } else if (currentPath.startsWith('/aasx/transmit')) {
        // AASX 송신 메뉴 활성화
        const transmitMenuItems = document.querySelectorAll('a[href="/aasx/transmit"]');
        transmitMenuItems.forEach((item) => {
          const listItem = item.closest('.MuiListItemButton-root');
          if (listItem) {
            listItem.classList.add('Mui-selected');
          }
        });
      } else if (currentPath.startsWith('/edge/edge')) {
        // Edge Gateway 관리 메뉴 활성화
        const edgeMenuItems = document.querySelectorAll('a[href="/edge/edge"]');
        edgeMenuItems.forEach((item) => {
          const listItem = item.closest('.MuiListItemButton-root');
          if (listItem) {
            listItem.classList.add('Mui-selected');
          }
        });
      }
    };

    // DOM이 완전히 로드된 후 실행
    const timer = setTimeout(setActiveMenu, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

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

  // 브레드크럼 링크 비활성화 (홈 제외) 및 홈 아이콘 추가
  React.useEffect(() => {
    // JSON 상세 페이지에서는 브레드크럼 관련 JavaScript 실행하지 않음
    if (
      location.pathname.includes('/basic') &&
      (location.search.includes('mode=add') || location.search.includes('mode=edit'))
    ) {
      return;
    }

    const handleBreadcrumb = () => {
      const breadcrumbOl = document.querySelector('.MuiBreadcrumbs-ol');
      if (breadcrumbOl) {
        // 홈 아이콘 추가 (이미 있는지 확인)
        if (!breadcrumbOl.querySelector('.home-icon-added')) {
          const firstLi = breadcrumbOl.querySelector('li');
          if (firstLi) {
            // 홈 아이콘 생성
            const homeIcon = document.createElement('a');
            homeIcon.href = '/dashboard/dashboard';
            homeIcon.className =
              'MuiTypography-root MuiTypography-inherit MuiLink-root MuiLink-underlineHover home-icon-added';
            homeIcon.style.display = 'flex';
            homeIcon.style.alignItems = 'center';
            homeIcon.innerHTML = `
              <svg style="width: 1.2rem; height: 1.2rem; margin-right: 4px;" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            `;

            // 첫 번째 아이템 앞에 홈 아이콘 추가
            const homeLi = document.createElement('li');
            homeLi.className = 'MuiBreadcrumbs-li';
            homeLi.appendChild(homeIcon);

            // 구분자 추가
            const separator = document.createElement('li');
            separator.className = 'MuiBreadcrumbs-separator';
            separator.setAttribute('aria-hidden', 'true');
            separator.style.margin = '0 8px';
            separator.innerHTML = '/';

            breadcrumbOl.insertBefore(separator, firstLi);
            breadcrumbOl.insertBefore(homeLi, separator);
          }
        }

        // 홈 아이콘을 제외한 모든 브레드크럼 링크 비활성화
        const allLinks = breadcrumbOl.querySelectorAll('a:not(.home-icon-added)');
        allLinks.forEach((link) => {
          const linkElement = link as HTMLElement;
          linkElement.removeAttribute('href');
          linkElement.style.pointerEvents = 'none';
          linkElement.style.cursor = 'default';
          linkElement.style.color = '#666';
          linkElement.style.textDecoration = 'none';
        });
      }
    };

    // 초기 실행
    handleBreadcrumb();

    // DOM 변화 감지
    const observer = new MutationObserver(handleBreadcrumb);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <DashboardLayout
      disableCollapsibleSidebar
      slots={{
        appTitle: CustomAppTitle,
        toolbarActions: () => <ToolbarActionsAdmin user={`${user?.user_name}님(${user?.user_id})`} />,
      }}
    >
      <Container>
        {location.pathname !== '/dashboard/dashboard' &&
          !location.search.includes('mode=add') &&
          !location.search.includes('mode=edit') && <PageHeader />}
        <Outlet />
      </Container>
    </DashboardLayout>
  );
}
