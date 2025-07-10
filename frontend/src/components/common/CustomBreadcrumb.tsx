import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

interface CustomBreadcrumbProps {
  items: Array<{
    label: string;
    path?: string;
    clickable?: boolean;
  }>;
}

export default function CustomBreadcrumb({ items }: CustomBreadcrumbProps) {
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate(path);
  };

  return (
    <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2, justifyContent: 'flex-end' }}>
      <Link
        component='button'
        variant='body1'
        onClick={() => handleClick('/dashboard/dashboard')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        <HomeIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <Typography variant='body1' color='text.secondary'>
            {item.label}
          </Typography>
        </React.Fragment>
      ))}
    </Breadcrumbs>
  );
}
