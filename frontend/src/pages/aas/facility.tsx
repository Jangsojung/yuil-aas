import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { useFacilityManagement } from '../../hooks/useFacilityManagement';
import { FacilityView } from '../../components/basic/FacilityView';
import AlertModal from '../../components/modal/alert';
import { deleteSensors } from '../../apis/api/facility';

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
    handleTreeSearch,
    handleReset,
    handleAddFacility,
    handleCloseFacilityAddModal,
    handleFacilityAddSuccess,
    alertModal,
    showAlert,
    showConfirm,
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
    // 선택된 센서가 없으면 알림
    showAlert('알림', '삭제할 센서를 선택해주세요.');
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
        selectedSensors={[]}
        setSelectedSensors={() => {}}
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
