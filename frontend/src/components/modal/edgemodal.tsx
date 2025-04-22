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
import { grey } from '@mui/material/colors';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';

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

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName='.Mui-focusVisible' disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
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
  eg_ip_port: String;
}

interface CustomizedDialogsProps {
  modalType?: 'insert' | 'update';
  open: boolean;
  handleClose: () => void;
  edgeGatewayData: EdgeGateway | null;
  handleInsert: (eg: EdgeGateway) => void;
  handleUpdate: (eg: EdgeGateway) => void;
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
        setPcIp(edgeGatewayData.eg_ip_port.toString());
        setPcPort('');
      }
    } else {
      handleReset();
    }
  }, [modalType, edgeGatewayData, open]);

  const handleNetworkStatusChange = (event) => {
    setNetworkStatus(event.target.checked);
  };

  const handleAction = async () => {
    if (!serverTemp || !pcTemp || !pcIp || !pcPort) {
      alert('모든 필드를 입력해야 합니다.');
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
      let url = 'http://localhost:5001/api/edge_gateway';
      let method = 'POST';

      if (modalType === 'update') {
        url = `http://localhost:5001/api/edge_gateway?eg_idx=${edgeGatewayId}`;
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
        eg_server_temp: serverTemp,
        eg_network: networkStatus ? 1 : 0,
        eg_pc_temp: pcTemp,
        eg_ip_port: pcIp + ':' + pcPort,
      };

      modalType === 'insert' ? handleInsert(eg) : handleUpdate(eg);
      handleClose();
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

  const title = modalType === 'insert' ? 'Edge Gateway 등록' : 'Edge Gateway 수정';
  const actionButtonText = modalType === 'insert' ? '등록' : '수정';

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
      <DialogContent dividers className='file-upload'>
        <Grid container spacing={1}>
          <Grid size={4}>
            <Grid container spacing={1}>
              <Grid size={6}>
                <Box sx={{ typography: 'subtitle2' }}>서버 온도</Box>
              </Grid>
              <Grid size={6} className='d-flex gap-5 align-flex-end'>
                <TextField
                  hiddenLabel
                  type='number'
                  id='outlined-size-small'
                  size='small'
                  value={serverTemp}
                  onChange={(e) => setServerTemp(e.target.value)}
                />
                <span>℃</span>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={8}>
            <Grid container spacing={1}>
              <Grid size={4}>
                <Box sx={{ typography: 'subtitle2' }}>네트워크 상태</Box>
              </Grid>
              <Grid size={8}>
                <FormGroup>
                  <FormControlLabel
                    control={<IOSSwitch sx={{ m: 1 }} checked={networkStatus} onChange={handleNetworkStatusChange} />}
                    label={networkStatus ? '연결 됨' : '연결 안 됨'}
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={4}>
            <Grid container spacing={1}>
              <Grid size={6}>
                <Box sx={{ typography: 'subtitle2' }}>PC 온도</Box>
              </Grid>
              <Grid size={6} className='d-flex gap-5 align-flex-end'>
                <TextField
                  hiddenLabel
                  type='number'
                  id='outlined-size-small'
                  size='small'
                  value={pcTemp}
                  onChange={(e) => setPcTemp(e.target.value)}
                />
                <span>℃</span>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={8}>
            <Grid container spacing={1}>
              <Grid size={4}>
                <Box sx={{ typography: 'subtitle2' }}>PC IP:PORT</Box>
              </Grid>
              <Grid size={8} className='d-flex gap-5 align-flex-end'>
                <TextField
                  hiddenLabel
                  id='outlined-size-small'
                  size='small'
                  value={pcIp}
                  onChange={(e) => setPcIp(e.target.value)}
                />
                <span>:</span>
                <TextField
                  hiddenLabel
                  type='number'
                  id='outlined-size-small'
                  size='small'
                  value={pcPort}
                  onChange={(e) => setPcPort(e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAction} variant='contained' color='primary'>
          {actionButtonText}
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
