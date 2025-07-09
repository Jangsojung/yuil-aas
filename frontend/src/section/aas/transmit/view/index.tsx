import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/system/Grid';
import TreeView from '../../../../components/treeview';
import { useRecoilValue } from 'recoil';
import { isVerifiedState } from '../../../../recoil/atoms';
import React from 'react';

export default function TransmitView() {
  const isVerified = useRecoilValue(isVerifiedState);

  return (
    <div className='table-wrap'>
      <Grid container spacing={2}>
        <Grid size={100}>
          {isVerified ? (
            <TreeView />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '4px',
              }}
            >
              검증하기 버튼을 눌러 AASX 파일을 검증해주세요.
            </Box>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
