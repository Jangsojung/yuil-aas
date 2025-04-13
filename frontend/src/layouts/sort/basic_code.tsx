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
import { hasBasicsState, isEditModeState, shouldSaveChangesState } from '../../recoil/atoms';

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

export default function Sort() {
  const hasBasics = useRecoilValue(hasBasicsState);
  const [isEditMode, setIsEditMode] = useRecoilState(isEditModeState);
  const [shouldSaveChanges, setShouldSaveChanges] = useRecoilState(shouldSaveChangesState);

  const handleEditToggle = () => {
    if (isEditMode) {
      setShouldSaveChanges(true);
    }
    setIsEditMode(!isEditMode);
  };

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}>
          <Grid container spacing={1} style={{ gap: '20px' }}>
            <Grid>
              <Grid container spacing={1}>
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
              <Button variant='contained' color='primary'>
                <AddIcon />
                장비등록
              </Button>
              {hasBasics && !isEditMode && (
                <Button variant='contained' color='warning' onClick={handleEditToggle}>
                  <EditIcon /> 장비수정
                </Button>
              )}
              {hasBasics && isEditMode && (
                <Button variant='contained' color='success' onClick={handleEditToggle}>
                  <SaveIcon /> 수정완료
                </Button>
              )}
              {hasBasics && (
                <Button variant='contained' color='error'>
                  <RemoveIcon /> 장비삭제
                </Button>
              )}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
