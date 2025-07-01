import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

export default function LoadingOverlay() {
  return (
    <div className='loading-overlay'>
      <CircularProgress />
    </div>
  );
}
