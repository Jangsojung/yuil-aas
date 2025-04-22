import React, { useState } from 'react';
import TablePagination from '@mui/material/TablePagination';

export default function TablePaginationDemo({ count, onPageChange }) {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    onPageChange(newPage);
  };

  return (
    <TablePagination
      component='div'
      count={count}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={[]}
    />
  );
}
