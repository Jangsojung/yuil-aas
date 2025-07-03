import React from 'react';
import Grid from '@mui/system/Grid';
import FormControl from '@mui/material/FormControl';
import { TextField } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import Checkbox from '@mui/material/Checkbox';
import LoadingOverlay from '../loading/LodingOverlay';
import FacilityGroupSelect from '../select/facility_group';
import FactorySelect from '../select/factory_select';
import BasicTable from '../table/basic_code';
import { SearchBox, ActionBox } from '../common';
import FacilityAddModal from '../modal/FacilityAddModal';
import { FacilityGroupTree, FactoryTree } from '../../types/api';
import { Dispatch, SetStateAction } from 'react';

interface FacilityViewProps {
  // 상태
  treeData: FactoryTree[];
  treeLoading: boolean;
  selectedFacilityGroups: number[];
  setSelectedFacilityGroups: Dispatch<SetStateAction<number[]>>;
  facilityName: string;
  setFacilityName: (name: string) => void;
  sensorName: string;
  setSensorName: (name: string) => void;
  selectedSensors: number[];
  setSelectedSensors: Dispatch<SetStateAction<number[]>>;
  selectedFacilities: number[];
  setSelectedFacilities: Dispatch<SetStateAction<number[]>>;
  selectedFacilityGroupsForDelete: number[];
  setSelectedFacilityGroupsForDelete: Dispatch<SetStateAction<number[]>>;
  selectedFactoriesForDelete: number[];
  setSelectedFactoriesForDelete: Dispatch<SetStateAction<number[]>>;
  selectedFactory?: number | '';
  setSelectedFactory?: (factory: number | '') => void;
  facilityAddModalOpen?: boolean;
  factoryRefreshKey: number;
  facilityGroupRefreshKey: number;
  syncLoading: boolean;

  // 핸들러
  handleTreeSearch: () => Promise<{ success: boolean; message?: string }>;
  handleReset: () => void;
  handleAddFactory: () => void;
  handleCloseFactoryAddModal: () => void;
  handleFactoryAddSuccess: () => void;
  handleDeleteFacility: () => void;
  handleSynchronize: () => void;
  alertModal: any;
  showAlert: (title: string, content: string) => void;
  showConfirm: (title: string, content: string, onConfirm: () => void) => void;
  closeAlert: () => void;
}

export const FacilityView: React.FC<FacilityViewProps> = ({
  treeData,
  treeLoading,
  selectedFacilityGroups,
  setSelectedFacilityGroups,
  facilityName,
  setFacilityName,
  sensorName,
  setSensorName,
  selectedSensors,
  setSelectedSensors,
  selectedFacilities,
  setSelectedFacilities,
  selectedFacilityGroupsForDelete,
  setSelectedFacilityGroupsForDelete,
  selectedFactoriesForDelete,
  setSelectedFactoriesForDelete,
  selectedFactory = '',
  setSelectedFactory,
  facilityAddModalOpen = false,
  factoryRefreshKey,
  facilityGroupRefreshKey,
  syncLoading,
  handleTreeSearch,
  handleReset,
  handleAddFactory,
  handleCloseFactoryAddModal,
  handleFactoryAddSuccess,
  handleDeleteFacility,
  handleSynchronize,
  alertModal,
  showAlert,
  showConfirm,
  closeAlert,
}) => {
  // treeData는 이미 4단계 구조로 반환됨
  const convertedTreeData: FactoryTree[] = treeData as FactoryTree[];

  const handleSearch = async () => {
    const result = await handleTreeSearch();
    if (!result.success && result.message) {
      // 에러 메시지는 상위에서 처리
      console.error(result.message);
    }
  };

  const handleFactoryChange = (factory: number) => {
    if (setSelectedFactory) {
      setSelectedFactory(factory);
      setSelectedFacilityGroups([]);
      setSelectedFacilities([]);
      setSelectedSensors([]);
      setSelectedFacilityGroupsForDelete([]);
      setSelectedFactoriesForDelete([]);
    }
  };

  const handleFacilityCheckboxChange = (facility: any) => {
    console.log('설비 체크박스 클릭:', facility.fa_idx, facility.fa_name);

    // 설비 선택 상태 업데이트
    const isFacilitySelected = selectedFacilities.includes(facility.fa_idx);
    if (isFacilitySelected) {
      setSelectedFacilities((prev) => prev.filter((id) => id !== facility.fa_idx));
    } else {
      setSelectedFacilities((prev) => Array.from(new Set([...prev, facility.fa_idx])));
    }

    // 해당 설비의 모든 센서 선택 상태도 업데이트
    const facilitySensorIds = facility.sensors.map((sensor: any) => sensor.sn_idx);
    if (isFacilitySelected) {
      // 설비가 해제되면 해당 센서들도 해제
      setSelectedSensors((prev) => prev.filter((id) => !facilitySensorIds.includes(id)));
    } else {
      // 설비가 선택되면 해당 센서들도 선택
      setSelectedSensors((prev) => Array.from(new Set([...prev, ...facilitySensorIds])));
    }
  };

  const isFacilityAllSelected = (facility: any) => {
    return selectedFacilities.includes(facility.fa_idx);
  };

  const handleFacilityGroupCheckboxChange = (facilityGroup: any) => {
    // 설비그룹 선택 상태 업데이트
    const isGroupSelected = selectedFacilityGroupsForDelete.includes(facilityGroup.fg_idx);
    if (isGroupSelected) {
      setSelectedFacilityGroupsForDelete((prev) => prev.filter((id) => id !== facilityGroup.fg_idx));
    } else {
      setSelectedFacilityGroupsForDelete((prev) => Array.from(new Set([...prev, facilityGroup.fg_idx])));
    }

    // 해당 설비그룹의 모든 설비와 센서 선택 상태도 업데이트
    const groupFacilityIds = facilityGroup.facilities.map((fa: any) => fa.fa_idx);
    const groupSensorIds = facilityGroup.facilities.flatMap((fa: any) =>
      fa.sensors.map((sensor: any) => sensor.sn_idx)
    );

    if (isGroupSelected) {
      // 설비그룹이 해제되면 해당 설비들과 센서들도 해제
      setSelectedFacilities((prev) => prev.filter((id) => !groupFacilityIds.includes(id)));
      setSelectedSensors((prev) => prev.filter((id) => !groupSensorIds.includes(id)));
    } else {
      // 설비그룹이 선택되면 해당 설비들과 센서들도 선택
      setSelectedFacilities((prev) => Array.from(new Set([...prev, ...groupFacilityIds])));
      setSelectedSensors((prev) => Array.from(new Set([...prev, ...groupSensorIds])));
    }
  };

  const isFacilityGroupAllSelected = (facilityGroup: any) => {
    return selectedFacilityGroupsForDelete.includes(facilityGroup.fg_idx);
  };

  const handleFactoryCheckboxChange = (factory: any) => {
    // 공장 선택 상태 업데이트
    const isFactorySelected = selectedFactoriesForDelete.includes(factory.fc_idx);
    if (isFactorySelected) {
      setSelectedFactoriesForDelete((prev) => prev.filter((id) => id !== factory.fc_idx));
    } else {
      setSelectedFactoriesForDelete((prev) => Array.from(new Set([...prev, factory.fc_idx])));
    }

    // 해당 공장의 모든 설비그룹, 설비, 센서 선택 상태도 업데이트
    const factoryGroupIds = factory.facilityGroups.map((fg: any) => fg.fg_idx);
    const factoryFacilityIds = factory.facilityGroups.flatMap((fg: any) => fg.facilities.map((fa: any) => fa.fa_idx));
    const factorySensorIds = factory.facilityGroups.flatMap((fg: any) =>
      fg.facilities.flatMap((fa: any) => fa.sensors.map((sensor: any) => sensor.sn_idx))
    );

    if (isFactorySelected) {
      // 공장이 해제되면 해당 설비그룹들, 설비들, 센서들도 해제
      setSelectedFacilityGroupsForDelete((prev) => prev.filter((id) => !factoryGroupIds.includes(id)));
      setSelectedFacilities((prev) => prev.filter((id) => !factoryFacilityIds.includes(id)));
      setSelectedSensors((prev) => prev.filter((id) => !factorySensorIds.includes(id)));
    } else {
      // 공장이 선택되면 해당 설비그룹들, 설비들, 센서들도 선택
      setSelectedFacilityGroupsForDelete((prev) => Array.from(new Set([...prev, ...factoryGroupIds])));
      setSelectedFacilities((prev) => Array.from(new Set([...prev, ...factoryFacilityIds])));
      setSelectedSensors((prev) => Array.from(new Set([...prev, ...factorySensorIds])));
    }
  };

  const isFactoryAllSelected = (factory: any) => {
    return selectedFactoriesForDelete.includes(factory.fc_idx);
  };

  return (
    <>
      <div>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: handleSearch,
              color: 'success',
            },
          ]}
        >
          <Grid container spacing={4}>
            {/* 공장 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>공장</div>
              </Grid>
              <Grid sx={{ flexGrow: 1 }}>
                <FormControl sx={{ minWidth: '200px', width: '100%' }} size='small'>
                  <FactorySelect
                    value={selectedFactory}
                    onChange={handleFactoryChange}
                    placeholder='선택'
                    refreshKey={factoryRefreshKey}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {/* 공장 */}

            {/* 설비그룹 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>설비그룹</div>
              </Grid>
              <Grid sx={{ flexGrow: 1 }}>
                <FormControl sx={{ minWidth: '200px', width: '100%' }} size='small'>
                  <FacilityGroupSelect
                    selectedFacilityGroups={selectedFacilityGroups}
                    setSelectedFacilityGroups={setSelectedFacilityGroups}
                    selectedFactory={selectedFactory}
                    refreshKey={facilityGroupRefreshKey}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {/* 설비그룹 */}

            {/* 설비명 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>설비명</div>
              </Grid>
              <Grid sx={{ flexGrow: 1 }}>
                <FormControl sx={{ minWidth: '200px', width: '100%' }} size='small'>
                  <TextField size='small' value={facilityName} onChange={(e) => setFacilityName(e.target.value)} />
                </FormControl>
              </Grid>
            </Grid>
            {/* 설비명 */}

            {/* 센서명 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>센서명</div>
              </Grid>
              <Grid sx={{ flexGrow: 1 }}>
                <FormControl sx={{ minWidth: '200px', width: '100%' }} size='small'>
                  <TextField size='small' value={sensorName} onChange={(e) => setSensorName(e.target.value)} />
                </FormControl>
              </Grid>
            </Grid>
            {/* 센서명 */}
          </Grid>
        </SearchBox>

        <ActionBox
          buttons={[
            {
              text: '동기화',
              onClick: handleSynchronize || (() => {}),
              color: 'primary',
            },
            {
              text: '설비 추가',
              onClick: handleAddFactory,
              color: 'success',
            },
            {
              text: '설비 삭제',
              onClick: handleDeleteFacility,
              color: 'error',
            },
          ]}
        />
      </div>

      <div className='table-wrap'>
        {treeLoading ? (
          <LoadingOverlay />
        ) : treeData.length === 0 ? (
          <div className='text-center text-muted padding-lg'>조회 결과 없음</div>
        ) : (
          <SimpleTreeView
            defaultExpandedItems={convertedTreeData.flatMap((factory, factoryIdx) => [
              `factory-${factoryIdx}`,
              ...factory.facilityGroups.flatMap((fg, fgIdx) => [
                `facility-group-${factoryIdx}-${fgIdx}`,
                ...fg.facilities.map((fa, faIdx) => `subfacility-${factoryIdx}-${fgIdx}-${faIdx}`),
              ]),
            ])}
          >
            {convertedTreeData.map((factory, factoryIdx) => (
              <TreeItem
                key={factory.fc_idx}
                itemId={`factory-${factoryIdx}`}
                label={
                  <div className='flex-center'>
                    {factory.origin_check !== 1 && (
                      <Checkbox
                        checked={isFactoryAllSelected(factory)}
                        onChange={() => handleFactoryCheckboxChange(factory)}
                        onClick={(e) => e.stopPropagation()}
                        size='small'
                        sx={{ mr: 1 }}
                      />
                    )}
                    <span className='text-bold text-large'>{factory.fc_name}</span>
                  </div>
                }
              >
                {factory.facilityGroups.map((fg, fgIdx) => (
                  <TreeItem
                    key={fg.fg_idx}
                    itemId={`facility-group-${factoryIdx}-${fgIdx}`}
                    label={
                      <div className='flex-center'>
                        {fg.origin_check !== 1 && (
                          <Checkbox
                            checked={isFacilityGroupAllSelected(fg)}
                            onChange={() => handleFacilityGroupCheckboxChange(fg)}
                            onClick={(e) => e.stopPropagation()}
                            size='small'
                            sx={{ mr: 1 }}
                          />
                        )}
                        <span className='text-bold text-medium'>{fg.fg_name}</span>
                      </div>
                    }
                  >
                    {fg.facilities.map((fa, faIdx) => (
                      <TreeItem
                        key={fa.fa_idx}
                        itemId={`subfacility-${factoryIdx}-${fgIdx}-${faIdx}`}
                        label={
                          <div className='flex-center'>
                            {fa.origin_check !== 1 && (
                              <Checkbox
                                checked={isFacilityAllSelected(fa)}
                                onChange={() => handleFacilityCheckboxChange(fa)}
                                onClick={(e) => e.stopPropagation()}
                                size='small'
                                sx={{ mr: 1 }}
                              />
                            )}
                            <span className='text-medium text-small'>{fa.fa_name}</span>
                          </div>
                        }
                      >
                        <div className='padding-y'>
                          <BasicTable
                            sm_idx={`${factoryIdx + 1}.${fgIdx + 1}.${faIdx + 1}`}
                            fa_idx={fa.fa_idx}
                            sensors={fa.sensors}
                            showCheckboxes={true}
                            selectedSensors={selectedSensors}
                            setSelectedSensors={setSelectedSensors}
                            useOriginCheck={true}
                          />
                        </div>
                      </TreeItem>
                    ))}
                  </TreeItem>
                ))}
              </TreeItem>
            ))}
          </SimpleTreeView>
        )}
      </div>

      <FacilityAddModal
        open={facilityAddModalOpen}
        onClose={handleCloseFactoryAddModal || (() => {})}
        onSuccess={handleFactoryAddSuccess || (() => {})}
      />
    </>
  );
};
