import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

export default function DataTableRow({ file, onCheckboxChange, checked, onEditClick }) {
  return (
    <TableRow key={file.af_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(file.af_idx)} />
      </TableCell>
      {/* <TableCell>{file.af_idx}</TableCell> */}
      <TableCell>{file.af_name}</TableCell>
      <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        <Button variant='contained' color='success' onClick={() => onEditClick(file)}>
          수정
        </Button>
      </TableCell>
    </TableRow>
  );
}
