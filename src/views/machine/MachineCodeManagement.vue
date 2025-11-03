<template>
  <div class="machine-code-page">
    <!-- 검색 바 -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="search" class="label-search">{{
            t("common.search")
          }}</label>
          <div class="form-item">
            <input
              type="text"
              id="search"
              :placeholder="t('placeholder.searchQuery')"
              v-model="searchQueryInput"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn-search" @click="handleSearch">
            {{ t("common.search") }}
          </button>
        </div>
      </div>
      <div class="btns">
        <button class="btn btn-primary btn-add" @click="openRegistModal">
          {{ t("common.add") }}
        </button>
        <button
          class="btn btn-primary btn-delete"
          @click="handleDelete"
          :disabled="selectedItems.length === 0"
        >
          {{ t("common.delete") }}
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
      <!-- 사용여부 슬롯 -->
      <template #cell-isActive="{ value }">
        {{ t("common.machineCodeStatus." + (value ? "active" : "inactive")) }}
      </template>

      <template #cell-actions="{ item }">
        <button class="btn-edit" @click.stop="editItem(item)">
          {{ t("common.edit") }}
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
          <h3>{{ isEditMode ? t("common.edit") : t("common.register") }}</h3>
          <button
            class="btn-close"
            @click="closeRegistModal"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt class="essential">{{ t("common.group") }}</dt>
            <dd>
              <input
                v-model="newCode.group"
                type="text"
                class="form-input"
                :placeholder="t('placeholder.machineCodeGroup')"
              />
            </dd>
            <dt class="essential">{{ t("common.name") }}</dt>
            <dd>
              <input
                v-model="newCode.name"
                type="text"
                class="form-input"
                :placeholder="t('placeholder.machineCodeName')"
              />
            </dd>
            <dt>{{ t("common.value") }}</dt>
            <dd>
              <input
                v-model="newCode.value"
                type="text"
                class="form-input"
                :placeholder="t('placeholder.machineCodeValue')"
              />
            </dd>
            <dt>{{ t("common.order") }}</dt>
            <dd>
              <input
                v-model="newCode.order"
                type="number"
                class="form-input"
                :placeholder="t('placeholder.machineCodeOrder')"
              />
            </dd>
            <dt>{{ t("common.description") }}</dt>
            <dd>
              <textarea
                v-model="newCode.description"
                class="form-input"
                :placeholder="t('placeholder.machineCodeDescription')"
                rows="3"
              ></textarea>
            </dd>
            <dt>{{ t("common.statusLabel") }}</dt>
            <dd>
              <select v-model="newCode.isActive" class="form-input">
                <option value="true">
                  {{ t("common.machineCodeStatus.active") }}
                </option>
                <option value="false">
                  {{ t("common.machineCodeStatus.inactive") }}
                </option>
              </select>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRegistModal">
            {{ t("common.cancel") }}
          </button>
          <button
            class="btn btn-primary"
            @click="handleSave"
            :disabled="!isFormValid"
          >
            {{ t("common.save") }}
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
  {
    key: "id",
    title: t("columns.machineCode.id"),
    width: "60px",
    sortable: false,
  },
  {
    key: "group",
    title: t("columns.machineCode.group"),
    width: "120px",
    sortable: true,
  },
  {
    key: "name",
    title: t("columns.machineCode.name"),
    width: "150px",
    sortable: true,
  },
  {
    key: "value",
    title: t("columns.machineCode.value"),
    width: "100px",
    sortable: true,
  },
  {
    key: "order",
    title: t("columns.machineCode.order"),
    width: "80px",
    sortable: true,
  },
  {
    key: "description",
    title: t("columns.machineCode.description"),
    width: "200px",
    sortable: true,
  },
  {
    key: "isActive",
    title: t("columns.machineCode.isActive"),
    width: "100px",
    sortable: true,
  },
  {
    key: "createdAt",
    title: t("columns.machineCode.createdAt"),
    width: "120px",
    sortable: true,
  },
  { key: "actions", title: t("common.edit"), width: "80px", sortable: false },
];

const codeList = ref<CodeItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
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
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }
  if (
    confirm(
      t("messages.confirm.deleteItems", { count: selectedItems.value.length })
    )
  ) {
    const selectedIds = selectedItems.value.map((item) => item.id);
    codeList.value = codeList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert(t("messages.success.deleted"));
  }
};

// 샘플 데이터 로드 함수
const loadData = () => {
  codeList.value = [];
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
@use "sass:color";

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
      background-color: color.scale($primary-color, $lightness: -10%);
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
      background-color: color.scale($background-light, $lightness: -5%);
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
    background-color: color.scale($primary-color, $lightness: -10%);
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
    background-color: color.scale($primary-color, $lightness: -10%);
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
