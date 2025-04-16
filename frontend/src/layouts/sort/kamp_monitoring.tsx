import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';

import SelectFactory from '../../components/select/factory';
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
            <Grid size={6}>
              <Grid container spacing={1}>
                <Grid size={4}>
                  <div className='sort-title'>공장이름</div>
                </Grid>
                <Grid size={8}>
                  <SelectFactory />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
