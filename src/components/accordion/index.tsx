import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';

import Grid from '@mui/system/Grid';
import Table from '../../components/table'

export default function AccordionUsage() {
  return (
    <div className="accordion-group">
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography component="span">1호기</Typography>
        </AccordionSummary>
        <AccordionDetails className="sensor-list">
            <div>
                <Grid container spacing={1} className="sensor-tit">
                    <Grid size={2}>
                        온조기
                    </Grid>
                    <Grid size={10}>
                        Sub Modal 1.1
                    </Grid>
                </Grid>

                <Grid container spacing={1}>
                    <Grid size={2}>
                        센서
                    </Grid>
                    <Grid size={10}>
                        <Table />
                    </Grid>
                </Grid>
            </div>
            <div>
                <Grid container spacing={1} className="sensor-tit">
                    <Grid size={2}>
                        호퍼드라이어
                    </Grid>
                    <Grid size={10}>
                        Sub Modal 1.1
                    </Grid>
                </Grid>

                <Grid container spacing={1}>
                    <Grid size={2}>
                        센서
                    </Grid>
                    <Grid size={10}>
                        <Table />
                    </Grid>
                </Grid>
            </div>
            
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <Typography component="span">2호기</Typography>
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <Typography component="span">3호기</Typography>
        </AccordionSummary>
        <AccordionDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </AccordionDetails>
        <AccordionActions>
          <Button>Cancel</Button>
          <Button>Agree</Button>
        </AccordionActions>
      </Accordion>
    </div>
  );
}
