import React from 'react';
import TablePagination from '@mui/material/TablePagination';

interface PaginationProps {
  count: number;
  page: number;
  onPageChange: (event: unknown, newPage: number) => void;
}

export default function TablePaginationDemo({ count, page, onPageChange }: PaginationProps) {
  const rowsPerPage = 10;

  return (
    <TablePagination
      component='div'
      count={count}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[]}
    />
  );
}
