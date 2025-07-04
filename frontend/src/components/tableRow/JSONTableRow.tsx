import React from 'react';
import { TableCell, TableRow, Checkbox } from '@mui/material';

interface JSONTableRowProps {
  file: {
    af_idx: number;
    af_name: string;
    createdAt: string;
    base_name?: string;
    sn_length?: number;
  };
  onCheckboxChange: (id: number) => void;
  checked: boolean;
  totalCount?: number;
  onRowClick?: (af_idx: number) => void;
}

export default function JSONTableRow({ file, onCheckboxChange, checked, totalCount, onRowClick }: JSONTableRowProps) {
  const formatDate = (dateString: string | undefined) => {
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
    <TableRow
      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
      onClick={() => onRowClick && onRowClick(file.af_idx)}
      style={{ cursor: onRowClick ? 'pointer' : 'default' }}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(file.af_idx)} />
      </TableCell>
      <TableCell>{file.af_name}</TableCell>
      <TableCell>{file.base_name || '삭제된 기초코드'}</TableCell>
      <TableCell>{file.sn_length || 0}</TableCell>
      <TableCell>{formatDate(file.createdAt)}</TableCell>
    </TableRow>
  );
}
