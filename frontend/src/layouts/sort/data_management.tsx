import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import SelectFacilityGroup from '../../components/select/facility_group';
import BasicDatePicker from '../../components/datepicker';

import styled from '@mui/system/styled';

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
  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}>
          <Grid container spacing={1}>
            <Grid size={4}>
              <Grid container spacing={1}>
                <Grid size={4}>
                  <div>설비 그룹</div>
                </Grid>
                <Grid size={8}>
                  <SelectFacilityGroup />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={4}>
              <Grid container spacing={1}>
                <Grid size={4} className='d-flex gap-5'>
                  <div>날짜</div>
                </Grid>
                <Grid size={8}>
                  <BasicDatePicker />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <Button variant='contained' color='success'>
              등록
            </Button>
            {/* <Button variant='outlined' color='success'>
              수정
            </Button> */}
            <Button variant='contained' color='error'>
              삭제
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
