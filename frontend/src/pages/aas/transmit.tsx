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
import FactorySelect from '../../components/select/factory_select';
import { FormControl } from '@mui/material';
import { getAASXFilesAPI } from '../../apis/api/aasx_manage';

export default function TransmitPage() {
  const currentFile = useRecoilValue(currentFileState);
  const [, setAasxData] = useRecoilState(aasxDataState);
  const [, setIsVerified] = useRecoilState(isVerifiedState);
  const [, setCurrentFile] = useRecoilState(currentFileState);
  const [selectedFile, setSelectedFile] = useState<AASXFile | undefined>(undefined);
  const [selectedFactory, setSelectedFactory] = useState<number | ''>('');
  const [aasxFiles, setAasxFiles] = useState<AASXFile[]>([]);
  const navigationReset = useRecoilValue(navigationResetState);

  // 커스텀 훅 사용
  const { alertModal, showAlert, closeAlert } = useAlertModal();

  const handleVerify = async () => {
    // 공장 선택 여부 확인
    if (!selectedFactory) {
      showAlert('알림', '공장을 선택해주세요.');
      return;
    }

    // AASX 파일 선택 여부 확인
    if (!selectedFile) {
      showAlert('알림', '검증할 AASX 파일을 선택해주세요.');
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
      console.error('에러 타입:', typeof error);

      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        console.error('에러 객체:', error);
      }

      // 파일 크기 초과 에러 처리 - Error 객체의 message에서 확인
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage === 'FILE_TOO_LARGE') {
          showAlert(
            '파일 크기 초과',
            '500MB 이상의 파일은 검증할 수 없습니다.\nAASX Package Viewer를 통해 확인해주세요.'
          );
          return;
        }
      }

      // API 응답에서 에러 메시지 확인 (백엔드에서 JSON 형태로 반환하는 경우)
      if (error && typeof error === 'object' && 'error' in error) {
        const apiError = (error as any).error;
        if (apiError === 'FILE_TOO_LARGE') {
          showAlert(
            '파일 크기 초과',
            '500MB 이상의 파일은 검증할 수 없습니다.\nAASX Package Viewer를 통해 확인해주세요.'
          );
          return;
        }
      }

      // 응답 데이터에서 에러 확인 (apiHelpers에서 설정한 response.data)
      if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as any).response;
        if (response && response.data) {
          console.error('응답 데이터:', response.data);
          if (response.data === 'FILE_TOO_LARGE') {
            showAlert(
              '파일 크기 초과',
              '500MB 이상의 파일은 검증할 수 없습니다.\nAASX Package Viewer를 통해 확인해주세요.'
            );
            return;
          }
        }
      }

      showAlert('오류', '파일 검증 중 오류가 발생했습니다.');
    }
  };

  const handleFactoryChange = async (factoryId: number) => {
    setSelectedFactory(factoryId);
    setSelectedFile(undefined);
    setCurrentFile(null);

    if (factoryId) {
      try {
        // 공장별 AASX 파일 가져오기
        const files = await getAASXFilesAPI(null, null, factoryId);
        setAasxFiles(Array.isArray(files) ? files : []);
      } catch (error) {
        console.error('공장별 AASX 파일 가져오기 실패:', error);
        setAasxFiles([]);
      }
    } else {
      setAasxFiles([]);
    }
  };

  const handleResetStates = () => {
    setSelectedFile(undefined);
    setAasxData(null);
    setIsVerified(false);
    setCurrentFile(null);
    setSelectedFactory('');
    setAasxFiles([]);
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
          },
        ]}
      >
        <Grid container spacing={4}>
          {/* 공장 선택 */}
          <Grid container spacing={2}>
            <Grid className='sort-title'>
              <div>공장</div>
            </Grid>
            <Grid sx={{ flexGrow: 1 }}>
              <FormControl sx={{ minWidth: '200px', width: '100%' }} size='small'>
                <FactorySelect value={selectedFactory} onChange={handleFactoryChange} placeholder='공장을 선택하세요' />
              </FormControl>
            </Grid>
          </Grid>
          {/* 공장 선택 */}

          {/* AASX 파일 선택 */}
          <Grid container spacing={2}>
            <Grid className='sort-title'>
              <div>AASX 파일</div>
            </Grid>
            <Grid sx={{ flexGrow: 1 }}>
              <FormControl sx={{ width: '100%' }} size='small'>
                <SelectAASXFile setSelectedFile={setSelectedFile} files={aasxFiles} disabled={!selectedFactory} />
              </FormControl>
            </Grid>
          </Grid>
          {/* AASX 파일 선택 */}
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
