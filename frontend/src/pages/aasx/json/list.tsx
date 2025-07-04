import React, { ChangeEvent, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import dayjs, { Dayjs } from 'dayjs';
import BasicDatePicker from '../../../components/datepicker';
import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Pagination from '../../../components/pagination';
import { usePagination } from '../../../hooks/usePagination';
import { deleteJSONAPI, getJSONFilesAPI } from '../../../apis/api/json_manage';
import JSONTableRow from '../../../components/tableRow/JSONTableRow';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../../recoil/atoms';
import { SearchBox, ActionBox, SortableTableHeader } from '../../../components/common';
import AlertModal from '../../../components/modal/alert';
import { useNavigate } from 'react-router-dom';
import { useSortableData, SortableColumn } from '../../../hooks/useSortableData';

interface File {
  af_idx: number;
  af_name: string;
  createdAt: string;
  base_name?: string;
  sensor_count?: number;
}

export default function JSONList() {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigationReset = useRecoilValue(navigationResetState);
  const navigate = useNavigate();

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
    { field: 'af_name', label: '파일명' },
    { field: 'base_name', label: '기초코드명' },
    { field: 'sensor_count', label: '센서 개수' },
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

  const handleSearch = () => {
    if (!startDate || !endDate) {
      alert('날짜를 선택해주세요.');
      return;
    }

    getFiles();
  };

  const handleReset = () => {
    const defaultStart = dayjs().subtract(1, 'month');
    const defaultEnd = dayjs();
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setSelectedFiles([]);
    getFiles(defaultStart, defaultEnd);
  };

  const getFiles = async (start = startDate, end = endDate) => {
    const startDateStr = start ? dayjs(start).format('YYYY-MM-DD') : '';
    const endDateStr = end ? dayjs(end).format('YYYY-MM-DD') : '';

    const data: File[] = await getJSONFilesAPI(startDateStr, endDateStr);
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
    getFiles(defaultStart, defaultEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (files && files.length > 0) {
      const allSelected = files.every((file) => selectedFiles.includes(file.af_idx));
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedFiles, files]);

  const handleRowClick = (af_idx: number) => {
    navigate(`/aasx/json/detail/${af_idx}`);
  };

  return (
    <div className='table-outer'>
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
          <Grid item xs={6}>
            <BasicDatePicker startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />
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
                <SortableTableHeader
                  columns={sortableColumns}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  showCheckbox={true}
                  onSelectAllChange={handleSelectAllChange}
                  selectAll={selectAll}
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

const cells = ['파일명', '기초코드명', '센서 개수', '생성 일자'];
