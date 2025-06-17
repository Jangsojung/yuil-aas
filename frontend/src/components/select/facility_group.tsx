import React, { useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFacilityGroupState, selectedSensorsState } from '../../recoil/atoms';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FacilityGroup {
  fg_idx: number;
  fg_name: string;
}

interface Sensor {
  sn_idx: number;
  sn_name: string;
}

export default function SelectSmall() {
  const [groups, setGroups] = useState<FacilityGroup[]>([]);
  const [currentFacilityGroup, setCurrentFacilityGroup] = useRecoilState(currentFacilityGroupState);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [allSensorsInGroup, setAllSensorsInGroup] = useState<Sensor[]>([]);

  const getFacilityGroups = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/facilityGroups?fc_idx=3`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: FacilityGroup[] = await response.json();
      setGroups(data);

      if (data.length > 0) {
        setCurrentFacilityGroup(data[0].fg_idx);
      }
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const getAllSensorsInGroup = async (fg_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/allSensorsInGroup?fg_idx=${fg_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sensors');
      }

      const data: Sensor[] = await response.json();
      setAllSensorsInGroup(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log(err.message);
      setAllSensorsInGroup([]);
    }
  };

  const handleChange = (event: any) => {
    setCurrentFacilityGroup(event.target.value);
  };

  const handleSelectAllInGroup = (checked: boolean) => {
    if (checked) {
      const allSensorIds = allSensorsInGroup.map((sensor) => sensor.sn_idx);
      setSelectedSensors((prev) => {
        const newSelected = [...new Set([...prev, ...allSensorIds])];
        return newSelected;
      });
    } else {
      const groupSensorIds = allSensorsInGroup.map((sensor) => sensor.sn_idx);
      setSelectedSensors((prev) => prev.filter((id) => !groupSensorIds.includes(id)));
    }
  };

  const isAllInGroupSelected = () => {
    if (allSensorsInGroup.length === 0) return false;
    const groupSensorIds = allSensorsInGroup.map((sensor) => sensor.sn_idx);
    return groupSensorIds.every((id) => selectedSensors.includes(id));
  };

  const isPartiallySelected = () => {
    if (allSensorsInGroup.length === 0) return false;
    const groupSensorIds = allSensorsInGroup.map((sensor) => sensor.sn_idx);
    const selectedInGroup = groupSensorIds.filter((id) => selectedSensors.includes(id));
    return selectedInGroup.length > 0 && selectedInGroup.length < groupSensorIds.length;
  };

  useEffect(() => {
    getFacilityGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentFacilityGroup) {
      getAllSensorsInGroup(currentFacilityGroup);
    }
  }, [currentFacilityGroup]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
        <Select value={currentFacilityGroup} onChange={handleChange} IconComponent={ExpandMoreIcon}>
          {groups &&
            groups.map((group) => (
              <MenuItem key={group.fg_idx} value={group.fg_idx}>
                {group.fg_name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControlLabel
        control={
          <Checkbox
            checked={isAllInGroupSelected()}
            indeterminate={isPartiallySelected()}
            onChange={(e) => handleSelectAllInGroup(e.target.checked)}
          />
        }
        label='전체 선택'
      />
    </div>
  );
}
