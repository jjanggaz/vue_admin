<template>
  <div class="cost-management-page">
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
      :data="paginatedCostList"
      :loading="loading"
      :selectable="true"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <!-- 기계명 슬롯 -->
      <template #cell-machineName="{ value }">
        {{ t("common.costMachine.equipmentCode" + mapMachineName(value)) }}
      </template>

      <!-- 단위 슬롯 -->
      <template #cell-unit="{ value }">
        {{ t("common.costUnit.priceType" + mapUnit(value)) }}
      </template>

      <!-- 상태 슬롯 -->
      <template #cell-status="{ value }">
        {{ t("common.costStatus.priceValue" + mapStatus(value)) }}
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
            class="close-btn"
            @click="closeRegistModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt class="essential">{{ t("common.name") }}</dt>
            <dd>
              <input
                v-model="newCost.name"
                type="text"
                class="form-input"
                :placeholder="t('placeholder.costName')"
              />
            </dd>
            <dt class="essential">{{ t("columns.cost.machineName") }}</dt>
            <dd>
              <select v-model="newCost.machineName" class="form-input">
                <option value="">-- {{ t("common.select") }} --</option>
                <option value="펌프1">
                  {{ t("common.costMachine.pump1") }}
                </option>
                <option value="모터1">
                  {{ t("common.costMachine.motor1") }}
                </option>
                <option value="컨베이어1">
                  {{ t("common.costMachine.conveyor1") }}
                </option>
              </select>
            </dd>
            <dt>{{ t("columns.cost.targetCost") }}</dt>
            <dd>
              <input
                v-model="newCost.targetCost"
                type="number"
                class="form-input"
                :placeholder="t('placeholder.costCost')"
              />
            </dd>
            <dt>{{ t("columns.cost.unit") }}</dt>
            <dd>
              <select v-model="newCost.unit" class="form-input">
                <option value="원">{{ t("common.costUnit.won") }}</option>
                <option value="달러">
                  {{ t("common.costUnit.dollar") }}
                </option>
                <option value="엔">{{ t("common.costUnit.yen") }}</option>
              </select>
            </dd>
            <dt>{{ t("columns.cost.targetPeriod") }}</dt>
            <dd>
              <input
                v-model="newCost.targetPeriod"
                type="text"
                class="form-input"
                :placeholder="t('placeholder.costPeriod')"
              />
            </dd>
            <dt>{{ t("common.description") }}</dt>
            <dd>
              <textarea
                v-model="newCost.description"
                class="form-input"
                :placeholder="t('placeholder.costDescription')"
                rows="3"
              ></textarea>
            </dd>
            <dt>{{ t("columns.cost.status") }}</dt>
            <dd>
              <select v-model="newCost.status" class="form-input">
                <option value="진행중">
                  {{ t("common.costStatus.inProgress") }}
                </option>
                <option value="완료">
                  {{ t("common.costStatus.completed") }}
                </option>
                <option value="지연">
                  {{ t("common.costStatus.delayed") }}
                </option>
                <option value="취소">
                  {{ t("common.costStatus.cancelled") }}
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
import { useTranslateMessage } from "@/utils/translateMessage";
import {
  useCostStore,
  type CostItem,
  type CostCreateRequest,
} from "@/stores/costStore";

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

// Store 사용
const costStore = useCostStore();
const {
  costList,
  loading,
  currentPage,
  pageSize,
  totalPages,
  loadCostList,
  createCost,
  updateCost,
  deleteMultipleCosts,
  setCurrentPage,
} = costStore;

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  {
    key: "historyId",
    title: t("columns.cost.historyId"),
    width: "50px",
    sortable: false,
  },
  {
    key: "equipmentId",
    title: t("columns.cost.equipmentId"),
    width: "50px",
    sortable: true,
  },
  {
    key: "equipmentCode",
    title: t("columns.cost.equipmentCode"),
    width: "50px",
    sortable: true,
  },
  {
    key: "priceType",
    title: t("columns.cost.priceType"),
    width: "50px",
    sortable: true,
  },
  {
    key: "priceUnit_code",
    title: t("columns.cost.priceUnitCode"),
    width: "50px",
    sortable: true,
  },
  {
    key: "priceUnit_symbol",
    title: t("columns.cost.priceUnitSymbol"),
    width: "50px",
    sortable: true,
  },
  {
    key: "priceValue",
    title: t("columns.cost.priceValue"),
    width: "50px",
    sortable: true,
  },
  {
    key: "priceDate",
    title: t("columns.cost.priceDate"),
    width: "50px",
    sortable: true,
  },
  {
    key: "priceReference",
    title: t("columns.cost.priceReference"),
    width: "50px",
    sortable: true,
  },
  {
    key: "createdAt",
    title: t("columns.cost.createdAt"),
    width: "50px",
    sortable: true,
  },

  // {
  //   key: "id",
  //   title: t("columns.cost.id"),
  //   width: "60px",
  //   sortable: false,
  // },
  // {
  //   key: "name",
  //   title: t("columns.cost.name"),
  //   width: "150px",
  //   sortable: true,
  // },
  // {
  //   key: "machineName",
  //   title: t("columns.cost.machineName"),
  //   width: "120px",
  //   sortable: true,
  // },
  // {
  //   key: "targetCost",
  //   title: t("columns.cost.targetCost"),
  //   width: "120px",
  //   sortable: true,
  // },
  // {
  //   key: "unit",
  //   title: t("columns.cost.unit"),
  //   width: "80px",
  //   sortable: true,
  // },
  // {
  //   key: "targetPeriod",
  //   title: t("columns.cost.targetPeriod"),
  //   width: "150px",
  //   sortable: true,
  // },
  // {
  //   key: "description",
  //   title: t("columns.cost.description"),
  //   width: "200px",
  //   sortable: true,
  // },
  // {
  //   key: "status",
  //   title: t("columns.cost.status"),
  //   width: "100px",
  //   sortable: true,
  // },
  // {
  //   key: "createdAt",
  //   title: t("columns.cost.createdAt"),
  //   width: "120px",
  //   sortable: true,
  // },
  // { key: "actions", title: t("common.edit"), width: "80px", sortable: false },
];

const selectedItems = ref<CostItem[]>([]);
const searchQueryInput = ref("");
const searchQuery = ref("");
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newCost = ref<CostCreateRequest>({
  name: "",
  machineName: "",
  targetCost: 0,
  unit: "원",
  targetPeriod: "",
  description: "",
  status: "진행중",
});

const filteredCostList = computed(() => {
  if (!Array.isArray(costList.value)) {
    return [];
  }
  if (!searchQuery.value) {
    return costList.value;
  }
  const query = searchQuery.value.toLowerCase();
  return costList.value.filter((cost) => {
    if (!cost || typeof cost !== "object") {
      return false;
    }
    return Object.values(cost).some((v) => {
      if (v == null) {
        return false;
      }
      try {
        const str = String(v).toLowerCase();
        return str.includes(query);
      } catch {
        return false;
      }
    });
  });
});

const totalPagesComputed = computed(() => totalPages.value || 1);

const paginatedCostList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCostList.value.slice(start, end);
});

const isFormValid = computed(() => {
  return (
    newCost.value.name?.trim() !== "" &&
    newCost.value.machineName?.trim() !== ""
  );
});

// 데이터 로드
const loadData = async () => {
  try {
    await loadCostList({
      page: currentPage.value,
      page_size: pageSize.value,
      search_value: searchQuery.value || undefined,
    });
  } catch (error: unknown) {
    console.error("단가표 데이터 로드 실패:", error);
    // 백엔드 에러 메시지 표시
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.dataLoadFailed"
    );
    alert(errorMessage);
  }
};

const handleSelectionChange = (selected: CostItem[]) => {
  selectedItems.value = selected;
};

// 행 클릭 핸들러
const handleRowClick = (item: CostItem) => {
  console.log("Row clicked:", item);
  // row 클릭 시 해당 항목 선택 토글
  const index = selectedItems.value.findIndex(
    (selected) => selected.id === item.id
  );
  if (index > -1) {
    // 이미 선택된 경우 선택 해제
    selectedItems.value.splice(index, 1);
  } else {
    // 선택되지 않은 경우 선택
    selectedItems.value.push(item);
  }
};

const handlePageChange = (page: number) => {
  setCurrentPage(page);
  selectedItems.value = [];
  loadData();
};

const handleSearch = async () => {
  selectedItems.value = [];
  searchQuery.value = searchQueryInput.value;
  currentPage.value = 1;
  await loadData();
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

const handleSave = async () => {
  try {
    if (isEditMode.value) {
      // 수정 로직
      const selectedItem = selectedItems.value[0];
      if (selectedItem) {
        await updateCost(selectedItem.id, newCost.value);
      }
    } else {
      // 등록 로직
      await createCost(newCost.value);
    }

    closeRegistModal();
    selectedItems.value = [];
    // 데이터 다시 로드
    await loadData();
  } catch (error: unknown) {
    console.error("저장 실패:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.saveFailed"
    );
    alert(errorMessage);
  }
};

const handleDelete = async () => {
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", { count: selectedItems.value.length })
    )
  ) {
    try {
      const selectedIds = selectedItems.value.map((item) => item.id);
      await deleteMultipleCosts(selectedIds);
      selectedItems.value = [];
      alert(t("messages.success.deleted"));
      // 데이터 다시 로드
      await loadData();
    } catch (error: unknown) {
      console.error("삭제 실패:", error);
      const errorMessage = translateMessage(
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : undefined,
        "messages.error.deleteFailed"
      );
      alert(errorMessage);
    }
  }
};

// 기계명 매핑 (한글 → 영문 키)
function mapMachineName(val: string | null | undefined) {
  if (!val) return "pump1"; // 기본값
  if (val === "펌프1" || val === "pump1") return "pump1";
  if (val === "모터1" || val === "motor1") return "motor1";
  if (val === "컨베이어1" || val === "conveyor1") return "conveyor1";
  return String(val);
}

// 단위 매핑 (한글 → 영문 키)
function mapUnit(val: string | null | undefined) {
  if (!val) return "won"; // 기본값
  if (val === "원" || val === "won") return "won";
  if (val === "달러" || val === "dollar") return "dollar";
  if (val === "엔" || val === "yen") return "yen";
  return String(val);
}

// 상태 매핑 (한글 → 영문 키)
function mapStatus(val: string | null | undefined) {
  if (!val) return "inProgress"; // 기본값
  if (val === "진행중" || val === "inProgress") return "inProgress";
  if (val === "완료" || val === "completed") return "completed";
  if (val === "지연" || val === "delayed") return "delayed";
  if (val === "취소" || val === "cancelled") return "cancelled";
  return String(val);
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
@use "sass:color";

.cost-management-page {
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

.btn-search {
  color: white;
  width: 50px;
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

  &.btn-secondary {
    background-color: $background-light;
    color: $text-color;
    border: 1px solid $border-color;

    &:hover {
      background-color: color.scale($background-light, $lightness: -5%);
    }
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
