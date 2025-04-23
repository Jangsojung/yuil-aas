import React, { useEffect, useState } from 'react';
import TransmitView from '../../section/aas/transmit/view';
import Box from '@mui/system/Box';
import Grid from '@mui/system/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import SelectAASXFile from '../../components/select/aasx_files';
import { useRecoilState, useRecoilValue } from 'recoil';
import { aasxDataState, currentFileState, isVerifiedState } from '../../recoil/atoms';
import { handleVerifyAPI } from '../../apis/api/transmit';

interface AASXFile {
  af_idx: number;
  af_name: string;
}

export default function TransmitPage() {
  const currentFile = useRecoilValue(currentFileState);
  const [, setAasxData] = useRecoilState(aasxDataState);
  const [, setIsVerified] = useRecoilState(isVerifiedState);
  const [selectedFile, setSelectedFile] = useState<AASXFile | undefined>(undefined);

  const handleVerify = async () => {
    if (!selectedFile) {
      alert('선택된 파일이 없습니다.');
      return;
    }

    const rawData = await handleVerifyAPI(selectedFile);
    if (rawData) {
      const transformedData = transformAASXData(rawData);

      setAasxData(transformedData);
      setIsVerified(true);
      setSelectedFile(undefined);
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

  useEffect(() => {
    if (currentFile) {
      setIsVerified(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFile]);

  return (
    <div>
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
            </Stack>
          </Grid>
        </Grid>
      </Box>
      <TransmitView />
    </div>
  );
}
