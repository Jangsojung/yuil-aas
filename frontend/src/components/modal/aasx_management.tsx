import React, { Fragment, useState } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { grey } from '@mui/material/colors';
import AlertModal from './alert';

import { FileUpload } from '../../components/fileupload';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';
import LoadingOverlay from '../loading/LodingOverlay';
import ProgressOverlay from '../loading/ProgressOverlay';
import { uploadAASXFileAPI } from '../../apis/api/aasx_manage';

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

interface Props {
  handleInsert: (file: any) => void;
}

export default function CustomizedDialogs({ handleInsert }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [sizeWarning, setSizeWarning] = useState('');
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });
  const userIdx = useRecoilValue(userState)?.user_idx;

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
  };

  const handleAdd = async () => {
    if (!selectedFile) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '파일을 선택해주세요.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.json')) {
      setAlertModal({
        open: true,
        title: '알림',
        content: 'JSON 파일만 업로드 가능합니다.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    setIsLoading(true);
    setProgress(0);

    // 파일 크기 경고 메시지 생성
    const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
    const warning =
      parseFloat(fileSizeMB) > 10 ? `\n\n⚠️ 파일 크기: ${fileSizeMB}MB\n처리 시간이 오래 걸릴 수 있습니다.` : '';
    setSizeWarning(warning);

    try {
      setProgress(10);
      setProgressLabel('시작 ...'); // 시작
      setProgress(20);
      setProgressLabel('파일 검증 ...'); // 파일 검증
      setProgress(30);
      setProgressLabel('파일 업로드 시작 ...'); // 파일 업로드 시작
      setProgress(40);
      setProgressLabel('파일 업로드 완료 ...'); // 파일 업로드 완료
      setProgress(50);
      setProgressLabel('AAS 파일 생성 중 ...'); // AAS 파일 생성 시작

      const result = await uploadAASXFileAPI(selectedFile, userIdx);

      setProgress(80);
      setProgressLabel('AASX 파일 생성 중 ...'); // AASX 파일 생성 시작
      setProgress(90);
      setProgressLabel('DB 저장 ...'); // DB 저장
      setProgress(100);
      setProgressLabel('완료 ...'); // 완료

      const newFile = {
        af_idx: result.af_idx,
        af_name: result.fileName,
        createdAt: new Date(),
      };

      setAlertModal({
        open: true,
        title: '변환 완료',
        content:
          result.message ||
          '성공적으로 변환이 완료되었습니다.\n\n생성된 파일:\n• AAS JSON 파일 (/files/aas)\n• AASX 파일 (/files/aasx)',
        type: 'alert',
        onConfirm: undefined,
      });
      handleInsert(newFile);
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || (typeof err === 'string' ? err : '알 수 없는 오류');
      if (msg.includes('이미 생성되어있는 파일입니다.')) {
        setAlertModal({
          open: true,
          title: '알림',
          content: '이미 생성되어있는 파일입니다.',
          type: 'alert',
          onConfirm: undefined,
        });
      } else {
        setAlertModal({
          open: true,
          title: '오류',
          content: '업로드 중 오류 발생: ' + msg,
          type: 'alert',
          onConfirm: undefined,
        });
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressLabel('');
      setSizeWarning('');
    }
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  return (
    <Fragment>
      <Button variant='contained' color='primary' onClick={handleClickOpen}>
        <AddIcon />
        파일등록
      </Button>

      {isLoading && <ProgressOverlay open={isLoading} progress={progress} label={`${progressLabel}${sizeWarning}`} />}

      <BootstrapDialog onClose={handleClose} aria-labelledby='customized-dialog-title' open={open}>
        <DialogTitle sx={{ m: 0, p: 2 }} id='customized-dialog-title'>
          AASX 파일 추가
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FileUpload
              accept='.json'
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setSelectedFile(file);
              }}
              onDrop={(event) => {
                const file = event.dataTransfer.files[0] || null;
                setSelectedFile(file);
              }}
              selectedFileName={selectedFile?.name}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAdd} variant='contained' color='primary' disabled={isLoading}>
            {isLoading ? '업로드 중...' : '추가'}
          </Button>
          <GreyButton variant='outlined' onClick={handleClose}>
            취소
          </GreyButton>
        </DialogActions>
      </BootstrapDialog>

      {/* Alert Modal */}
      <AlertModal
        open={alertModal.open}
        handleClose={handleCloseAlert}
        title={alertModal.title}
        content={alertModal.content}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </Fragment>
  );
}
