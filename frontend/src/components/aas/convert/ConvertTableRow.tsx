import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

interface ConvertTableRowProps {
  base: {
    ab_idx: number;
    ab_name: string;
    sn_length: number;
    createdAt?: string;
  };
  checked: boolean;
  onCheckboxChange: (id: number) => void;
  onEditClick: (base: any) => void;
  totalCount?: number;
}

export default function ConvertTableRow({
  base,
  checked,
  onCheckboxChange,
  onEditClick,
  totalCount,
}: ConvertTableRowProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day} `;
  };

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(base.ab_idx)} />
      </TableCell>
      <TableCell>{base.ab_name}</TableCell>
      <TableCell>{base.sn_length}</TableCell>
      <TableCell>{base.createdAt ? formatDate(base.createdAt) : ''}</TableCell>
      <TableCell>
        <Button variant='contained' color='success' onClick={() => onEditClick(base)}>
          수정
        </Button>
      </TableCell>
    </TableRow>
  );
}
