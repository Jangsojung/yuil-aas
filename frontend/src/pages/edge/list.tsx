import React, { ChangeEvent, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { deleteEdgeAPI, getEdgeAPI, getEdgeWithStatusAPI } from '../../apis/api/edge';
import { Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Pagination from '../../components/pagination';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { ActionBox, SortableTableHeader, TableEmptyRow } from '../../components/common';
import AlertModal from '../../components/modal/alert';
import { useTablePagination } from '../../hooks/useTablePagination';
import EdgeTableRow from '../../components/tableRow/EdgeTableRow';
import LoadingOverlay from '../../components/loading/LodingOverlay';
import { useSortableData, SortableColumn } from '../../hooks/useSortableData';
import { formatDate } from '../../utils/dateUtils';
import { EdgeGateway, AlertModalState } from '../../types';
import { SearchBox } from '../../components/common';
import Grid from '@mui/system/Grid';
import FormControl from '@mui/material/FormControl';
import { TextField } from '@mui/material';
import BasicDatePicker from '../../components/datepicker';
import { Dayjs } from 'dayjs';

interface EdgeListProps {
  onAddClick: () => void;
  onEditClick: (edgeGateway: EdgeGateway) => void;
}

export default forwardRef(function EdgeList({ onAddClick, onEditClick }: EdgeListProps, ref) {
  const [edgeGateways, setEdgeGateways] = useState<EdgeGateway[]>([]);
  const [filteredEdgeGateways, setFilteredEdgeGateways] = useState<EdgeGateway[]>([]);
  const [selectedEdgeGateways, setSelectedEdgeGateways] = useState<number[]>([]);
  const navigationReset = useRecoilValue(navigationResetState);

  // 검색 관련 상태
  const [pcName, setPcName] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const [selectAll, setSelectAll] = useState(false);
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    open: false,
    title: '',
    content: '',
    type: 'alert',
    onConfirm: undefined,
  });

  // 정렬 기능
  const {
    sortedData: sortedEdgeGateways,
    sortField,
    sortDirection,
    handleSort,
  } = useSortableData<EdgeGateway>(filteredEdgeGateways, 'createdAt', 'desc');

  // 정렬 컬럼 정의
  const sortableColumns: SortableColumn<EdgeGateway>[] = [
    { field: 'eg_pc_name', label: 'PC명' },
    { field: 'eg_ip_port', label: 'IP:Port' },
    { field: 'eg_network', label: '네트워크' },
    { field: 'createdAt', label: '생성 일자' },
    { field: 'updatedAt', label: '수정 일자' },
  ];

  const { currentPage, rowsPerPage, handlePageChange, handleRowsPerPageChange, paginatedData } = useTablePagination({
    totalCount: sortedEdgeGateways?.length || 0,
  });

  const [loading, setLoading] = useState(true);

  // 검색 기능
  const handleSearch = () => {
    // 검색 조건에 따라 필터링
    let filteredData = edgeGateways;

    if (pcName.trim()) {
      filteredData = filteredData.filter(
        (edge) => edge.eg_pc_name && edge.eg_pc_name.toLowerCase().includes(pcName.toLowerCase())
      );
    }

    if (ipAddress.trim()) {
      filteredData = filteredData.filter(
        (edge) => edge.eg_ip_port && edge.eg_ip_port.toLowerCase().includes(ipAddress.toLowerCase())
      );
    }

    if (startDate && endDate) {
      filteredData = filteredData.filter((edge) => {
        const createdAt = new Date(edge.createdAt || '');
        const start = startDate.startOf('day').toDate();
        const end = endDate.endOf('day').toDate();
        return createdAt >= start && createdAt <= end;
      });
    }

    setFilteredEdgeGateways(filteredData);
  };

  // 초기화 기능
  const handleReset = () => {
    setPcName('');
    setIpAddress('');
    setStartDate(null);
    setEndDate(null);
    setFilteredEdgeGateways(edgeGateways);
  };

  // 날짜 변경 핸들러
  const handleDateChange = (start: Dayjs | null, end: Dayjs | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleDelete = async () => {
    if (selectedEdgeGateways.length === 0) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '삭제할 Edge Gateway들을 선택해주세요.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    setAlertModal({
      open: true,
      title: '삭제 확인',
      content: `선택한 ${selectedEdgeGateways.length}개 항목을 삭제하시겠습니까?`,
      type: 'confirm',
      onConfirm: async () => {
        const result = await deleteEdgeAPI({ ids: selectedEdgeGateways });
        if (result) {
          setSelectedEdgeGateways([]);
          await getEdgeWithStatus();
        }
      },
    });
  };

  const getEdge = async () => {
    try {
      setLoading(true);
      const data: EdgeGateway[] = await getEdgeAPI();
      setEdgeGateways(Array.isArray(data) ? data : []);
      setFilteredEdgeGateways(Array.isArray(data) ? data : []); // 초기 데이터 설정
    } catch (error) {
      setEdgeGateways([]);
    } finally {
      setLoading(false);
    }
  };

  const getEdgeWithStatus = async () => {
    try {
      setLoading(true);
      const data: EdgeGateway[] = await getEdgeWithStatusAPI();
      setEdgeGateways(Array.isArray(data) ? data : []);
      setFilteredEdgeGateways(Array.isArray(data) ? data : []); // 초기 데이터 설정
    } catch (error) {
      await getEdge();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      if (filteredEdgeGateways && filteredEdgeGateways.length > 0) {
        setSelectedEdgeGateways(filteredEdgeGateways.map((file) => file.eg_idx));
      }
    } else {
      setSelectedEdgeGateways([]);
    }
  };

  const handleRowClick = (edgeGateway: EdgeGateway) => {
    onEditClick(edgeGateway);
  };

  const handleCheckboxChange = (edgeIdx: number) => {
    setSelectedEdgeGateways((prevSelected) => {
      const prevArray = Array.isArray(prevSelected) ? prevSelected : [];
      if (prevArray.includes(edgeIdx)) {
        return prevArray.filter((idx) => idx !== edgeIdx);
      } else {
        return [...prevArray, edgeIdx];
      }
    });
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  const handleNavigationReset = () => {
    setSelectedEdgeGateways([]);
    setSelectAll(false);
    handlePageChange(null, 0);
  };

  useEffect(() => {
    getEdgeWithStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleNavigationReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  useEffect(() => {
    if (selectedEdgeGateways.length === 0) {
      setSelectAll(false);
    } else if (selectedEdgeGateways.length === filteredEdgeGateways.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedEdgeGateways, filteredEdgeGateways]);

  useImperativeHandle(ref, () => ({
    refresh: getEdgeWithStatus,
  }));

  return (
    <div className='table-outer'>
      {loading && <LoadingOverlay />}

      {/* 검색 박스 */}
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
          {/* PC명 */}
          <Grid container spacing={2}>
            <Grid className='sort-title'>
              <div>PC명</div>
            </Grid>
            <Grid>
              <FormControl sx={{ width: '100%' }} size='small'>
                <TextField size='small' value={pcName} onChange={(e) => setPcName(e.target.value)} />
              </FormControl>
            </Grid>
          </Grid>

          {/* IP 주소 */}
          <Grid container spacing={2}>
            <Grid className='sort-title'>
              <div>IP 주소</div>
            </Grid>
            <Grid>
              <FormControl sx={{ width: '100%' }} size='small'>
                <TextField size='small' value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} />
              </FormControl>
            </Grid>
          </Grid>

          {/* 생성일 */}
          <Grid container spacing={2}>
            <Grid className='sort-title'>
              <div>생성일</div>
            </Grid>
            <Grid>
              <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
            </Grid>
          </Grid>
        </Grid>
      </SearchBox>

      <div className='list-header'>
        <Typography variant='h6' gutterBottom>
          서버 목록
        </Typography>

        <ActionBox
          buttons={[
            {
              text: '등록',
              onClick: onAddClick,
              color: 'primary',
            },
            {
              text: '삭제',
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
                <SortableTableHeader
                  columns={sortableColumns}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  showCheckbox={true}
                  selectAll={selectAll}
                  onSelectAllChange={handleSelectAll}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData(sortedEdgeGateways || []).length > 0 ? (
                paginatedData(sortedEdgeGateways || []).map((edgeGateway: EdgeGateway) => (
                  <EdgeTableRow
                    key={edgeGateway.eg_idx}
                    edgeGateway={edgeGateway}
                    checked={selectedEdgeGateways.includes(edgeGateway.eg_idx)}
                    onCheckboxChange={handleCheckboxChange}
                    onRowClick={handleRowClick}
                    formatDate={formatDate}
                  />
                ))
              ) : (
                <TableEmptyRow colSpan={sortableColumns.length + 1} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={sortedEdgeGateways?.length || 0}
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
