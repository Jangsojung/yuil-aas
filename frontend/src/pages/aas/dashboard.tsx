import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sort from '../../layouts/sort/base_code';
import Sort2 from '../../layouts/sort/basic_code';
import BasicCode from '../../section/aas/dashboard/view';
import BaseCode from '../../section/aas/dashboard/view/base_index';
import { useRecoilState, useRecoilValue } from 'recoil';
import { baseEditModeState, navigationResetState, selectedBasesState } from '../../recoil/atoms';

export default function DashboardPage() {
  const [insertMode, setInsertMode] = useState(false);
  const [baseEditMode, setBaseEditMode] = useRecoilState(baseEditModeState);
  const [, setSelectedBases] = useRecoilState(selectedBasesState);
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  useEffect(() => {
    setInsertMode(false);
    setBaseEditMode(false);
    setSelectedBases([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

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
