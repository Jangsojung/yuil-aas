import React, { useState } from 'react';
import CustomizedDialogs from '../../components/modal/aasx_edit_modal';

interface AASXFile {
  af_idx: number;
  af_name: string;
  createdAt: Date;
}

interface AASXAddProps {
  open: boolean;
  onClose: () => void;
  onAdd: (file: AASXFile) => void;
}

export default function AASXAdd({ open, onClose, onAdd }: AASXAddProps) {
  return <CustomizedDialogs open={open} handleClose={onClose} fileData={null} handleUpdate={onAdd} />;
}
