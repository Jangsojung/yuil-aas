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

interface Base {
  ab_idx: number;
  ab_name: string;
  sn_length: number;
}

export default function BasicTable() {
  const currentFactory = useRecoilValue(currentFactoryState);
  const [bases, setBases] = React.useState<Base[]>([]);
  const [selectedConvert, setSelectedConvert] = useRecoilState(selectedConvertsState);
  const [selectAll, setSelectAll] = React.useState(false);

  React.useEffect(() => {
    if (currentFactory !== null) {
      getBases();
    }
  }, [currentFactory]);

  // const getFacilityGroups = async (fc_idx: number) => {
  //   try {
  //     const response = await fetch(`http://localhost:5001/api/base_code/facilityGroups?fc_idx=${fc_idx}&order=desc`, {
  //       method: 'GET',
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch detections');
  //     }

  //     const data: FacilityGroup[] = await response.json();
  //     setGroups(data);
  //   } catch (err: any) {
  //     console.log(err.message);
  //   }
  // };

  const getBases = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: Base[] = await response.json();
      setBases(data);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleCheckboxChange = (convertsIdx: number) => {
    setSelectedConvert((prev) => (prev === convertsIdx ? null : convertsIdx));
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {cells.map((cell) => (
                <TableCell>{cell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bases &&
              bases.map((base) => (
                <TableRow key={base.ab_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedConvert === base.ab_idx}
                      onChange={() => handleCheckboxChange(base.ab_idx)}
                    />
                  </TableCell>
                  <TableCell>{base.ab_idx}</TableCell>
                  <TableCell>{base.ab_name}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagenation count={bases ? bases.length : 0} />
    </>
  );
}

const cells = ['번호', '기초코드 이름'];
