import React, { ChangeEvent, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Grid from '@mui/system/Grid';
import Paper from '@mui/material/Paper';
import dayjs, { Dayjs } from 'dayjs';
import BasicDatePicker from '../../components/datepicker';
import { FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox } from '@mui/material';
import Pagination from '../../components/pagination';
import { deleteAASXAPI, getFilesAPI } from '../../apis/api/aasx_manage';
import { useTablePagination } from '../../hooks/useTablePagination';
import AASXTableRow from '../../components/tableRow/AASXTableRow';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { SearchBox, ActionBox, SortableTableHeader, TableEmptyRow } from '../../components/common';
import AlertModal from '../../components/modal/alert';
import { useSortableData, SortableColumn } from '../../hooks/useSortableData';
import FactorySelect from '../../components/select/factory_select';
import { AASXFile, AlertModalState } from '../../types';
import { KINDS } from '../../constants';

interface File {
  af_idx: number;
  af_name: string;
  createdAt: string;
  updatedAt?: string;
  fc_idx?: number;
  fc_name?: string;
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
  const [selectedFactory, setSelectedFactory] = useState<number | ''>('');
  const navigationReset = useRecoilValue(navigationResetState);

  // refresh 메서드를 ref로 노출
  useImperativeHandle(ref, () => ({
    refresh: () => {
      getFiles();
    },
  }));

  const [alertModal, setAlertModal] = useState<AlertModalState>({
    open: false,
    title: '',
    content: '',
    type: 'alert',
    onConfirm: undefined,
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
    { field: 'createdAt', label: '생성 일자' },
    { field: 'updatedAt', label: '수정 일자' },
  ];

  const { currentPage, rowsPerPage, handlePageChange, handleRowsPerPageChange, paginatedData } = useTablePagination({
    totalCount: sortedFiles?.length || 0,
  });

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

  const handleFactoryChange = (factoryId: number) => {
    setSelectedFactory(factoryId);
    setSelectedFiles([]);
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
    const af_kind = KINDS.AASX_KIND;

    const data: File[] = await getFilesAPI(startDateStr, endDateStr, selectedFactory, af_kind);
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
      createdAt: file.createdAt,
    };
    onEditClick(aasxFile);
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  const handleNavigationReset = () => {
    setSelectedFiles([]);
    setSelectAll(false);
    handlePageChange(null, 0);
    // 초기화 시에는 날짜만 설정하고 파일 조회는 하지 않음
    const defaultStart = dayjs().subtract(1, 'month');
    const defaultEnd = dayjs();
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setSelectedFactory('');
    setFiles([]);
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
            <Grid container spacing={1}>
              <Grid className='d-flex gap-5'>
                <div className='sort-title'>생성일</div>
              </Grid>
              <Grid>
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
              {paginatedData(sortedFiles || []).length > 0 ? (
                paginatedData(sortedFiles || []).map((file: File, idx: number) => (
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
                <TableEmptyRow colSpan={sortableColumns.length + 2} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={files ? files.length : 0}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
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
