import React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

interface ActionBoxProps {
  buttons: Array<{
    text: string;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'inherit';
    variant?: 'text' | 'outlined' | 'contained';
    disabled?: boolean;
    icon?: React.ReactNode;
  }>;
  align?: 'left' | 'center' | 'right';
  leftContent?: React.ReactNode;
}

export default function ActionBox({ buttons, align = 'right', leftContent }: ActionBoxProps) {
  const getAlignment = () => {
    switch (align) {
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
      <Grid
        container
        spacing={1}
        sx={{
          display: 'grid',
          gridTemplateColumns: leftContent ? '2fr 1fr' : '1fr',
          gap: 1,
        }}
      >
        {leftContent && <Grid>{leftContent}</Grid>}
        <Grid>
          <Stack spacing={1} direction='row' sx={{ justifyContent: getAlignment() }}>
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant || 'contained'}
                color={button.color || 'primary'}
                onClick={button.onClick}
                disabled={button.disabled}
                startIcon={button.icon}
              >
                {button.text}
              </Button>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
