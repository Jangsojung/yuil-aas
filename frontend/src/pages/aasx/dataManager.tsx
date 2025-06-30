import React, { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';
import Pagination from '../../components/pagination';
import DataTableRow from '../../components/aasx/data_management/DataTableRow';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { SearchBox, FilterBox } from '../../components/common';
import AlertModal from '../../components/modal/alert';
import { useWordManagement } from '../../hooks/useWordManagement';
import { useAlertModal } from '../../hooks/useAlertModal';

interface Word {
  as_kr: string;
  as_en: string;
}

export default function DataManagerPage() {
  const navigationReset = useRecoilValue(navigationResetState);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 커스텀 훅 사용
  const { alertModal, showAlert, closeAlert } = useAlertModal();
  const {
    words,
    filteredWords,
    selectedItems,
    modifiedData,
    editingValues,
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
    isSomeCurrentPageSelected,
    handleSearchKeywordChange,
    handleSearch,
  } = useWordManagement();

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const pagedData = filteredWords?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  const calculatedTotalPages = Math.ceil((filteredWords?.length || 0) / rowsPerPage);

  useEffect(() => {
    if (currentPage >= calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(0);
    }
  }, [currentPage, calculatedTotalPages]);

  useEffect(() => {
    getWords();
  }, [getWords]);

  const handleSaveClick = async () => {
    const result = await handleSave();
    if (result.success) {
      showAlert('알림', result.message);
    } else {
      showAlert('알림', result.message);
    }
  };

  const handleUnmatchedOnlyChange = (checked: boolean) => {
    handleUnmatchedOnly(checked);
  };

  const handleSelectAll = () => {
    handleSelectAllCurrentPage(pagedData, !isAllCurrentPageSelected(pagedData));
  };

  const checkAllCurrentPageSelected = () => {
    return isAllCurrentPageSelected(pagedData);
  };

  const checkSomeCurrentPageSelected = () => {
    return isSomeCurrentPageSelected(pagedData);
  };

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
                  placeholder='검색어 입력'
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </SearchBox>

      <FilterBox
        leftContent={
          <Grid container spacing={1} style={{ gap: '20px' }}>
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
                <TableCell sx={{ minWidth: '150px', width: '150px' }}>
                  <Checkbox checked={pagedData ? checkAllCurrentPageSelected() : false} onChange={handleSelectAll} />
                </TableCell>
                <TableCell sx={{ width: '50%' }}>한글명</TableCell>
                <TableCell sx={{ width: '50%' }}>식별 ID</TableCell>
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
                  <TableCell colSpan={3} align='center'>
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
          onPageChange={handlePageChange}
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
