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
import { useNavigate } from 'react-router-dom';
import JSONViewer from '@uiw/react-json-view';
import { getJSONFileDetailAPI } from '../../apis/api/json_manage';
import TreeView from '../../components/treeview';
import { getAASXAPI } from '../../apis/api/aasx_manage';
import { handleVerifyAPI } from '../../apis/api/transmit';
import { transformAASXData } from '../../utils/aasxTransform';

export default function DashboardPage() {
  const [jsonFiles, setJsonFiles] = useState<any[]>([]);
  const [aasxFiles, setAasxFiles] = useState<any[]>([]);
  const [latestJson, setLatestJson] = useState<any>(null);
  const [latestJsonData, setLatestJsonData] = useState<any>(null);
  const [latestAasx, setLatestAasx] = useState<any>(null);
  const [latestAasxData, setLatestAasxData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getJSONFilesAPI('', '', -1, 10 as any as null).then((files) => {
      setJsonFiles(files);
      if (files && files.length > 0) {
        setLatestJson(files[0]);
      }
    });
    getFilesAPI('', '', -1, undefined, 10 as any as null).then((files) => {
      setAasxFiles(files);
      if (files && files.length > 0) {
        setLatestAasx(files[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (latestJson && latestJson.af_idx) {
      getJSONFileDetailAPI(latestJson.af_idx).then((data) => {
        setLatestJsonData(data?.aasData || data);
      });
    }
  }, [latestJson]);

  useEffect(() => {
    if (latestAasx && latestAasx.af_idx) {
      handleVerifyAPI(latestAasx).then((data) => {
        console.log('AASX handleVerifyAPI 응답:', data);
        console.log('AASX handleVerifyAPI aaxData:', data?.aasData);
        setLatestAasxData(data?.aasData || data);
      });
    }
  }, [latestAasx]);

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
        {/* 아랫줄 (왼쪽: 최신 JSON 파일 뷰어) */}
        <Grid container sx={{ flex: 2, minHeight: 0, display: 'flex' }} spacing={2}>
          <Grid xs={6} sx={{ height: '100%', p: 2, overflow: 'auto' }}>
            <Box
              sx={{
                border: '1px solid #222',
                height: '100%',
                background: '#fff',
                p: 2,
                overflow: 'auto',
                position: 'relative',
              }}
            >
              <Typography variant='h6' gutterBottom sx={{ display: 'inline-block' }}>
                최신 JSON 파일 미리보기
              </Typography>
              {latestJson && (
                <button
                  onClick={() => navigate(`/aasx/json/detail/${latestJson.af_idx}`)}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    cursor: 'pointer',
                    padding: '4px 14px',
                    border: '1px solid #888',
                    borderRadius: 4,
                    background: '#f5f5f5',
                    fontWeight: 500,
                  }}
                  disabled={!latestJson}
                >
                  상세보기
                </button>
              )}
              {latestJsonData ? (
                <div style={{ marginTop: 15 }}>
                  <JSONViewer
                    value={latestJsonData}
                    collapsed={3}
                    enableClipboard={true}
                    displayDataTypes={false}
                    displayObjectSize={true}
                    style={{ fontSize: 16 }}
                  />
                </div>
              ) : (
                <Typography color='textSecondary'>데이터 없음</Typography>
              )}
            </Box>
          </Grid>
          <Grid xs={6} sx={{ height: '100%', p: 2, overflow: 'auto' }}>
            <Box
              sx={{
                border: '1px solid #222',
                height: '100%',
                background: '#fff',
                p: 2,
                overflow: 'auto',
                position: 'relative',
              }}
            >
              <Typography variant='h6' gutterBottom sx={{ display: 'inline-block' }}>
                최신 AASX 파일 미리보기
              </Typography>
              {latestAasx && (
                <button
                  onClick={() => navigate('/aas/transmit')}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    cursor: 'pointer',
                    padding: '4px 14px',
                    border: '1px solid #888',
                    borderRadius: 4,
                    background: '#f5f5f5',
                    fontWeight: 500,
                  }}
                  disabled={!latestAasx}
                >
                  상세보기
                </button>
              )}
              {latestAasxData ? (
                <div style={{ marginTop: 15 }}>
                  <TreeView data={transformAASXData(latestAasxData)} />
                </div>
              ) : (
                <Typography color='textSecondary'>데이터 없음</Typography>
              )}
            </Box>
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
