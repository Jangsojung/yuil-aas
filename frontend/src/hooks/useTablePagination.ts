import { useState, useCallback } from 'react';

interface UseTablePaginationProps {
  totalCount: number;
  defaultRowsPerPage?: number;
}

export const useTablePagination = ({ totalCount, defaultRowsPerPage = 10 }: UseTablePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const handlePageChange = useCallback((event: unknown, page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setRowsPerPage(newPageSize);
    setCurrentPage(0);
  }, []);

  const paginatedData = useCallback(
    (data: any[]) => {
      const startIndex = currentPage * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return data.slice(startIndex, endIndex);
    },
    [currentPage, rowsPerPage]
  );

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return {
    currentPage,
    rowsPerPage,
    totalPages,
    handlePageChange,
    handleRowsPerPageChange,
    paginatedData,
  };
};
