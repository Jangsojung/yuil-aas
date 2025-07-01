import React, { useState } from 'react';
import EdgeList from './list';
import EdgeAdd from './add';
import EdgeEdit from './edit';

interface EdgeGateway {
  eg_idx: number;
  eg_server_temp: number;
  eg_network: number;
  eg_pc_temp: number;
  eg_ip_port: string;
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

  const handleInsert = async () => {
    // 목록 새로고침 로직은 EdgeList에서 처리
  };

  const handleUpdate = async () => {
    // 목록 새로고침 로직은 EdgeList에서 처리
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
      <EdgeList onAddClick={handleAddClick} onEditClick={handleEditClick} />
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
