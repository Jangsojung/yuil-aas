import * as React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function BasicDatePicker({ onDateChange, resetDates }) {
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    if (onDateChange) {
      onDateChange(newDate, endDate);
    }
  };

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
    if (onDateChange) {
      onDateChange(startDate, newDate);
    }
  };

  React.useEffect(() => {
    if (resetDates) {
      setStartDate(null);
      setEndDate(null);
    }
  }, [resetDates]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div components={['DatePicker']} className='d-flex gap-5'>
        <DatePicker label='시작 날짜' value={startDate} onChange={handleStartDateChange} maxDate={endDate} />
        <DatePicker label='종료 날짜' value={endDate} onChange={handleEndDateChange} minDate={startDate} />
      </div>
    </LocalizationProvider>
  );
}
