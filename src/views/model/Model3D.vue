<template>
  <div class="model-3d-page">
    <!-- Add Button -->
    <div class="action-bar">
      <button class="btn btn-primary add-button" @click="openUploadModal">
        <span class="plus-icon">+</span>
        {{ t("common.register") }}
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
        <button class="btn-edit" @click.stop="editItem(item)">
          {{ t("common.edit") }}
        </button>
      </template>

      <!-- 반납여부 슬롯 -->
      <template #cell-isReturned="{ value }">
        <span
          class="status-badge"
          :class="{ returned: value, pending: !value }"
        >
          {{ value ? t("common.returned") : t("common.notReturned") }}
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
          <h3>{{ t("common.register") }}</h3>
          <button
            class="modal-close"
            @click="closeUploadModal"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ t("common.modelName") }}</label>
            <input
              v-model="uploadForm.title"
              type="text"
              :placeholder="t('placeholder.enterModelName')"
            />
          </div>
          <div class="form-group">
            <label>{{ t("common.infoClassification") }}</label>
            <select v-model="uploadForm.category">
              <option value="">{{ t("common.selectCategory") }}</option>
              <option value="건축">
                {{ t("common.category.architecture") }}
              </option>
              <option value="기계">
                {{ t("common.category.mechanical") }}
              </option>
              <option value="전기">
                {{ t("common.category.electrical") }}
              </option>
              <option value="토목">
                {{ t("common.category.civil") }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t("common.fileUpload") }}</label>
            <div class="file-upload-row">
              <input
                type="text"
                :value="uploadForm.file ? uploadForm.file.name : ''"
                :placeholder="t('placeholder.selectFile')"
                readonly
                class="file-name-input"
              />
              <label class="file-select-btn">
                {{ t("common.selectFile") }}
                <input
                  type="file"
                  @change="handleFileUpload"
                  accept=".3ds,.obj,.fbx,.dae"
                  style="display: none"
                />
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeUploadModal">
            {{ t("common.cancel") }}
          </button>
          <button
            class="btn btn-primary"
            @click="submitUpload"
            :disabled="!uploadForm.title || !uploadForm.category"
          >
            {{ t("common.upload") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t("common.editModel") }}</h3>
          <button
            class="modal-close"
            @click="closeEditModal"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>{{ t("common.modelName") }}</label>
            <input
              v-model="editForm.title"
              type="text"
              :placeholder="t('placeholder.enterModelName')"
            />
          </div>
          <div class="form-group">
            <label>{{ t("common.infoClassification") }}</label>
            <select v-model="editForm.category">
              <option value="">{{ t("common.selectCategory") }}</option>
              <option value="건축">
                {{ t("common.category.architecture") }}
              </option>
              <option value="기계">
                {{ t("common.category.mechanical") }}
              </option>
              <option value="전기">
                {{ t("common.category.electrical") }}
              </option>
              <option value="토목">
                {{ t("common.category.civil") }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t("common.isReturned") }}</label>
            <select v-model="editForm.isReturned">
              <option :value="false">
                {{ t("common.notReturned") }}
              </option>
              <option :value="true">{{ t("common.returned") }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal">
            {{ t("common.cancel") }}
          </button>
          <button
            class="btn btn-primary"
            @click="submitEdit"
            :disabled="!editForm.title || !editForm.category"
          >
            {{ t("common.edit") }}
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
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface ModelItem {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  lastUsed: string | null;
  isReturned: boolean;
}

interface UploadForm {
  title: string;
  category: string;
  file: File | null;
}

interface EditForm {
  id: string;
  title: string;
  category: string;
  isReturned: boolean;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "id", title: t("columns.model3d.id"), sortable: true },
  { key: "title", title: t("columns.model3d.modelName"), sortable: true },
  {
    key: "category",
    title: t("columns.model3d.infoClassification"),
    sortable: true,
  },
  {
    key: "createdAt",
    title: t("columns.model3d.createdAt"),
    sortable: true,
  },
  { key: "lastUsed", title: t("columns.model3d.lastUsed"), sortable: true },
  {
    key: "isReturned",
    title: t("columns.model3d.isReturned"),
    sortable: true,
  },
  { key: "actions", title: t("common.action"), sortable: false },
];

const modelList = ref<ModelItem[]>([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const loading = ref(false);
const showUploadModal = ref(false);
const showEditModal = ref(false);
const uploadForm = ref<UploadForm>({
  title: "",
  category: "",
  file: null,
});
const editForm = ref<EditForm>({
  id: "",
  title: "",
  category: "",
  isReturned: false,
});

// 페이징된 데이터 계산
const totalPages = computed(() =>
  Math.ceil(modelList.value.length / itemsPerPage.value)
);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return modelList.value.slice(start, end);
});

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ko-KR");
};

const openUploadModal = () => {
  showUploadModal.value = true;
  uploadForm.value = { title: "", category: "", file: null };
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const openEditModal = (item: ModelItem) => {
  editForm.value = {
    id: item.id,
    title: item.title,
    category: item.category,
    isReturned: item.isReturned,
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
  if (!uploadForm.value.title || !uploadForm.value.category) return;

  const newModel: ModelItem = {
    id: String(Date.now()),
    title: uploadForm.value.title,
    category: uploadForm.value.category,
    createdAt: new Date().toISOString().split("T")[0],
    lastUsed: null,
    isReturned: false,
  };

  modelList.value.unshift(newModel);
  closeUploadModal();

  // 첫 페이지로 이동
  currentPage.value = 1;
};

const submitEdit = () => {
  if (!editForm.value.title || !editForm.value.category) return;

  const index = modelList.value.findIndex(
    (item) => item.id === editForm.value.id
  );
  if (index !== -1) {
    modelList.value[index] = {
      ...modelList.value[index],
      title: editForm.value.title,
      category: editForm.value.category,
      isReturned: editForm.value.isReturned,
    };
  }

  closeEditModal();
};

const editItem = (item: ModelItem) => {
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
  // 여기서 API 재호출하거나 로컬 정렬 처리
  loadModelList(sortInfo);
};

const handleRowClick = (item: ModelItem, index: number) => {
  console.log("Row clicked:", item, index);
  // 행 클릭 시 상세 페이지로 이동하거나 모달 열기 등
};

const loadModelList = async (sortInfo?: {
  key: string;
  direction: "asc" | "desc";
}) => {
  loading.value = true;
  try {
    // API 호출로 데이터 로드
    // 임시 샘플 데이터
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 로딩 시뮬레이션

    modelList.value = [
      {
        id: "1",
        title: "건물 외벽 모델",
        category: "건축",
        createdAt: "2024-01-15",
        lastUsed: "2024-07-01",
        isReturned: true,
      },
      {
        id: "2",
        title: "기계실 장비",
        category: "기계",
        createdAt: "2024-02-20",
        lastUsed: null,
        isReturned: false,
      },
      {
        id: "3",
        title: "전기 배선도",
        category: "전기",
        createdAt: "2024-03-10",
        lastUsed: "2024-06-15",
        isReturned: true,
      },
      {
        id: "4",
        title: "지하주차장 구조",
        category: "토목",
        createdAt: "2024-03-25",
        lastUsed: "2024-05-20",
        isReturned: false,
      },
      {
        id: "5",
        title: "엘리베이터 샤프트",
        category: "건축",
        createdAt: "2024-04-05",
        lastUsed: null,
        isReturned: true,
      },
      {
        id: "6",
        title: "공조 시스템",
        category: "기계",
        createdAt: "2024-04-12",
        lastUsed: "2024-06-30",
        isReturned: false,
      },
      {
        id: "7",
        title: "조명 설비",
        category: "전기",
        createdAt: "2024-04-18",
        lastUsed: "2024-07-10",
        isReturned: true,
      },
      {
        id: "8",
        title: "기초 구조물",
        category: "토목",
        createdAt: "2024-04-25",
        lastUsed: null,
        isReturned: false,
      },
      {
        id: "9",
        title: "창문 및 문",
        category: "건축",
        createdAt: "2024-05-02",
        lastUsed: "2024-06-25",
        isReturned: true,
      },
      {
        id: "10",
        title: "급수 시스템",
        category: "기계",
        createdAt: "2024-05-08",
        lastUsed: "2024-07-05",
        isReturned: false,
      },
      {
        id: "11",
        title: "소방 설비",
        category: "전기",
        createdAt: "2024-05-15",
        lastUsed: null,
        isReturned: true,
      },
      {
        id: "12",
        title: "도로 및 주차장",
        category: "토목",
        createdAt: "2024-05-22",
        lastUsed: "2024-06-18",
        isReturned: false,
      },
      {
        id: "13",
        title: "내부 인테리어",
        category: "건축",
        createdAt: "2024-05-29",
        lastUsed: "2024-07-12",
        isReturned: true,
      },
      {
        id: "14",
        title: "배수 시스템",
        category: "기계",
        createdAt: "2024-06-05",
        lastUsed: null,
        isReturned: false,
      },
      {
        id: "15",
        title: "보안 시스템",
        category: "전기",
        createdAt: "2024-06-12",
        lastUsed: "2024-07-08",
        isReturned: true,
      },
    ];

    console.log("Sort info:", sortInfo);
  } catch (error: any) {
    console.error("데이터 로드 실패:", error);
    const errorMessage = error?.message || "데이터 로드에 실패했습니다.";
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadModelList();
});
</script>

<style scoped lang="scss">
@use "sass:color";

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

.status-badge {
  padding: 2px 8px;
  border-radius: $border-radius-sm;
  font-size: 11px;
  font-weight: $font-weight-md;

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
          background-color: color.scale($primary-color, $lightness: -10%);
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
