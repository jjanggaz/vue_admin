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
import { ref, onMounted, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useI18n } from "vue-i18n";
import { useProcessStore } from "@/stores/processStore";

// Props 정의
interface Props {
  processId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  processId: undefined,
});

const { t } = useI18n();
const route = useRoute();
const processStore = useProcessStore();
defineExpose({ t });

// 공통 로딩 상태
const loading = computed(() => processStore.loading);

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
    return selectedPidFiles.value.length === 1
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
    return selectedPidFiles.value.length === 1
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
  try {
    console.log("=== ProcessDetail.vue onMounted 시작 ===");

    // 기본 데이터 로드
    loadData();
    console.log("기본 데이터 로드 완료");

    // props에서 processId를 우선 사용하고, 없으면 라우터 매개변수 사용
    const processId = props.processId || (route.params.id as string);

    if (!processId) {
      console.log("processId가 없어서 초기화를 건너뜁니다.");
      return;
    }

    console.log("=== ProcessDetail.vue processId 확인 ===");
    console.log("props.processId:", props.processId);
    console.log("route.params.id:", route.params.id);
    console.log("사용할 processId:", processId);

    // 1. 공정구분 코드 리스트 로드
    try {
      await processStore.loadProcessTypeCodes();
      console.log("1. searchProcessTypeOptions 리스트 로드 완료");
    } catch (error) {
      console.error("공정구분 코드 로드 실패:", error);
    }

    // 2. 화면 로드 시 handleSearch 함수 수행하여 입력 필드 값들 초기화
    try {
      await processStore.searchProcessById(processId);
      console.log("2. handleSearch 완료");
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
  console.log("Selected PFD files:", selectedPidFiles.value);
};
const uploadPfdFiles = () => {
  console.log("PFD upload executed:", selectedPidFiles.value);
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
