import React, { ChangeEvent, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/system/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { TextField } from '@mui/material';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Pagenation from '../../components/pagenation';
import FacilityGroupSelect from '../../components/select/facility_group';
import BasicTable from '../../components/table/basic_code';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  baseEditModeState,
  navigationResetState,
  selectedBasesState,
  selectedBaseState,
  selectedSensorsState,
  currentFacilityGroupState,
  hasBasicsState,
  userState,
} from '../../recoil/atoms';
import BasicDatePicker from '../../components/datepicker';
import { Dayjs } from 'dayjs';
import AlertModal from '../../components/modal/alert';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import LoadingOverlay from '../../components/loading/LodingOverlay';
import BasicModal from '../../components/modal/basicmodal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

interface Base {
  ab_idx: number;
  ab_name: string;
  ab_note: string;
  sn_length: number;
  createdAt: Date;
}

interface Basic {
  fa_idx: number;
  fa_name: string;
}

interface Sensor {
  sn_idx: number;
  sn_name: string;
}

interface FacilityGroupTree {
  fg_idx: number;
  fg_name: string;
  facilities: {
    fa_idx: number;
    fa_name: string;
    sensors: {
      sn_idx: number;
      sn_name: string;
    }[];
  }[];
}

const cells = ['기초코드명', '센서 개수', '생성 날짜', '비고'];

export default function BasiccodePage() {
  const [insertMode, setInsertMode] = useState(false);
  const [detailMode, setDetailMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [baseEditMode, setBaseEditMode] = useRecoilState(baseEditModeState);
  const [selectedBases, setSelectedBases] = useRecoilState(selectedBasesState);
  const [selectedSensors, setSelectedSensors] = useRecoilState(selectedSensorsState);
  const [name, setName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [sensorName, setSensorName] = useState('');
  const [bases, setBases] = useState<Base[]>([]);
  const [filteredBases, setFilteredBases] = useState<Base[]>([]);
  const [basics, setBasics] = useState<Basic[]>([]);
  const [sensorsByFa, setSensorsByFa] = useState<{ [key: number]: Sensor[] }>({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedBase, setSelectedBase] = useRecoilState(selectedBaseState);
  const currentFacilityGroup = useRecoilValue(currentFacilityGroupState);
  const [, setHasBasics] = useRecoilState(hasBasicsState);
  const userIdx = useRecoilValue(userState)?.user_idx;
  const location = useLocation();
  const navigationReset = useRecoilValue(navigationResetState);

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertContent, setAlertContent] = useState('');
  const [alertType, setAlertType] = useState<'alert' | 'confirm'>('alert');

  const [treeData, setTreeData] = useState<FacilityGroupTree[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);

  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [basicName, setBasicName] = useState('');
  const [basicDesc, setBasicDesc] = useState('');

  const [selectedFacilityGroups, setSelectedFacilityGroups] = useState<number[]>([]);

  const [selectedBaseForDetail, setSelectedBaseForDetail] = useState<Base | null>(null);
  const [detailTreeData, setDetailTreeData] = useState<FacilityGroupTree[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [editingBase, setEditingBase] = useState<Base | null>(null);

  useEffect(() => {
    if (detailMode && selectedBaseForDetail) {
      document.title = `기초코드 관리 > ${selectedBaseForDetail.ab_name}`;
    } else if (editMode && editingBase) {
      document.title = `기초코드 관리 > ${editingBase.ab_name} 수정`;
    } else if (insertMode) {
      document.title = '기초코드 관리 > 기초코드 등록';
    } else {
      document.title = '기초코드 관리';
    }
  }, [detailMode, selectedBaseForDetail, editMode, editingBase, insertMode]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleReset = () => {
    setSelectedFacilityGroups([]);
    setFacilityName('');
    setSensorName('');
    setTreeData([]);
    setSelectedSensors([]);
  };

  const handleMainReset = () => {
    setSearchKeyword('');
    setStartDate(null);
    setEndDate(null);
    getBases();
  };

  const pagedData = filteredBases?.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  useEffect(() => {
    if (selectedBases.length === 0) {
      setSelectAll(false);
    } else if (pagedData && pagedData.length > 0) {
      const currentPageIds = pagedData.map((base) => base.ab_idx);
      const allCurrentPageSelected = currentPageIds.every((id) => selectedBases.includes(id));
      setSelectAll(allCurrentPageSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedBases, pagedData]);

  useEffect(() => {
    setFilteredBases(bases);
  }, [bases]);

  useEffect(() => {
    getBases();
  }, []);

  useEffect(() => {
    if (navigationReset) {
      getBases();
      setInsertMode(false);
      setDetailMode(false);
      setEditMode(false);
      setSelectedBaseForDetail(null);
      setEditingBase(null);
      setDetailTreeData([]);
      setTreeData([]);
      setSelectedSensors([]);
      setBasicName('');
      setBasicDesc('');
      setBasicModalOpen(false);
      setSelectedFacilityGroups([]);
      setFacilityName('');
      setSensorName('');
      setSearchKeyword('');
      setStartDate(null);
      setEndDate(null);
      setSelectedBases([]);
    }
  }, [navigationReset]);

  const getBases = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/bases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bases');
      }

      const data = await response.json();
      setBases(data);
    } catch (error) {
      console.error('Error fetching bases:', error);
    }
  };

  const getBasicCode = async (fg_idx: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fg_idx: fg_idx,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch basic code');
      }

      const data = await response.json();
      setBasics(data);
      setHasBasics(data !== null && data.length > 0);
    } catch (error) {
      console.error('Error fetching basic code:', error);
    }
  };

  const getSensorsByFa = async (fa_idx: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/sensors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fa_idx: fa_idx,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sensors');
      }

      const data = await response.json();
      setSensorsByFa((prev) => ({
        ...prev,
        [fa_idx]: Array.isArray(data) ? data : [],
      }));
    } catch (error) {
      console.error('Error fetching sensors:', error);
      setSensorsByFa((prev) => ({
        ...prev,
        [fa_idx]: [],
      }));
    }
  };

  const handleSelectAllChange = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    if (checked) {
      if (pagedData && pagedData.length > 0) {
        setSelectedBases((prevSelected) => {
          const currentPageIds = pagedData.map((base) => base.ab_idx);
          const newSelected = [...prevSelected];
          currentPageIds.forEach((id) => {
            if (!newSelected.includes(id)) {
              newSelected.push(id);
            }
          });
          return newSelected;
        });
      }
    } else {
      if (pagedData && pagedData.length > 0) {
        const currentPageIds = pagedData.map((base) => base.ab_idx);
        setSelectedBases((prevSelected) => prevSelected.filter((id) => !currentPageIds.includes(id)));
      }
    }
  };

  const handleCheckboxChange = (baseIdx: number) => {
    setSelectedBases((prevSelected) => {
      if (prevSelected.includes(baseIdx)) {
        return prevSelected.filter((idx) => idx !== baseIdx);
      } else {
        return [...prevSelected, baseIdx];
      }
    });
  };

  const handleDelete = async () => {
    if (selectedBases.length === 0) {
      setAlertTitle('알림');
      setAlertContent('삭제할 항목을 선택해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    setAlertTitle('확인');
    setAlertContent(`선택한 ${selectedBases.length}개 항목을 삭제하시겠습니까?`);
    setAlertType('confirm');
    setAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/bases`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedBases }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete bases');
      }

      setBases(bases.filter((base) => !selectedBases.includes(base.ab_idx)));
      setSelectedBases([]);
      setAlertTitle('알림');
      setAlertContent('선택한 항목이 삭제되었습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    } catch (err: any) {
      console.log(err.message);
      setAlertTitle('오류');
      setAlertContent('삭제 중 오류가 발생했습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    }
  };

  const handleAdd = async () => {
    if (selectedSensors.length === 0) {
      setAlertTitle('알림');
      setAlertContent('센서를 선택해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    if (!basicName.trim()) {
      setAlertTitle('알림');
      setAlertContent('기초코드명을 입력해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/bases/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_idx: userIdx,
          name: basicName,
          note: basicDesc,
          ids: selectedSensors,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to insert base');
      }

      const data = await response.json();
      console.log('Base inserted successfully:', data);
      setBasicName('');
      setBasicDesc('');
      setSelectedSensors([]);
      getBases();
      setBasicModalOpen(false);
    } catch (error) {
      console.error('Error inserting base:', error);
    }
  };

  const handleBasicModalAdd = async () => {
    await handleAdd();
  };

  const handleBasicModalReset = () => {
    if (editMode && editingBase) {
      setBasicName(editingBase.ab_name);
      setBasicDesc(editingBase.ab_note || '');
    } else {
      setBasicName('');
      setBasicDesc('');
    }
  };

  const handleUpdate = async () => {
    if (selectedSensors.length === 0) {
      setAlertTitle('알림');
      setAlertContent('센서를 선택해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    if (!basicName.trim()) {
      setAlertTitle('알림');
      setAlertContent('기초코드명을 입력해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    if (!selectedBaseForDetail) {
      console.error('No base selected for update');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/bases`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_idx: userIdx,
          ab_idx: selectedBaseForDetail.ab_idx,
          name: basicName,
          note: basicDesc,
          ids: selectedSensors,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update base');
      }

      const data = await response.json();
      console.log('Base updated successfully:', data);
      setBasicName('');
      setBasicDesc('');
      setSelectedSensors([]);
      getBases();
      setBasicModalOpen(false);
    } catch (error) {
      console.error('Error updating base:', error);
    }
  };

  const handleCancle = () => {
    setBaseEditMode(false);
    setSelectedSensors([]);
    setBasicName('');
    setBasicDesc('');
    setBasicModalOpen(false);
  };

  const handleSearch = () => {
    const filtered = bases.filter((base) => base.ab_name.toLowerCase().includes(searchKeyword.toLowerCase()));
    setFilteredBases(filtered);
    setCurrentPage(0);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return '-';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      return '-';
    }
  };

  const handleDateChange = (newStartDate: Dayjs | null, newEndDate: Dayjs | null) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleInsertMode = () => {
    setInsertMode(true);
    getAllFacilityGroups();
  };

  const getAllFacilityGroups = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/facilityGroups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fc_idx: 3,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch facility groups');
      }

      const data = await response.json();
      setSelectedFacilityGroups(data.map((fg: any) => fg.fg_idx));
    } catch (error) {
      console.error('Error fetching facility groups:', error);
      setSelectedFacilityGroups([]);
    }
  };

  const handleBackToMain = () => {
    setInsertMode(false);
    setDetailMode(false);
    setEditMode(false);
    setSelectedBaseForDetail(null);
    setEditingBase(null);
    setDetailTreeData([]);
    setTreeData([]);
    setSelectedSensors([]);
    setBasicName('');
    setBasicDesc('');
    setBasicModalOpen(false);
    setSelectedFacilityGroups([]);
    setFacilityName('');
    setSensorName('');
    setSearchKeyword('');
    setStartDate(null);
    setEndDate(null);
    setSelectedBases([]);
  };

  const handleEditMode = async () => {
    if (!selectedBaseForDetail) return;

    setEditMode(true);
    setDetailMode(false);
    setEditingBase(selectedBaseForDetail);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/base_code/bases/${selectedBaseForDetail.ab_idx}/sensors`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch base sensors');
      }

      const sensorIds = await response.json();
      const sensorIdList = Array.isArray(sensorIds)
        ? sensorIds.map((item) => (typeof item === 'object' ? item.sn_idx : item))
        : [];

      setSelectedSensors(sensorIdList);

      setBasicName(selectedBaseForDetail.ab_name);
      setBasicDesc(selectedBaseForDetail.ab_note || '');

      await loadAllFacilityGroupsForEdit(sensorIdList);
    } catch (err: any) {
      console.log('수정 모드 초기화 에러:', err.message);
      setAlertTitle('오류');
      setAlertContent('기초코드 정보를 불러오는데 실패했습니다.');
      setAlertType('alert');
      setAlertOpen(true);
    }
  };

  const loadAllFacilityGroupsForEdit = async (selectedSensorIds: number[]) => {
    try {
      const fgRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/facilityGroups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fc_idx: 3,
        }),
      });
      const allFacilityGroups = await fgRes.json();

      const facilitiesAll = await Promise.all(
        allFacilityGroups.map(async (fg) => {
          const faRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fg_idx: fg.fg_idx,
            }),
          });
          const facilities = await faRes.json();

          const facilitiesWithSensors = await Promise.all(
            facilities.map(async (fa) => {
              const snRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/sensors`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  fa_idx: fa.fa_idx,
                }),
              });
              const sensors = await snRes.json();
              const sensorsArray = Array.isArray(sensors) ? sensors : [];
              return { ...fa, sensors: sensorsArray };
            })
          );
          return { ...fg, facilities: facilitiesWithSensors };
        })
      );

      setTreeData(facilitiesAll);

      const relevantFacilityGroups = new Set<number>();
      facilitiesAll.forEach((fg) => {
        fg.facilities.forEach((fa) => {
          fa.sensors.forEach((sensor) => {
            if (selectedSensorIds.includes(sensor.sn_idx)) {
              relevantFacilityGroups.add(fg.fg_idx);
            }
          });
        });
      });

      setSelectedFacilityGroups(Array.from(relevantFacilityGroups));
    } catch (err) {
      console.log('설비그룹 로드 에러:', err.message);
    }
  };

  const getBaseDetail = async (base: Base) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/bases/${base.ab_idx}/sensors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch base detail');
      }

      const sensorIds = await response.json();
      const sensorIdList = Array.isArray(sensorIds)
        ? sensorIds.map((item) => (typeof item === 'object' ? item.sn_idx : item))
        : [];
      const treeData = await buildTreeFromSensorIds(sensorIdList);
      setDetailTreeData(treeData);
    } catch (err: any) {
      console.error('기초코드 상세 로딩 에러:', err.message);
      setDetailTreeData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const buildTreeFromSensorIds = async (sensorIds: number[]) => {
    try {
      const fgRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/facilityGroups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fc_idx: 3,
        }),
      });
      const allFacilityGroups = await fgRes.json();

      const facilitiesAll = await Promise.all(
        allFacilityGroups.map(async (fg) => {
          const faRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fg_idx: fg.fg_idx,
            }),
          });
          const facilities = await faRes.json();

          const facilitiesWithSensors = await Promise.all(
            facilities.map(async (fa) => {
              const snRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/sensors`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  fa_idx: fa.fa_idx,
                }),
              });
              const sensors = await snRes.json();
              const sensorsArray = Array.isArray(sensors) ? sensors : [];
              return { ...fa, sensors: sensorsArray };
            })
          );
          return { ...fg, facilities: facilitiesWithSensors };
        })
      );

      const filteredFacilityGroups = allFacilityGroups.filter((fg) =>
        facilitiesAll
          .find((fgData) => fgData.fg_idx === fg.fg_idx)
          ?.facilities.some((fa) => fa.sensors.some((sensor) => sensorIds.includes(sensor.sn_idx)))
      );

      const filteredFacilitiesAll = await Promise.all(
        filteredFacilityGroups.map(async (fg) => {
          const faRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fg_idx: fg.fg_idx,
            }),
          });
          const facilities = await faRes.json();

          const filteredFacilities = facilities.filter((fa) =>
            fa.sensors.some((sensor) => sensorIds.includes(sensor.sn_idx))
          );

          const facilitiesWithSensors = await Promise.all(
            filteredFacilities.map(async (fa) => {
              const snRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/sensors`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  fa_idx: fa.fa_idx,
                }),
              });
              const sensors = await snRes.json();
              const sensorsArray = Array.isArray(sensors) ? sensors : [];
              return { ...fa, sensors: sensorsArray };
            })
          );
          return { ...fg, facilities: facilitiesWithSensors };
        })
      );

      return filteredFacilitiesAll;
    } catch (error) {
      console.error('Error building tree from sensor IDs:', error);
      return [];
    }
  };

  const handleTreeSearch = async () => {
    if (!facilityName.trim() && !sensorName.trim() && selectedFacilityGroups.length === 0) {
      setAlertTitle('알림');
      setAlertContent('검색 조건을 입력해주세요.');
      setAlertType('alert');
      setAlertOpen(true);
      return;
    }

    setTreeLoading(true);

    try {
      const fgRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/facilityGroups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fc_idx: 3,
        }),
      });
      const allFacilityGroups = await fgRes.json();

      let filteredFacilityGroups = allFacilityGroups;
      if (selectedFacilityGroups.length > 0) {
        filteredFacilityGroups = allFacilityGroups.filter((fg) => selectedFacilityGroups.includes(fg.fg_idx));
      }

      const facilitiesAll = await Promise.all(
        filteredFacilityGroups.map(async (fg) => {
          const faRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fg_idx: fg.fg_idx,
            }),
          });
          const facilities = await faRes.json();

          let filteredFacilities = facilities;
          if (facilityName.trim()) {
            filteredFacilities = facilities.filter((fa) =>
              fa.fa_name.toLowerCase().includes(facilityName.trim().toLowerCase())
            );
          }

          const facilitiesWithSensors = await Promise.all(
            filteredFacilities.map(async (fa) => {
              const snRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/sensors`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  fa_idx: fa.fa_idx,
                }),
              });
              const sensors = await snRes.json();
              const sensorsArray = Array.isArray(sensors) ? sensors : [];

              let filteredSensors = sensorsArray;
              if (sensorName.trim()) {
                filteredSensors = sensorsArray.filter((sensor) =>
                  sensor.sn_name.toLowerCase().includes(sensorName.trim().toLowerCase())
                );
              }

              return { ...fa, sensors: filteredSensors };
            })
          );

          const facilitiesWithSensorsFiltered = facilitiesWithSensors.filter((fa) => fa.sensors.length > 0);
          return { ...fg, facilities: facilitiesWithSensorsFiltered };
        })
      );

      const finalFilteredData = facilitiesAll.filter((fg) => fg.facilities.length > 0);

      setTreeData(finalFilteredData);
    } catch (err) {
      console.log('검색 에러:', err.message);
      setTreeData([]);
    } finally {
      setTreeLoading(false);
    }
  };

  const handleFacilityGroupSelectAll = (fgIdx: number, checked: boolean) => {
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
  };

  const isAllSensorsSelectedInGroup = (fgIdx: number) => {
    const fg = treeData[fgIdx];
    if (!fg) return false;

    const allSensorIds: number[] = [];
    fg.facilities.forEach((fa) => {
      fa.sensors.forEach((sensor) => {
        allSensorIds.push(sensor.sn_idx);
      });
    });

    return allSensorIds.length > 0 && allSensorIds.every((id) => selectedSensors.includes(id));
  };

  const isPartiallySelectedInGroup = (fgIdx: number) => {
    const fg = treeData[fgIdx];
    if (!fg) return false;

    const allSensorIds: number[] = [];
    fg.facilities.forEach((fa) => {
      fa.sensors.forEach((sensor) => {
        allSensorIds.push(sensor.sn_idx);
      });
    });

    return (
      allSensorIds.length > 0 &&
      allSensorIds.some((id) => selectedSensors.includes(id)) &&
      !isAllSensorsSelectedInGroup(fgIdx)
    );
  };
  const handleFacilitySelectAll = (fgIdx: number, faIdx: number, checked: boolean) => {
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
  };

  const isAllSensorsSelectedInFacility = (fgIdx: number, faIdx: number) => {
    const fg = treeData[fgIdx];
    if (!fg || !fg.facilities[faIdx]) return false;

    const fa = fg.facilities[faIdx];
    return fa.sensors.length > 0 && fa.sensors.every((sensor) => selectedSensors.includes(sensor.sn_idx));
  };

  const isPartiallySelectedInFacility = (fgIdx: number, faIdx: number) => {
    const fg = treeData[fgIdx];
    if (!fg || !fg.facilities[faIdx]) return false;

    const fa = fg.facilities[faIdx];
    return (
      fa.sensors.length > 0 &&
      fa.sensors.some((sensor) => selectedSensors.includes(sensor.sn_idx)) &&
      !isAllSensorsSelectedInFacility(fgIdx, faIdx)
    );
  };

  const handleSelectAllInFa = (fa_idx: number, checked: boolean) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    const sensorIds = sensorsInFa.map((sensor) => sensor.sn_idx);

    if (checked) {
      setSelectedSensors((prevSelected) => {
        const newSelected = [...prevSelected];
        sensorIds.forEach((id) => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      setSelectedSensors((prevSelected) => prevSelected.filter((id) => !sensorIds.includes(id)));
    }
  };

  const isAllInFaSelected = (fa_idx: number) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    return sensorsInFa.length > 0 && sensorsInFa.every((sensor) => selectedSensors.includes(sensor.sn_idx));
  };

  const isPartiallySelectedInFa = (fa_idx: number) => {
    const sensorsInFa = sensorsByFa[fa_idx] || [];
    return (
      sensorsInFa.length > 0 &&
      sensorsInFa.some((sensor) => selectedSensors.includes(sensor.sn_idx)) &&
      !isAllInFaSelected(fa_idx)
    );
  };

  const handleClick = (base: Base) => {
    setSelectedBaseForDetail(base);
    setDetailMode(true);
    getBaseDetail(base);
  };

  const handleConfirmInsert = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/base_code/bases/insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_idx: userIdx,
          name: basicName,
          note: basicDesc,
          ids: selectedSensors,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to insert base');
      }

      const data = await response.json();
      console.log('Base inserted successfully:', data);
      setBasicName('');
      setBasicDesc('');
      setSelectedSensors([]);
      getBases();
      setBasicModalOpen(false);
    } catch (error) {
      console.error('Error inserting base:', error);
    }
  };

  if (insertMode || editMode) {
    return (
      <div className='table-outer'>
        <div>
          <Box sx={{ flexGrow: 1 }} className='sort-box'>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Grid container spacing={1}>
                  <Grid item>
                    <div className='sort-title'>설비그룹</div>
                  </Grid>
                  <Grid item xs={9}>
                    <FacilityGroupSelect
                      selectedFacilityGroups={selectedFacilityGroups}
                      setSelectedFacilityGroups={setSelectedFacilityGroups}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={3}>
                <Grid container spacing={1}>
                  <Grid item>
                    <div className='sort-title'>설비명</div>
                  </Grid>
                  <Grid item xs={9}>
                    <FormControl sx={{ width: '100%' }} size='small'>
                      <TextField
                        size='small'
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        placeholder='설비명을 입력하세요'
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={3}>
                <Grid container spacing={1}>
                  <Grid item>
                    <div className='sort-title'>센서명</div>
                  </Grid>
                  <Grid item xs={9}>
                    <FormControl sx={{ width: '100%' }} size='small'>
                      <TextField
                        size='small'
                        value={sensorName}
                        onChange={(e) => setSensorName(e.target.value)}
                        placeholder='센서명을 입력하세요'
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={3}>
                <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                  <Button variant='contained' color='success' onClick={handleTreeSearch}>
                    검색
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ flexGrow: 1 }} className='sort-box'>
            <Grid container spacing={1}>
              <Grid item xs={8}></Grid>
              <Grid item xs={4}>
                <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                  <Button
                    variant='contained'
                    color={editMode ? 'primary' : 'success'}
                    onClick={() => {
                      if (selectedSensors.length === 0) {
                        setAlertTitle('알림');
                        setAlertContent('센서를 선택해주세요.');
                        setAlertType('alert');
                        setAlertOpen(true);
                      } else {
                        setBasicModalOpen(true);
                      }
                    }}
                  >
                    {editMode ? '저장' : '기초코드 등록'}
                  </Button>
                  <Button variant='contained' color='inherit' onClick={handleBackToMain}>
                    취소
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </div>

        <div className='table-wrap'>
          {treeLoading ? (
            <LoadingOverlay />
          ) : treeData.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>조회 결과 없음</div>
          ) : (
            <SimpleTreeView
              defaultExpandedItems={treeData.flatMap((fg, fgIdx) => [
                `aas-${fgIdx}`,
                ...fg.facilities.map((fa, faIdx) => `submodal-${fgIdx}-${faIdx}`),
              ])}
            >
              {treeData.map((fg, fgIdx) => (
                <TreeItem
                  key={fg.fg_idx}
                  itemId={`aas-${fgIdx}`}
                  label={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={isAllSensorsSelectedInGroup(fgIdx)}
                        indeterminate={false}
                        onChange={(e) => handleFacilityGroupSelectAll(fgIdx, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ marginRight: '8px' }}
                      />
                      <span>{fg.fg_name}</span>
                    </div>
                  }
                >
                  {fg.facilities.map((fa, faIdx) => (
                    <TreeItem
                      key={fa.fa_idx}
                      itemId={`submodal-${fgIdx}-${faIdx}`}
                      label={
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox
                            checked={isAllSensorsSelectedInFacility(fgIdx, faIdx)}
                            indeterminate={false}
                            onChange={(e) => handleFacilitySelectAll(fgIdx, faIdx, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginRight: '8px' }}
                          />
                          <span>{fa.fa_name}</span>
                        </div>
                      }
                    >
                      <div style={{ padding: '8px 0' }}>
                        <BasicTable sm_idx={`${fgIdx + 1}.${faIdx + 1}`} fa_idx={fa.fa_idx} sensors={fa.sensors} />
                      </div>
                    </TreeItem>
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          )}
        </div>

        <BasicModal
          open={basicModalOpen}
          handleClose={() => setBasicModalOpen(false)}
          handleAdd={editMode ? handleUpdate : handleBasicModalAdd}
          handleReset={handleBasicModalReset}
          selectedSensorCount={selectedSensors.length}
          name={basicName}
          setName={setBasicName}
          desc={basicDesc}
          setDesc={setBasicDesc}
          isEditMode={editMode}
        />
        <AlertModal
          open={alertOpen}
          handleClose={() => setAlertOpen(false)}
          title={alertTitle}
          content={alertContent}
          type={alertType}
          onConfirm={alertType === 'confirm' ? handleConfirmDelete : undefined}
        />
      </div>
    );
  }

  if (detailMode) {
    return (
      <div className='table-outer'>
        <div>
          <Box sx={{ flexGrow: 1 }} className='sort-box'>
            <Grid container spacing={1}>
              <Grid item xs={8}></Grid>
              <Grid item xs={4}>
                <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                  <Button variant='contained' color='success' onClick={handleEditMode}>
                    수정
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </div>

        <div className='table-wrap'>
          {detailLoading ? (
            <LoadingOverlay />
          ) : detailTreeData.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>센서 데이터가 없습니다.</div>
          ) : (
            <SimpleTreeView
              defaultExpandedItems={detailTreeData.flatMap((fg, fgIdx) => [
                `detail-${fgIdx}`,
                ...fg.facilities.map((fa, faIdx) => `detail-sub-${fgIdx}-${faIdx}`),
              ])}
            >
              {detailTreeData.map((fg, fgIdx) => (
                <TreeItem key={fg.fg_idx} itemId={`detail-${fgIdx}`} label={<span>{fg.fg_name}</span>}>
                  {fg.facilities.map((fa, faIdx) => (
                    <TreeItem key={fa.fa_idx} itemId={`detail-sub-${fgIdx}-${faIdx}`} label={<span>{fa.fa_name}</span>}>
                      <div style={{ padding: '8px 0' }}>
                        <TableContainer component={Paper}>
                          <Table size='small'>
                            <TableBody>
                              {(() => {
                                const sensors = fa.sensors || [];
                                const rows: (typeof sensors)[] = [];
                                for (let i = 0; i < sensors.length; i += 6) {
                                  const rowSensors = sensors.slice(i, i + 6);
                                  rows.push(rowSensors);
                                }
                                return rows.map((rowSensors, rowIndex) => (
                                  <TableRow key={rowIndex}>
                                    <TableCell colSpan={3}>
                                      <Grid container spacing={1}>
                                        {rowSensors.map((sensor, idx) => (
                                          <Grid item xs={2} key={sensor.sn_idx}>
                                            <List
                                              sx={{
                                                width: '100%',
                                                bgcolor: 'background.paper',
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 1,
                                              }}
                                              className='basic-checkbox'
                                            >
                                              <div>
                                                <ListItem>
                                                  <ListItemText secondary={sensor.sn_name} />
                                                </ListItem>
                                                <Divider variant='middle' component='li' />
                                                <ListItem>
                                                  <ListItemText
                                                    secondary={
                                                      'Prop 1.' +
                                                      (fgIdx + 1) +
                                                      '.' +
                                                      (faIdx + 1) +
                                                      '.' +
                                                      (rowIndex * 6 + idx + 1)
                                                    }
                                                  />
                                                </ListItem>
                                              </div>
                                            </List>
                                          </Grid>
                                        ))}
                                      </Grid>
                                    </TableCell>
                                  </TableRow>
                                ));
                              })()}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </div>
                    </TreeItem>
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='table-outer'>
      <div>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>기초코드명</div>
                </Grid>
                <Grid item xs={9}>
                  <FormControl sx={{ width: '100%' }} size='small'>
                    <TextField size='small' value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={1}>
                <Grid item>
                  <div className='sort-title'>날짜</div>
                </Grid>
                <Grid item xs={9}>
                  <BasicDatePicker onDateChange={handleDateChange} startDate={startDate} endDate={endDate} />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='contained' color='success' onClick={handleSearch}>
                  검색
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ flexGrow: 1 }} className='sort-box'>
          <Grid container spacing={1}>
            <Grid item xs={8}></Grid>
            <Grid item xs={4}>
              <Stack spacing={1} direction='row' style={{ justifyContent: 'flex-end' }}>
                <Button variant='contained' color='success' onClick={handleInsertMode}>
                  기초코드 등록
                </Button>
                <Button variant='contained' color='error' onClick={handleDelete}>
                  삭제
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </div>

      <div className='table-wrap'>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label='simple table'>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Checkbox checked={selectAll} onChange={handleSelectAllChange} />
                </TableCell>
                {cells.map((cell, idx) => (
                  <TableCell key={idx}>{cell}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData && pagedData.length > 0 ? (
                pagedData.map((base, idx) => (
                  <TableRow
                    key={base.ab_idx}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    onClick={() => handleClick(base)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedBases.includes(base.ab_idx)}
                        onChange={() => handleCheckboxChange(base.ab_idx)}
                      />
                    </TableCell>
                    <TableCell>{base.ab_name}</TableCell>
                    <TableCell>{base.sn_length || 0}</TableCell>
                    <TableCell>{formatDate(base.createdAt?.toString())}</TableCell>
                    <TableCell>{base.ab_note}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={cells.length + 1} align='center'>
                    데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagenation count={filteredBases ? filteredBases.length : 0} onPageChange={handlePageChange} />
      </div>
      <AlertModal
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        title={alertTitle}
        content={alertContent}
        type={alertType}
        onConfirm={alertType === 'confirm' ? handleConfirmDelete : undefined}
      />
    </div>
  );
}
