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

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
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
          Edge Gateway 등록
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
          <Grid container spacing={1}>
            <Grid size={4}>
              <Grid container spacing={1}>
                <Grid size={6}>
                  <Box sx={{ typography: 'subtitle2' }}>서버 온도</Box>
                </Grid>
                <Grid size={6} className="d-flex gap-5 align-flex-end">
                  <TextField
                    hiddenLabel
                    id="outlined-size-small"
                    size="small"
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
                      control={<IOSSwitch sx={{ m: 1 }} defaultChecked />}
                      label="연결 됨"
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
                <Grid size={6} className="d-flex gap-5 align-flex-end">
                  <TextField
                    hiddenLabel
                    id="outlined-size-small"
                    size="small"
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
                <Grid size={8} className="d-flex gap-5 align-flex-end">
                  <TextField
                    hiddenLabel
                    id="outlined-size-small"
                    size="small"
                  />
                  <span>:</span>
                  <TextField
                    hiddenLabel
                    id="outlined-size-small"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='primary'>
            등록
          </Button>
          <Button autoFocus onClick={handleClose} variant="outlined" color='primary'>
            초기화
          </Button>
          <GreyButton variant="outlined" color='grey'>
            취소
          </GreyButton>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
