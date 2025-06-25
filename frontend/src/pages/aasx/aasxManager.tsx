import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import dayjs, { Dayjs } from 'dayjs';

import BasicDatePicker from '../../components/datepicker';
import ModalBasic from '../../components/modal/aasx_management';
import RemoveIcon from '@mui/icons-material/Remove';

import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Pagenation from '../../components/pagenation';
import { deleteAASXAPI, getFilesAPI } from '../../apis/api/aasx_manage';
import CustomizedDialogs from '../../components/modal/aasx_edit_modal';
import AASXTableRow from '../../components/aasx/aasx_management/AASXTableRow';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';

interface File {
  af_idx: number;
  af_name: string;
  createdAt: Date;
}

export default function AasxManagerPage() {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagedData = files?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const handleInsert = async (file: File) => {
    setFiles((prevFiles) => [file, ...prevFiles]);
  };

  const handleUpdate = async (newFile: File) => {
    const newFiles = files.map((file) => (file.af_idx === newFile.af_idx ? newFile : file));
    setFiles(newFiles);
  };

  const handleDelete = async () => {
    if (!window.confirm(`선택한 ${selectedFiles.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    const result = await deleteAASXAPI(selectedFiles);

    if (result) {
      setFiles(files.filter((f) => !selectedFiles.includes(f.af_idx)));
      setSelectedFiles([]);
      alert('선택한 항목이 삭제되었습니다.');
    }
  };

  const handleDateChange = (newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleSearch = () => {
    if (!startDate || !endDate) {
      alert('날짜를 선택해주세요.');
      return;
    }

    getFiles();
  };

  const handleReset = () => {
    const defaultStart = dayjs().subtract(1, 'month');
    const defaultEnd = dayjs();
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    setSelectedFiles([]);
    getFiles(defaultStart, defaultEnd);
  };

  const getFiles = async (start = startDate, end = endDate) => {
    const startDateStr = start ? dayjs(start).format('YYYY-MM-DD') : '';
    const endDateStr = end ? dayjs(end).format('YYYY-MM-DD') : '';

    const data: File[] = await getFilesAPI(startDateStr, endDateStr);
    setFiles(data);
  };

  const handleSelectAllChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      if (files && files.length > 0) {
        setSelectedFiles(files.map((file) => file.af_idx));
      }
    } else {
      setSelectedFiles([]);
    }
  };

  const handleCheckboxChange = (fileIdx: number) => {
    setSelectedFiles((prevSelected) => {
      if (prevSelected.includes(fileIdx)) {
        return prevSelected.filter((idx) => idx !== fileIdx);
      } else {
        return [...prevSelected, fileIdx];
      }
    });
  };

  const handleDoubleClick = (file: File) => {
    setSelectedFile(file);
    setOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setSelectedFile(null);
  };

  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedFiles([]);
    setSelectAll(false);
    setCurrentPage(0);
    setOpenUpdateModal(false);
    setSelectedFile(null);
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setSelectAll(false);
    } else if (selectedFiles.length === files.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedFiles, files]);

  return (
    <div className='table-outer'>
      <Box sx={{ flexGrow: 1 }} className='sort-box'>
        <Grid container spacing={1}>
          <Grid size={8}>
            <Grid container spacing={1} style={{ gap: '20px' }}>
              <Grid>
                <Grid container spacing={1}>
                  <Grid className='d-flex gap-5'>
                    <div className='sort-title'>날짜</div>
                  </Grid>
                  <Grid>
                    <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={4}>
            <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
              <Button variant='contained' color='success' onClick={handleSearch}>
                조회
              </Button>
              <Button variant='contained' color='success' onClick={handleReset}>
                초기화
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Grid container spacing={1} style={{ marginTop: '5px' }}>
          <Grid size={12}>
            <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
              <ModalBasic handleInsert={handleInsert} />
              <Button variant='contained' color='error' onClick={handleDelete} disabled={selectedFiles.length === 0}>
                <RemoveIcon /> 파일삭제
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
      <div className='table-wrap'>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    disabled={!files || files.length === 0}
                  />
                </TableCell>
                {cells.map((cell, idx) => (
                  <TableCell key={idx}>{cell}</TableCell>
                ))}
                <TableCell>수정</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((file, idx) => (
                  <AASXTableRow
                    file={file}
                    key={idx}
                    onCheckboxChange={handleCheckboxChange}
                    checked={selectedFiles.includes(file.af_idx)}
                    onEditClick={handleDoubleClick}
                    index={currentPage * rowsPerPage + idx}
                    totalCount={files.length}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={cells.length + 2} align='center'>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagenation count={files ? files.length : 0} onPageChange={handlePageChange} />
      </div>
      <CustomizedDialogs
        open={openUpdateModal}
        handleClose={handleCloseUpdateModal}
        fileData={selectedFile}
        handleUpdate={handleUpdate}
      />
    </div>
  );
}

// const cells = ['파일 번호', '파일 이름', '생성 날짜'];
const cells = ['번호', '파일명', '생성 날짜'];
