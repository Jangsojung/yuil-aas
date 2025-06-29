import { useState, useMemo, useCallback } from 'react';
import { PaginationState } from '../types/api';

export const usePagination = (totalItems: number, defaultRowsPerPage: number = 10) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage] = useState(defaultRowsPerPage);

  const totalPages = useMemo(() => Math.ceil(totalItems / rowsPerPage), [totalItems, rowsPerPage]);

  const paginatedData = useCallback(
    <T>(data: T[]): T[] => {
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

  return {
    currentPage,
    totalPages,
    rowsPerPage,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  };
};
