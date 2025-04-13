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
import TextField from '@mui/material/TextField';
import { useRecoilState } from 'recoil';
import { selectedSensorsState } from '../../recoil/atoms';

interface Sensor {
  sn_idx: number;
  sn_name: string;
}

export default function BasicTable({ sm_idx, fa_idx, isEditMode = false, isAddMode = false, onSensorAdded }) {
  const [sensors, setSensors] = React.useState<Sensor[]>([]);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [editedSensors, setEditedSensors] = React.useState<Sensor[]>([]);
  const [newSensor, setNewSensor] = React.useState<string>('');
  const [newSensorIdx, setNewSensorIdx] = React.useState<number>();

  const style = {
    width: '100%',
    bgcolor: 'background.paper',
    border: '1px solid #e0e0e0',
    borderRadius: 1,
  };

  React.useEffect(() => {
    getSensors(fa_idx);
  }, [fa_idx]);

  React.useEffect(() => {
    setEditedSensors([...sensors]);
  }, [sensors]);

  React.useEffect(() => {
    if (isEditMode === false) {
      handleSaveSensors();
    }
  }, [isEditMode]);

  React.useEffect(() => {
    const addSensorHandler = () => {
      if (isAddMode) {
        handleAddSensor();
      }
    };

    document.addEventListener(`add-sensor-${fa_idx}`, addSensorHandler);

    return () => {
      document.removeEventListener(`add-sensor-${fa_idx}`, addSensorHandler);
    };
  }, [fa_idx, isAddMode, newSensor, newSensorIdx]);

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

  const handleSaveSensors = async () => {
    try {
      const updatePromises = editedSensors.map(async (sensor) => {
        const response = await fetch(`http://localhost:5001/api/base_code/sensors`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sn_idx: sensor.sn_idx,
            sn_name: sensor.sn_name,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to edit Sensor: ${sensor.sn_idx}`);
        }

        return response;
      });

      await Promise.all(updatePromises);
      setSensors([...editedSensors]);
      console.log('Sensors updated successfully');
    } catch (err: any) {
      console.log('Error updating sensors:', err.message);
    }
  };

  const handleAddSensor = async () => {
    if (!newSensor.trim() || newSensorIdx === -1 || isNaN(Number(newSensorIdx))) {
      alert('센서 이름과 인덱스를 모두 입력해주세요');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/base_code/sensors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sn_idx: Number(newSensorIdx),
          fa_idx: fa_idx,
          sn_name: newSensor,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add new sensor');
      }

      const addedSensor = await response.json();

      setSensors((prev) => [...prev, addedSensor]);
      setNewSensor('');
      setNewSensorIdx(-1);

      if (onSensorAdded) {
        onSensorAdded();
      }

      console.log('Sensor added successfully');
    } catch (err: any) {
      console.log('Error adding sensor:', err.message);
    }
  };

  const handleSensorNameChange = (sn_idx: number, newName: string) => {
    setEditedSensors((prev) =>
      prev.map((sensor) => (sensor.sn_idx === sn_idx ? { ...sensor, sn_name: newName } : sensor))
    );
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
                            {isEditMode ? (
                              <TextField
                                size='small'
                                fullWidth
                                value={editedSensors.find((s) => s.sn_idx === sensor.sn_idx)?.sn_name || ''}
                                onChange={(e) => handleSensorNameChange(sensor.sn_idx, e.target.value)}
                              />
                            ) : (
                              <ListItemText secondary={sensor.sn_name} />
                            )}
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
          {isAddMode && (
            <TableRow>
              <TableCell colSpan={3}>
                <Grid container spacing={1}>
                  <Grid item xs={2}>
                    <List sx={style}>
                      <ListItem>
                        <Checkbox disabled />
                      </ListItem>
                      <ListItem>
                        <TextField
                          size='small'
                          fullWidth
                          placeholder='새 센서 이름'
                          value={newSensor}
                          onChange={(e) => setNewSensor(e.target.value)}
                        />
                      </ListItem>
                      <ListItem>
                        <TextField
                          size='small'
                          type='number'
                          fullWidth
                          placeholder='새 센서 인덱스'
                          value={newSensorIdx}
                          onChange={(e) => setNewSensorIdx(Number(e.target.value))}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
