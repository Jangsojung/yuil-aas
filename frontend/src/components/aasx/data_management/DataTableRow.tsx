import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';

interface DataTableRowProps {
  data: {
    as_kr: string;
    as_en: string;
    af_idx?: number;
  };
  totalCount?: number;
  checked?: boolean;
  onCheckboxChange?: (data: any) => void;
}

export default function DataTableRow({ data, totalCount, checked = false, onCheckboxChange }: DataTableRowProps) {
  const handleCheckboxChange = () => {
    if (onCheckboxChange) {
      onCheckboxChange(data);
    }
  };

  return (
    <TableRow key={data.af_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell sx={{ minWidth: '150px', width: '150px' }}>
        <Checkbox checked={checked} onChange={handleCheckboxChange} />
      </TableCell>
      <TableCell sx={{ width: '50%' }}>{data.as_kr}</TableCell>
      <TableCell sx={{ width: '50%' }}>{data.as_en}</TableCell>
    </TableRow>
  );
}
