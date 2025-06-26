import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Pagenation from '../../components/pagenation';
import SelectFacilityGroup from '../../components/select/facility_group';
import BasicTable from '../../components/table/basic_code';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  baseEditModeState,
  navigationResetState,
  selectedBasesState,
  selectedBaseState,
  selectedSensorsState,
  currentFacilityGroupState,
  hasBasicsState,
  userState,
} from '../../recoil/atoms';

interface Base {
  ab_idx: number;
  ab_name: string;
  sn_length: number;
  createdAt: Date;
}

interface Basic {
  fa_idx: number;
  fa_name: string;
}

interface Sensor {
  sn_idx: number;
  sn_name: string;
}

export default function BasiccodePage() {
  const [insertMode, setInsertMode] = useState(false);
  const [baseEditMode, setBaseEditMode] = useRecoilState(baseEditModeState);
  const [selectedBases, setSelectedBases] = useRecoilState(selectedBasesState);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [name, setName] = useState('');
  const [bases, setBases] = useState<Base[]>([]);
  const [basics, setBasics] = useState<Basic[]>([]);
  const [sensorsByFa, setSensorsByFa] = useState<{ [key: number]: Sensor[] }>({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBase, setSelectedBase] = useRecoilState(selectedBaseState);
  const currentFacilityGroup = useRecoilValue(currentFacilityGroupState);
  const [, setHasBasics] = useRecoilState(hasBasicsState);
  const userIdx = useRecoilValue(userState)?.user_idx;
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagedData = bases?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  useEffect(() => {
    if (selectedBases.length === 0) {
      setSelectAll(false);
    } else if (selectedBases.length === bases.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedBases, bases]);

  const getBases = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: Base[] = await response.json();
      setBases(data);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const getBasicCode = async (fg_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code?fg_idx=${fg_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: Basic[] = await response.json();
      setBasics(data);
      setHasBasics(data !== null && data.length > 0);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const getSensorsByFa = async (fa_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/sensors?fa_idx=${fa_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sensors');
      }

      const data: Sensor[] = await response.json();
      setSensorsByFa((prev) => ({
        ...prev,
        [fa_idx]: Array.isArray(data) ? data : [],
      }));
    } catch (err: any) {
      console.log(err.message);
      setSensorsByFa((prev) => ({
        ...prev,
        [fa_idx]: [],
      }));
    }
  };

  const handleSelectAllInFa = (fa_idx: number, checked: boolean) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    const sensorIds = sensorsInFa.map((sensor) => sensor.sn_idx);

    if (checked) {
      setSelectedSensors((prev) => {
        const newSelected = [...new Set([...prev, ...sensorIds])];
        return newSelected;
      });
    } else {
      setSelectedSensors((prev) => prev.filter((id) => !sensorIds.includes(id)));
    }
  };

  const isAllInFaSelected = (fa_idx: number) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    if (sensorsInFa.length === 0) return false;
    const sensorIds = sensorsInFa.map((sensor) => sensor.sn_idx);
    return sensorIds.every((id) => selectedSensors.includes(id));
  };

  const isPartiallySelectedInFa = (fa_idx: number) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    if (sensorsInFa.length === 0) return false;
    const sensorIds = sensorsInFa.map((sensor) => sensor.sn_idx);
    const selectedInFa = sensorIds.filter((id) => selectedSensors.includes(id));
    return selectedInFa.length > 0 && selectedInFa.length < sensorIds.length;
  };

  const handleDoubleClick = (base: Base) => {
    setSelectedBase(base);
    setBaseEditMode(true);
  };

  const handleSelectAllChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedBases(bases.map((base) => base.ab_idx));
    } else {
      setSelectedBases([]);
    }
  };

  const handleCheckboxChange = (baseIdx: number) => {
    setSelectedBases((prevSelected) => {
      if (prevSelected.includes(baseIdx)) {
        return prevSelected.filter((idx) => idx !== baseIdx);
      } else {
        return [...prevSelected, baseIdx];
      }
    });
  };

  const handleDelete = async () => {
    if (selectedBases.length === 0) {
      alert('삭제할 기초코드를 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedBases.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedBases,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete items');
      }

      setSelectedBases([]);
      getBases();
      alert('선택한 항목이 삭제되었습니다.');
    } catch (err: any) {
      console.error('삭제 중 오류가 발생했습니다:', err.message);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAdd = async () => {
    if (!name) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases?user_idx=${userIdx}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, ids: selectedSensors }),
      });

      if (!response.ok) {
        throw new Error('Failed to insert base');
      }

      setSelectedSensors([]);
      setName('');
      setInsertMode(false);
      getBases();
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleUpdate = async () => {
    if (!name) {
      alert('이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases?user_idx=${userIdx}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ab_idx: selectedBase.ab_idx, name: name, ids: selectedSensors }),
      });

      if (!response.ok) {
        throw new Error('Failed to insert base');
      }

      setSelectedSensors([]);
      setName('');
      setBaseEditMode(false);
      getBases();
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleCancle = () => {
    setSelectedSensors([]);
    setName('');
    setInsertMode(false);
    setBaseEditMode(false);
  };

  const handleSearch = () => {
    getBases();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  useEffect(() => {
    if (currentFacilityGroup !== null) {
      getBasicCode(currentFacilityGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFacilityGroup]);

  useEffect(() => {
    basics.forEach((basic) => {
      getSensorsByFa(basic.fa_idx);
    });
  }, [basics]);

  useEffect(() => {
    setName(baseEditMode ? selectedBase.ab_name : '');
    setSelectedSensors([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseEditMode]);

  useEffect(() => {
    setInsertMode(false);
    setBaseEditMode(false);
    setSelectedBases([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  useEffect(() => {
    getBases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (insertMode || baseEditMode) {
    return (
      <div style={{ height: '100%' }}>
        <div>
          <Box sx={{ flexGrow: 1 }} className='sort-box'>
            <Grid container spacing={1}>
              <Grid container spacing={2} size={6}>
                <Grid container spacing={1} style={{ flexGrow: 1 }}>
                  <Grid>
                    <div className='sort-title'>제목</div>
                  </Grid>
                  <Grid size={9} style={{ flexGrow: 1 }}>
                    <TextField value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} />
                  </Grid>
                </Grid>

                <Grid container spacing={1} size={6}>
                  <Grid>
                    <div className='sort-title'>설비 그룹</div>
                  </Grid>
                  <Grid>
                    <SelectFacilityGroup />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={6} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                  <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                    <Button
                      variant='contained'
                      color='success'
                      onClick={baseEditMode ? handleUpdate : handleAdd}
                      disabled={selectedSensors.length === 0}
                    >
                      {baseEditMode ? '수정완료' : '등록완료'}
                    </Button>

                    <Button variant='contained' color='error' onClick={handleCancle}>
                      취소
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </div>

        <div className='sensor-list-wrap'>
          <div className='sensor-list'></div>
          <div className='sensor-list'>
            {basics &&
              basics.map((basic, idx) => (
                <div key={basic.fa_idx}>
                  <Grid container spacing={1} className='sensor-tit'>
                    <div className='d-flex align-flex-end gap-10'>
                      <Checkbox
                        checked={isAllInFaSelected(basic.fa_idx)}
                        onChange={(e) => handleSelectAllInFa(basic.fa_idx, e.target.checked)}
                      />
                      <span>{basic.fa_name}</span>
                      <span>Sub Modal 1.{idx + 1}</span>
                    </div>
                  </Grid>
                  <BasicTable sm_idx={idx + 1} fa_idx={basic.fa_idx} />
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='table-outer'>
      <div>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={1}>
            <Grid size={10}>
              <Grid container spacing={1}>
                <Grid>
                  <div className='sort-title'>검색</div>
                </Grid>

                <Grid size={2}>
                  <FormControl sx={{ m: 0, width: '100%' }} size='small'>
                    <Select />
                  </FormControl>
                </Grid>
                <Grid size={7}>
                  <FormControl sx={{ m: 0, width: '100%' }} size='small'>
                    <TextField />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={2}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='contained' color='success' onClick={handleSearch}>
                  검색
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={1}>
            <Grid size={8}></Grid>
            <Grid size={4}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='contained' color='success' onClick={() => setInsertMode(true)}>
                  등록
                </Button>
                <Button variant='contained' color='error' onClick={handleDelete}>
                  삭제
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </div>

      <div className='table-wrap'>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox checked={selectAll} onChange={handleSelectAllChange} />
                </TableCell>
                {cells.map((cell, idx) => (
                  <TableCell key={idx}>{cell}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((base, idx) => (
                  <TableRow
                    key={base.ab_idx}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    onDoubleClick={() => handleDoubleClick(base)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedBases.includes(base.ab_idx)}
                        onChange={() => handleCheckboxChange(base.ab_idx)}
                      />
                    </TableCell>
                    <TableCell>{base.ab_name}</TableCell>
                    <TableCell>{base.sn_length}</TableCell>
                    <TableCell>{formatDate(base.createdAt.toString())}</TableCell>
                    <TableCell>{/* {base.note} */}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={cells.length + 1} align='center'>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagenation count={bases ? bases.length : 0} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

const cells = ['기초코드명', '센서 개수', '생성 날짜', '비고'];
