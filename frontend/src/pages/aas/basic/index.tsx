import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
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
import Pagenation from '../../../components/pagenation';
import FacilityGroupSelect from '../../../components/select/facility_group';
import BasicTable from '../../../components/table/basic_code';
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
} from '../../../recoil/atoms';
import BasicDatePicker from '../../../components/datepicker';
import { Dayjs } from 'dayjs';
import AlertModal from '../../../components/modal/alert';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import LoadingOverlay from '../../../components/loading/LodingOverlay';
import BasicModal from '../../../components/modal/basicmodal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { getBasesAPI, deleteBasesAPI } from '../../../apis/api/basic';

interface Base {
  ab_idx: number;
  ab_name: string;
  ab_note: string;
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

interface FacilityGroupTree {
  fg_idx: number;
  fg_name: string;
  facilities: {
    fa_idx: number;
    fa_name: string;
    sensors: {
      sn_idx: number;
      sn_name: string;
    }[];
  }[];
}

const cells = ['기초코드명', '센서 개수', '생성 날짜', '비고'];

export default function BasiccodePage() {
  const [selectedBases, setSelectedBases] = useRecoilState(selectedBasesState);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [name, setName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [sensorName, setSensorName] = useState('');
  const [bases, setBases] = useState<Base[]>([]);
  const [filteredBases, setFilteredBases] = useState<Base[]>([]);
  const [basics, setBasics] = useState<Basic[]>([]);
  const [sensorsByFa, setSensorsByFa] = useState<{ [key: number]: Sensor[] }>({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBase, setSelectedBase] = useRecoilState(selectedBaseState);
  const currentFacilityGroup = useRecoilValue(currentFacilityGroupState);
  const [, setHasBasics] = useRecoilState(hasBasicsState);
  const userIdx = useRecoilValue(userState)?.user_idx;
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertContent, setAlertContent] = useState('');
  const [alertType, setAlertType] = useState<'alert' | 'confirm'>('alert');

  const [treeData, setTreeData] = useState<FacilityGroupTree[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);

  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [basicName, setBasicName] = useState('');
  const [basicDesc, setBasicDesc] = useState('');

  const [selectedFacilityGroups, setSelectedFacilityGroups] = useState<number[]>([]);

  useEffect(() => {
    document.title = '기초코드 관리';
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleReset = () => {
    setSelectedFacilityGroups([]);
    setFacilityName('');
    setSensorName('');
    setTreeData([]);
    setSelectedSensors([]);
  };

  const handleMainReset = () => {
    setSearchKeyword('');
    setStartDate(null);
    setEndDate(null);
    getBases();
  };

  const pagedData = filteredBases?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  useEffect(() => {
    if (selectedBases.length === 0) {
      setSelectAll(false);
    } else if (pagedData && pagedData.length > 0) {
      const currentPageIds = pagedData.map((base) => base.ab_idx);
      const allCurrentPageSelected = currentPageIds.every((id) => selectedBases.includes(id));
      setSelectAll(allCurrentPageSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedBases, pagedData]);

  useEffect(() => {
    setFilteredBases(bases);
  }, [bases]);

  useEffect(() => {
    getBases();
  }, []);

  useEffect(() => {
    if (navigationReset) {
      getBases();
      setTreeData([]);
      setSelectedSensors([]);
      setBasicName('');
      setBasicDesc('');
      setBasicModalOpen(false);
      setSelectedFacilityGroups([]);
      setFacilityName('');
      setSensorName('');
      setSearchKeyword('');
      setStartDate(null);
      setEndDate(null);
      setSelectedBases([]);
    }
  }, [navigationReset]);

  const getBases = async () => {
    try {
      const data = await getBasesAPI();
      setBases(data);
    } catch (error) {
      console.error('Error fetching bases:', error);
    }
  };

  const getBasicCode = async (fg_idx: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fg_idx: fg_idx,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch basic code');
      }

      const data = await response.json();
      setBasics(data);
      setHasBasics(data !== null && data.length > 0);
    } catch (error) {
      console.error('Error fetching basic code:', error);
    }
  };

  const getSensorsByFa = async (fa_idx: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/sensors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fa_idx: fa_idx,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sensors');
      }

      const data = await response.json();
      setSensorsByFa((prev) => ({
        ...prev,
        [fa_idx]: Array.isArray(data) ? data : [],
      }));
    } catch (error) {
      console.error('Error fetching sensors:', error);
      setSensorsByFa((prev) => ({
        ...prev,
        [fa_idx]: [],
      }));
    }
  };

  const handleSelectAllChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      if (pagedData && pagedData.length > 0) {
        setSelectedBases((prevSelected) => {
          const currentPageIds = pagedData.map((base) => base.ab_idx);
          const newSelected = [...prevSelected];
          currentPageIds.forEach((id) => {
            if (!newSelected.includes(id)) {
              newSelected.push(id);
            }
          });
          return newSelected;
        });
      }
    } else {
      if (pagedData && pagedData.length > 0) {
        const currentPageIds = pagedData.map((base) => base.ab_idx);
        setSelectedBases((prevSelected) => prevSelected.filter((id) => !currentPageIds.includes(id)));
      }
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
      setAlertTitle('알림');
      setAlertContent('삭제할 항목을 선택해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    setAlertTitle('확인');
    setAlertContent(`선택한 ${selectedBases.length}개 항목을 삭제하시겠습니까?`);
    setAlertType('confirm');
    setAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBasesAPI(selectedBases);
      setBases(bases.filter((base) => !selectedBases.includes(base.ab_idx)));
      setSelectedBases([]);
      setAlertTitle('알림');
      setAlertContent('선택한 항목이 삭제되었습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    } catch (err: any) {
      console.log(err.message);
      setAlertTitle('오류');
      setAlertContent('삭제 중 오류가 발생했습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    }
  };

  const handleAdd = async () => {
    window.location.href = '/aas/basic/add';
  };

  const handleBasicModalAdd = async () => {
    setBasicModalOpen(false);
  };

  const handleBasicModalReset = () => {
    setBasicName('');
    setBasicDesc('');
  };

  const handleSearch = () => {
    let filtered = bases;

    if (searchKeyword.trim()) {
      filtered = filtered.filter((base) => base.ab_name.toLowerCase().includes(searchKeyword.toLowerCase()));
    }

    if (startDate || endDate) {
      filtered = filtered.filter((base) => {
        if (!base.createdAt) return false;

        const baseDate = new Date(base.createdAt);
        const baseDateOnly = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

        if (startDate && endDate) {
          const start = startDate.toDate();
          const end = endDate.toDate();
          return baseDateOnly >= start && baseDateOnly <= end;
        } else if (startDate) {
          const start = startDate.toDate();
          return baseDateOnly >= start;
        } else if (endDate) {
          const end = endDate.toDate();
          return baseDateOnly <= end;
        }

        return true;
      });
    }

    setFilteredBases(filtered);
    setCurrentPage(0);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return '-';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      return '-';
    }
  };

  const handleDateChange = (newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleClick = (base: Base) => {
    setSelectedBase(base);
    window.location.href = `/aas/basic/edit/${base.ab_idx}/view`;
  };

  return (
    <div className='table-outer'>
      <div>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>기초코드명</div>
                </Grid>
                <Grid item xs={9}>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <TextField size='small' value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>날짜</div>
                </Grid>
                <Grid item xs={9}>
                  <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='contained' color='success' onClick={handleSearch}>
                  검색
                </Button>
                <Button variant='contained' color='inherit' onClick={handleMainReset}>
                  초기화
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={1}>
            <Grid item xs={8}></Grid>
            <Grid item xs={4}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='contained' color='success' onClick={handleAdd}>
                  기초코드 등록
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
                    onClick={() => handleClick(base)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedBases.includes(base.ab_idx)}
                        onChange={() => handleCheckboxChange(base.ab_idx)}
                      />
                    </TableCell>
                    <TableCell>{base.ab_name}</TableCell>
                    <TableCell>{base.sn_length || 0}</TableCell>
                    <TableCell>{formatDate(base.createdAt?.toString())}</TableCell>
                    <TableCell>{base.ab_note}</TableCell>
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
        <Pagenation count={filteredBases ? filteredBases.length : 0} onPageChange={handlePageChange} />
      </div>
      <AlertModal
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        title={alertTitle}
        content={alertContent}
        type={alertType}
        onConfirm={alertType === 'confirm' ? handleConfirmDelete : undefined}
      />
    </div>
  );
}
