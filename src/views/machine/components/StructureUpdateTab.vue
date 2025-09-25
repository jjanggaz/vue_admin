<template>
  <div class="machine-register-tab">
    <!-- 상단 검색/필터 영역 (이미지 레이아웃 참고) -->
    <div class="filter-bar">
      <!-- 1행: 구조물 대분류(비활성), 구조물 타입(비활성), 3D 구조물 계산식 -->
      <div class="group-form inline">
        <span class="label required">⊙ 구조물 대분류</span>
        <select
          class="input select-md"
          v-model="selectedStructureType"
          :disabled="true"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="(type, index) in structureStore.editSecondDepth || []"
            :key="index"
            :value="type.code_key"
          >
            {{ type.code_value }}
          </option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label required"
          >⊙ {{ t("columns.machine.structureTypeDetail") }}</span
        >
        <select
          class="input select-md"
          v-model="selectedMachineName"
          :disabled="true"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="(detail, index) in structureStore.editThirdDepth || []"
            :key="index"
            :value="detail.code_key"
          >
            {{ detail.code_value }}
          </option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label required">⊙ 3D 구조물 계산식</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="formulaFileName || '선택된 파일 없음'"
            readonly
          />
          <input
            type="file"
            ref="formulaFileInput"
            accept=".py"
            style="display: none"
            @change="handleFormulaFileChange"
          />
          <button class="btn-file" @click="formulaFileInput?.click()">
            파일 선택
          </button>
        </div>
      </div>
      <div class="group-form inline">
        <span class="label required">⊙ 3D 구조물 DTD모델</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="dtdFileName || '선택된 파일 없음'"
            readonly
          />
          <input
            type="file"
            ref="dtdFileInput"
            accept=".dtdx"
            style="display: none"
            @change="handleDtdFileChange"
          />
          <button class="btn-file" @click="dtdFileInput?.click()">
            파일 선택
          </button>
        </div>
      </div>
      <div class="group-form inline">
        <span class="label required">⊙ 모델 썸네일</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="thumbnailFileName || '선택된 파일 없음'"
            readonly
          />
          <input
            type="file"
            ref="thumbnailFileInput"
            accept=".png,.jpg,.jpeg,.gif,.svg"
            style="display: none"
            @change="handleThumbnailFileChange"
          />
          <button class="btn-file" @click="thumbnailFileInput?.click()">
            파일 선택
          </button>
        </div>
      </div>

      <!-- 2행: 3D DTD모델, 모델 썸네일 -->
      <!-- 3행: 3D REVIT모델, 비고 -->
      <div class="group-form inline">
        <span class="label">⊙ 3D REVIT모델</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="revitFileName || '선택된 파일 없음'"
            readonly
          />
          <input
            type="file"
            ref="revitFileInput"
            accept=".rvt"
            style="display: none"
            @change="handleRevitFileChange"
          />
          <button class="btn-file" @click="revitFileInput?.click()">
            파일 선택
          </button>
        </div>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ 비고</span>
        <input
          type="text"
          class="input"
          v-model="remarks"
          placeholder="비고를 입력하세요"
        />
      </div>
    </div>
    <!-- 수정시 테이블 -->
    <div class="section-header">
      <div class="section-title">
        ⊙ {{ t("common.structure3DFormulaVersionManagement") }}
      </div>
      <div class="section-actions">
        <button
          class="btn-outline btn-delete"
          @click.prevent="onDeleteSelectedEditMode"
        >
          삭제
        </button>
      </div>
    </div>
    <DataTable
      :columns="editModeColumns"
      :data="editModeRows"
      :selectable="true"
      :selection-mode="'single'"
      :select-header-text="t('common.selectColumn')"
      :show-select-all="false"
    >
    </DataTable>
    <div class="pagination-container">
      <Pagination :current-page="1" :total-pages="1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, watch, onMounted } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useStructureStore } from "@/stores/structureStore";

// 수정 전용 컴포넌트로 사용 (등록 모드 관련 props 제거)

// Props 정의
interface Props {
  selectedItem?: {
    structure_type?: string;
    description?: string;
    formula_file_name?: string;
    dtdx_model_file_name?: string;
    rvt_model_file_name?: string;
    thumbnail_file_name?: string;
    thumbnail?: {
      file_name?: string;
      symbol_name?: string;
    };
  };
}

const props = withDefaults(defineProps<Props>(), {
  selectedItem: () => ({}),
});

const { t } = useI18n();
const structureStore = useStructureStore();

// 선택된 구조물 대분류 및 타입 (수정 모드에서는 비활성)
const selectedStructureType = ref("");
const selectedMachineName = ref("");

// 비고 입력
const remarks = ref("");

// 파일 업로드 ref들
const formulaFileInput = ref<HTMLInputElement | null>(null);
const formulaFileName = ref<string>("");
const dtdFileInput = ref<HTMLInputElement | null>(null);
const dtdFileName = ref<string>("");
const thumbnailFileInput = ref<HTMLInputElement | null>(null);
const thumbnailFileName = ref<string>("");
const revitFileInput = ref<HTMLInputElement | null>(null);
const revitFileName = ref<string>("");

// props에서 받은 데이터로 파일명들 설정
watch(
  () => props.selectedItem,
  (newItem) => {
    if (newItem) {
      selectedStructureType.value = newItem.structure_type || "";
      selectedMachineName.value = newItem.structure_type || "";
      remarks.value = newItem.description || "";
      formulaFileName.value = newItem.formula_file_name || "";
      dtdFileName.value = newItem.dtdx_model_file_name || "";
      thumbnailFileName.value = newItem.thumbnail_file_name || "";
      revitFileName.value = newItem.rvt_model_file_name || "";
    }
  },
  { immediate: true }
);

// 컴포넌트 마운트 시 공통 코드 조회
onMounted(async () => {
  try {
    if (props.selectedItem?.structure_type) {
      await structureStore.fetchStructureCommonCode(
        props.selectedItem.structure_type
      );

      // 공통 코드 결과에서 구조물 대분류 설정
      if (structureStore.editSecondDepth?.length > 0) {
        const hierarchyData = structureStore.editSecondDepth[0] as any;
        selectedStructureType.value = hierarchyData.code_key || "";
      }

      if (structureStore.editThirdDepth?.length > 0) {
        const hierarchyData = structureStore.editThirdDepth[0] as any;
        selectedMachineName.value = hierarchyData.code_key || "";
      }
    }
  } catch (error) {
    console.error("공통 코드 조회 실패:", error);
  }
});

// 등록용 컬럼 제거

// 수정 모드용 컬럼 (첨부 이미지 기준)
const editModeColumns: TableColumn[] = [
  { key: "no", title: t("columns.machine.no"), width: "60px" },
  {
    key: "structureTypeDetail",
    title: t("columns.machine.structureTypeDetail"),
    width: "140px",
  },
  { key: "formulaVersion", title: t("common.formulaVersion"), width: "120px" },
  { key: "creationDate", title: t("common.creationDate"), width: "120px" },
  { key: "appliedVersion", title: t("common.appliedVersion"), width: "120px" },
  { key: "unit", title: t("common.unit"), width: "100px" },
  { key: "remarks", title: t("columns.machine.remarks"), width: "120px" },
];

// 등록용 데이터 제거

// 수정 모드용 데이터 (첨부 이미지 기준)
const editModeRows = ref([
  {
    id: 1,
    no: 1,
    structureType: "기초",
    structureForm: "직사각형",
    structureName: "구조물명1",
    structureTypeDetail: "RC",
    formulaVersion: "v1.0",
    creationDate: "2024-01-15",
    appliedVersion: "v1.0",
    unit: "m",
    remarks: "특이사항 없음",
  },
  {
    id: 2,
    no: 2,
    structureType: "벽체",
    structureForm: "원형",
    structureName: "구조물명2",
    structureTypeDetail: "S",
    formulaVersion: "v2.1",
    creationDate: "2024-01-20",
    appliedVersion: "v2.0",
    unit: "m",
    remarks: "검토 필요",
  },
  {
    id: 3,
    no: 3,
    structureType: "기초",
    structureForm: "원형",
    structureName: "구조물명3",
    structureTypeDetail: "RC",
    formulaVersion: "v1.5",
    creationDate: "2024-01-25",
    appliedVersion: "v1.5",
    unit: "m",
    remarks: "최신 버전",
  },
]);

// 수정 모드에서는 구조물 대분류/타입 변경 불가 (비활성 상태)

// 공통 검증 함수: 구조물 대분류 및 타입 필수 체크
function validateBasicSelections(): boolean {
  if (!selectedStructureType.value) {
    alert("구조물 대분류를 선택해주세요.");
    return false;
  }
  if (!selectedMachineName.value) {
    alert("구조물 타입을 선택해주세요.");
    return false;
  }

  return true;
}
// 등록 목록 삭제 로직 제거

function onDeleteSelectedEditMode() {
  if (!validateBasicSelections()) return;
  // TODO: 선택된 항목 삭제 로직 구현
}

// 파일 변경 핸들러들
function handleFormulaFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }
    formulaFileName.value = file.name;
  }
}

function handleDtdFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  if (file) {
    if (file.size > 200 * 1024 * 1024) {
      alert("파일 크기는 200MB를 초과할 수 없습니다.");
      return;
    }
    dtdFileName.value = file.name;
  }
}

function handleThumbnailFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  if (file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }
    const allowed = ["image/png", "image/jpeg", "image/gif", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      alert("이미지 파일만 업로드할 수 있습니다. (png, jpg, gif, svg)");
      return;
    }
    thumbnailFileName.value = file.name;
  }
}

function handleRevitFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  if (file) {
    if (file.size > 200 * 1024 * 1024) {
      alert("파일 크기는 200MB를 초과할 수 없습니다.");
      return;
    }
    revitFileName.value = file.name;
  }
}

// 등록 함수 제거 (수정 전용)

// 수정 함수
function onUpdate() {
  if (!validateBasicSelections()) return;

  // 파일 첨부 validation
  if (!formulaFileName.value) {
    alert("3D 구조물 계산식 파일을 선택해주세요.");
    return;
  }
  if (!dtdFileName.value) {
    alert("3D 구조물 DTD모델 파일을 선택해주세요.");
    return;
  }
  if (!thumbnailFileName.value) {
    alert("모델 썸네일 파일을 선택해주세요.");
    return;
  }

  // TODO: 수정 로직 구현
  alert("구조물이 수정되었습니다.");
}

defineExpose({ onUpdate });
</script>

<style scoped lang="scss">
// 반응형 브레이크포인트
$mobile: 768px;
$tablet: 1024px;
$desktop: 1200px;

.filter-bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  gap: 12px 16px;
  align-items: center;
  margin-bottom: 14px;
  background: #f7f9fc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);

  // 태블릿 크기에서 2열로 변경
  @media (max-width: $tablet) {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
    gap: 10px 12px;
    padding: 12px;
  }

  // 모바일 크기에서 1열로 변경
  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }
}

.group-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0; // flex 아이템이 축소될 수 있도록 함

  &.wide {
    grid-column: span 2;

    @media (max-width: $tablet) {
      grid-column: span 1;
    }
  }

  &.inline {
    flex-direction: row;
    align-items: center;
    gap: 12px;

    @media (max-width: $mobile) {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }
  }
}

.label {
  font-size: 13px;
  color: #475467;
  min-width: 100px;
  flex-shrink: 0;

  &.required::after {
    content: " (＊)";
    color: #e74c3c;
    margin-left: 4px;
  }

  @media (max-width: $mobile) {
    min-width: auto;
    font-size: 12px;
  }
}

.label .req {
  display: none;
}

.input {
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0 8px;
  background: #fff;
  width: 100%;
  min-width: 0; // input이 축소될 수 있도록 함

  @media (max-width: $mobile) {
    height: 28px;
    font-size: 12px;
  }
}

.select-sm {
  min-width: 120px;

  @media (max-width: $mobile) {
    min-width: 100px;
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

.right-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: $mobile) {
    justify-content: center;
    gap: 6px;
  }
}

.btn-outline {
  background: #fff;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  white-space: nowrap;

  @media (max-width: $mobile) {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.file-upload-group {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0; // flex 컨테이너가 축소될 수 있도록 함

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
}

.file-name-input {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  background-color: #f9fafb;
  color: #4b5563;
  font-size: 14px;
  cursor: default;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: white;
  }

  @media (max-width: $mobile) {
    font-size: 12px;
    padding: 6px 8px;
  }
}

.btn-file {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #2563eb;
  }

  &:active {
    background: #1d4ed8;
  }

  @media (max-width: $mobile) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.btn-register {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #059669;
  }

  &:active {
    background: #047857;
  }

  @media (max-width: $mobile) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.btn-update {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #2563eb;
  }

  &:active {
    background: #1d4ed8;
  }

  @media (max-width: $mobile) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.section-title {
  margin: 10px 0;
  font-weight: 600;
  font-size: 16px;

  @media (max-width: $mobile) {
    font-size: 14px;
    margin: 8px 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
}

.section-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: $mobile) {
    justify-content: center;
    gap: 6px;
  }
}

.footer-actions {
  display: flex;
  justify-content: center;
  margin: 8px 0 4px;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: $mobile) {
    gap: 6px;
  }
}

.file-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  .input {
    flex: 1;
  }

  .btn-file {
    flex-shrink: 0;
  }
}

.btn-primary {
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  white-space: nowrap;

  @media (max-width: $mobile) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

// 테이블 반응형 처리
:deep(.data-table) {
  overflow-x: auto;

  @media (max-width: $mobile) {
    font-size: 12px;
  }
}

// 모달 내부 스크롤 처리
:deep(.modal-body) {
  max-height: 70vh;
  overflow-y: auto;

  @media (max-width: $mobile) {
    max-height: 60vh;
  }
}
</style>
