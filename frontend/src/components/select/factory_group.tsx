import React, { useState, useEffect } from 'react';
import { FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { getFacilityGroupsAPI } from '../../apis/api/basic';
import { FacilityGroup } from '../../types/api';
import FactorySelect from './factory_select';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/atoms';

interface FacilityGroupSelectProps {
  value: number | '';
  onChange: (value: number) => void;
  disabled?: boolean;
  placeholder?: string;
  showFactorySelect?: boolean;
  selectedFactory?: number | '';
  onFactoryChange?: (value: number) => void;
}

export default function FacilityGroupSelect({
  value,
  onChange,
  disabled = false,
  placeholder = '설비 그룹',
  showFactorySelect = false,
  selectedFactory = '',
  onFactoryChange,
}: FacilityGroupSelectProps) {
  const [facilityGroups, setFacilityGroups] = useState<FacilityGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useRecoilValue(userState);

  const handleFetchFacilityGroups = async () => {
    if (showFactorySelect && !selectedFactory) {
      setFacilityGroups([]);
      return;
    }

    // 공장 선택이 필수
    if (!selectedFactory) {
      setFacilityGroups([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getFacilityGroupsAPI(selectedFactory as number);
      setFacilityGroups(data || []);
    } catch (err) {
      console.error('설비 그룹 조회 실패:', err);
      setError('설비 그룹을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchFacilityGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFactory, showFactorySelect]);

  const handleChange = (event: SelectChangeEvent<number>) => {
    const selectedValue = event.target.value as number;
    onChange(selectedValue);
  };

  if (showFactorySelect) {
    return (
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              color: '#637381',
            }}
          >
            공장
          </label>
          <FactorySelect
            value={selectedFactory}
            onChange={onFactoryChange || (() => {})}
            disabled={disabled}
            placeholder='공장'
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              color: '#637381',
            }}
          >
            설비 그룹
          </label>
          <FormControl fullWidth size='small'>
            <Select
              value={value}
              onChange={handleChange}
              displayEmpty
              disabled={disabled || loading || !selectedFactory || facilityGroups.length === 0}
            >
              <MenuItem disabled value=''>
                {loading
                  ? '로딩 중...'
                  : !selectedFactory
                    ? '공장을 먼저 선택해주세요'
                    : facilityGroups.length === 0
                      ? '사용 가능한 설비 그룹이 없습니다'
                      : placeholder}
              </MenuItem>
              {facilityGroups.map((group) => (
                <MenuItem key={group.fg_idx} value={group.fg_idx}>
                  {group.fg_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>
    );
  }

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
      <Select value={value} onChange={handleChange} displayEmpty disabled={disabled || facilityGroups.length === 0}>
        <MenuItem disabled value=''>
          {facilityGroups.length === 0 ? '사용 가능한 설비 그룹이 없습니다' : placeholder}
        </MenuItem>
        {facilityGroups.map((group) => (
          <MenuItem key={group.fg_idx} value={group.fg_idx}>
            {group.fg_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
