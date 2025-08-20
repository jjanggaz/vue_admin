<template>
  <div class="process-page">
    <!-- Add Button -->
     <div class="action-bar">
               <div class="btns">
          <button class="btn btn-primary btn-edit" @click="handleUpdate">{{ t("common.edit") }}</button>
        </div>
     </div>
     
     <div class="action-bar">
       <dl class="column-search">
         <dt class="essential">{{ t("processDetail.processType") }}</dt>
         <dd>
           <select 
             v-model="searchProcessTypeInput" 
             class="form-select"
             @change="handleProcessTypeChange"
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
         <dt>{{ t("processDetail.subCategory") }}</dt>
         <dd>
           <select 
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
         </dd>
         <dt class="essential">{{ t("processDetail.processName") }}</dt>
         <dd>
           <select 
             v-model="searchProcessNameInput" 
             class="form-select"
             @change="handleProcessNameChange"
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
                  <dt class="essential">{{ t("processDetail.processSymbol") }}</dt>
          <dd>
            <div class="file-upload-row">
              <input
                type="text"
                class="file-name-input"
                :value="selectedFiles.processSymbol?.name || ''"
                :placeholder="t('placeholder.selectFile')"
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
          <!-- <dt class="essential">계산식</dt>
          <dd>
            <input type="text" class="form-input" :placeholder="t('placeholder.projectDetail')">
          </dd> -->
           <dt>{{ t("processDetail.description") }}</dt>
           <dd class="extend-all">
             <input
               type="text"
               class="form-input"
               v-model="processDetail.description"
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
      <!-- P&ID 탭 버튼들 -->
      <div v-if="activeTab === 0" class="btns">
        <button class="btn btn-primary btn-regist" @click="openPidModal">
          {{ t("processDetail.addPid") }}
        </button>
        <button
          class="btn btn-primary btn-delete"
          @click="handlePidDelete"
          :disabled="selectedPidItems.length === 0"
        >
          {{ t("common.delete") }}
        </button>
      </div>

      <!-- PFD 탭 버튼들 -->
      <div v-if="activeTab === 4" class="btns">
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

      <!-- 전기도면 탭 버튼들 -->
      <div v-if="activeTab === 5" class="btns">
        <button class="btn btn-primary btn-add" @click="openElectricModal">
          {{ t("common.add") }}
        </button>
        <button
          class="btn btn-primary btn-delete"
          @click="handleElectricDelete"
          :disabled="selectedElectricItems.length === 0"
        >
          {{ t("common.delete") }}
        </button>
      </div>

      <!-- Mcc 구성도 탭 버튼들 -->
      <div v-if="activeTab === 6" class="btns">
        <button class="btn btn-primary btn-add" @click="openMccModal">
          {{ t("common.add") }}
        </button>
        <button
          class="btn btn-primary btn-delete"
          @click="handleMccDelete"
          :disabled="selectedMccItems.length === 0"
        >
          {{ t("common.delete") }}
        </button>
      </div>
    </div>
  </div>

  <div class="tab-content">
    <div v-if="activeTab === 0" class="content">
      <!-- P&ID 탭 -->
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
      <div class="pagination-container">
        <Pagination
          :current-page="currentPagePid"
          :total-pages="totalPagesPid"
          @page-change="handlePageChangePid"
        />
      </div>
    </div>
    <div
      v-if="activeTab === 1"
      class="content display-grid-2"
      style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px"
    >
      <!-- 설계조건 탭: 기본 테이블 -->
      <DataTable
        :columns="designColumns"
        :data="designList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <!-- 설계조건 탭: 세부 Criteria 테이블 -->
      <DataTable
        :columns="designCriteriaColumns"
        :data="designCriteriaList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <!-- 설계조건 탭: 파라미터 테이블 -->
      <DataTable
        :columns="designParameterColumns"
        :data="designParameterList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <!-- 설계조건 탭: 효율 테이블 -->
      <DataTable
        :columns="designEfficiencyColumns"
        :data="designEfficiencyList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
    </div>
    <div v-if="activeTab === 2" class="content">
      <!-- 공용구조물 탭 -->
      <DataTable
        :columns="structColumns"
        :data="structList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
    </div>
    <div v-if="activeTab === 3" class="content">
      <!-- 계산식 관리 탭 -->
      <DataTable
        :columns="calculationColumns"
        :data="calculationList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
    </div>
    <div v-if="activeTab === 4" class="content">
      <!-- PFD 탭 -->
      <DataTable
        :columns="pfdColumns"
        :data="pagedPfdList"
        :loading="loading"
        :selectable="true"
        :selectedItems="selectedPfdItems"
        @selection-change="handlePfdSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <div class="pagination-container">
        <Pagination
          :current-page="currentPagePfd"
          :total-pages="totalPagesPfd"
          @page-change="handlePageChangePfd"
        />
      </div>
    </div>
    <div v-if="activeTab === 5" class="content">
      <!-- 전기도면 탭 -->
      <DataTable
        :columns="electricColumns"
        :data="pagedElectricList"
        :loading="loading"
        :selectable="true"
        :selectedItems="selectedElectricItems"
        @selection-change="handleElectricSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <div class="pagination-container">
        <Pagination
          :current-page="currentPageElectric"
          :total-pages="totalPagesElectric"
          @page-change="handlePageChangeElectric"
        />
      </div>
    </div>
    <div v-if="activeTab === 6" class="content">
      <!-- Mcc 구성도 탭 -->
      <DataTable
        :columns="mccColumns"
        :data="pagedMccList"
        :loading="loading"
        :selectable="true"
        :selectedItems="selectedMccItems"
        @selection-change="handleMccSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <div class="pagination-container">
        <Pagination
          :current-page="currentPageMcc"
          :total-pages="totalPagesMcc"
          @page-change="handlePageChangeMcc"
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
                :placeholder="t('placeholder.selectFile')"
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
        <button class="btn btn-primary" @click="uploadPidFiles">
          {{ t("common.upload") }}
        </button>
        <button class="btn" @click="closePidModal">
          {{ t("common.cancel") }}
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
                :placeholder="t('placeholder.selectFile')"
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
        <button class="btn btn-primary" @click="uploadPfdFiles">
          {{ t("common.upload") }}
        </button>
        <button class="btn" @click="closePfdModal">
          {{ t("common.cancel") }}
        </button>
      </div>
    </div>
  </div>
  <!-- Electric 파일 첨부 모달 -->
  <div v-if="showElectricModal" class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <h3>{{ t("processDetail.attachElectricFile") }}</h3>
        <button
          class="btn-close"
          @click="closeElectricModal"
          :aria-label="t('common.close')"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <dl class="column-regist">
          <dt class="essential">{{ t("processDetail.attachElectricFile") }}</dt>
          <dd>
            <div class="file-upload-row">
              <input
                type="text"
                class="file-name-input"
                :value="getSelectedFilesText('electricFiles')"
                :placeholder="t('placeholder.selectFile')"
                readonly
              />
              <label class="file-select-btn">
                {{ t("common.selectFile") }}
                <input
                  type="file"
                  multiple
                  @change="handleElectricFilesSelected"
                  style="display: none"
                />
              </label>
            </div>
          </dd>
        </dl>
      </div>
      <div class="modal-buttons">
        <button class="btn btn-primary" @click="uploadElectricFiles">
          {{ t("common.upload") }}
        </button>
        <button class="btn" @click="closeElectricModal">
          {{ t("common.cancel") }}
        </button>
      </div>
    </div>
  </div>
  <!-- Mcc 구성도 파일 첨부 모달 -->
  <div v-if="showMccModal" class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <h3>{{ t("processDetail.attachMccFile") }}</h3>
        <button
          class="btn-close"
          @click="closeMccModal"
          :aria-label="t('common.close')"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <dl class="column-regist">
          <dt class="essential">{{ t("processDetail.attachMccFile") }}</dt>
          <dd>
            <div class="file-upload-row">
              <input
                type="text"
                class="file-name-input"
                :value="getSelectedFilesText('mccFiles')"
                :placeholder="t('placeholder.selectFile')"
                readonly
              />
              <label class="file-select-btn">
                {{ t("common.selectFile") }}
                <input
                  type="file"
                  multiple
                  @change="handleMccFilesSelected"
                  style="display: none"
                />
              </label>
            </div>
          </dd>
        </dl>
      </div>
      <div class="modal-buttons">
        <button class="btn btn-primary" @click="uploadMccFiles">
          {{ t("common.upload") }}
        </button>
        <button class="btn" @click="closeMccModal">
          {{ t("common.cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from "vue";
import { useRoute } from "vue-router";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useI18n } from "vue-i18n";
import { request } from "@/utils/request";
const { t } = useI18n();
const route = useRoute();
defineExpose({ t });

// 공통 로딩 상태
const loading = ref(false);

// Process.vue와 동일한 구조의 검색 입력 변수들
const searchProcessTypeInput = ref<string | null>(null);
const searchSubCategoryInput = ref<string | null>(null);
const searchProcessNameInput = ref<string | null>(null);

// Process.vue와 동일한 구조의 검색 옵션 변수들 (공유 데이터)
const searchProcessTypeOptions = ref<{ value: string; label: string }[]>([]);
const searchSubCategoryOptions = ref<{ value: string; label: string }[]>([]);
const searchProcessNameOptions = ref<{ value: string; label: string }[]>([]);

// 공정 상세 정보 (search 변수들과 동기화)
const processDetail = ref({
  processType: null as string | null,
  processName: null as string | null,
  subCategory: null as string | null,
  processSymbol: "",
  description: ""
});

// 전역변수로 공정 데이터 저장
const globalProcessData = ref({
  level2_code_key: "",
  level3_code_key: "",
  process_code: ""
});

// search 변수들과 processDetail 객체 동기화
watch(searchProcessTypeInput, (newValue) => {
  processDetail.value.processType = newValue;
});

watch(searchSubCategoryInput, (newValue) => {
  processDetail.value.subCategory = newValue;
});

watch(searchProcessNameInput, (newValue) => {
  processDetail.value.processName = newValue;
});

// processDetail 객체의 값들과 search 변수들 동기화
watch(() => processDetail.value.processType, (newValue) => {
  searchProcessTypeInput.value = newValue;
});

watch(() => processDetail.value.subCategory, (newValue) => {
  searchSubCategoryInput.value = newValue;
});

watch(() => processDetail.value.processName, (newValue) => {
  searchProcessNameInput.value = newValue;
});

// 0: P&ID 탭용 컬럼/데이터
const pidColumns: TableColumn[] = [
  { key: "dwg", title: t("columns.processDetail.dwgFile") },
  { key: "excel", title: t("columns.processDetail.excel") },
  { key: "info", title: t("columns.processDetail.infoOverview") },
  { key: "view", title: t("columns.processDetail.svgPreview") },
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

// 7: PFD 탭용 컬럼/데이터
const pfdColumns: TableColumn[] = [
  { key: "dwg", title: t("columns.processDetail.dwgFile"), sortable: true },
  { key: "excel", title: t("columns.processDetail.excel"), sortable: true },
  {
    key: "info",
    title: t("columns.processDetail.infoOverview"),
    sortable: true,
  },
  { key: "view", title: t("columns.processDetail.svgPreview"), sortable: true },
];
const pfdList = ref<any[]>([]);
const selectedPfdItems = ref<any[]>([]);
const handlePfdSelectionChange = (items: any[]) => {
  selectedPfdItems.value = items;
  console.log("PFD selection changed:", items);
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

// 정렬 이벤트 핸들러
const handleSortChange = (args: { key: string | null; direction: "asc" | "desc" | null }) => {
  console.log("Sort:", args.key, args.direction);
};

// 행 클릭 핸들러
const handleRowClick = (item: any, index: number) => {
  console.log("Row clicked:", item, index);
};

// Process.vue와 동일한 구조의 핸들러 함수들
// 공정구분 변경 핸들러
const handleProcessTypeChange = () => {
  const selectedValue = searchProcessTypeInput.value;
  
  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 중분류 옵션 초기화
    searchSubCategoryOptions.value = [];
    searchSubCategoryInput.value = null;
    // 공정명 옵션도 초기화
    searchProcessNameOptions.value = [];
    searchProcessNameInput.value = null;
    console.log("검색 옵션 변경: null 또는 공백값 선택 - 중분류 및 공정명 옵션 초기화");
  } else {
    const selectedOption = searchProcessTypeOptions.value.find(option => option.value === selectedValue);
    
    if (selectedOption) {
      console.log("검색 옵션 변경:");
      console.log("  key:", selectedOption.value);
      console.log("  value:", selectedOption.label);
      // 공정명 옵션 초기화
      searchProcessNameOptions.value = [];
      searchProcessNameInput.value = null;
      handleSubCategoryCode();
    } else {
      console.log("검색 옵션 변경: 선택되지 않음");
    }
  }
};



// 공정명 변경 핸들러
const handleProcessNameChange = () => {
  const selectedValue = searchProcessNameInput.value;
  
  if (selectedValue === null || selectedValue === "") {
    console.log("공정명 변경: null 또는 공백값 선택");
  } else {
    console.log("공정명 변경:", selectedValue);
  }
};

// 공정 중분류(subCategory) 변경 핸들러
const handleSubCategoryChange = () => {
  const selectedValue = searchSubCategoryInput.value;
  
  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 공정명 옵션 초기화
    searchProcessNameOptions.value = [];
    searchProcessNameInput.value = null;
    console.log("공정 중분류 변경: null 또는 공백값 선택 - 공정명 옵션 초기화");
  } else {
    console.log("공정 중분류 변경:", selectedValue);
    // 공정명 옵션 로드
    handleProcessNameCode();
  }
};

// Process.vue와 동일한 구조의 공정구분 코드 검색 함수
const handleProcessTypeCode = async () => {
  try {
    loading.value = true;
    console.log("공정구분 코드 검색 시작: /api/process/code/search");
    
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
      
      if (result.response && Array.isArray(result.response)) {
        searchProcessTypeOptions.value = result.response.map((item: any) => ({
          value: item.code_key,
          label: item.code_value
        }));
        
        console.log("생성된 공정구분 옵션:", searchProcessTypeOptions.value);
      } else {
        console.log("공정구분 데이터가 없습니다.");
      }
    } else {
      alert(`공정구분 코드 검색 실패: ${result.message}`);
    }
    
  } catch (error: any) {
    console.error("공정구분 코드 검색 실패:", error);
    const errorMessage = error.message || error.response || '알 수 없는 오류가 발생했습니다.';
    alert(`공정구분 코드 검색 실패: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
};


// Process.vue와 동일한 구조의 중분류 코드 검색 함수
const handleSubCategoryCode = async () => {
  try {
    loading.value = true;
    console.log("중분류 코드 검색 시작: /api/process/code/search");
    
    const requestData = {
      search_field: 'parent_key',
      search_value: searchProcessTypeInput.value,
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

// Process.vue와 동일한 구조의 공정명 코드 검색 함수
const handleProcessNameCode = async () => {
  try {
    loading.value = true;
    console.log("공정명 코드 검색 시작: /api/process/code/search");
    
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



const tabs = ref([
  "P&ID",
  "설계조건",
  "공용구조물",
  "계산식 관리",
  "PFD",
  "전기도면",
  "Mcc 구성도",
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
      dwg: "pid1.dwg",
      excel: "pid1.xlsx",
      info: "P&ID 정보 1",
      view: "pid1.svg",
    },
    {
      id: "2",
      dwg: "pid2.dwg",
      excel: "pid2.xlsx",
      info: "P&ID 정보 2",
      view: "pid2.svg",
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
      dwg: "file1.dwg",
      excel: "file1.xlsx",
      info: "개요1",
      view: "file1.svg",
    },
    {
      id: "2",
      dwg: "file2.dwg",
      excel: "file2.xlsx",
      info: "개요2",
      view: "file2.svg",
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
  structList.value = [
    { id: "1", type: "", components: "", equipmentType: "", item: "" },
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
};

onMounted(async () => {
  loadData();
  
  // 라우터 매개변수에서 초기값 가져오기
  const processId = route.params.id as string;
  
  console.log("=== ProcessDetail.vue 라우터 매개변수 확인 ===");
  console.log("processId:", processId);
  
  // 1. searchProcessTypeOptions의 리스트들 입력
  await handleProcessTypeCode();
  console.log("1. searchProcessTypeOptions 리스트 로드 완료");
  
  // 화면 로드 시 handleSearch 함수 수행하여 입력 필드 값들 초기화
  await handleSearch();
  
  // // 3. searchSubCategoryOptions의 리스트들 입력
  if (globalProcessData.value.level2_code_key) {
    await handleSubCategoryCode();
    console.log("3. searchSubCategoryOptions 리스트 로드 완료");
  }
  
  // // 4. searchSubCategoryInput 초기값 지정
  if (globalProcessData.value.level3_code_key) {
    // 해당 옵션이 실제로 존재하는지 확인
    const subCategoryExists = searchSubCategoryOptions.value.some(option => option.value === globalProcessData.value.level3_code_key);
    if (subCategoryExists) {
      searchSubCategoryInput.value = globalProcessData.value.level3_code_key;
      console.log("4. searchSubCategoryInput 초기값 설정:", globalProcessData.value.level3_code_key);
    } else {
      console.log("4. searchSubCategoryInput 초기값 설정 실패: 해당 옵션이 존재하지 않음:", globalProcessData.value.level3_code_key);
      console.log("현재 searchSubCategoryOptions:", searchSubCategoryOptions.value);
    }
  }
  
  // // 5. searchProcessNameOptions의 리스트들 입력
  if (globalProcessData.value.process_code) {
    await handleProcessNameCode();
    console.log("5. searchProcessNameOptions 리스트 로드 완료");
  }
  
  // // 6. searchProcessNameInput 초기값 지정
  if (globalProcessData.value.process_code) {
    // 해당 옵션이 실제로 존재하는지 확인
    const processNameExists = searchProcessNameOptions.value.some(option => option.value === globalProcessData.value.process_code);
    if (processNameExists) {
      searchProcessNameInput.value = globalProcessData.value.process_code;
      console.log("6. searchProcessNameInput 초기값 설정:", globalProcessData.value.process_code);
    } else {
      console.log("6. searchProcessNameInput 초기값 설정 실패: 해당 옵션이 존재하지 않음:", globalProcessData.value.process_code);
      console.log("현재 searchProcessNameOptions:", searchProcessNameOptions.value);
    }
  }
  
  nextTick(() => {
    updateScrollButtons();
  });
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
  console.log("Selected PFD files:", selectedPfdFiles.value);
};
const uploadPfdFiles = () => {
  console.log("PFD upload executed:", selectedPfdFiles.value);
  closePfdModal();
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


// 검색 기능 구현 (단건 조회)
const handleSearch = async () => {
  try {
    loading.value = true;
    console.log("검색 시작: /master/search");
    
    const requestData = {
      search_field: 'process_id',
      search_value: route.params.id
    };

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
      
      // 단건 조회 결과 처리
      let processData;
      
      if (Array.isArray(result.response) && result.response.length > 0) {
        // 배열로 응답이 온 경우 첫 번째 항목만 사용
        processData = result.response[0];
        console.log("배열 응답에서 첫 번째 항목 사용:", processData);
      } else if (result.response.items && Array.isArray(result.response.items) && result.response.items.length > 0) {
        // items 배열로 응답이 온 경우 첫 번째 항목만 사용
        processData = result.response.items[0];
        console.log("items 배열에서 첫 번째 항목 사용:", processData);
      } else if (typeof result.response === 'object' && !Array.isArray(result.response)) {
        // 단일 객체로 응답이 온 경우
        processData = result.response;
        console.log("단일 객체 응답 사용:", processData);
      } else {
        console.log("검색 결과가 없거나 응답 형식이 올바르지 않습니다.");
        console.log("응답 데이터:", result.response);
        return;
      }
      
      // 검색된 데이터를 화면에 표시
      if (processData) {
        console.log("=== 검색된 공정 데이터 ===");
        console.log("level2_code_value (공정구분):", processData.level2_code_value);
        console.log("level3_code_value (공정 중분류):", processData.level3_code_value);
        console.log("process_name (공정명):", processData.process_name);
        console.log("symbol_uri (공정심볼):", processData.symbol_uri);
        console.log("================================");
        
        // 전역변수에 공정 데이터 저장
        globalProcessData.value.level2_code_key = processData.level2_code_key || "";
        globalProcessData.value.level3_code_key = processData.level3_code_key || "";
        globalProcessData.value.process_code = processData.process_code || "";
        
        console.log("전역변수에 저장된 공정 데이터:", globalProcessData.value);
        
        // 검색된 데이터를 화면 입력 필드에 설정
        if (processData.level2_code_key) {
          searchProcessTypeInput.value = processData.level2_code_key;
        }
        
        if (processData.process_description) {
            processDetail.value.description = processData.process_description;
            console.log("공정 설명:", processData.process_description);
        }
          
        if (processData.symbol_uri) {
          // 파일 정보 설정 (실제 구현에서는 파일 객체로 변환 필요)
          console.log("공정 심볼 파일:", processData.symbol_uri);
        }
        
        console.log("화면 입력 필드 업데이트 완료");
      }
      
    } else {
      console.log("검색 실패 또는 응답이 없습니다.");
      console.log("전체 응답:", result);
    }
    
  } catch (error: any) {
    console.error("검색 실패:", error);
    const errorMessage = error.message || error.response || '검색 중 오류가 발생했습니다.';
    alert(`검색 실패: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
};


const handleUpdate = async () => {
  try {
    // 라우터 매개변수에서 processId 가져오기
    const processId = route.params.id as string;
    
    if (!processId) {
      alert(t("messages.error.processIdNotFound"));
      return;
    }

    // 필수 필드 검증
    if (!searchProcessTypeInput.value || !searchProcessNameInput.value) {
      alert(t("messages.warning.pleaseFillRequiredFields"));
      return;
    }

    // 선택된 공정구분의 label과 value 찾기
    const selectedProcessTypeOption = searchProcessTypeOptions.value.find(
      option => option.value === searchProcessTypeInput.value
    );

    // 선택된 공정명의 label과 value 찾기
    const selectedProcessNameOption = searchProcessNameOptions.value.find(
      option => option.value === searchProcessNameInput.value
    );

    if (!selectedProcessTypeOption || !selectedProcessNameOption) {
      alert(t("messages.error.invalidProcessData"));
      return;
    }

    // API 호출을 위한 데이터 준비
    const requestData = {
      process_code: selectedProcessNameOption.value,
      process_name: selectedProcessNameOption.label,
      process_type_code: selectedProcessTypeOption.value,
      process_category: searchSubCategoryInput.value || "",
      process_symbol_file: selectedFiles.value.processSymbol?.name || "",
      process_description: processDetail.value.description || ""
    };

    console.log("공정 상세 저장 요청 데이터:", requestData);

    // /api/process/master/update 서비스 호출
    const result = await request(`/api/process/master/update/${processId}`, undefined, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("공정 상세 저장 API 응답:", result);

    if (result.success) {
      alert(t("messages.success.updateSuccess"));
      // 저장 성공 후 필요한 처리
    } else {
      const errorMessage = result.message || t("messages.error.saveError");
      alert(`저장 실패: ${errorMessage}`);
    }

  } catch (error: any) {
    console.error("저장 실패:", error);
    const errorMessage =
      error?.message || t("messages.error.saveError");
    alert(`저장 실패: ${errorMessage}`);
  }
};

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
</style>
