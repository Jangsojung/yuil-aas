import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';

// import Checkbox from '../../components/checkbox';
import { useRecoilValue } from 'recoil';
import { currentFactoryState } from '../../recoil/atoms';
import Pagenation from '../../components/pagenation';

interface EdgeGateway {
  eg_idx: number;
  eg_server_temp: number;
  eg_network: number;
  eg_pc_temp: number;
  eg_ip_port: String;
}

export default function BasicTable() {
  const currentFactory = useRecoilValue(currentFactoryState);
  const [edgeGateways, setEdgeGateways] = React.useState<EdgeGateway[]>([]);
  const [selectedEdgeGateways, setSelectedEdgeGateways] = React.useState<number[]>([]);
  const [selectAll, setSelectAll] = React.useState(false);

  React.useEffect(() => {
    if (currentFactory !== null) {
      getEdgeGateways(currentFactory);
    }
  }, [currentFactory]);

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

      console.log(data);
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

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox checked={selectAll} onChange={handleSelectAllChange} />
              </TableCell>
              {cells.map((cell) => (
                <TableCell>{cell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {edgeGateways.map((eg) => (
              <TableRow key={eg.eg_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Checkbox
                    checked={selectedEdgeGateways.includes(eg.eg_idx)}
                    onChange={() => handleCheckboxChange(eg.eg_idx)}
                  />
                </TableCell>
                <TableCell>{eg.eg_idx}</TableCell>
                <TableCell>{eg.eg_server_temp}</TableCell>
                <TableCell>{eg.eg_network === 1 ? '연결 됨' : '연결 안 됨'}</TableCell>
                <TableCell>{eg.eg_pc_temp}</TableCell>
                <TableCell>{eg.eg_ip_port}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagenation count={edgeGateways.length} />
    </>
  );
}

const cells = ['IDX', '서버 온도', '네트워크 상태', 'PC 온도', 'PC IP:PORT'];
