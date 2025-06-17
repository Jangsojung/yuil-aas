import React from 'react';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';

export default function EdgeTableRow({ eg, onDoubleClick, onCheckboxChange, checked }) {
  return (
    <TableRow
      sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
      onDoubleClick={() => onDoubleClick(eg)}
    >
      <TableCell>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(eg.eg_idx)} />
      </TableCell>
      {/* <TableCell>{eg.eg_idx}</TableCell> */}
      <TableCell>{eg.eg_server_temp} °C</TableCell>
      <TableCell>{eg.eg_network === 1 ? '연결 됨' : '연결 안 됨'}</TableCell>
      <TableCell>{eg.eg_pc_temp} °C</TableCell>
      <TableCell>{eg.eg_ip_port}</TableCell>
      <TableCell>{new Date(eg.createdAt).toLocaleDateString()}</TableCell>
    </TableRow>
  );
}
