<template>
  <div class="cost-target-page">
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
      :data="paginatedCostList"
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
            <dt class="essential">목표명</dt>
            <dd>
              <input
                v-model="newCost.name"
                type="text"
                class="form-input"
                placeholder="목표명을 입력하세요"
              />
            </dd>
            <dt class="essential">기계명</dt>
            <dd>
              <select v-model="newCost.machineName" class="form-input">
                <option value="">-- 선택 --</option>
                <option value="펌프1">펌프1</option>
                <option value="모터1">모터1</option>
                <option value="컨베이어1">컨베이어1</option>
              </select>
            </dd>
            <dt>목표비용</dt>
            <dd>
              <input
                v-model="newCost.targetCost"
                type="number"
                class="form-input"
                placeholder="목표비용을 입력하세요"
              />
            </dd>
            <dt>단위</dt>
            <dd>
              <select v-model="newCost.unit" class="form-input">
                <option value="원">원</option>
                <option value="달러">달러</option>
                <option value="엔">엔</option>
              </select>
            </dd>
            <dt>목표기간</dt>
            <dd>
              <input
                v-model="newCost.targetPeriod"
                type="text"
                class="form-input"
                placeholder="목표기간을 입력하세요 (예: 2025.01-2025.12)"
              />
            </dd>
            <dt>설명</dt>
            <dd>
              <textarea
                v-model="newCost.description"
                class="form-input"
                placeholder="설명을 입력하세요"
                rows="3"
              ></textarea>
            </dd>
            <dt>상태</dt>
            <dd>
              <select v-model="newCost.status" class="form-input">
                <option value="진행중">진행중</option>
                <option value="완료">완료</option>
                <option value="지연">지연</option>
                <option value="취소">취소</option>
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

interface CostItem {
  id: string;
  name: string;
  machineName: string;
  targetCost: number;
  unit: string;
  targetPeriod: string;
  description: string;
  status: string;
  createdAt: string;
}

interface RegistForm {
  name: string;
  machineName: string;
  targetCost: number;
  unit: string;
  targetPeriod: string;
  description: string;
  status: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "id", title: "순번", width: "60px", sortable: false },
  { key: "name", title: "목표명", width: "150px", sortable: true },
  { key: "machineName", title: "기계명", width: "120px", sortable: true },
  { key: "targetCost", title: "목표비용", width: "120px", sortable: true },
  { key: "unit", title: "단위", width: "80px", sortable: true },
  { key: "targetPeriod", title: "목표기간", width: "150px", sortable: true },
  { key: "description", title: "설명", width: "200px", sortable: true },
  { key: "status", title: "상태", width: "100px", sortable: true },
  { key: "createdAt", title: "생성일", width: "120px", sortable: true },
  { key: "actions", title: "수정", width: "80px", sortable: false },
];

const costList = ref<CostItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedItems = ref<CostItem[]>([]);
const searchQueryInput = ref("");
const searchQuery = ref("");
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newCost = ref<RegistForm>({
  name: "",
  machineName: "",
  targetCost: 0,
  unit: "원",
  targetPeriod: "",
  description: "",
  status: "진행중",
});

const filteredCostList = computed(() => {
  if (searchQuery.value) {
    return costList.value.filter((cost) =>
      Object.values(cost).some(
        (v) =>
          v &&
          v.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return costList.value;
});

const totalCountComputed = computed(() => filteredCostList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);

const paginatedCostList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCostList.value.slice(start, end);
});

const isFormValid = computed(() => {
  return (
    newCost.value.name.trim() !== "" && newCost.value.machineName.trim() !== ""
  );
});

const handleSelectionChange = (selected: CostItem[]) => {
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
  newCost.value = {
    name: "",
    machineName: "",
    targetCost: 0,
    unit: "원",
    targetPeriod: "",
    description: "",
    status: "진행중",
  };
  isRegistModalOpen.value = true;
};

const closeRegistModal = () => {
  isRegistModalOpen.value = false;
  isEditMode.value = false;
};

const editItem = (item: CostItem) => {
  isEditMode.value = true;
  newCost.value = {
    name: item.name,
    machineName: item.machineName,
    targetCost: item.targetCost,
    unit: item.unit,
    targetPeriod: item.targetPeriod,
    description: item.description,
    status: item.status,
  };
  isRegistModalOpen.value = true;
};

const handleSave = () => {
  if (isEditMode.value) {
    // 수정 로직
    const index = costList.value.findIndex(
      (item) => item.id === selectedItems.value[0]?.id
    );
    if (index !== -1) {
      costList.value[index] = {
        ...costList.value[index],
        ...newCost.value,
      };
    }
  } else {
    // 등록 로직
    const newItem: CostItem = {
      id: Date.now().toString(),
      ...newCost.value,
      createdAt: new Date().toISOString().split("T")[0],
    };
    costList.value.unshift(newItem);
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
    costList.value = costList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert("삭제되었습니다.");
  }
};

onMounted(() => {
  // 샘플 데이터
  costList.value = Array.from({ length: 18 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `비용목표${i + 1}`,
    machineName: ["펌프1", "모터1", "컨베이어1"][i % 3],
    targetCost: 1000000 + i * 500000,
    unit: ["원", "달러", "엔"][i % 3],
    targetPeriod: `2025.${String(Math.floor(i / 3) + 1).padStart(
      2,
      "0"
    )}-2025.${String(Math.floor(i / 3) + 6).padStart(2, "0")}`,
    description: `비용목표 ${i + 1}에 대한 설명입니다.`,
    status: ["진행중", "완료", "지연", "취소"][i % 4],
    createdAt: `2023-01-${(i % 28) + 1}`,
  }));
});
</script>

<style scoped lang="scss">
.cost-target-page {
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
  margin-top: 1rem;
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
