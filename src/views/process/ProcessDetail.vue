<template>
  <div class="process-page">
    <!-- Add Button -->
    <div class="action-bar">
      <dl class="column-search">
        <dt class="essential">{{ t("processDetail.processType") }}</dt>
        <dd>
          <select
            v-model="processStore.processDetail.processType"
            class="form-select"
            @change="handleProcessTypeChange"
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
        <dt>{{ t("processDetail.subCategory") }}</dt>
        <dd>
          <select
            v-model="processStore.processDetail.subCategory"
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
        </dd>
        <dt class="essential">{{ t("processDetail.processName") }}</dt>
        <dd>
          <select
            v-model="processStore.processDetail.processName"
            class="form-select"
            @change="handleProcessNameChange"
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
        <dt class="essential">{{ t("processDetail.processSymbol") }}</dt>
        <dd>
          <div class="file-upload-row">
            <input
              type="text"
              class="file-name-input"
              :value="getFileNameFromPath(processStore.processDetail.processSymbol) || ''"
              placeholder="파일 선택"
              readonly
            />
            <label class="file-select-btn">
              {{ t("common.selectFile") }}
              <input
                type="file"
                accept=".svg"
                @change="handleFileChange('processSymbol', $event)"
                style="display: none"
              />
            </label>
          </div>
        </dd>
        <dt>{{ t("processDetail.description") }}</dt>
        <dd class="extend-all">
          <input
            type="text"
            class="form-input"
            v-model="processStore.processDetail.description"
            :placeholder="t('placeholder.projectDetail')"
          />
        </dd>
      </dl>
    </div>

    <div class="action-bar tab-action-bar">
      <div class="swiper-bar">
        <div class="tabs-wrapper">
          <button
            v-if="canScrollLeft"
            class="btn-scroll left"
            @click="scrollTabs(-1)"
          >
            ◀
          </button>
          <div class="tabs" ref="tabsContainer" @scroll="updateScrollButtons">
            <div
              v-for="(tab, idx) in tabs"
              :key="tab"
              :class="['tab', { active: activeTab === idx }]"
              @click="onTabClick(idx)"
            >
              {{ t("processDetail.tabs." + tab) }}
            </div>
          </div>
          <button
            v-if="canScrollRight"
            class="btn-scroll right"
            @click="scrollTabs(1)"
          >
            ▶
          </button>
        </div>
      </div>

    <!-- 탭별 버튼들 -->
    <div class="tab-buttons">
             <!-- PFD 탭 버튼들 -->
       <div v-if="activeTab === 0" class="btns">
         <button class="btn btn-primary btn-add" @click="openPfdModal">
           {{ t("common.add") }}
         </button>
         <button
           class="btn btn-primary btn-delete"
           @click="handlePfdDelete"
           :disabled="!processStore.selectedPfdItems || processStore.selectedPfdItems.length === 0"
         >
           {{ t("common.delete") }}
         </button>
       </div>

                      



                            <!-- 컴포넌트 탭 버튼들 -->
         <div v-if="activeTab === 1" class="btns">
           <button class="btn btn-primary btn-add" @click="openStructModal">
             {{ t("common.add") }}
           </button>
           <button
             class="btn btn-primary btn-delete"
             @click="handleStructDelete"
             :disabled="!processStore.selectedStructItems || processStore.selectedStructItems.length === 0"
           >
             {{ t("common.delete") }}
           </button>
         </div>

                            <!-- 수리계통도 탭 버튼들 -->
         <div v-if="activeTab === 2" class="btns">
           <button class="btn btn-primary btn-add" @click="openHydraulicModal">
             {{ t("common.add") }}
           </button>
           <button
             class="btn btn-primary btn-delete"
             @click="handleHydraulicDelete"
             :disabled="!processStore.selectedHydraulicItems || processStore.selectedHydraulicItems.length === 0"
           >
             {{ t("common.delete") }}
           </button>
         </div>


    </div>
  </div>

     <div class="tab-content">
           <div v-if="activeTab === 0" class="content">
        <!-- 계산식 관리 탭 -->
        <DataTable
          :columns="formulaColumns"
          :data="processStore.formulaList"
          :loading="loading"
          :selectable="true"
          :selectedItems="processStore.selectedFormulaItems"
          @selection-change="handleFormulaSelectionChange"
          @sort-change="handleSortChange"
          @row-click="handleRowClick"
        />
        <div class="pagination-container">
          <Pagination
            :current-page="currentPageFormula"
            :total-pages="totalPagesFormula"
            @page-change="handlePageChangeFormula"
          />
        </div>
      </div>

     


                                          <div v-if="activeTab === 1" class="content">
           <!-- 컴포넌트 탭 -->
        <DataTable
          :columns="structColumns"
          :data="processStore.structList"
          :loading="loading"
          @sort-change="handleSortChange"
          @row-click="handleRowClick"
        />
        <div class="pagination-container">
          <Pagination
            :current-page="currentPageStruct"
            :total-pages="totalPagesStruct"
            @page-change="handlePageChangeStruct"
          />
        </div>
      </div>
                       <div v-if="activeTab === 2" class="content">
          <!-- 수리계통도 탭 -->
         <DataTable
           :columns="hydraulicColumns"
           :data="processStore.hydraulicList"
           :loading="loading"
           :selectable="true"
           :selectedItems="processStore.selectedHydraulicItems"
           @selection-change="handleHydraulicSelectionChange"
           @sort-change="handleSortChange"
           @row-click="handleRowClick"
         />
         <div class="pagination-container">
           <Pagination
             :current-page="currentPageHydraulic"
             :total-pages="totalPagesHydraulic"
             @page-change="handlePageChangeHydraulic"
           />
         </div>
                </div>
         
         <div v-if="activeTab === 3" class="content">
           <!-- PFD 탭 -->
           <div class="pfd-section">
             <div class="section-header">
               <h4>PFD 목록</h4>
             </div>
           </div>
           <DataTable
             :columns="pfdColumnsWithActions"
             :data="processStore.pfdList"
             :loading="loading"
             :selectable="true"
             :selectedItems="processStore.selectedPfdItems"
             @selection-change="handlePfdSelectionChange"
             @sort-change="handleSortChange"
             @row-click="handleRowClick"
           >
             <!-- 매핑 P&ID 목록 컬럼에 "보기" 버튼 렌더링 -->
             <template #cell-mappingPidList="{ item }">
               <button 
                 class="btn btn-link view-btn" 
                 @click.stop="handlePfdViewClick(item.id)"
               >
                 보기
               </button>
             </template>
           </DataTable>
           <!-- P&ID 목록 섹션 -->
           <div class="pid-section">
             <div class="section-header">
               <h4>P&ID 목록</h4>
               <div class="section-actions">
                 <button class="btn btn-primary" @click="handlePidAdd">
                   {{ t("common.add") }}
                 </button>
                 <button 
                   class="btn btn-danger" 
                   @click="handlePidDelete"
                   :disabled="!processStore.selectedPidItems || processStore.selectedPidItems.length === 0"
                 >
                   {{ t("common.delete") }}
                 </button>
               </div>
             </div>
             
             <DataTable
               :columns="pidColumns"
               :data="processStore.pagedPidList"
               :loading="loading"
               :selectable="true"
               :selectedItems="processStore.selectedPidItems"
               @selection-change="handlePidSelectionChange"
               @sort-change="handleSortChange"
               @row-click="handleRowClick"
             />
           </div>
         </div>
         
  </div>

  <!-- P&ID 파일 첨부 모달 -->
  <div v-if="showPidModal" class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <h3>{{ t("processDetail.attachPidFile") }}</h3>
        <button
          class="btn-close"
          @click="closePidModal"
          :aria-label="t('common.close')"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <dl class="column-regist">
          <dt class="essential">{{ t("processDetail.pidFile") }}</dt>
          <dd>
            <div class="file-upload-row">
              <input
                type="text"
                class="file-name-input"
                :value="getSelectedFilesText('pidFiles')"
                placeholder="파일 선택"
                readonly
              />
              <label class="file-select-btn">
                {{ t("common.selectFile") }}
                <input
                  type="file"
                  multiple
                  @change="handlePidFilesSelected"
                  style="display: none"
                />
              </label>
            </div>
          </dd>
        </dl>
      </div>
      <div class="modal-buttons">
        <button class="btn" @click="closePidModal">
          {{ t("common.cancel") }}
        </button>
        <button class="btn btn-primary" @click="uploadPidFiles">
          {{ t("common.upload") }}
        </button>
      </div>
    </div>
  </div>
  <!-- PFD 파일 첨부 모달 -->
  <div v-if="showPfdModal" class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <h3>{{ t("processDetail.attachPfdFile") }}</h3>
        <button
          class="btn-close"
          @click="closePfdModal"
          :aria-label="t('common.close')"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <dl class="column-regist">
          <dt class="essential">{{ t("processDetail.attachPfdFile") }}</dt>
          <dd>
            <div class="file-upload-row">
              <input
                type="text"
                class="file-name-input"
                :value="getSelectedFilesText('pfdFiles')"
                placeholder="파일 선택"
                readonly
              />
              <label class="file-select-btn">
                {{ t("common.selectFile") }}
                <input
                  type="file"
                  multiple
                  @change="handlePfdFilesSelected"
                  style="display: none"
                />
              </label>
            </div>
          </dd>
        </dl>
      </div>
      <div class="modal-buttons">
        <button class="btn" @click="closePfdModal">
          {{ t("common.cancel") }}
        </button>
        <button class="btn btn-primary" @click="uploadPfdFiles">
          {{ t("common.upload") }}
        </button>
      </div>
    </div>
  </div>

  <!-- 계산식 관리 파일 첨부 모달 -->
  <div v-if="processStore.showFormulaModal" class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <h3>{{ t("processDetail.attachFormulaFile") }}</h3>
        <button
          class="btn-close"
          @click="closeFormulaModal"
          :aria-label="t('common.close')"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <dl class="column-regist">
          <dt class="essential">{{ t("processDetail.attachFormulaFile") }}</dt>
          <dd>
            <div class="file-upload-row">
              <input
                type="text"
                class="file-name-input"
                :value="getSelectedFilesText('formulaFiles')"
                placeholder="파일 선택"
                readonly
              />
              <label class="file-select-btn">
                {{ t("common.selectFile") }}
                <input
                  type="file"
                  multiple
                  @change="handleFormulaFilesSelected"
                  style="display: none"
                />
              </label>
            </div>
          </dd>
        </dl>
      </div>
      <div class="modal-buttons">
        <button class="btn" @click="closeFormulaModal">
          {{ t("common.cancel") }}
        </button>
        <button class="btn btn-primary" @click="uploadFormulaFiles">
          {{ t("common.upload") }}
        </button>
      </div>
    </div>
  </div>
  

   

   <!-- 수리계통도 파일 첨부 모달 -->
   <div v-if="showHydraulicModal" class="modal-overlay">
     <div class="modal-window">
       <div class="modal-header">
         <h3>{{ t("processDetail.attachHydraulicFile") }}</h3>
         <button
           class="btn-close"
           @click="closeHydraulicModal"
           :aria-label="t('common.close')"
         >
           ×
         </button>
       </div>
       <div class="modal-body">
         <dl class="column-regist">
           <dt class="essential">{{ t("processDetail.attachHydraulicFile") }}</dt>
           <dd>
             <div class="file-upload-row">
               <input
                 type="text"
                 class="file-name-input"
                 :value="getSelectedFilesText('hydraulicFiles')"
                 placeholder="파일 선택"
                 readonly
               />
               <label class="file-select-btn">
                 {{ t("common.selectFile") }}
                 <input
                   type="file"
                   multiple
                   accept=".dwg"
                   @change="handleHydraulicFilesSelected"
                   style="display: none"
                 />
               </label>
             </div>
           </dd>
         </dl>
       </div>
             <div class="modal-buttons">
        <button class="btn" @click="closeHydraulicModal">
          {{ t("common.cancel") }}
        </button>
        <button class="btn btn-primary" @click="uploadHydraulicFiles">
          {{ t("common.upload") }}
        </button>
      </div>
     </div>
   </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useI18n } from "vue-i18n";
import { useProcessStore } from "../../stores/processStore";
import { request } from "../../utils/request";

// API 상태 확인 함수
const checkApiEndpoint = async (endpoint: string): Promise<boolean> => {
  try {
    const response = await fetch(endpoint, {
      method: 'OPTIONS', // CORS preflight 요청
      credentials: 'include'
    });
    console.log(`API 엔드포인트 ${endpoint} 상태:`, response.status, response.statusText);
    return response.status !== 404;
  } catch (error) {
    console.warn(`API 엔드포인트 ${endpoint} 확인 실패:`, error);
    return false;
  }
};

// API 오류 처리 유틸리티 함수
const handleApiError = (error: any, operation: string, fileName?: string) => {
  console.error(`${operation} 실패:`, error);
  
  let errorMessage = '';
  
  if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
    errorMessage = `⚠️ ${operation} 중 네트워크 오류가 발생했습니다.\n\n`;
    if (fileName) {
      errorMessage += `파일: ${fileName}\n\n`;
    }
    errorMessage += `오류: ${error.message}\n\n`;
    errorMessage += `가능한 원인:\n`;
    errorMessage += `• 서버가 실행되지 않았습니다\n`;
    errorMessage += `• API 엔드포인트가 존재하지 않습니다\n`;
    errorMessage += `• 네트워크 연결에 문제가 있습니다\n\n`;
    errorMessage += `서버 연결을 확인해주세요.`;
  } else if (error.status === 401 || error.status === 400) {
    const detailMessage = error?.message || error?.response?.detail || "인증이 만료되었습니다.";
    if (detailMessage.includes("인증") || detailMessage.includes("만료")) {
      errorMessage = "⚠️ 인증이 만료되었습니다.\n\n다시 로그인해주세요.";
      // 로그인 페이지로 리다이렉트
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      errorMessage = `⚠️ ${operation} 실패: ${detailMessage}`;
    }
  } else {
    errorMessage = `⚠️ ${operation} 실패: ${error.message || error.statusText || '알 수 없는 오류'}`;
  }
  
  if (errorMessage) {
    alert(errorMessage);
  }
  
  return errorMessage;
};

// Props 정의
interface Props {
  processId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  processId: undefined,
});

// Emits 정의
const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const route = useRoute();
const processStore = useProcessStore();

// 경로에서 파일명만 추출하는 함수
const getFileNameFromPath = (path: string | null | undefined): string => {
  if (!path || typeof path !== 'string') {
    return '';
  }
  
  // 경로 구분자로 분할하여 마지막 부분(파일명) 추출
  const pathParts = path.split(/[/\\]/);
  const fileName = pathParts[pathParts.length - 1];
  
  // 파일명이 비어있거나 경로가 없는 경우
  if (!fileName || fileName === path) {
    return path;
  }
  
  return fileName;
};

// 공통 로딩 상태
const loading = computed(() => processStore.loading);

// 0: P&ID 탭용 컬럼/데이터
const pidColumns: TableColumn[] = [
  { key: "pfdFileName", title: "PFD 파일명" },
  { key: "pidFileDwg", title: "P&ID 파일 DWG" },
  { key: "mappingExcel", title: "매핑정보 엑셀파일" },
  { key: "infoOverview", title: "정보개요(기기명+대수)" },
  { key: "svgPreview", title: "Svg 도면 미리보기" },
];

// 페이지 변경 핸들러
const handlePageChangePid = (page: number) => {
  processStore.setCurrentPagePid(page);
};

// 1: 설계조건 탭용 컬럼/데이터 (기존 복원)
const designColumns: TableColumn[] = [
  { key: "columnNm", title: t("columns.processDetail.item") },
  { key: "influent", title: t("columns.processDetail.influent") },
  { key: "effluent", title: t("columns.processDetail.effluent") },
  { key: "sludge", title: t("columns.processDetail.sludge") },
  { key: "unit", title: t("columns.processDetail.unit") },
  { key: "remark", title: t("columns.processDetail.remark") },
];

const designCriteriaColumns: TableColumn[] = [
  { key: "columnNm", title: t("columns.processDetail.item") },
  { key: "value", title: t("columns.processDetail.value") },
  { key: "min", title: t("columns.processDetail.min") },
  { key: "max", title: t("columns.processDetail.max") },
  { key: "unit", title: t("columns.processDetail.unit") },
  { key: "remark", title: t("columns.processDetail.remark") },
];

const designParameterColumns: TableColumn[] = [
  { key: "columnNm", title: t("columns.processDetail.item") },
  { key: "view", title: t("columns.processDetail.view") },
];

// 5: 설계조건 효율 테이블용 컬럼/데이터
const designEfficiencyColumns: TableColumn[] = [
  { key: "columnNm", title: t("columns.processDetail.item") },
  { key: "value", title: t("columns.processDetail.value") },
  { key: "min", title: t("columns.processDetail.min") },
  { key: "max", title: t("columns.processDetail.max") },
  { key: "unit", title: t("columns.processDetail.unit") },
  { key: "remark", title: t("columns.processDetail.remark") },
];

// 6: 계산식 관리 탭용 컬럼/데이터 (사용하지 않음 - formulaColumns로 대체)
// const calculationColumns: TableColumn[] = [
//   { key: "no", title: t("columns.processDetail.no") },
//   { key: "formulaVersion", title: t("columns.processDetail.formulaVersion") },
//   { key: "appliedVersion", title: t("columns.processDetail.appliedVersion") },
//   { key: "remark", title: t("columns.processDetail.remarks") },
// ];
// const calculationList = ref<any[]>([]);

  // 7: PFD 탭용 컬럼/데이터 (보기 버튼 포함)
  const pfdColumnsWithActions: TableColumn[] = [
    { key: "fileName", title: "PFD 파일명", sortable: true },
    { key: "registrationDate", title: "등록일자", sortable: true },
    {
      key: "info",
      title: "정보개요",
      sortable: true,
    },
    { key: "mappingPidList", title: "매핑 P&ID 목록", sortable: true },
    { key: "remarks", title: "비고", sortable: true },
  ];

const handlePfdSelectionChange = (items: any[]) => {
  processStore.setSelectedPfdItems(items);
  console.log("PFD selection changed:", items);
};

  // 계산식 관리 탭용 컬럼/데이터
  const formulaColumns: TableColumn[] = [
    { key: "formula_id", title: "formula_id", hidden: true }, // hidden 컬럼으로 formula_id 추가
    { key: "no", title: "순번", sortable: true },
    { key: "registeredFormula", title: "등록계산식", sortable: true },
    { key: "formula_code", title: "계산식 코드", sortable: true, hidden: true }, // 파일 내용을 표시하는 컬럼을 hidden으로 설정
    { key: "registrationDate", title: "등록일자", sortable: true },
    { key: "infoOverview", title: "정보개요", sortable: true },
    { key: "remarks", title: "비고", sortable: true },
  ];

const handleFormulaSelectionChange = (items: any[]) => {
  processStore.setSelectedFormulaItems(items);
  console.log("Formula selection changed:", items);
};

// 8: 전기도면 탭용 컬럼/데이터 (현재 사용하지 않음)
// const electricColumns: TableColumn[] = [
//   { key: "dwg", title: t("columns.processDetail.dwgFile"), sortable: true },
//   { key: "excel", title: t("columns.processDetail.excel"), sortable: true },
//   {
//     key: "info",
//     title: t("columns.processDetail.infoOverview"),
//     sortable: true,
//   },
//   { key: "view", title: t("columns.processDetail.svgPreview"), sortable: true },
// ];
// const electricList = ref<any[]>([]);
// // 전기도면 탭 선택 상태
// const selectedElectricItems = ref<any[]>([]);
// const handleElectricSelectionChange = (items: any[]) => {
//   selectedElectricItems.value = items;
//   console.log("Electric drawing selection changed:", items);
// };

const structColumns: TableColumn[] = [
  { key: "type", title: t("columns.processDetail.type"), sortable: true },
  {
    key: "components",
    title: t("columns.processDetail.components"),
    sortable: true,
  },
  {
    key: "equipmentType",
    title: t("columns.processDetail.equipmentType"),
    sortable: true,
  },
  { key: "item", title: t("columns.processDetail.item"), sortable: true },
];

// PID 탭 선택 변경 핸들러
const handlePidSelectionChange = (items: any[]) => {
  processStore.setSelectedPidItems(items);
  console.log("PID selection changed:", items);
};

// 9: Mcc 구성도 탭용 컬럼/데이터 (현재 사용하지 않음)
// const mccColumns: TableColumn[] = [
//   { key: "dwg", title: t("columns.processDetail.dwgFile"), sortable: true },
//   { key: "excel", title: t("columns.processDetail.excel"), sortable: true },
//   {
//     key: "info",
//     title: t("columns.processDetail.infoOverview"),
//     sortable: true,
//   },
//   { key: "view", title: t("columns.processDetail.svgPreview"), sortable: true },
// ];
// const mccList = ref<any[]>([]);
// // Mcc 구성도 탭 선택 상태
// const selectedMccItems = ref<any[]>([]);
// const handleMccSelectionChange = (items: any[]) => {
//   selectedMccItems.value = items;
//   console.log("MCC diagram selection changed:", items);
// };

 // 10: 수리계통도 탭용 컬럼/데이터
 const hydraulicColumns: TableColumn[] = [
   { key: "dwg", title: "도면파일 DWG", sortable: true },
   { key: "registrationDate", title: "등록일자", sortable: true },
   {
     key: "info",
     title: "정보개요",
     sortable: true,
   },
   { key: "view", title: "Svg 도면 미리보기", sortable: true },
 ];

const handleHydraulicSelectionChange = (items: any[]) => {
  processStore.setSelectedHydraulicItems(items);
  console.log("Hydraulic diagram selection changed:", items);
};

// 정렬 이벤트 핸들러
const handleSortChange = (args: {
  key: string | null;
  direction: "asc" | "desc" | null;
}) => {
  console.log("Sort:", args.key, args.direction);
};

// 행 클릭 핸들러
const handleRowClick = (item: any, index: number) => {
  console.log("Row clicked:", item, index);
};

// PFD 그리드의 "보기" 버튼 클릭 핸들러 (현재는 사용하지 않음)
const handlePfdViewClick = (itemId: string) => {
  console.log("PFD 보기 버튼 클릭:", itemId);
  // P&ID 목록이 PFD 탭 하단에 표시되므로 모달을 열 필요 없음
};

// P&ID 추가 핸들러
const handlePidAdd = () => {
  console.log("P&ID 추가 버튼 클릭");
  // TODO: P&ID 추가 로직 구현
  alert("P&ID 추가 기능을 구현해야 합니다.");
};



// Process.vue와 동일한 구조의 핸들러 함수들
// 공정구분 변경 핸들러
const handleProcessTypeChange = () => {
  const selectedValue = processStore.processDetail.processType;

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 중분류 옵션 초기화
    processStore.searchSubCategoryOptions.length = 0;
    processStore.setProcessDetail({ subCategory: null });
    // 공정명 옵션도 초기화
    processStore.searchProcessNameOptions.length = 0;
    processStore.setProcessDetail({ processName: null });
    console.log(
      "검색 옵션 변경: null 또는 공백값 선택 - 중분류 및 공정명 옵션 초기화"
    );
  } else {
    const selectedOption = processStore.searchProcessTypeOptions.find(
      (option) => option.value === selectedValue
    );

    if (selectedOption) {
      console.log("검색 옵션 변경:");
      console.log("  key:", selectedOption.value);
      console.log("  value:", selectedOption.label);
      // 공정명 옵션 초기화
      processStore.searchProcessNameOptions.length = 0;
      processStore.setProcessDetail({ processName: null });
      handleSubCategoryCode();
    } else {
      console.log("검색 옵션 변경: 선택되지 않음");
    }
  }
};

// 공정명 변경 핸들러
const handleProcessNameChange = () => {
  const selectedValue = processStore.processDetail.processName;

  if (selectedValue === null || selectedValue === "") {
    console.log("공정명 변경: null 또는 공백값 선택");
  } else {
    console.log("공정명 변경:", selectedValue);
  }
};

// 공정 중분류(subCategory) 변경 핸들러
const handleSubCategoryChange = () => {
  const selectedValue = processStore.processDetail.subCategory;

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 공정명 옵션 초기화
    processStore.searchProcessNameOptions.length = 0;
    processStore.setProcessDetail({ processName: null });
    console.log("공정 중분류 변경: null 또는 공백값 선택 - 공정명 옵션 초기화");
  } else {
    console.log("공정 중분류 변경:", selectedValue);
    // 공정명 옵션 로드
    handleProcessNameCode();
  }
};

// Process.vue와 동일한 구조의 중분류 코드 검색 함수
const handleSubCategoryCode = async () => {
  try {
    if (processStore.processDetail.processType) {
      await processStore.loadSubCategoryCodes(
        processStore.processDetail.processType
      );
    }
  } catch (error: any) {
    console.error("중분류 코드 검색 실패:", error);
    const errorMessage =
      error.message || error.response || "알 수 없는 오류가 발생했습니다.";
    alert(`중분류 코드 검색 실패: ${errorMessage}`);
  }
};

// Process.vue와 동일한 구조의 공정명 코드 검색 함수
const handleProcessNameCode = async () => {
  try {
    if (processStore.processDetail.subCategory) {
      await processStore.loadProcessNameCodes(
        processStore.processDetail.subCategory
      );
    }
  } catch (error: any) {
    console.error("공정명 코드 검색 실패:", error);
    const errorMessage =
      error.message || error.response || "알 수 없는 오류가 발생했습니다.";
    alert(`공정명 코드 검색 실패: ${errorMessage}`);
  }
};

// 계산식 검색 API 호출 함수
const searchFormulaAPI = async () => {
  try {
    console.log('계산식 검색 API 호출 시작 - 엔드포인트: /api/process/formula/search');
    
    // props에서 processId를 우선 사용하고, 없으면 라우터 매개변수 사용
    const processId = props.processId || (route.params.id as string);
    
    if (!processId) {
      console.warn('processId가 없어서 계산식 검색을 건너뜁니다.');
      return { data: [] };
    }
    
    const requestBody = {
      //search_field: "process_id",
      //search_value: processId + "", // 동적으로 process_id 사용 (API에서 process_id 를 string으로 인식하고 있어 ""추가)
      //order_by: "created_at"
      process_id: processId // 동적으로 process_id 사용
    };
    
    console.log('요청 데이터:', requestBody);
    console.log('사용된 processId:', processId);
    
    const response = await request('/api/process/formula/search', null, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('API 응답:', response);

    if (!response.success) {
      // request 함수에서 반환된 오류 응답 처리
      console.error('API 응답 오류:', response);
      
      // 실제 인증 오류인지 확인
      const isAuthError = response.status === 401 || 
                         response.message?.includes('Authentication required') ||
                         response.message?.includes('세션이 만료되었습니다') ||
                         response.response?.error_code === 'SESSION_REQUIRED';
      
      if (isAuthError) {
        console.warn('⚠️ 인증이 만료되었습니다. 로그인이 필요합니다.');
        console.log('인증 오류 응답:', response);
        
        // 인증 오류 시 빈 데이터 반환
        return { 
          success: false,
          error: 'AUTH_REQUIRED',
          message: '인증이 필요합니다. 다시 로그인해주세요.',
          data: [] 
        };
      }
      
      // 400 상태 코드이지만 실제로는 404 오류인 경우 처리
      if (response.status === 404 || (response.status === 400 && response.message?.includes('Not Found'))) {
        console.log('API 엔드포인트가 존재하지 않습니다. 임시 더미 데이터로 초기화합니다.');
        console.warn('⚠️ /api/process/formula/search API가 구현되지 않았습니다. 백엔드 개발자에게 문의하세요.');
        
        // 임시로 더미 데이터 반환하여 그리드가 정상적으로 표시되도록 함
        return { 
          success: true,
          response: [
            {
              id: "1",
              formula_name: "계산식_001",
              created_at: "2024-01-15",
              formula_scope: "PROCESS",
              output_type: "number"
            },
            {
              id: "2", 
              formula_name: "계산식_002",
              created_at: "2024-01-20",
              formula_scope: "PROCESS",
              output_type: "number"
            }
          ] 
        };
      } else if (response.status === 400) {
        // 400 오류에서도 인증 관련 메시지가 있는지 다시 한번 확인
        if (response.message?.includes('SESSION_REQUIRED') || 
            response.message?.includes('Authentication required') || 
            response.message?.includes('세션이 만료되었습니다') ||
            response.response?.error_code === 'SESSION_REQUIRED') {
          
          console.warn('⚠️ 400 오류에서 인증 문제를 발견했습니다. 인증이 필요합니다.');
          console.log('400 인증 오류 응답:', response);
          
          return { 
            success: false,
            error: 'AUTH_REQUIRED',
            message: '인증이 필요합니다. 다시 로그인해주세요.',
            data: [] 
          };
        }
        
        console.log('API 요청 형식이 잘못되었습니다. 빈 데이터로 초기화합니다.');
        console.log('400 오류 상세:', response);
        return { data: [] };
      }
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${response.message}`);
    }

    console.log('계산식 검색 API 호출 성공:', response);
    return response;
  } catch (error) {
    console.error('계산식 검색 API 호출 실패:', error);
    
    // 네트워크 오류나 기타 오류 시에도 빈 데이터 반환
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.log('네트워크 오류로 인해 빈 데이터로 초기화합니다.');
      return { data: [] };
    }
    
    // 기타 오류 시에도 빈 데이터 반환하여 화면이 정상적으로 로드되도록 함
    console.log('API 호출 실패로 인해 빈 데이터로 초기화합니다.');
    return { data: [] };
  }
};

// MinIO 업로드 함수는 제거됨 - createProcessSymbolAPI에서 직접 파일 전송

// 공정 심볼 파일 생성/수정 API 호출 함수
const createProcessSymbolAPI = async (symbolCode: string, symbolName: string, selectedFile: File, isUpdate: boolean = false, symbolId?: string) => {
  try {
    console.log('createProcessSymbolAPI 호출:', {
      symbolCode,
      symbolName,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      isUpdate,
      symbolId
    });
    
    // FormData 생성하여 MultipartFile 형식으로 전송
    const formData = new FormData();
    formData.append('symbol_code', symbolCode);
    formData.append('symbol_name', symbolName);
    formData.append('siteFile', selectedFile); // 파일을 MultipartFile 형식으로 추가
    
    // FormData 내용 확인
    console.log('FormData 내용 확인:');
    console.log('symbol_code:', formData.get('symbol_code'));
    console.log('symbol_name:', formData.get('symbol_name'));
    console.log('siteFile:', formData.get('siteFile'));
    
    console.log('공정 심볼 API 요청 데이터 (FormData):', {
      symbol_code: symbolCode,
      symbol_name: symbolName,
      siteFile: selectedFile.name
    });
    
    // API 엔드포인트 결정 (생성 또는 수정)
    const endpoint = isUpdate && symbolId 
      ? `/api/process/symbol/update/${symbolId}` 
      : '/api/process/symbol/create';
    
    const method = isUpdate ? 'PUT' : 'POST';
    
    console.log('API 엔드포인트:', endpoint);
    console.log('HTTP 메서드:', method);
    
    const response = await request(endpoint, {}, {
      method: method,
      // Content-Type 헤더 제거 (FormData 사용 시 자동으로 설정됨)
      body: formData,
    });

    if (!response.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('공정 심볼 API 호출 성공');
    
    // symbol_id 값 추출 (수정인 경우 기존 symbolId 반환, 생성인 경우 응답에서 추출)
    let resultSymbolId = null;
    if (isUpdate && symbolId) {
      // 수정인 경우 기존 symbolId 반환
      resultSymbolId = symbolId;
    } else {
      // 생성인 경우 응답에서 symbol_id 추출
      if (response.response && response.response.data && response.response.data.symbol_id) {
        resultSymbolId = response.response.data.symbol_id;
      } else if (response.response && response.response.symbol_id) {
        resultSymbolId = response.response.symbol_id;
      } else if (response.response && response.response.id) {
        resultSymbolId = response.response.id;
      }
    }
    
    return { success: true, symbol_id: resultSymbolId };
  } catch (error) {
    console.error('공정 심볼 API 호출 실패:', error);
    throw error;
  }
};

// 계산식 API 호출 함수
const createFormulaAPI = async (processId: string, formulaName: string, formulaCode: string) => {
  try {
    console.log('createFormulaAPI 호출:', {
      processId,
      formulaName,
      formulaCode_length: formulaCode ? formulaCode.length : 0,
      formulaCode_preview: formulaCode ? formulaCode.substring(0, 100) : '없음'
    });
    
    const requestBody = {
      process_id: processId,
      formula_name: formulaName,
      formula_code: formulaCode, // formula_code 필드 추가
    };
    
    console.log('API 요청 데이터:', requestBody);
    
    const response = await request('/api/process/formula/create', {}, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('계산식 생성 API 호출 성공');
    return true;
  } catch (error) {
    console.error('계산식 API 호출 실패:', error);
    throw error;
  }
};

// 공정 수정 처리 함수
const handleUpdate = async () => {
  try {
    console.log("공정 수정 처리 시작");
    
    // props에서 processId를 우선 사용하고, 없으면 라우터 매개변수 사용
    const processId = props.processId || (route.params.id as string);
    
    console.log("props.processId:", props.processId);
    console.log("route.params.id:", route.params.id);
    console.log("사용할 processId:", processId);
    
    if (!processId) {
      throw new Error("공정 ID가 없습니다. props.processId와 route.params.id 모두 확인해주세요.");
    }
    
    // processName의 label 값과 key(value) 값 찾기
    // processStore.processDetail.processName에는 선택된 옵션의 value가 저장되어 있음
    const selectedProcessNameOption = processStore.searchProcessNameOptions.find(
      option => option.value === processStore.processDetail.processName
    );
    
    // processCode에는 value(내부 코드값)를, processName에는 label(표시값)을 사용
    const processNameValue = selectedProcessNameOption?.value || processStore.processDetail.processName || "";
    const processNameLabel = selectedProcessNameOption?.label || processStore.processDetail.processName || "";
    
    console.log("=== 선택된 공정명 옵션 정보 ===");
    console.log("selectedProcessNameOption:", selectedProcessNameOption);
    console.log("processNameValue (processCode용):", processNameValue);
    console.log("processNameLabel (processName용):", processNameLabel);
    
    // globalProcessData 동기화 (processDetail의 현재 값으로 업데이트)
    const newGlobalData = {
      level2_code_key: processStore.processDetail.processType || "",
      level3_code_key: processStore.processDetail.subCategory || "",
      process_code: processStore.processDetail.processName || "",
    };
    
    processStore.setGlobalProcessData(newGlobalData);
    
    let symbolId = null;
    let hasAnyChanges = false; // 전체 변경사항 감지용
    
    // 공정 심볼 파일 변경 감지 및 API 호출
    const selectedFile = processStore.selectedFiles['processSymbol'];
    const originalProcessSymbol = processStore.processDetail.originalProcessSymbol;
    const originalSymbolId = processStore.processDetail.originalSymbolId;
    const currentProcessSymbol = processStore.processDetail.processSymbol;
    
    console.log("=== 공정심볼 변경 감지 ===");
    console.log("원본 공정심볼 파일명:", originalProcessSymbol);
    console.log("원본 심볼 ID:", originalSymbolId);
    console.log("현재 공정심볼 파일명:", currentProcessSymbol);
    console.log("선택된 파일:", selectedFile);
    
    if (selectedFile && selectedFile instanceof File) {
      try {
        console.log("공정 심볼 파일 발견, API 호출 시작");
        console.log("selectedFile:", selectedFile);
        console.log("파일명:", selectedFile.name);
        console.log("파일 크기:", selectedFile.size);
        
        // 선택된 공정명 옵션에서 label 값 가져오기
        const symbolCode = processNameValue; // processName의 value
        const symbolName = processNameLabel; // processName의 label
        
        // 공정심볼 변경 여부 확인 (파일명, 크기, 마지막 수정시간 비교)
        const isSymbolChanged = selectedFile.name !== originalProcessSymbol;
        
        // 추가 검증: 파일이 실제로 변경되었는지 더 정확하게 확인
        let isActuallyChanged = isSymbolChanged;
        
        // 파일명이 같지만 다른 파일일 수 있으므로 추가 검증
        if (!isSymbolChanged && originalProcessSymbol) {
          // 파일명이 같으면 실제로는 변경되지 않은 것으로 간주
          isActuallyChanged = false;
          console.log("=== 파일 변경 감지 결과 ===");
          console.log("파일명이 동일하므로 실제 변경사항 없음");
        }
        
        const isUpdate = Boolean(isActuallyChanged && originalSymbolId && originalProcessSymbol);
        
        console.log("=== 공정심볼 변경 감지 상세 ===");
        console.log("선택된 파일명:", selectedFile.name);
        console.log("원본 심볼 파일명:", originalProcessSymbol);
        console.log("선택된 파일 크기:", selectedFile.size);
        console.log("선택된 파일 마지막 수정시간:", new Date(selectedFile.lastModified).toLocaleString());
        console.log("공정심볼 변경 여부:", isSymbolChanged);
        console.log("수정 여부:", isUpdate);
        
        // 기존 심볼파일과 동일한 경우 API 호출 불필요
        // 파일명이 같고, 원본 심볼이 존재하는 경우
        if (!isActuallyChanged && originalProcessSymbol) {
          console.log("✅ 기존 심볼파일과 동일합니다. API 호출을 건너뜁니다.");
          console.log("기존 symbol_id 사용:", originalSymbolId);
          symbolId = originalSymbolId; // 기존 symbol_id 사용
          
          // 사용자에게 안내
          console.log("💡 동일한 심볼파일이므로 저장/업데이트 API를 호출하지 않습니다.");
          
          // hasAnyChanges는 설정하지 않음 (변경사항이 없으므로)
        } else {
          // 실제로 심볼 파일이 변경된 경우에만 hasAnyChanges를 true로 설정
          if (isActuallyChanged) {
            hasAnyChanges = true; // 심볼 파일 변경됨
            console.log("✅ 심볼 파일이 실제로 변경되어 hasAnyChanges를 true로 설정");
          } else {
            console.log("ℹ️ 심볼 파일 변경사항이 없어 hasAnyChanges를 설정하지 않습니다.");
          }
          
          console.log("공정 심볼 API 매개변수:", { 
            symbolCode, 
            symbolName, 
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            isUpdate,
            originalSymbolId
          });
          
          // API 호출 (생성 또는 수정)
          const symbolResult = await createProcessSymbolAPI(
            symbolCode, 
            symbolName, 
            selectedFile, 
            isUpdate, 
            isUpdate ? originalSymbolId : undefined
          );
          
          console.log("공정 심볼 API 호출 완료");
          
          // symbol_id 값 확인 및 저장
          if (symbolResult && symbolResult.success && symbolResult.symbol_id) {
            symbolId = symbolResult.symbol_id;
            const actionType = isUpdate ? "수정" : "생성";
            alert(`✅ 공정 심볼 ${actionType} 성공!\n${actionType === "수정" ? "수정된" : "생성된"} symbol_id: ${symbolId}`);
            console.log(`${actionType}된 symbol_id:`, symbolId);
          } else {
            const actionType = isUpdate ? "수정" : "생성";
            alert(`⚠️ 공정 심볼은 ${actionType}되었으나 symbol_id를 확인할 수 없습니다.`);
            console.warn("symbol_id를 확인할 수 없음:", symbolResult);
            return; // symbol_id가 없으면 공정 수정도 중단
          }
        }
      } catch (symbolError: any) {
        console.error("공정 심볼 API 호출 실패:", symbolError);
        
        // 인증 오류인지 확인
        if (symbolError?.status === 401 || symbolError?.status === 400) {
          const errorMessage = symbolError?.message || symbolError?.response?.detail || "인증이 만료되었습니다.";
          if (errorMessage.includes("인증") || errorMessage.includes("만료")) {
            alert("⚠️ 인증이 만료되었습니다.\n\n다시 로그인해주세요.");
            // 로그인 페이지로 리다이렉트
            window.location.href = '/login';
            return;
          }
        }
        
        alert("공정 심볼 파일 저장에 실패했습니다. 공정 수정을 중단합니다.");
        return; // 공정 심볼 API 실패 시 공정 수정도 중단
      }
    } else if (originalProcessSymbol && !currentProcessSymbol) {
      // 공정심볼이 삭제된 경우 (원본에는 있지만 현재는 없음)
      console.log("공정 심볼이 삭제되었습니다.");
      console.log("원본 공정심볼:", originalProcessSymbol);
      console.log("현재 공정심볼:", currentProcessSymbol);
    } else {
      console.log("공정 심볼 파일이 없거나 File 객체가 아닙니다.");
      console.log("processStore.selectedFiles['processSymbol']:", selectedFile);
      console.log("processStore.processDetail.processSymbol:", processStore.processDetail.processSymbol);
    }
    
    const processDetailData = {
      processType: processStore.processDetail.processType || "",
      processCode: processNameValue,      // value 값 사용 (내부 코드)
      processName: processNameLabel,      // label 값 사용 (표시명)
      subCategory: processStore.processDetail.subCategory || "",
      processSymbol: processStore.processDetail.processSymbol || "",
      description: processStore.processDetail.description || "",
      symbolId: symbolId && symbolId.trim() !== "" ? symbolId : undefined,  // 공정 심볼 API에서 받은 symbol_id 추가 (유효한 경우만)
    };
    
    console.log("=== processStore.processDetail에서 직접 가져온 데이터 ===");
    console.log("processDetailData:", processDetailData);
    
    // 공정 정보 변경사항 감지 (심볼 변경 여부만 확인)
    if (symbolId !== originalSymbolId) {
      hasAnyChanges = true;
      console.log("✅ 공정 심볼 변경사항이 발견되었습니다.");
    }
    
    console.log("전체 변경사항 존재 여부:", hasAnyChanges);
    
    // 변경사항이 있는 경우에만 공정 정보 업데이트
    if (hasAnyChanges) {
      try {
        await processStore.updateProcess(processId, processDetailData);
        console.log("공정 정보 업데이트 완료");
      } catch (updateError: any) {
        console.error("공정 정보 업데이트 실패:", updateError);
        
        // 인증 오류인지 확인
        if (updateError?.status === 401 || updateError?.status === 400) {
          const errorMessage = updateError?.message || updateError?.response?.detail || "인증이 만료되었습니다.";
          if (errorMessage.includes("인증") || errorMessage.includes("만료")) {
            alert("⚠️ 인증이 만료되었습니다.\n\n다시 로그인해주세요.");
            // 로그인 페이지로 리다이렉트
            window.location.href = '/login';
            return;
          }
        }
        
        throw updateError; // 다른 오류는 상위로 전파
      }
    } else {
      console.log("공정 정보 변경사항이 없어 업데이트를 건너뜁니다.");
    }
    
    // 계산식 관리 탭 그리드 데이터 비교하여 추가된 행 확인
    console.log("계산식 그리드 데이터 비교 시작");
    console.log("초기값:", processStore.initialFormulaList);
    console.log("현재값:", processStore.formulaList);
    
    // 데이터 유효성 검증
    const hasValidInitialData = processStore.initialFormulaList && 
                               Array.isArray(processStore.initialFormulaList) && 
                               processStore.initialFormulaList.length > 0;
    
    const hasValidCurrentData = processStore.formulaList && 
                               Array.isArray(processStore.formulaList);
    
    console.log("초기값 유효성:", hasValidInitialData);
    console.log("현재값 유효성:", hasValidCurrentData);
    
    // 초기값과 현재값이 모두 유효한 경우에만 비교 수행
    if (hasValidInitialData && hasValidCurrentData) {
      // 데이터 상세 로깅
      console.log("=== 데이터 상세 분석 ===");
      console.log("초기값 상세:", processStore.initialFormulaList.map(item => ({
        formula_id: item.formula_id,
        registeredFormula: item.registeredFormula,
        id: item.id
      })));
      console.log("현재값 상세:", processStore.formulaList.map(item => ({
        formula_id: item.formula_id,
        registeredFormula: item.registeredFormula,
        id: item.id
      })));
      
      // formula_id 중복 검사
      const initialIds = processStore.initialFormulaList.map(item => item.formula_id).filter(Boolean);
      const currentIds = processStore.formulaList.map(item => item.formula_id).filter(Boolean);
      
      const duplicateInitialIds = initialIds.filter((id, index) => initialIds.indexOf(id) !== index);
      const duplicateCurrentIds = currentIds.filter((id, index) => currentIds.indexOf(id) !== index);
      
      if (duplicateInitialIds.length > 0) {
        console.warn("⚠️ 초기값에 중복된 formula_id 발견:", duplicateInitialIds);
      }
      if (duplicateCurrentIds.length > 0) {
        console.warn("⚠️ 현재값에 중복된 formula_id 발견:", duplicateCurrentIds);
      }
      
      // 삭제된 행 찾기 (초기값에는 있지만 현재값에는 없는 행)
      const deletedRows = processStore.initialFormulaList.filter(initialItem => {
        if (!initialItem.formula_id) {
          console.warn("초기값에 formula_id가 없는 항목:", initialItem);
          return false; // formula_id가 없으면 삭제 대상에서 제외
        }
        return !processStore.formulaList.some(currentItem => 
          currentItem.formula_id && currentItem.formula_id === initialItem.formula_id
        );
      });
      
      // 추가된 행 찾기 (현재값에는 있지만 초기값에는 없는 행)
      const addedRows = processStore.formulaList.filter(currentItem => {
        if (!currentItem.formula_id) {
          console.warn("현재값에 formula_id가 없는 항목:", currentItem);
          return false; // formula_id가 없으면 추가 대상에서 제외
        }
        return !processStore.initialFormulaList.some(initialItem => 
          initialItem.formula_id && initialItem.formula_id === currentItem.formula_id
        );
      });
      
      console.log("삭제된 행 수:", deletedRows.length);
      console.log("추가된 행 수:", addedRows.length);
      
      // 실제 변경사항이 있는지 확인
      const hasChanges = deletedRows.length > 0 || addedRows.length > 0;
      console.log("실제 변경사항 존재 여부:", hasChanges);
      
      if (hasChanges) {
        hasAnyChanges = true; // 계산식 변경사항이 있음
        console.log("✅ 계산식 변경사항이 발견되었습니다.");
      } else {
        console.log("ℹ️ 계산식 변경사항이 없습니다.");
      }
      
      // 삭제된 행이 있는 경우 삭제 API 호출
      if (deletedRows.length > 0) {
      console.log("삭제된 행 발견:", deletedRows);
      const deletedFormulaIds = deletedRows.map(row => row.formula_id);
      
      try {
        console.log("삭제된 행에 대한 API 호출 시작");
        const deletePromises = deletedFormulaIds.map(formulaId => 
          deleteFormulaAPI(formulaId)
        );
        
        await Promise.all(deletePromises);
        console.log("삭제된 행에 대한 API 호출 완료");
      } catch (deleteError: any) {
        console.error("삭제된 행 API 호출 실패:", deleteError);
        
        // 인증 오류인지 확인
        if (deleteError?.status === 401 || deleteError?.status === 400) {
          const errorMessage = deleteError?.message || deleteError?.response?.detail || "인증이 만료되었습니다.";
          if (errorMessage.includes("인증") || errorMessage.includes("만료")) {
            alert("⚠️ 인증이 만료되었습니다.\n\n다시 로그인해주세요.");
            // 로그인 페이지로 리다이렉트
            window.location.href = '/login';
            return;
          }
        }
        
        alert("공정은 수정되었으나 삭제된 계산식 데이터 처리에 실패했습니다.");
      }
    } else {
      console.log("삭제된 행이 없습니다.");
    }
    
    if (addedRows.length > 0) {
      console.log("추가된 행 발견:", addedRows);
      const addedFormulaIds = addedRows.map(row => row.formula_id).join(', ');
      //alert(`추가된 계산식 formula_id: ${addedFormulaIds}`);
      
      // 추가된 행에 대해서만 API 호출
      console.log("추가된 행에 대해서만 API 호출 시작");
      
      try {
        console.log("추가된 행들의 formula_code 확인:");
        addedRows.forEach((formula, index) => {
          console.log(`행 ${index + 1}:`, {
            registeredFormula: formula.registeredFormula,
            formula_code_length: formula.formula_code ? formula.formula_code.length : 0,
            formula_code_preview: formula.formula_code ? formula.formula_code.substring(0, 100) : '없음'
          });
        });
        
        const formulaPromises = addedRows.map(formula => 
          createFormulaAPI(processId, formula.registeredFormula, formula.formula_code || '')
        );
        
        await Promise.all(formulaPromises);
        console.log("추가된 행에 대한 API 호출 완료");
      } catch (formulaError: any) {
        console.error("추가된 행 API 호출 실패:", formulaError);
        
        // 인증 오류인지 확인
        if (formulaError?.status === 401 || formulaError?.status === 400) {
          const errorMessage = formulaError?.message || formulaError?.response?.detail || "인증이 만료되었습니다.";
          if (errorMessage.includes("인증") || errorMessage.includes("만료")) {
            alert("⚠️ 인증이 만료되었습니다.\n\n다시 로그인해주세요.");
            // 로그인 페이지로 리다이렉트
            window.location.href = '/login';
            return;
          }
        }
        
        alert("공정은 수정되었으나 추가된 계산식 데이터 저장에 실패했습니다.");
      }
    } else {
      console.log("추가된 행이 없습니다. API 호출을 건너뜁니다.");
    }
  } else {
    console.log("데이터 유효성 검증 실패로 계산식 그리드 비교를 건너뜁니다.");
    console.log("초기값 상태:", processStore.initialFormulaList);
    console.log("현재값 상태:", processStore.formulaList);
  }
  
  // 수리계통도 도면 생성 API 호출
  console.log("=== 수리계통도 도면 생성 시작 ===");
  if (processStore.hydraulicList && processStore.hydraulicList.length > 0) {
    console.log("수리계통도 그리드에 데이터가 있습니다. 도면 생성 API를 호출합니다.");
    
    try {
      // searchProcessNameOptions에서 현재 선택된 공정명 정보 가져오기
      const currentProcessName = processStore.processDetail.processName;
      const processNameOption = processStore.searchProcessNameOptions.find(
        option => option.value === currentProcessName
      );
      
      if (!processNameOption) {
        console.warn("현재 선택된 공정명에 대한 옵션을 찾을 수 없습니다:", currentProcessName);
      } else {
        console.log("공정명 옵션 정보:", processNameOption);
        
        // API 엔드포인트 상태 확인
        const drawingApiExists = await checkApiEndpoint('/api/process/drawing/create');
        if (!drawingApiExists) {
          console.error('도면 생성 API 엔드포인트가 존재하지 않습니다: /api/process/drawing/create');
          alert('⚠️ 도면 생성 API가 서버에 구현되지 않았습니다.\n\n관리자에게 문의해주세요.');
          return;
        }
        
        // 수리계통도 그리드의 각 항목에 대해 도면 생성 API 호출
        const drawingPromises = processStore.hydraulicList.map(async (hydraulicItem) => {
          if (!hydraulicItem._file) {
            console.warn("File 객체가 없는 항목을 건너뜁니다:", hydraulicItem.id);
            return null;
          }
          
          const drawingData = {
            process_id: processId,
            drawing_type: "HYD_DIAG",
            drawing_number: processNameOption.value,
            drawing_title: processNameOption.label,
            drawing_status: "DRAFT",
            revision: "A",
            description: processNameOption.label + "도면",
            siteFile: hydraulicItem._file
          };
          
                      console.log("도면 생성 API 호출 데이터:", {
              ...drawingData,
              siteFile: `File: ${hydraulicItem._file.name} (${hydraulicItem._file.size} bytes)`
            });
          
          try {
            // FormData 생성
            const formData = new FormData();
            formData.append('process_id', drawingData.process_id);
            formData.append('drawing_type', drawingData.drawing_type);
            formData.append('drawing_number', drawingData.drawing_number);
            formData.append('drawing_title', drawingData.drawing_title);
            formData.append('drawing_status', drawingData.drawing_status);
            formData.append('revision', drawingData.revision);
            formData.append('description', drawingData.description);
            formData.append('siteFile', drawingData.siteFile);
            
            // FormData 내용 확인
            console.log('FormData 내용:');
            try {
              for (let [key, value] of (formData as any).entries()) {
                if (value instanceof File) {
                  console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                  console.log(`${key}: ${value}`);
                }
              }
            } catch (e) {
              console.log('FormData 내용 확인 실패:', e);
            }
            
            // API 호출 (FormData는 직접 fetch 사용)
            console.log('도면 생성 API 호출 시작:', '/api/process/drawing/create');
            
            const response = await fetch('/api/process/drawing/create', {
              method: 'POST',
              body: formData,
              credentials: 'include', // 쿠키 포함
              headers: {
                // FormData 사용 시 Content-Type은 자동 설정되므로 제거
                'user_Id': localStorage.getItem('authUserId') || '',
                'wai_lang': localStorage.getItem('wai_lang') || 'ko'
              }
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            
            console.log(`도면 생성 API 호출 성공 (${hydraulicItem.dwg}):`, responseData);
            return { success: true, item: hydraulicItem, response: responseData };
            
          } catch (drawingError: any) {
            // 새로운 에러 처리 유틸리티 함수 사용
            handleApiError(drawingError, '도면 생성', hydraulicItem.dwg);
            return { success: false, item: hydraulicItem, error: drawingError };
          }
        });
        
        // 모든 도면 생성 API 호출 완료 대기
        const drawingResults = await Promise.all(drawingPromises);
        const successfulDrawings = drawingResults.filter(result => result && result.success);
        const failedDrawings = drawingResults.filter(result => result && !result.success);
        
        console.log("도면 생성 결과:", {
          성공: successfulDrawings.length,
          실패: failedDrawings.length,
          전체: processStore.hydraulicList.length
        });
        
        if (failedDrawings.length > 0) {
          console.warn("일부 도면 생성에 실패했습니다:", failedDrawings);
        }
      }
      
    } catch (hydraulicError: any) {
      // 새로운 에러 처리 유틸리티 함수 사용
      handleApiError(hydraulicError, '수리계통도 도면 생성');
      console.warn("수리계통도 도면 생성에 실패했지만 공정 수정은 완료되었습니다.");
    }
  } else {
    console.log("수리계통도 그리드에 데이터가 없습니다. 도면 생성 API를 호출하지 않습니다.");
  }
  
  console.log("공정 수정 완료");
  console.log("=== 최종 변경사항 체크 ===");
  console.log("hasAnyChanges:", hasAnyChanges);
  console.log("symbolId:", symbolId);
  console.log("originalSymbolId:", originalSymbolId);
  console.log("계산식 변경사항:", processStore.formulaList.length, "vs", processStore.initialFormulaList.length);
  
  // 변경사항 존재 여부에 따른 메시지
  if (!hasAnyChanges) {
    console.log("변경사항이 없어 저장을 건너뜁니다.");
    alert("ℹ️ 변경사항이 없습니다.\n\n현재 공정 정보와 동일하여 저장할 내용이 없습니다.");
    return; // 변경사항이 없으면 함수 종료
  }
  
  // 공정 수정 완료 메시지
  alert("✅ 공정이 성공적으로 수정되었습니다.");
  
        // 변경사항이 있는 경우에만 목록 새로고침
  if (hasAnyChanges) {
    console.log("목록 새로고침 시작");
    try {
      await processStore.searchProcesses();
      console.log("목록 새로고침 완료");
    } catch (searchError: any) {
      console.error("목록 새로고침 실패:", searchError);
      
      // 인증 오류인지 확인
      if (searchError?.status === 401 || searchError?.status === 400) {
        const errorMessage = searchError?.message || searchError?.response?.detail || "인증이 만료되었습니다.";
        if (errorMessage.includes("인증") || errorMessage.includes("만료")) {
          alert("⚠️ 인증이 만료되었습니다.\n\n다시 로그인해주세요.");
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
          return;
        }
      }
      
      console.warn("목록 새로고침 실패했지만 공정 수정은 완료되었습니다.");
    }
  } else {
    console.log("변경사항이 없어 목록 새로고침을 건너뜁니다.");
  }
  
  // 부모 컴포넌트에 성공 이벤트 전달 (필요시)
  // emit('update-success');
  
} catch (error: any) {
  console.error("공정 수정 실패:", error);
  const errorMessage = error?.message || "공정 수정 중 오류가 발생했습니다.";
  alert(`공정 수정 실패: ${errorMessage}`);
}
};



// 컴포넌트 외부에서 사용할 수 있는 메서드들
defineExpose({ t, handleUpdate });

const tabs = ref([
  "계산식 관리",
  "컴포넌트",
  "수리계통도",
  "PFD",
]);
const activeTab = ref(0);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const tabsContainer = ref<HTMLElement | null>(null);

const onTabClick = (index: number) => {
  activeTab.value = index;
};

// 파일 선택 핸들러
const handleFileChange = async (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    // processSymbol인 경우 SVG 파일인지 확인
    if (key === 'processSymbol') {
      if (!file.name.toLowerCase().endsWith('.svg')) {
        alert('SVG 파일만 선택할 수 있습니다. 다시 선택해주세요.');
        // 파일 선택 초기화
        target.value = '';
        return;
      }
    }
    
    processStore.setSelectedFile(key, file);
    
    // processSymbol인 경우 파일 선택 완료 처리
    if (key === 'processSymbol') {
      console.log('공정심볼 파일 선택됨:', file.name);
      
      // 원본 정보가 아직 저장되지 않은 경우에만 저장 (화면 로드 시 한 번만)
      if (!processStore.processDetail.originalProcessSymbol) {
        const currentSymbol = processStore.processDetail.processSymbol;
        const currentSymbolId = processStore.processDetail.symbolId;
        
        processStore.setProcessDetail({
          originalProcessSymbol: currentSymbol,
          originalSymbolId: currentSymbolId
        });
        
        console.log('공정심볼 원본 정보 저장:', {
          originalProcessSymbol: currentSymbol,
          originalSymbolId: currentSymbolId
        });
      }
      
      // processStore에는 파일명만 표시 (사용자에게는 파일명만 보여줌)
      processStore.setProcessDetail({ processSymbol: file.name });
      
      console.log('공정심볼 파일 선택 완료:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: new Date(file.lastModified).toLocaleString(),
        originalProcessSymbol: processStore.processDetail.originalProcessSymbol,
        originalSymbolId: processStore.processDetail.originalSymbolId,
        isSameFile: file.name === processStore.processDetail.originalProcessSymbol
      });
      
      // 파일이 제대로 저장되었는지 확인
      console.log('processStore.selectedFiles 확인:', processStore.selectedFiles);
      console.log('processStore.selectedFiles[processSymbol] 확인:', processStore.selectedFiles['processSymbol']);
    }
  }
};

// 여러 파일 선택 시 파일명 텍스트 생성
const getSelectedFilesText = (key: string) => {
  if (key === "pidFiles" && selectedPidFiles.value.length > 0) {
    return selectedPidFiles.value.length === 1
      ? selectedPidFiles.value[0].name
      : t("common.filesSelected", { count: selectedPidFiles.value.length });
  }
  if (key === "pfdFiles" && selectedPfdFiles.value.length > 0) {
    return selectedPfdFiles.value.length === 1
      ? selectedPfdFiles.value[0].name
      : t("common.filesSelected", { count: selectedPfdFiles.value.length });
  }
  if (key === "formulaFiles" && processStore.selectedFormulaFiles.length > 0) {
    return processStore.selectedFormulaFiles.length === 1
      ? processStore.selectedFormulaFiles[0].name
      : t("common.filesSelected", { count: processStore.selectedFormulaFiles.length });
  }
  if (key === "hydraulicFiles" && selectedHydraulicFiles.value.length > 0) {
    return selectedHydraulicFiles.value.length === 1
      ? selectedHydraulicFiles.value[0].name
      : t("common.filesSelected", { count: selectedHydraulicFiles.value.length });
  }
  if (key === "electricFiles" && selectedElectricFiles.value.length > 0) {
    return selectedElectricFiles.value.length === 1
      ? selectedElectricFiles.value[0].name
      : t("common.filesSelected", {
          count: selectedElectricFiles.value.length,
        });
  }
  if (key === "mccFiles" && selectedMccFiles.value.length > 0) {
    return selectedMccFiles.value.length === 1
      ? selectedMccFiles.value[0].name
      : t("common.filesSelected", { count: selectedMccFiles.value.length });
  }
  return processStore.selectedFiles[key]?.name || "";
};

const updateScrollButtons = () => {
  if (!tabsContainer.value) return;
  const { scrollLeft, clientWidth, scrollWidth } = tabsContainer.value;
  canScrollLeft.value = scrollLeft > 0;
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth;
};

const scrollTabs = (direction: number) => {
  if (!tabsContainer.value) return;
  const { scrollLeft, clientWidth } = tabsContainer.value;
  const newScrollLeft = scrollLeft + direction * clientWidth;
  tabsContainer.value.scrollTo({ left: newScrollLeft, behavior: "smooth" });
};

// 데이터 로드 함수 (임시 데이터 할당)
const loadData = () => {
      processStore.setPidList([
      {
        id: "1",
        pfdFileName: "PFD_001",
        pidFileDwg: "PID_001.dwg",
        mappingExcel: "PID_001.xlsx",
        infoOverview: "펌프 2대, 밸브 5개",
        svgPreview: "PID_001.svg",
      },
      {
        id: "2",
        pfdFileName: "PFD_002",
        pidFileDwg: "PID_002.dwg",
        mappingExcel: "PID_002.xlsx",
        infoOverview: "탱크 1개, 파이프 3개",
        svgPreview: "PID_002.svg",
      },
    ]);
  processStore.setDesignList([
    {
      id: "1",
      columnNm: "",
      influent: "324",
      effluent: "245",
      sludge: "",
      unit: "mg/L",
      remark: "Remark A",
    },
    {
      id: "2",
      columnNm: "",
      influent: "645",
      effluent: "134",
      sludge: "",
      unit: "mg/L",
      remark: "Remark B",
    },
  ]);
  processStore.setDesignCriteriaList([
    {
      id: "1",
      columnNm: "",
      value: "10",
      min: "5",
      max: "15",
      unit: "hr",
      remark: "기본",
    },
    {
      id: "2",
      columnNm: "",
      value: "20",
      min: "10",
      max: "30",
      unit: "℃",
      remark: "고온",
    },
  ]);
  processStore.setDesignParameterList([
            { id: "1", columnNm: "param1", view: "view1" },
        { id: "2", columnNm: "param2", view: "view2" },
  ]);
  processStore.setDesignEfficiencyList([
    {
      id: "1",
      columnNm: "",
      value: "30",
      min: "20",
      max: "40",
      unit: "%",
      remark: "",
    },
    {
      id: "2",
      columnNm: "",
      value: "50",
      min: "45",
      max: "55",
      unit: "%",
      remark: "",
    },
  ]);
  // calculationList는 formulaColumns로 대체되어 사용하지 않음
  // calculationList.value = [
  //   {
  //     id: "1",
  //     no: "1",
  //     formulaVersion: "v1.0",
  //     appliedVersion: "v1.1",
  //     remark: "초기",
  //   },
  //   {
  //     id: "2",
  //     no: "2",
  //     formulaVersion: "v2.0",
  //     appliedVersion: "v2.1",
  //     remark: "업데이트",
  //   },
  // ];
      processStore.setPfdList([
      {
        id: "1",
        fileName: "PFD_001.dwg",
        registrationDate: "2024-01-15",
        info: "중력식 농축설비 PFD",
        mappingPidList: "보기",
        remarks: "초기 설계",
      },
      {
        id: "2",
        fileName: "PFD_002.dwg",
        registrationDate: "2024-01-20",
        info: "기계식 농축설비 PFD",
        mappingPidList: "보기",
        remarks: "수정 설계",
      },
      {
        id: "3",
        fileName: "PFD_003.dwg",
        registrationDate: "2024-01-25",
        info: "SBR 반응조 PFD",
        mappingPidList: "보기",
        remarks: "신규 설계",
      },
    ]);
      processStore.setFormulaList([]);
      processStore.setInitialFormulaList([]);
      processStore.setHydraulicList([]);
      processStore.setStructList([
      { 
        id: "1", 
        type: "공용구조물", 
        components: "구조물", 
        equipmentType: "서스 원형", 
        item: "SBR 반응조 구조물" 
      },
      { 
        id: "2", 
        type: "공용구조물", 
        components: "구조물", 
        equipmentType: "서스 사각", 
        item: "" 
      },
      { 
        id: "3", 
        type: "공용구조물", 
        components: "구조물", 
        equipmentType: "콘크리트 사각", 
        item: "" 
      },
      { 
        id: "4", 
        type: "공용기계", 
        components: "송풍기", 
        equipmentType: "터보블로워(VVWF)", 
        item: "반응조 송풍기" 
      }
    ]);
   // mccList는 현재 사용하지 않음
   // mccList.value = [
   //   {
   //     id: "1",
   //     dwg: "mcc1.dwg",
   //     excel: "mcc1.xlsx",
   //     info: "Mcc 정보 1",
   //     view: "mcc1.svg",
   //   },
   //   {
   //     id: "2",
   //     dwg: "mcc2.dwg",
   //     excel: "mcc2.xlsx",
   //     info: "Mcc 정보 2",
   //     view: "mcc2.svg",
   //   },
   // ];
   // electricList는 현재 사용하지 않음
   // electricList.value = [
   //   {
   //     id: "1",
   //     dwg: "elec1.dwg",
   //     excel: "elec1.xlsx",
   //     info: "전도개요1",
   //     view: "elec1.svg",
   //   },
   //   {
   //     id: "2",
   //     dwg: "elec2.dwg",
   //     excel: "elec2.xlsx",
   //     info: "전도개요2",
   //     view: "elec2.svg",
   //   },
   // ];
};

onMounted(async () => {
  try {
    console.log("=== ProcessDetail.vue onMounted 시작 ===");

    // 기본 데이터 로드
    loadData();
    console.log("기본 데이터 로드 완료");



    // props에서 processId를 우선 사용하고, 없으면 라우터 매개변수 사용
    const processId = props.processId || (route.params.id as string);

    console.log("=== ProcessDetail.vue processId 확인 ===");
    console.log("props.processId:", props.processId);
    console.log("props.processId 타입:", typeof props.processId);
    console.log("route.params.id:", route.params.id);
    console.log("route.params.id 타입:", typeof route.params.id);
    console.log("사용할 processId:", processId);
    console.log("사용할 processId 타입:", typeof processId);

    if (!processId || processId === "undefined" || processId === "null") {
      console.log("processId가 없거나 유효하지 않아서 초기화를 건너뜁니다.");
      return;
    }

    // processId가 문자열이 아닌 경우 문자열로 변환
    const validProcessId = String(processId).trim();
    
    if (!validProcessId) {
      console.log("processId가 빈 문자열이어서 초기화를 건너뜁니다.");
      return;
    }

    console.log("유효한 processId:", validProcessId);

    // 0. 계산식 검색 API 호출하여 그리드 데이터 초기화
    console.log("계산식 검색 API 호출 시작");
    console.log("searchFormulaAPI 함수 타입:", typeof searchFormulaAPI);
    console.log("searchFormulaAPI 함수:", searchFormulaAPI);
    
    try {
      console.log("searchFormulaAPI 함수 호출 전");
      const formulaResult = await searchFormulaAPI();
      console.log("searchFormulaAPI 함수 호출 후, 결과:", formulaResult);
      
      // API 응답 구조에 따라 데이터 추출
      let formulasData: any[] = [];
      
      if (formulaResult && formulaResult.success) {
        // 성공 응답인 경우
        if ('data' in formulaResult && formulaResult.data && 'formulas' in formulaResult.data && Array.isArray(formulaResult.data.formulas)) {
          // 새로운 API 응답 구조: { success: true, data: { formulas: [...] } }
          formulasData = formulaResult.data.formulas;
          console.log("새로운 API 응답 구조에서 formulas 데이터 추출:", formulasData);
        } else if ('response' in formulaResult && formulaResult.response && Array.isArray(formulaResult.response)) {
          // 기존 API 응답 구조: { success: true, response: [...] }
          formulasData = formulaResult.response;
          console.log("기존 API 응답 구조에서 response 데이터 추출:", formulasData);
        } else if (Array.isArray(formulaResult)) {
          // 배열 형태 응답: [...]
          formulasData = formulaResult;
          console.log("배열 형태 응답에서 데이터 추출:", formulasData);
        }
      }
      
      if (formulasData.length > 0) {
        console.log("API 응답 데이터가 있습니다. 그리드 변환 시작");
        console.log("추출된 formulas 데이터:", formulasData);
        
        processStore.setFormulaList(formulasData.map((item: any, index: number) => ({
          formula_id: item.formula_id || item.id || (index + 1).toString(), // formula_id 컬럼에 실제 formula_id 값 설정
          id: item.id || (index + 1).toString(),
          no: (index + 1).toString(),
          registeredFormula: item.formula_name || '',
          formula_code: item.formula_code || '',
          registrationDate: formatDate(item.created_at) || new Date().toISOString().split('T')[0], // created_at이 없으면 현재 날짜 사용
          infoOverview: item.formula_scope || '',
          remarks: item.output_type || '',
        })));
        
        // 초기값을 별도로 저장 (깊은 복사)
        const currentFormulaList = processStore.formulaList;
        const initialData = JSON.parse(JSON.stringify(currentFormulaList));
        
        // formula_id 중복 검사 및 정리
        const formulaIds = initialData.map(item => item.formula_id).filter(Boolean);
        const duplicateIds = formulaIds.filter((id, index) => formulaIds.indexOf(id) !== index);
        
        if (duplicateIds.length > 0) {
          console.warn("⚠️ API 응답에 중복된 formula_id 발견:", duplicateIds);
          // 중복 제거 (첫 번째 항목만 유지)
          const uniqueData = initialData.filter((item, index, arr) => {
            if (!item.formula_id) return true;
            const firstIndex = arr.findIndex(x => x.formula_id === item.formula_id);
            return index === firstIndex;
          });
          processStore.setInitialFormulaList(uniqueData);
          console.log("중복 제거된 초기값:", uniqueData);
        } else {
          processStore.setInitialFormulaList(initialData);
        }
        
        console.log("계산식 그리드 데이터 초기화 완료:", processStore.formulaList);
        console.log("초기값 저장 완료:", processStore.initialFormulaList);
        console.log("초기값 항목 수:", processStore.initialFormulaList.length);
      } else if (formulaResult && !formulaResult.success && 'status' in formulaResult && formulaResult.status === 401) {
        console.warn("⚠️ 인증이 필요합니다. 계산식 데이터를 로드할 수 없습니다.");
        console.log("인증 오류 응답:", formulaResult);
        console.log("인증 오류 메시지:", formulaResult.message);
        
        processStore.setFormulaList([]);
        processStore.setInitialFormulaList([]);
        
        // 사용자에게 인증 필요 알림
        console.warn("⚠️ 세션이 만료되었습니다. 다시 로그인해주세요.");
        
        // 인증 오류 시 사용자에게 명확한 안내 (선택사항)
        // alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        
        // 인증 오류가 발생했지만 화면은 정상적으로 로드되도록 계속 진행
        console.log("인증 오류가 발생했지만 화면 초기화를 계속 진행합니다.");
      } else {
        console.log("API 응답 데이터가 없거나 빈 배열입니다. 빈 배열로 초기화");
        console.log("formulaResult:", formulaResult);
        processStore.setFormulaList([]);
        processStore.setInitialFormulaList([]); // 초기값도 빈 배열로 설정
      }
    } catch (error) {
      console.error("계산식 검색 API 호출 중 예외 발생:", error);
      console.error("에러 상세:", error);
      processStore.setFormulaList([]);
    }
    console.log("계산식 검색 API 호출 완료");

    // 1. 공정구분 코드 리스트 로드
    try {
      await processStore.loadProcessTypeCodes();
      console.log("1. searchProcessTypeOptions 리스트 로드 완료");
    } catch (error) {
      console.error("공정구분 코드 로드 실패:", error);
    }

    // 2. 화면 로드 시 handleSearch 함수 수행하여 입력 필드 값들 초기화
    try {
      const processData = await processStore.searchProcessById(validProcessId);
      console.log("2. handleSearch 완료");
      console.log("검색된 공정 데이터:", processData);
      
      // 2-1. 공정구분(processType) 초기값 설정
      if (processStore.globalProcessData.level2_code_key) {
        processStore.setProcessDetail({
          processType: processStore.globalProcessData.level2_code_key,
        });
        console.log(
          "2-1. processType 초기값 설정:",
          processStore.globalProcessData.level2_code_key
        );
      }
      
      // 2-2. processDetail의 다른 필드들도 명시적으로 설정
      if (processData) {
        processStore.setProcessDetail({
          process_id: processData.process_id || validProcessId,
          processType: processData.level2_code_key || null,
          subCategory: processData.level3_code_key || null,
          processName: processData.process_code || null,
          description: processData.process_description || "",
          processSymbol: processData.symbol_uri || "",
          originalProcessSymbol: processData.symbol_uri || "",  // 원본 공정심볼 파일명 저장
          originalSymbolId: processData.symbol_id || null,    // 원본 심볼 ID 저장
        });
        console.log("2-2. processDetail 모든 필드 설정 완료:", processStore.processDetail);
      }
    } catch (error) {
      console.error("handleSearch 실패:", error);
    }

    // 3. 중분류 코드 리스트 로드 (공정구분이 설정된 경우에만)
    if (processStore.globalProcessData.level2_code_key) {
      try {
        await processStore.loadSubCategoryCodes(
          processStore.globalProcessData.level2_code_key
        );
        console.log("3. searchSubCategoryOptions 리스트 로드 완료");
      } catch (error) {
        console.error("중분류 코드 로드 실패:", error);
      }
    }

    // 4. 중분류 입력 필드 초기값 설정
    if (processStore.globalProcessData.level3_code_key) {
      try {
        // 해당 옵션이 실제로 존재하는지 확인
        const subCategoryExists = processStore.searchSubCategoryOptions.some(
          (option) =>
            option.value === processStore.globalProcessData.level3_code_key
        );
        if (subCategoryExists) {
          processStore.setProcessDetail({
            subCategory: processStore.globalProcessData.level3_code_key,
          });
          console.log(
            "4. searchSubCategoryInput 초기값 설정:",
            processStore.globalProcessData.level3_code_key
          );
        } else {
          console.log(
            "4. searchSubCategoryInput 초기값 설정 실패: 해당 옵션이 존재하지 않음:",
            processStore.globalProcessData.level3_code_key
          );
          console.log(
            "현재 searchSubCategoryOptions:",
            processStore.searchSubCategoryOptions
          );
        }
      } catch (error) {
        console.error("중분류 입력 필드 초기값 설정 실패:", error);
      }
    }

    // 5. 공정명 코드 리스트 로드 (중분류가 설정된 경우에만)
    if (processStore.globalProcessData.level3_code_key) {
      try {
        await processStore.loadProcessNameCodes(
          processStore.globalProcessData.level3_code_key
        );
        console.log("5. searchProcessNameOptions 리스트 로드 완료");
      } catch (error) {
        console.error("공정명 코드 로드 실패:", error);
      }
    }

    // 6. 공정명 입력 필드 초기값 설정
    if (processStore.globalProcessData.process_code) {
      try {
        // 해당 옵션이 실제로 존재하는지 확인
        const processNameExists = processStore.searchProcessNameOptions.some(
          (option) =>
            option.value === processStore.globalProcessData.process_code
        );
        if (processNameExists) {
          processStore.setProcessDetail({
            processName: processStore.globalProcessData.process_code,
          });
          console.log(
            "6. searchProcessNameInput 초기값 설정:",
            processStore.globalProcessData.process_code
          );
        } else {
          console.log(
            "6. searchProcessNameInput 초기값 설정 실패: 해당 옵션이 존재하지 않음:",
            processStore.globalProcessData.process_code
          );
          console.log(
            "현재 searchProcessNameOptions:",
            processStore.searchProcessNameOptions
          );
        }
      } catch (error) {
        console.error("공정명 입력 필드 초기값 설정 실패:", error);
      }
    }

    console.log("=== ProcessDetail.vue 초기화 완료 ===");
  } catch (error) {
    console.error("ProcessDetail.vue 초기화 중 오류 발생:", error);
  } finally {
    // 스크롤 버튼 상태 업데이트
    nextTick(() => {
      try {
        updateScrollButtons();
      } catch (error) {
        console.error("스크롤 버튼 상태 업데이트 실패:", error);
      }
    });
  }
});

// PFD pagination state - processStore 사용
const currentPagePfd = ref(1);
const totalPagesPfd = computed(
  () => Math.ceil(processStore.pfdList.length / processStore.pageSize) || 1
);
const pagedPfdList = computed(() =>
  processStore.pfdList.slice(
    (currentPagePfd.value - 1) * processStore.pageSize,
    currentPagePfd.value * processStore.pageSize
  )
);
const handlePageChangePfd = (page: number) => {
  currentPagePfd.value = page;
};

// Formula pagination state
const currentPageFormula = ref(1);
const totalPagesFormula = computed(
  () => Math.ceil(processStore.formulaList.length / processStore.pageSize) || 1
);
const pagedFormulaList = computed(() =>
  processStore.formulaList.slice(
    (currentPageFormula.value - 1) * processStore.pageSize,
    currentPageFormula.value * processStore.pageSize
  )
);
const handlePageChangeFormula = (page: number) => {
  currentPageFormula.value = page;
};

// Electric pagination state (현재 사용하지 않음)
// const currentPageElectric = ref(1);
// const totalPagesElectric = computed(
//   () => Math.ceil(electricList.value.length / pageSize.value) || 1
// );
// const pagedElectricList = computed(() =>
//   electricList.value.slice(
//     (currentPageElectric.value - 1) * pageSize.value,
//     currentPageElectric.value * pageSize.value
//   )
// );
// const handlePageChangeElectric = (page: number) => {
//   currentPageElectric.value = page;
// };

// Mcc pagination state
const currentPageMcc = ref(1);
// mccList는 현재 사용하지 않음
// const totalPagesMcc = computed(
//   () => Math.ceil(processStore.mccList.length / processStore.pageSize) || 1
// );
// const pagedMccList = computed(() =>
//   processStore.mccList.slice(
//     (currentPageMcc.value - 1) * processStore.pageSize,
//     currentPageMcc.value * processStore.pageSize
//   )
// );
const handlePageChangeMcc = (page: number) => {
  currentPageMcc.value = page;
};

// Hydraulic pagination state
const currentPageHydraulic = ref(1);
// hydraulicList는 현재 사용하지 않음
// const totalPagesHydraulic = computed(
//   () => Math.ceil(processStore.hydraulicList.length / processStore.pageSize) || 1
// );
// const pagedHydraulicList = computed(() =>
//   processStore.hydraulicList.slice(
//     (currentPageHydraulic.value - 1) * processStore.pageSize,
//     currentPageHydraulic.value * processStore.pageSize
//   )
// );
const handlePageChangeHydraulic = (page: number) => {
  currentPageHydraulic.value = page;
};

// Struct pagination state
const currentPageStruct = ref(1);
// structList는 현재 사용하지 않음
// const totalPagesStruct = computed(
//   () => Math.ceil(processStore.structList.length / processStore.pageSize) || 1
// );
// const pagedStructList = computed(() =>
//   processStore.structList.slice(
//     (currentPageStruct.value - 1) * processStore.pageSize,
//     currentPageStruct.value * processStore.pageSize
//   )
// );
const handlePageChangeStruct = (page: number) => {
  currentPageStruct.value = page;
};

// Modal state for P&ID file upload
const showPidModal = ref(false);
const selectedPidFiles = ref<File[]>([]);
const openPidModal = () => {
  showPidModal.value = true;
};
const closePidModal = () => {
  showPidModal.value = false;
  selectedPidFiles.value = [];
};
const handlePidFilesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  selectedPidFiles.value = files ? Array.from(files) : [];
  console.log("Selected P&ID files:", selectedPidFiles.value);
};
const uploadPidFiles = () => {
  // TODO: implement actual upload
  console.log("Upload executed:", selectedPidFiles.value);
  closePidModal();
};

// Modal state for PFD, Electric, and Mcc file upload
const showPfdModal = ref(false);
const selectedPfdFiles = ref<File[]>([]);
const openPfdModal = () => {
  showPfdModal.value = true;
};
const closePfdModal = () => {
  showPfdModal.value = false;
  selectedPfdFiles.value = [];
};
const handlePfdFilesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  selectedPfdFiles.value = files ? Array.from(files) : [];
  console.log("Selected PFD files:", selectedPidFiles.value);
};
const uploadPfdFiles = () => {
  console.log("PFD upload executed:", selectedPfdFiles.value);
  closePfdModal();
};

// Modal state for Formula file upload
const openFormulaModal = () => {
  processStore.setShowFormulaModal(true);
};
// 날짜 포맷팅 함수
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('날짜 포맷팅 오류:', error);
    return '';
  }
};

// 계산식 삭제 API 함수
const deleteFormulaAPI = async (formulaId: string) => {
  try {
    const response = await request(`/api/process/formula/delete/${formulaId}`, {}, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('계산식 삭제 API 호출 성공:', formulaId);
    return true;
  } catch (error) {
    console.error('계산식 삭제 API 호출 실패:', error);
    throw error;
  }
};

const closeFormulaModal = () => {
  processStore.setShowFormulaModal(false);
  processStore.setSelectedFormulaFiles([]);
};
const handleFormulaFilesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  processStore.setSelectedFormulaFiles(files ? Array.from(files) : []);
  console.log("Selected formula files:", processStore.selectedFormulaFiles);
};
const uploadFormulaFiles = async () => {
  console.log("Formula upload executed:", processStore.selectedFormulaFiles);
  
  // 선택된 파일들을 formulaList에 추가
  if (processStore.selectedFormulaFiles.length > 0) {
    try {
      // 각 파일을 순차적으로 처리
      for (let index = 0; index < processStore.selectedFormulaFiles.length; index++) {
        const file = processStore.selectedFormulaFiles[index];
        
        // 파일 내용 읽기
        const fileContent = await readFileContent(file);
        
        // .py 확장자를 제외한 파일명 추출
        const fileNameWithoutExt = file.name.replace(/\.py$/i, '');
        
        // 새로운 계산식 항목 생성
        const newFormula = {
          formula_id: Date.now().toString() + index, // formula_id 컬럼에 고유 ID 설정
          id: Date.now().toString() + index, // 고유 ID 생성
          no: (processStore.formulaList.length + index + 1).toString(),
          registeredFormula: fileNameWithoutExt,
          formula_code: fileContent, // 파일 내용을 formula_code에 저장
          registrationDate: new Date().toISOString().split('T')[0], // 현재 날짜
          infoOverview: "",
          remarks: "",
        };
        
        console.log(`새로운 계산식 항목 생성:`, newFormula);
        console.log(`formula_code 길이:`, fileContent.length);
        console.log(`formula_code 내용 일부:`, fileContent.substring(0, 100));
        
        processStore.formulaList.push(newFormula);
      }
      
      console.log("계산식 파일 업로드 완료:", processStore.formulaList);
    } catch (error) {
      console.error("파일 읽기 중 오류 발생:", error);
      alert("파일 내용을 읽는 중 오류가 발생했습니다.");
    }
  }
  
  closeFormulaModal();
};

// 파일 내용을 읽는 함수
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        resolve(content);
      } catch (error) {
        reject(new Error("파일 내용을 읽을 수 없습니다."));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("파일 읽기 중 오류가 발생했습니다."));
    };
    
    // 텍스트 파일로 읽기
    reader.readAsText(file, 'UTF-8');
  });
};

const showElectricModal = ref(false);
const selectedElectricFiles = ref<File[]>([]);
const openElectricModal = () => {
  showElectricModal.value = true;
};
const closeElectricModal = () => {
  showElectricModal.value = false;
  selectedElectricFiles.value = [];
};
const handleElectricFilesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  selectedElectricFiles.value = files ? Array.from(files) : [];
  console.log("Selected electric drawing files:", selectedElectricFiles.value);
};
const uploadElectricFiles = () => {
  console.log("Electric drawing upload executed:", selectedElectricFiles.value);
  closeElectricModal();
};

const showMccModal = ref(false);
const selectedMccFiles = ref<File[]>([]);
const openMccModal = () => {
  showMccModal.value = true;
};
const closeMccModal = () => {
  showMccModal.value = false;
  selectedMccFiles.value = [];
};
const handleMccFilesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  selectedMccFiles.value = files ? Array.from(files) : [];
  console.log("Selected MCC diagram files:", selectedMccFiles.value);
};
const uploadMccFiles = () => {
  console.log("MCC upload executed:", selectedMccFiles.value);
  closeMccModal();
};

// Modal state for P&ID list popup


// Modal state for Hydraulic diagram file upload
const showHydraulicModal = ref(false);
const selectedHydraulicFiles = ref<File[]>([]);
const openHydraulicModal = () => {
  showHydraulicModal.value = true;
};
const closeHydraulicModal = () => {
  showHydraulicModal.value = false;
  selectedHydraulicFiles.value = [];
};
const handleHydraulicFilesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    const fileArray = Array.from(files);
    
    // dwg 파일만 필터링
    const dwgFiles = fileArray.filter(file => 
      file.name.toLowerCase().endsWith('.dwg')
    );
    
    // dwg가 아닌 파일이 선택된 경우 경고
    if (dwgFiles.length !== fileArray.length) {
      const nonDwgFiles = fileArray.filter(file => 
        !file.name.toLowerCase().endsWith('.dwg')
      );
      alert(`DWG 파일만 선택 가능합니다.\n\n선택된 파일 중 DWG가 아닌 파일:\n${nonDwgFiles.map(f => f.name).join('\n')}`);
    }
    
    selectedHydraulicFiles.value = dwgFiles;
    console.log("Selected Hydraulic diagram files (DWG only):", selectedHydraulicFiles.value);
  } else {
    selectedHydraulicFiles.value = [];
  }
};
const uploadHydraulicFiles = () => {
  console.log("Hydraulic diagram upload executed:", selectedHydraulicFiles.value);
  
  if (selectedHydraulicFiles.value.length === 0) {
    alert("업로드할 파일을 선택해주세요.");
    return;
  }
  
  // 선택된 파일들을 hydraulicList에 추가
  const newHydraulicItems = selectedHydraulicFiles.value.map((file, index) => {
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    return {
      id: `hydraulic_${Date.now()}_${index}`, // 고유 ID 생성
      dwg: file.name, // 파일명
      registrationDate: currentDate, // 현재 날짜
      info: `수리계통도 파일: ${file.name}`, // 파일 정보
      view: "미리보기", // SVG 미리보기 (현재는 텍스트로 표시)
      _file: file // hidden 속성으로 MultipartFile 정보 저장
    };
  });
  
  // 기존 리스트에 새 항목들 추가
  const currentList = [...processStore.hydraulicList];
  const updatedList = [...currentList, ...newHydraulicItems];
  processStore.setHydraulicList(updatedList);
  
  console.log("수리계통도 파일 업로드 완료:", newHydraulicItems);
  console.log("전체 수리계통도 리스트:", updatedList);
  
  // 저장된 File 객체 정보 확인
  newHydraulicItems.forEach((item, index) => {
    if (item._file) {
      console.log(`항목 ${index + 1}의 File 객체 정보:`, {
        name: item._file.name,
        size: item._file.size,
        type: item._file.type,
        lastModified: new Date(item._file.lastModified).toLocaleString()
      });
    }
  });
  
  closeHydraulicModal();
};

// 저장된 File 객체를 사용하여 실제 서버 업로드하는 예시 함수
const uploadHydraulicToServer = async (itemId: string) => {
  const item = processStore.hydraulicList.find(h => h.id === itemId);
  if (!item || !item._file) {
    console.error("File 객체를 찾을 수 없습니다:", itemId);
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('file', item._file);
    formData.append('fileName', item.dwg);
    formData.append('registrationDate', item.registrationDate);
    formData.append('info', item.info);
    
    console.log("서버 업로드 준비 완료:", {
      fileName: item.dwg,
      fileSize: item._file.size,
      fileType: item._file.type
    });
    
    // 실제 서버 업로드 로직은 여기에 구현
    // const response = await fetch('/api/hydraulic/upload', {
    //   method: 'POST',
    //   body: formData
    // });
    
  } catch (error) {
    console.error("서버 업로드 실패:", error);
  }
};

// 삭제 핸들러 함수들
const handlePidDelete = () => {
  if (processStore.selectedPidItems.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: processStore.selectedPidItems.length,
      })
    )
  ) {
    // 선택된 항목들을 pidList에서 제거
    const selectedIds = processStore.selectedPidItems.map((item) => item.pidFileDwg);
    const updatedPidList = processStore.pidList.filter(
      (item) => !selectedIds.includes(item.pidFileDwg)
    );
    processStore.setPidList(updatedPidList);
    processStore.setSelectedPidItems([]);
    alert(t("messages.success.pidItemDeleted"));
  }
};

const handlePfdDelete = () => {
  if (processStore.selectedPfdItems.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: processStore.selectedPfdItems.length,
      })
    )
  ) {
    // 선택된 항목들을 pfdList에서 제거
    const selectedIds = processStore.selectedPfdItems.map((item) => item.fileName);
    const updatedPfdList = processStore.pfdList.filter(
      (item) => !selectedIds.includes(item.fileName)
    );
    processStore.setPfdList(updatedPfdList);
    processStore.setSelectedPfdItems([]);
    alert(t("messages.success.pfdItemDeleted"));
  }
};

// 계산식 관리 탭 삭제 함수
const handleFormulaDelete = () => {
  if (processStore.selectedFormulaItems.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  // 선택된 항목들의 formula_id 속성을 alert로 출력
  processStore.selectedFormulaItems.forEach((item, index) => {
    const formulaId = item.formula_id || 'formula_id 속성이 없습니다';
    //alert(`선택된 행 ${index + 1}: formula_id = ${formulaId}`);
  });

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: processStore.selectedFormulaItems.length,
      })
    )
  ) {
    // 선택된 항목들을 formulaList에서 제거
    const selectedIds = processStore.selectedFormulaItems.map((item) => item.no);
    const updatedFormulaList = processStore.formulaList.filter(
      (item) => !selectedIds.includes(item.no)
    );
    processStore.setFormulaList(updatedFormulaList);
    processStore.setSelectedFormulaItems([]);
    alert(t("messages.success.formulaItemDeleted"));
  }
};

const handleHydraulicDelete = () => {
  if (processStore.selectedHydraulicItems.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: processStore.selectedHydraulicItems.length,
      })
    )
  ) {
    // 선택된 항목들을 hydraulicList에서 제거
    const selectedIds = processStore.selectedHydraulicItems.map((item) => item.dwg);
    const updatedHydraulicList = processStore.hydraulicList.filter(
      (item) => !selectedIds.includes(item.dwg)
    );
    processStore.setHydraulicList(updatedHydraulicList);
    processStore.setSelectedHydraulicItems([]);
    alert(t("messages.success.hydraulicDiagramItemDeleted"));
  }
};

// 컴포넌트 외부에서 사용할 수 있는 메서드들
</script>

<style scoped lang="scss">
@use "sass:color";

.public-management-layout {
  height: 100%;
  padding: $spacing-lg;
}

// action-bar 스타일
.action-bar {
  margin-bottom: 1rem;

  .btns {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.5rem;
    width: 100%;

    .btn-edit {
      margin-left: auto;
    }
  }
}

// 탭과 버튼이 동일선상에 배치되는 스타일
.tab-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;



  .swiper-bar {
    flex: 1;
  }

  .tab-buttons {
    display: flex;
    align-items: center;

    .btns {
      display: flex;
      gap: 0.5rem;
    }
  }
}

// 기존 탭 스타일
.tabs-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .tabs {
    display: flex;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    .tab {
      padding: 0.75rem 1.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;

      &:hover {
        background-color: rgba($primary-color, 0.05);
      }

      &.active {
        border-bottom-color: $primary-color;
        color: $primary-color;
        font-weight: 600;
      }
    }
  }

  .btn-scroll {
    padding: 0.5rem;
    border: 1px solid $border-color;
    background: white;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background-color: $background-light;
    }
  }
}

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
}
.modal-window {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  width: 400px;
}
.modal-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}

// 버튼 스타일
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &.btn-primary {
    background-color: $primary-color;
    color: white;

    &:hover:not(:disabled) {
      background-color: #0056b3; // Darken primary color for hover
    }

    &:disabled {
      background-color: $text-light;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &.btn-delete {
    background-color: #dc3545;
    color: white;

    &:hover:not(:disabled) {
      background-color: color.scale(#dc3545, $lightness: -10%);
    }

    &:disabled {
      background-color: $text-light;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}

.file-upload-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
  flex-wrap: nowrap;
  overflow: hidden;
}

.file-name-input {
  flex: 1 1 0%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

 .file-select-btn {
   white-space: nowrap;
 }

 .pid-section {
   margin-top: 1rem;
   
   h4 {
     margin-bottom: 1rem;
     color: #333;
     font-size: 1.1rem;
     font-weight: 600;
   }
 }

 .tab-content .content {
   // 팝업 사이즈에 맞게 유연하게 조정
   max-height: calc(100vh - 150px); // 상단 여백 줄임
   min-height: 500px; // 최소 높이 증가
   overflow-y: auto; // 필요시에만 스크롤바 표시
   
   // 스크롤바 스타일링
   &::-webkit-scrollbar {
     width: 8px;
   }
   
   &::-webkit-scrollbar-track {
     background: #f1f1f1;
     border-radius: 4px;
   }
   
   &::-webkit-scrollbar-thumb {
     background: #c1c1c1;
     border-radius: 4px;
     
     &:hover {
       background: #a8a8a8;
     }
   }
   
   // Firefox 스크롤바 스타일링
   scrollbar-width: thin;
   scrollbar-color: #c1c1c1 #f1f1f1;
 }

 // PFD 탭 전용 스타일 (P&ID 섹션 포함)
 .tab-content .content:first-child {
   // 팝업 크기에 관계없이 항상 스크롤 가능하도록 설정
   position: relative;
   height: auto !important;
   max-height: none !important;
   overflow-y: auto !important;
   
   // 내부 요소들이 높이를 차지하도록 설정
   .pagination-container {
     margin-bottom: 1rem;
   }
   
   .pfd-section {
     margin-bottom: 1rem;
     
     .section-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: 1rem;
       
       h4 {
         margin: 0;
         font-size: 1.1rem;
         font-weight: 600;
         color: #333;
       }
     }
   }
   
   .pid-section {
     margin-bottom: 2rem;
     display: block !important;
     visibility: visible !important;
     height: auto !important;
     min-height: 200px !important;
     position: relative;
   }
   
   // 스크롤바가 제대로 작동하도록 내부 콘텐츠 높이 보장
   > * {
     min-height: fit-content;
   }
   
   // 스크롤바 스타일링
   &::-webkit-scrollbar {
     width: 8px;
   }
   
   &::-webkit-scrollbar-track {
     background: #f1f1f1;
     border-radius: 4px;
   }
   
   &::-webkit-scrollbar-thumb {
     background: #c1c1c1;
     border-radius: 4px;
     
     &:hover {
       background: #a8a8a8;
     }
   }
   
   // Firefox 스크롤바 스타일링
   scrollbar-width: thin;
   scrollbar-color: #c1c1c1 #f1f1f1;
 }

 // 팝업 환경에서 스크롤이 제대로 작동하도록 추가 설정
 .tab-content {
   position: relative;
   height: auto;
   overflow: visible;
 }

 .tab-content .content {
   position: relative;
   height: auto;
   overflow-y: auto;
 }

 // 팝업 크기 제한 해제를 위한 추가 설정
 .process-page {
   height: auto;
   overflow: visible;
   
   // 팝업 환경에서 스크롤바 설정
   &.popup-mode {
     height: auto;
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

 .action-bar {
   height: auto;
   overflow: visible;
 }

 .tab-action-bar {
   height: auto;
   overflow: visible;
 }

 // P&ID 섹션 스타일
 .pid-section {
   margin-top: 0.5rem;
   padding-top: 0.5rem;
   
   .section-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     margin-bottom: 0.5rem;
     
     h4 {
       margin: 0;
       font-size: 1.1rem;
       font-weight: 600;
       color: #333;
     }
     
     .section-actions {
       display: flex;
       gap: 0.5rem;
       
       .btn {
         padding: 0.5rem 1rem;
         border-radius: 0.25rem;
         font-size: 0.875rem;
         cursor: pointer;
         border: 1px solid transparent;
         
         &.btn-primary {
           background-color: #007bff;
           color: white;
           
           &:hover {
             background-color: #0056b3;
           }
         }
         
         &.btn-danger {
           background-color: #dc3545;
           color: white;
           
           &:disabled {
             background-color: #6c757d;
             cursor: not-allowed;
           }
           
           &:hover:not(:disabled) {
             background-color: #c82333;
           }
         }
       }
     }
   }
 }

 // "보기" 버튼 스타일
 .view-btn {
   background: none;
   border: none;
   color: #007bff;
   text-decoration: underline;
   cursor: pointer;
   padding: 0;
   font-size: inherit;
   
   &:hover {
     color: #0056b3;
     text-decoration: none;
   }
   
   &:focus {
     outline: none;
     text-decoration: none;
   }
 }

 // 모달 액션 바 스타일
 .modal-action-bar {
   display: flex;
   justify-content: flex-end;
   gap: 0.5rem;
   margin-bottom: 1rem;
   padding: 0.5rem 0;
   border-bottom: 1px solid #e0e0e0;
   
   .btn {
     padding: 0.5rem 1rem;
     border-radius: 0.25rem;
     font-size: 0.875rem;
     cursor: pointer;
     border: 1px solid transparent;
     
     &.btn-primary {
       background-color: #007bff;
       color: white;
       
       &:hover {
         background-color: #0056b3;
       }
     }
     
     &.btn-danger {
       background-color: #dc3545;
       color: white;
       
       &:disabled {
         background-color: #6c757d;
         cursor: not-allowed;
       }
       
       &:hover:not(:disabled) {
         background-color: #c82333;
       }
     }
   }
 }
</style>
