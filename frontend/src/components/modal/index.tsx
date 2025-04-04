import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import { grey } from '@mui/material/colors';

import { FileUpload, FileUploadProps } from '../../components/fileupload'


const DeleteIcon = styled(ClearIcon)<IconProps>(() => ({
  fontSize:'1rem',
  color: '#637381',
  verticalAlign: 'top',
  cursor: 'pointer',
}));

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

const fileUploadProp: FileUploadProps = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (
          event.target.files !== null &&
          event.target?.files?.length > 0
      ) {
          console.log(`Saving ${event.target.value}`)
      }
  },
  onDrop: (event: React.DragEvent<HTMLElement>) => {
      console.log(`Drop ${event.dataTransfer.files[0].name}`)
  },
}


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
        <DialogContent dividers className="file-upload">
          <Box sx={{ typography: 'subtitle2' }}>json 파일</Box>
          <FileUpload {...fileUploadProp} />
          <div className="file-list">
            <Box sx={{ typography: 'body2' }}>업로드 파일 목록 <DeleteIcon /></Box>
          </div>
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
