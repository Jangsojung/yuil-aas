import { useState, useCallback } from 'react';

interface UseTableSearchProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  searchKeyword: string;
  onSearchKeywordChange: (keyword: string) => void;
}

export const useTableSearch = <T>({
  data,
  searchFields,
  searchKeyword,
  onSearchKeywordChange,
}: UseTableSearchProps<T>) => {
  const filteredData = useCallback(() => {
    if (!searchKeyword.trim()) return data;

    const keyword = searchKeyword.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(keyword);
      })
    );
  }, [data, searchFields, searchKeyword]);

  const handleSearch = useCallback(() => {
    return filteredData();
  }, [filteredData]);

  const handleReset = useCallback(() => {
    onSearchKeywordChange('');
  }, [onSearchKeywordChange]);

  return {
    filteredData: filteredData(),
    handleSearch,
    handleReset,
  };
};
