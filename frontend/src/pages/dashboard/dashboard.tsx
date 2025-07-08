import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import { getJSONFilesAPI } from '../../apis/api/json_manage';
import { getFilesAPI } from '../../apis/api/aasx_manage';

export default function DashboardPage() {
  const [jsonFiles, setJsonFiles] = useState<any[]>([]);
  const [aasxFiles, setAasxFiles] = useState<any[]>([]);

  useEffect(() => {
    // JSON 최신 10개 (공장 전체)
    getJSONFilesAPI('', '', -1, 10 as any as null).then(setJsonFiles);
    // AASX 최신 10개 (공장 전체)
    getFilesAPI('', '', -1, undefined, 10 as any as null).then(setAasxFiles);
  }, []);

  return (
    <Box sx={{ p: 2, height: 'calc(100vh - 100px)', overflow: 'hidden', boxSizing: 'border-box' }}>
      <Grid
        container
        direction='column'
        sx={{ height: '100%', width: '100%', overflow: 'hidden', display: 'flex' }}
        spacing={2}
      >
        {/* 윗줄 */}
        <Grid container sx={{ flex: 1, minHeight: 0, display: 'flex' }} spacing={2}>
          {/* 왼쪽 위: JSON 파일 */}
          <Grid xs={6} sx={{ height: '100%' }}>
            <Box sx={{ border: '1px solid #222', height: '100%', background: '#fff', p: 2, overflow: 'auto' }}>
              <Typography variant='h6' gutterBottom>
                JSON 파일 (최신 10개)
              </Typography>
              <TableContainer component={Paper}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>공장명</TableCell>
                      <TableCell>파일명</TableCell>
                      <TableCell>기초코드명</TableCell>
                      <TableCell>센서 개수</TableCell>
                      <TableCell>생성일</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jsonFiles.map((file) => (
                      <TableRow key={file.af_idx}>
                        <TableCell>{file.fc_name || '-'}</TableCell>
                        <TableCell>{file.af_name}</TableCell>
                        <TableCell>{file.base_name || '삭제된 기초코드'}</TableCell>
                        <TableCell>{file.sn_length || 0}</TableCell>
                        <TableCell>{formatDate(file.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
          {/* 오른쪽 위: AASX 파일 */}
          <Grid xs={6} sx={{ height: '100%' }}>
            <Box sx={{ border: '1px solid #222', height: '100%', background: '#fff', p: 2, overflow: 'auto' }}>
              <Typography variant='h6' gutterBottom>
                AASX 파일 (최신 10개)
              </Typography>
              <TableContainer component={Paper}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>공장명</TableCell>
                      <TableCell>파일명</TableCell>
                      <TableCell>생성일</TableCell>
                      <TableCell>수정일</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {aasxFiles.map((file) => (
                      <TableRow key={file.af_idx}>
                        <TableCell>{file.fc_name || '-'}</TableCell>
                        <TableCell>{file.af_name}</TableCell>
                        <TableCell>{formatDate(file.createdAt)}</TableCell>
                        <TableCell>{formatDate(file.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
        {/* 아랫줄 (미구현) */}
        <Grid container sx={{ flex: 2, minHeight: 0, display: 'flex' }} spacing={2}>
          <Grid xs={6} sx={{ height: '100%' }}>
            <Box sx={{ border: '1px solid #222', height: '100%', background: '#fff' }} />
          </Grid>
          <Grid xs={6} sx={{ height: '100%' }}>
            <Box sx={{ border: '1px solid #222', height: '100%', background: '#fff' }} />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}
