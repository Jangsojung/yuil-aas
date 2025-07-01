import React from 'react';
import CustomizedDialogs from '../../components/modal/edgemodal';

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
