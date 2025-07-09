import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { Checkbox } from '@mui/material';
import { FacilityGroupTree } from '../../types/api';
import BasicTable from '../table/basic_code';

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

interface FacilityTreeViewProps {
  treeData: FacilityGroupTree[];
  selectedSensors: number[];
  onSensorSelect: (sensorId: number, checked: boolean) => void;
  onGroupSelectAll: (fgIdx: number, checked: boolean) => void;
  onFacilitySelectAll: (fgIdx: number, faIdx: number, checked: boolean) => void;
  isAllSensorsSelectedInGroup: (fgIdx: number) => boolean;
  isAllSensorsSelectedInFacility: (fgIdx: number, faIdx: number) => boolean;
  defaultExpandedItems?: string[];
}

export const FacilityTreeView: React.FC<FacilityTreeViewProps> = ({
  treeData,
  selectedSensors,
  onSensorSelect,
  onGroupSelectAll,
  onFacilitySelectAll,
  isAllSensorsSelectedInGroup,
  isAllSensorsSelectedInFacility,
  defaultExpandedItems = [],
}) => {
  return (
    <SimpleTreeView defaultExpandedItems={defaultExpandedItems}>
      {treeData.map((fg, fgIdx) => (
        <CustomTreeItem
          key={fg.fg_idx}
          itemId={`aas-${fgIdx}`}
          label={
            <div className='flex-center'>
              <Checkbox
                checked={isAllSensorsSelectedInGroup(fgIdx)}
                indeterminate={false}
                onChange={(e) => onGroupSelectAll(fgIdx, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className='margin-right-sm'
              />
              <span>{fg.fg_name}</span>
            </div>
          }
        >
          {fg.facilities.map((fa, faIdx) => (
            <CustomTreeItem
              key={fa.fa_idx}
              itemId={`submodal-${fgIdx}-${faIdx}`}
              label={
                <div className='flex-center'>
                  <Checkbox
                    checked={isAllSensorsSelectedInFacility(fgIdx, faIdx)}
                    indeterminate={false}
                    onChange={(e) => onFacilitySelectAll(fgIdx, faIdx, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className='margin-right-sm'
                  />
                  <span>{fa.fa_name}</span>
                </div>
              }
            >
              <div className='padding-y'>
                <BasicTable sm_idx={`${fgIdx + 1}.${faIdx + 1}`} fa_idx={fa.fa_idx} sensors={fa.sensors} />
              </div>
            </CustomTreeItem>
          ))}
        </CustomTreeItem>
      ))}
    </SimpleTreeView>
  );
};
