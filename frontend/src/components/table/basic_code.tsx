import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import { useRecoilState } from 'recoil';
import { selectedSensorsState } from '../../recoil/atoms';

interface Sensor {
  sn_idx: number;
  sn_name: string;
}

export default function BasicTable({ sm_idx, fa_idx }) {
  const [sensors, setSensors] = React.useState<Sensor[]>([]);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);

  const style = {
    width: '100%',
    bgcolor: 'background.paper',
    border: '1px solid #e0e0e0',
    borderRadius: 1,
  };

  React.useEffect(() => {
    getSensors(fa_idx);
  }, [fa_idx]);

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

  const handleCheckboxChange = (fileIdx: number) => {
    setSelectedSensors((prevSelected) => {
      if (prevSelected.includes(fileIdx)) {
        return prevSelected.filter((idx) => idx !== fileIdx);
      } else {
        return [...prevSelected, fileIdx];
      }
    });
  };

  const rows = [];
  for (let i = 0; i < sensors.length; i += 6) {
    const rowSensors = sensors.slice(i, i + 6);
    rows.push(rowSensors);
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableBody>
          {rows.map((rowSensors, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell colSpan={3}>
                <Grid container spacing={1}>
                  {rowSensors &&
                    rowSensors.map((sensor, idx) => (
                      <Grid item xs={2} key={sensor.sn_idx}>
                        <List sx={style}>
                          <ListItem>
                            <Checkbox
                              checked={selectedSensors.includes(sensor.sn_idx)}
                              onChange={() => handleCheckboxChange(sensor.sn_idx)}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText secondary={sensor.sn_name} />
                          </ListItem>
                          <Divider variant='middle' component='li' />
                          <ListItem>
                            <ListItemText secondary={'Prop 1.' + sm_idx + '.' + (idx + 1)} />
                          </ListItem>
                        </List>
                      </Grid>
                    ))}
                </Grid>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
