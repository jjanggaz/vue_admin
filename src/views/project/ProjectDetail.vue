<template>
  <div class="project-detail-page">
    <!-- 상단 정보 -->
    <div class="project-header">
      <div class="title-area">
        <h1>하수처리장 설계 2025</h1>
        <span class="project-id">프로젝트 ID. PRJ-2025-0620-001</span>
      </div>
      <button class="btn-export">내보내기</button>
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
        {{ tab }}
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
            <div class="info-label">유입종류</div>
            <div class="info-value">음식물쓰레기</div>
            <div class="info-label">수질정보</div>
            <div class="info-table-wrap">
              <DataTable
                :columns="processWaterColumns"
                :data="processWaterRows"
              />
            </div>
          </div>
          <div class="process-info-row">
            <div class="info-label">공정구분</div>
            <div class="info-value">
              <select>
                <option>전처리</option>
              </select>
            </div>
            <div class="info-label">공정명</div>
            <div class="info-value">
              <input
                type="text"
                value="종합 협잡물 제거"
                style="width: 180px"
              />
            </div>
            <div class="info-label">구조물</div>
            <div class="info-value">
              <select>
                <option>PN 조</option>
              </select>
            </div>
          </div>
        </div>
        <div class="structure-tabs">
          <button
            v-for="(tab, idx) in structureTabs"
            :key="tab"
            :class="['structure-tab', { active: structureActiveTab === idx }]"
            @click="structureActiveTab = idx"
          >
            {{ tab }}
          </button>
        </div>
        <div class="structure-table-wrap">
          <div class="structure-title">Structure</div>
          <DataTable :columns="structureColumns" :data="structureRows" />
        </div>
        <div class="structure-title">기기</div>
        <DataTable :columns="deviceColumns" :data="deviceRows" />
        <div class="row-tables">
          <div class="row-table-block">
            <div class="structure-title">수질정보</div>
            <DataTable :columns="waterInfoColumns" :data="waterInfoRows" />
          </div>
          <div class="row-table-block">
            <div class="structure-title">설계조건</div>
            <DataTable :columns="waterInfoColumns" :data="waterInfoRows" />
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 2">
        <div class="layout3d-info-section">
          <div class="layout3d-info-row">
            <div class="info-label">공정구분</div>
            <div class="info-value">
              <select>
                <option>전처리</option>
              </select>
            </div>
            <div class="info-label">공정명</div>
            <div class="info-value">
              <input
                type="text"
                value="종합 협잡물 제거"
                style="width: 180px"
              />
            </div>
            <div class="info-label">구조물</div>
            <div class="info-value">
              <select>
                <option>PN 조</option>
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
            {{ tab }}
          </button>
        </div>
        <div class="layout3d-table-wrap">
          <DataTable :columns="layout3dColumns" :data="paginatedLayout3dList" />
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
            {{ tab }}
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
              <button class="btn-icon" title="다운로드"><span>⬇️</span></button>
              <button class="btn-icon" title="더보기"><span>⋯</span></button>
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
            수리 조건
          </button>
          <button
            class="btn-designcond"
            :class="{ active: designcondActiveTab === 1 }"
            @click="handleDesigncondTabChange(1)"
          >
            콘크리트 구조물 설정
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
        <div class="empty-tab">탭 내용 (샘플)</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
const tabs = [
  "기본 정보",
  "프로세스 정보",
  "3D 레이아웃 정보",
  "산출물",
  "설계조건",
];
const activeTab = ref(0);
const structureTabs = ["구조물1", "구조물2", "구조물3", "구조물4"];
const structureActiveTab = ref(0);
const layout3dTabs = ["구조물", "기기", "배관", "표준배치"];
const layout3dActiveTab = ref(0);
const outputTabs = ["계산서", "내역서", "도면"];
const outputActiveTab = ref(0);
const designcondActiveTab = ref(1); // 0: 수리 조건, 1: 콘크리트 구조물 설정

// 페이징 상태 관리
const pageSize = ref(10);

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
    structure: `구조물${i + 1}`,
    device: `기기${i + 1}`,
    type: `타입${i + 1}`,
    model: `모델${i + 1}`,
    feature: `특성${i + 1}`,
  })),
  1: Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    no: i + 1,
    structure: `기기구조물${i + 1}`,
    device: `기기명${i + 1}`,
    type: `기기타입${i + 1}`,
    model: `기기모델${i + 1}`,
    feature: `기기특성${i + 1}`,
  })),
  2: Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    no: i + 1,
    structure: `배관구조물${i + 1}`,
    device: `배관${i + 1}`,
    type: `배관타입${i + 1}`,
    model: `배관모델${i + 1}`,
    feature: `배관특성${i + 1}`,
  })),
  3: Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    no: i + 1,
    structure: `표준구조물${i + 1}`,
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
    title: `계산서 ${i + 1}`,
    type: "PDF",
    size: "8.5MB",
    date: "2025.05.20",
  })),
  1: Array.from({ length: 22 }, (_, i) => ({
    id: i + 1,
    title: `내역서 ${i + 1}`,
    type: "EXCEL",
    size: "2.1MB",
    date: "2025.05.19",
  })),
  2: Array.from({ length: 35 }, (_, i) => ({
    id: i + 1,
    title: `도면 ${i + 1}`,
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
    col1: `수리항목 ${i + 1}`,
    col2: `${100 + i * 10}`,
    col3: `${200 + i * 10}`,
    col4: "m³/h",
  }))
);
const designcondConcreteList = ref(
  Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    col1: `구조물 ${i + 1}`,
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
  { key: "project", title: "프로젝트명" },
  { key: "title1", title: "제목" },
  { key: "content1", title: "내용텍스트" },
  { key: "title2", title: "제목" },
  { key: "content2", title: "내용텍스트" },
  { key: "title3", title: "제목" },
  { key: "content3", title: "내용텍스트" },
];
const basicRows = [
  {
    project: "###프로젝트",
    title1: "제목",
    content1: "내용텍스트",
    title2: "제목",
    content2: "내용텍스트",
    title3: "제목",
    content3: "내용텍스트",
  },
  {
    project: "제목",
    title1: "내용텍스트",
    content1: "제목",
    title2: "내용텍스트",
    content2: "제목",
    title3: "내용텍스트",
    content3: "",
  },
  {
    project: "제목",
    title1: "내용텍스트",
    content1: "제목",
    title2: "내용텍스트",
    content2: "제목",
    title3: "내용텍스트",
    content3: "",
  },
];
// 프로세스 정보 - 수질정보
const processWaterColumns: TableColumn[] = [
  { key: "item", title: "Item" },
  { key: "influent", title: "Influent" },
  { key: "unit", title: "Unit" },
  { key: "remark", title: "Remark" },
];
const processWaterRows = [
  { item: "text", influent: "text", unit: "text", remark: "text" },
  { item: "text", influent: "text", unit: "text", remark: "text" },
];
// 프로세스 정보 - 구조물
const structureColumns: TableColumn[] = [
  { key: "col1", title: "Structure" },
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
  { key: "no", title: "순번" },
  { key: "structure", title: "구조물" },
  { key: "device", title: "기기명" },
  { key: "type", title: "기기타입" },
  { key: "model", title: "3D모델" },
  { key: "feature", title: "모델특성" },
];
const layout3dRows = [
  {
    no: "text",
    structure: "text",
    device: "text",
    type: "text",
    model: "text",
    feature: "text",
  },
];
// 산출물, 설계조건 등은 카드/커스텀 UI이므로 table 변환 제외

const projectInfoColumns: TableColumn[] = [
  { key: "projectPeriod", title: "프로젝트 기간" },
  { key: "projectManager", title: "담당자" },
  { key: "influentType", title: "유입종류" },
  { key: "facilityCapacity", title: "시설용량 (m³/d)" },
];
const projectInfoRows = [
  {
    projectPeriod: "2025.01.01 - 2025.12.31",
    projectManager: "김철수",
    influentType: "음식물쓰레기",
    facilityCapacity: "1000",
  },
];

const designcondHydroColumns: TableColumn[] = [
  { key: "col1", title: "항목" },
  { key: "col2", title: "값1" },
  { key: "col3", title: "값2" },
  { key: "col4", title: "단위" },
];
const designcondConcreteColumns: TableColumn[] = [
  { key: "col1", title: "구조물명" },
  { key: "col2", title: "길이" },
  { key: "col3", title: "너비" },
  { key: "col4", title: "높이" },
];
</script>

<style scoped lang="scss">
.project-detail-page {
  padding: $spacing-lg;
  background: #fff;
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
  padding: 0.5rem 1.2rem;
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
.basic-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.basic-table th,
.basic-table td {
  border: 1px solid #eee;
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 1rem;
}
.basic-table th {
  background: #f7f7f7;
  font-weight: bold;
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
.mini-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin-bottom: 1rem;
}
.mini-table th,
.mini-table td {
  border: 1px solid #eee;
  padding: 0.5rem 1rem;
  text-align: left;
  font-size: 1rem;
}
.mini-table th {
  background: #f7f7f7;
  font-weight: bold;
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
</style>
