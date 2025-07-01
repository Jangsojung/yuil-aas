import React from 'react';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';

interface DataTableRowProps {
  data: {
    as_kr: string;
    as_en: string;
    af_idx?: number;
  };
  totalCount?: number;
  checked?: boolean;
  editingValue?: string;
  onCheckboxChange?: (data: any) => void;
  onEnglishChange?: (originalData: any, newEnglish: string) => void;
}

export default function DataTableRow({
  data,
  totalCount,
  checked = false,
  editingValue,
  onCheckboxChange,
  onEnglishChange,
}: DataTableRowProps) {
  const handleCheckboxChange = () => {
    if (onCheckboxChange) {
      onCheckboxChange(data);
    }
  };

  const handleEnglishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onEnglishChange) {
      onEnglishChange(data, newValue);
    }
  };

  const isValidEnglish = (value: string) => {
    const validPattern = /^[a-zA-Z0-9_]*$/;
    return validPattern.test(value);
  };

  const currentValue = editingValue ?? data.as_en ?? '';
  const isInvalid = !!currentValue && !isValidEnglish(currentValue);

  return (
    <TableRow key={data.af_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell sx={{ minWidth: '150px', width: '150px' }}>
        <Checkbox checked={checked} onChange={handleCheckboxChange} />
      </TableCell>
      <TableCell sx={{ width: '50%' }}>{data.as_kr}</TableCell>
      <TableCell sx={{ width: '50%' }}>
        {checked ? (
          <>
            <TextField
              value={currentValue}
              onChange={handleEnglishChange}
              size='small'
              fullWidth
              variant='outlined'
              error={isInvalid}
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  padding: '4px 8px',
                  fontSize: '14px',
                },
                '& .MuiOutlinedInput-root': {
                  height: '32px',
                },
                '& .MuiFormHelperText-root': {
                  margin: '2px 0 0 0',
                  fontSize: '11px',
                },
              }}
            />
            {isInvalid && <div className='error-message'>영어, 숫자, _만 사용 가능</div>}
          </>
        ) : (
          data.as_en
        )}
      </TableCell>
    </TableRow>
  );
}
