<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container-large">
      <div class="modal-header">
        <h3>{{ t("common.registerCode") }}</h3>
        <button class="btn-close" @click="handleClose"></button>
      </div>
      <div class="modal-body">
        <!-- Top Section - Search/Filter Controls -->
        <div class="search-section">
          <div class="search-filters">
            <div class="filter-group">
              <label class="filter-label">{{
                t("columns.code.codeGroup")
              }}</label>
              <select
                v-model="searchCodeGroupInput"
                class="filter-select"
                :disabled="!!props.selectedCodeGroup"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="group in uniqueCodeGroups"
                  :key="group.key"
                  :value="group.key"
                >
                  {{ group.value }} [{{ group.key }}]
                </option>
              </select>
            </div>
            <div v-if="props.selectedCategory1" class="filter-group">
              <label class="filter-label">{{
                t("columns.code.majorCategory")
              }}</label>
              <select
                v-model="searchCategory1Input"
                class="filter-select"
                disabled
              >
                <option value="">
                  {{ props.selectedCategory1?.value || t("common.noContent") }}
                </option>
                <option
                  v-if="props.selectedCategory1"
                  :key="props.selectedCategory1.key"
                  :value="props.selectedCategory1.key"
                >
                  {{ props.selectedCategory1.value }} [{{
                    props.selectedCategory1.key
                  }}]
                </option>
              </select>
            </div>
            <div v-if="props.selectedCategory2" class="filter-group">
              <label class="filter-label">{{
                t("columns.code.mediumCategory")
              }}</label>
              <select
                v-model="searchCategory2Input"
                class="filter-select"
                disabled
              >
                <option value="">
                  {{ props.selectedCategory2?.value || t("common.noContent") }}
                </option>
                <option
                  v-if="props.selectedCategory2"
                  :key="props.selectedCategory2.key"
                  :value="props.selectedCategory2.key"
                >
                  {{ props.selectedCategory2.value }} [{{
                    props.selectedCategory2.key
                  }}]
                </option>
              </select>
            </div>
            <div v-if="props.selectedCategory3" class="filter-group">
              <label class="filter-label">{{
                t("columns.code.minorCategory")
              }}</label>
              <select
                v-model="searchCategory3Input"
                class="filter-select"
                disabled
              >
                <option value="">
                  {{ props.selectedCategory3?.value || t("common.noContent") }}
                </option>
                <option
                  v-if="props.selectedCategory3"
                  :key="props.selectedCategory3.key"
                  :value="props.selectedCategory3.key"
                >
                  {{ props.selectedCategory3.value }} [{{
                    props.selectedCategory3.key
                  }}]
                </option>
              </select>
            </div>
          </div>
        </div>
        <!-- Action Buttons -->
        <div class="modal-action-buttons">
          <button class="btn btn-success" @click="downloadExcelForm">
            {{ t("common.excelFormDownload") }}
          </button>
          <div class="excel-upload-group">
            <input
              ref="excelFileInput"
              type="file"
              accept=".xlsx,.xls"
              @change="handleExcelFileUpload"
              style="display: none"
            />
            <button class="btn btn-primary" @click="triggerExcelFileUpload">
              {{ t("common.excelGetData") }}
            </button>
          </div>
        </div>
        <!-- Data Table -->
        <div class="modal-table-section">
          <DataTable
            :columns="tableColumns"
            :data="codeList"
            :loading="loading"
            :selectable="false"
            :sortable="false"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="handleClose">
          {{ t("common.cancel") }}
        </button>
        <button class="btn btn-primary" @click="handleSave">
          {{ t("common.save") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import * as XLSX from "xlsx";
import { useCodeStore, type CodeCreateRequest } from "@/stores/codeStore";

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

// CodeStore 사용
const codeStore = useCodeStore();
const { uniqueCodeGroups, loadCodeGroups } = codeStore;

// CodeItem은 CodeCreateRequest와 동일한 구조이므로 별도 정의 불필요

interface Props {
  visible: boolean;
  selectedCodeGroup?: { key: string; value: string };
  selectedCategory1?: { key: string; value: string };
  selectedCategory2?: { key: string; value: string };
  selectedCategory3?: { key: string; value: string };
  selectedCodeLevel?: string;
  selectedParentKey?: string;
}

interface Emits {
  (e: "close"): void;
  (e: "save", data: CodeCreateRequest[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 검색 변수들 (CodeManagement.vue와 동일한 변수명 사용)
const searchCodeGroupInput = ref(props.selectedCodeGroup?.key || "");
const searchCategory1Input = ref(props.selectedCategory1?.key || "");
const searchCategory2Input = ref(props.selectedCategory2?.key || "");
const searchCategory3Input = ref(props.selectedCategory3?.key || "");

// 데이터 변수들
const codeList = ref<CodeCreateRequest[]>([]);
const loading = ref(false);

// Excel 파일 input
const excelFileInput = ref<HTMLInputElement>();

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  {
    key: "code_key",
    title: t("columns.code.code"),
    width: "100px",
    sortable: false,
  },
  {
    key: "code_value",
    title: t("columns.code.codeNameKorean"),
    width: "150px",
    sortable: false,
  },
  {
    key: "code_value_en",
    title: t("columns.code.codeNameEnglish"),
    width: "100px",
    sortable: false,
  },
  {
    key: "code_order",
    title: t("columns.code.order"),
    width: "80px",
    sortable: false,
  },
  {
    key: "is_active",
    title: t("columns.code.usageStatus"),
    width: "100px",
    sortable: false,
    formatter: (value) => {
      if (value === true || value === "true" || value === "Y") {
        return t("common.used");
      }
      return t("common.unused");
    },
  },
  {
    key: "is_leaf",
    title: t("columns.code.isLeaf"),
    width: "100px",
    sortable: false,
    formatter: (value) => {
      if (value === true || value === "true" || value === "Y") {
        return "Y";
      }
      return "N";
    },
  },
  {
    key: "is_admin_only",
    title: t("columns.code.isAdminOnly"),
    width: "120px",
    sortable: false,
    formatter: (value) => {
      if (value === true || value === "true" || value === "Y") {
        return t("common.yes");
      }
      return t("common.noOption");
    },
  },
  {
    key: "description",
    title: t("columns.code.codeDescription"),
    width: "120px",
    sortable: false,
  },
  {
    hidden: true,
    key: "code_level",
    title: t("columns.code.codeLevel"),
    width: "120px",
    sortable: false,
  },
  {
    hidden: true,
    key: "code_group",
    title: t("columns.code.codeGroup"),
    width: "120px",
    sortable: false,
  },
  {
    hidden: true,
    key: "parent_key",
    title: t("columns.code.parentKey"),
    width: "120px",
    sortable: false,
  },
];

// 이벤트 핸들러들
const handleClose = () => {
  emit("close");
};

// CodeManagement.vue의 handleModalSave와 일치하는 함수명
const handleSave = () => {
  console.log("handleSave 호출됨");
  console.log("codeList.value:", codeList.value);
  console.log("codeList.value.length:", codeList.value.length);

  // 데이터가 비어있는지 확인
  if (!codeList.value || codeList.value.length === 0) {
    alert(t("messages.warning.pleaseSelectCodeGroupForMultiRegister"));
    return;
  }

  // 필수 필드 검증
  const invalidItems = codeList.value.filter((item) => {
    return (
      !item.code_key || !item.code_value || !item.code_group || !item.code_level
    );
  });

  if (invalidItems.length > 0) {
    console.error("필수 필드가 누락된 항목:", invalidItems);
    alert(t("messages.warning.pleaseCompleteAllFields"));
    return;
  }

  console.log("저장할 데이터:", codeList.value);
  emit("save", codeList.value);
};

// Excel 관련 함수들
const downloadExcelForm = () => {
  console.log("Excel 양식 다운로드");

  const link = document.createElement("a");
  link.href = "/form/코드등록양식.xlsx";
  link.download = "코드등록양식.xlsx";
  link.click();
};

const triggerExcelFileUpload = () => {
  excelFileInput.value?.click();
};

const handleExcelFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    console.log("Excel 파일 업로드:", file.name);
    parseExcelFile(file);
  }
};

const parseExcelFile = (file: File) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      // 첫 번째 시트 가져오기
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Excel 데이터를 JSON으로 변환
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      console.log(
        "parseExcelFile - Excel 데이터를 JSON으로 변환한 jsonData:",
        jsonData
      );

      // 헤더 행 제거하고 데이터만 추출
      const dataRows = jsonData.slice(1) as any[][];

      // 데이터를 CodeCreateRequest 형태로 변환
      const parsedData: CodeCreateRequest[] = dataRows
        .filter((row) =>
          row.some((cell) => cell !== undefined && cell !== null && cell !== "")
        )
        .map((row) => {
          return {
            code_key: String(row[0] || ""),
            code_value: String(row[1] || ""),
            code_value_en: String(row[2] || ""),
            code_order: String(row[3] || ""),
            is_active:
              String(row[4]) === "true" || String(row[4]) === "Y"
                ? true
                : false,
            is_leaf:
              String(row[5]) === "true" || String(row[5]) === "Y"
                ? true
                : false,
            is_admin_only:
              String(row[6]) === "true" || String(row[6]) === "Y"
                ? true
                : false,
            description: String(row[7] || ""),
            parent_key: props.selectedParentKey || "",
            code_level: props.selectedCodeLevel || "",
            code_group:
              searchCodeGroupInput.value || props.selectedCodeGroup?.key || "",
          };
        });

      console.log("변환된 데이터:", parsedData);
      console.log("변환된 데이터 개수:", parsedData.length);

      // 파싱된 데이터로 모달 테이블 덮어쓰기
      codeList.value = parsedData;

      console.log("codeList.value에 할당된 데이터:", codeList.value);
      console.log("codeList.value.length:", codeList.value.length);

      alert(t("messages.success.excelDataImported"));
    } catch (error: any) {
      console.error("Excel 파일 파싱 오류:", error);
      const errorMessage = translateMessage(
        error?.message,
        "messages.error.excelParseError"
      );
      alert(errorMessage);
    }
  };

  reader.readAsArrayBuffer(file);
};

// props 변경 감지하여 selectbox 값 업데이트 (CodeManagement.vue와 동일한 로직)
watch(
  () => [
    props.selectedCodeGroup,
    props.selectedCategory1,
    props.selectedCategory2,
    props.selectedCategory3,
  ],
  ([newCodeGroup, newCategory1, newCategory2, newCategory3]) => {
    if (newCodeGroup !== undefined) {
      searchCodeGroupInput.value = newCodeGroup.key;
    }
    if (newCategory1 !== undefined) {
      searchCategory1Input.value = newCategory1.key;
    }
    if (newCategory2 !== undefined) {
      searchCategory2Input.value = newCategory2.key;
    }
    if (newCategory3 !== undefined) {
      searchCategory3Input.value = newCategory3.key;
    }
  },
  { immediate: true }
);

// visible prop 변경 감지하여 모달이 열릴 때마다 DataTable 초기화
watch(
  () => props.visible,
  async (newVisible) => {
    if (newVisible) {
      // 모달이 열릴 때 DataTable 초기화
      codeList.value = [];
      console.log("다건등록 모달 열림 - DataTable 초기화됨");

      // 코드그룹이 없으면 코드그룹 목록 로드
      if (!props.selectedCodeGroup) {
        try {
          await loadCodeGroups();
        } catch (error) {
          console.error("코드그룹 목록 로드 실패:", error);
        }
      }
    }
  }
);

// 컴포넌트 마운트 시 코드그룹 목록 로드
onMounted(async () => {
  // 코드그룹이 없으면 코드그룹 목록 로드
  if (!props.selectedCodeGroup) {
    try {
      await loadCodeGroups();
    } catch (error) {
      console.error("코드그룹 목록 로드 실패:", error);
    }
  }
});
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container-large {
  background: white;
  border-radius: 8px;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

// 검색 섹션 스타일
.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-filters {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
  flex: 1;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background-color: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
    border-color: #d1d5db;
  }
}

// 액션 버튼 스타일
.modal-action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 20px;
}

.excel-upload-group {
  display: flex;
  align-items: center;
}

.modal-table-section {
  margin-bottom: 20px;
}
</style>
