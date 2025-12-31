<template>
  <div class="pipe-page">
    <div class="page-layout" :class="{ 'detail-open': isDetailPanelOpen }">
      <!-- 메인 콘텐츠 영역 -->
      <div class="main-content">
        <!-- 검색 및 필터 바 -->
        <div class="search-filter-bar">
          <div class="filter-group">
            <div class="filter-item">
              <label for="unit">{{ t("common.unit") }}</label>
              <select id="unit" v-model="selectedUnit" class="form-select">
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="unit in pipeStore.unitSystems"
                  :key="unit.unit_system_id"
                  :value="unit.system_code"
                >
                  {{ unit.system_name }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label for="machineCategory">{{ t("pipe.materialType") }}</label>
              <select
                id="machineCategory"
                v-model="selectedMachineCategory"
                class="form-select"
                @change="handleMachineCategoryChange"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="category in pipeStore.secondDepth"
                  :key="category.code_id"
                  :value="category.code_key"
                >
                  {{ locale === "en" && category.code_value_en ? category.code_value_en : category.code_value }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label for="search">{{ t("common.search") }}</label>
              <input
                type="text"
                id="search"
                :placeholder="t('placeholder.pipeSearch')"
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

        <!-- 배관 리스트 헤더 -->
        <div class="pipe-list-header">
          <h2>{{ t("common.pipeList") }}</h2>
          <div class="action-buttons">
            <button
              class="btn btn-register"
              @click="openRegistModal"
            >
              {{ t("common.register") }}
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
        <div class="table-wrapper">
          <DataTable
            :columns="tableColumns"
            :data="paginatedMachineList"
            :loading="loading"
            :selectable="true"
            :selected-items="selectedItems"
            :selection-mode="'multiple'"
            :show-select-all="true"
            :select-header-text="t('common.selectColumn')"
            row-key="equipment_id"
            :stickyHeader="true"
            :maxHeight="'100%'"
            @selection-change="handleSelectionChange"
            @row-click="handleRowClick"
            @sort-change="handleSortChange"
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
                  const unitPriceField = item.output_values[unitPriceKey];
                  return `${unitPriceField.value.toLocaleString()} ${
                    unitPriceField.unit_symbol || ""
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

          <!-- 대분류 슬롯 (equipment_type_name은 full_hierarchy에서 파싱) -->
          <template #cell-equipment_type_name="{ item }">
            {{ getMajorCategory(item) }}
          </template>

          <!-- 중분류 슬롯 -->
          <template #cell-middle_category="{ item }">
            {{ getMiddleCategory(item) }}
          </template>

          <!-- 배관유형 슬롯 -->
          <template #cell-pipe_type="{ item }">
            {{ locale === "en" && item.equipment_type_name_en ? item.equipment_type_name_en : getPipeType(item) }}
          </template>

          <!-- 배관코드 슬롯 (줄바꿈 지원) -->
          <template #cell-equipment_code="{ item }">
            <span>{{ item.equipment_code || "-" }}</span>
          </template>

          <!-- 업체명 슬롯 -->
          <template #cell-vendor_name="{ item }">
            {{ 
              locale === "en" && (item.vendor_info as Record<string, unknown>)?.vendor_name_en 
                ? (item.vendor_info as Record<string, unknown>).vendor_name_en 
                : (item.vendor_info?.vendor_name || "-")
            }}
          </template>

          <template #cell-fitting="{ item }">
            {{ getAdditionalFieldValue(item, "fitting") }}
          </template>

          <template #cell-body_material="{ item }">
            {{ getAdditionalFieldValue(item, "body_material") }}
          </template>

          <!-- 모델명 슬롯 (줄바꿈 지원) -->
          <template #cell-model_number="{ item }">
            <span
              style="
                word-break: break-word;
                white-space: normal;
                line-height: 1.4;
                display: inline-block;
                max-width: 100%;
              "
            >
              {{ item.model_number || "-" }}
            </span>
          </template>

          <!-- 상세정보 액션 슬롯 -->
          <template #cell-details="{ item }">
            <button class="btn btn-view" @click.stop="openDetailPanel(item)">
              {{ t("common.view") }}
            </button>
          </template>
        </DataTable>
        </div>

        <!-- 페이징 -->
        <div class="pagination-container">
          <div class="total-count">
            {{
              t("common.totalCount", {
                count: pipeStore.searchResults?.total || 0,
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
          <div class="detail-panel-head">
            <h3>{{ t("common.detailInfo") }}</h3>
            <div class="header-buttons">
              <button
                v-if="!isDetailEditMode"
                class="btn btn-edit sm"
                @click="toggleEditMode"
              >
                {{ t("common.edit") }}
              </button>
              <button
                v-if="isDetailEditMode"
                class="btn btn-save sm"
                @click="saveDetailChanges"
              >
                {{ t("common.save") }}
              </button>
              <button
                v-if="isDetailEditMode"
                class="btn btn-cancel sm"
                @click="cancelEditMode"
              >
                {{ t("common.cancel") }}
              </button>
            </div>
          </div>
          <button
            class="btn-close"
            @click="closeDetailPanel"
            aria-label="Close"
          >
          </button>
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
                  {{ item.price_type || "-" }}
                </template>

                <!-- 단위 슬롯 -->
                <template #cell-price_unit_code="{ item }">
                  {{ item.price_unit_code || "-" }}
                </template>

                <!-- 단가 출처 슬롯 -->
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
      <div class="modal-container" style="max-width: 1600px; width: 90%">
        <div class="modal-header">
          <h3>{{ t("common.register") }}</h3>
          <button
            class="close-btn"
            @click="closeRegistModal"
            aria-label="Close"
          >
          </button>
        </div>
        <div class="modal-body">
          <!-- 등록 폼 -->
          <div class="pipe-register-form">
            <!-- 상단 검색/필터 영역 -->
            <div
              class="filter-bar"
            >
              <div class="group-form inline">
                <span
                  class="label required"
                  >{{ t("common.unit") }}</span
                >
                <select
                  class="input select-md"
                  v-model="registerSelectedUnit"
                  :disabled="registerIsRegistered"
                >
                  <option value="">{{ t("common.select") }}</option>
                  <option
                    v-for="unit in pipeStore.unitSystems"
                    :key="unit.unit_system_id"
                    :value="unit.system_code"
                  >
                    {{ unit.system_name }}
                  </option>
                </select>
              </div>
              <div class="group-form inline">
                <span
                  class="label required"
                  >{{ t("pipe.materialType") }}</span
                >
                <select
                  class="input select-md"
                  v-model="registerSelectedPipeName"
                  :disabled="registerIsRegistered"
                >
                  <option value="">{{ t("common.select") }}</option>
                  <option
                    v-for="pipe in pipeStore.secondDepth"
                    :key="pipe.code_id"
                    :value="pipe.code_key"
                  >
                    {{ locale === "en" && pipe.code_value_en ? pipe.code_value_en : pipe.code_value }}
                  </option>
                </select>
              </div>
              <div
                class="group-form inline"
              >
                <span
                  class="label required"
                  >{{ t("common.excelUpload") }}</span
                >
                <div
                  class="file-upload-group"
                >
                <button
                  type="button"
                  class="btn btn-file"
                  @click="registerExcelFileInput?.click()"
                >
                  {{ t("common.selectFile") }}
                </button>
                  <input
                    type="text"
                    class="input file-name-input"
                    :value="registerExcelFileName"
                    readonly
                    :placeholder="t('placeholder.selectFile')"
                  />
                  <input
                    type="file"
                    ref="registerExcelFileInput"
                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    style="display: none"
                    @change="handleRegisterExcelFileChange"
                  />
                </div>
              </div>
              <div
                class="group-form inline right-align"
              >
                <button
                  type="button"
                  class="btn btn-excel"
                  @click.prevent="onDownloadExcelTemplate"
                >
                  {{ t("common.excelTemplateDownload") }}
                </button>
                <button
                  type="button"
                  class="btn btn-register md"
                  @click="handlePipeRegister"
                >
                  {{ t("common.pipeRegistration") }}
                </button>
              </div>
            </div>

            <!-- 배관 리스트 업로드 영역 -->
            <div class="section-header">
              <div class="section-title">{{ t("common.pipeUpload") }}</div>
              <div class="section-actions">
                <div class="file-upload-group">
                  <button
                    type="button"
                    class="btn btn-file"
                    @click="registerBulkFileInput?.click()"
                  >
                    {{ t("common.bulkModelUpload") }}
                  </button>
                  <input
                    type="text"
                    class="input file-name-input"
                    :value="registerBulkFileName"
                    readonly
                    :placeholder="t('placeholder.selectFile')"
                  />
                  <input
                    type="file"
                    ref="registerBulkFileInput"
                    accept=".zip"
                    style="display: none"
                    @change="handleRegisterBulkFileChange"
                  />
                  <button
                    type="button"
                    class="btn btn-register md"
                    @click="handleModelRegister"
                  >
                    {{ t("common.modelRegister") }}
                  </button>
                </div>
              </div>
            </div>
            <div class="model-register-warning">
              <span class="caution-ico">
                {{ t("messages.warning.invalidFormulaFileNameFormat") }}
              </span>
            </div>

            <!-- ZIP 파일 내부 파일 목록 테이블 -->
            <div
              v-if="registerShowZipContents && registerZipFileList.length > 0"
              class="zip-contents-section"
            >
              <h4 class="zip-contents-title">
                {{ t("common.zipFileList") }} ({{
                  t("common.filesCount", { count: registerZipFileList.length })
                }})
              </h4>
              <DataTable
                :columns="registerZipTableColumns"
                :data="registerZipFileList"
                :loading="false"
                :selectable="false"
                :show-select-all="false"
                :max-height="'300px'"
              >
                <!-- 파일 크기 포맷팅 슬롯 -->
                <template #cell-size="{ value }">
                  {{ formatFileSize(value) }}
                </template>

                <!-- 결과 슬롯 -->
                <template #cell-result="{ item }">
                  <span
                    :class="{
                      'result-success':
                        item.result === t('messages.success.uploadSuccess'),
                      'result-failed':
                        item.result === t('messages.success.uploadFailed'),
                      'result-skipped':
                        item.result === t('messages.success.uploadSkipped'),
                    }"
                  >
                    {{ item.result || "-" }}
                  </span>
                </template>

                <!-- 비고 슬롯 -->
                <template #cell-remarks="{ item }">
                  <span class="remarks-text" :title="item.remarks">
                    {{ item.remarks || "-" }}
                  </span>
                </template>
              </DataTable>
            </div>
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
import { ref, computed, onMounted, watch } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import VerticalDataTable from "@/components/common/VerticalDataTable.vue";
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import { usePipeStore } from "@/stores/pipeStore";

const { t, locale } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

const pipeStore = usePipeStore();
const selectedMachineCategory = ref("");

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
  equipment_type_name_en?: string;
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
const tableColumns = computed<TableColumn[]>(() => {
  const columns: TableColumn[] = [
    { key: "no", title: t("columns.pipe.no"), width: "60px", sortable: false },
    {
      key: "equipment_type_name",
      title: t("columns.pipe.majorCategory"),
      width: "120px",
      sortable: false,
      align: "center",
    },
    {
      key: "middle_category",
      title: t("columns.pipe.middleCategory"),
      width: "120px",
      sortable: false,
    },
    {
      key: "pipe_type",
      title: t("columns.pipe.pipeType"),
      width: "120px",
      sortable: true,
    },
    {
      key: "equipment_code",
      title: t("columns.pipe.pcId"),
      width: "180px",
      sortable: false,
    },
    {
      key: "vendor_name",
      title: t("columns.pipe.company"),
      width: "150px",
      sortable: false,
    },
  ];

  if (selectedMachineCategory.value === "P_DI") {
    columns.push({
      key: "fitting",
      title: t("pipe.fittingType"),
      width: "150px",
      sortable: false,
    });
  } else if (selectedMachineCategory.value === "P_VALV") {
    columns.push({
      key: "body_material",
      title: t("columns.pipe.bodyMaterial"),
      width: "150px",
      sortable: false,
    });
  }

  columns.push(
    {
      key: "model_number",
      title: t("columns.pipe.model"),
      width: "150px",
      sortable: false,
    },
    {
      key: "unit_price",
      title: t("columns.pipe.unitPrice"),
      width: "120px",
      sortable: false,
    },
    {
      key: "details",
      title: t("columns.pipe.details"),
      width: "100px",
      sortable: false,
    }
  );

  return columns;
});

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
const pageSize = ref(20);
const selectedItems = ref<MachineItem[]>([]);
const searchQueryInput = ref("");
// 검색어는 서버에서 처리하므로 클라이언트 사이드 searchQuery 제거
const selectedUnit = ref("");
// 정렬 상태
const orderBy = ref<string | null>(null);
const orderDirection = ref<"asc" | "desc" | null>(null);
const isRegistModalOpen = ref(false);
const isDetailPanelOpen = ref(false);
const detailItemData = ref<MachineItem | null>(null);
const thumbnailImageUrl = ref<string>("");
const isThumbnailLoading = ref(false);
const detailPriceReference = ref<string>("");

// 등록 팝업 관련 변수들
const registerIsRegistered = ref(false);
const registerSelectedUnit = ref("");
const registerSelectedPipeName = ref("");
const registerExcelFileInput = ref<HTMLInputElement | null>(null);
const registerExcelFileName = ref<string>("");
const registerExcelFile = ref<File | null>(null);
const registerBulkFileInput = ref<HTMLInputElement | null>(null);
const registerBulkFileName = ref<string>("");
const registerBulkFile = ref<File | null>(null);
const registerZipFileList = ref<
  Array<{
    name: string;
    size: number;
    type: string;
    lastModified?: string;
    result?: string;
    remarks?: string;
  }>
>([]);
const registerShowZipContents = ref(false);
const registerUploadResult = ref<{
  success_files: Array<{ file_name: string; reason?: string }>;
  failed_files: Array<{ file_name: string; reason?: string }>;
  skipped_files: Array<{ file_name: string; reason?: string }>;
} | null>(null);
const registerZipTableColumns: TableColumn[] = [
  { key: "name", title: t("common.fileName"), width: "25%", sortable: false },
  { key: "type", title: t("common.fileType"), width: "15%", sortable: false },
  { key: "size", title: t("common.fileSize"), width: "10%", sortable: false },
  {
    key: "lastModified",
    title: t("common.lastModified"),
    width: "15%",
    sortable: false,
  },
  { key: "result", title: t("common.result"), width: "10%", sortable: false },
  { key: "remarks", title: t("common.remarks"), width: "25%", sortable: false },
];

// full_hierarchy 파싱 함수
const parseHierarchy = (fullHierarchy?: string) => {
  if (!fullHierarchy) {
    return {
      majorCategory: null, // 레벨2 (대분류)
      middleCategory: null, // 레벨3 (중분류)
      pipeType: null, // 레벨4 (배관유형)
    };
  }

  // "|"로 레벨 구분
  const levels = fullHierarchy.split("|").map((level) => level.trim());

  const parseLevel = (levelStr: string) => {
    // "(레벨N) 코드 / 한국어명 / 영어명" 형식에서 코드, 한국어명, 영어명 추출
    // 예: (레벨3) E_CAB01 / 0.6/1kV 난연 전력 케이블(F-CV) / 0.6/1kV 난연 전력 케이블(F-CV)
    // 형식: (레벨N) 제거 후 " / " (공백 + 슬래시 + 공백)로 구분
    // 코드는 첫 번째 " / " 전까지, 한국어명은 첫 번째 " / "와 두 번째 " / " 사이, 영어명은 두 번째 " / " 이후
    
    // "(레벨N) " 제거
    const withoutLevelPrefix = levelStr.replace(/^\(레벨\d+\)\s+/, "");
    
    // " / "로 분리 (한국어명 안에 "/"가 있을 수 있으므로 마지막 " / "를 기준으로 분리)
    const lastSeparatorIndex = withoutLevelPrefix.lastIndexOf(" / ");
    if (lastSeparatorIndex === -1) {
      // " / "가 없으면 전체를 코드로 간주
      return withoutLevelPrefix.trim();
    }
    
    // 코드 부분: 첫 번째 " / " 전까지
    const firstSeparatorIndex = withoutLevelPrefix.indexOf(" / ");
    if (firstSeparatorIndex === -1 || firstSeparatorIndex === lastSeparatorIndex) {
      // " / "가 하나만 있거나 없으면
      return withoutLevelPrefix.substring(0, lastSeparatorIndex).trim();
    }
    
    // 한국어명: 첫 번째 " / "와 두 번째 " / " 사이
    const koreanName = withoutLevelPrefix.substring(firstSeparatorIndex + 3, lastSeparatorIndex).trim();
    return koreanName;
  };

  return {
    majorCategory: levels.length > 1 ? parseLevel(levels[1]) : null, // 레벨2
    middleCategory: levels.length > 2 ? parseLevel(levels[2]) : null, // 레벨3
    pipeType: levels.length > 3 ? parseLevel(levels[3]) : null, // 레벨4
  };
};

// hierarchy_info에서 값을 가져오는 헬퍼 함수들
const getMajorCategory = (item: MachineItem): string => {
  const hierarchyInfo = item.hierarchy_info as
    | {
        hierarchy_levels?: Array<{
          code_level: number;
          code_value?: string;
          code_value_en?: string;
        }>;
        full_hierarchy?: string;
      }
    | undefined;
  
  // hierarchy_levels 배열에서 레벨2 (Major Category) 찾기
  if (hierarchyInfo?.hierarchy_levels) {
    const level2 = hierarchyInfo.hierarchy_levels.find(
      (level) => level.code_level === 2
    );
    if (level2) {
      return locale.value === "en" && level2.code_value_en
        ? level2.code_value_en
        : level2.code_value || "-";
    }
  }
  
  // fallback: full_hierarchy 파싱
  if (hierarchyInfo?.full_hierarchy) {
    const parsed = parseHierarchy(hierarchyInfo.full_hierarchy);
    if (parsed.majorCategory) return parsed.majorCategory;
  }
  return item.equipment_type_name || "-";
};

const getMiddleCategory = (item: MachineItem): string => {
  const hierarchyInfo = item.hierarchy_info as
    | {
        hierarchy_levels?: Array<{
          code_level: number;
          code_value?: string;
          code_value_en?: string;
        }>;
        full_hierarchy?: string;
        middle_category_name?: string;
        middle_category?: string;
      }
    | undefined;
  
  // hierarchy_levels 배열에서 레벨3 (Middle Category) 찾기
  if (hierarchyInfo?.hierarchy_levels) {
    const level3 = hierarchyInfo.hierarchy_levels.find(
      (level) => level.code_level === 3
    );
    if (level3) {
      return locale.value === "en" && level3.code_value_en
        ? level3.code_value_en
        : level3.code_value || "-";
    }
  }
  
  // fallback: full_hierarchy 파싱
  if (hierarchyInfo?.full_hierarchy) {
    const parsed = parseHierarchy(hierarchyInfo.full_hierarchy);
    if (parsed.middleCategory) return parsed.middleCategory;
  }
  return (
    hierarchyInfo?.middle_category_name || hierarchyInfo?.middle_category || "-"
  );
};

const getPipeType = (item: MachineItem): string => {
  const hierarchyInfo = item.hierarchy_info as
    | { full_hierarchy?: string }
    | undefined;
  if (hierarchyInfo?.full_hierarchy) {
    const parsed = parseHierarchy(hierarchyInfo.full_hierarchy);
    if (parsed.pipeType) return parsed.pipeType;
  }
  return item.equipment_type || "-";
};

const additionalFieldDefinitions: Record<
  string,
  {
    keyCandidates: string[];
    nameKoCandidates: string[];
    nameEnCandidates?: string[];
  }
> = {
  fitting: {
    keyCandidates: ["fitting", "fitting_code", "fittingType"],
    nameKoCandidates: [t("pipe.fittingType"), t("pipe.fittingTypeCode")],
    nameEnCandidates: ["Fitting", "Fitting Type"],
  },
  body_material: {
    keyCandidates: ["body_material", "bodyMaterial", "body_material_code"],
    nameKoCandidates: ["몸체 재질"],
    nameEnCandidates: ["Body Material"],
  },
};

const formatFieldDisplayValue = (field: Record<string, unknown>): string => {
  if (!field) {
    return "-";
  }

  const rawValue =
    field.value ??
    field.display_value ??
    field.text ??
    field.default_value ??
    field.value_text ??
    field.raw_value;

  if (
    rawValue === null ||
    rawValue === undefined ||
    (typeof rawValue === "string" && rawValue.trim() === "")
  ) {
    return "-";
  }

  const valueText = Array.isArray(rawValue)
    ? rawValue.join(", ")
    : String(rawValue);

  const unit =
    (field.unit_symbol as string | undefined) ||
    (field.unit as string | undefined) ||
    (field.unit_text as string | undefined);

  return unit ? `${valueText} ${unit}` : valueText;
};

const getAdditionalFieldValue = (
  item: MachineItem,
  fieldKey: string
): string => {
  const definition = additionalFieldDefinitions[fieldKey];
  if (!definition) {
    return "-";
  }

  const containers = [
    item.specifications,
    item.search_criteria,
    item.output_values,
  ] as Array<Record<string, unknown> | undefined>;

  for (const container of containers) {
    if (!container) continue;
    const containerRecord = container as Record<string, unknown>;

    // 1. 직접 키 매칭 시도
    for (const candidate of definition.keyCandidates) {
      const directField = containerRecord[candidate];
      if (
        directField &&
        typeof directField === "object" &&
        directField !== null
      ) {
        return formatFieldDisplayValue(directField as Record<string, unknown>);
      }
    }

    // 2. 객체 값 순회하며 세부 속성 매칭
    for (const value of Object.values(container)) {
      if (typeof value !== "object" || value === null) continue;
      const field = value as Record<string, unknown>;
      const keyCandidate = (field.key ?? field.field_name ?? field.name) as
        | string
        | undefined;
      if (
        keyCandidate &&
        definition.keyCandidates.some(
          (candidate) => candidate.toLowerCase() === keyCandidate.toLowerCase()
        )
      ) {
        return formatFieldDisplayValue(field);
      }

      const nameKo = field.name_kr as string | undefined;
      if (
        nameKo &&
        definition.nameKoCandidates.some(
          (candidate) => candidate.trim() === nameKo.trim()
        )
      ) {
        return formatFieldDisplayValue(field);
      }

      const englishCandidates = definition.nameEnCandidates;
      if (englishCandidates) {
        const nameEn =
          (field.name_en as string | undefined) ||
          (field.key_en as string | undefined);
        if (
          nameEn &&
          englishCandidates.some(
            (candidate) => candidate.toLowerCase() === nameEn.toLowerCase()
          )
        ) {
          return formatFieldDisplayValue(field);
        }
      }
    }
  }

  // 3. item 자체 프로퍼티 확인 (혹시 평탄화된 데이터가 있는 경우)
  const itemRecord = item as unknown as Record<string, unknown | undefined>;
  const flattenedValue = definition.keyCandidates
    .map((candidate) => itemRecord[candidate])
    .find((val) => val !== undefined && val !== null && val !== "");

  if (flattenedValue !== undefined && flattenedValue !== null) {
    return String(flattenedValue);
  }

  return "-";
};

// 편집 기능 제거로 관련 상태 제거
const isDetailEditMode = ref(false);

// 편집 모드 데이터
const editData = ref<{
  equipmentType: string;
  equipmentCode: string;
  vendor_id: string;
  modelNumber: string;
  model3dFile: string;
  revitFile: string;
  symbolFile: string;
  thumbnailFile: string;
  is_active: boolean;
  description: string;
  output_values: Record<string, any>;
  search_criteria: Record<string, any>;
  specifications: Record<string, any>;
}>({
  equipmentType: "",
  equipmentCode: "",
  vendor_id: "",
  modelNumber: "",
  model3dFile: "",
  revitFile: "",
  symbolFile: "",
  thumbnailFile: "",
  is_active: true,
  description: "",
  output_values: {},
  search_criteria: {},
  specifications: {},
});

// 삭제된 파일 추적 (원본 데이터의 파일 ID 저장)
const deletedFiles = ref<{
  model_file_id?: string;
  thumbnail_id?: string;
  rfa_file_id?: string;
  symbol_id?: string;
}>({});

// 원본 데이터 백업 (취소 시 복원용)
const originalItemData = ref<MachineItem | null>(null);

// 콤보박스 옵션들 (API로부터 동적 로드)
const manufacturers = ref<Array<{ value: string; label: string }>>([]);

const getLatestPriceReference = (history?: PriceHistoryItem[]) => {
  if (!history || history.length === 0) {
    return "";
  }

  const parseTime = (value?: string) => {
    if (!value) {
      return Number.NEGATIVE_INFINITY;
    }
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
  };

  return (
    history.reduce((latest, current) => {
      if (!latest) {
        return current;
      }
      return parseTime(current.price_date) > parseTime(latest.price_date)
        ? current
        : latest;
    }).price_reference || ""
  );
};

// VerticalDataTable용 사양 데이터 - 동적 생성
const specVerticalData = computed(() => {
  if (!detailItemData.value) return [];
  const item = detailItemData.value;
  const data: any[] = [];
  const isEnglish = locale.value === "en";

  // 1. 고정 필드
  data.push({
    columnName: t("columns.pipe.type"),
    value: item.equipment_type_name || "-",
  });
  data.push({
    columnName: t("columns.pipe.code"),
    value: isDetailEditMode.value
      ? detailItemData.value
        ? (detailItemData.value as any).equipment_code || ""
        : ""
      : item.equipment_code || "-",
    editable: false,
    fieldType: "input",
    maxLength: 60, // 최대 60 바이트
  });
  data.push({
    columnName: t("columns.pipe.company"),
    value: isDetailEditMode.value
      ? item.vendor_id || ""
      : item.vendor_id || "-",
    editable: false,
    fieldType: "select",
    options: manufacturers.value,
  });
  data.push({
    columnName: t("columns.pipe.model"),
    value: isDetailEditMode.value
      ? editData.value.modelNumber || "-"
      : item.model_number || "-",
    editable: true,
    fieldType: "input",
  });

  // 2. output_values 동적 추가
  if (item.output_values) {
    const providerLabel = t("pipe.unitPriceSource");
    Object.entries(item.output_values).forEach(
      ([key, field]: [string, any]) => {
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
          fieldType: typeof field.value === "number" ? "number" : "input",
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
          editable: isDetailEditMode.value,
          fieldType: "input",
          originalType: "string",
          isChanged:
            isDetailEditMode.value &&
            originalItemData.value?.output_values?.[key]?.price_reference !==
              providerDisplayValue,
        });
      }
    );
  }

  // 3. search_criteria 동적 추가
  if (item.search_criteria) {
    Object.values(item.search_criteria).forEach((field: any) => {
      // 수정 모드이거나 값이 있는 경우 표시
      // if (
      //   isDetailEditMode.value ||
      //   (field.value !== null &&
      //     field.value !== undefined &&
      //     field.value !== "")
      // ) {
      data.push({
        columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
        value: isDetailEditMode.value
          ? field.value
          : typeof field.value === "number"
          ? field.value.toLocaleString()
          : field.value,
        editable: false,
        fieldType: typeof field.value === "number" ? "number" : "input",
        originalType: typeof field.value,
      });
      // }
    });
  }

  // 4. specifications 동적 추가
  if (item.specifications) {
    Object.values(item.specifications).forEach((field: any) => {
      // 수정 모드이거나 값이 있는 경우 표시
      if (
        isDetailEditMode.value ||
        (field.value !== null &&
          field.value !== undefined &&
          field.value !== "")
      ) {
        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: isDetailEditMode.value
            ? field.value
            : typeof field.value === "number"
            ? field.value.toLocaleString()
            : field.value,
          editable: true,
          fieldType: typeof field.value === "number" ? "number" : "input",
          originalType: typeof field.value,
        });
      }
    });
  }

  // 5. 사용여부 (is_active) 필드 추가
  data.push({
    columnName: isEnglish ? t("pipe.usageStatus") : t("pipe.usageStatus"),
    value: isDetailEditMode.value
      ? item.is_active !== undefined
        ? item.is_active
        : true
      : item.is_active !== undefined
      ? item.is_active
        ? isEnglish
          ? t("pipe.used")
          : t("pipe.used")
        : isEnglish
        ? t("pipe.notUsed")
        : t("pipe.notUsed")
      : "-",
    editable: true,
    fieldType: "select",
    options: [
      { value: true, label: isEnglish ? t("pipe.used") : t("pipe.used") },
      { value: false, label: isEnglish ? t("pipe.notUsed") : t("pipe.notUsed") },
    ],
    originalType: "boolean",
  });

  // 6. 장비설명 (description) 필드 추가
  data.push({
    columnName: isEnglish ? t("pipe.equipmentDescription") : t("pipe.equipmentDescription"),
    value: isDetailEditMode.value
      ? item.description || ""
      : item.description || "-",
    editable: true,
    fieldType: "textarea",
    originalType: "string",
  });

  // 7. 파일 필드 (3D, 썸네일, Revit)
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
  () => pipeStore.searchResults?.total_pages || 1
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

// 정렬 변경 핸들러
const handleSortChange = async (sortConfig: {
  key: string | null;
  direction: "asc" | "desc" | null;
}) => {
  // pipe_type 컬럼만 처리
  if (sortConfig.key === "pipe_type") {
    if (sortConfig.direction) {
      orderBy.value = "equipment_type";
      orderDirection.value = sortConfig.direction;
    } else {
      // 정렬 해제
      orderBy.value = null;
      orderDirection.value = null;
    }
    // 정렬 변경 시 첫 페이지로 이동하고 데이터 재조회
    currentPage.value = 1;
    await loadData();
  }
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

const resetRegisterModalState = () => {
  registerIsRegistered.value = false;
  registerSelectedUnit.value = "";
  registerSelectedPipeName.value = "";
  registerExcelFileName.value = "";
  registerExcelFile.value = null;
  if (registerExcelFileInput.value) {
    registerExcelFileInput.value.value = "";
  }
  registerBulkFileName.value = "";
  registerBulkFile.value = null;
  if (registerBulkFileInput.value) {
    registerBulkFileInput.value.value = "";
  }
  registerZipFileList.value = [];
  registerShowZipContents.value = false;
  registerUploadResult.value = null;
};

const openRegistModal = () => {
  resetRegisterModalState();
  isRegistModalOpen.value = true;
};

const closeRegistModal = async () => {
  isRegistModalOpen.value = false;
  // 등록 모달 닫을 때 데이터 새로고침
  await loadData();
};

// 파일 크기 포맷팅 함수
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 업로드 결과에 따라 registerZipFileList 업데이트
const updateRegisterZipFileListWithResult = (resultData: any) => {
  if (!resultData?.details) return;

  const { success_files, failed_files, skipped_files } = resultData.details;

  // registerZipFileList의 각 항목에 대해 결과와 비고를 매핑
  registerZipFileList.value = registerZipFileList.value.map((file) => {
    // 성공 파일 체크
    const successFile = success_files?.find(
      (f: any) => f.file_name === file.name
    );
    if (successFile) {
      return {
        ...file,
        result: t("messages.success.uploadSuccess"),
        remarks: successFile.reason || "-",
      };
    }

    // 실패 파일 체크
    const failedFile = failed_files?.find(
      (f: any) => f.file_name === file.name
    );
    if (failedFile) {
      return {
        ...file,
        result: t("messages.success.uploadFailed"),
        remarks: failedFile.reason || "-",
      };
    }

    // 제외 파일 체크
    const skippedFile = skipped_files?.find(
      (f: any) => f.file_name === file.name
    );
    if (skippedFile) {
      return {
        ...file,
        result: t("messages.success.uploadSkipped"),
        remarks: skippedFile.reason || "-",
      };
    }

    // 매칭되지 않은 경우
    return {
      ...file,
      result: "-",
      remarks: "-",
    };
  });
};

// ZIP 파일 내부 파일 목록 추출 함수
const extractRegisterZipContents = async (file: File) => {
  try {
    // JSZip 라이브러리 로드 시도
    let JSZip;
    try {
      const jszipModule = await import("jszip");
      JSZip = jszipModule.default;
    } catch (importError) {
      console.warn("JSZip 라이브러리를 로드할 수 없습니다:", importError);
      // JSZip 없이 기본 정보만 표시
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: "ZIP Archive",
        lastModified: new Date(file.lastModified).toLocaleString(),
      };
      registerZipFileList.value = [fileInfo];
      registerShowZipContents.value = true;
      return;
    }

    const zip = new JSZip();
    const zipData = await zip.loadAsync(file);

    const fileList: Array<{
      name: string;
      size: number;
      type: string;
      lastModified?: string;
    }> = [];

    // 허용된 파일 확장자 목록
    const allowedExtensions = [
      "dtdx",
      "rfa",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "svg",
    ];
    const invalidFiles: string[] = [];
    const invalidFileNameFiles: string[] = [];
    let hasAllowedFile = false;

    // ZIP 파일 내부의 모든 파일을 순회
    zipData.forEach((relativePath: string, zipEntry: any) => {
      if (!zipEntry.dir) {
        // 디렉토리가 아닌 파일만
        const fileExtension =
          relativePath.split(".").pop()?.toLowerCase() || "";
        let fileType = "Unknown";

        // 파일명 검증 (경로에서 파일명만 추출)
        const fileName = relativePath.split(/[/\\]/).pop() || relativePath;
        const fileNameValidation = validateFileName(fileName);
        if (!fileNameValidation.valid) {
          invalidFileNameFiles.push(
            `${relativePath}: ${fileNameValidation.message}`
          );
        }

        // 파일 확장자에 따른 타입 분류
        if (["dtdx"].includes(fileExtension)) {
          fileType = "3D Model";
        } else if (["rfa"].includes(fileExtension)) {
          fileType = "Revit Model";
        } else if (["svg"].includes(fileExtension)) {
          fileType = "Symbol";
        } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
          fileType = "Thumbnail Image";
        }

        // 허용/비허용 판정
        if (fileExtension && allowedExtensions.includes(fileExtension)) {
          hasAllowedFile = true;
        } else if (fileExtension) {
          invalidFiles.push(relativePath);
        }

        // 파일 크기 가져오기
        let fileSize = 0;
        if (zipEntry._data?.uncompressedSize) {
          fileSize = zipEntry._data.uncompressedSize;
        } else if (zipEntry.uncompressedSize) {
          fileSize = zipEntry.uncompressedSize;
        } else if (zipEntry._data?.compressedSize) {
          fileSize = zipEntry._data.compressedSize;
        } else if (zipEntry.compressedSize) {
          fileSize = zipEntry.compressedSize;
        }

        fileList.push({
          name: relativePath,
          size: fileSize,
          type: fileType,
          lastModified: zipEntry.date
            ? zipEntry.date.toLocaleString()
            : "Unknown",
        });
      }
    });

    // 파일명 규칙에 맞지 않는 파일이 있으면 경고 및 처리 중단
    if (invalidFileNameFiles.length > 0) {
      alert(
        `${t("messages.warning.invalidFormulaFileNameFormat")}\n\n${invalidFileNameFiles.join(
          "\n"
        )}`
      );
      registerZipFileList.value = [];
      registerShowZipContents.value = false;
      registerBulkFileName.value = "";
      registerBulkFile.value = null;
      return;
    }

    // 허용된 파일이 하나도 없으면 첨부 불가 처리
    if (!hasAllowedFile) {
      alert(t("messages.warning.noAllowedFileInZip"));
      registerZipFileList.value = [];
      registerShowZipContents.value = false;
      registerBulkFileName.value = "";
      registerBulkFile.value = null;
      return;
    }

    // 허용되지 않은 파일이 있으면 경고
    if (invalidFiles.length > 0) {
      alert(
        t("messages.warning.zipInvalidFiles", {
          files: invalidFiles.join("\n"),
        })
      );
    }

    registerZipFileList.value = fileList;
    registerShowZipContents.value = true;
  } catch (error) {
    console.error("ZIP 파일 읽기 실패:", error);
    alert(t("messages.warning.zipReadFail"));
    registerZipFileList.value = [];
    registerShowZipContents.value = false;
    registerBulkFile.value = null;
  }
};

// 파일명 검증 함수
const validateFileName = (
  fileName: string
): { valid: boolean; message?: string } => {
  // 확장자 분리
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return { valid: false, message: "파일명에 확장자가 필요합니다." };
  }

  const nameWithoutExtension = fileName.substring(0, lastDotIndex);

  // 파일명 길이 검증 (확장자 제외)
  if (nameWithoutExtension.length === 0) {
    return { valid: false, message: "파일명을 입력해주세요." };
  }

  if (nameWithoutExtension.length > 100) {
    return { valid: false, message: "파일명은 100자 이내로 입력해주세요." };
  }

  // 영문, 숫자, 특수기호(_ - () .)만 허용, 공백 불가
  const validPattern = /^[a-zA-Z0-9_\-().]+$/;
  if (!validPattern.test(nameWithoutExtension)) {
    return {
      valid: false,
      message:
        "파일명은 영문, 숫자, 특수기호(_ - () .)만 사용 가능하며 공백은 사용할 수 없습니다.",
    };
  }

  return { valid: true };
};

// 공통 검증 함수: 단위 및 자재유형 필수 체크
const validateRegisterBasicSelections = (): boolean => {
  if (!registerSelectedUnit.value) {
    alert(t("messages.warning.selectUnit"));
    return false;
  }

  if (!registerSelectedPipeName.value) {
    alert(t("messages.warning.selectMachineMajorCategory"));
    return false;
  }

  return true;
};

// 엑셀 파일 선택 핸들러
const handleRegisterExcelFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    // 파일명 검증
    const validation = validateFileName(file.name);
    if (!validation.valid) {
      alert(validation.message);
      target.value = "";
      return;
    }

    registerExcelFileName.value = file.name;
    registerExcelFile.value = file;
  }
};

// ZIP 파일 선택 핸들러
const handleRegisterBulkFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    // ZIP 파일명 검증
    const validation = validateFileName(file.name);
    if (!validation.valid) {
      alert(validation.message);
      target.value = "";
      return;
    }

    registerBulkFileName.value = file.name;
    registerBulkFile.value = file;
    await extractRegisterZipContents(file);
  }
};

// 엑셀 템플릿 다운로드
const onDownloadExcelTemplate = async () => {
  if (!validateRegisterBasicSelections()) return;

  try {
    const response = await pipeStore.downloadExcelTemplate(
      registerSelectedPipeName.value
    );

    // download_url로 파일 다운로드
    const downloadUrl = response?.response?.data?.files?.[0]?.download_url;
    const originalFilename =
      response?.response?.data?.files?.[0]?.original_filename;

    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = originalFilename || "template.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(t("messages.error.downloadFailed"));
    }
  } catch (error) {
    console.error("템플릿 다운로드 실패:", error);
    const errorMessage = translateMessage(
      error instanceof Error ? error.message : undefined,
      "messages.error.downloadFailed"
    );
    alert(errorMessage);
  }
};

// 배관 등록 핸들러
const handlePipeRegister = async () => {
  if (!validateRegisterBasicSelections()) return;

  if (!registerExcelFileName.value || !registerExcelFile.value) {
    alert(t("messages.warning.selectExcelFile"));
    return;
  }

  try {
    // pipeStore의 uploadPipeExcel 함수 호출
    const response = await pipeStore.uploadPipeExcel(
      registerSelectedPipeName.value,
      registerExcelFile.value
    );

    // API 응답에서 summary 정보 추출
    const apiResponse = response?.response as any;
    const summary = apiResponse?.data?.summary || apiResponse?.summary;

    if (summary) {
      const totalInserted = summary.total_inserted_rows || 0;
      const totalFailed = summary.total_failed_rows || 0;
      const totalUploaded = totalInserted + totalFailed;

      // 등록 결과 메시지 생성
      const resultMessage = `[등록결과]\n업로드 ${totalUploaded}건\n성공 ${totalInserted}건\n에러 ${totalFailed}건`;
      alert(resultMessage);
    } else {
      alert(t("messages.success.machineRegistered"));
    }

    // 성공 시 초기화
    registerExcelFileName.value = "";
    registerExcelFile.value = null;
    if (registerExcelFileInput.value) {
      registerExcelFileInput.value.value = "";
    }
    registerIsRegistered.value = true;
  } catch (error) {
    console.error("배관 등록 실패:", error);
    const errorMessage = translateMessage(
      error instanceof Error ? error.message : undefined,
      "messages.error.saveFailed"
    );
    alert(errorMessage);
  }
};

// 모델 등록 핸들러
const handleModelRegister = async () => {
  if (!validateRegisterBasicSelections()) return;

  if (!registerBulkFileName.value || !registerBulkFile.value) {
    alert(t("messages.warning.selectModelFile"));
    return;
  }

  try {
    // pipeStore의 uploadModelZip 함수 호출
    const response = await pipeStore.uploadModelZip(
      registerSelectedPipeName.value,
      registerBulkFile.value
    );

    // 업로드 결과 저장 및 그리드 업데이트
    const apiResponse = response?.response as any;
    const resultData = apiResponse?.data?.data;

    if (resultData?.summary && resultData?.details) {
      registerUploadResult.value = resultData.details;

      // registerZipFileList를 업로드 결과로 업데이트
      updateRegisterZipFileListWithResult(resultData);

      // 요약 정보 표시
      const summary = resultData.summary;
      const message = `${t("messages.success.uploadCompleted")}\n\n${t(
        "common.totalFiles"
      )}: ${summary.total_files || 0}\n${t("common.successCount")}: ${
        summary.success_count || 0
      }\n${t("common.skippedCount")}: ${summary.skipped_count || 0}\n${t(
        "common.failedCount"
      )}: ${summary.failed_count || 0}`;
      alert(message);
    } else {
      alert(t("messages.success.modelRegistered"));
    }
  } catch (error) {
    console.error("모델 등록 실패:", error);
    const errorMessage = translateMessage(
      error instanceof Error ? error.message : undefined,
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
      // 선택된 항목들에 대해 삭제 API 호출
      for (const item of selectedItems.value) {
        const deleteParams = {
          model_file_id: item.model_file_id,
          rfa_file_id: item.rfa_file_id,
          symbol_id: item.symbol_id,
          thumbnail_id: item.thumbnail_id,
          formula_id: item.formula_id,
        };

        await pipeStore.deletePipe(item.equipment_id, deleteParams);
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

  // 단가이력에서 각 필드별 최신 단가출처를 output_values에 설정
  if (item.equipment_price_history && item.output_values) {
    const priceHistory = item.equipment_price_history;
    const parseTime = (value?: string) => {
      if (!value) {
        return Number.NEGATIVE_INFINITY;
      }
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
    };

    // 각 output_values 필드에 대해 해당 price_type의 최신 price_reference 찾기
    Object.entries(item.output_values).forEach(
      ([key, field]: [string, any]) => {
        const priceType = (field.key || "").toUpperCase();
        if (priceType) {
          // 해당 price_type의 최신 이력 찾기
          const latestHistory = priceHistory
            .filter(
              (h: PriceHistoryItem) => h.price_type?.toUpperCase() === priceType
            )
            .reduce(
              (latest: PriceHistoryItem | null, current: PriceHistoryItem) => {
                if (!latest) {
                  return current;
                }
                return parseTime(current.price_date) >
                  parseTime(latest.price_date)
                  ? current
                  : latest;
              },
              null
            );

          if (
            latestHistory &&
            latestHistory.price_reference &&
            item.output_values
          ) {
            // output_values에 price_reference 설정
            if (!item.output_values[key]) {
              item.output_values[key] = {};
            }
            item.output_values[key].price_reference =
              latestHistory.price_reference;
          }
        }
      }
    );
  }

  // 원본 데이터 백업 (깊은 복사) - price_reference 설정 후 백업
  originalItemData.value = JSON.parse(JSON.stringify(item));
  detailItemData.value = item;
  detailPriceReference.value = getLatestPriceReference(
    item.equipment_price_history
  );
  isDetailPanelOpen.value = true;
  isDetailEditMode.value = false;

  try {
    // 기계 공통 상세 정보 조회
    if (item.root_equipment_type) {
      const response = await pipeStore.fetchPipeDetailCommon(
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
  detailPriceReference.value = "";

  // 썸네일 이미지 URL 및 로딩 상태 초기화
  thumbnailImageUrl.value = "";
  isThumbnailLoading.value = false;
};

const toggleEditMode = () => {
  if (!isDetailEditMode.value && detailItemData.value) {
    // 삭제 상태 초기화
    deletedFiles.value = {};
    // 편집 모드로 들어갈 때 현재 데이터로 editData 초기화
    editData.value = {
      equipmentType: detailItemData.value.equipment_type || "",
      equipmentCode: detailItemData.value.equipment_code || "",
      vendor_id: detailItemData.value.vendor_id || "",
      modelNumber: detailItemData.value.model_number || "",
      model3dFile: "",
      revitFile: "",
      symbolFile: "",
      thumbnailFile: "",
      is_active: detailItemData.value.is_active || true,
      description: detailItemData.value.description || "",
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
    detailPriceReference.value = getLatestPriceReference(
      originalItemData.value.equipment_price_history
    );

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
    equipmentCode: "",
    vendor_id: "",
    modelNumber: "",
    model3dFile: "",
    revitFile: "",
    symbolFile: "",
    thumbnailFile: "",
    is_active: true,
    description: "",
    output_values: {},
    search_criteria: {},
    specifications: {},
  };

  // 선택된 파일 객체 초기화
  selected3dFile.value = null;
  selectedRevitFile.value = null;
  selectedSymbolFile.value = null;
  selectedThumbnailFile.value = null;

  // 삭제 상태 초기화
  deletedFiles.value = {};

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

    // 업데이트 파라미터 준비 (Machine.vue와 동일한 형식)
    const updateParams: any = {
      equipment_type: item.equipment_type,
      equipment_code: editData.value.equipmentCode || item.equipment_code || "",
      vendor_id: editData.value.vendor_id,
      model_number: editData.value.modelNumber,
    };

    // is_active와 description 추가
    if (editData.value.is_active !== undefined) {
      updateParams.is_active = editData.value.is_active;
    }
    if (editData.value.description !== undefined) {
      updateParams.description = editData.value.description;
    }

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

    // 새로 추가된 파일들 확인 (저장된 File 객체 사용)
    if (selected3dFile.value) {
      updateParams.dtd_model_file = selected3dFile.value;
    }
    if (selectedThumbnailFile.value) {
      updateParams.thumbnail_file = selectedThumbnailFile.value;
    }
    if (selectedRevitFile.value) {
      updateParams.revit_model_file = selectedRevitFile.value;
    }
    if (selectedSymbolFile.value) {
      updateParams.symbol_file = selectedSymbolFile.value;
    }

    // 삭제된 파일 정보 추가
    if (deletedFiles.value.model_file_id) {
      updateParams.model_file_info = {
        model_file_id: deletedFiles.value.model_file_id,
        model_file_delete_check: true,
      };
    }
    if (deletedFiles.value.thumbnail_id) {
      updateParams.thumbnail_file_info = {
        thumbnail_id: deletedFiles.value.thumbnail_id,
        thumbnail_file_delete_check: true,
      };
    }
    if (deletedFiles.value.rfa_file_id) {
      updateParams.rfa_file_info = {
        rfa_file_id: deletedFiles.value.rfa_file_id,
        rfa_file_delete_check: true,
      };
    }
    if (deletedFiles.value.symbol_id) {
      updateParams.symbol_file_info = {
        symbol_id: deletedFiles.value.symbol_id,
        symbol_file_delete_check: true,
      };
    }

    // API 호출
    const response = await pipeStore.updatePipe(
      item.equipment_id,
      updateParams
    );

    if (response?.success) {
      // 저장 성공 후 편집 모드 종료
      isDetailEditMode.value = false;

      const createdPriceHistoryEntries: PriceHistoryItem[] = [];

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
              await pipeStore.createPriceHistory({
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

              createdPriceHistoryEntries.push({
                price_value:
                  typeof currentValue === "number"
                    ? currentValue
                    : Number(currentValue) || 0,
                price_date: new Date().toISOString(),
                price_type:
                  (currentField as any)?.key?.toUpperCase() ||
                  (originalField as any)?.key?.toUpperCase() ||
                  "",
                price_unit_code:
                  (currentField as any)?.unit_code ||
                  (originalField as any)?.unit_code ||
                  "",
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

      // 선택된 파일 객체 초기화
      selected3dFile.value = null;
      selectedRevitFile.value = null;
      selectedSymbolFile.value = null;
      selectedThumbnailFile.value = null;

      // 응답에 오류 메시지가 있는 경우 경고 표시
      const errorMessage = response?.message || response?.response?.message;
      if (errorMessage && errorMessage.trim() !== "") {
        alert(translateMessage(errorMessage, "messages.error.saveFailed"));
      } else {
        alert(t("messages.success.saved"));
      }

      // 상세정보창이 열려있는 상태를 유지하기 위해 선택된 항목 백업
      const wasDetailPanelOpen = isDetailPanelOpen.value;
      const currentEquipmentId = item.equipment_id;

      // 데이터 새로고침 (상세정보창 유지를 위해 선택 항목 보존)
      await loadData(true);

      // 상세정보창이 열려있었고, 저장한 항목이 있었던 경우
      if (wasDetailPanelOpen && currentEquipmentId) {
        // 새로고침된 그리드에서 해당 항목 찾기
        const refreshedItem = machineList.value.find(
          (machine) => machine.equipment_id === currentEquipmentId
        );

        if (refreshedItem) {
          // 상세정보창 다시 열기 (단가이력에서 price_reference 설정 포함)
          await openDetailPanel(refreshedItem);
          
          // 가격 이력이 생성된 경우 추가
          if (createdPriceHistoryEntries.length > 0) {
            if (detailItemData.value) {
              detailItemData.value.equipment_price_history =
                detailItemData.value.equipment_price_history || [];

              createdPriceHistoryEntries.forEach((entry) => {
                // 중복 체크 (같은 price_type, price_date가 있으면 추가하지 않음)
                const exists = detailItemData.value!.equipment_price_history!.some(
                  (h: PriceHistoryItem) =>
                    h.price_type === entry.price_type &&
                    h.price_date === entry.price_date
                );
                if (!exists) {
                  detailItemData.value!.equipment_price_history!.push(entry);
                }
              });
              
              // originalItemData도 업데이트
              originalItemData.value = JSON.parse(JSON.stringify(detailItemData.value));
            }
          }
        } else {
          // 현재 페이지에 해당 항목이 없는 경우 (다른 페이지로 이동했을 수 있음)
          // 상세정보창은 유지하되, 가격 이력만 추가
          if (createdPriceHistoryEntries.length > 0 && detailItemData.value) {
            detailItemData.value.equipment_price_history =
              detailItemData.value.equipment_price_history || [];

            createdPriceHistoryEntries.forEach((entry) => {
              const exists = detailItemData.value!.equipment_price_history!.some(
                (h: PriceHistoryItem) =>
                  h.price_type === entry.price_type &&
                  h.price_date === entry.price_date
              );
              if (!exists) {
                detailItemData.value!.equipment_price_history!.push(entry);
              }
            });
            
            originalItemData.value = JSON.parse(JSON.stringify(detailItemData.value));
          }
        }
      } else if (createdPriceHistoryEntries.length > 0) {
        // 상세정보창이 닫혀있었지만 가격 이력이 생성된 경우
        // (일반적으로는 발생하지 않지만 안전을 위해)
        // 그리드 데이터는 이미 새로고침되었으므로 추가 작업 불필요
      }
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
    // 파일명 검증
    const validation = validateFileName(file.name);
    if (!validation.valid) {
      alert(validation.message);
      target.value = "";
      return;
    }

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
        selected3dFile.value = file; // 파일 객체 저장
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
        selectedRevitFile.value = file; // 파일 객체 저장
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
        selectedSymbolFile.value = file; // 파일 객체 저장
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
        selectedThumbnailFile.value = file; // 파일 객체 저장
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
const handleFieldChange = (
  fieldName: string,
  value: string | boolean | number
) => {
  const isEnglish = locale.value === "en";

  // editData에 반영
  // 배관코드 필드 확인 (columns.pipe.code)
  if (fieldName === t("columns.pipe.code")) {
    // 60바이트 제한 적용
    const strValue = String(value);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(strValue);
    if (bytes.length > 60) {
      // 60바이트를 초과하면 잘라냄
      let truncated = "";
      for (let i = 0; i < strValue.length; i++) {
        const test = truncated + strValue[i];
        if (encoder.encode(test).length > 60) {
          break;
        }
        truncated = test;
      }
      editData.value.equipmentCode = truncated;
      alert(t("messages.warning.pipeCodeMaxBytes"));
    } else {
      editData.value.equipmentCode = strValue;
    }
  }
  // 제조사 필드 확인 (columns.pipe.company)
  else if (fieldName === t("columns.pipe.company")) {
    editData.value.vendor_id = String(value);
  }
  // 모델명 필드 확인 (columns.pipe.model)
  else if (fieldName === t("columns.pipe.model")) {
    editData.value.modelNumber = String(value);
  }
  // 사용여부 필드 확인
  else if (fieldName === t("pipe.usageStatus")) {
    // value는 문자열이거나 실제 boolean 값일 수 있음
    let boolValue = false;
    if (typeof value === "boolean") {
      boolValue = value;
    } else {
      const strValue = String(value);
      boolValue =
        strValue === "true" || strValue === t("pipe.used") || strValue === (isEnglish ? "Used" : t("pipe.used"));
    }
    editData.value.is_active = boolValue;
  }
  // 장비설명 필드 확인
  else if (fieldName === t("pipe.equipmentDescription")) {
    editData.value.description = String(value);
  }
  // 동적 필드 처리 (output_values, search_criteria, specifications)
  else {
    // detailItemData에서 해당 필드 찾기
    const item = detailItemData.value;
    if (!item) return;

    const providerSuffix = isEnglish ? " (Unit Price Source)" : " (단가출처)";

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
            const strValue =
              typeof value === "string" ? value.trim() : String(value);
            editData.value.output_values[key].price_reference = strValue;
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
          const strValue = String(value);
          const numValue = Number(strValue);
          editData.value.output_values[key].value =
            !isNaN(numValue) && strValue !== "" ? numValue : strValue;
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
          const strValue = String(value);
          const numValue = Number(strValue);
          editData.value.search_criteria[key].value =
            !isNaN(numValue) && strValue !== "" ? numValue : strValue;
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
          const strValue = String(value);
          const numValue = Number(strValue);
          editData.value.specifications[key].value =
            !isNaN(numValue) && strValue !== "" ? numValue : strValue;
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

// 선택된 파일 객체 저장 (저장 시 사용)
const selected3dFile = ref<File | null>(null);
const selectedRevitFile = ref<File | null>(null);
const selectedSymbolFile = ref<File | null>(null);
const selectedThumbnailFile = ref<File | null>(null);

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
      selected3dFile.value = null; // 저장된 파일 객체 초기화
      if (detailItemData.value && originalItemData.value) {
        // 원본 데이터에서 파일 ID 저장 (여러 경로 확인)
        const original = originalItemData.value as any;
        const modelFileId =
          original.model_file_id ||
          original.model_file_info?.model_file_id ||
          original.model_file_info?.file_id;
        if (modelFileId) {
          deletedFiles.value.model_file_id = modelFileId;
        } else {
          console.warn("3D 파일 ID를 찾을 수 없습니다. 원본 데이터:", {
            model_file_id: original.model_file_id,
            model_file_info: original.model_file_info,
          });
        }
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
      selectedRevitFile.value = null; // 저장된 파일 객체 초기화
      if (detailItemData.value && originalItemData.value) {
        // 원본 데이터에서 파일 ID 저장 (여러 경로 확인)
        const original = originalItemData.value as any;
        const rfaFileId =
          original.rfa_file_id ||
          original.rfa_file_info?.rfa_file_id ||
          original.rfa_file_info?.file_id;
        if (rfaFileId) {
          deletedFiles.value.rfa_file_id = rfaFileId;
        } else {
          console.warn("Revit 파일 ID를 찾을 수 없습니다. 원본 데이터:", {
            rfa_file_id: original.rfa_file_id,
            rfa_file_info: original.rfa_file_info,
          });
        }
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
      if (detailItemData.value && originalItemData.value) {
        // 원본 데이터에서 파일 ID 저장 (여러 경로 확인)
        const original = originalItemData.value as any;
        const symbolId =
          original.symbol_id ||
          original.symbol_file_info?.symbol_id ||
          original.symbol_file_info?.file_id;
        if (symbolId) {
          deletedFiles.value.symbol_id = symbolId;
        } else {
          console.warn("심볼 파일 ID를 찾을 수 없습니다. 원본 데이터:", {
            symbol_id: original.symbol_id,
            symbol_file_info: original.symbol_file_info,
          });
        }
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
      selectedThumbnailFile.value = null; // 저장된 파일 객체 초기화
      // 썸네일 이미지 URL 초기화
      thumbnailImageUrl.value = "";
      isThumbnailLoading.value = false;
      if (detailItemData.value && originalItemData.value) {
        // 원본 데이터에서 파일 ID 저장 (여러 경로 확인)
        const original = originalItemData.value as any;
        const thumbnailId =
          original.thumbnail_id ||
          original.thumbnail_file_info?.thumbnail_id ||
          original.thumbnail_file_info?.file_id;
        if (thumbnailId) {
          deletedFiles.value.thumbnail_id = thumbnailId;
        } else {
          console.warn("썸네일 파일 ID를 찾을 수 없습니다. 원본 데이터:", {
            thumbnail_id: original.thumbnail_id,
            thumbnail_file_info: original.thumbnail_file_info,
          });
        }
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
const loadData = async (preserveSelection: boolean = false) => {
  try {
    // 체크된 row 초기화 (상세정보창 유지가 필요한 경우 제외)
    if (!preserveSelection) {
      selectedItems.value = [];
    }

    // 기본 검색 파라미터
    const searchParams: any = {
      keyword: searchQueryInput.value,
      root_equipment_type: selectedMachineCategory.value,
      unit_system_code: selectedUnit.value,
      page: currentPage.value,
      page_size: pageSize.value,
    };

    // 정렬 파라미터 추가
    if (orderBy.value && orderDirection.value) {
      searchParams.order_by = orderBy.value;
      searchParams.order_direction = orderDirection.value;
    }

    // API 호출로 배관 검색 리스트 조회
    await pipeStore.fetchSearchList(searchParams);

    // API 응답 데이터를 machineList에 설정
    if (pipeStore.searchResults?.items) {
      machineList.value = pipeStore.searchResults
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
  // 대분류 변경 시 추가 처리 없음
};

// 단위 변경 시 재조회
watch(selectedUnit, async () => {
  if (selectedUnit.value) {
    currentPage.value = 1;
    await loadData();
  }
});

// 배관 대분류 변경 시 재조회
watch(selectedMachineCategory, async () => {
  currentPage.value = 1;
  await loadData();
});

onMounted(async () => {
  // Pipe Major Category 셀렉트박스 항목 생성 API 호출
  const response = await pipeStore.fetchCommonCodes("PIPE_S");
  
  await loadData();
});
</script>

<style scoped lang="scss">
@use "sass:color";

.pipe-page {
  padding: 0 24px;
  height: 100vh;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 0;
  }
}
.pipe-page:has(.page-layout.detail-open) {
  padding-right: 4px;
}

.main-content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0;
  padding: 40px 0 50px;
}

.search-filter-bar {
  flex-shrink: 0;
}

.pipe-list-header {
  flex-shrink: 0;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}

.pagination-container {
  flex-shrink: 0;
}

.price-history-section {
  margin-top: 24px;
}

.search-filter-bar {
  margin-bottom: 20px;

  #search {
    min-width: 350px;
  }
}

.form-select {
  appearance: none;
  width: 240px;
  height: 40px;
  padding: 8px 32px 8px 8px;
  border: 1px solid #e7e6ed;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 120px;
  background-image: url(../../assets/icons/ico_select-down.svg);
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px auto;

  &:focus {
    outline: none;
    border-color: $primary-color;
    background-image: url(../../assets/icons/ico_select-up.svg);
    z-index: 2;
  }
}

// 반응형 브레이크포인트
$mobile: 768px;
$tablet: 1024px;

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
  min-width: 240px;
  height: 40px;
  padding: 0.5rem;
  border: 1px solid #e7e6ed;
  border-radius: 4px;
  font-size: 15px;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }

  @media (max-width: $mobile) {
    padding: 0.4rem;
    font-size: 0.8rem;
  }
}

// 등록 폼 스타일
.pipe-register-form {
  width: 100%;
}

.filter-bar {
  display: grid;
  grid-template-columns: repeat(2, minmax(200px, 1fr));
  align-items: flex-end;
  gap: 20px 10px;

  // 태블릿 크기에서 2열로 변경
  @media (max-width: $tablet) {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
    gap: 20px 10px;
  }

  // 모바일 크기에서 1열로 변경
  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
    gap: 20px 10px;
  }
}

.group-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; // flex 아이템이 축소될 수 있도록 함

  &.wide {
    grid-column: span 2;

    @media (max-width: $tablet) {
      grid-column: span 1;
    }
  }

  &.inline {
    flex-direction: column;
    align-items: flex-start;
  }

  &.right-align {
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;

    @media (max-width: $mobile) {
      justify-content: flex-end;
    }
  }
}

.label {
  color: #333333;
  font-size: 13px;
  font-weight: 600;
  min-width: 100px;
  flex-shrink: 0;

  &.required::after {
    content: "*";
    color: #333333;
    margin-left: 4px;
  }

  &.long-label {
    line-height: 1.4;
    white-space: normal;
    min-width: 120px;
    text-align: left;
  }

  @media (max-width: $mobile) {
    min-width: auto;
    font-size: 12px;

    &.long-label {
      min-width: auto;
    }
  }
}

input,
select {
  appearance: none;
  position: relative;
  width: 100%;
  min-width: 0;
  height: 40px;
  border: 1px solid #e7e6ed;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 400;

  &:disabled {
    border: 1px solid #dfdfdf;
    background-color: #f0f0f0;
  }
}

input {
  padding: 0 10px;

  &:focus {
    border-color: #3b82f6;
  }
}

select {
  padding: 0 32px 0 10px;
  background-color: transparent;
  background-image: url(../../assets/icons/ico_select-down.svg);
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px auto;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background-image: url(../../assets/icons/ico_select-up.svg);
  }
}

.select-md {
  min-width: 220px;

  @media (max-width: $tablet) {
    min-width: 180px;
  }

  @media (max-width: $mobile) {
    min-width: 150px;
  }
}

.file-upload-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  width: 100%;

  .file-name-input {
    flex: 1;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 20px 0 10px;

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 40px;
    gap: 4px;
  }

  .section-title {
    font-weight: 600;
    font-size: 16px;
    color: #333333;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.model-register-warning {
  position: relative;
  text-align: center;
  padding: 20px 0;

  .caution-ico {
    display: inline-block;
    padding: 2px 0 1.5px 18px;
    color: #FF3B30;
    font-size: 14px;
    font-weight: 400;
    font-family: "Noto Sans KR";
    letter-spacing: -0.056px;
    background: url(../../assets/icons/ico_caution.svg) no-repeat 0 center / 16px auto;

    @media (max-width: 550px) {
      font-size: 13px; 
    }
  }
}

.zip-contents-section {
  margin-top: 1rem;

  .zip-contents-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #475467;
    margin-bottom: 0.5rem;
  }
}

.result-success {
  color: #12b76a;
}

.result-failed {
  color: #f04438;
}

.result-skipped {
  color: #f79009;
}

.remarks-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

</style>