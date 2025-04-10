import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import SelectFacilityGroup from '../../components/select/facility_group';
import BasicDatePicker from '../../components/datepicker';
import ModalBasic from '../../components/modal';

import styled from '@mui/system/styled';
import { selectedDataFilesState } from '../../recoil/atoms';
import { useRecoilState } from 'recoil';

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
  const [selectedFiles, setSelectedFiles] = useRecoilState(selectedDataFilesState);

  const handleDelete = async () => {
    if (!window.confirm(`선택한 ${selectedFiles.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/file`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedFiles,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete items');
      }

      setSelectedFiles([]);

      // setRefreshTrigger((prev) => prev + 1);

      alert('선택한 항목이 삭제되었습니다.');
    } catch (err: any) {
      console.error('삭제 중 오류가 발생했습니다:', err.message);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}>
          <Grid container spacing={1}>
            {/* <Grid size={4}>
              <Grid container spacing={1}>
                <Grid size={4}>
                  <div>설비 그룹</div>
                </Grid>
                <Grid size={8}>
                  <SelectFacilityGroup />
                </Grid>
              </Grid>
            </Grid> */}

            <Grid size={4}>
              <Grid container spacing={1}>
                <Grid size={4} className='d-flex gap-5'>
                  <div>날짜</div>
                </Grid>
                <Grid size={8}>
                  <BasicDatePicker isDefault={true} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            {/* <Button variant='contained' color='success'>
              등록
            </Button> */}
            <ModalBasic />
            {/* <Button variant='outlined' color='success'>
              수정
            </Button> */}
            <Button variant='contained' color='error' onClick={handleDelete} disabled={selectedFiles.length === 0}>
              삭제
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
