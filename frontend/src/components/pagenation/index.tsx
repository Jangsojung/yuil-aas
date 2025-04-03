import * as React from 'react';
import TablePagination from '@mui/material/TablePagination';

export default function TablePaginationDemo({ count }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  return (
    <TablePagination
      component='div'
      count={Math.trunc(count / 10 + 1)}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={rowsPerPage}
    />
  );
}
