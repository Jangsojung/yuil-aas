import React, { Dispatch, SetStateAction } from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { useRecoilState } from 'recoil';
import { edgeGatewayRefreshState, selectedBasesState } from '../../recoil/atoms';

interface Props {
  insertMode: boolean;
  setInsertMode: Dispatch<SetStateAction<boolean>>;
}

export default function Sort({ insertMode, setInsertMode }: Props) {
  const [selectedBases, setSelectedBases] = useRecoilState(selectedBasesState);
  const [, setRefreshTrigger] = useRecoilState(edgeGatewayRefreshState);

  const handleDelete = async () => {
    if (!window.confirm(`선택한 ${selectedBases.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedBases,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete items');
      }

      setSelectedBases([]);

      setRefreshTrigger((prev) => prev + 1);

      alert('선택한 항목이 삭제되었습니다.');
    } catch (err: any) {
      console.error('삭제 중 오류가 발생했습니다:', err.message);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}></Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <Button variant='contained' color='success' onClick={() => setInsertMode(true)}>
              등록
            </Button>
            <Button variant='contained' color='error' onClick={handleDelete} disabled={selectedBases.length === 0}>
              삭제
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
