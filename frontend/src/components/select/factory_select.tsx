import React, { useState, useEffect } from 'react';
import { FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';
import { getFactoriesByCmIdxAPI } from '../../apis/api/basic';
import { Factory } from '../../types/api';

interface FactorySelectProps {
  value: number | '';
  onChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function FactorySelect({
  value,
  onChange,
  disabled = false,
  placeholder = '공장을 선택해주세요',
}: FactorySelectProps) {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useRecoilValue(userState);

  useEffect(() => {
    const fetchFactories = async () => {
      if (!user?.cm_idx) {
        setError('사용자 정보에서 회사 정보를 찾을 수 없습니다.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getFactoriesByCmIdxAPI(user.cm_idx);
        setFactories(data || []);
      } catch (err) {
        console.error('공장 정보 조회 실패:', err);
        setError('공장 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchFactories();
  }, [user?.cm_idx]);

  const handleChange = (event: SelectChangeEvent<number>) => {
    const selectedValue = event.target.value as number;
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

  if (loading) {
    return (
      <FormControl fullWidth size='small'>
        <Select value='' displayEmpty disabled>
          <MenuItem disabled value=''>
            로딩 중...
          </MenuItem>
        </Select>
      </FormControl>
    );
  }

  return (
    <FormControl fullWidth size='small'>
      <Select value={value} onChange={handleChange} displayEmpty disabled={disabled || factories.length === 0}>
        <MenuItem disabled value=''>
          {factories.length === 0 ? '사용 가능한 공장이 없습니다' : placeholder}
        </MenuItem>
        {factories.map((factory) => (
          <MenuItem key={factory.fc_idx} value={factory.fc_idx}>
            {factory.fc_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
