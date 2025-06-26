import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface FacilityGroup {
  fg_idx: number;
  fg_name: string;
}

type Props = {
  selectedFacilityGroups: number[];
  setSelectedFacilityGroups: Dispatch<SetStateAction<number[]>>;
  onFacilityGroupChange?: () => void;
};

export default function FacilityGroupSelect({
  selectedFacilityGroups,
  setSelectedFacilityGroups,
  onFacilityGroupChange,
}: Props) {
  const [facilityGroups, setFacilityGroups] = useState<FacilityGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const getFacilityGroups = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/base_code/facilityGroups?fc_idx=3');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFacilityGroups(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('설비그룹 로딩 에러:', err.message);
      setFacilityGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: any) => {
    const value = event.target.value;
    setSelectedFacilityGroups(value);
    if (onFacilityGroupChange) {
      onFacilityGroupChange();
    }
  };

  const handleSelectAll = () => {
    if (selectedFacilityGroups.length === facilityGroups.length) {
      // 모든 것이 선택된 상태에서 "전체 선택" 클릭 시 모두 해제
      setSelectedFacilityGroups([]);
    } else {
      // 일부만 선택된 상태에서 "전체 선택" 클릭 시 모두 선택
      setSelectedFacilityGroups(facilityGroups.map((fg) => fg.fg_idx));
    }
    if (onFacilityGroupChange) {
      onFacilityGroupChange();
    }
  };

  const getDisplayText = () => {
    if (selectedFacilityGroups.length === 0) {
      return '전체';
    }
    if (selectedFacilityGroups.length === 1) {
      const selected = facilityGroups.find((fg) => fg.fg_idx === selectedFacilityGroups[0]);
      return selected ? selected.fg_name : '전체';
    }
    return `${selectedFacilityGroups.length}개 선택됨`;
  };

  useEffect(() => {
    getFacilityGroups();
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FormControl sx={{ flex: 1 }} size='small'>
        <Select
          multiple
          value={selectedFacilityGroups}
          onChange={handleChange}
          IconComponent={ExpandMoreIcon}
          displayEmpty
          disabled={loading}
          renderValue={() => getDisplayText()}
        >
          {loading ? (
            <MenuItem disabled value=''>
              로딩 중...
            </MenuItem>
          ) : facilityGroups && facilityGroups.length > 0 ? (
            facilityGroups.map((fg) => (
              <MenuItem key={fg.fg_idx} value={fg.fg_idx}>
                <Checkbox checked={selectedFacilityGroups.indexOf(fg.fg_idx) > -1} />
                <ListItemText primary={fg.fg_name} />
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled value=''>
              설비그룹이 없습니다.
            </MenuItem>
          )}
        </Select>
      </FormControl>
      {facilityGroups && facilityGroups.length > 0 && (
        <Button
          size='small'
          onClick={handleSelectAll}
          variant='outlined'
          sx={{
            color: '#666',
            borderColor: '#ccc',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          {selectedFacilityGroups.length === facilityGroups.length ? '전체 해제' : '전체 선택'}
        </Button>
      )}
    </Box>
  );
}
