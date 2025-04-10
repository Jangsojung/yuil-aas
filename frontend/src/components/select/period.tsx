import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function SelectSmall() {
  const [currentPeriod, setCurrentPeriod] = React.useState<String>('');

  const handleChange = (event: any) => {
    setCurrentPeriod(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
      <InputLabel id='demo-select-small-label'>Period</InputLabel>
      <Select
        labelId='demo-select-small-label'
        id='demo-select-small'
        value={currentPeriod}
        label='Period'
        onChange={handleChange}
        IconComponent = {ExpandMoreIcon}
      >
        {periods && periods.map((period, idx) => <MenuItem value={idx}>{period}</MenuItem>)}
      </Select>
    </FormControl>
  );
}

const periods = ['일', '개월', '년'];
