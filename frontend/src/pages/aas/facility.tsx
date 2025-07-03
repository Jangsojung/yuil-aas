import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { useFacilityManagement } from '../../hooks/useFacilityManagement';
import { FacilityView } from '../../components/basic/FacilityView';
import AlertModal from '../../components/modal/alert';

export default function FacilityManagementPage() {
  const navigationReset = useRecoilValue(navigationResetState);

  // 커스텀 훅 사용
  const {
    treeData,
    treeLoading,
    selectedFacilityGroups,
    setSelectedFacilityGroups,
    facilityName,
    setFacilityName,
    sensorName,
    setSensorName,
    selectedFactory,
    setSelectedFactory,
    facilityAddModalOpen,
    selectedSensors,
    setSelectedSensors,
    handleTreeSearch,
    handleReset,
    handleAddFacility,
    handleCloseFacilityAddModal,
    handleFacilityAddSuccess,
    handleDeleteSensors,
    alertModal,
    showAlert,
    closeAlert,
  } = useFacilityManagement();

  // 네비게이션 리셋 처리
  useEffect(() => {
    if (navigationReset) {
      handleReset();
    }
  }, [navigationReset, handleReset]);

  // 설비 삭제 처리
  const handleDeleteFacility = () => {
    handleDeleteSensors();
  };

  return (
    <div className='table-outer'>
      <FacilityView
        treeData={treeData}
        treeLoading={treeLoading}
        selectedFacilityGroups={selectedFacilityGroups}
        setSelectedFacilityGroups={setSelectedFacilityGroups}
        facilityName={facilityName}
        setFacilityName={setFacilityName}
        sensorName={sensorName}
        setSensorName={setSensorName}
        selectedSensors={selectedSensors}
        setSelectedSensors={setSelectedSensors}
        selectedFactory={selectedFactory}
        setSelectedFactory={setSelectedFactory}
        facilityAddModalOpen={facilityAddModalOpen}
        onTreeSearch={handleTreeSearch}
        onAddFacility={handleAddFacility}
        onDeleteFacility={handleDeleteFacility}
        onCloseFacilityAddModal={handleCloseFacilityAddModal}
        onFacilityAddSuccess={handleFacilityAddSuccess}
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
