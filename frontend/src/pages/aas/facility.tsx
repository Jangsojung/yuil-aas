import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { useFacilityManagement } from '../../hooks/useFacilityManagement';
import { FacilityView } from '../../components/basic/FacilityView';
import AlertModal from '../../components/modal/alert';
import FacilityAddModal from '../../components/modal/FacilityAddModal';
import { getFacilityGroupsAPI, getFacilitiesAPI } from '../../apis/api/basic';

export default function FacilityManagementPage() {
  const navigationReset = useRecoilValue(navigationResetState);

  // 팝업 상태 및 입력값 상태
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [groupList, setGroupList] = useState<{ fg_idx: number; fg_name: string }[]>([]);
  const [facilityList, setFacilityList] = useState<{ fa_idx: string; fa_name: string }[]>([]);
  const [groupValue, setGroupValue] = useState('');
  const [groupInput, setGroupInput] = useState('');
  const [facilityValue, setFacilityValue] = useState('');
  const [facilityInput, setFacilityInput] = useState('');
  const [sensorName, setSensorName] = useState('');

  // 커스텀 훅 사용
  const {
    treeData,
    treeLoading,
    selectedFacilityGroups,
    setSelectedFacilityGroups,
    facilityName,
    setFacilityName,
    sensorName: searchSensorName,
    setSensorName: setSearchSensorName,
    handleTreeSearch,
    handleReset,
    alertModal,
    closeAlert,
  } = useFacilityManagement();

  // 네비게이션 리셋 처리
  useEffect(() => {
    if (navigationReset) {
      handleReset();
    }
  }, [navigationReset, handleReset]);

  // 설비 추가 버튼 클릭 시 팝업 오픈
  const handleOpenAddModal = async () => {
    // 설비그룹 목록 fetch
    const groups = await getFacilityGroupsAPI();
    setGroupList(groups.map((g: any) => ({ fg_idx: g.fg_idx, fg_name: g.fg_name })));
    setFacilityList([]);
    setGroupValue('');
    setGroupInput('');
    setFacilityValue('');
    setFacilityInput('');
    setSensorName('');
    setAddModalOpen(true);
  };

  const handleDeleteFacility = async () => {};

  // 설비그룹 선택 시 설비명 목록 fetch
  const handleGroupValueChange = async (value: string) => {
    setGroupValue(value);
    setGroupInput('');
    setFacilityValue('');
    setFacilityInput('');
    if (value && value !== '신규등록') {
      const group = groupList.find((g) => g.fg_name === value);
      if (group) {
        const facilities = await getFacilitiesAPI(group.fg_idx);
        setFacilityList(facilities.map((f: any) => ({ fa_idx: f.fa_idx, fa_name: f.fa_name })));
      }
    } else {
      setFacilityList([]);
    }
  };

  // 설비명 select 연동
  const handleFacilityValueChange = (value: string) => {
    setFacilityValue(value);
    setFacilityInput('');
  };

  // 팝업 닫기
  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  // 팝업 입력값 초기화
  const handleResetAddModal = () => {
    setGroupValue('');
    setGroupInput('');
    setFacilityValue('');
    setFacilityInput('');
    setSensorName('');
  };

  // 등록 버튼 활성화 조건
  const isAddDisabled =
    // 설비그룹
    !groupValue ||
    (groupValue === '신규등록' && !groupInput) ||
    // 설비명
    !facilityValue ||
    (facilityValue === '신규등록' && !facilityInput) ||
    // 센서명
    !sensorName;

  // 팝업 등록 버튼 클릭
  const handleAddFacilityModal = () => {
    // TODO: 등록 API 연동
    setAddModalOpen(false);
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
        sensorName={searchSensorName}
        setSensorName={setSearchSensorName}
        onTreeSearch={handleTreeSearch}
        onAddFacility={handleOpenAddModal}
        onDeleteFacility={handleDeleteFacility}
      />

      <FacilityAddModal
        open={addModalOpen}
        handleClose={handleCloseAddModal}
        handleAdd={handleAddFacilityModal}
        handleReset={handleResetAddModal}
        groupList={groupList.map((g) => g.fg_name)}
        facilityList={facilityList.map((f) => f.fa_name)}
        groupValue={groupValue}
        setGroupValue={handleGroupValueChange}
        groupInput={groupInput}
        setGroupInput={setGroupInput}
        facilityValue={facilityValue}
        setFacilityValue={handleFacilityValueChange}
        facilityInput={facilityInput}
        setFacilityInput={setFacilityInput}
        sensorName={sensorName}
        setSensorName={setSensorName}
        isAddDisabled={isAddDisabled}
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
