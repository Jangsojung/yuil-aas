import React from 'react';
import Sort from '../../layouts/sort/basic_code';
import Monitoring from '../../section/aas/monitoring/view';

export default function MonitoringPage() {
  return (
    <div className='table-outer'>
      <Sort />
      <Monitoring />
    </div>
  );
}
