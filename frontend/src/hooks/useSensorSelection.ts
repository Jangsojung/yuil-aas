import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { selectedSensorsState } from '../recoil/atoms';
import { FacilityGroupTree } from '../types/api';

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
