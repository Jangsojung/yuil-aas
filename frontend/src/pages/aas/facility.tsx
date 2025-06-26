import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { baseEditModeState, navigationResetState, selectedBasesState } from '../../recoil/atoms';

export default function FacilityPage() {
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

  return <div style={{ height: '100%' }}>설비 관리</div>;
}
