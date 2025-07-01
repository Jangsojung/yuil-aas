import React from 'react';
import CustomizedDialogs from '../../components/modal/aasx_edit_modal';

interface AASXFile {
  af_idx: number;
  af_name: string;
  createdAt: Date;
}

interface AASXEditProps {
  open: boolean;
  onClose: () => void;
  fileData: AASXFile | null;
  onUpdate: (file: AASXFile) => void;
}

export default function AASXEdit({ open, onClose, fileData, onUpdate }: AASXEditProps) {
  return <CustomizedDialogs open={open} handleClose={onClose} fileData={fileData} handleUpdate={onUpdate} />;
}
