import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { grey } from '@mui/material/colors';

const GreyButton = styled(Button)(({ theme }) => ({
  color: '#637381',
  fontWeight: 'bold',
  backgroundColor: '#ffffff',
  borderColor: grey[300],
  '&:hover': {
    backgroundColor: grey[300],
  },
}));

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '.MuiDialog-paper': {
    width: '500px',
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialogTitle-root': {
    color: '#637381',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  '& .MuiDialog-paper': {
    borderRadius: 0,
  },
}));

interface BasicModalProps {
  open: boolean;
  handleClose: () => void;
  handleAdd: () => void;
  handleReset: () => void;
  selectedSensorCount: number;
  name: string;
  setName: (v: string) => void;
  desc: string;
  setDesc: (v: string) => void;
  isEditMode?: boolean;
}

export default function BasicModal({
  open,
  handleClose,
  handleAdd,
  handleReset,
  selectedSensorCount,
  name,
  setName,
  desc,
  setDesc,
  isEditMode = false,
}: BasicModalProps) {
  return (
    <BootstrapDialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {isEditMode ? '기초코드 수정 팝업' : '기초코드 등록 팝업'}
        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <span className='sensor-count'>선택한 센서 개수</span>
          <span className='sensor-count-value'>{selectedSensorCount}개</span>
        </Box>
        <Box component='form' noValidate autoComplete='off'>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={3} className='form-label'>
              기초코드명
            </Grid>
            <Grid item xs={9}>
              <TextField
                value={name}
                onChange={(e) => setName(e.target.value)}
                size='small'
                fullWidth
                placeholder='기초코드명을 입력하세요'
              />
            </Grid>
            <Grid item xs={3} className='form-label'>
              비고
            </Grid>
            <Grid item xs={9}>
              <TextField
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                size='small'
                fullWidth
                multiline
                minRows={3}
                maxRows={5}
                inputProps={{ maxLength: 500 }}
                helperText={`${desc.length}/500`}
                placeholder='비고를 입력하세요'
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' color='primary' onClick={handleAdd}>
          {isEditMode ? '수정' : '등록'}
        </Button>
        <GreyButton variant='outlined' onClick={handleReset}>
          초기화
        </GreyButton>
        <GreyButton variant='outlined' onClick={handleClose}>
          취소
        </GreyButton>
      </DialogActions>
    </BootstrapDialog>
  );
}
