<template>
  <div class="process-page">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="searchOption" class="label-title">{{
            t("process.processType")
          }}</label>
          <div class="form-item">
            <select
              id="searchOption"
              v-model="searchOptionInput"
              class="form-select"
              @change="handleSearchOptionChange"
            >
              <option value=""></option>
              <option 
                v-for="option in searchProcessTypeOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="group-form">
          <label for="searchSubCategory" class="label-title">{{ t("process.middleClassi") }}</label>
          <div class="form-item">
            <select
              id="searchSubCategory"
              v-model="searchSubCategoryInput"
              class="form-select"
              @change="handleSubCategoryChange"
            >
              <option value=""></option>
              <option 
                v-for="option in searchSubCategoryOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        <div class="group-form">
          <label for="searchQuery" class="label-title">{{
            t("process.processName")
          }}</label>
          <div class="form-item">
            <select
              id="searchProcessName"
              v-model="searchQueryInput"
              class="form-select"
            >
              <option value=""></option>
              <option 
                v-for="option in searchProcessNameOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
          <button class="btn-search" @click="handleSearch">
            {{ t("common.search") }}
          </button>
        </div>
      </div>
      <div class="btns">
        <button class="btn btn-primary btn-regist" @click="handleRegist">
          {{ t("common.register") }}
        </button>
        <button
          class="btn btn-primary btn-delete"
          @click="handleDelete"
          :disabled="selectedItems.length === 0"
        >
          {{ t("process.deleteSelected") }}
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
        <button class="btn-view" @click.stop="viewDetail(item)">
          {{ t("process.viewDetail") }}
        </button>
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
          <h3>{{ t("process.registerProcess") }}</h3>
          <button class="btn-close" @click="closeRegistModal">×</button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt class="essential">{{ t("process.processType") }}</dt>
            <dd>
              <select
                v-model="registForm.processType"
                class="form-select"
                required
              >
                <option value="">{{ t("common.select") }}</option>
                <option 
                  v-for="option in processTypeOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </dd>
            <dt class="essential">{{ t("process.middleClassi") }}</dt>
            <dd>
              <select
                v-model="registForm.processSubCategory"
                class="form-select"
                required
              >
                <option value="">{{ t("common.select") }}</option>
                <option value="mechanical">기계</option>
                <option value="electrical">전기</option>
                <option value="civil">토목</option>
                <option value="chemical">화학</option>
                <option value="instrumentation">계측</option>
              </select>
            </dd>
            <dt class="essential">{{ t("process.processName") }}</dt>
            <dd>
              <select
                v-model="registForm.processNm"
                class="form-select"
                required
              >
                <option value="">{{ t("common.select") }}</option>
                <option value="3D 모델링">{{ t("process.3dModeling") }}</option>
                <option value="CAD 도면">{{ t("process.cadDrawing") }}</option>
                <option value="품질 검사">
                  {{ t("process.qualityInspection") }}
                </option>
                <option value="용접 작업">
                  {{ t("process.weldingWork") }}
                </option>
                <option value="구조 분석">
                  {{ t("process.structuralAnalysis") }}
                </option>
                <option value="안전 검토">
                  {{ t("process.safetyReview") }}
                </option>
                <option value="조립 작업">
                  {{ t("process.assemblyWork") }}
                </option>
                <option value="배관 설계">
                  {{ t("process.pipelineDesign") }}
                </option>
                <option value="기술 검토">
                  {{ t("process.technicalReview") }}
                </option>
                <option value="도장 작업">
                  {{ t("process.paintingWork") }}
                </option>
                <option value="전기 설계">
                  {{ t("process.electricalDesign") }}
                </option>
                <option value="시스템 통합">
                  {{ t("process.systemIntegration") }}
                </option>
                <option value="테스트 검증">
                  {{ t("process.testVerification") }}
                </option>
                <option value="설치 작업">
                  {{ t("process.installationWork") }}
                </option>
                <option value="운영 매뉴얼">
                  {{ t("process.operationManual") }}
                </option>
              </select>
            </dd>
            <dt>{{ t("process.mode") }}</dt>
            <dd>
              <input
                type="text"
                v-model="registForm.mode"
                class="form-input"
                :placeholder="t('placeholder.processMode')"
              />
            </dd>
            <dt class="essential">{{ t("process.processSymbol") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  class="file-name-input"
                  :value="selectedFiles.processSymbolFile?.name || ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileChange('processSymbolFile', $event)"
                    accept="image/*,.svg"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
            <dt class="essential">{{ t("process.calculation") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  class="file-name-input"
                  :value="selectedFiles.calculationFile?.name || ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileChange('calculationFile', $event)"
                    accept=".xlsx,.xls,.csv"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
            <dt>{{ t("process.pdf") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  class="file-name-input"
                  :value="selectedFiles.pdfFile?.name || ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileChange('pdfFile' as any, $event)"
                    accept=".pdf"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
            <dt>{{ t("process.electricDrawing") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  class="file-name-input"
                  :value="selectedFiles.electricFile?.name || ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileChange('electricFile' as any, $event)"
                    accept=".dwg,.dxf"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
            <dt>{{ t("process.mccDiagram") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  class="file-name-input"
                  :value="selectedFiles.mccFile?.name || ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileChange('mccFile' as any, $event)"
                    accept=".dwg,.dxf"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
            <dt class="essential">{{ t("process.pid") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  class="file-name-input"
                  :value="selectedFiles.pidFile?.name || ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileChange('pidFile', $event)"
                    accept=".dwg,.dxf"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
            <dt class="essential">{{ t("process.mappingExcel") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  class="file-name-input"
                  :value="selectedFiles.excelFile?.name || ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileChange('excelFile', $event)"
                    accept=".xlsx,.xls"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
            <!-- <dt>{{ t('process.pidInfoOverview') }}</dt>
            <dd>
              <input
                type="text"
                v-model="registForm.pidInfo"
                class="form-input"
                :placeholder="t('process.pidInfoPlaceholder')"
              />
            </dd> -->
            <dt>{{ t("process.consistencyCheck") }}</dt>
            <dd>
              <label for="consistencyCheck">
                <input
                  type="checkbox"
                  id="consistencyCheck"
                  v-model="registForm.consistencyCheck"
                />
                {{ t("process.consistencyCheckDescription") }}
              </label>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRegistModal">
            {{ t("common.cancel") }}
          </button>
          <button
            class="btn btn-primary"
            @click="handleSave"
            :disabled="!isFormValid"
          >
            {{ t("common.save") }}
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
import { useI18n } from "vue-i18n";

import { isCurrentTokenValid } from "../../utils/tokenManager";
import { useAuthStore } from "../../stores/authStore";
import { request } from "../../utils/request";

// 쿠키 확인 유틸리티 함수
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

// 실제 쿠키 이름을 찾는 함수
const findCookieByName = (patterns: string[]): string | null => {
  for (const pattern of patterns) {
    if (hasCookie(pattern)) {
      return pattern;
    }
  }
  return null;
};

const { t } = useI18n();

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
  processSubCategory: string;
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
  { key: "processType", title: t("process.processType"), sortable: true },
  { key: "processNm", title: t("process.processName"), sortable: true },
  { key: "mode", title: t("process.mode"), sortable: true },
  { key: "processSymbol", title: t("process.processSymbol"), sortable: true },
  {
    key: "viewDetail",
    title: t("process.viewDetail"),
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
const searchSubCategoryInput = ref("");
const searchQueryInput = ref("");
const searchOption = ref("");
const searchSubCategory = ref("");
const searchQuery = ref("");
const isRegistModalOpen = ref(false);

// 공정구분 콤보박스 옵션 (동적으로 생성)
const processTypeOptions = ref<{ value: string; label: string }[]>([]);

// 검색 옵션 세렉트박스 옵션 (동적으로 생성)
const searchProcessTypeOptions = ref<{ value: string; label: string }[]>([]);

// 중분류 검색 옵션 세렉트박스 옵션 (동적으로 생성)
const searchSubCategoryOptions = ref<{ value: string; label: string }[]>([]);

// 공정명 검색 옵션 세렉트박스 옵션 (동적으로 생성)
const searchProcessNameOptions = ref<{ value: string; label: string }[]>([]);

// 중분류 변경 핸들러
const handleSubCategoryChange = () => {
  const selectedValue = searchSubCategoryInput.value;
  
  if (selectedValue === "") {
    // 공백값이 선택된 경우 공정명 옵션 초기화
    searchProcessNameOptions.value = [];
    searchQueryInput.value = "";
    console.log("중분류 변경: 공백값 선택 - 공정명 옵션 초기화");
  } else {
    console.log("중분류 변경:", selectedValue);
    handleProcessNameCodeSearch();
  }
};

// 등록 폼 데이터
const registForm = ref<RegistForm>({
  processType: "",
  processSubCategory: "",
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

// 파일 선택 관련 상태
const selectedFiles = ref<{ [key: string]: File }>({});

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
    processSubCategory: "",
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
    const file = target.files[0];
    (registForm.value as any)[field] = file;
    // 파일명 표시를 위해 selectedFiles에도 저장
    selectedFiles.value[field] = file;
  }
};

const handleSave = async () => {
  try {
    // 정합성 체크
    if (registForm.value.consistencyCheck) {
      // 정합성 체크 로직
      alert(t("messages.warning.consistencyCheckLogicRequired"));
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

    alert(t("messages.success.processRegistered"));
    closeRegistModal();
  } catch (error: any) {
    console.error("등록 실패:", error);
    const errorMessage =
      error?.message || t("messages.error.registrationError");
    alert(errorMessage);
  }
};

const handleDelete = () => {
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }
  if (
    confirm(
      t("messages.confirm.deleteItems", { count: selectedItems.value.length })
    )
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
    alert(t("messages.success.deleted"));
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
  } catch (error: any) {
    console.error("데이터 로드 실패:", error);
    const errorMessage = error?.message || "데이터 로드에 실패했습니다.";
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

// 선택된 항목 변경 핸들러
const handleSelectionChange = (items: ProcessItem[]) => {
  selectedItems.value = items;
  console.log("선택된 항목:", selectedItems.value);
};

// 검색 옵션 변경 핸들러
const handleSearchOptionChange = () => {
  const selectedValue = searchOptionInput.value;
  
  if (selectedValue === "") {
    // 공백값이 선택된 경우 중분류 옵션 초기화
    searchSubCategoryOptions.value = [];
    searchSubCategoryInput.value = "";
    // 공정명 옵션도 초기화
    searchProcessNameOptions.value = [];
    searchQueryInput.value = "";
    console.log("검색 옵션 변경: 공백값 선택 - 중분류 및 공정명 옵션 초기화");
  } else {
    const selectedOption = searchProcessTypeOptions.value.find(option => option.value === selectedValue);
    
    if (selectedOption) {
      console.log("검색 옵션 변경:");
      console.log("  key:", selectedOption.value);
      console.log("  value:", selectedOption.label);
      // 공정명 옵션 초기화
      searchProcessNameOptions.value = [];
      searchQueryInput.value = "";
      handleMiddleCodeSearch();
    } else {
      console.log("검색 옵션 변경: 선택되지 않음");
    }
  }
};

// 검색 기능 구현
const handleSearch = () => {
  //검색시 선택된 항목 초기화
  selectedItems.value = [];
  searchOption.value = searchOptionInput.value;
  searchSubCategory.value = searchSubCategoryInput.value;
  searchQuery.value = searchQueryInput.value;
  currentPage.value = 1;
};

//공정구분분 select 항목 공통코드 조회
const handleProcessCodeSearch = async () => {
  try {
    loading.value = true;
    console.log("공정 코드 검색 시작: /api/process/code/search");
    
    const requestData = {
      search_field: 'parent_key',
      search_value: 'PRC_FLW',
      order_by: 'code_order',
      order_direction: 'asc'
    };

    const result = await request("/api/process/code/search", undefined, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    
    console.log("API 응답:", result);
    
    if (result.success) {
      console.log("API 응답 데이터:", result.response);
      
             // result.response에서 code_key를 키로, code_value를 값으로 하는 공정구분 콤보 옵션 생성
       if (result.response && Array.isArray(result.response)) {
         processTypeOptions.value = result.response.map((item: any) => ({
           value: item.code_key,
           label: item.code_value
         }));
         
         // 검색 옵션 세렉트박스도 동일한 데이터로 설정
         searchProcessTypeOptions.value = result.response.map((item: any) => ({
           value: item.code_key,
           label: item.code_value
         }));
         
         console.log("생성된 공정구분 옵션:", processTypeOptions.value);
         console.log("생성된 검색 옵션:", searchProcessTypeOptions.value);
         //alert(`공정 코드 검색 테스트 성공!\n생성된 옵션 수: ${processTypeOptions.value.length}\n첫 번째 옵션: ${processTypeOptions.value[0]?.label || '없음'}`);
       } else {
         //alert(`공정 코드 검색 테스트 성공!\n응답 데이터: ${JSON.stringify(result.response, null, 2)}`);
       }
    } else {
      alert(`공정 코드 검색 테스트 실패: ${result.message}`);
    }
    
  } catch (error: any) {
    console.error("공정 코드 검색 테스트 실패:", error);
    const errorMessage = error.message || error.response || '알 수 없는 오류가 발생했습니다.';
    alert(`공정 코드 검색 테스트 실패: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
};

//중분류 select 항목 공통코드 조회
const handleMiddleCodeSearch = async () => {
  try {
    loading.value = true;
    console.log("중분류 코드 검색 시작: /api/process/code/search");
    
    const requestData = {
      search_field: 'parent_key',
      search_value: searchOptionInput.value,
      order_by: 'code_order',
      order_direction: 'asc'
    };

    const result = await request("/api/process/code/search", undefined, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    
    console.log("API 응답:", result);
    
    if (result.success) {
      console.log("API 응답 데이터:", result.response);
      
      // result.response에서 code_key를 키로, code_value를 값으로 하는 중분류 콤보 옵션 생성
      if (result.response && Array.isArray(result.response)) {
        searchSubCategoryOptions.value = result.response.map((item: any) => ({
          value: item.code_key,
          label: item.code_value
        }));
        
        console.log("생성된 중분류 옵션:", searchSubCategoryOptions.value);
      } else {
        console.log("중분류 데이터가 없습니다.");
      }
    } else {
      alert(`중분류 코드 검색 실패: ${result.message}`);
    }
    
  } catch (error: any) {
    console.error("중분류 코드 검색 실패:", error);
    const errorMessage = error.message || error.response || '알 수 없는 오류가 발생했습니다.';
    alert(`중분류 코드 검색 실패: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
};

//공정명 select 항목 공통코드 조회
const handleProcessNameCodeSearch = async () => {
  try {
    loading.value = true;
    console.log("중분류 코드 검색 시작: /api/process/code/search");
    
    const requestData = {
      search_field: 'parent_key',
      search_value: searchSubCategoryInput.value,
      order_by: 'code_order',
      order_direction: 'asc'
    };

    const result = await request("/api/process/code/search", undefined, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    
    console.log("API 응답:", result);
    
    if (result.success) {
      console.log("API 응답 데이터:", result.response);
      
      // result.response에서 code_key를 키로, code_value를 값으로 하는 공정명 콤보 옵션 생성
      if (result.response && Array.isArray(result.response)) {
        searchProcessNameOptions.value = result.response.map((item: any) => ({
          value: item.code_key,
          label: item.code_value
        }));
        
        console.log("생성된 공정명 옵션:", searchProcessNameOptions.value);
      } else {
        console.log("공정명 데이터가 없습니다.");
      }
    } else {
      alert(`공정명 코드 검색 실패: ${result.message}`);
    }
    
  } catch (error: any) {
    console.error("공정명 코드 검색 실패:", error);
    const errorMessage = error.message || error.response || '알 수 없는 오류가 발생했습니다.';
    alert(`공정명 코드 검색 실패: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  loadProcessList();
  // 초기 공정구분 옵션 로드 - handleProcessCodeSearch 함수 사용
  handleProcessCodeSearch();
});


</script>

<style scoped lang="scss">
.process-page {
  padding: $spacing-lg;
}

.process-3d-page {
  padding: $spacing-lg;
}

.action-bar {
  display: flex;
  margin-bottom: $spacing-lg;
}
</style>
