import React from 'react';
import TablePagination from '@mui/material/TablePagination';
import { PAGINATION } from '../../constants';

interface PaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CustomPagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) {
  // 데이터가 적어도 페이지 크기 선택이 보이도록 최소값 설정
  const displayCount = Math.max(count, PAGINATION.ROWS_PER_PAGE_OPTIONS[0]);

  return (
    <TablePagination
      component='div'
      count={displayCount}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={PAGINATION.ROWS_PER_PAGE_OPTIONS}
      labelRowsPerPage='페이지당 행 수:'
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count !== -1 ? count : `${to}개 이상`}`}
      showFirstButton
      showLastButton
      sx={{
        '& .MuiTablePagination-selectLabel': {
          display: 'block !important',
        },
        '& .MuiTablePagination-select': {
          display: 'block !important',
          minWidth: '80px',
          paddingLeft: '24px',
        },
        '& .MuiTablePagination-toolbar': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
        },
      }}
    />
  );
}
