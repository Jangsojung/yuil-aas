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
  files?: AASXFile[];
  disabled?: boolean;
};

export default function SelectSmall({ setSelectedFile, files: externalFiles, disabled = false }: Props) {
  const [files, setFiles] = useState<AASXFile[]>([]);
  const [currentFile, setCurrentFile] = useRecoilState(currentFileState);

  const getFiles = async () => {
    const data = await getAASXFilesListAPI();
    setFiles(data);

    setCurrentFile(null);
    setSelectedFile(undefined);
  };

  const handleChange = (event: any) => {
    const selectedId = event.target.value;
    setCurrentFile(selectedId);
    const selected = (externalFiles || files).find((f) => f.af_idx === selectedId);
    setSelectedFile(selected);
  };

  useEffect(() => {
    if (!externalFiles) {
      getFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalFiles]);

  // 외부에서 전달받은 파일 목록이 있으면 사용
  const displayFiles = externalFiles || files;

  return (
    <FormControl sx={{ width: '100%' }} size='small'>
      <Select
        value={currentFile || ''}
        onChange={handleChange}
        IconComponent={ExpandMoreIcon}
        displayEmpty
        disabled={disabled}
      >
        <MenuItem disabled value='' className='menu-item-disabled'>
          {disabled
            ? '공장을 먼저 선택해주세요'
            : displayFiles && displayFiles.length > 0
              ? 'aasx 파일을 선택해 주세요.'
              : 'aasx 파일이 없습니다.'}
        </MenuItem>
        {displayFiles && displayFiles.length > 0
          ? displayFiles.map((file) => (
              <MenuItem key={file.af_idx} value={file.af_idx}>
                {file.af_name}
              </MenuItem>
            ))
          : null}
      </Select>
    </FormControl>
  );
}
