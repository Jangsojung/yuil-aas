import Grid from '@mui/system/Grid';
import Table from '../../../../components/table'
import SelectFactory from '../../../../components/select/factory';

export default function BasicCode() {
    return (
        <div>
          <div className="sensor-list">
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
                      <Grid size={12}>
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
                      <Grid size={12}>
                          <Table />
                      </Grid>
                  </Grid>
              </div>
          </div>

          {/* 기초코드 추가화면 */}
          <div className="sensor-list">
            <div>
                <Grid container spacing={1} className="sensor-tit">
                    <Grid size={2}>
                        <SelectFactory />
                    </Grid>
                    <Grid size={10}>
                        Sub Modal 1.1
                    </Grid>
                </Grid>
                <Grid container spacing={1}>
                    <Grid size={12}>
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
                    <Grid size={12}>
                        <Table />
                    </Grid>
                </Grid>
            </div>
          </div>
          {/* 등록 */}
        </div>
        
        
    );
}