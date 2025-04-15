import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import SelectAASXFile from '../../components/select/aasx_files';

import styled from '@mui/system/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { aasxDataState, currentFileState, isVerifiedState } from '../../recoil/atoms';

const Item = styled('div')(({ theme }) => ({
  backgroundColor: '#fff',
  border: '1px solid',
  borderColor: '#ced7e0',
  padding: theme.spacing(1),
  borderRadius: '4px',
  textAlign: 'center',
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
    borderColor: '#444d58',
  }),
}));

export default function Sort() {
  const currentFile = useRecoilValue(currentFileState);
  const [, setAasxData] = useRecoilState(aasxDataState);
  const [, setIsVerified] = useRecoilState(isVerifiedState);
  const [selectedFileName, setSelectedFileName] = React.useState('');

  React.useEffect(() => {
    if (currentFile) {
      getSelectedFileName();
    }
  }, [currentFile]);

  const getSelectedFileName = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/file/filename/${currentFile}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file name');
      }

      const data = await response.json();
      setSelectedFileName(data.af_name);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/file/aas/${selectedFileName}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AASX data');
      }

      const data = await response.json();
      setAasxData(data);
      setIsVerified(true);
      console.log('AASX file verified:', data);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleRegister = () => {
    console.log('Register file with ID:', currentFile);
    // 등록 기능 구현
  };

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}>
          <Grid container spacing={1}>
            <Grid size={12}>
              <Grid container spacing={1}>
                <Grid>
                  <div className='sort-title'>AASX 파일</div>
                </Grid>
                <Grid>
                  <SelectAASXFile />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <Button variant='contained' color='success' onClick={handleVerify} disabled={!currentFile}>
              검증하기
            </Button>
            <Button variant='contained' color='primary' onClick={handleRegister} disabled={!currentFile}>
              등록
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
