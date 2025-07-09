import React, { useEffect, useState } from 'react';
import Grid from '@mui/system/Grid';
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
  Button,
  CircularProgress,
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
import { formatDate } from '../../utils/dateUtils';
import { PAGINATION, FILE, MODAL_TYPE, KINDS } from '../../constants';
import type { AASXFile, AASXData, Base, File } from '../../types/api';

type JsonFileRow = File & { base_name?: string; sn_length?: number };

const dashboardPanelStyle = {
  border: '1px solid #d0d7e5',
  borderRadius: 2,
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  height: '100%',
  background: '#fff',
  p: 2,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
};

const detailButtonStyle = {
  position: 'absolute',
  top: 16,
  right: 16,
  cursor: 'pointer',
  padding: '4px 14px',
  border: '1px solid #888',
  borderRadius: 4,
  background: '#f5f5f5',
  fontWeight: 500,
  zIndex: 2,
};

export default function DashboardPage() {
  const [jsonFiles, setJsonFiles] = useState<JsonFileRow[]>([]);
  const [aasxFiles, setAasxFiles] = useState<AASXFile[]>([]);
  const [latestJson, setLatestJson] = useState<JsonFileRow | null>(null);
  const [latestJsonData, setLatestJsonData] = useState<any>(null);
  const [latestAasx, setLatestAasx] = useState<AASXFile | null>(null);
  const [latestAasxData, setLatestAasxData] = useState<AASXData | null>(null);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [aasxLoading, setAasxLoading] = useState(false);
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
      setJsonLoading(true);
      getJSONFileDetailAPI(latestJson.af_idx)
        .then((data) => {
          setLatestJsonData(data?.aasData || data);
        })
        .finally(() => {
          setJsonLoading(false);
        });
    }
  }, [latestJson]);

  useEffect(() => {
    if (latestAasx && latestAasx.af_idx) {
      setAasxLoading(true);
      handleVerifyAPI(latestAasx)
        .then((data) => {
          setLatestAasxData(data?.aasData || data);
        })
        .finally(() => {
          setAasxLoading(false);
        });
    }
  }, [latestAasx]);

  return (
    <Box
      sx={{
        p: 3,
        height: 'calc(100vh - 100px)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        background: '#f8fafc',
        border: '1px solid #e0e7ef',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <Grid
        container
        direction='column'
        sx={{ height: '100%', width: '100%', overflow: 'hidden', display: 'flex' }}
        spacing={2}
      >
        {/* 윗줄 */}
        <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0, gap: 1 }}>
          {/* 왼쪽 위: JSON 파일 */}
          <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box sx={dashboardPanelStyle}>
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
          </Box>
          {/* 오른쪽 위: AASX 파일 */}
          <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box sx={dashboardPanelStyle}>
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
          </Box>
        </Box>
        {/* 아랫줄 (왼쪽: 최신 JSON 파일 뷰어) */}
        <Box sx={{ display: 'flex', flexDirection: 'row', flex: 2, minHeight: 0, gap: 1 }}>
          <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box sx={{ ...dashboardPanelStyle, position: 'relative' }}>
              <Typography variant='h6' gutterBottom sx={{ display: 'inline-block' }}>
                최신 JSON 파일 미리보기
              </Typography>
              {latestJson && (
                <Button
                  onClick={() => navigate(`/aasx/json/detail/${latestJson.af_idx}`)}
                  sx={detailButtonStyle}
                  disabled={!latestJson}
                  variant='outlined'
                  size='small'
                >
                  상세보기
                </Button>
              )}
              {jsonLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '300px',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <CircularProgress size={40} />
                  <Typography color='textSecondary'>JSON 파일 로딩 중...</Typography>
                </Box>
              ) : latestJsonData ? (
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
          </Box>
          <Box sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Box sx={{ ...dashboardPanelStyle, position: 'relative' }}>
              <Typography variant='h6' gutterBottom sx={{ display: 'inline-block' }}>
                최신 AASX 파일 미리보기
              </Typography>
              {latestAasx && (
                <Button
                  onClick={() => navigate('/aas/transmit')}
                  sx={detailButtonStyle}
                  disabled={!latestAasx}
                  variant='outlined'
                  size='small'
                >
                  상세보기
                </Button>
              )}
              {aasxLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '300px',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <CircularProgress size={40} />
                  <Typography color='textSecondary'>AASX 파일 로딩 중...</Typography>
                </Box>
              ) : latestAasxData ? (
                <div style={{ marginTop: 15 }}>
                  <TreeView data={transformAASXData(latestAasxData)} />
                </div>
              ) : (
                <Typography color='textSecondary'>데이터 없음</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Grid>
    </Box>
  );
}
