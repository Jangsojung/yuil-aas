import React from 'react';
import CustomizedDialogs from '../../../components/modal/aasx_edit_modal';
import { AASXFile } from '../../../types/api';

interface AASXAddProps {
  open: boolean;
  onClose: () => void;
  onAdd: (file: AASXFile) => void;
}

export default function AASXAdd({ open, onClose, onAdd }: AASXAddProps) {
  return <CustomizedDialogs open={open} handleClose={onClose} fileData={null} handleUpdate={onAdd} />;
}
