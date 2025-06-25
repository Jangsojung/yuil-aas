import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

interface DataTableRowProps {
  data: {
    as_kr: string;
    as_en: string;
    af_idx?: number;
  };
  index: number;
  totalCount?: number;
}

export default function DataTableRow({ data, index, totalCount }: DataTableRowProps) {
  const displayNumber = totalCount ? totalCount - index : index + 1;

  return (
    <TableRow key={data.af_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell sx={{ width: '10%' }}>{displayNumber}</TableCell>
      <TableCell sx={{ width: '45%' }}>{data.as_kr}</TableCell>
      <TableCell sx={{ width: '45%' }}>{data.as_en}</TableCell>
    </TableRow>
  );
}
