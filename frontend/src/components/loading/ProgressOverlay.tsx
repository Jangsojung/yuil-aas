import React from 'react';
import { Box, LinearProgress, Typography, Backdrop } from '@mui/material';

interface ProgressOverlayProps {
  open: boolean;
  progress: number;
  label?: string;
  zIndex?: number;
}

export default function ProgressOverlay({ open, progress, label, zIndex = 1300 }: ProgressOverlayProps) {
  // 라벨과 경고 메시지를 분리
  const lines = label ? label.split('\n') : [];
  const progressLabel = lines[0] || '데이터를 불러오는 중입니다...';
  const warningMessage = lines.slice(1).join('\n');

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
        {warningMessage && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ mb: 2, textAlign: 'center', whiteSpace: 'pre-line' }}
          >
            {warningMessage}
          </Typography>
        )}
        <Box sx={{ width: '100%', mb: 1 }}>
          <LinearProgress variant='determinate' value={progress} />
        </Box>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            {progressLabel}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      </Box>
    </Backdrop>
  );
}
