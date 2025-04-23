import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';

import SelectFacilityGroup from '../../components/select/facility_group';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedSensorsState, baseEditModeState, selectedBaseState, userState } from '../../recoil/atoms';
import { TextField } from '@mui/material';

const ADD_EQUIPMENT_EVENT = 'add-new-equipment';
const DELETE_EQUIPMENT_EVENT = 'delete-equipment';

interface Props {
  insertMode: boolean;
  setInsertMode: Dispatch<SetStateAction<boolean>>;
}

export default function Sort({ insertMode, setInsertMode }: Props) {
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [name, setName] = useState('');
  const [baseEditMode, setBaseEditMode] = useRecoilState(baseEditModeState);
  const selectedBase = useRecoilValue(selectedBaseState);
  const userIdx = useRecoilValue(userState)?.user_idx;

  const handleAdd = async () => {
    if (!name) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases?user_idx=${userIdx}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, ids: selectedSensors }),
      });

      if (!response.ok) {
        throw new Error('Failed to insert base');
      }

      setSelectedSensors([]);
      setName('');
      setInsertMode(false);
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleUpdate = async () => {
    if (!name) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases&user_idx=${userIdx}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ab_idx: selectedBase.ab_idx, name: name, ids: selectedSensors }),
      });

      if (!response.ok) {
        throw new Error('Failed to insert base');
      }

      setSelectedSensors([]);
      setName('');
      setBaseEditMode(false);
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleCancle = () => {
    setSelectedSensors([]);
    setName('');
    setInsertMode(false);
    setBaseEditMode(false);
  };

  useEffect(() => {
    setName(baseEditMode ? selectedBase.ab_name : '');
    setSelectedSensors([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}>
          <Grid container spacing={1} style={{ gap: '20px' }}>
            <Grid>
              <Grid container spacing={1}>
                <Grid className='d-flex gap-5'>
                  <div className='sort-title'>제목</div>
                </Grid>
                <Grid>
                  <TextField value={name} onChange={(e) => setName(e.target.value)} />
                </Grid>
                <Grid>
                  <div className='sort-title'>설비 그룹</div>
                </Grid>
                <Grid>
                  <SelectFacilityGroup />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={4} direction='row' style={{ justifyContent: 'flex-end' }}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
              <Button
                variant='contained'
                color='success'
                onClick={baseEditMode ? handleUpdate : handleAdd}
                disabled={selectedSensors.length === 0}
              >
                <SaveIcon />
                {baseEditMode ? '수정완료' : '등록완료'}
              </Button>

              <Button variant='contained' color='error' onClick={handleCancle}>
                <RemoveIcon /> 취소
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export { ADD_EQUIPMENT_EVENT, DELETE_EQUIPMENT_EVENT };
