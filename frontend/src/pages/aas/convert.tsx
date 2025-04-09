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
    <div>
      {isLoading ?? <CircularProgress />}
      <Sort startLoading={startLoading} endLoading={endLoading} />
      <Convert />
    </div>
  );
}
