import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import { Dayjs } from 'dayjs';
import SingleDatePicker from '../datepicker/SingleDatePicker';

interface ConvertTableRowProps {
  base: {
    ab_idx: number;
    ab_name: string;
    ab_note: string;
    sn_length: number;
    createdAt?: string;
    fc_name?: string;
  };
  checked: boolean;
  onCheckboxChange: (id: number) => void;
  onStartDateChange?: (baseId: number, date: Dayjs | null) => void;
  onEndDateChange?: (baseId: number, date: Dayjs | null) => void;
  totalCount?: number;
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  onDatePickerOpen?: (baseId: number) => void;
}

export default function ConvertTableRow({
  base,
  checked,
  onCheckboxChange,
  onStartDateChange,
  onEndDateChange,
  totalCount,
  startDate,
  endDate,
  onDatePickerOpen,
}: ConvertTableRowProps) {
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
    if (onStartDateChange) {
      onStartDateChange(base.ab_idx, newDate);
    }
  };

  const handleEndDateChange = (newDate: Dayjs | null) => {
    if (onEndDateChange) {
      onEndDateChange(base.ab_idx, newDate);
    }
  };

  const handleStartDateOpen = () => {
    if (onDatePickerOpen) {
      onDatePickerOpen(base.ab_idx);
    }
  };

  const handleEndDateOpen = () => {
    if (onDatePickerOpen) {
      onDatePickerOpen(base.ab_idx);
    }
  };

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell sx={{ width: '50px' }}>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(base.ab_idx)} />
      </TableCell>
      <TableCell sx={{ width: '120px' }}>{base.fc_name || '-'}</TableCell>
      <TableCell sx={{ width: '200px' }}>{base.ab_name}</TableCell>
      <TableCell sx={{ width: '100px' }}>{base.sn_length}</TableCell>
      <TableCell sx={{ width: '150px' }}>{base.createdAt ? formatDate(base.createdAt) : ''}</TableCell>
      <TableCell sx={{ width: '160px' }}>
        <SingleDatePicker
          onDateChange={handleStartDateChange}
          value={startDate || null}
          label='시작일'
          onOpen={handleStartDateOpen}
        />
      </TableCell>
      <TableCell sx={{ width: '160px' }}>
        <SingleDatePicker
          onDateChange={handleEndDateChange}
          value={endDate || null}
          label='종료일'
          minDate={startDate || undefined}
          onOpen={handleEndDateOpen}
        />
      </TableCell>
    </TableRow>
  );
}
