<template>
  <div class="process-page">
    <!-- Add Button -->
    <div class="action-bar">
      <dl class="column-search">
        <dt class="essential">{{ t("processDetail.processType") }}</dt>
        <dd>
          <select name="" id="">
            <option value=""></option>
          </select>
        </dd>
        <dt class="essential">{{ t("processDetail.processName") }}</dt>
        <dd>
          <select name="" id="">
            <option value=""></option>
          </select>
        </dd>
        <dt>{{ t("processDetail.mode") }}</dt>
        <dd>
          <select name="" id="">
            <option value=""></option>
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
        <dt>{{ t("processDetail.etc") }}</dt>
        <dd class="extend-all">
          <input
            type="text"
            class="form-input"
            :placeholder="t('placeholder.projectDetail')"
          />
        </dd>
      </dl>

      <div class="btns">
        <button class="btn btn-primary btn-regist">
          {{ t("common.register") }}
        </button>
        <button class="btn btn-primary btn-edit">{{ t("common.edit") }}</button>
      </div>
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

      <!-- PDF 탭 버튼들 -->
      <div v-if="activeTab === 4" class="btns">
        <button class="btn btn-primary btn-add" @click="openPdfModal">
          {{ t("common.add") }}
        </button>
        <button
          class="btn btn-primary btn-delete"
          @click="handlePdfDelete"
          :disabled="selectedPdfItems.length === 0"
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
      <!-- PDF 탭 -->
      <DataTable
        :columns="pdfColumns"
        :data="pagedPdfList"
        :loading="loading"
        :selectable="true"
        :selectedItems="selectedPdfItems"
        @selection-change="handlePdfSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <div class="pagination-container">
        <Pagination
          :current-page="currentPagePdf"
          :total-pages="totalPagesPdf"
          @page-change="handlePageChangePdf"
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
  <!-- PDF 파일 첨부 모달 -->
  <div v-if="showPdfModal" class="modal-overlay">
    <div class="modal-window">
      <div class="modal-header">
        <h3>{{ t("processDetail.attachPdfFile") }}</h3>
        <button
          class="btn-close"
          @click="closePdfModal"
          :aria-label="t('common.close')"
        >
          ×
        </button>
      </div>
      <div class="modal-body">
        <dl class="column-regist">
          <dt class="essential">{{ t("processDetail.attachPdfFile") }}</dt>
          <dd>
            <div class="file-upload-row">
              <input
                type="text"
                class="file-name-input"
                :value="getSelectedFilesText('pdfFiles')"
                :placeholder="t('placeholder.selectFile')"
                readonly
              />
              <label class="file-select-btn">
                {{ t("common.selectFile") }}
                <input
                  type="file"
                  multiple
                  @change="handlePdfFilesSelected"
                  style="display: none"
                />
              </label>
            </div>
          </dd>
        </dl>
      </div>
      <div class="modal-buttons">
        <button class="btn btn-primary" @click="uploadPdfFiles">
          {{ t("common.upload") }}
        </button>
        <button class="btn" @click="closePdfModal">
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
import { ref, onMounted, nextTick, computed } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
defineExpose({ t });

// 공통 로딩 상태
const loading = ref(false);

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

// 7: PDF 탭용 컬럼/데이터
const pdfColumns: TableColumn[] = [
  { key: "dwg", title: t("columns.processDetail.dwgFile"), sortable: true },
  { key: "excel", title: t("columns.processDetail.excel"), sortable: true },
  {
    key: "info",
    title: t("columns.processDetail.infoOverview"),
    sortable: true,
  },
  { key: "view", title: t("columns.processDetail.svgPreview"), sortable: true },
];
const pdfList = ref<any[]>([]);
const selectedPdfItems = ref<any[]>([]);
const handlePdfSelectionChange = (items: any[]) => {
  selectedPdfItems.value = items;
  console.log("PDF selection changed:", items);
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
const handleSortChange = (args: { key: string; direction: "asc" | "desc" }) => {
  console.log("Sort:", args.key, args.direction);
};
// 행 클릭 핸들러
const handleRowClick = (item: any, index: number) => {
  console.log("Row clicked:", item, index);
};

const tabs = ref([
  "P&ID",
  "설계조건",
  "공용구조물",
  "계산식 관리",
  "PDF",
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
  if (key === "pdfFiles" && selectedPdfFiles.value.length > 0) {
    return selectedPdfFiles.value.length === 1
      ? selectedPdfFiles.value[0].name
      : t("common.filesSelected", { count: selectedPdfFiles.value.length });
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
  pdfList.value = [
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

onMounted(() => {
  loadData();
  nextTick(() => {
    updateScrollButtons();
  });
});

// PDF pagination state
const currentPagePdf = ref(1);
const totalPagesPdf = computed(
  () => Math.ceil(pdfList.value.length / pageSize.value) || 1
);
const pagedPdfList = computed(() =>
  pdfList.value.slice(
    (currentPagePdf.value - 1) * pageSize.value,
    currentPagePdf.value * pageSize.value
  )
);
const handlePageChangePdf = (page: number) => {
  currentPagePdf.value = page;
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

// Modal state for PDF, Electric, and Mcc file upload
const showPdfModal = ref(false);
const selectedPdfFiles = ref<File[]>([]);
const openPdfModal = () => {
  showPdfModal.value = true;
};
const closePdfModal = () => {
  showPdfModal.value = false;
  selectedPdfFiles.value = [];
};
const handlePdfFilesSelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  selectedPdfFiles.value = files ? Array.from(files) : [];
  console.log("Selected PDF files:", selectedPdfFiles.value);
};
const uploadPdfFiles = () => {
  console.log("PDF upload executed:", selectedPdfFiles.value);
  closePdfModal();
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

const handlePdfDelete = () => {
  if (selectedPdfItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("messages.confirm.deleteItems", {
        count: selectedPdfItems.value.length,
      })
    )
  ) {
    // 선택된 항목들을 pdfList에서 제거
    const selectedIds = selectedPdfItems.value.map((item) => item.dwg);
    pdfList.value = pdfList.value.filter(
      (item) => !selectedIds.includes(item.dwg)
    );
    selectedPdfItems.value = [];
    alert(t("messages.success.pdfItemDeleted"));
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
</script>

<style scoped lang="scss">
@use "sass:color";

.public-management-layout {
  height: 100%;
  padding: $spacing-lg;
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
