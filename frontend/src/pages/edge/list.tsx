import React, { ChangeEvent, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { deleteEdgeAPI, getEdgeAPI, getEdgeWithStatusAPI } from '../../apis/api/edge';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
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

interface EdgeListProps {
  onAddClick: () => void;
  onEditClick: (edgeGateway: EdgeGateway) => void;
}

export default forwardRef(function EdgeList({ onAddClick, onEditClick }: EdgeListProps, ref) {
  const [edgeGateways, setEdgeGateways] = useState<EdgeGateway[]>([]);
  const [selectedEdgeGateways, setSelectedEdgeGateways] = useState<number[]>([]);
  const navigationReset = useRecoilValue(navigationResetState);

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
  } = useSortableData<EdgeGateway>(edgeGateways, 'createdAt', 'desc');

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

    if (!window.confirm(`선택한 ${selectedEdgeGateways.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    const result = await deleteEdgeAPI({ ids: selectedEdgeGateways });

    if (result) {
      setEdgeGateways(edgeGateways.filter((eg) => !selectedEdgeGateways.includes(eg.eg_idx)));
      setSelectedEdgeGateways([]);
      setAlertModal({
        open: true,
        title: '알림',
        content: '선택한 항목이 삭제되었습니다.',
        type: 'alert',
        onConfirm: undefined,
      });
    }
  };

  const getEdge = async () => {
    try {
      setLoading(true);
      const data: EdgeGateway[] = await getEdgeAPI();
      setEdgeGateways(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('getEdge failed:', error);
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
    } catch (error) {
      console.error('Failed to get edge gateways with status:', error);
      await getEdge();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      if (edgeGateways && edgeGateways.length > 0) {
        setSelectedEdgeGateways(edgeGateways.map((file) => file.eg_idx));
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
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => {
        getEdgeWithStatus();
      },
      10 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    handleNavigationReset();
  }, [navigationReset]);

  useEffect(() => {
    if (selectedEdgeGateways.length === 0) {
      setSelectAll(false);
    } else if (selectedEdgeGateways.length === edgeGateways.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedEdgeGateways, edgeGateways]);

  useImperativeHandle(ref, () => ({
    refresh: getEdgeWithStatus,
  }));

  return (
    <div className='table-outer'>
      {loading && <LoadingOverlay />}
      <ActionBox
        buttons={[
          {
            text: '등록',
            onClick: onAddClick,
            color: 'success',
          },
          {
            text: '삭제',
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
                  onSelectAllChange={handleSelectAll}
                  selectAll={selectAll}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData(sortedEdgeGateways || []).length > 0 ? (
                paginatedData(sortedEdgeGateways || []).map((eg: EdgeGateway, idx: number) => (
                  <EdgeTableRow
                    key={eg.eg_idx}
                    edgeGateway={eg}
                    checked={selectedEdgeGateways.includes(eg.eg_idx)}
                    onCheckboxChange={handleCheckboxChange}
                    onRowClick={handleRowClick}
                    formatDate={formatDate}
                  />
                ))
              ) : (
                <TableEmptyRow colSpan={sortableColumns.length + 2} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <Pagination
        page={currentPage}
        count={edgeGateways?.length || 0}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

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
