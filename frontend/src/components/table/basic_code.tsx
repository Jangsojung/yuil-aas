import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Checkbox from '../../components/checkbox';

interface Sensor {
  sn_idx: number;
  sn_name: string;
}

export default function BasicTable({ sm_idx, fa_idx }) {
  const [sensors, setSensors] = React.useState<Sensor[]>([]);

  React.useEffect(() => {
    getSensors(fa_idx);
  }, []);

  const getSensors = async (fa_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/sensors?fa_idx=${fa_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: Sensor[] = await response.json();
      setSensors(data);
    } catch (err: any) {
      console.log(err.message);
    }
  };
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            {cells.map((cell) => (
              <TableCell>{cell}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sensors &&
            sensors.map((sensor, idx) => (
              <TableRow key={sensor.sn_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  Prop 1.{sm_idx}.{idx + 1}
                </TableCell>
                <TableCell>{sensor.sn_name}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const cells = ['Prop Num', '센서명'];
