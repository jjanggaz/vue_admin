<template>
  <div class="machine-formula-register-tab">
    <!-- 상단 필터: MachineRegisterTab와 동일한 스타일/구성 -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label required">⊙ {{ t("common.unit") }}</span>
        <select class="input select-sm" v-model="selectedUnit">
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
        <select class="input select-md" v-model="selectedMachineName">
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
      <div class="group-form inline">
        <span class="label required">⊙ 계산식 파일</span>
        <div class="file-upload-group">
          <input
            type="text"
            class="input file-name-input"
            :value="formulaFileName"
            readonly
            placeholder="파일을 선택하세요"
          />
          <input
            type="file"
            ref="formulaFileInput"
            @change="handleFormulaFileChange"
            accept=".py"
            style="display: none"
          />
          <button
            type="button"
            class="btn-file"
            @click="$refs.formulaFileInput.click()"
          >
            파일 선택
          </button>
          <button type="button" class="btn-register" @click="handleRegister">
            등록
          </button>
        </div>
      </div>
    </div>

    <!-- 계산식 리스트 -->
    <div class="section-header">
      <div class="section-title">계산식 리스트</div>
      <div class="section-actions">
        <button class="btn-danger">{{ t("common.delete") }}</button>
      </div>
    </div>
    <DataTable
      :columns="listColumns"
      :data="listRows"
      :selectable="true"
      :selection-mode="'single'"
      :show-select-all="false"
      :select-header-text="t('common.selectColumn')"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
    />

    <div class="pagination-container">
      <Pagination :current-page="1" :total-pages="1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, watch, computed } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useMachineStore } from "@/stores/machineStore";

const { t } = useI18n();
const machineStore = useMachineStore();

// 단위 선택 상태
const selectedUnit = ref("");
const selectedMachineName = ref("");

// 기계 분류 선택 상태
const selectedThirdDept = ref("");
const selectedFourthDept = ref("");
const selectedFifthDept = ref("");

// 단계별 enable 상태
const isStep1Enabled = ref(false); // 기계종분류
const isStep2Enabled = ref(false); // 기계유형
const isStep3Enabled = ref(false); // 기계유형분류

const listColumns: TableColumn[] = [
  { key: "no", title: "No.", width: "80px" },
  { key: "name", title: "기계명", width: "180px" },
  { key: "type", title: "기계유형", width: "160px" },
  { key: "file", title: "계산식 (업로드 파일)", width: "280px" },
  { key: "remark", title: "비고", width: "160px" },
];
const listRows = [
  {
    id: 1,
    no: 1,
    name: "송풍기",
    type: "터보블로워",
    file: "upload.py",
    remark: "****",
  },
  {
    id: 2,
    no: 2,
    name: "송풍기2",
    type: "터보블로워",
    file: "-",
    remark: "****",
  },
];

// 선택 상태를 DataTable과 동기화 (Machine.vue의 사용 패턴 참고)
const selectedItems = ref<any[]>([]);
const handleSelectionChange = (items: any[]) => {
  selectedItems.value = items;
};

// 계산식 파일 업로드 관련 상태
const formulaFileName = ref("");
const formulaFile = ref<File | null>(null);
const formulaFileInput = ref<HTMLInputElement | null>(null);

// 기계명 선택 시 바로 3차 깊이별 조회
watch(selectedMachineName, async (newValue, oldValue) => {
  if (newValue && newValue !== oldValue) {
    // 모든 하위 단계들 초기화
    selectedThirdDept.value = "";
    selectedFourthDept.value = "";
    selectedFifthDept.value = "";
    isStep1Enabled.value = false;
    isStep2Enabled.value = false;
    isStep3Enabled.value = false;

    try {
      // 3차 깊이별 공통코드 조회 API 호출
      const response = await machineStore.fetchThirdDepth(newValue, 3);
      if (response?.response && response.response.length > 0) {
        isStep1Enabled.value = true;
      } else {
        isStep1Enabled.value = false;
      }
    } catch (error) {
      console.error("3차 깊이별 공통코드 조회 실패:", error);
      alert("3차 깊이별 공통코드 조회에 실패했습니다.");
      isStep1Enabled.value = false;
    }
  }
});

// watch를 사용해서 값 변경 시 다음 단계들 초기화 및 API 호출
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

// 계산식 파일 업로드 핸들러
function handleFormulaFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];

  if (file) {
    // .py 확장자 validation
    const allowedExtensions = [".py"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      alert("계산식 파일은 .py 확장자만 허용됩니다.");
      input.value = ""; // 파일 선택 초기화
      formulaFileName.value = "";
      formulaFile.value = null;
      return;
    }

    // 파일 크기 validation (예: 10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      input.value = ""; // 파일 선택 초기화
      formulaFileName.value = "";
      formulaFile.value = null;
      return;
    }

    formulaFileName.value = file.name;
    formulaFile.value = file;
  } else {
    formulaFileName.value = "";
    formulaFile.value = null;
  }
}

// 등록 함수
async function handleRegister() {
  // 필수 항목 validation
  if (!selectedUnit.value) {
    alert("단위를 선택해주세요.");
    return;
  }

  if (!selectedMachineName.value) {
    alert("기계명을 선택해주세요.");
    return;
  }

  if (!selectedThirdDept.value) {
    alert("기계종분류를 선택해주세요.");
    return;
  }

  if (!formulaFile.value) {
    alert("계산식 파일을 첨부해주세요.");
    return;
  }

  try {
    // 여기에 실제 등록 API 호출 로직 추가
    console.log("등록 데이터:", {
      unit: selectedUnit.value,
      machineName: selectedMachineName.value,
      thirdDept: selectedThirdDept.value,
      fourthDept: selectedFourthDept.value,
      fifthDept: selectedFifthDept.value,
      file: formulaFile.value,
    });

    alert("계산식이 성공적으로 등록되었습니다.");

    // 등록 후 초기화
    formulaFileName.value = "";
    formulaFile.value = null;
    if (formulaFileInput.value) {
      formulaFileInput.value.value = "";
    }
  } catch (error) {
    console.error("등록 실패:", error);
    alert("등록에 실패했습니다.");
  }
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

.actions {
  display: flex;
  gap: 8px;
  margin: 8px 0 12px;
  flex-wrap: wrap;

  @media (max-width: $mobile) {
    justify-content: center;
    gap: 6px;
  }
}

.btn-primary {
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  white-space: nowrap;

  @media (max-width: $mobile) {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.btn-danger {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  white-space: nowrap;

  @media (max-width: $mobile) {
    padding: 4px 8px;
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

// 파일 업로드 영역 스타일
.upload-section {
  margin-top: 20px;
  padding: 16px;
  background: #f7f9fc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}

.upload-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

.file-upload-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

.file-name-input {
  flex: 1;
  min-width: 200px;
  background: #fff;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;

  @media (max-width: $mobile) {
    min-width: auto;
  }
}

.btn-file {
  background: #6b7280;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  white-space: nowrap;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #5a6268;
  }

  @media (max-width: $mobile) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.btn-register {
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  white-space: nowrap;
  cursor: pointer;
  font-size: 14px;

  &:hover:not(:disabled) {
    background: #1557b0;
  }

  &:disabled {
    background: #d0d5dd;
    cursor: not-allowed;
  }

  @media (max-width: $mobile) {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
