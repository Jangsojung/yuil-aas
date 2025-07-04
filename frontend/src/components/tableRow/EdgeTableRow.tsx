import React from 'react';
import { TableCell, TableRow, Checkbox, Button } from '@mui/material';
import { useState } from 'react';
import { checkEdgePingAPI, checkServerTemperatureAPI } from '../../apis/api/edge';
import LoadingOverlay from '../loading/LodingOverlay';

interface EdgeGateway {
  eg_idx: number;
  eg_pc_name?: string;
  eg_ip_port: string;
  eg_server_temp?: number;
  eg_network?: number;
  eg_pc_temp?: number;
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
  const [serverTemp, setServerTemp] = useState(edgeGateway.eg_server_temp);
  const [tempStatus, setTempStatus] = useState<'idle' | 'measuring' | 'unavailable'>(
    edgeGateway.eg_server_temp !== null && edgeGateway.eg_server_temp !== undefined ? 'idle' : 'unavailable'
  );

  const handleCheckStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setChecking(true);
    setTempStatus('measuring');

    try {
      const [ip, port] = edgeGateway.eg_ip_port.split(':');

      // 5초간 대기하면서 Ping 검사
      const result = await Promise.race([
        checkEdgePingAPI(ip, port),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
      ]);

      setNetworkStatus(result.connected ? 1 : 0);

      // 네트워크가 연결된 경우 온도 측정 시도
      if (result.connected) {
        try {
          const tempResult = await checkServerTemperatureAPI(ip, port);
          if (tempResult.temperature !== null && tempResult.temperature !== undefined) {
            setServerTemp(tempResult.temperature);
            setTempStatus('idle');
          } else {
            setTempStatus('unavailable');
          }
        } catch (tempErr) {
          setTempStatus('unavailable');
        }
      } else {
        setTempStatus('unavailable');
      }
    } catch (err) {
      setNetworkStatus(0);
      setTempStatus('unavailable');
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
          {tempStatus === 'measuring'
            ? '측정 중'
            : tempStatus === 'unavailable'
              ? '측정 불가'
              : serverTemp !== null && serverTemp !== undefined
                ? `${serverTemp} °C`
                : '-'}
        </TableCell>
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
            {checking ? '검사 중...' : '상태 체크'}
          </Button>
        </TableCell>
        <TableCell>{edgeGateway.eg_pc_temp ? `${edgeGateway.eg_pc_temp} °C` : '-'}</TableCell>
        <TableCell>{edgeGateway.createdAt ? formatDate(edgeGateway.createdAt) : ''}</TableCell>
        <TableCell>{edgeGateway.updatedAt ? formatDate(edgeGateway.updatedAt) : ''}</TableCell>
      </TableRow>
    </>
  );
}
