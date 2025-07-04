import React, { useEffect } from 'react';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';
import Pagination from '../../../components/pagination';
import DataTableRow from '../../../components/tableRow/DataTableRow';
import { SearchBox, FilterBox, SortableTableHeader } from '../../../components/common';
import AlertModal from '../../../components/modal/alert';
import { useWordManagement } from '../../../hooks/useWordManagement';
import { useAlertModal } from '../../../hooks/useAlertModal';
import { usePagination } from '../../../hooks/usePagination';
import { useSortableData, SortableColumn } from '../../../hooks/useSortableData';

// Word 타입 정의
interface Word {
  as_kr: string;
  as_en: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DataList() {
  // 커스텀 훅 사용
  const { alertModal, showAlert, closeAlert } = useAlertModal();
  const {
    filteredWords,
    showUnmatchedOnly,
    searchKeyword,
    getWords,
    handleUnmatchedOnly,
    handleItemCheckboxChange,
    handleSelectAllCurrentPage,
    handleEnglishChange,
    handleSave,
    getEditingValue,
    isItemSelected,
    isAllCurrentPageSelected,
    handleSearchKeywordChange,
    handleSearch,
  } = useWordManagement();

  // 정렬 기능
  const {
    sortedData: sortedWords,
    sortField,
    sortDirection,
    handleSort,
  } = useSortableData(filteredWords, 'as_kr', 'asc');

  // 정렬 컬럼 정의
  const sortableColumns: SortableColumn<Word>[] = [
    { field: 'as_kr', label: '한글명' },
    { field: 'as_en', label: '식별 ID' },
    { field: 'createdAt', label: '생성 일자' },
    { field: 'updatedAt', label: '수정 일자' },
  ];

  const { currentPage, rowsPerPage, paginatedData, goToPage, handleRowsPerPageChange } = usePagination(
    sortedWords?.length || 0,
    -1 // 기본값: 전체
  );

  const pagedData = paginatedData(sortedWords || []);

  useEffect(() => {
    getWords();
  }, [getWords]);

  const handleSaveClick = async () => {
    const result = await handleSave();
    showAlert('알림', result.message);
  };

  const handleUnmatchedOnlyChange = (checked: boolean) => {
    handleUnmatchedOnly(checked);
  };

  const handleSelectAll = () => {
    handleSelectAllCurrentPage(pagedData, !isAllCurrentPageSelected(pagedData));
  };

  const checkAllCurrentPageSelected = () => isAllCurrentPageSelected(pagedData);

  return (
    <div className='table-outer'>
      <SearchBox
        buttons={[
          {
            text: '검색',
            onClick: handleSearch,
            color: 'success',
          },
        ]}
      >
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Grid container spacing={1}>
              <Grid item>
                <div className='sort-title'>검색어</div>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  size='small'
                  value={searchKeyword}
                  onChange={(e) => handleSearchKeywordChange(e.target.value)}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </SearchBox>

      <FilterBox
        leftContent={
          <Grid container spacing={1} className='flex-center-gap-lg'>
            <Grid item>
              <Grid container spacing={1}>
                <Grid item className='d-flex gap-5'>
                  <Checkbox checked={showUnmatchedOnly} onChange={(e) => handleUnmatchedOnlyChange(e.target.checked)} />
                  매칭되지 않은 항목만 보기
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        }
        buttons={[
          {
            text: '저장',
            onClick: handleSaveClick,
            color: 'primary',
          },
        ]}
      />

      <div className='table-wrap'>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <SortableTableHeader
                  columns={sortableColumns}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  showCheckbox={true}
                  onSelectAllChange={handleSelectAll}
                  selectAll={pagedData ? checkAllCurrentPageSelected() : false}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((item, index) => (
                  <DataTableRow
                    key={`${item.as_kr}-${item.as_en}-${index}`}
                    data={item}
                    checked={isItemSelected(item)}
                    editingValue={getEditingValue(item)}
                    onCheckboxChange={handleItemCheckboxChange}
                    onEnglishChange={handleEnglishChange}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={filteredWords?.length || 0}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, page) => goToPage(page)}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>

      <AlertModal
        open={alertModal.open}
        handleClose={closeAlert}
        title={alertModal.title}
        content={alertModal.content}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </div>
  );
}

// const cells = ['한글명', '식별 ID', '생성 일자', '수정 일자'];
