<template>
  <div class="machine-formula-register-tab">
    <!-- 상단 필터 -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label required"
          >⊙ {{ t("common.machineMajorCategory") }}</span
        >
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
        <span class="label">⊙ {{ t("common.machineType") }}</span>
        <select
          class="input select-sm"
          :disabled="!isStep2Enabled"
          v-model="selectedFourthDept"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="dept in fourthDepthOptions"
            :key="dept.code_id"
            :value="dept.code_key"
          >
            {{ dept.code_value }}
          </option>
        </select>
      </div>
      <div class="group-form inline formula-file-group">
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
          <button type="button" class="btn-file" @click="handleFileSelectClick">
            {{ t("common.selectFile") }}
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
        <button class="btn-danger" @click="handleDelete">
          {{ t("common.delete") }}
        </button>
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
      row-key="formulaId"
    >
      <template #cell-fileName="{ item }">
        <a
          v-if="item._downloadUrl"
          :href="item._downloadUrl"
          target="_blank"
          class="file-download-link"
          @click.stop
        >
          {{ item._fileName }}
        </a>
        <span v-else>{{ item._fileName || "-" }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, watch } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useMachineStore } from "@/stores/machineStore";

const { t } = useI18n();
const machineStore = useMachineStore();

// 선택 상태
const selectedMachineName = ref("");
const selectedThirdDept = ref("");
const selectedFourthDept = ref("");

// 단계별 enable 상태
const isStep1Enabled = ref(false); // 기계중분류
const isStep2Enabled = ref(false); // 기계유형

// 4Depth 옵션
const fourthDepthOptions = ref<any[]>([]);

const listColumns: TableColumn[] = [
  { key: "no", title: t("common.no"), width: "80px", sortable: false },
  {
    key: "type",
    title: t("common.machineType"),
    width: "150px",
    sortable: false,
  },
  {
    key: "fileName",
    title: t("common.fileName"),
    width: "180px",
    sortable: false,
  },
  {
    key: "formulaScope",
    title: t("common.formulaScope"),
    width: "120px",
    sortable: false,
  },
  {
    key: "version",
    title: t("common.formulaVersion"),
    width: "120px",
    sortable: false,
  },
  { key: "unit", title: t("common.unit"), width: "100px", sortable: false },
  {
    key: "createdAt",
    title: t("common.createdDate"),
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

// 날짜 포맷 함수 (YYYY-MM-DD)
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

// 계산식 검색 결과를 테이블 데이터로 변환
const setFormulaListData = (response: any) => {
  console.log("setFormulaListData 호출됨:", response);

  // API 응답 구조 확인 (response.data 또는 response.response.data)
  const data = response?.response?.data || response?.data;

  if (!data?.formulas || !Array.isArray(data.formulas)) {
    console.log("formulas 데이터 없음");
    listRows.value = [];
    return;
  }

  const formulas = data.formulas;
  const equipmentType = data.equipment_type;

  console.log("formulas:", formulas);
  console.log("equipmentType:", equipmentType);

  // formulas 배열을 listRows로 변환
  listRows.value = formulas.map((formula: any, index: number) => ({
    no: index + 1,
    type: equipmentType?.code_value || formula.ownership_code_key || "-",
    fileName: formula.file_name || "-", // 슬롯에서 렌더링할 것이므로 파일명만 저장
    formulaScope:
      formula.is_ownship_formula === true
        ? t("common.equipmentTypeScope")
        : formula.is_ownship_formula === false
        ? t("common.subCategoryScope")
        : "-",
    version: formula.formula_version || "-",
    unit: formula.unit_system_code || "-",
    createdAt: formatDate(formula.uploaded_at),
    formulaId: formula.formula_id,
    rawData: formula,
    _downloadUrl: formula.download_url, // 다운로드 URL 저장
    _fileName: formula.file_name, // 원본 파일명 저장
  }));
  console.log("listRows 설정됨:", listRows.value);
};

// 기계명 선택 시 3차 깊이별 조회
watch(selectedMachineName, async (newValue, _oldValue) => {
  // 하위 단계 초기화
  selectedThirdDept.value = "";
  selectedFourthDept.value = "";
  isStep1Enabled.value = false;
  isStep2Enabled.value = false;
  fourthDepthOptions.value = [];
  listRows.value = []; // 테이블 초기화

  // 파일 초기화
  formulaFileName.value = "";
  formulaFile.value = null;
  if (formulaFileInput.value) {
    formulaFileInput.value.value = "";
  }

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

// 기계중분류 선택 시 4차 깊이별 조회 및 계산식 검색
watch(selectedThirdDept, async (newValue, _oldValue) => {
  // 하위 단계 초기화
  selectedFourthDept.value = "";
  isStep2Enabled.value = false;
  fourthDepthOptions.value = [];
  listRows.value = []; // 테이블 초기화

  // 파일 초기화
  formulaFileName.value = "";
  formulaFile.value = null;
  if (formulaFileInput.value) {
    formulaFileInput.value.value = "";
  }

  // 값이 있을 때만 4차 코드 조회 후 2단계 활성화
  if (newValue) {
    try {
      const response = await machineStore.fetchThirdDepth(newValue, 4);
      if (response?.response && response.response.length > 0) {
        fourthDepthOptions.value = response.response;
        isStep2Enabled.value = true;
      } else {
        isStep2Enabled.value = false;
      }

      // 계산식 검색 API 호출
      const formulaResponse = await machineStore.searchFormula(newValue);
      console.log("계산식 검색 결과 (3Depth):", formulaResponse);

      // 계산식 검색 결과를 테이블에 표시
      setFormulaListData(formulaResponse);
    } catch (error) {
      console.error("4차 깊이별 공통코드 조회 또는 계산식 검색 실패:", error);
      isStep2Enabled.value = false;
      listRows.value = []; // 에러 시 테이블 초기화
    }
  }
});

// 기계유형 선택 시 계산식 검색
watch(selectedFourthDept, async (newValue, _oldValue) => {
  // 파일 초기화
  formulaFileName.value = "";
  formulaFile.value = null;
  listRows.value = []; // 테이블 초기화

  if (formulaFileInput.value) {
    formulaFileInput.value.value = "";
  }

  // newValue가 없으면 기계중분류 값으로 조회
  const searchValue = newValue || selectedThirdDept.value;

  if (searchValue) {
    try {
      // 계산식 검색 API 호출
      const formulaResponse = await machineStore.searchFormula(searchValue);
      console.log("계산식 검색 결과 (4Depth):", formulaResponse);

      // 계산식 검색 결과를 테이블에 표시
      setFormulaListData(formulaResponse);
    } catch (error) {
      console.error("계산식 검색 실패:", error);
      listRows.value = []; // 에러 시 테이블 초기화
    }
  }
});

// 파일 선택 버튼 클릭 핸들러
const handleFileSelectClick = () => {
  // 기계 대분류 선택 확인
  if (!selectedMachineName.value) {
    alert(t("messages.warning.selectMachineMajorCategory"));
    return;
  }

  // 기계 중분류 선택 확인
  if (!selectedThirdDept.value) {
    alert(t("messages.warning.selectMachineSubCategory"));
    return;
  }

  // 검증 통과 시 파일 선택 다이얼로그 열기
  formulaFileInput.value?.click();
};

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
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      alert(
        t("messages.warning.fileSizeExceed", { size: maxSize / 1024 / 1024 })
      );
      input.value = ""; // 파일 선택 초기화
      formulaFileName.value = "";
      formulaFile.value = null;
      return;
    }

    // 파일명 validation (확장자 제외)
    const fileNameWithoutExt = file.name.substring(
      0,
      file.name.lastIndexOf(".")
    );

    // 100자 이내 체크
    if (fileNameWithoutExt.length > 100) {
      alert(t("messages.warning.invalidFormulaFileNameFormat"));
      input.value = "";
      formulaFileName.value = "";
      formulaFile.value = null;
      return;
    }

    // 영문, 공백, 특수기호 체크 (영문, 숫자, _, -, (, ) 허용)
    const validFileNamePattern = /^[a-zA-Z0-9_\-\\(\\)]+$/;
    if (!validFileNamePattern.test(fileNameWithoutExt)) {
      alert(t("messages.warning.invalidFormulaFileNameFormat"));
      input.value = "";
      formulaFileName.value = "";
      formulaFile.value = null;
      return;
    }

    // 선택된 equipment_type 결정 (4Depth 우선, 없으면 3Depth)
    const equipmentType = selectedFourthDept.value || selectedThirdDept.value;

    if (equipmentType) {
      // 파일명의 마지막에 equipmentType이 있는지 확인
      if (fileNameWithoutExt.endsWith(equipmentType)) {
        // 파일명의 마지막에 equipmentType이 있으면 첨부 허용
        formulaFileName.value = file.name;
        formulaFile.value = file;
      } else {
        // 파일명의 마지막에 equipmentType이 없으면 경고 및 첨부 취소
        alert(
          t("messages.warning.invalidFormulaFileName", {
            equipmentType: equipmentType,
          })
        );
        input.value = ""; // 파일 선택 초기화
        formulaFileName.value = "";
        formulaFile.value = null;
        return;
      }
    } else {
      // equipment_type이 선택되지 않은 경우 원본 파일명 사용
      formulaFileName.value = file.name;
      formulaFile.value = file;
    }
  } else {
    formulaFileName.value = "";
    formulaFile.value = null;
  }
};

// 등록 함수
const handleRegister = async () => {
  // 필수 항목 validation
  if (!selectedMachineName.value) {
    alert(t("messages.warning.selectMachineMajorCategory"));
    return;
  }

  if (!selectedThirdDept.value) {
    alert(t("messages.warning.selectMachineSubCategory"));
    return;
  }

  // 기계 타입은 선택 사항 (필수 아님)
  // if (!selectedFourthDept.value) {
  //   alert(t("messages.warning.selectMachineType"));
  //   return;
  // }

  if (!formulaFile.value) {
    alert(t("messages.warning.selectFormulaFile"));
    return;
  }

  try {
    console.log("등록 데이터:", {
      machineName: selectedMachineName.value,
      thirdDept: selectedThirdDept.value,
      fourthDept: selectedFourthDept.value,
      file: formulaFile.value,
    });

    // API 호출 (파일은 이미 첨부 시점에 변경됨)
    const params: { python_file: File; formula_id?: string } = {
      python_file: formulaFile.value,
    };

    const response = await machineStore.createFormula(params);

    if (response?.success) {
      alert(t("messages.success.formulaCreateSuccess"));

      // 등록 후 초기화
      formulaFileName.value = "";
      formulaFile.value = null;
      if (formulaFileInput.value) {
        formulaFileInput.value.value = "";
      }

      // 계산식 목록 새로고침 (4Depth가 선택되어 있으면 4Depth로, 아니면 3Depth로)
      if (selectedFourthDept.value) {
        const formulaResponse = await machineStore.searchFormula(
          selectedFourthDept.value
        );
        setFormulaListData(formulaResponse);
      } else if (selectedThirdDept.value) {
        const formulaResponse = await machineStore.searchFormula(
          selectedThirdDept.value
        );
        setFormulaListData(formulaResponse);
      }
    } else {
      throw new Error(response?.message || "등록에 실패했습니다.");
    }
  } catch (error) {
    console.error("등록 실패:", error);
    alert(t("messages.error.registrationFailed"));
  }
};

// 삭제 함수
const handleDelete = async () => {
  // 선택된 항목 확인
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  const selectedItem = selectedItems.value[0];
  const formulaId = selectedItem.formulaId;

  if (!formulaId) {
    alert(t("messages.warning.noFormulaIdToDelete"));
    return;
  }

  if (!confirm(t("messages.confirm.deleteItem"))) {
    return;
  }

  try {
    console.log("삭제할 formula_id:", formulaId);

    // 삭제 API 호출
    const response = await machineStore.deleteFormula(formulaId);

    if (response?.success) {
      alert(t("messages.success.deleted"));

      // 삭제 후 초기화
      selectedItems.value = [];
      formulaFileName.value = "";
      formulaFile.value = null;
      if (formulaFileInput.value) {
        formulaFileInput.value.value = "";
      }

      // 계산식 목록 새로고침
      if (selectedFourthDept.value) {
        const formulaResponse = await machineStore.searchFormula(
          selectedFourthDept.value
        );
        setFormulaListData(formulaResponse);
      } else if (selectedThirdDept.value) {
        const formulaResponse = await machineStore.searchFormula(
          selectedThirdDept.value
        );
        setFormulaListData(formulaResponse);
      }
    } else {
      throw new Error(response?.message || "삭제에 실패했습니다.");
    }
  } catch (error) {
    console.error("삭제 실패:", error);
    alert(t("messages.error.deleteFailed"));
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
  align-items: start;
  margin-bottom: 14px;
  background: #f7f9fc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);

  // 계산식 파일 그룹 (전체 너비 사용)
  .formula-file-group {
    grid-column: 1 / -1; // 전체 컬럼 차지
  }

  // 태블릿 크기에서 2열로 변경
  @media (max-width: $tablet) {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
    gap: 10px 12px;
    padding: 12px;

    .formula-file-group {
      grid-column: 1 / -1;
    }
  }

  // 모바일 크기에서 1열로 변경
  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;

    .formula-file-group {
      grid-column: 1;
    }
  }
}

.group-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0; // flex 아이템이 축소될 수 있도록 함
  width: 100%; // 전체 너비 사용

  &.inline {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap; // 한 줄로 유지

    .label {
      flex-shrink: 0; // 라벨은 축소되지 않음
      white-space: nowrap; // 라벨 텍스트 줄바꿈 방지
    }

    .input,
    select {
      flex: 1; // input/select가 남은 공간 차지
      min-width: 0;
    }

    .file-upload-group {
      flex: 1;
    }

    @media (max-width: $mobile) {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}

.label {
  font-size: 13px;
  color: #475467;
  min-width: 110px;
  flex-shrink: 0;
  white-space: nowrap;

  &.required::after {
    content: " (＊)";
    color: #e74c3c;
    margin-left: 4px;
  }

  @media (max-width: $mobile) {
    min-width: auto;
    font-size: 12px;
    white-space: normal;
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

// 파일 다운로드 링크 스타일
.file-download-link {
  color: #1a73e8;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    text-decoration: underline;
    color: #1557b0;
  }

  &:visited {
    color: #1a73e8;
  }
}
</style>
