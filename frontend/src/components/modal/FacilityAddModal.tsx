import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { grey } from '@mui/material/colors';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';

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
    borderRadius: 0,
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
    borderBottomStyle: 'dashed',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiDialogTitle-root': {
    color: '#637381',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
}));

interface FacilityAddModalProps {
  open: boolean;
  handleClose: () => void;
  handleAdd: () => void;
  handleReset: () => void;
  groupList: string[];
  facilityList: string[];
  groupValue: string;
  setGroupValue: (v: string) => void;
  groupInput: string;
  setGroupInput: (v: string) => void;
  facilityValue: string;
  setFacilityValue: (v: string) => void;
  facilityInput: string;
  setFacilityInput: (v: string) => void;
  sensorName: string;
  setSensorName: (v: string) => void;
  isAddDisabled: boolean;
}

export default function FacilityAddModal({
  open,
  handleClose,
  handleAdd,
  handleReset,
  groupList,
  facilityList,
  groupValue,
  setGroupValue,
  groupInput,
  setGroupInput,
  facilityValue,
  setFacilityValue,
  facilityInput,
  setFacilityInput,
  sensorName,
  setSensorName,
  isAddDisabled,
}: FacilityAddModalProps) {
  return (
    <BootstrapDialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ m: 0, p: 2, borderBottom: '1px solid #e0e0e0', fontWeight: 700, fontSize: '1.1rem' }}>
        설비 등록 팝업
        <IconButton
          aria-label='close'
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, background: '#fff' }}>
        <TableContainer>
          <Table
            sx={{
              minWidth: 400,
              borderTop: '2px solid #bdbdbd',
              borderBottom: '2px solid #bdbdbd',
              borderCollapse: 'separate',
              borderSpacing: 0,
            }}
          >
            <TableBody>
              <TableRow sx={{ background: '#fff' }}>
                <TableCell
                  sx={{
                    width: 120,
                    color: '#222',
                    fontSize: 15,
                    borderRight: '1px solid #e0e0e0',
                    borderBottom: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    background: '#f7f7f7',
                  }}
                  align='left'
                >
                  설비그룹
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    background: '#fff',
                  }}
                >
                  <Grid container spacing={1} alignItems='center'>
                    <Grid item xs={7}>
                      <FormControl fullWidth size='small'>
                        <Select
                          value={groupValue}
                          onChange={(e) => setGroupValue(e.target.value as string)}
                          displayEmpty
                          sx={{ background: '#fff', borderRadius: 1 }}
                        >
                          <MenuItem value='신규등록'>신규등록</MenuItem>
                          {groupList.map((g) => (
                            <MenuItem key={g} value={g}>
                              {g}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        value={groupInput}
                        onChange={(e) => setGroupInput(e.target.value)}
                        size='small'
                        fullWidth
                        placeholder='설비그룹명 입력'
                        disabled={groupValue !== '신규등록'}
                        sx={{ background: groupValue === '신규등록' ? '#fff' : '#f0f0f0', borderRadius: 1 }}
                      />
                    </Grid>
                  </Grid>
                </TableCell>
              </TableRow>
              <TableRow sx={{ background: '#fff' }}>
                <TableCell
                  sx={{
                    color: '#222',
                    fontSize: 15,
                    borderRight: '1px solid #e0e0e0',
                    borderBottom: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    background: '#f7f7f7',
                  }}
                  align='left'
                >
                  설비명
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    background: '#fff',
                  }}
                >
                  <Grid container spacing={1} alignItems='center'>
                    <Grid item xs={7}>
                      <FormControl fullWidth size='small'>
                        <Select
                          value={facilityValue}
                          onChange={(e) => setFacilityValue(e.target.value as string)}
                          displayEmpty
                          sx={{ background: '#fff', borderRadius: 1 }}
                        >
                          <MenuItem value='신규등록'>신규등록</MenuItem>
                          {facilityList.map((f) => (
                            <MenuItem key={f} value={f}>
                              {f}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        value={facilityInput}
                        onChange={(e) => setFacilityInput(e.target.value)}
                        size='small'
                        fullWidth
                        placeholder='설비명 입력'
                        disabled={facilityValue !== '신규등록'}
                        sx={{ background: facilityValue === '신규등록' ? '#fff' : '#f0f0f0', borderRadius: 1 }}
                      />
                    </Grid>
                  </Grid>
                </TableCell>
              </TableRow>
              <TableRow sx={{ background: '#fff' }}>
                <TableCell
                  sx={{
                    color: '#222',
                    fontSize: 15,
                    borderRight: '1px solid #e0e0e0',
                    borderBottom: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    background: '#f7f7f7',
                  }}
                  align='left'
                >
                  센서명
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    background: '#fff',
                  }}
                >
                  <TextField
                    value={sensorName}
                    onChange={(e) => setSensorName(e.target.value)}
                    size='small'
                    fullWidth
                    placeholder='센서명을 입력하세요'
                    sx={{ background: '#fff', borderRadius: 1 }}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid #e0e0e0' }}>
        <Button variant='contained' color='primary' onClick={handleAdd} disabled={isAddDisabled}>
          등록
        </Button>
        <GreyButton variant='outlined' onClick={handleReset}>
          초기화
        </GreyButton>
        <GreyButton variant='outlined' onClick={handleClose}>
          취소
        </GreyButton>
      </DialogActions>
    </BootstrapDialog>
  );
}
