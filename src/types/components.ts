// Layout Components
export interface LayoutProps {
  headerHeight?: string;
  sidebarWidth?: string;
  footerHeight?: string;
}

// UI Component Props
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  bordered?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'sm' | 'md' | 'lg';
}

export interface ModalProps {
  visible?: boolean;
  title?: string;
  width?: string;
  closable?: boolean;
  maskClosable?: boolean;
}

// Form Component Props
export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
}

// Navigation Props
export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: NavItem[];
  badge?: string | number;
}

export interface NavigationProps {
  items: NavItem[];
  collapsed?: boolean;
  mode?: 'horizontal' | 'vertical';
}

// Table Component Props
export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  pagination?: PaginationProps;
  rowKey?: string;
}

// Pagination Props
export interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

// Tab Component Props
export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
  closable?: boolean;
}

export interface TabsProps {
  activeKey: string;
  items: TabItem[];
  type?: 'line' | 'card';
  size?: 'small' | 'default' | 'large';
}

// Model Management Specific Types
export interface Model3D {
  id: string;
  order: number;
  item: string;
  category: string;
  updater: string;
  registrationTime: string;
  waterproof: string;
}

export interface ModelManagementState {
  activeTab: string;
  models: Model3D[];
  loading: boolean;
  pagination: PaginationProps;
}
