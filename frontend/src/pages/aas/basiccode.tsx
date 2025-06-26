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
import FacilityGroupSelect from '../../components/select/facility_group';
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
import BasicDatePicker from '../../components/datepicker';
import { Dayjs } from 'dayjs';
import AlertModal from '../../components/modal/alert';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import LoadingOverlay from '../../components/loading/LodingOverlay';
import BasicModal from '../../components/modal/basicmodal';

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

// 트리 데이터 타입
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
  const [insertMode, setInsertMode] = useState(false);
  const [baseEditMode, setBaseEditMode] = useRecoilState(baseEditModeState);
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

  const [selectedFacilityGroup, setSelectedFacilityGroup] = useState<number | ''>('');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 초기화 함수 (기초코드 등록 모드용)
  const handleReset = () => {
    setSelectedFacilityGroup('');
    setFacilityName('');
    setSensorName('');
    setTreeData([]);
    setSelectedSensors([]);
  };

  // 메인 페이지 초기화 함수
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
    } else if (selectedBases.length === filteredBases.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedBases, filteredBases]);

  useEffect(() => {
    setFilteredBases(bases);
  }, [bases]);

  // 페이지 로드 시 기초코드 목록 불러오기
  useEffect(() => {
    getBases();
  }, []);

  // 네비게이션 리셋 시 기초코드 목록 다시 불러오기
  useEffect(() => {
    if (navigationReset) {
      getBases();
      setSelectedBases([]);
      setSelectAll(false);
      setCurrentPage(0);
    }
  }, [navigationReset]);

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
      console.log('기초코드 목록 불러오기 실패:', err.message);
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
      setSelectedSensors((prevSelected) => {
        const newSelected = [...prevSelected];
        sensorIds.forEach((id) => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      setSelectedSensors((prevSelected) => prevSelected.filter((id) => !sensorIds.includes(id)));
    }
  };

  const isAllInFaSelected = (fa_idx: number) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    return sensorsInFa.length > 0 && sensorsInFa.every((sensor) => selectedSensors.includes(sensor.sn_idx));
  };

  const isPartiallySelectedInFa = (fa_idx: number) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    return (
      sensorsInFa.length > 0 &&
      sensorsInFa.some((sensor) => selectedSensors.includes(sensor.sn_idx)) &&
      !isAllInFaSelected(fa_idx)
    );
  };

  const handleClick = (base: Base) => {
    setSelectedBase(base);
    setBaseEditMode(true);
  };

  const handleSelectAllChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      if (filteredBases && filteredBases.length > 0) {
        setSelectedBases(filteredBases.map((base) => base.ab_idx));
      }
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
      const response = await fetch(`http://localhost:5001/api/base_code/bases`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedBases }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete bases');
      }

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
    if (selectedSensors.length === 0) {
      setAlertTitle('알림');
      setAlertContent('센서를 선택해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    if (!basicName.trim()) {
      setAlertTitle('알림');
      setAlertContent('기초코드명을 입력해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases?user_idx=${userIdx}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: basicName,
          ids: selectedSensors,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add base');
      }

      const newBase = await response.json();

      // 누락된 필드들을 추가
      const completeNewBase = {
        ...newBase,
        sn_length: selectedSensors.length,
        createdAt: new Date().toISOString(),
      };

      setBases([completeNewBase, ...bases]);
      setSelectedSensors([]);
      setBasicName('');
      setBasicDesc('');
      setBasicModalOpen(false);
      setInsertMode(false);
      setAlertTitle('알림');
      setAlertContent('기초코드가 등록되었습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    } catch (err: any) {
      console.log(err.message);
      setAlertTitle('오류');
      setAlertContent('등록 중 오류가 발생했습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    }
  };

  const handleBasicModalAdd = async () => {
    await handleAdd();
  };

  const handleBasicModalReset = () => {
    setBasicName('');
    setBasicDesc('');
  };

  const handleUpdate = async () => {
    if (selectedSensors.length === 0) {
      setAlertTitle('알림');
      setAlertContent('센서를 선택해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    if (!basicName.trim()) {
      setAlertTitle('알림');
      setAlertContent('기초코드명을 입력해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases?user_idx=${userIdx}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ab_idx: selectedBase.ab_idx,
          name: basicName,
          ids: selectedSensors,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update base');
      }

      const updatedBase = await response.json();
      setBases(bases.map((base) => (base.ab_idx === selectedBase.ab_idx ? updatedBase : base)));
      setSelectedSensors([]);
      setBasicName('');
      setBasicDesc('');
      setBasicModalOpen(false);
      setBaseEditMode(false);
      setAlertTitle('알림');
      setAlertContent('기초코드가 수정되었습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    } catch (err: any) {
      console.log(err.message);
      setAlertTitle('오류');
      setAlertContent('수정 중 오류가 발생했습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    }
  };

  const handleCancle = () => {
    setBaseEditMode(false);
    setSelectedSensors([]);
    setBasicName('');
    setBasicDesc('');
    setBasicModalOpen(false);
  };

  const handleSearch = () => {
    const filtered = bases.filter((base) => base.ab_name.toLowerCase().includes(searchKeyword.toLowerCase()));
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

  const handleInsertMode = () => {
    setInsertMode(true);
    setTreeData([]);
    setTreeLoading(false);
    setSelectedSensors([]);
    setBasicName('');
    setBasicDesc('');
  };

  const handleBackToMain = () => {
    setInsertMode(false);
    setTreeData([]);
    setTreeLoading(false);
    setSelectedSensors([]);
    setBasicName('');
    setBasicDesc('');
    setBasicModalOpen(false);
    setSelectedFacilityGroup('');
    setFacilityName('');
    setSensorName('');
  };

  const handleTreeSearch = async () => {
    setTreeLoading(true);

    try {
      const fgRes = await fetch('http://localhost:5001/api/base_code/facilityGroups?fc_idx=3');
      const allFacilityGroups = await fgRes.json();

      let filteredFacilityGroups = allFacilityGroups;
      if (selectedFacilityGroup) {
        filteredFacilityGroups = allFacilityGroups.filter((fg) => fg.fg_idx === selectedFacilityGroup);
      }

      const facilitiesAll = await Promise.all(
        filteredFacilityGroups.map(async (fg) => {
          const faRes = await fetch(`http://localhost:5001/api/base_code?fg_idx=${fg.fg_idx}`);
          const facilities = await faRes.json();

          let filteredFacilities = facilities;
          if (facilityName.trim()) {
            filteredFacilities = facilities.filter((fa) =>
              fa.fa_name.toLowerCase().includes(facilityName.trim().toLowerCase())
            );
          }

          const facilitiesWithSensors = await Promise.all(
            filteredFacilities.map(async (fa) => {
              const snRes = await fetch(`http://localhost:5001/api/base_code/sensors?fa_idx=${fa.fa_idx}`);
              const sensors = await snRes.json();
              const sensorsArray = Array.isArray(sensors) ? sensors : [];

              let filteredSensors = sensorsArray;
              if (sensorName.trim()) {
                filteredSensors = sensorsArray.filter((sensor) =>
                  sensor.sn_name.toLowerCase().includes(sensorName.trim().toLowerCase())
                );
              }

              return { ...fa, sensors: filteredSensors };
            })
          );

          const facilitiesWithSensorsFiltered = facilitiesWithSensors.filter((fa) => fa.sensors.length > 0);
          return { ...fg, facilities: facilitiesWithSensorsFiltered };
        })
      );

      const finalFilteredData = facilitiesAll.filter((fg) => fg.facilities.length > 0);

      setTreeData(finalFilteredData);
    } catch (err) {
      console.log('검색 에러:', err.message);
      setTreeData([]);
    } finally {
      setTreeLoading(false);
    }
  };

  const handleFacilityGroupSelectAll = (fgIdx: number, checked: boolean) => {
    const fg = treeData[fgIdx];
    if (!fg) return;

    const allSensorIds: number[] = [];
    fg.facilities.forEach((fa) => {
      fa.sensors.forEach((sensor) => {
        allSensorIds.push(sensor.sn_idx);
      });
    });

    setSelectedSensors((prevSelected) => {
      if (checked) {
        const newSelected = [...prevSelected];
        allSensorIds.forEach((id) => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      } else {
        return prevSelected.filter((id) => !allSensorIds.includes(id));
      }
    });
  };

  const isAllSensorsSelectedInGroup = (fgIdx: number) => {
    const fg = treeData[fgIdx];
    if (!fg) return false;

    const allSensorIds: number[] = [];
    fg.facilities.forEach((fa) => {
      fa.sensors.forEach((sensor) => {
        allSensorIds.push(sensor.sn_idx);
      });
    });

    return allSensorIds.length > 0 && allSensorIds.every((id) => selectedSensors.includes(id));
  };

  const isPartiallySelectedInGroup = (fgIdx: number) => {
    const fg = treeData[fgIdx];
    if (!fg) return false;

    const allSensorIds: number[] = [];
    fg.facilities.forEach((fa) => {
      fa.sensors.forEach((sensor) => {
        allSensorIds.push(sensor.sn_idx);
      });
    });

    return (
      allSensorIds.length > 0 &&
      allSensorIds.some((id) => selectedSensors.includes(id)) &&
      !isAllSensorsSelectedInGroup(fgIdx)
    );
  };

  const handleFacilitySelectAll = (fgIdx: number, faIdx: number, checked: boolean) => {
    const fg = treeData[fgIdx];
    if (!fg || !fg.facilities[faIdx]) return;

    const fa = fg.facilities[faIdx];
    const sensorIds = fa.sensors.map((sensor) => sensor.sn_idx);

    setSelectedSensors((prevSelected) => {
      if (checked) {
        const newSelected = [...prevSelected];
        sensorIds.forEach((id) => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      } else {
        return prevSelected.filter((id) => !sensorIds.includes(id));
      }
    });
  };

  const isAllSensorsSelectedInFacility = (fgIdx: number, faIdx: number) => {
    const fg = treeData[fgIdx];
    if (!fg || !fg.facilities[faIdx]) return false;

    const fa = fg.facilities[faIdx];
    return fa.sensors.length > 0 && fa.sensors.every((sensor) => selectedSensors.includes(sensor.sn_idx));
  };

  const isPartiallySelectedInFacility = (fgIdx: number, faIdx: number) => {
    const fg = treeData[fgIdx];
    if (!fg || !fg.facilities[faIdx]) return false;

    const fa = fg.facilities[faIdx];
    return (
      fa.sensors.length > 0 &&
      fa.sensors.some((sensor) => selectedSensors.includes(sensor.sn_idx)) &&
      !isAllSensorsSelectedInFacility(fgIdx, faIdx)
    );
  };

  if (insertMode) {
    return (
      <div className='table-outer'>
        <div>
          <Box sx={{ flexGrow: 1 }} className='sort-box'>
            <Grid container spacing={1}>
              <Grid size={3}>
                <Grid container spacing={1}>
                  <Grid>
                    <div className='sort-title'>설비그룹</div>
                  </Grid>
                  <Grid size={9}>
                    <FacilityGroupSelect
                      selectedFacilityGroup={selectedFacilityGroup}
                      setSelectedFacilityGroup={setSelectedFacilityGroup}
                      onFacilityGroupChange={() => {
                        setTreeData([]);
                        setSelectedSensors([]);
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={3}>
                <Grid container spacing={1}>
                  <Grid>
                    <div className='sort-title'>설비명</div>
                  </Grid>
                  <Grid size={9}>
                    <TextField
                      size='small'
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      placeholder='설비명을 입력하세요'
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={3}>
                <Grid container spacing={1}>
                  <Grid>
                    <div className='sort-title'>센서명</div>
                  </Grid>
                  <Grid size={9}>
                    <TextField
                      size='small'
                      value={sensorName}
                      onChange={(e) => setSensorName(e.target.value)}
                      placeholder='센서명을 입력하세요'
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={3}>
                <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                  <Button variant='contained' color='success' onClick={handleTreeSearch}>
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
                  <Button
                    variant='contained'
                    color='success'
                    onClick={() => {
                      if (selectedSensors.length === 0) {
                        setAlertTitle('알림');
                        setAlertContent('센서를 선택해주세요.');
                        setAlertType('alert');
                        setAlertOpen(true);
                      } else {
                        setBasicModalOpen(true);
                      }
                    }}
                  >
                    기초코드 등록
                  </Button>
                  <Button variant='contained' color='inherit' onClick={handleBackToMain}>
                    취소
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </div>

        <div className='table-wrap'>
          {treeLoading ? (
            <LoadingOverlay />
          ) : treeData.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>조회 결과 없음</div>
          ) : (
            <SimpleTreeView
              defaultExpandedItems={treeData.flatMap((fg, fgIdx) => [
                `aas-${fgIdx}`,
                ...fg.facilities.map((fa, faIdx) => `submodal-${fgIdx}-${faIdx}`),
              ])}
            >
              {treeData.map((fg, fgIdx) => (
                <TreeItem
                  key={fg.fg_idx}
                  itemId={`aas-${fgIdx}`}
                  label={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={isAllSensorsSelectedInGroup(fgIdx)}
                        onChange={(e) => handleFacilityGroupSelectAll(fgIdx, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ marginRight: '8px' }}
                      />
                      <span>{fg.fg_name}</span>
                    </div>
                  }
                >
                  {fg.facilities.map((fa, faIdx) => (
                    <TreeItem
                      key={fa.fa_idx}
                      itemId={`submodal-${fgIdx}-${faIdx}`}
                      label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox
                            checked={isAllSensorsSelectedInFacility(fgIdx, faIdx)}
                            onChange={(e) => handleFacilitySelectAll(fgIdx, faIdx, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginRight: '8px' }}
                          />
                          <span>{fa.fa_name}</span>
                        </div>
                      }
                    >
                      <div style={{ padding: '8px 0' }}>
                        <BasicTable sm_idx={`${fgIdx + 1}.${faIdx + 1}`} fa_idx={fa.fa_idx} />
                      </div>
                    </TreeItem>
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          )}
        </div>

        <BasicModal
          open={basicModalOpen}
          handleClose={() => setBasicModalOpen(false)}
          handleAdd={handleBasicModalAdd}
          handleReset={handleBasicModalReset}
          selectedSensorCount={selectedSensors.length}
          name={basicName}
          setName={setBasicName}
          desc={basicDesc}
          setDesc={setBasicDesc}
        />
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

  return (
    <div className='table-outer'>
      <div>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={2}>
            <Grid size={3}>
              <Grid container spacing={1}>
                <Grid>
                  <div className='sort-title'>기초코드명</div>
                </Grid>
                <Grid size={9}>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <TextField size='small' value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid size={6}>
              <Grid container spacing={1}>
                <Grid>
                  <div className='sort-title'>날짜</div>
                </Grid>
                <Grid size={9}>
                  <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={3}>
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
                <Button variant='contained' color='success' onClick={handleInsertMode}>
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
