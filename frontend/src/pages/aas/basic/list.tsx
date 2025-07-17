import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBasicList } from '../../../hooks/useBasicList';
import { ListView } from '../../../components/basic/ListView';
import AlertModal from '../../../components/modal/alert';
import { Dayjs } from 'dayjs';

interface SearchCondition {
  selectedFactory: number | '';
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  searchKeyword: string;
}

interface BasicListProps {
  searchCondition: SearchCondition;
  setSearchCondition: React.Dispatch<React.SetStateAction<SearchCondition>>;
  hasSearched: boolean;
  setHasSearched: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function BasicList({
  searchCondition,
  setSearchCondition,
  hasSearched,
  setHasSearched,
}: BasicListProps) {
  const navigate = useNavigate();
  const {
    // 상태
    startDate,
    endDate,
    searchKeyword,
    setSearchKeyword,
    selectedFactory,
    pagedData,
    selectAll,
    selectedBases,
    alertOpen,
    alertTitle,
    alertContent,
    alertType,
    currentPage,
    rowsPerPage,
    calculatedTotalPages,
    sortField,
    sortDirection,
    sortableColumns,

    // 핸들러
    handleSearch,
    handleReset,
    handleDateChange,
    handleFactoryChange,
    handleAdd,
    handleDelete,
    handlePageChange,
    handleRowsPerPageChange,
    handleSelectAllChange,
    handleCheckboxChange,
    handleClick,
    formatDate,
    handleConfirmDelete,
    handleCloseAlert,
    handleSort,
  } = useBasicList(navigate, searchCondition, setSearchCondition, hasSearched, setHasSearched);

  return (
    <div className='table-outer'>
      <ListView
        startDate={startDate}
        endDate={endDate}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        selectedFactory={selectedFactory}
        pagedData={pagedData}
        selectAll={selectAll}
        selectedBases={selectedBases}
        sortField={sortField}
        sortDirection={sortDirection}
        sortableColumns={sortableColumns}
        onSearch={handleSearch}
        onReset={handleReset}
        onDateChange={handleDateChange}
        onFactoryChange={handleFactoryChange}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSelectAllChange={handleSelectAllChange}
        onCheckboxChange={handleCheckboxChange}
        onClick={handleClick}
        formatDate={formatDate}
        onSort={handleSort}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        calculatedTotalPages={calculatedTotalPages}
      />

      <AlertModal
        open={alertOpen}
        handleClose={handleCloseAlert}
        title={alertTitle}
        content={alertContent}
        type={alertType}
        onConfirm={alertType === 'confirm' ? handleConfirmDelete : undefined}
      />
    </div>
  );
}
