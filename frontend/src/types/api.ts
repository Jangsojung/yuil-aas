export interface AASXFile {
  af_idx: number;
  af_name: string;
  af_kind?: number;
  fc_idx?: number;
  user_idx?: number;
  createdAt?: string;
}

export interface AASXData {
  AAS: AASItem[];
  SM: SubmodelItem[];
}

export interface AASItem {
  name: string;
  url: string;
  of: string;
  AssetInformation: {
    Unit1: string;
  };
  submodelRefs: string[];
}

export interface SubmodelItem {
  name: string;
  url: string;
  SMC?: SubmodelElementCollection[];
  parentAAS?: string[];
}

export interface SubmodelElementCollection {
  name: string;
  elements: number;
  items?: ChildCollection[];
}

export interface ChildCollection {
  name: string;
  elements: number;
  Prop?: Property[];
}

export interface Property {
  name: string;
  value: any;
}

export interface Base {
  ab_idx: number;
  ab_name: string;
  ab_note: string;
  sn_length: number;
  createdAt?: string;
  updatedAt?: string;
  fc_idx?: number;
}

export interface FacilityGroup {
  fg_idx: number;
  fg_name: string;
}

export interface FacilityGroupTree {
  fg_idx: number;
  fg_name: string;
  origin_check?: number;
  facilities: Facility[];
}

export interface Facility {
  fa_idx: number;
  fa_name: string;
  origin_check?: number;
  sensors: Sensor[];
}

export interface Sensor {
  sn_idx: number;
  sn_name: string;
  origin_check?: number;
}

export interface ApiResponseData<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AlertModalState {
  open: boolean;
  title: string;
  content: string;
  type: 'alert' | 'confirm';
  onConfirm?: (() => void) | undefined;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
}

export interface Factory {
  fc_idx: number;
  fc_name: string;
  origin_check?: number;
}

export interface User {
  user_idx: number;
  user_id: string;
  user_name: string;
  cm_idx?: number;
}

export interface FactoryTree {
  fc_idx: number;
  fc_name: string;
  origin_check?: number;
  facilityGroups: FacilityGroupTree[];
}

export interface EdgeGateway {
  eg_idx: number;
  eg_pc_name?: string;
  eg_ip_port: string;
  eg_network?: number;
  createdAt?: string;
  updatedAt?: string;
}
