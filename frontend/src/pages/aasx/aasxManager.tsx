import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import dayjs, { Dayjs } from 'dayjs';
import { TextField } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import BasicDatePicker from '../../components/datepicker';
import ModalBasic from '../../components/modal/aasx_management';
import RemoveIcon from '@mui/icons-material/Remove';

import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Pagination from '../../components/pagination';
import { deleteAASXAPI, getFilesAPI } from '../../apis/api/aasx_manage';
import CustomizedDialogs from '../../components/modal/aasx_edit_modal';
import AASXTableRow from '../../components/aasx/aasx_management/AASXTableRow';
import { useRecoilValue } from 'recoil';
import { navigationResetState } from '../../recoil/atoms';
import { SearchBox, ActionBox } from '../../components/common';
import AlertModal from '../../components/modal/alert';

interface File {
  af_idx: number;
  af_name: string;
  af_size: number;
  createdAt: string;
}

interface AASXFile {
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
  const [openInsertModal, setOpenInsertModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<AASXFile | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });

  const rowsPerPage = 10;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagedData = files?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const calculatedTotalPages = Math.ceil((files?.length || 0) / rowsPerPage);

  useEffect(() => {
    if (currentPage >= calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(0);
    }
  }, [currentPage, calculatedTotalPages]);

  const handleInsert = async (file: File) => {
    setFiles((prevFiles) => [file, ...prevFiles]);
  };

  const handleInsertFile = (file: AASXFile) => {
    const newFile: File = {
      af_idx: file.af_idx,
      af_name: file.af_name,
      af_size: 0, // 기본값 설정
      createdAt: file.createdAt.toISOString(),
    };
    setFiles((prevFiles) => [newFile, ...prevFiles]);
  };

  const handleUpdate = (newFile: AASXFile) => {
    const newFiles = files.map((file) =>
      file.af_idx === newFile.af_idx
        ? {
            ...file,
            af_name: newFile.af_name,
            createdAt: newFile.createdAt.toISOString(),
          }
        : file
    );
    setFiles(newFiles);
  };

  const handleDelete = async () => {
    if (selectedFiles.length === 0) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '삭제할 파일을 선택해주세요.',
        type: 'alert',
        onConfirm: undefined,
      });
      return;
    }

    setAlertModal({
      open: true,
      title: '파일 삭제',
      content: `선택한 ${selectedFiles.length}개의 파일을 삭제하시겠습니까?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          await deleteAASXAPI(selectedFiles);

          setAlertModal({
            open: true,
            title: '알림',
            content: '선택한 항목이 삭제되었습니다.',
            type: 'alert',
            onConfirm: undefined,
          });

          setSelectedFiles([]);
          getFiles();
        } catch (error) {
          console.error('삭제 중 오류 발생:', error);
          setAlertModal({
            open: true,
            title: '오류',
            content: '삭제 중 오류가 발생했습니다.',
            type: 'alert',
            onConfirm: undefined,
          });
        }
      },
    });
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
    const aasxFile: AASXFile = {
      af_idx: file.af_idx,
      af_name: file.af_name,
      createdAt: new Date(file.createdAt),
    };
    setSelectedFile(aasxFile);
    setOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setSelectedFile(null);
  };

  const handleCloseInsertModal = () => {
    setOpenInsertModal(false);
  };

  const handleCloseAlert = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
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
    setOpenInsertModal(false);
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
        <Grid container spacing={1} style={{ gap: '20px' }}>
          <Grid item>
            <Grid container spacing={1}>
              <Grid item className='d-flex gap-5'>
                <div className='sort-title'>날짜</div>
              </Grid>
              <Grid item>
                <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </SearchBox>

      <ActionBox
        buttons={[
          {
            text: '파일등록',
            onClick: () => setOpenInsertModal(true),
            color: 'success',
          },
          {
            text: '파일삭제',
            onClick: handleDelete,
            color: 'error',
          },
        ]}
      />

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
        <Pagination count={files ? files.length : 0} page={currentPage} onPageChange={handlePageChange} />
      </div>
      <CustomizedDialogs
        open={openUpdateModal}
        handleClose={handleCloseUpdateModal}
        fileData={selectedFile}
        handleUpdate={handleUpdate}
      />
      <CustomizedDialogs
        open={openInsertModal}
        handleClose={handleCloseInsertModal}
        fileData={null}
        handleUpdate={handleInsertFile}
      />
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

const cells = ['파일명', '생성 일자'];
