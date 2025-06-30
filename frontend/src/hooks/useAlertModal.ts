import { useState, useCallback } from 'react';
import { AlertModalState } from '../types/api';

export const useAlertModal = () => {
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    open: false,
    title: '',
    content: '',
    type: 'alert',
    onConfirm: undefined,
  });

  const showAlert = useCallback((title: string, content: string) => {
    setAlertModal({
      open: true,
      title,
      content,
      type: 'alert',
      onConfirm: undefined,
    });
  }, []);

  const showConfirm = useCallback((title: string, content: string, onConfirm: () => void) => {
    setAlertModal({
      open: true,
      title,
      content,
      type: 'confirm',
      onConfirm,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    alertModal,
    showAlert,
    showConfirm,
    closeAlert,
  };
};
