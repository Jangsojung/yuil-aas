import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { aasxDataState, currentFileState, isVerifiedState, navigationResetState } from '../../recoil/atoms';
import { handleVerifyAPI } from '../../apis/api/transmit';
import SelectAASXFile from '../../components/select/aasx_files';
import TransmitView from '../../section/aas/transmit/view';
import { Grid } from '@mui/material';
import { SearchBox, FilterBox } from '../../components/common';
import Pagination from '../../components/pagination';
import AlertModal from '../../components/modal/alert';
import { buildTransmitTreeDataAPI } from '../../apis/api/transmit';

interface AASXFile {
  af_idx: number;
  af_name: string;
}

export default function TransmitPage() {
  const currentFile = useRecoilValue(currentFileState);
  const aasxData = useRecoilValue(aasxDataState);
  const [, setAasxData] = useRecoilState(aasxDataState);
  const [, setIsVerified] = useRecoilState(isVerifiedState);
  const [, setCurrentFile] = useRecoilState(currentFileState);
  const [selectedFile, setSelectedFile] = useState<AASXFile | undefined>(undefined);
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage] = useState(10);
  const [insertMode, setInsertMode] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    content: '',
    type: 'alert' as 'alert' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });

  const handleVerify = async () => {
    if (selectedFile === undefined) {
      setAlertModal({
        open: true,
        title: '알림',
        content: '선택된 파일이 없습니다.',
        type: 'alert',
        onConfirm: undefined,
      });
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

  const transformAASXData = (rawData: any) => {
    if (!rawData || !rawData.assetAdministrationShells || !rawData.submodels) {
      console.error('유효하지 않은 AASX 데이터 형식');
      return null;
    }

    const result: any = {
      AAS: [],
    };

    rawData.assetAdministrationShells.forEach((aas: any) => {
      const aasItem = {
        name: aas.idShort || 'AAS',
        url: aas.id,
        of: aas.assetInformation?.assetKind || '',
        AssetInformation: {
          Unit1: aas.assetInformation?.globalAssetId || '',
        },
        submodelRefs: aas.submodels?.map((sm: any) => sm.keys[0]?.value) || [],
      };

      result.AAS.push(aasItem);
    });

    result.SM = [];

    rawData.submodels.forEach((submodel: any) => {
      const smResult: any = {
        name: submodel.idShort,
        url: submodel.id,
      };

      if (submodel.submodelElements && submodel.submodelElements.length > 0) {
        smResult.SMC = [];

        submodel.submodelElements.forEach((element: any) => {
          if (element.modelType === 'SubmodelElementCollection') {
            const smcResult: any = {
              name: element.idShort,
              elements: element.value?.length || 0,
            };

            if (element.value && element.value.length > 0) {
              smcResult.items = [];

              element.value.forEach((item: any) => {
                if (item.modelType === 'SubmodelElementCollection') {
                  const childCollection: any = {
                    name: item.idShort,
                    elements: item.value?.length || 0,
                  };

                  if (item.value && item.value.length > 0) {
                    childCollection.Prop = item.value.map((prop: any) => ({
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

      const parentAAS = result.AAS.filter((aas: any) => aas.submodelRefs && aas.submodelRefs.includes(submodel.id));

      if (parentAAS.length > 0) {
        smResult.parentAAS = parentAAS.map((aas: any) => aas.url);
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

  useEffect(() => {
    setSelectedFile(undefined);
    setAasxData(null);
    setIsVerified(false);
    setCurrentFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationReset]);

  const handleInsertMode = async () => {
    setInsertMode(true);
    setTreeLoading(true);
    try {
      const facilitiesAll = await buildTransmitTreeDataAPI();
      setTreeData(facilitiesAll);
    } catch (err) {
      setTreeData([]);
    } finally {
      setTreeLoading(false);
    }
  };

  const pagedData = aasxData?.AAS?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const calculatedTotalPages = Math.ceil((aasxData?.AAS?.length || 0) / rowsPerPage);

  useEffect(() => {
    if (currentPage >= calculatedTotalPages && calculatedTotalPages > 0) {
      setCurrentPage(0);
    }
  }, [currentPage, calculatedTotalPages]);

  return (
    <div>
      <SearchBox
        buttons={[
          {
            text: '검증하기',
            onClick: handleVerify,
            color: 'success',
            disabled: !currentFile,
          },
        ]}
      >
        <Grid container spacing={1}>
          <Grid item xs={8}>
            <Grid container spacing={1}>
              <Grid item>
                <div className='sort-title'>AASX 파일</div>
              </Grid>
              <Grid item xs={10}>
                <SelectAASXFile setSelectedFile={setSelectedFile} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </SearchBox>
      <TransmitView />
    </div>
  );
}
