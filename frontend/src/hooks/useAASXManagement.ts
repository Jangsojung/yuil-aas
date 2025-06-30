import { useState, useCallback } from 'react';
import { getAASXFilesAPI, deleteAASXAPI } from '../apis/api/aasx_manage';
import { AASXFile } from '../types/api';

export const useAASXManagement = () => {
  const [aasxFiles, setAasxFiles] = useState<AASXFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const getAASXFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAASXFilesAPI();
      if (response && Array.isArray(response)) {
        setAasxFiles(response);
      } else {
        setAasxFiles([]);
      }
    } catch (error) {
      console.error('AASX 파일 목록을 가져오는 중 오류 발생:', error);
      setAasxFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileSelect = useCallback((fileId: number, checked: boolean) => {
    setSelectedFiles((prev) => {
      if (checked) {
        return prev.includes(fileId) ? prev : [...prev, fileId];
      } else {
        return prev.filter((id) => id !== fileId);
      }
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allFileIds = aasxFiles.map((file) => file.af_idx);
        setSelectedFiles(allFileIds);
      } else {
        setSelectedFiles([]);
      }
    },
    [aasxFiles]
  );

  const handleDeleteFiles = useCallback(
    async (fileIds: number[]) => {
      try {
        await Promise.all(fileIds.map((fileId) => deleteAASXAPI(fileId)));
        await getAASXFiles();
        setSelectedFiles([]);
        return { success: true, message: '파일이 삭제되었습니다.' };
      } catch (error) {
        console.error('파일 삭제 중 오류 발생:', error);
        return { success: false, message: '파일 삭제 중 오류가 발생했습니다.' };
      }
    },
    [getAASXFiles]
  );

  const filteredFiles = useCallback(() => {
    if (!searchTerm.trim()) {
      return aasxFiles;
    }
    return aasxFiles.filter((file) => file.af_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [aasxFiles, searchTerm]);

  const isAllSelected = useCallback(() => {
    return aasxFiles.length > 0 && selectedFiles.length === aasxFiles.length;
  }, [aasxFiles.length, selectedFiles.length]);

  const isSomeSelected = useCallback(() => {
    return selectedFiles.length > 0 && selectedFiles.length < aasxFiles.length;
  }, [aasxFiles.length, selectedFiles.length]);

  return {
    aasxFiles,
    loading,
    selectedFiles,
    searchTerm,
    setSearchTerm,
    getAASXFiles,
    handleFileSelect,
    handleSelectAll,
    handleDeleteFiles,
    filteredFiles,
    isAllSelected,
    isSomeSelected,
  };
};
