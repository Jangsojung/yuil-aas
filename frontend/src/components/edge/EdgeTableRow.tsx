import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

interface EdgeTableRowProps {
  eg: {
    eg_idx: number;
    eg_server_temp: number;
    eg_network: number;
    eg_pc_temp: number;
    eg_ip_port: string;
    createdAt?: string;
  };
  onCheckboxChange: (id: number) => void;
  checked: boolean;
  onEditClick: (eg: any) => void;
  index: number;
  totalCount?: number;
}

export default function EdgeTableRow({
  eg,
  onCheckboxChange,
  checked,
  onEditClick,
  index,
  totalCount,
}: EdgeTableRowProps) {
  const displayNumber = totalCount ? totalCount - index : index + 1;

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(eg.eg_idx)} />
      </TableCell>
      {/* <TableCell>{eg.eg_idx}</TableCell> */}
      <TableCell>{displayNumber}</TableCell>
      <TableCell>{eg.eg_server_temp} °C</TableCell>
      <TableCell>{eg.eg_network === 1 ? '연결 됨' : '연결 안 됨'}</TableCell>
      <TableCell>{eg.eg_pc_temp} °C</TableCell>
      <TableCell>{eg.eg_ip_port}</TableCell>
      <TableCell>{eg.createdAt ? new Date(eg.createdAt).toLocaleDateString() : ''}</TableCell>
      <TableCell>
        <Button variant='contained' color='success' onClick={() => onEditClick(eg)}>
          수정
        </Button>
      </TableCell>
    </TableRow>
  );
}
