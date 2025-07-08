import React, { JSX, PropsWithoutRef } from 'react';
import IndeterminateCheckBoxRoundedIcon from '@mui/icons-material/IndeterminateCheckBoxRounded';
import DisabledByDefaultRoundedIcon from '@mui/icons-material/DisabledByDefaultRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import { styled, alpha } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { useRecoilValue } from 'recoil';
import { aasxDataState, isVerifiedState } from '../../recoil/atoms';

// 타입 정의
interface AASData {
  name?: string;
  url?: string;
  AssetInformation?: Record<string, any>;
  submodelRefs?: any[];
  [key: string]: any;
}

interface SMData {
  name?: string;
  url?: string;
  SMC?: SMCData[];
  Prop?: PropData[] | Record<string, any>;
  parentAAS?: any;
  [key: string]: any;
}

interface SMCData {
  name?: string;
  elements?: number;
  items?: ItemData[];
}

interface ItemData {
  name?: string;
  Prop?: PropData[];
}

interface PropData {
  name?: string;
  value?: any;
}

interface TreeData {
  AAS?: AASData | AASData[];
  SM?: SMData | SMData[];
}

interface TreeViewProps {
  data?: any;
}

const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
    backgroundColor: '#e8eef7',
    borderBottom: '1px solid #d0d7e5',
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

function ExpandIcon(props: PropsWithoutRef<typeof AddBoxRoundedIcon>) {
  return <AddBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
}

function CollapseIcon(props: PropsWithoutRef<typeof IndeterminateCheckBoxRoundedIcon>) {
  return <IndeterminateCheckBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
}

function EndIcon(props: PropsWithoutRef<typeof DisabledByDefaultRoundedIcon>) {
  return <DisabledByDefaultRoundedIcon {...props} sx={{ opacity: 0.3 }} />;
}

const createTreeItems = (data: TreeData): JSX.Element[] => {
  if (!data) return [];

  const result: JSX.Element[] = [];

  if (data.AAS) {
    const aasItems = Array.isArray(data.AAS) ? data.AAS : [data.AAS];

    aasItems.forEach((aas, index) => {
      const aasId = `AAS-${index}`;
      const aasLabel = `AAS "${aas.AssetInformation?.Unit1 || aas.name}" [${aas.url || 'url 없음'}]`;

      const aasChildren: JSX.Element[] = [];

      if (aas.AssetInformation) {
        const assetInfoId = `${aasId}-AssetInfo`;
        const assetInfoItems: JSX.Element[] = [];

        // AAS의 AssetInformation 속성들 처리
        for (const key in aas.AssetInformation) {
          const assetPropId = `${assetInfoId}-${key}`;
          assetInfoItems.push(
            <CustomTreeItem
              key={assetPropId}
              itemId={assetPropId}
              label={`globalAssetId: ${aas.AssetInformation[key]}`}
            />
          );
        }

        // AAS의 다른 속성들 처리
        for (const key in aas) {
          if (key !== 'name' && key !== 'url' && key !== 'submodelRefs' && key !== 'AssetInformation') {
            const propId = `${aasId}-${key}`;
            assetInfoItems.push(<CustomTreeItem key={propId} itemId={propId} label={`kind: ${aas[key]}`} />);
          }
        }

        aasChildren.push(
          <CustomTreeItem key={assetInfoId} itemId={assetInfoId} label='AssetInformation'>
            {assetInfoItems}
          </CustomTreeItem>
        );
      }

      result.push(
        <CustomTreeItem key={aasId} itemId={aasId} label={aasLabel}>
          {aasChildren}
        </CustomTreeItem>
      );
    });
  }

  if (data.SM) {
    const smItems = Array.isArray(data.SM) ? data.SM : [data.SM];
    const smChildren: JSX.Element[] = [];

    smItems.forEach((sm, index) => {
      const smId = `SM-${index}`;
      const smLabel = `${sm.name} [${sm.url || 'url 없음'}]`;
      const smSubItems: JSX.Element[] = [];

      for (const key in sm) {
        if (key !== 'name' && key !== 'url' && key !== 'SMC' && key !== 'Prop' && key !== 'parentAAS') {
          const propId = `${smId}-${key}`;
          smSubItems.push(<CustomTreeItem key={propId} itemId={propId} label={`${key}: ${sm[key]}`} />);
        }
      }

      if (sm.SMC) {
        const smcItems = Array.isArray(sm.SMC) ? sm.SMC : [sm.SMC];

        smcItems.forEach((smc, smcIndex) => {
          const smcId = `${smId}-SMC-${smcIndex}`;
          const smcLabel = `SMC "${smc.name}" (${smc.elements || 0} elements)`;
          const smcSubItems: JSX.Element[] = [];

          if (smc.items && Array.isArray(smc.items)) {
            smc.items.forEach((item, itemIndex) => {
              const itemId = `${smcId}-item-${itemIndex}`;
              const itemLabel = item.name;
              const itemSubItems: JSX.Element[] = [];

              if (item.Prop && Array.isArray(item.Prop)) {
                item.Prop.forEach((prop, propIndex) => {
                  const propId = `${itemId}-prop-${propIndex}`;
                  itemSubItems.push(
                    <CustomTreeItem key={propId} itemId={propId} label={`${prop.name}: ${prop.value}`} />
                  );
                });
              }

              smcSubItems.push(
                <CustomTreeItem key={itemId} itemId={itemId} label={itemLabel}>
                  {itemSubItems}
                </CustomTreeItem>
              );
            });
          }

          smSubItems.push(
            <CustomTreeItem key={smcId} itemId={smcId} label={smcLabel}>
              {smcSubItems}
            </CustomTreeItem>
          );
        });
      }

      if (sm.Prop) {
        const propItems = Array.isArray(sm.Prop) ? sm.Prop : [sm.Prop];
        const propId = `${smId}-props`;
        const propSubItems: JSX.Element[] = [];

        if (Array.isArray(propItems)) {
          propItems.forEach((prop, propIndex) => {
            const singlePropId = `${propId}-${propIndex}`;
            propSubItems.push(
              <CustomTreeItem key={singlePropId} itemId={singlePropId} label={`${prop.name}: ${prop.value}`} />
            );
          });
        } else {
          const propObj = sm.Prop as Record<string, any>;
          for (const key in propObj) {
            const singlePropId = `${propId}-${key}`;
            propSubItems.push(
              <CustomTreeItem key={singlePropId} itemId={singlePropId} label={`${key}: ${propObj[key]}`} />
            );
          }
        }

        smSubItems.push(
          <CustomTreeItem key={propId} itemId={propId} label='Properties'>
            {propSubItems}
          </CustomTreeItem>
        );
      }

      smChildren.push(
        <CustomTreeItem key={smId} itemId={smId} label={smLabel}>
          {smSubItems}
        </CustomTreeItem>
      );
    });

    result.push(
      <CustomTreeItem key='SM' itemId='SM' label='Submodels'>
        {smChildren}
      </CustomTreeItem>
    );
  }

  return result;
};

export default function BorderedTreeView({ data }: TreeViewProps) {
  // 항상 recoil에서 값을 가져오고, data가 있으면 덮어씀
  const recoilAasxData = useRecoilValue(aasxDataState);
  const recoilIsVerified = useRecoilValue(isVerifiedState);
  const aasxData = data !== undefined ? data : recoilAasxData;
  const isVerified = data !== undefined ? true : recoilIsVerified;

  return (
    <SimpleTreeView
      aria-label='aasx-tree-view'
      defaultExpandedItems={['AAS', 'SM']}
      slots={{
        expandIcon: ExpandIcon,
        collapseIcon: CollapseIcon,
        endIcon: EndIcon,
      }}
      sx={{
        padding: '0 10px',
        overflowX: 'hidden',
        minHeight: 400,
        flexGrow: 1,
        maxWidth: '100%',
        '& .MuiTreeItem-content': {
          backgroundColor: '#e8eef7',
          borderBottom: '1px solid #d0d7e5',
        },
        '& .MuiTreeItem-label': {
          fontFamily: 'Arial, sans-serif',
          fontSize: '0.875rem',
        },
      }}
    >
      {isVerified && createTreeItems(aasxData)}
    </SimpleTreeView>
  );
}
