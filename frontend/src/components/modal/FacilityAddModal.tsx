import React, { useState, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
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
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';
import { getFactoriesByCmIdxFacility, postFactory, postFacility, getFacilityGroups, getFacilities, postFacilityGroup, postSensor } from '../../apis/api/facility';

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
  onClose: () => void;
  onSuccess: () => void;
}

export default function FacilityAddModal({ open, onClose, onSuccess }: FacilityAddModalProps) {
  const user = useRecoilValue(userState);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  // 공장 관련 상태
  const [factories, setFactories] = useState<Array<{ fc_idx: number; fc_name: string }>>([]);
  const [selectedFactory, setSelectedFactory] = useState<number | ''>('');
  const [newFactoryName, setNewFactoryName] = useState('');
  const [isNewFactory, setIsNewFactory] = useState(false);

  // 설비그룹 관련 상태
  const [groupList, setGroupList] = useState<{ fg_idx: number; fg_name: string }[]>([]);
  const [facilityList, setFacilityList] = useState<{ fa_idx: number; fa_name: string }[]>([]);
  const [groupValue, setGroupValue] = useState('');
  const [groupInput, setGroupInput] = useState('');
  const [facilityValue, setFacilityValue] = useState('');
  const [facilityInput, setFacilityInput] = useState('');
  const [sensorName, setSensorName] = useState('');

  const fetchFactories = useCallback(async () => {
    try {
      const data = await getFactoriesByCmIdxFacility(user!.cm_idx);
      setFactories(data);
    } catch (error) {
      setError('공장 목록을 불러오는데 실패했습니다.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.cm_idx]);

  const fetchFacilityGroups = useCallback(
    async (fc_idx?: number) => {
      const targetFcIdx = fc_idx || selectedFactory;
      if (!targetFcIdx) return;

      try {
        const data = await getFacilityGroups(targetFcIdx as number);
        setGroupList(data.map((g: any) => ({ fg_idx: g.fg_idx, fg_name: g.fg_name })));
      } catch (error) {
        setError('설비그룹 목록을 불러오는데 실패했습니다.');
      }
    },
    [selectedFactory]
  );

  // 공장 목록 조회
  useEffect(() => {
    if (open && user?.cm_idx) {
      fetchFactories();
    }
  }, [open, user?.cm_idx, fetchFactories]);

  // 설비그룹 목록 조회
  useEffect(() => {
    if (selectedFactory && !isNewFactory) {
      fetchFacilityGroups();
    } else {
      setGroupList([]);
    }
  }, [selectedFactory, isNewFactory, fetchFacilityGroups]);

  // 설비그룹 선택 시 설비명 목록 fetch
  const handleGroupValueChange = async (value: string) => {
    setGroupValue(value);
    setGroupInput('');
    setFacilityValue('');
    setFacilityInput('');
    if (value && value !== '신규등록') {
      const group = groupList.find((g) => g.fg_name === value);
      if (group) {
        const facilities = await getFacilities(group.fg_idx);
        setFacilityList(
          facilities.map((f: any) => ({
            fa_idx: f.fa_idx,
            fa_name: f.fa_name,
          }))
        );
      }
    } else if (value === '신규등록') {
      setFacilityValue('신규등록');
      setFacilityList([]);
    } else {
      setFacilityList([]);
    }
  };

  // 설비명 select 연동
  const handleFacilityValueChange = (value: string) => {
    setFacilityValue(value);
    setFacilityInput('');
  };

  const handleAdd = async () => {
    // 검증
    if (isNewFactory && !newFactoryName.trim()) {
      setError('공장명을 입력해주세요.');
      return;
    }
    if (!isNewFactory && !selectedFactory) {
      setError('공장을 선택해주세요.');
      return;
    }
    if (!groupValue) {
      setError('설비그룹을 선택해주세요.');
      return;
    }
    if (groupValue === '신규등록' && !groupInput.trim()) {
      setError('설비그룹명을 입력해주세요.');
      return;
    }
    if (!facilityValue) {
      setError('설비명을 선택해주세요.');
      return;
    }
    if (facilityValue === '신규등록' && !facilityInput.trim()) {
      setError('설비명을 입력해주세요.');
      return;
    }
    if (!sensorName.trim()) {
      setError('센서명을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. 공장 인덱스
      let currentFcIdx = selectedFactory as number;
      if (isNewFactory) {
        const factoryResult = await postFactory({ cm_idx: user!.cm_idx, fc_name: newFactoryName });
        currentFcIdx = factoryResult;
        const updatedFactories = await getFactoriesByCmIdxFacility(user!.cm_idx);
        setFactories([...updatedFactories]);
        setIsNewFactory(false);
        setNewFactoryName('');
        setSelectedFactory(currentFcIdx);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // 2. 설비그룹 인덱스
      let currentFgIdx: number | undefined;
      if (groupValue === '신규등록') {
        const facilityGroupResult = await postFacilityGroup({ fc_idx: currentFcIdx, name: groupInput });
        currentFgIdx = facilityGroupResult;
        await fetchFacilityGroups(currentFcIdx);
        setGroupList((prev) => {
          const updated = !prev.find((g) => g.fg_name === groupInput)
            ? [...prev, { fg_idx: facilityGroupResult, fg_name: groupInput }]
            : prev;
          return updated;
        });
        setGroupValue(groupInput);
        setGroupInput('');
        await new Promise((resolve) => setTimeout(resolve, 200));
      } else {
        const selectedGroup = groupList.find((g) => g.fg_name === groupValue);
        currentFgIdx = selectedGroup?.fg_idx;
      }
      if (!currentFgIdx) {
        setError('설비그룹 인덱스가 올바르지 않습니다.');
        console.error('설비 등록 직전 currentFgIdx가 undefined/null입니다!');
        setLoading(false);
        return;
      }

      // 3. 설비 인덱스
      let currentFaIdx: number | undefined;
      if (facilityValue === '신규등록') {
        const facilityResult = await postFacility({ fg_idx: currentFgIdx, name: facilityInput });
        currentFaIdx = facilityResult;
        try {
          const facilities = await getFacilities(currentFgIdx);
          setFacilityList([
            ...facilities.map((f: any) => ({
              fa_idx: f.fa_idx,
              fa_name: f.fa_name,
            })),
          ]);
          setFacilityValue(facilityInput);
          setFacilityInput('');
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.error('설비 목록 재조회 에러:', error);
        }
      } else {
        const selectedFacility = facilityList.find((f) => f.fa_name === facilityValue);
        currentFaIdx = selectedFacility?.fa_idx;
      }
      if (!currentFaIdx) {
        setError('설비 인덱스가 올바르지 않습니다.');
        console.error('센서 등록 직전 currentFaIdx가 undefined/null입니다!');
        setLoading(false);
        return;
      }

      // 4. 센서 추가
      const sensorResult = await postSensor({ fa_idx: currentFaIdx, name: sensorName });

      setError(null);
      onSuccess();
      handleClose();
    } catch (error) {
      setError('설비 추가 중 오류가 발생했습니다.');
      console.error('설비 추가 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFactory('');
    setNewFactoryName('');
    setIsNewFactory(false);
    setGroupValue('');
    setGroupInput('');
    setFacilityValue('');
    setFacilityInput('');
    setSensorName('');
    setError(null);
    onClose();
  };

  const handleReset = () => {
    setSelectedFactory('');
    setNewFactoryName('');
    setIsNewFactory(false);
    setGroupValue('');
    setGroupInput('');
    setFacilityValue('');
    setFacilityInput('');
    setSensorName('');
    setError(null);
  };

  // 등록 버튼 활성화 조건
  const isAddDisabled =
    // 공장
    (isNewFactory && !newFactoryName.trim()) ||
    (!isNewFactory && !selectedFactory) ||
    // 설비그룹
    !groupValue ||
    (groupValue === '신규등록' && !groupInput.trim()) ||
    // 설비명
    !facilityValue ||
    (facilityValue === '신규등록' && !facilityInput.trim()) ||
    // 센서명
    !sensorName.trim() ||
    loading;

  return (
    <BootstrapDialog open={open} onClose={handleClose}>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 700,
          fontSize: '1.1rem',
        }}
      >
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
                  공장
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    background: '#fff',
                  }}
                >
                  <Grid
                    container
                    spacing={1}
                    alignItems='center'
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '7fr 5fr',
                      gap: 1,
                    }}
                  >
                    <Grid>
                      <FormControl fullWidth size='small'>
                        <Select
                          key={`factory-select-${factories.length}`}
                          value={isNewFactory ? '신규등록' : selectedFactory || ''}
                          onChange={(e) => {
                            if (e.target.value === '신규등록') {
                              setIsNewFactory(true);
                              setSelectedFactory('');
                              setGroupValue('신규등록');
                              setFacilityValue('신규등록');
                              setGroupInput('');
                              setFacilityInput('');
                              setFacilityList([]);
                            } else {
                              setIsNewFactory(false);
                              setSelectedFactory(e.target.value as number);
                              setGroupValue('');
                              setFacilityValue('');
                              setGroupInput('');
                              setFacilityInput('');
                              setFacilityList([]);
                            }
                          }}
                          displayEmpty
                          sx={{ background: '#fff', borderRadius: 1 }}
                        >
                          <MenuItem value='신규등록'>신규등록</MenuItem>
                          {factories.map((factory) => (
                            <MenuItem key={factory.fc_idx} value={factory.fc_idx}>
                              {factory.fc_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid>
                      <TextField
                        value={newFactoryName}
                        onChange={(e) => setNewFactoryName(e.target.value)}
                        size='small'
                        fullWidth
                        placeholder='공장명'
                        disabled={!isNewFactory}
                        sx={{
                          background: isNewFactory ? '#fff' : '#f0f0f0',
                          borderRadius: 1,
                        }}
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
                  설비그룹
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    background: '#fff',
                  }}
                >
                  <Grid
                    container
                    spacing={1}
                    alignItems='center'
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '7fr 5fr',
                      gap: 1,
                    }}
                  >
                    <Grid>
                      <FormControl fullWidth size='small'>
                        <Select
                          key={`group-select-${groupList.length}`} // 강제 리렌더링을 위한 key
                          value={groupValue}
                          onChange={(e) => handleGroupValueChange(e.target.value as string)}
                          displayEmpty
                          disabled={!selectedFactory && !isNewFactory}
                          sx={{
                            background: '#fff',
                            borderRadius: 1,
                            '&.Mui-disabled': {
                              backgroundColor: '#f5f5f5',
                              color: '#999',
                            },
                          }}
                        >
                          <MenuItem value='신규등록'>신규등록</MenuItem>
                          {groupList.map((g) => (
                            <MenuItem key={g.fg_name} value={g.fg_name}>
                              {g.fg_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid>
                      <TextField
                        value={groupInput}
                        onChange={(e) => setGroupInput(e.target.value)}
                        size='small'
                        fullWidth
                        placeholder='설비그룹명'
                        disabled={groupValue !== '신규등록' || (!selectedFactory && !isNewFactory)}
                        sx={{
                          background:
                            groupValue === '신규등록' && (selectedFactory || isNewFactory) ? '#fff' : '#f0f0f0',
                          borderRadius: 1,
                        }}
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
                  설비
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    padding: '10px 16px',
                    background: '#fff',
                  }}
                >
                  <Grid
                    container
                    spacing={1}
                    alignItems='center'
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '7fr 5fr',
                      gap: 1,
                    }}
                  >
                    <Grid>
                      <FormControl fullWidth size='small'>
                        <Select
                          key={`facility-select-${facilityList.length}`} // 강제 리렌더링을 위한 key
                          value={facilityValue}
                          onChange={(e) => handleFacilityValueChange(e.target.value as string)}
                          displayEmpty
                          disabled={!groupValue || groupValue === ''}
                          sx={{
                            background: '#fff',
                            borderRadius: 1,
                            '&.Mui-disabled': {
                              backgroundColor: '#f5f5f5',
                              color: '#999',
                            },
                          }}
                        >
                          <MenuItem value='신규등록'>신규등록</MenuItem>
                          {facilityList.map((f) => (
                            <MenuItem key={f.fa_name} value={f.fa_name}>
                              {f.fa_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid>
                      <TextField
                        value={facilityInput}
                        onChange={(e) => setFacilityInput(e.target.value)}
                        size='small'
                        fullWidth
                        placeholder='설비명'
                        disabled={facilityValue !== '신규등록' || !groupValue || groupValue === ''}
                        sx={{
                          background:
                            facilityValue === '신규등록' && groupValue && groupValue !== '' ? '#fff' : '#f0f0f0',
                          borderRadius: 1,
                          '& .MuiInputBase-input.Mui-disabled': {
                            backgroundColor: '#f5f5f5',
                            color: '#999',
                          },
                        }}
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
                  센서
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
                    placeholder='센서명'
                    disabled={!groupValue || !facilityValue || groupValue === '' || facilityValue === ''}
                    sx={{
                      background: '#fff',
                      borderRadius: 1,
                      '& .MuiInputBase-input.Mui-disabled': {
                        backgroundColor: '#f5f5f5',
                        color: '#999',
                      },
                    }}
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
