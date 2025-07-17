import React from 'react';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/system/Grid';
import Typography from '@mui/material/Typography';
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
import { SearchBox, ActionBox, SortableTableHeader } from '../common';
import { Base } from '../../types/api';
import { Dayjs } from 'dayjs';
import { SortDirection, SortableColumn } from '../../hooks/useSortableData';
import FactorySelect from '../select/factory_select';
import TableEmptyRow from '../common/TableEmptyRow';

interface ListViewProps {
  // 상태
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchKeyword: string;
  setSearchKeyword: (value: string) => void;
  selectedFactory: number | '';
  pagedData: Base[];
  selectAll: boolean;
  selectedBases: number[];
  sortField?: keyof Base;
  sortDirection: SortDirection;
  sortableColumns: SortableColumn<Base>[];

  // 핸들러
  onSearch: () => void;
  onReset: () => void;
  onDateChange: (startDate: Dayjs | null, endDate: Dayjs | null) => void;
  onFactoryChange: (factoryId: number) => void;
  onAdd: () => void;
  onDelete: () => void;
  onPageChange: (event: unknown, page: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectAllChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (baseIdx: number) => void;
  onClick: (base: Base) => void;
  formatDate: (dateString: string | undefined) => string;
  onSort: (field: keyof Base) => void;

  // 페이지네이션
  currentPage: number;
  rowsPerPage: number;
  calculatedTotalPages: number;
}

export const ListView: React.FC<ListViewProps> = ({
  startDate,
  endDate,
  searchKeyword,
  setSearchKeyword,
  selectedFactory,
  pagedData,
  selectAll,
  selectedBases,
  sortField,
  sortDirection,
  sortableColumns,
  onSearch,
  onReset,
  onDateChange,
  onFactoryChange,
  onAdd,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
  onSelectAllChange,
  onCheckboxChange,
  onClick,
  formatDate,
  onSort,
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
              color: 'primary',
            },
            {
              text: '초기화',
              onClick: onReset,
              color: 'inherit',
              variant: 'outlined',
            },
          ]}
        >
          <Grid container spacing={4} className='flex-center-gap-lg'>
            {/* 공장 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>공장</div>
              </Grid>
              <Grid sx={{ flexGrow: 1 }}>
                <FormControl sx={{ width: '100%' }} size='small'>
                  <FactorySelect
                    value={selectedFactory}
                    onChange={onFactoryChange}
                    placeholder='선택'
                    showAllOption={true}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {/* 공장 */}

            {/* 기초코드명 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>기초코드명</div>
              </Grid>
              <Grid>
                <FormControl sx={{ width: '100%' }} size='small'>
                  <TextField
                    size='small'
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </FormControl>
              </Grid>
            </Grid>
            {/* 기초코드명 */}

            {/* 기간 */}
            <Grid container spacing={2}>
              <Grid className='sort-title'>
                <div>기간</div>
              </Grid>
              <Grid>
                <BasicDatePicker onDateChange={onDateChange} startDate={startDate} endDate={endDate} />
              </Grid>
            </Grid>
            {/* 기간 */}
          </Grid>
        </SearchBox>
      </div>

      <div className='list-header'>
        <Typography variant='h6' gutterBottom>
          기초코드 목록
        </Typography>

        <ActionBox
          buttons={[
            {
              text: '기초코드 등록',
              onClick: onAdd,
              color: 'primary',
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
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
              <TableRow>
                <TableCell padding='checkbox' sx={{ backgroundColor: 'white' }}>
                  <Checkbox
                    checked={selectAll}
                    onChange={onSelectAllChange}
                    inputProps={{ 'aria-label': 'select all' }}
                  />
                </TableCell>
                <SortableTableHeader
                  columns={sortableColumns}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={onSort}
                  showCheckbox={false}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((base: Base, idx) => (
                  <TableRow
                    key={base.ab_idx}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    onClick={() => onClick(base)}
                    className='cursor-pointer'
                  >
                    <TableCell onClick={(e) => e.stopPropagation()} padding='checkbox'>
                      <Checkbox
                        checked={selectedBases.includes(base.ab_idx)}
                        onChange={() => onCheckboxChange(base.ab_idx)}
                      />
                    </TableCell>
                    <TableCell>{base.fc_name || '-'}</TableCell>
                    <TableCell>{base.ab_name}</TableCell>
                    <TableCell>{base.sn_length === 0 ? '-' : base.sn_length}</TableCell>
                    <TableCell>{formatDate(base.createdAt?.toString())}</TableCell>
                    <TableCell>{formatDate(base.updatedAt?.toString())}</TableCell>
                    <TableCell>{base.ab_note}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={7} />
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
