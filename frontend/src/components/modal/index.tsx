import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import { grey } from '@mui/material/colors';

import { FileUpload, FileUploadProps } from '../../components/fileupload';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFactoryState, dataTableRefreshTriggerState, edgeGatewayRefreshState } from '../../recoil/atoms';
import { CircularProgress } from '@mui/material';

const DeleteIcon = styled(ClearIcon)<IconProps>(() => ({
  fontSize: '1rem',
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

export default function CustomizedDialogs() {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const currentFactory = useRecoilValue(currentFactoryState);
  const [refreshTrigger, setRefreshTrigger] = useRecoilState(dataTableRefreshTriggerState);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
  };

  const fileUploadProp: FileUploadProps = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files !== null && event.target?.files?.length > 0) {
        const file = event.target.files[0];
        setSelectedFile(file);
      }
    },
    onDrop: (event: React.DragEvent<HTMLElement>) => {
      const file = event.dataTransfer.files[0];
      setSelectedFile(file);
    },
    selectedFileName: selectedFile?.name || '',
  };

  const handleAdd = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.json')) {
      alert('JSON 파일만 업로드 가능합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const fileName = selectedFile.name;

      const response = await fetch(`http://localhost:5001/api/file?fc_idx=${currentFactory}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        throw new Error('파일 업로드 실패');
      }

      const result = await response.json();
      console.log('업로드 결과:', result);

      alert('성공적으로 json파일을 업로드하였습니다.\n파일 위치: /files/aas');
      setRefreshTrigger((prev) => prev + 1);
      handleClose();
    } catch (err) {
      console.error(err.message);
      alert('업로드 중 오류 발생: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <Button variant='contained' color='primary' onClick={handleClickOpen}>
        <AddIcon />
        파일등록
      </Button>
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <CircularProgress />
        </div>
      )}

      <BootstrapDialog onClose={handleClose} aria-labelledby='customized-dialog-title' open={open}>
        <DialogTitle sx={{ m: 0, p: 2 }} id='customized-dialog-title'>
          제1공장 AAS 등록
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
        <DialogContent dividers className='file-upload'>
          <Box sx={{ typography: 'subtitle2' }}>json 파일</Box>
          <FileUpload {...fileUploadProp} />
          {/* <div className='file-list'>
            <Box sx={{ typography: 'body2' }}>
              업로드 파일 목록 <DeleteIcon />
            </Box>
          </div> */}
        </DialogContent>
        <DialogActions>
          {/* <Button variant='outlined' color='primary'>
            변환
          </Button> */}
          <Button autoFocus onClick={handleAdd} variant='contained' color='primary'>
            등록
          </Button>
          <GreyButton variant='outlined' color='grey' onClick={handleClose}>
            취소
          </GreyButton>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
