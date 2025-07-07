import { useState, useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedSensorsState, userState } from '../recoil/atoms';
import { useAlertModal } from './useAlertModal';
import { insertBaseAPI, buildTreeDataForBasicAPI } from '../apis/api/basic';
import { FacilityGroupTree } from '../types/api';

export const useBasicAdd = () => {
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const userIdx = useRecoilValue(userState)?.user_idx;
  const { alertModal, showAlert, closeAlert } = useAlertModal();

  // 상태 관리
  const [treeData, setTreeData] = useState<FacilityGroupTree[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [basicName, setBasicName] = useState('');
  const [basicDesc, setBasicDesc] = useState('');
  const [selectedFacilityGroups, setSelectedFacilityGroups] = useState<number[]>([]);
  const [facilityName, setFacilityName] = useState('');
  const [sensorName, setSensorName] = useState('');
  const [selectedFactory, setSelectedFactory] = useState<number | ''>('');

  // 공장 변경 시 체크된 센서들 리셋
  const handleFactoryChange = useCallback(
    (factory: number | '') => {
      setSelectedFactory(factory);
      if (factory !== '') {
        setSelectedSensors([]); // 체크된 센서들 리셋
        setSelectedFacilityGroups([]); // 설비그룹 선택 리셋
        setTreeData([]); // 트리 데이터도 리셋
      }
    },
    [setSelectedSensors]
  );

  // 기초코드 추가
  const handleAdd = useCallback(async () => {
    if (selectedSensors.length === 0) {
      return { success: false, message: '센서를 선택해주세요.' };
    }

    if (!basicName.trim()) {
      return { success: false, message: '기초코드명을 입력해주세요.' };
    }

    if (!selectedFactory) {
      return { success: false, message: '공장을 선택해주세요.' };
    }

    try {
      await insertBaseAPI({
        user_idx: userIdx,
        name: basicName,
        note: basicDesc,
        ids: selectedSensors,
        fc_idx: selectedFactory,
      });

      setBasicName('');
      setBasicDesc('');
      setSelectedSensors([]);
      return { success: true, message: '기초코드가 등록되었습니다.' };
    } catch (error) {
      console.error('Error inserting base:', error);
      return {
        success: false,
        message: '기초코드 등록 중 오류가 발생했습니다.',
      };
    }
  }, [selectedSensors, basicName, basicDesc, userIdx, selectedFactory, setSelectedSensors]);

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
      const finalFilteredData = await buildTreeDataForBasicAPI(
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

  // 모달 핸들러
  const handleBasicModalAdd = useCallback(async () => {
    const result = await handleAdd();
    if (result.success) {
      showAlert('알림', result.message);
      window.location.href = '/aas/basic';
    } else {
      showAlert('알림', result.message);
    }
  }, [handleAdd, showAlert]);

  const handleBasicModalReset = useCallback(() => {
    setBasicName('');
    setBasicDesc('');
  }, []);

  // 초기화
  const handleReset = useCallback(() => {
    setTreeData([]);
    setSelectedSensors([]);
    setBasicName('');
    setBasicDesc('');
    setBasicModalOpen(false);
    setSelectedFacilityGroups([]);
    setFacilityName('');
    setSensorName('');
    setSelectedFactory('');
  }, [setSelectedSensors]);

  return {
    // 상태
    treeData,
    treeLoading,
    basicModalOpen,
    setBasicModalOpen,
    basicName,
    setBasicName,
    basicDesc,
    setBasicDesc,
    selectedFacilityGroups,
    setSelectedFacilityGroups,
    facilityName,
    setFacilityName,
    sensorName,
    setSensorName,
    selectedSensors,
    selectedFactory,
    setSelectedFactory,

    // 핸들러
    handleAdd,
    handleTreeSearch,
    handleBasicModalAdd,
    handleBasicModalReset,
    handleReset,
    handleFactoryChange,

    // 알림
    alertModal,
    closeAlert,
  };
};
