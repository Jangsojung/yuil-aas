import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useRecoilState } from 'recoil';
import { currentFileState } from '../../recoil/atoms';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getAASXFilesListAPI } from '../../apis/api/aasx_manage';

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
      const data = await getAASXFilesListAPI();
      setFiles(data);

      setCurrentFile(null);
      setSelectedFile(undefined);
    } catch (error) {
      console.error('Error fetching files:', error);
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
    <FormControl sx={{width: '100%' }} size='small'>
      <Select value={currentFile || ''} onChange={handleChange} IconComponent={ExpandMoreIcon} displayEmpty>
        <MenuItem disabled value='' className='menu-item-disabled'>
          aasx 파일을 선택해 주세요.
        </MenuItem>
        {files && files.length > 0 ? (
          files.map((file) => (
            <MenuItem key={file.af_idx} value={file.af_idx}>
              {file.af_name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled value=''>
            aasx 파일이 없습니다.
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
