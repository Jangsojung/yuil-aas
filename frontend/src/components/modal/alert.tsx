import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
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
    borderBottomStyle: 'dashed',
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

interface AlertProps {
  open: boolean;
  handleClose: () => void;
  title: string;
  content: React.ReactNode;
  type: 'alert' | 'confirm';
  onConfirm?: () => void;
}

export default function AlertModal({ open, handleClose, title, content, type, onConfirm }: AlertProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    handleClose();
  };

  return (
    <BootstrapDialog onClose={handleClose} aria-labelledby='customized-dialog-title' open={open}>
      <DialogTitle sx={{ m: 0, p: 2 }} id='customized-dialog-title'>
        {title}
      </DialogTitle>
      <IconButton
        aria-label='close'
        onClick={handleClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Box sx={{ typography: 'body1' }}>{content}</Box>
      </DialogContent>
      <DialogActions>
        {type === 'alert' ? (
          <Button onClick={handleClose} variant='contained' color='primary'>
            확인
          </Button>
        ) : (
          <>
            <Button onClick={handleConfirm} variant='contained' color='primary'>
              확인
            </Button>
            <GreyButton variant='outlined' onClick={handleClose}>
              취소
            </GreyButton>
          </>
        )}
      </DialogActions>
    </BootstrapDialog>
  );
}
