import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';

interface ConvertTableRowProps {
  base: {
    ab_idx: number;
    ab_name: string;
    sn_length: number;
    createdAt?: string;
  };
  checked: boolean;
  onCheckboxChange: (id: number) => void;
  index: number;
  totalCount?: number;
}

export default function ConvertTableRow({ base, checked, onCheckboxChange, index, totalCount }: ConvertTableRowProps) {
  const handleChange = () => {
    onCheckboxChange(base.ab_idx);
  };

  const displayNumber = totalCount ? totalCount - index : index + 1;

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Checkbox checked={checked} onChange={handleChange} />
      </TableCell>
      <TableCell>{displayNumber}</TableCell>
      {/* <TableCell>{base.ab_idx}</TableCell> */}
      <TableCell>{base.ab_name}</TableCell>
      <TableCell>{base.sn_length}</TableCell>
      <TableCell>{base.createdAt ? new Date(base.createdAt).toLocaleDateString() : ''}</TableCell>
    </TableRow>
  );
}
