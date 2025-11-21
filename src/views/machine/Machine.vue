<template>
  <div class="machine-page">
    <div class="page-layout" :class="{ 'detail-open': isDetailPanelOpen }">
      <!-- 메인 콘텐츠 영역 -->
      <div class="main-content">
        <!-- 검색 및 필터 바 -->
        <div class="search-filter-bar">
          <div class="filter-group">
            <div class="filter-item">
              <label for="unit">{{ t("common.unit") }}</label>
              <select
                id="unit"
                v-model="selectedUnit"
                class="form-select"
                @change="handleSearch"
              >
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
                {{ t("common.detailCondition") }}
                <span :class="['arrow-icon', { open: isDetailSearchOpen }]"></span>
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
            <h3>{{ t("common.detailCondition") }}</h3>
            <div class="detail-search-row">
              <div class="detail-search-item">
                <label>{{ t("machine.machineSubCategory") }}</label>
                <select
                  v-model="detailSearch.headerMachineSubCategory"
                  :disabled="
                    detailSearch.headerMachineCategoryOptions.length === 0
                  "
                  class="form-select"
                  @change="
                    handleHeaderMachineSubCategoryChange();
                    handleSearch();
                  "
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
                  @change="
                    handleHeaderMachineCategoryChange();
                    handleSearch();
                  "
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
          selection-mode="multiple"
          :show-select-all="true"
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
              (() => {
                if (!item.output_values) return "-";
                const unitPriceKey = Object.keys(item.output_values).find(
                  (key) => key.startsWith("unit_price")
                );
                if (unitPriceKey && item.output_values[unitPriceKey]?.value) {
                  return `${item.output_values[
                    unitPriceKey
                  ].value.toLocaleString()} ${
                    item.output_values[unitPriceKey].unit_symbol || ""
                  }`;
                }
                return "-";
              })()
            }}
          </template>

          <!-- 계산식 슬롯 -->
          <template #cell-formula_file_name="{ item }">
            <a
              v-if="item.formula?.download_url"
              :href="item.formula.download_url"
              target="_blank"
              class="link-download"
            >
              {{ item.formula.file_name || "-" }}
            </a>
            <span v-else>{{ item.formula?.file_name || "-" }}</span>
          </template>

          <!-- 계산식 구분 슬롯 -->
          <template #cell-formula_scope="{ item }">
            {{
              item.formula?.is_ownship_formula === true
                ? t("common.equipmentTypeScope")
                : item.formula?.is_ownship_formula === false
                ? t("common.subCategoryScope")
                : "-"
            }}
          </template>

          <!-- 업체명 슬롯 -->
          <template #cell-vendor_name="{ item }">
            {{ item.vendor_info?.vendor_name || "-" }}
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
          <div class="total-count">
            {{
              t("common.totalCount", {
                count: machineStore.searchResults?.total || 0,
              })
            }}
          </div>
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
              v-if="isDetailEditMode"
              class="btn-cancel"
              @click="cancelEditMode"
            >
              {{ t("common.cancel") }}
            </button>
            <button
              class="btn-close"
              @click="closeDetailPanel"
              aria-label="Close"
            >
            </button>
          </div>
        </div>
        <div class="detail-panel-body">
          <!-- 모델 썸네일 이미지 영역 -->
          <div class="model-thumbnail-section">
            <div v-if="thumbnailImageUrl" class="thumbnail-image-container">
              <!-- 로딩 오버레이 -->
              <div v-if="isThumbnailLoading" class="thumbnail-loading-overlay">
                <div class="loading-spinner"></div>
                <span class="loading-text">{{ t("common.loading") }}</span>
              </div>
              <!-- 이미지 -->
              <img
                :src="thumbnailImageUrl"
                :alt="t('common.modelThumbnailSection')"
                class="thumbnail-image"
                :class="{ hidden: isThumbnailLoading }"
                @load="isThumbnailLoading = false"
                @error="isThumbnailLoading = false"
              />
            </div>
            <div v-else class="thumbnail-placeholder">
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
                @file-download="handleFileDownload"
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
                accept=".rfa"
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
                  {{ formatPriceType(item.price_type) }}
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
import { useTranslateMessage } from "@/utils/translateMessage";
import { useMachineStore } from "@/stores/machineStore";

const { t, locale } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

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
  rfa_file_id?: string;
  rfa_file_info?: Record<string, unknown>;
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
  formula?: {
    formula_id?: string;
    file_name?: string;
    download_url?: string;
    is_ownship_formula?: boolean;
  };
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "no", title: t("columns.machine.no"), width: "30px", sortable: false },
  {
    key: "equipment_type_name",
    title: t("columns.machine.type"),
    width: "150px",
    sortable: false,
  },
  {
    key: "formula_file_name",
    title: t("columns.machine.formula"),
    width: "150px",
    sortable: false,
  },
  {
    key: "formula_scope",
    title: t("columns.machine.formulaScope"),
    width: "100px",
    sortable: false,
  },
  {
    key: "equipment_code",
    title: t("columns.machine.mcId"),
    width: "150px",
    sortable: false,
  },
  {
    key: "vendor_name",
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

const formatPriceType = (priceType?: string | null): string => {
  if (!priceType) {
    return "-";
  }
  const normalizedType = priceType.toUpperCase();
  if (normalizedType === "UNIT_PRICE") {
    return t("machine.priceType.unit");
  }
  if (normalizedType === "INVOICE_PRICE") {
    return t("machine.priceType.invoice");
  }
  return priceType;
};

const machineList = ref<MachineItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const selectedItems = ref<MachineItem[]>([]);
const searchQueryInput = ref("");
// 검색어는 서버에서 처리하므로 클라이언트 사이드 searchQuery 제거
const selectedUnit = ref("");
const selectedMachineCategory = ref("");
const isRegistModalOpen = ref(false);
const isDetailPanelOpen = ref(false);
const detailItemData = ref<MachineItem | null>(null);
const thumbnailImageUrl = ref<string>("");
const isThumbnailLoading = ref(false);

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
const editData = ref<{
  equipmentType: string;
  vendor_id: string;
  modelNumber: string;
  model3dFile: string;
  revitFile: string;
  symbolFile: string;
  thumbnailFile: string;
  output_values: Record<string, any>;
  search_criteria: Record<string, any>;
  specifications: Record<string, any>;
}>({
  equipmentType: "",
  vendor_id: "",
  modelNumber: "",
  model3dFile: "",
  revitFile: "",
  symbolFile: "",
  thumbnailFile: "",
  output_values: {},
  search_criteria: {},
  specifications: {},
});

// 원본 데이터 백업 (취소 시 복원용)
const originalItemData = ref<MachineItem | null>(null);

// 콤보박스 옵션들 (API로부터 동적 로드)
const manufacturers = ref<Array<{ value: string; label: string }>>([]);

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
    value: isDetailEditMode.value
      ? editData.value.vendor_id || "-"
      : item.vendor_id || "-",
    editable: false,
    fieldType: "select",
    options: manufacturers.value,
  });
  data.push({
    columnName: t("columns.machine.model"),
    value: isDetailEditMode.value
      ? editData.value.modelNumber || "-"
      : item.model_number || "-",
    editable: false,
    fieldType: "input",
  });

  // 2. output_values 동적 추가
  if (item.output_values) {
    const providerLabel = t("common.provider");
    Object.entries(item.output_values).forEach(
      ([key, field]: [string, any]) => {
        // 수정 모드이거나 값이 있는 경우 표시
        // if (
        //   isDetailEditMode.value ||
        //   (field.value !== null &&
        //     field.value !== undefined &&
        //     field.value !== "")
        // ) {
        // 원본 값과 현재 값 비교
        let isChanged = false;
        if (isDetailEditMode.value && originalItemData.value) {
          const originalValue =
            originalItemData.value.output_values?.[key]?.value;
          const currentValue = editData.value.output_values?.[key]?.value;
          // 값 비교 (숫자와 문자열 모두 고려)
          if (originalValue !== currentValue) {
            // null, undefined, 빈 문자열을 모두 동일하게 처리
            const normalizedOriginal =
              originalValue == null || originalValue === ""
                ? null
                : originalValue;
            const normalizedCurrent =
              currentValue == null || currentValue === "" ? null : currentValue;
            isChanged = normalizedOriginal !== normalizedCurrent;
          }
        }

        // 수정 모드일 때는 editData의 값을 사용, 아닐 때는 원본 값 사용
        const displayValue = isDetailEditMode.value
          ? editData.value.output_values?.[key]?.value ?? field.value
          : field.value;

        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: isDetailEditMode.value
            ? displayValue
            : typeof displayValue === "number"
            ? displayValue.toLocaleString()
            : displayValue,
          editable: true,
          fieldType: "number",
          //fieldType: typeof field.value === "number" ? "number" : "input",
          originalType: typeof field.value,
          isChanged: isChanged, // 변경 여부 추가
        });

        const providerColumnName = `${
          isEnglish ? field.key || "-" : field.name_kr || "-"
        } (${providerLabel})`;
        const providerDisplayValue = isDetailEditMode.value
          ? editData.value.output_values?.[key]?.price_reference ??
            field.price_reference ??
            ""
          : field.price_reference || "-";

        data.push({
          columnName: providerColumnName,
          value: providerDisplayValue,
          editable: isDetailEditMode.value && isChanged,
          fieldType: "input",
          originalType: "string",
          isChanged:
            isDetailEditMode.value &&
            originalItemData.value?.output_values?.[key]?.price_reference !==
              providerDisplayValue,
        });
        // }
      }
    );
  }

  // 3. search_criteria 동적 추가
  if (item.search_criteria) {
    Object.entries(item.search_criteria).forEach(
      ([key, field]: [string, any]) => {
        // 수정 모드일 때는 editData의 값을 사용, 아닐 때는 원본 값 사용
        const displayValue = isDetailEditMode.value
          ? editData.value.search_criteria?.[key]?.value ?? field.value
          : field.value;

        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: isDetailEditMode.value
            ? displayValue
            : typeof displayValue === "number"
            ? displayValue.toLocaleString()
            : displayValue,
          editable: false,
          fieldType: "input",
          //fieldType: typeof field.value === "number" ? "number" : "input",
          originalType: typeof field.value,
        });
      }
    );
  }

  // 4. specifications 동적 추가
  if (item.specifications) {
    Object.entries(item.specifications).forEach(
      ([key, field]: [string, any]) => {
        // if (
        //   isDetailEditMode.value ||
        //   (field.value !== null &&
        //     field.value !== undefined &&
        //     field.value !== "")
        // ) {
        // 수정 모드일 때는 editData의 값을 사용, 아닐 때는 원본 값 사용
        const displayValue = isDetailEditMode.value
          ? editData.value.specifications?.[key]?.value ?? field.value
          : field.value;

        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: isDetailEditMode.value
            ? displayValue
            : typeof displayValue === "number"
            ? displayValue.toLocaleString()
            : displayValue,
          editable: true,
          fieldType: "input",
          //fieldType: typeof field.value === "number" ? "number" : "input",
          originalType: typeof field.value,
        });
        // }
      }
    );
  }

  // 5. 파일 필드 (3D, 썸네일, Revit, 심볼, 계산식)
  data.push({
    columnName: "3D",
    value: (item as any).model_file_info?.original_filename || "-",
    filePath: (item as any).model_file_info?.download_url,
    editable: true,
    fieldType: "file",
  });
  data.push({
    columnName: t("common.thumbnail"),
    value: (item as any).thumbnail_file_info?.original_filename || "-",
    filePath: (item as any).thumbnail_file_info?.download_url,
    editable: true,
    fieldType: "file",
  });
  data.push({
    columnName: "Revit",
    value: (item as any).rfa_file_info?.original_filename || "-",
    filePath: (item as any).rfa_file_info?.download_url,
    editable: false,
    fieldType: "file",
  });
  data.push({
    columnName: t("common.symbol"),
    value: (item as any).symbol_file_info?.original_filename || "-",
    filePath: (item as any).symbol_file_info?.download_url,
    editable: true,
    fieldType: "file",
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
  selectedItems.value = [row];
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
  // 상세보기 창이 열려있으면 닫기
  if (isDetailPanelOpen.value) {
    isDetailPanelOpen.value = false;
  }
  isRegistModalOpen.value = true;
};

const closeRegistModal = async () => {
  isRegistModalOpen.value = false;
  // 등록 모달 닫을 때 데이터 새로고침
  await loadData();
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
        const deleteParams: any = {
          equipment_type: item.equipment_type,
          model_file_id: item.model_file_id,
          rfa_file_id: item.rfa_file_id,
          symbol_id: item.symbol_id,
          thumbnail_id: item.thumbnail_id,
        };

        // is_ownship_formula가 true인 경우에만 formula_id 추가
        if (item.formula?.is_ownship_formula === true) {
          deleteParams.formula_id = item.formula.formula_id;
        }

        await machineStore.deleteMachine(item.equipment_id, deleteParams);
      }

      selectedItems.value = [];
      alert(t("messages.success.deleted"));

      // 삭제 후 데이터 재조회
      await loadData();
    } catch (error) {
      console.error("삭제 실패:", error);
      const errorMessage = translateMessage(
        error instanceof Error ? error.message : undefined,
        "messages.error.deleteFailed"
      );
      alert(errorMessage);
    }
  }
};

const openDetailPanel = async (item: MachineItem) => {
  // 이전 썸네일 초기화 (새 항목을 열 때마다 초기화)
  thumbnailImageUrl.value = "";
  isThumbnailLoading.value = false;

  // 원본 데이터 백업 (깊은 복사)
  originalItemData.value = JSON.parse(JSON.stringify(item));
  detailItemData.value = item;
  isDetailPanelOpen.value = true;
  isDetailEditMode.value = false;

  try {
    // 기계 공통 상세 정보 조회
    if (item.root_equipment_type) {
      const response = await machineStore.fetchMachineDetailCommon(
        item.root_equipment_type
      );

      // 제조사 목록을 manufacturers에 세팅
      if (response?.response?.data) {
        manufacturers.value = response.response.data.map((vendor: any) => ({
          value: vendor.vendor_id,
          label: vendor.vendor_name,
        }));
      }
    }

    // 썸네일 이미지 URL 처리 - download_url 사용
    const thumbnailInfo = (item as any).thumbnail_file_info;
    if (thumbnailInfo?.download_url) {
      isThumbnailLoading.value = true;
      thumbnailImageUrl.value = thumbnailInfo.download_url;
    } else {
      thumbnailImageUrl.value = "";
    }
  } catch (error) {
    console.error("상세 정보 조회 실패:", error);
    isThumbnailLoading.value = false;
  }
};
const closeDetailPanel = () => {
  isDetailPanelOpen.value = false;
  detailItemData.value = null;
  originalItemData.value = null;
  isDetailEditMode.value = false;

  // 썸네일 이미지 URL 및 로딩 상태 초기화
  thumbnailImageUrl.value = "";
  isThumbnailLoading.value = false;
};

const toggleEditMode = () => {
  if (!isDetailEditMode.value && detailItemData.value) {
    // 편집 모드로 들어갈 때 현재 데이터로 editData 초기화
    editData.value = {
      equipmentType: detailItemData.value.equipment_type || "",
      vendor_id: detailItemData.value.vendor_id || "",
      modelNumber: detailItemData.value.model_number || "",
      model3dFile: "",
      revitFile: "",
      symbolFile: "",
      thumbnailFile: "",
      output_values: {},
      search_criteria: {},
      specifications: {},
    };

    // output_values, search_criteria, specifications 초기화 (전체 객체 구조 유지)
    const item = detailItemData.value;

    if (item.output_values) {
      Object.entries(item.output_values).forEach(
        ([key, field]: [string, any]) => {
          // 전체 필드 객체를 복사하되, value만 editData에서 관리
          editData.value.output_values[key] = { ...field };
        }
      );
    }

    if (item.search_criteria) {
      Object.entries(item.search_criteria).forEach(
        ([key, field]: [string, any]) => {
          // 전체 필드 객체를 복사하되, value만 editData에서 관리
          editData.value.search_criteria[key] = { ...field };
        }
      );
    }

    if (item.specifications) {
      Object.entries(item.specifications).forEach(
        ([key, field]: [string, any]) => {
          // 전체 필드 객체를 복사하되, value만 editData에서 관리
          editData.value.specifications[key] = { ...field };
        }
      );
    }
  }
  isDetailEditMode.value = !isDetailEditMode.value;
};

const cancelEditMode = () => {
  // 수정 모드 취소 시 원본 데이터로 되돌리기
  if (originalItemData.value && detailItemData.value) {
    // 원본 데이터로 복원 (깊은 복사)
    detailItemData.value = JSON.parse(JSON.stringify(originalItemData.value));

    // 썸네일 이미지 URL도 복원
    const thumbnailInfo = (originalItemData.value as any).thumbnail_file_info;
    if (thumbnailInfo?.download_url) {
      thumbnailImageUrl.value = thumbnailInfo.download_url;
    } else {
      thumbnailImageUrl.value = "";
    }
  }

  // editData 초기화
  editData.value = {
    equipmentType: "",
    vendor_id: "",
    modelNumber: "",
    model3dFile: "",
    revitFile: "",
    symbolFile: "",
    thumbnailFile: "",
    output_values: {},
    search_criteria: {},
    specifications: {},
  };

  isDetailEditMode.value = false;
};

const saveDetailChanges = async () => {
  if (!detailItemData.value) return;

  // 업체명 필수 검증
  if (!editData.value.vendor_id) {
    alert(t("messages.warning.selectManufacturer"));
    return;
  }

  try {
    const item = detailItemData.value;

    // 업데이트 파라미터 준비
    const updateParams: any = {
      equipment_type: item.equipment_type,
      vendor_id: editData.value.vendor_id,
      model_number: editData.value.modelNumber,
    };

    // output_values, search_criteria, specifications 추가
    if (Object.keys(editData.value.output_values).length > 0) {
      updateParams.output_values = editData.value.output_values;
    }
    if (Object.keys(editData.value.search_criteria).length > 0) {
      updateParams.search_criteria = editData.value.search_criteria;
    }
    if (Object.keys(editData.value.specifications).length > 0) {
      updateParams.specifications = editData.value.specifications;
    }

    // 새로 추가된 파일들 확인
    if (file3d.value?.files?.[0]) {
      updateParams.dtd_model_file = file3d.value.files[0];
    }
    if (fileThumbnail.value?.files?.[0]) {
      updateParams.thumbnail_file = fileThumbnail.value.files[0];
    }
    if (fileRevit.value?.files?.[0]) {
      updateParams.revit_model_file = fileRevit.value.files[0];
    }
    if (fileSymbol.value?.files?.[0]) {
      updateParams.symbol_file = fileSymbol.value.files[0];
    }

    // API 호출
    const response = await machineStore.updateMachine(
      item.equipment_id,
      updateParams
    );

    if (response?.success) {
      // 저장 성공 후 편집 모드 종료
      isDetailEditMode.value = false;

      // output_values의 변경된 항목만 로그 출력 및 가격 이력 생성
      if (originalItemData.value && originalItemData.value.output_values) {
        for (const [key, originalField] of Object.entries(
          originalItemData.value.output_values
        )) {
          const originalValue = (originalField as any)?.value;
          const currentValue = editData.value.output_values?.[key]?.value;

          // 값 비교 (null, undefined, 빈 문자열을 모두 동일하게 처리)
          const normalizedOriginal =
            originalValue == null || originalValue === ""
              ? null
              : originalValue;
          const normalizedCurrent =
            currentValue == null || currentValue === "" ? null : currentValue;

          const isChanged = normalizedOriginal !== normalizedCurrent;

          if (isChanged) {
            // 가격 이력 생성 API 호출
            try {
              const currentField =
                editData.value.output_values?.[key] || originalField;
              await machineStore.createPriceHistory({
                equipment_id: item.equipment_id,
                equipment_code: item.equipment_code,
                price_type: (currentField as any)?.key?.toUpperCase() || "",
                price_unit_code:
                  (currentField as any)?.unit_code ||
                  (originalField as any)?.unit_code,
                price_unit_symbol:
                  (currentField as any)?.unit_symbol ||
                  (originalField as any)?.unit_symbol,
                price_value: currentValue,
                price_reference:
                  (currentField as any)?.price_reference ??
                  (originalField as any)?.price_reference ??
                  "",
              });
            } catch (error) {
              console.error(`가격 이력 생성 실패 (${key}):`, error);
            }
          }
        }
      }

      alert(t("messages.success.saved"));

      // 데이터 새로고침 (loadData에서 상세정보창 닫기 처리)
      await loadData();
    } else {
      throw new Error(response?.message || "저장에 실패했습니다.");
    }
  } catch (error) {
    console.error("저장 중 오류 발생:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.saveFailed"
    );
    alert(errorMessage);
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
      revit: [".rfa"],
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
        t("messages.warning.invalidFileExtension", {
          extensions: allowedExts.join(", "),
        })
      );
      // 파일 input 초기화
      target.value = "";
      return;
    }

    // 파일명 validation (확장자 제외)
    // 여러 확장자 중 하나를 사용할 수 있는 경우 (예: thumbnail의 경우 .jpg, .jpeg, .png, .gif)
    // 가장 긴 확장자부터 매칭하여 제거
    let fileNameWithoutExt = file.name;
    for (const ext of allowedExts.sort((a, b) => b.length - a.length)) {
      if (file.name.toLowerCase().endsWith(ext.toLowerCase())) {
        fileNameWithoutExt = file.name.substring(
          0,
          file.name.length - ext.length
        );
        break;
      }
    }

    // 100자 이내 체크
    if (fileNameWithoutExt.length > 100) {
      alert(t("messages.warning.invalidFormulaFileNameFormat"));
      target.value = "";
      return;
    }

    // 파일명 validation: 영문만 사용, 공백 불가, 100자 이내, 특수 기호는 "_ - ()."만 허용
    const fileNameRegex = /^[a-zA-Z0-9_\-().]+$/;
    if (!fileNameRegex.test(fileNameWithoutExt)) {
      alert(t("messages.warning.invalidFormulaFileNameFormat"));
      target.value = "";
      return;
    }

    switch (type) {
      case "3d":
        editData.value.model3dFile = file.name;
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          if (!(detailItemData.value as any).model_file_info) {
            (detailItemData.value as any).model_file_info = {};
          }
          (detailItemData.value as any).model_file_info.original_filename =
            file.name;
        }
        break;
      case "revit":
        editData.value.revitFile = file.name;
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          if (!(detailItemData.value as any).rfa_file_info) {
            (detailItemData.value as any).rfa_file_info = {};
          }
          (detailItemData.value as any).rfa_file_info.original_filename =
            file.name;
        }
        break;
      case "symbol":
        editData.value.symbolFile = file.name;
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          if (!(detailItemData.value as any).symbol_file_info) {
            (detailItemData.value as any).symbol_file_info = {};
          }
          (detailItemData.value as any).symbol_file_info.original_filename =
            file.name;
        }
        break;
      case "thumbnail":
        editData.value.thumbnailFile = file.name;
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          if (!(detailItemData.value as any).thumbnail_file_info) {
            (detailItemData.value as any).thumbnail_file_info = {};
          }
          (detailItemData.value as any).thumbnail_file_info.original_filename =
            file.name;
        }
        break;
    }
  }
};

// 그리드에서 필드 변경 처리
const handleFieldChange = (fieldName: string, value: string) => {
  const isEnglish = locale.value === "en";

  // editData에 반영
  // 제조사 필드 확인 (columns.machine.company)
  if (fieldName === t("columns.machine.company")) {
    editData.value.vendor_id = value;
  }
  // 모델명 필드 확인 (columns.machine.model)
  else if (fieldName === t("columns.machine.model")) {
    editData.value.modelNumber = value;
  }
  // 동적 필드 처리 (output_values, search_criteria, specifications)
  else {
    // detailItemData에서 해당 필드 찾기
    const item = detailItemData.value;
    if (!item) return;

    const providerSuffix = ` (${t("common.provider")})`;

    // output_values에서 찾기
    if (item.output_values) {
      if (fieldName.endsWith(providerSuffix)) {
        const baseFieldName = fieldName.slice(
          0,
          fieldName.length - providerSuffix.length
        );
        const providerField = Object.entries(item.output_values).find(
          ([_, field]: [string, any]) => {
            const displayName = isEnglish ? field.key : field.name_kr;
            return displayName === baseFieldName;
          }
        );
        if (providerField) {
          const [key] = providerField;
          if (editData.value.output_values[key]) {
            editData.value.output_values[key].price_reference = value?.trim?.()
              ? value.trim()
              : value;
          }
          return;
        }
      }

      const outputField = Object.entries(item.output_values).find(
        ([_, field]: [string, any]) => {
          const displayName = isEnglish ? field.key : field.name_kr;
          return displayName === fieldName;
        }
      );
      if (outputField) {
        const [key] = outputField;
        // 객체 구조를 유지하면서 value만 업데이트
        if (editData.value.output_values[key]) {
          // 입력값이 숫자로만 구성되어 있으면 Number로 변환
          const numValue = Number(value);
          const newValue = !isNaN(numValue) && value !== "" ? numValue : value;
          editData.value.output_values[key].value = newValue;

          // value가 원래 값으로 돌아가면 price_reference도 원래 값으로 복원
          if (originalItemData.value?.output_values?.[key]) {
            const originalValue =
              originalItemData.value.output_values[key].value;
            const normalizedOriginal =
              originalValue == null || originalValue === ""
                ? null
                : originalValue;
            const normalizedNew =
              newValue == null || newValue === "" ? null : newValue;

            // 값이 원래 값과 같으면 price_reference도 원래 값으로 복원
            if (normalizedOriginal === normalizedNew) {
              editData.value.output_values[key].price_reference =
                originalItemData.value.output_values[key].price_reference ??
                null;
            }
          }
        }
        return;
      }
    }

    // search_criteria에서 찾기
    if (item.search_criteria) {
      const searchField = Object.entries(item.search_criteria).find(
        ([_, field]: [string, any]) => {
          const displayName = isEnglish ? field.key : field.name_kr;
          return displayName === fieldName;
        }
      );
      if (searchField) {
        const [key] = searchField;
        // 객체 구조를 유지하면서 value만 업데이트
        if (editData.value.search_criteria[key]) {
          // 입력값이 숫자로만 구성되어 있으면 Number로 변환
          const numValue = Number(value);
          editData.value.search_criteria[key].value =
            !isNaN(numValue) && value !== "" ? numValue : value;
        }
        return;
      }
    }

    // specifications에서 찾기
    if (item.specifications) {
      const specField = Object.entries(item.specifications).find(
        ([_, field]: [string, any]) => {
          const displayName = isEnglish ? field.key : field.name_kr;
          return displayName === fieldName;
        }
      );
      if (specField) {
        const [key] = specField;
        // 객체 구조를 유지하면서 value만 업데이트
        if (editData.value.specifications[key]) {
          // 입력값이 숫자로만 구성되어 있으면 Number로 변환
          const numValue = Number(value);
          editData.value.specifications[key].value =
            !isNaN(numValue) && value !== "" ? numValue : value;
        }
        return;
      }
    }
  }
};

// 파일 input refs
const file3d = ref<HTMLInputElement>();
const fileRevit = ref<HTMLInputElement>();
const fileSymbol = ref<HTMLInputElement>();
const fileThumbnail = ref<HTMLInputElement>();

// 그리드에서 파일 첨부 처리
const handleFileAttach = (fieldName: string) => {
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
  switch (fieldName) {
    case "3D":
      editData.value.model3dFile = "";
      if (detailItemData.value) {
        // 기존 파일 정보 초기화
        (detailItemData.value as any).model_file_info = null;
      }
      // 파일 input 초기화
      if (file3d.value) {
        file3d.value.value = "";
      }
      break;
    case "Revit":
      editData.value.revitFile = "";
      if (detailItemData.value) {
        // 기존 파일 정보 초기화
        (detailItemData.value as any).rfa_file_info = null;
      }
      // 파일 input 초기화
      if (fileRevit.value) {
        fileRevit.value.value = "";
      }
      break;
    case t("common.symbol"):
      editData.value.symbolFile = "";
      if (detailItemData.value) {
        // 기존 파일 정보 초기화
        (detailItemData.value as any).symbol_file_info = null;
      }
      // 파일 input 초기화
      if (fileSymbol.value) {
        fileSymbol.value.value = "";
      }
      break;
    case t("common.thumbnail"):
      editData.value.thumbnailFile = "";
      if (detailItemData.value) {
        // 기존 파일 정보 초기화
        (detailItemData.value as any).thumbnail_file_info = null;
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

// 파일 다운로드 핸들러
const handleFileDownload = (fieldName: string) => {
  if (!detailItemData.value) return;

  const item = detailItemData.value;
  let fileInfo = null;

  // 필드명에 따라 파일 정보 가져오기
  switch (fieldName) {
    case "3D":
      fileInfo = (item as any).model_file_info;
      break;
    case t("common.thumbnail"):
      fileInfo = (item as any).thumbnail_file_info;
      break;
    case "Revit":
      fileInfo = (item as any).rfa_file_info;
      break;
    case t("common.symbol"):
      fileInfo = (item as any).symbol_file_info;
      break;
  }

  // download_url이 있으면 다운로드
  if (fileInfo?.download_url) {
    const downloadUrl = fileInfo.download_url;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileInfo.original_filename || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert(t("messages.warning.noFileToDownload"));
  }
};

// 데이터 로드 함수
// 데이터 로드 (RoleManagement.vue 패턴 적용)
const loadData = async () => {
  try {
    // 상세정보창이 열려있으면 닫기
    if (isDetailPanelOpen.value) {
      closeDetailPanel();
    }

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

      // 파라미터가 있는 경우에만 추가
      if (Object.keys(searchCriteria).length > 0) {
        searchParams.search_criteria = searchCriteria;
      }
      if (Object.keys(specifications).length > 0) {
        searchParams.specifications = specifications;
      }
    }

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

  // 기계 대분류 변경 시 자동 검색
  await handleSearch();
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
    }

    if (fieldsMetadata?.search_criteria) {
      showFieldsByAvailableCriteria(fieldsMetadata.search_criteria);
    }

    if (fieldsMetadata?.specifications) {
      showFieldsBySpecifications(fieldsMetadata.specifications);
    }
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
  padding: 40px 24px;
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
  overflow-x: auto;
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
      .btn-save,
      .btn-cancel {
        padding: 0.5rem 1rem;
        border: 1px solid $border-color;
        border-radius: 4px;
        background: $background-light;
        color: $text-color;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s ease;

        &:hover {
          background: color.scale($background-light, $lightness: -5%);
        }
      }

      .btn-save {
        background: $success-color;
        color: white;
        border-color: $success-color;

        &:hover {
          background: color.scale($success-color, $lightness: -10%);
        }
      }

      .btn-cancel {
        background: $error-color;
        color: white;
        border-color: $error-color;

        &:hover {
          background: color.scale($error-color, $lightness: -10%);
        }
      }

      .btn-close {
        width: 24px;
        height: 24px;
        background: url(../../assets/icons/ico_modal-close.svg) no-repeat center / 18px auto;
        cursor: pointer;
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

      .thumbnail-image-container {
        width: 280px;
        height: 210px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;

        .thumbnail-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: opacity 0.3s;

          &.hidden {
            opacity: 0;
          }
        }

        .thumbnail-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(2px);
          gap: 0.75rem;
          z-index: 1;

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid $border-color;
            border-top-color: $primary-color;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .loading-text {
            color: $text-light;
            font-size: 0.875rem;
          }
        }
      }

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

      @keyframes spin {
        to {
          transform: rotate(360deg);
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
  border-radius: 8px;
  margin-bottom: 20px;
}

// 상세검색 패널 스타일
.detail-search-panel {
  width: 100%;
  background: white;
  border: 1px solid #e7e6ed;
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 20px 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .detail-search-header {
    position: relative;
    border-bottom: 1px solid #e7e6ed;
    border-radius: 8px 8px 0 0;
    padding-bottom: 10px;

    h3 {
      font-size: 20PX;
      font-weight: 500;
      color: #000000;
    }

    .detail-search-row {
      display: flex;
      align-items: center;
      gap: 40px;
      margin-top: 10px;
    }

    .detail-search-item {
      display: flex;
      align-items: center;
      gap: 10px;

      &:last-child {
        margin-right: 0;
      }

      label {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
        margin-bottom: 0;
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
        border: 1px solid #e7e6ed;
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
    padding-top: 10px;
  }

  .detail-search-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding-bottom: 2rem;
  }

  .detail-search-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .detail-search-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    label {
      display: inline-block;
      width: 90px;
      font-size: 16px;
      font-weight: 600;
      color: #333333;
      flex-shrink: 0;
      padding-left: 12px;

      &.label-machine-type {
        border-left: 3px solid #4a90e2;
      }

      &.label-machine-subtype {
        border-left: 3px solid #32cd32;
      }

      &.label-machine-category {
        background: #fff0f5;
        border-left: 3px solid #ff69b4;
      }

      &.label-capacity {
        border-left: 3px solid #ff8c42;
      }

      &.label-power {
        border-left: 3px solid #8c42ff;
      }

      &.label-pressure {
        border-left: 3px solid #42ff8c;
      }

      &.label-head {
        border-left: 3px solid #ff428c;
      }

      &.label-material {
        border-left: 3px solid #428cff;
      }

      &.label-diameter {
        border-left: 3px solid #ffdc42;
      }

      &.label-other {
        border-left: 3px solid #888;
      }
    }

    .form-input,
    .form-select {
      height: 40px;
      padding: 0 10px;
      border: 1px solid #d7d6ed;
      border-radius: 4px;
      font-size: 15px;
      font-weight: 400;
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
  text-align: left;
  width: auto;
  height: 40px;
  padding: 8px 34px 8px 16px;
  background-color: #3E435E;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;

  .arrow-icon {
    position: relative;
    
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      margin-top: -11px;
      right: -18px;
      width: 12px;
      height: 24px;
      background-image: url(../../assets/icons/ico_detail-arrow.svg);
      background-repeat: no-repeat;
      background-position: center;
      background-size: 12px auto;
      transition: $transition-fast;
    }

    &.open {
      &::after {
        margin-top: -12px;



        transform: rotate(180deg);
      }
    }
  }

  &:hover {
    background-color: #3c4973;
  }
}

.form-select {
  appearance: none;
  background-image: url(../../assets/icons/ico_select-down.svg);
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px auto;
  width: 240px;
  height: 40px;
  padding: 8px 32px 8px 8px;
  border: 1px solid #e7e6ed;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 400;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: $primary-color;
    background-image: url(../../assets/icons/ico_select-up.svg);
    z-index: 2;
  }
}

.machine-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    color: #000000;
    font-size: 20px;
    font-weight: 500;
  }
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.link-download {
  color: $primary-color;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 3.5px;
    color: color.scale($primary-color, $lightness: -10%);
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  .total-count {
    position: absolute;
    left: 0;
    font-size: 13px;
    color: #333333;
    font-weight: 400;
  }
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
  width: 24px;
  height: 24px;
  background: url(../../assets/icons/ico_modal-close.svg) no-repeat center / 18px auto;
  cursor: pointer;
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
  width: 240px;
  padding: 0.5rem;
  border: 1px solid #e7e6ed;
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
