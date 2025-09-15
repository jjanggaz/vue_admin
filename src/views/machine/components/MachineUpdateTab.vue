<template>
  <div class="machine-register-tab">
    <!-- 상단 검색/필터 영역 (이미지 레이아웃 참고) -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label required">⊙ {{ t("common.unit") }}</span>
        <select
          class="input select-sm"
          v-model="selectedUnit"
          :disabled="isRegistered"
        >
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
      <div class="group-form inline">
        <span class="label required">⊙ 기계명</span>
        <select
          class="input select-md"
          v-model="selectedMachineName"
          :disabled="isRegistered"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="machine in machineStore.secondDepth"
            :key="machine.code_id"
            :value="machine.code_key"
          >
            {{ machine.code_value }}
          </option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label required">⊙ 기계종분류</span>
        <select
          class="input select-sm"
          :disabled="!isStep1Enabled"
          v-model="selectedThirdDept"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="dept in machineStore.thirdDepth"
            :key="dept.code_id"
            :value="dept.code_key"
          >
            {{ dept.code_value }}
          </option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ 기계유형</span>
        <select
          class="input select-sm"
          :disabled="!isStep2Enabled"
          v-model="selectedFourthDept"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="dept in machineStore.fourthDepth"
            :key="dept.code_id"
            :value="dept.code_key"
          >
            {{ dept.code_value }}
          </option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ 기계유형분류</span>
        <select
          class="input select-sm"
          :disabled="!isStep3Enabled"
          v-model="selectedFifthDept"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="dept in machineStore.fifthDepth"
            :key="dept.code_id"
            :value="dept.code_key"
          >
            {{ dept.code_value }}
          </option>
        </select>
      </div>
    </div>

    <!-- 리스트 테이블 -->
    <div class="section-header">
      <div class="section-title">⊙ {{ t("common.machineList") }}</div>
      <div class="section-actions">
        <button class="btn-outline" @click.prevent="onDownloadExcelTemplate">
          excel 양식 다운로드
        </button>
        <button class="btn-outline" @click.prevent="onUploadExcel">
          excel 업로드
        </button>
        <button class="btn-outline" @click.prevent="onBulkUploadModels">
          모델 대량 업로드
        </button>
        <input
          type="file"
          ref="excelFileInput"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          style="display: none"
          @change="handleExcelFileChange"
        />
        <input
          type="file"
          ref="bulkFileInput"
          accept=".zip,.7z,application/zip,application/x-zip-compressed,application/x-7z-compressed"
          style="display: none"
          @change="handleBulkFileChange"
        />
      </div>
    </div>
    <DataTable :columns="columns" :data="rows" :selectable="false"> </DataTable>
    <div class="pagination-container">
      <Pagination :current-page="1" :total-pages="1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useMachineStore } from "@/stores/machineStore";

const { t } = useI18n();
const machineStore = useMachineStore();

// 단위 선택 상태
const selectedUnit = ref("");

// 단계별 enable 상태
const isStep1Enabled = ref(false); // 기계종분류
const isStep2Enabled = ref(false); // 기계유형
const isStep3Enabled = ref(false); // 기계유형분류
const isRegistered = ref(false); // 등록 완료 상태

// 선택된 기계명
const selectedMachineName = ref("");
const selectedThirdDept = ref("");
const selectedFourthDept = ref("");
const selectedFifthDept = ref("");

// 엑셀 업로드 입력 ref
const excelFileInput = ref<HTMLInputElement | null>(null);
const excelFileName = ref<string>("");
// 대량 업로드 입력 ref
const bulkFileInput = ref<HTMLInputElement | null>(null);
const bulkFileName = ref<string>("");

const columns: TableColumn[] = [
  { key: "no", title: "순번", width: "80px" },
  { key: "model", title: "기계 모델명", width: "220px" },
  { key: "d3", title: "3D 모델 (DTDX)", width: "220px" },
  { key: "revit", title: "REVIT 모델", width: "220px" },
  { key: "d2", title: "2D 심볼", width: "220px" },
  { key: "etc", title: "…", width: "120px" },
];

const rows = ref([
  {
    id: 1,
    no: 1,
    model: "송풍기 A",
    d3: "model_a.dtdx",
    revit: "model_a.rvt",
    d2: "symbol_a.svg",
    etc: "비고1",
  },
  {
    id: 2,
    no: 2,
    model: "송풍기 B",
    d3: "model_b.dtdx",
    revit: "model_b.rvt",
    d2: "symbol_b.svg",
    etc: "비고2",
  },
]);

// watch를 사용해서 값 변경 시 다음 단계들 초기화 및 API 호출
watch(selectedMachineName, async (newValue, _oldValue) => {
  // 모든 하위 단계들 초기화
  selectedThirdDept.value = "";
  selectedFourthDept.value = "";
  selectedFifthDept.value = "";
  isStep1Enabled.value = false;
  isStep2Enabled.value = false;
  isStep3Enabled.value = false;

  if (newValue) {
    try {
      // 3차 깊이별 공통코드 조회 API 호출
      await machineStore.fetchThirdDepth(newValue, 3);

      // 1단계 완료 - 기계종분류 활성화
      isStep1Enabled.value = true;
    } catch (error) {
      console.error("3차 깊이별 공통코드 조회 실패:", error);
      alert("3차 깊이별 공통코드 조회에 실패했습니다.");
    }
  }
});

watch(selectedThirdDept, async (newValue, _oldValue) => {
  if (isStep1Enabled.value) {
    // 기계종분류가 변경되면 하위 단계들 초기화
    selectedFourthDept.value = "";
    selectedFifthDept.value = "";
    isStep2Enabled.value = false;
    isStep3Enabled.value = false;

    // 값이 있을 때만 API 호출
    if (newValue) {
      try {
        const response = await machineStore.fetchThirdDepth(newValue, 4);
        if (response?.response && response.response.length > 0) {
          isStep2Enabled.value = true;
        } else {
          isStep2Enabled.value = false;
        }
      } catch (error) {
        console.error("4차 깊이별 공통코드 조회 실패:", error);
        alert("4차 깊이별 공통코드 조회에 실패했습니다.");
        isStep2Enabled.value = false;
      }
    }
  }
});

watch(selectedFourthDept, async (newValue, _oldValue) => {
  if (isStep2Enabled.value) {
    // 기계유형이 변경되면 하위 단계 초기화
    selectedFifthDept.value = "";
    isStep3Enabled.value = false;

    // 값이 있을 때만 API 호출
    if (newValue) {
      try {
        const response = await machineStore.fetchThirdDepth(newValue, 5);
        if (response?.response && response.response.length > 0) {
          isStep3Enabled.value = true;
        } else {
          isStep3Enabled.value = false;
        }
      } catch (error) {
        console.error("5차 깊이별 공통코드 조회 실패:", error);
        alert("5차 깊이별 공통코드 조회에 실패했습니다.");
        isStep3Enabled.value = false;
      }
    }
  }
});

// 공통 검증 함수: 단위/기계명/기계종분류 필수 체크
function validateBasicSelections(): boolean {
  if (!selectedUnit.value) {
    alert("단위를 선택해주세요.");
    return false;
  }
  if (!selectedMachineName.value) {
    alert("기계명을 선택해주세요.");
    return false;
  }
  if (!selectedThirdDept.value) {
    alert("기계종분류를 선택해주세요.");
    return false;
  }

  // 기계유형 선택 validation
  if (
    machineStore.fourthDepth &&
    machineStore.fourthDepth.length > 0 &&
    !selectedFourthDept.value
  ) {
    alert("기계유형을 선택해주세요.");
    return false;
  }

  // 기계유형분류 선택 validation
  if (
    machineStore.fifthDepth &&
    machineStore.fifthDepth.length > 0 &&
    !selectedFifthDept.value
  ) {
    alert("기계유형분류를 선택해주세요.");
    return false;
  }

  return true;
}

// 버튼 핸들러들
function onDownloadExcelTemplate() {
  if (!validateBasicSelections()) return;
  // TODO: 템플릿 다운로드 로직 연결
}

function onUploadExcel() {
  if (!validateBasicSelections()) return;
  // 파일 선택 트리거
  excelFileInput.value?.click();
}

function onBulkUploadModels() {
  if (!validateBasicSelections()) return;
  // 파일 선택 트리거
  bulkFileInput.value?.click();
}

// 엑셀 파일 변경 핸들러
function handleExcelFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];

  if (!file) {
    excelFileName.value = "";
    return;
  }

  // 확장자 검증
  const allowed = [".xlsx", ".xls"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!allowed.includes(ext)) {
    alert("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
    input.value = "";
    excelFileName.value = "";
    return;
  }

  // 크기 검증 (예: 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("파일 크기는 10MB를 초과할 수 없습니다.");
    input.value = "";
    excelFileName.value = "";
    return;
  }

  excelFileName.value = file.name;

  // TODO: 실제 파싱/업로드 로직 연결 (예: FormData 전송 또는 xlsx 파싱)
}

// 대량 업로드 파일 변경 핸들러
function handleBulkFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];

  if (!file) {
    bulkFileName.value = "";
    return;
  }

  // 확장자 검증
  const allowed = [".zip", ".7z"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!allowed.includes(ext)) {
    alert("압축 파일(.zip, .7z)만 업로드 가능합니다.");
    input.value = "";
    bulkFileName.value = "";
    return;
  }

  // 크기 검증 (예: 200MB)
  const maxSize = 200 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("파일 크기는 200MB를 초과할 수 없습니다.");
    input.value = "";
    bulkFileName.value = "";
    return;
  }

  bulkFileName.value = file.name;

  // TODO: 전송 로직 연결 (예: FormData로 업로드)
}
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
