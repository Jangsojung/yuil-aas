import React from 'react';
import Grid from '@mui/system/Grid';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import { TextField } from '@mui/material';
import { FacilityGroupTree } from '../../types/api';
import { SearchBox, ActionBox } from '../common';
import LoadingOverlay from '../loading/LodingOverlay';
import FacilityGroupSelect from '../select/facility_group';
import { FacilityTreeView } from '../treeview/FacilityTreeView';
import BasicModal from '../modal/basicmodal';
import AlertModal from '../modal/alert';
import { useAlertModal } from '../../hooks/useAlertModal';
import FactorySelect from '../select/factory_select';

interface EditViewProps {
  treeData: FacilityGroupTree[];
  treeLoading: boolean;
  selectedFacilityGroups: number[];
  setSelectedFacilityGroups: React.Dispatch<React.SetStateAction<number[]>>;
  facilityName: string;
  setFacilityName: (name: string) => void;
  sensorName: string;
  setSensorName: (name: string) => void;
  basicModalOpen: boolean;
  setBasicModalOpen: (open: boolean) => void;
  basicName: string;
  setBasicName: (name: string) => void;
  basicDesc: string;
  setBasicDesc: (desc: string) => void;
  selectedSensors: number[];
  selectedFactory: number | '';
  setSelectedFactory: (fc: number | '') => void;
  onTreeSearch: () => void;
  onGroupSelectAll: (fgIdx: number, checked: boolean) => void;
  onFacilitySelectAll: (fgIdx: number, faIdx: number, checked: boolean) => void;
  isAllSensorsSelectedInGroup: (fgIdx: number) => boolean;
  isAllSensorsSelectedInFacility: (fgIdx: number, faIdx: number) => boolean;
  onBasicModalAdd: () => void;
  onBasicModalReset: () => void;
  onBackToList: () => void;
  onSensorSelect: (sensorId: number, checked: boolean) => void;
  hideFactorySelect?: boolean;
}

export const EditView: React.FC<EditViewProps> = ({
  treeData,
  treeLoading,
  selectedFacilityGroups,
  setSelectedFacilityGroups,
  facilityName,
  setFacilityName,
  sensorName,
  setSensorName,
  basicModalOpen,
  setBasicModalOpen,
  basicName,
  setBasicName,
  basicDesc,
  setBasicDesc,
  selectedSensors,
  selectedFactory,
  setSelectedFactory,
  onTreeSearch,
  onGroupSelectAll,
  onFacilitySelectAll,
  isAllSensorsSelectedInGroup,
  isAllSensorsSelectedInFacility,
  onBasicModalAdd,
  onBasicModalReset,
  onBackToList,
  onSensorSelect,
  hideFactorySelect = false,
}) => {
  const { alertModal, showAlert, closeAlert } = useAlertModal();

  const handleSave = () => {
    if (selectedSensors.length === 0) {
      showAlert('알림', '센서를 선택해주세요.');
      return;
    }
    setBasicModalOpen(true);
  };

  return (
    <>
      <div className="table-outer" style={{ height: 'calc(100% - 25px)' }}>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: onTreeSearch,
              color: 'primary',
            },
          ]}
        >
          <Grid container spacing={4}>
            {/* 공장 */}
            {!hideFactorySelect && (
              <Grid container spacing={2}>
                <Grid className='sort-title'>
                  <div>공장</div>
                </Grid>
                <Grid>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <FactorySelect value={selectedFactory} onChange={setSelectedFactory} />
                  </FormControl>
                </Grid>
              </Grid>
            )}
            {/* 공장 */}

            {/* 설비그룹 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>설비그룹</div>
              </Grid>
              <Grid>
                <FormControl sx={{ width: '100%' }} size='small'>
                  <FacilityGroupSelect
                    selectedFacilityGroups={selectedFacilityGroups}
                    setSelectedFacilityGroups={setSelectedFacilityGroups}
                    selectedFactory={selectedFactory}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {/* 설비그룹 */}

            {/* 설비명 */}
            <Grid container>
              <Grid className='sort-title'>
                <div>설비명</div>
              </Grid>
              <Grid>
                <FormControl sx={{ width: '100%' }} size='small'>
                  <TextField size='small' value={facilityName} onChange={(e) => setFacilityName(e.target.value)} />
                </FormControl>
              </Grid>
            </Grid>
            {/* 설비명 */}

            {/* 센서명 */}
            <Grid container>
              <Grid className='sort-title'>
                <div>센서명</div>
              </Grid>
              <Grid>
                <FormControl sx={{ width: '100%' }} size='small'>
                  <TextField size='small' value={sensorName} onChange={(e) => setSensorName(e.target.value)} />
                </FormControl>
              </Grid>
            </Grid>
            {/* 센서명 */}
          </Grid>
        </SearchBox>

        <div className='list-header'>
          <Typography variant='h6' gutterBottom>
            설비 목록
          </Typography>

          <ActionBox
            buttons={[
              {
                text: '저장',
                onClick: handleSave,
                color: 'primary',
              },
              {
                text: '취소',
                onClick: onBackToList,
                color: 'inherit',
                variant: 'outlined',
              },
            ]}
          />
        </div>

        <div className='table-wrap tree-scroll-wrap'>
          {treeLoading ? (
            <LoadingOverlay />
          ) : treeData.length === 0 ? (
            <div className='text-center text-muted padding-lg'>조회 결과 없음</div>
          ) : (
            <FacilityTreeView
              treeData={treeData}
              selectedSensors={selectedSensors}
              onSensorSelect={onSensorSelect}
              onGroupSelectAll={onGroupSelectAll}
              onFacilitySelectAll={onFacilitySelectAll}
              isAllSensorsSelectedInGroup={isAllSensorsSelectedInGroup}
              isAllSensorsSelectedInFacility={isAllSensorsSelectedInFacility}
              defaultExpandedItems={treeData.flatMap((fg, fgIdx) => [
                `aas-${fgIdx}`,
                ...fg.facilities.map((fa, faIdx) => `submodal-${fgIdx}-${faIdx}`),
              ])}
            />
          )}
        </div>

        <BasicModal
          open={basicModalOpen}
          handleClose={() => setBasicModalOpen(false)}
          handleAdd={onBasicModalAdd}
          handleReset={onBasicModalReset}
          selectedSensorCount={selectedSensors.length}
          name={basicName}
          setName={setBasicName}
          desc={basicDesc}
          setDesc={setBasicDesc}
          isEditMode={true}
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
    </>
  );
};
