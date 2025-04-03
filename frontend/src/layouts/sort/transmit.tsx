import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

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
            <Grid size={12}>
              <Grid container spacing={1}>
                <Grid size={1}>
                  <div>AASX 파일</div>
                </Grid>
                <Grid size={11} className="w-100">
                  <SelectFactory />
                </Grid>
              </Grid>
            </Grid> 
          </Grid>
        </Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>

            <Button variant='contained' color='success'>
              검증하기
            </Button>
            <Button variant='contained' color='primary'>
              등록
            </Button>

          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
