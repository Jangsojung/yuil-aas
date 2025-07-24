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
import { handleVerifyAPI } from '../../apis/api/transmit';
import { transformAASXData } from '../../utils/aasxTransform';
import { formatDate } from '../../utils/dateUtils';
import { FILE } from '../../constants';
import type { AASXFile, AASXData, File } from '../../types/api';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms/currentAtoms';

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

const fileSizeMessageStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '300px',
  flexDirection: 'column',
  gap: 2,
  textAlign: 'center',
  color: '#666',
};

export default function DashboardPage() {
  const [jsonFiles, setJsonFiles] = useState<JsonFileRow[]>([]);
  const [aasxFiles, setAasxFiles] = useState<AASXFile[]>([]);
  const [selectedJson, setSelectedJson] = useState<JsonFileRow | null>(null);
  const [selectedJsonData, setSelectedJsonData] = useState<any>(null);
  const [selectedAasx, setSelectedAasx] = useState<AASXFile | null>(null);
  const [selectedAasxData, setSelectedAasxData] = useState<AASXData | null>(null);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [aasxLoading, setAasxLoading] = useState(false);
  const [jsonFileSize, setJsonFileSize] = useState<number | null>(null);
  const [aasxFileSize, setAasxFileSize] = useState<number | null>(null);
  const navigate = useNavigate();
  const navigationReset = useRecoilValue(navigationResetState);

  useEffect(() => {
    getJSONFilesAPI('', '', -1, null).then((files) => {
      setJsonFiles(files);
      if (files && files.length > 0) {
        setSelectedJson(files[0]); // 최신 파일을 초기 선택
      }
    });
    getFilesAPI('', '', -1, undefined, null).then((files) => {
      setAasxFiles(files);
      if (files && files.length > 0) {
        setSelectedAasx(files[0]); // 최신 파일을 초기 선택
      }
    });
  }, []);

  // 네비게이션 리셋 시 대시보드 초기화
  useEffect(() => {
    if (navigationReset) {
      // 선택된 파일들을 첫 번째 파일로 초기화
      if (jsonFiles.length > 0) {
        setSelectedJson(jsonFiles[0]);
      }
      if (aasxFiles.length > 0) {
        setSelectedAasx(aasxFiles[0]);
      }
      // 로딩 상태와 파일 크기 정보 초기화
      setJsonLoading(false);
      setAasxLoading(false);
      setJsonFileSize(null);
      setAasxFileSize(null);
    }
  }, [navigationReset, jsonFiles, aasxFiles]);

  useEffect(() => {
    if (selectedJson && selectedJson.af_idx) {
      setJsonLoading(true);
      setJsonFileSize(null);
      getJSONFileDetailAPI(selectedJson.af_idx)
        .then((data) => {
          setSelectedJsonData(data?.aasData || data);
        })
        .catch((error) => {
          // 파일 크기 초과 에러 처리
          if (error instanceof Error && error.message === 'FILE_TOO_LARGE') {
            setJsonFileSize(FILE.MAX_SIZE);
          } else if (error && typeof error === 'object' && 'error' in error) {
            // apiHelpers에서 설정한 error 객체 처리
            if (error.error === 'FILE_TOO_LARGE') {
              setJsonFileSize(FILE.MAX_SIZE);
            }
          }
        })
        .finally(() => {
          setJsonLoading(false);
        });
    }
  }, [selectedJson]);

  useEffect(() => {
    if (selectedAasx && selectedAasx.af_idx) {
      setAasxLoading(true);
      setAasxFileSize(null);
      handleVerifyAPI(selectedAasx)
        .then((data) => {
          setSelectedAasxData(data?.aasData || data);
        })
        .catch((error) => {
          // 파일 크기 초과 에러 처리
          if (error instanceof Error && error.message === 'FILE_TOO_LARGE') {
            setAasxFileSize(FILE.MAX_SIZE);
          } else if (error && typeof error === 'object' && 'error' in error) {
            // apiHelpers에서 설정한 error 객체 처리
            if (error.error === 'FILE_TOO_LARGE') {
              setAasxFileSize(FILE.MAX_SIZE);
            }
          }
        })
        .finally(() => {
          setAasxLoading(false);
        });
    }
  }, [selectedAasx]);

  const handleJsonRowClick = (file: JsonFileRow) => {
    setSelectedJson(file);
  };

  const handleAasxRowClick = (file: AASXFile) => {
    setSelectedAasx(file);
  };

  return (
    <Grid container spacing={1} className='dashboard-wrap'>
      {/* 윗줄 */}
      {/* 왼쪽 위: JSON 파일 */}
      <Grid size={6} sx={{ height: '30%' }}>
        <Box sx={dashboardPanelStyle}>
          <Typography variant='h6' gutterBottom className='dashboard-title'>
            JSON 파일
          </Typography>
          <TableContainer component={Paper}>
            <Table size='small'>
              <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'white' }}>공장명</TableCell>
                  <TableCell sx={{ backgroundColor: 'white' }}>파일명</TableCell>
                  <TableCell sx={{ backgroundColor: 'white' }}>기초코드명</TableCell>
                  <TableCell sx={{ backgroundColor: 'white' }}>센서 개수</TableCell>
                  <TableCell sx={{ backgroundColor: 'white' }}>생성일</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jsonFiles.map((file) => (
                  <TableRow key={file.af_idx} onClick={() => handleJsonRowClick(file)} sx={{ cursor: 'pointer' }}>
                    <TableCell>{file.fc_name || '-'}</TableCell>
                    <TableCell>{file.af_name}</TableCell>
                    <TableCell>{file.base_name || '삭제된 기초코드'}</TableCell>
                    <TableCell>{file.sn_length ? file.sn_length : '-'}</TableCell>
                    <TableCell>{formatDate(file.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Grid>
      {/* 오른쪽 위: AASX 파일 */}
      <Grid size={6} sx={{ height: '30%' }}>
        <Box sx={dashboardPanelStyle}>
          <Typography variant='h6' gutterBottom className='dashboard-title'>
            AASX 파일
          </Typography>
          <TableContainer component={Paper}>
            <Table size='small' sx={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }} />
                <col style={{ maxWidth: '180px' }} />
                <col style={{ maxWidth: '690.78px' }} />
                <col style={{ maxWidth: '250px' }} />
                <col style={{ maxWidth: '250px' }} />
                <col style={{ maxWidth: '180px' }} />
              </colgroup>
              <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'white', width: 50, minWidth: 50, maxWidth: 50 }}>공장명</TableCell>
                  <TableCell sx={{ backgroundColor: 'white', maxWidth: 180 }}>파일명</TableCell>
                  <TableCell sx={{ backgroundColor: 'white', maxWidth: 690.78 }}>비고</TableCell>
                  <TableCell sx={{ backgroundColor: 'white', maxWidth: 250 }}>생성일</TableCell>
                  <TableCell sx={{ backgroundColor: 'white', maxWidth: 250 }}>수정일</TableCell>
                  <TableCell sx={{ backgroundColor: 'white', maxWidth: 180 }}>비고</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {aasxFiles.map((file) => (
                  <TableRow key={file.af_idx} onClick={() => handleAasxRowClick(file)} sx={{ cursor: 'pointer' }}>
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

      {/* 아랫줄 (왼쪽: 최신 JSON 파일 뷰어) */}
      <Grid size={6} sx={{ flexGrow: 1, height: '68%' }}>
        <Box sx={{ ...dashboardPanelStyle }}>
          <Typography variant='h6' gutterBottom sx={{ display: 'inline-block' }} className='dashboard-title'>
            {selectedJson ? `JSON 파일 - ${selectedJson.af_name}` : 'JSON 파일 미리보기'}

            {selectedJson && (
              <Button
                onClick={() =>
                  navigate('/data/jsonManager', {
                    state: {
                      selectedFileId: selectedJson.af_idx,
                      showDetail: true,
                    },
                  })
                }
                disabled={!selectedJson || !!(jsonFileSize && jsonFileSize >= FILE.MAX_SIZE)}
                variant='outlined'
                size='small'
                sx={{ ml: 2 }}
              >
                상세보기
              </Button>
            )}
          </Typography>

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
          ) : jsonFileSize ? (
            <Box sx={fileSizeMessageStyle}>
              <Typography variant='h6' color='textSecondary'>
                파일 크기 제한
              </Typography>
              <Typography color='textSecondary'>
                파일 크기가 {FILE.MAX_SIZE / (1024 * 1024)}MB를 초과하여 미리보기를 제공할 수 없습니다.
              </Typography>
              <Typography color='textSecondary' variant='body2'>
                Text Viewer로 확인해주세요.
              </Typography>
            </Box>
          ) : selectedJsonData ? (
            <div style={{ paddingTop: 15, paddingLeft: 15, overflowY: 'auto' }}>
              <JSONViewer
                value={selectedJsonData}
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
      <Grid size={6} sx={{ flexGrow: 1, height: '68%' }}>
        <Box sx={{ ...dashboardPanelStyle }}>
          <Typography variant='h6' gutterBottom sx={{ display: 'inline-block' }} className='dashboard-title'>
            {selectedAasx ? `AASX 파일 - ${selectedAasx.af_name}` : 'AASX 파일 미리보기'}

            {selectedAasx && (
              <Button
                onClick={() =>
                  navigate('/aasx/transmit', {
                    state: {
                      fc_idx: selectedAasx.fc_idx,
                      af_idx: selectedAasx.af_idx,
                    },
                  })
                }
                disabled={!selectedAasx || !!(aasxFileSize && aasxFileSize >= FILE.MAX_SIZE)}
                variant='outlined'
                size='small'
              >
                상세보기
              </Button>
            )}
          </Typography>

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
          ) : aasxFileSize ? (
            <Box sx={fileSizeMessageStyle}>
              <Typography variant='h6' color='textSecondary'>
                파일 크기 제한
              </Typography>
              <Typography color='textSecondary'>
                파일 크기가 {FILE.MAX_SIZE / (1024 * 1024)}MB를 초과하여 미리보기를 제공할 수 없습니다.
              </Typography>
              <Typography color='textSecondary' variant='body2'>
                AASX Package Viewer로 확인해주세요.
              </Typography>
            </Box>
          ) : selectedAasxData ? (
            <div style={{ paddingTop: 15, overflowY: 'auto' }}>
              <TreeView data={transformAASXData(selectedAasxData)} />
            </div>
          ) : (
            <Typography color='textSecondary'>데이터 없음</Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
