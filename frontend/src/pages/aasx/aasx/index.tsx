import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../../recoil/atoms';
import AASXList from './list';
import AASXAdd from './add';
import AASXEdit from './edit';
import { AASXFile } from '../../../types/api';

export default function AASXManagerPage() {
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openInsertModal, setOpenInsertModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AASXFile | null>(null);
  const listRef = useRef<any>(null);

  const handleInsertFile = (file: AASXFile) => {
    // 등록 후 목록 새로고침
    if (listRef.current && listRef.current.refresh) {
      listRef.current.refresh();
    }
  };

  const handleUpdate = (newFile: AASXFile) => {
    // 수정 후 목록 새로고침
    if (listRef.current && listRef.current.refresh) {
      listRef.current.refresh();
    }
  };

  const handleEditClick = (file: AASXFile) => {
    setSelectedFile(file);
    setOpenUpdateModal(true);
  };

  const handleAddClick = () => {
    setOpenInsertModal(true);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setSelectedFile(null);
  };

  const handleCloseInsertModal = () => {
    setOpenInsertModal(false);
  };

  // 네비게이션 변경 시 페이지 초기화
  useEffect(() => {
    setOpenUpdateModal(false);
    setOpenInsertModal(false);
    setSelectedFile(null);
    // 목록 컴포넌트 초기화
    if (listRef.current && listRef.current.handleReset) {
      listRef.current.handleReset();
    }
  }, [navigationReset]);

  return (
    <>
      <AASXList ref={listRef} onEditClick={handleEditClick} onAddClick={handleAddClick} />
      <AASXEdit
        open={openUpdateModal}
        onClose={handleCloseUpdateModal}
        fileData={selectedFile}
        onUpdate={handleUpdate}
      />
      <AASXAdd open={openInsertModal} onClose={handleCloseInsertModal} onAdd={handleInsertFile} />
    </>
  );
}
