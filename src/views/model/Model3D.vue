<template>
  <div class="model-3d-page">
    <!-- Tab Navigation -->
    <TabNavigation 
      :tabs="tabItems" 
      @tab-click="handleTabClick" 
    />

    <!-- Add Button -->
    <div class="action-bar">
      <button class="btn btn-primary add-button">
        <span class="plus-icon">+</span>
        새모델 업로드
      </button>
    </div>

    <!-- Data Table -->
    <DataTable 
      :columns="tableColumns"
      :data="modelList"
      :loading="loading"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <!-- 수정 버튼 슬롯 -->
      <template #cell-actions="{ item }">
        <button class="btn-edit" @click.stop="editItem(item)">수정</button>
      </template>
      
      <!-- 반납여부 슬롯 -->
      <template #cell-isReturned="{ value }">
        <span class="status-badge" :class="{ returned: value, pending: !value }">
          {{ value ? '반납' : '미반납' }}
        </span>
      </template>
    </DataTable>

    <!-- Pagination -->
    <div class="pagination-container">
      <Pagination 
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Pagination from '@/components/common/Pagination.vue'
import TabNavigation, { type TabItem } from '@/components/common/TabNavigation.vue'
import DataTable, { type TableColumn } from '@/components/common/DataTable.vue'

interface ModelItem {
  id: string
  title: string
  category: string
  createdAt: string
  lastUsed: string | null
  isReturned: boolean
}

// 탭 설정
const tabItems: TabItem[] = [
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

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  {
    key: 'index',
    title: '순번',
    sortable: false,
    formatter: (value, item, index) => String((index || 0) + 1)
  },
  {
    key: 'title',
    title: '항목',
    sortable: true
  },
  {
    key: 'category',
    title: '정보분류',
    sortable: true
  },
  {
    key: 'createdAt',
    title: '입력일시',
    sortable: true,
    formatter: (value) => formatDate(value)
  },
  {
    key: 'lastUsed',
    title: '등록다운 활용 일시',
    sortable: true,
    formatter: (value) => formatDate(value)
  },
  {
    key: 'isReturned',
    title: '반납여부',
    sortable: true
  },
  {
    key: 'actions',
    title: '수정',
    sortable: false
  }
]

const modelList = ref<ModelItem[]>([])
const currentPage = ref(1)
const totalPages = ref(999)
const loading = ref(false)

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ko-KR')
}

const editItem = (item: ModelItem) => {
  console.log('Edit item:', item)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadModelList()
}

const handleTabClick = (tab: TabItem) => {
  console.log('Tab clicked:', tab.name)
}

const handleSortChange = (sortInfo: { key: string; direction: 'asc' | 'desc' }) => {
  console.log('Sort changed:', sortInfo)
  // 여기서 API 재호출하거나 로컬 정렬 처리
  loadModelList(sortInfo)
}

const handleRowClick = (item: ModelItem, index: number) => {
  console.log('Row clicked:', item, index)
  // 행 클릭 시 상세 페이지로 이동하거나 모달 열기 등
}

const loadModelList = async (sortInfo?: { key: string; direction: 'asc' | 'desc' }) => {
  loading.value = true
  try {
    // API 호출로 데이터 로드
    // 임시 샘플 데이터
    await new Promise(resolve => setTimeout(resolve, 1000)) // 로딩 시뮬레이션
    
    modelList.value = [
      {
        id: '1',
        title: '건물 외벽 모델',
        category: '건축',
        createdAt: '2024-01-15',
        lastUsed: '2024-07-01',
        isReturned: true
      },
      {
        id: '2',
        title: '기계실 장비',
        category: '기계',
        createdAt: '2024-02-20',
        lastUsed: null,
        isReturned: false
      },
      {
        id: '3',
        title: '전기 배선도',
        category: '전기',
        createdAt: '2024-03-10',
        lastUsed: '2024-06-15',
        isReturned: true
      }
    ]
    
    console.log('Sort info:', sortInfo)
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadModelList()
})
</script>

<style scoped lang="scss">
.model-3d-page {
  padding: $spacing-lg;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: $spacing-lg;

  .add-button {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-lg;
    border: none;
    border-radius: $border-radius-md;
    background: linear-gradient(135deg, #4f46e5, #3b82f6);
    color: white;
    font-weight: $font-weight-medium;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      transform: translateY(-1px);
      box-shadow: $shadow-md;
    }

    .plus-icon {
      font-size: $font-size-large;
      font-weight: bold;
    }
  }
}

// DataTable 내부 커스텀 스타일
.btn-edit {
  padding: $spacing-xs $spacing-sm;
  background: transparent;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  color: $text-light;
  font-size: $font-size-small;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
  }
}

.status-badge {
  padding: 2px 8px;
  border-radius: $border-radius-sm;
  font-size: 11px;
  font-weight: $font-weight-medium;
  
  &.returned {
    background-color: rgba($success-color, 0.1);
    color: $success-color;
  }
  
  &.pending {
    background-color: rgba($warning-color, 0.1);
    color: $warning-color;
  }
}

.pagination-container {
  margin-top: $spacing-xl;
  display: flex;
  justify-content: center;
}
</style>
