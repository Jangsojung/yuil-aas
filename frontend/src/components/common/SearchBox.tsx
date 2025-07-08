import React, { ReactNode } from 'react';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

interface SearchBoxProps {
  children: ReactNode;
  buttons?: Array<{
    text: string;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'inherit';
    variant?: 'text' | 'outlined' | 'contained';
    disabled?: boolean;
  }>;
  buttonAlign?: 'left' | 'center' | 'right';
}

export default function SearchBox({ children, buttons = [], buttonAlign = 'right' }: SearchBoxProps) {
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
    <Grid container className='sort-box'>
      <Grid size={buttons.length > 0 ? 10 : 12}>{children}</Grid>
      {buttons.length > 0 && (
        <Grid size={2}>
          <Stack direction='row' style={{ gap: 5, justifyContent: getAlignment() }}>
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
  );
}
