import { AASXData, AASItem, SubmodelItem, SubmodelElementCollection, ChildCollection, Property } from '../types/api';

export const transformAASXData = (rawData: any): AASXData | null => {
  if (!rawData || !rawData.assetAdministrationShells || !rawData.submodels) {
    console.error('유효하지 않은 AASX 데이터 형식');
    return null;
  }

  const result: AASXData = {
    AAS: [],
    SM: [],
  };

  // AAS 데이터 변환
  rawData.assetAdministrationShells.forEach((aas: any) => {
    const aasItem: AASItem = {
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

  // Submodel 데이터 변환
  rawData.submodels.forEach((submodel: any) => {
    const smResult: SubmodelItem = {
      name: submodel.idShort,
      url: submodel.id,
    };

    if (submodel.submodelElements && submodel.submodelElements.length > 0) {
      smResult.SMC = [];

      submodel.submodelElements.forEach((element: any) => {
        if (element.modelType === 'SubmodelElementCollection') {
          const smcResult: SubmodelElementCollection = {
            name: element.idShort,
            elements: element.value?.length || 0,
          };

          if (element.value && element.value.length > 0) {
            smcResult.items = [];

            element.value.forEach((item: any) => {
              if (item.modelType === 'SubmodelElementCollection') {
                const childCollection: ChildCollection = {
                  name: item.idShort,
                  elements: item.value?.length || 0,
                };

                if (item.value && item.value.length > 0) {
                  childCollection.Prop = item.value.map(
                    (prop: any): Property => ({
                      name: prop.idShort,
                      value: prop.value,
                    })
                  );
                }

                smcResult.items!.push(childCollection);
              }
            });
          }

          smResult.SMC!.push(smcResult);
        }
      });
    }

    // 부모 AAS 찾기
    const parentAAS = result.AAS.filter((aas) => aas.submodelRefs && aas.submodelRefs.includes(submodel.id));

    if (parentAAS.length > 0) {
      smResult.parentAAS = parentAAS.map((aas) => aas.url);
    }

    result.SM.push(smResult);
  });

  return result;
};
