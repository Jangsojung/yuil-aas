import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFactoryState, edgeGatewayRefreshState, selectedEdgeGatewaysState } from '../../recoil/atoms';
import Pagenation from '../../components/pagenation';
import CustomizedDialogs from '../modal/edgemodal';
interface EdgeGateway {
  eg_idx: number;
  eg_server_temp: number;
  eg_network: number;
  eg_pc_temp: number;
  eg_ip_port: String;
}

export default function BasicTable() {
  const currentFactory = useRecoilValue(currentFactoryState);
  const refreshTrigger = useRecoilValue(edgeGatewayRefreshState);
  const [edgeGateways, setEdgeGateways] = React.useState<EdgeGateway[]>([]);
  const [selectedEdgeGateways, setSelectedEdgeGateways] = useRecoilState(selectedEdgeGatewaysState);
  const [selectAll, setSelectAll] = React.useState(false);

  const [openUpdateModal, setOpenUpdateModal] = React.useState(false);
  const [selectedEdgeGateway, setSelectedEdgeGateway] = React.useState<EdgeGateway | null>(null);

  React.useEffect(() => {
    if (currentFactory !== null) {
      getEdgeGateways(currentFactory);
    }
  }, [currentFactory, refreshTrigger]);

  const getEdgeGateways = async (fc_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/edge_gateway`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: EdgeGateway[] = await response.json();
      setEdgeGateways(data);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedEdgeGateways(edgeGateways.map((file) => file.eg_idx));
    } else {
      setSelectedEdgeGateways([]);
    }
  };

  const handleCheckboxChange = (fileIdx: number) => {
    setSelectedEdgeGateways((prevSelected) => {
      if (prevSelected.includes(fileIdx)) {
        return prevSelected.filter((idx) => idx !== fileIdx);
      } else {
        return [...prevSelected, fileIdx];
      }
    });
  };

  const handleDoubleClick = (edgeGateway: EdgeGateway) => {
    setSelectedEdgeGateway(edgeGateway);
    setOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setSelectedEdgeGateway(null);
  };

  React.useEffect(() => {
    setSelectAll(false);
  }, [edgeGateways]);

  return (
    <>
      {/* <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant='contained' color='success' onClick={handleOpenInsertModal}>
          등록
        </Button>
      </div> */}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox checked={selectAll} onChange={handleSelectAllChange} />
              </TableCell>
              {cells.map((cell, index) => (
                <TableCell key={index}>{cell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {edgeGateways &&
              edgeGateways.map((eg) => (
                <TableRow
                  key={eg.eg_idx}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                  onDoubleClick={() => handleDoubleClick(eg)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedEdgeGateways.includes(eg.eg_idx)}
                      onChange={() => handleCheckboxChange(eg.eg_idx)}
                    />
                  </TableCell>
                  <TableCell>{eg.eg_idx}</TableCell>
                  <TableCell>{eg.eg_server_temp} °C</TableCell>
                  <TableCell>{eg.eg_network === 1 ? '연결 됨' : '연결 안 됨'}</TableCell>
                  <TableCell>{eg.eg_pc_temp} °C</TableCell>
                  <TableCell>{eg.eg_ip_port}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagenation count={edgeGateways.length} />

      {/* 수정 모달 */}
      <CustomizedDialogs
        modalType='update'
        open={openUpdateModal}
        handleClose={handleCloseUpdateModal}
        edgeGatewayData={selectedEdgeGateway}
      />
    </>
  );
}

const cells = ['IDX', '서버 온도', '네트워크 상태', 'PC 온도', 'PC IP:PORT'];
