import React, { ChangeEvent, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
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
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../../recoil/atoms';
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

interface JSONListProps {
  onDetailClick?: (fileId: number) => void;
  searchCondition: {
    selectedFactory: number | '';
    startDate: any;
    endDate: any;
  };
  setSearchCondition: React.Dispatch<
    React.SetStateAction<{
      selectedFactory: number | '';
      startDate: any;
      endDate: any;
    }>
  >;
  isSearchActive: boolean;
  setIsSearchActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const JSONList = forwardRef<{ refresh: () => void }, JSONListProps>(function JSONList(
  { onDetailClick, searchCondition, setSearchCondition, isSearchActive, setIsSearchActive },
  ref
) {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });
  const [startDate, setStartDate] = useState<any>(searchCondition.startDate);
  const [endDate, setEndDate] = useState<any>(searchCondition.endDate);
  const [selectedFactory, setSelectedFactory] = useState<number | ''>(searchCondition.selectedFactory);
  const navigate = useNavigate();
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  // 정렬 기능
  const {
    sortedData: sortedFiles,
    sortField,
    sortDirection,
    handleSort,
    resetSort,
  } = useSortableData<File>(files, 'createdAt', 'desc');

  // 정렬 컬럼 정의
  const sortableColumns: SortableColumn<File>[] = [
    { field: 'fc_name', label: '공장명', maxWidth: 180 },
    { field: 'af_name', label: '파일명', maxWidth: 760.78 },
    { field: 'base_name', label: '기초코드명', maxWidth: 180 },
    { field: 'sn_length', label: '센서 개수', maxWidth: 180 },
    { field: 'createdAt', label: '생성 일자', maxWidth: 250 },
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
          const result = await deleteJSONAPI(selectedFiles);
          if (result && result.success === false) {
            setAlertModal({
              open: true,
              title: '오류',
              content: result.error || '파일 삭제 중 오류가 발생했습니다.',
              type: 'alert',
              onConfirm: undefined,
            });
            return;
          }
          setSelectedFiles([]);
          getFiles();
        } catch (error) {
          setAlertModal({
            open: true,
            title: '오류',
            content: '파일 삭제 중 오류가 발생했습니다.',
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

  const handleReset = () => {
    setSelectedFiles([]);
    setStartDate(null);
    setEndDate(null);
    setSelectedFactory('');
    setFiles([]);
    setSelectAll(false);
    resetSort();
  };

  const getFiles = useCallback(
    async (start = startDate, end = endDate) => {
      const startDateStr = start ? dayjs(start).format('YYYY-MM-DD') : '';
      const endDateStr = end ? dayjs(end).format('YYYY-MM-DD') : '';

      const data = await getJSONFilesAPI(startDateStr, endDateStr, selectedFactory);
      if (!Array.isArray(data) && (data as any)?.success === false) {
        setAlertModal({
          open: true,
          title: '오류',
          content: (data as any)?.error || '파일 목록 조회 중 오류가 발생했습니다.',
          type: 'alert',
          onConfirm: undefined,
        });
        setFiles([]);
        setIsSearchActive(false);
        return;
      }
      setFiles(Array.isArray(data) ? data : []);
      setIsSearchActive(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startDate, endDate, selectedFactory]
  );

  // 검색 버튼 클릭 시
  const handleSearch = useCallback(() => {
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

    getFiles();
    setIsSearchActive(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedFactory, getFiles]);

  // 목록 페이지가 마운트될 때 isSearchActive가 true면 자동 검색 실행
  useEffect(() => {
    if (isSearchActive) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setSelectedFiles([]);
    setSelectAll(false);
    setStartDate(null);
    setEndDate(null);
    setSelectedFactory('');
    setFiles([]);
    setIsSearchActive(false);
  };

  // 검색 조건이 바뀌면 부모에도 반영
  useEffect(() => {
    setSearchCondition({
      selectedFactory,
      startDate,
      endDate,
    });
  }, [selectedFactory, startDate, endDate, setSearchCondition]);

  useEffect(() => {
    setStartDate(null);
    setEndDate(null);
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

  useEffect(() => {
    handleNavigationReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  // refresh 메서드를 ref로 노출
  useImperativeHandle(ref, () => ({
    refresh: () => {
      getFiles();
    },
    handleReset: handleReset,
  }));

  const handleRowClick = (af_idx: number) => {
    if (onDetailClick) {
      onDetailClick(af_idx);
    } else {
      navigate(`/data/jsonManager/detail/${af_idx}`);
    }
  };

  useEffect(() => {
    setStartDate(searchCondition.startDate);
    setEndDate(searchCondition.endDate);
    setSelectedFactory(searchCondition.selectedFactory);
  }, [searchCondition]);

  return (
    <div className='table-outer'>
      <SearchBox
        buttons={[
          {
            text: '검색',
            onClick: handleSearch,
            color: 'primary',
            variant: 'contained',
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
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <Table sx={{ minWidth: 650, tableLayout: 'fixed' }} aria-label='simple table'>
            <colgroup>
              <col style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }} />
              <col style={{ maxWidth: '180px' }} />
              <col style={{ maxWidth: '760.78px' }} />
              <col style={{ maxWidth: '180px' }} />
              <col style={{ maxWidth: '180px' }} />
              <col style={{ maxWidth: '250px' }} />
            </colgroup>
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
});

export default JSONList;
