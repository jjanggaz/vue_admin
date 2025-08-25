<template>
  <div class="outflow">
    <div class="page-content">
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
                :key="tab.name"
                :class="['tab', tab.className, { active: activeTab === idx }]"
                @click="onTabClick(idx)"
              >
                {{ tab.name }}
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

        <div class="tab-buttons">
          <div class="btns">
            <button class="btn btn-create" @click="openModal">
              {{ t("outflow.registerNew") }}
            </button>
          </div>
        </div>
      </div>

      <div class="tab-content">
        <div class="content-wrapper">
          <div class="tab-content-metric">
            <div class="section-header">
              <h3>Metric</h3>
            </div>
            <div v-if="activeTab >= 0" class="content">
              <DataTable 
                :columns="gridColumns" 
                :data="currentMetricGridData"
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template #cell-item="{ item, index }: { item: GridRow, index: number }">
                  <select
                    v-if="item.item === ''"
                    v-model="item.item"
                    @change="onParameterSelect(item.item, index, true, false)"
                    class="form-input"
                  >
                    <option value="">선택</option>
                    <option
                      v-for="param in outflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-display="{ item }: { item: GridRow }">
                  <input
                    type="checkbox"
                    v-model="item.display"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
              </DataTable>

              <div class="action-bar">
                <div class="title">
                  <h4>{{ t("outflow.formulaList") }}</h4>
                </div>
                <div class="btns">
                  <button class="btn btn-add">{{ t("outflow.delete") }}</button>
                </div>
              </div>

              <DataTable 
                :columns="gridColumns2" 
                :data="currentGridData2"
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template #cell-formula="{ item }">
                  <span>{{ item.formula }}</span>
                </template>
                <template #cell-apply="{ item }: { item: GridRow2 }">
                  <input
                    type="checkbox"
                    v-model="item.apply"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
                <template #cell-remarks="{ item, index }">
                  <input
                    v-if="index === currentGridData2.length - 1"
                    type="text"
                    v-model="item.remarks"
                    class="form-input"
                  />
                  <span v-else>{{ item.remarks }}</span>
                </template>
              </DataTable>
            </div>
          </div>
            
          <div class="tab-content-imperial">
            <div class="section-header">
              <h3>Imperial</h3>
            </div>
            <div v-if="activeTab >= 0" class="content">
              <DataTable 
                :columns="gridColumns" 
                :data="currentImperialGridData"
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template #cell-item="{ item, index }: { item: GridRow, index: number }">
                  <select
                    v-if="item.item === ''"
                    v-model="item.item"
                    @change="onParameterSelect(item.item, index, false, false)"
                    class="form-input"
                  >
                    <option value="">선택</option>
                    <option
                      v-for="param in outflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-display="{ item }: { item: GridRow }">
                  <input
                    type="checkbox"
                    v-model="item.display"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
              </DataTable>

              <div class="action-bar">
                <div class="title">
                  <h4>{{ t("outflow.formulaList") }}</h4>
                </div>
                <div class="btns">
                  <button class="btn btn-add">{{ t("outflow.delete") }}</button>
                </div>
              </div>

              <DataTable 
                :columns="gridColumns2" 
                :data="currentGridData2"
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template #cell-formula="{ item }">
                  <span>{{ item.formula }}</span>
                </template>
                <template #cell-apply="{ item }: { item: GridRow2 }">
                  <input
                    type="checkbox"
                    v-model="item.apply"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
                <template #cell-remarks="{ item, index }">
                  <input
                    v-if="index === currentGridData2.length - 1"
                    type="text"
                    v-model="item.remarks"
                    class="form-input"
                  />
                  <span v-else>{{ item.remarks }}</span>
                </template>
              </DataTable>

              <div class="btns center">
                <button class="btn btn-save">{{ t("common.save") }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 신규등록 -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t("outflow.registerNew") }}</h3>
          <button class="close-btn" @click="closeModal" aria-label="Close">
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt class="essential">{{ t("outflow.typeNameKo") }}</dt>
            <dd>
              <select
                v-model="selectedOutputType"
                @change="onOutputTypeChange"
                class="form-input"
                required
              >
                <option value="">선택</option>
                <option
                  v-for="code in outflowStore.commonCodes"
                  :key="code.code_id"
                  :value="code.code_key"
                >
                  {{ code.code_value }}
                </option>
              </select>
            </dd>
            <dt class="essential">{{ t("outflow.typeNameEn") }}</dt>
            <dd>
              <input
                type="text"
                v-model="newOutflowTypeNameEn"
                :placeholder="t('placeholder.outflowTypeName')"
                class="form-input"
                readonly
              />
            </dd>
          </dl>
          <dl class="column-regist">
            <dt>{{ t("outflow.symbolColor") }}</dt>
            <dd>
              <div class="color-picker-container">
                <input 
                  type="color" 
                  v-model="selectedColor"
                  class="color-input"
                  @change="updateColor"
                />
                <span class="color-text">{{ selectedColor }}</span>
              </div>
            </dd>
            <dt>{{ t("common.fileUpload") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  :value="uploadForm.file ? uploadForm.file.name : ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                  class="file-name-input"
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileUpload"
                    accept=".3ds,.obj,.fbx,.dae"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
          </dl>
          <dl class="column-regist">
            <dt>{{ t("common.etc") }}</dt>
            <dd>
              <input
                type="text"
                v-model="uploadForm.title"
                class="form-input"
              />
            </dd>
          </dl>

          <div class="modal-content-wrapper">
            <div class="modal-tab-content-metric">
              <div class="section-header">
                <h3>Metric</h3>
              </div>
              <label class="essential">{{ t("outflow.uploadFormula") }}</label>
              <div class="file-upload-row" id="metricFileUpload">
                <input
                  type="text"
                  :value="metricFileName || ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                  class="file-name-input"
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleMetricFileUpload"
                    accept=".py"
                    style="display: none"
                  />
                </label>
              </div>
              <DataTable 
                :columns="gridColumns" 
                :data="metricFileData.length > 0 ? metricFileData : currentGridData"
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template #cell-item="{ item, index }: { item: GridRow, index: number }">
                  <select
                    v-if="item.item === ''"
                    v-model="item.item"
                    @change="onParameterSelect(item.item, index, true, true)"
                    class="form-input"
                  >
                    <option value="">선택</option>
                    <option
                      v-for="param in outflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-display="{ item }: { item: GridRow }">
                  <input
                    type="checkbox"
                    v-model="item.display"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
              </DataTable>

              <div class="action-bar">
                <div class="btns">
                  <button class="btn btn-add">{{ t("outflow.addItem") }}</button>
                </div>
              </div>
            </div>
            
            <div class="modal-tab-content-imperial">
              <div class="section-header">
                <h3>Imperial</h3>
              </div>
              <label class="essential">{{ t("outflow.uploadFormula") }}</label>
              <div class="file-upload-row" id="imperialFileUpload">
                <input
                  type="text"
                  :value="imperialFileName || ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                  class="file-name-input"
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleImperialFileUpload"
                    accept=".py"
                    style="display: none"
                  />
                </label>
              </div>
              <DataTable 
                :columns="gridColumns" 
                :data="imperialFileData.length > 0 ? imperialFileData : currentGridData"
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template #cell-item="{ item, index }: { item: GridRow, index: number }">
                  <select
                    v-if="item.item === ''"
                    v-model="item.item"
                    @change="onParameterSelect(item.item, index, false, true)"
                    class="form-input"
                  >
                    <option value="">선택</option>
                    <option
                      v-for="param in outflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-display="{ item }: { item: GridRow }">
                  <input
                    type="checkbox"
                    v-model="item.display"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
              </DataTable>

              <div class="action-bar">
                <div class="btns">
                  <button class="btn btn-add">{{ t("outflow.addItem") }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeModal">
            {{ t("common.cancel") }}
          </button>
          <button class="btn btn-confirm" @click="createNewTab">
            {{ t("common.register") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useI18n } from "vue-i18n";
import { useOutflowStore } from "@/stores/outflow";

const { t } = useI18n();
const outflowStore = useOutflowStore();

// 공통 로딩 상태
const loading = ref(false);

interface GridRow {
  id: number;
  item: string;
  influent: number;
  unit: string;
  display: "Y" | "N";
  remarks: string;
}

interface TabInfo {
  name: string;
  className: string;
}

interface GridRow2 {
  id: number;
  formula: string;
  uploadDate: string;
  author: string;
  apply: "Y" | "N";
  remarks: string;
}

const tabs = ref<TabInfo[]>([
  { name: "Effluent", className: "tab-type-1" },
  { name: "Sludge", className: "tab-type-2" },
  { name: "Gas", className: "tab-type-3" },
  { name: "Recycle", className: "tab-type-2" },
]);
const activeTab = ref(0);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const tabsContainer = ref<HTMLElement | null>(null);

// 모달 관련 상태
const isModalOpen = ref(false);
const newTabName = ref("");

// 유출 타입 선택
const selectedOutputType = ref("");
const newOutflowTypeNameEn = ref("");

// 색상 선택 관련 상태
const selectedColor = ref("#3b82f6"); // 기본 파란색

// 파일 업로드 관련 상태
const metricFileData = ref<GridRow[]>([]);
const imperialFileData = ref<GridRow[]>([]);
const metricFileName = ref<string>('');
const imperialFileName = ref<string>('');

interface UploadForm {
  title: string;
  category: string;
  file: File | null;
}

const uploadForm = ref<UploadForm>({
  title: "",
  category: "",
  file: null,
});

// 파일 선택 관련 상태
const selectedFiles = ref<{ [key: string]: File }>({});

const gridColumns: TableColumn[] = [
  { key: "id", title: t("columns.outflow.no"), width: "80px" },
  { key: "item", title: t("columns.outflow.item") },
  { key: "influent", title: t("columns.outflow.influent") },
  { key: "unit", title: t("columns.outflow.unit") },
  { key: "display", title: t("columns.outflow.display") },
  { key: "remarks", title: t("columns.outflow.remarks") },
];

const gridData = ref<GridRow[]>([
  {
    id: 1,
    item: "BOD",
    influent: 150.0,
    unit: "mg/L",
    display: "Y",
    remarks: "",
  },
  {
    id: 2,
    item: "COD",
    influent: 250.0,
    unit: "mg/L",
    display: "Y",
    remarks: "",
  },
  {
    id: 3,
    item: "SS",
    influent: 120.0,
    unit: "mg/L",
    display: "N",
    remarks: "측정 불가",
  },
  {
    id: 4,
    item: "T-N",
    influent: 40.0,
    unit: "mg/L",
    display: "Y",
    remarks: "",
  },
  {
    id: 5,
    item: "T-P",
    influent: 4.0,
    unit: "mg/L",
    display: "Y",
    remarks: "",
  },
]);

const gridColumns2: TableColumn[] = [
  { key: "id", title: t("columns.outflow.no"), width: "80px" },
  { key: "formula", title: t("columns.outflow.formula") },
  { key: "uploadDate", title: t("columns.outflow.uploadDate") },
  { key: "author", title: t("columns.outflow.author") },
  { key: "apply", title: t("columns.outflow.apply") },
  { key: "remarks", title: t("columns.outflow.remarks") },
];

const gridData2 = ref<GridRow2[]>([
  {
    id: 1,
    formula: "BOD * 1.2",
    uploadDate: "2023-11-01",
    author: "Admin",
    apply: "Y",
    remarks: "기본 계산식",
  },
  {
    id: 2,
    formula: "COD / 2",
    uploadDate: "2023-11-02",
    author: "User1",
    apply: "N",
    remarks: "",
  },
  {
    id: 3,
    formula: "SS + 10",
    uploadDate: "2023-11-03",
    author: "User2",
    apply: "Y",
    remarks: "조정 계산식",
  },
]);

// 각 탭별 데이터 (Metric/Imperial)
const tabMetricGridData = ref<{ [key: number]: GridRow[] }>({
  0: [
    {
      id: 1,
      item: "BOD",
      influent: 150.0,
      unit: "mg/L",
      display: "Y",
      remarks: "",
    },
    {
      id: 2,
      item: "COD",
      influent: 250.0,
      unit: "mg/L",
      display: "Y",
      remarks: "",
    },
  ],
  1: [
    {
      id: 1,
      item: "TSS",
      influent: 200.0,
      unit: "mg/L",
      display: "Y",
      remarks: "Sludge 데이터",
    },
    { id: 2, item: "pH", influent: 7.5, unit: "-", display: "N", remarks: "" },
  ],
  2: [
    {
      id: 1,
      item: "CH4",
      influent: 65.0,
      unit: "%",
      display: "Y",
      remarks: "Gas 데이터",
    },
    {
      id: 2,
      item: "CO2",
      influent: 30.0,
      unit: "%",
      display: "Y",
      remarks: "",
    },
  ],
  3: [
    {
      id: 1,
      item: "BOD",
      influent: 20.0,
      unit: "mg/L",
      display: "Y",
      remarks: "Recycle 데이터",
    },
    {
      id: 2,
      item: "COD",
      influent: 40.0,
      unit: "mg/L",
      display: "N",
      remarks: "",
    },
  ],
});

const tabImperialGridData = ref<{ [key: number]: GridRow[] }>({
  0: [
    {
      id: 1,
      item: "BOD",
      influent: 150.0,
      unit: "ppm",
      display: "Y",
      remarks: "",
    },
    {
      id: 2,
      item: "COD",
      influent: 250.0,
      unit: "ppm",
      display: "Y",
      remarks: "",
    },
  ],
  1: [
    {
      id: 1,
      item: "TSS",
      influent: 200.0,
      unit: "ppm",
      display: "Y",
      remarks: "Sludge 데이터",
    },
    { id: 2, item: "pH", influent: 7.5, unit: "-", display: "N", remarks: "" },
  ],
  2: [
    {
      id: 1,
      item: "CH4",
      influent: 65.0,
      unit: "%",
      display: "Y",
      remarks: "Gas 데이터",
    },
    {
      id: 2,
      item: "CO2",
      influent: 30.0,
      unit: "%",
      display: "Y",
      remarks: "",
    },
  ],
  3: [
    {
      id: 1,
      item: "BOD",
      influent: 20.0,
      unit: "ppm",
      display: "Y",
      remarks: "Recycle 데이터",
    },
    {
      id: 2,
      item: "COD",
      influent: 40.0,
      unit: "ppm",
      display: "N",
      remarks: "",
    },
  ],
});

const tabGridData2 = ref<{ [key: number]: GridRow2[] }>({
  0: [
    {
      id: 1,
      formula: "BOD * 1.2",
      uploadDate: "2023-11-01",
      author: "Admin",
      apply: "Y",
      remarks: "Effluent 계산식",
    },
    {
      id: 2,
      formula: "COD / 2",
      uploadDate: "2023-11-02",
      author: "User1",
      apply: "N",
      remarks: "",
    },
  ],
  1: [
    {
      id: 1,
      formula: "TSS * 0.8",
      uploadDate: "2023-11-03",
      author: "Admin",
      apply: "Y",
      remarks: "Sludge 계산식",
    },
  ],
  2: [
    {
      id: 1,
      formula: "CH4 * 1.1",
      uploadDate: "2023-11-04",
      author: "User2",
      apply: "Y",
      remarks: "Gas 계산식",
    },
  ],
  3: [
    {
      id: 1,
      formula: "BOD / 5",
      uploadDate: "2023-11-05",
      author: "Admin",
      apply: "N",
      remarks: "Recycle 계산식",
    },
  ],
});

// 현재 활성 탭에 따른 데이터 반환
const currentGridData = computed(() => {
  return tabMetricGridData.value[activeTab.value] || [];
});

const currentMetricGridData = computed(() => {
  return tabMetricGridData.value[activeTab.value] || [];
});

const currentImperialGridData = computed(() => {
  return tabImperialGridData.value[activeTab.value] || [];
});

const currentGridData2 = computed(() => {
  return tabGridData2.value[activeTab.value] || [];
});

// 모달 관련 함수
const openModal = () => {
  isModalOpen.value = true;
  newTabName.value = "";
};

const closeModal = () => {
  isModalOpen.value = false;
};

const createNewTab = () => {
  if (!newTabName.value.trim()) {
    alert(t("messages.warning.pleaseEnterTabName"));
    return;
  }
  const newIndex = tabs.value.length;
  tabs.value.push({
    name: newTabName.value.trim(),
    className: `tab-type-${(newIndex % 3) + 1}`,
  });

  // 새 탭을 위한 빈 데이터 배열 추가
  tabMetricGridData.value[newIndex] = [];
  tabImperialGridData.value[newIndex] = [];
  tabGridData2.value[newIndex] = [];

  closeModal();

  nextTick(() => {
    activeTab.value = newIndex;
    updateScrollButtons();
    if (tabsContainer.value) {
      tabsContainer.value.scrollTo({
        left: tabsContainer.value.scrollWidth,
        behavior: "smooth",
      });
    }
  });
};

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

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    uploadForm.value.file = target.files[0];
  }
};

const handleMetricFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    metricFileName.value = target.files[0].name;
    // 파일 처리 로직 추가
  }
};

const handleImperialFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    imperialFileName.value = target.files[0].name;
    // 파일 처리 로직 추가
  }
};

// 색상 업데이트
const updateColor = () => {
  // 색상 변경 처리 로직
};

// 유출 타입 변경 핸들러
const onOutputTypeChange = () => {
  if (selectedOutputType.value) {
    // 영어명 자동 설정
    const typeMap: { [key: string]: string } = {
      "EFFLUENT": "Effluent",
      "SLUDGE": "Sludge", 
      "GAS": "Gas",
      "RECYCLE": "Recycle"
    };
    newOutflowTypeNameEn.value = typeMap[selectedOutputType.value] || "";
  }
};

// 파라미터 선택 핸들러
const onParameterSelect = (parameterCode: string, index: number, isMetric: boolean, isModal: boolean) => {
  // 파라미터 선택 처리 로직
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

onMounted(async () => {
  updateScrollButtons();
  
  // outflow store 초기화
  try {
    await outflowStore.fetchWaterFlowTypes();
    await outflowStore.fetchWaterQualityParameters();
  } catch (error) {
    console.error("Failed to initialize outflow store:", error);
  }
});
</script>

<style scoped lang="scss">
@use "sass:color";

.outflow {
  padding: $spacing-xl;

  .page-content {
    h2 {
      margin-bottom: $spacing-lg;
      color: $text-color;
    }

    p {
      color: $text-light;
    }
  }
}

/* Content Wrapper */
.content-wrapper {
  display: flex;
  gap: $spacing-lg;
  min-height: 600px;

  .tab-content-metric,
  .tab-content-imperial {
    flex: 1;
    background: white;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    padding: $spacing-lg;

    .section-header {
      margin-bottom: $spacing-lg;
      padding-bottom: $spacing-sm;
      border-bottom: 2px solid $primary-color;

      h3 {
        margin: 0;
        color: $primary-color;
        font-size: $font-size-lg;
        font-weight: $font-weight-bold;
      }
    }

    .content {
      min-height: 500px;
    }
  }
}

/* Tab Action Bar */
.tab-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;
  padding: $spacing-md 0;
}

.swiper-bar {
  display: flex;
  align-items: center;
  flex: 1;
}

.tabs-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  max-width: 70%;
}

.tabs {
  display: flex;
  gap: $spacing-sm;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0 $spacing-sm;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab {
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-md;
  cursor: pointer;
  border: none;
  background: white;
  color: $text-light;
  border-radius: $border-radius-sm;
  transition: all 0.2s;
  white-space: nowrap;
  border: 1px solid $border-color;

  &:hover {
    background: color.adjust($primary-color, $lightness: 45%);
    color: $primary-color;
  }

  &.active {
    background: $primary-color;
    color: white;
    font-weight: $font-weight-bold;
  }

  &.tab-type-1 {
    &.active {
      background: #e74c3c;
    }
  }

  &.tab-type-2 {
    &.active {
      background: #f39c12;
    }
  }

  &.tab-type-3 {
    &.active {
      background: #27ae60;
    }
  }
}

.btn-scroll {
  background: white;
  border: 1px solid $border-color;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 $spacing-xs;
  color: $text-light;

  &:hover {
    background: color.adjust($primary-color, $lightness: 45%);
    color: $primary-color;
  }

  &.left {
    margin-right: $spacing-sm;
  }

  &.right {
    margin-left: $spacing-sm;
  }
}

.tab-buttons {
  display: flex;
  gap: $spacing-sm;
}

/* Action Bar */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: $spacing-lg 0;

  .title h4 {
    margin: 0;
    color: $text-color;
    font-size: $font-size-md;
  }

  .btns {
    display: flex;
    gap: $spacing-sm;
  }

  &.center {
    justify-content: center;
    margin-top: $spacing-xl;
  }
}

/* Button Styles */
.btn {
  padding: $spacing-sm $spacing-lg;
  border-radius: $border-radius-sm;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: $font-size-sm;
  transition: all 0.2s;

  &.btn-create {
    background-color: $primary-color;
    color: white;

    &:hover {
      background-color: color.adjust($primary-color, $lightness: -10%);
    }
  }

  &.btn-add {
    background-color: #28a745;
    color: white;

    &:hover {
      background-color: color.adjust(#28a745, $lightness: -10%);
    }
  }

  &.btn-save {
    background-color: $primary-color;
    color: white;
    padding: $spacing-md $spacing-xl;

    &:hover {
      background-color: color.adjust($primary-color, $lightness: -10%);
    }
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: $spacing-lg;
  border-radius: $border-radius-md;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-color;
  padding-bottom: $spacing-md;
  margin-bottom: $spacing-lg;

  h3 {
    margin: 0;
    font-size: $font-size-lg;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: $text-light;
    &:hover {
      color: $text-color;
    }
  }
}

.modal-body {
  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    label {
      font-weight: $font-weight-bold;
    }

    .form-input {
      padding: $spacing-sm;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
    }
  }
}

.modal-content-wrapper {
  display: flex;
  gap: $spacing-lg;
  margin-top: $spacing-lg;

  .modal-tab-content-metric,
  .modal-tab-content-imperial {
    flex: 1;
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    padding: $spacing-md;

    .section-header {
      margin-bottom: $spacing-md;
      padding-bottom: $spacing-xs;
      border-bottom: 1px solid $border-color;

      h3 {
        margin: 0;
        font-size: $font-size-md;
        color: $primary-color;
      }
    }

    label {
      display: block;
      margin-bottom: $spacing-xs;
      font-weight: $font-weight-bold;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  margin-top: $spacing-xl;
  padding-top: $spacing-lg;
  border-top: 1px solid $border-color;

  .btn {
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-sm;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .btn-cancel {
    background-color: #fff;
    border-color: $border-color;
    color: $text-color;

    &:hover {
      background-color: #f8f9fa;
    }
  }

  .btn-confirm {
    background-color: $primary-color;
    color: white;

    &:hover {
      background-color: color.adjust($primary-color, $lightness: -10%);
    }
  }
}

/* Form Elements */
.column-regist {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: $spacing-md;
  align-items: center;
  margin-bottom: $spacing-lg;

  dt {
    font-weight: $font-weight-bold;
    color: $text-color;

    &.essential::after {
      content: " *";
      color: red;
    }
  }

  dd {
    margin: 0;
  }
}

.form-input {
  width: 100%;
  padding: $spacing-sm;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.file-upload-row {
  display: flex;
  gap: $spacing-sm;
  align-items: center;

  .file-name-input {
    flex: 1;
    padding: $spacing-sm;
    border: 1px solid $border-color;
    border-radius: $border-radius-sm;
    background-color: #f8f9fa;
  }

  .file-select-btn {
    background: $primary-color;
    color: white;
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-sm;
    cursor: pointer;
    border: none;
    white-space: nowrap;

    &:hover {
      background: color.adjust($primary-color, $lightness: -10%);
    }
  }
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .color-input {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: $border-radius-sm;
    cursor: pointer;
  }

  .color-text {
    font-family: monospace;
    color: $text-light;
  }
}
</style>
