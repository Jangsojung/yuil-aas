import React, { ChangeEvent, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import dayjs, { Dayjs } from 'dayjs';
import BasicDatePicker from '../../components/datepicker';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Pagination from '../../components/pagination';
import { deleteAASXAPI, getFilesAPI } from '../../apis/api/aasx_manage';
import { usePagination } from '../../hooks/usePagination';
import AASXTableRow from '../../components/tableRow/AASXTableRow';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { SearchBox, ActionBox, SortableTableHeader } from '../../components/common';
import AlertModal from '../../components/modal/alert';
import { useSortableData, SortableColumn } from '../../hooks/useSortableData';

interface File {
  af_idx: number;
  af_name: string;
  createdAt: string;
  updatedAt?: string;
}

interface AASXFile {
  af_idx: number;
  af_name: string;
  createdAt: Date;
}

interface AASXListProps {
  onEditClick: (file: AASXFile) => void;
  onAddClick: () => void;
}

export default forwardRef(function AASXList({ onEditClick, onAddClick }: AASXListProps, ref) {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigationReset = useRecoilValue(navigationResetState);

  // refresh 메서드를 ref로 노출
  useImperativeHandle(ref, () => ({
    refresh: () => {
      getFiles();
    },
  }));

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
    { field: 'createdAt', label: '생성 일자' },
    { field: 'updatedAt', label: '수정 일자' },
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
          await deleteAASXAPI(selectedFiles);

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

    const data: File[] = await getFilesAPI(startDateStr, endDateStr, 3);
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

  const handleDoubleClick = (file: File) => {
    const aasxFile: AASXFile = {
      af_idx: file.af_idx,
      af_name: file.af_name,
      createdAt: new Date(file.createdAt),
    };
    onEditClick(aasxFile);
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  const handleNavigationReset = () => {
    setSelectedFiles([]);
    setSelectAll(false);
    goToPage(0);
    handleReset();
  };

  useEffect(() => {
    handleNavigationReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setSelectAll(false);
    } else if (selectedFiles.length === files.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedFiles, files]);

  // getFiles를 ref로 노출
  useImperativeHandle(ref, () => ({
    refresh: getFiles,
  }));

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
        <Grid container spacing={1} className='flex-center-gap-lg'>
          <Grid item>
            <Grid container spacing={1}>
              <Grid item className='d-flex gap-5'>
                <div className='sort-title'>생성일</div>
              </Grid>
              <Grid item>
                <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </SearchBox>

      <ActionBox
        buttons={[
          {
            text: '파일등록',
            onClick: onAddClick,
            color: 'success',
          },
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
                <TableCell>수정</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((file, idx) => (
                  <AASXTableRow
                    file={file}
                    key={idx}
                    onCheckboxChange={handleCheckboxChange}
                    checked={selectedFiles.includes(file.af_idx)}
                    onEditClick={handleDoubleClick}
                    totalCount={files.length}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={sortableColumns.length + 2} align='center'>
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
});
