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
  is_conversion: number;
  is_transmission: number;
}

export default function BasicTable() {
  const currentFactory = useRecoilValue(currentFactoryState);
  const [files, setFiles] = React.useState<File[]>([]);

  React.useEffect(() => {
    if (currentFactory !== null) {
      getFiles(currentFactory);
    }
  }, [currentFactory]);

  const getFiles = async (fc_idx: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/kamp_monitoring/files?fc_idx=${fc_idx}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch detections');
      }

      const data: File[] = await response.json();
      setFiles(data);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
          <TableHead>
            <TableRow>
              {cells.map((cell) => (
                <TableCell>{cell}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {files &&
              files.map((file) => (
                <TableRow key={file.af_idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{file.af_idx}</TableCell>
                  <TableCell>{file.af_name}</TableCell>
                  <TableCell>
                    <Checkbox checked={file.is_conversion === 1} />
                  </TableCell>
                  <TableCell>
                    <Checkbox checked={file.is_transmission === 1} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagenation count={files ? files.length : 0} />
    </>
  );
}

const cells = ['번호', '파일 이름', '데이터 변환 여부', '데이터 송신 여부'];
