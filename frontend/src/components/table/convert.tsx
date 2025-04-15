import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';

import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFactoryState, selectedConvertsState } from '../../recoil/atoms';
import Pagenation from '../../components/pagenation';

interface FacilityGroup {
  fg_idx: number;
  fg_name: string;
}

export default function BasicTable() {
  const currentFactory = useRecoilValue(currentFactoryState);
  const [groups, setGroups] = React.useState<FacilityGroup[]>([]);
  const [selectedConverts, setSelectedConverts] = useRecoilState(selectedConvertsState);
  const [selectAll, setSelectAll] = React.useState(false);

  React.useEffect(() => {
    if (currentFactory !== null) {
      getFacilityGroups(currentFactory);
    }
  }, [currentFactory]);

  React.useEffect(() => {
    if (selectedConverts.length === 0) {
      setSelectAll(false);
    } else if (selectedConverts.length === groups.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedConverts, groups]);

  const getFacilityGroups = async (fc_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/facilityGroups?fc_idx=${fc_idx}&order=desc`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: FacilityGroup[] = await response.json();
      setGroups(data);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedConverts(groups.map((group) => group.fg_idx));
    } else {
      setSelectedConverts([]);
    }
  };

  const handleCheckboxChange = (convertsIdx: number) => {
    setSelectedConverts((prevSelected) => {
      if (prevSelected.includes(convertsIdx)) {
        return prevSelected.filter((idx) => idx !== convertsIdx);
      } else {
        return [...prevSelected, convertsIdx];
      }
    });
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox checked={selectAll} onChange={handleSelectAllChange} />
              </TableCell>
              {cells.map((cell) => (
                <TableCell>{cell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {groups &&
              groups.map((group) => (
                <TableRow key={group.fg_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedConverts.includes(group.fg_idx)}
                      onChange={() => handleCheckboxChange(group.fg_idx)}
                    />
                  </TableCell>
                  <TableCell>{group.fg_idx}</TableCell>
                  <TableCell>{group.fg_name}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagenation count={groups ? groups.length : 0} />
    </>
  );
}

const cells = ['번호', '설비그룹 이름'];
