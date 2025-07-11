import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { getFacilityGroupsAPI } from '../../apis/api/basic';

interface FacilityGroup {
  fg_idx: number;
  fg_name: string;
}

type Props = {
  selectedFacilityGroups: number[];
  setSelectedFacilityGroups: Dispatch<SetStateAction<number[]>>;
  selectedFactory?: number | '';
  refreshKey?: number;
};

export default function FacilityGroupSelect({
  selectedFacilityGroups,
  setSelectedFacilityGroups,
  selectedFactory,
  refreshKey = 0,
}: Props) {
  const [facilityGroups, setFacilityGroups] = useState<FacilityGroup[]>([]);

  const getFacilityGroups = async (fc_idx?: number) => {
    try {
      // 공장이 선택되지 않았으면 빈 배열 반환
      if (!fc_idx) {
        setFacilityGroups([]);
        return;
      }

      const data = await getFacilityGroupsAPI(fc_idx);
      setFacilityGroups(data);
    } catch (error) {
      setFacilityGroups([]);
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

  const handleIndividualSelect = (fg_idx: number) => {
    const isSelected = selectedFacilityGroups.includes(fg_idx);
    if (isSelected) {
      setSelectedFacilityGroups(selectedFacilityGroups.filter((id) => id !== fg_idx));
    } else {
      setSelectedFacilityGroups([...selectedFacilityGroups, fg_idx]);
    }
  };

  const getDisplayText = () => {
    if (selectedFacilityGroups.length === 0) {
      return '선택';
    }
    if (selectedFacilityGroups.length === 1) {
      const selected = facilityGroups.find((fg) => fg.fg_idx === selectedFacilityGroups[0]);
      return selected ? selected.fg_name : '선택';
    }
    return `${selectedFacilityGroups.length}개 선택됨`;
  };

  const isAllSelected = selectedFacilityGroups.length === facilityGroups.length && facilityGroups.length > 0;

  useEffect(() => {
    getFacilityGroups(selectedFactory as number);
  }, [selectedFactory, refreshKey]);

  return (
    <FormControl fullWidth size='small'>
      <Select
        multiple
        value={selectedFacilityGroups}
        onChange={handleChange}
        IconComponent={ExpandMoreIcon}
        displayEmpty
        renderValue={() => getDisplayText()}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 500,
            },
          },
        }}
      >
        {facilityGroups && facilityGroups.length > 0 ? (
          <>
            {/* 전체선택 체크박스 */}
            <MenuItem
              sx={{
                backgroundColor: '#f5f5f5',
                '&:hover': {
                  backgroundColor: '#e8e8e8',
                },
              }}
            >
              <Checkbox checked={isAllSelected} onChange={handleSelectAll} />
              <ListItemText
                primary='전체 선택'
                primaryTypographyProps={{
                  fontWeight: 'bold',
                  color: '#666',
                }}
              />
            </MenuItem>
            <Divider />
            {/* 개별 설비그룹 체크박스들 */}
            {facilityGroups.map((fg) => (
              <MenuItem key={fg.fg_idx} value={fg.fg_idx}>
                <Checkbox
                  checked={selectedFacilityGroups.includes(fg.fg_idx)}
                  onChange={() => handleIndividualSelect(fg.fg_idx)}
                />
                <ListItemText primary={fg.fg_name} />
              </MenuItem>
            ))}
          </>
        ) : (
          <MenuItem disabled value=''>
            해당 공장에 설비그룹이 없습니다.
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
