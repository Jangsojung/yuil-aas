import React from 'react';
import Grid from '@mui/system/Grid';
import Table from '../../../../components/table/basic_code';
import Checkbox from '@mui/material/Checkbox';

import { useRecoilState, useRecoilValue } from 'recoil';
import {
  baseEditModeState,
  currentFacilityGroupState,
  hasBasicsState,
  selectedBaseState,
  selectedFacilitiesState,
  selectedSensorsState,
} from '../../../../recoil/atoms';
import { TextField } from '@mui/material';

const style = {
  py: 0,
  width: '100%',
  maxWidth: 360,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'background.paper',
};

interface Basic {
  fa_idx: number;
  fa_name: string;
}

export default function BasicCode() {
  const currentFacilityGroup = useRecoilValue(currentFacilityGroupState);
  const [basics, setBasics] = React.useState<Basic[]>([]);
  const [hasBasics, setHasBasics] = useRecoilState(hasBasicsState);
  const [selectedFacilities, setSelectedFacilities] = useRecoilState(selectedFacilitiesState);

  const [baseEditMode, setBaseEditMode] = useRecoilState(baseEditModeState);
  const [selectedBase, setSelectedBase] = useRecoilState(selectedBaseState);

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

      setBasics(data);
      setHasBasics(data !== null && data.length > 0);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleCheckboxChange = (fileIdx: number) => {
    setSelectedFacilities((prevSelected) => {
      if (prevSelected.includes(fileIdx)) {
        return prevSelected.filter((idx) => idx !== fileIdx);
      } else {
        return [...prevSelected, fileIdx];
      }
    });
  };

  return (
    <div className='sensor-list-wrap'>
      <div className='sensor-list'></div>
      <div className='sensor-list'>
        {basics &&
          basics.map((basic, idx) => (
            <div key={basic.fa_idx}>
              <Grid container spacing={1} className='sensor-tit'>
                <div className='d-flex align-flex-end gap-10'>
                  <Checkbox
                    checked={selectedFacilities.includes(basic.fa_idx)}
                    onChange={() => handleCheckboxChange(basic.fa_idx)}
                  />
                  <TextField size='small' value={basic.fa_name} />
                  <span>Sub Modal 1.{idx + 1}</span>
                </div>

                {/* <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                  {!addSensorStates[basic.fa_idx] ? (
                    <Button
                      variant='outlined'
                      color='primary'
                      onClick={() => toggleAddSensor(basic.fa_idx)}
                      disabled={editSensorStates[basic.fa_idx]}
                    >
                      <AddIcon />
                      센서등록
                    </Button>
                  ) : (
                    <Button variant='outlined' color='success' onClick={() => handleAddSensorComplete(basic.fa_idx)}>
                      <SaveIcon /> 등록완료
                    </Button>
                  )}
                  {!editSensorStates[basic.fa_idx] ? (
                    <Button variant='outlined' color='warning' onClick={() => toggleEditSensor(basic.fa_idx)}>
                      <EditIcon /> 센서수정
                    </Button>
                  ) : (
                    <Button variant='outlined' color='success' onClick={() => toggleEditSensor(basic.fa_idx)}>
                      <SaveIcon /> 수정완료
                    </Button>
                  )}
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => handleDeleteSensor(basic.fa_idx)}
                    disabled={selectedSensors.length === 0}
                  >
                    <RemoveIcon /> 센서삭제
                  </Button>
                </Stack> */}
              </Grid>
              <Table sm_idx={idx + 1} fa_idx={basic.fa_idx} />
            </div>
          ))}
      </div>
    </div>
  );
}
