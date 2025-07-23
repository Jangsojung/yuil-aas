import React, { ChangeEvent, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Grid from '@mui/system/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import dayjs, { Dayjs } from 'dayjs';
import BasicDatePicker from '../../../components/datepicker';
import { FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox } from '@mui/material';
import Pagination from '../../../components/pagination';
import { deleteAASXAPI, getFilesAPI } from '../../../apis/api/aasx_manage';
import { useTablePagination } from '../../../hooks/useTablePagination';
import AASXTableRow from '../../../components/tableRow/AASXTableRow';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../../recoil/atoms';
import { SearchBox, ActionBox, SortableTableHeader, TableEmptyRow } from '../../../components/common';
import AlertModal from '../../../components/modal/alert';
import { useSortableData, SortableColumn } from '../../../hooks/useSortableData';
import FactorySelect from '../../../components/select/factory_select';
import { AASXFile, AlertModalState } from '../../../types';
import { KINDS } from '../../../constants';

interface File {
  af_idx: number;
  af_name: string;
  createdAt: string;
  updatedAt?: string;
  fc_idx?: number;
  fc_name?: string;
  link_name?: string;
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
    handleReset: handleReset,
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
    setStartDate(null);
    setEndDate(null);
    setSelectedFactory('');
    setSelectedFiles([]);
    setFiles([]); // 파일 목록 초기화
  };

  const getFiles = async (start = startDate, end = endDate) => {
    const startDateStr = start ? dayjs(start).format('YYYY-MM-DD') : '';
    const endDateStr = end ? dayjs(end).format('YYYY-MM-DD') : '';
    const af_kind = KINDS.AASX_KIND;

    const data = await getFilesAPI(startDateStr, endDateStr, selectedFactory, af_kind);
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
      updatedAt: file.updatedAt,
      fc_idx: file.fc_idx,
      fc_name: file.fc_name,
      link_name: file.link_name,
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
    setStartDate(null);
    setEndDate(null);
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
        <Grid container spacing={4} className='flex-center-gap-lg'>
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
          <Grid>
            <Grid container spacing={2}>
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

      <div className='list-header'>
        <Typography variant='h6' gutterBottom>
          AASX 파일 목록
        </Typography>

        <ActionBox
          buttons={[
            {
              text: '파일등록',
              onClick: onAddClick,
              color: 'primary',
            },
            {
              text: '파일삭제',
              onClick: handleDelete,
              color: 'error',
            },
          ]}
        />
      </div>

      <div className='table-wrap'>
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
              <TableRow>
                <TableCell padding='checkbox' sx={{ backgroundColor: 'white' }}>
                  <Checkbox
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
                <TableCell align='center' sx={{ backgroundColor: 'white' }}>
                  수정
                </TableCell>
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
                <TableEmptyRow colSpan={sortableColumns.length + 3} />
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
