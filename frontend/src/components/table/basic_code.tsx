import React, { useEffect, useState } from 'react';
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
import { useRecoilState, useRecoilValue } from 'recoil';
import { baseEditModeState, selectedBaseState, selectedSensorsState } from '../../recoil/atoms';

interface Sensor {
  sn_idx: number;
  sn_name: string;
}

interface Base {
  ab_idx: number;
  ab_name: string;
  sn_length: number;
}

export default function BasicTable({ sm_idx, fa_idx }) {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const baseEditMode = useRecoilValue(baseEditModeState);
  const selectedBase = useRecoilValue(selectedBaseState);

  const style = {
    width: '100%',
    bgcolor: 'background.paper',
    border: '1px solid #e0e0e0',
    borderRadius: 1,
  };

  const getSelectedSensors = async (selectedBase: Base) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/bases/sensors?ab_idx=${selectedBase.ab_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: { sn_idx: number }[] = await response.json();
      const sn_idx_list = data.map((sensor) => sensor.sn_idx);
      setSelectedSensors(sn_idx_list);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const getSensors = async (fa_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code/sensors?fa_idx=${fa_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data = await response.json();

      setSensors(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log(err.message);
      setSensors([]);
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
  if (sensors) {
    for (let i = 0; i < sensors.length; i += 6) {
      const rowSensors = sensors.slice(i, i + 6);
      rows.push(rowSensors);
    }
  }

  useEffect(() => {
    if (baseEditMode) {
      getSelectedSensors(selectedBase);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBase]);

  useEffect(() => {
    getSensors(fa_idx);
  }, [fa_idx]);

  useEffect(() => {
    if (fa_idx) {
      getSensors(fa_idx);
    }
  }, [fa_idx]);

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
                        <List sx={style} className='basic-checkbox'>
                          <Checkbox
                            checked={selectedSensors.includes(sensor.sn_idx)}
                            onChange={() => handleCheckboxChange(sensor.sn_idx)}
                          />
                          <div>
                            <ListItem>
                              <ListItemText secondary={sensor.sn_name} />
                            </ListItem>
                            <Divider variant='middle' component='li' />
                            <ListItem>
                              <ListItemText secondary={'Prop 1.' + sm_idx + '.' + (idx + 1)} />
                            </ListItem>
                          </div>
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
