import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import BasicDatePicker from '../../components/datepicker';
import { Dayjs } from 'dayjs';

import styled from '@mui/system/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFactoryState, selectedConvertsState } from '../../recoil/atoms';

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

export default function Sort({ startLoading, endLoading }) {
  const [selectedConverts, setSelectedConverts] = useRecoilState(selectedConvertsState);
  const currentFactory = useRecoilValue(currentFactoryState);

  const [startDate, setStartDate] = React.useState<Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<Dayjs | null>(null);
  const [resetTrigger, setResetTrigger] = React.useState(false);

  const handleDateChange = (newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleAdd = async () => {
    if (!startDate || !endDate) {
      console.log('시작 날짜와 종료 날짜를 모두 선택해야 합니다.');
      return;
    }

    startLoading();

    const formattedStartDate = startDate.format('YYMMDD');
    const formattedEndDate = endDate.format('YYMMDD');

    try {
      const response = await fetch(`http://localhost:5001/api/convert?fc_idx=${currentFactory}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ start: formattedStartDate, end: formattedEndDate, ids: selectedConverts }),
      });

      if (!response.ok) {
        throw new Error('Failed to insert converts');
      }

      alert('성공적으로 json파일을 생성하였습니다.\n파일 위치: /src/files/front');

      endLoading();

      setStartDate(null);
      setEndDate(null);
      setResetTrigger((prev) => !prev);
      setSelectedConverts([]);
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}>
          <Grid container spacing={1}>
            <Grid size={10}>
              <Grid container spacing={1}>
                <Grid size={1} className='d-flex gap-5'>
                  <div>날짜</div>
                </Grid>
                <Grid size={8}>
                  <BasicDatePicker onDateChange={handleDateChange} resetDates={resetTrigger} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <Button variant='contained' color='success' onClick={handleAdd} disabled={selectedConverts.length === 0}>
              등록
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
