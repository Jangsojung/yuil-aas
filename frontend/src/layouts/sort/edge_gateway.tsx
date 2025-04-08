import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import SelectFactory from '../../components/select/factory';
import SelectPeriod from '../../components/select/period';
import TextField from '../../components/input';
import ModalBasic from '../../components/modal/edgemodal';

import styled from '@mui/system/styled';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { edgeGatewayRefreshState, selectedEdgeGatewaysState } from '../../recoil/atoms';
import CustomizedDialogs from '../../components/modal/edgemodal';

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
  const [selectedEdgeGateways, setSelectedEdgeGateways] = useRecoilState(selectedEdgeGatewaysState);

  const [refreshTrigger, setRefreshTrigger] = useRecoilState(edgeGatewayRefreshState);
  const [openInsertModal, setOpenInsertModal] = React.useState(false);

  const handleDelete = async () => {
    if (selectedEdgeGateways.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedEdgeGateways.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/edge_gateway/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedEdgeGateways,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete items');
      }

      setSelectedEdgeGateways([]);

      setRefreshTrigger((prev) => prev + 1);

      alert('선택한 항목이 삭제되었습니다.');
    } catch (err: any) {
      console.error('삭제 중 오류가 발생했습니다:', err.message);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 등록 모달 열기
  const handleOpenInsertModal = () => {
    setOpenInsertModal(true);
  };

  // 모달 닫기 핸들러
  const handleCloseInsertModal = () => {
    setOpenInsertModal(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}></Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            {/* <ModalBasic /> */}
            <Button variant='contained' color='success' onClick={handleOpenInsertModal}>
              등록
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={handleDelete}
              disabled={selectedEdgeGateways.length === 0}
            >
              삭제
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* 등록 모달 */}
      <CustomizedDialogs modalType='insert' open={openInsertModal} handleClose={handleCloseInsertModal} />
    </Box>
  );
}
