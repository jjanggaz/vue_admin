<template>
  <div class="machine-formula-register-tab">
    <!-- 상단 필터 -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label required">⊙ {{ t("common.machineName") }}</span>
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
        <span class="label required"
          >⊙ {{ t("common.machineSubCategory") }}</span
        >
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
        <span class="label required">⊙ {{ t("common.formulaFile") }}</span>
        <div class="file-upload-group">
          <input
            type="text"
            class="input file-name-input"
            :value="formulaFileName"
            readonly
            :placeholder="t('placeholder.selectFile')"
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
            @click="formulaFileInput?.click()"
          >
            {{ t("common.chooseFile") }}
          </button>
          <button type="button" class="btn-register" @click="handleRegister">
            {{ t("common.register") }}
          </button>
        </div>
      </div>
    </div>

    <!-- 계산식 리스트 -->
    <div class="section-header">
      <div class="section-title">
        ⊙ {{ t("common.formulaVersionManagement") }}
      </div>
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

// 선택 상태
const selectedMachineName = ref("");
const selectedThirdDept = ref("");

// 단계별 enable 상태
const isStep1Enabled = ref(false); // 기계중분류

const listColumns: TableColumn[] = [
  { key: "no", title: t("common.no"), width: "80px", sortable: false },
  {
    key: "type",
    title: t("common.machineType"),
    width: "150px",
    sortable: false,
  },
  {
    key: "version",
    title: t("common.formulaVersion"),
    width: "150px",
    sortable: false,
  },
  { key: "unit", title: t("common.unit"), width: "100px", sortable: false },
  {
    key: "createdAt",
    title: t("common.createdDate"),
    width: "150px",
    sortable: false,
  },
  {
    key: "updatedAt",
    title: t("common.updatedDate"),
    width: "150px",
    sortable: false,
  },
];
const listRows = ref<any[]>([]);

// 선택 상태를 DataTable과 동기화 (Machine.vue의 사용 패턴 참고)
const selectedItems = ref<any[]>([]);
const handleSelectionChange = (items: any[]) => {
  selectedItems.value = items;
};

// 계산식 파일 업로드 관련 상태
const formulaFileName = ref("");
const formulaFile = ref<File | null>(null);
const formulaFileInput = ref<HTMLInputElement | null>(null);

// 기계명 선택 시 3차 깊이별 조회
watch(selectedMachineName, async (newValue, _oldValue) => {
  // 하위 단계 초기화
  selectedThirdDept.value = "";
  isStep1Enabled.value = false;

  // 값이 있을 때만 3차 코드 조회 후 1단계 활성화
  if (newValue) {
    try {
      const response = await machineStore.fetchThirdDepth(newValue, 3);
      if (response?.response && response.response.length > 0) {
        isStep1Enabled.value = true;
      } else {
        isStep1Enabled.value = false;
      }
    } catch (error) {
      console.error("3차 깊이별 공통코드 조회 실패:", error);
      alert(t("messages.warning.thirdDepthCodeLoadFail"));
      isStep1Enabled.value = false;
    }
  }
});

// 계산식 파일 업로드 핸들러
const handleFormulaFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];

  if (file) {
    // .py 확장자 validation
    const allowedExtensions = [".py"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      alert(t("messages.warning.pyFileExtensionOnly"));
      input.value = ""; // 파일 선택 초기화
      formulaFileName.value = "";
      formulaFile.value = null;
      return;
    }

    // 파일 크기 validation (예: 10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(t("messages.warning.fileSizeLimit10MB"));
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
};

// 등록 함수
const handleRegister = async () => {
  // 필수 항목 validation
  if (!selectedMachineName.value) {
    alert(t("messages.warning.selectMachineName"));
    return;
  }

  if (!selectedThirdDept.value) {
    alert(t("messages.warning.selectStructureType"));
    return;
  }

  if (!formulaFile.value) {
    alert(t("messages.warning.selectFormulaFileAttach"));
    return;
  }

  try {
    // 여기에 실제 등록 API 호출 로직 추가
    console.log("등록 데이터:", {
      machineName: selectedMachineName.value,
      thirdDept: selectedThirdDept.value,
      file: formulaFile.value,
    });

    alert(t("messages.success.formulaCreateSuccess"));

    // 등록 후 초기화
    formulaFileName.value = "";
    formulaFile.value = null;
    if (formulaFileInput.value) {
      formulaFileInput.value.value = "";
    }
  } catch (error) {
    console.error("등록 실패:", error);
    alert(t("messages.error.registrationFailed"));
  }
};
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
