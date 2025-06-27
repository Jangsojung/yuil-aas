import React, { useEffect, useState } from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import { TextField } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { useRecoilState, useRecoilValue } from 'recoil';
import { navigationResetState, selectedSensorsState, userState } from '../../../recoil/atoms';
import BasicDatePicker from '../../../components/datepicker';
import { Dayjs } from 'dayjs';
import AlertModal from '../../../components/modal/alert';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import LoadingOverlay from '../../../components/loading/LodingOverlay';
import BasicModal from '../../../components/modal/basicmodal';
import FacilityGroupSelect from '../../../components/select/facility_group';
import BasicTable from '../../../components/table/basic_code';
import { insertBaseAPI, getFacilityGroupsAPI, buildTreeDataAPI } from '../../../apis/api/basic';

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

export default function BasiccodeAddPage() {
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [facilityName, setFacilityName] = useState('');
  const [sensorName, setSensorName] = useState('');
  const userIdx = useRecoilValue(userState)?.user_idx;
  const navigationReset = useRecoilValue(navigationResetState);

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

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
    document.title = '기초코드 관리 > 기초코드 등록';
    getAllFacilityGroups();
  }, []);

  const handleReset = () => {
    setSelectedFacilityGroups([]);
    setFacilityName('');
    setSensorName('');
    setTreeData([]);
    setSelectedSensors([]);
  };

  useEffect(() => {
    if (navigationReset) {
      setTreeData([]);
      setSelectedSensors([]);
      setBasicName('');
      setBasicDesc('');
      setBasicModalOpen(false);
      setSelectedFacilityGroups([]);
      setFacilityName('');
      setSensorName('');
      setStartDate(null);
      setEndDate(null);
    }
  }, [navigationReset]);

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
      await insertBaseAPI({
        user_idx: userIdx,
        name: basicName,
        note: basicDesc,
        ids: selectedSensors,
      });

      console.log('Base inserted successfully');
      setBasicName('');
      setBasicDesc('');
      setSelectedSensors([]);
      window.location.href = '/aas/basic';
    } catch (error) {
      console.error('Error inserting base:', error);
    }
  };

  const handleBasicModalAdd = async () => {
    await handleAdd();
  };

  const handleBasicModalReset = () => {
    setBasicName('');
    setBasicDesc('');
  };

  const handleCancle = () => {
    setSelectedSensors([]);
    setBasicName('');
    setBasicDesc('');
    setBasicModalOpen(false);
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
      return date
        .toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        .replace(/\. /g, '.')
        .replace(/\./g, '.')
        .replace(/ /g, ' ');
    } catch (error) {
      return '-';
    }
  };

  const handleDateChange = (newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const getAllFacilityGroups = async () => {
    try {
      const data = await getFacilityGroupsAPI(3);
      setSelectedFacilityGroups(data.map((fg: any) => fg.fg_idx));
    } catch (error) {
      console.error('Error fetching facility groups:', error);
      setSelectedFacilityGroups([]);
    }
  };

  const handleBackToMain = () => {
    window.location.href = '/aas/basic';
  };

  const handleTreeSearch = async () => {
    if (!facilityName.trim() && !sensorName.trim() && selectedFacilityGroups.length === 0) {
      setAlertTitle('알림');
      setAlertContent('검색 조건을 입력해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    setTreeLoading(true);

    try {
      const finalFilteredData = await buildTreeDataAPI(selectedFacilityGroups, facilityName, sensorName);
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

  return (
    <div className='table-outer'>
      <div>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>설비그룹</div>
                </Grid>
                <Grid item xs={9}>
                  <FacilityGroupSelect
                    selectedFacilityGroups={selectedFacilityGroups}
                    setSelectedFacilityGroups={setSelectedFacilityGroups}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>설비명</div>
                </Grid>
                <Grid item xs={9}>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <TextField
                      size='small'
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      placeholder='설비명을 입력하세요'
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>센서명</div>
                </Grid>
                <Grid item xs={9}>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <TextField
                      size='small'
                      value={sensorName}
                      onChange={(e) => setSensorName(e.target.value)}
                      placeholder='센서명을 입력하세요'
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3}>
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
            <Grid item xs={8}></Grid>
            <Grid item xs={4}>
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
                      indeterminate={false}
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
                          indeterminate={false}
                          onChange={(e) => handleFacilitySelectAll(fgIdx, faIdx, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ marginRight: '8px' }}
                        />
                        <span>{fa.fa_name}</span>
                      </div>
                    }
                  >
                    <div style={{ padding: '8px 0' }}>
                      <BasicTable sm_idx={`${fgIdx + 1}.${faIdx + 1}`} fa_idx={fa.fa_idx} sensors={fa.sensors} />
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
        isEditMode={false}
      />
      <AlertModal
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        title={alertTitle}
        content={alertContent}
        type={alertType}
        onConfirm={alertType === 'confirm' ? undefined : undefined}
      />
    </div>
  );
}
