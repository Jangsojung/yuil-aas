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
import {
  baseEditModeState,
  currentFactoryState,
  edgeGatewayRefreshState,
  selectedBasesState,
  selectedBaseState,
} from '../../recoil/atoms';
import Pagenation from '../../components/pagenation';

interface Base {
  ab_idx: number;
  ab_name: string;
  sn_length: number;
}

interface Props {
  insertMode: boolean;
  setInsertMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BasicTable({ insertMode, setInsertMode }: Props) {
  const currentFactory = useRecoilValue(currentFactoryState);
  const [bases, setBases] = React.useState<Base[]>([]);
  const [selectedBases, setSelectedBases] = useRecoilState(selectedBasesState);
  const [selectAll, setSelectAll] = React.useState(false);
  const refreshTrigger = useRecoilValue(edgeGatewayRefreshState);
  const [, setSelectedBase] = useRecoilState(selectedBaseState);
  const [, setBaseEditMode] = useRecoilState(baseEditModeState);

  React.useEffect(() => {
    getBases();
    setSelectedBases([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, currentFactory]);

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

  const handleDoubleClick = (base: Base) => {
    setSelectedBase(base);
    setBaseEditMode(true);
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

  const handleCheckboxChange = (baseIdx: number) => {
    setSelectedBases((prevSelected) => {
      if (prevSelected.includes(baseIdx)) {
        return prevSelected.filter((idx) => idx !== baseIdx);
      } else {
        return [...prevSelected, baseIdx];
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
              {cells.map((cell, idx) => (
                <TableCell key={idx}>{cell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bases ? (
              bases.map((base) => (
                <TableRow
                  key={base.ab_idx}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                  onDoubleClick={() => handleDoubleClick(base)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedBases.includes(base.ab_idx)}
                      onChange={() => handleCheckboxChange(base.ab_idx)}
                    />
                  </TableCell>
                  <TableCell>{base.ab_idx}</TableCell>
                  <TableCell>{base.ab_name}</TableCell>
                  <TableCell>{base.sn_length}</TableCell>
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

const cells = ['번호', '기초코드 이름', '센서'];
