import { useState, useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { navigationResetState, selectedBasesState, selectedBaseState } from '../recoil/atoms';
import { getBasesAPI, deleteBasesAPI } from '../apis/api/basic';
import { Base } from '../types/api';
import { Dayjs } from 'dayjs';
import { PAGINATION, MODAL_TYPE } from '../constants';
import { useSortableData, SortableColumn } from './useSortableData';

export const useBasicList = (navigate: any) => {
  const [selectedBases, setSelectedBases] = useRecoilState(selectedBasesState);
  const [, setSelectedBase] = useRecoilState(selectedBaseState);
  const navigationReset = useRecoilValue(navigationResetState);

  // 상태 관리
  const [bases, setBases] = useState<Base[]>([]);
  const [filteredBases, setFilteredBases] = useState<Base[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedFactory, setSelectedFactory] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertContent, setAlertContent] = useState('');
  const [alertType, setAlertType] = useState<'alert' | 'confirm'>(MODAL_TYPE.ALERT);

  const [rowsPerPage, setRowsPerPage] = useState<number>(PAGINATION.DEFAULT_ROWS_PER_PAGE);

  // 정렬 기능
  const {
    sortedData: sortedBases,
    sortField,
    sortDirection,
    handleSort,
  } = useSortableData<Base>(filteredBases, 'createdAt', 'desc');

  // 페이지네이션 데이터 계산
  const pagedData = sortedBases?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  const calculatedTotalPages = Math.ceil((filteredBases?.length || 0) / rowsPerPage);

  // 정렬 컬럼 정의
  const sortableColumns: SortableColumn<Base>[] = [
    { field: 'fc_name', label: '공장명' },
    { field: 'ab_name', label: '기초코드명' },
    { field: 'sn_length', label: '센서 개수' },
    { field: 'createdAt', label: '생성 일자' },
    { field: 'updatedAt', label: '수정 일자' },
    { field: 'ab_note', label: '비고' },
  ];

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((event: unknown, page: number) => {
    setCurrentPage(page);
  }, []);

  // 페이지 크기 변경 핸들러
  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    setRowsPerPage(newPageSize);
    setCurrentPage(0);
  }, []);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    setSearchKeyword('');
    setStartDate(null);
    setEndDate(null);
    setSelectedFactory('');
    setBases([]);
    setFilteredBases([]);
    setSelectedBases([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSelectedBases]);

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
      setAlertTitle('알림');
      setAlertContent('삭제할 항목을 선택해주세요.');
      setAlertType(MODAL_TYPE.ALERT);
      setAlertOpen(true);
      return;
    }

    setAlertTitle('확인');
    setAlertContent(`선택한 ${selectedBases.length}개 항목을 삭제하시겠습니까?`);
    setAlertType(MODAL_TYPE.CONFIRM);
    setAlertOpen(true);
  }, [selectedBases.length]);

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
      setCurrentPage(0);
    } catch (error) {
      setBases([]);
      setFilteredBases([]);
    }
  }, [selectedFactory, searchKeyword, startDate, endDate]);

  // 삭제 확인 핸들러
  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteBasesAPI(selectedBases);
      setBases(bases.filter((base) => !selectedBases.includes(base.ab_idx)));
      setSelectedBases([]);

      // 검색 상태를 유지하면서 현재 검색 조건으로 다시 검색
      await performSearch();
    } catch (err: any) {
      setAlertTitle('오류');
      setAlertContent('삭제 중 오류가 발생했습니다.');
      setAlertType(MODAL_TYPE.ALERT);
      setAlertOpen(true);
    }
  }, [selectedBases, bases, setSelectedBases, performSearch]);

  // 검색 핸들러
  const handleSearch = useCallback(async () => {
    if (!selectedFactory) {
      setAlertTitle('알림');
      setAlertContent('공장을 선택해주세요.');
      setAlertType(MODAL_TYPE.ALERT);
      setAlertOpen(true);
      return;
    }

    await performSearch();
  }, [selectedFactory, performSearch, setAlertTitle, setAlertContent, setAlertType, setAlertOpen]);

  // 날짜 변경 핸들러
  const handleDateChange = useCallback((newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, []);

  // 공장 변경 핸들러
  const handleFactoryChange = useCallback(
    (factoryId: number) => {
      setSelectedFactory(factoryId);
      setSelectedBases([]);
      // 공장 변경 시 기초코드 목록은 그대로 유지 (검색 버튼을 눌러야만 새로 조회)
    },
    [setSelectedBases]
  );

  // 행 클릭 핸들러
  const handleClick = useCallback(
    (base: Base) => {
      setSelectedBase(base);
      navigate(`/aas/basic/edit/${base.ab_idx}/view`);
    },
    [setSelectedBase, navigate]
  );

  // 추가 페이지 이동 핸들러
  const handleAdd = useCallback(() => {
    navigate('/aas/basic/add');
  }, [navigate]);

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
    if (navigationReset) {
      setSearchKeyword('');
      setStartDate(null);
      setEndDate(null);
      setSelectedFactory('');
      setBases([]);
      setFilteredBases([]);
      setSelectedBases([]);
    }
  }, [navigationReset, setSelectedBases]);

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
    alertOpen,
    alertTitle,
    alertContent,
    alertType,
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
