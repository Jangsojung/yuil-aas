import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/system/Grid';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { grey } from '@mui/material/colors';

//switch
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';

import { useRecoilState } from 'recoil';
import { dataTableRefreshTriggerState, edgeGatewayRefreshState } from '../../recoil/atoms';
import { FileUpload, FileUploadProps } from '../../components/fileupload';
import { CircularProgress } from '@mui/material';

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

interface FileProps {
  open: boolean;
  handleClose: () => void;
  fileData: File | null;
}

export default function CustomizedDialogs({ open, handleClose, fileData = null }: FileProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadFile, setUploadFile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = useRecoilState(dataTableRefreshTriggerState);
  const [af_idx, setAf_Idx] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (fileData) {
      setSelectedFile(fileData);
      setAf_Idx(fileData.af_idx);
    } else {
      handleReset();
    }
  }, [fileData, open]);

  const fileUploadProp: FileUploadProps = {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files !== null && event.target?.files?.length > 0) {
        const file = event.target.files[0];
        setUploadFile(file);
      }
    },
    onDrop: (event: React.DragEvent<HTMLElement>) => {
      const file = event.dataTransfer.files[0];
      setUploadFile(file);
    },
    selectedFileName: selectedFile?.af_name || '',
  };

  const handleEdit = async () => {
    const { name } = uploadFile;

    if (!name.toLowerCase().endsWith('.json')) {
      alert('JSON 파일만 업로드 가능합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5001/api/file?af_idx=${af_idx}`, {
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
      console.log('업로드 결과:', result);

      alert('성공적으로 json파일을 수정하였습니다.\n파일 위치: /files/aas');
      setRefreshTrigger((prev) => prev + 1);
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

  const title = selectedFile ? `${selectedFile.af_name} 수정` : '데이터 수정';

  return (
    <BootstrapDialog onClose={handleClose} aria-labelledby='customized-dialog-title' open={open}>
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
        {/* <div className='file-list'>
            <Box sx={{ typography: 'body2' }}>
              업로드 파일 목록 <DeleteIcon />
            </Box>
          </div> */}
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
