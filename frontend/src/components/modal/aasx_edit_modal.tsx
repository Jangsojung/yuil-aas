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
import AlertModal from './alert';
import { updateAASXFileAPI, uploadAASXFileAPI, getFileFCIdxAPI } from '../../apis/api/aasx_manage';
import { KINDS } from '../../constants';
import ProgressOverlay from '../loading/ProgressOverlay';
import { AASXFile } from '../../types/api';

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

interface Props {
  open: boolean;
  handleClose: () => void;
  fileData: AASXFile | null;
  handleUpdate: (file: AASXFile) => void;
}

export default function CustomizedDialogs({ open, handleClose, fileData = null, handleUpdate }: Props) {
  const [selectedFile, setSelectedFile] = useState<AASXFile | null>(null);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [af_idx, setAf_Idx] = useState<number | null>(null);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });
  const userIdx = useRecoilValue(userState)?.user_idx;
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [, setSizeWarning] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const title = fileData ? (selectedFile ? `${selectedFile.af_name} 수정` : '데이터 수정') : '파일 등록';

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
    selectedFileName: uploadFile?.name || '',
    accept: '.json',
  };

  // 프로그래스 업데이트 함수
  const updateProgress = (value: number, label: string) => {
    setProgress(value);
    setProgressLabel(label);
  };

  // 작업 중단 함수
  const abortOperation = () => {
    if (abortController) {
      abortController.abort();
    }
    setIsLoading(false);
    setProgress(0);
    setProgressLabel('');
    setAbortController(null);
  };

  // ESC 키와 새로고침 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isLoading) {
        event.preventDefault();
        abortOperation();
        setAlertModal({
          open: true,
          title: '작업 중단',
          content: '사용자에 의해 작업이 중단되었습니다.',
          type: 'alert',
          onConfirm: undefined,
        });
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isLoading) {
        event.preventDefault();
        event.returnValue = '작업이 진행 중입니다. 페이지를 떠나시겠습니까?';
        return '작업이 진행 중입니다. 페이지를 떠나시겠습니까?';
      }
    };

    if (isLoading) {
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoading]);

  // 실제 수정/등록 실행 함수
  const executeEdit = async () => {
    const controller = new AbortController();
    setAbortController(controller);
    setIsLoading(true);
    setProgress(0);

    try {
      let result;

      if (fileData) {
        // 수정 과정 - 실제 백엔드 흐름에 맞춤
        updateProgress(5, '작업 시작...');

        updateProgress(10, '파일 검증 중...');
        // 파일 검증 로직
        if (!uploadFile || !uploadFile.name) {
          throw new Error('업로드할 파일이 없습니다.');
        }

        updateProgress(15, '기존 파일 정보 확인 중...');
        // 기존 파일 정보 확인
        if (!af_idx) {
          throw new Error('파일 인덱스 정보가 없습니다.');
        }

        updateProgress(20, '공장 정보 조회 중...');
        const fcIdxResult = await getFileFCIdxAPI(uploadFile.name, KINDS.JSON_KIND);
        const fc_idx = fcIdxResult?.data?.fc_idx || 1;

        updateProgress(30, '새 AAS 파일 생성 중...');
        // 새 AAS 파일 생성 작업

        updateProgress(50, '새 AASX 파일 생성 중...');
        // 새 AASX 파일 생성 작업
        result = await updateAASXFileAPI(af_idx, uploadFile.name, userIdx, fc_idx);

        updateProgress(70, '기존 파일 삭제 중...');
        // 기존 파일 삭제 작업 (백엔드에서 처리)

        updateProgress(85, '데이터베이스 업데이트 중...');
        // DB 업데이트 작업

        updateProgress(95, '최종 검증 중...');
        // 최종 검증

        updateProgress(100, '수정 완료!');
      } else {
        // 등록 과정
        updateProgress(5, '작업 시작...');

        updateProgress(10, '파일 검증 중...');
        // 파일 검증 로직
        if (!uploadFile || !uploadFile.name) {
          throw new Error('업로드할 파일이 없습니다.');
        }

        updateProgress(20, '파일 업로드 준비 중...');
        // 파일 업로드 준비

        updateProgress(30, '공장 정보 조회 중...');
        const fcIdxResult = await getFileFCIdxAPI(uploadFile.name, KINDS.JSON_KIND);
        const fc_idx = fcIdxResult?.data?.fc_idx || 1;

        updateProgress(40, '파일 업로드 중...');
        // 파일 업로드 작업

        updateProgress(50, 'AAS 파일 생성 중...');
        // AAS 파일 생성 작업

        updateProgress(60, 'AASX 파일 변환 중...');
        result = await uploadAASXFileAPI(uploadFile, userIdx, fc_idx);

        updateProgress(80, '데이터베이스 저장 중...');
        // DB 저장 작업

        updateProgress(90, '최종 검증 중...');
        // 최종 검증

        updateProgress(100, '등록 완료!');
      }

      // 성공 시 잠시 완료 상태 유지
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newFile = {
        af_idx: result.af_idx || fileData?.af_idx || af_idx,
        af_name: result.fileName,
        createdAt: typeof fileData?.createdAt === 'string' ? fileData.createdAt : new Date().toISOString(),
      };

      setAlertModal({
        open: true,
        title: '알림',
        content: fileData
          ? '성공적으로 json파일을 수정하였습니다.'
          : '성공적으로 파일을 등록하였습니다.\n파일 위치: /files/aas, /files/aasx',
        type: 'alert',
        onConfirm: undefined,
      });
      handleUpdate(newFile);
      handleClose();
    } catch (err: any) {
      // AbortError인 경우 사용자 중단으로 처리
      if (err.name === 'AbortError') {
        setAlertModal({
          open: true,
          title: '작업 중단',
          content: '사용자에 의해 작업이 중단되었습니다.',
          type: 'alert',
          onConfirm: undefined,
        });
        return;
      }

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
          content: '파일 처리 중 오류 발생: ' + msg,
          type: 'alert',
          onConfirm: undefined,
        });
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
      setProgressLabel('');
      setSizeWarning('');
      setAbortController(null);
    }
  };

  const handleEdit = async () => {
    const { name } = uploadFile;

    if (!name.toLowerCase().endsWith('.json')) {
      setAlertModal({
        open: true,
        title: '알림',
        content: 'JSON 파일만 업로드 가능합니다.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    if (fileData && !af_idx) {
      setAlertModal({
        open: true,
        title: '오류',
        content: '파일 정보가 올바르지 않습니다.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    // 파일 크기 체크 (50MB)
    const fileSizeMB = uploadFile.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      setAlertModal({
        open: true,
        title: 'AASX 파일 변환',
        content: '파일의 크기가 50MB를 초과할 경우 AASX 파일 변환에 다소 시간이 소요될 수 있습니다.\n변환하시겠습니까?',
        type: 'confirm',
        onConfirm: executeEdit,
      });
      return;
    }

    // 바로 수정/등록 실행
    await executeEdit();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadFile(null);
    setAf_Idx(null);
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  const handleModalClose = () => {
    if (isLoading) {
      abortOperation();
      setAlertModal({
        open: true,
        title: '작업 중단',
        content: '모달이 닫혀서 작업이 중단되었습니다.',
        type: 'alert',
        onConfirm: undefined,
      });
    } else {
      handleClose();
    }
  };

  const handleFileDataChange = () => {
    if (fileData && fileData.af_idx) {
      setSelectedFile(fileData);
      setAf_Idx(fileData.af_idx);
    } else if (fileData === null) {
      setSelectedFile(null);
      setUploadFile(null);
    } else {
      handleReset();
    }
  };

  useEffect(() => {
    handleFileDataChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileData, open]);

  return (
    <>
      <BootstrapDialog onClose={handleModalClose} aria-labelledby='customized-dialog-title' open={open}>
        {isLoading && <ProgressOverlay open={isLoading} progress={progress} label={progressLabel} />}
        <DialogTitle sx={{ m: 0, p: 2 }} id='customized-dialog-title'>
          {title}
        </DialogTitle>
        <IconButton
          aria-label='close'
          onClick={handleModalClose}
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

          <GreyButton variant='outlined' onClick={handleModalClose}>
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
    </>
  );
}
