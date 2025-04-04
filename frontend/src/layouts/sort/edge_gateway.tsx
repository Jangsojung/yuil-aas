import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import SelectFactory from '../../components/select/factory';
import SelectPeriod from '../../components/select/period';
import TextField from '../../components/input';
import ModalBasic from '../../components/modal/edgemodal';

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
        <Grid size={8}></Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <ModalBasic/>
            <Button variant='contained' color='error'>
              삭제
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
