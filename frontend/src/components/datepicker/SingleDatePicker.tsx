import React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ko from 'dayjs/locale/ko';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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
    MuiInputLabel: {
      styleOverrides: {
        root: {
          transform: 'translate(14px, 8px) scale(1)',
          '&.MuiInputLabel-shrunk': {
            transform: 'translate(14px, -9px) scale(0.75)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderRadius: '4px',
          },
        },
      },
    },
  },
});

interface Props {
  onDateChange?: (date: Dayjs | null) => void;
  value: Dayjs | null;
  label?: string;
  minDate?: Dayjs;
  maxDate?: Dayjs;
}

export default function SingleDatePicker({ onDateChange, value, label = '날짜', minDate, maxDate }: Props) {
  const handleDateChange = (newDate: Dayjs | null) => {
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'ko'}>
      <ThemeProvider theme={theme}>
        <DatePicker
          label={label}
          value={value}
          format='YYYY-MM-DD'
          onChange={handleDateChange}
          minDate={minDate}
          maxDate={maxDate || dayjs()}
          slots={{ openPickerIcon: CalendarTodayIcon }}
        />
      </ThemeProvider>
    </LocalizationProvider>
  );
}
