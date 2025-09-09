<template>
  <div class="machine-register-tab">
    <!-- 상단 검색/필터 영역 (이미지 레이아웃 참고) -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label"
          >⊙ {{ t("common.unit") }} <span class="req">(＊)</span></span
        >
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
        <span class="label">⊙ 기계명 <span class="req">(＊)</span></span>
        <select
          class="input select-md"
          v-model="selectedMachineName"
          :disabled="isRegistered"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="machine in machineStore.secondDepts"
            :key="machine.code_id"
            :value="machine.code_key"
          >
            {{ machine.code_value }}
          </option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ revit 모델 <span class="req">(＊)</span></span>
        <div class="file-upload-group">
          <input
            type="text"
            class="input file-name-input"
            :value="revitFileName"
            readonly
            placeholder="파일을 선택하세요"
          />
          <input
            type="file"
            ref="revitFileInput"
            @change="handleRevitFileChange"
            accept=".rvt"
            style="display: none"
            :disabled="isRegistered"
          />
          <button
            type="button"
            class="btn-file"
            @click="$refs.revitFileInput.click()"
            v-if="!isRegistered"
          >
            파일 선택
          </button>
          <button
            type="button"
            class="btn-register"
            @click="handleRegister"
            :disabled="isRegistered"
            v-if="!isRegistered"
          >
            등록
          </button>
        </div>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ 기계종분류 <span class="req">(＊)</span></span>
        <select
          class="input select-sm"
          :disabled="!isStep1Enabled"
          v-model="selectedThirdDept"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="dept in machineStore.thirdDepts"
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
            v-for="dept in machineStore.fourthDepts"
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
            v-for="dept in machineStore.fifthDepts"
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
        <button class="btn-outline" @click.prevent>excel 양식 다운로드</button>
        <button class="btn-outline" @click.prevent>excel 업로드</button>
        <button class="btn-outline" @click.prevent>모델 대량 업로드</button>
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

// revit 파일 관련 상태
const revitFileName = ref("");
const revitFile = ref<File | null>(null);

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

const columns: TableColumn[] = [
  { key: "no", title: "순번", width: "80px" },
  { key: "model", title: "기계 모델명", width: "220px" },
  { key: "d3", title: "3D 모델 (DTDX)", width: "220px" },
  { key: "d2", title: "2D 심볼", width: "220px" },
  { key: "etc", title: "…", width: "120px" },
];

const rows = ref([
  {
    id: 1,
    no: 1,
    model: "송풍기 A",
    d3: "model_a.dtdx",
    d2: "symbol_a.svg",
    etc: "비고1",
  },
  {
    id: 2,
    no: 2,
    model: "송풍기 B",
    d3: "model_b.dtdx",
    d2: "symbol_b.svg",
    etc: "비고2",
  },
]);

function handleRevitFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];

  if (file) {
    // .rvt 확장자 validation
    const allowedExtensions = [".rvt"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      alert("Revit 모델 파일은 .rvt 확장자만 허용됩니다.");
      input.value = ""; // 파일 선택 초기화
      revitFileName.value = "";
      revitFile.value = null;
      return;
    }

    // 파일 크기 validation (예: 100MB 제한)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert("파일 크기는 100MB를 초과할 수 없습니다.");
      input.value = ""; // 파일 선택 초기화
      revitFileName.value = "";
      revitFile.value = null;
      return;
    }

    revitFileName.value = file.name;
    revitFile.value = file;
  } else {
    revitFileName.value = "";
    revitFile.value = null;
  }
}

async function handleRegister() {
  // 1단계: 기본 필수 항목 validation

  if (!selectedUnit.value) {
    alert("단위를 선택해주세요.");
    return;
  }

  if (!selectedMachineName.value) {
    alert("기계명을 선택해주세요.");
    return;
  }

  if (!revitFile.value) {
    alert("Revit 모델 파일을 선택해주세요.");
    return;
  }

  try {
    // 3차 부서 공통코드 조회 API 호출
    await machineStore.fetchThirdDepts(selectedMachineName.value, 3);

    // 모든 하위 단계들 초기화
    selectedThirdDept.value = "";
    selectedFourthDept.value = "";
    selectedFifthDept.value = "";
    isStep1Enabled.value = false;
    isStep2Enabled.value = false;
    isStep3Enabled.value = false;

    // 등록 완료 상태로 변경
    isRegistered.value = true;

    // 1단계 완료 - 기계종분류 활성화
    isStep1Enabled.value = true;
  } catch (error) {
    console.error("3차 부서 공통코드 조회 실패:", error);
    alert("3차 부서 공통코드 조회에 실패했습니다.");
  }
}

// watch를 사용해서 값 변경 시 다음 단계들 초기화 및 API 호출
watch(selectedThirdDept, async (newValue, oldValue) => {
  if (isStep1Enabled.value) {
    // 기계종분류가 변경되면 하위 단계들 초기화
    selectedFourthDept.value = "";
    selectedFifthDept.value = "";
    isStep2Enabled.value = false;
    isStep3Enabled.value = false;

    // 값이 있을 때만 API 호출
    if (newValue) {
      try {
        const response = await machineStore.fetchThirdDepts(newValue, 4);
        if (response?.response && response.response.length > 0) {
          isStep2Enabled.value = true;
        } else {
          isStep2Enabled.value = false;
        }
      } catch (error) {
        console.error("4차 부서 공통코드 조회 실패:", error);
        alert("4차 부서 공통코드 조회에 실패했습니다.");
        isStep2Enabled.value = false;
      }
    }
  }
});

watch(selectedFourthDept, async (newValue, oldValue) => {
  if (isStep2Enabled.value) {
    // 기계유형이 변경되면 하위 단계 초기화
    selectedFifthDept.value = "";
    isStep3Enabled.value = false;

    // 값이 있을 때만 API 호출
    if (newValue) {
      try {
        const response = await machineStore.fetchThirdDepts(newValue, 5);
        if (response?.response && response.response.length > 0) {
          isStep3Enabled.value = true;
        } else {
          isStep3Enabled.value = false;
        }
      } catch (error) {
        console.error("5차 부서 공통코드 조회 실패:", error);
        alert("5차 부서 공통코드 조회에 실패했습니다.");
        isStep3Enabled.value = false;
      }
    }
  }
});
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

  @media (max-width: $mobile) {
    min-width: auto;
    font-size: 12px;
  }
}

.req {
  color: #e74c3c;
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
