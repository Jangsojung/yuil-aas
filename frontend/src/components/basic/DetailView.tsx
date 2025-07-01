import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { FacilityGroupTree, Base } from '../../types/api';
import { ActionBox } from '../common';
import LoadingOverlay from '../loading/LodingOverlay';

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
      <div>
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
              <TreeItem key={fg.fg_idx} itemId={`detail-${fgIdx}`} label={<span>{fg.fg_name}</span>}>
                {fg.facilities.map((fa, faIdx) => (
                  <TreeItem key={fa.fa_idx} itemId={`detail-sub-${fgIdx}-${faIdx}`} label={<span>{fa.fa_name}</span>}>
                    <div className='padding-y'>
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
                                    <Grid container spacing={1}>
                                      {rowSensors.map((sensor, idx) => (
                                        <Grid item xs={2} key={sensor.sn_idx}>
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
                                              <Divider variant='middle' component='li' />
                                              <ListItem>
                                                <ListItemText
                                                  secondary={
                                                    'Prop 1.' +
                                                    (fgIdx + 1) +
                                                    '.' +
                                                    (faIdx + 1) +
                                                    '.' +
                                                    (rowIndex * 6 + idx + 1)
                                                  }
                                                />
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
                    </div>
                  </TreeItem>
                ))}
              </TreeItem>
            ))}
          </SimpleTreeView>
        )}
      </div>
    </div>
  );
};
