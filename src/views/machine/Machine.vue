<template>
  <div class="machine-page">
    <div class="page-layout" :class="{ 'detail-open': isDetailPanelOpen }">
      <!-- 메인 콘텐츠 영역 -->
      <div class="main-content">
        <!-- 검색 및 필터 바 -->
        <div class="search-filter-bar">
          <div class="filter-group">
            <div class="filter-item">
              <label for="machineCategory">{{
                t("machine.machineMajorCategory")
              }}</label>
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
                  :value="unit.system_code"
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
              <button class="btn-detail-search" @click="toggleDetailSearch">
                {{ t("common.detailSearch") }}
              </button>
              <button class="btn-search" @click="handleSearch">
                {{ t("common.search") }}
              </button>
            </div>
          </div>
        </div>

        <!-- 상세검색 패널 -->
        <div v-if="isDetailSearchOpen" class="detail-search-panel">
          <div class="detail-search-header">
            <h3>{{ t("common.detailSearch") }}</h3>
            <div class="detail-search-row">
              <div class="detail-search-item">
                <label>{{ t("machine.machineSubCategory") }}</label>
                <select
                  v-model="detailSearch.headerMachineSubCategory"
                  :disabled="
                    detailSearch.headerMachineCategoryOptions.length === 0
                  "
                  class="form-select"
                  @change="handleHeaderMachineSubCategoryChange"
                >
                  <option value="">{{ t("common.select") }}</option>
                  <option
                    v-for="opt in detailSearch.headerMachineCategoryOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.text }}
                  </option>
                </select>
              </div>
              <div class="detail-search-item">
                <label>{{ t("machine.machineCategory") }}</label>
                <select
                  v-model="detailSearch.headerMachineCategory"
                  :disabled="detailSearch.machineCategoryOptions.length === 0"
                  class="form-select"
                  @change="handleHeaderMachineCategoryChange"
                >
                  <option value="">{{ t("common.select") }}</option>
                  <option
                    v-for="opt in detailSearch.machineCategoryOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.text }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="detail-search-content">
            <div class="detail-search-columns">
              <!-- 왼쪽 컬럼 -->
              <div class="detail-search-column">
                <div
                  class="detail-search-item"
                  id="max_capacity_item"
                  style="display: none"
                >
                  <label class="label-capacity">{{
                    t("machine.capacity")
                  }}</label>
                  <input
                    type="number"
                    id="max_capacity"
                    v-model="detailSearch.max_capacity"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="capacity_item"
                  style="display: none"
                >
                  <label class="label-capacity">{{
                    t("machine.capacity")
                  }}</label>
                  <input
                    type="number"
                    id="capacity"
                    v-model="detailSearch.capacity"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="o2_transfer_rate_kgO2_hr_item"
                  style="display: none"
                >
                  <label class="label-capacity">{{
                    t("machine.capacity")
                  }}</label>
                  <input
                    type="number"
                    id="o2_transfer_rate_kgO2_hr"
                    v-model="detailSearch.o2_transfer_rate_kgO2_hr"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="agitated_volume_m3_item"
                  style="display: none"
                >
                  <label class="label-capacity">{{
                    t("machine.capacity")
                  }}</label>
                  <input
                    type="number"
                    id="agitated_volume_m3"
                    v-model="detailSearch.agitated_volume_m3"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="power_kW1_item"
                  style="display: none"
                >
                  <label class="label-power">{{ t("machine.power") }}</label>
                  <input
                    type="number"
                    id="power_kW1"
                    v-model="detailSearch.powerKw1"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="power_kW2_item"
                  style="display: none"
                >
                  <label class="label-power">{{ t("machine.power") }}</label>
                  <input
                    type="number"
                    id="power_kW2"
                    v-model="detailSearch.powerKw2"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- 오른쪽 컬럼 -->
              <div class="detail-search-column">
                <div
                  class="detail-search-item"
                  id="pressure_kgf_cm2_item"
                  style="display: none"
                >
                  <label class="label-pressure">{{
                    t("machine.pressure")
                  }}</label>
                  <input
                    type="number"
                    id="pressure_kgf_cm2"
                    v-model="detailSearch.pressure_kgf_cm2"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="discharge_pressure_mmAq_item"
                  style="display: none"
                >
                  <label class="label-pressure">{{
                    t("machine.pressure")
                  }}</label>
                  <input
                    type="number"
                    id="discharge_pressure_mmAq"
                    v-model="detailSearch.discharge_pressure_mmAq"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="max_pump_head_m_item"
                  style="display: none"
                >
                  <label class="label-head">{{ t("machine.head") }}</label>
                  <input
                    type="number"
                    id="max_pump_head_m"
                    v-model="detailSearch.max_pump_head_m"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="max_head_m_item"
                  style="display: none"
                >
                  <label class="label-head">{{ t("machine.head") }}</label>
                  <input
                    type="number"
                    id="max_head_m"
                    v-model="detailSearch.max_head_m"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="max_press_kg_cm2_item"
                  style="display: none"
                >
                  <label class="label-pressure">{{
                    t("machine.pressure")
                  }}</label>
                  <input
                    type="number"
                    id="max_press_kg_cm2"
                    v-model="detailSearch.max_press_kg_cm2"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="diameter_mm_item"
                  style="display: none"
                >
                  <label class="label-diameter">{{
                    t("machine.diameter_mm")
                  }}</label>
                  <input
                    type="number"
                    id="diameter_mm"
                    v-model="detailSearch.diameter_mm"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="dia_phi_mm_item"
                  style="display: none"
                >
                  <label class="label-diameter">{{
                    t("machine.dia_phi_mm")
                  }}</label>
                  <input
                    type="number"
                    id="dia_phi_mm"
                    v-model="detailSearch.dia_phi_mm"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="dia_mm_item"
                  style="display: none"
                >
                  <label class="label-other">{{ t("machine.dia_mm") }}</label>
                  <input
                    type="number"
                    id="dia_mm"
                    v-model="detailSearch.dia_mm"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="height_mm_item"
                  style="display: none"
                >
                  <label class="label-other">{{
                    t("machine.height_mm")
                  }}</label>
                  <input
                    type="number"
                    id="height_mm"
                    v-model="detailSearch.height_mm"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="width_mm_item"
                  style="display: none"
                >
                  <label class="label-other">{{ t("machine.width_mm") }}</label>
                  <input
                    type="number"
                    id="width_mm"
                    v-model="detailSearch.width_mm"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="diffuse_area_m2_item"
                  style="display: none"
                >
                  <label class="label-other">{{
                    t("machine.diffuse_area_m2")
                  }}</label>
                  <input
                    type="number"
                    id="diffuse_area_m2"
                    v-model="detailSearch.diffuse_area_m2"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>
              </div>
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
          row-key="equipment_id"
          :stickyHeader="true"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <!-- 순번 슬롯 -->
          <template #cell-no="{ index }">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </template>

          <!-- 단가 슬롯 -->
          <template #cell-unit_price="{ item }">
            {{
              item.output_values?.unit_price_kr?.value
                ? `${item.output_values.unit_price_kr.value.toLocaleString()} ${
                    item.output_values.unit_price_kr.unit_symbol || ""
                  }`
                : "-"
            }}
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
          <div class="header-buttons">
            <button
              v-if="!isDetailEditMode"
              class="btn-edit"
              @click="toggleEditMode"
            >
              {{ t("common.edit") }}
            </button>
            <button
              v-if="isDetailEditMode"
              class="btn-save"
              @click="saveDetailChanges"
            >
              {{ t("common.save") }}
            </button>
            <button
              class="btn-close"
              @click="closeDetailPanel"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div class="detail-panel-body">
          <!-- 모델 썸네일 이미지 영역 -->
          <div class="model-thumbnail-section">
            <div class="thumbnail-placeholder">
              <span class="thumbnail-text">{{
                t("common.noModelThumbnail")
              }}</span>
            </div>
          </div>

          <div class="detail-tables-container">
            <!-- 사양 정보 -->
            <div class="detail-section">
              <VerticalDataTable
                :data="specVerticalData"
                :loading="false"
                :editMode="isDetailEditMode"
                @field-change="handleFieldChange"
                @file-attach="handleFileAttach"
                @file-remove="handleFileRemove"
              />

              <!-- 숨겨진 파일 input들 -->
              <input
                type="file"
                ref="file3d"
                @change="handleFileSelect('3d', $event)"
                style="display: none"
                accept=".dtdx"
              />
              <input
                type="file"
                ref="fileThumbnail"
                @change="handleFileSelect('thumbnail', $event)"
                style="display: none"
                accept=".jpg,.jpeg,.png,.gif"
              />
              <input
                type="file"
                ref="fileRevit"
                @change="handleFileSelect('revit', $event)"
                style="display: none"
                accept=".rvt"
              />
              <input
                type="file"
                ref="fileSymbol"
                @change="handleFileSelect('symbol', $event)"
                style="display: none"
                accept=".svg"
              />
            </div>

            <!-- 단가이력 -->
            <div class="detail-section price-history-section">
              <h4 class="section-title">{{ t("common.priceHistory") }}</h4>
              <DataTable
                :columns="priceHistoryColumns"
                :data="priceHistoryData"
                :loading="false"
                :selectable="false"
                :stickyHeader="true"
              >
                <!-- 단가 슬롯 -->
                <template #cell-price_value="{ item }">
                  {{
                    item.price_value ? item.price_value.toLocaleString() : "-"
                  }}
                </template>

                <!-- 단가등록일 슬롯 -->
                <template #cell-price_date="{ item }">
                  {{ item.price_date || "-" }}
                </template>

                <!-- 단가유형 슬롯 -->
                <template #cell-price_type="{ item }">
                  {{ item.price_type || "-" }}
                </template>

                <!-- 단위 슬롯 -->
                <template #cell-price_unit_code="{ item }">
                  {{ item.price_unit_code || "-" }}
                </template>

                <!-- 제공처 슬롯 -->
                <template #cell-price_reference="{ item }">
                  {{ item.price_reference || "-" }}
                </template>
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 등록 모달: 내부 탭 구성 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container" style="max-width: 1600px; width: 98%">
        <div class="modal-header">
          <h3>{{ t("common.register") }}</h3>
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
            <MachineRegisterTab v-if="modalActiveTab === 0" />
            <MachineFormulaRegisterTab v-if="modalActiveTab === 1" />
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
import { useI18n } from "vue-i18n";
import { useMachineStore } from "@/stores/machineStore";

const { t, locale } = useI18n();
const machineStore = useMachineStore();

// 모달 탭 구성 - 등록 모드만 사용
const modalTabs = [
  { key: "machine", label: t("common.machineRegistration") },
  {
    key: "formula",
    label: t("common.machineFormulaRegistration"),
  },
];
const modalActiveTab = ref(0);

interface PriceHistoryItem {
  price_value: number;
  price_date: string;
  price_type: string;
  price_unit_code: string;
  price_reference: string;
}

interface MachineItem {
  equipment_id: string;
  equipment_code: string;
  equipment_name: string;
  equipment_type: string;
  equipment_type_name?: string;
  manufacturer: string;
  model_number: string;
  // API 응답의 전체 데이터를 포함
  root_equipment_type?: string;
  capacity_unit?: string;
  file_download_url?: string;
  created_at: string;
  description?: string;
  vendor_info?: Record<string, unknown>;
  specifications?: Record<string, Record<string, unknown>>;
  search_criteria?: Record<string, Record<string, unknown>>;
  output_values?: Record<string, Record<string, unknown>>;
  updated_at: string;
  model_file_metadata?: Record<string, unknown>;
  dexpi_interface?: Record<string, unknown>;
  dexpi_component_id?: string;
  symbol_id?: string;
  symbol_metadata?: Record<string, unknown>;
  pressure_unit?: string;
  rvt_file_id?: string;
  is_active: boolean;
  file_name?: string;
  created_by: string;
  hierarchy_info?: Record<string, unknown>;
  model_file_id?: string;
  thumbnail_id?: string;
  power_unit?: string;
  vendor_id?: string;
  formula_id?: string;
  updated_by: string;
  manufacturer_en?: string;
  equipment_price_history?: PriceHistoryItem[];
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "no", title: t("columns.machine.no"), width: "60px", sortable: false },
  {
    key: "equipment_code",
    title: t("columns.machine.mcId"),
    width: "150px",
    sortable: false,
  },
  {
    key: "equipment_type_name",
    title: t("columns.machine.type"),
    width: "150px",
    sortable: false,
  },
  {
    key: "manufacturer",
    title: t("columns.machine.company"),
    width: "150px",
    sortable: false,
  },
  {
    key: "model_number",
    title: t("columns.machine.model"),
    width: "120px",
    sortable: false,
  },
  {
    key: "unit_price",
    title: t("columns.machine.unitPrice"),
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

// 단가이력 테이블 컬럼 설정
const priceHistoryColumns: TableColumn[] = [
  {
    key: "price_value",
    title: t("common.unitPrice"),
    width: "50px",
    sortable: false,
  },
  {
    key: "price_date",
    title: t("common.unitPriceDate"),
    width: "50px",
    sortable: false,
  },
  {
    key: "price_type",
    title: t("common.priceType"),
    width: "50px",
    sortable: false,
  },
  {
    key: "price_unit_code",
    title: t("common.unit"),
    width: "50px",
    sortable: false,
  },
  {
    key: "price_reference",
    title: t("common.provider"),
    width: "100px",
    sortable: false,
  },
];

const machineList = ref<MachineItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedItems = ref<MachineItem[]>([]);
const searchQueryInput = ref("");
// 검색어는 서버에서 처리하므로 클라이언트 사이드 searchQuery 제거
const selectedUnit = ref("");
const selectedMachineCategory = ref("");
const isRegistModalOpen = ref(false);
const isDetailPanelOpen = ref(false);
const detailItemData = ref<MachineItem | null>(null);

// 상세검색 관련 변수들
const isDetailSearchOpen = ref(false);
const detailSearch = ref({
  machineType: "",
  machineSubtype: "",
  machineCategory: "",
  headerMachineCategory: "",
  headerMachineSubCategory: "",
  headerMachineCategoryOptions: [] as Array<{ value: string; text: string }>,
  machineCategoryOptions: [] as Array<{ value: string; text: string }>,
  // API에서 받은 필드 메타데이터 저장
  fieldsMetadata: {
    search_criteria: [] as any[],
    specifications: [] as any[],
  },
  max_capacity: "",
  capacity: "",
  o2_transfer_rate_kgO2_hr: "",
  agitated_volume_m3: "",
  powerKw1: "",
  powerKw2: "",

  pressure_kgf_cm2: "",
  discharge_pressure_mmAq: "",
  max_pump_head_m: "",
  max_head_m: "",
  max_press_kg_cm2: "",

  dia_mm: "",
  height_mm: "",
  width_mm: "",
  diffuse_area_m2: "",
  diameter_mm: "",
  dia_phi_mm: "",
});

// 헤더 전용 변수는 detailSearch로 통합 관리

// 편집 기능 제거로 관련 상태 제거
const isDetailEditMode = ref(false);

// 편집 모드 데이터
const editData = ref({
  equipmentType: "",
  manufacturer: "",
  modelNumber: "",
  model3dFile: "",
  revitFile: "",
  symbolFile: "",
  thumbnailFile: "",
});

// 콤보박스 옵션들 (임시 데이터)
const manufacturers = ref([
  { value: "samsung", label: "삼성" },
  { value: "lg", label: "LG" },
  { value: "hyundai", label: "현대" },
  { value: "doosan", label: "두산" },
]);

// VerticalDataTable용 사양 데이터 - 동적 생성
const specVerticalData = computed(() => {
  if (!detailItemData.value) return [];
  const item = detailItemData.value;
  const data: any[] = [];
  const isEnglish = locale.value === "en";

  // 1. 고정 필드
  data.push({
    columnName: t("columns.machine.type"),
    value: item.equipment_type_name || "-",
  });
  data.push({
    columnName: t("columns.machine.code"),
    value: item.equipment_code || "-",
  });
  data.push({
    columnName: t("columns.machine.company"),
    value: item.manufacturer || "-",
    editable: true,
    fieldType: "select",
    options: manufacturers.value,
  });
  data.push({
    columnName: t("columns.machine.model"),
    value: item.model_number || "-",
    editable: true,
    fieldType: "input",
  });

  // 2. output_values 동적 추가
  if (item.output_values) {
    Object.values(item.output_values).forEach((field: any) => {
      if (field.value !== null && field.value !== undefined) {
        const displayValue = field.unit_code
          ? `${
              typeof field.value === "number"
                ? field.value.toLocaleString()
                : field.value
            } ${field.unit_code}`
          : typeof field.value === "number"
          ? field.value.toLocaleString()
          : field.value;
        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: displayValue,
        });
      }
    });
  }

  // 3. search_criteria 동적 추가
  if (item.search_criteria) {
    Object.values(item.search_criteria).forEach((field: any) => {
      if (field.value !== null && field.value !== undefined) {
        const displayValue = field.unit_symbol
          ? `${
              typeof field.value === "number"
                ? field.value.toLocaleString()
                : field.value
            } ${field.unit_symbol}`
          : typeof field.value === "number"
          ? field.value.toLocaleString()
          : field.value;
        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: displayValue,
        });
      }
    });
  }

  // 4. specifications 동적 추가
  if (item.specifications) {
    Object.values(item.specifications).forEach((field: any) => {
      if (field.value !== null && field.value !== undefined) {
        const displayValue = field.unit_symbol
          ? `${
              typeof field.value === "number"
                ? field.value.toLocaleString()
                : field.value
            } ${field.unit_symbol}`
          : typeof field.value === "number"
          ? field.value.toLocaleString()
          : field.value;
        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: displayValue,
        });
      }
    });
  }

  // 5. 파일 필드 (3D, Revit, 심볼, 썸네일, 계산식)
  data.push({
    columnName: "3D",
    value: (item as any).model_3d_url || "",
    editable: true,
    fieldType: "file",
  });
  data.push({
    columnName: t("common.thumbnail"),
    value: (item as any).thumbnail_url || "",
    editable: true,
    fieldType: "file",
  });
  data.push({
    columnName: "Revit",
    value: (item as any).revit_file_url || "",
    editable: true,
    fieldType: "file",
  });
  data.push({
    columnName: t("common.symbol"),
    value: (item as any).symbol_url || "",
    editable: true,
    fieldType: "file",
  });
  data.push({
    columnName: t("columns.machine.formula"),
    value: (item as any).formula_url || "",
  });

  return data;
});

// 단가이력 데이터
const priceHistoryData = computed(() => {
  if (!detailItemData.value || !detailItemData.value.equipment_price_history) {
    return [];
  }
  return detailItemData.value.equipment_price_history;
});

// 검색 필터링은 서버에서 처리하므로 클라이언트 사이드 필터링 제거

// API 응답에서 페이징 정보를 받아오므로 서버 사이드 페이징 사용
const totalPagesComputed = computed(
  () => machineStore.searchResults?.total_pages || 1
);

const paginatedMachineList = computed(() => {
  return machineList.value; // API에서 이미 페이징된 데이터를 받아옴
});

// (기존 단일 등록 폼 유효성 제거)

const handleSelectionChange = (selected: MachineItem[]) => {
  selectedItems.value = selected;
};

// 행 클릭 (RoleManagement.vue 패턴 적용)
const handleRowClick = (row: MachineItem) => {
  console.log("행 클릭된 데이터:", row); // 디버깅용 로그
  selectedItems.value = [row];
  console.log("선택된 아이템:", selectedItems.value); // 디버깅용 로그
};

// 페이지 변경 (RoleManagement.vue 패턴 적용)
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  selectedItems.value = []; // 체크된 row 초기화
  await loadData();
};

// 검색 처리 (RoleManagement.vue 패턴 적용)
const handleSearch = async () => {
  selectedItems.value = []; // 체크된 row 초기화
  currentPage.value = 1;
  await loadData();
};

const openRegistModal = () => {
  isRegistModalOpen.value = true;
};

const closeRegistModal = () => {
  isRegistModalOpen.value = false;
};

// 등록은 MachineRegisterTab, MachineFormulaRegisterTab에서 처리

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
      // 선택된 항목들에 대해 삭제 API 호출
      for (const item of selectedItems.value) {
        const deleteParams = {
          model_file_id: item.model_file_id,
          rvt_file_id: item.rvt_file_id,
          symbol_id: item.symbol_id,
          thumbnail_id: item.thumbnail_id,
          formula_id: item.formula_id,
        };

        await machineStore.deleteMachine(item.equipment_id, deleteParams);
      }

      selectedItems.value = [];
      alert(t("messages.success.deleted"));

      // 삭제 후 데이터 재조회
      await loadData();
    } catch (error) {
      console.error("삭제 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("messages.error.deleteFailed");
      alert(errorMessage);
    }
  }
};

const openDetailPanel = async (item: MachineItem) => {
  detailItemData.value = item;
  isDetailPanelOpen.value = true;
  isDetailEditMode.value = false;

  try {
    // 기계 공통 상세 정보 조회
    if (item.root_equipment_type) {
      await machineStore.fetchMachineDetailCommon(item.root_equipment_type);
    }

    // 기계 파일 상세 정보 조회
    const fileParams = {
      model_file_id: item.model_file_id,
      rvt_file_id: item.rvt_file_id,
      symbol_id: item.symbol_id,
      thumbnail_id: item.thumbnail_id,
      formula_id: item.formula_id,
    };
    await machineStore.fetchMachineDetailFiles(item.equipment_id, fileParams);
  } catch (error) {
    console.error("상세 정보 조회 실패:", error);
  }
};
const closeDetailPanel = () => {
  isDetailPanelOpen.value = false;
  detailItemData.value = null;
  isDetailEditMode.value = false;
};

const toggleEditMode = () => {
  isDetailEditMode.value = !isDetailEditMode.value;
};

const saveDetailChanges = async () => {
  if (!detailItemData.value) return;

  try {
    // 여기에 저장 로직을 추가할 수 있습니다
    // 예: API 호출로 데이터 업데이트
    console.log("저장할 데이터:", detailItemData.value);
    console.log("편집된 데이터:", editData.value);

    // 저장 성공 후 편집 모드 종료
    isDetailEditMode.value = false;
    alert(t("messages.success.saved"));
  } catch (error) {
    console.error("저장 중 오류 발생:", error);
    alert(t("messages.error.saveFailed"));
  }
};

// 파일 첨부 관련 함수들

const handleFileSelect = (type: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // 파일 확장자 validation
    const allowedExtensions = {
      "3d": [".dtdx"],
      revit: [".rvt"],
      symbol: [".svg"],
      thumbnail: [".jpg", ".jpeg", ".png", ".gif"],
    };

    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    const allowedExts =
      allowedExtensions[type as keyof typeof allowedExtensions];

    if (!allowedExts.includes(fileExtension)) {
      alert(
        `허용되지 않는 파일 형식입니다.\n허용된 확장자: ${allowedExts.join(
          ", "
        )}`
      );
      // 파일 input 초기화
      target.value = "";
      return;
    }

    switch (type) {
      case "3d":
        editData.value.model3dFile = file.name;
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          (detailItemData.value as any).model_3d_url = file.name;
        }
        break;
      case "revit":
        editData.value.revitFile = file.name;
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          (detailItemData.value as any).revit_file_url = file.name;
        }
        break;
      case "symbol":
        editData.value.symbolFile = file.name;
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          (detailItemData.value as any).symbol_url = file.name;
        }
        break;
      case "thumbnail":
        editData.value.thumbnailFile = file.name;
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          (detailItemData.value as any).thumbnail_url = file.name;
        }
        break;
    }
    console.log(`${type} 파일 선택됨:`, file.name);
  }
};

// 그리드에서 필드 변경 처리
const handleFieldChange = (fieldName: string, value: string) => {
  console.log(`필드 변경: ${fieldName} = ${value}`);

  // editData에 반영
  switch (fieldName) {
    case t("common.manufacturer"):
      editData.value.manufacturer = value;
      break;
    case t("common.modelName"):
      editData.value.modelNumber = value;
      break;
  }
};

// 파일 input refs
const file3d = ref<HTMLInputElement>();
const fileRevit = ref<HTMLInputElement>();
const fileSymbol = ref<HTMLInputElement>();
const fileThumbnail = ref<HTMLInputElement>();

// 그리드에서 파일 첨부 처리
const handleFileAttach = (fieldName: string) => {
  console.log(`파일 첨부 요청: ${fieldName}`);

  switch (fieldName) {
    case "3D":
      if (file3d.value) {
        file3d.value.click();
      }
      break;
    case "Revit":
      if (fileRevit.value) {
        fileRevit.value.click();
      }
      break;
    case t("common.symbol"):
      if (fileSymbol.value) {
        fileSymbol.value.click();
      }
      break;
    case t("common.thumbnail"):
      if (fileThumbnail.value) {
        fileThumbnail.value.click();
      }
      break;
    default:
      console.error(`지원하지 않는 필드명: ${fieldName}`);
  }
};

// 그리드에서 파일 첨부 취소 처리
const handleFileRemove = (fieldName: string) => {
  console.log(`파일 첨부 취소 요청: ${fieldName}`);

  switch (fieldName) {
    case "3D":
      editData.value.model3dFile = "";
      if (detailItemData.value) {
        (detailItemData.value as any).model_3d_url = "";
      }
      // 파일 input 초기화
      if (file3d.value) {
        file3d.value.value = "";
      }
      break;
    case "Revit":
      editData.value.revitFile = "";
      if (detailItemData.value) {
        (detailItemData.value as any).revit_file_url = "";
      }
      // 파일 input 초기화
      if (fileRevit.value) {
        fileRevit.value.value = "";
      }
      break;
    case t("common.symbol"):
      editData.value.symbolFile = "";
      if (detailItemData.value) {
        (detailItemData.value as any).symbol_url = "";
      }
      // 파일 input 초기화
      if (fileSymbol.value) {
        fileSymbol.value.value = "";
      }
      break;
    case t("common.thumbnail"):
      editData.value.thumbnailFile = "";
      if (detailItemData.value) {
        (detailItemData.value as any).thumbnail_url = "";
      }
      // 파일 input 초기화
      if (fileThumbnail.value) {
        fileThumbnail.value.value = "";
      }
      break;
    default:
      console.error(`지원하지 않는 필드명: ${fieldName}`);
  }
};

// 데이터 로드 함수
// 데이터 로드 (RoleManagement.vue 패턴 적용)
const loadData = async () => {
  try {
    // 상세검색이 열려있고 기계유형 옵션이 있는데 선택하지 않은 경우
    if (
      isDetailSearchOpen.value &&
      detailSearch.value.machineCategoryOptions.length > 0 &&
      !detailSearch.value.headerMachineCategory
    ) {
      alert(t("messages.warning.selectMachineType"));
      return;
    }

    // 체크된 row 초기화
    selectedItems.value = [];

    // 기본 검색 파라미터
    const searchParams: any = {
      keyword: searchQueryInput.value,
      root_equipment_type: selectedMachineCategory.value,
      unit_system_code: selectedUnit.value,
      page: currentPage.value,
      page_size: pageSize.value,
    };

    // equipment_type 설정 (기계유형 우선, 없으면 기계중분류)
    if (isDetailSearchOpen.value) {
      if (detailSearch.value.headerMachineCategory) {
        // 기계유형이 선택된 경우
        searchParams.equipment_type = detailSearch.value.headerMachineCategory;
      } else if (detailSearch.value.headerMachineSubCategory) {
        // 기계유형은 없고 기계중분류만 선택된 경우
        searchParams.equipment_type =
          detailSearch.value.headerMachineSubCategory;
      }
    }

    // 상세검색이 열려있는 경우 상세검색 파라미터 추가
    if (isDetailSearchOpen.value) {
      const searchCriteria: any = {};
      const specifications: any = {};

      console.log("상세검색 데이터:", detailSearch.value);

      // search_criteria에 해당하는 필드들 처리
      const searchCriteriaFields = [
        "max_capacity",
        "capacity",
        "o2_transfer_rate_kgO2_hr",
        "agitated_volume_m3",
        "pressure_kgf_cm2",
        "discharge_pressure_mmAq",
        "dia_mm",
        "height_mm",
        "width_mm",
        "diffuse_area_m2",
        "diameter_mm",
        "dia_phi_mm",
      ];

      // specifications에 해당하는 필드들 처리
      const specificationsFields = [
        "max_pump_head_m",
        "max_head_m",
        "max_press_kg_cm2",
      ];

      // API에서 받은 unit_code를 사용하여 동적으로 단위 코드 설정
      const getUnitCodeForField = (
        fieldName: string,
        isSpecification: boolean = false
      ): string => {
        const metadata = isSpecification
          ? detailSearch.value.fieldsMetadata.specifications
          : detailSearch.value.fieldsMetadata.search_criteria;

        const fieldMetadata = metadata.find(
          (item: any) => item.field_name === fieldName
        );
        return fieldMetadata?.unit_code || "";
      };

      // search_criteria 필드들 체크
      searchCriteriaFields.forEach((field) => {
        const value =
          detailSearch.value[field as keyof typeof detailSearch.value];
        if (value && value !== "") {
          console.log(`search_criteria 필드 추가: ${field} = ${value}`);

          const unitCode = getUnitCodeForField(field, false);

          // 단위가 붙은 필드명을 기본 필드명으로 변환
          let apiFieldName = field;
          if (field.includes("_m3_min")) {
            apiFieldName = field.replace("_m3_min", "");
          } else if (field.includes("_ml_min")) {
            apiFieldName = field.replace("_ml_min", "");
          } else if (field.includes("_m3_hr")) {
            apiFieldName = field.replace("_m3_hr", "");
          } else if (field.includes("_kgO2_hr")) {
            apiFieldName = field.replace("_kgO2_hr", "");
          } else if (field.includes("_tonne")) {
            apiFieldName = field.replace("_tonne", "");
          } else if (field.includes("_m3")) {
            apiFieldName = field.replace("_m3", "");
          } else if (field.includes("_t")) {
            apiFieldName = field.replace("_t", "");
          } else if (field.includes("_kg_hr")) {
            apiFieldName = field.replace("_kg_hr", "");
          } else if (field.includes("_l_min")) {
            apiFieldName = field.replace("_l_min", "");
          } else if (field.includes("_kgf_cm2")) {
            apiFieldName = field.replace("_kgf_cm2", "");
          } else if (field.includes("_mmAq")) {
            apiFieldName = field.replace("_mmAq", "");
          } else if (field.includes("_mm")) {
            apiFieldName = field.replace("_mm", "");
          } else if (field.includes("_m2")) {
            apiFieldName = field.replace("_m2", "");
          } else if (field.includes("_kg_cm2")) {
            apiFieldName = field.replace("_kg_cm2", "");
          } else if (field.includes("_m")) {
            apiFieldName = field.replace("_m", "");
          }

          if (unitCode) {
            searchCriteria[apiFieldName] = {
              $gte: Number(value),
              unit_code: unitCode,
            };
          } else {
            searchCriteria[apiFieldName] = {
              $gte: Number(value),
            };
          }
        }
      });

      // powerKw1은 search_criteria의 power_kW로 매핑
      if (detailSearch.value.powerKw1 && detailSearch.value.powerKw1 !== "") {
        console.log(
          `search_criteria 필드 추가: power_kW = ${detailSearch.value.powerKw1}`
        );
        const unitCode = getUnitCodeForField("power_kW", false);
        if (unitCode) {
          searchCriteria["power"] = {
            $gte: Number(detailSearch.value.powerKw1),
            unit_code: unitCode,
          };
        } else {
          searchCriteria["power_kW"] = {
            $gte: Number(detailSearch.value.powerKw1),
          };
        }
      }

      // specifications 필드들 체크
      specificationsFields.forEach((field) => {
        const value =
          detailSearch.value[field as keyof typeof detailSearch.value];
        if (value && value !== "") {
          console.log(`specifications 필드 추가: ${field} = ${value}`);
          const unitCode = getUnitCodeForField(field, true);

          // 단위가 붙은 필드명을 기본 필드명으로 변환
          let apiFieldName = field;
          if (field.includes("_m")) {
            apiFieldName = field.replace("_m", "");
          } else if (field.includes("_kg_cm2")) {
            apiFieldName = field.replace("_kg_cm2", "");
          }

          if (unitCode) {
            specifications[apiFieldName] = {
              $gte: Number(value),
              unit_code: unitCode,
            };
          } else {
            specifications[apiFieldName] = {
              $gte: Number(value),
            };
          }
        }
      });

      // powerKw2는 specifications의 power_kW로 매핑
      if (detailSearch.value.powerKw2 && detailSearch.value.powerKw2 !== "") {
        console.log(
          `specifications 필드 추가: power_kW = ${detailSearch.value.powerKw2}`
        );
        const unitCode = getUnitCodeForField("power_kW", true);
        if (unitCode) {
          specifications["power"] = {
            $gte: Number(detailSearch.value.powerKw2),
            unit_code: unitCode,
          };
        } else {
          specifications["power_kW"] = {
            $gte: Number(detailSearch.value.powerKw2),
          };
        }
      }

      console.log("생성된 searchCriteria:", searchCriteria);
      console.log("생성된 specifications:", specifications);

      // 파라미터가 있는 경우에만 추가
      if (Object.keys(searchCriteria).length > 0) {
        searchParams.search_criteria = searchCriteria;
      }
      if (Object.keys(specifications).length > 0) {
        searchParams.specifications = specifications;
      }
    }

    console.log("검색 파라미터:", searchParams);

    // API 호출로 기계 검색 리스트 조회
    await machineStore.fetchSearchList(searchParams);

    // API 응답 데이터를 machineList에 설정
    if (machineStore.searchResults?.items) {
      machineList.value = machineStore.searchResults
        .items as unknown as MachineItem[];
    } else {
      machineList.value = [];
    }
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    // 에러 발생 시 빈 배열로 초기화
    machineList.value = [];
  }
};

// 기계타입 매핑 함수는 더 이상 사용하지 않음

// 기계 대분류 변경 핸들러
const handleMachineCategoryChange = async () => {
  if (selectedMachineCategory.value) {
    await machineStore.fetchThirdDepth(selectedMachineCategory.value, 3);
  }

  // 상세검색의 machineType 초기화
  detailSearch.value.machineType = "";
  detailSearch.value.machineSubtype = "";
  detailSearch.value.machineCategory = "";
  // 헤더 기계중분류 초기화 먼저
  detailSearch.value.headerMachineSubCategory = "";
  detailSearch.value.headerMachineCategory = "";
  detailSearch.value.headerMachineCategoryOptions = [];
  detailSearch.value.machineCategoryOptions = [];
  // 커스텀 필드 모두 숨김
  hideAllCustomFields();
  // 헤더 기계중분류 옵션 로딩 (code_level=3)
  try {
    if (selectedMachineCategory.value) {
      const selected = machineStore.secondDepth.find(
        (row: any) => row.code_key === selectedMachineCategory.value
      );
      if (selected?.code_group) {
        const res = await machineStore.fetchDepthDetail(selected.code_group, 3);
        const codes = (res as any)?.response?.data?.codes ?? [];
        if (Array.isArray(codes)) {
          const sorted = (codes as any[]).slice().sort((a: any, b: any) => {
            const ak = (a?.code_key ?? "") as string;
            const bk = (b?.code_key ?? "") as string;
            return ak.localeCompare(bk);
          });
          detailSearch.value.headerMachineCategoryOptions = sorted.map(
            (it: any) => ({
              value: it.code_key,
              text: it.code_value,
            })
          );
        } else {
          detailSearch.value.headerMachineCategoryOptions = [];
        }
      } else {
        detailSearch.value.headerMachineCategoryOptions = [];
      }
    } else {
      detailSearch.value.headerMachineCategoryOptions = [];
    }
  } catch (e) {
    console.error(e);
    detailSearch.value.headerMachineCategoryOptions = [];
  }
};

// 상세검색 관련 함수들
const toggleDetailSearch = async () => {
  // if (!selectedMachineCategory.value) {
  //   alert(t("common.selectCategory"));
  //   return;
  // }
  // 상세검색 오픈 시 헤더 선택값 초기화 및 기계유형 옵션 비우기
  detailSearch.value.headerMachineSubCategory = "";
  detailSearch.value.headerMachineCategory = "";
  detailSearch.value.machineCategoryOptions = [];
  isDetailSearchOpen.value = !isDetailSearchOpen.value;
};

// 필드 show/hide 처리 함수
const hideAllCustomFields = () => {
  const fields = [
    "dia_mm_item",
    "height_mm_item",
    "width_mm_item",
    "diffuse_area_m2_item",
    "power_kW1_item",
    "power_kW2_item",
    "diameter_mm_item",
    "dia_phi_mm_item",
    "pressure_kgf_cm2_item",
    "discharge_pressure_mmAq_item",
    "max_pump_head_m_item",
    "max_head_m_item",
    "max_capacity_item",
    "capacity_item",
    "max_press_kg_cm2_item",
    "o2_transfer_rate_kgO2_hr_item",
    "agitated_volume_m3_item",
  ];

  // 각 필드 숨기기
  fields.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.style.display = "none";
    }
  });

  // 모든 입력값 초기화
  detailSearch.value.max_capacity = "";
  detailSearch.value.capacity = "";
  detailSearch.value.o2_transfer_rate_kgO2_hr = "";
  detailSearch.value.agitated_volume_m3 = "";
  detailSearch.value.powerKw1 = "";
  detailSearch.value.powerKw2 = "";
  detailSearch.value.pressure_kgf_cm2 = "";
  detailSearch.value.discharge_pressure_mmAq = "";
  detailSearch.value.max_pump_head_m = "";
  detailSearch.value.max_head_m = "";
  detailSearch.value.max_press_kg_cm2 = "";
  detailSearch.value.diameter_mm = "";
  detailSearch.value.dia_phi_mm = "";
  detailSearch.value.dia_mm = "";
  detailSearch.value.height_mm = "";
  detailSearch.value.width_mm = "";
  detailSearch.value.diffuse_area_m2 = "";
};

const showFieldsByAvailableCriteria = (availableCriteria: any[]) => {
  console.log("showFieldsByAvailableCriteria 호출됨:", availableCriteria);

  const fieldMapping: { [key: string]: string } = {
    dia_mm: "dia_mm_item",
    height_mm: "height_mm_item",
    width_mm: "width_mm_item",
    diffuse_area_m2: "diffuse_area_m2_item",
    diameter_mm: "diameter_mm_item",
    dia_phi_mm: "dia_phi_mm_item",
    power_kW: "power_kW1_item",
    pressure_kgf_cm2: "pressure_kgf_cm2_item",
    discharge_pressure_mmAq: "discharge_pressure_mmAq_item",
    max_capacity_m3_min: "max_capacity_item",
    max_capacity_ml_min: "max_capacity_item",
    max_capacity_m3_hr: "max_capacity_item",
    o2_transfer_rate_kgO2_hr: "o2_transfer_rate_kgO2_hr_item",
    capacity_m3_hr: "capacity_item",
    capacity_tonne: "capacity_item",
    capacity_m3_min: "capacity_item",
    capacity_m3: "capacity_item",
    capacity_t: "capacity_item",
    capacity_kg_hr: "capacity_item",
    capacity_l_min: "capacity_item",
    agitated_volume_m3: "agitated_volume_m3_item",
  };

  // max_ 버전이 있는 필드명들을 추출 (max_ 제거한 버전)
  const maxFieldNames = availableCriteria
    .map((item) => {
      const fieldName = typeof item === "string" ? item : item.field_name;
      return fieldName;
    })
    .filter((name) => name.startsWith("max_"))
    .map((name) => name.replace("max_", ""));

  availableCriteria.forEach((criteria) => {
    // 새로운 구조: criteria는 { field_name, unit_code } 형태의 객체
    const fieldName =
      typeof criteria === "string" ? criteria : criteria.field_name;

    // max_ 버전이 있는 경우, 일반 버전은 스킵
    // 예: max_capacity_m3_min이 있으면 capacity_m3_min 스킵
    if (!fieldName.startsWith("max_") && maxFieldNames.includes(fieldName)) {
      return;
    }

    // max_capacity 필드들은 max_capacity_item으로 표시
    if (fieldName.includes("max_capacity")) {
      const element = document.getElementById("max_capacity_item");
      if (element) {
        element.style.display = "flex";
      }
    }
    // max_가 아닌 capacity로 시작하는 필드들은 모두 capacity_item으로 표시
    else if (fieldName.startsWith("capacity")) {
      const element = document.getElementById("capacity_item");
      if (element) {
        element.style.display = "flex";
      }
    } else {
      const elementId = fieldMapping[fieldName];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.style.display = "flex";
        }
      }
    }
  });
};

const showFieldsBySpecifications = (specifications: any[]) => {
  const fieldMapping: { [key: string]: string } = {
    power_kW: "power_kW2_item",
    max_pump_head_m: "max_pump_head_m_item",
    max_head_m: "max_head_m_item",
    max_press_kg_cm2: "max_press_kg_cm2_item",
  };

  specifications.forEach((spec) => {
    // 새로운 구조: spec은 { field_name, unit_code } 형태의 객체
    const fieldName = typeof spec === "string" ? spec : spec.field_name;
    const elementId = fieldMapping[fieldName];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = "flex";
      }
    }
  });
};

// 헤더 기계유형 변경 시 상세 검색 타입 조회 호출
const handleHeaderMachineCategoryChange = async () => {
  const searchKey = detailSearch.value.headerMachineCategory;
  if (!searchKey) return;

  // 모든 커스텀 필드 hide
  hideAllCustomFields();

  try {
    const res = await machineStore.fetchDepthDetailBySearchType(searchKey);
    const fieldsMetadata = (res as any)?.response?.data?.fields_metadata;

    // fieldsMetadata 저장
    if (fieldsMetadata) {
      detailSearch.value.fieldsMetadata = {
        search_criteria: fieldsMetadata.search_criteria || [],
        specifications: fieldsMetadata.specifications || [],
      };

      // 디버깅을 위한 로그
      console.log(
        "API 응답 - search_criteria:",
        fieldsMetadata.search_criteria
      );
      console.log("API 응답 - specifications:", fieldsMetadata.specifications);
    }

    if (fieldsMetadata?.search_criteria) {
      showFieldsByAvailableCriteria(fieldsMetadata.search_criteria);
    }

    if (fieldsMetadata?.specifications) {
      showFieldsBySpecifications(fieldsMetadata.specifications);
    }

    console.log("res 응답:", fieldsMetadata);
  } catch (e) {
    console.error(e);
  }
};

// 헤더 기계중분류 변경 시 세 번째 깊이 조회 호출
const handleHeaderMachineSubCategoryChange = async () => {
  const searchKey = detailSearch.value.headerMachineSubCategory;

  // 기계중분류가 변경되면 기계유형 초기화
  detailSearch.value.headerMachineCategory = "";
  detailSearch.value.machineCategoryOptions = [];

  // 모든 커스텀 필드 hide
  hideAllCustomFields();

  if (!searchKey) return;
  try {
    const res = await machineStore.fetchThirdDepth(searchKey, 4);
    const codes = (res as any)?.response ?? [];
    if (Array.isArray(codes) && codes.length > 0) {
      const sorted = (codes as any[]).slice().sort((a: any, b: any) => {
        const ak = (a?.code_key ?? "") as string;
        const bk = (b?.code_key ?? "") as string;
        return ak.localeCompare(bk);
      });
      detailSearch.value.machineCategoryOptions = sorted.map((it: any) => ({
        value: it.code_key,
        text: it.code_value,
      }));
    } else {
      // fetchThirdDepth 결과가 빈값이면 fetchDepthDetailBySearchType 호출
      const searchRes = await machineStore.fetchDepthDetailBySearchType(
        searchKey
      );
      const fieldsMetadata = (searchRes as any)?.response?.data
        ?.fields_metadata;

      // fieldsMetadata 저장
      if (fieldsMetadata) {
        detailSearch.value.fieldsMetadata = {
          search_criteria: fieldsMetadata.search_criteria || [],
          specifications: fieldsMetadata.specifications || [],
        };
      }

      if (fieldsMetadata?.search_criteria) {
        showFieldsByAvailableCriteria(fieldsMetadata.search_criteria);
      }

      if (fieldsMetadata?.specifications) {
        showFieldsBySpecifications(fieldsMetadata.specifications);
      }

      console.log("searchType 응답:", fieldsMetadata);
    }
  } catch (e) {
    console.error(e);
    detailSearch.value.machineCategoryOptions = [];
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

    .header-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .btn-edit,
      .btn-save {
        padding: 0.5rem 1rem;
        border: 1px solid $border-color;
        border-radius: 4px;
        background: $background-light;
        color: $text-color;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .btn-save {
        background: $success-color;
        color: white;
        border-color: $success-color;
      }

      .btn-close {
        padding: 0.5rem;
        border: none;
        background: transparent;
        color: $text-color;
        cursor: pointer;
        font-size: 1.25rem;
        border-radius: 4px;
      }
    }
  }

  .detail-panel-body {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;

    .model-thumbnail-section {
      width: 100%;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: center;

      .thumbnail-placeholder {
        width: 200px;
        height: 150px;
        border: 2px dashed $border-color;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $background-light;

        .thumbnail-text {
          color: $text-light;
          font-size: 0.875rem;
          text-align: center;
        }
      }
    }

    .edit-fields-section {
      margin-top: 1.5rem;
      padding: 1rem;
      border: 1px solid $border-color;
      border-radius: 8px;
      background: $background-light;

      .edit-section-title {
        margin: 0 0 1rem 0;
        color: $text-color;
        font-size: 1rem;
        font-weight: 600;
      }

      .edit-field-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .edit-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .edit-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: $text-color;
        }

        .edit-select {
          padding: 0.5rem;
          border: 1px solid $border-color;
          border-radius: 4px;
          background: white;
          color: $text-color;
          font-size: 0.875rem;

          &:focus {
            outline: none;
            border-color: $primary-color;
          }
        }

        .file-input-group {
          display: flex;
          gap: 0.5rem;
          align-items: center;

          .edit-input {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid $border-color;
            border-radius: 4px;
            background: white;
            color: $text-color;
            font-size: 0.875rem;

            &:focus {
              outline: none;
              border-color: $primary-color;
            }
          }

          .btn-attach {
            padding: 0.5rem 1rem;
            border: 1px solid $border-color;
            border-radius: 4px;
            background: $background-light;
            color: $text-color;
            cursor: pointer;
            font-size: 0.875rem;
            white-space: nowrap;

            &:hover {
              background: $primary-color;
              color: white;
              border-color: $primary-color;
            }
          }
        }
      }
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

.price-history-section {
  margin-top: 1.5rem;

  :deep(.data-table-container) {
    max-height: 250px;
    overflow-y: auto;
    overflow-x: auto;
    width: 100%;
  }

  :deep(.data-table) {
    min-width: 600px;
    width: 100%;
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

// 상세검색 패널 스타일
.detail-search-panel {
  background: white;
  border: 1px solid $border-color;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .detail-search-header {
    position: relative;
    padding: 1rem;
    background: $background-light;
    border-bottom: 1px solid $border-color;
    border-radius: 8px 8px 0 0;

    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: $text-color;
    }

    .btn-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
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

    .detail-search-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    .detail-search-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-right: 1rem;

      &:last-child {
        margin-right: 0;
      }

      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: $text-color;
        margin-bottom: 0;
        min-width: 120px;
        flex-shrink: 0;

        &.label-machine-type {
          background: #f0f8ff;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border-left: 3px solid #4a90e2;
        }

        &.label-machine-subtype {
          background: #f0fff0;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border-left: 3px solid #32cd32;
        }

        &.label-machine-category {
          background: #fff0f5;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border-left: 3px solid #ff69b4;
        }
      }

      .form-select {
        flex: 1;
        min-width: 0;
        padding: 0.5rem 0.75rem;
        border: 1px solid $border-color;
        border-radius: 4px;
        font-size: 0.875rem;

        &:focus {
          outline: none;
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        &:disabled {
          background-color: #f5f5f5;
          color: #999;
          cursor: not-allowed;
          border-color: #ddd;
        }
      }
    }
  }

  .detail-search-content {
    padding: 1.5rem;
  }

  .detail-search-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .detail-search-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .detail-search-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: $text-color;
      margin-bottom: 0;
      min-width: 120px;
      flex-shrink: 0;

      &.label-machine-type {
        background: #f0f8ff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #4a90e2;
      }

      &.label-machine-subtype {
        background: #f0fff0;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #32cd32;
      }

      &.label-machine-category {
        background: #fff0f5;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #ff69b4;
      }

      &.label-capacity {
        background: #fff5f0;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #ff8c42;
      }

      &.label-power {
        background: #f5f0ff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #8c42ff;
      }

      &.label-pressure {
        background: #f0fff5;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #42ff8c;
      }

      &.label-head {
        background: #fff0f5;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #ff428c;
      }

      &.label-material {
        background: #f0f5ff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #428cff;
      }

      &.label-diameter {
        background: #fffcf0;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #ffdc42;
      }

      &.label-other {
        background: #f8f8f8;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #888;
      }
    }

    .form-input,
    .form-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid $border-color;
      border-radius: 4px;
      font-size: 0.875rem;
      flex: 1;
      min-width: 0;

      &:focus {
        outline: none;
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }

      &:disabled {
        background-color: #f5f5f5;
        color: #999;
        cursor: not-allowed;
        border-color: #ddd;
      }
    }
  }
}

.btn-detail-search {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;

  &:hover {
    background-color: color.scale(#6c757d, $lightness: -10%);
  }
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
