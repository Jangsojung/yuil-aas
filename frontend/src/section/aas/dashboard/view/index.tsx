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
  shouldSaveChangesState,
} from '../../../../recoil/atoms';
import { TextField } from '@mui/material';

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

interface Facility {
  fa_idx: number;
  fa_name: string;
}

export default function BasicCode() {
  const currentFacilityGroup = useRecoilValue(currentFacilityGroupState);
  const [basics, setBasics] = React.useState<Basic[]>([]);
  const [hasBasics, setHasBasics] = useRecoilState(hasBasicsState);
  const [selectedFacilities, setSelectedFacilities] = useRecoilState(selectedFacilitiesState);
  const [shouldSaveChanges, setShouldSaveChanges] = useRecoilState(shouldSaveChangesState);
  const [editSensorStates, setEditSensorStates] = React.useState<{ [key: number]: boolean }>({});

  const isEditing = useRecoilValue(isEditModeState);
  const [editedBasics, setEditedBasics] = React.useState<Basic[]>([]);

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

  const getBasicCode = async (fg_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/base_code?fg_idx=${fg_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: Basic[] = await response.json();
      console.log(data);

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

  const handleNameChange = (fa_idx: number, newName: string) => {
    setEditedBasics((prev) =>
      prev.map((facility) => (facility.fa_idx === fa_idx ? { ...facility, fa_name: newName } : facility))
    );
  };

  const toggleEditSensor = (fa_idx: number) => {
    setEditSensorStates((prevState) => {
      const newState = {
        ...prevState,
        [fa_idx]: !prevState[fa_idx],
      };

      return newState;
    });
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
                  <Button variant='outlined' color='primary'>
                    <AddIcon />
                    센서등록
                  </Button>
                  {!editSensorStates[basic.fa_idx] ? (
                    <Button variant='outlined' color='warning' onClick={() => toggleEditSensor(basic.fa_idx)}>
                      <EditIcon /> 센서수정
                    </Button>
                  ) : (
                    <Button variant='outlined' color='success' onClick={() => toggleEditSensor(basic.fa_idx)}>
                      <SaveIcon /> 수정완료
                    </Button>
                  )}
                  <Button variant='outlined' color='error'>
                    <RemoveIcon /> 센서삭제
                  </Button>
                </Stack>
              </Grid>
              <Table sm_idx={idx + 1} fa_idx={basic.fa_idx} isEditMode={editSensorStates[basic.fa_idx] || false} />
            </div>
          ))}
      </div>
    </div>
  );
}
