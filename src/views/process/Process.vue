<template>
  <div class="process-page">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="searchOption" class="label-search">검색</label>
          <label for="searchOption" class="label-title">공정구분</label>
          <div class="form-item">
            <select
              id="searchOption"
              v-model="searchOptionInput"
              class="form-select"
            >
              <option value="">항목을 선택해주세요</option>
              <option value="processType">공정구분</option>
              <option value="processNm">공정명</option>
              <option value="mode">모드</option>
              <option value="processSymbol">공정심볼</option>
            </select>
          </div>
        </div>
        <div class="group-form">
          <label for="searchQuery" class="label-title">공정명</label>
          <div class="form-item">
            <input
              type="text"
              id="search"
              placeholder="검색어를 입력하세요."
              v-model="searchQueryInput"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn-search" @click="handleSearch">검색</button>
        </div>
      </div>
      <div class="btns">
        <button class="btn btn-primary btn-regist" @click="handleRegist">
          등록
        </button>
        <button
          class="btn btn-primary btn-delete"
          @click="handleDelete"
          :disabled="selectedItems.length === 0"
        >
          선택 삭제
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <!-- DataTable row-key가 default로 id로 설정돼있어서 추가 수정함함 -->
    <DataTable
      :columns="tableColumns"
      :data="paginatedProcessList"
      :loading="loading"
      :selectable="true"
      :selected-items="selectedItems"
      row-key="id"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <!-- 수정 버튼 슬롯 -->
      <template #cell-viewDetail="{ item }">
        <button class="btn-view" @click.stop="viewDetail(item)">보기</button>
      </template>
    </DataTable>

    <!-- Pagination -->
    <div class="pagination-container">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPagesComputed"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 등록 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>공정 등록</h3>
          <button class="btn-close" @click="closeRegistModal">×</button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt class="essential">공정구분</dt>
            <dd>
              <select
                v-model="registForm.processType"
                class="form-select"
                required
              >
                <option value="">선택</option>
                <option value="제작">제작</option>
                <option value="설계">설계</option>
                <option value="검토">검토</option>
                <option value="조립">조립</option>
                <option value="검사">검사</option>
              </select>
            </dd>
            <dt class="essential">공정명</dt>
            <dd>
              <select
                v-model="registForm.processNm"
                class="form-select"
                required
              >
                <option value="">선택</option>
                <option value="3D 모델링">3D 모델링</option>
                <option value="CAD 도면">CAD 도면</option>
                <option value="품질 검사">품질 검사</option>
                <option value="용접 작업">용접 작업</option>
                <option value="구조 분석">구조 분석</option>
                <option value="안전 검토">안전 검토</option>
                <option value="조립 작업">조립 작업</option>
                <option value="배관 설계">배관 설계</option>
                <option value="기술 검토">기술 검토</option>
                <option value="도장 작업">도장 작업</option>
                <option value="전기 설계">전기 설계</option>
                <option value="시스템 통합">시스템 통합</option>
                <option value="테스트 검증">테스트 검증</option>
                <option value="설치 작업">설치 작업</option>
                <option value="운영 매뉴얼">운영 매뉴얼</option>
              </select>
            </dd>
            <dt>모드</dt>
            <dd>
              <input
                type="text"
                v-model="registForm.mode"
                class="form-input"
                placeholder="모드를 입력하세요"
              />
            </dd>
            <dt class="essential">공정심볼</dt>
            <dd>
              <input
                type="file"
                @change="handleFileChange('processSymbolFile', $event)"
                accept="image/*,.svg"
              />
            </dd>
            <dt class="essential">계산식</dt>
            <dd>
              <input
                type="file"
                @change="handleFileChange('calculationFile', $event)"
                accept=".xlsx,.xls,.csv"
              />
            </dd>
            <dt>PDF</dt>
            <dd>
              <input
                type="file"
                @change="handleFileChange('pdfFile', $event)"
                accept=".pdf"
              />
            </dd>
            <dt>전기도면</dt>
            <dd>
              <input
                type="file"
                @change="handleFileChange('electricFile', $event)"
                accept=".dwg,.dxf"
              />
            </dd>
            <dt>Mcc구성도</dt>
            <dd>
              <input
                type="file"
                @change="handleFileChange('mccFile', $event)"
                accept=".dwg,.dxf"
              />
            </dd>
            <dt class="essential">P&ID</dt>
            <dd>
              <input
                type="file"
                @change="handleFileChange('pidFile', $event)"
                accept=".dwg,.dxf"
              />
            </dd>
            <dt class="essential">매핑테이블 Excel</dt>
            <dd>
              <input
                type="file"
                @change="handleFileChange('excelFile', $event)"
                accept=".xlsx,.xls"
              />
            </dd>
            <!-- <dt>P&ID 정보개요</dt>
            <dd>
              <input
                type="text"
                v-model="registForm.pidInfo"
                class="form-input"
                placeholder="P&ID 정보개요를 입력하세요"
              />
            </dd> -->
            <dt>정합성 체크</dt>
            <dd>
              <label for="consistencyCheck">
                <input
                  type="checkbox"
                  id="consistencyCheck"
                  v-model="registForm.consistencyCheck"
                />
                정합성 체크를 수행합니다.
              </label>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRegistModal">
            취소
          </button>
          <button
            class="btn btn-primary"
            @click="handleSave"
            :disabled="!isFormValid"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";

interface ProcessItem {
  id: string;
  processType: string;
  processNm: string;
  mode: string;
  processSymbol: string;
  viewDetail: string | null;
}

interface RegistForm {
  processType: string;
  processNm: string;
  mode: string;
  processSymbol: string;
  pidInfo: string;
  consistencyCheck: boolean;
  processSymbolFile: File | null;
  calculationFile: File | null;
  pidFile: File | null;
  excelFile: File | null;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "processType", title: "공정구분", sortable: true },
  { key: "processNm", title: "공정명", sortable: true },
  { key: "mode", title: "모드", sortable: true },
  { key: "processSymbol", title: "공정심볼", sortable: true },
  {
    key: "viewDetail",
    title: "상세보기",
    sortable: false,
    formatter: (value) => formatDate(value),
  },
];

const processList = ref<ProcessItem[]>([]);
const selectedItems = ref<ProcessItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(999);
const pageSize = ref(10);
const totalCount = ref(0);
const sortColumn = ref<string | null>(null);
const sortOrder = ref<"asc" | "desc" | null>(null);
const searchOptionInput = ref("");
const searchQueryInput = ref("");
const searchOption = ref("");
const searchQuery = ref("");
const isRegistModalOpen = ref(false);

// 등록 폼 데이터
const registForm = ref<RegistForm>({
  processType: "",
  processNm: "",
  mode: "",
  processSymbol: "",
  pidInfo: "",
  consistencyCheck: false,
  processSymbolFile: null,
  calculationFile: null,
  pidFile: null,
  excelFile: null,
});

// 폼 유효성 검사
const isFormValid = computed(() => {
  return (
    registForm.value.processType.trim() !== "" &&
    registForm.value.processNm.trim() !== ""
  );
});

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ko-KR");
};

const handleRegist = () => {
  isRegistModalOpen.value = true;
};

const closeRegistModal = () => {
  isRegistModalOpen.value = false;
  // 폼 초기화
  registForm.value = {
    processType: "",
    processNm: "",
    mode: "",
    processSymbol: "",
    pidInfo: "",
    consistencyCheck: false,
    processSymbolFile: null,
    calculationFile: null,
    pidFile: null,
    excelFile: null,
  };
};

const handleFileChange = (field: keyof RegistForm, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    (registForm.value as any)[field] = target.files[0];
  }
};

const handleSave = async () => {
  try {
    // 정합성 체크
    if (registForm.value.consistencyCheck) {
      // 정합성 체크 로직
      alert("정합성 체크 로직 구현해야함");
      return;
    }

    // 새 공정 데이터 생성
    const newProcess: ProcessItem = {
      id: `process_${Date.now()}`, // 고유 ID 생성
      processType: registForm.value.processType,
      processNm: registForm.value.processNm,
      mode: registForm.value.mode,
      processSymbol: registForm.value.processSymbolFile
        ? registForm.value.processSymbolFile.name
        : "📄",
      viewDetail: "",
    };

    // 실제 API 호출 대신 로컬 데이터에 추가
    processList.value.unshift(newProcess); // 맨 앞에 추가
    totalCount.value = processList.value.length;
    totalPages.value = Math.ceil(totalCount.value / pageSize.value);

    // 파일 업로드 처리 (실제로는 서버에 업로드)
    if (registForm.value.processSymbolFile) {
      console.log("공정심볼 파일:", registForm.value.processSymbolFile.name);
    }
    if (registForm.value.calculationFile) {
      console.log("계산식 파일:", registForm.value.calculationFile.name);
    }
    if (registForm.value.pidFile) {
      console.log("P&ID 파일:", registForm.value.pidFile.name);
    }
    if (registForm.value.excelFile) {
      console.log("Excel 파일:", registForm.value.excelFile.name);
    }

    alert("공정이 성공적으로 등록되었습니다.");
    closeRegistModal();
  } catch (error) {
    console.error("등록 실패:", error);
    alert("등록 중 오류가 발생했습니다.");
  }
};

const handleDelete = () => {
  if (selectedItems.value.length === 0) {
    alert("삭제할 항목을 선택하세요.");
    return;
  }
  if (
    confirm(`선택된 ${selectedItems.value.length}개의 항목을 삭제하시겠습니까?`)
  ) {
    console.log("삭제할 항목:", selectedItems.value);
    const selectedProcessNms = selectedItems.value.map(
      (item) => item.processNm
    );
    processList.value = processList.value.filter(
      (item) => !selectedProcessNms.includes(item.processNm)
    );
    totalCount.value = processList.value.length;
    totalPages.value = Math.ceil(totalCount.value / pageSize.value);
    selectedItems.value = [];
    alert("삭제되었습니다.");
  }
};

// 상세 보기 이동
const router = useRouter();
const viewDetail = (item: ProcessItem) => {
  if (item.processNm) {
    router.push({ name: "ProcessDetail", params: { id: item.processNm } });
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  //loadProcessList();
};

const handleSortChange = (sortInfo: {
  key: string;
  direction: "asc" | "desc";
}) => {
  sortColumn.value = sortInfo.key;
  sortOrder.value = sortInfo.direction;
};

const handleRowClick = (item: ProcessItem, index: number) => {
  console.log("Row clicked:", item, index);
  // 행 클릭 시 상세 페이지로 이동하거나 모달 열기 등
};

// --- computed로 페이징 및 필터 처리 ---
const filteredProcessList = computed(() => {
  if (searchOption.value && searchQuery.value) {
    return processList.value.filter((process) => {
      const key = searchOption.value as keyof ProcessItem;
      return (
        process[key] &&
        process[key]!.toString()
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      );
    });
  }
  return processList.value;
});

const totalCountComputed = computed(() => filteredProcessList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);

const paginatedProcessList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProcessList.value.slice(start, end);
});

const loadProcessList = async (sortInfo?: {
  key: string;
  direction: "asc" | "desc";
}) => {
  loading.value = true;
  try {
    // API 호출로 데이터 로드
    // 임시 샘플 데이터
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 로딩 시뮬레이션

    processList.value = [
      {
        id: "1",
        processType: "제작",
        processNm: "3D 모델링",
        mode: "3D",
        processSymbol: "🔧",
        viewDetail: "",
      },
      {
        id: "2",
        processType: "설계",
        processNm: "CAD 도면",
        mode: "2D",
        processSymbol: "📐",
        viewDetail: "",
      },
      {
        id: "3",
        processType: "검토",
        processNm: "품질 검사",
        mode: "검사",
        processSymbol: "🔍",
        viewDetail: "",
      },
      {
        id: "4",
        processType: "제작",
        processNm: "용접 작업",
        mode: "용접",
        processSymbol: "⚡",
        viewDetail: "",
      },
      {
        id: "5",
        processType: "설계",
        processNm: "구조 분석",
        mode: "분석",
        processSymbol: "📊",
        viewDetail: "",
      },
      {
        id: "6",
        processType: "검토",
        processNm: "안전 검토",
        mode: "검토",
        processSymbol: "🛡️",
        viewDetail: "",
      },
      {
        id: "7",
        processType: "제작",
        processNm: "조립 작업",
        mode: "조립",
        processSymbol: "🔩",
        viewDetail: "",
      },
      {
        id: "8",
        processType: "설계",
        processNm: "배관 설계",
        mode: "2D",
        processSymbol: "🔗",
        viewDetail: "",
      },
      {
        id: "9",
        processType: "검토",
        processNm: "기술 검토",
        mode: "검토",
        processSymbol: "📋",
        viewDetail: "",
      },
      {
        id: "10",
        processType: "제작",
        processNm: "도장 작업",
        mode: "도장",
        processSymbol: "🎨",
        viewDetail: "",
      },
      {
        id: "11",
        processType: "설계",
        processNm: "전기 설계",
        mode: "2D",
        processSymbol: "⚡",
        viewDetail: "",
      },
    ];

    totalCount.value = processList.value.length;
    totalPages.value = Math.ceil(totalCount.value / pageSize.value);

    console.log("Sort info:", sortInfo);
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  } finally {
    loading.value = false;
  }
};

// 선택된 항목 변경 핸들러
const handleSelectionChange = (items: ProcessItem[]) => {
  selectedItems.value = items;
  console.log("선택된 항목:", selectedItems.value);
};

// 검색 기능 구현
const handleSearch = () => {
  //검색시 선택된 항목 초기화
  selectedItems.value = [];
  searchOption.value = searchOptionInput.value;
  searchQuery.value = searchQueryInput.value;
  currentPage.value = 1;
};

onMounted(() => {
  loadProcessList();
});
</script>

<style scoped lang="scss">
.process-3d-page {
  padding: $spacing-lg;
}

.action-bar {
  display: flex;
  margin-bottom: $spacing-lg;
}

.pagination-container {
  margin-top: 1rem;
}
</style>
