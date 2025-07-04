import React, { useEffect, useState } from 'react';
import { getBasesAPI, insertBaseAPI } from '../../apis/api/convert';
import { Dayjs } from 'dayjs';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import Grid from '@mui/system/Grid';
import BasicDatePicker from '../../components/datepicker';
import Pagination from '../../components/pagination';
import { usePagination } from '../../hooks/usePagination';
import Paper from '@mui/material/Paper';
import ConvertTableRow from '../../components/tableRow/ConvertTableRow';
import { useRecoilValue } from 'recoil';
import { userState, navigationResetState } from '../../recoil/atoms';
import LoadingOverlay from '../../components/loading/LodingOverlay';
import { SearchBox, ActionBox, SortableTableHeader } from '../../components/common';
import AlertModal from '../../components/modal/alert';
import ProgressOverlay from '../../components/loading/ProgressOverlay';
import { useSortableData, SortableColumn } from '../../hooks/useSortableData';

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
  const [baseDates, setBaseDates] = useState<{
    [key: number]: { startDate: Dayjs | null; endDate: Dayjs | null };
  }>({});
  const userIdx = useRecoilValue(userState)?.user_idx;
  const navigationReset = useRecoilValue(navigationResetState);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertContent, setAlertContent] = useState('');
  const [alertType, setAlertType] = useState<'alert' | 'confirm'>('alert');

  // 정렬 기능
  const {
    sortedData: sortedBases,
    sortField,
    sortDirection,
    handleSort,
  } = useSortableData<Base>(filteredBases, 'createdAt', 'desc');

  // 정렬 컬럼 정의
  const sortableColumns: SortableColumn<Base>[] = [
    { field: 'ab_name', label: '기초코드명' },
    { field: 'sn_length', label: '센서 개수' },
    { field: 'createdAt', label: '생성 일자' },
  ];

  const { currentPage, rowsPerPage, paginatedData, goToPage, handleRowsPerPageChange } = usePagination(
    sortedBases?.length || 0
  );

  const pagedData = paginatedData(sortedBases || []);

  const [progress, setProgress] = useState(0);
  const [progressOpen, setProgressOpen] = useState(false);

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
    goToPage(0);
  };

  const handleReset = () => {
    setSearchKeyword('');
    setStartDate(null);
    setEndDate(null);
    setFilteredBases(bases);
    goToPage(0);
  };

  const handleStartDateChange = (baseId: number, date: Dayjs | null) => {
    setBaseDates((prev) => ({
      ...prev,
      [baseId]: {
        ...prev[baseId],
        startDate: date,
      },
    }));
  };

  const handleEndDateChange = (baseId: number, date: Dayjs | null) => {
    setBaseDates((prev) => ({
      ...prev,
      [baseId]: {
        ...prev[baseId],
        endDate: date,
      },
    }));
  };

  const handleDatePickerOpen = (baseId: number) => {
    if (selectedConvert !== baseId) {
      setBaseDates((prev) => {
        const newDates = { ...prev };
        if (selectedConvert && newDates[selectedConvert]) {
          delete newDates[selectedConvert];
        }
        return newDates;
      });
    }
    setSelectedConvert(baseId);
  };

  // 파일 크기 추정 함수 (센서 개수와 기간을 기반으로)
  const estimateFileSize = (sensorCount: number, startDate: Dayjs, endDate: Dayjs) => {
    const daysDiff = endDate.diff(startDate, 'day') + 1;
    const hoursPerDay = 24;
    const dataPointsPerHour = 60; // 1분마다 데이터
    const bytesPerDataPoint = 100; // 예상 데이터 포인트 크기

    const totalDataPoints = sensorCount * daysDiff * hoursPerDay * dataPointsPerHour;
    const estimatedSizeBytes = totalDataPoints * bytesPerDataPoint;

    return estimatedSizeBytes;
  };

  // 실제 변환 실행 함수
  const executeConvert = async () => {
    setProgressOpen(true);
    setProgress(10);
    try {
      setProgress(30);
      const selectedBaseDates = baseDates[selectedConvert!];
      const formattedStartDate = selectedBaseDates.startDate!.format('YYMMDD');
      const formattedEndDate = selectedBaseDates.endDate!.format('YYMMDD');
      setProgress(60);
      const data = await insertBaseAPI(formattedStartDate, formattedEndDate, selectedConvert!, userIdx);
      setProgress(90);
      if (data) {
        setAlertTitle('알림');
        setAlertContent('성공적으로 json파일을 생성하였습니다.\n파일 위치: /files/front');
        setAlertType('alert');
        setAlertOpen(true);
        setSelectedConvert(null);
        setBaseDates({});
      }
      setProgress(100);
      setProgressOpen(false);
    } catch (error) {
      setProgressOpen(false);
      console.error('변환 오류:', error);
      let errorMessage = '파일 생성 중 오류가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as Record<string, any>;
        if ('message' in errorObj) {
          errorMessage = String(errorObj.message);
        } else if (
          'response' in errorObj &&
          errorObj.response &&
          typeof errorObj.response === 'object' &&
          errorObj.response !== null
        ) {
          const response = errorObj.response as Record<string, any>;
          if ('data' in response) {
            errorMessage = String(response.data);
          }
        }
      }
      setAlertTitle('에러');
      setAlertContent(errorMessage);
      setAlertType('alert');
      setAlertOpen(true);
    }
  };

  const handleConvert = async () => {
    if (!selectedConvert) {
      setAlertTitle('알림');
      setAlertContent('변환할 기초코드를 선택해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }
    const selectedBaseDates = baseDates[selectedConvert];
    if (!selectedBaseDates || !selectedBaseDates.startDate || !selectedBaseDates.endDate) {
      setAlertTitle('알림');
      setAlertContent('시작날짜와 종료날짜를 모두 선택해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    // 파일 크기 추정
    const selectedBase = bases.find((base) => base.ab_idx === selectedConvert);
    if (selectedBase) {
      const estimatedSizeBytes = estimateFileSize(
        selectedBase.sn_length,
        selectedBaseDates.startDate,
        selectedBaseDates.endDate
      );
      const estimatedSizeMB = estimatedSizeBytes / (1024 * 1024);

      // 50MB 초과 시 확인 알림
      if (estimatedSizeMB > 50) {
        setAlertTitle('AASX 파일 변환');
        setAlertContent(
          '생성되는 파일의 크기가 50MB를 초과할 경우, AASX 파일 변환에 다소 시간이 소요될 수 있습니다.\n변환하시겠습니까?'
        );
        setAlertType('confirm');
        setAlertOpen(true);
        return;
      }
    }

    // 바로 변환 실행
    await executeConvert();
  };

  const handleCheckboxChange = (convertsIdx: number) => {
    if (selectedConvert !== convertsIdx) {
      setBaseDates((prev) => {
        const newDates = { ...prev };
        if (selectedConvert && newDates[selectedConvert]) {
          delete newDates[selectedConvert];
        }
        return newDates;
      });
    }
    setSelectedConvert((prev) => (prev === convertsIdx ? null : convertsIdx));
  };

  const handleNavigationReset = () => {
    setSelectedConvert(null);
    setStartDate(null);
    setEndDate(null);
    goToPage(0);
    setSearchKeyword('');
    setBaseDates({});
  };

  useEffect(() => {
    handleNavigationReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  useEffect(() => {
    getBases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilteredBases(bases);
  }, [bases]);

  return (
    <>
      <ProgressOverlay open={progressOpen} progress={progress} label='변환 중...' />
      <div className='position-relative height-100'>
        <div className={`table-outer ${isLoading ? 'pointer-events-none' : 'pointer-events-auto'}`}>
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
            <Grid container spacing={4}>
              {/* 기초코드명 */}
              <Grid container spacing={2}>
                <Grid className='sort-title'>
                  <div>기초코드명</div>
                </Grid>
                <Grid>
                  <TextField
                    size='small'
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Grid>
              </Grid>
              {/* 기초코드명 */}

              {/* 생성 날짜 */}
              <Grid container spacing={2}>
                <Grid className='sort-title'>
                  <div>생성일</div>
                </Grid>
                <Grid>
                  <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
                </Grid>
              </Grid>
              {/* 생성 날짜 */}
            </Grid>
          </SearchBox>

          <ActionBox
            buttons={[
              {
                text: '변환',
                onClick: handleConvert,
                color: 'success',
              },
            ]}
          />

          <div className='table-wrap'>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '50px' }}></TableCell>
                    <SortableTableHeader
                      columns={sortableColumns}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <TableCell>시작일</TableCell>
                    <TableCell>종료일</TableCell>
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
                        onStartDateChange={handleStartDateChange}
                        onEndDateChange={handleEndDateChange}
                        totalCount={filteredBases.length}
                        startDate={baseDates[base.ab_idx]?.startDate || null}
                        endDate={baseDates[base.ab_idx]?.endDate || null}
                        onDatePickerOpen={handleDatePickerOpen}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={sortableColumns.length + 1} align='center'>
                        데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination
              count={filteredBases ? filteredBases.length : 0}
              page={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={(event, page) => goToPage(page)}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>
        </div>

        <AlertModal
          open={alertOpen}
          handleClose={() => setAlertOpen(false)}
          title={alertTitle}
          content={alertContent}
          type={alertType}
          onConfirm={alertType === 'confirm' ? executeConvert : undefined}
        />
      </div>
    </>
  );
}
