import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import Grid from '@mui/system/Grid';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { FacilityGroupTree, Base } from '../../types/api';
import { ActionBox, SearchBox } from '../common';
import LoadingOverlay from '../loading/LodingOverlay';

import { styled, alpha } from '@mui/material/styles';

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
}

export const DetailView: React.FC<DetailViewProps> = ({
  detailTreeData,
  detailLoading,
  selectedBaseForDetail,
  onEdit,
  onBackToList,
}) => {
  return (
    <div className='table-outer'>
      <SearchBox>
      
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

      <div className='table-wrap'>
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
                  <CustomTreeItem key={fa.fa_idx} itemId={`detail-sub-${fgIdx}-${faIdx}`} label={<span>{fa.fa_name}</span>}>
                    <div style={{ padding: '15px 0' }}>
                      <Grid container className='facility-item'>
                        <Grid size={2}>
                          <div className='flex-center'>
                            온조기1
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                    {/* <div className='padding-y'>
                      <TableContainer component={Paper}>
                        <Table size='small'>
                          <TableBody>
                            {(() => {
                              const sensors = fa.sensors || [];
                              const rows: (typeof sensors)[] = [];
                              for (let i = 0; i < sensors.length; i += 6) {
                                const rowSensors = sensors.slice(i, i + 6);
                                rows.push(rowSensors);
                              }
                              return rows.map((rowSensors, rowIndex) => (
                                <TableRow key={rowIndex}>
                                  <TableCell colSpan={3}>
                                    <Grid
                                      container
                                      spacing={1}
                                      sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))',
                                        gap: 1,
                                      }}
                                    >
                                      {rowSensors.map((sensor, idx) => (
                                        <Grid key={sensor.sn_idx}>
                                          <List
                                            sx={{
                                              width: '100%',
                                              bgcolor: 'background.paper',
                                              border: '1px solid #e0e0e0',
                                              borderRadius: 1,
                                            }}
                                            className='basic-checkbox'
                                          >
                                            <div>
                                              <ListItem>
                                                <ListItemText secondary={sensor.sn_name} />
                                              </ListItem>
                                            </div>
                                          </List>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  </TableCell>
                                </TableRow>
                              ));
                            })()}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div> */}
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
