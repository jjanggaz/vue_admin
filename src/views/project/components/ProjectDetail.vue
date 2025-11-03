<template>
  <div
    class="modal-overlay"
    @click="onClose"
    style="
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background-color: rgba(0, 0, 0, 0.5) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 9999 !important;
      width: 100vw !important;
      height: 100vh !important;
    "
  >
    <div
      class="modal-content"
      @click.stop
      style="
        background: white !important;
        border-radius: 8px !important;
        width: 90% !important;
        max-width: 1200px !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
        position: relative !important;
        z-index: 10000 !important;
      "
    >
      <div class="modal-header">
        <h3>{{ t("projectDetail.title") }}</h3>
        <button class="modal-close" @click="onClose" aria-label="Close">
          ×
        </button>
      </div>

      <div class="modal-body">
        <!-- 상단 정보 -->
        <div class="project-header">
          <div class="title-area">
            <span class="project-id"
              >{{ t("projectDetail.labels.projectName") }}:
              {{ projectData?.project_name }}</span
            >
          </div>
          <button class="btn-export">{{ t("projectDetail.export") }}</button>
        </div>

        <div class="project-info-table">
          <DataTable :columns="projectInfoColumns" :data="projectInfoRows" />
        </div>

        <!-- 탭 -->
        <div class="tabs-wrapper">
          <div
            v-for="(tab, idx) in tabs"
            :key="tab"
            :class="['tab', { active: activeTab === idx }]"
            @click="activeTab = idx"
          >
            {{ t(`projectDetail.tabs.${tab}`) }}
          </div>
        </div>

        <!-- 탭별 내용 -->
        <div class="tab-content">
          <div v-if="activeTab === 0">
            <DataTable :columns="basicColumns" :data="basicRows" />
          </div>
          <div v-else-if="activeTab === 1">
            <div class="process-info-section">
              <div class="process-info-row">
                <div class="info-label">
                  {{ t("projectDetail.labels.type") }}
                </div>
                <div class="info-value">
                  {{ t("projectDetail.labels.basic") }}
                </div>
                <div class="info-label">
                  {{ t("projectDetail.labels.waterInfo") }}
                </div>
                <div class="info-table-wrap">
                  <DataTable
                    :columns="processWaterColumns"
                    :data="processWaterRows"
                  />
                </div>
              </div>
              <div class="process-info-row">
                <div class="info-label">
                  {{ t("projectDetail.labels.processType") }}
                </div>
                <div class="info-value">
                  <select>
                    <option>
                      {{ t("projectDetail.labels.basicProcess") }}
                    </option>
                  </select>
                </div>
                <div class="info-label">
                  {{ t("projectDetail.labels.processName") }}
                </div>
                <div class="info-value">
                  <input
                    type="text"
                    :placeholder="t('projectDetail.labels.basicProcessName')"
                    style="width: 180px"
                  />
                </div>
                <div class="info-label">
                  {{ t("projectDetail.labels.structure") }}
                </div>
                <div class="info-value">
                  <select>
                    <option>
                      {{ t("projectDetail.labels.basicStructure") }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="structure-tabs">
              <button
                v-for="(tab, idx) in structureTabs"
                :key="tab"
                :class="[
                  'structure-tab',
                  { active: structureActiveTab === idx },
                ]"
                @click="structureActiveTab = idx"
              >
                {{ t(`projectDetail.structureTabs.${tab}`) }}
              </button>
            </div>
            <div class="structure-table-wrap">
              <div class="structure-title">
                {{ t("projectDetail.labels.structure") }}
              </div>
              <DataTable :columns="structureColumns" :data="structureRows" />
            </div>
            <div class="structure-title">
              {{ t("projectDetail.labels.equipment") }}
            </div>
            <DataTable :columns="deviceColumns" :data="deviceRows" />
            <div class="row-tables">
              <div class="row-table-block">
                <div class="structure-title">
                  {{ t("projectDetail.labels.waterInfo") }}
                </div>
                <DataTable :columns="waterInfoColumns" :data="waterInfoRows" />
              </div>
              <div class="row-table-block">
                <div class="structure-title">
                  {{ t("projectDetail.labels.designCondition") }}
                </div>
                <DataTable :columns="waterInfoColumns" :data="waterInfoRows" />
              </div>
            </div>
          </div>
          <div v-else-if="activeTab === 2">
            <div class="layout3d-info-section">
              <div class="layout3d-info-row">
                <div class="info-label">
                  {{ t("projectDetail.labels.processType") }}
                </div>
                <div class="info-value">
                  <select>
                    <option>
                      {{ t("projectDetail.labels.basicProcess") }}
                    </option>
                  </select>
                </div>
                <div class="info-label">
                  {{ t("projectDetail.labels.processName") }}
                </div>
                <div class="info-value">
                  <input
                    type="text"
                    :placeholder="t('projectDetail.labels.basicProcessName')"
                    style="width: 180px"
                  />
                </div>
                <div class="info-label">
                  {{ t("projectDetail.labels.structure") }}
                </div>
                <div class="info-value">
                  <select>
                    <option>
                      {{ t("projectDetail.labels.basicStructure") }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="layout3d-structure-tabs">
              <button
                v-for="(tab, idx) in layout3dTabs"
                :key="tab"
                :class="[
                  'layout3d-structure-tab',
                  { active: layout3dActiveTab === idx },
                ]"
                @click="handleLayout3dTabChange(idx)"
              >
                {{ t(`projectDetail.layout3dTabs.${tab}`) }}
              </button>
            </div>
            <div class="layout3d-table-wrap">
              <DataTable
                :columns="layout3dColumns"
                :data="paginatedLayout3dList"
              />
            </div>
            <div class="layout3d-pagination">
              <Pagination
                :totalPages="layout3dTotalPages"
                :currentPage="layout3dCurrentPage"
                @pageChange="handleLayout3dPageChange"
              />
            </div>
          </div>
          <div v-else-if="activeTab === 3">
            <!-- 산출물 탭 -->
            <div class="output-subtabs">
              <button
                v-for="(tab, idx) in outputTabs"
                :key="tab"
                :class="['output-subtab', { active: outputActiveTab === idx }]"
                @click="handleOutputTabChange(idx)"
              >
                {{ t(`projectDetail.outputTabs.${tab}`) }}
              </button>
            </div>
            <div class="output-file-list">
              <div
                v-for="item in paginatedOutputList"
                :key="item.id"
                class="output-file-card"
              >
                <div class="file-title">{{ item.title }}</div>
                <div class="file-meta">
                  {{ item.type }} &nbsp; {{ item.size }} &nbsp; {{ item.date }}
                </div>
                <div class="file-actions">
                  <button
                    class="btn-icon"
                    :title="t('projectDetail.labels.download')"
                  >
                    <span>⬇️</span>
                  </button>
                  <button
                    class="btn-icon"
                    :title="t('projectDetail.labels.more')"
                  >
                    <span>⋯</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="output-pagination">
              <Pagination
                :totalPages="outputTotalPages"
                :currentPage="outputCurrentPage"
                @pageChange="handleOutputPageChange"
              />
            </div>
          </div>
          <div v-else-if="activeTab === 4">
            <!-- 설계조건 탭 -->
            <div class="designcond-btns">
              <button
                class="btn-designcond"
                :class="{ active: designcondActiveTab === 0 }"
                @click="handleDesigncondTabChange(0)"
              >
                {{ t("projectDetail.labels.hydraulicCondition") }}
              </button>
              <button
                class="btn-designcond"
                :class="{ active: designcondActiveTab === 1 }"
                @click="handleDesigncondTabChange(1)"
              >
                {{ t("projectDetail.labels.concreteStructure") }}
              </button>
            </div>
            <div class="designcond-table-wrap">
              <DataTable
                :columns="
                  designcondActiveTab === 0
                    ? designcondHydroColumns
                    : designcondConcreteColumns
                "
                :data="
                  designcondActiveTab === 0
                    ? paginatedDesigncondList
                    : paginatedDesigncondList
                "
              />
            </div>
            <div class="designcond-pagination">
              <Pagination
                :totalPages="designcondTotalPages"
                :currentPage="designcondCurrentPage"
                @pageChange="handleDesigncondPageChange"
              />
            </div>
          </div>
          <div v-else>
            <div class="empty-tab">{{ t("placeholder.noData") }}</div>
          </div>
        </div>

        <!-- 하단 닫기 버튼 -->
        <div class="modal-footer">
          <button class="btn-close-bottom" @click="onClose">
            {{ t("common.close") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { useI18n } from "vue-i18n";

interface Props {
  projectData?: {
    project_id: string;
    project_name: string;
    start_date: string;
    end_date: string;
    is_active: boolean | null;
    owner_id: string;
    project_status: string;
    description: string | null;
    created_at: string;
    project_code: string;
    version_id: string;
    created_by: string | null;
    client_id: string;
    unit_system: string;
    country_code: string;
    language_code: string;
    updated_at: string | null;
    business_type: string;
    orderer: string;
    site_id: string;
    updated_by: string;
    client: {
      contact_person: string;
      location: string | null;
      phone_number: string;
      client_type: string | null;
      client_name: string;
      client_id: string;
      email: string;
    };
    site: {
      site_name: string;
      site_address: string;
      capacity_unit: string;
      site_id: string;
      site_capacity: number;
    };
  } | null;
}

interface Emits {
  (e: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();

// 모달 닫기
const onClose = () => {
  emit("close");
};

// 프로젝트 ID는 props로 받음
const tabs = [
  "basicInfo",
  "processInfo",
  "layout3dInfo",
  "output",
  "designCondition",
];
const activeTab = ref(0);
const structureTabs = ["structure1", "structure2", "structure3", "structure4"];
const structureActiveTab = ref(0);
const layout3dTabs = ["structure", "equipment", "piping", "standardLayout"];
const layout3dActiveTab = ref(0);
const outputTabs = ["calculation", "specification", "drawing"];
const outputActiveTab = ref(0);
const designcondActiveTab = ref(1); // 0: 수리 조건, 1: 콘크리트 구조물 설정

// 페이징 상태 관리
const pageSize = ref(20);

// 3D 레이아웃 정보 탭 - 하위 탭 페이징
const layout3dCurrentPage = ref(1);
const layout3dDataList = ref<
  Record<
    number,
    Array<{
      id: number;
      no: number;
      structure: string;
      device: string;
      type: string;
      model: string;
      feature: string;
    }>
  >
>({
  0: Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    no: i + 1,
    structure: `${t("projectDetail.labels.structure")}${i + 1}`,
    device: `${t("projectDetail.labels.equipment")}${i + 1}`,
    type: `타입${i + 1}`,
    model: `모델${i + 1}`,
    feature: `특성${i + 1}`,
  })),
  1: Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    no: i + 1,
    structure: `${t("projectDetail.labels.equipment")}${t(
      "projectDetail.labels.structure"
    )}${i + 1}`,
    device: `${t("projectDetail.labels.equipment")}명${i + 1}`,
    type: `${t("projectDetail.labels.equipment")}타입${i + 1}`,
    model: `${t("projectDetail.labels.equipment")}모델${i + 1}`,
    feature: `${t("projectDetail.labels.equipment")}특성${i + 1}`,
  })),
  2: Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    no: i + 1,
    structure: `배관${t("projectDetail.labels.structure")}${i + 1}`,
    device: `배관${i + 1}`,
    type: `배관타입${i + 1}`,
    model: `배관모델${i + 1}`,
    feature: `배관특성${i + 1}`,
  })),
  3: Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    no: i + 1,
    structure: `표준${t("projectDetail.labels.structure")}${i + 1}`,
    device: `표준배치${i + 1}`,
    type: `표준타입${i + 1}`,
    model: `표준모델${i + 1}`,
    feature: `표준특성${i + 1}`,
  })),
});

const layout3dTotalPages = computed(() => {
  const currentList = layout3dDataList.value[layout3dActiveTab.value];
  return Math.ceil(currentList.length / pageSize.value) || 1;
});

const paginatedLayout3dList = computed(() => {
  const currentList = layout3dDataList.value[layout3dActiveTab.value];
  const start = (layout3dCurrentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return currentList.slice(start, end);
});

const handleLayout3dPageChange = (page: number) => {
  layout3dCurrentPage.value = page;
};

const handleLayout3dTabChange = (tab: number) => {
  layout3dActiveTab.value = tab;
  layout3dCurrentPage.value = 1;
};

// 산출물 탭 - 하위 탭별 페이징
const outputCurrentPage = ref(1);
const outputDataList = ref<
  Record<
    number,
    Array<{
      id: number;
      title: string;
      type: string;
      size: string;
      date: string;
    }>
  >
>({
  0: Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    title: `${t("projectDetail.outputTabs.calculation")} ${i + 1}`,
    type: "PFD",
    size: "8.5MB",
    date: "2025.05.20",
  })),
  1: Array.from({ length: 22 }, (_, i) => ({
    id: i + 1,
    title: `${t("projectDetail.outputTabs.specification")} ${i + 1}`,
    type: "EXCEL",
    size: "2.1MB",
    date: "2025.05.19",
  })),
  2: Array.from({ length: 35 }, (_, i) => ({
    id: i + 1,
    title: `${t("projectDetail.outputTabs.drawing")} ${i + 1}`,
    type: "DWG",
    size: "15.2MB",
    date: "2025.05.18",
  })),
});

const outputTotalPages = computed(() => {
  const currentList = outputDataList.value[outputActiveTab.value];
  return Math.ceil(currentList.length / pageSize.value) || 1;
});

const paginatedOutputList = computed(() => {
  const currentList = outputDataList.value[outputActiveTab.value];
  const start = (outputCurrentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return currentList.slice(start, end);
});

const handleOutputPageChange = (page: number) => {
  outputCurrentPage.value = page;
};

const handleOutputTabChange = (tab: number) => {
  outputActiveTab.value = tab;
  outputCurrentPage.value = 1;
};

// 설계조건 탭 페이징
const designcondCurrentPage = ref(1);
const designcondHydroList = ref(
  Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    col1: `${t("projectDetail.labels.hydraulicItem")} ${i + 1}`,
    col2: `${100 + i * 10}`,
    col3: `${200 + i * 10}`,
    col4: "m³/h",
  }))
);
const designcondConcreteList = ref(
  Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    col1: `${t("projectDetail.labels.structureItem")} ${i + 1}`,
    col2: `${20 + i * 2}`,
    col3: `${10 + i}`,
    col4: `${5 + i}`,
  }))
);

const designcondTotalPages = computed(() => {
  const currentList =
    designcondActiveTab.value === 0
      ? designcondHydroList.value
      : designcondConcreteList.value;
  return Math.ceil(currentList.length / pageSize.value) || 1;
});

const paginatedDesigncondList = computed(() => {
  const currentList =
    designcondActiveTab.value === 0
      ? designcondHydroList.value
      : designcondConcreteList.value;
  const start = (designcondCurrentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return currentList.slice(start, end);
});

const handleDesigncondPageChange = (page: number) => {
  designcondCurrentPage.value = page;
};

// 설계조건 탭 변경 시 페이지 초기화
const handleDesigncondTabChange = (tab: number) => {
  designcondActiveTab.value = tab;
  designcondCurrentPage.value = 1;
};

// 기본 정보
const basicColumns: TableColumn[] = [
  { key: "project", title: t("columns.projectDetail.project") },
  { key: "title1", title: t("columns.projectDetail.title") },
  { key: "content1", title: t("columns.projectDetail.content") },
  { key: "title2", title: t("columns.projectDetail.title") },
  { key: "content2", title: t("columns.projectDetail.content") },
  { key: "title3", title: t("columns.projectDetail.title") },
  { key: "content3", title: t("columns.projectDetail.content") },
];
const basicRows = [
  {
    project: "###프로젝트",
    title1: t("columns.projectDetail.title"),
    content1: t("columns.projectDetail.content"),
    title2: t("columns.projectDetail.title"),
    content2: t("columns.projectDetail.content"),
    title3: t("columns.projectDetail.title"),
    content3: t("columns.projectDetail.content"),
  },
  {
    project: t("columns.projectDetail.title"),
    title1: t("columns.projectDetail.content"),
    content1: t("columns.projectDetail.title"),
    title2: t("columns.projectDetail.content"),
    content2: t("columns.projectDetail.title"),
    title3: t("columns.projectDetail.content"),
    content3: "",
  },
  {
    project: t("columns.projectDetail.title"),
    title1: t("columns.projectDetail.content"),
    content1: t("columns.projectDetail.title"),
    title2: t("columns.projectDetail.content"),
    content2: t("columns.projectDetail.title"),
    title3: t("columns.projectDetail.content"),
    content3: "",
  },
];
// 프로세스 정보 - 수질정보
const processWaterColumns: TableColumn[] = [
  { key: "item", title: t("columns.projectDetail.item") },
  { key: "influent", title: t("columns.projectDetail.influent") },
  { key: "unit", title: t("columns.projectDetail.unit") },
  { key: "remark", title: t("columns.projectDetail.remark") },
];
const processWaterRows = [
  { item: "text", influent: "text", unit: "text", remark: "text" },
  { item: "text", influent: "text", unit: "text", remark: "text" },
];
// 프로세스 정보 - 구조물
const structureColumns: TableColumn[] = [
  { key: "col1", title: t("columns.projectDetail.structure") },
  { key: "col2", title: "" },
  { key: "col3", title: "" },
  { key: "col4", title: "" },
];
const structureRows = [
  { col1: "text", col2: "text", col3: "text", col4: "text" },
  { col1: "text", col2: "text", col3: "text", col4: "text" },
];
// 프로세스 정보 - 기기
const deviceColumns: TableColumn[] = [
  { key: "col1", title: "" },
  { key: "col2", title: "" },
  { key: "col3", title: "" },
  { key: "col4", title: "" },
  { key: "col5", title: "" },
  { key: "col6", title: "" },
  { key: "col7", title: "" },
  { key: "col8", title: "" },
];
const deviceRows = [
  {
    col1: "text",
    col2: "text",
    col3: "text",
    col4: "text",
    col5: "text",
    col6: "text",
    col7: "text",
    col8: "text",
  },
  {
    col1: "text",
    col2: "text",
    col3: "text",
    col4: "text",
    col5: "text",
    col6: "text",
    col7: "text",
    col8: "text",
  },
];
// 프로세스 정보 - 수질정보/설계조건
const waterInfoColumns: TableColumn[] = [
  { key: "col1", title: "" },
  { key: "col2", title: "" },
  { key: "col3", title: "" },
  { key: "col4", title: "" },
  { key: "col5", title: "" },
];
const waterInfoRows = [
  { col1: "text", col2: "text", col3: "text", col4: "text", col5: "text" },
  { col1: "text", col2: "text", col3: "text", col4: "text", col5: "text" },
];
// 3D 레이아웃 정보
const layout3dColumns: TableColumn[] = [
  { key: "no", title: t("columns.projectDetail.no") },
  { key: "structure", title: t("columns.projectDetail.structure") },
  { key: "device", title: t("columns.projectDetail.deviceName") },
  { key: "type", title: t("columns.projectDetail.deviceType") },
  { key: "model", title: t("columns.projectDetail.model3d") },
  { key: "feature", title: t("columns.projectDetail.modelFeature") },
];

// 산출물, 설계조건 등은 카드/커스텀 UI이므로 table 변환 제외

const projectInfoColumns: TableColumn[] = [
  { key: "start_date", title: t("columns.projectDetail.projectPeriod") },
  { key: "contact_person", title: t("columns.projectDetail.projectManager") },
  { key: "site_name", title: t("columns.projectDetail.influentType") },
  {
    key: "capacity_unit",
    title: t("columns.projectDetail.facilityCapacity"),
  },
];
const projectInfoRows = computed(() => [
  {
    start_date:
      props.projectData?.start_date && props.projectData?.end_date
        ? `${props.projectData.start_date} ~ ${props.projectData.end_date}`
        : "",
    contact_person: props.projectData?.client?.contact_person || "",
    site_name: props.projectData?.site?.site_name || "",
    capacity_unit:
      props.projectData?.site?.site_capacity !== undefined &&
      props.projectData?.site?.capacity_unit
        ? `${props.projectData.site.site_capacity}${props.projectData.site.capacity_unit}`
        : "",
  },
]);

const designcondHydroColumns: TableColumn[] = [
  { key: "col1", title: t("columns.projectDetail.item") },
  { key: "col2", title: t("columns.projectDetail.value1") },
  { key: "col3", title: t("columns.projectDetail.value2") },
  { key: "col4", title: t("columns.projectDetail.unit") },
];
const designcondConcreteColumns: TableColumn[] = [
  { key: "col1", title: t("columns.projectDetail.structureName") },
  { key: "col2", title: t("columns.projectDetail.length") },
  { key: "col3", title: t("columns.projectDetail.width") },
  { key: "col4", title: t("columns.projectDetail.height") },
];
</script>

<style scoped lang="scss">
// Modal 스타일 (Revit.vue와 동일)
.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999 !important;
  width: 100vw !important;
  height: 100vh !important;
}

.modal-content {
  background: white !important;
  border-radius: 8px !important;
  width: 90% !important;
  max-width: 1200px !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
  position: relative !important;
  z-index: 10000 !important;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;

  h3 {
    margin: 0;
    color: #333;
    font-size: 1.25rem;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
}

.modal-body {
  padding: 0rem 1.5rem 1.5rem 1.5rem;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.title-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.project-id {
  font-size: 1rem;
  color: #888;
  margin-top: 0.25rem;
}

.btn-export {
  background: #3a3d4b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  font-size: 1rem;
  cursor: pointer;
}

.project-info-table {
  margin-bottom: 1.5rem;
}

.tabs-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #222;
}

.tab {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  border: none;
  background: none;
  color: #222;
  border-bottom: 2px solid transparent;
  transition: border 0.2s, color 0.2s;
}

.tab.active {
  color: #1a73e8;
  border-bottom: 2px solid #1a73e8;
  font-weight: bold;
}

.tab-content {
  margin-top: 1.5rem;
}

.empty-tab {
  padding: 2rem;
  color: #888;
  text-align: center;
}

.process-info-section {
  margin-bottom: 1.5rem;
}

.process-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.info-label {
  font-weight: bold;
  margin-right: 0.5rem;
  min-width: 80px;
}

.info-value {
  margin-right: 2rem;
}

.info-table-wrap {
  flex: 1;
}

.structure-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.structure-tab {
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  border: none;
  background: #eee;
  color: #222;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.structure-tab.active {
  background: #1a73e8;
  color: #fff;
}

.structure-table-wrap {
  margin-bottom: 1.5rem;
}

.structure-title {
  font-weight: bold;
  margin: 1.2rem 0 0.5rem 0;
  font-size: 1.1rem;
}

.row-tables {
  display: flex;
  gap: 2rem;
  margin-top: 1.5rem;
}

.row-table-block {
  flex: 1;
}

.layout3d-info-section {
  margin-bottom: 1.5rem;
}

.layout3d-info-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.layout3d-structure-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.layout3d-structure-tab {
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  border: none;
  background: #eee;
  color: #222;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.layout3d-structure-tab.active {
  background: #1a73e8;
  color: #fff;
}

.layout3d-table-wrap {
  margin-bottom: 1.5rem;
}

.layout3d-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
}

.output-subtabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.output-subtab {
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  border: none;
  background: #eee;
  color: #222;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.output-subtab.active {
  background: #1a73e8;
  color: #fff;
}

.output-file-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.output-file-card {
  border: 1px solid #bbb;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.file-title {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.file-meta {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-icon {
  background: #f7f7f7;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s, border 0.2s;
}

.btn-icon:hover {
  background: #e3eaff;
  border: 1px solid #1a73e8;
}

.output-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
}

.designcond-btns {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.btn-designcond {
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  border: none;
  background: #eee;
  color: #222;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-designcond.active {
  background: #1a73e8;
  color: #fff;
}

.btn-designcond:disabled {
  background: #f7f7f7;
  color: #bbb;
  cursor: not-allowed;
}

.designcond-table-wrap {
  margin-bottom: 2rem;
}

.designcond-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
}

// 하단 닫기 버튼 스타일
.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 1rem 0 0 0;
  border-top: 1px solid #dee2e6;
  margin-top: 1.5rem;
}

.btn-close-bottom {
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 80px;

  &:hover {
    background: #5a6268;
  }
}
</style>
