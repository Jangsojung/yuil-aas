import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';

interface AASXTableRowProps {
  file: {
    af_idx: number;
    af_name: string;
    createdAt: string | Date;
  };
  onCheckboxChange: (id: number) => void;
  checked: boolean;
  onEditClick: (file: any) => void;
  index: number;
  totalCount?: number;
}

export default function AASXTableRow({
  file,
  onCheckboxChange,
  checked,
  onEditClick,
  index,
  totalCount,
}: AASXTableRowProps) {
  // 전체 데이터 개수에서 현재 인덱스를 빼서 역순 번호 계산
  const displayNumber = totalCount ? totalCount - index : index + 1;
  const createdAtStr = typeof file.createdAt === 'string' ? file.createdAt : file.createdAt.toISOString();

  return (
    <TableRow key={file.af_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Checkbox checked={checked} onChange={() => onCheckboxChange(file.af_idx)} />
      </TableCell>
      <TableCell>{displayNumber}</TableCell>
      {/* <TableCell>{file.af_idx}</TableCell> */}
      <TableCell>{file.af_name}</TableCell>
      <TableCell>{new Date(createdAtStr).toLocaleDateString()}</TableCell>
      <TableCell>
        <Button variant='contained' color='success' onClick={() => onEditClick(file)}>
          수정
        </Button>
      </TableCell>
    </TableRow>
  );
}
