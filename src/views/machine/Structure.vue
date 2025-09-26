<template>
  <div class="structure-page">
    <!-- 검색 및 필터 바 -->
    <div class="search-filter-bar">
      <div class="filter-group">
        <div class="filter-item">
          <label for="structureType">구조물 대분류</label>
          <select
            id="structureType"
            v-model="selectedStructureType"
            class="form-select"
            @change="handleStructureTypeChange"
          >
            <option value="">{{ t("common.all") }}</option>
            <option
              v-for="type in structureStore.secondDepth"
              :key="type.code_id"
              :value="type.code_key"
            >
              {{ type.code_value }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label for="structureTypeDetail">{{
            t("columns.machine.structureTypeDetail")
          }}</label>
          <select
            id="structureTypeDetail"
            v-model="selectedStructureTypeDetail"
            class="form-select"
          >
            <option value="">{{ t("common.select") }}</option>
            <option
              v-for="form in structureStore.thirdDepth"
              :key="form.code_id"
              :value="form.code_key"
            >
              {{ form.code_value }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label for="unit">{{ t("common.unit") }}</label>
          <select id="unit" v-model="selectedUnit" class="form-select">
            <option value="">{{ t("common.select") }}</option>
            <option
              v-for="unit in structureStore.unitSystems"
              :key="unit.unit_system_id"
              :value="unit.system_code"
            >
              {{ unit.system_name }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <button class="btn-search" @click="handleSearch">
            {{ t("common.search") }}
          </button>
        </div>
      </div>
    </div>

    <!-- 구조물 리스트 헤더 -->
    <div class="structure-list-header">
      <h2>{{ t("common.structureList") }}</h2>
      <div class="action-buttons">
        <button class="btn btn-primary btn-register" @click="openRegistModal">
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
      :data="paginatedStructureList"
      :loading="loading"
      :selectable="true"
      :selected-items="selectedItems"
      :selection-mode="'single'"
      :show-select-all="false"
      :select-header-text="t('common.selectColumn')"
      :row-key="'structure_id'"
      @selection-change="handleSelectionChange"
    >
      <!-- 순번 슬롯 -->
      <template #cell-no="{ index }">
        {{ (currentPage - 1) * pageSize + index + 1 }}
      </template>

      <!-- 계산식 파일 다운로드 슬롯 -->
      <template #cell-formula_file_name="{ item }">
        <span
          v-if="item.formula?.file_uri && item.formula?.has_file"
          class="download-link"
          @click="downloadFile(item.formula.file_uri, item.formula_file_name)"
        >
          {{ item.formula_file_name }}
        </span>
        <span v-else>{{ item.formula_file_name }}</span>
      </template>

      <!-- 3D 모델 파일 다운로드 슬롯 -->
      <template #cell-dtdx_model_file_name="{ item }">
        <span
          v-if="item.dtdx_model?.file_uri && item.dtdx_model?.has_file"
          class="download-link"
          @click="
            downloadFile(item.dtdx_model.file_uri, item.dtdx_model_file_name)
          "
        >
          {{ item.dtdx_model_file_name }}
        </span>
        <span v-else>{{ item.dtdx_model_file_name }}</span>
      </template>

      <!-- REVIT 모델 파일 다운로드 슬롯 -->
      <template #cell-rvt_model_file_name="{ item }">
        <span
          v-if="item.rvt_model?.file_uri && item.rvt_model?.has_file"
          class="download-link"
          @click="
            downloadFile(item.rvt_model.file_uri, item.rvt_model_file_name)
          "
        >
          {{ item.rvt_model_file_name }}
        </span>
        <span v-else>{{ item.rvt_model_file_name }}</span>
      </template>

      <!-- 생성일자 포맷팅 슬롯 -->
      <template #cell-created_at="{ value }">
        {{ formatDate(value) }}
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
          <template v-if="!isEditMode">
            <StructureRegisterTab ref="registerTabRef" />
          </template>
          <template v-else>
            <StructureUpdateTab
              ref="updateTabRef"
              :selected-item="
                selectedItems.length > 0 ? selectedItems[0] : undefined
              "
            />
          </template>
        </div>
        <div class="modal-footer">
          <button
            v-if="!isEditMode"
            class="btn btn-primary"
            @click="onChildRegister"
          >
            {{ t("common.register") }}
          </button>
          <button v-else class="btn btn-primary" @click="onChildUpdate">
            {{ t("common.edit") }}
          </button>
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
import StructureRegisterTab from "./components/StructureRegisterTab.vue";
import StructureUpdateTab from "./components/StructureUpdateTab.vue";
import { useI18n } from "vue-i18n";
import { useStructureStore } from "@/stores/structureStore";

const { t } = useI18n();
const structureStore = useStructureStore();
const registerTabRef = ref<InstanceType<typeof StructureRegisterTab> | null>(
  null
);
const updateTabRef = ref<InstanceType<typeof StructureUpdateTab> | null>(null);

// 모달 컴포넌트는 일반 컴포넌트로 변경됨

interface StructureItem {
  structure_id: string;
  structure_name: string;
  structure_type: string;
  unit_system_code: string;
  formula_file_name: string;
  dtdx_model_file_name: string;
  rvt_model_file_name: string;
  thumbnail_file_name: string;
  created_at: string;
  description: string;
  // 원본 중첩 객체들 (필요시 사용)
  formula?: {
    file_name: string;
    formula_name: string;
    has_file: boolean;
    file_uri?: string;
    formula_id?: string;
  };
  dtdx_model?: {
    file_name: string;
    has_file: boolean;
    file_uri?: string;
    model_file_id?: string;
  };
  rvt_model?: {
    file_name: string;
    has_file: boolean;
    file_uri?: string;
    model_file_id?: string;
  };
  thumbnail?: {
    file_name: string;
    has_file: boolean;
    file_uri?: string;
    symbol_id?: string;
  };
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
    key: "structure_type",
    title: t("columns.machine.structureType"),
    width: "140px",
    sortable: false,
  },
  {
    key: "unit_system_code",
    title: t("common.unit"),
    width: "100px",
    sortable: false,
  },
  {
    key: "formula_file_name",
    title: t("columns.machine.formula"),
    width: "120px",
    sortable: false,
  },
  {
    key: "dtdx_model_file_name",
    title: t("columns.machine.model3d"),
    width: "160px",
    sortable: false,
  },
  {
    key: "rvt_model_file_name",
    title: t("columns.machine.revitModel"),
    width: "140px",
    sortable: false,
  },
  {
    key: "created_at",
    title: t("common.creationDate"),
    width: "120px",
    sortable: false,
  },
  {
    key: "description",
    title: t("columns.machine.remarks"),
    width: "140px",
    sortable: false,
  },
];

const structureList = ref<StructureItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedItems = ref<StructureItem[]>([]);
const selectedUnit = ref("");
const selectedStructureType = ref("");
const selectedStructureTypeDetail = ref("");
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newStructure = ref<RegistForm>({
  name: "",
  code: "",
  type: "",
  description: "",
});

const totalPagesComputed = computed(
  () => (structureStore.searchResults as any)?.total_pages || 1
);

const paginatedStructureList = computed(() => {
  return structureList.value; // API에서 이미 페이징된 데이터를 받아옴
});

// (기존 단일 등록 폼 유효성 제거)

const handleSelectionChange = (selected: StructureItem[]) => {
  selectedItems.value = selected;
};

// 페이지 변경 (Machine.vue 패턴 적용)
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  selectedItems.value = []; // 체크된 row 초기화
  await loadData();
};

// 검색 처리 (Machine.vue 패턴 적용)
const handleSearch = async () => {
  selectedItems.value = []; // 체크된 row 초기화
  currentPage.value = 1;
  await loadData();
};

const openRegistModal = () => {
  isEditMode.value = false;
  newStructure.value = {
    name: "",
    code: "",
    type: "",
    description: "",
  };
  isRegistModalOpen.value = true;
};

const closeRegistModal = async () => {
  isRegistModalOpen.value = false;
  isEditMode.value = false;
  // 모달 닫을 때 데이터 새로고침
  await loadData();
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
  newStructure.value = {
    name: selectedItems.value[0].structure_name,
    code: selectedItems.value[0].structure_type,
    type: selectedItems.value[0].structure_type,
    description: selectedItems.value[0].description,
  };
  isRegistModalOpen.value = true;
};

const handleDelete = async () => {
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  const selectedItem = selectedItems.value[0];
  const structureName = selectedItem.structure_name;

  if (
    confirm(
      `구조물 "${structureName}"을(를) 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
    )
  ) {
    try {
      // 삭제할 파일 ID들 수집
      const deleteParams: {
        dtdx_model_file_id?: string;
        formula_id?: string;
        rvt_model_file_id?: string;
        thumbnail_symbol_id?: string;
      } = {};

      // 각 파일의 ID가 있으면 추가
      if (selectedItem.dtdx_model?.model_file_id) {
        deleteParams.dtdx_model_file_id = selectedItem.dtdx_model.model_file_id;
      }

      if (selectedItem.formula?.formula_id) {
        deleteParams.formula_id = selectedItem.formula.formula_id;
      }

      if (selectedItem.rvt_model?.model_file_id) {
        deleteParams.rvt_model_file_id = selectedItem.rvt_model.model_file_id;
      }

      if (selectedItem.thumbnail?.symbol_id) {
        deleteParams.thumbnail_symbol_id = selectedItem.thumbnail.symbol_id;
      }

      // API 호출
      await structureStore.deleteStructure(
        selectedItem.structure_id,
        deleteParams
      );

      // 성공 시 로컬 데이터에서 제거
      structureList.value = structureList.value.filter(
        (item) => item.structure_id !== selectedItem.structure_id
      );
      selectedItems.value = [];

      alert("구조물이 성공적으로 삭제되었습니다.");

      // 데이터 새로고침
      await loadData();
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("구조물 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  }
};

const onChildRegister = async () => {
  try {
    await registerTabRef.value?.onRegister?.();
    // 등록 완료 후 데이터 새로고침
    await loadData();
  } catch (error) {
    console.error("등록 중 오류 발생:", error);
  }
};

const onChildUpdate = async () => {
  try {
    await updateTabRef.value?.onUpdate?.();
    // 수정 완료 후 데이터 새로고침 및 모달 닫기
    await loadData();
    await closeRegistModal();
  } catch (error) {
    console.error("수정 중 오류 발생:", error);
  }
};

// 파일 다운로드 함수
const downloadFile = (fileUri: string, fileName: string) => {
  if (!fileUri) {
    alert("다운로드할 파일이 없습니다.");
    return;
  }

  // API 서버 URL과 file_uri를 조합하여 다운로드 URL 생성
  const downloadUrl = `${import.meta.env.VITE_API_BASE_URL}/${fileUri}`;

  // 새 창에서 다운로드 실행
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = fileName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD 형식
  } catch (error) {
    console.error("날짜 포맷팅 오류:", error);
    return dateString; // 원본 문자열 반환
  }
};

// 편집 로직 제거됨

// 데이터 로드 함수
const loadData = async () => {
  try {
    // 체크된 row 초기화
    selectedItems.value = [];

    // API 호출로 구조물 검색 리스트 조회
    await structureStore.fetchSearchList({
      search_field: "",
      search_value: "",
      page: currentPage.value,
      page_size: pageSize.value,
      root_structure_type: selectedStructureType.value,
      structure_type: selectedStructureTypeDetail.value,
      unit: selectedUnit.value,
    });

    // API 응답 데이터를 structureList에 설정
    if ((structureStore.searchResults as any)?.items) {
      const apiData = (structureStore.searchResults as any).items;
      structureList.value = apiData.map((item: any) => ({
        structure_id: item.structure_id,
        structure_name: item.structure_name,
        structure_type: item.structure_type,
        unit_system_code: item.unit_system_code,
        formula_file_name: item.formula?.file_name || "-",
        dtdx_model_file_name: item.dtdx_model?.file_name || "-",
        rvt_model_file_name: item.rvt_model?.file_name || "-",
        thumbnail_file_name: item.thumbnail?.symbol_name || "-",
        created_at: item.created_at,
        description: item.description || "-",
        // 원본 데이터도 유지 (필요시 사용)
        formula: item.formula
          ? {
              ...item.formula,
              file_uri: item.formula.file_uri,
              formula_id: item.formula.formula_id,
            }
          : undefined,
        dtdx_model: item.dtdx_model
          ? {
              ...item.dtdx_model,
              file_uri: item.dtdx_model.file_uri,
              model_file_id: item.dtdx_model.model_file_id,
            }
          : undefined,
        rvt_model: item.rvt_model
          ? {
              ...item.rvt_model,
              file_uri: item.rvt_model.file_uri,
              model_file_id: item.rvt_model.model_file_id,
            }
          : undefined,
        thumbnail: item.thumbnail
          ? {
              ...item.thumbnail,
              file_uri: item.thumbnail.symbol_uri,
              symbol_id: item.thumbnail.symbol_id,
            }
          : undefined,
      }));
    } else {
      structureList.value = [];
    }
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    // 에러 발생 시 빈 배열로 초기화
    structureList.value = [];
  }
};

// 구조물 대분류 변경 시 하위 구조물 타입 로드
const handleStructureTypeChange = async () => {
  selectedStructureTypeDetail.value = "";
  // thirdDepth 초기화
  structureStore.thirdDepth = [];

  if (selectedStructureType.value) {
    await structureStore.fetchThirdDepth(selectedStructureType.value, 3);
  }
};

onMounted(async () => {
  await structureStore.fetchCommonCodes("STRUCT_WWTP");
  await loadData();
});
</script>

<style scoped lang="scss">
@use "sass:color";

.structure-page {
  padding: $spacing-lg;
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

.structure-list-header {
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

// 다운로드 링크 스타일
.download-link {
  color: $primary-color;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover {
    color: color.scale($primary-color, $lightness: -20%);
    text-decoration: none;
  }
}
</style>
