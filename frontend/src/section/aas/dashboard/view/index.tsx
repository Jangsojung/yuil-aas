import React, { useEffect, useState } from 'react';
import Grid from '@mui/system/Grid';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '../../../../components/table/basic_code';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFacilityGroupState, hasBasicsState, selectedSensorsState } from '../../../../recoil/atoms';

interface Basic {
  fa_idx: number;
  fa_name: string;
}

interface Sensor {
  sn_idx: number;
  sn_name: string;
}

export default function BasicCode() {
  const currentFacilityGroup = useRecoilValue(currentFacilityGroupState);
  const [basics, setBasics] = useState<Basic[]>([]);
  const [, setHasBasics] = useRecoilState(hasBasicsState);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [sensorsByFa, setSensorsByFa] = useState<{ [key: number]: Sensor[] }>({});

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

  const getSensorsByFa = async (fa_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/sensors?fa_idx=${fa_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sensors');
      }

      const data: Sensor[] = await response.json();
      setSensorsByFa((prev) => ({
        ...prev,
        [fa_idx]: Array.isArray(data) ? data : [],
      }));
    } catch (err: any) {
      console.log(err.message);
      setSensorsByFa((prev) => ({
        ...prev,
        [fa_idx]: [],
      }));
    }
  };

  const handleSelectAllInFa = (fa_idx: number, checked: boolean) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    const sensorIds = sensorsInFa.map((sensor) => sensor.sn_idx);

    if (checked) {
      setSelectedSensors((prev) => {
        const newSelected = [...new Set([...prev, ...sensorIds])];
        return newSelected;
      });
    } else {
      setSelectedSensors((prev) => prev.filter((id) => !sensorIds.includes(id)));
    }
  };

  const isAllInFaSelected = (fa_idx: number) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    if (sensorsInFa.length === 0) return false;
    const sensorIds = sensorsInFa.map((sensor) => sensor.sn_idx);
    return sensorIds.every((id) => selectedSensors.includes(id));
  };

  const isPartiallySelectedInFa = (fa_idx: number) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    if (sensorsInFa.length === 0) return false;
    const sensorIds = sensorsInFa.map((sensor) => sensor.sn_idx);
    const selectedInFa = sensorIds.filter((id) => selectedSensors.includes(id));
    return selectedInFa.length > 0 && selectedInFa.length < sensorIds.length;
  };

  useEffect(() => {
    if (currentFacilityGroup !== null) {
      getBasicCode(currentFacilityGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFacilityGroup]);

  useEffect(() => {
    basics.forEach((basic) => {
      getSensorsByFa(basic.fa_idx);
    });
  }, [basics]);

  return (
    <div className='sensor-list-wrap'>
      <div className='sensor-list'></div>
      <div className='sensor-list'>
        {basics &&
          basics.map((basic, idx) => (
            <div key={basic.fa_idx}>
              <Grid container spacing={1} className='sensor-tit'>
                <div className='d-flex align-flex-end gap-10'>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isAllInFaSelected(basic.fa_idx)}
                        onChange={(e) => handleSelectAllInFa(basic.fa_idx, e.target.checked)}
                      />
                    }
                    label=''
                    style={{ margin: 0, marginRight: '10px' }}
                  />
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
