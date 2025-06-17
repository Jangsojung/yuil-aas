import React from 'react';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';

export default function ConvertTableRow({ base, checked, onCheckboxChange }) {
  const handleChange = () => {
    onCheckboxChange(base.ab_idx);
  };

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Checkbox checked={checked} onChange={handleChange} />
      </TableCell>
      {/* <TableCell>{base.ab_idx}</TableCell> */}
      <TableCell>{base.ab_name}</TableCell>
      <TableCell>{base.sn_length}</TableCell>
      <TableCell>{new Date(base.createdAt).toLocaleDateString()}</TableCell>
    </TableRow>
  );
}
