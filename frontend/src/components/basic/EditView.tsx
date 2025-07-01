import React from 'react';
import Grid from '@mui/material/Grid';
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
  onTreeSearch: () => void;
  onGroupSelectAll: (fgIdx: number, checked: boolean) => void;
  onFacilitySelectAll: (fgIdx: number, faIdx: number, checked: boolean) => void;
  isAllSensorsSelectedInGroup: (fgIdx: number) => boolean;
  isAllSensorsSelectedInFacility: (fgIdx: number, faIdx: number) => boolean;
  onBasicModalAdd: () => void;
  onBasicModalReset: () => void;
  onBackToList: () => void;
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
  onTreeSearch,
  onGroupSelectAll,
  onFacilitySelectAll,
  isAllSensorsSelectedInGroup,
  isAllSensorsSelectedInFacility,
  onBasicModalAdd,
  onBasicModalReset,
  onBackToList,
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
    <div className='table-outer'>
      <div>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: onTreeSearch,
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
              text: '저장',
              onClick: handleSave,
              color: 'primary',
            },
            {
              text: '목록',
              onClick: onBackToList,
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
          <div className='text-center text-muted padding-lg'>조회 결과 없음</div>
        ) : (
          <FacilityTreeView
            treeData={treeData}
            selectedSensors={selectedSensors}
            onSensorSelect={() => {}} // BasicTable에서 직접 처리
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
  );
};
