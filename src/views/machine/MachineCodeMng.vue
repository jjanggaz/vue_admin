<template>
  <div class="machine-code-page">
    <!-- 검색 바 -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="search" class="label-search">검색</label>
          <div class="form-item">
            <input
              type="text"
              id="search"
              placeholder="검색어를 입력하세요."
              v-model="searchQueryInput"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn-search" @click="handleSearch">검색</button>
        </div>
      </div>
      <div class="btns">
        <button class="btn btn-primary btn-add" @click="openRegistModal">
          추가
        </button>
        <button
          class="btn btn-primary btn-delete"
          @click="handleDelete"
          :disabled="selectedItems.length === 0"
        >
          삭제
        </button>
      </div>
    </div>

    <!-- 데이터 테이블 -->
    <DataTable
      :columns="tableColumns"
      :data="paginatedCodeList"
      :loading="loading"
      :selectable="true"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
    >
      <template #cell-actions="{ item }">
        <button class="btn-edit" @click.stop="editItem(item)">수정</button>
      </template>
    </DataTable>

    <!-- 페이징 -->
    <div class="pagination-container">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPagesComputed"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 등록/수정 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ isEditMode ? "수정" : "등록" }}</h3>
          <button class="btn-close" @click="closeRegistModal">X</button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt class="essential">코드그룹</dt>
            <dd>
              <input
                v-model="newCode.group"
                type="text"
                class="form-input"
                placeholder="코드그룹을 입력하세요"
              />
            </dd>
            <dt class="essential">코드명</dt>
            <dd>
              <input
                v-model="newCode.name"
                type="text"
                class="form-input"
                placeholder="코드명을 입력하세요"
              />
            </dd>
            <dt>코드값</dt>
            <dd>
              <input
                v-model="newCode.value"
                type="text"
                class="form-input"
                placeholder="코드값을 입력하세요"
              />
            </dd>
            <dt>순서</dt>
            <dd>
              <input
                v-model="newCode.order"
                type="number"
                class="form-input"
                placeholder="순서를 입력하세요"
              />
            </dd>
            <dt>설명</dt>
            <dd>
              <textarea
                v-model="newCode.description"
                class="form-input"
                placeholder="설명을 입력하세요"
                rows="3"
              ></textarea>
            </dd>
            <dt>사용여부</dt>
            <dd>
              <select v-model="newCode.isActive" class="form-input">
                <option value="true">사용</option>
                <option value="false">미사용</option>
              </select>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRegistModal">
            취소
          </button>
          <button
            class="btn btn-primary"
            @click="handleSave"
            :disabled="!isFormValid"
          >
            저장
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

interface CodeItem {
  id: string;
  group: string;
  name: string;
  value: string;
  order: number;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface RegistForm {
  group: string;
  name: string;
  value: string;
  order: number;
  description: string;
  isActive: boolean;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "id", title: "순번", width: "60px", sortable: false },
  { key: "group", title: "코드그룹", width: "120px", sortable: true },
  { key: "name", title: "코드명", width: "150px", sortable: true },
  { key: "value", title: "코드값", width: "100px", sortable: true },
  { key: "order", title: "순서", width: "80px", sortable: true },
  { key: "description", title: "설명", width: "200px", sortable: true },
  { key: "isActive", title: "사용여부", width: "100px", sortable: true },
  { key: "createdAt", title: "생성일", width: "120px", sortable: true },
  { key: "actions", title: "수정", width: "80px", sortable: false },
];

const codeList = ref<CodeItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedItems = ref<CodeItem[]>([]);
const searchQueryInput = ref("");
const searchQuery = ref("");
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newCode = ref<RegistForm>({
  group: "",
  name: "",
  value: "",
  order: 0,
  description: "",
  isActive: true,
});

const filteredCodeList = computed(() => {
  if (searchQuery.value) {
    return codeList.value.filter((code) =>
      Object.values(code).some(
        (v) =>
          v &&
          v.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return codeList.value;
});

const totalCountComputed = computed(() => filteredCodeList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);

const paginatedCodeList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCodeList.value.slice(start, end);
});

const isFormValid = computed(() => {
  return newCode.value.group.trim() !== "" && newCode.value.name.trim() !== "";
});

const handleSelectionChange = (selected: CodeItem[]) => {
  selectedItems.value = selected;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  selectedItems.value = [];
};

const handleSearch = () => {
  selectedItems.value = [];
  searchQuery.value = searchQueryInput.value;
  currentPage.value = 1;
};

const openRegistModal = () => {
  isEditMode.value = false;
  newCode.value = {
    group: "",
    name: "",
    value: "",
    order: 0,
    description: "",
    isActive: true,
  };
  isRegistModalOpen.value = true;
};

const closeRegistModal = () => {
  isRegistModalOpen.value = false;
  isEditMode.value = false;
};

const editItem = (item: CodeItem) => {
  isEditMode.value = true;
  newCode.value = {
    group: item.group,
    name: item.name,
    value: item.value,
    order: item.order,
    description: item.description,
    isActive: item.isActive,
  };
  isRegistModalOpen.value = true;
};

const handleSave = () => {
  if (isEditMode.value) {
    // 수정 로직
    const index = codeList.value.findIndex(
      (item) => item.id === selectedItems.value[0]?.id
    );
    if (index !== -1) {
      codeList.value[index] = {
        ...codeList.value[index],
        ...newCode.value,
      };
    }
  } else {
    // 등록 로직
    const newItem: CodeItem = {
      id: Date.now().toString(),
      ...newCode.value,
      createdAt: new Date().toISOString().split("T")[0],
    };
    codeList.value.unshift(newItem);
  }

  closeRegistModal();
  selectedItems.value = [];
};

const handleDelete = () => {
  if (selectedItems.value.length === 0) {
    alert("삭제할 항목을 선택하세요.");
    return;
  }
  if (
    confirm(`선택된 ${selectedItems.value.length}개의 항목을 삭제하시겠습니까?`)
  ) {
    const selectedIds = selectedItems.value.map((item) => item.id);
    codeList.value = codeList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert("삭제되었습니다.");
  }
};

onMounted(() => {
  // 샘플 데이터
  codeList.value = Array.from({ length: 20 }, (_, i) => ({
    id: (i + 1).toString(),
    group: ["기계타입", "기계상태", "기계등급"][i % 3],
    name: `코드${i + 1}`,
    value: `CODE-${String(i + 1).padStart(3, "0")}`,
    order: i + 1,
    description: `코드 ${i + 1}에 대한 설명입니다.`,
    isActive: i % 4 !== 0, // 4의 배수는 미사용
    createdAt: `2023-01-${(i % 28) + 1}`,
  }));
});
</script>

<style scoped lang="scss">
.machine-code-page {
  padding: $spacing-lg;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-bar {
  display: flex;
  align-items: center;
}

.group-form {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.label-search {
  margin-right: 0.5rem;
}

.form-item {
  margin-right: 0.5rem;
}

.btns {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &.btn-primary {
    background-color: $primary-color;
    color: white;

    &:hover {
      background-color: darken($primary-color, 10%);
    }

    &:disabled {
      background-color: $text-light;
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

.btn-search {
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

.btn-edit {
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    background-color: darken($primary-color, 10%);
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid $border-color;

  h3 {
    margin: 0;
    color: $text-color;
  }
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: $text-light;

  &:hover {
    color: $text-color;
  }
}

.modal-body {
  padding: 1rem;
}

.column-regist {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: center;

  dt {
    font-weight: bold;
    color: $text-color;

    &.essential::after {
      content: " *";
      color: red;
    }
  }

  dd {
    margin: 0;
  }
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid $border-color;
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid $border-color;
}
</style>
