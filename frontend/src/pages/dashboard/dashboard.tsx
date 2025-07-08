import React from 'react';
import Grid from '@mui/system/Grid';
import { Box } from '@mui/material';

export default function DashboardPage() {
  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 100px)', overflow: 'hidden', boxSizing: 'border-box' }}>
      <Grid
        container
        direction='column'
        sx={{ height: '100%', width: '100%', overflow: 'hidden', display: 'flex' }}
        spacing={2}
      >
        {/* 윗줄 */}
        <Grid container sx={{ flex: 1, minHeight: 0, display: 'flex' }} spacing={2}>
          <Grid size={6} sx={{ height: '100%' }}>
            <Box sx={{ border: '1px solid #222', height: '100%', background: '#fff' }} />
          </Grid>
          <Grid size={6} sx={{ height: '100%' }}>
            <Box sx={{ border: '1px solid #222', height: '100%', background: '#fff' }} />
          </Grid>
        </Grid>
        {/* 아랫줄 */}
        <Grid container sx={{ flex: 2, minHeight: 0, display: 'flex' }} spacing={2}>
          <Grid size={6} sx={{ height: '100%' }}>
            <Box sx={{ border: '1px solid #222', height: '100%', background: '#fff' }} />
          </Grid>
          <Grid size={6} sx={{ height: '100%' }}>
            <Box sx={{ border: '1px solid #222', height: '100%', background: '#fff' }} />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
