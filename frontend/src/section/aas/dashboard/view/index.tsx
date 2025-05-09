import React, { useEffect, useState } from 'react';
import Grid from '@mui/system/Grid';
import Table from '../../../../components/table/basic_code';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFacilityGroupState, hasBasicsState } from '../../../../recoil/atoms';

interface Basic {
  fa_idx: number;
  fa_name: string;
}

export default function BasicCode() {
  const currentFacilityGroup = useRecoilValue(currentFacilityGroupState);
  const [basics, setBasics] = useState<Basic[]>([]);
  const [, setHasBasics] = useRecoilState(hasBasicsState);

  const getBasicCode = async (fg_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code?fg_idx=${fg_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: Basic[] = await response.json();

      setBasics(data);
      setHasBasics(data !== null && data.length > 0);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    if (currentFacilityGroup !== null) {
      getBasicCode(currentFacilityGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFacilityGroup]);

  return (
    <div className='sensor-list-wrap'>
      <div className='sensor-list'></div>
      <div className='sensor-list'>
        {basics &&
          basics.map((basic, idx) => (
            <div key={basic.fa_idx}>
              <Grid container spacing={1} className='sensor-tit'>
                <div className='d-flex align-flex-end gap-10'>
                  <span>{basic.fa_name}</span>
                  <span>Sub Modal 1.{idx + 1}</span>
                </div>
              </Grid>
              <Table sm_idx={idx + 1} fa_idx={basic.fa_idx} />
            </div>
          ))}
      </div>
    </div>
  );
}
