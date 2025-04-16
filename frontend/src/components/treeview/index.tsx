import * as React from 'react';
import IndeterminateCheckBoxRoundedIcon from '@mui/icons-material/IndeterminateCheckBoxRounded';
import DisabledByDefaultRoundedIcon from '@mui/icons-material/DisabledByDefaultRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import { styled, alpha } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { useRecoilValue } from 'recoil';
import { aasxDataState, isVerifiedState } from '../../recoil/atoms';

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

function ExpandIcon(props: React.PropsWithoutRef<typeof AddBoxRoundedIcon>) {
  return <AddBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
}

function CollapseIcon(props: React.PropsWithoutRef<typeof IndeterminateCheckBoxRoundedIcon>) {
  return <IndeterminateCheckBoxRoundedIcon {...props} sx={{ opacity: 0.8 }} />;
}

function EndIcon(props: React.PropsWithoutRef<typeof DisabledByDefaultRoundedIcon>) {
  return <DisabledByDefaultRoundedIcon {...props} sx={{ opacity: 0.3 }} />;
}

const createTreeItems = (data: any) => {
  if (!data) return null;

  const result: React.JSX.Element[] = [];

  if (data.AAS) {
    const aasItems = Array.isArray(data.AAS) ? data.AAS : [data.AAS];

    aasItems.forEach((aas, index) => {
      const aasId = `AAS-${index}`;
      const aasLabel = `AAS "${aas.AssetInformation?.Unit1 || aas.name}" [${aas.url || 'url 없음'}]`;

      const aasChildren = [];

      if (aas.AssetInformation) {
        const assetInfoId = `${aasId}-AssetInfo`;
        const assetInfoItems = [];

        for (const key in aas.AssetInformation) {
          for (const key in aas) {
            if (key !== 'name' && key !== 'url' && key !== 'submodelRefs' && key !== 'AssetInformation') {
              const propId = `${aasId}-${key}`;
              assetInfoItems.push(<CustomTreeItem key={propId} itemId={propId} label={`kind: ${aas[key]}`} />);
            }
          }
          const assetPropId = `${assetInfoId}-${key}`;
          assetInfoItems.push(
            <CustomTreeItem
              key={assetPropId}
              itemId={assetPropId}
              label={`globalAssetId: ${aas.AssetInformation[key]}`}
            />
          );
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
    const smChildren = [];

    smItems.forEach((sm, index) => {
      const smId = `SM-${index}`;
      const smLabel = `${sm.name} [${sm.url || 'url 없음'}]`;
      const smSubItems = [];

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
          const smcSubItems = [];

          if (smc.items && Array.isArray(smc.items)) {
            smc.items.forEach((item, itemIndex) => {
              const itemId = `${smcId}-item-${itemIndex}`;
              const itemLabel = item.name;
              const itemSubItems = [];

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
        const propSubItems = [];

        if (Array.isArray(propItems)) {
          propItems.forEach((prop, propIndex) => {
            const singlePropId = `${propId}-${propIndex}`;
            propSubItems.push(
              <CustomTreeItem key={singlePropId} itemId={singlePropId} label={`${prop.name}: ${prop.value}`} />
            );
          });
        } else {
          for (const key in sm.Prop) {
            const singlePropId = `${propId}-${key}`;
            propSubItems.push(
              <CustomTreeItem key={singlePropId} itemId={singlePropId} label={`${key}: ${sm.Prop[key]}`} />
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

export default function BorderedTreeView() {
  const aasxData = useRecoilValue(aasxDataState);
  const isVerified = useRecoilValue(isVerifiedState);

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
