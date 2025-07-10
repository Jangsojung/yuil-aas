import React, { ChangeEvent, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import { Table, TableBody, TableContainer, TableHead, TableRow, TableCell, Checkbox } from '@mui/material';
import Grid from '@mui/system/Grid';
import Pagination from '../../../components/pagination';
import JSONTableRow from '../../../components/tableRow/JSONTableRow';
import { SearchBox, ActionBox, SortableTableHeader, TableEmptyRow } from '../../../components/common';
import AlertModal from '../../../components/modal/alert';
import { usePagination } from '../../../hooks/usePagination';
import { useSortableData, SortableColumn } from '../../../hooks/useSortableData';
import FactorySelect from '../../../components/select/factory_select';
import { getJSONFilesAPI, deleteJSONAPI } from '../../../apis/api/json_manage';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../../recoil/atoms';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import BasicDatePicker from '../../../components/datepicker';
import FormControl from '@mui/material/FormControl';

interface File {
  af_idx: number;
  af_name: string;
  createdAt: string;
  base_name?: string;
  sn_length?: number;
  fc_idx?: number;
  fc_name?: string;
}

export default function JSONList() {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<number | ''>('');
  const navigationReset = useRecoilValue(navigationResetState);
  const navigate = useNavigate();
  const location = useLocation();

  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });

  // 정렬 기능
  const {
    sortedData: sortedFiles,
    sortField,
    sortDirection,
    handleSort,
  } = useSortableData<File>(files, 'createdAt', 'desc');

  // 정렬 컬럼 정의
  const sortableColumns: SortableColumn<File>[] = [
    { field: 'fc_name', label: '공장명' },
    { field: 'af_name', label: '파일명' },
    { field: 'base_name', label: '기초코드명' },
    { field: 'sn_length', label: '센서 개수' },
    { field: 'createdAt', label: '생성 일자' },
  ];

  const { currentPage, rowsPerPage, paginatedData, goToPage, handleRowsPerPageChange } = usePagination(
    sortedFiles?.length || 0
  );

  const pagedData = paginatedData(sortedFiles || []);

  const handleDelete = async () => {
    if (selectedFiles.length === 0) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '삭제할 파일을 선택해주세요.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    setAlertModal({
      open: true,
      title: '파일 삭제',
      content: `선택한 ${selectedFiles.length}개의 파일을 삭제하시겠습니까?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          await deleteJSONAPI(selectedFiles);

          setAlertModal({
            open: true,
            title: '알림',
            content: '선택한 항목이 삭제되었습니다.',
            type: 'alert',
            onConfirm: undefined,
          });

          setSelectedFiles([]);
          getFiles();
        } catch (error) {
          setAlertModal({
            open: true,
            title: '오류',
            content: '삭제 중 오류가 발생했습니다.',
            type: 'alert',
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handleDateChange = (newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleFactoryChange = (factoryId: number) => {
    setSelectedFactory(factoryId);
    setSelectedFiles([]);
    // 공장 변경 시 파일 목록은 그대로 유지 (검색 버튼을 눌러야만 새로 조회)
  };

  const handleSearch = () => {
    if (!startDate || !endDate || startDate > endDate) {
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

    getFiles();
  };

  const handleReset = () => {
    const defaultStart = dayjs().subtract(1, 'month');
    const defaultEnd = dayjs();
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setSelectedFactory('');
    setSelectedFiles([]);
    setFiles([]); // 파일 목록 초기화
  };

  const getFiles = async (start = startDate, end = endDate) => {
    const startDateStr = start ? dayjs(start).format('YYYY-MM-DD') : '';
    const endDateStr = end ? dayjs(end).format('YYYY-MM-DD') : '';

    const data: File[] = await getJSONFilesAPI(startDateStr, endDateStr, selectedFactory);
    setFiles(Array.isArray(data) ? data : []);
  };

  const handleSelectAllChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      if (files && files.length > 0) {
        setSelectedFiles(files.map((file) => file.af_idx));
      }
    } else {
      setSelectedFiles([]);
    }
  };

  const handleCheckboxChange = (fileIdx: number) => {
    setSelectedFiles((prevSelected) => {
      const prevArray = Array.isArray(prevSelected) ? prevSelected : [];
      if (prevArray.includes(fileIdx)) {
        return prevArray.filter((idx) => idx !== fileIdx);
      } else {
        return [...prevArray, fileIdx];
      }
    });
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  const handleNavigationReset = () => {
    handleReset();
  };

  useEffect(() => {
    if (navigationReset) {
      handleNavigationReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  useEffect(() => {
    const defaultStart = dayjs().subtract(1, 'month');
    const defaultEnd = dayjs();
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // location.state에서 alert 정보 확인
  useEffect(() => {
    if (location.state?.showAlert) {
      setAlertModal({
        open: true,
        title: location.state.alertTitle || '알림',
        content: location.state.alertContent || '',
        type: 'alert',
        onConfirm: undefined,
      });
      // state 초기화
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (files && files.length > 0) {
      const allSelected = files.every((file) => selectedFiles.includes(file.af_idx));
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedFiles, files]);

  const handleRowClick = (af_idx: number) => {
    navigate(`/data/jsonManager/detail/${af_idx}`);
  };

  return (
    <div className='table-outer'>
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
          <Grid container spacing={2}>
            <Grid className='sort-title'>
              <div>공장</div>
            </Grid>
            <Grid sx={{ flexGrow: 1 }}>
              <FormControl sx={{ minWidth: '200px', width: '100%' }} size='small'>
                <FactorySelect
                  value={selectedFactory}
                  onChange={handleFactoryChange}
                  placeholder='선택'
                  showAllOption={true}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid>
            <Grid container spacing={2}>
              <Grid className='d-flex gap-5'>
                <div className='sort-title'>생성일</div>
              </Grid>
              <Grid>
                <BasicDatePicker startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </SearchBox>

      <ActionBox
        buttons={[
          {
            text: '파일삭제',
            onClick: handleDelete,
            color: 'error',
          },
        ]}
      />

      <div className='table-wrap'>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell padding='checkbox'>
                  <Checkbox
                    indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    inputProps={{ 'aria-label': 'select all files' }}
                  />
                </TableCell>
                <SortableTableHeader
                  columns={sortableColumns}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData?.map((file, idx) => (
                  <JSONTableRow
                    file={file}
                    key={idx}
                    onCheckboxChange={handleCheckboxChange}
                    checked={selectedFiles.includes(file.af_idx)}
                    totalCount={files.length}
                    onRowClick={handleRowClick}
                  />
                ))
              ) : (
                <TableEmptyRow colSpan={sortableColumns.length + 1} />
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          count={files ? files.length : 0}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, page) => goToPage(page)}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>

      <AlertModal
        open={alertModal.open}
        handleClose={handleCloseAlert}
        title={alertModal.title}
        content={alertModal.content}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </div>
  );
}
