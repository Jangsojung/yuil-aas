import React, { ChangeEvent, DragEvent, useEffect, useState } from 'react';
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

import { FileUpload, FileUploadProps } from '../../components/fileupload';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';
import LoadingOverlay from '../loading/LodingOverlay';

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

interface File {
  af_idx: number;
  af_name: string;
  createdAt: Date;
}

interface Props {
  open: boolean;
  handleClose: () => void;
  fileData: File | null;
  handleUpdate: (file: File) => void;
}

export default function CustomizedDialogs({ open, handleClose, fileData = null, handleUpdate }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [af_idx, setAf_Idx] = useState<number | null>(null);
  const userIdx = useRecoilValue(userState)?.user_idx;

  const title = selectedFile ? `${selectedFile.af_name} 수정` : '데이터 수정';

  const fileUploadProp: FileUploadProps = {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files !== null && event.target?.files?.length > 0) {
        const file = event.target.files[0];
        setUploadFile(file);
      }
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      const file = event.dataTransfer.files[0];
      setUploadFile(file);
    },
    selectedFileName: selectedFile?.af_name || '',
    accept: '.json',
  };

  const handleEdit = async () => {
    const { name } = uploadFile;

    if (!name.toLowerCase().endsWith('.json')) {
      alert('JSON 파일만 업로드 가능합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5001/api/file?af_idx=${af_idx}&user_idx=${userIdx}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to edit Python JSON File`);
      }

      const result = await response.json();

      const newFile = {
        af_idx: fileData?.af_idx,
        af_name: result.fileName,
        createdAt: fileData?.createdAt || new Date(),
      };

      alert('성공적으로 json파일을 수정하였습니다.\n파일 위치: /files/aas');
      handleUpdate(newFile);
      handleClose();
    } catch (err) {
      console.error(err.message);
      alert('업로드 중 오류 발생: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadFile(null);
    setAf_Idx(null);
  };

  useEffect(() => {
    if (fileData) {
      setSelectedFile(fileData);
      setAf_Idx(fileData.af_idx);
    } else {
      handleReset();
    }
  }, [fileData, open]);

  return (
    <BootstrapDialog onClose={handleClose} aria-labelledby='customized-dialog-title' open={open}>
      {isLoading && <LoadingOverlay />}
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
      <DialogContent dividers className='file-upload'>
        <Box sx={{ typography: 'subtitle2' }}>json 파일</Box>
        <FileUpload {...fileUploadProp} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEdit} variant='contained' color='primary' disabled={uploadFile == null}>
          확인
        </Button>

        <GreyButton variant='outlined' onClick={handleClose}>
          취소
        </GreyButton>
      </DialogActions>
    </BootstrapDialog>
  );
}
