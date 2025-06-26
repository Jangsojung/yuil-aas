import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { baseEditModeState, navigationResetState, selectedBasesState } from '../../recoil/atoms';

import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { TextField } from '@mui/material';

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

export default function FacilityPage() {
  const [insertMode, setInsertMode] = useState(false);
  const [baseEditMode, setBaseEditMode] = useRecoilState(baseEditModeState);
  const [, setSelectedBases] = useRecoilState(selectedBasesState);
  const location = useLocation();
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
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={1}>
            <Grid size={3} container spacing={1}>
              <Grid>
                <div className='sort-title'>설비그룹</div>
              </Grid>
              <Grid size={9}>
                <Select />
              </Grid>
            </Grid>
            <Grid size={3}>
              <Grid container spacing={1}>
                <Grid>
                  <div className='sort-title'>설비명</div>
                </Grid>
                <Grid size={9}>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <TextField />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={3}>
              <Grid container spacing={1}>
                <Grid>
                  <div className='sort-title'>센서명</div>
                </Grid>
                <Grid size={9}>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <TextField />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={3}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='contained' color='success'>
                  검색
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={1}>
            <Grid size={8}></Grid>
            <Grid size={4}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button
                  variant='contained'
                  color='primary'
                >
                  설비추가
                </Button>
                <Button variant='contained' color='error'>
                  설비삭제
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </div>

      <div className='table-wrap'>
        <SimpleTreeView>
          1호기
          <TreeItem>
            2온조기
          </TreeItem>
        </SimpleTreeView>

      </div>
    </div>

  );
}
