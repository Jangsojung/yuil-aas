import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import Grid from '@mui/system/Grid';
import Typography from '@mui/material/Typography';
import { FacilityGroupTree, Base } from '../../types/api';
import { ActionBox, SearchBox } from '../common';
import LoadingOverlay from '../loading/LodingOverlay';
import { FormControl, TextField } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { FactorySelect } from '../select';
import FacilityGroupSelect from '../select/facility_group';

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

interface DetailViewProps {
  detailTreeData: FacilityGroupTree[];
  detailLoading: boolean;
  selectedBaseForDetail: Base | null;
  onEdit: () => void;
  onBackToList: () => void;
  factoryName: string;
  setFactoryName: (name: string) => void;
  facilityName: string;
  setFacilityName: (name: string) => void;
  sensorName: string;
  setSensorName: (name: string) => void;
  selectedFactory: number | '';
  setSelectedFactory: (fc: number | '') => void;
  selectedFacilityGroups: number[];
  setSelectedFacilityGroups: React.Dispatch<React.SetStateAction<number[]>>;
  hideFactorySelect?: boolean;
  onTreeSearch: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  detailTreeData,
  detailLoading,
  selectedBaseForDetail,
  onEdit,
  onBackToList,
  factoryName,
  setFactoryName,
  facilityName,
  setFacilityName,
  sensorName,
  setSensorName,
  selectedFactory,
  setSelectedFactory,
  selectedFacilityGroups,
  setSelectedFacilityGroups,
  hideFactorySelect = false,
  onTreeSearch,
}) => {
  return (
    <div className='table-outer'>
      <SearchBox
        buttons={[
          {
            text: '검색',
            onClick: onTreeSearch,
            color: 'primary',
          },
        ]}
      >
        <Grid container spacing={4}>
          {/* 공장 */}
          {!hideFactorySelect && (
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>공장</div>
              </Grid>
              <Grid>
                <FormControl sx={{ width: '100%' }} size='small'>
                  <FactorySelect value={selectedFactory} onChange={setSelectedFactory} />
                </FormControl>
              </Grid>
            </Grid>
          )}
          {/* 공장 */}

          {/* 설비그룹 */}
          <Grid container spacing={2}>
            <Grid className='sort-title'>
              <div>설비그룹</div>
            </Grid>
            <Grid>
              <FormControl sx={{ width: '100%' }} size='small'>
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
          <Grid container>
            <Grid className='sort-title'>
              <div>설비명</div>
            </Grid>
            <Grid>
              <FormControl sx={{ width: '100%' }} size='small'>
                <TextField size='small' value={facilityName} onChange={(e) => setFacilityName(e.target.value)} />
              </FormControl>
            </Grid>
          </Grid>
          {/* 설비명 */}

          {/* 센서명 */}
          <Grid container>
            <Grid className='sort-title'>
              <div>센서명</div>
            </Grid>
            <Grid>
              <FormControl sx={{ width: '100%' }} size='small'>
                <TextField size='small' value={sensorName} onChange={(e) => setSensorName(e.target.value)} />
              </FormControl>
            </Grid>
          </Grid>
          {/* 센서명 */}
        </Grid>
      </SearchBox>

      <div className='list-header'>
        <Typography variant='h6' gutterBottom>
          제1공장 온조기
        </Typography>

        <ActionBox
          buttons={[
            {
              text: '수정',
              onClick: onEdit,
              color: 'success',
            },
            {
              text: '목록',
              onClick: onBackToList,
              color: 'inherit',
              variant: 'outlined',
            },
          ]}
        />
      </div>

      <div className='table-wrap tree-scroll-wrap'>
        {detailLoading ? (
          <LoadingOverlay />
        ) : detailTreeData.length === 0 ? (
          <div className='text-center text-muted padding-lg'>센서 데이터가 없습니다.</div>
        ) : (
          <SimpleTreeView
            defaultExpandedItems={detailTreeData.flatMap((fg, fgIdx) => [
              `detail-${fgIdx}`,
              ...fg.facilities.map((fa, faIdx) => `detail-sub-${fgIdx}-${faIdx}`),
            ])}
          >
            {detailTreeData.map((fg, fgIdx) => (
              <CustomTreeItem key={fg.fg_idx} itemId={`detail-${fgIdx}`} label={<span>{fg.fg_name}</span>}>
                {fg.facilities.map((fa, faIdx) => (
                  <CustomTreeItem
                    key={fa.fa_idx}
                    itemId={`detail-sub-${fgIdx}-${faIdx}`}
                    label={<span>{fa.fa_name}</span>}
                  >
                    <div style={{ padding: '15px 0' }}>
                      <Grid container className='facility-item'>
                        {fa.sensors && fa.sensors.length > 0 ? (
                          fa.sensors.map((sensor) => (
                            <Grid key={sensor.sn_idx} size={2}>
                              <div className='flex-center'>{sensor.sn_name}</div>
                            </Grid>
                          ))
                        ) : (
                          <Grid size={12}>센서 없음</Grid>
                        )}
                      </Grid>
                    </div>
                  </CustomTreeItem>
                ))}
              </CustomTreeItem>
            ))}
          </SimpleTreeView>
        )}
      </div>
    </div>
  );
};
