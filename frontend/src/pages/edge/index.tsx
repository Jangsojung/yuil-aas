import React, { useRef, useState } from 'react';
import EdgeList from './list';
import EdgeAdd from './add';
import EdgeEdit from './edit';

interface EdgeGateway {
  eg_idx: number;
  eg_pc_name?: string;
  eg_ip_port: string;
  eg_network?: number;
  createdAt?: string;
  created_at?: string;
  createDate?: string;
  create_date?: string;
  date?: string;
}

export default function EdgeGatewayPage() {
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEdgeGateway, setSelectedEdgeGateway] = useState<EdgeGateway | null>(null);
  const listRef = useRef<any>(null);

  const handleInsert = async () => {
    // 등록 후 목록 새로고침
    if (listRef.current && listRef.current.refresh) {
      listRef.current.refresh();
    }
  };

  const handleUpdate = async () => {
    // 수정 후 목록 새로고침
    if (listRef.current && listRef.current.refresh) {
      listRef.current.refresh();
    }
  };

  const handleEditClick = (edgeGateway: EdgeGateway) => {
    setSelectedEdgeGateway(edgeGateway);
    setIsEditMode(true);
    setOpenModal(true);
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedEdgeGateway(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsEditMode(false);
    setSelectedEdgeGateway(null);
  };

  return (
    <>
      <EdgeList ref={listRef} onAddClick={handleAddClick} onEditClick={handleEditClick} />
      {isEditMode ? (
        <EdgeEdit
          open={openModal}
          onClose={handleCloseModal}
          edgeGatewayData={selectedEdgeGateway}
          onUpdate={handleUpdate}
        />
      ) : (
        <EdgeAdd open={openModal} onClose={handleCloseModal} onAdd={handleInsert} />
      )}
    </>
  );
}
