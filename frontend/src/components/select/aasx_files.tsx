import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useRecoilState } from 'recoil';
import { currentFileState } from '../../recoil/atoms';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface AASXFile {
  af_idx: number;
  af_name: string;
}

type Props = {
  setSelectedFile: Dispatch<SetStateAction<AASXFile | undefined>>;
};

export default function SelectSmall({ setSelectedFile }: Props) {
  const [files, setFiles] = useState<AASXFile[]>([]);
  const [currentFile, setCurrentFile] = useRecoilState(currentFileState);

  const getFiles = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/file/aasxFiles`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data: AASXFile[] = await response.json();
      setFiles(data);
      setCurrentFile(data[0].af_idx);
      setSelectedFile(data[0]);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleChange = (event: any) => {
    const selectedId = event.target.value;
    setCurrentFile(selectedId);
    const selected = files.find((f) => f.af_idx === selectedId);
    setSelectedFile(selected);
  };

  useEffect(() => {
    getFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
      <Select value={currentFile || ''} onChange={handleChange} IconComponent={ExpandMoreIcon} displayEmpty>
        {files &&
          files.map((file) => (
            <MenuItem key={file.af_idx} value={file.af_idx}>
              {file.af_name}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}
