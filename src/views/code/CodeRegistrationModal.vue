<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-container-large">
      <div class="modal-header">
        <h3>{{ t("common.registerCode") }}</h3>
        <button class="btn-close" @click="handleClose">×</button>
      </div>
      <div class="modal-body">
        <!-- Top Section - Search/Filter Controls -->
        <div class="search-section">
          <div class="search-filters">
            <div class="filter-group">
              <label class="filter-label"
                >⊙ {{ t("columns.code.codeGroup") }}</label
              >
              <select v-model="searchCodeGroup" class="filter-select">
                <option value="">{{ t("placeholder.selectGroupName") }}</option>
                <option
                  v-for="group in uniqueCodeGroups"
                  :key="group"
                  :value="group"
                >
                  {{ group }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label"
                >⊙ {{ t("columns.code.majorCategory") }}</label
              >
              <select v-model="searchMajorCategory" class="filter-select">
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="category in uniqueMajorCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label"
                >⊙ {{ t("columns.code.mediumCategory") }}</label
              >
              <select v-model="searchMediumCategory" class="filter-select">
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="category in uniqueMediumCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label"
                >⊙ {{ t("columns.code.minorCategory") }}</label
              >
              <select v-model="searchMinorCategory" class="filter-select">
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="category in uniqueMinorCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>
            <button class="btn-search" @click="handleSearch">
              {{ t("common.search") }}
            </button>
          </div>
        </div>

        <!-- 설명 입력 필드 -->
        <div class="description-section">
          <div class="description-group">
            <label class="description-label">{{
              t("columns.code.description")
            }}</label>
            <input
              v-model="description"
              type="text"
              class="description-input"
              :placeholder="t('placeholder.codeDescription')"
            />
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
              {{ t("common.excelRegister") }}
            </button>
          </div>
        </div>

        <!-- Data Table -->
        <div class="modal-table-section">
          <DataTable
            :columns="tableColumns"
            :data="codeList"
            :loading="loading"
            :selectable="true"
            :selected-items="selectedItems"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
            @row-click="handleRowClick"
          />
        </div>

        <!-- Pagination -->
        <div class="modal-pagination">
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
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
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import * as XLSX from "xlsx";

const { t } = useI18n();

interface CodeItem {
  id: string;
  codeGroup: string;
  highCode: string;
  codeName: string;
  codeNameKorean: string;
  rank: string;
  usage: string;
  etc: string;
  majorCategory?: string;
  mediumCategory?: string;
  minorCategory?: string;
}

interface Props {
  visible: boolean;
}

interface Emits {
  (e: "close"): void;
  (e: "save", data: CodeItem[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 검색 변수들
const searchCodeGroup = ref("");
const searchMajorCategory = ref("");
const searchMediumCategory = ref("");
const searchMinorCategory = ref("");
const description = ref("");

// 데이터 변수들
const codeList = ref<CodeItem[]>([]);
const loading = ref(false);
const selectedItems = ref<CodeItem[]>([]);

// 페이지네이션 변수들
const currentPage = ref(1);
const totalPages = ref(1);

// Excel 파일 input
const excelFileInput = ref<HTMLInputElement>();

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  {
    key: "codeGroup",
    title: t("columns.code.codeGroupName"),
    width: "120px",
    sortable: true,
  },
  {
    key: "highCode",
    title: t("columns.code.parentCode"),
    width: "100px",
    sortable: true,
  },
  {
    key: "codeNameKorean",
    title: t("columns.code.codeName"),
    width: "150px",
    sortable: true,
  },
  {
    key: "codeName",
    title: t("columns.code.code"),
    width: "100px",
    sortable: true,
  },
];

// 카테고리별 option용 computed
const uniqueCodeGroups = computed(() => {
  const set = new Set(codeList.value.map((item) => item.codeGroup));
  return Array.from(set);
});

const uniqueMajorCategories = computed(() => {
  return ["공정", "기계", "유형", "유입종류"];
});

const uniqueMediumCategories = computed(() => {
  return ["전처리", "후처리", "송풍기", "펌프"];
});

const uniqueMinorCategories = computed(() => {
  return ["1차", "2차", "3차"];
});

// 이벤트 핸들러들
const handleClose = () => {
  emit("close");
};

const handleSave = () => {
  emit("save", codeList.value);
};

const handleSearch = () => {
  console.log("모달 검색:", {
    codeGroup: searchCodeGroup.value,
    majorCategory: searchMajorCategory.value,
    mediumCategory: searchMediumCategory.value,
    minorCategory: searchMinorCategory.value,
  });
};

const handleSelectionChange = (selected: CodeItem[]) => {
  selectedItems.value = selected;
};

const handleSortChange = (sortInfo: {
  key: string;
  direction: "asc" | "desc";
}) => {
  console.log("모달 정렬 변경:", sortInfo);
};

const handleRowClick = (item: CodeItem) => {
  console.log("모달 행 클릭:", item);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  selectedItems.value = [];
};

// Excel 관련 함수들
const downloadExcelForm = () => {
  console.log("Excel 양식 다운로드");

  const link = document.createElement("a");
  link.href = "/form/코드등록Tmp.xlsx";
  link.download = "코드등록Tmp.xlsx";
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

      console.log("파싱된 Excel 데이터:", jsonData);

      // 헤더 행 제거하고 데이터만 추출
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];

      // 데이터를 CodeItem 형태로 변환
      const parsedData: CodeItem[] = dataRows
        .filter((row) =>
          row.some((cell) => cell !== undefined && cell !== null && cell !== "")
        )
        .map((row, index) => {
          const id = `excel_${Date.now()}_${index}`;

          return {
            id,
            codeGroup: row[0] || "",
            highCode: row[1] || "",
            codeName: row[2] || "",
            codeNameKorean: row[3] || "",
            rank: row[4]?.toString() || "",
            usage: row[5] || "",
            etc: row[6] || "",
          };
        });

      console.log("변환된 데이터:", parsedData);

      // 파싱된 데이터로 모달 테이블 덮어쓰기
      codeList.value = parsedData;

      alert(t("messages.success.excelDataImported"));
    } catch (error: any) {
      console.error("Excel 파일 파싱 오류:", error);
      const errorMessage =
        error?.message || t("messages.error.excelParseError");
      alert(errorMessage);
    }
  };

  reader.readAsArrayBuffer(file);
};

// 데이터 로드 함수
const loadData = async () => {
  loading.value = true;
  try {
    codeList.value = [
      {
        id: "modal1",
        codeGroup: "equipment",
        highCode: "",
        codeName: "ME02",
        codeNameKorean: "송풍기",
        rank: "1",
        usage: "Y",
        etc: "",
      },
      {
        id: "modal2",
        codeGroup: "equipment",
        highCode: "ME02",
        codeName: "AI0101",
        codeNameKorean: "터보블로워(VVVF)",
        rank: "1",
        usage: "Y",
        etc: "",
      },
    ];
  } catch (error: any) {
    console.error("모달 데이터 로드 실패:", error);
    const errorMessage = error?.message || "데이터 로드에 실패했습니다.";
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadData();
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

  .btn-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;

    &:hover {
      color: #374151;
    }
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
}

.btn-search {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-left: auto;

  &:hover {
    background-color: #2563eb;
  }
}

// 설명 섹션 스타일
.description-section {
  background: #f9fafb;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.description-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.description-input {
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

.modal-pagination {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

// 버튼 스타일
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &.btn-secondary {
    background-color: #6b7280;
    color: white;

    &:hover:not(:disabled) {
      background-color: #4b5563;
    }

    &:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
  }

  &.btn-primary {
    background-color: #3b82f6;
    color: white;

    &:hover:not(:disabled) {
      background-color: #2563eb;
    }

    &:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
  }

  &.btn-success {
    background-color: #10b981;
    color: white;

    &:hover {
      background-color: #059669;
    }
  }
}
</style>
