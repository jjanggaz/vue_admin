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
                  id="max_capacity_m3_min_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (m³/min)</label
                  >
                  <input
                    type="number"
                    id="max_capacity_m3_min"
                    v-model="detailSearch.max_capacity_m3_min"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="max_capacity_ml_min_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (ml/min)</label
                  >
                  <input
                    type="number"
                    id="max_capacity_ml_min"
                    v-model="detailSearch.max_capacity_ml_min"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="max_capacity_m3_hr_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (m³/hr)</label
                  >
                  <input
                    type="number"
                    id="max_capacity_m3_hr"
                    v-model="detailSearch.max_capacity_m3_hr"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="o2_transfer_rate_kgO2_hr_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (kg/hr)</label
                  >
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
                  id="capacity_m3_hr_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (m³/hr)</label
                  >
                  <input
                    type="number"
                    id="capacity_m3_hr"
                    v-model="detailSearch.capacity_m3_hr"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="capacity_tonne_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (t)</label
                  >
                  <input
                    type="number"
                    id="capacity_tonne"
                    v-model="detailSearch.capacity_tonne"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <!-- <div
                  class="detail-search-item"
                  id="capacity_m3_min_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (m³/min)</label
                  >
                  <input
                    type="number"
                    id="capacity_m3_min"
                    v-model="detailSearch.capacity_m3_min"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div> -->

                <div
                  class="detail-search-item"
                  id="capacity_m3_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (m³)</label
                  >
                  <input
                    type="number"
                    id="capacity_m3"
                    v-model="detailSearch.capacity_m3"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="capacity_t_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (t)</label
                  >
                  <input
                    type="number"
                    id="capacity_t"
                    v-model="detailSearch.capacity_t"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="capacity_kg_hr_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (kg/hr)</label
                  >
                  <input
                    type="number"
                    id="capacity_kg_hr"
                    v-model="detailSearch.capacity_kg_hr"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="capacity_l_min_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (l/min)</label
                  >
                  <input
                    type="number"
                    id="capacity_l_min"
                    v-model="detailSearch.capacity_l_min"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="agitated_volume_m3_item"
                  style="display: none"
                >
                  <label class="label-capacity"
                    >{{ t("machine.capacity") }} (m³)</label
                  >
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
                  <label class="label-power"
                    >{{ t("machine.power") }} (kw)</label
                  >
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
                  <label class="label-power"
                    >{{ t("machine.power") }} (kw)</label
                  >
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
                  <label class="label-pressure"
                    >{{ t("machine.pressure") }} (kg/cm²)</label
                  >
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
                  <label class="label-pressure"
                    >{{ t("machine.pressure") }} (mmAq)</label
                  >
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
                  <label class="label-head">{{ t("machine.head") }} (m)</label>
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
                  <label class="label-head">{{ t("machine.head") }} (m)</label>
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
                  <label class="label-pressure"
                    >{{ t("machine.pressure") }} (kg/cm²)</label
                  >
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
          row-key="equipment_id"
          :stickyHeader="true"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <!-- 순번 슬롯 -->
          <template #cell-no="{ index }">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </template>

          <!-- 용량 슬롯 -->
          <template #cell-capacity="{ item }">
            {{
              item.search_criteria?.max_capacity_m3_min?.value
                ? `${
                    item.search_criteria.max_capacity_m3_min.value as number
                  } ㎥/min`
                : "-"
            }}
          </template>

          <!-- 계산식 슬롯 (미정이므로 '-' 표시) -->
          <template #cell-formula> - </template>

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
              <MachineUpdateTab
                v-if="modalActiveTab === 0"
                :selected-machine="
                  selectedItems.length > 0 ? selectedItems[0] : undefined
                "
              />
              <MachineFormulaUpdateTab
                v-if="modalActiveTab === 1"
                :selected-machine="
                  selectedItems.length > 0 ? selectedItems[0] : undefined
                "
              />
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

// 모달 탭 구성 (ProjectDetail 스타일) - 등록/수정 모드에 따라 동적 변경
const modalTabs = computed(() => {
  if (isEditMode.value) {
    return [
      { key: "machine", label: "기계 수정" },
      {
        key: "formula",
        label: "기계 계산식 수정",
      },
    ];
  } else {
    return [
      { key: "machine", label: "기계 등록" },
      {
        key: "formula",
        label: "기계 계산식 등록",
      },
    ];
  }
});
const modalActiveTab = ref(0);

interface MachineItem {
  equipment_id: string;
  equipment_code: string;
  equipment_name: string;
  equipment_type: string;
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
  updated_by: string;
  manufacturer_en?: string;
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
    key: "equipment_code",
    title: t("columns.machine.mcId"),
    width: "200px",
    sortable: false,
  },
  {
    key: "equipment_name",
    title: t("columns.machine.name"),
    width: "150px",
    sortable: false,
  },
  {
    key: "equipment_type",
    title: t("columns.machine.type"),
    width: "120px",
    sortable: false,
  },
  {
    key: "capacity",
    title: t("columns.machine.capacity"),
    width: "100px",
    sortable: false,
  },
  {
    key: "model_number",
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
    key: "manufacturer",
    title: t("columns.machine.company"),
    width: "150px",
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
// 검색어는 서버에서 처리하므로 클라이언트 사이드 searchQuery 제거
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
  max_capacity_m3_min: "",
  max_capacity_ml_min: "",
  max_capacity_m3_hr: "",
  o2_transfer_rate_kgO2_hr: "",
  capacity_m3_hr: "",
  capacity_tonne: "",
  //capacity_m3_min: "",
  capacity_m3: "",
  capacity_t: "",
  capacity_kg_hr: "",
  capacity_l_min: "",
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

// VerticalDataTable용 사양 데이터
const specVerticalData = computed(() => {
  if (!detailItemData.value) return [];
  const item = detailItemData.value;
  return [
    { columnName: "기계ID", value: item.equipment_code },
    { columnName: "기계명", value: item.equipment_name },
    { columnName: "기계타입", value: item.equipment_type },
    {
      columnName: "용량",
      value: item.search_criteria?.max_capacity_m3_min?.value
        ? `${item.search_criteria.max_capacity_m3_min.value as number} ㎥/min`
        : "-",
    },
    { columnName: "모델명", value: item.model_number },
    { columnName: "업체명", value: item.manufacturer },
    {
      columnName: "동력",
      value: item.specifications?.power_kW?.value
        ? `${item.specifications.power_kW.value as number} kW`
        : "-",
    },
    {
      columnName: "총중량",
      value: item.specifications?.total_wgt_kg?.value
        ? `${item.specifications.total_wgt_kg.value as number} kg`
        : "-",
    },
  ];
});

// VerticalDataTable용 단가/견적 데이터
const costVerticalData = computed(() => {
  if (!detailItemData.value) return [];
  const item = detailItemData.value;
  return [
    {
      columnName: "기동방식",
      value: (item.specifications?.ctrl_method?.value as string) || "-",
    },
    {
      columnName: "정격전압",
      value: item.specifications?.rated_volt_V?.value
        ? `${item.specifications.rated_volt_V.value as number} V`
        : "-",
    },
    {
      columnName: "효율",
      value: item.specifications?.efficiency_percent?.value
        ? `${item.specifications.efficiency_percent.value as number} %`
        : "-",
    },
    {
      columnName: "역률",
      value: item.specifications?.pwr_factor_percent?.value
        ? `${item.specifications.pwr_factor_percent.value as number} %`
        : "-",
    },
    {
      columnName: "수용율",
      value: item.specifications?.demand_factor_percent?.value
        ? `${item.specifications.demand_factor_percent.value as number} %`
        : "-",
    },
    { columnName: "계산식", value: "-" },
    {
      columnName: "단가",
      value: item.output_values?.unit_price_kr?.value
        ? `${(
            item.output_values.unit_price_kr.value as number
          ).toLocaleString()} 원`
        : "-",
    },
    {
      columnName: "견적가",
      value: item.output_values?.invoice_price_kr?.value
        ? `${(
            item.output_values.invoice_price_kr.value as number
          ).toLocaleString()} 원`
        : "-",
    },
  ];
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

const handleEdit = async () => {
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToEdit"));
    return;
  }
  if (selectedItems.value.length > 1) {
    alert(t("messages.warning.pleaseSelectOneItemToEdit"));
    return;
  }

  try {
    // 선택된 기계의 equipment_type으로 공통 코드 조회
    const selectedMachine = selectedItems.value[0];
    await machineStore.fetchMachineCommonCode(selectedMachine.equipment_type);

    console.log("기계 공통 코드 조회 완료:", selectedMachine.equipment_type);
  } catch (error) {
    console.error("기계 공통 코드 조회 실패:", error);
    alert("기계 공통 코드 조회에 실패했습니다.");
    return;
  }

  isEditMode.value = true;
  newMachine.value = {
    name: selectedItems.value[0].equipment_name,
    code: selectedItems.value[0].equipment_code,
    type: selectedItems.value[0].equipment_type,
    description: selectedItems.value[0].description || "",
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
    const selectedIds = selectedItems.value.map((item) => item.equipment_id);
    machineList.value = machineList.value.filter(
      (item) => !selectedIds.includes(item.equipment_id)
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
// 데이터 로드 (RoleManagement.vue 패턴 적용)
const loadData = async () => {
  try {
    // 상세검색이 열려있고 기계유형 옵션이 있는데 선택하지 않은 경우
    if (
      isDetailSearchOpen.value &&
      detailSearch.value.machineCategoryOptions.length > 0 &&
      !detailSearch.value.headerMachineCategory
    ) {
      alert("기계유형을 선택해주세요.");
      return;
    }

    // 체크된 row 초기화
    selectedItems.value = [];

    // 기본 검색 파라미터
    const searchParams: any = {
      keyword: searchQueryInput.value,
      root_equipment_type: selectedMachineCategory.value,
      unit: selectedUnit.value,
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
        "max_capacity_m3_min",
        "max_capacity_ml_min",
        "max_capacity_m3_hr",
        "o2_transfer_rate_kgO2_hr",
        "capacity_m3_hr",
        "capacity_tonne",
        "capacity_m3_min",
        "capacity_m3",
        "capacity_t",
        "capacity_kg_hr",
        "capacity_l_min",
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

      // search_criteria 필드들 체크
      searchCriteriaFields.forEach((field) => {
        const value =
          detailSearch.value[field as keyof typeof detailSearch.value];
        if (value && value !== "") {
          console.log(`search_criteria 필드 추가: ${field} = ${value}`);
          searchCriteria[field] = { $lte: Number(value) };
        }
      });

      // powerKw1은 search_criteria의 power_kW로 매핑
      if (detailSearch.value.powerKw1 && detailSearch.value.powerKw1 !== "") {
        console.log(
          `search_criteria 필드 추가: power_kW = ${detailSearch.value.powerKw1}`
        );
        searchCriteria["power_kW"] = {
          $lte: Number(detailSearch.value.powerKw1),
        };
      }

      // specifications 필드들 체크
      specificationsFields.forEach((field) => {
        const value =
          detailSearch.value[field as keyof typeof detailSearch.value];
        if (value && value !== "") {
          console.log(`specifications 필드 추가: ${field} = ${value}`);
          specifications[field] = { $lte: Number(value) };
        }
      });

      // powerKw2는 specifications의 power_kW로 매핑
      if (detailSearch.value.powerKw2 && detailSearch.value.powerKw2 !== "") {
        console.log(
          `specifications 필드 추가: power_kW = ${detailSearch.value.powerKw2}`
        );
        specifications["power_kW"] = {
          $lte: Number(detailSearch.value.powerKw2),
        };
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
  if (!selectedMachineCategory.value) {
    alert(t("common.selectCategory"));
    return;
  }
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
    "max_capacity_m3_min_item",
    "max_capacity_ml_min_item",
    "max_capacity_m3_hr_item",
    "max_press_kg_cm2_item",
    "o2_transfer_rate_kgO2_hr_item",
    "capacity_m3_hr_item",
    "capacity_tonne_item",
    "capacity_m3_min_item",
    "capacity_m3_item",
    "capacity_t_item",
    "capacity_kg_hr_item",
    "capacity_l_min_item",
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
  detailSearch.value.max_capacity_m3_min = "";
  detailSearch.value.max_capacity_ml_min = "";
  detailSearch.value.max_capacity_m3_hr = "";
  detailSearch.value.o2_transfer_rate_kgO2_hr = "";
  detailSearch.value.capacity_m3_hr = "";
  detailSearch.value.capacity_tonne = "";
  //detailSearch.value.capacity_m3_min = "";
  detailSearch.value.capacity_m3 = "";
  detailSearch.value.capacity_t = "";
  detailSearch.value.capacity_kg_hr = "";
  detailSearch.value.capacity_l_min = "";
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

const showFieldsByAvailableCriteria = (availableCriteria: string[]) => {
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
    max_capacity_m3_min: "max_capacity_m3_min_item",
    max_capacity_ml_min: "max_capacity_ml_min_item",
    max_capacity_m3_hr: "max_capacity_m3_hr_item",
    o2_transfer_rate_kgO2_hr: "o2_transfer_rate_kgO2_hr_item",
    capacity_m3_hr: "capacity_m3_hr_item",
    capacity_tonne: "capacity_tonne_item",
    //capacity_m3_min: "capacity_m3_min_item",
    capacity_m3: "capacity_m3_item",
    capacity_t: "capacity_t_item",
    capacity_kg_hr: "capacity_kg_hr_item",
    capacity_l_min: "capacity_l_min_item",
    agitated_volume_m3: "agitated_volume_m3_item",
  };

  availableCriteria.forEach((criteria) => {
    const elementId = fieldMapping[criteria];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = "flex";
      }
    }
  });
};

const showFieldsBySpecifications = (specifications: string[]) => {
  const fieldMapping: { [key: string]: string } = {
    power_kW: "power_kW2_item",
    max_pump_head_m: "max_pump_head_m_item",
    max_head_m: "max_head_m_item",
    max_press_kg_cm2: "max_press_kg_cm2_item",
  };

  specifications.forEach((spec) => {
    const elementId = fieldMapping[spec];
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
    const availableFields = (res as any)?.response?.data?.available_fields;

    if (availableFields?.search_criteria) {
      showFieldsByAvailableCriteria(availableFields.search_criteria);
    }

    if (availableFields?.specifications) {
      showFieldsBySpecifications(availableFields.specifications);
    }

    console.log("res 응답:", availableFields);
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
      const availableFields = (searchRes as any)?.response?.data
        ?.available_fields;

      if (availableFields?.search_criteria) {
        showFieldsByAvailableCriteria(availableFields.search_criteria);
      }

      if (availableFields?.specifications) {
        showFieldsBySpecifications(availableFields.specifications);
      }

      console.log("searchType 응답:", availableFields);
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
