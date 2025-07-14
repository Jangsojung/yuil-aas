import React, { useState, useEffect } from 'react';
import { FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';
import { getFactoriesByCmIdxAPI } from '../../apis/api/basic';
import { Factory } from '../../types/api';

interface FactorySelectProps {
  value: number | '';
  onChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
  refreshKey?: number;
  showAllOption?: boolean;
}

export default function FactorySelect({
  value,
  onChange,
  disabled = false,
  placeholder = '공장',
  refreshKey = 0,
  showAllOption = false,
}: FactorySelectProps) {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const user = useRecoilValue(userState);

  const handleFetchFactories = async () => {
    if (!user?.cm_idx) {
      setError('정보 없음'); //사용자정보에서 회사정보가 없음
      return;
    }
    setError(null);
    try {
      const data = await getFactoriesByCmIdxAPI(user.cm_idx);
      setFactories(data || []);
    } catch (err) {
      setError('공장 정보 없음');
    }
  };

  useEffect(() => {
    handleFetchFactories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.cm_idx, refreshKey]);

  const handleChange = (event: SelectChangeEvent<number>) => {
    const selectedValue = Number(event.target.value);
    onChange(selectedValue);
  };

  if (error) {
    return (
      <FormControl fullWidth size='small' error>
        <Select value='' displayEmpty disabled>
          <MenuItem disabled value=''>
            {error}
          </MenuItem>
        </Select>
      </FormControl>
    );
  }

  return (
    <FormControl fullWidth size='small'>
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        disabled={disabled || factories.length === 0}
        IconComponent={ExpandMoreIcon}
      >
        <MenuItem disabled value=''>
          {factories.length === 0 ? '공장 정보 없음' : placeholder}
        </MenuItem>
        {showAllOption && <MenuItem value={-1}>전체</MenuItem>}
        {factories.map((factory) => (
          <MenuItem key={factory.fc_idx} value={factory.fc_idx}>
            {factory.fc_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
