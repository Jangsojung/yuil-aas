import { useCallback } from 'react';
import { useAlertModal } from './useAlertModal';

export const useErrorHandler = () => {
  const { showAlert } = useAlertModal();

  const handleError = useCallback(
    (error: any, defaultMessage: string = '오류가 발생했습니다.') => {
      let message = defaultMessage;

      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }

      showAlert('오류', message);
    },
    [showAlert]
  );

  const handleApiError = useCallback(
    (error: any, operation: string) => {
      handleError(error, `${operation} 중 오류가 발생했습니다.`);
    },
    [handleError]
  );

  return {
    handleError,
    handleApiError,
  };
};
