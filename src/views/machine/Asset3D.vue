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
              <button class="btn-search" @click="handleSearch">
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
              class="btn btn-primary btn-register"
              @click="openRegistModal"
            >
              {{ t("common.register") }}
            </button>
            <button
              class="btn btn-primary btn-edit"
              @click="handleEdit"
              :disabled="selectedItems.length !== 1"
            >
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
          </div>
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
import Asset3DLibraryTab from "./components/Asset3DLibraryTab.vue";
import Asset3DPresetTab from "./components/Asset3DPresetTab.vue";
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import { useAsset3DStore } from "@/stores/asset3DStore";
import { request } from "@/utils/request";

const { t, locale } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

const asset3DStore = useAsset3DStore();

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
const originalItemData = ref<Asset3DItem | null>(null);

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
    value: isDetailEditMode.value
      ? editData.value.vendor_id || "-"
      : item.vendor_id || "-",
    editable: false,
    fieldType: "select",
    options: manufacturers.value,
  });
  data.push({
    columnName: t("columns.asset3D.model"),
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
        } else {
          // 3D 라이브러리인 경우 기존 로직 사용
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

  // 원본 데이터 백업 (깊은 복사)
  originalItemData.value = JSON.parse(JSON.stringify(item));
  detailItemData.value = item;
  isDetailPanelOpen.value = true;
  isDetailEditMode.value = false;

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
    const response = await asset3DStore.updateAsset3D(
      item.equipment_id,
      updateParams
    );

    if (response?.success) {
      // 저장 성공 후 편집 모드 종료
      isDetailEditMode.value = false;

      // 가격 이력 생성 로직 제거됨

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
  // 제조사 필드 확인 (columns.asset3D.company)
  if (fieldName === t("columns.asset3D.company")) {
    editData.value.vendor_id = value;
  }
  // 모델명 필드 확인 (columns.asset3D.model)
  else if (fieldName === t("columns.asset3D.model")) {
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

      .btn-edit,
      .btn-save,
      .btn-cancel {
        width: 45px;
        height: 32px;
        line-height: 32px;
        border-radius: 4px;
        color: #ffffff;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease-in-out;
      }

      .btn-edit {
        background: #222e77;

        &:hover {
          background: #29378c;
        }
      }

      .btn-save {
        background: #0863e2;

        &:hover {
          background: #0067f5;
        }
      }

      .btn-cancel {
        background: #3e435e;

        &:hover {
          background: #3c4973;
        }
      }
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

// VerticalDataTable 스타일 오버라이드
.detail-section :deep(.vertical-data-table-container) {

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

.modal-footer {
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: center;
    padding: 10px 10px 0 0;
  }

  .btn {
    width: 200px;
    min-width: 200px;

    &:first-child {
      @media (max-width: 768px) {
        width: calc(65% - 5px);
        min-width: calc(65% - 5px);
      }
    }
    &:last-child {
      @media (max-width: 768px) {
        width: calc(35% - 5px);
        min-width: calc(35% - 5px);
      }
    }
  }

  .btn-cancel {
    background-color: #707489;
    color: #ffffff;

    &:hover {
      background-color: #82869d;
    }
  }

  .btn-confirm {
    background-color: #222e77;
    color: #fff;

    &:hover {
      background-color: #29378c;
    }
  }
}

.modal-footer.code-modal {
  .btn {
    &:first-child {
      @media (max-width: 768px) {
        width: 100%;
        min-width: 100%;
      }
    }
  }
}

.modal-container.library-tab-modal {
  max-height: auto !important;
  height: auto !important;
  
  .modal-body {
    flex: 0 1 auto !important;
    overflow-y: visible !important;
  }
}
</style>
