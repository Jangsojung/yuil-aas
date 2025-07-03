import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { useFacilityManagement } from '../../hooks/useFacilityManagement';
import { FacilityView } from '../../components/basic/FacilityView';
import AlertModal from '../../components/modal/alert';
import LoadingOverlay from '../../components/loading/LodingOverlay';

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
    selectedFacilities,
    setSelectedFacilities,
    selectedFacilityGroupsForDelete,
    setSelectedFacilityGroupsForDelete,
    selectedFactoriesForDelete,
    setSelectedFactoriesForDelete,
    syncLoading,
    factoryRefreshKey,
    facilityGroupRefreshKey,
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
  } = useFacilityManagement();

  // 네비게이션 리셋 처리
  useEffect(() => {
    if (navigationReset) {
      handleReset();
    }
  }, [navigationReset, handleReset]);

  return (
    <>
      <FacilityView
        treeData={treeData}
        treeLoading={treeLoading}
        selectedFacilityGroups={selectedFacilityGroups}
        setSelectedFacilityGroups={setSelectedFacilityGroups}
        facilityName={facilityName}
        setFacilityName={setFacilityName}
        sensorName={sensorName}
        setSensorName={setSensorName}
        selectedFactory={selectedFactory}
        setSelectedFactory={setSelectedFactory}
        facilityAddModalOpen={facilityAddModalOpen}
        selectedSensors={selectedSensors}
        setSelectedSensors={setSelectedSensors}
        selectedFacilities={selectedFacilities}
        setSelectedFacilities={setSelectedFacilities}
        selectedFacilityGroupsForDelete={selectedFacilityGroupsForDelete}
        setSelectedFacilityGroupsForDelete={setSelectedFacilityGroupsForDelete}
        selectedFactoriesForDelete={selectedFactoriesForDelete}
        setSelectedFactoriesForDelete={setSelectedFactoriesForDelete}
        syncLoading={syncLoading}
        factoryRefreshKey={factoryRefreshKey}
        facilityGroupRefreshKey={facilityGroupRefreshKey}
        handleTreeSearch={handleTreeSearch}
        handleReset={handleReset}
        handleAddFactory={handleAddFactory}
        handleCloseFactoryAddModal={handleCloseFactoryAddModal}
        handleFactoryAddSuccess={handleFactoryAddSuccess}
        handleDeleteFacility={handleDeleteFacility}
        handleSynchronize={handleSynchronize}
        alertModal={alertModal}
        showAlert={showAlert}
        showConfirm={showConfirm}
        closeAlert={closeAlert}
      />

      <AlertModal
        open={alertModal.open}
        handleClose={closeAlert}
        title={alertModal.title}
        content={alertModal.content}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />

      {syncLoading && <LoadingOverlay />}
    </>
  );
}
