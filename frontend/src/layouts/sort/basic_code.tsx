import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import SelectFacilityGroup from '../../components/select/facility_group';
import SelectPeriod from '../../components/select/period';
import TextField from '../../components/input';
import Checkbox from '../../components/checkbox';
import BasicDatePicker from '../../components/datepicker';

import styled from '@mui/system/styled';
import { useRecoilValue } from 'recoil';
import { hasBasicsState } from '../../recoil/atoms';

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

  const handleEdit = () => {};

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}>
          <Grid container spacing={1}>
            {/* <Grid size={4}>
              <Grid container spacing={1}>
                <Grid size={4}>
                  <div>공장</div>
                </Grid>
                <Grid size={8}>
                  <SelectFactory />
                </Grid>
              </Grid>
            </Grid> */}
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
            {/* <Grid size={4}>
              <Grid container spacing={1}>
                <Grid size={4} className='d-flex gap-5'>
                  <Checkbox />
                  <div>주기</div>
                </Grid>
                <Grid size={4}>
                  <TextField />
                </Grid>
                <Grid size={4}>
                  <SelectPeriod />
                </Grid>
              </Grid>
            </Grid> */}

            <Grid size={4}>
              <Grid container spacing={1}>
                <Grid size={4} className='d-flex gap-5'>
                  {/* <Checkbox /> */}
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
            {/* 기초코드 버튼 */}
            {!hasBasics && (
              <Button variant='contained' color='success'>
                등록
              </Button>
            )}
            {hasBasics && (
              <Button variant='outlined' color='success' onClick={handleEdit}>
                수정
              </Button>
            )}
            {hasBasics && (
              <Button variant='contained' color='error'>
                삭제
              </Button>
            )}
            {/* 기초코드 버튼 */}

            {/* 기초코드 등록화면버튼 */}
            {/* <Button variant='contained' color='success'>
              센서추가
            </Button>
            <Button variant='contained' color='primary'>
              저장
            </Button> */}
            {/* 기초코드 등록화면버튼 */}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
