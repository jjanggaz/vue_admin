<template>
  <div class="machine-register-tab">
    <!-- 상단 검색/필터 영역 (이미지 레이아웃 참고) -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label required"
          >⊙ {{ t("common.structureMajorCategory") }}</span
        >
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
        <span class="label">⊙ {{ t("common.formulaFile") }}</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="formulaFileName || t('common.noFile')"
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
            {{ t("common.fileSelect") }}
          </button>
        </div>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ {{ t("common.dtdModel") }}</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="dtdFileName || t('common.noFile')"
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
            {{ t("common.fileSelect") }}
          </button>
        </div>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ {{ t("common.modelThumbnail") }}</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="thumbnailFileName || t('common.noFile')"
            readonly
          />
          <input
            type="file"
            ref="thumbnailFileInput"
            accept=".png,.jpg,.jpeg,.gif"
            style="display: none"
            @change="handleThumbnailFileChange"
          />
          <button class="btn-file" @click="thumbnailFileInput?.click()">
            {{ t("common.fileSelect") }}
          </button>
        </div>
      </div>

      <div class="group-form inline">
        <span class="label">⊙ {{ t("common.revitModel3D") }}</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="revitFileName || t('common.noFile')"
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
            {{ t("common.fileSelect") }}
          </button>
        </div>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ {{ t("common.remarks") }}</span>
        <input
          type="text"
          class="input"
          v-model="remarks"
          :placeholder="t('placeholder.recommendedProcessRemarks')"
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
          {{ t("common.delete") }}
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
      :selected-items="selectedItems"
      row-key="formula_id"
      @selection-change="handleSelectionChange"
    >
      <template #cell-file_name="{ value, item }">
        <a
          v-if="item.download_url"
          :href="item.download_url"
          target="_blank"
          class="file-link"
        >
          {{ value }}
        </a>
        <span v-else>{{ value }}</span>
      </template>
      <template #cell-uploaded_at="{ value }">
        {{ formatDate(value) }}
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, watch, onMounted } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useStructureStore } from "@/stores/structureStore";

// 수정 전용 컴포넌트로 사용 (등록 모드 관련 props 제거)

// Props 정의
interface Props {
  selectedItem?: {
    structure_id?: string;
    structure_type?: string;
    description?: string;
    formula_file_name?: string;
    dtdx_model_file_name?: string;
    rvt_model_file_name?: string;
    thumbnail_file_name?: string;
    formula?: {
      formula_id?: string;
    };
    dtdx_model?: {
      model_file_id?: string;
    };
    rvt_model?: {
      model_file_id?: string;
    };
    thumbnail?: {
      file_name?: string;
      symbol_name?: string;
      symbol_id?: string;
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

    // 구조물 공식 검색
    if (props.selectedItem?.structure_type) {
      await structureStore.fetchStructureFormula(
        props.selectedItem.structure_type
      );

      // 검색 결과를 그리드에 매핑
      if (structureStore.formulaSearchResults?.length > 0) {
        editModeRows.value = structureStore.formulaSearchResults.map(
          (item: any, index: number) => ({
            no: structureStore.formulaSearchResults.length - index, // 순번 (역순)
            formula_id: item.formula_id || "",
            formula_name: item.formula_name || "-",
            file_name: item.file_name || "-",
            download_url: item.download_url || "",
            formula_version: item.formula_version || "-",
            unit_system_code: item.unit_system_code || "-",
            uploaded_at: item.uploaded_at || "-",
          })
        );
      }
    }
  } catch (error) {
    console.error("데이터 조회 실패:", error);
  }
});

// 등록용 컬럼 제거

// 수정 모드용 컬럼 (구조물 공식 검색 결과 기준)
const editModeColumns: TableColumn[] = [
  { key: "no", title: t("columns.machine.no"), width: "60px" },
  {
    key: "formula_name",
    title: t("columns.machine.structureTypeDetail"),
    width: "100px",
  },
  { key: "file_name", title: t("common.formulaFile"), width: "200px" },
  { key: "unit_system_code", title: t("common.unit"), width: "100px" },
  { key: "uploaded_at", title: t("common.creationDate"), width: "150px" },
];

// 등록용 데이터 제거

// 수정 모드용 데이터 (구조물 공식 검색 결과 기준)
const editModeRows = ref<Array<Record<string, unknown>>>([]);
const selectedItems = ref<Array<Record<string, unknown>>>([]);

// 선택 변경 핸들러
const handleSelectionChange = (selected: Array<Record<string, unknown>>) => {
  selectedItems.value = selected;
};

// 수정 모드에서는 구조물 대분류/타입 변경 불가 (비활성 상태)

// 공통 검증 함수: 구조물 대분류 및 타입 필수 체크
const validateBasicSelections = (): boolean => {
  if (!selectedStructureType.value) {
    alert(t("messages.warning.selectStructureType"));
    return false;
  }
  if (!selectedMachineName.value) {
    alert(t("messages.warning.selectStructureMachineName"));
    return false;
  }

  return true;
};
// 등록 목록 삭제 로직 제거

const onDeleteSelectedEditMode = () => {
  if (!validateBasicSelections()) return;

  // 선택된 항목이 있는지 확인
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  // 선택된 항목 사용
  const selectedItem = selectedItems.value[0];
  const formulaName = selectedItem.file_name as string;

  console.log(selectedItem);

  if (confirm(t("messages.confirm.deleteFormula", { name: formulaName }))) {
    handleDeleteFormula();
  }
};

const handleDeleteFormula = async () => {
  try {
    // 선택된 항목 사용
    const selectedItem = selectedItems.value[0];
    const formulaId = selectedItem.formula_id as string;

    if (!props.selectedItem?.structure_id || !formulaId) {
      alert(t("messages.warning.noFormulaToDelete"));
      return;
    }

    await structureStore.deleteStructureFormula(
      props.selectedItem.structure_id,
      formulaId
    );

    // 삭제 성공 후 그리드에서 해당 항목 제거
    editModeRows.value = editModeRows.value.filter((_, index) => index !== 0);

    alert(t("messages.warning.formulaDeleteSuccess"));

    // 그리드가 비어있으면 빈 상태로 표시
    if (editModeRows.value.length === 0) {
      editModeRows.value = [];
    }
  } catch (error) {
    console.error("공식 삭제 실패:", error);
    alert(t("messages.warning.formulaDeleteFail"));
  }
};

// 파일 변경 핸들러들
const handleFormulaFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  if (file) {
    const maxSize = 200;
    if (file.size > maxSize * 1024 * 1024) {
      alert(t("messages.warning.fileSizeExceed", { size: maxSize }));
      input.value = "";
      return;
    }
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".py")) {
      alert(t("messages.warning.pyFileOnly"));
      input.value = "";
      return;
    }

    // 파일명에서 확장자를 제거한 이름 부분 검증
    const fileNameWithoutExt = file.name.replace(/\.py$/i, "");

    // 파일명 validation: 영문만 사용, 공백 불가, 100자 이내, 특수 기호는 "_ - ()"만 허용
    const fileNameRegex = /^[a-zA-Z0-9_\-()]+$/;

    if (!fileNameRegex.test(fileNameWithoutExt)) {
      alert(t("messages.warning.invalidFormulaFileNameFormat"));
      input.value = "";
      return;
    }

    if (fileNameWithoutExt.length > 100) {
      alert(t("messages.warning.invalidFormulaFileNameFormat"));
      input.value = "";
      return;
    }

    formulaFileName.value = file.name;
  }
};

const handleDtdFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  if (file) {
    const maxSize = 200;
    if (file.size > maxSize * 1024 * 1024) {
      alert(t("messages.warning.fileSizeExceed", { size: maxSize }));
      input.value = "";
      return;
    }
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".dtdx")) {
      alert(t("messages.warning.dtdxFileOnly"));
      input.value = "";
      return;
    }
    dtdFileName.value = file.name;
  }
};

const handleThumbnailFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  if (file) {
    const maxSize = 200;
    if (file.size > maxSize * 1024 * 1024) {
      alert(t("messages.warning.fileSizeExceed", { size: maxSize }));
      input.value = "";
      return;
    }
    const allowed = ["image/png", "image/jpeg", "image/gif"];
    if (!allowed.includes(file.type)) {
      alert(t("messages.warning.imageFileOnly"));
      input.value = "";
      return;
    }
    const lower = file.name.toLowerCase();
    if (!/\.(png|jpg|jpeg|gif)$/i.test(lower)) {
      alert(t("messages.warning.imageExtensionOnly"));
      input.value = "";
      return;
    }
    thumbnailFileName.value = file.name;
  }
};

const handleRevitFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  if (file) {
    const maxSize = 200;
    if (file.size > maxSize * 1024 * 1024) {
      alert(t("messages.warning.fileSizeExceed", { size: maxSize }));
      input.value = "";
      return;
    }
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".rvt")) {
      alert(t("messages.warning.rvtFileOnly"));
      input.value = "";
      return;
    }
    revitFileName.value = file.name;
  }
};

// 등록 함수 제거 (수정 전용)

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date
      .toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", ""); // YYYY-MM-DD HH:mm 형태로 변환 (24시간)
  } catch (error) {
    console.error("날짜 포맷팅 오류:", error);
    return dateString;
  }
};

// 수정 함수
const onUpdate = async () => {
  if (!validateBasicSelections()) return;

  // 파일 첨부 validation
  if (!formulaFileName.value) {
    alert(t("messages.warning.selectFormulaFile"));
    return;
  }
  if (!dtdFileName.value) {
    alert(t("messages.warning.selectDtdFile"));
    return;
  }
  if (!thumbnailFileName.value) {
    alert(t("messages.warning.selectThumbnailFile"));
    return;
  }

  try {
    if (!props.selectedItem?.structure_id) {
      alert(t("messages.warning.noStructureInfo"));
      return;
    }

    // FormData 생성
    const formData = new FormData();

    // 파일들 추가
    if (formulaFileInput.value?.files?.[0]) {
      formData.append("formula_file", formulaFileInput.value.files[0]);
    }
    if (dtdFileInput.value?.files?.[0]) {
      formData.append("dtd_model_file", dtdFileInput.value.files[0]);
    }
    if (thumbnailFileInput.value?.files?.[0]) {
      formData.append("thumbnail_file", thumbnailFileInput.value.files[0]);
    }
    if (revitFileInput.value?.files?.[0]) {
      formData.append("revit_model_file", revitFileInput.value.files[0]);
    }

    // 나머지 파라미터들 추가
    const updateParams = {
      structure_type: selectedStructureType.value,
      structure_type_detail: selectedMachineName.value,
      description: remarks.value,
      //formula_id: props.selectedItem?.formula?.formula_id,
      dtdx_model_file_id: props.selectedItem?.dtdx_model?.model_file_id,
      rvt_model_file_id: props.selectedItem?.rvt_model?.model_file_id,
      thumbnail_symbol_id: props.selectedItem?.thumbnail?.symbol_id,
    };

    // updateParams를 JSON 문자열로 변환하여 추가
    formData.append("updateParams", JSON.stringify(updateParams));

    await structureStore.updateStructure(
      props.selectedItem.structure_id,
      formData
    );

    alert(t("messages.warning.structureUpdateSuccess"));
  } catch (error) {
    console.error("구조물 수정 실패:", error);
    alert(t("messages.warning.structureUpdateFail"));
  }
};

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

// 파일 링크 스타일
.file-link {
  color: #3b82f6;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  &:visited {
    color: #7c3aed;
  }
}
</style>
