import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

interface Factory {
  fc_idx: number;
  fc_name: string;
}

export default function SelectSmall() {
  const [factories, setFactories] = React.useState<Factory[]>([]);
  const [currentFactory, setCurrentFactory] = React.useState<number>();

  React.useEffect(() => {
    getFactories();
  }, []);

  const getFactories = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/factories`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: Factory[] = await response.json();
      setFactories(data);
      setCurrentFactory(data[0].fc_idx);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleChange = (event: any) => {
    setCurrentFactory(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
      <InputLabel id='demo-select-small-label'>Factory</InputLabel>
      <Select
        labelId='demo-select-small-label'
        id='demo-select-small'
        value={currentFactory}
        label='Factory'
        onChange={handleChange}
      >
        {factories.map((factory) => (
          <MenuItem value={factory.fc_idx}>
            {factory.fc_idx} - {factory.fc_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
