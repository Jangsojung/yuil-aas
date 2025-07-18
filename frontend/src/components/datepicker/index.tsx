import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RemoveIcon from '@mui/icons-material/Remove';

const theme = createTheme({
  components: {
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#546e7a',
          width: '160px',
          letterSpacing: '0.01em',
        },
      },
    },
  },
});

interface Props {
  onDateChange?: (start: Dayjs | null, end: Dayjs | null) => void;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

export default function BasicDatePicker({ onDateChange, startDate, endDate }: Props) {
  const handleStartDateChange = (newDate: Dayjs | null) => {
    if (onDateChange) {
      onDateChange(newDate, endDate);
    }
  };

  const handleEndDateChange = (newDate: Dayjs | null) => {
    if (onDateChange) {
      onDateChange(startDate, newDate);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'ko'}>
      <ThemeProvider theme={theme}>
        <div className='datepicker-wrap d-flex gap-5'>
          <DatePicker
            label='시작일'
            value={startDate}
            format='YYYY-MM-DD'
            onChange={handleStartDateChange}
            maxDate={dayjs()}
            slots={{ openPickerIcon: CalendarTodayIcon }}
          />
          <span>
            <RemoveIcon />
          </span>
          <DatePicker
            label='종료일'
            value={endDate}
            format='YYYY-MM-DD'
            onChange={handleEndDateChange}
            minDate={dayjs(startDate)}
            maxDate={dayjs()}
            slots={{ openPickerIcon: CalendarTodayIcon }}
          />
        </div>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
