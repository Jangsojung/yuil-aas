import * as React from 'react';
import IndeterminateCheckBoxRoundedIcon from '@mui/icons-material/IndeterminateCheckBoxRounded';
import DisabledByDefaultRoundedIcon from '@mui/icons-material/DisabledByDefaultRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import { styled, alpha } from '@mui/material/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { useRecoilState, useRecoilValue } from 'recoil';
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

const createTreeItems = (data: any, parentId: string = '') => {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data.map((item, index) => {
      const itemId = parentId ? `${parentId}-${index}` : `${index}`;
      return createTreeItems(item, itemId);
    });
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    return keys.map((key, index) => {
      const itemId = parentId ? `${parentId}-${key}` : `${key}`;
      const value = data[key];

      // Handle special cases based on key
      if (key === 'AAS') {
        return (
          <CustomTreeItem
            key={itemId}
            itemId={itemId}
            label={`AAS "${value.AssetInformation?.Unit1 || value.name || key}" [${value.url || 'no url'}]`}
          >
            {createTreeItems(value, itemId)}
          </CustomTreeItem>
        );
      } else if (key === 'SM') {
        return (
          <CustomTreeItem key={itemId} itemId={itemId} label={`SM "${value.name || key}" [${value.url || 'no url'}]`}>
            {createTreeItems(value, itemId)}
          </CustomTreeItem>
        );
      } else if (key === 'SMC') {
        return (
          <CustomTreeItem
            key={itemId}
            itemId={itemId}
            label={`SMC "${value.name || key}" (${value.elements || 0} elements)`}
          >
            {createTreeItems(value, itemId)}
          </CustomTreeItem>
        );
      } else if (key === 'Prop') {
        return <CustomTreeItem key={itemId} itemId={itemId} label={`Prop "${key}" = ${value}`} />;
      } else if (key === 'Asset') {
        return (
          <CustomTreeItem
            key={itemId}
            itemId={itemId}
            label={`Asset ${value.name || 'AssetInformation'} ${value.Unit1 || ''}`}
          >
            {createTreeItems(value, itemId)}
          </CustomTreeItem>
        );
      } else if (typeof value === 'object' && value !== null) {
        return (
          <CustomTreeItem key={itemId} itemId={itemId} label={key}>
            {createTreeItems(value, itemId)}
          </CustomTreeItem>
        );
      } else {
        return <CustomTreeItem key={itemId} itemId={itemId} label={`${key}: ${value}`} />;
      }
    });
  }

  return null;
};

export default function BorderedTreeView() {
  const aasxData = useRecoilValue(aasxDataState);
  const isVerified = useRecoilValue(isVerifiedState);

  // 이미지와 같은 예시 데이터 (실제로는 aasxData를 사용할 예정)
  const exampleData = {
    AAS: {
      name: 'AAS',
      url: 'https://sambo.com/Unit1',
      of: '[Unit1, Instance]',
      AssetInformation: {
        Unit1: 'Unit1',
      },
    },
    SM: [
      {
        name: 'TempController',
        url: 'https://sambo.com/Unit1/TempController',
        SMC: [
          {
            name: 'TempControllerPresentValue_Time_Series',
            elements: 166,
          },
          {
            name: 'TempControllerPresentValue_20250206_230455',
            elements: 2,
            Prop: [
              {
                name: 'timestamp',
                value: '2025-02-06T23:04:55',
              },
              {
                name: 'value',
                value: '0.92',
              },
            ],
          },
          {
            name: 'TempControllerPresentValue_20250206_230511',
            elements: 2,
            Prop: [
              {
                name: 'timestamp',
                value: '2025-02-06T23:05:11',
              },
              {
                name: 'value',
                value: '0.92',
              },
            ],
          },
          {
            name: 'TempControllerPresentValue_20250206_230534',
            elements: 2,
          },
          {
            name: 'TempControllerPresentValue_20250206_230553',
            elements: 2,
          },
        ],
        Prop: {
          name: 'TempControllerPresentValue_Unit',
          value: '°C',
        },
      },
      {
        name: 'HopperDryer',
        url: 'https://sambo.com/Unit1/HopperDryer',
        SMC: {
          name: 'HopperDryerSetValue_Time_Series',
          elements: 166,
        },
        Prop: {
          name: 'HopperDryerSetValue_Unit',
          value: '°C',
        },
      },
    ],
  };

  return (
    <SimpleTreeView
      aria-label='aasx-tree-view'
      defaultExpandedItems={['AAS', 'SM-0']}
      slots={{
        expandIcon: ExpandIcon,
        collapseIcon: CollapseIcon,
        endIcon: EndIcon,
      }}
      sx={{
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
      {isVerified && aasxData ? createTreeItems(aasxData) : createTreeItems(exampleData)}
    </SimpleTreeView>
  );
}
