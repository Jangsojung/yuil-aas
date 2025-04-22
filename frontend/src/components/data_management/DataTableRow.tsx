import React from 'react';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';

export default function DataTableRow({ file, onDoubleClick, onCheckboxChange, checked }) {
  return (
    <TableRow
      key={file.af_idx}
      sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
      onDoubleClick={() => onDoubleClick(file)}
    >
      <TableCell>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(file.af_idx)} />
      </TableCell>
      <TableCell>{file.af_idx}</TableCell>
      <TableCell>{file.af_name}</TableCell>
      <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
    </TableRow>
  );
}
