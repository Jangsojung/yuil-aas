import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

export default function EdgeTableRow({ eg, onCheckboxChange, checked, onEditClick }) {
  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(eg.eg_idx)} />
      </TableCell>
      {/* <TableCell>{eg.eg_idx}</TableCell> */}
      <TableCell>{eg.eg_server_temp} °C</TableCell>
      <TableCell>{eg.eg_network === 1 ? '연결 됨' : '연결 안 됨'}</TableCell>
      <TableCell>{eg.eg_pc_temp} °C</TableCell>
      <TableCell>{eg.eg_ip_port}</TableCell>
      <TableCell>{new Date(eg.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        <Button variant='contained' color='success' onClick={() => onEditClick(eg)}>
          수정
        </Button>
      </TableCell>
    </TableRow>
  );
}
