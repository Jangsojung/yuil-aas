import { useState, useCallback, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortableColumn<T> {
  field: keyof T;
  label: string;
  sortable?: boolean;
  maxWidth?: number | string;
}

export const useSortableData = <T extends Record<string, any>>(
  data: T[],
  defaultSortField?: keyof T,
  defaultSortDirection: SortDirection = 'desc'
) => {
  const [sortField, setSortField] = useState<keyof T | undefined>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // null/undefined 처리
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // 날짜 타입 처리
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        // 날짜 문자열 처리 (YYYY-MM-DD 형식)
        const dateRegex = /^\d{4}-\d{2}-\d{2}/;
        if (dateRegex.test(aValue) && dateRegex.test(bValue)) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else {
          // 일반 문자열은 대소문자 구분 없이 비교
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
      }

      // 숫자 타입 처리
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        // 숫자는 그대로 비교
      } else if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
        // 문자열이지만 숫자로 변환 가능한 경우
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      // 정렬 로직
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [data, sortField, sortDirection]);

  const handleSort = useCallback(
    (field: keyof T) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField, sortDirection]
  );

  const resetSort = useCallback(() => {
    setSortField(defaultSortField);
    setSortDirection(defaultSortDirection);
  }, [defaultSortField, defaultSortDirection]);

  return {
    sortedData,
    sortField,
    sortDirection,
    handleSort,
    resetSort,
  };
};
