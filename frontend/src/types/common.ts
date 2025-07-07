export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  currentPage: number;
  rowsPerPage: number;
  totalCount: number;
  totalPages: number;
}

export interface TableRow {
  id: number | string;
  [key: string]: any;
}

export type SortDirection = 'asc' | 'desc';

export type ModalType = 'alert' | 'confirm';

export type ButtonVariant = 'text' | 'outlined' | 'contained';
export type ButtonColor = 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'inherit';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface SelectionState {
  selectedItems: (number | string)[];
  selectAll: boolean;
}
