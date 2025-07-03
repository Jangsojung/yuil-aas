import { useState, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { userState } from '../recoil/atoms';
import { useAlertModal } from './useAlertModal';
import { buildTreeDataAPI } from '../apis/api/basic';
import {
  deleteSensors,
  deleteFacilities,
  deleteFacilityGroups,
  deleteFactories,
  synchronizeFacility,
} from '../apis/api/facility';
import { FactoryTree } from '../types/api';

export const useFacilityManagement = () => {
  const userIdx = useRecoilValue(userState)?.user_idx;
  const { alertModal, showAlert, showConfirm, closeAlert } = useAlertModal();

  // 상태 관리
  const [treeData, setTreeData] = useState<FactoryTree[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedFacilityGroups, setSelectedFacilityGroups] = useState<number[]>([]);
  const [facilityName, setFacilityName] = useState('');
  const [sensorName, setSensorName] = useState('');
  const [selectedFactory, setSelectedFactory] = useState<number | ''>('');
  const [facilityAddModalOpen, setFacilityAddModalOpen] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState<number[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>([]);
  const [selectedFacilityGroupsForDelete, setSelectedFacilityGroupsForDelete] = useState<number[]>([]);
  const [selectedFactoriesForDelete, setSelectedFactoriesForDelete] = useState<number[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [factoryRefreshKey, setFactoryRefreshKey] = useState(0);
  const [facilityGroupRefreshKey, setFacilityGroupRefreshKey] = useState(0);

  // 트리 검색
  const handleTreeSearch = useCallback(async () => {
    if (!selectedFactory) {
      return { success: false, message: '공장을 선택해주세요.' };
    }

    if (!facilityName.trim() && !sensorName.trim() && selectedFacilityGroups.length === 0) {
      return { success: false, message: '검색 조건을 입력해주세요.' };
    }

    setTreeLoading(true);
    try {
      const finalFilteredData = await buildTreeDataAPI(
        selectedFacilityGroups,
        facilityName,
        sensorName,
        selectedFactory as number
      );
      setTreeData(finalFilteredData);
      return { success: true };
    } catch (err) {
      console.error('검색 에러:', err);
      setTreeData([]);
      return { success: false, message: '검색 중 오류가 발생했습니다.' };
    } finally {
      setTreeLoading(false);
    }
  }, [selectedFactory, selectedFacilityGroups, facilityName, sensorName]);

  // 초기화
  const handleReset = useCallback(() => {
    setTreeData([]);
    setSelectedFacilityGroups([]);
    setFacilityName('');
    setSensorName('');
    setSelectedFactory('');
    setSelectedSensors([]);
    setSelectedFacilities([]);
    setSelectedFacilityGroupsForDelete([]);
    setSelectedFactoriesForDelete([]);
  }, []);

  // 부분 초기화 (공장 선택 유지)
  const handlePartialReset = useCallback(() => {
    setTreeData([]);
    setSelectedFacilityGroups([]);
    setFacilityName('');
    setSensorName('');
    setSelectedSensors([]);
    setSelectedFacilities([]);
    setSelectedFacilityGroupsForDelete([]);
    setSelectedFactoriesForDelete([]);
    // setSelectedFactory(''); // 공장 선택은 유지
  }, []);

  // 공장 추가 모달
  const handleAddFactory = useCallback(() => {
    setFacilityAddModalOpen(true);
  }, []);

  const handleCloseFactoryAddModal = useCallback(() => {
    setFacilityAddModalOpen(false);
  }, []);

  const handleFactoryAddSuccess = useCallback(() => {
    setFacilityAddModalOpen(false);
    handleTreeSearch();
    setFactoryRefreshKey((prev) => prev + 1);
  }, [handleTreeSearch]);

  // 설비그룹 추가 모달
  const handleAddFacilityGroup = useCallback(() => {
    setFacilityAddModalOpen(true);
  }, []);

  const handleCloseFacilityGroupAddModal = useCallback(() => {
    setFacilityAddModalOpen(false);
  }, []);

  const handleFacilityGroupAddSuccess = useCallback(() => {
    setFacilityAddModalOpen(false);
    handleTreeSearch();
    setFacilityGroupRefreshKey((prev) => prev + 1);
  }, [handleTreeSearch]);

  // 통합 삭제 함수
  const handleDeleteFacility = useCallback(async () => {
    // 선택된 항목들 확인
    const hasSelectedSensors = selectedSensors.length > 0;
    const hasSelectedFacilities = selectedFacilities.length > 0;
    const hasSelectedFacilityGroups = selectedFacilityGroupsForDelete.length > 0;
    const hasSelectedFactories = selectedFactoriesForDelete.length > 0;

    console.log('삭제 함수 호출됨');
    console.log('선택된 센서:', selectedSensors);
    console.log('선택된 설비:', selectedFacilities);
    console.log('선택된 설비그룹:', selectedFacilityGroupsForDelete);
    console.log('선택된 공장:', selectedFactoriesForDelete);

    if (!hasSelectedSensors && !hasSelectedFacilities && !hasSelectedFacilityGroups && !hasSelectedFactories) {
      showAlert('알림', '삭제할 항목을 선택해주세요.');
      return;
    }

    // 우선순위: 공장 > 설비그룹 > 설비 > 센서
    let deleteType = '';
    let deleteCount = 0;
    let confirmMessage = '';

    if (hasSelectedFactories) {
      deleteType = '공장';
      deleteCount = selectedFactoriesForDelete.length;
      confirmMessage = `선택한 ${deleteCount}개의 공장을 삭제하시겠습니까?\n(해당 공장의 모든 설비그룹, 설비, 센서도 함께 삭제됩니다.)`;
    } else if (hasSelectedFacilityGroups) {
      deleteType = '설비그룹';
      deleteCount = selectedFacilityGroupsForDelete.length;
      confirmMessage = `선택한 ${deleteCount}개의 설비그룹을 삭제하시겠습니까?\n(해당 설비그룹의 모든 설비와 센서도 함께 삭제됩니다.)`;
    } else if (hasSelectedFacilities) {
      deleteType = '설비';
      deleteCount = selectedFacilities.length;
      confirmMessage = `선택한 ${deleteCount}개의 설비를 삭제하시겠습니까?\n(해당 설비의 모든 센서도 함께 삭제됩니다.)`;
    } else if (hasSelectedSensors) {
      deleteType = '센서';
      deleteCount = selectedSensors.length;
      confirmMessage = `선택한 ${deleteCount}개의 센서를 삭제하시겠습니까?`;
    }

    showConfirm('삭제 확인', confirmMessage, async () => {
      try {
        if (hasSelectedFactories) {
          await deleteFactories(selectedFactoriesForDelete);
          showAlert('알림', `${deleteType} 삭제 완료`);
          handleReset();
        } else if (hasSelectedFacilityGroups) {
          await deleteFacilityGroups(selectedFacilityGroupsForDelete);
          showAlert('알림', `${deleteType} 삭제 완료`);
          // 삭제된 설비그룹만 선택 목록에서 제거
          setSelectedFacilityGroups((prev) => prev.filter((id) => !selectedFacilityGroupsForDelete.includes(id)));
          setSelectedFacilityGroupsForDelete([]);
          setSelectedFacilities([]);
          setSelectedSensors([]);
          setFacilityName('');
          setSensorName('');
          setTreeData([]);
          setFacilityGroupRefreshKey((prev) => prev + 1);
        } else if (hasSelectedFacilities) {
          await deleteFacilities(selectedFacilities);
          showAlert('알림', `${deleteType} 삭제 완료`);
          // 설비 삭제 시 검색조건 유지(필요시 별도 처리)
        } else if (hasSelectedSensors) {
          await deleteSensors(selectedSensors);
          showAlert('알림', `${deleteType} 삭제 완료`);
          // 센서 삭제 시 검색조건 유지(필요시 별도 처리)
        }
      } catch (err) {
        console.error(`${deleteType} 삭제 중 오류 발생:`, err);
        showAlert('에러', `${deleteType} 삭제 중 오류가 발생했습니다.`);
      }
    });
  }, [
    selectedSensors,
    selectedFacilities,
    selectedFacilityGroupsForDelete,
    selectedFactoriesForDelete,
    showAlert,
    showConfirm,
    handleReset,
    handlePartialReset,
  ]);

  const handleSynchronize = useCallback(async () => {
    setSyncLoading(true);
    try {
      await synchronizeFacility();
      showAlert('알림', '동기화 완료');
      handleReset();
    } catch (err) {
      console.error('동기화 중 오류 발생:', err);
      showAlert('에러', '동기화 중 오류가 발생했습니다.');
    } finally {
      setSyncLoading(false);
    }
  }, [showAlert, handleReset]);

  return {
    treeData,
    treeLoading,
    selectedFacilityGroups,
    facilityName,
    sensorName,
    selectedFactory,
    facilityAddModalOpen,
    selectedSensors,
    selectedFacilities,
    selectedFacilityGroupsForDelete,
    selectedFactoriesForDelete,
    syncLoading,
    factoryRefreshKey,
    facilityGroupRefreshKey,
    handleTreeSearch,
    handleReset,
    handlePartialReset,
    handleAddFactory,
    handleCloseFactoryAddModal,
    handleFactoryAddSuccess,
    handleAddFacilityGroup,
    handleCloseFacilityGroupAddModal,
    handleFacilityGroupAddSuccess,
    handleDeleteFacility,
    handleSynchronize,
    setSelectedFacilityGroups,
    setFacilityName,
    setSensorName,
    setSelectedFactory,
    setSelectedSensors,
    setSelectedFacilities,
    setSelectedFacilityGroupsForDelete,
    setSelectedFactoriesForDelete,
    alertModal,
    showAlert,
    showConfirm,
    closeAlert,
  };
};
