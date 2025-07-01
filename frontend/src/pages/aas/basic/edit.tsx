import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedSensorsState, userState } from '../../../recoil/atoms';
import { useAlertModal } from '../../../hooks/useAlertModal';
import { useSensorSelection } from '../../../hooks/useSensorSelection';
import { Base, FacilityGroupTree } from '../../../types/api';
import { DetailView } from '../../../components/basic/DetailView';
import { EditView } from '../../../components/basic/EditView';
import {
  updateBaseAPI,
  getBaseSensorsAPI,
  getBasesAPI,
  buildTreeFromSensorIdsAPI,
  buildTreeDataAPI,
} from '../../../apis/api/basic';

export default function BasiccodeEditPage() {
  const { id, mode } = useParams<{ id: string; mode?: string }>();
  const [detailMode, setDetailMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [facilityName, setFacilityName] = useState('');
  const [sensorName, setSensorName] = useState('');
  const userIdx = useRecoilValue(userState)?.user_idx;

  // 커스텀 훅 사용
  const { showAlert } = useAlertModal();
  const { handleGroupSelectAll, handleFacilitySelectAll, isAllSensorsSelectedInGroup, isAllSensorsSelectedInFacility } =
    useSensorSelection();

  // 상태 관리
  const [treeData, setTreeData] = useState<FacilityGroupTree[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [basicName, setBasicName] = useState('');
  const [basicDesc, setBasicDesc] = useState('');
  const [selectedFacilityGroups, setSelectedFacilityGroups] = useState<number[]>([]);
  const [editingBase, setEditingBase] = useState<Base | null>(null);
  const [selectedBaseForDetail, setSelectedBaseForDetail] = useState<Base | null>(null);
  const [detailTreeData, setDetailTreeData] = useState<FacilityGroupTree[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleModeChange = () => {
    if (id) {
      const baseId = parseInt(id);
      if (mode === 'view') {
        setDetailMode(true);
        setEditMode(false);
        loadBaseForDetail(baseId);
      } else {
        setDetailMode(false);
        setEditMode(true);
        loadBaseForEdit(baseId);
      }
    }
  };

  useEffect(() => {
    handleModeChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mode]);

  // 데이터 로딩 함수들
  const loadBaseForDetail = async (baseId: number) => {
    setDetailLoading(true);
    try {
      const basesData = await getBasesAPI();
      const targetBase = basesData.find((base: Base) => base.ab_idx === baseId);

      if (!targetBase) {
        showAlert('오류', '기초코드를 찾을 수 없습니다.');
        return;
      }

      setSelectedBaseForDetail(targetBase);

      const sensorIds = await getBaseSensorsAPI(baseId);
      const sensorIdList = Array.isArray(sensorIds)
        ? sensorIds.map((item) => (typeof item === 'object' ? item.sn_idx : item))
        : [];

      const treeData = await buildTreeFromSensorIdsAPI(sensorIdList);
      setDetailTreeData(treeData);
    } catch (err: any) {
      console.error('기초코드 상세 로딩 에러:', err.message);
      setDetailTreeData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadBaseForEdit = async (baseId: number) => {
    try {
      const basesData = await getBasesAPI();
      const targetBase = basesData.find((base: Base) => base.ab_idx === baseId);

      if (!targetBase) {
        showAlert('오류', '기초코드를 찾을 수 없습니다.');
        return;
      }

      setEditingBase(targetBase);
      setBasicName(targetBase.ab_name);
      setBasicDesc(targetBase.ab_note || '');

      const sensorIds = await getBaseSensorsAPI(baseId);
      const sensorIdList = Array.isArray(sensorIds)
        ? sensorIds.map((item) => (typeof item === 'object' ? item.sn_idx : item))
        : [];

      setSelectedSensors(sensorIdList);
      await loadAllFacilityGroupsForEdit(sensorIdList);
    } catch (err: any) {
      console.error('수정 모드 초기화 에러:', err.message);
      showAlert('오류', '기초코드 정보를 불러오는데 실패했습니다.');
    }
  };

  const loadAllFacilityGroupsForEdit = async (selectedSensorIds: number[]) => {
    try {
      const treeData = await buildTreeFromSensorIdsAPI(selectedSensorIds);
      setTreeData(treeData);

      const relevantFacilityGroups = new Set<number>();
      treeData.forEach((fg) => {
        fg.facilities.forEach((fa: any) => {
          fa.sensors.forEach((sensor: any) => {
            if (selectedSensorIds.includes(sensor.sn_idx)) {
              relevantFacilityGroups.add(fg.fg_idx);
            }
          });
        });
      });

      setSelectedFacilityGroups(Array.from(relevantFacilityGroups));
    } catch (err) {
      console.error('설비그룹 로드 에러:', err);
    }
  };

  // 이벤트 핸들러들
  const handleUpdate = async () => {
    if (!editingBase) return;

    try {
      await updateBaseAPI({
        ab_idx: editingBase.ab_idx,
        user_idx: userIdx,
        name: basicName,
        note: basicDesc,
        ids: selectedSensors,
      });

      showAlert('알림', '기초코드가 수정되었습니다.');
      window.location.href = '/aas/basic';
    } catch (error) {
      console.error('수정 중 오류 발생:', error);
      showAlert('오류', '기초코드 수정 중 오류가 발생했습니다.');
    }
  };

  const handleBasicModalAdd = async () => {
    await handleUpdate();
  };

  const handleBasicModalReset = () => {
    setBasicName('');
    setBasicDesc('');
  };

  const handleTreeSearch = async () => {
    if (!facilityName.trim() && !sensorName.trim() && selectedFacilityGroups.length === 0) {
      showAlert('알림', '검색 조건을 입력해주세요.');
      return;
    }

    setTreeLoading(true);
    try {
      const finalFilteredData = await buildTreeDataAPI(selectedFacilityGroups, facilityName, sensorName);
      setTreeData(finalFilteredData);
    } catch (err) {
      console.error('검색 에러:', err);
      setTreeData([]);
      showAlert('오류', '검색 중 오류가 발생했습니다.');
    } finally {
      setTreeLoading(false);
    }
  };

  const handleBackToList = () => {
    window.location.href = '/aas/basic';
  };

  const handleEdit = () => {
    if (selectedBaseForDetail) {
      window.location.href = `/aas/basic/edit/${selectedBaseForDetail.ab_idx}/edit`;
    }
  };

  // 센서 선택 핸들러들
  const handleGroupSelectAllWrapper = (fgIdx: number, checked: boolean) => {
    handleGroupSelectAll(treeData, fgIdx, checked);
  };

  const handleFacilitySelectAllWrapper = (fgIdx: number, faIdx: number, checked: boolean) => {
    handleFacilitySelectAll(treeData, fgIdx, faIdx, checked);
  };

  const isAllSensorsSelectedInGroupWrapper = (fgIdx: number) => {
    return isAllSensorsSelectedInGroup(treeData, fgIdx);
  };

  const isAllSensorsSelectedInFacilityWrapper = (fgIdx: number, faIdx: number) => {
    return isAllSensorsSelectedInFacility(treeData, fgIdx, faIdx);
  };

  // 렌더링
  if (detailMode) {
    return (
      <DetailView
        detailTreeData={detailTreeData}
        detailLoading={detailLoading}
        selectedBaseForDetail={selectedBaseForDetail}
        onEdit={handleEdit}
        onBackToList={handleBackToList}
      />
    );
  }

  if (editMode) {
    return (
      <EditView
        treeData={treeData}
        treeLoading={treeLoading}
        selectedFacilityGroups={selectedFacilityGroups}
        setSelectedFacilityGroups={setSelectedFacilityGroups}
        facilityName={facilityName}
        setFacilityName={setFacilityName}
        sensorName={sensorName}
        setSensorName={setSensorName}
        basicModalOpen={basicModalOpen}
        setBasicModalOpen={setBasicModalOpen}
        basicName={basicName}
        setBasicName={setBasicName}
        basicDesc={basicDesc}
        setBasicDesc={setBasicDesc}
        selectedSensors={selectedSensors}
        onTreeSearch={handleTreeSearch}
        onGroupSelectAll={handleGroupSelectAllWrapper}
        onFacilitySelectAll={handleFacilitySelectAllWrapper}
        isAllSensorsSelectedInGroup={isAllSensorsSelectedInGroupWrapper}
        isAllSensorsSelectedInFacility={isAllSensorsSelectedInFacilityWrapper}
        onBasicModalAdd={handleBasicModalAdd}
        onBasicModalReset={handleBasicModalReset}
        onBackToList={handleBackToList}
      />
    );
  }

  return (
    <div className='table-outer'>
      <div className='text-center text-muted padding-lg'>로딩 중...</div>
    </div>
  );
}
