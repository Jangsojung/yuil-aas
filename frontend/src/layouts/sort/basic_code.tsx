import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RemoveIcon from '@mui/icons-material/Remove';

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
          <Grid container spacing={1} style={{gap: '20px'}}>
            {/* <Grid size={4}>
              <Grid container spacing={1}>
                <Grid size={3}>
                  <div>공장</div>
                </Grid>
                <Grid size={8}>
                  <SelectFactory />
                </Grid>
              </Grid>
            </Grid> */}
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
            {/* <Grid size={4}>
              <Grid container spacing={1}>
                <Grid size={3} className='d-flex gap-5'>
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

            <Grid>
              <Grid container spacing={1}>
                <Grid>
                  {/* <Checkbox /> */}
                  <div className="sort-title">날짜</div>
                </Grid>
                <Grid  className='d-flex gap-5'>
                  <BasicDatePicker />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={4} direction='row' style={{ justifyContent: 'flex-end' }}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
<<<<<<< HEAD
            <Button variant='contained' color='success'>
              조회
            </Button>
            <Button variant='contained' color='success'>
              초기화
            </Button>
          </Stack>
          
        </Grid>
      </Grid>
      <Grid container spacing={1}>
      <Grid size={12}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <Button variant='contained' color='primary'>
              <AddIcon />장비등록
            </Button>
            <Button variant='contained' color='warning'>
              <EditIcon /> 장비수정
            </Button>
            <Button variant='contained' color='error'>
              <RemoveIcon /> 장비삭제
            </Button>
=======
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
>>>>>>> 69bb4d0d1df8258bcebd5bc90ba4b8d7165f8f4d
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
