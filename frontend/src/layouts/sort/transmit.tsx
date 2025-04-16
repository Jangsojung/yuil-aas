import * as React from 'react';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import SelectAASXFile from '../../components/select/aasx_files';

import styled from '@mui/system/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { aasxDataState, currentFileState, isVerifiedState } from '../../recoil/atoms';

const Item = styled('div')(({ theme }) => ({
  backgroundColor: '#fff',
  border: '1px solid',
  borderColor: '#ced7e0',
  padding: theme.spacing(1),
  borderRadius: '4px',
  textAlign: 'center',
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
    borderColor: '#444d58',
  }),
}));

interface AASXFile {
  af_idx: number;
  af_name: string;
}

export default function Sort() {
  const currentFile = useRecoilValue(currentFileState);
  const [, setAasxData] = useRecoilState(aasxDataState);
  const [isVerified, setIsVerified] = useRecoilState(isVerifiedState);
  const [selectedFile, setSelectedFile] = React.useState<AASXFile | undefined>(undefined);

  React.useEffect(() => {
    if (currentFile) {
      setIsVerified(false);
    }
  }, [currentFile]);

  const handleVerify = async () => {
    try {
      if (!selectedFile) {
        console.error('선택된 파일이 없습니다');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/file/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: selectedFile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AASX data');
      }

      const rawData = await response.json();
      const transformedData = transformAASXData(rawData);

      setAasxData(transformedData);
      setIsVerified(true);
      setSelectedFile(undefined);
      console.log('AASX file verified:', transformedData);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const transformAASXData = (rawData) => {
    if (!rawData || !rawData.assetAdministrationShells || !rawData.submodels) {
      console.error('유효하지 않은 AASX 데이터 형식');
      return null;
    }

    const result = {
      AAS: [],
    };

    rawData.assetAdministrationShells.forEach((aas) => {
      const aasItem = {
        name: aas.idShort || 'AAS',
        url: aas.id,
        of: aas.assetInformation?.assetKind || '',
        AssetInformation: {
          Unit1: aas.assetInformation?.globalAssetId || '',
        },
        submodelRefs: aas.submodels?.map((sm) => sm.keys[0]?.value) || [],
      };

      result.AAS.push(aasItem);
    });

    result.SM = [];

    rawData.submodels.forEach((submodel) => {
      const smResult = {
        name: submodel.idShort,
        url: submodel.id,
      };

      if (submodel.submodelElements && submodel.submodelElements.length > 0) {
        smResult.SMC = [];

        submodel.submodelElements.forEach((element) => {
          if (element.modelType === 'SubmodelElementCollection') {
            const smcResult = {
              name: element.idShort,
              elements: element.value?.length || 0,
            };

            if (element.value && element.value.length > 0) {
              smcResult.items = [];

              element.value.forEach((item) => {
                if (item.modelType === 'SubmodelElementCollection') {
                  const childCollection = {
                    name: item.idShort,
                    elements: item.value?.length || 0,
                  };

                  if (item.value && item.value.length > 0) {
                    childCollection.Prop = item.value.map((prop) => ({
                      name: prop.idShort,
                      value: prop.value,
                    }));
                  }

                  smcResult.items.push(childCollection);
                }
              });
            }

            smResult.SMC.push(smcResult);
          }
        });
      }

      const parentAAS = result.AAS.filter((aas) => aas.submodelRefs && aas.submodelRefs.includes(submodel.id));

      if (parentAAS.length > 0) {
        smResult.parentAAS = parentAAS.map((aas) => aas.url);
      }

      result.SM.push(smResult);
    });

    return result;
  };

  return (
    <Box sx={{ flexGrow: 1 }} className='sort-box'>
      <Grid container spacing={1}>
        <Grid size={8}>
          <Grid container spacing={1}>
            <Grid size={12}>
              <Grid container spacing={1}>
                <Grid>
                  <div className='sort-title'>AASX 파일</div>
                </Grid>
                <Grid>
                  <SelectAASXFile setSelectedFile={setSelectedFile} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={4}>
          <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
            <Button variant='contained' color='success' onClick={handleVerify} disabled={!currentFile}>
              검증하기
            </Button>
            {/* <Button variant='contained' color='primary' onClick={handleRegister} disabled={!currentFile}>
              등록
            </Button> */}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
