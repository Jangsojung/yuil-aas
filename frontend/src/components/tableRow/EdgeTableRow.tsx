import React from 'react';
import { TableCell, TableRow, Checkbox, Button } from '@mui/material';
import { useState } from 'react';
import { checkEdgePingAPI } from '../../apis/api/edge';

interface EdgeGateway {
  eg_idx: number;
  eg_pc_name?: string;
  eg_ip_port: string;
  eg_server_temp?: number;
  eg_network?: number;
  eg_pc_temp?: number;
  createdAt?: string;
}

interface EdgeTableRowProps {
  edgeGateway: EdgeGateway;
  checked: boolean;
  onCheckboxChange: (edgeIdx: number) => void;
  onRowClick: (edgeGateway: EdgeGateway) => void;
  formatDate: (dateString: string) => string;
}

export default function EdgeTableRow({
  edgeGateway,
  checked,
  onCheckboxChange,
  onRowClick,
  formatDate,
}: EdgeTableRowProps) {
  const [networkStatus, setNetworkStatus] = useState(edgeGateway.eg_network);
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setChecking(true);
    try {
      const [ip, port] = edgeGateway.eg_ip_port.split(':');
      const result = await checkEdgePingAPI(ip, port);
      setNetworkStatus(result.connected ? 1 : 0);
    } catch (err) {
      setNetworkStatus(0);
    } finally {
      setChecking(false);
    }
  };

  return (
    <TableRow
      key={edgeGateway.eg_idx}
      sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
      onClick={() => onRowClick(edgeGateway)}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(edgeGateway.eg_idx)} />
      </TableCell>
      <TableCell>{edgeGateway.eg_pc_name || '-'}</TableCell>
      <TableCell>{edgeGateway.eg_ip_port}</TableCell>
      <TableCell>{edgeGateway.eg_server_temp ? `${edgeGateway.eg_server_temp} °C` : '-'}</TableCell>
      <TableCell>
        {networkStatus === 1 ? '연결 됨' : '연결 안 됨'}
        <Button
          variant='contained'
          color='info'
          size='small'
          style={{ marginLeft: 8 }}
          onClick={handleCheckStatus}
          disabled={checking}
        >
          상태 체크
        </Button>
      </TableCell>
      <TableCell>{edgeGateway.createdAt ? formatDate(edgeGateway.createdAt) : ''}</TableCell>
    </TableRow>
  );
}
