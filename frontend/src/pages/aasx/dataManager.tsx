import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import dayjs, { Dayjs } from 'dayjs';

import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Pagenation from '../../components/pagenation';
import { deleteDataAPI, getFilesAPI, getWordsAPI } from '../../apis/api/data_manage';
import DataTableRow from '../../components/aasx/data_management/DataTableRow';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';

interface Word {
  as_kr: string;
  as_en: string;
}

export default function DataManagerPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [isSelected, setIsSelected] = useState(false);
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagedData = words?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  // const handleUpdate = async (newFile: Word) => {
  //   const newFiles = words.map((file) => (file.af_idx === newFile.af_idx ? newFile : file));
  //   setWords(newFiles);
  // };

  const getWords = async () => {
    const data: Word[] = await getWordsAPI();
    setWords(data);
  };

  const handleSearch = () => {
    getWords();
  };

  useEffect(() => {
    getWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getWords();
    setIsSelected(false);
    setCurrentPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  return (
    <div className='table-outer'>
      <div>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={1}>
            <Grid size={10}>
              <Grid container spacing={1}>
                <Grid>
                  <div className='sort-title'>검색</div>
                </Grid>

                <Grid size={2}>
                  <FormControl sx={{ m: 0, width: '100%' }} size='small'>
                    <Select />
                  </FormControl>
                </Grid>
                <Grid size={7}>
                  <FormControl sx={{ m: 0, width: '100%' }} size='small'>
                    <TextField />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={2}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='contained' color='success' onClick={handleSearch}>
                  검색
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={1}>
            <Grid size={8}>
              <Grid container spacing={1} style={{ gap: '20px' }}>
                <Grid>
                  <Grid container spacing={1}>
                    <Grid className='d-flex gap-5'>
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => (isSelected ? setIsSelected(false) : setIsSelected(true))}
                      />{' '}
                      매칭되지 않은 항목만 보기
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={4}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='contained' color='success' onClick={handleSearch}>
                  확인
                </Button>
                <Button variant='contained' color='inherit'>
                  취소
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </div>

      <div className='table-wrap'>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                {cells.map((cell, idx) => (
                  <TableCell
                    key={idx}
                    sx={{
                      width: idx === 0 ? '10%' : '45%',
                    }}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((word, idx) => <DataTableRow key={idx} data={word} totalCount={words.length} />)
              ) : (
                <TableRow>
                  <TableCell colSpan={cells.length} align='center'>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagenation count={words ? words.length : 0} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

const cells = ['한글', '영어'];
