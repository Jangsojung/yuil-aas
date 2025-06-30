import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { baseEditModeState, navigationResetState, selectedBasesState } from '../../recoil/atoms';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { TextField } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { SearchBox, ActionBox } from '../../components/common';

export default function FacilityPage() {
  const [insertMode, setInsertMode] = useState(false);
  const [baseEditMode, setBaseEditMode] = useRecoilState(baseEditModeState);
  const [, setSelectedBases] = useRecoilState(selectedBasesState);
  const navigationReset = useRecoilValue(navigationResetState);

  useEffect(() => {
    setInsertMode(false);
    setBaseEditMode(false);
    setSelectedBases([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  return (
    <div className='table-outer'>
      <div>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: () => {},
              color: 'success',
            },
          ]}
        >
          <Grid container spacing={1}>
            <Grid item xs={3} container spacing={1}>
              <Grid item>
                <div className='sort-title'>설비그룹</div>
              </Grid>
              <Grid item xs={9}>
                <Select />
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>설비명</div>
                </Grid>
                <Grid item xs={9}>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <TextField />
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
                    <TextField />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </SearchBox>

        <ActionBox
          buttons={[
            {
              text: '설비추가',
              onClick: () => {},
              color: 'primary',
            },
            {
              text: '설비삭제',
              onClick: () => {},
              color: 'error',
            },
          ]}
        />
      </div>

      <div className='table-wrap'>
        <SimpleTreeView>
          <TreeItem itemId='1'>
            1호기
            <TreeItem itemId='2'>2온조기</TreeItem>
          </TreeItem>
        </SimpleTreeView>
      </div>
    </div>
  );
}
