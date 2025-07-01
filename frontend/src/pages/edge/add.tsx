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

interface EdgeAddProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
}

export default function EdgeAdd({ open, onClose, onAdd }: EdgeAddProps) {
  return (
    <CustomizedDialogs
      modalType='insert'
      open={open}
      handleClose={onClose}
      edgeGatewayData={null}
      handleInsert={onAdd}
      handleUpdate={() => {}}
    />
  );
}
