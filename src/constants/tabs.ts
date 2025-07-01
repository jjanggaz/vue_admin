import type { TabItem } from '@/components/common/TabNavigation.vue'

// 3D 모델 관리 관련 탭들
export const MODEL_MANAGEMENT_TABS: TabItem[] = [
  {
    name: 'Model3D',
    label: '3D 모델 관리',
    to: '/model/3d',
    icon: '📦'
  },
  {
    name: 'RevitManagement',
    label: 'Revit 관리',
    to: '/model/revit',
    icon: '🏗️'
  },
  {
    name: 'StandardManagement',
    label: '표준배치 관리',
    to: '/model/standard',
    icon: '📐'
  }
]

// 다른 페이지의 탭들도 여기에 추가 가능
export const DASHBOARD_TABS: TabItem[] = [
  // 대시보드 관련 탭들...
]

export const USER_MANAGEMENT_TABS: TabItem[] = [
  // 사용자 관리 관련 탭들...
]
