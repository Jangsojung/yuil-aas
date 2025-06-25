import { height } from '@mui/system';
import Grid from '@mui/system/Grid';
export default function DashboardPage() {


  return (
    <Grid container spacing={1}>
      <Grid size={6} style={{background:'#ddd', height: 200}}>
        <div className='sort-title'>기초코드</div>
      </Grid>
      <Grid size={6} style={{background:'#ddd', height: 200}}>
      </Grid>
    </Grid>
  );
}
