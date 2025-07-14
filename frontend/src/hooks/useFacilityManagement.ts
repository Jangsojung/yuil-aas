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
  const [syncLoading] = useState(false);
  const [factoryRefreshKey, setFactoryRefreshKey] = useState(0);
  const [facilityGroupRefreshKey, setFacilityGroupRefreshKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressLabel, setProgressLabel] = useState('설비 데이터 동기화 중...');

  // 트리 검색
  const handleTreeSearch = useCallback(async () => {
    setProgressOpen(true);
    setProgress(10); // 시작

    // 공장 선택 검증
    if (!selectedFactory) {
      setProgressOpen(false);
      showAlert('알림', '공장을 선택해주세요.');
      return { success: false, message: '공장을 선택해주세요.' };
    }

    // 설비그룹 선택 검증
    if (selectedFacilityGroups.length === 0) {
      setProgressOpen(false);
      showAlert('알림', '설비그룹을 선택해주세요.');
      return { success: false, message: '설비그룹을 선택해주세요.' };
    }

    setTreeLoading(true);
    try {
      setProgress(20);
      const finalFilteredData = await buildTreeDataAPI(
        selectedFacilityGroups,
        facilityName,
        sensorName,
        selectedFactory as number
      );
      setProgress(80);
      setTreeData(finalFilteredData);
      setProgress(100);
      setProgressOpen(false);
      return { success: true };
    } catch (err) {
      setProgressOpen(false);
      setTreeData([]);
      return { success: false, message: '검색 중 오류가 발생했습니다.' };
    } finally {
      setTreeLoading(false);
    }
  }, [selectedFactory, selectedFacilityGroups, facilityName, sensorName, showAlert]);

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
    // 추가 후 선택 상태 초기화하고 검색
    setSelectedSensors([]);
    setSelectedFacilities([]);
    setSelectedFacilityGroupsForDelete([]);
    setSelectedFactoriesForDelete([]);
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
    // 추가 후 선택 상태 초기화하고 검색
    setSelectedSensors([]);
    setSelectedFacilities([]);
    setSelectedFacilityGroupsForDelete([]);
    setSelectedFactoriesForDelete([]);
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
      confirmMessage = `공장 삭제시 해당 공장의 하위 설비그룹, 설비, 센서도 삭제됩니다.\n선택한 ${deleteCount}개의 공장을 삭제하시겠습니까?`;
    } else if (hasSelectedFacilityGroups) {
      deleteType = '설비그룹';
      deleteCount = selectedFacilityGroupsForDelete.length;
      confirmMessage = `설비그룹 삭제시 해당 설비그룹의 하위 설비, 센서도 삭제됩니다.\n선택한 ${deleteCount}개의 설비그룹을 삭제하시겠습니까?`;
    } else if (hasSelectedFacilities) {
      deleteType = '설비';
      deleteCount = selectedFacilities.length;
      confirmMessage = `설비 삭제시 해당 설비의 하위 센서도 삭제됩니다.\n선택한 ${deleteCount}개의 설비를 삭제하시겠습니까?`;
    } else if (hasSelectedSensors) {
      deleteType = '센서';
      deleteCount = selectedSensors.length;
      confirmMessage = `선택한 ${deleteCount}개의 센서를 삭제하시겠습니까?`;
    }

    showConfirm('알림', confirmMessage, async () => {
      try {
        if (hasSelectedFactories) {
          await deleteFactories(selectedFactoriesForDelete);
          handleReset();
        } else if (hasSelectedFacilityGroups) {
          await deleteFacilityGroups(selectedFacilityGroupsForDelete);
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
          // 설비 삭제 후 선택 상태 초기화하고 검색
          setSelectedFacilities([]);
          setSelectedSensors([]);
          handleTreeSearch();
        } else if (hasSelectedSensors) {
          await deleteSensors(selectedSensors);
          // 센서 삭제 후 선택 상태 초기화하고 검색
          setSelectedSensors([]);
          handleTreeSearch();
        }
      } catch (err) {
        showAlert('에러', `${deleteType} 삭제 중 오류가 발생했습니다.`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setProgressOpen(true);
    setProgress(0);

    try {
      // 프로그레스바 시뮬레이션 (실제로는 백엔드에서 단계별 진행상황을 받아야 함)
      const progressSteps = [
        { progress: 25, label: '공장 정보 동기화 중... (1/4)' },
        { progress: 50, label: '설비그룹 정보 동기화 중... (2/4)' },
        { progress: 75, label: '설비 정보 동기화 중... (3/4)' },
        { progress: 100, label: '센서 정보 동기화 중... (4/4)' },
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        const step = progressSteps[i];
        setProgress(step.progress);
        setProgressLabel(step.label);
        setProgressOpen(true);

        // 마지막 단계에서만 실제 API 호출
        if (i === progressSteps.length - 1) {
          await synchronizeFacility();
        } else {
          // 각 단계별로 약간의 지연을 주어 진행상황을 보여줌
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      showAlert('알림', '동기화 완료');
      // 동기화 후 트리 데이터 새로고침
      handleTreeSearch();
      // 선택 상태 초기화
      setSelectedSensors([]);
      setSelectedFacilities([]);
      setSelectedFacilityGroupsForDelete([]);
      setSelectedFactoriesForDelete([]);
    } catch (err) {
      showAlert('에러', '동기화 중 오류가 발생했습니다.');
    } finally {
      setProgressOpen(false);
      setProgress(0);
    }
  }, [showAlert, handleTreeSearch]);

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
    progress,
    progressOpen,
    progressLabel,
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
    setProgress,
    setProgressOpen,
  };
};
