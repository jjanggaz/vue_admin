<template>
  <div class="revit-management">
    <!-- Add Button -->
    <div class="action-bar">
      <button class="btn btn-primary add-button" @click="openUploadModal">
        <span class="plus-icon">+</span>
        새 Revit 파일 업로드
      </button>
    </div>

    <!-- Data Table -->
    <DataTable
      :columns="tableColumns"
      :data="paginatedData"
      :loading="loading"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <!-- 수정 버튼 슬롯 -->
      <template #cell-actions="{ item }">
        <button class="btn-edit" @click.stop="editItem(item)">수정</button>
      </template>

      <!-- 버전 슬롯 -->
      <template #cell-version="{ value }">
        <span class="version-badge">{{ value }}</span>
      </template>

      <!-- 상태 슬롯 -->
      <template #cell-status="{ value }">
        <span
          class="status-badge"
          :class="{ active: value === '활성', inactive: value === '비활성' }"
        >
          {{ value }}
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

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>새 Revit 파일 업로드</h3>
          <button class="modal-close" @click="closeUploadModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>파일명</label>
            <input
              v-model="uploadForm.title"
              type="text"
              placeholder="파일명을 입력하세요"
            />
          </div>
          <div class="form-group">
            <label>프로젝트명</label>
            <input
              v-model="uploadForm.project"
              type="text"
              placeholder="프로젝트명을 입력하세요"
            />
          </div>
          <div class="form-group">
            <label>버전</label>
            <input
              v-model="uploadForm.version"
              type="text"
              placeholder="버전을 입력하세요 (예: 1.0)"
            />
          </div>
          <div class="form-group">
            <label>파일 업로드</label>
            <div class="file-upload-row">
              <input
                type="text"
                :value="uploadForm.file ? uploadForm.file.name : ''"
                placeholder="파일을 선택하세요"
                readonly
                class="file-name-input"
              />
              <label class="file-select-btn">
                파일 선택
                <input
                  type="file"
                  @change="handleFileUpload"
                  accept=".rvt,.rfa"
                  style="display: none"
                />
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeUploadModal">
            취소
          </button>
          <button
            class="btn btn-primary"
            @click="submitUpload"
            :disabled="
              !uploadForm.title || !uploadForm.project || !uploadForm.version
            "
          >
            업로드
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Revit 파일 수정</h3>
          <button class="modal-close" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>파일명</label>
            <input
              v-model="editForm.title"
              type="text"
              placeholder="파일명을 입력하세요"
            />
          </div>
          <div class="form-group">
            <label>프로젝트명</label>
            <input
              v-model="editForm.project"
              type="text"
              placeholder="프로젝트명을 입력하세요"
            />
          </div>
          <div class="form-group">
            <label>버전</label>
            <input
              v-model="editForm.version"
              type="text"
              placeholder="버전을 입력하세요"
            />
          </div>
          <div class="form-group">
            <label>상태</label>
            <select v-model="editForm.status">
              <option value="활성">활성</option>
              <option value="비활성">비활성</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal">
            취소
          </button>
          <button
            class="btn btn-primary"
            @click="submitEdit"
            :disabled="
              !editForm.title || !editForm.project || !editForm.version
            "
          >
            수정
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";

interface RevitItem {
  id: string;
  title: string;
  project: string;
  version: string;
  createdAt: string;
  lastModified: string;
  status: string;
}

interface UploadForm {
  title: string;
  project: string;
  version: string;
  file: File | null;
}

interface EditForm {
  id: string;
  title: string;
  project: string;
  version: string;
  status: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  {
    key: "index",
    title: "순번",
    sortable: false,
    formatter: (value: any, item: any) => {
      const index = revitList.value.findIndex((r) => r.id === item.id);
      return String(index + 1);
    },
  },
  { key: "title", title: "파일명", sortable: true },
  { key: "project", title: "프로젝트명", sortable: true },
  { key: "version", title: "버전", sortable: true },
  {
    key: "createdAt",
    title: "생성일시",
    sortable: true,
    formatter: (value: any) => formatDate(value),
  },
  {
    key: "lastModified",
    title: "최종수정일시",
    sortable: true,
    formatter: (value: any) => formatDate(value),
  },
  { key: "status", title: "상태", sortable: true },
  { key: "actions", title: "수정", sortable: false },
];

const revitList = ref<RevitItem[]>([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const loading = ref(false);
const showUploadModal = ref(false);
const showEditModal = ref(false);
const uploadForm = ref<UploadForm>({
  title: "",
  project: "",
  version: "",
  file: null,
});
const editForm = ref<EditForm>({
  id: "",
  title: "",
  project: "",
  version: "",
  status: "",
});

// 페이징된 데이터 계산
const totalPages = computed(() =>
  Math.ceil(revitList.value.length / itemsPerPage.value)
);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return revitList.value.slice(start, end);
});

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ko-KR");
};

const openUploadModal = () => {
  showUploadModal.value = true;
  uploadForm.value = { title: "", project: "", version: "", file: null };
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const openEditModal = (item: RevitItem) => {
  editForm.value = {
    id: item.id,
    title: item.title,
    project: item.project,
    version: item.version,
    status: item.status,
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    uploadForm.value.file = target.files[0];
  }
};

const submitUpload = () => {
  if (
    !uploadForm.value.title ||
    !uploadForm.value.project ||
    !uploadForm.value.version
  )
    return;

  const newRevit: RevitItem = {
    id: String(Date.now()),
    title: uploadForm.value.title,
    project: uploadForm.value.project,
    version: uploadForm.value.version,
    createdAt: new Date().toISOString().split("T")[0],
    lastModified: new Date().toISOString().split("T")[0],
    status: "활성",
  };

  revitList.value.unshift(newRevit);
  closeUploadModal();

  // 첫 페이지로 이동
  currentPage.value = 1;
};

const submitEdit = () => {
  if (
    !editForm.value.title ||
    !editForm.value.project ||
    !editForm.value.version
  )
    return;

  const index = revitList.value.findIndex(
    (item) => item.id === editForm.value.id
  );
  if (index !== -1) {
    revitList.value[index] = {
      ...revitList.value[index],
      title: editForm.value.title,
      project: editForm.value.project,
      version: editForm.value.version,
      status: editForm.value.status,
      lastModified: new Date().toISOString().split("T")[0],
    };
  }

  closeEditModal();
};

const editItem = (item: RevitItem) => {
  openEditModal(item);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleSortChange = (sortInfo: {
  key: string;
  direction: "asc" | "desc";
}) => {
  console.log("Sort changed:", sortInfo);
  loadRevitList(sortInfo);
};

const handleRowClick = (item: RevitItem, index: number) => {
  console.log("Row clicked:", item, index);
};

const loadRevitList = async (sortInfo?: {
  key: string;
  direction: "asc" | "desc";
}) => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    revitList.value = [
      {
        id: "1",
        title: "건물_외벽.rvt",
        project: "신축 아파트 A동",
        version: "1.0",
        createdAt: "2024-01-15",
        lastModified: "2024-07-01",
        status: "활성",
      },
      {
        id: "2",
        title: "기계실_설비.rvt",
        project: "신축 아파트 A동",
        version: "2.1",
        createdAt: "2024-02-20",
        lastModified: "2024-06-15",
        status: "활성",
      },
      {
        id: "3",
        title: "전기_배선.rvt",
        project: "신축 아파트 A동",
        version: "1.5",
        createdAt: "2024-03-10",
        lastModified: "2024-06-30",
        status: "활성",
      },
      {
        id: "4",
        title: "지하주차장.rvt",
        project: "신축 아파트 A동",
        version: "1.2",
        createdAt: "2024-03-25",
        lastModified: "2024-05-20",
        status: "비활성",
      },
      {
        id: "5",
        title: "엘리베이터_샤프트.rvt",
        project: "신축 아파트 A동",
        version: "1.0",
        createdAt: "2024-04-05",
        lastModified: "2024-06-10",
        status: "활성",
      },
      {
        id: "6",
        title: "공조_시스템.rvt",
        project: "신축 아파트 A동",
        version: "2.0",
        createdAt: "2024-04-12",
        lastModified: "2024-06-30",
        status: "활성",
      },
      {
        id: "7",
        title: "조명_설비.rvt",
        project: "신축 아파트 A동",
        version: "1.8",
        createdAt: "2024-04-18",
        lastModified: "2024-07-10",
        status: "활성",
      },
      {
        id: "8",
        title: "기초_구조.rvt",
        project: "신축 아파트 A동",
        version: "1.1",
        createdAt: "2024-04-25",
        lastModified: "2024-05-15",
        status: "비활성",
      },
      {
        id: "9",
        title: "창문_문.rvt",
        project: "신축 아파트 A동",
        version: "1.3",
        createdAt: "2024-05-02",
        lastModified: "2024-06-25",
        status: "활성",
      },
      {
        id: "10",
        title: "급수_시스템.rvt",
        project: "신축 아파트 A동",
        version: "1.7",
        createdAt: "2024-05-08",
        lastModified: "2024-07-05",
        status: "활성",
      },
      {
        id: "11",
        title: "소방_설비.rvt",
        project: "신축 아파트 A동",
        version: "1.4",
        createdAt: "2024-05-15",
        lastModified: "2024-06-20",
        status: "활성",
      },
      {
        id: "12",
        title: "도로_주차장.rvt",
        project: "신축 아파트 A동",
        version: "1.0",
        createdAt: "2024-05-22",
        lastModified: "2024-06-18",
        status: "비활성",
      },
      {
        id: "13",
        title: "내부_인테리어.rvt",
        project: "신축 아파트 A동",
        version: "2.2",
        createdAt: "2024-05-29",
        lastModified: "2024-07-12",
        status: "활성",
      },
      {
        id: "14",
        title: "배수_시스템.rvt",
        project: "신축 아파트 A동",
        version: "1.6",
        createdAt: "2024-06-05",
        lastModified: "2024-06-28",
        status: "활성",
      },
      {
        id: "15",
        title: "보안_시스템.rvt",
        project: "신축 아파트 A동",
        version: "1.9",
        createdAt: "2024-06-12",
        lastModified: "2024-07-08",
        status: "활성",
      },
    ];

    console.log("Sort info:", sortInfo);
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRevitList();
});
</script>

<style scoped lang="scss">
@use "sass:color";

.revit-management {
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
    font-weight: $font-weight-md;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      transform: translateY(-1px);
      box-shadow: $shadow-md;
    }

    .plus-icon {
      font-size: $font-size-lg;
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
  font-size: $font-size-sm;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
  }
}

.version-badge {
  padding: 2px 8px;
  background-color: rgba($primary-color, 0.1);
  color: $primary-color;
  border-radius: $border-radius-sm;
  font-size: 11px;
  font-weight: $font-weight-md;
}

.status-badge {
  padding: 2px 8px;
  border-radius: $border-radius-sm;
  font-size: 11px;
  font-weight: $font-weight-md;

  &.active {
    background-color: rgba($success-color, 0.1);
    color: $success-color;
  }

  &.inactive {
    background-color: rgba($warning-color, 0.1);
    color: $warning-color;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: $spacing-lg;
}

// Modal 스타일
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: $border-radius-lg;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: $shadow-lg;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1px solid $border-color;

  h3 {
    margin: 0;
    color: $text-color;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: $font-size-xl;
    cursor: pointer;
    color: $text-light;

    &:hover {
      color: $text-color;
    }
  }
}

.modal-body {
  padding: $spacing-lg;

  .form-group {
    margin-bottom: $spacing-md;

    label {
      display: block;
      margin-bottom: $spacing-xs;
      color: $text-color;
      font-weight: $font-weight-md;
    }

    input,
    select {
      width: 100%;
      padding: $spacing-sm;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
      font-size: $font-size-sm;

      &:focus {
        outline: none;
        border-color: $primary-color;
      }
    }

    .file-upload-row {
      display: flex;
      gap: 8px;
      align-items: center;

      .file-name-input {
        flex: 1;
        padding: $spacing-sm;
        border: 1px solid $border-color;
        border-radius: $border-radius-sm;
        font-size: $font-size-sm;
        background: $background-light;
        color: $text-color;
      }
      .file-select-btn {
        display: inline-block;
        padding: $spacing-sm $spacing-lg;
        background: $primary-color;
        color: #fff;
        border-radius: $border-radius-sm;
        font-size: $font-size-sm;
        cursor: pointer;
        font-weight: $font-weight-md;
        transition: $transition-base;
        border: none;
        &:hover {
          background: color.scale($primary-color, $lightness: -10%);
        }
        input[type="file"] {
          display: none;
        }
      }
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: $spacing-lg;
  border-top: 1px solid $border-color;

  .btn {
    padding: $spacing-sm $spacing-lg;
    border: none;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    cursor: pointer;
    transition: $transition-base;

    &.btn-primary {
      background-color: $primary-color;
      color: white;

      &:hover:not(:disabled) {
        background-color: color.scale($primary-color, $lightness: -10%);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &.btn-secondary {
      background-color: $background-light;
      color: $text-color;
      border: 1px solid $border-color;

      &:hover {
        background-color: color.scale($background-light, $lightness: -5%);
      }
    }
  }
}
</style>
