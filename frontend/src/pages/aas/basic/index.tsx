import React from 'react';
import { useBasicList } from '../../../hooks/useBasicList';
import { ListView } from '../../../components/basic/ListView';
import AlertModal from '../../../components/modal/alert';

export default function BasiccodePage() {
  const {
    // 상태
    startDate,
    endDate,
    searchKeyword,
    setSearchKeyword,
    pagedData,
    selectAll,
    selectedBases,
    alertOpen,
    alertTitle,
    alertContent,
    alertType,

    // 핸들러
    handleSearch,
    handleReset,
    handleDateChange,
    handleAdd,
    handleDelete,
    handlePageChange,
    handleSelectAllChange,
    handleCheckboxChange,
    handleClick,
    formatDate,
    handleConfirmDelete,
    handleCloseAlert,
  } = useBasicList();

  return (
    <div className='table-outer'>
      <ListView
        startDate={startDate}
        endDate={endDate}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        pagedData={pagedData}
        selectAll={selectAll}
        selectedBases={selectedBases}
        onSearch={handleSearch}
        onReset={handleReset}
        onDateChange={handleDateChange}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onSelectAllChange={handleSelectAllChange}
        onCheckboxChange={handleCheckboxChange}
        onClick={handleClick}
        formatDate={formatDate}
        currentPage={0}
        calculatedTotalPages={0}
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
