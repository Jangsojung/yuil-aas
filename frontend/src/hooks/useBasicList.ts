import { useState, useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../recoil/atoms';
import { getBasesAPI, deleteBasesAPI } from '../apis/api/basic';
import { useAlertModal } from './useAlertModal';
import { useSortableData } from './useSortableData';
import { usePagination } from './usePagination';
import { Base } from '../types/api';
import { Dayjs } from 'dayjs';

interface SearchCondition {
  selectedFactory: number | '';
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchKeyword: string;
}

export const useBasicList = (
  navigate: any,
  searchCondition: SearchCondition,
  setSearchCondition: React.Dispatch<React.SetStateAction<SearchCondition>>,
  hasSearched: boolean,
  setHasSearched: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const navigationReset = useRecoilValue(navigationResetState);
  const { alertModal, showAlert, showConfirm, closeAlert } = useAlertModal();

  // 상태 관리
  const [bases, setBases] = useState<Base[]>([]);
  const [filteredBases, setFilteredBases] = useState<Base[]>([]);
  const [selectedBases, setSelectedBases] = useState<number[]>([]);
  const [, setSelectedBase] = useState<Base | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  // 검색 조건을 props에서 가져오기
  const { searchKeyword, startDate, endDate, selectedFactory } = searchCondition;

  // 정렬 및 페이지네이션
  const { sortedData, sortField, sortDirection, handleSort } = useSortableData<Base>(
    filteredBases,
    'createdAt',
    'desc'
  );
  const { currentPage, rowsPerPage, paginatedData, goToPage, handleRowsPerPageChange } = usePagination(
    sortedData?.length || 0
  );
  const pagedData = paginatedData(sortedData || []);

  // 정렬 컬럼 정의
  const sortableColumns = [
    { field: 'fc_name' as keyof Base, label: '공장명' },
    { field: 'ab_name' as keyof Base, label: '기초코드명' },
    { field: 'sn_length' as keyof Base, label: '센서 개수' },
    { field: 'createdAt' as keyof Base, label: '생성 일자' },
    { field: 'updatedAt' as keyof Base, label: '수정 일자' },
    { field: 'ab_note' as keyof Base, label: '비고', sortable: false },
  ];

  const calculatedTotalPages = Math.ceil((sortedData?.length || 0) / rowsPerPage);

  // 검색 로직을 별도 함수로 분리
  const performSearch = useCallback(async () => {
    if (!selectedFactory) {
      return;
    }

    try {
      const data = await getBasesAPI(selectedFactory);
      const fetchedBases = Array.isArray(data) ? data : [];
      setBases(fetchedBases);

      let filtered = fetchedBases;

      if (searchKeyword.trim().length > 0) {
        filtered = filtered.filter(
          (base) => base.ab_name && base.ab_name.toLowerCase().includes(searchKeyword.toLowerCase())
        );
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
      goToPage(0);
    } catch (error) {
      setBases([]);
      setFilteredBases([]);
    }
  }, [selectedFactory, searchKeyword, startDate, endDate, goToPage]);

  // 삭제 확인 핸들러
  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteBasesAPI(selectedBases);
      setBases(bases.filter((base) => !selectedBases.includes(base.ab_idx)));
      setSelectedBases([]);

      // 검색 상태를 유지하면서 현재 검색 조건으로 다시 검색
      await performSearch();
    } catch (err: any) {
      showAlert('오류', '삭제 중 오류가 발생했습니다.');
    }
  }, [selectedBases, bases, setSelectedBases, performSearch, showAlert]);

  // 검색 핸들러
  const handleSearch = useCallback(async () => {
    if (!selectedFactory) {
      showAlert('알림', '공장을 선택해주세요.');
      return;
    }

    await performSearch();
    setHasSearched(true); // 검색 버튼을 눌렀을 때만 hasSearched를 true로 설정
  }, [selectedFactory, performSearch, showAlert, setHasSearched]);

  // 리셋 핸들러
  const handleReset = useCallback(() => {
    setSearchCondition({
      selectedFactory: '',
      startDate: null,
      endDate: null,
      searchKeyword: '',
    });
    setSelectedBases([]);
    setBases([]);
    setFilteredBases([]);
    setHasSearched(false); // 리셋 시 검색 상태도 초기화
    navigate('/aas/basic');
  }, [navigate, setSearchCondition, setHasSearched]);

  // 전체 선택 체크박스 핸들러
  const handleSelectAllChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setSelectAll(checked);

      if (!pagedData?.length) return;

      const currentPageIds = pagedData.map((base) => base.ab_idx);
      setSelectedBases((prevSelected) => {
        const prevArray = Array.isArray(prevSelected) ? prevSelected : [];
        return checked
          ? [...Array.from(new Set([...prevArray, ...currentPageIds]))]
          : prevArray.filter((id) => !currentPageIds.includes(id));
      });
    },
    [pagedData, setSelectedBases]
  );

  // 개별 체크박스 핸들러
  const handleCheckboxChange = useCallback(
    (baseIdx: number) => {
      setSelectedBases((prevSelected) => {
        const prevArray = Array.isArray(prevSelected) ? prevSelected : [];
        return prevArray.includes(baseIdx) ? prevArray.filter((idx) => idx !== baseIdx) : [...prevArray, baseIdx];
      });
    },
    [setSelectedBases]
  );

  // 삭제 핸들러
  const handleDelete = useCallback(() => {
    if (selectedBases.length === 0) {
      showAlert('알림', '삭제할 항목을 선택해주세요.');
      return;
    }

    showConfirm('확인', `선택한 ${selectedBases.length}개 항목을 삭제하시겠습니까?`, handleConfirmDelete);
  }, [selectedBases.length, showAlert, showConfirm, handleConfirmDelete]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (event: unknown, page: number) => {
      goToPage(page);
    },
    [goToPage]
  );

  // 날짜 변경 핸들러
  const handleDateChange = useCallback(
    (newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
      setSearchCondition((prev) => ({
        ...prev,
        startDate: newStartDate,
        endDate: newEndDate,
      }));
    },
    [setSearchCondition]
  );

  // 공장 변경 핸들러
  const handleFactoryChange = useCallback(
    (factoryId: number) => {
      setSearchCondition((prev) => ({
        ...prev,
        selectedFactory: factoryId,
      }));
      setSelectedBases([]);
      // 공장 변경 시 기초코드 목록은 그대로 유지 (검색 버튼을 눌러야만 새로 조회)
    },
    [setSearchCondition, setSelectedBases]
  );

  // 검색어 변경 핸들러
  const setSearchKeyword = useCallback(
    (keyword: string) => {
      setSearchCondition((prev) => ({
        ...prev,
        searchKeyword: keyword,
      }));
    },
    [setSearchCondition]
  );

  // 행 클릭 핸들러
  const handleClick = useCallback(
    (base: Base) => {
      setSelectedBase(base);
      navigate(`/aas/basic?mode=view&id=${base.ab_idx}`);
    },
    [setSelectedBase, navigate]
  );

  // 추가 페이지 이동 핸들러
  const handleAdd = useCallback(() => {
    navigate('/aas/basic?mode=add');
  }, [navigate]);

  // 알림 모달 닫기 핸들러
  const handleCloseAlert = useCallback(() => {
    closeAlert();
  }, [closeAlert]);

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
      goToPage(0);
    }
  }, [currentPage, calculatedTotalPages, goToPage]);

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

  // hasSearched가 true일 때 검색 실행
  useEffect(() => {
    if (hasSearched) {
      handleSearch();
    }
  }, [hasSearched, handleSearch]);

  useEffect(() => {
    if (navigationReset) {
      setSearchCondition({
        selectedFactory: '',
        startDate: null,
        endDate: null,
        searchKeyword: '',
      });
      setBases([]);
      setFilteredBases([]);
      setSelectedBases([]);
      setHasSearched(false);
    }
  }, [navigationReset, setSearchCondition, setSelectedBases, setHasSearched]);

  return {
    // 상태
    bases,
    filteredBases,
    selectAll,
    startDate,
    endDate,
    searchKeyword,
    setSearchKeyword,
    selectedFactory,
    currentPage,
    rowsPerPage,
    pagedData,
    calculatedTotalPages,
    alertOpen: alertModal.open,
    alertTitle: alertModal.title,
    alertContent: alertModal.content,
    alertType: alertModal.type,
    selectedBases,
    sortField,
    sortDirection,
    sortableColumns,

    // 핸들러
    handlePageChange,
    handleRowsPerPageChange,
    handleReset,
    handleSelectAllChange,
    handleCheckboxChange,
    handleDelete,
    handleConfirmDelete,
    handleSearch,
    handleDateChange,
    handleFactoryChange,
    handleClick,
    handleAdd,
    handleCloseAlert,
    formatDate,
    handleSort,
  };
};
