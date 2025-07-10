import React from 'react';
import { TableCell, TableRow, Checkbox, Button } from '@mui/material';
import { useState } from 'react';
import { checkEdgePingAPI } from '../../apis/api/edge';
import LoadingOverlay from '../loading/LodingOverlay';

interface EdgeGateway {
  eg_idx: number;
  eg_pc_name?: string;
  eg_ip_port: string;
  eg_network?: number;
  createdAt?: string;
  updatedAt?: string;
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

      // 5초간 대기하면서 Ping 검사
      const result = await Promise.race([
        checkEdgePingAPI(ip, port),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
      ]);

      setNetworkStatus(result.connected ? 1 : 0);
    } catch (err) {
      setNetworkStatus(0);
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      {checking && <LoadingOverlay />}
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
        <TableCell>
          {networkStatus === 1 ? '연결 됨' : '연결 안 됨'}
          <Button
            variant='outlined'
            color='info'
            size='small'
            style={{ marginLeft: 8 }}
            onClick={handleCheckStatus}
            disabled={checking}
          >
            {checking ? '검사 중...' : '점검'}
          </Button>
        </TableCell>
        <TableCell>{edgeGateway.createdAt ? formatDate(edgeGateway.createdAt) : ''}</TableCell>
        <TableCell>{edgeGateway.updatedAt ? formatDate(edgeGateway.updatedAt) : ''}</TableCell>
      </TableRow>
    </>
  );
}
