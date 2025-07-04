import React from 'react';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { SortDirection, SortableColumn } from '../../hooks/useSortableData';

interface SortableTableHeaderProps<T> {
  columns: SortableColumn<T>[];
  sortField?: keyof T;
  sortDirection: SortDirection;
  onSort: (field: keyof T) => void;
  showCheckbox?: boolean;
  onSelectAllChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selectAll?: boolean;
}

export const SortableTableHeader = <T extends Record<string, any>>({
  columns,
  sortField,
  sortDirection,
  onSort,
  showCheckbox = false,
  onSelectAllChange,
  selectAll = false,
}: SortableTableHeaderProps<T>) => {
  const renderSortButton = (field: keyof T, sortable: boolean = true) => {
    if (!sortable) return null;

    const isActive = sortField === field;
    const isAsc = sortDirection === 'asc';

    return (
      <IconButton
        size='small'
        onClick={() => onSort(field)}
        sx={{
          ml: 0.5,
          p: 0.5,
          color: isActive ? 'primary.main' : 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
        }}
      >
        {isActive ? isAsc ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
      </IconButton>
    );
  };

  return (
    <>
      {showCheckbox && (
        <TableCell>
          <Checkbox checked={selectAll} onChange={onSelectAllChange} />
        </TableCell>
      )}
      {columns.map((column, idx) => (
        <TableCell key={idx}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <span>{column.label}</span>
            {renderSortButton(column.field, column.sortable)}
          </div>
        </TableCell>
      ))}
    </>
  );
};
