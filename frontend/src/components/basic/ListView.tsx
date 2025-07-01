import React from 'react';
import Grid from '@mui/material/Grid';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Pagination from '../pagination';
import BasicDatePicker from '../datepicker';
import { SearchBox, ActionBox } from '../common';
import { Dayjs } from 'dayjs';

interface Base {
  ab_idx: number;
  ab_name: string;
  ab_note: string;
  sn_length: number;
  createdAt: Date;
}

interface ListViewProps {
  // 상태
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
  pagedData: Base[];
  selectAll: boolean;
  selectedBases: number[];

  // 핸들러
  onSearch: () => void;
  onReset: () => void;
  onDateChange: (startDate: Dayjs | null, endDate: Dayjs | null) => void;
  onAdd: () => void;
  onDelete: () => void;
  onPageChange: (event: unknown, page: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectAllChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (baseIdx: number) => void;
  onClick: (base: Base) => void;
  formatDate: (dateString: string | undefined) => string;

  // 페이지네이션
  currentPage: number;
  rowsPerPage: number;
  calculatedTotalPages: number;
}

const cells = ['기초코드명', '센서 개수', '생성 일자', '비고'];

export const ListView: React.FC<ListViewProps> = ({
  startDate,
  endDate,
  searchKeyword,
  setSearchKeyword,
  pagedData,
  selectAll,
  selectedBases,
  onSearch,
  onReset,
  onDateChange,
  onAdd,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
  onSelectAllChange,
  onCheckboxChange,
  onClick,
  formatDate,
  currentPage,
  rowsPerPage,
  calculatedTotalPages,
}) => {
  return (
    <>
      <div>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: onSearch,
              color: 'success',
            },
            {
              text: '초기화',
              onClick: onReset,
              color: 'inherit',
              variant: 'outlined',
            },
          ]}
        >
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={3}>
              <div className='flex-center-gap'>
                <div className='sort-title'>기초코드명</div>
                <TextField
                  size='small'
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder='기초코드명을 입력하세요'
                  sx={{ flex: 1 }}
                />
              </div>
            </Grid>

            <Grid item xs={6}>
              <div className='flex-center-gap'>
                <div className='sort-title'>날짜</div>
                <BasicDatePicker onDateChange={onDateChange} startDate={startDate} endDate={endDate} />
              </div>
            </Grid>
          </Grid>
        </SearchBox>

        <ActionBox
          buttons={[
            {
              text: '기초코드 등록',
              onClick: onAdd,
              color: 'success',
            },
            {
              text: '삭제',
              onClick: onDelete,
              color: 'error',
            },
          ]}
        />
      </div>

      <div className='table-wrap'>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox checked={selectAll} onChange={onSelectAllChange} />
                </TableCell>
                {cells.map((cell, idx) => (
                  <TableCell key={idx}>{cell}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((base, idx) => (
                  <TableRow
                    key={base.ab_idx}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    onClick={() => onClick(base)}
                    className='cursor-pointer'
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedBases.includes(base.ab_idx)}
                        onChange={() => onCheckboxChange(base.ab_idx)}
                      />
                    </TableCell>
                    <TableCell>{base.ab_name}</TableCell>
                    <TableCell>{base.sn_length || 0}</TableCell>
                    <TableCell>{formatDate(base.createdAt?.toString())}</TableCell>
                    <TableCell>{base.ab_note}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={cells.length + 1} align='center'>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={pagedData ? pagedData.length : 0}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </>
  );
};
