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
          '&.Mui-focused': {
            color: '#1976d2',
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
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
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
  onOpen?: () => void;
}

export default function SingleDatePicker({ onDateChange, value, label = '날짜', minDate, maxDate, onOpen }: Props) {
  const handleDateChange = (newDate: Dayjs | null) => {
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  const handleOpen = () => {
    if (onOpen) {
      onOpen();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'ko'}>
      <ThemeProvider theme={theme}>
        <DatePicker
          label={value ? '' : label}
          value={value}
          format='YYYY-MM-DD'
          onChange={handleDateChange}
          onOpen={handleOpen}
          minDate={minDate}
          maxDate={maxDate || dayjs()}
          slots={{ openPickerIcon: CalendarTodayIcon }}
        />
      </ThemeProvider>
    </LocalizationProvider>
  );
}
