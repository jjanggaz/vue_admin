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
              id="searchProcessType"
              v-model="searchProcessType"
              class="form-select"
              @change="handleSearchProcessTypeChange"
            >
              <option :value="null">{{ t("common.select") }}</option>
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
          <label for="searchSubCategory" class="label-title">{{ t("process.subCategory") }}</label>
          <div class="form-item">
            <select
              id="searchSubCategory"
              v-model="searchSubCategoryInput"
              class="form-select"
              @change="handleSubCategoryChange"
            >
              <option :value="null">{{ t("common.select") }}</option>
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
          <label for="searchProcessName" class="label-title">{{
            t("process.processName")
          }}</label>
          <div class="form-item">
            <select
              id="searchProcessName"
              v-model="searchProcessName"
              class="form-select"
            >
              <option :value="null">{{ t("common.select") }}</option>
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
                @change="handleRegistProcessTypeChange"
              >
                <option :value="null">{{ t("common.select") }}</option>
                <option 
                  v-for="option in searchProcessTypeOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
              </option>
              </select>
            </dd>
            <dt class="essential">{{ t("process.subCategory") }}</dt>
            <dd>
              <select
                v-model="registForm.processSubCategory"
                class="form-select"
                required
                @change="handleRegistSubCategoryChange"
              >
                <option :value="null">{{ t("common.select") }}</option>
                <option 
                  v-for="option in searchSubCategoryOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </dd>
            <dt class="essential">{{ t("process.processName") }}</dt>
            <dd>
              <select
                v-model="registForm.processNm"
                class="form-select"
                required
              >
                <option :value="null">{{ t("common.select") }}</option>
                <option 
                  v-for="option in searchProcessNameOptions" 
                  :key="option.value" 
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
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
  process_id: string;
  process_type: string;
  process_type_nm: string;
  process_nm: string;
  sub_category: string;
  sub_category_nm: string;
  process_code: string;
  process_symbol: string;
  viewDetail: string | null;
}

interface RegistForm {
  processType: string | null;
  processSubCategory: string | null;
  processNm: string | null;
  subCategory: string;
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
  { key: "process_id", title: "Process ID", sortable: false, hidden: true }, // process_id (숨김)
  { key: "process_type_nm", title: t("process.processType"), sortable: true }, // 공정구분
  { key: "sub_category_nm", title: t("process.subCategory"), sortable: true }, // 공정 중분류
  { key: "process_nm", title: t("process.processName"), sortable: true }, // 공정명
  { key: "process_symbol", title: t("process.processSymbol"), sortable: true }, // 공정심볼
  {
    key: "viewDetail",
    title: t("process.viewDetail"),
    sortable: false,
    formatter: (value) => formatDate(value),
  }, // 상세보기
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
const searchProcessType = ref<string | null>(null);
const searchSubCategoryInput = ref<string | null>(null);
const searchProcessName = ref<string | null>(null);
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
  
  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 공정명 옵션 초기화
    searchProcessNameOptions.value = [];
    searchProcessName.value = null;
    console.log("중분류 변경: null 또는 공백값 선택 - 공정명 옵션 초기화");
  } else {
    console.log("중분류 변경:", selectedValue);
    handleProcessNameCodeSearch();
  }
};

// 등록 모달 공정구분 변경 핸들러
const handleRegistProcessTypeChange = () => {
  const selectedValue = registForm.value.processType;
  
  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 중분류 및 공정명 옵션 초기화
    searchSubCategoryOptions.value = [];
    searchProcessNameOptions.value = [];
    registForm.value.processSubCategory = null;
    registForm.value.processNm = null;
    console.log("등록 모달 공정구분 변경: null 또는 공백값 선택 - 중분류 및 공정명 옵션 초기화");
  } else {
    console.log("등록 모달 공정구분 변경:", selectedValue);
    // 중분류 옵션 로드
    handleRegistMiddleCodeSearch();
  }
};

// 등록 모달 중분류 변경 핸들러
const handleRegistSubCategoryChange = () => {
  const selectedValue = registForm.value.processSubCategory;
  
  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 공정명 옵션 초기화
    searchProcessNameOptions.value = [];
    registForm.value.processNm = null;
    console.log("등록 모달 중분류 변경: null 또는 공백값 선택 - 공정명 옵션 초기화");
  } else {
    console.log("등록 모달 중분류 변경:", selectedValue);
    // 공정명 옵션 로드
    handleRegistProcessNameCodeSearch();
  }
};

// 등록 폼 데이터
const registForm = ref<RegistForm>({
  processType: null,
  processSubCategory: null,
  processNm: null,
  subCategory: "",
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
    registForm.value.processType !== null &&
    registForm.value.processType.trim() !== "" &&
    registForm.value.processNm !== null &&
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
    processType: null,
    processSubCategory: null,
    processNm: null,
    subCategory: "",
    processSymbol: "",
    pidInfo: "",
    consistencyCheck: false,
    processSymbolFile: null,
    calculationFile: null,
    pidFile: null,
    excelFile: null,
  };
  // 파일 선택 상태도 초기화
  selectedFiles.value = {};
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

    // 필수 필드 검증
    if (!registForm.value.processType || !registForm.value.processNm) {
      alert(t("messages.warning.pleaseFillRequiredFields"));
      return;
    }

    // 선택된 공정명의 label과 value 찾기
    const selectedProcessNameOption = searchProcessNameOptions.value.find(
      option => option.value === registForm.value.processNm
    );

    if (!selectedProcessNameOption) {
      alert(t("messages.error.invalidProcessName"));
      return;
    }

    // API 호출을 위한 데이터 준비
    const requestData = {
      process_code: selectedProcessNameOption.value,
      process_name: selectedProcessNameOption.label,
      process_type_code: registForm.value.processType,
      process_category: registForm.value.processSubCategory,
      // 파일 정보 추가
      process_symbol_file: registForm.value.processSymbolFile,
      calculation_file: registForm.value.calculationFile,
      pid_file: registForm.value.pidFile,
      excel_file: registForm.value.excelFile,
      consistency_check: registForm.value.consistencyCheck
    };

    console.log("공정 등록 요청 데이터:", requestData);

    // /api/process/master/create 서비스 호출
    const result = await request("/api/process/master/create", undefined, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("공정 등록 API 응답:", result);

    if (result.response.data.success) {
      alert(t("messages.success.processRegistered"));
      closeRegistModal();
      
      // 등록 성공 후 목록 새로고침
      handleSearch();
    } else {
      const errorMessage = result.message || t("messages.error.registrationError");
      alert(`등록 실패: ${errorMessage}` + "\n" + result.response.data.message);
    }

  } catch (error: any) {
    console.error("등록 실패:", error);
    const errorMessage =
      error?.message || t("messages.error.registrationError");
    alert(`등록 실패: ${errorMessage}`);
  }
};

const handleDelete = async () => {
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }
  
  if (
    confirm(
      t("messages.confirm.deleteItems", { count: selectedItems.value.length })
    )
  ) {
    try {
      loading.value = true;
      console.log("삭제할 항목:", selectedItems.value);
      
      // 선택된 항목들의 process_id 추출
      const selectedProcessIds = selectedItems.value.map(
        (item) => item.process_id
      );
      
      console.log("삭제할 process_id 목록:", selectedProcessIds);
      
      // 각 process_id에 대해 삭제 API 호출
      const deletePromises = selectedProcessIds.map(async (processId) => {
        if (!processId) {
          console.warn("process_id가 없는 항목:", processId);
          return { success: false, message: "process_id가 없습니다." };
        }
        
        try {
          const result = await request(`/api/process/master/delete/${processId}`, undefined, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          console.log(`process_id ${processId} 삭제 결과:`, result);
          return result;
        } catch (error: any) {
          console.error(`process_id ${processId} 삭제 실패:`, error);
          return { success: false, message: error.message || "삭제 실패" };
        }
      });
      
      // 모든 삭제 요청 완료 대기
      const deleteResults = await Promise.all(deletePromises);
      
      // 삭제 결과 분석
      const successCount = deleteResults.filter(result => result.success).length;
      const failCount = deleteResults.filter(result => !result.success).length;
      
      console.log("삭제 결과 요약:", { successCount, failCount, total: selectedProcessIds.length });
      
      if (successCount > 0) {
        // 성공한 항목들을 로컬 목록에서 제거
        const successProcessIds = selectedProcessIds.filter((_, index) => deleteResults[index].success);
        processList.value = processList.value.filter(
          (item) => !successProcessIds.includes(item.process_id)
        );
        
        totalCount.value = processList.value.length;
        totalPages.value = Math.ceil(totalCount.value / pageSize.value);
        
        // 선택된 항목 초기화
        selectedItems.value = [];
        
        if (failCount > 0) {
          alert(`${successCount}개 항목 삭제 성공, ${failCount}개 항목 삭제 실패`);
        } else {
          alert(t("messages.success.deleted"));
        }
        
        // 목록 새로고침
        handleSearch();
      } else {
        alert("모든 항목 삭제에 실패했습니다.");
      }
      
    } catch (error: any) {
      console.error("삭제 처리 중 오류:", error);
      alert(`삭제 처리 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      loading.value = false;
    }
  }
};

// 상세 보기 이동
const router = useRouter();
const viewDetail = (item: ProcessItem) => {
  console.log("=== viewDetail 함수 호출 ===");
  console.log("전체 item:", item);
  console.log("item.process_type:", item.process_type);
  console.log("item.sub_category:", item.sub_category);
  console.log("item.process_code:", item.process_code);
  console.log("item.process_id:", item.process_id);
  console.log("item.process_nm:", item.process_nm);
  
  if (item.process_nm) {
    const params = {
      process_type: item.process_type,
      sub_category: item.sub_category,
      process_code: item.process_code,
      id: item.process_id
    };
    
    console.log("라우터로 전달할 params:", params);
    
    router.push({
      name: "ProcessDetail",
      params: { id: params.id },
      query: {
        process_type: params.process_type,
        sub_category: params.sub_category,
        process_code: params.process_code
      }
    });
  } else {
    console.log("process_nm이 없어서 라우터 이동하지 않음");
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



// 선택된 항목 변경 핸들러
const handleSelectionChange = (items: ProcessItem[]) => {
  selectedItems.value = items;
  console.log("선택된 항목:", selectedItems.value);
};

// 검색 옵션 변경 핸들러
const handleSearchProcessTypeChange = () => {
  const selectedValue = searchProcessType.value;
  
  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 중분류 옵션 초기화
    searchSubCategoryOptions.value = [];
    searchSubCategoryInput.value = null;
    // 공정명 옵션도 초기화
    searchProcessNameOptions.value = [];
    searchProcessName.value = null;
    console.log("공정구분 변경: null 또는 공백값 선택 - 중분류 및 공정명 옵션 초기화");
  } else {
    const selectedOption = searchProcessTypeOptions.value.find(option => option.value === selectedValue);
    
    if (selectedOption) {
      console.log("공정구분 변경:");
      console.log("  key:", selectedOption.value);
      console.log("  value:", selectedOption.label);
          // 공정명 옵션 초기화
    searchProcessNameOptions.value = [];
    searchProcessName.value = null;
      handleMiddleCodeSearch();
    } else {
      console.log("공정구분 변경: 선택되지 않음");
    }
  }
};

// 검색 기능 구현
const handleSearch = async () => {
  try {
    loading.value = true;
    console.log("검색 시작: /master/search");
    
    let requestData;
    
    // 1. searchProcessName.value != null 인 경우
    if (searchProcessName.value != null) {
      requestData = {
        search_field: 'process_code',
        search_value: searchProcessName.value
      };
    }
    // 2. searchProcessName.value == null && searchSubCategoryInput.value != null 인 경우
    else if (searchProcessName.value == null && searchSubCategoryInput.value != null) {
      requestData = {
        search_field: 'level3_code_key',
        search_value: searchSubCategoryInput.value
      };
    }
    // 3. searchProcessName.value == null && searchSubCategoryInput.value == null && searchProcessType.value != null 인 경우
    else if (searchProcessName.value == null && searchSubCategoryInput.value == null && searchProcessType.value != null) {
      requestData = {
        search_field: 'level2_code_key',
        search_value: searchProcessType.value
      };
    }
    // 4. 모든 값이 null인 경우
    else {
      requestData = {
        search_field: 'process_code',
        search_value: ""
      };
    }

    console.log("requestData", requestData);

    const result = await request("/api/process/master/search", undefined, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    
    console.log("검색 API 응답:", result);
    
    if (result.success && result.response) {
      console.log("검색 결과:", result.response);
      
      // result.response가 배열인 경우 직접 처리 (API 응답 구조에 맞게)
      if (Array.isArray(result.response)) {
        console.log("검색 결과 배열:", result.response);
        
        // 검색 결과를 processList에 설정하여 표에 출력
        processList.value = result.response.map((item: any) => ({
          id: item.id || item.process_code || `process_${Date.now()}_${Math.random()}`,
          process_id: item.process_id || item.id || item.process_code || "",
          process_type: item.level2_code_key || "",
          process_type_nm: item.level2_code_value || "",
          process_nm: item.process_name || "",
          sub_category: item.level3_code_key || "",
          sub_category_nm: item.level3_code_value || "",
          process_code: item.process_code || "",
          process_symbol: item.symbol_uri || "📄",
          viewDetail: ""
        }));
        
        totalCount.value = processList.value.length;
        totalPages.value = Math.ceil(totalCount.value / pageSize.value);
        
        // 페이징 초기화
        currentPage.value = 1;
        
        console.log("processList 업데이트 완료:", processList.value);
        console.log("페이징 정보 - 총 개수:", totalCount.value, "총 페이지:", totalPages.value);
        
      } else if (result.response.items && Array.isArray(result.response.items)) {
        // result.response.items가 배열인 경우 (기존 로직 유지)
        console.log("검색 결과 items 배열:", result.response.items);
        
        // items 배열을 순환하여 요청된 값들 출력
        result.response.items.forEach((item: any, index: number) => {
          console.log(`=== 검색 결과 ${index + 1}번째 항목 ===`);
          console.log("level2_code_value (공정구분):", item.level2_code_value);
          console.log("level3_code_value (공정 중분류):", item.level3_code_value);
          console.log("process_name (공정명):", item.process_name);
          console.log("symbol_uri (공정심볼):", item.symbol_uri);
          console.log("================================");
        });
        
        // 검색 결과를 processList에 설정
        processList.value = result.response.items.map((item: any) => ({
          id: item.id || `process_${Date.now()}_${Math.random()}`,
          process_id: item.process_id || item.id || item.process_code || "",
          process_type: item.level2_code_key || "",
          process_type_nm: item.level2_code_value || "",
          process_nm: item.process_name || "",
          sub_category: item.level3_code_key || "",
          sub_category_nm: item.level3_code_value || "",
          process_code: item.process_code || "",
          process_symbol: item.symbol_uri || "📄",
          viewDetail: ""
        }));
        
        totalCount.value = processList.value.length;
        totalPages.value = Math.ceil(totalCount.value / pageSize.value);
        
        // 페이징 초기화
        currentPage.value = 1;
        
        console.log("processList 업데이트 완료:", processList.value);
        console.log("페이징 정보 - 총 개수:", totalCount.value, "총 페이지:", totalPages.value);
        
      } else {
        console.log("검색 결과가 없거나 응답 형식이 올바르지 않습니다.");
        console.log("응답 데이터:", result.response);
        
        // 빈 결과로 테이블 초기화
        processList.value = [];
        totalCount.value = 0;
        totalPages.value = 1;
      }
      
    } else {
      console.log("검색 실패 또는 응답이 없습니다.");
      console.log("전체 응답:", result);
      
      // 빈 결과로 테이블 초기화
      processList.value = [];
      totalCount.value = 0;
      totalPages.value = 1;
    }
    
  } catch (error: any) {
    console.error("검색 실패:", error);
    const errorMessage = error.message || error.response || '검색 중 오류가 발생했습니다.';
    alert(`검색 실패: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
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
      search_value: searchProcessType.value,
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

// 등록 모달용 중분류 select 항목 공통코드 조회
const handleRegistMiddleCodeSearch = async () => {
  try {
    loading.value = true;
    console.log("등록 모달 중분류 코드 검색 시작: /api/process/code/search");
    
    if (!registForm.value.processType) {
      console.log("등록 모달 공정구분이 선택되지 않았습니다.");
      return;
    }
    
    const requestData = {
      search_field: 'parent_key',
      search_value: registForm.value.processType,
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
        
        console.log("생성된 등록 모달 중분류 옵션:", searchSubCategoryOptions.value);
      } else {
        console.log("등록 모달 중분류 데이터가 없습니다.");
      }
    } else {
      alert(`등록 모달 중분류 코드 검색 실패: ${result.message}`);
    }
    
  } catch (error: any) {
    console.error("등록 모달 중분류 코드 검색 실패:", error);
    const errorMessage = error.message || error.response || '알 수 없는 오류가 발생했습니다.';
    alert(`등록 모달 중분류 코드 검색 실패: ${errorMessage}`);
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

// 등록 모달용 공정명 select 항목 공통코드 조회
const handleRegistProcessNameCodeSearch = async () => {
  try {
    loading.value = true;
    console.log("등록 모달 공정명 코드 검색 시작: /api/process/code/search");
    
    if (!registForm.value.processSubCategory) {
      console.log("등록 모달 중분류가 선택되지 않았습니다.");
      return;
    }
    
    const requestData = {
      search_field: 'parent_key',
      search_value: registForm.value.processSubCategory,
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
        
        console.log("생성된 등록 모달 공정명 옵션:", searchProcessNameOptions.value);
      } else {
        console.log("등록 모달 공정명 데이터가 없습니다.");
      }
    } else {
      alert(`등록 모달 공정명 코드 검색 실패: ${result.message}`);
    }
    
  } catch (error: any) {
    console.error("등록 모달 공정명 코드 검색 실패:", error);
    const errorMessage = error.message || error.response || '알 수 없는 오류가 발생했습니다.';
    alert(`등록 모달 공정명 코드 검색 실패: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  // 초기 공정구분 옵션 로드 - handleProcessCodeSearch 함수 사용
  handleProcessCodeSearch();
  
  // 화면 로드 시 초기 검색 수행하여 표에 데이터 표시
  handleSearch();
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
