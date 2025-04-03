import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function BasicDatePicker() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div components={['DatePicker']} className='d-flex gap-5'>
        <DatePicker label='시작 날짜' />
        <DatePicker label='종료 날짜' />
      </div>
    </LocalizationProvider>
  );
}
