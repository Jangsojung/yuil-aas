import React, { useRef, useState } from 'react';
import AASXList from './list';
import AASXAdd from './add';
import AASXEdit from './edit';

interface AASXFile {
  af_idx: number;
  af_name: string;
  createdAt: Date;
}

interface File {
  af_idx: number;
  af_name: string;
  af_size: number;
  createdAt: string;
}

export default function AASXManagerPage() {
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openInsertModal, setOpenInsertModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AASXFile | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const listRef = useRef<any>(null);

  const handleInsertFile = (file: AASXFile) => {
    const newFile: File = {
      af_idx: file.af_idx,
      af_name: file.af_name,
      af_size: 0,
      createdAt: file.createdAt.toISOString(),
    };
    setFiles((prevFiles) => {
      const filesArray = Array.isArray(prevFiles) ? prevFiles : [];
      return [newFile, ...filesArray];
    });
    // 등록 후 목록 새로고침
    if (listRef.current && listRef.current.refresh) {
      listRef.current.refresh();
    }
  };

  const handleUpdate = (newFile: AASXFile) => {
    const newFiles = files.map((file) =>
      file.af_idx === newFile.af_idx
        ? {
            ...file,
            af_name: newFile.af_name,
            createdAt: newFile.createdAt.toISOString(),
          }
        : file
    );
    setFiles(newFiles);
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
