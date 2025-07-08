import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import { grey } from '@mui/material/colors';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';
import AlertModal from './alert';
import { insertEdgeAPI, updateEdgeAPI } from '../../apis/api/edge';

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

interface EdgeGateway {
  eg_idx: number;
  eg_pc_name?: string;
  eg_ip_port: string;
  eg_network?: number;
  createdAt?: string;
}

interface CustomizedDialogsProps {
  modalType?: 'insert' | 'update';
  open: boolean;
  handleClose: () => void;
  edgeGatewayData?: EdgeGateway | null;
  handleInsert?: () => void;
  handleUpdate?: () => void;
}

export default function CustomizedDialogs({
  modalType = 'insert',
  open,
  handleClose,
  edgeGatewayData = null,
  handleInsert,
  handleUpdate,
}: CustomizedDialogsProps) {
  const [pcName, setPcName] = useState('');
  const [pcIp, setPcIp] = useState('');
  const [pcPort, setPcPort] = useState('');
  const [edgeGatewayId, setEdgeGatewayId] = useState<number | null>(null);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });
  const userIdx = useRecoilValue(userState)?.user_idx;

  const handleEdgeGatewayDataChange = () => {
    if (edgeGatewayData) {
      setPcName(edgeGatewayData.eg_pc_name || '');
      const [ip, port] = edgeGatewayData.eg_ip_port.split(':');
      setPcIp(ip || '');
      setPcPort(port || '');
      setEdgeGatewayId(edgeGatewayData.eg_idx);
    } else {
      handleReset();
    }
  };

  useEffect(() => {
    handleEdgeGatewayDataChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edgeGatewayData, open]);

  const validateIp = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const handleAction = async () => {
    if (!pcName || !pcIp || !pcPort) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '모든 필드를 입력해야 합니다.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }
    if (!validateIp(pcIp)) {
      setAlertModal({
        open: true,
        title: '알림',
        content: 'PC IP는 IPv4 정규식에 따라 [0~255.0~255.0~255.0~255]으로 입력해야 합니다.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    try {
      if (modalType === 'insert' && handleInsert) {
        await insertEdgeAPI({
          pcName,
          pcIp,
          pcPort,
          user_idx: userIdx,
        });
        handleInsert();
      } else if (modalType === 'update' && handleUpdate) {
        await updateEdgeAPI({
          eg_idx: edgeGatewayId,
          pcName,
          pcIp,
          pcPort,
          user_idx: userIdx,
        });
        handleUpdate();
      }
      handleClose();
    } catch (error: any) {
      setAlertModal({
        open: true,
        title: '오류',
        content: error?.message || '처리 중 오류가 발생했습니다.',
        type: 'alert',
        onConfirm: undefined,
      });
    }
  };

  const handleReset = () => {
    setPcName('');
    setPcIp('');
    setPcPort('');
    setEdgeGatewayId(null);
  };

  const getTitle = () => {
    if (modalType === 'insert') return 'Edge Gateway 등록';
    if (modalType === 'update') return 'Edge Gateway 수정';
    return 'Edge Gateway';
  };

  const getActionButtonText = () => {
    if (modalType === 'insert') return '등록';
    if (modalType === 'update') return '수정';
    return '확인';
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <BootstrapDialog onClose={handleClose} aria-labelledby='customized-dialog-title' open={open}>
        <DialogTitle sx={{ m: 0, p: 2 }} id='customized-dialog-title'>
          {getTitle()}
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
          <TableContainer component={Paper} className='modal-table'>
            <Table aria-label='simple table'>
              <TableBody>
                <TableRow>
                  <TableCell>PC 이름</TableCell>
                  <TableCell>
                    <div className='d-flex gap-5 flex-center'>
                      <TextField
                        hiddenLabel
                        id='outlined-size-small'
                        size='small'
                        value={pcName}
                        onChange={(e) => setPcName(e.target.value)}
                        className='width-120'
                      />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>PC IP:PORT</TableCell>
                  <TableCell>
                    <div className='d-flex gap-5 flex-center'>
                      <TextField
                        hiddenLabel
                        id='outlined-size-small'
                        size='small'
                        value={pcIp}
                        onChange={(e) => setPcIp(e.target.value)}
                        placeholder='예: 192.168.0.1'
                        className='width-120'
                      />
                      <span>:</span>
                      <TextField
                        hiddenLabel
                        type='number'
                        id='outlined-size-small'
                        size='small'
                        value={pcPort}
                        onChange={(e) => setPcPort(e.target.value)}
                        className='width-120'
                      />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAction} variant='contained' color='primary'>
            {getActionButtonText()}
          </Button>
          {modalType === 'insert' && (
            <Button autoFocus onClick={handleReset} variant='outlined' color='primary'>
              초기화
            </Button>
          )}
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
    </>
  );
}
