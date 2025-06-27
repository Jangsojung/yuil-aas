import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Grid from '@mui/system/Grid';

import Pagination from '../../components/pagination';
import { getWordsAPI } from '../../apis/api/data_manage';
import DataTableRow from '../../components/aasx/data_management/DataTableRow';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { SearchBox, FilterBox } from '../../components/common';

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

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const pagedData = words?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  // const handleUpdate = async (newFile: Word) => {
  //   const newFiles = words.map((file) => (file.af_idx === newFile.af_idx ? newFile : file));
  //   setWords(newFiles);
  // };

  const getWords = async () => {
    try {
      const response = await getWordsAPI();
      if (response.data) {
        setWords(response.data);
      }
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  };

  const handleSearch = () => {
    getWords();
  };

  useEffect(() => {
    getWords();
    setIsSelected(false);
    setCurrentPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  return (
    <div className='table-outer'>
      <div>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: handleSearch,
              color: 'success',
            },
          ]}
        >
          <Grid container spacing={1}>
            <Grid item>
              <div className='sort-title'>검색</div>
            </Grid>

            <Grid item xs={2}>
              <FormControl sx={{ m: 0, width: '100%' }} size='small'>
                <Select />
              </FormControl>
            </Grid>
            <Grid item xs={7}>
              <FormControl sx={{ m: 0, width: '100%' }} size='small'>
                <TextField />
              </FormControl>
            </Grid>
          </Grid>
        </SearchBox>

        <FilterBox
          leftContent={
            <Grid container spacing={1} style={{ gap: '20px' }}>
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item className='d-flex gap-5'>
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => (isSelected ? setIsSelected(false) : setIsSelected(true))}
                    />{' '}
                    매칭되지 않은 항목만 보기
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          }
          buttons={[
            {
              text: '확인',
              onClick: handleSearch,
              color: 'success',
            },
            {
              text: '취소',
              onClick: () => {},
              color: 'inherit',
              variant: 'outlined',
            },
          ]}
        />
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
        <Pagination count={words ? words.length : 0} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}

const cells = ['한글', '영어'];
