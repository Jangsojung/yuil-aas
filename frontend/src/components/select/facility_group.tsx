import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FacilityGroup {
  fg_idx: number;
  fg_name: string;
}

type Props = {
  selectedFacilityGroup: number | '';
  setSelectedFacilityGroup: Dispatch<SetStateAction<number | ''>>;
  onFacilityGroupChange?: () => void;
};

export default function FacilityGroupSelect({
  selectedFacilityGroup,
  setSelectedFacilityGroup,
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
    const selectedId = event.target.value;
    setSelectedFacilityGroup(selectedId);
    if (onFacilityGroupChange) {
      onFacilityGroupChange();
    }
  };

  useEffect(() => {
    getFacilityGroups();
  }, []);

  return (
    <FormControl sx={{ m: 1, width: '100%' }} size='small'>
      <Select
        value={selectedFacilityGroup}
        onChange={handleChange}
        IconComponent={ExpandMoreIcon}
        displayEmpty
        disabled={loading}
      >
        <MenuItem value=''>전체</MenuItem>
        {loading ? (
          <MenuItem disabled value=''>
            로딩 중...
          </MenuItem>
        ) : facilityGroups && facilityGroups.length > 0 ? (
          facilityGroups.map((fg) => (
            <MenuItem key={fg.fg_idx} value={fg.fg_idx}>
              {fg.fg_name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled value=''>
            설비그룹이 없습니다.
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
