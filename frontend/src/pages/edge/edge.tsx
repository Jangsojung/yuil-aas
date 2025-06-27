import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { deleteEdgeAPI, getEdgeAPI } from '../../apis/api/edge';

import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import Pagination from '../../components/pagination';
import CustomizedDialogs from '../../components/modal/edgemodal';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { ActionBox } from '../../components/common';
import AlertModal from '../../components/modal/alert';

interface EdgeGateway {
  eg_idx: number;
  eg_server_temp: number;
  eg_network: number;
  eg_pc_temp: number;
  eg_ip_port: string;
  createdAt?: string;
  created_at?: string;
  createDate?: string;
  create_date?: string;
  date?: string;
}

export default function Edge_Gateway() {
  const [edgeGateways, setEdgeGateways] = useState<EdgeGateway[]>([]);
  const [selectedEdgeGateways, setSelectedEdgeGateways] = useState<number[]>([]);
  const [selectedEdgeGateway, setSelectedEdgeGateway] = useState<EdgeGateway | null>(null);
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });
  const rowsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagedData = edgeGateways?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const handleInsert = async (eg: EdgeGateway) => {
    await getEdge();
  };

  const handleUpdate = async () => {
    await getEdge();
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

  const handleOpenModal = () => {
    setIsEditMode(false);
    setSelectedEdgeGateway(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsEditMode(false);
    setSelectedEdgeGateway(null);
  };

  const getEdge = async () => {
    const data: EdgeGateway[] = await getEdgeAPI();
    setEdgeGateways(data);
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
    setSelectedEdgeGateway(edgeGateway);
    setIsEditMode(true);
    setOpenModal(true);
  };

  const handleCheckboxChange = (edgeIdx: number) => {
    setSelectedEdgeGateways((prevSelected) => {
      if (prevSelected.includes(edgeIdx)) {
        return prevSelected.filter((idx) => idx !== edgeIdx);
      } else {
        return [...prevSelected, edgeIdx];
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

  useEffect(() => {
    getEdge();
  }, []);

  useEffect(() => {
    setSelectedEdgeGateways([]);
    setSelectAll(false);
    setCurrentPage(0);
    setOpenModal(false);
    setIsEditMode(false);
    setSelectedEdgeGateway(null);
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

  return (
    <div className='table-outer'>
      <ActionBox
        buttons={[
          {
            text: '등록',
            onClick: handleOpenModal,
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
                  <TableRow
                    key={eg.eg_idx}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                    onClick={() => handleRowClick(eg)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedEdgeGateways.includes(eg.eg_idx)}
                        onChange={() => handleCheckboxChange(eg.eg_idx)}
                      />
                    </TableCell>
                    <TableCell>{eg.eg_server_temp} °C</TableCell>
                    <TableCell>{eg.eg_network === 1 ? '연결 됨' : '연결 안 됨'}</TableCell>
                    <TableCell>{eg.eg_pc_temp} °C</TableCell>
                    <TableCell>{eg.eg_ip_port}</TableCell>
                    <TableCell>{eg.createdAt ? formatDate(eg.createdAt) : ''}</TableCell>
                  </TableRow>
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
        <Pagination page={currentPage} count={totalPages} onPageChange={handlePageChange} />
      </div>

      <CustomizedDialogs
        modalType={isEditMode ? 'update' : 'insert'}
        open={openModal}
        handleClose={handleCloseModal}
        edgeGatewayData={selectedEdgeGateway}
        handleInsert={handleInsert}
        handleUpdate={handleUpdate}
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
}

const cells = ['서버 온도', '네트워크 상태', 'PC 온도', 'PC IP:PORT', '생성 일자'];
