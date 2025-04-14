import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';

import SelectFacilityGroup from '../../components/select/facility_group';

import styled from '@mui/system/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  hasBasicsState,
  isEditModeState,
  shouldSaveChangesState,
  currentFacilityGroupState,
  selectedFacilitiesState,
  selectedSensorsState,
} from '../../recoil/atoms';
import { TextField } from '@mui/material';

const Item = styled('div')(({ theme }) => ({
  backgroundColor: '#fff',
  border: '1px solid',
  borderColor: '#ced7e0',
  padding: theme.spacing(1),
  borderRadius: '4px',
  textAlign: 'center',
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
    borderColor: '#444d58',
  }),
}));

const ADD_EQUIPMENT_EVENT = 'add-new-equipment';
const DELETE_EQUIPMENT_EVENT = 'delete-equipment';

interface Props {
  insertMode: boolean;
  setInsertMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sort({ insertMode, setInsertMode }: Props) {
  const hasBasics = useRecoilValue(hasBasicsState);
  const [isEditMode, setIsEditMode] = useRecoilState(isEditModeState);
  const [shouldSaveChanges, setShouldSaveChanges] = useRecoilState(shouldSaveChangesState);
  const [isAddingEquipment, setIsAddingEquipment] = React.useState(false);
  const selectedFacilities = useRecoilValue(selectedFacilitiesState);
  const currentFacilityGroup = useRecoilValue(currentFacilityGroupState);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [name, setName] = React.useState('');

  const handleEditToggle = () => {
    if (isEditMode) {
      setShouldSaveChanges(true);
    }
    setIsEditMode(!isEditMode);
  };

  const handleDeleteEquipment = () => {
    if (selectedFacilities.length === 0) return;

    if (window.confirm(`선택한 ${selectedFacilities.length}개의 장비를 삭제하시겠습니까?`)) {
      document.dispatchEvent(new CustomEvent(DELETE_EQUIPMENT_EVENT));
    }
  };

  const handleAdd = async () => {
    if (!name) {
      console.log('이름을 입력해주세요.');
      return;
    }

    // startLoading();

    try {
      const response = await fetch(`http://localhost:5001/api/base_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedSensors }),
      });

      if (!response.ok) {
        throw new Error('Failed to insert base');
      }

      alert('성공적으로 json파일을 생성하였습니다.\n파일 위치: /files/front');

      // endLoading();
      setSelectedSensors([]);
    } catch (err) {
      console.log(err.message);
    }
  };

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
                  <TextField onChange={(e) => setName(e.target.value)} />
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
              <Button variant='contained' color='success' onClick={handleAdd} disabled={selectedSensors.length === 0}>
                <SaveIcon />
                등록완료
              </Button>

              <Button variant='contained' color='error' onClick={() => setInsertMode(false)}>
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
