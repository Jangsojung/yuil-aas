import React from 'react';
import Grid from '@mui/system/Grid';
import Table from '../../../../components/table/basic_code';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import Checkbox from '@mui/material/Checkbox';

import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentFacilityGroupState,
  hasBasicsState,
  isEditModeState,
  selectedFacilitiesState,
  selectedSensorsState,
  shouldSaveChangesState,
} from '../../../../recoil/atoms';
import { TextField } from '@mui/material';
import { ADD_EQUIPMENT_EVENT, DELETE_EQUIPMENT_EVENT } from '../../../../layouts/sort/basic_code';

const DELETE_SENSOR_EVENT = 'delete-sensor';

const style = {
  py: 0,
  width: '100%',
  maxWidth: 360,
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'background.paper',
};

interface Basic {
  fa_idx: number;
  fa_name: string;
}

export default function BasicCode() {
  const currentFacilityGroup = useRecoilValue(currentFacilityGroupState);
  const [basics, setBasics] = React.useState<Basic[]>([]);
  const [hasBasics, setHasBasics] = useRecoilState(hasBasicsState);
  const [selectedFacilities, setSelectedFacilities] = useRecoilState(selectedFacilitiesState);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [shouldSaveChanges, setShouldSaveChanges] = useRecoilState(shouldSaveChangesState);
  const [editSensorStates, setEditSensorStates] = React.useState<{ [key: number]: boolean }>({});
  const [addSensorStates, setAddSensorStates] = React.useState<{ [key: number]: boolean }>({});
  const [isAddingEquipment, setIsAddingEquipment] = React.useState(false);
  const [newEquipment, setNewEquipment] = React.useState({ fa_idx: '', fa_name: '' });

  const isEditing = useRecoilValue(isEditModeState);
  const [editedBasics, setEditedBasics] = React.useState<Basic[]>([]);
  const tableRefs = React.useRef({});

  React.useEffect(() => {
    if (currentFacilityGroup !== null) {
      getBasicCode(currentFacilityGroup);
    }
  }, [currentFacilityGroup]);

  React.useEffect(() => {
    setEditedBasics([...basics]);
  }, [basics]);

  React.useEffect(() => {
    if (shouldSaveChanges) {
      handleSaveChanges();
      setShouldSaveChanges(false);
    }
  }, [shouldSaveChanges]);

  React.useEffect(() => {
    const handleAddEquipmentEvent = () => {
      setIsAddingEquipment(true);
    };

    document.addEventListener(ADD_EQUIPMENT_EVENT, handleAddEquipmentEvent);

    return () => {
      document.removeEventListener(ADD_EQUIPMENT_EVENT, handleAddEquipmentEvent);
    };
  }, []);

  React.useEffect(() => {
    const handleDeleteEquipmentEvent = () => {
      deleteSelectedEquipment();
    };

    document.addEventListener(DELETE_EQUIPMENT_EVENT, handleDeleteEquipmentEvent);

    return () => {
      document.removeEventListener(DELETE_EQUIPMENT_EVENT, handleDeleteEquipmentEvent);
    };
  }, [selectedFacilities, currentFacilityGroup]);

  const deleteSelectedEquipment = async () => {
    if (selectedFacilities.length === 0) return;

    try {
      const deletePromises = selectedFacilities.map(async (fa_idx) => {
        const response = await fetch(`http://localhost:5001/api/base_code`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fa_idx: fa_idx,
            fg_idx: currentFacilityGroup,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to delete Equipment: ${fa_idx}`);
        }

        return fa_idx;
      });

      const deletedIds = await Promise.all(deletePromises);
      console.log('Deleted equipment IDs:', deletedIds);

      setBasics(basics.filter((basic) => !selectedFacilities.includes(basic.fa_idx)));

      setSelectedFacilities([]);

      if (basics.length - deletedIds.length === 0) {
        setHasBasics(false);
      }

      alert('선택한 장비가 성공적으로 삭제되었습니다.');
    } catch (err: any) {
      console.error('Error deleting equipment:', err.message);
      alert('장비 삭제 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const handleAddSensorComplete = (fa_idx: number) => {
    document.dispatchEvent(new CustomEvent(`add-sensor-${fa_idx}`));

    setTimeout(() => {
      toggleAddSensor(fa_idx);
    }, 300);
  };

  const getBasicCode = async (fg_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code?fg_idx=${fg_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: Basic[] = await response.json();

      setBasics(data);
      setHasBasics(data !== null && data.length > 0);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updatePromises = editedBasics.map(async (facility) => {
        const response = await fetch(`http://localhost:5001/api/base_code?fg_idx=${currentFacilityGroup}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fa_idx: facility.fa_idx,
            fa_name: facility.fa_name,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to edit Facility: ${facility.fa_idx}`);
        }

        return response;
      });

      await Promise.all(updatePromises);

      setBasics([...editedBasics]);

      console.log('Facilities updated successfully');
    } catch (err: any) {
      console.log('Error updating facilities:', err.message);
    }
  };

  const handleDeleteSensor = (fa_idx: number) => {
    if (selectedSensors.length === 0) return;

    if (window.confirm(`선택한 ${selectedSensors.length}개의 센서를 삭제하시겠습니까?`)) {
      document.dispatchEvent(
        new CustomEvent(DELETE_SENSOR_EVENT, {
          detail: { fa_idx },
        })
      );
    }
  };

  const handleNameChange = (fa_idx: number, newName: string) => {
    setEditedBasics((prev) =>
      prev.map((facility) => (facility.fa_idx === fa_idx ? { ...facility, fa_name: newName } : facility))
    );
  };

  const toggleEditSensor = (fa_idx: number) => {
    setAddSensorStates((prevState) => {
      const newState = {
        ...prevState,
        [fa_idx]: !prevState[fa_idx],
      };

      if (prevState[fa_idx] && tableRefs.current[fa_idx]) {
        tableRefs.current[fa_idx].handleAddSensor();
      }

      return newState;
    });
  };

  const toggleAddSensor = (fa_idx: number) => {
    setAddSensorStates((prevState) => {
      const newState = {
        ...prevState,
        [fa_idx]: !prevState[fa_idx],
      };

      return newState;
    });
  };

  const handleSensorAdded = (fa_idx: number) => {
    toggleAddSensor(fa_idx);
  };

  const handleCheckboxChange = (fileIdx: number) => {
    setSelectedFacilities((prevSelected) => {
      if (prevSelected.includes(fileIdx)) {
        return prevSelected.filter((idx) => idx !== fileIdx);
      } else {
        return [...prevSelected, fileIdx];
      }
    });
  };

  const handleSaveNewEquipment = async () => {
    if (!newEquipment.fa_name.trim() || !newEquipment.fa_idx || isNaN(Number(newEquipment.fa_idx))) {
      alert('시설 이름과 인덱스를 모두 올바르게 입력해주세요');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/base_code?fg_idx=${currentFacilityGroup}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fa_idx: Number(newEquipment.fa_idx),
          fa_name: newEquipment.fa_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add new equipment');
      }

      const newEquipmentObj = {
        fa_idx: Number(newEquipment.fa_idx),
        fa_name: newEquipment.fa_name,
      };

      setBasics((prev) => [...prev, newEquipmentObj]);
      setIsAddingEquipment(false);
      setNewEquipment({ fa_idx: '', fa_name: '' });

      document.dispatchEvent(new CustomEvent('equipment-added'));

      console.log('Equipment added successfully');
    } catch (err: any) {
      console.error('Error adding equipment:', err.message);
      alert('장비 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleCancelAdd = () => {
    setIsAddingEquipment(false);
    setNewEquipment({ fa_idx: '', fa_name: '' });

    document.dispatchEvent(new CustomEvent('equipment-added'));
  };

  return (
    <div className='sensor-list-wrap'>
      <div className='sensor-list'></div>
      <div className='sensor-list'>
        {basics &&
          basics.map((basic, idx) => (
            <div key={basic.fa_idx}>
              <Grid container spacing={1} className='sensor-tit'>
                <div className='d-flex align-flex-end gap-10'>
                  <Checkbox
                    checked={selectedFacilities.includes(basic.fa_idx)}
                    onChange={() => handleCheckboxChange(basic.fa_idx)}
                  />
                  {isEditing ? (
                    <TextField
                      size='small'
                      value={editedBasics.find((item) => item.fa_idx === basic.fa_idx)?.fa_name || ''}
                      onChange={(e) => handleNameChange(basic.fa_idx, e.target.value)}
                      autoFocus={idx === 0}
                    />
                  ) : (
                    basic.fa_name
                  )}
                  <span>Sub Modal 1.{idx + 1}</span>
                </div>

                <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                  {!addSensorStates[basic.fa_idx] ? (
                    <Button
                      variant='outlined'
                      color='primary'
                      onClick={() => toggleAddSensor(basic.fa_idx)}
                      disabled={editSensorStates[basic.fa_idx]}
                    >
                      <AddIcon />
                      센서등록
                    </Button>
                  ) : (
                    <Button variant='outlined' color='success' onClick={() => handleAddSensorComplete(basic.fa_idx)}>
                      <SaveIcon /> 등록완료
                    </Button>
                  )}
                  {!editSensorStates[basic.fa_idx] ? (
                    <Button variant='outlined' color='warning' onClick={() => toggleEditSensor(basic.fa_idx)}>
                      <EditIcon /> 센서수정
                    </Button>
                  ) : (
                    <Button variant='outlined' color='success' onClick={() => toggleEditSensor(basic.fa_idx)}>
                      <SaveIcon /> 수정완료
                    </Button>
                  )}
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => handleDeleteSensor(basic.fa_idx)}
                    disabled={selectedSensors.length === 0}
                  >
                    <RemoveIcon /> 센서삭제
                  </Button>
                </Stack>
              </Grid>
              <Table
                sm_idx={idx + 1}
                fa_idx={basic.fa_idx}
                isEditMode={editSensorStates[basic.fa_idx] || false}
                isAddMode={addSensorStates[basic.fa_idx] || false}
                onSensorAdded={() => handleSensorAdded(basic.fa_idx)}
              />
            </div>
          ))}

        {isAddingEquipment && (
          <div>
            <Grid container spacing={1} className='sensor-tit'>
              <div className='d-flex align-flex-end gap-10'>
                <Checkbox disabled />
                <TextField
                  size='small'
                  value={newEquipment.fa_name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, fa_name: e.target.value })}
                  placeholder='장비 이름을 입력하세요'
                  autoFocus
                />
                <TextField
                  size='small'
                  type='number'
                  value={newEquipment.fa_idx}
                  onChange={(e) => setNewEquipment({ ...newEquipment, fa_idx: e.target.value })}
                  placeholder='장비 인덱스를 입력하세요'
                  style={{ width: '150px' }}
                />
              </div>

              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='outlined' color='success' onClick={handleSaveNewEquipment}>
                  <SaveIcon /> 등록완료
                </Button>
                <Button variant='outlined' color='error' onClick={handleCancelAdd}>
                  <RemoveIcon /> 취소
                </Button>
              </Stack>
            </Grid>
          </div>
        )}
      </div>
    </div>
  );
}

export { DELETE_SENSOR_EVENT };
