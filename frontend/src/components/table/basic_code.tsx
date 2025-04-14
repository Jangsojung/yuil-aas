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
import { DELETE_SENSOR_EVENT } from '../../section/aas/dashboard/view';

interface Sensor {
  sn_idx: number;
  sn_name: string;
}

export default function BasicTable({ sm_idx, fa_idx, isEditMode = false, isAddMode = false, onSensorAdded }) {
  const [sensors, setSensors] = React.useState<Sensor[]>([]);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [editedSensors, setEditedSensors] = React.useState<Sensor[]>([]);
  const [newSensor, setNewSensor] = React.useState<string>('');
  const [newSensorIdx, setNewSensorIdx] = React.useState<number>(-1);

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
    if (sensors) {
      setEditedSensors([...sensors]);
    }
  }, [sensors]);

  React.useEffect(() => {
    if (isEditMode === false) {
      handleSaveSensors();
    }
  }, [isEditMode]);

  React.useEffect(() => {
    setSensors([]);
    setEditedSensors([]);
    setNewSensor('');
    setNewSensorIdx(-1);

    if (fa_idx) {
      getSensors(fa_idx);
    }
  }, [fa_idx]);

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
  }, [fa_idx, isAddMode]);

  React.useEffect(() => {
    const handleDeleteSensorEvent = (event) => {
      const eventFaIdx = event.detail?.fa_idx;

      if (eventFaIdx === fa_idx) {
        deleteSelectedSensors();
      }
    };

    document.addEventListener(DELETE_SENSOR_EVENT, handleDeleteSensorEvent);

    return () => {
      document.removeEventListener(DELETE_SENSOR_EVENT, handleDeleteSensorEvent);
    };
  }, [fa_idx, selectedSensors]);

  const deleteSelectedSensors = async () => {
    if (selectedSensors.length === 0) return;

    try {
      const deletePromises = selectedSensors.map(async (sn_idx) => {
        const response = await fetch(`http://localhost:5001/api/base_code/sensors`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sn_idx: sn_idx,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to delete Sensor: ${sn_idx}`);
        }

        return sn_idx;
      });

      const deletedIds = await Promise.all(deletePromises);
      console.log('Deleted sensor IDs:', deletedIds);

      const sensorIdsToRemove = selectedSensors.filter((id) => sensors.some((sensor) => sensor.sn_idx === id));

      setSensors((prev) => prev.filter((sensor) => !sensorIdsToRemove.includes(sensor.sn_idx)));

      setSelectedSensors((prev) => prev.filter((id) => !sensorIdsToRemove.includes(id)));

      console.log('센서가 성공적으로 삭제되었습니다.');
    } catch (err: any) {
      console.error('Error deleting sensors:', err.message);
      alert('센서 삭제 중 오류가 발생했습니다: ' + err.message);
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
    console.log('센서 추가 시도:', {
      name: newSensor,
      nameType: typeof newSensor,
      idx: newSensorIdx,
      idxType: typeof newSensorIdx,
    });

    if (!newSensor.trim() || !newSensorIdx || isNaN(Number(newSensorIdx))) {
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
      console.log('Added sensor:', addedSensor);

      if (addedSensor && addedSensor.sn_idx && addedSensor.sn_name) {
        setSensors((prev) => (Array.isArray(prev) ? [...prev, addedSensor] : [addedSensor]));
        setNewSensor('');
        setNewSensorIdx(-1);

        if (onSensorAdded) {
          onSensorAdded();
        }

        console.log('Sensor added successfully');
      } else {
        console.error('Invalid sensor data received from server:', addedSensor);
        alert('센서 데이터가 유효하지 않습니다. 다시 시도해주세요.');
      }
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
  if (sensors) {
    for (let i = 0; i < sensors.length; i += 6) {
      const rowSensors = sensors.slice(i, i + 6);
      rows.push(rowSensors);
    }
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
