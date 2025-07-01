import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { getFacilityGroupsAPI } from '../../apis/api/basic';

interface FacilityGroup {
  fg_idx: number;
  fg_name: string;
}

type Props = {
  selectedFacilityGroups: number[];
  setSelectedFacilityGroups: Dispatch<SetStateAction<number[]>>;
  selectedFactory?: number | '';
};

export default function FacilityGroupSelect({
  selectedFacilityGroups,
  setSelectedFacilityGroups,
  selectedFactory,
}: Props) {
  const [facilityGroups, setFacilityGroups] = useState<FacilityGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const getFacilityGroups = async (fc_idx?: number) => {
    setLoading(true);
    try {
      // 공장이 선택되지 않았으면 빈 배열 반환
      if (!fc_idx) {
        setFacilityGroups([]);
        return;
      }

      const data = await getFacilityGroupsAPI(fc_idx);
      setFacilityGroups(data);
    } catch (error) {
      console.error('Error fetching facility groups:', error);
      setFacilityGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: any) => {
    const value = event.target.value;
    setSelectedFacilityGroups(value);
  };

  const handleSelectAll = () => {
    if (selectedFacilityGroups.length === facilityGroups.length) {
      setSelectedFacilityGroups([]);
    } else {
      setSelectedFacilityGroups(facilityGroups.map((fg) => fg.fg_idx));
    }
  };

  const getDisplayText = () => {
    if (selectedFacilityGroups.length === 0) {
      return '선택 없음';
    }
    if (selectedFacilityGroups.length === 1) {
      const selected = facilityGroups.find((fg) => fg.fg_idx === selectedFacilityGroups[0]);
      return selected ? selected.fg_name : '선택 없음';
    }
    return `${selectedFacilityGroups.length}개 선택됨`;
  };

  useEffect(() => {
    getFacilityGroups(selectedFactory as number);
  }, [selectedFactory]);

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
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 500,
              },
            },
          }}
        >
          {loading ? (
            <MenuItem disabled value=''>
              로딩 중...
            </MenuItem>
          ) : !selectedFactory ? (
            <MenuItem disabled value=''>
              공장을 먼저 선택해주세요.
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
              해당 공장에 설비그룹이 없습니다.
            </MenuItem>
          )}
        </Select>
      </FormControl>
      {selectedFactory && facilityGroups && facilityGroups.length > 0 && (
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
