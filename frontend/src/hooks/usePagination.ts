import { useState, useMemo, useCallback } from 'react';
import { PAGINATION } from '../constants';

export const usePagination = (totalItems: number, defaultRowsPerPage: number = PAGINATION.DEFAULT_ROWS_PER_PAGE) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const totalPages = useMemo(
    () => (rowsPerPage === -1 ? 1 : Math.ceil(totalItems / rowsPerPage)),
    [totalItems, rowsPerPage]
  );

  const paginatedData = useCallback(
    <T>(data: T[]): T[] => {
      if (rowsPerPage === -1) return data;
      const startIndex = currentPage * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return data.slice(startIndex, endIndex);
    },
    [currentPage, rowsPerPage]
  );

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 0 && page < totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const resetPagination = useCallback(() => {
    setCurrentPage(0);
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const newPageSize = value === '-1' ? -1 : parseInt(value, 10);
    setRowsPerPage(newPageSize);
    setCurrentPage(0);
  }, []);

  return {
    currentPage,
    totalPages,
    rowsPerPage,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPrevPage,
    resetPagination,
    handleRowsPerPageChange,
  };
};
