import React, { useState } from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import SingleDatePicker from '../../datepicker/SingleDatePicker';

interface ConvertTableRowProps {
  base: {
    ab_idx: number;
    ab_name: string;
    ab_note: string;
    sn_length: number;
    createdAt?: string;
  };
  checked: boolean;
  onCheckboxChange: (id: number) => void;
  onEditClick: (base: any) => void;
  onStartDateChange?: (baseId: number, date: Dayjs | null) => void;
  onEndDateChange?: (baseId: number, date: Dayjs | null) => void;
  totalCount?: number;
}

export default function ConvertTableRow({
  base,
  checked,
  onCheckboxChange,
  onEditClick,
  onStartDateChange,
  onEndDateChange,
  totalCount,
}: ConvertTableRowProps) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

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

  const handleStartDateChange = (newDate: Dayjs | null) => {
    setStartDate(newDate);
    if (onStartDateChange) {
      onStartDateChange(base.ab_idx, newDate);
    }
  };

  const handleEndDateChange = (newDate: Dayjs | null) => {
    setEndDate(newDate);
    if (onEndDateChange) {
      onEndDateChange(base.ab_idx, newDate);
    }
  };

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell sx={{ width: '50px' }}>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(base.ab_idx)} />
      </TableCell>
      <TableCell sx={{ width: '200px' }}>{base.ab_name}</TableCell>
      <TableCell sx={{ width: '100px' }}>{base.sn_length}</TableCell>
      <TableCell sx={{ width: '150px' }}>{base.createdAt ? formatDate(base.createdAt) : ''}</TableCell>
      <TableCell sx={{ width: '160px' }}>
        <SingleDatePicker onDateChange={handleStartDateChange} value={startDate} label='시작 날짜' />
      </TableCell>
      <TableCell sx={{ width: '160px' }}>
        <SingleDatePicker
          onDateChange={handleEndDateChange}
          value={endDate}
          label='종료 날짜'
          minDate={startDate || undefined}
        />
      </TableCell>
    </TableRow>
  );
}
