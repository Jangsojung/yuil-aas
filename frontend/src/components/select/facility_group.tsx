import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFacilityGroupState, currentFactoryState } from '../../recoil/atoms';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface FacilityGroup {
  fg_idx: number;
  fg_name: string;
}

export default function SelectSmall() {
  const [groups, setGroups] = React.useState<FacilityGroup[]>([]);
  const currentFactory = useRecoilValue(currentFactoryState);
  const [currentFacilityGroup, setCurrentFacilityGroup] = useRecoilState(currentFacilityGroupState);

  React.useEffect(() => {
    if (currentFactory !== null) {
      getFacilityGroups(currentFactory);
    } else {
      getFacilityGroups(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFactory]);

  const getFacilityGroups = async (fc_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/facilityGroups?fc_idx=${fc_idx}`, {
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

  const handleChange = (event: any) => {
    setCurrentFacilityGroup(event.target.value);
  };

  return (
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
  );
}
