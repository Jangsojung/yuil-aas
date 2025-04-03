import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';

import { useRecoilValue } from 'recoil';
import { currentFactoryState } from '../../recoil/atoms';
import Pagenation from '../../components/pagenation';

interface File {
  af_idx: number;
  af_name: string;
  createdAt: Date;
}

export default function BasicTable() {
  const currentFactory = useRecoilValue(currentFactoryState);
  const [files, setFiles] = React.useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = React.useState<number[]>([]);
  const [selectAll, setSelectAll] = React.useState(false);

  React.useEffect(() => {
    if (currentFactory !== null) {
      getFiles(currentFactory);
    }
  }, [currentFactory]);

  const getFiles = async (fc_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/kamp_monitoring/AASXfiles?af_kind=2&fc_idx=${fc_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: File[] = await response.json();
      setFiles(data);

      console.log(data);
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
            {files &&
              files.map((file) => (
                <TableRow key={file.af_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
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
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagenation count={files.length} />
    </>
  );
}

const cells = ['파일 IDX', '파일 이름', '생성 날짜'];
