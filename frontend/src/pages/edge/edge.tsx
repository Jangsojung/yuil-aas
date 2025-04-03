import React from 'react';
import Sort from '../../layouts/sort/edge_gateway';
import Edge from '../../section/edge/edge_gateway/view';

export default function MonitoringPage() {
  return (
    <div className='table-outer'>
      <Sort />
      <Edge />
    </div>
  );
}
