import * as React from 'react';
import Sort from '../../layouts/sort/data_management';
import Data from '../../section/aasx/data/view';

export default function dataManagerPage() {
  return (
    <div className='table-outer'>
      <Sort />
      <Data />
    </div>
  );
}
