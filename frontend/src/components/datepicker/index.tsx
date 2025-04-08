import * as React from 'react';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ko from 'dayjs/locale/ko';
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
          width: '150px',
          letterSpacing:'0.01em',
        },
      },
    },
  },
});

export default function BasicDatePicker() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}  adapterLocale={ko}>
      <ThemeProvider theme={theme}>
        <div components={['DatePicker']} className='datepicker-wrap d-flex gap-5'>
            <DatePicker
              label="시작 날짜"
              format="YYYY-MM-DD"
              defaultValue={dayjs('2025-04-08')}
              slots={{ openPickerIcon: CalendarTodayIcon }}
            />
            <span><RemoveIcon /></span>
            <DatePicker
              label="종료 날짜"
              format="YYYY-MM-DD"
              defaultValue={dayjs('2025-04-08')}
              slots={{ openPickerIcon: CalendarTodayIcon }}
            />
        </div>
      </ThemeProvider>
    </LocalizationProvider>
  );
}
