import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getBasesAPI, insertBaseAPI } from '../../apis/api/convert';

import { Dayjs } from 'dayjs';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import BasicDatePicker from '../../components/datepicker';
import Pagination from '../../components/pagination';
import Paper from '@mui/material/Paper';
import ConvertTableRow from '../../components/aas/convert/ConvertTableRow';
import { useRecoilValue } from 'recoil';
import { userState, navigationResetState } from '../../recoil/atoms';
import LoadingOverlay from '../../components/loading/LodingOverlay';
import { SearchBox } from '../../components/common';

interface Base {
  ab_idx: number;
  ab_name: string;
  ab_note: string;
  sn_length: number;
  createdAt?: string;
}

export default function ConvertPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConvert, setSelectedConvert] = useState<number | null>();
  const [bases, setBases] = useState<Base[]>([]);
  const [filteredBases, setFilteredBases] = useState<Base[]>([]);
  const userIdx = useRecoilValue(userState)?.user_idx;
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagedData = filteredBases?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

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
    setFilteredBases(data);
  };

  const handleSearch = () => {
    let filtered = bases;

    if (searchKeyword.trim()) {
      filtered = filtered.filter((base) => base.ab_name.toLowerCase().includes(searchKeyword.toLowerCase()));
    }

    if (startDate || endDate) {
      filtered = filtered.filter((base) => {
        if (!base.createdAt) return false;

        const baseDate = new Date(base.createdAt);
        const baseDateOnly = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

        if (startDate && endDate) {
          const start = startDate.toDate();
          const end = endDate.toDate();
          return baseDateOnly >= start && baseDateOnly <= end;
        } else if (startDate) {
          const start = startDate.toDate();
          return baseDateOnly >= start;
        } else if (endDate) {
          const end = endDate.toDate();
          return baseDateOnly <= end;
        }

        return true;
      });
    }

    setFilteredBases(filtered);
    setCurrentPage(0);
  };

  const handleReset = () => {
    setSearchKeyword('');
    setStartDate(null);
    setEndDate(null);
    setFilteredBases(bases);
    setCurrentPage(0);
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

  const handleEditClick = (base: Base) => {
    // 수정 기능 구현
    console.log('Edit clicked for base:', base);
  };

  const handleStartDateChange = (baseId: number, date: Dayjs | null) => {
    console.log('Start date changed for base:', baseId, date);
    // 여기에 시작날짜 변경 로직 추가
  };

  const handleEndDateChange = (baseId: number, date: Dayjs | null) => {
    console.log('End date changed for base:', baseId, date);
    // 여기에 종료날짜 변경 로직 추가
  };

  useEffect(() => {
    getBases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedConvert(null);
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(0);
    setSearchKeyword('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  useEffect(() => {
    setFilteredBases(bases);
  }, [bases]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {isLoading && <LoadingOverlay />}

      <div style={{ pointerEvents: isLoading ? 'none' : 'auto' }} className='table-outer'>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: handleSearch,
              color: 'success',
            },
            {
              text: '초기화',
              onClick: handleReset,
              color: 'inherit',
              variant: 'outlined',
            },
          ]}
        >
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>기초코드명</div>
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    size='small'
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder='기초코드명을 입력하세요'
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>생성 날짜</div>
                </Grid>
                <Grid item xs={9}>
                  <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </SearchBox>

        <div className='table-wrap'>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '50px' }}></TableCell>
                  <TableCell sx={{ width: '200px' }}>기초코드명</TableCell>
                  <TableCell sx={{ width: '100px' }}>센서 개수</TableCell>
                  <TableCell sx={{ width: '150px' }}>생성 일자</TableCell>
                  <TableCell sx={{ width: '160px' }}>시작 날짜</TableCell>
                  <TableCell sx={{ width: '160px' }}>종료 날짜</TableCell>
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
                      onEditClick={handleEditClick}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                      totalCount={filteredBases.length}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination count={filteredBases ? filteredBases.length : 0} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}

const cells = ['기초코드명', '센서 개수', '생성 일자', '시작 날짜', '종료 날짜'];
