import React from 'react';
import Grid from '@mui/system/Grid';
import FormControl from '@mui/material/FormControl';
import { TextField } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import LoadingOverlay from '../loading/LodingOverlay';
import FacilityGroupSelect from '../select/facility_group';
import FactorySelect from '../select/factory_select';
import BasicTable from '../table/basic_code';
import { SearchBox, ActionBox } from '../common';
import FacilityAddModal from '../modal/FacilityAddModal';
import { FacilityGroupTree } from '../../types/api';
import { Dispatch, SetStateAction } from 'react';

interface FacilityViewProps {
  // 상태
  treeData: FacilityGroupTree[];
  treeLoading: boolean;
  selectedFacilityGroups: number[];
  setSelectedFacilityGroups: Dispatch<SetStateAction<number[]>>;
  facilityName: string;
  setFacilityName: (name: string) => void;
  sensorName: string;
  setSensorName: (name: string) => void;
  selectedSensors: number[];
  setSelectedSensors: Dispatch<SetStateAction<number[]>>;
  selectedFactory?: number | '';
  setSelectedFactory?: (factory: number | '') => void;
  facilityAddModalOpen?: boolean;

  // 핸들러
  onTreeSearch: () => Promise<{ success: boolean; message?: string }>;
  onAddFacility: () => void;
  onDeleteFacility: () => void;
  onCloseFacilityAddModal?: () => void;
  onFacilityAddSuccess?: () => void;
}

export const FacilityView: React.FC<FacilityViewProps> = ({
  treeData,
  treeLoading,
  selectedFacilityGroups,
  setSelectedFacilityGroups,
  facilityName,
  setFacilityName,
  sensorName,
  setSensorName,
  selectedSensors,
  setSelectedSensors,
  selectedFactory = '',
  setSelectedFactory,
  facilityAddModalOpen = false,
  onTreeSearch,
  onAddFacility,
  onDeleteFacility,
  onCloseFacilityAddModal,
  onFacilityAddSuccess,
}) => {
  const handleSearch = async () => {
    const result = await onTreeSearch();
    if (!result.success && result.message) {
      // 에러 메시지는 상위에서 처리
      console.error(result.message);
    }
  };

  const handleFactoryChange = (factory: number) => {
    if (setSelectedFactory) {
      setSelectedFactory(factory);
      // 공장이 변경되면 설비그룹 선택 초기화
      setSelectedFacilityGroups([]);
    }
  };

  return (
    <>
      <div>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: handleSearch,
              color: 'success',
            },
          ]}
        >
          <Grid container spacing={4}>
            {/* 공장 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>공장</div>
              </Grid>
              <Grid sx={{flexGrow: 1}}>
                <FormControl sx={{ minWidth:'200px',width: '100%' }} size='small'>
                  <FactorySelect
                      value={selectedFactory}
                      onChange={handleFactoryChange}
                      placeholder='공장을 선택해주세요'
                    />
                </FormControl>
              </Grid>
            </Grid>
            {/* 공장 */}

            {/* 설비그룹 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>설비그룹</div>
              </Grid>
              <Grid sx={{flexGrow: 1}}>
                <FormControl sx={{ minWidth:'200px',width: '100%' }} size='small'>
                  <FacilityGroupSelect
                    selectedFacilityGroups={selectedFacilityGroups}
                    setSelectedFacilityGroups={setSelectedFacilityGroups}
                    selectedFactory={selectedFactory}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {/* 설비그룹 */}

            {/* 설비명 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>설비명</div>
              </Grid>
              <Grid sx={{flexGrow: 1}}>
                <FormControl sx={{ minWidth:'200px',width: '100%' }} size='small'>
                  <TextField
                    size='small'
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder='설비명을 입력하세요'
                  />
                </FormControl>
              </Grid>
            </Grid>
            {/* 설비명 */}

            {/* 센서명 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>센서명</div>
              </Grid>
              <Grid sx={{flexGrow: 1}}>
                <FormControl sx={{ minWidth:'200px',width: '100%' }} size='small'>
                  <TextField
                    size='small'
                    value={sensorName}
                    onChange={(e) => setSensorName(e.target.value)}
                    placeholder='센서명을 입력하세요'
                  />
                </FormControl>
              </Grid>
            </Grid>
            {/* 센서명 */}

          </Grid>
        </SearchBox>

        <ActionBox
          buttons={[
            {
              text: '설비 추가',
              onClick: onAddFacility,
              color: 'success',
            },
            {
              text: '설비 삭제',
              onClick: onDeleteFacility,
              color: 'error',
            },
          ]}
        />
      </div>

      <div className='table-wrap'>
        {treeLoading ? (
          <LoadingOverlay />
        ) : treeData.length === 0 ? (
          <div className='text-center text-muted padding-lg'>조회 결과 없음</div>
        ) : (
          <SimpleTreeView
            defaultExpandedItems={treeData.flatMap((fg, fgIdx) => [
              `facility-${fgIdx}`,
              ...fg.facilities.map((fa, faIdx) => `subfacility-${fgIdx}-${faIdx}`),
            ])}
          >
            {treeData.map((fg, fgIdx) => (
              <TreeItem
                key={fg.fg_idx}
                itemId={`facility-${fgIdx}`}
                label={
                  <div className='flex-center'>
                    <span className='text-bold text-large'>{fg.fg_name}</span>
                  </div>
                }
              >
                {fg.facilities.map((fa, faIdx) => (
                  <TreeItem
                    key={fa.fa_idx}
                    itemId={`subfacility-${fgIdx}-${faIdx}`}
                    label={
                      <div className='flex-center'>
                        <span className='text-medium text-small'>{fa.fa_name}</span>
                      </div>
                    }
                  >
                    <div className='padding-y'>
                      <BasicTable
                        sm_idx={`${fgIdx + 1}.${faIdx + 1}`}
                        fa_idx={fa.fa_idx}
                        sensors={fa.sensors}
                        showCheckboxes={true} // 체크박스 표시
                        selectedSensors={selectedSensors}
                        setSelectedSensors={setSelectedSensors}
                      />
                    </div>
                  </TreeItem>
                ))}
              </TreeItem>
            ))}
          </SimpleTreeView>
        )}
      </div>

      <FacilityAddModal
        open={facilityAddModalOpen}
        onClose={onCloseFacilityAddModal || (() => {})}
        onSuccess={onFacilityAddSuccess || (() => {})}
      />
    </>
  );
};
