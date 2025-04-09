import Grid from '@mui/system/Grid';
import Table from '../../../../components/table/basic_code';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFacilityGroupState, hasBasicsState } from '../../../../recoil/atoms';
import React from 'react';

interface Basic {
  fa_idx: number;
  fa_name: string;
}

export default function BasicCode() {
  const currentFacilityGroup = useRecoilValue(currentFacilityGroupState);
  const [basics, setBasics] = React.useState<Basic[]>([]);
  const [hasBasics, setHasBasics] = useRecoilState(hasBasicsState);

  React.useEffect(() => {
    if (currentFacilityGroup !== null) {
      getBasicCode(currentFacilityGroup);
    }
  }, [currentFacilityGroup]);

  const getBasicCode = async (fg_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code?fg_idx=${fg_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: Basic[] = await response.json();
      console.log(data);

      setBasics(data);
      setHasBasics(data !== null);
    } catch (err: any) {
      console.log(err.message);
    }
  };
  return (
    <div>
      <div className='sensor-list'>
        {basics &&
          basics.map((basic, idx) => (
            <div>
              <Grid container spacing={1} className='sensor-tit'>
                <Grid size={2}>{basic.fa_name}</Grid>
                <Grid size={10}>Sub Modal 1.{idx + 1}</Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <Table sm_idx={idx + 1} fa_idx={basic.fa_idx} />
                </Grid>
              </Grid>
            </div>
          ))}
      </div>
    </div>
  );
}
