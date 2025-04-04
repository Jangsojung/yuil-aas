import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/system/Grid';
import TreeView from '../../../../components/treeview';
import BasicTabs from '../../../../components/tab';


export default function TransmitView() {
    return (
        <Container maxWidth="sm" className="tree-wrap">
            <Box sx={{ backgroundColor: '#ececec'}} className="second-title" >
                선택한 aasx 파일 검증
            </Box>
            <Grid container spacing={1}>
                <Grid size={6}>
                    <TreeView />
                </Grid>
                <Grid size={6}>
                    <BasicTabs />
                </Grid>
            </Grid>

            
        </Container>
        
    );
}