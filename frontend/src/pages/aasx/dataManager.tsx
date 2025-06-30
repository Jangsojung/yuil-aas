import React, { useEffect, useState } from 'react';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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
  const [searchType, setSearchType] = useState('fg_name');
  const navigationReset = useRecoilValue(navigationResetState);
  const [currentPage, setCurrentPage] = useState(0);
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
  } = useWordManagement();

  const rowsPerPage = 10;

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
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

  const handleSearch = () => {
    getWords();
  };

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
                <div className='sort-title'>검색구분</div>
              </Grid>
              <Grid item xs={9}>
                <FormControl sx={{ width: '100%' }} size='small'>
                  <Select value={searchType} onChange={(e) => setSearchType(e.target.value)} displayEmpty>
                    <MenuItem value='fg_name'>설비그룹</MenuItem>
                    <MenuItem value='fa_name'>설비명</MenuItem>
                    <MenuItem value='sn_name'>센서명</MenuItem>
                  </Select>
                </FormControl>
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
        <Pagination count={filteredWords?.length || 0} page={currentPage} onPageChange={handlePageChange} />
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
