import React, { ChangeEvent, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { deleteEdgeAPI, getEdgeAPI, getEdgeWithStatusAPI, downloadDeployFilesAPI } from '../../apis/api/edge';
import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import Pagination from '../../components/pagination';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { ActionBox } from '../../components/common';
import AlertModal from '../../components/modal/alert';
import { usePagination } from '../../hooks/usePagination';
import EdgeTableRow from '../../components/tableRow/EdgeTableRow';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import LoadingOverlay from '../../components/loading/LodingOverlay';

interface EdgeGateway {
  eg_idx: number;
  eg_pc_name?: string;
  eg_ip_port: string;
  eg_server_temp?: number;
  eg_network?: number;
  eg_pc_temp?: number;
  createdAt?: string;
  created_at?: string;
  createDate?: string;
  create_date?: string;
  date?: string;
}

interface EdgeListProps {
  onAddClick: () => void;
  onEditClick: (edgeGateway: EdgeGateway) => void;
}

const EdgeList = forwardRef(function EdgeList({ onAddClick, onEditClick }: EdgeListProps, ref) {
  const [edgeGateways, setEdgeGateways] = useState<EdgeGateway[]>([]);
  const [selectedEdgeGateways, setSelectedEdgeGateways] = useState<number[]>([]);
  const navigationReset = useRecoilValue(navigationResetState);

  const [selectAll, setSelectAll] = useState(false);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });

  const { currentPage, rowsPerPage, paginatedData, goToPage, handleRowsPerPageChange } = usePagination(
    edgeGateways?.length || 0
  );

  const pagedData = paginatedData(edgeGateways || []);

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
      // 실시간 상태 가져오기 실패 시 기본 데이터로 폴백
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  const handleNavigationReset = () => {
    setSelectedEdgeGateways([]);
    setSelectAll(false);
    goToPage(0);
  };

  useEffect(() => {
    // 페이지 접속 시 실시간 상태로 초기 로드
    getEdgeWithStatus();
  }, []);

  useEffect(() => {
    // 10분마다 실시간 상태 업데이트
    const interval = setInterval(
      () => {
        getEdgeWithStatus();
      },
      10 * 60 * 1000
    ); // 10분

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    handleNavigationReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // getEdge를 ref로 노출
  useImperativeHandle(ref, () => ({
    refresh: getEdgeWithStatus,
  }));

  return (
    <div className='table-outer'>
      {loading && <LoadingOverlay />}
      <ActionBox
        buttons={[
          {
            text: '배포파일 다운로드',
            onClick: downloadDeployFilesAPI,
            color: 'info',
          },
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
                <TableCell>
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    disabled={!edgeGateways || edgeGateways.length === 0}
                  />
                </TableCell>
                {cells.map((cell, idx) => (
                  <TableCell key={idx}>{cell}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((eg, idx) => (
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
                <TableRow>
                  <TableCell colSpan={cells.length + 2} align='center'>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <Pagination
        page={currentPage}
        count={edgeGateways?.length || 0}
        rowsPerPage={rowsPerPage}
        onPageChange={(event, page) => goToPage(page)}
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

const cells = ['PC 이름', 'PC IP:PORT', '서버 온도', '네트워크 상태', '생성 일자'];

export default EdgeList;
