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
              :value="processStore.processDetail.processSymbol || ''"
              placeholder="파일 선택"
              readonly
            />
            <label class="file-select-btn">
              {{ t("common.selectFile") }}
              <input
                type="file"
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
           :disabled="selectedPfdItems.length === 0"
         >
           {{ t("common.delete") }}
         </button>
       </div>

                      

                 <!-- 계산식 관리 탭 버튼들 -->
         <div v-if="activeTab === 1" class="btns">
           <button class="btn btn-primary btn-add" @click="openFormulaModal">
             {{ t("common.add") }}
           </button>
           <button
             class="btn btn-primary btn-delete"
             @click="handleFormulaDelete"
             :disabled="selectedFormulaItems.length === 0"
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
             :disabled="selectedHydraulicItems.length === 0"
           >
             {{ t("common.delete") }}
           </button>
         </div>


    </div>
  </div>

     <div class="tab-content">
           <div v-if="activeTab === 0" class="content">
        <!-- PFD 탭 -->
        <div class="pfd-section">
          <div class="section-header">
            <h4>PFD 목록</h4>
          </div>
        </div>
        <DataTable
          :columns="pfdColumnsWithActions"
          :data="pfdList"
          :loading="loading"
          :selectable="true"
          :selectedItems="selectedPfdItems"
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
                :disabled="selectedPidItems.length === 0"
              >
                {{ t("common.delete") }}
              </button>
            </div>
          </div>
          
          <DataTable
            :columns="pidColumns"
            :data="pagedPidList"
            :loading="loading"
            :selectable="true"
            :selectedItems="selectedPidItems"
            @selection-change="handlePidSelectionChange"
            @sort-change="handleSortChange"
            @row-click="handleRowClick"
          />
        </div>
      </div>

     

                                <div v-if="activeTab === 1" class="content">
         <!-- 계산식 관리 탭 -->
        <DataTable
          :columns="formulaColumns"
          :data="pagedFormulaList"
          :loading="loading"
          :selectable="true"
          :selectedItems="selectedFormulaItems"
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
                    <div v-if="activeTab === 2" class="content">
         <!-- 수리계통도 탭 -->
        <DataTable
          :columns="hydraulicColumns"
          :data="pagedHydraulicList"
          :loading="loading"
          :selectable="true"
          :selectedItems="selectedHydraulicItems"
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
          <!-- 공용구조물 탭 -->
         <DataTable
           :columns="structColumns"
           :data="pagedStructList"
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
  <div v-if="showFormulaModal" class="modal-overlay">
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
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useI18n } from "vue-i18n";
import { useProcessStore } from "../../stores/processStore";

// Props 정의
interface Props {
  processId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  processId: undefined,
});

// Emits 정의
defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const route = useRoute();
const processStore = useProcessStore();

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
const pidList = ref<any[]>([]);

// P&ID 탭 페이징 상태
const currentPagePid = ref(1);
const pageSize = ref(10);
const totalPagesPid = computed(
  () => Math.ceil(pidList.value.length / pageSize.value) || 1
);
const pagedPidList = computed(() =>
  pidList.value.slice(
    (currentPagePid.value - 1) * pageSize.value,
    currentPagePid.value * pageSize.value
  )
);
// 페이지 변경 핸들러
const handlePageChangePid = (page: number) => {
  currentPagePid.value = page;
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
const designList = ref<any[]>([]);

const designCriteriaColumns: TableColumn[] = [
  { key: "columnNm", title: t("columns.processDetail.item") },
  { key: "value", title: t("columns.processDetail.value") },
  { key: "min", title: t("columns.processDetail.min") },
  { key: "max", title: t("columns.processDetail.max") },
  { key: "unit", title: t("columns.processDetail.unit") },
  { key: "remark", title: t("columns.processDetail.remark") },
];
const designCriteriaList = ref<any[]>([]);

const designParameterColumns: TableColumn[] = [
  { key: "columnNm", title: t("columns.processDetail.item") },
  { key: "view", title: t("columns.processDetail.view") },
];
const designParameterList = ref<any[]>([]);

// 5: 설계조건 효율 테이블용 컬럼/데이터
const designEfficiencyColumns: TableColumn[] = [
  { key: "columnNm", title: t("columns.processDetail.item") },
  { key: "value", title: t("columns.processDetail.value") },
  { key: "min", title: t("columns.processDetail.min") },
  { key: "max", title: t("columns.processDetail.max") },
  { key: "unit", title: t("columns.processDetail.unit") },
  { key: "remark", title: t("columns.processDetail.remark") },
];
const designEfficiencyList = ref<any[]>([]);

// 6: 계산식 관리 탭용 컬럼/데이터
const calculationColumns: TableColumn[] = [
  { key: "no", title: t("columns.processDetail.no") },
  { key: "formulaVersion", title: t("columns.processDetail.formulaVersion") },
  { key: "appliedVersion", title: t("columns.processDetail.appliedVersion") },
  { key: "remark", title: t("columns.processDetail.remarks") },
];
const calculationList = ref<any[]>([]);

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
const pfdList = ref<any[]>([]);
const selectedPfdItems = ref<any[]>([]);

const handlePfdSelectionChange = (items: any[]) => {
  selectedPfdItems.value = items;
  console.log("PFD selection changed:", items);
};

  // 계산식 관리 탭용 컬럼/데이터
  const formulaColumns: TableColumn[] = [
    { key: "formula_id", title: "formula_id", hidden: true }, // hidden 컬럼으로 formula_id 추가
    { key: "no", title: "순번", sortable: true },
    { key: "registeredFormula", title: "등록계산식", sortable: true },
    { key: "registrationDate", title: "등록일자", sortable: true },
    { key: "infoOverview", title: "정보개요", sortable: true },
    { key: "remarks", title: "비고", sortable: true },
  ];
const formulaList = ref<any[]>([]);
const selectedFormulaItems = ref<any[]>([]);
const initialFormulaList = ref<any[]>([]); // 초기값 저장용 변수 추가

const handleFormulaSelectionChange = (items: any[]) => {
  selectedFormulaItems.value = items;
  console.log("Formula selection changed:", items);
};

// 8: 전기도면 탭용 컬럼/데이터
const electricColumns: TableColumn[] = [
  { key: "dwg", title: t("columns.processDetail.dwgFile"), sortable: true },
  { key: "excel", title: t("columns.processDetail.excel"), sortable: true },
  {
    key: "info",
    title: t("columns.processDetail.infoOverview"),
    sortable: true,
  },
  { key: "view", title: t("columns.processDetail.svgPreview"), sortable: true },
];
const electricList = ref<any[]>([]);
// 전기도면 탭 선택 상태
const selectedElectricItems = ref<any[]>([]);
const handleElectricSelectionChange = (items: any[]) => {
  selectedElectricItems.value = items;
  console.log("Electric drawing selection changed:", items);
};

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
const structList = ref<any[]>([]);

// PID 탭 선택 상태
const selectedPidItems = ref<any[]>([]);
// PID 탭 선택 변경 핸들러
const handlePidSelectionChange = (items: any[]) => {
  selectedPidItems.value = items;
  console.log("PID selection changed:", items);
};

// 9: Mcc 구성도 탭용 컬럼/데이터
const mccColumns: TableColumn[] = [
  { key: "dwg", title: t("columns.processDetail.dwgFile"), sortable: true },
  { key: "excel", title: t("columns.processDetail.excel"), sortable: true },
  {
    key: "info",
    title: t("columns.processDetail.infoOverview"),
    sortable: true,
  },
  { key: "view", title: t("columns.processDetail.svgPreview"), sortable: true },
];
const mccList = ref<any[]>([]);
// Mcc 구성도 탭 선택 상태
const selectedMccItems = ref<any[]>([]);
const handleMccSelectionChange = (items: any[]) => {
  selectedMccItems.value = items;
  console.log("MCC diagram selection changed:", items);
};

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
const hydraulicList = ref<any[]>([]);
// 수리계통도 탭 선택 상태
const selectedHydraulicItems = ref<any[]>([]);
const handleHydraulicSelectionChange = (items: any[]) => {
  selectedHydraulicItems.value = items;
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
    
    const requestBody = {
      search_field: "equipment_type",
      search_value: "PUMP",
      order_by: "created_at"
    };
    
    console.log('요청 데이터:', requestBody);
    
    const response = await fetch('/api/process/formula/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      // 400, 404 등의 오류 시 상세 정보 로깅
      const errorText = await response.text();
      console.error('API 응답 오류 상세:', errorText);
      
      // 400 상태 코드이지만 실제로는 404 오류인 경우 처리
      if (response.status === 404 || (response.status === 400 && errorText.includes('Not Found'))) {
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
        console.log('API 요청 형식이 잘못되었습니다. 빈 데이터로 초기화합니다.');
        return { data: [] };
      }
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('계산식 검색 API 호출 성공:', result);
    return result;
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

// 계산식 API 호출 함수
const createFormulaAPI = async (processId: string, formulaName: string) => {
  try {
    const response = await fetch('/api/process/formula/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        process_id: processId,
        formula_name: formulaName,
      }),
    });

    if (!response.ok) {
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
    
    const processDetailData = {
      processType: processStore.processDetail.processType || "",
      processCode: processNameValue,      // value 값 사용 (내부 코드)
      processName: processNameLabel,      // label 값 사용 (표시명)
      subCategory: processStore.processDetail.subCategory || "",
      processSymbol: processStore.processDetail.processSymbol || "",
      description: processStore.processDetail.description || "",
    };
    
    console.log("=== processStore.processDetail에서 직접 가져온 데이터 ===");
    console.log("processDetailData:", processDetailData);
    
    await processStore.updateProcess(processId, processDetailData);
    
    // 계산식 관리 탭 그리드 데이터 비교하여 추가된 행 확인
    console.log("계산식 그리드 데이터 비교 시작");
    console.log("초기값:", initialFormulaList.value);
    console.log("현재값:", formulaList.value);
    
    // 삭제된 행 찾기 (초기값에는 있지만 현재값에는 없는 행)
    const deletedRows = initialFormulaList.value.filter(initialItem => 
      !formulaList.value.some(currentItem => currentItem.formula_id === initialItem.formula_id)
    );
    
    // 추가된 행 찾기 (현재값에는 있지만 초기값에는 없는 행)
    const addedRows = formulaList.value.filter(currentItem => 
      !initialFormulaList.value.some(initialItem => initialItem.formula_id === currentItem.formula_id)
    );
    
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
      } catch (deleteError) {
        console.error("삭제된 행 API 호출 실패:", deleteError);
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
        const formulaPromises = addedRows.map(formula => 
          createFormulaAPI(processId, formula.registeredFormula)
        );
        
        await Promise.all(formulaPromises);
        console.log("추가된 행에 대한 API 호출 완료");
      } catch (formulaError) {
        console.error("추가된 행 API 호출 실패:", formulaError);
        alert("공정은 수정되었으나 추가된 계산식 데이터 저장에 실패했습니다.");
      }
    } else {
      console.log("추가된 행이 없습니다. API 호출을 건너뜁니다.");
    }
    
    console.log("공정 수정 완료");
    alert("공정이 성공적으로 수정되었습니다.");
    
    // 목록 새로고침
    console.log("목록 새로고침 시작");
    await processStore.searchProcesses();
    console.log("목록 새로고침 완료");
    
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
  "PFD",
  "계산식 관리",
  "수리계통도",
  "공용구조물",
]);
const activeTab = ref(0);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const tabsContainer = ref<HTMLElement | null>(null);

// 파일 선택 관련 상태
const selectedFiles = ref<{ [key: string]: File }>({});

const onTabClick = (index: number) => {
  activeTab.value = index;
};

// 파일 선택 핸들러
const handleFileChange = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFiles.value[key] = target.files[0];
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
  if (key === "formulaFiles" && selectedFormulaFiles.value.length > 0) {
    return selectedFormulaFiles.value.length === 1
      ? selectedFormulaFiles.value[0].name
      : t("common.filesSelected", { count: selectedFormulaFiles.value.length });
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
  return selectedFiles.value[key]?.name || "";
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
      pidList.value = [
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
    ];
  designList.value = [
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
  ];
  designCriteriaList.value = [
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
  ];
  designParameterList.value = [
    { id: "1", columnNm: "", column: "param1", view: "view1" },
    { id: "2", columnNm: "", column: "param2", view: "view2" },
  ];
  designEfficiencyList.value = [
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
  ];
  calculationList.value = [
    {
      id: "1",
      no: "1",
      formulaVersion: "v1.0",
      appliedVersion: "v1.1",
      remark: "초기",
    },
    {
      id: "2",
      no: "2",
      formulaVersion: "v2.0",
      appliedVersion: "v2.1",
      remark: "업데이트",
    },
  ];
      pfdList.value = [
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
    ];
      formulaList.value = [];
           hydraulicList.value = [
       {
         id: "1",
         dwg: "hydraulic1.dwg",
         registrationDate: "2024-01-15",
         info: "수리계통도 정보 1",
         view: "hydraulic1.svg",
       },
       {
         id: "2",
         dwg: "hydraulic2.dwg",
         registrationDate: "2024-01-20",
         info: "수리계통도 정보 2",
         view: "hydraulic2.svg",
       },
     ];
       structList.value = [
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
    ];
   mccList.value = [
     {
       id: "1",
       dwg: "mcc1.dwg",
       excel: "mcc1.xlsx",
       info: "Mcc 정보 1",
       view: "mcc1.svg",
     },
     {
       id: "2",
       dwg: "mcc2.dwg",
       excel: "mcc2.xlsx",
       info: "Mcc 정보 2",
       view: "mcc2.svg",
     },
   ];
   electricList.value = [
     {
       id: "1",
       dwg: "elec1.dwg",
       excel: "elec1.xlsx",
       info: "전도개요1",
       view: "elec1.svg",
     },
     {
       id: "2",
       dwg: "elec2.dwg",
       excel: "elec2.xlsx",
       info: "전도개요2",
       view: "elec2.svg",
     },
   ];
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

    // 0. 계산식 검색 API 호출하여 그리드 데이터 초기화 (가장 먼저 실행)
    console.log("계산식 검색 API 호출 시작");
    console.log("searchFormulaAPI 함수 타입:", typeof searchFormulaAPI);
    console.log("searchFormulaAPI 함수:", searchFormulaAPI);
    
    try {
      console.log("searchFormulaAPI 함수 호출 전");
      const formulaResult = await searchFormulaAPI();
      console.log("searchFormulaAPI 함수 호출 후, 결과:", formulaResult);
      
      if (formulaResult && formulaResult.success && formulaResult.response && Array.isArray(formulaResult.response) && formulaResult.response.length > 0) {
        console.log("API 응답 데이터가 있습니다. 그리드 변환 시작");
        console.log("응답 데이터 구조:", formulaResult);
        console.log("response 배열:", formulaResult.response);
        
        formulaList.value = formulaResult.response.map((item: any, index: number) => ({
          formula_id: item.formula_id || item.id || (index + 1).toString(), // formula_id 컬럼에 실제 formula_id 값 설정
          id: item.id || (index + 1).toString(),
          no: (index + 1).toString(),
          registeredFormula: item.formula_name || '',
          registrationDate: formatDate(item.created_at) || new Date().toISOString().split('T')[0], // created_at이 없으면 현재 날짜 사용
          infoOverview: item.formula_scope || '',
          remarks: item.output_type || '',
        }));
        
        // 초기값을 별도로 저장 (깊은 복사)
        initialFormulaList.value = JSON.parse(JSON.stringify(formulaList.value));
        console.log("계산식 그리드 데이터 초기화 완료:", formulaList.value);
        console.log("초기값 저장 완료:", initialFormulaList.value);
      } else {
        console.log("API 응답 데이터가 없거나 빈 배열입니다. 빈 배열로 초기화");
        console.log("formulaResult:", formulaResult);
        formulaList.value = [];
        initialFormulaList.value = []; // 초기값도 빈 배열로 설정
      }
    } catch (error) {
      console.error("계산식 검색 API 호출 중 예외 발생:", error);
      console.error("에러 상세:", error);
      formulaList.value = [];
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
      await processStore.searchProcessById(validProcessId);
      console.log("2. handleSearch 완료");
      
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

// PFD pagination state
const currentPagePfd = ref(1);
const totalPagesPfd = computed(
  () => Math.ceil(pfdList.value.length / pageSize.value) || 1
);
const pagedPfdList = computed(() =>
  pfdList.value.slice(
    (currentPagePfd.value - 1) * pageSize.value,
    currentPagePfd.value * pageSize.value
  )
);
const handlePageChangePfd = (page: number) => {
  currentPagePfd.value = page;
};

// Formula pagination state
const currentPageFormula = ref(1);
const totalPagesFormula = computed(
  () => Math.ceil(formulaList.value.length / pageSize.value) || 1
);
const pagedFormulaList = computed(() =>
  formulaList.value.slice(
    (currentPageFormula.value - 1) * pageSize.value,
    currentPageFormula.value * pageSize.value
  )
);
const handlePageChangeFormula = (page: number) => {
  currentPageFormula.value = page;
};

// Electric pagination state
const currentPageElectric = ref(1);
const totalPagesElectric = computed(
  () => Math.ceil(electricList.value.length / pageSize.value) || 1
);
const pagedElectricList = computed(() =>
  electricList.value.slice(
    (currentPageElectric.value - 1) * pageSize.value,
    currentPageElectric.value * pageSize.value
  )
);
const handlePageChangeElectric = (page: number) => {
  currentPageElectric.value = page;
};

// Mcc pagination state
const currentPageMcc = ref(1);
const totalPagesMcc = computed(
  () => Math.ceil(mccList.value.length / pageSize.value) || 1
);
const pagedMccList = computed(() =>
  mccList.value.slice(
    (currentPageMcc.value - 1) * pageSize.value,
    currentPageMcc.value * pageSize.value
  )
);
const handlePageChangeMcc = (page: number) => {
  currentPageMcc.value = page;
};

// Hydraulic pagination state
const currentPageHydraulic = ref(1);
const totalPagesHydraulic = computed(
  () => Math.ceil(hydraulicList.value.length / pageSize.value) || 1
);
const pagedHydraulicList = computed(() =>
  hydraulicList.value.slice(
    (currentPageHydraulic.value - 1) * pageSize.value,
    currentPageHydraulic.value * pageSize.value
  )
);
const handlePageChangeHydraulic = (page: number) => {
  currentPageHydraulic.value = page;
};

// Struct pagination state
const currentPageStruct = ref(1);
const totalPagesStruct = computed(
  () => Math.ceil(structList.value.length / pageSize.value) || 1
);
const pagedStructList = computed(() =>
  structList.value.slice(
    (currentPageStruct.value - 1) * pageSize.value,
    currentPageStruct.value * pageSize.value
  )
);
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
const showFormulaModal = ref(false);
const selectedFormulaFiles = ref<File[]>([]);
const openFormulaModal = () => {
  showFormulaModal.value = true;
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
    const response = await fetch(`/api/process/formula/delete/${formulaId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
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
  showFormulaModal.value = false;
  selectedFormulaFiles.value = [];
};
const handleFormulaFilesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  selectedFormulaFiles.value = files ? Array.from(files) : [];
  console.log("Selected formula files:", selectedFormulaFiles.value);
};
const uploadFormulaFiles = () => {
  console.log("Formula upload executed:", selectedFormulaFiles.value);
  
  // 선택된 파일들을 formulaList에 추가
  if (selectedFormulaFiles.value.length > 0) {
    selectedFormulaFiles.value.forEach((file, index) => {
      // .py 확장자를 제외한 파일명 추출
      const fileNameWithoutExt = file.name.replace(/\.py$/i, '');
      
      // 새로운 계산식 항목 생성
      const newFormula = {
        formula_id: Date.now().toString() + index, // formula_id 컬럼에 고유 ID 설정
        id: Date.now().toString() + index, // 고유 ID 생성
        no: (formulaList.value.length + index + 1).toString(),
        registeredFormula: fileNameWithoutExt,
        registrationDate: new Date().toISOString().split('T')[0], // 현재 날짜
        infoOverview: "",
        remarks: "",
      };
      
      formulaList.value.push(newFormula);
    });
  }
  
  closeFormulaModal();
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
  selectedHydraulicFiles.value = files ? Array.from(files) : [];
  console.log("Selected Hydraulic diagram files:", selectedHydraulicFiles.value);
};
const uploadHydraulicFiles = () => {
  console.log("Hydraulic diagram upload executed:", selectedHydraulicFiles.value);
  closeHydraulicModal();
};

// 삭제 핸들러 함수들
const handlePidDelete = () => {
  if (selectedPidItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: selectedPidItems.value.length,
      })
    )
  ) {
    // 선택된 항목들을 pidList에서 제거
    const selectedIds = selectedPidItems.value.map((item) => item.dwg);
    pidList.value = pidList.value.filter(
      (item) => !selectedIds.includes(item.dwg)
    );
    selectedPidItems.value = [];
    alert(t("messages.success.pidItemDeleted"));
  }
};

const handlePfdDelete = () => {
  if (selectedPfdItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: selectedPfdItems.value.length,
      })
    )
  ) {
    // 선택된 항목들을 pfdList에서 제거
    const selectedIds = selectedPfdItems.value.map((item) => item.dwg);
    pfdList.value = pfdList.value.filter(
      (item) => !selectedIds.includes(item.dwg)
    );
    selectedPfdItems.value = [];
    alert(t("messages.success.pfdItemDeleted"));
  }
};

// 계산식 관리 탭 삭제 함수
const handleFormulaDelete = () => {
  if (selectedFormulaItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  // 선택된 항목들의 formula_id 속성을 alert로 출력
  selectedFormulaItems.value.forEach((item, index) => {
    const formulaId = item.formula_id || 'formula_id 속성이 없습니다';
    //alert(`선택된 행 ${index + 1}: formula_id = ${formulaId}`);
  });

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: selectedFormulaItems.value.length,
      })
    )
  ) {
    // 선택된 항목들을 formulaList에서 제거
    const selectedIds = selectedFormulaItems.value.map((item) => item.no);
    formulaList.value = formulaList.value.filter(
      (item) => !selectedIds.includes(item.no)
    );
    selectedFormulaItems.value = [];
    alert(t("messages.success.formulaItemDeleted"));
  }
};

const handleElectricDelete = () => {
  if (selectedElectricItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: selectedElectricItems.value.length,
      })
    )
  ) {
    // 선택된 항목들을 electricList에서 제거
    const selectedIds = selectedElectricItems.value.map((item) => item.dwg);
    electricList.value = electricList.value.filter(
      (item) => !selectedIds.includes(item.dwg)
    );
    selectedElectricItems.value = [];
    alert(t("messages.success.electricDrawingItemDeleted"));
  }
};

const handleMccDelete = () => {
  if (selectedMccItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: selectedMccItems.value.length,
      })
    )
  ) {
    // 선택된 항목들을 mccList에서 제거
    const selectedIds = selectedMccItems.value.map((item) => item.dwg);
    mccList.value = mccList.value.filter(
      (item) => !selectedIds.includes(item.dwg)
    );
    selectedMccItems.value = [];
    alert(t("messages.success.mccDiagramItemDeleted"));
  }
};

const handleHydraulicDelete = () => {
  if (selectedHydraulicItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: selectedHydraulicItems.value.length,
      })
    )
  ) {
    // 선택된 항목들을 hydraulicList에서 제거
    const selectedIds = selectedHydraulicItems.value.map((item) => item.dwg);
    hydraulicList.value = hydraulicList.value.filter(
      (item) => !selectedIds.includes(item.dwg)
    );
    selectedHydraulicItems.value = [];
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
