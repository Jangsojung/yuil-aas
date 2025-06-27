import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FacilityGroupSelect from '../../../components/select/facility_group';
import BasicTable from '../../../components/table/basic_code';
import { useRecoilState, useRecoilValue } from 'recoil';
import { navigationResetState, selectedBaseState, selectedSensorsState, userState } from '../../../recoil/atoms';
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
import {
  updateBaseAPI,
  getBaseSensorsAPI,
  getBasesAPI,
  buildTreeFromSensorIdsAPI,
  buildTreeDataAPI,
} from '../../../apis/api/basic';

interface Base {
  ab_idx: number;
  ab_name: string;
  ab_note: string;
  sn_length: number;
  createdAt: Date;
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

const cells = ['기초코드명', '센서 개수', '생성 일자', '비고'];

export default function BasiccodeEditPage() {
  const { id, mode } = useParams<{ id: string; mode?: string }>();
  const [detailMode, setDetailMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [facilityName, setFacilityName] = useState('');
  const [sensorName, setSensorName] = useState('');
  const [selectedBase, setSelectedBase] = useRecoilState(selectedBaseState);
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

  const [editingBase, setEditingBase] = useState<Base | null>(null);
  const [selectedBaseForDetail, setSelectedBaseForDetail] = useState<Base | null>(null);
  const [detailTreeData, setDetailTreeData] = useState<FacilityGroupTree[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const baseId = parseInt(id);
      if (mode === 'view') {
        setDetailMode(true);
        setEditMode(false);
        loadBaseForDetail(baseId);
      } else {
        setDetailMode(false);
        setEditMode(true);
        loadBaseForEdit(baseId);
      }
    }
  }, [id, mode]);

  useEffect(() => {
    if (detailMode && selectedBaseForDetail) {
      document.title = `기초코드 관리 > ${selectedBaseForDetail.ab_name}`;
    } else if (editMode && editingBase) {
      document.title = `기초코드 관리 > ${editingBase.ab_name} 수정`;
    } else {
      document.title = '기초코드 관리';
    }
  }, [detailMode, selectedBaseForDetail, editMode, editingBase]);

  const loadBaseForDetail = async (baseId: number) => {
    setDetailLoading(true);
    try {
      const basesData = await getBasesAPI();
      const targetBase = basesData.find((base: Base) => base.ab_idx === baseId);

      if (!targetBase) {
        setAlertTitle('오류');
        setAlertContent('기초코드를 찾을 수 없습니다.');
        setAlertType('alert');
        setAlertOpen(true);
        return;
      }

      setSelectedBaseForDetail(targetBase);

      const sensorIds = await getBaseSensorsAPI(baseId);
      const sensorIdList = Array.isArray(sensorIds)
        ? sensorIds.map((item) => (typeof item === 'object' ? item.sn_idx : item))
        : [];

      const treeData = await buildTreeFromSensorIdsAPI(sensorIdList);
      setDetailTreeData(treeData);
    } catch (err: any) {
      console.error('기초코드 상세 로딩 에러:', err.message);
      setDetailTreeData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadBaseForEdit = async (baseId: number) => {
    try {
      const basesData = await getBasesAPI();
      const targetBase = basesData.find((base: Base) => base.ab_idx === baseId);

      if (!targetBase) {
        setAlertTitle('오류');
        setAlertContent('기초코드를 찾을 수 없습니다.');
        setAlertType('alert');
        setAlertOpen(true);
        return;
      }

      setEditingBase(targetBase);
      setBasicName(targetBase.ab_name);
      setBasicDesc(targetBase.ab_note || '');

      const sensorIds = await getBaseSensorsAPI(baseId);
      const sensorIdList = Array.isArray(sensorIds)
        ? sensorIds.map((item) => (typeof item === 'object' ? item.sn_idx : item))
        : [];

      setSelectedSensors(sensorIdList);

      await loadAllFacilityGroupsForEdit(sensorIdList);
    } catch (err: any) {
      console.log('수정 모드 초기화 에러:', err.message);
      setAlertTitle('오류');
      setAlertContent('기초코드 정보를 불러오는데 실패했습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    }
  };

  const loadAllFacilityGroupsForEdit = async (selectedSensorIds: number[]) => {
    try {
      const treeData = await buildTreeFromSensorIdsAPI(selectedSensorIds);
      setTreeData(treeData);

      const relevantFacilityGroups = new Set<number>();
      treeData.forEach((fg) => {
        fg.facilities.forEach((fa) => {
          fa.sensors.forEach((sensor) => {
            if (selectedSensorIds.includes(sensor.sn_idx)) {
              relevantFacilityGroups.add(fg.fg_idx);
            }
          });
        });
      });

      setSelectedFacilityGroups(Array.from(relevantFacilityGroups));
    } catch (err) {
      console.log('설비그룹 로드 에러:', err.message);
    }
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

    if (!editingBase) {
      console.error('No base selected for update');
      return;
    }

    try {
      await updateBaseAPI({
        user_idx: userIdx,
        ab_idx: editingBase.ab_idx,
        name: basicName,
        note: basicDesc,
        ids: selectedSensors,
      });

      console.log('Base updated successfully');
      setBasicName('');
      setBasicDesc('');
      setSelectedSensors([]);
      window.location.href = '/aas/basic';
    } catch (error) {
      console.error('Error updating base:', error);
    }
  };

  const handleBasicModalAdd = async () => {
    try {
      await handleUpdate();
      setBasicModalOpen(false);
      window.location.href = '/aas/basic';
    } catch (error) {
      console.error('Error updating base:', error);
    }
  };

  const handleBasicModalReset = () => {
    if (editingBase) {
      setBasicName(editingBase.ab_name);
      setBasicDesc(editingBase.ab_note || '');
    } else {
      setBasicName('');
      setBasicDesc('');
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

  if (detailMode) {
    return (
      <div className='table-outer'>
        <div>
          <Box sx={{ flexGrow: 1 }} className='sort-box'>
            <Grid container spacing={1}>
              <Grid item xs={8}></Grid>
              <Grid item xs={4}>
                <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant='contained'
                    color='success'
                    onClick={() => {
                      if (selectedBaseForDetail) {
                        window.location.href = `/aas/basic/edit/${selectedBaseForDetail.ab_idx}/edit`;
                      }
                    }}
                  >
                    수정
                  </Button>
                  <Button
                    variant='contained'
                    color='inherit'
                    onClick={() => {
                      window.location.href = '/aas/basic';
                    }}
                  >
                    목록
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </div>

        <div className='table-wrap'>
          {detailLoading ? (
            <LoadingOverlay />
          ) : detailTreeData.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>센서 데이터가 없습니다.</div>
          ) : (
            <SimpleTreeView
              defaultExpandedItems={detailTreeData.flatMap((fg, fgIdx) => [
                `detail-${fgIdx}`,
                ...fg.facilities.map((fa, faIdx) => `detail-sub-${fgIdx}-${faIdx}`),
              ])}
            >
              {detailTreeData.map((fg, fgIdx) => (
                <TreeItem key={fg.fg_idx} itemId={`detail-${fgIdx}`} label={<span>{fg.fg_name}</span>}>
                  {fg.facilities.map((fa, faIdx) => (
                    <TreeItem key={fa.fa_idx} itemId={`detail-sub-${fgIdx}-${faIdx}`} label={<span>{fa.fa_name}</span>}>
                      <div style={{ padding: '8px 0' }}>
                        <TableContainer component={Paper}>
                          <Table size='small'>
                            <TableBody>
                              {(() => {
                                const sensors = fa.sensors || [];
                                const rows: (typeof sensors)[] = [];
                                for (let i = 0; i < sensors.length; i += 6) {
                                  const rowSensors = sensors.slice(i, i + 6);
                                  rows.push(rowSensors);
                                }
                                return rows.map((rowSensors, rowIndex) => (
                                  <TableRow key={rowIndex}>
                                    <TableCell colSpan={3}>
                                      <Grid container spacing={1}>
                                        {rowSensors.map((sensor, idx) => (
                                          <Grid item xs={2} key={sensor.sn_idx}>
                                            <List
                                              sx={{
                                                width: '100%',
                                                bgcolor: 'background.paper',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 1,
                                              }}
                                              className='basic-checkbox'
                                            >
                                              <div>
                                                <ListItem>
                                                  <ListItemText secondary={sensor.sn_name} />
                                                </ListItem>
                                                <Divider variant='middle' component='li' />
                                                <ListItem>
                                                  <ListItemText
                                                    secondary={
                                                      'Prop 1.' +
                                                      (fgIdx + 1) +
                                                      '.' +
                                                      (faIdx + 1) +
                                                      '.' +
                                                      (rowIndex * 6 + idx + 1)
                                                    }
                                                  />
                                                </ListItem>
                                              </div>
                                            </List>
                                          </Grid>
                                        ))}
                                      </Grid>
                                    </TableCell>
                                  </TableRow>
                                ));
                              })()}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    </TreeItem>
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          )}
        </div>
      </div>
    );
  }

  if (editMode) {
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
                    color='primary'
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
                    저장
                  </Button>
                  <Button
                    variant='contained'
                    color='inherit'
                    onClick={() => {
                      window.location.href = '/aas/basic';
                    }}
                  >
                    목록
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
          isEditMode={true}
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

  return (
    <div className='table-outer'>
      <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>로딩 중...</div>
    </div>
  );
}
