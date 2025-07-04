import { useParams, useNavigate } from 'react-router-dom';
import JSONViewer from '@uiw/react-json-view';
import { useEffect, useState } from 'react';
import { getJSONFileDetailAPI, checkJSONFileSizeAPI } from '../../../apis/api/json_manage';
import ActionBox from '../../../components/common/ActionBox';
import ProgressOverlay from '../../../components/loading/ProgressOverlay';
import AlertModal from '../../../components/modal/alert';

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

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setProgress(0);
    setProgressLabel('파일 크기를 확인하는 중...');

    // 프로그레스 시뮬레이션
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    // 먼저 파일 크기 확인
    checkJSONFileSizeAPI(id)
      .then((fileSizeData) => {
        console.log('파일 크기 확인 결과:', fileSizeData);

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
              alertContent: `파일 크기: ${(fileSizeData.size / (1024 * 1024)).toFixed(1)}MB\n\n500MB 이상의 파일은 상세보기를 할 수 없습니다.\nAASX Package Viewer를 통해 확인해주세요.`,
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
            setJsonData(data.aasData);
          }
        } else {
          setJsonData(data);
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
        setTimeout(() => {
          setLoading(false);
        }, 500);
      })
      .catch((error) => {
        console.error('JSON 파일 처리 오류:', error);

        // 파일이 너무 큰 경우는 이미 처리됨
        if (error === 'FILE_TOO_LARGE') {
          console.log('파일이 너무 큰 경우 - 이미 처리됨');
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
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      });
  }, [id]);

  if (loading) return <ProgressOverlay open={loading} progress={progress} label={progressLabel} />;
  if (!jsonData && !loading) return <div>데이터가 없습니다.</div>;
  if (!jsonData) return <div>데이터가 없습니다.</div>;

  return (
    <div className='table-outer'>
      <ActionBox
        buttons={[
          {
            text: '수정',
            onClick: () => navigate(`/aasx/json/edit/${id}`),
            color: 'success',
          },
          {
            text: '목록',
            onClick: () => navigate('/data/jsonManager'),
            color: 'inherit',
            variant: 'outlined',
          },
        ]}
      />
      <div style={{ marginTop: 16 }}>
        <JSONViewer
          value={jsonData}
          collapsed={false}
          enableClipboard={true}
          displayDataTypes={false}
          style={{ fontSize: 18 }}
        />
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
