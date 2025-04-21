import React, { useEffect, useState } from 'react';
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

  const [openModal, setOpenModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagedData = edgeGateways.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const handleInsert = async (eg: EdgeGateway) => {
    setEdgeGateways([eg, ...edgeGateways]);
  };

  const handleUpdate = async (newEg: EdgeGateway) => {
    const newEdgeGateways = edgeGateways.map((eg) => (eg.eg_idx === newEg.eg_idx ? newEg : eg));
    setEdgeGateways(newEdgeGateways);
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      const egIdx = edgeGateways.map((file) => file.eg_idx);
      setSelectedEdgeGateways(egIdx);
    } else {
      setSelectedEdgeGateways([]);
    }
  };

  const handleDoubleClick = (edgeGateway: EdgeGateway) => {
    setSelectedEdgeGateway(edgeGateway);
    setOpenUpdateModal(true);
  };

  const handleCheckboxChange = (fileIdx: number) => {
    let newSelectedEdgeGateways: number[] = [];

    if (selectedEdgeGateways.includes(fileIdx)) {
      newSelectedEdgeGateways = selectedEdgeGateways.filter((eg_idx) => eg_idx !== fileIdx);
    } else {
      newSelectedEdgeGateways = [...selectedEdgeGateways, fileIdx];
    }

    setSelectedEdgeGateways(newSelectedEdgeGateways);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setSelectedEdgeGateway(null);
  };

  console.log(edgeGateways);

  useEffect(() => {
    getEdge();
  }, []);

  return (
    <div className='table-outer'>
      <Box sx={{ flexGrow: 1 }} className='sort-box'>
        <Grid container spacing={1}>
          <Grid size={8}></Grid>
          <Grid size={4}>
            <Stack spacing={1} direction='row' sx={{ justifyContent: 'flex-end' }}>
              <Button variant='contained' color='success' onClick={handleOpenModal}>
                등록
              </Button>
              <Button
                variant='contained'
                color='error'
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
                  <Checkbox checked={selectAll} onChange={handleSelectAll} />
                </TableCell>
                {cells.map((cell, idx) => (
                  <TableCell key={idx}>{cell}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData.length > 0 ? (
                pagedData.map((eg) => (
                  <EdgeTableRow
                    eg={eg}
                    key={eg.eg_idx}
                    onCheckboxChange={handleCheckboxChange}
                    onDoubleClick={handleDoubleClick}
                    checked={selectedEdgeGateways.includes(eg.eg_idx)}
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

const cells = ['번호', '서버 온도', '네트워크 상태', 'PC 온도', 'PC IP:PORT'];
