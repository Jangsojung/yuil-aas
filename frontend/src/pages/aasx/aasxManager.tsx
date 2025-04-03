import * as React from 'react';
import Sort from '../../layouts/sort/aasx_management';
import AASX from '../../section/aasx/aasx/view';

export default function aasxManagerPage() {
  return (
    <div className='table-outer'>
      <Sort />
      <AASX />
    </div>
  );
}
