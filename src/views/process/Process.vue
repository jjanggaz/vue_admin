<template>
  <div class="process-page">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="search-bar">
        <!-- 조회조건: 단위, 공정구분, 공정중분류, 공정명, 검색 버튼 -->
        <div class="search-row first-row">
          <div class="group-form">
            <label for="searchUnit" class="label-title">{{ t("codeManagement.categories.unit") }}</label>
            <div class="form-item">
              <select
                id="searchUnit"
                v-model="selectedUnit"
                class="form-select"
                @change="handleUnitChange"
              >
                <option value="METRIC">Metric</option>
                <option value="IMPERIAL">Imperial</option>
              </select>
            </div>
          </div>
          <div class="group-form">
            <label for="searchOption" class="label-title">{{
              t("process.processType")
            }}</label>
            <div class="form-item">
              <select
                id="searchProcessType"
                :value="processStore.searchProcessType || ''"
                class="form-select"
                @change="handleSearchProcessTypeChange"
                :key="`searchProcessType-${processStore.searchProcessTypeOptions.length}`"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="option in processStore.searchProcessTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="group-form">
            <label for="searchSubCategory" class="label-title">{{
              t("process.subCategory")
            }}</label>
            <div class="form-item">
              <select
                id="searchSubCategory"
                :value="processStore.searchSubCategoryInput || ''"
                class="form-select"
                @change="handleSubCategoryChange"
                :key="`searchSubCategory-${processStore.searchSubCategoryOptions.length}`"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="option in processStore.searchSubCategoryOptions"
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
                :value="processStore.searchProcessName || ''"
                class="form-select"
                @change="handleProcessNameChange"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="option in processStore.searchProcessNameOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
          
          <div class="group-form">
            <div class="form-item button-group">
              <button class="btn btn-primary btn-search" @click="handleSearch">
                {{ t("common.search") }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="btns">
        <button class="btn btn-primary btn-regist" @click="handleRegist">
          {{ t("common.register") }}
        </button>
        <button
          class="btn btn-primary btn-delete"
          @click="handleDelete"
          :disabled="processStore.selectedItems.length === 0"
        >
          {{ t("common.delete") }}
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <!-- DataTable row-key가 default로 id로 설정돼있어서 추가 수정함함 -->
    <!-- 디버깅: 데이터 확인 -->

    
    <DataTable
      v-if="isComponentMounted && processStore.processList && processStore.processList.length >= 0"
      :columns="tableColumns"
      :data="processStore.processList"
      :loading="processStore.loading"
      :selectable="true"
      :selected-items="processStore.selectedItems"
      row-key="id"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 공정심볼 텍스트 표시 슬롯 -->
      <template #cell-symbol_download="{ item }">
        <span class="symbol-text">
          {{ getFileNameFromUri(item.process_symbol) || getFileNameFromUri(item.symbol_download) || '-' }}
        </span>
      </template>
      
      <!-- 보기 버튼 슬롯 -->
      <template #cell-viewDetail="{ item }">
        <button class="btn-view" @click.stop="viewDetail(item)">
          {{ t("process.viewDetail") }}
        </button>
      </template>
    </DataTable>

    <!-- Pagination -->
    <div class="pagination-container">
      <Pagination
        :current-page="processStore.currentPage"
        :total-pages="processStore.totalPages"
        @page-change="handlePageChange"
      />
    </div>

      <!-- 등록 모달 -->
      <div v-if="isRegistModalOpen" class="modal-overlay">
        <div class="modal-container large-modal">
          <div class="modal-header">
            <h3>{{ t("process.registerProcess") }}</h3>
            <button class="btn-close" @click="closeRegistModal">×</button>
          </div>
          <div class="modal-body">
            <!-- 상단: 기본 정보 입력 -->
            <div class="form-section">
              <!-- 첫 번째 줄: 단위 -->
              <div class="form-row">
                <div class="form-group">
                  <label class="essential">{{ t("codeManagement.categories.unit") }}</label>
                  <select v-model="registForm.unit" class="form-select">
                    <option value="metric">Metric</option>
                    <option value="imperial">Imperial</option>
                  </select>
                </div>
              </div>
              <!-- 두 번째 줄: 공정구분, 공정 중분류, 공정명, 공정심볼 파일 -->
              <div class="form-row">
                <div class="form-group">
                  <label class="essential">{{ t("process.processType") }}</label>
                  <select
                    v-model="registForm.processType"
                    class="form-select"
                    @change="handleRegistProcessTypeChange"
                  >
                    <option :value="null">{{ t("common.select") }}</option>
                    <option
                      v-for="option in processStore.searchProcessTypeOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="essential">{{ t("process.subCategory") }}</label>
                  <select
                    v-model="registForm.processSubCategory"
                    class="form-select"
                    @change="handleRegistSubCategoryChange"
                  >
                    <option :value="null">{{ t("common.select") }}</option>
                    <option
                      v-for="option in processStore.searchSubCategoryOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="essential">{{ t("process.processName") }}</label>
                  <select
                    v-model="registForm.processNm"
                    class="form-select"
                  >
                    <option :value="null">{{ t("common.select") }}</option>
                    <option
                      v-for="option in processStore.searchProcessNameOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="essential">공정심볼 파일</label>
                  <div class="file-input-group">
                    <input
                      type="file"
                      accept=".svg"
                      @change="handleProcessSymbolFileChange"
                      style="display: none"
                      ref="processSymbolFileInput"
                      id="processSymbolFileInput"
                    />
                    <label for="processSymbolFileInput" class="file-select-btn">
                      {{ t("common.selectFile") }}
                    </label>
                    <span class="selected-file">{{ getProcessSymbolFileName() || t("common.noFile") }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 중간: 파일 업로드 그리드 -->
            <div class="file-upload-section">
              <h4>파일 업로드</h4>
              <div class="grid-actions">
                <button class="btn btn-primary btn-sm" @click="addFileUploadRow">+ 행 추가</button>
                <button class="btn btn-danger btn-sm" @click="deleteSelectedFileRows" :disabled="selectedFileRows.length === 0">삭제</button>
              </div>
              <div class="file-upload-table">
                <table class="upload-table">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          @change="handleSelectAllFileRows"
                          :checked="selectedFileRows.length === fileUploadRows.length && fileUploadRows.length > 0"
                          :indeterminate="selectedFileRows.length > 0 && selectedFileRows.length < fileUploadRows.length"
                        />
                      </th>
                      <th>No.</th>
                      <th>계산식(*)</th>
                      <th>PFD (*)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in fileUploadRows" :key="row.id" :class="{ 'alternate-row': index % 2 === 1 }">
                      <td>
                        <input 
                          type="checkbox" 
                          :value="row"
                          v-model="selectedFileRows"
                        />
                      </td>
                      <td>{{ row.no }}</td>
                      <td>
                        <div class="file-input-group">
                          <button class="btn btn-primary btn-sm" @click="selectFormulaFile(row)">
                            {{ t("common.selectFile") }}
                          </button>
                          <span class="selected-files-info">
                            {{ row.formulaFile ? `${row.formulaFile.name} (${(row.formulaFile.size / 1024).toFixed(2)} KB)` : t("common.noFile") }}
                          </span>
                          <button 
                            v-if="row.formulaFile" 
                            class="clear-file" 
                            @click="clearFormulaFile(row)"
                            title="파일 제거"
                          >
                            &times;
                          </button>
                        </div>
                      </td>
                      <td>
                        <div class="file-input-group">
                          <button class="btn btn-primary btn-sm" @click="selectPfdFile(row)">
                            {{ t("common.selectFile") }}
                          </button>
                          <span class="selected-files-info">
                            {{ row.pfdFile ? `${row.pfdFile.name} (${(row.pfdFile.size / 1024).toFixed(2)} KB)` : t("common.noFile") }}
                          </span>
                          <button 
                            v-if="row.pfdFile" 
                            class="clear-file" 
                            @click="clearPfdFile(row)"
                            title="파일 제거"
                          >
                            &times;
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Hidden file inputs -->
            <input
              type="file"
              accept=".svg"
              @change="handleProcessSymbolFileChange"
              style="display: none"
              ref="processSymbolFileInput"
            />
            <input
              type="file"
              accept=".py,.xlsx,.xls,.csv"
              @change="handleFormulaFileSelected"
              style="display: none"
              ref="formulaFileInput"
            />
            <input
              type="file"
              accept=".dwg,.dxf"
              @change="handlePfdFileSelected"
              style="display: none"
              ref="pfdFileInput"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="saveProcessRegistration">저장</button>
            <button class="btn btn-secondary" @click="closeRegistModal">닫기</button>
          </div>
        </div>
      </div>



    <!-- ProcessDetail 모달 -->
    <div v-if="isDetailModalOpen" class="modal-overlay detail-modal-overlay">
      <div class="modal-container detail-modal-container">
        <div class="modal-header">
          <h3>{{ isRegisterMode ? '공정 등록' : '공정 상세' }}</h3>
          <button class="btn-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body detail-modal-body">
          <div v-if="!selectedProcessId" class="loading-placeholder">
            <p>공정 정보를 불러오는 중...</p>
          </div>
          <ProcessDetail
            v-else
            :key="`process-detail-${selectedProcessId}`"
            :process-id="String(selectedProcessIdForApi)"
            :process-code="String(selectedProcessId)"
            :is-register-mode="isRegisterMode"
            :initial-process-type="processStore.searchProcessType"
            :initial-sub-category="processStore.searchSubCategoryInput"
            ref="processDetailRef"
            class="popup-mode"
            @update-success="closeDetailModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import ProcessDetail from "./ProcessDetail.vue";
import { useI18n } from "vue-i18n";
import { useProcessStore, type ProcessItem } from "@/stores/processStore";

const { t } = useI18n();
const processStore = useProcessStore();

// 공정명 값 변경 추적
watch(() => processStore.searchProcessName, (newValue, oldValue) => {
  console.log('공정명 값 변경 감지:', {
    oldValue,
    newValue,
    timestamp: new Date().toISOString()
  });
}, { immediate: true });

// 중분류 값 변경 추적
watch(() => processStore.searchSubCategoryInput, (newValue, oldValue) => {
  console.log('중분류 값 변경 감지:', {
    oldValue,
    newValue,
    timestamp: new Date().toISOString()
  });
}, { immediate: true });

interface RegistForm {
  processType: string | null;
  processSubCategory: string | null;
  processNm: string | null;
  subCategory: string;
  processSymbol: string;
  pidInfo: string;
  processSymbolFile: File | null;
  calculationFile: File | null;
  pidFile: File | null;
  pfdFile: File | null;
  excelFile: File | null;
  unit: string;
}

interface FileUploadRow {
  id: string;
  no: number;
  formulaFile: File | null;
  pfdFile: File | null;
  // 원본 파일 정보 저장 (ProcessDetail.vue와 동일한 로직)
  originalFormulaFile?: string | null;
  originalPfdFile?: string | null;
}

// 첨부된 파일 목록을 관리하는 인터페이스
interface AttachedFiles {
  calculation: string[];
  pfd: string[];
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "process_id", title: "Process ID", sortable: false, hidden: true }, // process_id (숨김)
  { key: "symbol_id", title: "Symbol ID", sortable: false, hidden: true }, // symbol_id (숨김)
  { key: "process_type_nm", title: t("process.processType"), sortable: true }, // 공정구분
  { key: "sub_category_nm", title: t("process.subCategory"), sortable: true }, // 공정 중분류
  { 
    key: "process_name", 
    title: t("process.processName"), 
    sortable: true,
    formatter: (value, row) => {
      // level3_code_key와 process_code가 같으면 공정명을 표시하지 않음
      if (row.level3_code_key === row.process_code) {
        return '-';
      }
      return value || '-';
    }
  }, // 공정명
  { 
    key: "symbol_download", 
    title: t("process.processSymbol"), 
    sortable: true,
    formatter: (value) => value || '-'
  }, // 공정심볼 (SVG 미리보기)
  {
    key: "viewDetail",
    title: t("common.detailInfo"),
    sortable: false,
    formatter: (value) => formatDate(value),
  }, // 상세보기
];

 // 로컬 상태 (store에서 관리되지 않는 것들)
 const sortColumn = ref<string | null>(null);
 const sortOrder = ref<"asc" | "desc" | null>(null);
 const isRegistModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const isRegisterMode = ref(false);

// 파일 입력 ref
const processSymbolFileInput = ref<HTMLInputElement | null>(null);
const formulaFileInput = ref<HTMLInputElement | null>(null);
const pfdFileInput = ref<HTMLInputElement | null>(null);
const selectedProcessSymbolFile = ref<File | null>(null);
 const selectedProcessId = ref<string | undefined>(undefined);
 const selectedProcessIdForApi = ref<string | undefined>(undefined);
 const processDetailRef = ref<InstanceType<typeof ProcessDetail> | null>(null);
 const isComponentMounted = ref(false);

// 단위 선택
const selectedUnit = ref<string>("METRIC");

// 등록 폼 데이터
const registForm = ref<RegistForm>({
  processType: null,
  processSubCategory: null,
  processNm: null,
  subCategory: "",
  processSymbol: "",
  pidInfo: "",
  processSymbolFile: null,
  calculationFile: null,
  pidFile: null,
  pfdFile: null,
  excelFile: null,
  unit: "metric",
});

// 파일 업로드 그리드 관련 상태
const fileUploadRows = ref<FileUploadRow[]>([]);
const selectedFileRows = ref<FileUploadRow[]>([]);
const currentFileRow = ref<FileUploadRow | null>(null);



// 첨부된 파일 목록 상태
const attachedFiles = ref<AttachedFiles>({
  calculation: [],
  pfd: [],
});

// 파일 선택 관련 상태
const selectedFiles = ref<{ [key: string]: File }>({});

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ko-KR");
};



// URI에서 파일명만 추출하는 함수
const getFileNameFromUri = (uri: string | null | undefined): string => {
  if (!uri || typeof uri !== 'string') {
    return '-';
  }
  
  // 경로 구분자로 분할하여 마지막 부분(파일명) 추출
  const pathParts = uri.split(/[/\\]/);
  const fileName = pathParts[pathParts.length - 1];
  
  // 파일명이 비어있거나 경로가 없는 경우
  if (!fileName || fileName === uri) {
    return uri;
  }
  
  return fileName;
};



const handleRegist = () => {
  // ProcessDetail 모달을 공정 등록 모드로 열기
  isRegisterMode.value = true;
  selectedProcessId.value = 'new'; // 새 공정임을 나타내는 값
  selectedProcessIdForApi.value = undefined; // API 호출용 ID 초기화
  isDetailModalOpen.value = true;
  
  console.log('공정 등록 모드로 열기 - 조회조건 값:', {
    processType: processStore.searchProcessType,
    subCategory: processStore.searchSubCategoryInput
  });
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
     processSymbolFile: null,
     calculationFile: null,
     pidFile: null,
     pfdFile: null,
     excelFile: null,
     unit: "metric",
   };
   
   // 파일 입력 초기화
   if (processSymbolFileInput.value) {
     processSymbolFileInput.value.value = '';
   }
   selectedProcessSymbolFile.value = null;
   // 파일 선택 상태도 초기화
   selectedFiles.value = {};
   // 첨부된 파일 목록도 초기화
   attachedFiles.value = {
     calculation: [],
     pfd: [],
   };
   // 파일 업로드 그리드 초기화
   fileUploadRows.value = [];
   selectedFileRows.value = [];
   currentFileRow.value = null;
    };


const handleDelete = async () => {
  console.log('=== 삭제 버튼 클릭 ===');
  console.log('selectedItems.length:', processStore.selectedItems.length);
  console.log('selectedItems:', processStore.selectedItems);
  
  if (processStore.selectedItems.length === 0) {
    console.log('선택된 항목이 없음');
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  console.log('삭제 확인 대화상자 표시');
  const confirmed = confirm(
    t("messages.confirm.deleteItems", {
      count: processStore.selectedItems.length,
    })
  );
  
  console.log('삭제 확인 결과:', confirmed);
  
  if (confirmed) {
    try {
      console.log('삭제 처리 시작');
      
      // 선택된 항목들의 process_id 추출
      const selectedProcessIds = processStore.selectedItems.map(
        (item) => item.process_id
      );
      
      const selectedSymbolIds = processStore.selectedItems.map(
        (item) => item.symbol_id || ''
      ).filter(id => id !== '');

      console.log('삭제할 항목들 상세 정보:');
      console.log('selectedItems:', processStore.selectedItems);
      console.log('processIds:', selectedProcessIds);
      console.log('symbolIds:', selectedSymbolIds);
      
      // 각 항목별 상세 정보 출력
      processStore.selectedItems.forEach((item, index) => {
        console.log(`항목 ${index}:`, {
          process_id: item.process_id,
          symbol_id: item.symbol_id,
          process_nm: item.process_nm
        });
      });

      console.log('processStore.deleteProcesses 호출 시작');
      
      // processStore를 통한 삭제 처리
      const { successCount, failCount } = await processStore.deleteProcesses(
        selectedProcessIds,
        selectedSymbolIds
      );

      console.log('삭제 처리 완료:', { successCount, failCount });

      if (failCount > 0) {
        alert(
          `${successCount}개 항목 삭제 성공, ${failCount}개 항목 삭제 실패`
        );
      } else {
        alert(t("messages.success.deleted"));
      }
      
      console.log('삭제 후 그리드 새로고침');
    } catch (error: any) {
      console.error("삭제 처리 중 오류:", error);
      alert(`삭제 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  } else {
    console.log('삭제 취소됨');
  }
};

// 새로운 등록 모달 관련 함수들
const addFileUploadRow = () => {
  const newRow: FileUploadRow = {
    id: `row_${Date.now()}`,
    no: fileUploadRows.value.length + 1,
    formulaFile: null,
    pfdFile: null
  };
  fileUploadRows.value.push(newRow);
};

const handleSelectAllFileRows = () => {
  if (selectedFileRows.value.length === fileUploadRows.value.length) {
    selectedFileRows.value = [];
  } else {
    selectedFileRows.value = [...fileUploadRows.value];
  }
};

const deleteSelectedFileRows = () => {
  if (selectedFileRows.value.length === 0) {
    alert('삭제할 항목을 선택해주세요.');
    return;
  }
  
  if (confirm(`선택된 ${selectedFileRows.value.length}개 항목을 삭제하시겠습니까?`)) {
    const selectedIds = selectedFileRows.value.map(row => row.id);
    fileUploadRows.value = fileUploadRows.value.filter(row => !selectedIds.includes(row.id));
    selectedFileRows.value = [];
  }
};



const selectFormulaFile = (row: FileUploadRow) => {
  currentFileRow.value = row;
  formulaFileInput.value?.click();
};


const selectPfdFile = (row: FileUploadRow) => {
  currentFileRow.value = row;
  pfdFileInput.value?.click();
};



const handleProcessSymbolFileChange = async (event: Event) => {
  console.log('handleProcessSymbolFileChange 호출됨');
  const target = event.target as HTMLInputElement;
  console.log('target.files:', target.files);
  
  if (target.files && target.files[0]) {
    const file = target.files[0];
    console.log('선택된 파일:', file.name, file.size, file.type);
    
    if (!file.name.toLowerCase().endsWith('.svg')) {
      alert('SVG 파일만 선택할 수 있습니다. 다시 선택해주세요.');
      target.value = '';
      return;
    }
    
    registForm.value.processSymbolFile = file;
    selectedProcessSymbolFile.value = file; // 반응성을 위해 추가
    console.log('공정심볼 파일 선택됨:', file.name);
    console.log('registForm.processSymbolFile:', registForm.value.processSymbolFile);
    console.log('selectedProcessSymbolFile:', selectedProcessSymbolFile.value);
  } else {
    console.log('파일이 선택되지 않음');
  }
};

const getProcessSymbolFileName = () => {
  console.log('getProcessSymbolFileName 호출됨');
  console.log('selectedProcessSymbolFile.value:', selectedProcessSymbolFile.value);
  console.log('registForm.value.processSymbolFile:', registForm.value.processSymbolFile);
  
  // selectedProcessSymbolFile을 우선적으로 사용 (반응성 보장)
  if (selectedProcessSymbolFile.value) {
    console.log('selectedProcessSymbolFile 사용:', selectedProcessSymbolFile.value.name);
    return selectedProcessSymbolFile.value.name;
  }
  
  // fallback: registForm의 processSymbolFile 사용
  const processSymbolFile = registForm.value.processSymbolFile;
  if (processSymbolFile) {
    console.log('registForm.processSymbolFile 사용:', processSymbolFile.name);
    return processSymbolFile.name;
  }
  
  console.log('파일명 없음');
  return '';
};

const handleFormulaFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentFileRow.value) {
    const file = target.files[0];
    
    // Python 파일만 허용
    if (!file.name.toLowerCase().endsWith('.py')) {
      alert('Python 파일(.py)만 선택 가능합니다.');
      target.value = '';
      return;
    }
    
    // 원본 파일 정보 저장 (ProcessDetail.vue와 동일한 로직)
    if (!currentFileRow.value.originalFormulaFile) {
      // 기존 파일이 있다면 원본으로 저장
      currentFileRow.value.originalFormulaFile = currentFileRow.value.formulaFile?.name || null;
    }
    
    currentFileRow.value.formulaFile = file;
    console.log('계산식 파일 선택됨:', file.name);
  }
};


const handlePfdFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentFileRow.value) {
    const file = target.files[0];
    
    // PFD 파일 타입 검증 (.dwg, .dxf, .pdf, .png, .jpg, .jpeg)
    const allowedExtensions = ['.dwg', '.dxf', '.pdf', '.png', '.jpg', '.jpeg'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert('PFD 파일은 .dwg, .dxf, .pdf, .png, .jpg, .jpeg 파일만 선택 가능합니다.');
      target.value = '';
      return;
    }
    
    // 원본 파일 정보 저장 (ProcessDetail.vue와 동일한 로직)
    if (!currentFileRow.value.originalPfdFile) {
      // 기존 파일이 있다면 원본으로 저장
      currentFileRow.value.originalPfdFile = currentFileRow.value.pfdFile?.name || null;
    }
    
    currentFileRow.value.pfdFile = file;
    console.log('PFD 파일 선택됨:', file.name);
  }
};

const clearFormulaFile = (row: FileUploadRow) => {
  // 원본 파일로 복원 (ProcessDetail.vue와 동일한 로직)
  if (row.originalFormulaFile) {
    // 원본 파일이 있다면 복원 로직 구현
    console.log('계산식 파일을 원본으로 복원:', row.originalFormulaFile);
  }
  row.formulaFile = null;
};


const clearPfdFile = (row: FileUploadRow) => {
  // 원본 파일로 복원 (ProcessDetail.vue와 동일한 로직)
  if (row.originalPfdFile) {
    // 원본 파일이 있다면 복원 로직 구현
    console.log('PFD 파일을 원본으로 복원:', row.originalPfdFile);
  }
  row.pfdFile = null;
};







const saveProcessRegistration = async () => {
  try {
    // 기본 정보 검증 (공정명도 필수 입력값)
    if (!registForm.value.unit || !registForm.value.processType || !registForm.value.processNm) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    // 공정심볼 파일 검증
    console.log('공정심볼 파일 검증:', {
      registFormProcessSymbolFile: registForm.value.processSymbolFile,
      selectedProcessSymbolFile: selectedProcessSymbolFile.value
    });
    
    const symbolFile = selectedProcessSymbolFile.value || registForm.value.processSymbolFile;
    if (!symbolFile) {
      alert('공정심볼 파일을 선택해주세요.');
      return;
    }

    // 파일 업로드 검증 - 첫 행이 추가된 데이터로 간주
    if (fileUploadRows.value.length === 0) {
      alert('최소 하나의 파일 업로드 행을 추가해주세요.');
      return;
    }

    // 첫 행 검증 - 첫 행은 반드시 추가된 데이터로 간주
    const firstRow = fileUploadRows.value[0];
    if (!firstRow) {
      alert('첫 번째 행이 존재하지 않습니다.');
      return;
    }

    // 첫 행에 최소 하나의 파일이 있어야 함
    const hasAnyFile = firstRow.formulaFile || firstRow.pfdFile;
    if (!hasAnyFile) {
      alert('첫 번째 행에 최소 하나의 파일을 선택해주세요.');
      return;
    }

    console.log('첫 행 검증 통과:', {
      firstRow: firstRow,
      hasFormulaFile: !!firstRow.formulaFile,
      hasPfdFile: !!firstRow.pfdFile
    });

    // 선택된 공정명의 label과 value 찾기 (공정명은 필수 입력값)
    const selectedProcessNameOption = registForm.value.processNm 
      ? processStore.searchProcessNameOptions.find(
          (option) => option.value === registForm.value.processNm
        )
      : null;

    // 계산식 파일이 있는 행들을 찾아서 처리 (ProcessDetail.vue의 uploadFormulaFiles 로직 참고)
    console.log('fileUploadRows.value:', fileUploadRows.value);
    console.log('fileUploadRows.value[0]:', fileUploadRows.value[0]);
    console.log('fileUploadRows.value[0].formulaFile:', fileUploadRows.value[0]?.formulaFile);
    console.log('fileUploadRows.value[0].formulaFile instanceof File:', fileUploadRows.value[0]?.formulaFile instanceof File);
    
    const formulaFiles = fileUploadRows.value
      .filter(row => {
        console.log('필터링 체크:', {
          row: row,
          hasFormulaFile: !!row.formulaFile,
          isFile: row.formulaFile instanceof File,
          hasName: !!row.formulaFile?.name,
          formulaFile: row.formulaFile,
          formulaFileType: typeof row.formulaFile,
          formulaFileKeys: row.formulaFile ? Object.keys(row.formulaFile) : 'null'
        });
        return row.formulaFile && 
               row.formulaFile instanceof File && 
               row.formulaFile.name &&
               row.formulaFile.size > 0;
      })
      .map((row, index) => {
        console.log('formulaFiles 매핑:', {
          index: index,
          formulaFile: row.formulaFile,
          formulaFileName: row.formulaFile?.name
        });
        return {
          id: `formula_${Date.now()}_${index}`,
          no: (index + 1).toString().padStart(3, '0'),
          registeredFormula: row.formulaFile?.name.replace('.py', '') || '',
          formula_code: '',
          registrationDate: new Date().toISOString().split('T')[0],
          infoOverview: '',
          remarks: '',
          _file: row.formulaFile
        };
      });

    console.log('처리할 계산식 파일들:', formulaFiles);

    // 공정명 select 선택 상태에 따라 process_code와 process_name 설정
    let processCode, processName;
    
    if (selectedProcessNameOption && selectedProcessNameOption.value) {
      // 공정명 select가 선택된 상태
      processCode = selectedProcessNameOption.value;
      processName = selectedProcessNameOption.label;
    } else {
      // 공정명이 필수이므로 이 경우는 발생하지 않아야 함
      throw new Error('공정명이 선택되지 않았습니다.');
    }

    // API 호출을 위한 데이터 준비
    const requestData = {
      unit_system_code: registForm.value.unit,
      process_code: processCode,
      process_name: processName,
      process_type_code: registForm.value.processType,
      process_category: registForm.value.processSubCategory,
      process_symbol_file: symbolFile,
      siteFile: symbolFile, // createProcess에서 사용할 siteFile 추가
      file_upload_rows: fileUploadRows.value,
      formula_files: formulaFiles // 계산식 파일 정보 추가
    };

    console.log('=== 공정 등록 저장 시작 ===');
    console.log('formulaFiles:', formulaFiles);
    console.log('formulaFiles.length:', formulaFiles.length);
    console.log('requestData:', requestData);
    console.log('requestData.formula_files:', requestData.formula_files);
    console.log('requestData.formula_files?.length:', requestData.formula_files?.length);
    console.log('=== 공정 등록 저장 데이터 확인 완료 ===');

    // 실제 API 호출
    console.log('=== processStore.createProcess 호출 시작 ===');
    const result = await processStore.createProcess(requestData);
    console.log('=== processStore.createProcess 호출 완료 ===');
    console.log('공정 등록 API 응답:', result);
    console.log('result.success:', result.success);
    console.log('result.response:', result.response);
    console.log('result.response?.process_id:', result.response?.process_id);
    console.log('result.response?.id:', result.response?.id);

    // 성공 메시지에 계산식 파일 정보 포함
    let successMessage = '공정 등록이 완료되었습니다.';
    if (formulaFiles.length > 0) {
      successMessage += `\n계산식 파일 ${formulaFiles.length}개가 함께 등록되었습니다.`;
    }
    
    alert(successMessage);
    closeRegistModal();
  } catch (error) {
    console.error('공정 등록 실패:', error);
    alert('공정 등록에 실패했습니다.');
  }
};

// 상세 보기 이동
const viewDetail = (item: ProcessItem) => {
  // process_id만 사용하여 상세보기
  const processId = item.process_id;
  
  console.log('=== viewDetail 함수 호출 ===');
  console.log('item:', item);
  console.log('processId:', processId);
  
  if (processId) {
    selectedProcessId.value = item.process_code; // 화면 표시용 (process_code)
    selectedProcessIdForApi.value = processId; // API 호출용 (process_id)
    console.log('selectedProcessId.value (화면표시용):', selectedProcessId.value);
    console.log('selectedProcessIdForApi.value (API호출용):', selectedProcessIdForApi.value);
    isDetailModalOpen.value = true;
  } else {
    console.error('process_id가 없습니다:', item);
  }
};

const closeDetailModal = async () => {
  console.log('=== closeDetailModal 함수 호출 시작 ===');
  
  try {
    console.log('모달 닫기 시작');
    isDetailModalOpen.value = false;
    selectedProcessId.value = undefined;
    selectedProcessIdForApi.value = undefined;
    isRegisterMode.value = false; // 등록 모드 초기화
    
    console.log('모달 상태 초기화 완료');
    
    // 메인화면 그리드 재조회
    try {
      console.log('메인화면 그리드 재조회 시작');
      await processStore.searchProcesses();
      console.log('메인화면 그리드 재조회 완료');
    } catch (error) {
      console.error('메인화면 그리드 재조회 실패:', error);
    }
    
    console.log('=== closeDetailModal 함수 호출 완료 ===');
  } catch (error) {
    console.error('closeDetailModal 함수 실행 중 오류:', error);
  }
};

// ProcessDetail 컴포넌트에서 직접 업데이트를 처리하므로 이 함수는 불필요
// const handleDetailUpdate = async () => { ... };


const handlePageChange = async (page: number) => {
  console.log("=== 페이지 변경 ===");
  console.log("이전 페이지:", processStore.currentPage);
  console.log("새 페이지:", page);
  
  processStore.setCurrentPage(page);
  
  console.log("페이지 설정 후:", processStore.currentPage);
  console.log("API 호출 시작...");
  
  // 페이지 변경 시 새로운 API 호출로 서버에서 해당 페이지 데이터 가져오기
  await processStore.searchProcesses();
  
  console.log("=== 페이지 변경 완료 ===");
};

const handleSortChange = (sortInfo: {
  key: string | null;
  direction: "asc" | "desc" | null;
}) => {
  sortColumn.value = sortInfo.key;
  sortOrder.value = sortInfo.direction;
};



// 선택된 항목 변경 핸들러
const handleSelectionChange = (items: ProcessItem[]) => {
  console.log('=== 그리드 선택 변경 ===');
  console.log('선택된 항목 수:', items.length);
  console.log('선택된 항목들:', items);
  
  processStore.setSelectedItems(items);
  
  console.log('processStore.selectedItems 업데이트 완료:', processStore.selectedItems.length);
};

// 단위 변경 핸들러
const handleUnitChange = () => {
  console.log('단위 변경:', selectedUnit.value);
  // 단위 변경 시 필요한 로직 추가
};

// 검색 옵션 변경 핸들러
const handleSearchProcessTypeChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value || null;
  
  // 즉시 값 업데이트
  processStore.setSearchProcessType(selectedValue);

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 중분류 옵션 초기화
    processStore.searchSubCategoryOptions.splice(0, processStore.searchSubCategoryOptions.length);
    processStore.setSearchSubCategoryInput(null);
    // 공정명 옵션도 초기화
    processStore.searchProcessNameOptions.splice(0, processStore.searchProcessNameOptions.length);
    processStore.setSearchProcessName(null);

  } else {
    const selectedOption = processStore.searchProcessTypeOptions.find(
      (option) => option.value === selectedValue
    );

    if (selectedOption) {
      console.log("공정구분 변경:");
      console.log("  key:", selectedOption.value);
      console.log("  value:", selectedOption.label);
      
      // 중분류 옵션과 값 초기화 (공정구분이 변경되면 중분류는 '-- 선택 --' 상태로)
      processStore.searchSubCategoryOptions.splice(0, processStore.searchSubCategoryOptions.length);
      processStore.setSearchSubCategoryInput(null);
      
      // 공정명 옵션과 값 초기화
      processStore.searchProcessNameOptions.splice(0, processStore.searchProcessNameOptions.length);
      processStore.setSearchProcessName(null);
      
      // 새로운 공정구분에 맞는 중분류 옵션 로드
      await handleSubCategoryCode();
    } else {
      console.log("공정구분 변경: 선택되지 않음");
    }
  }
};

// 중분류 변경 핸들러
const handleSubCategoryChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value || null;
  
  // 즉시 값 업데이트
  processStore.setSearchSubCategoryInput(selectedValue);

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 공정명 옵션 초기화
    processStore.searchProcessNameOptions.splice(0, processStore.searchProcessNameOptions.length);
    processStore.setSearchProcessName(null);
    console.log("중분류 변경: null 또는 공백값 선택 - 공정명 옵션 초기화");
  } else {
    console.log("중분류 변경:", selectedValue);
    
    // 공정명 옵션과 값 초기화 (중분류가 변경되면 공정명은 '-- 선택 --' 상태로)
    processStore.searchProcessNameOptions.splice(0, processStore.searchProcessNameOptions.length);
    processStore.setSearchProcessName(null);
    
    // 새로운 중분류에 맞는 공정명 옵션 로드
    await handleProcessNameCodeSearch();
  }
};

// 공정명 변경 핸들러
const handleProcessNameChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value || null;
  
  // 즉시 값 업데이트
  processStore.setSearchProcessName(selectedValue);
  
  console.log("공정명 변경:", selectedValue);
};

// 등록 모달 공정구분 변경 핸들러
const handleRegistProcessTypeChange = () => {
  const selectedValue = registForm.value.processType;

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 중분류 및 공정명 옵션 초기화
    processStore.searchSubCategoryOptions.splice(0, processStore.searchSubCategoryOptions.length);
    processStore.searchProcessNameOptions.splice(0, processStore.searchProcessNameOptions.length);
    registForm.value.processSubCategory = null;
    registForm.value.processNm = null;
    console.log(
      "등록 모달 공정구분 변경: null 또는 공백값 선택 - 중분류 및 공정명 옵션 초기화"
    );
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
    processStore.searchProcessNameOptions.splice(0, processStore.searchProcessNameOptions.length);
    registForm.value.processNm = null;
    console.log(
      "등록 모달 중분류 변경: null 또는 공백값 선택 - 공정명 옵션 초기화"
    );
  } else {
    console.log("등록 모달 중분류 변경:", selectedValue);
    // 공정명 옵션 로드
    handleRegistProcessNameCodeSearch();
  }
};

// 검색 기능 구현
const handleSearch = async () => {
  try {
    // 단위 정보를 processStore에 설정
    console.log("검색 전 단위 설정:", {
      selectedUnit: selectedUnit.value,
      processStoreUnit: processStore.searchUnit
    });
    
    // processStore 함수 존재 여부 확인
    console.log("processStore.setSearchUnit 타입:", typeof processStore.setSearchUnit);
    console.log("processStore 객체:", processStore);
    
    if (typeof processStore.setSearchUnit === 'function') {
      processStore.setSearchUnit(selectedUnit.value);
      
      console.log("검색 후 단위 설정:", {
        processStoreUnit: processStore.searchUnit
      });
    } else {
      console.error("processStore.setSearchUnit 함수가 존재하지 않습니다.");
      console.log("processStore에서 사용 가능한 함수들:", Object.keys(processStore));
      return;
    }
    
    // 검색 시 페이지를 1로 초기화
    console.log("=== 검색 시작 ===");
    console.log("검색 전 페이지:", processStore.currentPage);
    
    processStore.setCurrentPage(1);
    
    console.log("검색 후 페이지:", processStore.currentPage);
    console.log("페이지 크기:", processStore.pageSize);
    
    console.log("=== searchProcesses 호출 시작 ===");
    await processStore.searchProcesses();
    console.log("=== searchProcesses 호출 완료 ===");
    
  } catch (error: any) {
    const errorMessage = error?.message || "검색 중 오류가 발생했습니다.";
    alert(`검색 실패: ${errorMessage}`);
  }
};

// 중분류 코드 로드
const handleSubCategoryCode = async () => {
  try {
    if (processStore.searchProcessType) {
      await processStore.loadSubCategoryCodesSilent(processStore.searchProcessType);
    }
  } catch (error: any) {
    const errorMessage = error?.message || "중분류 코드 로드 실패";
    alert(`중분류 코드 로드 실패: ${errorMessage}`);
  }
};

// 공정명 코드 로드
const handleProcessNameCodeSearch = async () => {
  try {
    if (processStore.searchSubCategoryInput) {
      await processStore.loadProcessNameCodesSilent(
        processStore.searchSubCategoryInput
      );
    }
  } catch (error: any) {
    const errorMessage = error?.message || "공정명 코드 로드 실패";
    alert(`공정명 코드 로드 실패: ${errorMessage}`);
  }
};

// 등록 모달용 중분류 코드 로드
const handleRegistMiddleCodeSearch = async () => {
  try {
    if (registForm.value.processType) {
      await processStore.loadSubCategoryCodesSilent(registForm.value.processType);
    }
  } catch (error: any) {
    const errorMessage = error?.message || "등록 모달 중분류 코드 로드 실패";
    alert(`등록 모달 중분류 코드 로드 실패: ${errorMessage}`);
  }
};

// 등록 모달용 공정명 코드 로드
const handleRegistProcessNameCodeSearch = async () => {
  try {
    if (registForm.value.processSubCategory) {
      await processStore.loadProcessNameCodesSilent(
        registForm.value.processSubCategory
      );
    }
  } catch (error: any) {
    const errorMessage = error?.message || "등록 모달 공정명 코드 로드 실패";
    alert(`등록 모달 공정명 코드 로드 실패: ${errorMessage}`);
  }
};

onMounted(async () => {
  try {
    console.log("=== Process.vue onMounted 시작 ===");
    console.log("processStore 상태 확인:", {
      searchUnit: processStore.searchUnit,
      searchUnitType: typeof processStore.searchUnit
    });

    // 0. 초기 단위 설정
    if (typeof processStore.setSearchUnit === 'function') {
      processStore.setSearchUnit(selectedUnit.value);
      console.log("0. 초기 단위 설정 완료:", selectedUnit.value);
    } else {
      console.error("processStore.setSearchUnit 함수가 존재하지 않습니다.");
    }

    // 1. 초기 공정구분 옵션 로드
    try {
      await processStore.loadProcessTypeCodes();
      console.log("1. 공정구분 옵션 로드 완료");
    } catch (error) {
      console.error("공정구분 옵션 로드 실패:", error);
    }

    // 2. 화면 로드 시 초기 검색 수행하여 표에 데이터 표시
    try {
      await processStore.searchProcesses();
      console.log("2. 초기 검색 완료");
    } catch (error) {
      console.error("초기 검색 실패:", error);
    }

    // 3. 컴포넌트 마운트 완료 표시
    isComponentMounted.value = true;
    console.log("=== Process.vue 초기화 완료 ===");
  } catch (error) {
    console.error("Process.vue 초기화 중 오류 발생:", error);
    // 오류가 발생해도 컴포넌트는 마운트된 것으로 표시
    isComponentMounted.value = true;
  }
});
</script>

<style scoped lang="scss">
@use "sass:color";

.process-page {
  padding: $spacing-lg;
}

// 공정심볼 텍스트 스타일
.symbol-text {
  font-size: 12px;
  color: #495057;
  font-family: monospace;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.process-3d-page {
  padding: $spacing-lg;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
  
  // 각 줄의 스타일
  .search-row {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    width: 100%;
    flex-wrap: wrap;
    
    &.first-row {
      // 조회조건: 단위, 공정구분, 공정중분류, 공정명, 검색/등록/삭제 버튼
      flex-wrap: wrap;
      
      .group-form {
        flex: 0 0 auto;
        min-width: 0;
        
        &.button-group-right {
          margin-left: auto;
        }
        
        // 셀렉트 폭 조정
        .form-select {
          max-width: 120px;
          min-width: 80px;
        }
        
        // 공정구분 셀렉트 폭 조정
        &:nth-child(3) .form-select {
          max-width: 150px;
          min-width: 120px;
        }
        
        // 공정중분류 셀렉트 폭 조정
        &:nth-child(4) .form-select {
          max-width: 180px;
          min-width: 150px;
        }
        
        // 공정명 셀렉트 폭 조정
        &:nth-child(5) .form-select {
          max-width: 200px;
          min-width: 180px;
        }
        
        // 라벨 폭 조정
        .label-title {
          font-size: 0.85rem;
          white-space: nowrap;
        }
      }
    }
    
    &.second-row {
      // 두 번째 줄: 등록/삭제 버튼들
      .group-form {
        flex: 0 0 auto;
        min-width: 0;
        
        // 셀렉트 폭 조정
        .form-select {
          max-width: 100px;
          min-width: 80px;
        }
        
        // 라벨 폭 조정
        .label-title {
          font-size: 0.85rem;
          white-space: nowrap;
        }
      }
    }
  }
  
  .group-form {
    margin-bottom: 1rem;
    min-width: 0;
    
    // 셀렉트 폭 조정
    .form-select {
      max-width: 180px;
      min-width: 120px;
    }
    
    // 버튼 그룹 스타일
    .button-group {
      display: flex;
      gap: 1rem;
      align-items: center;
      
      .btn {
        margin-right: 0;
      }
    }
  }
}

// ProcessDetail 모달 스타일
.detail-modal-overlay {
  z-index: 1000;
}

.detail-modal-container {
  width: 90vw;
  max-width: 1200px;
  height: 90vh;
  max-height: 800px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-modal-body {
  flex: 1;
  overflow: auto;
  padding: 0.5rem 2.5rem 2.5rem 2.5rem;
  min-height: 400px;

  .process-page {
    padding: 0;
    height: auto;
    overflow: visible;
    
    // 팝업 모드에서 스크롤바 강제 표시
    &.popup-mode {
      overflow: visible;
      
      // 하위 요소들도 스크롤바 설정
      .action-bar,
      .tab-action-bar,
      .tab-content {
        max-height: none;
        overflow: visible;
      }
      
      // 탭 컨텐츠 영역 스크롤바 설정
      .tab-content .content {
        max-height: none;
        overflow: visible;
      }
    }
  }
}

 .detail-modal-footer {
   justify-content: flex-end;
   gap: 0.5rem;
   padding: 1rem;
   border-top: 1px solid #e0e0e0;
 }
 
  // 모달 오버레이 스타일
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
  }

  // 등록 모달 스타일
  .modal-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-height: 600px;
    max-height: 80vh;
    min-width: 1200px;
    max-width: 95vw;
    overflow-y: auto;
    overflow-x: auto;
    z-index: 9999;
    
    .modal-header {
      cursor: default;
      padding: 5px 0 2px 0;
      margin: 0;
    }
    
    .modal-body {
      padding: 1rem 2.5rem 2.5rem 2.5rem;
      min-height: 400px;

             .column-regist {
         // 기존 grid 레이아웃 제거
         display: block;
 
         // 공정구분/중분류/공정명 3개 항목을 한 줄에 배치
         .process-row-3col {
           display: flex;
           gap: 2rem;
           margin-bottom: 1.5rem;
 
           .form-group {
             flex: 1 1 0;
             display: flex;
             align-items: center;
             gap: 1rem;
 
             dt {
               flex: 0 0 auto;
               margin: 0;
               font-weight: bold;
               font-size: 1rem;
               line-height: 1.4;
               color: #333;
               &.essential::after {
                 content: " *";
                 color: #dc3545;
               }
             }
             dd {
               flex: 1 1 0;
               margin: 0;
               .form-select {
                 width: 100%;
                 max-width: 400px;
                 padding: 8px;
                 border: 1px solid #ddd;
                 border-radius: 4px;
                 background-color: white;
                 font-size: 14px;
                 height: 36px;
                 line-height: 1.2;
                 &:focus {
                   outline: none;
                   border-color: #007bff;
                   box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
                 }
               }
             }
           }
         }
 
         // 공정심볼을 한 줄에 배치
         dt.essential + dd.process-symbol-row {
           display: inline-block;
           margin-bottom: 1rem;
         }
         
         // 공정심볼 라벨을 인라인으로 배치
         dt.essential {
           display: inline-block;
           margin-right: 1rem;
           margin-bottom: 0;
         }
       }
    }
  }
 
 // 공정심볼 행 스타일
 .process-symbol-row {
   display: flex;
   align-items: center;
   gap: 1.5rem;
   margin-bottom: 3.5rem;
   
   .file-name-input {
     flex: 1;
     max-width: 400px;
     padding: 1rem;
     border: 1px solid #ddd;
     border-radius: 4px;
     background-color: white;
     font-size: 0.95rem;
     height: 48px;
   }
   
   .file-select-btn {
     white-space: nowrap;
     padding: 1rem 2rem;
     background-color: #007bff;
     color: white;
     border: none;
     border-radius: 4px;
     cursor: pointer;
     font-size: 0.95rem;
     height: 48px;
     
     &:hover {
       background-color: #0056b3;
     }
   }
 }

  // 파일 첨부 영역 스타일
 .file-attachment-section {
   font-weight: bold;
   color: #333;
   margin-top: 1.5rem;
   padding-top: 1.5rem;
   border-top: 1px solid #e0e0e0;
   margin-bottom: 2rem;
   font-size: 1.1rem;
 }
 
 .file-attachment-area {
   margin-top: 0.5rem;
   
   .attachment-grid {
     display: grid;
     grid-template-columns: repeat(3, 1fr);
     gap: 2.5rem;
     min-width: 1100px;
     
    .attachment-column {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 2rem;
      background-color: #f9f9f9;
      min-height: 200px;
      min-width: 320px;
      
      .attachment-header {
        margin-bottom: 1rem;
        
        .attachment-title {
          font-weight: bold;
          color: #333;
          font-size: 0.9rem;
          
          &.essential::after {
            content: " *";
            color: #dc3545;
            font-weight: bold;
          }
        }
      }
      
      .file-input-row {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
        
        .file-name-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
          font-size: 0.875rem;
        }
        
        .file-select-btn {
          padding: 0.5rem 1rem;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          white-space: nowrap;
          
          &:hover {
            background-color: #0056b3;
          }
        }
      }
      
      .attached-files-list {
        .file-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
          
          .file-number {
            width: 24px;
            text-align: center;
            font-weight: bold;
            color: #666;
            font-size: 0.875rem;
          }
          
          .file-name {
            flex: 1;
            font-size: 0.875rem;
            
            &.error-file {
              color: #dc3545;
              font-weight: bold;
            }
          }
          
          .file-delete-btn {
            width: 24px;
            height: 24px;
            border: none;
            background-color: #6c757d;
            color: white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &:hover {
              background-color: #5a6268;
            }
            
            &.error-delete {
              background-color: #dc3545;
              
              &:hover {
                background-color: #c82333;
              }
            }
          }
        }
      }
    }
  }
}

// 새로운 등록 모달 스타일
.large-modal {
  max-width: 90vw;
  max-height: 90vh;
  width: 1200px;
}

.form-section {
  margin-bottom: 2rem;
  
  .form-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    
    .form-group {
      flex: 1;
      min-width: 200px;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
        
        &.essential::after {
          content: " (*)";
          color: #dc3545;
          font-weight: bold;
        }
      }
      
      .form-select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
        font-size: 0.875rem;
      }
    }
  }
}

.file-upload-section {
  margin-bottom: 2rem;
  
  h4 {
    margin-bottom: 1rem;
    font-weight: 600;
    color: #333;
  }
  
  .grid-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .file-upload-table {
    overflow-x: auto;
    
    .upload-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      
      th, td {
        padding: 0.75rem;
        border: 1px solid #ddd;
        text-align: left;
        vertical-align: middle;
      }
      
      th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #333;
      }
      
      .alternate-row {
        background-color: #f8f9fa;
      }
      
      .file-selection-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        .file-info {
          .selected-file {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            background-color: #e9ecef;
            border-radius: 4px;
            font-size: 0.8rem;
            
            .clear-file {
              border: none;
              background: none;
              color: #dc3545;
              cursor: pointer;
              font-size: 1rem;
              padding: 0;
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              
              &:hover {
                background-color: #dc3545;
                color: white;
                border-radius: 50%;
              }
            }
          }
          
          .no-file {
            color: #6c757d;
            font-style: italic;
            font-size: 0.8rem;
          }
        }
      }
    }
  }
}



// 공정심볼 파일 입력 그룹 스타일 (ProcessDetail.vue와 동일)
.file-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-select-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
  display: inline-block;
  text-align: center;
}

.file-select-btn:hover {
  background: #0056b3;
}

.selected-file {
  color: #007bff;
  font-size: 13px;
  flex: 1;
}

.btn-view {
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    background-color: color.scale($primary-color, $lightness: -10%);
  }
}

</style>