<template>
  <div class="excel-management-component">
    <div class="excel-section">
      <h2>Excel 테스트</h2>

      <!-- 액션 버튼 -->
      <div class="action-buttons">
        <button class="btn btn-success" @click="downloadExcelForm">
          Excel 양식 다운로드
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
            Excel 등록
          </button>
        </div>
        <button
          class="btn btn-info"
          @click="exportToExcel"
          :disabled="codeList.length === 0"
        >
          테이블 데이터 다운로드
        </button>
        <button
          class="btn btn-danger"
          @click="deleteSelectedRows"
          :disabled="selectedItems.length === 0"
        >
          선택한 행 삭제 ({{ selectedItems.length }}개)
        </button>
      </div>

      <!-- 데이터 테이블 -->
      <div class="table-section">
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

      <!-- 페이지네이션 -->
      <div class="pagination-section">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import * as XLSX from "xlsx";

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
    title: "코드 그룹명",
    width: "120px",
    sortable: true,
  },
  {
    key: "highCode",
    title: "상위 코드",
    width: "100px",
    sortable: true,
  },
  {
    key: "codeNameKorean",
    title: "코드명",
    width: "150px",
    sortable: true,
  },
  {
    key: "codeName",
    title: "코드",
    width: "100px",
    sortable: true,
  },
  {
    key: "rank",
    title: "순위",
    width: "80px",
    sortable: true,
  },
  {
    key: "usage",
    title: "사용여부",
    width: "100px",
    sortable: true,
  },
];

const handleSelectionChange = (selected: CodeItem[]) => {
  selectedItems.value = selected;
};

const handleSortChange = (sortInfo: {
  key: string;
  direction: "asc" | "desc";
}) => {
  console.log("정렬 변경:", sortInfo);
};

const handleRowClick = (item: CodeItem) => {
  console.log("행 클릭:", item);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  selectedItems.value = [];
};

// Excel 관련 함수들
const downloadExcelForm = () => {
  console.log("Excel 양식 다운로드");

  const link = document.createElement("a");
  link.href = "/form/ExcelTest.xlsx"; // 템플릿 파일
  link.download = "ExcelTest.xlsx"; // 다운로드 할때 파일명 설정
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

      // 파싱된 데이터로 테이블 덮어쓰기
      codeList.value = parsedData;

      alert("Excel 데이터가 성공적으로 가져와졌습니다.");
    } catch (error) {
      console.error("Excel 파일 파싱 오류:", error);
      alert("Excel 파일 파싱 중 오류가 발생했습니다.");
    }
  };

  reader.readAsArrayBuffer(file);
};

// 테이블 데이터를 Excel로 내보내기
const exportToExcel = () => {
  if (codeList.value.length === 0) {
    alert("내보낼 데이터가 없습니다.");
    return;
  }

  try {
    // 헤더 정의
    const headers = [
      "코드 그룹명",
      "상위 코드",
      "코드명",
      "코드",
      "순위",
      "사용여부",
      "기타",
    ];

    // 데이터 준비
    const data = codeList.value.map((item) => [
      item.codeGroup,
      item.highCode,
      item.codeNameKorean,
      item.codeName,
      item.rank,
      item.usage,
      item.etc,
    ]);

    // 헤더와 데이터 합치기
    const excelData = [headers, ...data];

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 15 }, // 코드 그룹명
      { wch: 12 }, // 상위 코드
      { wch: 20 }, // 코드명
      { wch: 12 }, // 코드
      { wch: 8 }, // 순위
      { wch: 10 }, // 사용여부
      { wch: 15 }, // 기타
    ];
    worksheet["!cols"] = columnWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, "코드 데이터");

    // 파일 다운로드
    const fileName = `코드데이터_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    console.log("Excel 파일 다운로드 완료:", fileName);
  } catch (error) {
    console.error("Excel 내보내기 오류:", error);
    alert("Excel 파일 생성 중 오류가 발생했습니다.");
  }
};

// 선택한 행 삭제
const deleteSelectedRows = () => {
  if (selectedItems.value.length === 0) {
    alert("삭제할 행을 선택해주세요.");
    return;
  }

  const confirmMessage = `선택한 ${selectedItems.value.length}개의 행을 삭제하시겠습니까?`;
  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    // 선택된 항목들의 ID 목록
    const selectedIds = selectedItems.value.map((item) => item.id);

    // 선택된 항목들을 제외한 새로운 배열 생성
    const filteredData = codeList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );

    // 데이터 업데이트
    codeList.value = filteredData;

    // 선택된 항목 초기화
    selectedItems.value = [];

    console.log(`${selectedIds.length}개의 행이 삭제되었습니다.`);
    alert(`${selectedIds.length}개의 행이 성공적으로 삭제되었습니다.`);
  } catch (error) {
    console.error("행 삭제 오류:", error);
    alert("행 삭제 중 오류가 발생했습니다.");
  }
};

// 데이터 로드 함수
const loadData = async () => {
  loading.value = true;
  try {
    codeList.value = [
      {
        id: "1",
        codeGroup: "equipment",
        highCode: "",
        codeName: "ME02",
        codeNameKorean: "송풍기",
        rank: "1",
        usage: "Y",
        etc: "",
      },
      {
        id: "2",
        codeGroup: "equipment",
        highCode: "ME02",
        codeName: "AI0101",
        codeNameKorean: "터보블로워(VVVF)",
        rank: "1",
        usage: "Y",
        etc: "",
      },
      {
        id: "3",
        codeGroup: "process",
        highCode: "",
        codeName: "PR01",
        codeNameKorean: "전처리",
        rank: "1",
        usage: "Y",
        etc: "",
      },
    ];
  } catch (error) {
    console.error("데이터 로드 실패:", error);
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
@use "sass:color";

.excel-management-component {
  background: $background-light;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  border: 1px solid $border-color;
}

.excel-section {
  h2 {
    color: $text-color;
    margin-bottom: $spacing-lg;
    font-size: $font-size-lg;
  }
}

// 액션 버튼 스타일
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.excel-upload-group {
  display: flex;
  align-items: center;
}

.table-section {
  margin-bottom: $spacing-lg;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-lg;
}

// 버튼 스타일
.btn {
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $border-radius-sm;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-weight-md;
  transition: all 0.2s;

  &.btn-secondary {
    background-color: $background-darker;
    color: white;

    &:hover:not(:disabled) {
      background-color: color.scale($background-darker, $lightness: -10%);
    }

    &:disabled {
      background-color: $border-color;
      cursor: not-allowed;
    }
  }

  &.btn-primary {
    background-color: $primary-color;
    color: white;

    &:hover:not(:disabled) {
      background-color: color.scale($primary-color, $lightness: -10%);
    }

    &:disabled {
      background-color: $border-color;
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

  &.btn-info {
    background-color: #06b6d4;
    color: white;

    &:hover:not(:disabled) {
      background-color: #0891b2;
    }

    &:disabled {
      background-color: $border-color;
      cursor: not-allowed;
    }
  }
}
</style>
