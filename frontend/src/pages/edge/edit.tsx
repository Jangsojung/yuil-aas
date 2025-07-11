import React from 'react';
import CustomizedDialogs from '../../components/modal/edgemodal';

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

interface EdgeEditProps {
  open: boolean;
  onClose: () => void;
  edgeGatewayData: EdgeGateway | null;
  onUpdate: () => void;
}

export default function EdgeEdit({ open, onClose, edgeGatewayData, onUpdate }: EdgeEditProps) {
  return (
    <CustomizedDialogs
      modalType='update'
      open={open}
      handleClose={onClose}
      edgeGatewayData={edgeGatewayData}
      handleInsert={() => {}}
      handleUpdate={onUpdate}
    />
  );
}
