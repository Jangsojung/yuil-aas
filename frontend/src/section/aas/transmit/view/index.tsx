import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/system/Grid';
import TreeView from '../../../../components/treeview';
import BasicTabs from '../../../../components/tab';
import { useRecoilValue } from 'recoil';
import { isVerifiedState } from '../../../../recoil/atoms';

export default function TransmitView() {
  const isVerified = useRecoilValue(isVerifiedState);

  return (
    <Container maxWidth='lg' className='tree-wrap'>
      <Box sx={{ backgroundColor: '#ececec', padding: '10px', marginBottom: '10px' }} className='second-title'>
        선택한 aasx 파일 검증
      </Box>
      <Grid container spacing={2}>
        <Grid size={6}>
          <TreeView />
        </Grid>
        <Grid size={6}>
          {isVerified ? (
            <BasicTabs />
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
              검증 버튼을 눌러 AASX 파일을 검증해주세요.
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
