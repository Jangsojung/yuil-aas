import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getJSONFilesAPI } from '../../apis/api/json_manage';

interface JSONFile {
  af_idx: number;
  af_name: string;
  fc_idx: number;
  base_name: string;
  sn_length: number;
  createdAt: string;
}

type Props = {
  setSelectedFile: Dispatch<SetStateAction<JSONFile | undefined>>;
  selectedFactory?: number;
};

export default function SelectJSONFile({ setSelectedFile, selectedFactory }: Props) {
  const [files, setFiles] = useState<JSONFile[]>([]);
  const [currentFile, setCurrentFile] = useState<number | ''>('');

  const getFiles = async () => {
    try {
      if (!selectedFactory) {
        setFiles([]);
        setCurrentFile('');
        setSelectedFile(undefined);
        return;
      }

      const data = await getJSONFilesAPI('', '', selectedFactory);
      setFiles(data || []);

      setCurrentFile('');
      setSelectedFile(undefined);
    } catch (error) {
      setFiles([]);
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
  }, [selectedFactory]);

  return (
    <FormControl sx={{ width: '100%' }} size='small'>
      <Select value={currentFile} onChange={handleChange} IconComponent={ExpandMoreIcon} displayEmpty>
        <MenuItem disabled value='' className='menu-item-disabled'>
          JSON 파일을 선택해 주세요.
        </MenuItem>
        {files && files.length > 0 ? (
          files.map((file) => (
            <MenuItem key={file.af_idx} value={file.af_idx}>
              {file.af_name} ({file.base_name})
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled value=''>
            JSON 파일이 없습니다.
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
