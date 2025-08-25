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
              v-model="processStore.searchProcessType"
              class="form-select"
              @change="handleSearchProcessTypeChange"
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
        </div>
        <div class="group-form">
          <label for="searchSubCategory" class="label-title">{{
            t("process.subCategory")
          }}</label>
          <div class="form-item">
            <select
              id="searchSubCategory"
              v-model="processStore.searchSubCategoryInput"
              class="form-select"
              @change="handleSubCategoryChange"
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
        </div>
        <div class="group-form">
          <label for="searchProcessName" class="label-title">{{
            t("process.processName")
          }}</label>
          <div class="form-item">
            <select
              id="searchProcessName"
              v-model="processStore.searchProcessName"
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
          :disabled="processStore.selectedItems.length === 0"
        >
          {{ t("process.deleteSelected") }}
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <!-- DataTable row-key가 default로 id로 설정돼있어서 추가 수정함함 -->
    <DataTable
      :columns="tableColumns"
      :data="processStore.paginatedProcessList"
      :loading="processStore.loading"
      :selectable="true"
      :selected-items="processStore.selectedItems"
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
        :current-page="processStore.currentPage"
        :total-pages="processStore.totalPagesComputed"
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
             <div class="process-row-3col">
               <div class="form-group">
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
                       v-for="option in processStore.searchProcessTypeOptions"
                       :key="option.value"
                       :value="option.value"
                     >
                       {{ option.label }}
                     </option>
                   </select>
                 </dd>
               </div>
               <div class="form-group">
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
                       v-for="option in processStore.searchSubCategoryOptions"
                       :key="option.value"
                       :value="option.value"
                     >
                       {{ option.label }}
                     </option>
                   </select>
                 </dd>
               </div>
               <div class="form-group">
                 <dt class="essential">{{ t("process.processName") }}</dt>
                 <dd>
                   <select
                     v-model="registForm.processNm"
                     class="form-select"
                     required
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
                 </dd>
               </div>
             </div>
             <!-- 공정심볼 -->
             <dt class="essential">{{ t("process.processSymbol") }}</dt>
             <dd class="process-symbol-row">
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
             </dd>
             <!-- 파일 첨부 영역 -->
             <div class="form-row">
               <dt class="file-attachment-section">파일 첨부 영역</dt>
               <dd class="file-attachment-area">
                 <div class="attachment-grid">
                   <!-- 계산식 파일 첨부 -->
                   <div class="attachment-column">
                     <div class="attachment-header">
                       <span class="attachment-title essential">⊙ {{ t("process.calculation") }}</span>
                     </div>
                     <div class="file-input-row">
                     <input
                       type="text"
                       class="file-name-input"
                       :value="selectedFiles.calculationFile?.name || ''"
                       placeholder="파일 선택"
                       readonly
                     />
                     <label class="file-select-btn">
                       파일선택
                       <input
                         type="file"
                         @change="handleFileChange('calculationFile', $event)"
                         accept=".xlsx,.xls,.csv"
                         style="display: none"
                       />
                     </label>
                   </div>
                   <div class="attached-files-list">
                     <div v-for="i in 5" :key="`calc-${i}`" class="file-row">
                       <span class="file-number">{{ i }}</span>
                       <span class="file-name">{{ getAttachedFileName('calculation', i) || '' }}</span>
                       <button v-if="getAttachedFileName('calculation', i)" class="file-delete-btn" @click="removeAttachedFile('calculation', i)">×</button>
                     </div>
                   </div>
                 </div>

                 <!-- PFD 파일 첨부 -->
                                    <div class="attachment-column">
                     <div class="attachment-header">
                       <span class="attachment-title essential">⊙ {{ t("process.pfd") }}</span>
                     </div>
                   <div class="file-input-row">
                     <input
                       type="text"
                       class="file-name-input"
                       :value="selectedFiles.pfdFile?.name || ''"
                       placeholder="파일 선택"
                       readonly
                     />
                     <label class="file-select-btn">
                       파일선택
                       <input
                         type="file"
                         @change="handleFileChange('pfdFile', $event)"
                         accept=".pfd"
                         style="display: none"
                       />
                     </label>
                   </div>
                   <div class="attached-files-list">
                     <div v-for="i in 5" :key="`pfd-${i}`" class="file-row">
                       <span class="file-number">{{ i }}</span>
                       <span class="file-name">{{ getAttachedFileName('pfd', i) || '' }}</span>
                       <button v-if="getAttachedFileName('pfd', i)" class="file-delete-btn" @click="removeAttachedFile('pfd', i)">×</button>
                     </div>
                   </div>
                 </div>

                 <!-- 수리계통도 파일 첨부 -->
                                    <div class="attachment-column">
                     <div class="attachment-header">
                       <span class="attachment-title essential">⊙ {{ t("process.hydraulic") }}</span>
                     </div>
                   <div class="file-input-row">
                     <input
                       type="text"
                       class="file-name-input"
                       :value="selectedFiles.hydraulicFile?.name || ''"
                       placeholder="파일 선택"
                       readonly
                     />
                     <label class="file-select-btn">
                       파일선택
                       <input
                         type="file"
                         @change="handleFileChange('hydraulicFile', $event)"
                         accept=".dwg,.dxf"
                         style="display: none"
                       />
                     </label>
                   </div>
                   <div class="attached-files-list">
                     <div v-for="i in 5" :key="`hydraulic-${i}`" class="file-row">
                       <span class="file-number">{{ i }}</span>
                       <span class="file-name" :class="{ 'error-file': isErrorFile('hydraulic', i) }">{{ getAttachedFileName('hydraulic', i) || '' }}</span>
                       <button v-if="getAttachedFileName('hydraulic', i)" class="file-delete-btn" :class="{ 'error-delete': isErrorFile('hydraulic', i) }" @click="removeAttachedFile('hydraulic', i)">×</button>
                     </div>
                   </div>
                 </div>
               </div>
             </dd>
           </div>
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

    <!-- ProcessDetail 모달 -->
    <div v-if="isDetailModalOpen" class="modal-overlay detail-modal-overlay">
      <div class="modal-container detail-modal-container">
        <div class="modal-header">
          <h3>공정 상세</h3>
          <button class="btn-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body detail-modal-body">
          <ProcessDetail
            :process-id="selectedProcessId || undefined"
            @close="closeDetailModal"
            ref="processDetailRef"
            class="popup-mode"
          />
        </div>
        <div class="modal-footer detail-modal-footer">
          <button class="btn btn-secondary" @click="closeDetailModal">
            닫기
          </button>
          <button
            class="btn btn-primary"
            @click="processDetailRef?.handleUpdate"
            :disabled="!isDetailFormValid"
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
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import ProcessDetail from "./ProcessDetail.vue";
import { useI18n } from "vue-i18n";
import { useProcessStore, type ProcessItem } from "@/stores/processStore";

const { t } = useI18n();
const processStore = useProcessStore();

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
  hydraulicFile: File | null;
}

// 첨부된 파일 목록을 관리하는 인터페이스
interface AttachedFiles {
  calculation: string[];
  pfd: string[];
  hydraulic: string[];
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

 // 로컬 상태 (store에서 관리되지 않는 것들)
 const sortColumn = ref<string | null>(null);
 const sortOrder = ref<"asc" | "desc" | null>(null);
 const isRegistModalOpen = ref(false);
 const isDetailModalOpen = ref(false);
 const selectedProcessId = ref<string | undefined>(undefined);
 const processDetailRef = ref<InstanceType<typeof ProcessDetail> | null>(null);
 
 

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
  hydraulicFile: null,
});

// 첨부된 파일 목록 상태
const attachedFiles = ref<AttachedFiles>({
  calculation: [],
  pfd: [],
  hydraulic: [],
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
     processSymbolFile: null,
     calculationFile: null,
     pidFile: null,
     pfdFile: null,
     excelFile: null,
     hydraulicFile: null,
   };
   // 파일 선택 상태도 초기화
   selectedFiles.value = {};
   // 첨부된 파일 목록도 초기화
   attachedFiles.value = {
     calculation: [],
     pfd: [],
     hydraulic: [],
   };
    };

// 첨부된 파일명 가져오기
const getAttachedFileName = (type: keyof AttachedFiles, index: number): string => {
  const files = attachedFiles.value[type];
  return files[index - 1] || '';
};

// 첨부된 파일 삭제
const removeAttachedFile = (type: keyof AttachedFiles, index: number) => {
  const files = attachedFiles.value[type];
  if (files[index - 1]) {
    files.splice(index - 1, 1);
    attachedFiles.value = { ...attachedFiles.value };
  }
};

// 에러 파일인지 확인 (수리계통도의 3번째 파일을 에러로 표시)
const isErrorFile = (type: keyof AttachedFiles, index: number): boolean => {
  return type === 'hydraulic' && index === 3 && getAttachedFileName(type, index) === 'dr2003-1110104.DWG';
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
    // if (registForm.value.consistencyCheck) {
    //   // 정합성 체크 로직
    //   alert(t("messages.warning.consistencyCheckLogicRequired"));
    //   return;
    // }

    // 필수 필드 검증
    if (!registForm.value.processType || !registForm.value.processNm) {
      alert(t("messages.warning.pleaseFillRequiredFields"));
      return;
    }

    // 선택된 공정명의 label과 value 찾기
    const selectedProcessNameOption =
      processStore.searchProcessNameOptions.find(
        (option) => option.value === registForm.value.processNm
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
    };

    console.log("공정 등록 요청 데이터:", requestData);

    // processStore를 통한 공정 등록
    const result = await processStore.createProcess(requestData);

    console.log("공정 등록 API 응답:", result);

    alert(t("messages.success.processRegistered"));
    closeRegistModal();
  } catch (error: any) {
    console.error("등록 실패:", error);
    const errorMessage =
      error?.message || t("messages.error.registrationError");
    alert(`등록 실패: ${errorMessage}`);
  }
};

const handleDelete = async () => {
  if (processStore.selectedItems.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: processStore.selectedItems.length,
      })
    )
  ) {
    try {
      // 선택된 항목들의 process_id 추출
      const selectedProcessIds = processStore.selectedItems.map(
        (item) => item.process_id
      );

      console.log("삭제할 process_id 목록:", selectedProcessIds);

      // processStore를 통한 삭제 처리
      const { successCount, failCount } = await processStore.deleteProcesses(
        selectedProcessIds
      );

      if (failCount > 0) {
        alert(
          `${successCount}개 항목 삭제 성공, ${failCount}개 항목 삭제 실패`
        );
      } else {
        alert(t("messages.success.deleted"));
      }
    } catch (error: any) {
      console.error("삭제 처리 중 오류:", error);
      alert(`삭제 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  }
};

// 상세 보기 이동
const viewDetail = (item: ProcessItem) => {
  console.log("=== viewDetail 함수 호출 ===");
  console.log("전체 item:", item);
  console.log("item.process_id:", item.process_id);
  console.log("item.process_nm:", item.process_nm);

  if (item.process_id) {
    console.log("모달로 전달할 process_id:", item.process_id);

    selectedProcessId.value = item.process_id;
    isDetailModalOpen.value = true;
  } else {
    console.log("process_id가 없어서 모달을 열지 않음");
  }
};

const closeDetailModal = () => {
  isDetailModalOpen.value = false;
  selectedProcessId.value = undefined;
};

// ProcessDetail 컴포넌트에서 직접 업데이트를 처리하므로 이 함수는 불필요
// const handleDetailUpdate = async () => { ... };

const isDetailFormValid = computed(() => {
  // ProcessDetail 컴포넌트의 폼 유효성 검사 결과를 반환
  return true; // 실제로는 ProcessDetail의 폼 상태를 확인해야 함
});

const handlePageChange = (page: number) => {
  processStore.setCurrentPage(page);
};

const handleSortChange = (sortInfo: {
  key: string | null;
  direction: "asc" | "desc" | null;
}) => {
  sortColumn.value = sortInfo.key;
  sortOrder.value = sortInfo.direction;
};

const handleRowClick = (item: ProcessItem, index: number) => {
  console.log("Row clicked:", item, index);
  // 행 클릭 시 상세 페이지로 이동하거나 모달 열기 등
};

// 선택된 항목 변경 핸들러
const handleSelectionChange = (items: ProcessItem[]) => {
  processStore.setSelectedItems(items);
  console.log("선택된 항목:", processStore.selectedItems);
};

// 검색 옵션 변경 핸들러
const handleSearchProcessTypeChange = () => {
  const selectedValue = processStore.searchProcessType;

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 중분류 옵션 초기화
    processStore.searchSubCategoryOptions.length = 0;
    processStore.setSearchSubCategoryInput(null);
    // 공정명 옵션도 초기화
    processStore.searchProcessNameOptions.length = 0;
    processStore.setSearchProcessName(null);
    console.log(
      "공정구분 변경: null 또는 공백값 선택 - 중분류 및 공정명 옵션 초기화"
    );
  } else {
    const selectedOption = processStore.searchProcessTypeOptions.find(
      (option) => option.value === selectedValue
    );

    if (selectedOption) {
      console.log("공정구분 변경:");
      console.log("  key:", selectedOption.value);
      console.log("  value:", selectedOption.label);
      // 공정명 옵션 초기화
      processStore.searchProcessNameOptions.length = 0;
      processStore.setSearchProcessName(null);
      handleSubCategoryCode();
    } else {
      console.log("공정구분 변경: 선택되지 않음");
    }
  }
};

// 중분류 변경 핸들러
const handleSubCategoryChange = () => {
  const selectedValue = processStore.searchSubCategoryInput;

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 공정명 옵션 초기화
    processStore.searchProcessNameOptions.length = 0;
    processStore.setSearchProcessName(null);
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
    processStore.searchSubCategoryOptions.length = 0;
    processStore.searchProcessNameOptions.length = 0;
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
    processStore.searchProcessNameOptions.length = 0;
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
    await processStore.searchProcesses();
  } catch (error: any) {
    const errorMessage = error?.message || "검색 중 오류가 발생했습니다.";
    alert(`검색 실패: ${errorMessage}`);
  }
};

// 중분류 코드 로드
const handleSubCategoryCode = async () => {
  try {
    if (processStore.searchProcessType) {
      await processStore.loadSubCategoryCodes(processStore.searchProcessType);
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
      await processStore.loadProcessNameCodes(
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
      await processStore.loadSubCategoryCodes(registForm.value.processType);
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
      await processStore.loadProcessNameCodes(
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

    console.log("=== Process.vue 초기화 완료 ===");
  } catch (error) {
    console.error("Process.vue 초기화 중 오류 발생:", error);
  }
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
  padding: 2.5rem;
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
    }
    
    .modal-body {
      padding: 2.5rem;
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
</style>