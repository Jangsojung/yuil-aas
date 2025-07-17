import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BasicList from './list';
import BasicCodeAdd from './add';
import BasicCodeEdit from './edit';
import dayjs, { Dayjs } from 'dayjs';

// 타입 명시
interface SearchCondition {
  selectedFactory: number | '';
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchKeyword: string;
}

export default function BasiccodePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editParams, setEditParams] = useState<{ id?: string; mode?: string }>({});
  const [searchCondition, setSearchCondition] = useState<SearchCondition>({
    selectedFactory: '',
    startDate: null,
    endDate: null,
    searchKeyword: '',
  });
  const [hasSearched, setHasSearched] = useState(false); // 검색을 했는지 여부

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const modeParam = searchParams.get('mode');
    const idParam = searchParams.get('id');
    if (modeParam === 'add') {
      setMode('add');
    } else if ((modeParam === 'edit' || modeParam === 'view') && idParam) {
      setEditParams({ id: idParam, mode: modeParam });
      setMode('edit');
    } else {
      setMode('list');
    }
  }, [location.search]);

  const handleBackToList = () => {
    navigate('/aas/basic');
    setMode('list');
    // 상세보기에서 목록으로 돌아올 때 검색 상태 유지
    if (location.state?.preserveSearch) {
      // 검색 조건이 있으면 검색 상태 유지
      if (
        searchCondition.selectedFactory &&
        (searchCondition.searchKeyword.trim() || searchCondition.startDate || searchCondition.endDate)
      ) {
        setHasSearched(true);
      }
    }
  };

  if (mode === 'add') {
    return <BasicCodeAdd />;
  }

  if (mode === 'edit') {
    return <BasicCodeEdit />;
  }

  return (
    <BasicList
      searchCondition={searchCondition}
      setSearchCondition={setSearchCondition}
      hasSearched={hasSearched}
      setHasSearched={setHasSearched}
    />
  );
}
