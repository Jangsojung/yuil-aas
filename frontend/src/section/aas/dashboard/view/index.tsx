import React from 'react';
import Grid from '@mui/system/Grid';
import Table from '../../../../components/table/basic_code';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RemoveIcon from '@mui/icons-material/Remove';

import { useRecoilValue } from 'recoil';
import { currentFacilityGroupState } from '../../../../recoil/atoms';

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

  React.useEffect(() => {
    if (currentFacilityGroup !== null) {
      getBasicCode(currentFacilityGroup);
    }
  }, [currentFacilityGroup]);

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
    } catch (err: any) {
      console.log(err.message);
    }
  };
  return (
    <div className="sensor-list-wrap">
      <div className="sensor-list">
        <div>
          <Grid container spacing={1} className='sensor-tit'>
            <div className="d-flex align-flex-end gap-10">
                온조기
                <span>Sub Modal 1.1</span>
            </div>
            <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
              <Button variant='outlined' color='primary'>
                <AddIcon />센서등록
              </Button>
              <Button variant='outlined' color='warning'>
                <EditIcon /> 센서수정
              </Button>
              <Button variant='outlined' color='error'>
                <RemoveIcon /> 센서삭제
              </Button>
            </Stack>
          </Grid>
          <Grid container spacing={1}>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          <Grid container spacing={1}>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
            <Grid size={2}>
              <List sx={style}>
                <ListItem>
                  <ListItemText secondary="온조기 현재온도(PV)" />
                </ListItem>
                <Divider variant="middle" component="li" />
                <ListItem>
                  <ListItemText secondary="Prop 1.1.1" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </div>
      </div>
      <div className='sensor-list'>
        {basics &&
          basics.map((basic, idx) => (
            <div>
              <Grid container spacing={1} className='sensor-tit'>
                <Grid size={2}>{basic.fa_name}</Grid>
                <Grid size={10}>Sub Modal 1.{idx + 1}</Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <Table sm_idx={idx + 1} fa_idx={basic.fa_idx} />
                </Grid>
              </Grid>
            </div>
          ))}
      </div>
    </div>
  );
}
