import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { useFacilityManagement } from '../../hooks/useFacilityManagement';
import { FacilityView } from '../../components/basic/FacilityView';
import AlertModal from '../../components/modal/alert';
import FacilityAddModal from '../../components/modal/FacilityAddModal';
import { getFacilityGroupsAPI, getFacilitiesAPI } from '../../apis/api/basic';
import { postFacilityGroup, postFacility, postSensor } from '../../apis/api/facility';

export default function FacilityManagementPage() {
  const navigationReset = useRecoilValue(navigationResetState);

  // 팝업 상태 및 입력값 상태
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [groupList, setGroupList] = useState<{ fg_idx: number; fg_name: string }[]>([]);
  const [facilityList, setFacilityList] = useState<{ fa_idx: number; fa_name: string }[]>([]);
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
  const handleAddFacilityModal = async (
    selectedGroup?: { fg_idx: number; fg_name: string },
    selectedFacility?: { fa_idx: number; fa_name: string }
  ) => {
    let fg_idx: number | undefined = undefined;
    let fa_idx: number | undefined = undefined;
    let newGroupName = '';

    // 설비그룹 처리
    if (groupValue === '신규등록') {
      // 신규 설비그룹 등록
      fg_idx = await postFacilityGroup({ name: groupInput });
      newGroupName = groupInput;
      console.log('신규 설비그룹 등록 완료, fg_idx:', fg_idx);
    } else {
      // 기존 설비그룹 선택
      fg_idx = selectedGroup?.fg_idx;
      console.log('선택된 설비그룹:', selectedGroup?.fg_name, 'idx:', fg_idx);
    }

    // 설비 처리
    if (facilityValue === '신규등록') {
      // 신규 설비 등록
      fa_idx = await postFacility({ fg_idx, name: facilityInput });
      console.log('신규 설비 등록 완료, fa_idx:', fa_idx);
    } else {
      // 기존 설비 선택
      fa_idx = selectedFacility?.fa_idx;
      console.log('선택된 설비:', selectedFacility?.fa_name, 'idx:', fa_idx);
    }

    // 센서 등록
    await postSensor({ fa_idx, name: sensorName });
    console.log('센서 등록 완료:', sensorName);

    // 팝업 닫기
    setAddModalOpen(false);

    // 등록된 데이터가 반영된 화면으로 새로고침
    try {
      // 설비그룹이 새로 추가된 경우, 설비그룹 목록도 새로고침
      if (groupValue === '신규등록') {
        const updatedGroups = await getFacilityGroupsAPI();
        setGroupList(updatedGroups.map((g: any) => ({ fg_idx: g.fg_idx, fg_name: g.fg_name })));
        console.log('설비그룹 목록 새로고침 완료');
      }

      // 현재 검색 조건으로 트리 데이터 새로고침
      if (selectedFacilityGroups.length > 0 || facilityName || searchSensorName) {
        // 검색 조건이 있으면 현재 검색 결과 새로고침
        await handleTreeSearch();
      } else {
        // 검색 조건이 없으면 전체 데이터 새로고침
        const result = await handleTreeSearch();
        if (!result.success) {
          console.log('트리 데이터 새로고침 실패:', result.message);
        }
      }

      console.log('설비 등록 완료 후 화면 새로고침 완료');
    } catch (error) {
      console.error('화면 새로고침 중 오류:', error);
    }
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
        groupList={groupList}
        facilityList={facilityList}
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
