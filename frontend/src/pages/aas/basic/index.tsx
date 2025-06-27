import React, { ChangeEvent, useEffect, useState } from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Pagination from '../../../components/pagination';
import { useRecoilState, useRecoilValue } from 'recoil';
import { navigationResetState, selectedBasesState, selectedBaseState } from '../../../recoil/atoms';
import BasicDatePicker from '../../../components/datepicker';
import { Dayjs } from 'dayjs';
import AlertModal from '../../../components/modal/alert';
import { getBasesAPI, deleteBasesAPI } from '../../../apis/api/basic';
import { SearchBox, ActionBox } from '../../../components/common';

interface Base {
  ab_idx: number;
  ab_name: string;
  ab_note: string;
  sn_length: number;
  createdAt: Date;
}

const cells = ['기초코드명', '센서 개수', '생성 일자', '비고'];

export default function BasiccodePage() {
  const [selectedBases, setSelectedBases] = useRecoilState(selectedBasesState);
  const [bases, setBases] = useState<Base[]>([]);
  const [filteredBases, setFilteredBases] = useState<Base[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBase, setSelectedBase] = useRecoilState(selectedBaseState);
  const navigationReset = useRecoilValue(navigationResetState);

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertContent, setAlertContent] = useState('');
  const [alertType, setAlertType] = useState<'alert' | 'confirm'>('alert');

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleReset = () => {
    setSearchKeyword('');
    setStartDate(null);
    setEndDate(null);
    getBases();
  };

  const pagedData = filteredBases?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  useEffect(() => {
    if (selectedBases.length === 0) {
      setSelectAll(false);
    } else if (pagedData && pagedData.length > 0) {
      const currentPageIds = pagedData.map((base) => base.ab_idx);
      const allCurrentPageSelected = currentPageIds.every((id) => selectedBases.includes(id));
      setSelectAll(allCurrentPageSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedBases, pagedData]);

  useEffect(() => {
    setFilteredBases(bases);
  }, [bases]);

  useEffect(() => {
    getBases();
  }, []);

  useEffect(() => {
    if (navigationReset) {
      getBases();
      setSearchKeyword('');
      setStartDate(null);
      setEndDate(null);
      setSelectedBases([]);
    }
  }, [navigationReset]);

  const getBases = async () => {
    try {
      const data = await getBasesAPI();
      setBases(data);
    } catch (error) {
      console.error('Error fetching bases:', error);
    }
  };

  const handleSelectAllChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      if (pagedData && pagedData.length > 0) {
        setSelectedBases((prevSelected) => {
          const currentPageIds = pagedData.map((base) => base.ab_idx);
          const newSelected = [...prevSelected];
          currentPageIds.forEach((id) => {
            if (!newSelected.includes(id)) {
              newSelected.push(id);
            }
          });
          return newSelected;
        });
      }
    } else {
      if (pagedData && pagedData.length > 0) {
        const currentPageIds = pagedData.map((base) => base.ab_idx);
        setSelectedBases((prevSelected) => prevSelected.filter((id) => !currentPageIds.includes(id)));
      }
    }
  };

  const handleCheckboxChange = (baseIdx: number) => {
    setSelectedBases((prevSelected) => {
      if (prevSelected.includes(baseIdx)) {
        return prevSelected.filter((idx) => idx !== baseIdx);
      } else {
        return [...prevSelected, baseIdx];
      }
    });
  };

  const handleDelete = async () => {
    if (selectedBases.length === 0) {
      setAlertTitle('알림');
      setAlertContent('삭제할 항목을 선택해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    setAlertTitle('확인');
    setAlertContent(`선택한 ${selectedBases.length}개 항목을 삭제하시겠습니까?`);
    setAlertType('confirm');
    setAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBasesAPI(selectedBases);
      setBases(bases.filter((base) => !selectedBases.includes(base.ab_idx)));
      setSelectedBases([]);
      setAlertTitle('알림');
      setAlertContent('선택한 항목이 삭제되었습니다.');
      setAlertType('alert');
      setAlertOpen(true);
      handleReset();
    } catch (err: any) {
      console.log(err.message);
      setAlertTitle('오류');
      setAlertContent('삭제 중 오류가 발생했습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    }
  };

  const handleSearch = () => {
    let filtered = bases;

    if (searchKeyword.trim()) {
      filtered = filtered.filter((base) => base.ab_name.toLowerCase().includes(searchKeyword.toLowerCase()));
    }

    if (startDate || endDate) {
      filtered = filtered.filter((base) => {
        if (!base.createdAt) return false;

        const baseDate = new Date(base.createdAt);
        const baseDateOnly = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

        if (startDate && endDate) {
          const start = startDate.toDate();
          const end = endDate.toDate();
          return baseDateOnly >= start && baseDateOnly <= end;
        } else if (startDate) {
          const start = startDate.toDate();
          return baseDateOnly >= start;
        } else if (endDate) {
          const end = endDate.toDate();
          return baseDateOnly <= end;
        }

        return true;
      });
    }

    setFilteredBases(filtered);
    setCurrentPage(0);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  const handleDateChange = (newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleClick = (base: Base) => {
    setSelectedBase(base);
    window.location.href = `/aas/basic/edit/${base.ab_idx}/view`;
  };

  const handleAdd = () => {
    window.location.href = '/aas/basic/add';
  };

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
            {
              text: '초기화',
              onClick: handleReset,
              color: 'inherit',
              variant: 'outlined',
            },
          ]}
        >
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>기초코드명</div>
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    size='small'
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder='기초코드명을 입력하세요'
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>날짜</div>
                </Grid>
                <Grid item xs={9}>
                  <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </SearchBox>

        <ActionBox
          buttons={[
            {
              text: '기초코드 등록',
              onClick: handleAdd,
              color: 'success',
            },
            {
              text: '삭제',
              onClick: handleDelete,
              color: 'error',
            },
          ]}
        />
      </div>

      <div className='table-wrap'>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox checked={selectAll} onChange={handleSelectAllChange} />
                </TableCell>
                {cells.map((cell, idx) => (
                  <TableCell key={idx}>{cell}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((base, idx) => (
                  <TableRow
                    key={base.ab_idx}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    onClick={() => handleClick(base)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedBases.includes(base.ab_idx)}
                        onChange={() => handleCheckboxChange(base.ab_idx)}
                      />
                    </TableCell>
                    <TableCell>{base.ab_name}</TableCell>
                    <TableCell>{base.sn_length || 0}</TableCell>
                    <TableCell>{formatDate(base.createdAt?.toString())}</TableCell>
                    <TableCell>{base.ab_note}</TableCell>
                  </TableRow>
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
        <Pagination count={filteredBases ? filteredBases.length : 0} onPageChange={handlePageChange} />
      </div>
      <AlertModal
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        title={alertTitle}
        content={alertContent}
        type={alertType}
        onConfirm={alertType === 'confirm' ? handleConfirmDelete : undefined}
      />
    </div>
  );
}
