import React, { ReactNode } from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

interface FilterBoxProps {
  leftContent: ReactNode;
  buttons?: Array<{
    text: string;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'inherit';
    variant?: 'text' | 'outlined' | 'contained';
    disabled?: boolean;
  }>;
  buttonAlign?: 'left' | 'center' | 'right';
}

export default function FilterBox({ leftContent, buttons = [], buttonAlign = 'right' }: FilterBoxProps) {
  const getAlignment = () => {
    switch (buttonAlign) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
      default:
        return 'flex-end';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid item xs={buttons.length > 0 ? 8 : 12}>
          {leftContent}
        </Grid>
        {buttons.length > 0 && (
          <Grid item xs={4}>
            <Stack spacing={1} direction='row' sx={{ justifyContent: getAlignment() }}>
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant || 'contained'}
                  color={button.color || 'success'}
                  onClick={button.onClick}
                  disabled={button.disabled}
                >
                  {button.text}
                </Button>
              ))}
            </Stack>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
