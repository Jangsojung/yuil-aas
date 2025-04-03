import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { grey } from '@mui/material/colors';

const GreyButton = styled(Button)<ButtonProps>(() => ({
    color: '#637381',
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
    borderColor: grey[300],
    '&:hover': {
      backgroundColor: grey[300],
    },
    
}));


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialogTitle-root': {
    color: '#637381',
    fontSize: '1rem',
    fontWeight: 'bold',
  }
}));


export default function CustomizedDialogs() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
        <Button variant='contained' color='success' onClick={handleClickOpen}>
            등록
        </Button>
      
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          제1공장 AASX 등록
        </DialogTitle>
        <IconButton
          aria-label="close"
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
          
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='primary'>
            변환
          </Button>
          <Button autoFocus onClick={handleClose} variant="outlined" color='primary'>
            등록
          </Button>
          <GreyButton variant="outlined" color='grey'>
            취소
          </GreyButton>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
