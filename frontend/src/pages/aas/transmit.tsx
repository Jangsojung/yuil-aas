import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { aasxDataState, currentFileState, isVerifiedState, navigationResetState } from '../../recoil/atoms';
import { handleVerifyAPI } from '../../apis/api/transmit';
import SelectAASXFile from '../../components/select/aasx_files';
import TransmitView from '../../section/aas/transmit/view';
import Grid from '@mui/system/Grid';
import { SearchBox } from '../../components/common';
import AlertModal from '../../components/modal/alert';
import { AASXFile } from '../../types/api';
import { transformAASXData } from '../../utils/aasxTransform';
import { useAlertModal } from '../../hooks/useAlertModal';

export default function TransmitPage() {
  const currentFile = useRecoilValue(currentFileState);
  const [, setAasxData] = useRecoilState(aasxDataState);
  const [, setIsVerified] = useRecoilState(isVerifiedState);
  const [, setCurrentFile] = useRecoilState(currentFileState);
  const [selectedFile, setSelectedFile] = useState<AASXFile | undefined>(undefined);
  const navigationReset = useRecoilValue(navigationResetState);

  // 커스텀 훅 사용
  const { alertModal, showAlert, closeAlert } = useAlertModal();

  const handleVerify = async () => {
    if (!selectedFile) {
      showAlert('알림', '선택된 파일이 없습니다.');
      return;
    }

    try {
      const rawData = await handleVerifyAPI(selectedFile);
      if (rawData && rawData.aasData) {
        const transformedData = transformAASXData(rawData.aasData);
        if (transformedData) {
          setAasxData(transformedData);
          setIsVerified(true);
          setSelectedFile(undefined);
        } else {
          showAlert('오류', 'AASX 데이터 변환에 실패했습니다.');
        }
      } else {
        showAlert('오류', '파일 데이터를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('검증 중 오류 발생:', error);

      // AAS 파일이 너무 큰 경우 특별 처리
      if (error instanceof Error && error.message === 'AAS_FILE_TOO_LARGE') {
        showAlert(
          '파일 크기 초과',
          '500MB 이상의 파일은 검증할 수 없습니다.\nAASX Package Viewer를 통해 확인해주세요.'
        );
        return;
      }

      // API 응답에서 에러 메시지 확인
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes('AAS_FILE_TOO_LARGE')) {
          showAlert(
            '파일 크기 초과',
            '500MB 이상의 파일은 검증할 수 없습니다.\nAASX Package Viewer를 통해 확인해주세요.'
          );
          return;
        }
      }

      showAlert('오류', '파일 검증 중 오류가 발생했습니다.');
    }
  };

  const handleResetStates = () => {
    setSelectedFile(undefined);
    setAasxData(null);
    setIsVerified(false);
    setCurrentFile(null);
  };

  useEffect(() => {
    handleResetStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset, setAasxData, setIsVerified, setCurrentFile]);

  // 현재 파일 변경 시 검증 상태 리셋
  useEffect(() => {
    if (currentFile) {
      setIsVerified(false);
    }
  }, [currentFile, setIsVerified]);

  return (
    <div>
      <SearchBox
        buttons={[
          {
            text: '검증하기',
            onClick: handleVerify,
            color: 'success',
            disabled: !currentFile,
          },
        ]}
      >
        <Grid container spacing={1}>
          <Grid>
            <Grid container spacing={1}>
              <Grid>
                <div className='sort-title'>AASX 파일</div>
              </Grid>
              <Grid>
                <SelectAASXFile setSelectedFile={setSelectedFile} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </SearchBox>
      <TransmitView />

      <AlertModal
        open={alertModal.open}
        handleClose={closeAlert}
        title={alertModal.title}
        content={alertModal.content}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </div>
  );
}
