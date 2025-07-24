import React, { useEffect, useState } from 'react';
import { getBasesAPI, insertJSONAPI, getBaseFCIdxAPI } from '../../apis/api/convert';
import Typography from '@mui/material/Typography';
import { Dayjs } from 'dayjs';
import {
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import Grid from '@mui/system/Grid';
import BasicDatePicker from '../../components/datepicker';
import Pagination from '../../components/pagination';
import { useTablePagination } from '../../hooks/useTablePagination';
import Paper from '@mui/material/Paper';
import ConvertTableRow from '../../components/tableRow/ConvertTableRow';
import { useRecoilValue } from 'recoil';
import { userState, navigationResetState } from '../../recoil/atoms';
import { SearchBox, ActionBox, SortableTableHeader, TableEmptyRow } from '../../components/common';
import AlertModal from '../../components/modal/alert';
import ProgressOverlay from '../../components/loading/ProgressOverlay';
import { useSortableData, SortableColumn } from '../../hooks/useSortableData';
import FactorySelect from '../../components/select/factory_select';
import { Base, AlertModalState } from '../../types';
import { KINDS } from '../../constants';

export default function ConvertPage() {
  const [isLoading] = useState(false);
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
  const [selectedFactory, setSelectedFactory] = useState<number | ''>('');

  const [alertModal, setAlertModal] = useState<AlertModalState>({
    open: false,
    title: '',
    content: '',
    type: 'alert',
    onConfirm: undefined,
  });

  const { sortedData: sortedBases, sortField, sortDirection, handleSort, resetSort } = useSortableData<Base>(filteredBases, 'createdAt', 'desc');

  const sortableColumns: SortableColumn<Base>[] = [
    { field: 'fc_name', label: '공장명', maxWidth: 180 },
    { field: 'ab_name', label: '기초코드명', maxWidth: 440.78 },
    { field: 'sn_length', label: '센서 개수', maxWidth: 180 },
    { field: 'createdAt', label: '생성 일자', maxWidth: 250 },
    // 필요시 비고 등 추가
  ];

  const { currentPage, rowsPerPage, handlePageChange, handleRowsPerPageChange, paginatedData } = useTablePagination({
    totalCount: sortedBases?.length || 0,
  });

  const [progress, setProgress] = useState(0);
  const [progressOpen, setProgressOpen] = useState(false);

  const handleDateChange = (newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleSearch = async () => {
    if ((startDate && !endDate) || (!startDate && endDate) || (startDate && endDate && startDate > endDate)) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '올바른 시작, 종료일을 선택해주세요.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    if (!selectedFactory) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '공장을 선택해주세요.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    try {
      const data = await getBasesAPI(selectedFactory);
      const fetchedBases = Array.isArray(data) ? data : [];
      setBases(fetchedBases);

      let filtered = fetchedBases;

      if (searchKeyword.trim()) {
        filtered = filtered.filter(
          (base) => base.ab_name && base.ab_name.toLowerCase().includes(searchKeyword.toLowerCase())
        );
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
      handlePageChange(null, 0);
    } catch (error) {
      setBases([]);
      setFilteredBases([]);
    }
  };

  const handleReset = () => {
    setSearchKeyword('');
    setStartDate(null);
    setEndDate(null);
    setSelectedFactory('');
    setFilteredBases(bases);
    resetSort();
  };

  const handleFactoryChange = (factoryId: number) => {
    setSelectedFactory(factoryId);
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

  const estimateFileSize = (sensorCount: number, startDate: Dayjs, endDate: Dayjs) => {
    const daysDiff = endDate.diff(startDate, 'day') + 1;
    const hoursPerDay = 24;
    const dataPointsPerHour = 60;
    const bytesPerDataPoint = 100;

    const totalDataPoints = sensorCount * daysDiff * hoursPerDay * dataPointsPerHour;
    const estimatedSizeBytes = totalDataPoints * bytesPerDataPoint;

    return estimatedSizeBytes;
  };

  const executeConvert = async () => {
    if (!selectedConvert || userIdx === undefined || userIdx === null) {
      return;
    }

    const selectedBaseDates = baseDates[selectedConvert];
    if (!selectedBaseDates?.startDate || !selectedBaseDates?.endDate) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '시작날짜와 종료날짜를 모두 선택해주세요.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    setProgressOpen(true);
    setProgress(0);

    try {
      const startDateStr = selectedBaseDates.startDate.format('YYYY-MM-DD');
      const endDateStr = selectedBaseDates.endDate.format('YYYY-MM-DD');

      // 변환 API 호출
      const baseFCIdx = await getBaseFCIdxAPI(selectedConvert);
      const result = await insertJSONAPI({
        ab_idx: selectedConvert,
        startDate: startDateStr,
        endDate: endDateStr,
        user_idx: userIdx,
        fc_idx: baseFCIdx,
        af_kind: KINDS.JSON_KIND,
      });

      setProgress(100);
      setTimeout(() => {
        setProgressOpen(false);
        setProgress(0);
      }, 100);

      if (result && result.success === false) {
        setAlertModal({
          open: true,
          title: '오류',
          content: result.error || 'JSON 파일 변환 중 오류가 발생했습니다.',
          type: 'alert',
          onConfirm: undefined,
        });
        return;
      }

      if (result) {
        setAlertModal({
          open: true,
          title: '성공',
          content: 'JSON 파일 변환이 완료되었습니다.',
          type: 'alert',
          onConfirm: undefined,
        });
      } else {
        setAlertModal({
          open: true,
          title: '오류',
          content: 'JSON 파일 변환 중 오류가 발생했습니다.',
          type: 'alert',
          onConfirm: undefined,
        });
      }
    } catch (error) {
      setProgressOpen(false);
      setProgress(0);
      let errorMessage = 'JSON 파일 변환 중 오류가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      setAlertModal({
        open: true,
        title: '오류',
        content: errorMessage,
        type: 'alert',
        onConfirm: undefined,
      });
    }
  };

  const handleConvert = async () => {
    if (!selectedConvert) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '변환할 기초코드를 선택해주세요.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    const selectedBaseDates = baseDates[selectedConvert];

    if (!selectedBaseDates?.startDate || !selectedBaseDates?.endDate) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '시작날짜와 종료날짜를 모두 선택해주세요.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    const selectedBase = bases.find((base) => base.ab_idx === selectedConvert);
    if (selectedBase) {
      const estimatedSizeBytes = estimateFileSize(
        selectedBase.sn_length,
        selectedBaseDates.startDate,
        selectedBaseDates.endDate
      );
      const estimatedSizeMB = estimatedSizeBytes / (1024 * 1024);

      if (estimatedSizeMB > 50) {
        setAlertModal({
          open: true,
          title: 'JSON 파일 변환',
          content:
            '생성되는 파일의 크기가 50MB를 초과할 경우, JSON 파일 변환에 다소 시간이 소요될 수 있습니다.\n변환하시겠습니까?',
          type: 'confirm',
          onConfirm: executeConvert,
        });
        return;
      }
    }

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
    handleReset();
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    handleNavigationReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  return (
    <>
      <ProgressOverlay open={progressOpen} progress={progress} label='변환 중...' />
      <div className={`table-outer ${isLoading ? 'pointer-events-none' : 'pointer-events-auto'}`}>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: handleSearch,
              color: 'primary',
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
            {/* 공장 선택 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>공장</div>
              </Grid>
              <Grid sx={{ flexGrow: 1 }}>
                <FormControl sx={{ width: '100%' }} size='small'>
                  <FactorySelect
                    value={selectedFactory}
                    onChange={handleFactoryChange}
                    placeholder='선택'
                    showAllOption={true}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {/* 공장 선택 */}

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

        <div className='list-header'>
          <Typography variant='h6' gutterBottom>
            기초코드 목록
          </Typography>

          <ActionBox
            buttons={[
              {
                text: '변환',
                onClick: handleConvert,
                color: 'primary',
              },
            ]}
          />
        </div>

        <div className='table-wrap'>
          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
            <Table sx={{ minWidth: 650, tableLayout: 'fixed' }} aria-label='simple table'>
              <colgroup>
                <col style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }} />
                <col style={{ maxWidth: '180px' }} />
                <col style={{ maxWidth: '440.78px' }} />
                <col style={{ maxWidth: '180px' }} />
                <col style={{ maxWidth: '250px' }} />
                <col style={{ maxWidth: '250px' }} />
                <col style={{ maxWidth: '250px' }} />
              </colgroup>
              <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <TableRow>
                  <TableCell sx={{ width: '50px', backgroundColor: 'white' }}></TableCell>
                  <SortableTableHeader
                    columns={sortableColumns}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                  <TableCell sx={{ backgroundColor: 'white' }}>시작일</TableCell>
                  <TableCell sx={{ backgroundColor: 'white' }}>종료일</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData(sortedBases || []).length > 0 ? (
                  paginatedData(sortedBases || []).map((base: Base, idx: number) => (
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
                  <TableEmptyRow colSpan={sortableColumns.length + 3} />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Pagination
            count={filteredBases ? filteredBases.length : 0}
            page={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>
      </div>

      <AlertModal
        open={alertModal.open}
        handleClose={handleCloseAlert}
        title={alertModal.title}
        content={alertModal.content}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </>
  );
}
