<template>
  <div class="machine-page">
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
      :data="paginatedMachineList"
      :loading="loading"
      :selectable="true"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
    >
      <template #cell-actions="{ item }">
        <button class="btn-edit" @click.stop="openDetailModal(item)">
          보기
        </button>
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
            <dt class="essential">기계명</dt>
            <dd>
              <input
                v-model="newMachine.name"
                type="text"
                class="form-input"
                placeholder="기계명을 입력하세요"
              />
            </dd>
            <dt class="essential">기계코드</dt>
            <dd>
              <input
                v-model="newMachine.code"
                type="text"
                class="form-input"
                placeholder="기계코드를 입력하세요"
              />
            </dd>
            <dt>기계타입</dt>
            <dd>
              <select v-model="newMachine.type" class="form-input">
                <option value="">-- 선택 --</option>
                <option value="펌프">펌프</option>
                <option value="모터">모터</option>
                <option value="컨베이어">컨베이어</option>
              </select>
            </dd>
            <dt>설명</dt>
            <dd>
              <textarea
                v-model="newMachine.description"
                class="form-input"
                placeholder="설명을 입력하세요"
                rows="3"
              ></textarea>
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

    <!-- 상세정보 모달 -->
    <div v-if="isDetailModalOpen" class="modal-overlay">
      <div class="modal-container" style="max-width: 1200px">
        <div class="modal-header">
          <h3>상세정보</h3>
          <button class="btn-close" @click="closeDetailModal">X</button>
        </div>
        <div class="modal-body">
          <div style="overflow-x: auto">
            <DataTable
              v-if="!isDetailEditMode"
              :columns="detailTableColumns"
              :data="detailTableData"
              :loading="false"
              :selectable="false"
            />
            <table
              v-else
              style="width: 100%; border-collapse: collapse; text-align: center"
            >
              <thead>
                <tr>
                  <th>기계명</th>
                  <th>기계코드</th>
                  <th>기계타입</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input v-model="detailEditData.name" class="form-input" />
                  </td>
                  <td>
                    <input v-model="detailEditData.code" class="form-input" />
                  </td>
                  <td>
                    <select v-model="detailEditData.type" class="form-input">
                      <option value="">-- 선택 --</option>
                      <option value="펌프">펌프</option>
                      <option value="모터">모터</option>
                      <option value="컨베이어">컨베이어</option>
                    </select>
                  </td>
                  <td>
                    <input
                      v-model="detailEditData.description"
                      class="form-input"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="!isDetailEditMode"
            class="btn btn-primary"
            @click="handleDetailEdit"
          >
            수정
          </button>
          <button
            v-if="isDetailEditMode"
            class="btn btn-primary"
            @click="handleDetailSave"
          >
            저장
          </button>
          <button class="btn btn-secondary" @click="closeDetailModal">
            닫기
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

interface MachineItem {
  id: string;
  name: string;
  code: string;
  type: string;
  description: string;
  createdAt: string;
}

interface RegistForm {
  name: string;
  code: string;
  type: string;
  description: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "id", title: "순번", width: "60px", sortable: false },
  { key: "mcId", title: "기계ID", width: "150px", sortable: true },
  { key: "name", title: "기계명", width: "150px", sortable: true },
  { key: "code", title: "기계유형", width: "120px", sortable: true },
  { key: "type", title: "용량", width: "100px", sortable: true },
  { key: "description", title: "모델명", width: "200px", sortable: true },
  { key: "createdAt", title: "계산식", width: "120px", sortable: true },
  { key: "createdAt", title: "업체명", width: "120px", sortable: true },
  { key: "actions", title: "상세정보", width: "80px", sortable: false },
];

const machineList = ref<MachineItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedItems = ref<MachineItem[]>([]);
const searchQueryInput = ref("");
const searchQuery = ref("");
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newMachine = ref<RegistForm>({
  name: "",
  code: "",
  type: "",
  description: "",
});
const isDetailModalOpen = ref(false);
const detailItemData = ref<MachineItem | null>(null);
const isDetailEditMode = ref(false);
const detailEditData = ref<RegistForm>({
  name: "",
  code: "",
  type: "",
  description: "",
});

// 상세정보 DataTable용 컬럼
const detailTableColumns: TableColumn[] = [
  { key: "name", title: "기계명", width: "150px" },
  { key: "code", title: "기계코드", width: "150px" },
  { key: "type", title: "기계타입", width: "120px" },
  { key: "description", title: "설명", width: "200px" },
];
const detailTableData = computed(() =>
  detailItemData.value ? [detailItemData.value] : []
);

const filteredMachineList = computed(() => {
  if (searchQuery.value) {
    return machineList.value.filter((machine) =>
      Object.values(machine).some(
        (v) =>
          v &&
          v.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return machineList.value;
});

const totalCountComputed = computed(() => filteredMachineList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);

const paginatedMachineList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredMachineList.value.slice(start, end);
});

const isFormValid = computed(() => {
  return (
    newMachine.value.name.trim() !== "" && newMachine.value.code.trim() !== ""
  );
});

const handleSelectionChange = (selected: MachineItem[]) => {
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
  newMachine.value = {
    name: "",
    code: "",
    type: "",
    description: "",
  };
  isRegistModalOpen.value = true;
};

const closeRegistModal = () => {
  isRegistModalOpen.value = false;
  isEditMode.value = false;
};

const detailItem = (item: MachineItem) => {
  isEditMode.value = true;
  newMachine.value = {
    name: item.name,
    code: item.code,
    type: item.type,
    description: item.description,
  };
  isRegistModalOpen.value = true;
};

const handleSave = () => {
  if (isEditMode.value) {
    // 수정 로직
    const index = machineList.value.findIndex(
      (item) => item.id === selectedItems.value[0]?.id
    );
    if (index !== -1) {
      machineList.value[index] = {
        ...machineList.value[index],
        ...newMachine.value,
      };
    }
  } else {
    // 등록 로직
    const newItem: MachineItem = {
      id: Date.now().toString(),
      ...newMachine.value,
      createdAt: new Date().toISOString().split("T")[0],
    };
    machineList.value.unshift(newItem);
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
    machineList.value = machineList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert("삭제되었습니다.");
  }
};

const openDetailModal = (item: MachineItem) => {
  detailItemData.value = item;
  detailEditData.value = {
    name: item.name,
    code: item.code,
    type: item.type,
    description: item.description,
  };
  isDetailModalOpen.value = true;
  isDetailEditMode.value = false;
};
const closeDetailModal = () => {
  isDetailModalOpen.value = false;
  detailItemData.value = null;
  isDetailEditMode.value = false;
};

const handleDetailEdit = () => {
  isDetailEditMode.value = true;
};
const handleDetailSave = () => {
  if (!detailItemData.value) return;
  // machineList에서 해당 id 찾아서 수정
  const idx = machineList.value.findIndex(
    (m) => m.id === detailItemData.value?.id
  );
  if (idx !== -1) {
    machineList.value[idx] = {
      ...machineList.value[idx],
      ...detailEditData.value,
    };
    detailItemData.value = machineList.value[idx];
  }
  isDetailEditMode.value = false;
};

// 샘플 데이터 로드 함수
const loadData = () => {
  machineList.value = Array.from({ length: 15 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `기계${i + 1}`,
    code: `MCH-${String(i + 1).padStart(3, "0")}`,
    type: ["펌프", "모터", "컨베이어"][i % 3],
    description: `기계 ${i + 1}에 대한 설명입니다.`,
    createdAt: `2023-01-${(i % 28) + 1}`,
  }));
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.machine-page {
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
  max-width: 500px;
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
