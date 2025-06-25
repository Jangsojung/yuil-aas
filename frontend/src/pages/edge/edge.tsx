import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { deleteEdgeAPI, getEdgeAPI } from '../../apis/api/edge';

import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';

import CustomizedDialogs from '../../components/modal/edgemodal';
import EdgeTableRow from '../../components/edge/EdgeTableRow';
import Pagenation from '../../components/pagenation';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';

interface EdgeGateway {
  eg_idx: number;
  eg_server_temp: number;
  eg_network: number;
  eg_pc_temp: number;
  eg_ip_port: String;
}

export default function Edge_Gateway() {
  const [edgeGateways, setEdgeGateways] = useState<EdgeGateway[]>([]);
  const [selectedEdgeGateways, setSelectedEdgeGateways] = useState<number[]>([]);
  const [selectedEdgeGateway, setSelectedEdgeGateway] = useState<EdgeGateway | null>(null);
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  const [openModal, setOpenModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagedData = edgeGateways?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const handleInsert = async (eg: EdgeGateway) => {
    setEdgeGateways((prevEdgeGateways) => [eg, ...prevEdgeGateways]);
  };

  const handleUpdate = async () => {
    await getEdge();
  };

  const handleDelete = async () => {
    if (!window.confirm(`선택한 ${selectedEdgeGateways.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    const ids = JSON.stringify({ ids: selectedEdgeGateways });
    const result = await deleteEdgeAPI(ids);

    if (result) {
      setEdgeGateways(edgeGateways.filter((eg) => !selectedEdgeGateways.includes(eg.eg_idx)));
      setSelectedEdgeGateways([]);
      alert('선택한 항목이 삭제되었습니다.');
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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

  const handleDoubleClick = (edgeGateway: EdgeGateway) => {
    setSelectedEdgeGateway(edgeGateway);
    setOpenUpdateModal(true);
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

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setSelectedEdgeGateway(null);
  };

  useEffect(() => {
    getEdge();
  }, []);

  useEffect(() => {
    setSelectedEdgeGateways([]);
    setSelectAll(false);
    setCurrentPage(0);
    setOpenModal(false);
    setOpenUpdateModal(false);
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
      <Box sx={{ flexGrow: 1, p: 1 }} className='sort-box'>
        <Grid container spacing={0} alignItems='center'>
          <Grid size={8}></Grid>
          <Grid size={4}>
            <Stack spacing={1} direction='row' sx={{ justifyContent: 'flex-end', alignItems: 'center', minHeight: 0 }}>
              <Button variant='contained' color='success' size='small' onClick={handleOpenModal}>
                등록
              </Button>
              <Button
                variant='contained'
                color='error'
                size='small'
                onClick={handleDelete}
                disabled={selectedEdgeGateways.length === 0}
              >
                삭제
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

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
                <TableCell>수정</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((eg, idx) => (
                  <EdgeTableRow
                    eg={eg}
                    key={idx}
                    onCheckboxChange={handleCheckboxChange}
                    checked={selectedEdgeGateways.includes(eg.eg_idx)}
                    onEditClick={handleDoubleClick}
                    index={currentPage * rowsPerPage + idx}
                    totalCount={edgeGateways.length}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={cells.length + 1} align='center'>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagenation count={edgeGateways ? edgeGateways.length : 0} onPageChange={handlePageChange} />
      </div>

      <CustomizedDialogs
        modalType='insert'
        open={openModal}
        handleClose={handleCloseModal}
        handleInsert={handleInsert}
      />
      <CustomizedDialogs
        modalType='update'
        open={openUpdateModal}
        handleClose={handleCloseUpdateModal}
        edgeGatewayData={selectedEdgeGateway}
        handleUpdate={handleUpdate}
      />
    </div>
  );
}

// const cells = ['번호', '서버 온도', '네트워크 상태', 'PC 온도', 'PC IP:PORT'];
const cells = ['번호', '서버 온도', '네트워크 상태', 'PC 온도', 'PC IP:PORT', '생성 날짜'];
