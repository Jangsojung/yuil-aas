import React from 'react';
import { TableCell, TableRow } from '@mui/material';

interface TableEmptyRowProps {
  colSpan: number;
  message?: string;
}

const TableEmptyRow: React.FC<TableEmptyRowProps> = ({ colSpan, message = '조회 결과 없음' }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align='center'>
      {message}
    </TableCell>
  </TableRow>
);

export default TableEmptyRow;
