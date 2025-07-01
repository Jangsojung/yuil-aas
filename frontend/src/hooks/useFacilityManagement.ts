import { useState, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { userState } from '../recoil/atoms';
import { useAlertModal } from './useAlertModal';
import { buildTreeDataAPI } from '../apis/api/basic';
import { FacilityGroupTree } from '../types/api';

export const useFacilityManagement = () => {
  const userIdx = useRecoilValue(userState)?.user_idx;
  const { alertModal, showAlert, showConfirm, closeAlert } = useAlertModal();

  // 상태 관리
  const [treeData, setTreeData] = useState<FacilityGroupTree[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedFacilityGroups, setSelectedFacilityGroups] = useState<number[]>([]);
  const [facilityName, setFacilityName] = useState('');
  const [sensorName, setSensorName] = useState('');
  const [selectedFactory, setSelectedFactory] = useState<number | ''>('');

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

    // 핸들러
    handleTreeSearch,
    handleReset,

    // 알림
    alertModal,
    showAlert,
    showConfirm,
    closeAlert,
  };
};
