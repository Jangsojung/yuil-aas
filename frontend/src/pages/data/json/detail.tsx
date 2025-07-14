import ReactJson from '@uiw/react-json-view';
import React, { useRef, useEffect, useState } from 'react';
import { getJSONFileDetailAPI, checkJSONFileSizeAPI } from '../../../apis/api/json_manage';
import ActionBox from '../../../components/common/ActionBox';
import AlertModal from '../../../components/modal/alert';
import { Box, Typography } from '@mui/material';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import LodingOverlay from '../../../components/loading/LodingOverlay';

interface JSONDetailProps {
  fileId: number | null;
  onBackToList: () => void;
}

export default function JSONDetail({ fileId, onBackToList }: JSONDetailProps) {
  const [jsonData, setJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [, setProgress] = useState(0);
  const [, setProgressLabel] = useState('');
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [, setEditedJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [editorRef, setEditorRef] = useState<HTMLDivElement | null>(null);
  const jsonEditorInstance = useRef<any>(null);

  useEffect(() => {
    if (!fileId) return;
    setLoading(true);
    setProgress(0);
    setProgressLabel('파일 크기를 확인하는 중...');

    // 파일 크기 확인 및 데이터 로딩
    checkJSONFileSizeAPI(fileId)
      .then((fileSizeData) => {
        if (fileSizeData.isLargeFile) {
          setProgress(100);
          setProgressLabel('완료');
          setLoading(false);
          setAlertModal({
            open: true,
            title: '파일 크기 초과',
            content: `파일 크기: ${(fileSizeData.size / (1024 * 1024)).toFixed(1)}MB\n\n500MB 이상의 파일은 상세보기를 할 수 없습니다.\nText Viewer를 통해 확인해주세요.`,
            type: 'alert',
            onConfirm: () => onBackToList(),
          });
          return Promise.reject('FILE_TOO_LARGE');
        }
        setProgressLabel('파일 데이터를 가져오는 중...');
        return getJSONFileDetailAPI(fileId);
      })
      .then((data) => {
        if (data && data.aasData) {
          // 큰 파일인 경우 특별 처리
          if (data.isLargeFile) {
            setAlertModal({
              open: true,
              title: '큰 파일 감지',
              content: `파일 크기: ${(data.totalSize / (1024 * 1024)).toFixed(1)}MB\n\n${data.aasData._message}`,
              type: 'alert',
              onConfirm: () => onBackToList(),
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
            onConfirm: () => onBackToList(),
          });
        }

        setProgress(100);
        setProgressLabel('완료');
        setTimeout(() => {
          setLoading(false);
        }, 100);
      })
      .catch((error) => {
        // 파일이 너무 큰 경우는 이미 처리됨
        if (error === 'FILE_TOO_LARGE') {
          return;
        }

        setProgress(100);
        setProgressLabel('오류 발생');
        setLoading(false);
        setAlertModal({
          open: true,
          title: '오류',
          content: '파일 처리 중 오류가 발생했습니다.',
          type: 'alert',
          onConfirm: () => onBackToList(),
        });
      });
  }, [fileId, onBackToList]);

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

    setLoading(true); // 수정 버튼 누르면 로딩 시작
    setIsEditing(true);
    setJsonError('');
  };

  // JSON 에디터가 렌더링된 후 로딩 종료
  useEffect(() => {
    if (isEditing) {
      setLoading(false);
    }
  }, [isEditing]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setJsonError('');
    setEditedJsonText(JSON.stringify(jsonData, null, 2));
  };

  // 저장 버튼 클릭 시에만 get() 호출
  const handleSaveEdit = () => {
    try {
      if (jsonEditorInstance.current) {
        const updated = jsonEditorInstance.current.get();
        setJsonData(updated);
      }
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

  // 상세/수정 모드 렌더링
  useEffect(() => {
    if (!isEditing) return;
    if (!editorRef || !jsonData) return;

    // 기존 인스턴스 파괴
    if (jsonEditorInstance.current) {
      jsonEditorInstance.current.destroy();
      jsonEditorInstance.current = null;
    }

    // editor 생성
    jsonEditorInstance.current = new JSONEditor(editorRef, {
      mode: 'tree',
      mainMenuBar: false,
      navigationBar: false,
    });
    jsonEditorInstance.current.set(jsonData);

    return () => {
      if (jsonEditorInstance.current) {
        jsonEditorInstance.current.destroy();
        jsonEditorInstance.current = null;
      }
    };
  }, [isEditing, jsonData, editorRef]);

  if (loading) return <LodingOverlay />;
  if (!jsonData && !loading) return <div>데이터가 없습니다.</div>;
  if (!jsonData) return <LodingOverlay />;

  return (
    <div className='table-outer'>
      <div className='list-header'>
        <Typography variant='h6' gutterBottom>
          {isEditing ? 'JSON 파일 수정' : 'JSON 파일 미리보기'}
        </Typography>

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
                    onClick: onBackToList,
                    color: 'inherit',
                    variant: 'outlined',
                  },
                ]
          }
        />
      </div>

      <div className='json-viewer'>
        {isEditing ? (
          <div ref={setEditorRef} style={{ height: '500px', width: '100%' }} />
        ) : (
          jsonData && (
            <ReactJson
              value={jsonData}
              collapsed={3}
              enableClipboard={true}
              displayDataTypes={false}
              displayObjectSize={true}
              style={{ fontSize: 16 }}
            />
          )
        )}
        {jsonError && (
          <Box sx={{ color: 'error.main', fontSize: '12px', mt: 1, p: 1, bgcolor: 'error.light' }}>{jsonError}</Box>
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
