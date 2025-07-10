import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../../recoil/atoms';
import { useBasicAdd } from '../../../hooks/useBasicAdd';
import { useSensorSelection } from '../../../hooks/useSensorSelection';
import { EditView } from '../../../components/basic/EditView';
import BasicModal from '../../../components/modal/basicmodal';
import AlertModal from '../../../components/modal/alert';
import { useNavigate } from 'react-router-dom';

export default function BasiccodeAddPage() {
  const navigationReset = useRecoilValue(navigationResetState);
  const navigate = useNavigate();

  // 커스텀 훅 사용
  const {
    treeData,
    treeLoading,
    basicModalOpen,
    setBasicModalOpen,
    basicName,
    setBasicName,
    basicDesc,
    setBasicDesc,
    selectedFacilityGroups,
    setSelectedFacilityGroups,
    facilityName,
    setFacilityName,
    sensorName,
    setSensorName,
    selectedSensors,
    selectedFactory,
    handleTreeSearch,
    handleBasicModalAdd,
    handleBasicModalReset,
    handleReset,
    handleFactoryChange,
    alertModal,
    closeAlert,
  } = useBasicAdd();

  const { handleGroupSelectAll, handleFacilitySelectAll, isAllSensorsSelectedInGroup, isAllSensorsSelectedInFacility } =
    useSensorSelection();

  // 네비게이션 리셋 처리
  useEffect(() => {
    if (navigationReset) {
      handleReset();
    }
  }, [navigationReset, handleReset]);

  // 센서 선택 핸들러들
  const handleGroupSelectAllWrapper = (fgIdx: number, checked: boolean) => {
    handleGroupSelectAll(treeData, fgIdx, checked);
  };

  const handleFacilitySelectAllWrapper = (fgIdx: number, faIdx: number, checked: boolean) => {
    handleFacilitySelectAll(treeData, fgIdx, faIdx, checked);
  };

  const isAllSensorsSelectedInGroupWrapper = (fgIdx: number) => {
    return isAllSensorsSelectedInGroup(treeData, fgIdx);
  };

  const isAllSensorsSelectedInFacilityWrapper = (fgIdx: number, faIdx: number) => {
    return isAllSensorsSelectedInFacility(treeData, fgIdx, faIdx);
  };

  const handleBackToList = () => {
    navigate('/aas/basic');
  };

  return (
    <div className='no-flex-header'>
      <EditView
        treeData={treeData}
        treeLoading={treeLoading}
        selectedFacilityGroups={selectedFacilityGroups}
        setSelectedFacilityGroups={setSelectedFacilityGroups}
        facilityName={facilityName}
        setFacilityName={setFacilityName}
        sensorName={sensorName}
        setSensorName={setSensorName}
        basicModalOpen={basicModalOpen}
        setBasicModalOpen={setBasicModalOpen}
        basicName={basicName}
        setBasicName={setBasicName}
        basicDesc={basicDesc}
        setBasicDesc={setBasicDesc}
        selectedSensors={selectedSensors}
        selectedFactory={selectedFactory}
        setSelectedFactory={handleFactoryChange}
        onTreeSearch={handleTreeSearch}
        onGroupSelectAll={handleGroupSelectAllWrapper}
        onFacilitySelectAll={handleFacilitySelectAllWrapper}
        isAllSensorsSelectedInGroup={isAllSensorsSelectedInGroupWrapper}
        isAllSensorsSelectedInFacility={isAllSensorsSelectedInFacilityWrapper}
        onBasicModalAdd={() => handleBasicModalAdd(navigate)}
        onBasicModalReset={handleBasicModalReset}
        onBackToList={handleBackToList}
      />

      <BasicModal
        open={basicModalOpen}
        handleClose={() => setBasicModalOpen(false)}
        handleAdd={() => handleBasicModalAdd(navigate)}
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
