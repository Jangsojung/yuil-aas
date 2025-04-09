import React from 'react';
import Sort from '../../layouts/sort/convert';
import Convert from '../../section/aas/convert/view';
import CircularProgress from '@mui/material/CircularProgress';

export default function ConvertPage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const startLoading = () => {
    setIsLoading(true);
  };

  const endLoading = () => {
    setIsLoading(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <CircularProgress />
        </div>
      )}

      {/* Content */}
      <div style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
        <Sort startLoading={startLoading} endLoading={endLoading} />
        <Convert />
      </div>
    </div>
  );
}
