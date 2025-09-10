<template>
  <div class="machine-formula-register-tab">
    <!-- 상단 필터: MachineRegisterTab와 동일한 스타일/구성 -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label required">⊙ {{ t("common.language") }}</span>
        <select class="input select-sm" v-model="selectedLanguage">
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="lang in machineStore.langCodes"
            :key="lang.code_id"
            :value="lang.code_value_en"
          >
            {{ lang.code_value }}
          </option>
        </select>
      </div>
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
    </div>

    <!-- 계산식 버전 표 -->
    <DataTable
      :columns="versionColumns"
      :data="versionRows"
      :selectable="false"
    />

    <div class="actions">
      <button class="btn-primary">+ 계산식 추가</button>
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
import { ref, watch } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useMachineStore } from "@/stores/machineStore";

const { t } = useI18n();
const machineStore = useMachineStore();

// 언어와 단위 선택 상태
const selectedLanguage = ref("");
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

const versionColumns: TableColumn[] = [
  { key: "no", title: t("common.no"), width: "60px" },
  { key: "version", title: "계산식 버전", width: "200px" },
  { key: "createdAt", title: "생성일자", width: "160px" },
  { key: "applied", title: "적용버전", width: "120px" },
  { key: "remark", title: "비고", width: "160px" },
];
const versionRows = [
  {
    id: 1,
    no: 1,
    version: "○○○.PY",
    createdAt: "2025-01-01",
    applied: "○",
    remark: "*****",
  },
  {
    id: 2,
    no: 2,
    version: "v1.1.py",
    createdAt: "2025-01-10",
    applied: "",
    remark: "",
  },
];

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
</style>
