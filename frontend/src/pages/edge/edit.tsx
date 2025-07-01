import React from 'react';
import CustomizedDialogs from '../../components/modal/edgemodal';

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
