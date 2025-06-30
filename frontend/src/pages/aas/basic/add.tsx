import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import { TextField } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { useRecoilState, useRecoilValue } from 'recoil';
import { navigationResetState, selectedSensorsState, userState } from '../../../recoil/atoms';
import AlertModal from '../../../components/modal/alert';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import LoadingOverlay from '../../../components/loading/LodingOverlay';
import BasicModal from '../../../components/modal/basicmodal';
import FacilityGroupSelect from '../../../components/select/facility_group';
import BasicTable from '../../../components/table/basic_code';
import { insertBaseAPI, buildTreeDataAPI } from '../../../apis/api/basic';
import { SearchBox, ActionBox } from '../../../components/common';
import { FacilityGroupTree } from '../../../types/api';
import { useAlertModal } from '../../../hooks/useAlertModal';

export default function BasiccodeAddPage() {
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [facilityName, setFacilityName] = useState('');
  const [sensorName, setSensorName] = useState('');
  const userIdx = useRecoilValue(userState)?.user_idx;
  const navigationReset = useRecoilValue(navigationResetState);

  const { alertModal, showAlert, closeAlert } = useAlertModal();

  const [treeData, setTreeData] = useState<FacilityGroupTree[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);

  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [basicName, setBasicName] = useState('');
  const [basicDesc, setBasicDesc] = useState('');

  const [selectedFacilityGroups, setSelectedFacilityGroups] = useState<number[]>([]);

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
    }
  }, [navigationReset, setSelectedSensors]);

  const handleAdd = async () => {
    if (selectedSensors.length === 0) {
      showAlert('알림', '센서를 선택해주세요.');
      return;
    }

    if (!basicName.trim()) {
      showAlert('알림', '기초코드명을 입력해주세요.');
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
      showAlert('오류', '기초코드 등록 중 오류가 발생했습니다.');
    }
  };

  const handleBasicModalAdd = async () => {
    await handleAdd();
  };

  const handleBasicModalReset = () => {
    setBasicName('');
    setBasicDesc('');
  };

  const handleBackToMain = () => {
    window.location.href = '/aas/basic';
  };

  const handleTreeSearch = async () => {
    if (!facilityName.trim() && !sensorName.trim() && selectedFacilityGroups.length === 0) {
      showAlert('알림', '검색 조건을 입력해주세요.');
      return;
    }

    setTreeLoading(true);

    try {
      const finalFilteredData = await buildTreeDataAPI(selectedFacilityGroups, facilityName, sensorName);
      setTreeData(finalFilteredData);
    } catch (err) {
      console.error('검색 에러:', err);
      setTreeData([]);
      showAlert('오류', '검색 중 오류가 발생했습니다.');
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

  return (
    <div className='table-outer'>
      <div>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: handleTreeSearch,
              color: 'success',
            },
          ]}
        >
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
          </Grid>
        </SearchBox>

        <ActionBox
          buttons={[
            {
              text: '기초코드 등록',
              onClick: () => {
                if (selectedSensors.length === 0) {
                  showAlert('알림', '센서를 선택해주세요.');
                } else {
                  setBasicModalOpen(true);
                }
              },
              color: 'success',
            },
            {
              text: '취소',
              onClick: handleBackToMain,
              color: 'inherit',
              variant: 'outlined',
            },
          ]}
        />
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
        open={alertModal.open}
        handleClose={closeAlert}
        title={alertModal.title}
        content={alertModal.content}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </div>
  );
}
