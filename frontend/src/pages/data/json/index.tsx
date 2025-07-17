import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import JSONList from './list';
import JSONDetail from './detail';

// 타입 명시
interface SearchCondition {
  selectedFactory: number | '';
  startDate: any;
  endDate: any;
}

export default function JSONManagerPage() {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [searchCondition, setSearchCondition] = useState<SearchCondition>({
    selectedFactory: '',
    startDate: null,
    endDate: null,
  });
  const [isSearchActive, setIsSearchActive] = useState(false);
  const listRef = useRef<any>(null);

  // 대시보드에서 전달받은 파일 ID가 있으면 바로 상세보기 모드로 전환
  useEffect(() => {
    if (location.state?.selectedFileId && location.state?.showDetail) {
      setSelectedFileId(location.state.selectedFileId);
      setViewMode('detail');
      // state 초기화
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleDetailClick = (fileId: number) => {
    setSelectedFileId(fileId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedFileId(null);
    setIsSearchActive(true); // 목록 복귀 시 자동 검색
  };

  if (viewMode === 'detail') {
    return <JSONDetail fileId={selectedFileId} onBackToList={handleBackToList} />;
  }

  return (
    <JSONList
      ref={listRef}
      onDetailClick={handleDetailClick}
      searchCondition={searchCondition}
      setSearchCondition={setSearchCondition}
      isSearchActive={isSearchActive}
      setIsSearchActive={setIsSearchActive}
    />
  );
}
