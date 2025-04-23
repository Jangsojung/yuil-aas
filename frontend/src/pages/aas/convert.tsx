import React, { useEffect, useState } from 'react';
import { getBasesAPI, insertBaseAPI } from '../../apis/api/convert';

import CircularProgress from '@mui/material/CircularProgress';
import { Dayjs } from 'dayjs';
import { Box, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Grid from '@mui/system/Grid';
import BasicDatePicker from '../../components/datepicker';
import Pagenation from '../../components/pagenation';
import Paper from '@mui/material/Paper';
import ConvertTableRow from '../../components/aas/convert/ConvertTableRow';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';

interface Base {
  ab_idx: number;
  ab_name: string;
  sn_length: number;
}

export default function ConvertPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConvert, setSelectedConvert] = useState<number | null>();
  const [bases, setBases] = useState<Base[]>([]);
  const userIdx = useRecoilValue(userState)?.user_idx;

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagedData = bases?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const startLoading = () => {
    setIsLoading(true);
  };

  const endLoading = () => {
    setIsLoading(false);
  };

  const handleDateChange = (newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const getBases = async () => {
    const data: Base[] = await getBasesAPI();
    setBases(data);
  };

  const handleInsert = async () => {
    if (!startDate || !endDate) {
      alert('시작 날짜와 종료 날짜를 모두 선택해야 합니다.');
      return;
    }

    if (!selectedConvert) {
      alert('기초코드를 선택해야합니다.');
      return;
    }

    startLoading();

    const formattedStartDate = startDate.format('YYMMDD');
    const formattedEndDate = endDate.format('YYMMDD');

    const data = await insertBaseAPI(formattedStartDate, formattedEndDate, selectedConvert, userIdx);

    if (data) {
      alert('성공적으로 json파일을 생성하였습니다.\n파일 위치: /files/front');

      setStartDate(null);
      setEndDate(null);
      setSelectedConvert(null);
    }

    endLoading();
  };

  const handleCheckboxChange = (convertsIdx: number) => {
    setSelectedConvert((prev) => (prev === convertsIdx ? null : convertsIdx));
  };

  useEffect(() => {
    getBases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <CircularProgress />
        </div>
      )}

      <div style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={1}>
            <Grid size={8}>
              <Grid container spacing={1}>
                <Grid size={10}>
                  <Grid container spacing={1}>
                    <Grid className='d-flex gap-5'>
                      <div className='sort-title'>날짜</div>
                    </Grid>
                    <Grid>
                      <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid size={4}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='contained' color='success' onClick={handleInsert} disabled={selectedConvert === null}>
                  등록
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <div className='table-wrap-min'>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {cells.map((cell, idx) => (
                    <TableCell key={idx}>{cell}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedData && pagedData.length > 0 ? (
                  pagedData.map((base, idx) => (
                    <ConvertTableRow
                      base={base}
                      key={idx}
                      checked={selectedConvert === base.ab_idx}
                      onCheckboxChange={handleCheckboxChange}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={cells.length + 1} align='center'>
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagenation count={bases ? bases.length : 0} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}
const cells = ['번호', '기초코드 이름'];
