import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../../recoil/atoms';
import { TextField } from '@mui/material';
import Grid from '@mui/system/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Checkbox, Table, TableBody, TableContainer, TableHead, TableRow } from '@mui/material';
import Pagination from '../../../components/pagination';
import DataTableRow from '../../../components/tableRow/DataTableRow';
import { SearchBox, FilterBox, SortableTableHeader } from '../../../components/common';
import AlertModal from '../../../components/modal/alert';
import { useWordManagement } from '../../../hooks/useWordManagement';
import { useAlertModal } from '../../../hooks/useAlertModal';
import { usePagination } from '../../../hooks/usePagination';
import { useSortableData, SortableColumn } from '../../../hooks/useSortableData';
import TableEmptyRow from '../../../components/common/TableEmptyRow';

// Word 타입 정의
interface Word {
  as_kr: string;
  as_en: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DataList() {
  const navigationReset = useRecoilValue(navigationResetState);

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
    { field: 'as_kr', label: '한글명', maxWidth: 262.695 },
    { field: 'as_en', label: '식별 ID', maxWidth: 262.695 },
    { field: 'createdAt', label: '생성 일자', maxWidth: 250 },
    { field: 'updatedAt', label: '수정 일자', maxWidth: 250 },
  ];

  const { currentPage, rowsPerPage, paginatedData, goToPage, handleRowsPerPageChange } = usePagination(
    sortedWords?.length || 0,
    -1 // 기본값: 전체
  );

  const pagedData = paginatedData(sortedWords || []);

  useEffect(() => {
    getWords();
  }, [getWords]);

  // 네비게이션 리셋 처리
  useEffect(() => {
    if (navigationReset) {
      // 검색 조건 초기화
      handleSearchKeywordChange('');
      handleUnmatchedOnly(false);
      // 데이터 다시 로드
      getWords();
    }
  }, [navigationReset, handleSearchKeywordChange, handleUnmatchedOnly, getWords]);

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
            color: 'primary',
          },
        ]}
      >
        <Grid container spacing={2}>
          <Grid size={3}>
            <Grid container spacing={1}>
              <Grid>
                <div className='sort-title'>검색어</div>
              </Grid>
              <Grid size={9}>
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

      <div className='list-header'>
        <Typography variant='h6' gutterBottom>
          식별 ID 목록
        </Typography>
        <FilterBox
          leftContent={
            <div>
              <Checkbox checked={showUnmatchedOnly} onChange={(e) => handleUnmatchedOnlyChange(e.target.checked)} />
              <p className='label'>매칭되지 않은 항목만 보기</p>
            </div>
          }
          buttons={[
            {
              text: '저장',
              onClick: handleSaveClick,
              color: 'primary',
            },
          ]}
        />
      </div>

      <div className='table-wrap'>
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <Table sx={{ minWidth: 650, tableLayout: 'fixed' }} aria-label='simple table'>
            <colgroup>
              <col style={{ width: '50px', minWidth: '50px', maxWidth: '50px' }} />
              <col style={{ maxWidth: '262.695px' }} />
              <col style={{ maxWidth: '262.695px' }} />
              <col style={{ maxWidth: '250px' }} />
              <col style={{ maxWidth: '250px' }} />
            </colgroup>
            <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
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
                <TableEmptyRow colSpan={5} />
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
