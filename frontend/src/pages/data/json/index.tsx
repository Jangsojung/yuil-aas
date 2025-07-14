import React, { useState, useRef } from 'react';
import JSONList from './list';
import JSONDetail from './detail';

// 타입 명시
interface SearchCondition {
  selectedFactory: number | '';
  startDate: any;
  endDate: any;
}

export default function JSONManagerPage() {
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [searchCondition, setSearchCondition] = useState<SearchCondition>({
    selectedFactory: '',
    startDate: null,
    endDate: null,
  });
  const [isSearchActive, setIsSearchActive] = useState(false);
  const listRef = useRef<any>(null);

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
