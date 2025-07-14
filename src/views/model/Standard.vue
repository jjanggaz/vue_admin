<template>
  <div class="standard-management">
    <!-- Add Button -->
    <div class="action-bar">
      <button class="btn btn-primary add-button" @click="openUploadModal">
        <span class="plus-icon">+</span>
        새 표준배치 업로드
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

      <!-- 도면번호 슬롯 -->
      <template #cell-drawingNumber="{ value }">
        <span class="drawing-number-badge">{{ value }}</span>
      </template>

      <!-- 승인상태 슬롯 -->
      <template #cell-approvalStatus="{ value }">
        <span
          class="status-badge"
          :class="{
            approved: value === '승인',
            pending: value === '검토중',
            rejected: value === '반려',
          }"
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
          <h3>새 표준배치 업로드</h3>
          <button class="modal-close" @click="closeUploadModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>도면명</label>
            <input
              v-model="uploadForm.title"
              type="text"
              placeholder="도면명을 입력하세요"
            />
          </div>
          <div class="form-group">
            <label>도면번호</label>
            <input
              v-model="uploadForm.drawingNumber"
              type="text"
              placeholder="도면번호를 입력하세요"
            />
          </div>
          <div class="form-group">
            <label>도면종류</label>
            <select v-model="uploadForm.drawingType">
              <option value="">도면종류를 선택하세요</option>
              <option value="평면도">평면도</option>
              <option value="입면도">입면도</option>
              <option value="단면도">단면도</option>
              <option value="상세도">상세도</option>
            </select>
          </div>
          <div class="form-group">
            <label>파일 업로드</label>
            <input
              type="file"
              @change="handleFileUpload"
              accept=".dwg,.pdf,.dxf"
            />
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
              !uploadForm.title ||
              !uploadForm.drawingNumber ||
              !uploadForm.drawingType
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
          <h3>표준배치 수정</h3>
          <button class="modal-close" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>도면명</label>
            <input
              v-model="editForm.title"
              type="text"
              placeholder="도면명을 입력하세요"
            />
          </div>
          <div class="form-group">
            <label>도면번호</label>
            <input
              v-model="editForm.drawingNumber"
              type="text"
              placeholder="도면번호를 입력하세요"
            />
          </div>
          <div class="form-group">
            <label>도면종류</label>
            <select v-model="editForm.drawingType">
              <option value="">도면종류를 선택하세요</option>
              <option value="평면도">평면도</option>
              <option value="입면도">입면도</option>
              <option value="단면도">단면도</option>
              <option value="상세도">상세도</option>
            </select>
          </div>
          <div class="form-group">
            <label>승인상태</label>
            <select v-model="editForm.approvalStatus">
              <option value="검토중">검토중</option>
              <option value="승인">승인</option>
              <option value="반려">반려</option>
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
              !editForm.title ||
              !editForm.drawingNumber ||
              !editForm.drawingType
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

interface StandardItem {
  id: string;
  title: string;
  drawingNumber: string;
  drawingType: string;
  createdAt: string;
  lastModified: string;
  approvalStatus: string;
}

interface UploadForm {
  title: string;
  drawingNumber: string;
  drawingType: string;
  file: File | null;
}

interface EditForm {
  id: string;
  title: string;
  drawingNumber: string;
  drawingType: string;
  approvalStatus: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  {
    key: "index",
    title: "순번",
    sortable: false,
    formatter: (value: any, item: any) => {
      const index = standardList.value.findIndex((s) => s.id === item.id);
      return String(index + 1);
    },
  },
  { key: "title", title: "도면명", sortable: true },
  { key: "drawingNumber", title: "도면번호", sortable: true },
  { key: "drawingType", title: "도면종류", sortable: true },
  {
    key: "createdAt",
    title: "등록일시",
    sortable: true,
    formatter: (value: any) => formatDate(value),
  },
  {
    key: "lastModified",
    title: "최종수정일시",
    sortable: true,
    formatter: (value: any) => formatDate(value),
  },
  { key: "approvalStatus", title: "승인상태", sortable: true },
  { key: "actions", title: "수정", sortable: false },
];

const standardList = ref<StandardItem[]>([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const loading = ref(false);
const showUploadModal = ref(false);
const showEditModal = ref(false);
const uploadForm = ref<UploadForm>({
  title: "",
  drawingNumber: "",
  drawingType: "",
  file: null,
});
const editForm = ref<EditForm>({
  id: "",
  title: "",
  drawingNumber: "",
  drawingType: "",
  approvalStatus: "",
});

// 페이징된 데이터 계산
const totalPages = computed(() =>
  Math.ceil(standardList.value.length / itemsPerPage.value)
);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return standardList.value.slice(start, end);
});

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ko-KR");
};

const openUploadModal = () => {
  showUploadModal.value = true;
  uploadForm.value = {
    title: "",
    drawingNumber: "",
    drawingType: "",
    file: null,
  };
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const openEditModal = (item: StandardItem) => {
  editForm.value = {
    id: item.id,
    title: item.title,
    drawingNumber: item.drawingNumber,
    drawingType: item.drawingType,
    approvalStatus: item.approvalStatus,
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
    !uploadForm.value.drawingNumber ||
    !uploadForm.value.drawingType
  )
    return;

  const newStandard: StandardItem = {
    id: String(Date.now()),
    title: uploadForm.value.title,
    drawingNumber: uploadForm.value.drawingNumber,
    drawingType: uploadForm.value.drawingType,
    createdAt: new Date().toISOString().split("T")[0],
    lastModified: new Date().toISOString().split("T")[0],
    approvalStatus: "검토중",
  };

  standardList.value.unshift(newStandard);
  closeUploadModal();

  // 첫 페이지로 이동
  currentPage.value = 1;
};

const submitEdit = () => {
  if (
    !editForm.value.title ||
    !editForm.value.drawingNumber ||
    !editForm.value.drawingType
  )
    return;

  const index = standardList.value.findIndex(
    (item) => item.id === editForm.value.id
  );
  if (index !== -1) {
    standardList.value[index] = {
      ...standardList.value[index],
      title: editForm.value.title,
      drawingNumber: editForm.value.drawingNumber,
      drawingType: editForm.value.drawingType,
      approvalStatus: editForm.value.approvalStatus,
      lastModified: new Date().toISOString().split("T")[0],
    };
  }

  closeEditModal();
};

const editItem = (item: StandardItem) => {
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
  loadStandardList(sortInfo);
};

const handleRowClick = (item: StandardItem, index: number) => {
  console.log("Row clicked:", item, index);
};

const loadStandardList = async (sortInfo?: {
  key: string;
  direction: "asc" | "desc";
}) => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    standardList.value = [
      {
        id: "1",
        title: "1층 평면도",
        drawingNumber: "A-001",
        drawingType: "평면도",
        createdAt: "2024-01-15",
        lastModified: "2024-07-01",
        approvalStatus: "승인",
      },
      {
        id: "2",
        title: "2층 평면도",
        drawingNumber: "A-002",
        drawingType: "평면도",
        createdAt: "2024-02-20",
        lastModified: "2024-06-15",
        approvalStatus: "승인",
      },
      {
        id: "3",
        title: "정면도",
        drawingNumber: "A-003",
        drawingType: "입면도",
        createdAt: "2024-03-10",
        lastModified: "2024-06-30",
        approvalStatus: "검토중",
      },
      {
        id: "4",
        title: "측면도",
        drawingNumber: "A-004",
        drawingType: "입면도",
        createdAt: "2024-03-25",
        lastModified: "2024-05-20",
        approvalStatus: "반려",
      },
      {
        id: "5",
        title: "A-A 단면도",
        drawingNumber: "A-005",
        drawingType: "단면도",
        createdAt: "2024-04-05",
        lastModified: "2024-06-10",
        approvalStatus: "승인",
      },
      {
        id: "6",
        title: "B-B 단면도",
        drawingNumber: "A-006",
        drawingType: "단면도",
        createdAt: "2024-04-12",
        lastModified: "2024-06-30",
        approvalStatus: "검토중",
      },
      {
        id: "7",
        title: "창문 상세도",
        drawingNumber: "D-001",
        drawingType: "상세도",
        createdAt: "2024-04-18",
        lastModified: "2024-07-10",
        approvalStatus: "승인",
      },
      {
        id: "8",
        title: "문 상세도",
        drawingNumber: "D-002",
        drawingType: "상세도",
        createdAt: "2024-04-25",
        lastModified: "2024-05-15",
        approvalStatus: "검토중",
      },
      {
        id: "9",
        title: "지하1층 평면도",
        drawingNumber: "A-007",
        drawingType: "평면도",
        createdAt: "2024-05-02",
        lastModified: "2024-06-25",
        approvalStatus: "승인",
      },
      {
        id: "10",
        title: "옥상 평면도",
        drawingNumber: "A-008",
        drawingType: "평면도",
        createdAt: "2024-05-08",
        lastModified: "2024-07-05",
        approvalStatus: "승인",
      },
      {
        id: "11",
        title: "C-C 단면도",
        drawingNumber: "A-009",
        drawingType: "단면도",
        createdAt: "2024-05-15",
        lastModified: "2024-06-20",
        approvalStatus: "검토중",
      },
      {
        id: "12",
        title: "계단 상세도",
        drawingNumber: "D-003",
        drawingType: "상세도",
        createdAt: "2024-05-22",
        lastModified: "2024-06-18",
        approvalStatus: "승인",
      },
      {
        id: "13",
        title: "엘리베이터 상세도",
        drawingNumber: "D-004",
        drawingType: "상세도",
        createdAt: "2024-05-29",
        lastModified: "2024-07-12",
        approvalStatus: "검토중",
      },
      {
        id: "14",
        title: "배관 상세도",
        drawingNumber: "D-005",
        drawingType: "상세도",
        createdAt: "2024-06-05",
        lastModified: "2024-06-28",
        approvalStatus: "승인",
      },
      {
        id: "15",
        title: "전기 배선 상세도",
        drawingNumber: "D-006",
        drawingType: "상세도",
        createdAt: "2024-06-12",
        lastModified: "2024-07-08",
        approvalStatus: "검토중",
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
  loadStandardList();
});
</script>

<style scoped lang="scss">
.standard-management {
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

.drawing-number-badge {
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

  &.approved {
    background-color: rgba($success-color, 0.1);
    color: $success-color;
  }

  &.pending {
    background-color: rgba($warning-color, 0.1);
    color: $warning-color;
  }

  &.rejected {
    background-color: rgba($error-color, 0.1);
    color: $error-color;
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
        background-color: darken($primary-color, 10%);
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
        background-color: darken($background-light, 5%);
      }
    }
  }
}
</style>
