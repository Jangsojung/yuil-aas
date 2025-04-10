import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import SelectFactory from '../../components/select/factory';
import SelectPeriod from '../../components/select/period';
import TextField from '../../components/input';
import ModalBasic from '../../components/modal';
import SelectFacilityGroup from '../../components/select/facility_group';

export default function Sort() {
  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}>
          <Grid container spacing={1}  style={{gap: '20px'}}>
            <Grid>
              <Grid container spacing={1}>
                <Grid>
                  <div className="sort-title">공장</div>
                </Grid>
                <Grid>
                  <SelectFactory />
                </Grid>
              </Grid>
            </Grid>
            <Grid>
              <Grid container spacing={1}>
                <Grid>
                  <div className="sort-title">설비 그룹</div>
                </Grid>
                <Grid>
                  <SelectFacilityGroup />
                </Grid>
              </Grid>
            </Grid>
            <Grid>
              <Grid container spacing={1}>
                <Grid>
                  <div className="sort-title">주기</div>
                </Grid>
                <Grid className='d-flex align-center'>
                  <TextField />
                  <SelectPeriod />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <ModalBasic />
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
