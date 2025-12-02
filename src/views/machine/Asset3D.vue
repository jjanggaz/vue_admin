<template>
  <div class="asset3d-page">
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
                  v-for="unit in asset3DStore.unitSystems"
                  :key="unit.unit_system_id"
                  :value="unit.system_code"
                >
                  {{ unit.system_name }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label for="asset3dCategory">{{
                t("asset3D.machineMajorCategory")
              }}</label>
              <select
                id="asset3dCategory"
                v-model="selectedAsset3DCategory"
                class="form-select"
                @change="handleAsset3DCategoryChange"
              >
                <option value="PRESET">프리셋</option>
                <option value="3D_LIBRARY">3D 라이브러리</option>
              </select>
            </div>
            <div class="filter-item">
              <label for="search">{{ t("common.search") }}</label>
              <input
                type="text"
                id="search"
                :placeholder="t('placeholder.asset3DSearch')"
                v-model="searchQueryInput"
                @keyup.enter="handleSearch"
                class="form-input"
              />
              <button class="btn btn-search" @click="handleSearch">
                {{ t("common.search") }}
              </button>
            </div>
          </div>
        </div>

        <!-- Asset3D 리스트 헤더 -->
        <div class="asset3d-list-header">
          <h2>{{ t("common.asset3DList") }}</h2>
          <div class="action-buttons">
            <button
              class="btn btn-register"
              @click="openRegistModal"
            >
              {{ t("common.register") }}
            </button>
            <button
              class="btn btn-edit"
              @click="handleEdit"
              :disabled="selectedItems.length !== 1"
            >
              {{ t("common.edit") }}
            </button>
            <button
              class="btn btn-delete"
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
          :data="paginatedAsset3DList"
          :loading="loading"
          :selectable="true"
          :selected-items="selectedItems"
          selection-mode="multiple"
          :show-select-all="true"
          :select-header-text="t('common.selectColumn')"
          row-key="row_key"
          :stickyHeader="true"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <!-- 순번 슬롯 -->
          <template #cell-no="{ index }">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </template>

          <!-- 3D 모델구분 슬롯 -->
          <template #cell-model3d_type>
            {{ getModel3dTypeName(selectedAsset3DCategory) }}
          </template>

          <!-- 연결기계 슬롯 -->
          <template #cell-connected_machine="{ item }">
            {{ getConnectedMachineName(item.root_equipment_type) }}
          </template>

          <!-- 명칭 슬롯 -->
          <template #cell-equipment_name="{ item }">
            {{ item.equipment_name || "-" }}
          </template>

          <!-- 직경 슬롯 -->
          <template #cell-diameter="{ item }">
            {{ item.diameter_display || "-" }}
          </template>

          <!-- 단위 슬롯 -->
          <template #cell-unit="{ item }">
            {{ item.unit_system_code || "-" }}
          </template>

          <!-- 등록일자 슬롯 -->
          <template #cell-created_at="{ item }">
            {{ formatDateTime(item.created_at) }}
          </template>

          <!-- 상세정보 액션 슬롯 -->
          <template #cell-details="{ item }">
            <button class="btn btn-view" @click.stop="openDetailPanel(item)">
              {{ t("common.view") }}
            </button>
          </template>
        </DataTable>

        <!-- 페이징 -->
        <div class="pagination-container">
          <div class="total-count">
            {{
              t("common.totalCount", {
                count: asset3DStore.searchResults?.total || 0,
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
              class="btn-close"
              @click="closeDetailPanel"
              aria-label="Close"
            >
            </button>
          </div>
        </div>
        <div class="detail-panel-body">
          <!-- 3D 라이브러리 보기 화면 -->
          <template v-if="isLibraryDetail && libraryDetailData">
            <!-- 모델 썸네일 이미지 영역 -->
            <div class="model-thumbnail-section">
              <div v-if="libraryDetailData.thumbnailPreviewUrl" class="thumbnail-image-container">
                <!-- 이미지 -->
                <img
                  :src="libraryDetailData.thumbnailPreviewUrl"
                  :alt="t('common.modelThumbnailSection')"
                  class="thumbnail-image"
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
                  :data="libraryVerticalData"
                  :loading="false"
                  :editMode="false"
                  @file-download="handleLibraryFileDownload"
                />
              </div>
            </div>
          </template>

          <!-- 프리셋 보기 화면 -->
          <template v-else-if="isPresetDetail && presetDetailData">
            <!-- 모델 썸네일 이미지 영역 -->
            <div class="model-thumbnail-section">
              <div v-if="presetDetailData.thumbnailPreviewUrl" class="thumbnail-image-container">
                <!-- 이미지 -->
                <img
                  :src="presetDetailData.thumbnailPreviewUrl"
                  :alt="t('common.modelThumbnailSection')"
                  class="thumbnail-image"
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
                  :data="presetVerticalData"
                  :loading="false"
                  :editMode="false"
                  @file-download="handlePresetFileDownload"
                />
              </div>
            </div>

            <!-- 선택 항목 그리드 -->
            <div v-if="presetDetailData.tableRows && presetDetailData.tableRows.length > 0" class="preset-selection-grid">
              <h3 class="selection-grid-title">선택 항목</h3>
              <DataTable
                :columns="presetTableColumns"
                :data="presetDetailData.tableRows"
                :loading="false"
                :selectable="false"
                row-key="id"
              >
                <template #cell-pipeCategory="{ item }">
                  <span class="table-text">{{ item.pipeCategory || "-" }}</span>
                </template>
                <template #cell-fittingType="{ item }">
                  <span class="table-text">{{ item.fittingType || "-" }}</span>
                </template>
                <template #cell-diameter="{ item }">
                  <span class="table-text">{{ item.diameter || "-" }}</span>
                </template>
                <template #cell-diameterAfter="{ item }">
                  <span class="table-text">{{ item.diameterAfter || "-" }}</span>
                </template>
                <template #cell-pipeType="{ item }">
                  <span class="table-text">{{ item.pipeType || "-" }}</span>
                </template>
                <template #cell-code="{ item }">
                  <span class="table-text">{{ item.code || "-" }}</span>
                </template>
                <template #cell-cellName="{ item }">
                  <span class="table-text">{{ item.cellName || "-" }}</span>
                </template>
              </DataTable>
            </div>
          </template>

          <!-- 기존 상세 정보 화면 (기타) -->
          <template v-else>
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
                  :editMode="false"
                  @file-download="handleFileDownload"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 등록/수정 모달: 내부 탭 구성 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div 
        class="modal-container" 
        :class="{ 'library-tab-modal': modalActiveTab === 0 }"
        :style="modalActiveTab === 0 
          ? 'max-width: 1600px; width: 98%; max-height: auto; height: auto; display: flex; flex-direction: column;' 
          : 'max-width: 1600px; width: 98%; max-height: 95vh; height: 95vh; display: flex; flex-direction: column;'"
      >
        <div class="modal-header">
          <h3>{{ isEditModalMode ? t("common.edit") : t("common.register") }}</h3>
          <button
            class="btn-close"
            @click="closeRegistModal"
            aria-label="Close"
          >
          </button>
        </div>
        <div 
          class="modal-body" 
          :style="modalActiveTab === 0 
            ? 'flex: 0 1 auto; overflow-y: visible; min-height: 0;' 
            : 'flex: 1; overflow-y: auto; min-height: 0;'"
        >
          <div class="tabs-wrapper">
            <div
              v-for="(tab, idx) in modalTabs"
              :key="tab.key"
              :class="['tab', { active: modalActiveTab === idx }, { disabled: isEditModalMode && modalActiveTab !== idx }]"
              @click="!isEditModalMode && (modalActiveTab = idx)"
            >
              {{ tab.label }}
            </div>
          </div>
          <div class="tab-content">
            <Asset3DLibraryTab 
              v-if="modalActiveTab === 0" 
              :is-edit-mode="isEditModalMode"
              :edit-item="editTargetItem"
            />
            <Asset3DPresetTab 
              v-if="modalActiveTab === 1" 
              :is-edit-mode="isEditModalMode"
              :edit-item="editTargetItem"
            />
          </div>
        </div>
        <div class="modal-footer lg">
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
import Asset3DLibraryTab from "./components/Asset3DLibraryTab.vue";
import Asset3DPresetTab from "./components/Asset3DPresetTab.vue";
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import { useAsset3DStore } from "@/stores/asset3DStore";
import { usePipeStore } from "@/stores/pipeStore";
import { request } from "@/utils/request";

const { t, locale } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

const asset3DStore = useAsset3DStore();
const pipeStore = usePipeStore();

// 모달 탭 구성 - 등록 모드만 사용
const modalTabs = [
  { key: "machine", label: "3D 라이브러리 등록" },
  {
    key: "formula",
    label: "3D 프리셋 등록",
  },
];
const modalActiveTab = ref(0);

interface Asset3DItem {
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
  formula?: {
    formula_id?: string;
    file_name?: string;
    download_url?: string;
    is_ownship_formula?: boolean;
  };
  // 검색 API 응답 필드
  preset_name_ko?: string;
  preset_name_en?: string;
  diameter_value?: number | string;
  diameter_unit?: string;
  unit_system_code?: string;
  model_type?: string; // PRESET 또는 3D_LIBRARY
  model_name?: string; // 3D 라이브러리 모델명
  thumbnail_file_name?: string; // 썸네일 파일명
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "no", title: t("columns.asset3D.no"), width: "50px", sortable: false },
  {
    key: "model3d_type",
    title: t("columns.asset3D.model3dType"),
    width: "120px",
    sortable: false,
  },
  {
    key: "connected_machine",
    title: t("columns.asset3D.connectedMachine"),
    width: "120px",
    sortable: false,
  },
  {
    key: "equipment_name",
    title: t("columns.asset3D.title"),
    width: "150px",
    sortable: false,
  },
  {
    key: "diameter",
    title: t("columns.asset3D.diameter"),
    width: "100px",
    sortable: false,
  },
  {
    key: "unit",
    title: t("columns.asset3D.unit"),
    width: "80px",
    sortable: false,
  },
  {
    key: "created_at",
    title: "등록일자",
    width: "140px",
    sortable: false,
  },
  {
    key: "details",
    title: t("columns.asset3D.details"),
    width: "80px",
    sortable: false,
  },
];

const asset3dList = ref<Asset3DItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const selectedItems = ref<Asset3DItem[]>([]);
const searchQueryInput = ref("");
// 검색어는 서버에서 처리하므로 클라이언트 사이드 searchQuery 제거
const selectedUnit = ref("");
const selectedAsset3DCategory = ref("PRESET");
const isRegistModalOpen = ref(false);
const isEditModalMode = ref(false); // 수정 모드 여부
const editTargetItem = ref<Asset3DItem | null>(null); // 수정 대상 항목
const isDetailPanelOpen = ref(false);
const detailItemData = ref<Asset3DItem | null>(null);
const thumbnailImageUrl = ref<string>("");
const isThumbnailLoading = ref(false);
// 3D 라이브러리 상세 데이터
const libraryDetailData = ref<{
  unit: string;
  category: string;
  modelName: string;
  modelFileName: string;
  modelDownloadUrl: string;
  thumbnailFileName: string;
  thumbnailPreviewUrl: string;
  thumbnailDownloadUrl: string;
} | null>(null);
const isLibraryDetail = ref(false);

// 프리셋 상세 데이터
interface PresetTableRow {
  id: number;
  no: number;
  pipeCategory: string;
  subCategory: string;
  fittingType: string;
  diameter: string;
  diameterAfter: string;
  pipeType: string;
  code: string;
  cellName: string;
  [key: string]: unknown;
}

const presetDetailData = ref<{
  unit: string;
  machine: string;
  presetName: string;
  thumbnailFileName: string;
  thumbnailPreviewUrl: string;
  thumbnailDownloadUrl: string;
  tableRows: PresetTableRow[];
} | null>(null);
const isPresetDetail = ref(false);

// 편집 기능 제거됨 (보기 전용)

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
    columnName: t("columns.asset3D.type"),
    value: item.equipment_type_name || "-",
  });
  data.push({
    columnName: t("columns.asset3D.code"),
    value: item.equipment_code || "-",
  });
  data.push({
    columnName: t("columns.asset3D.company"),
    value: item.vendor_id || "-",
    editable: false,
    fieldType: "select",
    options: manufacturers.value,
  });
  data.push({
    columnName: t("columns.asset3D.model"),
    value: item.model_number || "-",
    editable: false,
    fieldType: "input",
  });

  // 2. output_values 동적 추가
  if (item.output_values) {
    const providerLabel = t("common.provider");
    Object.entries(item.output_values).forEach(
      ([_key, field]: [string, any]) => {
        const displayValue = field.value;

        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: typeof displayValue === "number"
            ? displayValue.toLocaleString()
            : displayValue,
          editable: false,
          fieldType: "number",
          originalType: typeof field.value,
        });

        const providerColumnName = `${
          isEnglish ? field.key || "-" : field.name_kr || "-"
        } (${providerLabel})`;

        data.push({
          columnName: providerColumnName,
          value: field.price_reference || "-",
          editable: false,
          fieldType: "input",
          originalType: "string",
        });
      }
    );
  }

  // 3. search_criteria 동적 추가
  if (item.search_criteria) {
    Object.entries(item.search_criteria).forEach(
      ([_key, field]: [string, any]) => {
        const displayValue = field.value;

        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: typeof displayValue === "number"
            ? displayValue.toLocaleString()
            : displayValue,
          editable: false,
          fieldType: "input",
          originalType: typeof field.value,
        });
      }
    );
  }

  // 4. specifications 동적 추가
  if (item.specifications) {
    Object.entries(item.specifications).forEach(
      ([_key, field]: [string, any]) => {
        const displayValue = field.value;

        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: typeof displayValue === "number"
            ? displayValue.toLocaleString()
            : displayValue,
          editable: false,
          fieldType: "input",
          originalType: typeof field.value,
        });
      }
    );
  }

  // 5. 파일 필드 (3D, 썸네일, Revit, 심볼, 계산식)
  data.push({
    columnName: "3D",
    value: (item as any).model_file_info?.original_filename || "-",
    filePath: (item as any).model_file_info?.download_url,
    editable: false,
    fieldType: "file",
  });
  data.push({
    columnName: t("common.thumbnail"),
    value: (item as any).thumbnail_file_info?.original_filename || "-",
    filePath: (item as any).thumbnail_file_info?.download_url,
    editable: false,
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
    editable: false,
    fieldType: "file",
  });

  return data;
});

// 3D 라이브러리용 VerticalDataTable 데이터 - 동적 생성
const libraryVerticalData = computed(() => {
  if (!libraryDetailData.value) return [];
  const data: any[] = [];

  // 1. 기본 정보 필드
  data.push({
    columnName: "단위",
    value: libraryDetailData.value.unit || "-",
    editable: false,
    fieldType: "input",
  });
  data.push({
    columnName: "3D ASSET 카테고리",
    value: libraryDetailData.value.category || "-",
    editable: false,
    fieldType: "input",
  });
  data.push({
    columnName: "3D 모델명",
    value: libraryDetailData.value.modelName || "-",
    editable: false,
    fieldType: "input",
  });

  // 2. 파일 필드
  data.push({
    columnName: "3D모델 업로드",
    value: libraryDetailData.value.modelFileName || "-",
    filePath: libraryDetailData.value.modelDownloadUrl,
    editable: false,
    fieldType: "file",
  });
  data.push({
    columnName: "3D모델 썸네일",
    value: libraryDetailData.value.thumbnailFileName || "-",
    filePath: libraryDetailData.value.thumbnailDownloadUrl,
    editable: false,
    fieldType: "file",
  });

  return data;
});

// 프리셋 유형 코드를 라벨로 변환
const getPresetTypeLabel = (typeValue: string) => {
  // pipeStore.secondDepth에서 먼저 찾기
  const foundInStore = pipeStore.secondDepth.find(
    (item: any) => item.code_key === typeValue
  );
  if (foundInStore) {
    return foundInStore.code_value;
  }
  // 기본 옵션에서 찾기 (fallback)
  const typeOptions = [
    { value: "FIT_PIPE", label: "배관" },
    { value: "P_VALV", label: "수동 벨브" },
  ];
  const found = typeOptions.find((opt) => opt.value === typeValue);
  return found ? found.label : typeValue;
};

// 프리셋용 VerticalDataTable 데이터 - 동적 생성
const presetVerticalData = computed(() => {
  if (!presetDetailData.value) return [];
  const data: any[] = [];

  // 1. 기본 정보 필드
  data.push({
    columnName: "단위",
    value: presetDetailData.value.unit || "-",
    editable: false,
    fieldType: "input",
  });
  data.push({
    columnName: "연결기계",
    value: presetDetailData.value.machine || "-",
    editable: false,
    fieldType: "input",
  });
  data.push({
    columnName: "프리셋 명",
    value: presetDetailData.value.presetName || "-",
    editable: false,
    fieldType: "input",
  });

  // 2. 파일 필드
  data.push({
    columnName: "썸네일 업로드",
    value: presetDetailData.value.thumbnailFileName || "-",
    filePath: presetDetailData.value.thumbnailDownloadUrl,
    editable: false,
    fieldType: "file",
  });

  return data;
});

// 프리셋 선택 항목 그리드 컬럼 정의
const presetTableColumns: TableColumn[] = [
  { key: "no", title: "순번", width: "50px", sortable: false },
  { key: "pipeCategory", title: "배관구분", width: "100px", sortable: false },
  { key: "fittingType", title: "피팅방식", width: "120px", sortable: false },
  { key: "diameter", title: "직경", width: "80px", sortable: false },
  { key: "diameterAfter", title: "직경후", width: "80px", sortable: false },
  { key: "pipeType", title: "배관유형", width: "150px", sortable: false },
  { key: "code", title: "코드", width: "auto", sortable: false },
  { key: "cellName", title: "썸네일", width: "100px", sortable: false },
];

// 검색 필터링은 서버에서 처리하므로 클라이언트 사이드 필터링 제거

// API 응답에서 페이징 정보를 받아오므로 서버 사이드 페이징 사용
const totalPagesComputed = computed(
  () => asset3DStore.searchResults?.total_pages || 1
);

const paginatedAsset3DList = computed(() => {
  return asset3dList.value; // API에서 이미 페이징된 데이터를 받아옴
});

// (기존 단일 등록 폼 유효성 제거)

const handleSelectionChange = (selected: Asset3DItem[]) => {
  selectedItems.value = selected;
};

// 행 클릭 (RoleManagement.vue 패턴 적용)
const handleRowClick = (row: Asset3DItem) => {
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
  // 등록 모드로 초기화
  isEditModalMode.value = false;
  editTargetItem.value = null;
  // '3D 라이브러리 등록' 탭을 기본 선택
  modalActiveTab.value = 0;
  isRegistModalOpen.value = true;
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

  // 상세보기 창이 열려있으면 닫기
  if (isDetailPanelOpen.value) {
    isDetailPanelOpen.value = false;
  }
  
  // 수정 모드로 등록 팝업 열기
  isEditModalMode.value = true;
  editTargetItem.value = selectedItems.value[0];
  
  // 선택된 항목의 타입에 따라 탭 선택
  const selectedItem = selectedItems.value[0];
  
  console.log("========================================");
  console.log("[Asset3D] 수정 모드 팝업 열기");
  console.log("========================================");
  console.log("선택된 항목:", selectedItem);
  console.log("model_type:", selectedItem.model_type);
  
  if (selectedItem.model_type === "3D_LIBRARY") {
    modalActiveTab.value = 0; // 3D 라이브러리 탭
    const libraryId = (selectedItem as any).library_id || selectedItem.equipment_id || (selectedItem as any).id || "";
    console.log("3D 라이브러리 탭 선택");
    console.log("library_id:", libraryId);
    console.log("호출될 API: POST /api/asset3D/search/3D_LIBRARY");
    console.log("매개변수:", {
      search_field: "library_id",
      search_value: libraryId,
    });
  } else {
    modalActiveTab.value = 1; // 프리셋 탭
    const presetId = selectedItem.equipment_id || (selectedItem as any).preset_id || (selectedItem as any).id || "";
    console.log("프리셋 탭 선택");
    console.log("preset_id:", presetId);
    console.log("호출될 API: POST /api/asset3D/search/PRESET");
    console.log("매개변수:", {
      search_field: "preset_id",
      search_value: presetId,
    });
  }
  console.log("========================================");
  
  isRegistModalOpen.value = true;
};

const closeRegistModal = async () => {
  isRegistModalOpen.value = false;
  // 수정 모드 초기화
  isEditModalMode.value = false;
  editTargetItem.value = null;
  // 등록 모달 닫을 때 데이터 새로고침
  await loadData();
};

// 등록은 Asset3DLibraryTab, Asset3DPresetTab에서 처리

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
        // 프리셋인 경우 프리셋 삭제 API 호출
        if (item.model_type === "PRESET") {
          const presetId = item.equipment_id || (item as any).preset_id || (item as any).id;
          if (!presetId) {
            console.error("프리셋 ID를 찾을 수 없습니다:", item);
            continue;
          }

          console.log("프리셋 삭제 API 호출:", `/api/asset3D/preset/delete/${presetId}`);
          
          const response = await request(
            `/api/asset3D/preset/delete/${presetId}`,
            undefined,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response || !response.success) {
            throw new Error(response?.message || "프리셋 삭제에 실패했습니다.");
          }
        } else if (item.model_type === "3D_LIBRARY") {
          // 3D 라이브러리인 경우 라이브러리 삭제 API 호출
          const libraryId = (item as any).library_id || item.equipment_id || (item as any).id || "";
          if (!libraryId) {
            console.error("library_id를 찾을 수 없습니다:", item);
            continue;
          }

          console.log("3D 라이브러리 삭제 API 호출:", `/api/asset3D/library/delete/${libraryId}`);
          
          const response = await request(
            `/api/asset3D/library/delete/${libraryId}`,
            undefined,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response || !response.success) {
            throw new Error(response?.message || "3D 라이브러리 삭제에 실패했습니다.");
          }
        } else {
          // 기타 항목인 경우 기존 로직 사용
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

          await asset3DStore.deleteAsset3D(item.equipment_id, deleteParams);
        }
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

const openDetailPanel = async (item: Asset3DItem) => {
  // 이전 썸네일 초기화 (새 항목을 열 때마다 초기화)
  thumbnailImageUrl.value = "";
  isThumbnailLoading.value = false;
  libraryDetailData.value = null;
  isLibraryDetail.value = false;
  presetDetailData.value = null;
  isPresetDetail.value = false;

  // 프리셋인 경우 별도 처리
  if (item.model_type === "PRESET") {
    isPresetDetail.value = true;
    detailItemData.value = item;
    isDetailPanelOpen.value = true;

    try {
      const presetId = (item as any).preset_id || item.equipment_id || (item as any).id || "";
      
      if (!presetId) {
        console.error("preset_id를 찾을 수 없습니다:", item);
        return;
      }

      const requestParams = {
        search_field: "preset_id",
        search_value: presetId,
      };

      // API 호출: /api/asset3D/search/PRESET
      const response = await request("/api/asset3D/search/PRESET", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestParams),
      });

      if (response && response.success && response.response) {
        const data = response.response;
        // 배열인 경우 첫 번째 항목 사용
        const presetItem = Array.isArray(data) ? data[0] : (data.items && Array.isArray(data.items) ? data.items[0] : data);

        if (presetItem) {
          // 단위 시스템 이름 찾기
          const unitSystem = asset3DStore.unitSystems.find(
            (unit) => unit.system_code === presetItem.unit_system_code
          );
          const unitName = unitSystem ? unitSystem.system_name : presetItem.unit_system_code || "";

          // 연결기계 이름 변환
          const machineName = presetItem.root_equipment_type === "M_PUMP" ? "펌프" : 
                             presetItem.root_equipment_type === "M_AEBL" ? "송풍기" : 
                             presetItem.root_equipment_type || "";

          // 썸네일 파일 정보
          const thumbnailFile = presetItem.thumbnail_file as Record<string, unknown> | undefined;
          const thumbnailFileName = thumbnailFile && thumbnailFile.file_name 
            ? String(thumbnailFile.file_name) 
            : (presetItem.thumbnail_file_name ? String(presetItem.thumbnail_file_name) : "");
          const thumbnailDownloadUrl = thumbnailFile && thumbnailFile.download_url 
            ? String(thumbnailFile.download_url) 
            : "";
          
          // 썸네일 미리보기 URL
          let thumbnailPreviewUrl = "";
          if (thumbnailFile && thumbnailFile.download_url) {
            thumbnailPreviewUrl = String(thumbnailFile.download_url);
          } else if (presetItem.thumbnail_id) {
            try {
              const url = new URL(`/api/file/download/${presetItem.thumbnail_id}`, window.location.origin);
              const headers: Record<string, string> = {
                system_code: import.meta.env.VITE_SYSTEM_CODE,
                user_Id: localStorage.getItem("authUserId") || "",
                wai_lang: localStorage.getItem("wai_lang") || "ko",
                authSuper: localStorage.getItem("authSuper") || "false",
              };
              
              const fileResponse = await fetch(url.toString(), {
                method: "GET",
                headers,
                credentials: "include",
              });
              
              if (fileResponse.ok) {
                const blob = await fileResponse.blob();
                thumbnailPreviewUrl = URL.createObjectURL(blob);
              }
            } catch (error) {
              console.error("썸네일 로드 실패:", error);
            }
          }

          // 프리셋 상세 정보 조회 (선택 항목 그리드 데이터)
          let tableRows: PresetTableRow[] = [];
          try {
            const detailResponse = await request(`/api/asset3D/preset/${presetId}/detail`, undefined, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (detailResponse && detailResponse.success && detailResponse.response) {
              const detailData = detailResponse.response;
              const detailItems = detailData.data || (Array.isArray(detailData) ? detailData : []);

              if (detailItems && detailItems.length > 0) {
                let nextRowId = 1;
                // 세부구분 라벨 변환을 위한 공통코드 캐시
                const subCategoryLabelCache: Record<string, Record<string, string>> = {};

                for (const detailItem of detailItems) {
                  // preset_category 코드를 라벨로 변환
                  const pipeCategoryCode = String(detailItem.preset_category || "");
                  const pipeCategoryLabel = getPresetTypeLabel(pipeCategoryCode);

                  // preset_subcategory 코드를 라벨로 변환
                  const subCategoryCode = String(detailItem.preset_subcategory || "");
                  let subCategoryLabel = subCategoryCode;

                  // 세부구분 라벨 변환 시도 (캐시 사용)
                  if (subCategoryCode && pipeCategoryCode) {
                    if (!subCategoryLabelCache[pipeCategoryCode]) {
                      try {
                        await asset3DStore.fetchThirdDepth(pipeCategoryCode, 3);
                        const thirdDepthItems = (asset3DStore.thirdDepth as any[] | undefined) || [];
                        subCategoryLabelCache[pipeCategoryCode] = {};
                        thirdDepthItems.forEach((item: any) => {
                          subCategoryLabelCache[pipeCategoryCode][item.code_key] = item.code_value;
                        });
                      } catch (error) {
                        console.warn(`세부구분 라벨 변환 실패 (${pipeCategoryCode}):`, error);
                        subCategoryLabelCache[pipeCategoryCode] = {};
                      }
                    }

                    if (subCategoryLabelCache[pipeCategoryCode] && subCategoryLabelCache[pipeCategoryCode][subCategoryCode]) {
                      subCategoryLabel = subCategoryLabelCache[pipeCategoryCode][subCategoryCode];
                    }
                  }

                  const newRow: PresetTableRow = {
                    id: nextRowId++,
                    no: detailItem.sequence_order || 0,
                    pipeCategory: pipeCategoryLabel,
                    subCategory: subCategoryLabel,
                    fittingType: subCategoryLabel,
                    diameter: String(detailItem.diameter_before || ""),
                    diameterAfter: String(detailItem.diameter_after || ""),
                    pipeType: "",
                    code: String(detailItem.equipment_code || ""),
                    cellName: "",
                    ...detailItem,
                  };

                  tableRows.push(newRow);
                }

                // sequence_order 기준으로 정렬
                tableRows.sort((a, b) => {
                  const orderA = (a as any).sequence_order || a.no || 0;
                  const orderB = (b as any).sequence_order || b.no || 0;
                  return orderA - orderB;
                });
              }
            }
          } catch (error) {
            console.error("프리셋 상세 정보 조회 실패:", error);
          }

          presetDetailData.value = {
            unit: unitName,
            machine: machineName,
            presetName: String(presetItem.preset_name_ko || presetItem.equipment_name || ""),
            thumbnailFileName,
            thumbnailPreviewUrl,
            thumbnailDownloadUrl,
            tableRows,
          };
        }
      }
    } catch (error) {
      console.error("프리셋 상세 정보 조회 실패:", error);
    }
    return;
  }

  // 3D 라이브러리인 경우 별도 처리
  if (item.model_type === "3D_LIBRARY") {
    isLibraryDetail.value = true;
    detailItemData.value = item;
    isDetailPanelOpen.value = true;

    try {
      const libraryId = (item as any).library_id || item.equipment_id || (item as any).id || "";
      
      if (!libraryId) {
        console.error("library_id를 찾을 수 없습니다:", item);
        return;
      }

      const requestParams = {
        search_field: "library_id",
        search_value: libraryId,
      };

      // API 호출: /api/asset3D/search/3D_LIBRARY
      const response = await request("/api/asset3D/search/3D_LIBRARY", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestParams),
      });

      if (response && response.success && response.response) {
        const data = response.response;
        // 배열인 경우 첫 번째 항목 사용
        const libraryItem = Array.isArray(data) ? data[0] : (data.items && Array.isArray(data.items) ? data.items[0] : data);

        if (libraryItem) {
          // 단위 시스템 이름 찾기
          const unitSystem = asset3DStore.unitSystems.find(
            (unit) => unit.system_code === libraryItem.unit_system_code
          );
          const unitName = unitSystem ? unitSystem.system_name : libraryItem.unit_system_code || "";

          // 카테고리 이름 변환
          const categoryName = libraryItem.category === "INTERIOR" ? "인테리어" : 
                              libraryItem.category === "STRUCTURE" ? "구조물" : 
                              libraryItem.category || "";

          // 3D 모델 파일 정보
          const dtdxFile = libraryItem.dtdx_file as Record<string, unknown> | undefined;
          const modelFileName = dtdxFile && dtdxFile.file_name 
            ? String(dtdxFile.file_name) 
            : (libraryItem.dtdx_model_file_name ? String(libraryItem.dtdx_model_file_name) : "");
          const modelDownloadUrl = dtdxFile && dtdxFile.download_url 
            ? String(dtdxFile.download_url) 
            : "";

          // 썸네일 파일 정보
          const thumbnailFile = libraryItem.thumbnail_file as Record<string, unknown> | undefined;
          const thumbnailFileName = thumbnailFile && thumbnailFile.file_name 
            ? String(thumbnailFile.file_name) 
            : (libraryItem.thumbnail_file_name ? String(libraryItem.thumbnail_file_name) : "");
          const thumbnailDownloadUrl = thumbnailFile && thumbnailFile.download_url 
            ? String(thumbnailFile.download_url) 
            : "";
          
          // 썸네일 미리보기 URL
          let thumbnailPreviewUrl = "";
          if (thumbnailFile && thumbnailFile.download_url) {
            thumbnailPreviewUrl = String(thumbnailFile.download_url);
          } else if (libraryItem.thumbnail_id) {
            try {
              const url = new URL(`/api/file/download/${libraryItem.thumbnail_id}`, window.location.origin);
              const headers: Record<string, string> = {
                system_code: import.meta.env.VITE_SYSTEM_CODE,
                user_Id: localStorage.getItem("authUserId") || "",
                wai_lang: localStorage.getItem("wai_lang") || "ko",
                authSuper: localStorage.getItem("authSuper") || "false",
              };
              
              const fileResponse = await fetch(url.toString(), {
                method: "GET",
                headers,
                credentials: "include",
              });
              
              if (fileResponse.ok) {
                const blob = await fileResponse.blob();
                thumbnailPreviewUrl = URL.createObjectURL(blob);
              }
            } catch (error) {
              console.error("썸네일 로드 실패:", error);
            }
          }

          libraryDetailData.value = {
            unit: unitName,
            category: categoryName,
            modelName: String(libraryItem.model_name || ""),
            modelFileName,
            modelDownloadUrl,
            thumbnailFileName,
            thumbnailPreviewUrl,
            thumbnailDownloadUrl,
          };
        }
      }
    } catch (error) {
      console.error("3D 라이브러리 상세 정보 조회 실패:", error);
    }
    return;
  }

  // 기존 로직 (프리셋 등)
  detailItemData.value = item;
  isDetailPanelOpen.value = true;

  try {
    // 3D Asset 공통 상세 정보 조회
    if (item.root_equipment_type) {
      const response = await asset3DStore.fetchAsset3DDetailCommon(
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
  libraryDetailData.value = null;
  isLibraryDetail.value = false;

  // 썸네일 이미지 URL 및 로딩 상태 초기화
  thumbnailImageUrl.value = "";
  isThumbnailLoading.value = false;
};

// 편집 기능 제거됨 (보기 전용)

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

// 3D 라이브러리 파일 다운로드 핸들러
const handleLibraryFileDownload = (fieldName: string) => {
  if (!libraryDetailData.value) return;

  if (fieldName === "3D모델 업로드" && libraryDetailData.value.modelDownloadUrl) {
    handleLibraryModelDownload();
  } else if (fieldName === "3D모델 썸네일" && libraryDetailData.value.thumbnailDownloadUrl) {
    handleLibraryThumbnailDownload();
  } else {
    alert(t("messages.warning.noFileToDownload"));
  }
};

// 프리셋 파일 다운로드 핸들러
const handlePresetFileDownload = (fieldName: string) => {
  if (!presetDetailData.value) return;

  if (fieldName === "썸네일 업로드" && presetDetailData.value.thumbnailDownloadUrl) {
    handlePresetThumbnailDownload();
  } else {
    alert(t("messages.warning.noFileToDownload"));
  }
};

// 프리셋 썸네일 다운로드 핸들러
const handlePresetThumbnailDownload = async () => {
  if (!presetDetailData.value || !presetDetailData.value.thumbnailDownloadUrl) {
    alert("다운로드할 파일이 없습니다.");
    return;
  }

  try {
    const response = await fetch(presetDetailData.value.thumbnailDownloadUrl, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = presetDetailData.value.thumbnailFileName || "thumbnail";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("썸네일 다운로드 실패:", error);
    alert("다운로드 중 오류가 발생했습니다.");
  }
};

// 3D 라이브러리 모델 다운로드 핸들러
const handleLibraryModelDownload = async () => {
  if (!libraryDetailData.value || !libraryDetailData.value.modelDownloadUrl) {
    alert("다운로드할 파일이 없습니다.");
    return;
  }

  try {
    const response = await fetch(libraryDetailData.value.modelDownloadUrl, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = libraryDetailData.value.modelFileName || "model.dtdx";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("3D 모델 다운로드 실패:", error);
    alert("다운로드 중 오류가 발생했습니다.");
  }
};

// 3D 라이브러리 썸네일 다운로드 핸들러
const handleLibraryThumbnailDownload = async () => {
  if (!libraryDetailData.value || !libraryDetailData.value.thumbnailDownloadUrl) {
    alert("다운로드할 파일이 없습니다.");
    return;
  }

  try {
    const response = await fetch(libraryDetailData.value.thumbnailDownloadUrl, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = libraryDetailData.value.thumbnailFileName || "thumbnail";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("썸네일 다운로드 실패:", error);
    alert("다운로드 중 오류가 발생했습니다.");
  }
};

// 데이터 로드 함수
// 데이터 로드 (RoleManagement.vue 패턴 적용)
const loadData = async () => {
  try {
    loading.value = true;
    
    // 상세정보창이 열려있으면 닫기
    if (isDetailPanelOpen.value) {
      closeDetailPanel();
    }

    // 체크된 row 초기화
    selectedItems.value = [];

    // 검색 파라미터 구성
    const searchParams: Record<string, unknown> = {
      page: currentPage.value,
      page_size: pageSize.value,
    };

    // 단위
    if (selectedUnit.value) {
      searchParams.unit_system_code = selectedUnit.value;
    }

    // 검색어
    if (searchQueryInput.value) {
      searchParams.keyword = searchQueryInput.value;
    }

    // API 호출 - 3D 모델 구분을 URL path에 type으로 전달
    const modelType = selectedAsset3DCategory.value || "PRESET";
    const apiEndpoint = `/api/asset3D/search/${modelType}`;
    
    console.log("========================================");
    console.log("[Asset3D] 데이터 로드 시작");
    console.log("========================================");
    console.log("📥 검색 파라미터:", JSON.stringify(searchParams, null, 2));
    console.log("📥 선택된 카테고리:", selectedAsset3DCategory.value);
    console.log("📥 modelType:", modelType);
    console.log("📤 API 엔드포인트:", apiEndpoint);
    console.log("========================================");
    
    const response = await request(apiEndpoint, undefined, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchParams),
    });

    console.log("[Asset3D] 검색 API 응답:", response);

    if (response.success && response.response) {
      const data = response.response;
      
      // 응답 데이터 파싱
      let items: Asset3DItem[] = [];
      
      if (Array.isArray(data)) {
        items = data;
      } else if (data.items && Array.isArray(data.items)) {
        items = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data;
      }

      // 그리드에 표시할 데이터 매핑
      // 3D 라이브러리인 경우 model_name을 명칭에 출력
      const isLibrary = modelType === "3D_LIBRARY";
      asset3dList.value = items.map((item: any) => {
        const equipmentId = item.equipment_id || item.preset_id || item.id || "";
        const libraryId = item.library_id || item.id || ""; // 3D 라이브러리용 ID
        
        // 3D 라이브러리인 경우 library_id를 row_key로 사용, 아니면 equipment_id 사용
        const rowKey = isLibrary ? libraryId : equipmentId;
        
        return {
          ...item,
          equipment_id: equipmentId,
          library_id: libraryId,
          row_key: rowKey, // 그리드 선택 key
          equipment_name: isLibrary 
            ? (item.model_name || item.equipment_name || item.name || "")
            : (item.preset_name_ko || item.equipment_name || item.name || ""),
          equipment_type: item.root_equipment_type || item.equipment_type || "",
          equipment_type_name: getEquipmentTypeName(item.root_equipment_type),
          // 직경: diameter_value + " " + diameter_unit
          diameter_display: item.diameter_value 
            ? `${item.diameter_value}${item.diameter_unit ? " " + item.diameter_unit : ""}`
            : "-",
          unit_system_code: item.unit_system_code || "",
          // 3D 모델구분 저장 (수정 시 탭 분기에 사용)
          model_type: modelType,
        };
      });

      // 페이징 정보 업데이트
      if (data.pagination) {
        asset3DStore.searchResults = {
          total: data.pagination.total || items.length,
          total_pages: data.pagination.total_pages || 1,
          page: data.pagination.page || currentPage.value,
          page_size: data.pagination.page_size || pageSize.value,
          items: items as unknown as Record<string, unknown>[],
          search_info: data.applied_filters || {},
        };
      } else if (data.total_pages) {
        // 하위 호환성을 위해 기존 방식도 지원
        asset3DStore.searchResults = {
          ...asset3DStore.searchResults,
          total_pages: data.total_pages,
          total: data.total_count || data.total || items.length,
          page: data.page || currentPage.value,
          page_size: data.page_size || pageSize.value,
          items: items as unknown as Record<string, unknown>[],
        };
      } else {
        // 페이징 정보가 없는 경우 기본값 설정
        asset3DStore.searchResults = {
          total: items.length,
          total_pages: 1,
          page: currentPage.value,
          page_size: pageSize.value,
          items: items as unknown as Record<string, unknown>[],
        };
      }
    } else {
      asset3dList.value = [];
    }
  } catch (error: unknown) {
    console.error("========================================");
    console.error("[Asset3D] 데이터 로드 실패");
    console.error("========================================");
    console.error("에러 상세:", error);
    
    // 에러 객체에서 상세 정보 추출
    if (error && typeof error === "object" && "status" in error) {
      const errorStatus = (error as { status?: number }).status;
      const errorMessage = (error as { message?: string }).message || "";
      const errorPath = (error as { path?: string }).path || "";
      
      console.error("에러 상태 코드:", errorStatus);
      console.error("에러 메시지:", errorMessage);
      console.error("에러 경로:", errorPath);
      
      // 404 에러인 경우 사용자에게 알림
      if (errorStatus === 404) {
        console.error("⚠️ API 엔드포인트를 찾을 수 없습니다:", errorPath);
        alert(`API 엔드포인트를 찾을 수 없습니다.\n경로: ${errorPath}\n\n서버에서 해당 엔드포인트가 구현되어 있는지 확인해주세요.`);
      }
    }
    
    console.error("========================================");
    
    // 에러 발생 시 빈 배열로 초기화
    asset3dList.value = [];
  } finally {
    loading.value = false;
  }
};

// 장비 유형명 변환 함수
const getEquipmentTypeName = (type: string | undefined): string => {
  if (!type) return "-";
  
  const typeMap: Record<string, string> = {
    "PRESET": "프리셋",
    "3D_LIBRARY": "3D 라이브러리",
    "M_PUMP": "펌프",
    "M_AEBL": "송풍기",
  };
  
  return typeMap[type] || type;
};

// 3D 모델구분 이름 변환 함수 (검색옵션 기준)
const getModel3dTypeName = (type: string | undefined): string => {
  if (!type) return "-";
  
  const typeMap: Record<string, string> = {
    "PRESET": "프리셋",
    "3D_LIBRARY": "3D 라이브러리",
  };
  
  return typeMap[type] || type;
};

// 연결기계 이름 변환 함수 (root_equipment_type 기준)
const getConnectedMachineName = (type: string | undefined): string => {
  if (!type) return "-";
  
  const typeMap: Record<string, string> = {
    "M_PUMP": "펌프",
    "M_AEBL": "송풍기",
  };
  
  return typeMap[type] || type;
};

// 날짜/시간 포맷 함수 (YYYY-MM-DD HH:MI 형태)
const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return "-";
  }
};

// 3D Asset타입 매핑 함수는 더 이상 사용하지 않음

// Asset3D 대분류 변경 핸들러
const handleAsset3DCategoryChange = async () => {
  // Asset3D 대분류 변경 시 자동 검색
  await handleSearch();
};


onMounted(async () => {
  await asset3DStore.fetchCommonCodes("EQUIP");
  await loadData();
});
</script>

<style scoped lang="scss">
@use "sass:color";

.asset3d-page {
  padding: 0 24px;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
}
.asset3d-page:has(.page-layout.detail-open) {
  padding-right: 4px;
}

.page-layout {
  display: grid;
  height: calc(100vh - #{$spacing-lg * 2});
  width: 100%;
  overflow: hidden;
  gap: 10px;
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
  padding-top: 40px;
}

.detail-panel {
  background: #ffffff;
  border-left: 1px solid #b2bbd2;
  display: flex;
  flex-direction: column;
  min-width: 320px;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;

  .detail-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px 8px;
    flex-shrink: 0;

    .detail-panel-head {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 20px;
    }

    h3 {
      color: #202020;
      font-size: 20px;
      font-weight: 600;
    }

    .header-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .detail-panel-body {
    flex: 1;
    padding: 10px 20px 20px;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    -webkit-overflow-scrolling: touch;

    &.with-scroll {
      overflow-y: auto;
    }
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #e7e6ed;
      border-radius: 3px;

      &:hover {
        background-color: #d7d5e4;
      }
    }
    &::-webkit-scrollbar-button:end:increment {
      display: block;
      height: 20px;
      width: 0;
      background-color: transparent;
    }

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
        display: flex;
        align-items: center;
        justify-content: center;
        width: 200px;
        height: 150px;
        border: 2px dashed #888888;
        border-radius: 8px;

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
      margin-top: 20px;
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
    margin-bottom: 10px;
    padding-left: 16px;
    border-left: 4px solid #32ade6;
    color: #333333;
    font-size: 16px;
    font-weight: 600;
  }
}

// 프리셋 선택 항목 그리드 스타일
.preset-selection-grid {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e7e6ed;

  .selection-grid-title {
    margin-bottom: 1rem;
    padding-left: 16px;
    border-left: 4px solid #32ade6;
    color: #333333;
    font-size: 16px;
    font-weight: 600;
  }

  :deep(.data-table) {
    font-size: 0.875rem;
  }

  .table-text {
    font-size: 0.875rem;
    color: #202020;
  }
}

.detail-section :deep(.vertical-data-table) {
  font-size: 0.875rem;

  .column-name {
    background-color: #f8f9fa;
    color: #333333;
    font-weight: 500;
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
  margin-bottom: 20px;

  .filter-group {
    flex-wrap: wrap;
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

.asset3d-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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

// 반응형 브레이크포인트
$mobile: 768px;
$tablet: 1024px;

.tabs-wrapper {
  display: flex;
  overflow-x: auto; // 탭이 많을 때 스크롤 가능
  padding: 0;
}

.tab {
  flex-shrink: 0;
  height: 40px;
  line-height: 40px;
  white-space: nowrap;
  padding: 0 20px;
  border-radius: 10px 10px 0 0;
  background: #e7e6ed;
  cursor: pointer;
  transition: background 0.1s ease-in-out;
  color: #484848;
  font-size: 15px;
  font-weight: 500;

  // @media (max-width: $mobile) {
  //   padding: 0.5rem 1rem;
  //   font-size: 1rem;
  // }
}

.tab.active {
  color: #ffffff;
  background: #0863e2;
}

.tab.disabled {
  color: #999;
  cursor: not-allowed;
  opacity: 0.5;
}

.tab-content {
  margin-top: 20px;
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
  height: 40px;
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
</style>
