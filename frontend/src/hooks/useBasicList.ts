import { useState, useCallback, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { navigationResetState, selectedBasesState, selectedBaseState } from '../recoil/atoms';
import { getBasesAPI, deleteBasesAPI } from '../apis/api/basic';
import { Base } from '../types/api';
import { Dayjs } from 'dayjs';
import { PAGINATION, MODAL_TYPE } from '../constants';
import { useSortableData, SortableColumn } from './useSortableData';

export const useBasicList = () => {
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
    resetSort,
  } = useSortableData<Base>(filteredBases, 'createdAt', 'desc');

  // 페이지네이션 데이터 계산
  const pagedData = sortedBases?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  const calculatedTotalPages = Math.ceil((filteredBases?.length || 0) / rowsPerPage);

  // 정렬 컬럼 정의
  const sortableColumns: SortableColumn<Base>[] = [
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
    getBases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 삭제 확인 핸들러
  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteBasesAPI(selectedBases);
      setBases(bases.filter((base) => !selectedBases.includes(base.ab_idx)));
      setSelectedBases([]);
      setAlertTitle('알림');
      setAlertContent('선택한 항목이 삭제되었습니다.');
      setAlertType(MODAL_TYPE.ALERT);
      setAlertOpen(true);
      handleReset();
    } catch (err: any) {
      console.error('삭제 중 오류:', err.message);
      setAlertTitle('오류');
      setAlertContent('삭제 중 오류가 발생했습니다.');
      setAlertType(MODAL_TYPE.ALERT);
      setAlertOpen(true);
    }
  }, [selectedBases, bases, setSelectedBases, handleReset]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    let filtered = bases;

    if (searchKeyword.trim().length > 0) {
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
    return date
      .toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(/\. /g, '.')
      .replace(',', '');
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
    handleClick,
    handleAdd,
    handleCloseAlert,
    formatDate,
    handleSort,
  };
};
