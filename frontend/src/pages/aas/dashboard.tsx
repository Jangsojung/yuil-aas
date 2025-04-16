import React, { useState } from 'react';
import Sort from '../../layouts/sort/base_code';
import Sort2 from '../../layouts/sort/basic_code';
import BasicCode from '../../section/aas/dashboard/view';
import BaseCode from '../../section/aas/dashboard/view/base_index';
import { useRecoilValue } from 'recoil';
import { baseEditModeState } from '../../recoil/atoms';

export default function DashboardPage() {
  const [insertMode, setInsertMode] = useState(false);
  const baseEditMode = useRecoilValue(baseEditModeState);
  return (
    <div>
      {insertMode || baseEditMode ? (
        <>
          <Sort2 insertMode={insertMode} setInsertMode={setInsertMode} />
          <BasicCode />
        </>
      ) : (
        <>
          <Sort insertMode={insertMode} setInsertMode={setInsertMode} />
          <BaseCode />
        </>
      )}
    </div>
  );
}
