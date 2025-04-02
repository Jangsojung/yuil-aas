import React from 'react';
import Sort from '../../layouts/sort';
import Monitoring from '../../section/aas/monitoring/view';

export default function MonitoringPage() {
  return (
    <div className='table-outer'>
      <Sort />
      <Monitoring />
    </div>
  );
}
