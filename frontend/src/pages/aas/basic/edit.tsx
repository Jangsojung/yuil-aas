import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  getBaseByIdAPI,
  buildTreeFromSensorIdsAPI,
  buildTreeDataForBasicAPI,
} from '../../../apis/api/basic';
import CustomBreadcrumb from '../../../components/common/CustomBreadcrumb';

export default function BasiccodeEditPage() {
  const { id, mode } = useParams<{ id: string; mode?: string }>();
  const navigate = useNavigate();
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
  const [selectedFactory, setSelectedFactory] = useState<number | ''>('');

  // DetailView용 검색 상태 추가
  const [detailFactoryName, setDetailFactoryName] = useState('');
  const [detailFacilityName, setDetailFacilityName] = useState('');
  const [detailSensorName, setDetailSensorName] = useState('');
  const [detailSelectedFactory, setDetailSelectedFactory] = useState<number | ''>('');
  const [detailSelectedFacilityGroups, setDetailSelectedFacilityGroups] = useState<number[]>([]);
  const detailHideFactorySelect = true;

  const [originalDetailTreeData, setOriginalDetailTreeData] = useState<FacilityGroupTree[]>([]);

  const handleDetailTreeSearch = useCallback(async () => {
    // 검색 조건이 모두 비어있으면 원본 트리 복원
    if (!detailFacilityName.trim() && !detailSensorName.trim() && detailSelectedFacilityGroups.length === 0) {
      setDetailTreeData(originalDetailTreeData);
      return { success: true };
    }

    // 현재 트리에서만 필터링
    const filtered = originalDetailTreeData
      .map((fg) => {
        // 설비그룹 필터
        if (detailSelectedFacilityGroups.length > 0 && !detailSelectedFacilityGroups.includes(fg.fg_idx)) {
          return null;
        }
        // 설비 필터
        const filteredFacilities = fg.facilities.filter(
          (fa) => !detailFacilityName.trim() || fa.fa_name.includes(detailFacilityName.trim())
        );
        // 센서 필터
        const facilitiesWithFilteredSensors = filteredFacilities
          .map((fa) => ({
            ...fa,
            sensors: fa.sensors.filter(
              (sensor) => !detailSensorName.trim() || sensor.sn_name.includes(detailSensorName.trim())
            ),
          }))
          .filter((fa) => fa.sensors.length > 0);
        if (facilitiesWithFilteredSensors.length === 0) return null;
        return { ...fg, facilities: facilitiesWithFilteredSensors };
      })
      .filter(Boolean);

    setDetailTreeData(filtered as FacilityGroupTree[]);
    return { success: true };
  }, [detailFacilityName, detailSensorName, detailSelectedFacilityGroups, originalDetailTreeData]);

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
      // 기초코드 ID로 직접 조회
      const targetBase = await getBaseByIdAPI(baseId);

      if (!targetBase) {
        showAlert('오류', '기초코드를 찾을 수 없습니다.');
        return;
      }

      setSelectedBaseForDetail(targetBase);

      // 공장 자동 선택
      setDetailSelectedFactory(targetBase.fc_idx);

      const sensorIds = await getBaseSensorsAPI(baseId);
      const sensorIdList = Array.isArray(sensorIds)
        ? sensorIds.map((item) => (typeof item === 'object' ? item.sn_idx : item))
        : [];

      // fc_idx를 전달하여 트리 데이터 구축
      const treeData = await buildTreeFromSensorIdsAPI(sensorIdList, targetBase.fc_idx);
      setDetailTreeData(treeData);
      setOriginalDetailTreeData(treeData); // 원본 저장

      // 설비그룹 자동 선택
      const relevantFacilityGroups = new Set<number>();
      treeData.forEach((fg) => {
        fg.facilities.forEach((fa: any) => {
          fa.sensors.forEach((sensor: any) => {
            if (sensorIdList.includes(sensor.sn_idx)) {
              relevantFacilityGroups.add(fg.fg_idx);
            }
          });
        });
      });
      setDetailSelectedFacilityGroups(Array.from(relevantFacilityGroups));
    } catch (err: any) {
      setDetailTreeData([]);
      setOriginalDetailTreeData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadBaseForEdit = async (baseId: number) => {
    try {
      // 기초코드 ID로 직접 조회
      const targetBase = await getBaseByIdAPI(baseId);

      if (!targetBase) {
        showAlert('오류', '기초코드를 찾을 수 없습니다.');
        return;
      }

      setEditingBase(targetBase);
      setBasicName(targetBase.ab_name);
      setBasicDesc(targetBase.ab_note || '');
      setSelectedFactory(targetBase.fc_idx);

      const sensorIds = await getBaseSensorsAPI(baseId);
      const sensorIdList = Array.isArray(sensorIds)
        ? sensorIds.map((item) => (typeof item === 'object' ? item.sn_idx : item))
        : [];

      setSelectedSensors(sensorIdList);
      await loadAllFacilityGroupsForEdit(sensorIdList, targetBase.fc_idx);
    } catch (err: any) {
      showAlert('오류', '기초코드 정보를 불러오는데 실패했습니다.');
    }
  };

  const loadAllFacilityGroupsForEdit = async (selectedSensorIds: number[], fc_idx: number) => {
    try {
      const treeData = await buildTreeFromSensorIdsAPI(selectedSensorIds, fc_idx);
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
      // 에러 처리
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
      navigate(-1); // 이전 페이지로 돌아가기
    } catch (error) {
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
      const finalFilteredData = await buildTreeDataForBasicAPI(selectedFacilityGroups, facilityName, sensorName);
      setTreeData(finalFilteredData);
    } catch (err) {
      setTreeData([]);
      showAlert('오류', '검색 중 오류가 발생했습니다.');
    } finally {
      setTreeLoading(false);
    }
  };

  const handleBackToList = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  const handleEdit = () => {
    if (selectedBaseForDetail) {
      navigate(`/aas/basic/edit/${selectedBaseForDetail.ab_idx}/edit`);
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
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <CustomBreadcrumb items={[{ label: 'AASX KAMP DATA I/F' }, { label: '기초코드 관리' }]} />
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#637381' }}>기초코드 관리</span>
        </div>
        <DetailView
          detailTreeData={detailTreeData}
          detailLoading={detailLoading}
          selectedBaseForDetail={selectedBaseForDetail}
          onEdit={handleEdit}
          onBackToList={handleBackToList}
          factoryName={detailFactoryName}
          setFactoryName={setDetailFactoryName}
          facilityName={detailFacilityName}
          setFacilityName={setDetailFacilityName}
          sensorName={detailSensorName}
          setSensorName={setDetailSensorName}
          selectedFactory={detailSelectedFactory}
          setSelectedFactory={setDetailSelectedFactory}
          selectedFacilityGroups={detailSelectedFacilityGroups}
          setSelectedFacilityGroups={setDetailSelectedFacilityGroups}
          hideFactorySelect={detailHideFactorySelect}
          onTreeSearch={handleDetailTreeSearch}
        />
      </>
    );
  }

  if (editMode) {
    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <CustomBreadcrumb items={[{ label: 'AASX KAMP DATA I/F' }, { label: '기초코드 관리' }]} />
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#637381' }}>기초코드 관리</span>
        </div>
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
          selectedFactory={selectedFactory}
          setSelectedFactory={setSelectedFactory}
          onTreeSearch={handleTreeSearch}
          onGroupSelectAll={handleGroupSelectAllWrapper}
          onFacilitySelectAll={handleFacilitySelectAllWrapper}
          isAllSensorsSelectedInGroup={isAllSensorsSelectedInGroupWrapper}
          isAllSensorsSelectedInFacility={isAllSensorsSelectedInFacilityWrapper}
          onBasicModalAdd={handleBasicModalAdd}
          onBasicModalReset={handleBasicModalReset}
          onBackToList={handleBackToList}
          hideFactorySelect={true}
        />
      </>
    );
  }

  return (
    <div className='table-outer'>
      <div className='text-center text-muted padding-lg'>로딩 중...</div>
    </div>
  );
}
