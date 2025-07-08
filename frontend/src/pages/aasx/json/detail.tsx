import { useParams, useNavigate } from 'react-router-dom';
import JSONViewer from '@uiw/react-json-view';
import { useEffect, useState, useCallback } from 'react';
import { getJSONFileDetailAPI, checkJSONFileSizeAPI } from '../../../apis/api/json_manage';
import ActionBox from '../../../components/common/ActionBox';
import ProgressOverlay from '../../../components/loading/ProgressOverlay';
import AlertModal from '../../../components/modal/alert';
import { Box } from '@mui/material';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

export default function JsonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedJsonText, setEditedJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setProgress(0);
    setProgressLabel('파일 크기를 확인하는 중...');

    // 프로그레스 시뮬레이션
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 100);

    // 먼저 파일 크기 확인
    checkJSONFileSizeAPI(id)
      .then((fileSizeData) => {
        // 파일이 너무 큰 경우
        if (fileSizeData.isLargeFile) {
          clearInterval(progressInterval);
          setProgress(100);
          setProgressLabel('완료');

          // 바로 목록으로 이동하고 alert 띄우기
          navigate('/data/jsonManager', {
            state: {
              showAlert: true,
              alertTitle: '파일 크기 초과',
              alertContent: `파일 크기: ${(fileSizeData.size / (1024 * 1024)).toFixed(1)}MB\n\n500MB 이상의 파일은 상세보기를 할 수 없습니다.\nText Viewer를 통해 확인해주세요.`,
            },
          });
          return Promise.reject('FILE_TOO_LARGE'); // 체인 중단
        }

        // 파일 크기가 적절한 경우 상세 데이터 가져오기
        setProgressLabel('파일 데이터를 가져오는 중...');

        return getJSONFileDetailAPI(id);
      })
      .then((data) => {
        if (data && data.aasData) {
          // 큰 파일인 경우 특별 처리
          if (data.isLargeFile) {
            // 바로 목록으로 이동하고 alert 띄우기
            navigate('/data/jsonManager', {
              state: {
                showAlert: true,
                alertTitle: '큰 파일 감지',
                alertContent: `파일 크기: ${(data.totalSize / (1024 * 1024)).toFixed(1)}MB\n\n${data.aasData._message}`,
              },
            });
            return;
          } else {
            setJsonData({ ...data.aasData, _fileSize: data.fileSize });
            setEditedJsonText(JSON.stringify(data.aasData, null, 2));
          }
        } else {
          setJsonData({ ...data, _fileSize: data.fileSize });
          setEditedJsonText(JSON.stringify(data, null, 2));
        }

        // 데이터가 없는 경우 처리
        if (!data || (!data.aasData && !data.isLargeFile)) {
          setAlertModal({
            open: true,
            title: '데이터 없음',
            content: '파일 데이터를 찾을 수 없습니다.',
            type: 'alert',
            onConfirm: () => navigate(-1),
          });
        }

        clearInterval(progressInterval);
        setProgress(100);
        setProgressLabel('완료');
        setLoading(false);
      })
      .catch((error) => {
        console.error('JSON 파일 처리 오류:', error);

        // 파일이 너무 큰 경우는 이미 처리됨
        if (error === 'FILE_TOO_LARGE') {
          return;
        }

        setAlertModal({
          open: true,
          title: '오류',
          content: '파일 처리 중 오류가 발생했습니다.',
          type: 'alert',
          onConfirm: () => navigate('/data/jsonManager'),
        });
        clearInterval(progressInterval);
        setProgress(100);
        setProgressLabel('오류 발생');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEditClick = () => {
    // 파일 크기가 50MB 이상인 경우 수정 불가
    const fileSizeMB = (jsonData as any)._fileSize ? (jsonData as any)._fileSize / (1024 * 1024) : 0;
    if (fileSizeMB > 50) {
      setAlertModal({
        open: true,
        title: '수정 불가',
        content: `파일 크기: ${fileSizeMB.toFixed(1)}MB\n\n50MB 이상의 파일은 수정할 수 없습니다.`,
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    setIsEditing(true);
    setJsonError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setJsonError('');
    setEditedJsonText(JSON.stringify(jsonData, null, 2));
  };

  const handleSaveEdit = () => {
    try {
      const parsedJson = JSON.parse(editedJsonText);
      setJsonData(parsedJson);
      setIsEditing(false);
      setJsonError('');

      setAlertModal({
        open: true,
        title: '저장 완료',
        content: 'JSON 데이터가 성공적으로 수정되었습니다.',
        type: 'alert',
        onConfirm: undefined,
      });
    } catch (error) {
      setJsonError('유효하지 않은 JSON 형식입니다.');
    }
  };

  const handleJSONChange = useCallback(
    (data: any) => {
      // 에러가 있는 경우에만 상태 업데이트
      if (data.error) {
        setJsonError(data.error.reason);
      } else {
        setJsonError('');
        // JSON 문자열이 변경된 경우에만 업데이트
        if (data.json !== editedJsonText) {
          setEditedJsonText(data.json);
        }
      }
    },
    [editedJsonText]
  );

  const handleJSONBlur = useCallback((data: any) => {
    // onBlur에서는 최종 상태만 업데이트
    if (data.error) {
      setJsonError(data.error.reason);
    } else {
      setJsonError('');
      setEditedJsonText(data.json);
    }
  }, []);

  if (loading) return <ProgressOverlay open={loading} progress={progress} label={progressLabel} />;
  if (!jsonData && !loading) return <div>데이터가 없습니다.</div>;
  if (!jsonData) return <div>데이터가 없습니다.</div>;

  return (
    <div className='table-outer' style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <ActionBox
          buttons={
            isEditing
              ? [
                  {
                    text: '저장',
                    onClick: handleSaveEdit,
                    color: 'success',
                  },
                  {
                    text: '취소',
                    onClick: handleCancelEdit,
                    color: 'inherit',
                    variant: 'outlined',
                  },
                ]
              : [
                  {
                    text: '수정',
                    onClick: handleEditClick,
                    color: 'success',
                  },
                  {
                    text: '목록',
                    onClick: () => navigate('/data/jsonManager'),
                    color: 'inherit',
                    variant: 'outlined',
                  },
                ]
          }
        />
      </div>
      <div style={{ flex: 1, marginTop: 16, overflow: 'auto' }}>
        {isEditing ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <JSONInput
              placeholder={jsonData}
              locale={locale}
              height='100%'
              width='100%'
              onChange={handleJSONChange}
              onBlur={handleJSONBlur}
              theme='light_vscode'
              style={
                {
                  body: { fontSize: '14px' },
                  outerBox: { height: '100%' },
                  container: { height: '100%' },
                } as any
              }
            />
            {jsonError && (
              <Box sx={{ color: 'error.main', fontSize: '12px', mt: 1, p: 1, bgcolor: 'error.light' }}>{jsonError}</Box>
            )}
          </Box>
        ) : (
          <JSONViewer
            value={jsonData}
            collapsed={3}
            enableClipboard={true}
            displayDataTypes={false}
            displayObjectSize={true}
            style={{ fontSize: 18 }}
          />
        )}
      </div>

      <AlertModal
        open={alertModal.open}
        handleClose={() => setAlertModal((prev) => ({ ...prev, open: false }))}
        title={alertModal.title}
        content={alertModal.content}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </div>
  );
}
