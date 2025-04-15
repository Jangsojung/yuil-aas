import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';

import { useRecoilState, useRecoilValue } from 'recoil';
import {
  currentFactoryState,
  dataTableRefreshTriggerState,
  dateRangeAASXState,
  selectedDataFilesState,
} from '../../recoil/atoms';
import Pagenation from '../../components/pagenation';
import dayjs, { Dayjs } from 'dayjs';
import CustomizedDialogs from '../modal/aasx_edit_modal';

interface File {
  af_idx: number;
  af_name: string;
  createdAt: Date;
}

const cells = ['파일 번호', '파일 이름', '생성 날짜'];
export default function BasicTable() {
  const currentFactory = useRecoilValue(currentFactoryState);
  const [files, setFiles] = React.useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useRecoilState(selectedDataFilesState);
  const refreshTrigger = useRecoilValue(dataTableRefreshTriggerState);
  const [selectAll, setSelectAll] = React.useState(false);

  const [openUpdateModal, setOpenUpdateModal] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const dateRange = useRecoilValue(dateRangeAASXState);

  React.useEffect(() => {
    if (currentFactory !== null) {
      setSelectedFiles([]);
      getFiles();
    }
  }, [refreshTrigger, currentFactory]);

  React.useEffect(() => {
    if (selectedFiles.length === 0) {
      setSelectAll(false);
    } else if (selectedFiles.length === files.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedFiles, files]);

  const getFiles = async () => {
    try {
      const startDateStr = dateRange.startDate ? dayjs(dateRange.startDate).format('YYYY-MM-DD') : '';
      const endDateStr = dateRange.endDate ? dayjs(dateRange.endDate).format('YYYY-MM-DD') : '';

      const response = await fetch(
        `http://localhost:5001/api/kamp_monitoring/AASXfiles?af_kind=3&fc_idx=3&startDate=${startDateStr}&endDate=${endDateStr}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: File[] = await response.json();
      setFiles(data);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedFiles(files.map((file) => file.af_idx));
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

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox checked={selectAll} onChange={handleSelectAllChange} />
              </TableCell>
              {cells.map((cell) => (
                <TableCell>{cell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {files ? (
              files.map((file) => (
                <TableRow
                  key={file.af_idx}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                  onDoubleClick={() => handleDoubleClick(file)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedFiles.includes(file.af_idx)}
                      onChange={() => handleCheckboxChange(file.af_idx)}
                    />
                  </TableCell>
                  <TableCell>{file.af_idx}</TableCell>
                  <TableCell>{file.af_name}</TableCell>
                  <TableCell>{new Date(file.createdAt).toLocaleDateString()}</TableCell>
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
      <Pagenation count={files ? files.length : 0} />
      <CustomizedDialogs open={openUpdateModal} handleClose={handleCloseUpdateModal} fileData={selectedFile} />
    </>
  );
}
