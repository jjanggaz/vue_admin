<template>
  <div class="model-3d-page">
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <router-link 
        to="/model/3d" 
        class="tab-item"
        :class="{ active: $route.name === 'Model3D' }"
      >
        3D 모델 관리
      </router-link>
      <router-link 
        to="/model/revit" 
        class="tab-item"
        :class="{ active: $route.name === 'RevitManagement' }"
      >
        Revit 관리
      </router-link>
      <router-link 
        to="/model/standard" 
        class="tab-item"
        :class="{ active: $route.name === 'StandardManagement' }"
      >
        표준배치 관리
      </router-link>
    </div>

    <!-- Add Button -->
    <div class="action-bar">
      <button class="btn btn-primary add-button">
        <span class="plus-icon">+</span>
        새모델 업로드
      </button>
    </div>

    <!-- Data Table -->
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>순번</th>
            <th>항목</th>
            <th>정보분류</th>
            <th>입력일시</th>
            <th>등록다운 활용 일시</th>
            <th>반수여부</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="modelList.length === 0">
            <td colspan="7" class="empty-message">
              등록된 데이터가 없습니다
            </td>
          </tr>
          <tr v-for="(item, index) in modelList" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>{{ item.title }}</td>
            <td>{{ item.category }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>{{ formatDate(item.lastUsed) }}</td>
            <td>{{ item.isReturned ? '반납' : '미반납' }}</td>
            <td>
              <button class="btn-edit" @click="editItem(item)">수정</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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

interface ModelItem {
  id: string
  title: string
  category: string
  createdAt: string
  lastUsed: string | null
  isReturned: boolean
}

const modelList = ref<ModelItem[]>([])
const currentPage = ref(1)
const totalPages = ref(999)

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

const loadModelList = async () => {
  // API 호출로 데이터 로드
  try {
    // 임시 데이터 (실제로는 API 호출)
    modelList.value = []
  } catch (error) {
    console.error('데이터 로드 실패:', error)
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

.tab-navigation {
  display: flex;
  border-bottom: 1px solid $border-color;
  margin-bottom: $spacing-xl;

  .tab-item {
    padding: $spacing-md $spacing-lg;
    text-decoration: none;
    color: $text-light;
    border-bottom: 2px solid transparent;
    transition: $transition-base;
    font-weight: $font-weight-medium;

    &:hover {
      color: $primary-color;
    }

    &.active {
      color: $primary-color;
      border-bottom-color: $primary-color;
    }
  }
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

.data-table-container {
  background: $background-color;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: $spacing-md $spacing-lg;
    text-align: left;
    border-bottom: 1px solid $border-color;
  }

  thead {
    background-color: $background-light;

    th {
      font-weight: $font-weight-medium;
      color: $text-color;
      font-size: $font-size-small;
    }
  }

  tbody {
    td {
      color: $text-color;
      font-size: $font-size-small;
    }

    .empty-message {
      text-align: center;
      color: $text-light;
      padding: $spacing-xxl;
      font-style: italic;
    }

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
  }
}

.pagination-container {
  margin-top: $spacing-xl;
  display: flex;
  justify-content: center;
}
</style>
