import { useState, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { userState } from '../recoil/atoms';
import { useAlertModal } from './useAlertModal';
import { buildTreeDataAPI } from '../apis/api/basic';
import { deleteSensors, synchronizeFacility } from '../apis/api/facility';
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

  // 센서 삭제
  const handleDeleteSensors = useCallback(async () => {
    if (selectedSensors.length === 0) {
      showAlert('알림', '삭제할 센서를 선택해주세요.');
      return;
    }

    const confirmed = await new Promise<boolean>((resolve) => {
      showConfirm('센서 삭제', `선택한 ${selectedSensors.length}개의 센서를 삭제하시겠습니까?`, () => resolve(true));
    });

    if (!confirmed) return;

    try {
      const result = await deleteSensors(selectedSensors);
      if (result.success) {
        showAlert('알림', result.message);
        setSelectedSensors([]);
        // 삭제 후 트리 데이터 새로고침
        handleTreeSearch();
      } else {
        showAlert('오류', result.message || '센서 삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('센서 삭제 실패:', error);
      showAlert('오류', '센서 삭제 중 오류가 발생했습니다.');
    }
  }, [selectedSensors, showAlert, showConfirm, handleTreeSearch]);

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
    syncLoading,

    // 핸들러
    handleTreeSearch,
    handleReset,
    handleAddFacility,
    handleCloseFacilityAddModal,
    handleFacilityAddSuccess,
    handleDeleteSensors,
    handleSynchronize,

    // 알림
    alertModal,
    showAlert,
    showConfirm,
    closeAlert,
  };
};
