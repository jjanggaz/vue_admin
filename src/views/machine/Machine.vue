<template>
  <div class="machine-page">
    <div class="page-layout" :class="{ 'detail-open': isDetailPanelOpen }">
      <!-- 메인 콘텐츠 영역 -->
      <div class="main-content">
        <!-- 검색 및 필터 바 -->
        <div class="search-filter-bar">
          <div class="filter-group">
            <div class="filter-item">
              <label for="machineCategory">기계 대분류</label>
              <select
                id="machineCategory"
                v-model="selectedMachineCategory"
                class="form-select"
                @change="handleMachineCategoryChange"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="category in machineStore.secondDepth"
                  :key="category.code_id"
                  :value="category.code_key"
                >
                  {{ category.code_value }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label for="unit">{{ t("common.unit") }}</label>
              <select id="unit" v-model="selectedUnit" class="form-select">
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="unit in machineStore.unitSystems"
                  :key="unit.unit_system_id"
                  :value="unit.system_code.toLowerCase()"
                >
                  {{ unit.system_name }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label for="search">{{ t("common.search") }}</label>
              <input
                type="text"
                id="search"
                :placeholder="t('placeholder.machineSearch')"
                v-model="searchQueryInput"
                @keyup.enter="handleSearch"
                class="form-input"
              />
              <button class="btn-search" @click="handleSearch">
                {{ t("common.search") }}
              </button>
            </div>
          </div>
        </div>

        <!-- 기계 리스트 헤더 -->
        <div class="machine-list-header">
          <h2>{{ t("common.machineList") }}</h2>
          <div class="action-buttons">
            <button
              class="btn btn-primary btn-register"
              @click="openRegistModal"
            >
              {{ t("common.register") }}
            </button>
            <button class="btn btn-primary btn-edit" @click="handleEdit">
              {{ t("common.edit") }}
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
          :data="paginatedMachineList"
          :loading="loading"
          :selectable="true"
          :selected-items="selectedItems"
          :selection-mode="'single'"
          :show-select-all="false"
          :select-header-text="t('common.selectColumn')"
          @selection-change="handleSelectionChange"
        >
          <!-- 순번 슬롯 -->
          <template #cell-no="{ index }">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </template>

          <!-- 기계타입 슬롯 -->
          <template #cell-type="{ value }">
            {{ t("common.machineType." + mapMachineType(value)) }}
          </template>

          <!-- 상세정보 액션 슬롯 -->
          <template #cell-details="{ item }">
            <button class="btn-view" @click.stop="openDetailPanel(item)">
              {{ t("common.view") }}
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
      </div>

      <!-- 상세정보 패널 -->
      <div v-if="isDetailPanelOpen" class="detail-panel">
        <div class="detail-panel-header">
          <h3>{{ t("common.detailInfo") }}</h3>
          <button
            class="btn-close"
            @click="closeDetailPanel"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="detail-panel-body">
          <div class="detail-tables-container">
            <!-- 상세정보 보기 모드: 세로형 테이블 2개 구성 -->
            <!-- 사양 정보 -->
            <div class="detail-section">
              <h4 class="section-title">{{ t("common.specifications") }}</h4>
              <VerticalDataTable :data="specVerticalData" :loading="false" />
            </div>

            <!-- 간격 -->
            <div style="height: 24px" />

            <!-- 단가/견적 정보 -->
            <div class="detail-section">
              <h4 class="section-title">{{ t("common.priceInfo") }}</h4>
              <VerticalDataTable :data="costVerticalData" :loading="false" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 등록/수정 모달: 내부 탭 구성 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container" style="max-width: 1600px; width: 98%">
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
          <div class="tabs-wrapper">
            <div
              v-for="(tab, idx) in modalTabs"
              :key="tab.key"
              :class="['tab', { active: modalActiveTab === idx }]"
              @click="modalActiveTab = idx"
            >
              {{ tab.label }}
            </div>
          </div>
          <div class="tab-content">
            <template v-if="!isEditMode">
              <MachineRegisterTab v-if="modalActiveTab === 0" />
              <MachineFormulaRegisterTab v-if="modalActiveTab === 1" />
            </template>
            <template v-else>
              <MachineUpdateTab v-if="modalActiveTab === 0" />
              <MachineFormulaUpdateTab v-if="modalActiveTab === 1" />
            </template>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRegistModal">
            {{ t("common.close") }}
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
import VerticalDataTable from "@/components/common/VerticalDataTable.vue";
import MachineRegisterTab from "./components/MachineRegisterTab.vue";
import MachineFormulaRegisterTab from "./components/MachineFormulaRegisterTab.vue";
import MachineUpdateTab from "./components/MachineUpdateTab.vue";
import MachineFormulaUpdateTab from "./components/MachineFormulaUpdateTab.vue";
import { useI18n } from "vue-i18n";
import { useMachineStore } from "@/stores/machineStore";

const { t } = useI18n();
const machineStore = useMachineStore();

// 모달 탭 구성 (ProjectDetail 스타일)
const modalTabs = [
  { key: "machine", label: "기계 등록" },
  {
    key: "formula",
    label: "기계 계산식 등록",
  },
];
const modalActiveTab = ref(0);

interface MachineItem {
  id: string;
  name: string;
  code: string;
  type: string;
  description: string;
  createdAt: string;
  capacity?: string;
  capacityMax?: string;
  model?: string;
  formula?: string;
  company?: string;
  dischargePressure?: string;
  dischargeDiameter?: string;
  power?: string;
  controlMethod?: string;
  ratedVoltage?: string;
  efficiency?: string;
  powerFactor?: string;
  demandFactor?: string;
  totalWeight?: string;
  material?: string;
  // 단가/견적 필드
  unit_price?: string;
  price_registered_at?: string;
  estimate_price?: string;
  estimated_at?: string;
  execution_price?: string;
  proposal_price?: string;
  note?: string;
}

interface RegistForm {
  name: string;
  code: string;
  type: string;
  description: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "no", title: t("columns.machine.no"), width: "60px", sortable: false },
  {
    key: "code",
    title: t("columns.machine.mcId"),
    width: "150px",
    sortable: false,
  },
  {
    key: "name",
    title: t("columns.machine.name"),
    width: "150px",
    sortable: false,
  },
  {
    key: "type",
    title: t("columns.machine.type"),
    width: "100px",
    sortable: false,
  },
  {
    key: "capacity",
    title: t("columns.machine.capacity"),
    width: "100px",
    sortable: false,
  },
  {
    key: "model",
    title: t("columns.machine.model"),
    width: "120px",
    sortable: false,
  },
  {
    key: "formula",
    title: t("columns.machine.formula"),
    width: "100px",
    sortable: false,
  },
  {
    key: "company",
    title: t("columns.machine.company"),
    width: "120px",
    sortable: false,
  },
  {
    key: "details",
    title: t("columns.machine.details"),
    width: "80px",
    sortable: false,
  },
];

const machineList = ref<MachineItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedItems = ref<MachineItem[]>([]);
const searchQueryInput = ref("");
const searchQuery = ref("");
const selectedUnit = ref("");
const selectedMachineCategory = ref("");
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newMachine = ref<RegistForm>({
  name: "",
  code: "",
  type: "",
  description: "",
});
const isDetailPanelOpen = ref(false);
const detailItemData = ref<MachineItem | null>(null);
// 편집 기능 제거로 관련 상태 제거
const isDetailEditMode = ref(false);

// VerticalDataTable용 사양 데이터
const specVerticalData = computed(() => {
  if (!detailItemData.value) return [];
  const item = detailItemData.value;
  return [
    { columnName: t("columns.machine.code"), value: item.code || "-" },
    {
      columnName: t("columns.machine.type"),
      value: t("common.machineType." + mapMachineType(item.type)) || "-",
    },
    { columnName: t("columns.machine.company"), value: item.company || "-" },
    { columnName: t("columns.machine.model"), value: item.model || "-" },
    { columnName: t("columns.machine.capacity"), value: item.capacity || "-" },
    {
      columnName: t("columns.machine.capacityMax"),
      value: item.capacityMax || "-",
    },
    {
      columnName: t("columns.machine.dischargePressure"),
      value: item.dischargePressure || "-",
    },
    {
      columnName: t("columns.machine.dischargeDiameter"),
      value: item.dischargeDiameter || "-",
    },
    { columnName: t("columns.machine.power"), value: item.power || "-" },
  ];
});

// VerticalDataTable용 단가/견적 데이터
const costVerticalData = computed(() => {
  if (!detailItemData.value) return [];
  const item = detailItemData.value;
  return [
    {
      columnName: t("columns.machine.controlMethod"),
      value: item.controlMethod || "-",
    },
    {
      columnName: t("columns.machine.ratedVoltage"),
      value: item.ratedVoltage || "-",
    },
    {
      columnName: t("columns.machine.efficiency"),
      value: item.efficiency || "-",
    },
    {
      columnName: t("columns.machine.powerFactor"),
      value: item.powerFactor || "-",
    },
    {
      columnName: t("columns.machine.demandFactor"),
      value: item.demandFactor || "-",
    },
    { columnName: t("columns.machine.formula"), value: item.formula || "-" },
    {
      columnName: t("columns.machine.totalWeight"),
      value: item.totalWeight || "-",
    },
    { columnName: t("columns.machine.material"), value: item.material || "-" },
    { columnName: "단가", value: item.unit_price || "-" },
    { columnName: "견적가", value: item.estimate_price || "-" },
    { columnName: "실행가", value: item.execution_price || "-" },
    { columnName: "제안가", value: item.proposal_price || "-" },
  ];
});

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

// (기존 단일 등록 폼 유효성 제거)

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

const handleEdit = () => {
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToEdit"));
    return;
  }
  if (selectedItems.value.length > 1) {
    alert(t("messages.warning.pleaseSelectOneItemToEdit"));
    return;
  }

  isEditMode.value = true;
  newMachine.value = {
    name: selectedItems.value[0].name,
    code: selectedItems.value[0].code,
    type: selectedItems.value[0].type,
    description: selectedItems.value[0].description,
  };
  isRegistModalOpen.value = true;
};

// (기존 단일 등록/수정 저장 핸들러 제거)

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
    machineList.value = machineList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert(t("messages.success.deleted"));
  }
};

const openDetailPanel = (item: MachineItem) => {
  detailItemData.value = item;
  isDetailPanelOpen.value = true;
  isDetailEditMode.value = false;
};
const closeDetailPanel = () => {
  isDetailPanelOpen.value = false;
  detailItemData.value = null;
  isDetailEditMode.value = false;
};

// 편집 로직 제거됨

// 데이터 로드 함수
const loadData = async () => {
  try {
    // API 호출로 기계 검색 리스트 조회
    await machineStore.fetchSearchList({
      machine_category: selectedMachineCategory.value,
      unit: selectedUnit.value,
      search_value: searchQueryInput.value,
    });

    // API 응답 데이터를 machineList에 설정
    machineList.value = machineStore.searchResults;
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    // 에러 발생 시 빈 배열로 초기화
    machineList.value = [];
  }
};

// 기계타입 매핑 (한글 → 영문 키)
function mapMachineType(val: string) {
  if (val === "펌프" || val === "pump") return "pump";
  if (val === "모터" || val === "motor") return "motor";
  if (val === "컨베이어" || val === "conveyor") return "conveyor";
  return val;
}

// 기계 대분류 변경 핸들러
const handleMachineCategoryChange = async () => {
  if (selectedMachineCategory.value) {
    await machineStore.fetchThirdDepth(selectedMachineCategory.value, 3);
  }
};

onMounted(async () => {
  await machineStore.fetchCommonCodes("EQUIP");
  await loadData();
});
</script>

<style scoped lang="scss">
@use "sass:color";

.machine-page {
  padding: $spacing-lg;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
}

.page-layout {
  display: grid;
  height: calc(100vh - #{$spacing-lg * 2});
  width: 100%;
  overflow: hidden;
  gap: 8px;
  grid-template-columns: 1fr; // 기본: 전체 너비
  transition: grid-template-columns 0.3s ease;

  &.detail-open {
    grid-template-columns: 2fr 1fr; // 상세보기 열림: 2/3 + 1/3
  }
}

.main-content {
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  min-width: 0;
}

.detail-panel {
  background: white;
  border-left: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;

  .detail-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid $border-color;
    background: $background-light;
    flex-shrink: 0;

    h3 {
      margin: 0;
      color: $text-color;
      font-size: 1.25rem;
    }
  }

  .detail-panel-body {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: $text-light;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: $text-color;
    }
  }
}

.detail-tables-container {
  width: 100%;
  overflow: hidden;
}

.detail-section {
  width: 100%;

  .section-title {
    margin: 0 0 12px 0;
    padding: 8px 12px;
    background: $background-light;
    border-left: 4px solid $primary-color;
    font-size: 1rem;
    font-weight: 600;
    color: $text-color;
    border-radius: 4px;
  }
}

// VerticalDataTable 스타일 오버라이드
.detail-section :deep(.vertical-data-table-container) {
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.detail-section :deep(.vertical-data-table) {
  font-size: 0.875rem;

  .column-name {
    background-color: #f8f9fa;
    font-weight: 500;
    color: $text-color;
    width: 35%;
  }

  .column-value {
    width: 65%;
    word-break: break-word;
  }
}

// 메인 콘텐츠 내 테이블도 제어 (중복 정의 제거)
:deep(.main-content .data-table) {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;

  table {
    min-width: 100%;
  }
}

.search-filter-bar {
  background: $background-light;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    font-weight: 500;
    color: $text-color;
    white-space: nowrap;
  }
}

.form-select {
  padding: 0.5rem;
  border: 1px solid $border-color;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.machine-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    color: $text-color;
    font-size: 1.5rem;
  }
}

.action-buttons {
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

.btn-view {
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

// 반응형 브레이크포인트
$mobile: 768px;
$tablet: 1024px;

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
  padding: 1rem;

  @media (max-width: $mobile) {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 98%;
  max-width: 1600px;
  max-height: 100vh;
  margin: 0; /* 상/하 여백 제거 */
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (max-width: $tablet) {
    width: 95%;
    max-width: 95vw;
  }

  @media (max-width: $mobile) {
    width: 100%;
    max-width: 100vw;
    max-height: 90vh;
    border-radius: 4px;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;

  h3 {
    margin: 0;
    color: $text-color;
    font-size: 1.25rem;

    @media (max-width: $mobile) {
      font-size: 1.1rem;
    }
  }

  @media (max-width: $mobile) {
    padding: 0.75rem;
  }
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: $text-light;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    color: $text-color;
  }

  @media (max-width: $mobile) {
    width: 24px;
    height: 24px;
    font-size: 1.2rem;
  }
}

.modal-body {
  padding: 0 1rem 1rem 1rem;
  flex: 1;
  min-height: 0; // flex 아이템이 축소될 수 있도록 함
  overflow-y: auto;

  @media (max-width: $mobile) {
    padding: 0 0.75rem 0.75rem 0.75rem;
  }
}

.tabs-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  overflow-x: auto; // 탭이 많을 때 스크롤 가능

  @media (max-width: $mobile) {
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }
}

.tab {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  border: none;
  background: none;
  color: #222;
  border-bottom: 2px solid transparent;
  transition: border 0.2s, color 0.2s;
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: $mobile) {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
}

.tab.active {
  color: #1a73e8;
  border-bottom: 2px solid #1a73e8;
  font-weight: bold;
}

.tab-content {
  margin-top: 1.5rem;

  @media (max-width: $mobile) {
    margin-top: 1rem;
  }
}

.column-regist {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: center;

  @media (max-width: $mobile) {
    grid-template-columns: 100px 1fr;
    gap: 0.75rem;
  }

  dt {
    font-weight: bold;
    color: $text-color;
    font-size: 0.9rem;

    @media (max-width: $mobile) {
      font-size: 0.8rem;
    }

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

  @media (max-width: $mobile) {
    padding: 0.4rem;
    font-size: 0.8rem;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid $border-color;
  flex-shrink: 0;
  flex-wrap: wrap;

  @media (max-width: $mobile) {
    padding: 0.75rem;
    gap: 0.4rem;
    justify-content: center;
  }
}
</style>
