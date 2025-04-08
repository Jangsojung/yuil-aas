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
          letterSpacing: '0.01em',
        },
      },
    },
  },
});

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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={ko}>
      <div components={['DatePicker']} className='datepicker-wrap d-flex gap-5'>
        {/* defaultValue={dayjs('')} */}
        <DatePicker
          label='시작 날짜'
          value={startDate}
          format='YYYY-MM-DD'
          onChange={handleStartDateChange}
          maxDate={endDate}
          slots={{ openPickerIcon: CalendarTodayIcon }}
        />
        <DatePicker
          label='종료 날짜'
          value={endDate}
          format='YYYY-MM-DD'
          onChange={handleEndDateChange}
          minDate={startDate}
          slots={{ openPickerIcon: CalendarTodayIcon }}
        />
      </div>
    </LocalizationProvider>
  );
}
