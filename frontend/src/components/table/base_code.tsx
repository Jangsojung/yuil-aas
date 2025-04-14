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
import { currentFactoryState, selectedConvertsState as selectedBasesState } from '../../recoil/atoms';
import Pagenation from '../../components/pagenation';

interface Base {
  ab_idx: number;
  ab_name: string;
}

export default function BasicTable() {
  const currentFactory = useRecoilValue(currentFactoryState);
  const [bases, setBases] = React.useState<Base[]>([]);
  const [selectedBases, setSelectedBases] = useRecoilState(selectedBasesState);
  const [selectAll, setSelectAll] = React.useState(false);

  React.useEffect(() => {
    getBases();
  }, [currentFactory]);

  React.useEffect(() => {
    if (selectedBases.length === 0) {
      setSelectAll(false);
    } else if (selectedBases.length === bases.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedBases, bases]);

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

  const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedBases(bases.map((base) => base.ab_idx));
    } else {
      setSelectedBases([]);
    }
  };

  const handleCheckboxChange = (convertsIdx: number) => {
    setSelectedBases((prevSelected) => {
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
            {bases ? (
              bases.map((base) => (
                <TableRow key={base.ab_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedBases.includes(base.ab_idx)}
                      onChange={() => handleCheckboxChange(base.ab_idx)}
                    />
                  </TableCell>
                  <TableCell>{base.ab_idx}</TableCell>
                  <TableCell>{base.ab_name}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={cells.length + 1} align='center'>
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagenation count={bases ? bases.length : 0} />
    </>
  );
}

const cells = ['IDX', '기초코드 이름', 'sensor idx 개수'];
