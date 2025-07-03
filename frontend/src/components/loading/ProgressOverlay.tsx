import React from 'react';
import { Box, LinearProgress, Typography, Backdrop } from '@mui/material';

interface ProgressOverlayProps {
  open: boolean;
  progress: number;
  label?: string;
  zIndex?: number;
}

export default function ProgressOverlay({ open, progress, label, zIndex = 1300 }: ProgressOverlayProps) {
  return (
    <Backdrop open={open} sx={{ zIndex, color: '#fff' }}>
      <Box
        sx={{
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 3,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant='h6' sx={{ mb: 2 }}>
          {label || '데이터를 불러오는 중입니다...'}
        </Typography>
        <Box sx={{ width: '100%', mb: 1 }}>
          <LinearProgress variant='determinate' value={progress} />
        </Box>
        <Typography variant='body2' color='text.secondary'>{`${Math.round(progress)}%`}</Typography>
      </Box>
    </Backdrop>
  );
}
