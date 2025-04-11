import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentFacilityGroupState, currentFactoryState, currentFileState } from '../../recoil/atoms';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface AASXFile {
  af_idx: number;
  af_name: string;
}

export default function SelectSmall() {
  const [files, setFiles] = React.useState<AASXFile[]>([]);
  const [currentFile, setCurrentFile] = useRecoilState(currentFileState);

  React.useEffect(() => {
    getFiles();
  }, []);

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
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const handleChange = (event: any) => {
    setCurrentFile(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
      <Select value={currentFile} onChange={handleChange} IconComponent={ExpandMoreIcon}>
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
