import * as React from 'react';
import TextField from '@mui/material/TextField';

export default function TextFieldSizes() {
  return (
    <div>
      <TextField label='number' type='number' id='outlined-size-small' defaultValue='Small' size='small' />
    </div>
  );
}
