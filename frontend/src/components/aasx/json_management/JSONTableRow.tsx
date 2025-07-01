import React from 'react';
import { TableCell, TableRow, Checkbox } from '@mui/material';

interface JSONTableRowProps {
  file: {
    af_idx: number;
    af_name: string;
    af_size: number;
    createdAt: string;
    base_name?: string;
    sensor_count?: number;
  };
  onCheckboxChange: (id: number) => void;
  checked: boolean;
  totalCount?: number;
}

export default function JSONTableRow({ file, onCheckboxChange, checked, totalCount }: JSONTableRowProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(file.af_idx)} />
      </TableCell>
      <TableCell>{file.af_name}</TableCell>
      <TableCell>{file.base_name || '기초코드 없음'}</TableCell>
      <TableCell>{file.sensor_count || 0}</TableCell>
      <TableCell>{formatDate(file.createdAt)}</TableCell>
    </TableRow>
  );
}
