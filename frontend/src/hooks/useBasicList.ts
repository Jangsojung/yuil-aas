import { useState, useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { navigationResetState, selectedBasesState, selectedBaseState } from '../recoil/atoms';
import { getBasesAPI, deleteBasesAPI } from '../apis/api/basic';
import { Dayjs } from 'dayjs';

interface Base {
  ab_idx: number;
  ab_name: string;
  ab_note: string;
  sn_length: number;
  createdAt: Date;
}

export const useBasicList = () => {
  const [selectedBases, setSelectedBases] = useRecoilState(selectedBasesState);
  const [selectedBase, setSelectedBase] = useRecoilState(selectedBaseState);
  const navigationReset = useRecoilValue(navigationResetState);

  // 상태 관리
  const [bases, setBases] = useState<Base[]>([]);
  const [filteredBases, setFilteredBases] = useState<Base[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertContent, setAlertContent] = useState('');
  const [alertType, setAlertType] = useState<'alert' | 'confirm'>('alert');

  const rowsPerPage = 10;

  // 페이지네이션 데이터 계산
  const pagedData = filteredBases?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  const calculatedTotalPages = Math.ceil((filteredBases?.length || 0) / rowsPerPage);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((event: unknown, page: number) => {
    setCurrentPage(page);
  }, []);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    setSearchKeyword('');
    setStartDate(null);
    setEndDate(null);
    getBases();
  }, []);

  // 기초코드 목록 조회
  const getBases = useCallback(async () => {
    try {
      const data = await getBasesAPI();
      setBases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bases:', error);
      setBases([]);
    }
  }, []);

  // 전체 선택 체크박스 핸들러
  const handleSelectAllChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setSelectAll(checked);

      if (checked) {
        if (pagedData && pagedData.length > 0) {
          setSelectedBases((prevSelected) => {
            const prevArray = Array.isArray(prevSelected) ? prevSelected : [];
            const currentPageIds = pagedData.map((base) => base.ab_idx);
            const newSelected = [...prevArray];
            currentPageIds.forEach((id) => {
              if (!newSelected.includes(id)) {
                newSelected.push(id);
              }
            });
            return newSelected;
          });
        }
      } else {
        if (pagedData && pagedData.length > 0) {
          const currentPageIds = pagedData.map((base) => base.ab_idx);
          setSelectedBases((prevSelected) => {
            const prevArray = Array.isArray(prevSelected) ? prevSelected : [];
            return prevArray.filter((id) => !currentPageIds.includes(id));
          });
        }
      }
    },
    [pagedData, setSelectedBases]
  );

  // 개별 체크박스 핸들러
  const handleCheckboxChange = useCallback(
    (baseIdx: number) => {
      setSelectedBases((prevSelected) => {
        const prevArray = Array.isArray(prevSelected) ? prevSelected : [];
        if (prevArray.includes(baseIdx)) {
          return prevArray.filter((idx) => idx !== baseIdx);
        } else {
          return [...prevArray, baseIdx];
        }
      });
    },
    [setSelectedBases]
  );

  // 삭제 핸들러
  const handleDelete = useCallback(() => {
    if (selectedBases.length === 0) {
      setAlertTitle('알림');
      setAlertContent('삭제할 항목을 선택해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    setAlertTitle('확인');
    setAlertContent(`선택한 ${selectedBases.length}개 항목을 삭제하시겠습니까?`);
    setAlertType('confirm');
    setAlertOpen(true);
  }, [selectedBases.length]);

  // 삭제 확인 핸들러
  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteBasesAPI(selectedBases);
      setBases(bases.filter((base) => !selectedBases.includes(base.ab_idx)));
      setSelectedBases([]);
      setAlertTitle('알림');
      setAlertContent('선택한 항목이 삭제되었습니다.');
      setAlertType('alert');
      setAlertOpen(true);
      handleReset();
    } catch (err: any) {
      console.log(err.message);
      setAlertTitle('오류');
      setAlertContent('삭제 중 오류가 발생했습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    }
  }, [selectedBases, bases, setSelectedBases, handleReset]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    let filtered = bases;

    if (searchKeyword.trim()) {
      filtered = filtered.filter((base) => base.ab_name.toLowerCase().includes(searchKeyword.toLowerCase()));
    }

    if (startDate || endDate) {
      filtered = filtered.filter((base) => {
        if (!base.createdAt) return false;

        const baseDate = new Date(base.createdAt);
        const baseDateOnly = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

        if (startDate && endDate) {
          const start = startDate.toDate();
          const end = endDate.toDate();
          return baseDateOnly >= start && baseDateOnly <= end;
        } else if (startDate) {
          const start = startDate.toDate();
          return baseDateOnly >= start;
        } else if (endDate) {
          const end = endDate.toDate();
          return baseDateOnly <= end;
        }

        return true;
      });
    }

    setFilteredBases(filtered);
    setCurrentPage(0);
  }, [bases, searchKeyword, startDate, endDate]);

  // 날짜 변경 핸들러
  const handleDateChange = useCallback((newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  // 행 클릭 핸들러
  const handleClick = useCallback(
    (base: Base) => {
      setSelectedBase(base);
      window.location.href = `/aas/basic/edit/${base.ab_idx}/view`;
    },
    [setSelectedBase]
  );

  // 추가 페이지 이동 핸들러
  const handleAdd = useCallback(() => {
    window.location.href = '/aas/basic/add';
  }, []);

  // 알림 모달 닫기 핸들러
  const handleCloseAlert = useCallback(() => {
    setAlertOpen(false);
  }, []);

  // 날짜 포맷팅
  const formatDate = useCallback((dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }, []);

  // Effects
  useEffect(() => {
    if (currentPage >= calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(0);
    }
  }, [currentPage, calculatedTotalPages]);

  useEffect(() => {
    if (selectedBases.length === 0) {
      setSelectAll(false);
    } else if (pagedData && pagedData.length > 0) {
      const currentPageIds = pagedData.map((base) => base.ab_idx);
      const allCurrentPageSelected = currentPageIds.every((id) => selectedBases.includes(id));
      setSelectAll(allCurrentPageSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedBases, pagedData]);

  useEffect(() => {
    setFilteredBases(bases);
  }, [bases]);

  useEffect(() => {
    getBases();
  }, [getBases]);

  useEffect(() => {
    if (navigationReset) {
      getBases();
      setSearchKeyword('');
      setStartDate(null);
      setEndDate(null);
      setSelectedBases([]);
    }
  }, [navigationReset, getBases, setSelectedBases]);

  return {
    // 상태
    bases,
    filteredBases,
    selectAll,
    startDate,
    endDate,
    searchKeyword,
    setSearchKeyword,
    currentPage,
    pagedData,
    calculatedTotalPages,
    alertOpen,
    alertTitle,
    alertContent,
    alertType,
    selectedBases,

    // 핸들러
    handlePageChange,
    handleReset,
    handleSelectAllChange,
    handleCheckboxChange,
    handleDelete,
    handleConfirmDelete,
    handleSearch,
    handleDateChange,
    handleClick,
    handleAdd,
    handleCloseAlert,
    formatDate,
  };
};
