<template>
  <div class="asset3d-preset-register-tab">
    <!-- 등록 폼 -->
    <div class="filter-bar">
        <div class="form-group">
          <label class="required">단위</label>
          <select v-model="selectedUnit" class="form-select">
            <option value="">-- 선택 --</option>
            <option
              v-for="unit in asset3DStore.unitSystems"
              :key="unit.unit_system_id"
              :value="unit.system_code"
            >
              {{ unit.system_name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="required">연결기계</label>
          <select v-model="selectedMachine" class="form-select">
            <option value="">-- 선택 --</option>
          <option value="M_PUMP">펌프</option>
          <option value="M_AEBL">송풍기</option>
          </select>
        </div>
        <div class="form-group">
          <label class="required">프리셋 명</label>
          <input
            type="text"
            v-model="presetName"
            class="form-input"
            placeholder="프리셋 명을 입력해주세요."
          />
        </div>
        <div class="form-group">
          <label class="required">썸네일 업로드</label>
        <div class="file-upload-wrapper">
          <div class="file-upload-group">
            <input
              type="text"
              class="form-input file-name-input"
              :value="thumbnailFileName"
              readonly
              placeholder="파일 선택"
            />
            <input
              type="file"
              ref="thumbnailFileInput"
              accept=".jpg,.jpeg,.png,.gif"
              style="display: none"
              @change="handleThumbnailFileChange"
            />
            <button
              type="button"
              class="btn-ellipsis"
              @click="thumbnailFileInput?.click()"
            >
              ...
            </button>
          </div>
          <img
            v-if="thumbnailPreviewUrl"
            :src="thumbnailPreviewUrl"
            alt="썸네일 미리보기"
            class="thumbnail-preview"
          />
        </div>
      </div>
      <div class="form-group right-align">
        <button
          type="button"
          class="btn-register"
          @click="handleThumbnailRegister"
          :disabled="!thumbnailFile"
        >
          등록
          </button>
          </div>
        </div>

    <!-- 행 삭제/저장 버튼 -->
    <div class="table-header-row">
      <h3 class="table-title">선택 항목</h3>
      <div class="button-group">
          <button type="button" class="btn-delete-row" @click="handleDeleteRow">
            -행 삭제
          </button>
        <button type="button" class="btn-save" @click="handleSaveSelectedItems">
          저장
          </button>
      </div>
    </div>

    <!-- 데이터 테이블 -->
    <div class="table-section">
      <DataTable
        :columns="tableColumns"
        :data="tableRows"
        :selectable="true"
        :selection-mode="'multiple'"
        :show-select-all="true"
        :selected-items="selectedRows"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <template #cell-type="{ item }">
          <span class="table-text">{{ getTypeLabel(item.type) || "-" }}</span>
        </template>
        <template #cell-subType="{ item }">
          <span class="table-text">{{ item.subTypeLabel || item.subType || "-" }}</span>
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
        <template #cell-supplierName="{ item }">
          <span class="table-text">{{ item.supplierName || "-" }}</span>
        </template>
        <template #cell-pipeCode="{ item }">
          <span class="table-text">{{ item.pipeCode || "-" }}</span>
        </template>
        <template #cell-dtdxModel="{ item }">
          <span class="table-text">{{ item.dtdxModel || "-" }}</span>
        </template>
        <template #cell-remarks="{ item }">
          <input
            type="text"
            v-model="item.remarks"
            class="table-input"
            placeholder="비고"
          />
        </template>
      </DataTable>
    </div>

    <!-- 선택 항목 섹션 -->
    <div class="selection-section">
      <!-- 필터 바 -->
      <div class="selection-filter-bar">
        <div class="filter-group">
          <div class="filter-item">
            <label>구분</label>
          <select
              v-model="selectionFilter.pipeCategory" 
              class="form-select"
              @change="handleFilterCategoryChange"
            >
              <option value="">{{ t("common.select") }}</option>
            <option
              v-for="category in pipeStore.secondDepth"
              :key="category.code_id"
              :value="category.code_key"
            >
              {{ category.code_value }}
            </option>
          </select>
          </div>
          <div class="filter-item subtype-filter-item">
            <label>세부구분</label>
            <!-- 수동 벨브 선택 시 트리 셀렉트 -->
            <div
              v-if="selectionFilter.pipeCategory === 'P_VALV'"
              class="filter-tree-select-wrapper"
            >
              <div
                class="tree-select-display"
                :class="{ open: isFilterTreeDropdownOpen }"
                @click.stop="toggleFilterTreeDropdown($event)"
              >
                <span>{{
                  filterSubTypeLabel || t("common.select")
                }}</span>
                <span class="arrow">{{
                  isFilterTreeDropdownOpen ? "▲" : "▼"
                }}</span>
              </div>
            </div>
            <!-- 배관 선택 시 일반 셀렉트 -->
            <select 
              v-else
              v-model="selectionFilter.fittingType" 
              class="form-select"
              :disabled="!selectionFilter.pipeCategory"
              @change="handleFilterSubTypeChange"
            >
              <option value="">전체</option>
              <option
                v-for="option in filterSubTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="filter-item diameter-filter-item">
            <label>직경 입력</label>
          <input
            type="text"
              v-model="selectionFilter.diameter"
              class="form-input"
            placeholder="직경"
              @change="handleDiameterChange"
          />
          </div>
          <div class="filter-item search-item">
            <label>키워드</label>
          <input
            type="text"
              v-model="selectionFilter.searchText"
              class="form-input"
              placeholder="원본 전체 텍스트 검색 (예: 엘보 & 150A)"
              @keyup.enter="handleSelectionSearch"
              @change="handleKeywordChange"
            />
          </div>
        </div>
        <div class="button-group">
          <button type="button" class="btn-reset" @click="handleResetSelectionFilter">
            필터 초기화
          </button>
          <button type="button" class="btn-add-selection" @click="handleAddSelection">
            선택 항목 추가
          </button>
        </div>
      </div>

      <!-- 자재 리스트 테이블 -->
      <div class="selection-table-section">
        <div class="material-list-header">
          <h3 class="section-title">자재 리스트</h3>
          <!-- 디버깅용 equipment_type 검색 (숨김 처리) -->
          <!-- <div class="debug-search">
          <input
            type="text"
              v-model="debugEquipmentType"
              class="form-input debug-input"
              placeholder="equipment_type 입력"
            />
            <button
              type="button"
              class="btn-debug-search"
              @click="handleDebugSearch"
            >
              검색
            </button>
          </div> -->
        </div>
        
        <!-- 로딩 상태 표시 -->
        <div v-if="materialListLoading" class="loading-message">
          검색 중...
        </div>
        
        <!-- 에러 메시지 표시 -->
        <div v-if="materialListError" class="error-message">
          {{ materialListError }}
        </div>
        
        <!-- 데이터 테이블 -->
        <div class="material-table-wrapper">
          <DataTable
            v-if="!materialListLoading && !materialListError"
            :columns="materialListColumns"
            :data="materialListData"
            :loading="false"
            :selectable="true"
            :selection-mode="'multiple'"
            :show-select-all="true"
            :selected-items="selectedMaterialItems"
            @selection-change="handleMaterialSelectionChange"
            row-key="id"
          >
            <!-- 순번 슬롯 -->
            <template #cell-no="{ index }">
              {{ index + 1 }}
        </template>
      </DataTable>
    </div>
        
        <!-- 검색 결과가 없을 때 -->
        <div v-if="!materialListLoading && !materialListError && materialListData.length === 0" class="no-data-message">
          검색 결과가 없습니다.<br>
          검색 조건을 변경하여 다시 조회해 주세요.
        </div>
        
        <!-- 페이징 -->
        <div v-if="materialListData.length > 0" class="material-pagination-container">
          <div class="pagination-info">
            총 {{ materialTotalItems }}건 ({{ materialCurrentPage }} / {{ materialTotalPages }} 페이지)
          </div>
          <Pagination
            v-if="materialTotalPages > 1"
            :current-page="materialCurrentPage"
            :total-pages="materialTotalPages"
            @page-change="handleMaterialPageChange"
          />
        </div>
      </div>
    </div>

    <teleport to="body">
      <div
        v-if="openTreeDropdownRowId !== null && activeManualValveRow"
        class="tree-dropdown-portal"
        :style="{
          bottom: `${treeDropdownPosition.bottom}px`,
          left: `${treeDropdownPosition.left}px`,
          width: `${treeDropdownPosition.width}px`,
        }"
        ref="treeDropdownPortalRef"
      >
        <div class="tree-dropdown-panel">
          <div v-if="manualValveTreeLoading" class="tree-dropdown-state">
            {{ t("common.loading") }}...
          </div>
          <div v-else-if="manualValveTreeError" class="tree-dropdown-state error">
            {{ manualValveTreeError }}
          </div>
          <div v-else class="tree-node-list">
            <template v-for="node in manualValveTree" :key="node.code_key">
              <div class="tree-node-label">
                <div
                  class="tree-node-row"
                  :class="{
                    'is-selected': manualValveSelectedCode === node.code_key,
                    warning: node.children && node.children.length > 0,
                  }"
                  @click.stop="handleTreeSelect(activeManualValveRow, node)"
                >
                  <button
                    v-if="node.children && node.children.length"
                    type="button"
                    class="tree-node-toggle"
                    @click.stop="handleToggleParentNode(node.code_key)"
                  >
                    {{ isParentExpanded(node.code_key) ? "▾" : "▸" }}
                  </button>
                  <span class="node-text">{{ node.code_value }}</span>
                </div>
              </div>
              <div
                v-if="node.children && node.children.length"
                v-show="isParentExpanded(node.code_key)"
                class="tree-children-nodes"
              >
                <div
                  v-for="child in node.children"
                  :key="child.code_key"
                  class="tree-node-row child"
                  :class="{
                    'is-selected': manualValveSelectedCode === child.code_key,
                    warning: child.children && child.children.length > 0,
                  }"
                  @click.stop="handleTreeSelect(activeManualValveRow, child)"
                >
                  <button
                    v-if="child.children && child.children.length"
                    type="button"
                    class="tree-node-toggle"
                    @click.stop="handleToggleParentNode(child.code_key)"
                  >
                    {{ isParentExpanded(child.code_key) ? "▾" : "▸" }}
                  </button>
                  <span class="node-text">{{ child.code_value }}</span>
                </div>
              </div>
        </template>
          </div>
        </div>
      </div>
      <!-- 필터용 수동 벨브 트리 드롭다운 -->
      <div
        v-if="isFilterTreeDropdownOpen"
        class="tree-dropdown-portal filter-tree-dropdown"
        :style="{
          bottom: `${filterTreeDropdownPosition.bottom}px`,
          left: `${filterTreeDropdownPosition.left}px`,
          width: `${filterTreeDropdownPosition.width}px`,
        }"
        ref="filterTreeDropdownPortalRef"
      >
        <div class="tree-dropdown-panel">
          <div v-if="manualValveTreeLoading" class="tree-dropdown-state">
            {{ t("common.loading") }}...
          </div>
          <div v-else-if="manualValveTreeError" class="tree-dropdown-state error">
            {{ manualValveTreeError }}
          </div>
          <div v-else class="tree-node-list">
            <template v-for="node in manualValveTree" :key="node.code_key">
              <div class="tree-node-label">
                <div
                  class="tree-node-row"
                  :class="{
                    'is-selected': filterSelectedCode === node.code_key,
                    warning: node.children && node.children.length > 0,
                  }"
                  @click.stop="handleFilterTreeSelect(node)"
                >
                  <button
                    v-if="node.children && node.children.length"
                    type="button"
                    class="tree-node-toggle"
                    @click.stop="handleFilterToggleParentNode(node.code_key)"
                  >
                    {{ isFilterParentExpanded(node.code_key) ? "▾" : "▸" }}
                  </button>
                  <span class="node-text">{{ node.code_value }}</span>
                </div>
              </div>
              <div
                v-if="node.children && node.children.length"
                v-show="isFilterParentExpanded(node.code_key)"
                class="tree-children-nodes"
              >
                <div
                  v-for="child in node.children"
                  :key="child.code_key"
                  class="tree-node-row child"
                  :class="{
                    'is-selected': filterSelectedCode === child.code_key,
                    warning: child.children && child.children.length > 0,
                  }"
                  @click.stop="handleFilterTreeSelect(child)"
                >
                  <button
                    v-if="child.children && child.children.length"
                    type="button"
                    class="tree-node-toggle"
                    @click.stop="handleFilterToggleParentNode(child.code_key)"
                  >
                    {{ isFilterParentExpanded(child.code_key) ? "▾" : "▸" }}
                  </button>
                  <span class="node-text">{{ child.code_value }}</span>
                </div>
              </div>
        </template>
    </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, onActivated } from "vue";
import { useI18n } from "vue-i18n";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useAsset3DStore } from "@/stores/asset3DStore";
import { usePipeStore } from "@/stores/pipeStore";
import { request } from "@/utils/request";

const { t } = useI18n();
const asset3DStore = useAsset3DStore();
const pipeStore = usePipeStore();

// 폼 데이터
const selectedUnit = ref("");
const selectedMachine = ref("");
const presetName = ref("");
const thumbnailFile = ref<File | null>(null);
const thumbnailFileName = ref("");
const thumbnailFileInput = ref<HTMLInputElement | null>(null);
const thumbnailPreviewUrl = ref<string>("");

// 테이블 데이터
interface TableRow {
  id: number;
  no: number;
  type: string;
  subType: string;
  subTypeLabel?: string;
  diameter: string;
  diameterAfter: string;
  pipeType: string;
  supplierName: string;
  pipeCode: string;
  dtdxModel: string;
  remarks: string;
  subTypeOptions?: Array<{ value: string; label: string }>;
}

interface ManualValveTreeNode {
  code_key: string;
  code_value: string;
  code_level?: number;
  code_order?: number;
  children?: ManualValveTreeNode[];
}
interface ManualValveTreeNodeWithDepth extends ManualValveTreeNode {
  depth: number;
}
interface CodeKeyValue {
  code_key: string;
  code_value: string;
}

// 선택 항목 인터페이스
interface SelectionItem {
  id: number;
  pipeCategory: string;
  fittingType: string;
  diameter: string;
  diameterAfter: string;
  pipeType: string;
  code: string;
  cellName: string;
}

// 선택 항목 필터
const selectionFilter = ref({
  pipeCategory: "",
  fittingType: "",
  diameter: "",
  searchText: "",
});

// 필터용 세부구분 옵션 (구분 선택에 따라 동적으로 변경)
const filterSubTypeOptions = ref<Array<{ value: string; label: string }>>([]);

// 필터용 세부구분 라벨 (수동 벨브용)
const filterSubTypeLabel = ref("");

// 필터용 트리 드롭다운 상태
const isFilterTreeDropdownOpen = ref(false);
const filterTreeDropdownPosition = ref({ bottom: 0, left: 0, width: 0 });
const filterTreeDropdownPortalRef = ref<HTMLElement | null>(null);
const filterTreeDropdownAnchor = ref<HTMLElement | null>(null);
const filterSelectedCode = ref("");
const filterExpandedKeys = ref<Set<string>>(new Set());

// 선택된 항목 목록
const selectedSelectionItems = ref<SelectionItem[]>([]);
let nextSelectionId = 1;

// 자재 리스트 관련 상태
const materialListLoading = ref(false);
const materialListError = ref<string | null>(null);
const materialListItems = ref<MaterialListItem[]>([]);
const selectedMaterialItems = ref<MaterialListItem[]>([]);
const materialCurrentPage = ref(1);
const materialTotalPages = ref(1);
const materialTotalItems = ref(0);
const materialPageSize = ref(10);

// 디버깅용 equipment_type 검색
const debugEquipmentType = ref("");

// 하단 검색 버튼 활성화 여부 (구분과 세부구분이 모두 선택된 경우만 활성화)
const isSelectionSearchEnabled = computed(() => {
  // 구분이 선택되지 않은 경우 비활성화
  if (!selectionFilter.value.pipeCategory) {
    return false;
  }
  
  // 수동 밸브인 경우: 트리에서 선택한 세부구분 필요
  if (selectionFilter.value.pipeCategory === "P_VALV") {
    return !!filterSelectedCode.value;
  }
  
  // 배관인 경우: 세부구분 선택 필요
  if (selectionFilter.value.pipeCategory === "FIT_PIPE") {
    return !!selectionFilter.value.fittingType;
  }
  
  return false;
});

// 자재 리스트 인터페이스
interface MaterialListItem {
  id: string | number;
  pipeCategory: string;
  fittingType: string;
  diameter: string;
  diameterAfter: string;
  pipeType: string;
  code: string;
  cellName: string;
  [key: string]: unknown;
}

// 자재 리스트 컬럼 정의
const materialListColumns: TableColumn[] = [
  { key: "no", title: "#", width: "50px", sortable: false },
  { key: "pipeCategory", title: "배관구분", width: "100px", sortable: false },
  { key: "subCategory", title: "세부구분", width: "150px", sortable: false },
  { key: "fittingType", title: "피팅방식", width: "120px", sortable: false },
  { key: "diameter", title: "직경", width: "80px", sortable: false },
  { key: "diameterAfter", title: "직경후", width: "80px", sortable: false },
  { key: "pipeType", title: "배관유형", width: "150px", sortable: false },
  { key: "code", title: "코드", width: "auto", sortable: false },
  { key: "cellName", title: "썸네일", width: "100px", sortable: false },
];

// 자재 리스트 데이터 (computed)
const materialListData = computed(() => {
  // 조회조건의 구분 값 라벨
  const pipeCategoryLabel = getTypeLabel(selectionFilter.value.pipeCategory) || "";
  
  // 조회조건의 세부구분 값 라벨
  let subCategoryLabel = "";
  if (selectionFilter.value.pipeCategory === "P_VALV") {
    // 수동 밸브: 트리에서 선택한 세부구분 라벨
    subCategoryLabel = filterSubTypeLabel.value || "";
  } else if (selectionFilter.value.pipeCategory === "FIT_PIPE") {
    // 배관: 셀렉트에서 선택한 세부구분 라벨
    const selectedOption = filterSubTypeOptions.value.find(
      opt => opt.value === selectionFilter.value.fittingType
    );
    subCategoryLabel = selectedOption?.label || selectionFilter.value.fittingType || "";
  }
  
  return materialListItems.value.map((item, index) => ({
    ...item,
    no: (materialCurrentPage.value - 1) * materialPageSize.value + index + 1,
    pipeCategory: pipeCategoryLabel, // 조회조건의 구분 값으로 덮어쓰기
    subCategory: subCategoryLabel, // 조회조건의 세부구분 값으로 덮어쓰기
  }));
});

const tableRows = ref<TableRow[]>([]);
const selectedRows = ref<TableRow[]>([]);
let nextRowId = 1;
const manualValveTree = ref<ManualValveTreeNode[]>([]);
const manualValveTreeLoading = ref(false);
const manualValveTreeError = ref<string | null>(null);
const manualValveTreeInitialized = ref(false);
const openTreeDropdownRowId = ref<number | null>(null);
const activeManualValveRow = ref<TableRow | null>(null);
const manualValveSelectedCode = ref<string>("");
const manualValveExpandedKeys = ref<Set<string>>(new Set());
const treeDropdownAnchor = ref<HTMLElement | null>(null);
const treeDropdownPortalRef = ref<HTMLElement | null>(null);
const treeDropdownPosition = ref({ bottom: 0, left: 0, width: 0 });

const getTreeDropdownAnchorElement = (event?: MouseEvent) => {
  const target = event?.currentTarget as HTMLElement | null;
  if (!target) {
    return treeDropdownAnchor.value;
  }

  const container = target.closest(".tree-select-wrapper");
  const display = container?.querySelector<HTMLElement>(".tree-select-display");
  return display || target;
};

const updateTreeDropdownPosition = (target?: HTMLElement | null) => {
  const anchor = target || treeDropdownAnchor.value;
  if (!anchor) return;

  const rect = anchor.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  // 위 방향으로 펼쳐지도록 bottom 위치 계산 (viewport 기준)
  treeDropdownPosition.value = {
    bottom: viewportHeight - rect.top,
    left: rect.left + window.scrollX,
    width: rect.width,
  };
};

const closeManualValveDropdown = () => {
  openTreeDropdownRowId.value = null;
  activeManualValveRow.value = null;
  treeDropdownAnchor.value = null;
};

const resetManualValveTreeState = () => {
  manualValveTree.value = [];
  manualValveTreeLoading.value = false;
  manualValveTreeError.value = null;
  manualValveTreeInitialized.value = false;
  manualValveSelectedCode.value = "";
  manualValveExpandedKeys.value = new Set();
  closeManualValveDropdown();
};

// 유형 옵션
// 상단 그리드용 유형 옵션 (기존 유지)
const typeOptions = ref([
  { value: "FIT_PIPE", label: "배관" },
  { value: "P_VALV", label: "수동 벨브" },
]);

// 유형 코드를 라벨로 변환 (pipeStore.secondDepth 우선 사용)
const getTypeLabel = (typeValue: string) => {
  // pipeStore.secondDepth에서 먼저 찾기
  const foundInStore = pipeStore.secondDepth.find(
    (item: any) => item.code_key === typeValue
  );
  if (foundInStore) {
    return foundInStore.code_value;
  }
  // 기존 typeOptions에서 찾기 (fallback)
  const found = typeOptions.value.find((opt) => opt.value === typeValue);
  return found ? found.label : typeValue;
};

// 테이블 컬럼 정의
const tableColumns: TableColumn[] = [
  { key: "no", title: "번호", width: "50px", sortable: false },
  { key: "type", title: "구분", width: "100px", sortable: false },
  { key: "subType", title: "세부구분", width: "300px", sortable: false },
  { key: "diameter", title: "직경", width: "50px", sortable: false },
  { key: "diameterAfter", title: "직경후", width: "50px", sortable: false },
  { key: "pipeType", title: "배관 유형(장비유형)", width: "140px", sortable: false },
  { key: "supplierName", title: "공급업체명", width: "100px", sortable: false },
  { key: "pipeCode", title: "배관 코드", width: "100px", sortable: false },
  { key: "dtdxModel", title: "Dtdx 모델", width: "100px", sortable: false },
  { key: "remarks", title: "비고", width: "100px", sortable: false },
];

// 썸네일 파일 변경 핸들러
const handleThumbnailFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files?.[0];

  if (file) {
    // 파일명 validation
    if (!validateFileName(file.name)) {
      alert(t("messages.warning.invalidFormulaFileNameFormat"));
      input.value = "";
      thumbnailFileName.value = "";
      thumbnailFile.value = null;
      return;
    }

    // 확장자 검증
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      alert("썸네일 파일은 .jpg, .jpeg, .png, .gif 확장자만 허용됩니다.");
      input.value = "";
      thumbnailFileName.value = "";
      thumbnailFile.value = null;
      return;
    }

    thumbnailFileName.value = file.name;
    thumbnailFile.value = file;

    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      thumbnailPreviewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    thumbnailFileName.value = "";
    thumbnailFile.value = null;
    thumbnailPreviewUrl.value = "";
  }
};

// 파일명 validation 함수
const validateFileName = (fileName: string): boolean => {
  // 확장자 제거
  const lastDotIndex = fileName.lastIndexOf(".");
  const nameWithoutExt =
    lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;

  // 파일명이 비어있으면 안 됨
  if (!nameWithoutExt || nameWithoutExt.trim() === "") {
    return false;
  }

  // 100자 이내 체크
  if (nameWithoutExt.length > 100) {
    return false;
  }

  // 영문, 숫자, 특수 기호 "_-()"만 허용
  const fileNameRegex = /^[a-zA-Z0-9_\-().]+$/;
  if (!fileNameRegex.test(nameWithoutExt)) {
    return false;
  }

  return true;
};

// 행 추가 핸들러
const handleAddRow = () => {
  tableRows.value.push({
    id: nextRowId++,
    no: tableRows.value.length + 1,
    type: "",
    subType: "",
    subTypeLabel: "",
    diameter: "",
    diameterAfter: "",
    pipeType: "",
    supplierName: "",
    pipeCode: "",
    dtdxModel: "",
    remarks: "",
    subTypeOptions: [],
  });
  // 번호 재정렬
  updateRowNumbers();
};

// 행 삭제 핸들러
const handleDeleteRow = () => {
  if (selectedRows.value.length === 0) {
    alert("삭제할 행을 선택해주세요.");
    return;
  }

  const selectedIds = selectedRows.value.map((row) => row.id);
  tableRows.value = tableRows.value.filter(
    (row) => !selectedIds.includes(row.id)
  );
  selectedRows.value = [];
  // 번호 재정렬
  updateRowNumbers();
};

// 선택 항목 저장 핸들러
const handleSaveSelectedItems = async () => {
  if (tableRows.value.length === 0) {
    alert("저장할 항목이 없습니다.");
    return;
  }

  try {
    // TODO: 저장 API 호출
    console.log("저장할 항목:", tableRows.value);
    alert("저장되었습니다.");
  } catch (error) {
    console.error("저장 실패:", error);
    alert("저장에 실패했습니다.");
  }
};

// 번호 재정렬 함수
const updateRowNumbers = () => {
  tableRows.value.forEach((row, index) => {
    row.no = index + 1;
  });
};

// 선택 변경 핸들러
const handleSelectionChange = (items: TableRow[]) => {
  selectedRows.value = items;
};

const normalizeTreeNodes = (nodes: unknown[]): ManualValveTreeNode[] => {
  if (!Array.isArray(nodes)) {
    return [];
  }

  const clonedNodes = nodes.slice();

  const sortedNodes = clonedNodes.sort((a, b) => {
    const rawOrderA =
      (a as Record<string, unknown>)["code_order"] ??
      (a as Record<string, unknown>)["order"];
    const rawOrderB =
      (b as Record<string, unknown>)["code_order"] ??
      (b as Record<string, unknown>)["order"];

    const orderA =
      typeof rawOrderA === "number"
        ? rawOrderA
        : typeof rawOrderA === "string" && rawOrderA.trim() !== ""
        ? Number(rawOrderA)
        : Number.MAX_SAFE_INTEGER;

    const orderB =
      typeof rawOrderB === "number"
        ? rawOrderB
        : typeof rawOrderB === "string" && rawOrderB.trim() !== ""
        ? Number(rawOrderB)
        : Number.MAX_SAFE_INTEGER;

    if (Number.isNaN(orderA) && Number.isNaN(orderB)) {
      return 0;
    }
    if (Number.isNaN(orderA)) {
      return 1;
    }
    if (Number.isNaN(orderB)) {
      return -1;
    }
    if (orderA === orderB) {
      return 0;
    }
    return orderA - orderB;
  });

  return sortedNodes
    .map((node) => {
      if (typeof node !== "object" || node === null) {
        return null;
      }

      const rawNode = node as Record<string, unknown>;
      const childCandidates =
        rawNode["children"] ??
        rawNode["child"] ??
        rawNode["child_list"] ??
        rawNode["items"] ??
        rawNode["childrens"];

      const normalizedChildren = Array.isArray(childCandidates)
        ? normalizeTreeNodes(childCandidates)
        : [];

      const rawKey =
        rawNode["code_key"] ??
        rawNode["codeKey"] ??
        rawNode["value"] ??
        rawNode["id"];
      const rawLabel =
        rawNode["code_value"] ??
        rawNode["codeValue"] ??
        rawNode["label"] ??
        rawNode["name"] ??
        rawNode["value"];

      const codeKey =
        typeof rawKey === "string"
          ? rawKey
          : rawKey !== undefined && rawKey !== null
          ? String(rawKey)
          : "";
      const codeValue =
        typeof rawLabel === "string"
          ? rawLabel
          : rawLabel !== undefined && rawLabel !== null
          ? String(rawLabel)
          : "";

      if (!codeKey || !codeValue) {
        return null;
      }

      const rawLevel = rawNode["code_level"] ?? rawNode["level"];
      let codeLevel: number | undefined;
      if (typeof rawLevel === "number") {
        codeLevel = rawLevel;
      } else if (typeof rawLevel === "string") {
        const parsedLevel = Number(rawLevel);
        if (!Number.isNaN(parsedLevel)) {
          codeLevel = parsedLevel;
        }
      }

      const normalizedNode: ManualValveTreeNode = {
        code_key: codeKey,
        code_value: codeValue,
      };

      if (codeLevel !== undefined) {
        normalizedNode.code_level = codeLevel;
      }

      const rawOrder = rawNode["code_order"] ?? rawNode["order"];
      if (typeof rawOrder === "number") {
        normalizedNode.code_order = rawOrder;
      } else if (
        typeof rawOrder === "string" &&
        rawOrder.trim() !== "" &&
        !Number.isNaN(Number(rawOrder))
      ) {
        normalizedNode.code_order = Number(rawOrder);
      }

      if (normalizedChildren.length > 0) {
        normalizedNode.children = normalizedChildren.sort((a, b) => {
          const orderA = a.code_order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.code_order ?? Number.MAX_SAFE_INTEGER;
          if (orderA === orderB) {
            return a.code_value.localeCompare(b.code_value, "ko");
          }
          return orderA - orderB;
        });
      }

      return normalizedNode;
    })
    .filter(
      (node): node is ManualValveTreeNode => !!node && !!node.code_key && !!node.code_value
    );
};

const ensureManualValveTree = async (forceReload = false) => {
  if (!forceReload && (manualValveTreeInitialized.value || manualValveTreeLoading.value)) {
    return;
  }

  manualValveTreeLoading.value = true;
  manualValveTreeError.value = null;

  try {
    const response = await asset3DStore.fetchAsset3DCodeTree("MANUAL_VALVE", forceReload);
    const normalizedTree = normalizeTreeNodes(response || []);
    console.log("[Asset3DPreset] 수동 밸브 트리 응답:", {
      length: normalizedTree.length,
      sample: normalizedTree.slice(0, 5),
    });
    manualValveTree.value = normalizedTree;
    manualValveTreeInitialized.value = normalizedTree.length > 0;
  } catch (error: unknown) {
    console.error("수동 밸브 트리 조회 실패:", error);
    if (error && typeof error === "object" && "message" in error) {
      manualValveTreeError.value =
        String((error as { message?: string }).message) ||
        "세부유형 트리 정보를 불러오지 못했습니다.";
    } else {
      manualValveTreeError.value =
        "세부유형 트리 정보를 불러오지 못했습니다.";
    }
  } finally {
    manualValveTreeLoading.value = false;
  }
};

// 유형 변경 핸들러
const handleTypeChange = async (item: TableRow) => {
  console.log("[Asset3DPreset] 유형 변경 감지:", {
    rowId: item.id,
    previousType: item.type,
  });
  item.subType = "";
  item.subTypeLabel = "";
  item.subTypeOptions = [];
  openTreeDropdownRowId.value = null;

  if (!item.type) {
    return;
  }

  if (item.type === "P_VALV") {
    console.log("[Asset3DPreset] 수동 밸브 트리 조회 시도");
    await ensureManualValveTree();
    return;
  }

  try {
    await asset3DStore.fetchThirdDepth(item.type, 3);
    const depthItems =
      (asset3DStore.thirdDepth as CodeKeyValue[] | undefined) || [];
    console.log("[Asset3DPreset] 세부유형 API 응답:", {
      type: item.type,
      count: depthItems.length,
      itemsPreview: depthItems.slice(0, 5),
    });
    if (depthItems.length > 0) {
      item.subTypeOptions = depthItems.map((code) => ({
        value: code.code_key,
        label: code.code_value,
      }));
    }
  } catch (error) {
    console.error("세부유형 조회 실패:", error);
    item.subTypeOptions = [];
  }

  if (openTreeDropdownRowId.value === item.id) {
    closeManualValveDropdown();
  }
};

const handleStandardSubTypeChange = (item: TableRow) => {
  if (!item.subTypeOptions) {
    item.subTypeLabel = "";
    return;
  }

  const matched = item.subTypeOptions.find(
    (option) => option.value === item.subType
  );
  item.subTypeLabel = matched?.label || "";
};

const toggleTreeDropdown = async (item: TableRow, event?: MouseEvent) => {
  if (item.type !== "P_VALV") {
    closeManualValveDropdown();
    return;
  }

  const isOpen = openTreeDropdownRowId.value === item.id;
  if (isOpen) {
    closeManualValveDropdown();
    return;
  }

  await ensureManualValveTree();
  if (manualValveTreeError.value) {
    return;
  }

  activeManualValveRow.value = item;
  openTreeDropdownRowId.value = item.id;
  manualValveSelectedCode.value = item.subType || "";
  // 트리 열릴 때: 기존 선택값이 있으면 해당 경로만 펼치고, 없으면 모두 닫음
  expandManualValvePath(manualValveSelectedCode.value, true);
  const anchor = getTreeDropdownAnchorElement(event) || null;
  if (anchor) {
    treeDropdownAnchor.value = anchor;
  }
  updateTreeDropdownPosition(anchor);
};

const handleTreeSelect = (
  item: TableRow | null,
  selectedNode: ManualValveTreeNode | ManualValveTreeNodeWithDepth
) => {
  if (!item) return;

  const baseNode = selectedNode as ManualValveTreeNode;
  const hasChildren =
    Array.isArray(baseNode.children) && baseNode.children.length > 0;
  if (hasChildren) {
    handleToggleParentNode(baseNode.code_key);
    return;
  }

  const codeLevel =
    baseNode.code_level ??
    (selectedNode as ManualValveTreeNodeWithDepth).depth;

  if (codeLevel !== undefined && codeLevel !== 4) {
    alert("4레벨 코드를 선택하세요.");
    return;
  }

  item.subType = selectedNode.code_key;
  item.subTypeLabel = selectedNode.code_value;
  manualValveSelectedCode.value = selectedNode.code_key;
  expandManualValvePath(selectedNode.code_key);
  closeManualValveDropdown();
};

const handleToggleParentNode = (codeKey: string) => {
  if (!codeKey) {
    return;
  }
  const nextSet = new Set(manualValveExpandedKeys.value);
  if (nextSet.has(codeKey)) {
    nextSet.delete(codeKey);
  } else {
    nextSet.add(codeKey);
  }
  manualValveExpandedKeys.value = nextSet;
};

const isParentExpanded = (codeKey: string) =>
  manualValveExpandedKeys.value.has(codeKey);

const findPathToManualValveCode = (
  nodes: ManualValveTreeNode[],
  target: string,
  trail: string[] = []
): string[] => {
  for (const node of nodes) {
    const nextTrail = [...trail, node.code_key];
    if (node.code_key === target) {
      return nextTrail;
    }
    if (node.children && node.children.length) {
      const childPath = findPathToManualValveCode(
        node.children,
        target,
        nextTrail
      );
      if (childPath.length) {
        return childPath;
      }
    }
  }
  return [];
};

const expandManualValvePath = (codeKey: string, exclusive = false) => {
  if (!codeKey) {
    if (exclusive) {
      manualValveExpandedKeys.value = new Set();
    }
    return;
  }
  const path = findPathToManualValveCode(manualValveTree.value, codeKey);
  if (path.length <= 1) {
    if (exclusive) {
      manualValveExpandedKeys.value = new Set();
    }
    return;
  }
  // exclusive=true: 기존값이 속한 노드만 펼치고 나머지는 닫음
  const nextSet = exclusive
    ? new Set<string>()
    : new Set(manualValveExpandedKeys.value);
  path.slice(0, -1).forEach((key) => nextSet.add(key));
  manualValveExpandedKeys.value = nextSet;
};

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as Node;
  
  // 그리드용 트리 드롭다운 닫기
  const isInsideAnchor =
    treeDropdownAnchor.value?.contains(target as Node) ?? false;
  const isInsidePortal =
    treeDropdownPortalRef.value?.contains(target as Node) ?? false;

  if (!isInsideAnchor && !isInsidePortal) {
    closeManualValveDropdown();
  }
  
  // 필터용 트리 드롭다운 닫기
  const isInsideFilterAnchor =
    filterTreeDropdownAnchor.value?.contains(target as Node) ?? false;
  const isInsideFilterPortal =
    filterTreeDropdownPortalRef.value?.contains(target as Node) ?? false;
    
  if (!isInsideFilterAnchor && !isInsideFilterPortal) {
    closeFilterTreeDropdown();
  }
};

const handleViewportChange = () => {
  if (openTreeDropdownRowId.value && treeDropdownAnchor.value) {
    updateTreeDropdownPosition();
  }
  if (isFilterTreeDropdownOpen.value && filterTreeDropdownAnchor.value) {
    updateFilterTreeDropdownPosition();
  }
};

// 세부유형 조회 핸들러
const handleSubTypeSearch = (item: TableRow) => {
  // 세부유형 조회 로직
  console.log("세부유형 조회:", item);
  // TODO: 세부유형 조회 API 호출 또는 모달 열기
};

// 선택 항목 필터 검색
const handleSelectionSearch = () => {
  // 수동 밸브인 경우 세부구분(트리 선택값) 검증
  if (selectionFilter.value.pipeCategory === "P_VALV") {
    if (!selectionFilter.value.fittingType) {
      alert("세부구분을 선택해주세요.");
      return;
    }
  }
  
  console.log("자재 리스트 검색:", {
    ...selectionFilter.value,
    filterSubTypeLabel: filterSubTypeLabel.value,
    filterSelectedCode: filterSelectedCode.value,
  });
  fetchMaterialList(1);
};

// 선택 항목 필터 초기화
const handleResetSelectionFilter = () => {
  selectionFilter.value = {
    pipeCategory: "",
    fittingType: "",
    diameter: "",
    searchText: "",
  };
  filterSubTypeOptions.value = [];
  filterSubTypeLabel.value = "";
  filterSelectedCode.value = "";
  filterExpandedKeys.value = new Set();
  closeFilterTreeDropdown();
};

// 자재 리스트 그리드 초기화 함수
const resetMaterialListGrid = () => {
  materialListItems.value = [];
  selectedMaterialItems.value = [];
  materialCurrentPage.value = 1;
  materialTotalPages.value = 1;
  materialTotalItems.value = 0;
  materialListError.value = null;
};

// 필터 세부구분 변경 핸들러 (배관용)
const handleFilterSubTypeChange = () => {
  // 구분과 세부구분이 모두 선택된 경우 자동 조회
  if (isSelectionSearchEnabled.value) {
    fetchMaterialList(1);
  }
};

// 직경 입력 변경 핸들러
const handleDiameterChange = () => {
  // 구분과 세부구분이 모두 선택된 경우 자동 조회
  if (isSelectionSearchEnabled.value) {
    fetchMaterialList(1);
  }
};

// 키워드 입력 변경 핸들러
const handleKeywordChange = () => {
  // 구분과 세부구분이 모두 선택된 경우 자동 조회
  if (isSelectionSearchEnabled.value) {
    fetchMaterialList(1);
  }
};

// 필터 구분 변경 핸들러
const handleFilterCategoryChange = async () => {
  // 세부구분 초기화
  selectionFilter.value.fittingType = "";
  filterSubTypeLabel.value = "";
  filterSelectedCode.value = "";
  filterExpandedKeys.value = new Set();
  filterSubTypeOptions.value = [];
  
  // 자재 리스트 그리드 초기화
  resetMaterialListGrid();
  
  const selectedCategory = selectionFilter.value.pipeCategory;
  
  if (selectedCategory === "P_VALV") {
    // 수동 밸브 선택 시 트리 데이터 로드
    await ensureManualValveTree();
    // 수동 밸브도 자동 조회 (세부구분 없이 전체 조회)
    fetchMaterialList(1);
  } else if (selectedCategory) {
    // 수동 밸브가 아닌 다른 값 선택 시 세부구분 옵션 로드 (피팅방식)
    // parent_key는 항상 FIT_PIPE로 조회
    try {
      await asset3DStore.fetchThirdDepth("FIT_PIPE", 3);
      const depthItems = (asset3DStore.thirdDepth as CodeKeyValue[] | undefined) || [];
      console.log("[Asset3DPreset] 필터 세부구분 옵션 로드 (parent_key: FIT_PIPE):", {
        selectedCategory: selectedCategory,
        count: depthItems.length,
        items: depthItems.slice(0, 5),
      });
      if (depthItems.length > 0) {
        filterSubTypeOptions.value = depthItems.map((item: CodeKeyValue) => ({
          value: item.code_key,
          label: item.code_value,
        }));
      }
      // 구분만 선택된 경우에도 재조회 호출
      fetchMaterialList(1);
    } catch (err) {
      console.error("세부구분 옵션 로드 실패:", err);
      filterSubTypeOptions.value = [];
    }
  } else {
    filterSubTypeOptions.value = [];
  }
};

// 필터용 트리 드롭다운 토글
const toggleFilterTreeDropdown = async (event: MouseEvent) => {
  if (isFilterTreeDropdownOpen.value) {
    closeFilterTreeDropdown();
    return;
  }
  
  // 트리 데이터 로드
  await ensureManualValveTree();
  
  // 앵커 요소 저장
  const target = event.currentTarget as HTMLElement;
  filterTreeDropdownAnchor.value = target;
  
  // 위치 계산
  updateFilterTreeDropdownPosition(target);
  
  // 기존 선택값이 있으면 해당 경로만 펼치기
  if (filterSelectedCode.value) {
    expandFilterPath(filterSelectedCode.value, true);
  }
  
  isFilterTreeDropdownOpen.value = true;
};

// 필터용 트리 드롭다운 위치 업데이트
const updateFilterTreeDropdownPosition = (target?: HTMLElement | null) => {
  const anchor = target || filterTreeDropdownAnchor.value;
  if (!anchor) return;
  
  const rect = anchor.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  filterTreeDropdownPosition.value = {
    bottom: viewportHeight - rect.top,
    left: rect.left + window.scrollX,
    width: Math.max(rect.width, 300),
  };
};

// 필터용 트리 드롭다운 닫기
const closeFilterTreeDropdown = () => {
  isFilterTreeDropdownOpen.value = false;
  filterTreeDropdownAnchor.value = null;
};

// 필터용 트리 노드 선택
const handleFilterTreeSelect = (node: ManualValveTreeNode) => {
  // 자녀노드가 있으면 펼치기/접기
  if (node.children && node.children.length > 0) {
    handleFilterToggleParentNode(node.code_key);
    return;
  }
  
  // 4레벨 코드인지 확인
  const codeLevel = node.code_level;
  if (codeLevel !== undefined && codeLevel !== 4) {
    alert("4레벨 코드를 선택하세요.");
    return;
  }
  
  selectionFilter.value.fittingType = node.code_key;
  filterSubTypeLabel.value = node.code_value;
  filterSelectedCode.value = node.code_key;
  expandFilterPath(node.code_key);
  closeFilterTreeDropdown();
  
  // 구분과 세부구분이 모두 선택된 경우 자동 조회
  if (selectionFilter.value.pipeCategory && filterSelectedCode.value) {
    fetchMaterialList(1);
  }
};

// 필터용 부모 노드 토글
const handleFilterToggleParentNode = (codeKey: string) => {
  if (!codeKey) return;
  const nextSet = new Set(filterExpandedKeys.value);
  if (nextSet.has(codeKey)) {
    nextSet.delete(codeKey);
  } else {
    nextSet.add(codeKey);
  }
  filterExpandedKeys.value = nextSet;
};

// 필터용 부모 노드 펼침 여부
const isFilterParentExpanded = (codeKey: string) =>
  filterExpandedKeys.value.has(codeKey);

// 필터용 경로 펼치기
const expandFilterPath = (codeKey: string, exclusive = false) => {
  if (!codeKey) {
    if (exclusive) {
      filterExpandedKeys.value = new Set();
    }
    return;
  }
  const path = findPathToManualValveCode(manualValveTree.value, codeKey);
  if (path.length <= 1) {
    if (exclusive) {
      filterExpandedKeys.value = new Set();
    }
    return;
  }
  const nextSet = exclusive
    ? new Set<string>()
    : new Set(filterExpandedKeys.value);
  path.slice(0, -1).forEach((key) => nextSet.add(key));
  filterExpandedKeys.value = nextSet;
};

// 선택 항목 추가
const handleAddSelection = () => {
  // 샘플 데이터 추가 (실제로는 선택된 데이터를 추가)
  const newItem: SelectionItem = {
    id: nextSelectionId++,
    pipeCategory: selectionFilter.value.pipeCategory || "배관",
    fittingType: selectionFilter.value.fittingType || "FIT_SELBOW",
    diameter: selectionFilter.value.diameter || "80",
    diameterAfter: "",
    pipeType: "KSD3576_STS304",
    code: `KSD3576_STS304_VM_0000_80_90_10_FIT_SELBOW_J_WELD`,
    cellName: "",
  };
  selectedSelectionItems.value.push(newItem);
};

// 선택 항목 삭제
const handleDeleteSelectionItem = (id: number) => {
  selectedSelectionItems.value = selectedSelectionItems.value.filter(
    (item) => item.id !== id
  );
};

// 자재 리스트 조회 (카탈로그 API 호출)
const fetchMaterialList = async (page = 1) => {
  materialListLoading.value = true;
  materialListError.value = null;
  
  try {
    // 카탈로그 API 요청 파라미터 구성
    const requestData: Record<string, unknown> = {
      order_by: "equipment_code",
      include_vendor: true,
      page: page,
      page_size: materialPageSize.value,
    };
    
    // 구분(root_equipment_type) 설정 - Pipe.vue 방식 적용
    if (selectionFilter.value.pipeCategory) {
      requestData.root_equipment_type = selectionFilter.value.pipeCategory;
    }
    
    // 세부구분(equipment_type) 설정
    if (selectionFilter.value.pipeCategory === "P_VALV") {
      // 수동 밸브: filterSelectedCode (트리에서 선택한 4레벨 코드)가 있으면 해당 값으로 검색
      const equipmentType = filterSelectedCode.value || "";
      if (equipmentType) {
        requestData.search_field = "equipment_type";
        requestData.search_value = equipmentType;
      }
    } else if (selectionFilter.value.fittingType) {
      // 다른 구분에서 세부구분이 선택된 경우
      requestData.search_field = "equipment_type";
      requestData.search_value = selectionFilter.value.fittingType;
    }
    
    // 키워드 입력 시 keyword 파라미터 추가
    if (selectionFilter.value.searchText && selectionFilter.value.searchText.trim()) {
      requestData.keyword = selectionFilter.value.searchText.trim();
    }
    
    console.log("[Asset3DPreset] 카탈로그 API 요청 데이터:", requestData);
    
    // 카탈로그 API 호출
    const response = await request("/api/asset3D/catalog/search", undefined, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    
    console.log("[Asset3DPreset] 카탈로그 API 응답:", response);
    
    if (response && response.success && response.response && response.response.items) {
      // API 응답 데이터를 MaterialListItem 형식으로 변환
      const items = response.response.items;
      console.log("[Asset3DPreset] 조회된 항목 수:", items.length);
      
      materialListItems.value = items.map((item: Record<string, unknown>, index: number) => {
        const searchCriteria = item.search_criteria as Record<string, unknown> | undefined;
        
        // search_criteria.diaa_phi_mm 또는 dia_phi_mm 에서 직경 값 추출
        let diameterValue = "";
        if (searchCriteria) {
          if (searchCriteria.diaa_phi_mm) {
            const diaaPhiMm = searchCriteria.diaa_phi_mm as Record<string, unknown>;
            const value = diaaPhiMm.value;
            const unitCode = diaaPhiMm.unit_code || "";
            if (value !== undefined && value !== null) {
              diameterValue = `${value}${unitCode ? " " + unitCode : ""}`;
            }
          } else if (searchCriteria.dia_phi_mm) {
            const diaPhiMm = searchCriteria.dia_phi_mm as Record<string, unknown>;
            const value = diaPhiMm.value;
            const unitCode = diaPhiMm.unit_code || "";
            if (value !== undefined && value !== null) {
              diameterValue = `${value}${unitCode ? " " + unitCode : ""}`;
            }
          }
        }
        
        // search_criteria.diab_phi_mm 에서 직경후 값 추출
        let diameterAfterValue = "";
        if (searchCriteria && searchCriteria.diab_phi_mm) {
          const diabPhiMm = searchCriteria.diab_phi_mm as Record<string, unknown>;
          const value = diabPhiMm.value;
          const unitCode = diabPhiMm.unit_code || "";
          if (value !== undefined && value !== null) {
            diameterAfterValue = `${value}${unitCode ? " " + unitCode : ""}`;
          }
        }
        
        // search_criteria.fitting 또는 fitting_NONE 에서 피팅방식 값 추출
        let fittingValue = "";
        if (searchCriteria) {
          if (searchCriteria.fitting) {
            const fitting = searchCriteria.fitting as Record<string, unknown>;
            if (fitting.value !== undefined && fitting.value !== null) {
              fittingValue = String(fitting.value);
            }
          } else if (searchCriteria.fitting_NONE) {
            const fittingNone = searchCriteria.fitting_NONE as Record<string, unknown>;
            if (fittingNone.value !== undefined && fittingNone.value !== null) {
              fittingValue = String(fittingNone.value);
            }
          }
        }
        
        // thumbnail_file_info.file_name 에서 썸네일 파일명 추출
        let thumbnailFileName = "";
        const thumbnailFileInfo = item.thumbnail_file_info as Record<string, unknown> | undefined;
        if (thumbnailFileInfo && thumbnailFileInfo.file_name) {
          thumbnailFileName = String(thumbnailFileInfo.file_name);
        }
        
        return {
          id: item.equipment_id || index + 1,
          pipeCategory: getTypeLabel(selectionFilter.value.pipeCategory) || "",
          fittingType: fittingValue || "",
          diameter: diameterValue || String(item.diameter || ""),
          diameterAfter: diameterAfterValue || String(item.diameter_after || ""),
          pipeType: String(item.equipment_type || ""),
          code: String(item.equipment_code || ""),
          cellName: thumbnailFileName || String(item.cell_name || ""),
          // 원본 데이터 보존
          ...item,
        };
      });
      
      materialCurrentPage.value = response.response.page || 1;
      materialTotalPages.value = response.response.total_pages || 1;
      materialTotalItems.value = response.response.total || items.length;
    } else {
      console.warn("[Asset3DPreset] 카탈로그 검색 결과가 없습니다.");
      materialListItems.value = [];
      materialCurrentPage.value = 1;
      materialTotalPages.value = 1;
      materialTotalItems.value = 0;
    }
    
  } catch (error) {
    console.error("자재 리스트 조회 실패:", error);
    materialListError.value = "자재 리스트를 불러오는데 실패했습니다.";
    materialListItems.value = [];
  } finally {
    materialListLoading.value = false;
  }
};

// 자재 리스트 선택 변경 핸들러
const handleMaterialSelectionChange = (items: MaterialListItem[]) => {
  selectedMaterialItems.value = items;
};

// 자재 리스트 페이지 변경 핸들러
const handleMaterialPageChange = (page: number) => {
  console.log("[Asset3DPreset] 페이지 변경:", page);
  materialCurrentPage.value = page;
  fetchMaterialList(page);
};

// 디버깅용 equipment_type 검색 핸들러
const handleDebugSearch = async () => {
  if (!debugEquipmentType.value.trim()) {
    alert("equipment_type을 입력하세요.");
    return;
  }
  
  materialListLoading.value = true;
  materialListError.value = null;
  
  try {
    const requestData = {
      search_field: "equipment_type",
      search_value: debugEquipmentType.value.trim(),
      order_by: "equipment_code",
      include_vendor: true,
      page: 1,
      page_size: materialPageSize.value,
    };
    
    console.log("[Asset3DPreset] 디버그 검색 요청:", requestData);
    
    const response = await request("/api/asset3D/catalog/search", undefined, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });
    
    console.log("[Asset3DPreset] 디버그 검색 응답:", response);
    
    if (response && response.success && response.response && response.response.items) {
      const items = response.response.items;
      
      materialListItems.value = items.map((item: Record<string, unknown>, index: number) => {
        const searchCriteria = item.search_criteria as Record<string, unknown> | undefined;
        
        let diameterValue = "";
        if (searchCriteria) {
          if (searchCriteria.diaa_phi_mm) {
            const diaaPhiMm = searchCriteria.diaa_phi_mm as Record<string, unknown>;
            if (diaaPhiMm.value !== undefined && diaaPhiMm.value !== null) {
              diameterValue = `${diaaPhiMm.value}${diaaPhiMm.unit_code ? " " + diaaPhiMm.unit_code : ""}`;
            }
          } else if (searchCriteria.dia_phi_mm) {
            const diaPhiMm = searchCriteria.dia_phi_mm as Record<string, unknown>;
            if (diaPhiMm.value !== undefined && diaPhiMm.value !== null) {
              diameterValue = `${diaPhiMm.value}${diaPhiMm.unit_code ? " " + diaPhiMm.unit_code : ""}`;
            }
          }
        }
        
        let diameterAfterValue = "";
        if (searchCriteria && searchCriteria.diab_phi_mm) {
          const diabPhiMm = searchCriteria.diab_phi_mm as Record<string, unknown>;
          if (diabPhiMm.value !== undefined && diabPhiMm.value !== null) {
            diameterAfterValue = `${diabPhiMm.value}${diabPhiMm.unit_code ? " " + diabPhiMm.unit_code : ""}`;
          }
        }
        
        let fittingValue = "";
        if (searchCriteria) {
          if (searchCriteria.fitting) {
            const fitting = searchCriteria.fitting as Record<string, unknown>;
            if (fitting.value !== undefined && fitting.value !== null) {
              fittingValue = String(fitting.value);
            }
          } else if (searchCriteria.fitting_NONE) {
            const fittingNone = searchCriteria.fitting_NONE as Record<string, unknown>;
            if (fittingNone.value !== undefined && fittingNone.value !== null) {
              fittingValue = String(fittingNone.value);
            }
          }
        }
        
        // thumbnail_file_info.file_name 에서 썸네일 파일명 추출
        let thumbnailFileName = "";
        const thumbnailFileInfo = item.thumbnail_file_info as Record<string, unknown> | undefined;
        if (thumbnailFileInfo && thumbnailFileInfo.file_name) {
          thumbnailFileName = String(thumbnailFileInfo.file_name);
        }
        
        return {
          id: item.equipment_id || index + 1,
          pipeCategory: debugEquipmentType.value,
          fittingType: fittingValue || "",
          diameter: diameterValue || String(item.diameter || ""),
          diameterAfter: diameterAfterValue || String(item.diameter_after || ""),
          pipeType: String(item.equipment_type || ""),
          code: String(item.equipment_code || ""),
          cellName: thumbnailFileName || String(item.cell_name || ""),
          ...item,
        };
      });
      
      materialCurrentPage.value = response.response.page || 1;
      materialTotalPages.value = response.response.total_pages || 1;
      materialTotalItems.value = response.response.total || items.length;
    } else {
      materialListItems.value = [];
      materialCurrentPage.value = 1;
      materialTotalPages.value = 1;
      materialTotalItems.value = 0;
    }
  } catch (error) {
    console.error("디버그 검색 실패:", error);
    materialListError.value = "검색에 실패했습니다.";
    materialListItems.value = [];
  } finally {
    materialListLoading.value = false;
  }
};

// 자재 리스트 항목 삭제 핸들러
const handleDeleteMaterialItem = (id: string | number) => {
  materialListItems.value = materialListItems.value.filter(
    (item) => item.id !== id
  );
  // 선택 목록에서도 제거
  selectedMaterialItems.value = selectedMaterialItems.value.filter(
    (item) => item.id !== id
  );
};

onMounted(async () => {
  resetManualValveTreeState();
  try {
    await asset3DStore.fetchCommonCodes("");
    // 배관 대분류 옵션 로드 (Pipe.vue 참조)
    await pipeStore.fetchCommonCodes("PIPE_S");
  } catch (error) {
    console.error("공통코드 조회 실패:", error);
  }

  document.addEventListener("click", handleGlobalClick);
  window.addEventListener("scroll", handleViewportChange, true);
  window.addEventListener("resize", handleViewportChange);
});

onActivated(() => {
  resetManualValveTreeState();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleGlobalClick);
  window.removeEventListener("scroll", handleViewportChange, true);
  window.removeEventListener("resize", handleViewportChange);
});

// 썸네일 등록 핸들러
const handleThumbnailRegister = async () => {
  if (!thumbnailFile.value) {
    alert("썸네일 파일을 선택해주세요.");
    return;
  }

  try {
    // TODO: 썸네일 업로드 API 호출
    // await asset3DStore.uploadThumbnail(thumbnailFile.value);
    alert("썸네일이 등록되었습니다.");
    // 등록 성공 후 파일 초기화
    thumbnailFileName.value = "";
    thumbnailFile.value = null;
    thumbnailPreviewUrl.value = "";
    if (thumbnailFileInput.value) {
      thumbnailFileInput.value.value = "";
    }
  } catch (error) {
    console.error("썸네일 등록 실패:", error);
    alert("썸네일 등록에 실패했습니다.");
  }
};
</script>

<style scoped lang="scss">
.asset3d-preset-register-tab {
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
  background: #f7f9fc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  flex-wrap: nowrap;

  // 모바일 크기에서 줄바꿈 허용
  @media (max-width: 768px) {
  flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
  }
}

.register-form {
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex-shrink: 0;

  // 단위, 연결기계는 고정 폭
  &:nth-child(1),
  &:nth-child(2) {
    width: 150px;
  }

  // 프리셋 명과 썸네일 업로드는 동일한 폭
  &:nth-child(3),
  &:nth-child(4) {
  flex: 1;
    min-width: 250px;
    max-width: 350px;
  }

  // 등록 버튼은 우측 정렬
  &.right-align {
    justify-content: flex-start;
    align-items: flex-start;
    flex: 0 0 auto;
    margin-left: auto;
    padding-top: 26px; // label(13px) + gap(6px) + 컨트롤 높이(32px) - 등록 버튼 높이(32px) = 19px, 하지만 정확히 맞추기 위해 26px
  }
}

label {
  font-size: 13px;
  color: #475467;
  font-weight: 500;

  &.required::after {
    content: "*";
    color: #e74c3c;
    margin-left: 2px;
  }
}

.form-select {
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0 8px;
  background: #fff;
  font-size: 14px;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.form-input {
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0 8px;
  background: #fff;
  font-size: 14px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &.file-name-input {
    background-color: #f9fafb;
    cursor: default;
  }
}

.file-upload-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.file-upload-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-width: 0;

  .form-input {
    flex: 1;
    min-width: 0;
  }
}

.thumbnail-preview {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border: 1px solid #d0d5dd;
  border-radius: 4px;
  flex-shrink: 0;
}

.btn-ellipsis {
  width: 32px;
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background: #f9fafb;
    border-color: #98a2b3;
  }
}

.btn-register {
  height: 32px;
  padding: 0 24px;
  border: none;
  border-radius: 6px;
  background: #222e77;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #1a2561;
  }

  &:active {
    background: #141b4a;
  }
}

.btn-add-row,
.btn-delete-row {
  height: 32px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: #222e77;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #1a2561;
  }

  &:active {
    background: #141b4a;
  }
}

.btn-delete-row {
  background: #e74c3c;

  &:hover {
    background: #c0392b;
  }

  &:active {
    background: #a93226;
  }
}

.btn-save {
  height: 32px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: #222e77;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #1a2561;
  }

  &:active {
    background: #141b4a;
  }
}

.table-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  margin-top: 20px;

  .table-title {
    font-size: 15px;
    font-weight: 600;
    color: #344054;
    margin: 0;
  }

  .button-group {
    display: flex;
    gap: 8px;
  }
}

.table-section {
  margin-top: 0;
  width: 100%;
  overflow-x: hidden;

  :deep(.data-table) {
    width: 100%;
    table-layout: fixed;
  }

  :deep(.data-table th),
  :deep(.data-table td) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :deep(.data-table th.checkbox-cell),
  :deep(.data-table td.checkbox-cell) {
    text-overflow: clip;
    overflow: visible;
  }
}

.table-select,
.table-input {
  width: 100%;
  height: 28px;
  border: 1px solid #d0d5dd;
  border-radius: 4px;
  padding: 0 6px;
  background: #fff;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.table-select {
  cursor: pointer;
}

.table-text {
  display: block;
  width: 100%;
  padding: 0 6px;
  font-size: 13px;
  line-height: 28px;
  color: #344054;
}

.subtype-cell-wrapper {
  display: flex;
  gap: 4px;
  align-items: center;
  width: 100%;
}

.tree-select-wrapper {
  position: relative;
  align-items: stretch;

  .tree-select-display {
    flex: 1;
    border: 1px solid #d0d5dd;
    border-radius: 4px;
    padding: 4px 8px;
    background: #fff;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;

    &.open {
      border-color: #3b82f6;
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
    }

    .arrow {
      font-size: 10px;
      color: #667085;
      margin-left: 8px;
    }
  }
}

.tree-dropdown-portal {
  position: fixed;
  z-index: 2000;
  pointer-events: none;
}

.tree-dropdown-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 6px;
  box-shadow: 0 -12px 24px rgba(15, 23, 42, 0.2);
  padding: 8px 0;
  pointer-events: auto;
}

.tree-dropdown-state {
  padding: 8px 12px;
  font-size: 13px;
  color: #475467;

  &.error {
    color: #e74c3c;
  }
}

.tree-node-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-node-label {
  padding: 4px 0;
}

.tree-node-row {
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  color: #344054;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #f3f4f6;
  }

  &.is-selected {
    background: #e0e7ff;
    color: #1d4ed8;
    font-weight: 600;
  }

  &.warning {
    background: #fff7ed;
    color: #b45309;

    &:hover {
      background: #ffedd5;
    }
  }

  &.child {
    padding-left: 24px;
  }
}

.tree-node-row .node-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.tree-node-toggle {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #475467;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1d4ed8;
  }
}

.tree-node-row .badge {
  font-size: 11px;
  color: #475467;
  background: #f2f4f7;
  border-radius: 999px;
  padding: 2px 6px;
  line-height: 1.4;
}
.btn-search-subtype {
  padding: 8px 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.btn-search-icon {
    padding: 6px 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    .search-icon {
      display: inline-block;
      width: 18px;
      height: 18px;
      background: url("@/assets/images/common/ico_search.svg") no-repeat center center;
      background-size: contain;
      filter: brightness(0) invert(1);
    }
  }
}

// 유형과 세부유형 컬럼 헤더 및 셀 중앙정렬
:deep(.data-table) {
  thead th:nth-of-type(3),
  thead th:nth-of-type(4),
  tbody td:nth-of-type(3),
  tbody td:nth-of-type(4) {
    text-align: center;
  }
}

// 선택 항목 섹션
.selection-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e9f2;
}

.selection-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 16px;
  background: #f7f9fc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 14px;

  .filter-group {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
    flex: 1;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    label {
      font-size: 12px;
      color: #475467;
      font-weight: 500;
    }

    .form-select,
    .form-input {
      height: 32px;
      min-width: 160px;
    }

    &.subtype-filter-item {
      min-width: 280px;

      .filter-tree-select-wrapper {
        position: relative;

        .tree-select-display {
          height: 32px;
          border: 1px solid #d0d5dd;
          border-radius: 6px;
          padding: 0 12px;
          background: #fff;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          min-width: 240px;

          &.open {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
          }

          .arrow {
            font-size: 10px;
            color: #667085;
            margin-left: 8px;
          }
        }
      }
      
      .form-select {
        min-width: 240px;
      }
    }
    
    &.diameter-filter-item {
      min-width: 140px;
      
      .form-input {
        min-width: 120px;
      }
    }

    &.search-item {
      flex: 2;
      min-width: 400px;

      .search-input-wrapper {
        display: flex;
        gap: 4px;
        align-items: center;
        width: 100%;

        .form-input {
          flex: 1;
          width: 100%;
          min-width: 0;
        }

        .btn-search-icon {
          padding: 6px 10px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #007bff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          flex-shrink: 0;

          &:hover:not(:disabled) {
            background: #0056b3;
          }
          
          &:disabled {
            background: #ccc;
            cursor: not-allowed;
            opacity: 0.6;
            
            .search-icon {
              filter: brightness(0) invert(0.7);
            }
          }

          .search-icon {
            display: inline-block;
            width: 18px;
            height: 18px;
            background: url("@/assets/images/common/ico_search.svg") no-repeat center center;
            background-size: contain;
            filter: brightness(0) invert(1);
          }
        }
      }
    }
  }

  .button-group {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
}

.btn-reset,
.btn-toggle-all {
  height: 32px;
  padding: 0 16px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  background: #fff;
  color: #344054;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #f9fafb;
    border-color: #98a2b3;
  }
}

.btn-add-selection {
  height: 32px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: #222e77;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #1a2561;
  }
}

.selection-table-section {
  margin-top: 16px;

  .material-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #344054;
    margin: 0;
  }
  
  .debug-search {
    display: flex;
    gap: 8px;
    align-items: center;
    
    .debug-input {
      width: 200px;
      height: 32px;
      padding: 0 10px;
      border: 1px solid #d0d5dd;
      border-radius: 4px;
      font-size: 13px;
      
      &::placeholder {
        color: #98a2b3;
      }
    }
    
    .btn-debug-search {
      padding: 6px 12px;
      height: 32px;
      background: #6c757d;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      
      &:hover {
        background: #5a6268;
      }
    }
  }
}

.loading-message,
.error-message,
.no-data-message {
  padding: 20px;
  text-align: center;
  color: #475467;
  font-size: 14px;
}

.error-message {
  color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 4px;
}

.no-data-message {
  color: #98a2b3;
  font-style: italic;
  line-height: 1.6;
}

.material-table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
  width: 100%;
  max-width: 100%;

  :deep(.data-table-container) {
    overflow-x: visible;
    overflow-y: visible;
    width: 100%;
  }

  :deep(.data-table) {
    width: 100%;
    min-width: 100%;
    table-layout: fixed;

    td {
      font-size: 13px;
      white-space: nowrap;
      padding: 8px 10px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    th {
      white-space: nowrap;
      text-align: center;
      font-size: 13px;
      padding: 10px 8px;
      min-width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.material-pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 16px 0;
  border-top: 1px solid #e5e9f2;

  .pagination-info {
    font-size: 13px;
    color: #475467;
  }
}

.selection-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e9f2;
  font-size: 13px;

  thead {
    background: #f7f9fc;

    th {
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      color: #475467;
      border-bottom: 1px solid #e5e9f2;
      white-space: nowrap;
    }
  }

  tbody {
    tr {
      &:hover {
        background: #f9fafb;
      }
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e9f2;
      color: #344054;
    }

    .empty-row {
      text-align: center;
      color: #98a2b3;
      padding: 24px 12px;
    }
  }

  .col-no {
    width: 40px;
    text-align: center;
  }

  .col-pipe-category {
    width: 80px;
  }

  .col-fitting-type {
    width: 120px;
  }

  .col-diameter {
    width: 60px;
    text-align: center;
  }

  .col-diameter-after {
    width: 60px;
    text-align: center;
  }

  .col-pipe-type {
    width: 140px;
  }

  .col-code {
    min-width: 300px;
  }

  .col-cell-name {
    width: 100px;
  }

  .col-delete {
    width: 60px;
    text-align: center;
  }
}

.btn-delete-item {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: #e74c3c;
  color: white;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: #c0392b;
  }
}
</style>
