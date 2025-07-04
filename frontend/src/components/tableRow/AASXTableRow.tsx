import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

interface AASXTableRowProps {
  file: {
    af_idx: number;
    af_name: string;
    af_size: number;
    createdAt: string;
    updatedAt?: string;
  };
  onCheckboxChange: (id: number) => void;
  checked: boolean;
  onEditClick: (file: any) => void;
  totalCount?: number;
}

export default function AASXTableRow({ file, onCheckboxChange, checked, onEditClick, totalCount }: AASXTableRowProps) {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(file.af_idx)} />
      </TableCell>
      <TableCell>{file.af_name}</TableCell>
      <TableCell>{formatFileSize(file.af_size)}</TableCell>
      <TableCell>{formatDate(file.createdAt)}</TableCell>
      <TableCell>{formatDate(file.updatedAt)}</TableCell>
      <TableCell>
        <Button variant='contained' color='success' onClick={() => onEditClick(file)}>
          수정
        </Button>
      </TableCell>
    </TableRow>
  );
}
