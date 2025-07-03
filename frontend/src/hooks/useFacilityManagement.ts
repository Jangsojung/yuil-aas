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

  // 설비 추가 모달
  const handleAddFacility = useCallback(() => {
    setFacilityAddModalOpen(true);
  }, []);

  const handleCloseFacilityAddModal = useCallback(() => {
    setFacilityAddModalOpen(false);
  }, []);

  const handleFacilityAddSuccess = useCallback(() => {
    setFacilityAddModalOpen(false);
    // 설비 추가 후 트리 데이터 새로고침
    handleTreeSearch();
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

    const confirmed = await new Promise<boolean>((resolve) => {
      showConfirm(`${deleteType} 삭제`, confirmMessage, () => resolve(true));
    });

    if (!confirmed) return;

    try {
      let result;
      let deleted = false;
      // 센서 → 설비 → 설비그룹 → 공장 순서로 모두 삭제 시도
      if (hasSelectedSensors) {
        console.log('센서 삭제 API 호출:', selectedSensors);
        result = await deleteSensors(selectedSensors);
        console.log('센서 삭제 결과:', result);
        if (result.success) {
          setSelectedSensors([]);
          deleted = true;
        }
      }
      if (hasSelectedFacilities) {
        console.log('설비 삭제 API 호출:', selectedFacilities);
        result = await deleteFacilities(selectedFacilities);
        console.log('설비 삭제 결과:', result);
        if (result.success) {
          setSelectedFacilities([]);
          deleted = true;
        }
      }
      if (hasSelectedFacilityGroups) {
        console.log('설비그룹 삭제 API 호출:', selectedFacilityGroupsForDelete);
        result = await deleteFacilityGroups(selectedFacilityGroupsForDelete);
        console.log('설비그룹 삭제 결과:', result);
        if (result.success) {
          setSelectedFacilityGroupsForDelete([]);
          deleted = true;
        }
      }
      if (hasSelectedFactories) {
        console.log('공장 삭제 API 호출:', selectedFactoriesForDelete);
        result = await deleteFactories(selectedFactoriesForDelete);
        console.log('공장 삭제 결과:', result);
        if (result.success) {
          setSelectedFactoriesForDelete([]);
          deleted = true;
        }
      }

      if (deleted && result && result.success) {
        showAlert('알림', result.message);
        // 삭제 후 트리 데이터 새로고침
        handleTreeSearch();
      } else if (result) {
        showAlert('오류', result.message || `${deleteType} 삭제 중 오류가 발생했습니다.`);
      }
    } catch (error) {
      console.error(`${deleteType} 삭제 실패:`, error);
      showAlert('오류', `${deleteType} 삭제 중 오류가 발생했습니다.`);
    }
  }, [
    selectedSensors,
    selectedFacilities,
    selectedFacilityGroupsForDelete,
    selectedFactoriesForDelete,
    showAlert,
    showConfirm,
    handleTreeSearch,
  ]);

  // 설비 동기화
  const handleSynchronize = useCallback(async () => {
    setSyncLoading(true);
    try {
      const result = await synchronizeFacility();
      if (result.success) {
        showAlert('알림', result.message);
        // 알림 모달이 표시된 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showAlert('오류', result.message || '설비 동기화 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('설비 동기화 실패:', error);
      showAlert('오류', '설비 동기화 중 오류가 발생했습니다.');
    } finally {
      setSyncLoading(false);
    }
  }, [showAlert]);

  return {
    // 상태
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

    // 핸들러
    handleTreeSearch,
    handleReset,
    handleAddFacility,
    handleCloseFacilityAddModal,
    handleFacilityAddSuccess,
    handleDeleteFacility,
    handleSynchronize,

    // 모달
    alertModal,
    showAlert,
    showConfirm,
    closeAlert,
  };
};
