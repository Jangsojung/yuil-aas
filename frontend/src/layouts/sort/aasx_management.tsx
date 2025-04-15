import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';

import BasicDatePicker from '../../components/datepicker';
import ModalBasic from '../../components/modal/aasx_management';

import styled from '@mui/system/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentFactoryState,
  dataTableRefreshTriggerState,
  selectedDataFilesState,
  dateRangeAASXState,
} from '../../recoil/atoms';

import RemoveIcon from '@mui/icons-material/Remove';

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
  const [selectedFiles, setSelectedFiles] = useRecoilState(selectedDataFilesState);
  const currentFactory = useRecoilValue(currentFactoryState);
  const [refreshTrigger, setRefreshTrigger] = useRecoilState(dataTableRefreshTriggerState);

  const [dateRange, setDateRange] = useRecoilState(dateRangeAASXState);

  const handleDelete = async () => {
    if (!window.confirm(`선택한 ${selectedFiles.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/file/aasx`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedFiles,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete items');
      }

      setSelectedFiles([]);
      setRefreshTrigger((prev) => prev + 1);
      alert('선택한 항목이 삭제되었습니다.');
    } catch (err: any) {
      console.error('삭제 중 오류가 발생했습니다:', err.message);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDateChange = (newStartDate, newEndDate) => {
    setDateRange({ startDate: newStartDate, endDate: newEndDate });
  };

  const handleSearch = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      alert('날짜를 선택해주세요.');
      return;
    }

    setRefreshTrigger((prev) => prev + 1);
  };

  const handleReset = () => {
    const defaultStart = dayjs().subtract(1, 'month');
    const defaultEnd = dayjs();
    setDateRange({ startDate: defaultStart, endDate: defaultEnd });
  };

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}>
          <Grid container spacing={1} style={{ gap: '20px' }}>
            <Grid>
              <Grid container spacing={1}>
                <Grid className='d-flex gap-5'>
                  <div className='sort-title'>날짜</div>
                </Grid>
                <Grid>
                  <BasicDatePicker
                    onDateChange={handleDateChange}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <Button variant='contained' color='success' onClick={handleSearch}>
              조회
            </Button>
            <Button variant='contained' color='success' onClick={handleReset}>
              초기화
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={1}>
        <Grid size={12}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <ModalBasic />
            <Button variant='contained' color='error' onClick={handleDelete} disabled={selectedFiles.length === 0}>
              <RemoveIcon /> 파일삭제
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
