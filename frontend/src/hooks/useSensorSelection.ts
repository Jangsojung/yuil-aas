import { useCallback, Dispatch, SetStateAction } from 'react';
import { useRecoilState } from 'recoil';
import { selectedSensorsState } from '../recoil/atoms';
import { FacilityGroupTree, FactoryTree } from '../types/api';

export const useSensorSelection = () => {
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);

  const handleSensorSelect = useCallback(
    (sensorId: number, checked: boolean) => {
      setSelectedSensors((prevSelected) => {
        if (checked) {
          return prevSelected.includes(sensorId) ? prevSelected : [...prevSelected, sensorId];
        } else {
          return prevSelected.filter((id) => id !== sensorId);
        }
      });
    },
    [setSelectedSensors]
  );

  const handleGroupSelectAll = useCallback(
    (treeData: FacilityGroupTree[], fgIdx: number, checked: boolean) => {
      const fg = treeData[fgIdx];
      if (!fg) return;

      const allSensorIds: number[] = [];
      fg.facilities.forEach((fa) => {
        fa.sensors.forEach((sensor) => {
          allSensorIds.push(sensor.sn_idx);
        });
      });

      setSelectedSensors((prevSelected) => {
        if (checked) {
          const newSelected = [...prevSelected];
          allSensorIds.forEach((id) => {
            if (!newSelected.includes(id)) {
              newSelected.push(id);
            }
          });
          return newSelected;
        } else {
          return prevSelected.filter((id) => !allSensorIds.includes(id));
        }
      });
    },
    [setSelectedSensors]
  );

  const handleFacilitySelectAll = useCallback(
    (treeData: FacilityGroupTree[], fgIdx: number, faIdx: number, checked: boolean) => {
      const fg = treeData[fgIdx];
      if (!fg || !fg.facilities[faIdx]) return;

      const fa = fg.facilities[faIdx];
      const sensorIds = fa.sensors.map((sensor) => sensor.sn_idx);

      setSelectedSensors((prevSelected) => {
        if (checked) {
          const newSelected = [...prevSelected];
          sensorIds.forEach((id) => {
            if (!newSelected.includes(id)) {
              newSelected.push(id);
            }
          });
          return newSelected;
        } else {
          return prevSelected.filter((id) => !sensorIds.includes(id));
        }
      });
    },
    [setSelectedSensors]
  );

  const isAllSensorsSelectedInGroup = useCallback(
    (treeData: FacilityGroupTree[], fgIdx: number) => {
      const fg = treeData[fgIdx];
      if (!fg) return false;

      const allSensorIds: number[] = [];
      fg.facilities.forEach((fa) => {
        fa.sensors.forEach((sensor) => {
          allSensorIds.push(sensor.sn_idx);
        });
      });

      return allSensorIds.length > 0 && allSensorIds.every((id) => selectedSensors.includes(id));
    },
    [selectedSensors]
  );

  const isAllSensorsSelectedInFacility = useCallback(
    (treeData: FacilityGroupTree[], fgIdx: number, faIdx: number) => {
      const fg = treeData[fgIdx];
      if (!fg || !fg.facilities[faIdx]) return false;

      const fa = fg.facilities[faIdx];
      return fa.sensors.length > 0 && fa.sensors.every((sensor) => selectedSensors.includes(sensor.sn_idx));
    },
    [selectedSensors]
  );

  return {
    selectedSensors,
    handleSensorSelect,
    handleGroupSelectAll,
    handleFacilitySelectAll,
    isAllSensorsSelectedInGroup,
    isAllSensorsSelectedInFacility,
  };
};

// 3단계 구조용 (기초코드 관리)
export const handleFacilityGroupSelectAll = (
  treeData: FacilityGroupTree[],
  fgIdx: number,
  checked: boolean,
  setSelectedSensors: Dispatch<SetStateAction<number[]>>
) => {
  const facilityGroup = treeData[fgIdx];
  if (!facilityGroup) return;

  const allSensorIds = facilityGroup.facilities.flatMap((facility) => facility.sensors.map((sensor) => sensor.sn_idx));

  if (checked) {
    setSelectedSensors((prev) => Array.from(new Set([...prev, ...allSensorIds])));
  } else {
    setSelectedSensors((prev) => prev.filter((id) => !allSensorIds.includes(id)));
  }
};

// 4단계 구조용 (설비 관리)
export const handleFactorySelectAll = (
  treeData: FactoryTree[],
  factoryIdx: number,
  checked: boolean,
  setSelectedSensors: Dispatch<SetStateAction<number[]>>
) => {
  const factory = treeData[factoryIdx];
  if (!factory) return;

  const allSensorIds = factory.facilityGroups.flatMap((fg) =>
    fg.facilities.flatMap((fa) => fa.sensors.map((sensor) => sensor.sn_idx))
  );

  if (checked) {
    setSelectedSensors((prev) => Array.from(new Set([...prev, ...allSensorIds])));
  } else {
    setSelectedSensors((prev) => prev.filter((id) => !allSensorIds.includes(id)));
  }
};

// 3단계 구조용 (기초코드 관리)
export const handleFacilitySelectAll = (
  treeData: FacilityGroupTree[],
  fgIdx: number,
  faIdx: number,
  checked: boolean,
  setSelectedSensors: Dispatch<SetStateAction<number[]>>
) => {
  const facilityGroup = treeData[fgIdx];
  if (!facilityGroup) return;

  const facility = facilityGroup.facilities[faIdx];
  if (!facility) return;

  const sensorIds = facility.sensors.map((sensor) => sensor.sn_idx);

  if (checked) {
    setSelectedSensors((prev) => Array.from(new Set([...prev, ...sensorIds])));
  } else {
    setSelectedSensors((prev) => prev.filter((id) => !sensorIds.includes(id)));
  }
};

// 4단계 구조용 (설비 관리)
export const handleFacilitySelectAll4Level = (
  treeData: FactoryTree[],
  factoryIdx: number,
  fgIdx: number,
  faIdx: number,
  checked: boolean,
  setSelectedSensors: Dispatch<SetStateAction<number[]>>
) => {
  const factory = treeData[factoryIdx];
  if (!factory) return;

  const facilityGroup = factory.facilityGroups[fgIdx];
  if (!facilityGroup) return;

  const facility = facilityGroup.facilities[faIdx];
  if (!facility) return;

  const sensorIds = facility.sensors.map((sensor) => sensor.sn_idx);

  if (checked) {
    setSelectedSensors((prev) => Array.from(new Set([...prev, ...sensorIds])));
  } else {
    setSelectedSensors((prev) => prev.filter((id) => !sensorIds.includes(id)));
  }
};

// 3단계 구조용 (기초코드 관리)
export const isAllSensorsSelectedInGroup = (treeData: FacilityGroupTree[], fgIdx: number): boolean => {
  const facilityGroup = treeData[fgIdx];
  if (!facilityGroup || facilityGroup.facilities.length === 0) return false;

  const allSensorIds = facilityGroup.facilities.flatMap((facility) => facility.sensors.map((sensor) => sensor.sn_idx));

  return allSensorIds.length > 0;
};

// 4단계 구조용 (설비 관리)
export const isAllSensorsSelectedInFactory = (treeData: FactoryTree[], factoryIdx: number): boolean => {
  const factory = treeData[factoryIdx];
  if (!factory || factory.facilityGroups.length === 0) return false;

  const allSensorIds = factory.facilityGroups.flatMap((fg) =>
    fg.facilities.flatMap((fa) => fa.sensors.map((sensor) => sensor.sn_idx))
  );

  return allSensorIds.length > 0;
};

// 3단계 구조용 (기초코드 관리)
export const isAllSensorsSelectedInFacility = (
  treeData: FacilityGroupTree[],
  fgIdx: number,
  faIdx: number
): boolean => {
  const facilityGroup = treeData[fgIdx];
  if (!facilityGroup) return false;

  const facility = facilityGroup.facilities[faIdx];
  if (!facility || facility.sensors.length === 0) return false;

  return true;
};

// 4단계 구조용 (설비 관리)
export const isAllSensorsSelectedInFacility4Level = (
  treeData: FactoryTree[],
  factoryIdx: number,
  fgIdx: number,
  faIdx: number
): boolean => {
  const factory = treeData[factoryIdx];
  if (!factory) return false;

  const facilityGroup = factory.facilityGroups[fgIdx];
  if (!facilityGroup) return false;

  const facility = facilityGroup.facilities[faIdx];
  if (!facility || facility.sensors.length === 0) return false;

  return true;
};
