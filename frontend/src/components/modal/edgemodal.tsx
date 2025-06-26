import React, { useEffect, useState } from 'react';
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

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { grey } from '@mui/material/colors';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';

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
    width: '550px',
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

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName='.Mui-focusVisible' disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  margin: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#65C466',
        opacity: 1,
        border: 0,
        ...theme.applyStyles('dark', {
          backgroundColor: '#2ECA45',
        }),
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[100],
      ...theme.applyStyles('dark', {
        color: theme.palette.grey[600],
      }),
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
      ...theme.applyStyles('dark', {
        opacity: 0.3,
      }),
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#E9E9EA',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
    ...theme.applyStyles('dark', {
      backgroundColor: '#39393D',
    }),
  },
}));

interface EdgeGateway {
  eg_idx: number;
  eg_server_temp: number;
  eg_network: number;
  eg_pc_temp: number;
  eg_ip_port: string;
  createdAt?: string;
}

interface CustomizedDialogsProps {
  modalType?: 'insert' | 'update';
  open: boolean;
  handleClose: () => void;
  edgeGatewayData?: EdgeGateway | null;
  handleInsert?: (eg: EdgeGateway) => void;
  handleUpdate?: (eg: EdgeGateway) => void;
}

export default function CustomizedDialogs({
  modalType = 'insert',
  open,
  handleClose,
  edgeGatewayData = null,
  handleInsert,
  handleUpdate,
}: CustomizedDialogsProps) {
  const [serverTemp, setServerTemp] = useState('');
  const [networkStatus, setNetworkStatus] = useState(true);
  const [pcTemp, setPcTemp] = useState('');
  const [pcIp, setPcIp] = useState('');
  const [pcPort, setPcPort] = useState('');
  const [edgeGatewayId, setEdgeGatewayId] = useState<number | null>(null);
  const userIdx = useRecoilValue(userState)?.user_idx;

  useEffect(() => {
    if (modalType === 'update' && edgeGatewayData) {
      setEdgeGatewayId(edgeGatewayData.eg_idx);
      setServerTemp(edgeGatewayData.eg_server_temp.toString());
      setNetworkStatus(edgeGatewayData.eg_network === 1);
      setPcTemp(edgeGatewayData.eg_pc_temp.toString());

      const ipPortParts = edgeGatewayData.eg_ip_port.split(':');
      if (ipPortParts.length === 2) {
        setPcIp(ipPortParts[0]);
        setPcPort(ipPortParts[1]);
      } else {
        setPcIp(edgeGatewayData.eg_ip_port);
        setPcPort('');
      }
    } else {
      handleReset();
    }
  }, [modalType, edgeGatewayData, open]);

  const handleNetworkStatusChange = (event) => {
    setNetworkStatus(event.target.checked);
  };

  const validateIp = (ip: string) => {
    const regex =
      /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
    return regex.test(ip);
  };

  const handleAction = async () => {
    if (!serverTemp || !pcTemp || !pcIp || !pcPort) {
      alert('모든 필드를 입력해야 합니다.');
      return;
    }
    if (!validateIp(pcIp)) {
      alert('PC IP는 IPv4 정규식에 따라 [0~255.0~255.0~255.0~255]으로 입력해야 합니다.');
      return;
    }

    const payload = {
      serverTemp,
      networkStatus,
      pcTemp,
      pcIp,
      pcPort,
    };

    try {
      let url = `http://localhost:5001/api/edge_gateway?user_idx=${userIdx}`;
      let method = 'POST';

      if (modalType === 'update') {
        url = `http://localhost:5001/api/edge_gateway?eg_idx=${edgeGatewayId}&user_idx=${userIdx}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${modalType === 'insert' ? '등록' : '수정'} edge gateway`);
      }

      const result = await response.json();

      const eg = {
        eg_idx: result.eg_idx,
        eg_server_temp: Number(serverTemp),
        eg_network: networkStatus ? 1 : 0,
        eg_pc_temp: Number(pcTemp),
        eg_ip_port: pcIp + ':' + pcPort,
      };

      if (modalType === 'insert') {
        handleInsert && handleInsert(eg);
        handleClose();
      } else if (modalType === 'update') {
        handleUpdate && handleUpdate();
        handleClose();
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleReset = () => {
    setServerTemp('');
    setPcTemp('');
    setPcIp('');
    setPcPort('');
    setNetworkStatus(true);
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
  return (
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
                <TableCell>서버온도</TableCell>
                <TableCell>
                  <div className='d-flex gap-5' style={{ alignItems: 'flex-start' }}>
                    <TextField
                      hiddenLabel
                      type='number'
                      id='outlined-size-small'
                      size='small'
                      value={serverTemp}
                      onChange={(e) => setServerTemp(e.target.value)}
                      style={{ width: 50 }}
                    />
                    <span>℃</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>네트워크상태</TableCell>
                <TableCell>
                  <FormGroup>
                    <FormControlLabel
                      control={<IOSSwitch sx={{ m: 1 }} checked={networkStatus} onChange={handleNetworkStatusChange} />}
                      label={networkStatus ? '연결 됨' : '연결 안 됨'}
                    />
                  </FormGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>PC 온도</TableCell>
                <TableCell>
                  <div className='d-flex gap-5' style={{ alignItems: 'flex-start' }}>
                    <TextField
                      hiddenLabel
                      type='number'
                      id='outlined-size-small'
                      size='small'
                      value={pcTemp}
                      onChange={(e) => setPcTemp(e.target.value)}
                      style={{ width: 50 }}
                    />
                    <span>℃</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>PC IP:PORT</TableCell>
                <TableCell>
                  <div className='d-flex gap-5' style={{ alignItems: 'center' }}>
                    <TextField
                      hiddenLabel
                      id='outlined-size-small'
                      size='small'
                      value={pcIp}
                      onChange={(e) => setPcIp(e.target.value)}
                      placeholder='예: 192.168.0.1'
                      style={{ width: 120 }}
                    />
                    <span>:</span>
                    <TextField
                      hiddenLabel
                      type='number'
                      id='outlined-size-small'
                      size='small'
                      value={pcPort}
                      onChange={(e) => setPcPort(e.target.value)}
                      style={{ width: 120 }}
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
  );
}
