import React, { useRef, useState } from 'react';
import AASXList from './list';
import AASXAdd from './add';
import AASXEdit from './edit';
import { AASXFile } from '../../../types/api';

export default function AASXManagerPage() {
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
