import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';

import Pagination from '../../components/pagination';
import { getWordsAPI, updateWordsAPI } from '../../apis/api/data_manage';
import DataTableRow from '../../components/aasx/data_management/DataTableRow';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { SearchBox, FilterBox } from '../../components/common';
import AlertModal from '../../components/modal/alert';

interface Word {
  as_kr: string;
  as_en: string;
}

export default function DataManagerPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [isSelected, setIsSelected] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Word[]>([]);
  const [modifiedData, setModifiedData] = useState<{ [key: string]: string }>({});
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});
  const [searchType, setSearchType] = useState('fg_name');
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUnmatchedOnly, setShowUnmatchedOnly] = useState(false);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });

  const rowsPerPage = 10;

  const handlePageChange = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const pagedData = filteredWords?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const getWords = async () => {
    try {
      const response = await getWordsAPI();
      if (response) {
        setWords(response);
        // 필터링 상태에 따라 filteredWords 설정
        if (isSelected) {
          const unmatchedWords = response.filter((word) => !word.as_en || word.as_en.trim() === '');
          setFilteredWords(unmatchedWords);
        } else {
          setFilteredWords(response);
        }
      }
    } catch (error) {
      console.error('단어 목록을 가져오는 중 오류 발생:', error);
    }
  };

  const handleSearch = () => {
    getWords();
  };

  const handleSave = async () => {
    if (Object.keys(modifiedData).length === 0) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '수정된 데이터가 없습니다.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    const invalidEntries = Object.keys(modifiedData).filter((key) => {
      const [as_kr, original_as_en] = key.split('|');
      const new_as_en = modifiedData[key];

      const validPattern = /^[a-zA-Z0-9_]+$/;
      return !validPattern.test(new_as_en);
    });

    if (invalidEntries.length > 0) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '식별 ID는 영어, 숫자, _만 사용 가능합니다.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    setAlertModal({
      open: true,
      title: '확인',
      content: `${Object.keys(modifiedData).length}건의 변경사항을 저장하시겠습니까?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          const updates = Object.keys(modifiedData).map((key) => {
            const [as_kr, original_as_en] = key.split('|');
            const new_as_en = modifiedData[key];

            return {
              as_kr: as_kr,
              original_as_en: original_as_en,
              new_as_en: new_as_en,
            };
          });

          await updateWordsAPI(updates);

          setAlertModal({
            open: true,
            title: '알림',
            content: '저장되었습니다.',
            type: 'alert',
            onConfirm: undefined,
          });
          setModifiedData({});
          setEditingValues({});
          setSelectedItems([]);

          await getWords();
        } catch (error) {
          console.error('저장 중 오류 발생:', error);
          setAlertModal({
            open: true,
            title: '오류',
            content: '저장 중 오류가 발생했습니다.',
            type: 'alert',
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handleUnmatchedOnly = (checked: boolean) => {
    setIsSelected(checked);
    if (checked) {
      const unmatchedWords = words.filter((word) => !word.as_en || word.as_en.trim() === '');
      setFilteredWords(unmatchedWords);
    } else {
      setFilteredWords(words);
    }
    setCurrentPage(0);
  };

  const handleItemCheckboxChange = (item: Word) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((selected) => selected.as_kr === item.as_kr && selected.as_en === item.as_en);
      if (isSelected) {
        const key = `${item.as_kr}|${item.as_en}`;
        setModifiedData((prevData) => {
          const newData = { ...prevData };
          delete newData[key];
          return newData;
        });
        setEditingValues((prevData) => {
          const newData = { ...prevData };
          delete newData[key];
          return newData;
        });
        return prev.filter((selected) => !(selected.as_kr === item.as_kr && selected.as_en === item.as_en));
      } else {
        return [...prev, item];
      }
    });
  };

  const handleEnglishChange = (originalData: Word, newEnglish: string) => {
    const key = `${originalData.as_kr}|${originalData.as_en}`;
    setEditingValues((prev) => ({
      ...prev,
      [key]: newEnglish,
    }));

    if (newEnglish !== originalData.as_en) {
      setModifiedData((prev) => ({
        ...prev,
        [key]: newEnglish,
      }));
    } else {
      setModifiedData((prev) => {
        const newData = { ...prev };
        delete newData[key];
        return newData;
      });
    }
  };

  const getEditingValue = (item: Word) => {
    const key = `${item.as_kr}|${item.as_en}`;
    return editingValues[key] || item.as_en;
  };

  const handleSelectAll = () => {
    const currentPageItems = pagedData || [];
    const currentPageSelected = selectedItems.filter((item) =>
      currentPageItems.some((pageItem) => pageItem.as_kr === item.as_kr && pageItem.as_en === item.as_en)
    );

    if (currentPageSelected.length === currentPageItems.length) {
      setSelectedItems((prev) =>
        prev.filter(
          (item) => !currentPageItems.some((pageItem) => pageItem.as_kr === item.as_kr && pageItem.as_en === item.as_en)
        )
      );
    } else {
      const newSelectedItems = [...selectedItems];
      currentPageItems.forEach((item) => {
        if (!newSelectedItems.some((selected) => selected.as_kr === item.as_kr && selected.as_en === item.as_en)) {
          newSelectedItems.push(item);
        }
      });
      setSelectedItems(newSelectedItems);
    }
  };

  const isItemSelected = (item: Word) => {
    return selectedItems.some((selected) => selected.as_kr === item.as_kr && selected.as_en === item.as_en);
  };

  const isAllCurrentPageSelected = () => {
    const currentPageItems = pagedData || [];
    if (currentPageItems.length === 0) return false;

    return currentPageItems.every((item) =>
      selectedItems.some((selected) => selected.as_kr === item.as_kr && selected.as_en === item.as_en)
    );
  };

  const isSomeCurrentPageSelected = () => {
    const currentPageItems = pagedData || [];
    if (currentPageItems.length === 0) return false;

    const selectedCount = currentPageItems.filter((item) =>
      selectedItems.some((selected) => selected.as_kr === item.as_kr && selected.as_en === item.as_en)
    ).length;

    return selectedCount > 0 && selectedCount < currentPageItems.length;
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    getWords();
    setIsSelected(false);
    setCurrentPage(0);
    setSearchType('fg_name');
    setSelectedItems([]);
    setModifiedData({});
    setEditingValues({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  useEffect(() => {
    if (isSelected) {
      const unmatchedWords = words.filter((word) => !word.as_en || word.as_en.trim() === '');
      setFilteredWords(unmatchedWords);
    } else {
      setFilteredWords(words);
    }
  }, [words, isSelected]);

  return (
    <div className='table-outer'>
      <div>
        <SearchBox
          buttons={[
            {
              text: '검색',
              onClick: handleSearch,
              color: 'success',
            },
          ]}
        >
          <Grid container spacing={1}>
            <Grid item>
              <div className='sort-title'>검색</div>
            </Grid>

            <Grid item xs={2}>
              <FormControl sx={{ m: 0, width: '100%' }} size='small'>
                <Select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                  <MenuItem value='fg_name'>설비그룹명</MenuItem>
                  <MenuItem value='fa_name'>설비명</MenuItem>
                  <MenuItem value='sn_name'>센서명</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={7}>
              <FormControl sx={{ m: 0, width: '100%' }} size='small'>
                <TextField />
              </FormControl>
            </Grid>
          </Grid>
        </SearchBox>

        <FilterBox
          leftContent={
            <Grid container spacing={1} style={{ gap: '20px' }}>
              <Grid item>
                <Grid container spacing={1}>
                  <Grid item className='d-flex gap-5'>
                    <Checkbox checked={isSelected} onChange={(e) => handleUnmatchedOnly(e.target.checked)} /> 매칭되지
                    않은 항목만 보기
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          }
          buttons={[
            {
              text: '저장',
              onClick: handleSave,
              color: 'primary',
            },
          ]}
        />
      </div>

      <div className='table-wrap'>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: '150px', width: '150px' }}>
                  <Checkbox checked={isAllCurrentPageSelected()} onChange={handleSelectAll} />
                </TableCell>
                {cells.map((cell, idx) => (
                  <TableCell
                    key={idx}
                    sx={{
                      width: '50%',
                    }}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((word, idx) => (
                  <DataTableRow
                    key={idx}
                    data={word}
                    totalCount={filteredWords.length}
                    checked={isItemSelected(word)}
                    editingValue={getEditingValue(word)}
                    onCheckboxChange={handleItemCheckboxChange}
                    onEnglishChange={handleEnglishChange}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={cells.length + 1} align='center'>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={filteredWords ? filteredWords.length : 0}
          page={currentPage}
          onPageChange={handlePageChange}
        />
      </div>

      <AlertModal
        open={alertModal.open}
        handleClose={handleCloseAlert}
        title={alertModal.title}
        content={alertModal.content}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </div>
  );
}

const cells = ['한글', '영어'];
