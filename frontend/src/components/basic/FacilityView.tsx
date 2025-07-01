import React from 'react';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import { TextField } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import LoadingOverlay from '../loading/LodingOverlay';
import FacilityGroupSelect from '../select/facility_group';
import BasicTable from '../table/basic_code';
import { SearchBox, ActionBox } from '../common';
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

  // 핸들러
  onTreeSearch: () => Promise<{ success: boolean; message?: string }>;
  onAddFacility: () => void;
  onDeleteFacility: () => void;
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
  onTreeSearch,
  onAddFacility,
  onDeleteFacility,
}) => {
  const handleSearch = async () => {
    const result = await onTreeSearch();
    if (!result.success && result.message) {
      // 에러 메시지는 상위에서 처리
      console.error(result.message);
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
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>설비그룹</div>
                </Grid>
                <Grid item xs={9}>
                  <FacilityGroupSelect
                    selectedFacilityGroups={selectedFacilityGroups}
                    setSelectedFacilityGroups={setSelectedFacilityGroups}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>설비명</div>
                </Grid>
                <Grid item xs={9}>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <TextField
                      size='small'
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      placeholder='설비명을 입력하세요'
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>센서명</div>
                </Grid>
                <Grid item xs={9}>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <TextField
                      size='small'
                      value={sensorName}
                      onChange={(e) => setSensorName(e.target.value)}
                      placeholder='센서명을 입력하세요'
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
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
          <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>조회 결과 없음</div>
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
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{fg.fg_name}</span>
                  </div>
                }
              >
                {fg.facilities.map((fa, faIdx) => (
                  <TreeItem
                    key={fa.fa_idx}
                    itemId={`subfacility-${fgIdx}-${faIdx}`}
                    label={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: '500', fontSize: '14px' }}>{fa.fa_name}</span>
                      </div>
                    }
                  >
                    <div style={{ padding: '8px 0' }}>
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
    </>
  );
};
