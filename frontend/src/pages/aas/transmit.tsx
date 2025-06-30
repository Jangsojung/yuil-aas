import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { aasxDataState, currentFileState, isVerifiedState, navigationResetState } from '../../recoil/atoms';
import { handleVerifyAPI } from '../../apis/api/transmit';
import SelectAASXFile from '../../components/select/aasx_files';
import TransmitView from '../../section/aas/transmit/view';
import { Grid } from '@mui/material';
import { SearchBox } from '../../components/common';
import AlertModal from '../../components/modal/alert';
import { buildTransmitTreeDataAPI } from '../../apis/api/transmit';
import { AASXFile, AASXData } from '../../types/api';
import { transformAASXData } from '../../utils/aasxTransform';
import { useAlertModal } from '../../hooks/useAlertModal';
import { usePagination } from '../../hooks/usePagination';
import { PAGINATION } from '../../constants';

export default function TransmitPage() {
  const currentFile = useRecoilValue(currentFileState);
  const aasxData = useRecoilValue(aasxDataState);
  const [, setAasxData] = useRecoilState(aasxDataState);
  const [, setIsVerified] = useRecoilState(isVerifiedState);
  const [, setCurrentFile] = useRecoilState(currentFileState);
  const [selectedFile, setSelectedFile] = useState<AASXFile | undefined>(undefined);
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  // 커스텀 훅 사용
  const { alertModal, showAlert, closeAlert } = useAlertModal();
  const { currentPage, totalPages, goToPage } = usePagination(
    aasxData?.AAS?.length || 0,
    PAGINATION.DEFAULT_ROWS_PER_PAGE
  );

  // 상태 관리
  const [insertMode, setInsertMode] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);

  const handleVerify = async () => {
    if (!selectedFile) {
      showAlert('알림', '선택된 파일이 없습니다.');
      return;
    }

    try {
      const rawData = await handleVerifyAPI(selectedFile);
      if (rawData) {
        const transformedData = transformAASXData(rawData);
        if (transformedData) {
          setAasxData(transformedData);
          setIsVerified(true);
          setSelectedFile(undefined);
        } else {
          showAlert('오류', 'AASX 데이터 변환에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('검증 중 오류 발생:', error);
      showAlert('오류', '파일 검증 중 오류가 발생했습니다.');
    }
  };

  const handleInsertMode = async () => {
    setInsertMode(true);
    setTreeLoading(true);
    try {
      const facilitiesAll = await buildTransmitTreeDataAPI();
      setTreeData(facilitiesAll);
    } catch (err) {
      console.error('트리 데이터 로딩 실패:', err);
      setTreeData([]);
      showAlert('오류', '설비 데이터를 불러오는데 실패했습니다.');
    } finally {
      setTreeLoading(false);
    }
  };

  // 페이지 변경 시 현재 페이지 조정
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      goToPage(0);
    }
  }, [currentPage, totalPages, goToPage]);

  // 네비게이션 리셋 시 상태 초기화
  useEffect(() => {
    setSelectedFile(undefined);
    setAasxData(null);
    setIsVerified(false);
    setCurrentFile(null);
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
          <Grid item xs={8}>
            <Grid container spacing={1}>
              <Grid item>
                <div className='sort-title'>AASX 파일</div>
              </Grid>
              <Grid item xs={10}>
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
