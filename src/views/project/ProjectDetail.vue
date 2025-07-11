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
      <div class="row">
        <div class="cell label">프로젝트 기간</div>
        <div class="cell">텍스트</div>
        <div class="cell label">담당자</div>
        <div class="cell">텍스트</div>
        <div class="cell label">유입종류</div>
        <div class="cell">텍스트</div>
        <div class="cell label">시설용량 (m³/d)</div>
        <div class="cell">텍스트</div>
      </div>
      <div class="row">
        <div class="cell" colspan="8">텍스트</div>
      </div>
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
        <!-- 기본 정보 테이블 -->
        <table class="basic-table">
          <thead>
            <tr>
              <th>프로젝트명</th>
              <th>제목</th>
              <th>내용텍스트</th>
              <th>제목</th>
              <th>내용텍스트</th>
              <th>제목</th>
              <th>내용텍스트</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>###프로젝트</td>
              <td>제목</td>
              <td>내용텍스트</td>
              <td>제목</td>
              <td>내용텍스트</td>
              <td>제목</td>
              <td>내용텍스트</td>
            </tr>
            <tr>
              <td>제목</td>
              <td>내용텍스트</td>
              <td>제목</td>
              <td>내용텍스트</td>
              <td>제목</td>
              <td>내용텍스트</td>
              <td></td>
            </tr>
            <tr>
              <td>제목</td>
              <td>내용텍스트</td>
              <td>제목</td>
              <td>내용텍스트</td>
              <td>제목</td>
              <td>내용텍스트</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="activeTab === 1">
        <!-- 프로세스 정보 탭 -->
        <div class="process-info-section">
          <div class="process-info-row">
            <div class="info-label">유입종류</div>
            <div class="info-value">음식물쓰레기</div>
            <div class="info-label">수질정보</div>
            <div class="info-table-wrap">
              <table class="mini-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Influent</th>
                    <th>Unit</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>text</td>
                    <td>text</td>
                    <td>text</td>
                    <td>text</td>
                  </tr>
                  <tr>
                    <td>text</td>
                    <td>text</td>
                    <td>text</td>
                    <td>text</td>
                  </tr>
                </tbody>
              </table>
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
        <!-- 구조물 탭 -->
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
        <!-- 구조물 테이블 -->
        <div class="structure-table-wrap">
          <div class="structure-title">Structure</div>
          <table class="mini-table">
            <tbody>
              <tr>
                <td>text</td>
                <td>text</td>
                <td>text</td>
                <td>text</td>
              </tr>
              <tr>
                <td>text</td>
                <td>text</td>
                <td>text</td>
                <td>text</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 기기 테이블 -->
        <div class="structure-title">기기</div>
        <table class="mini-table">
          <tbody>
            <tr>
              <td>text</td>
              <td>text</td>
              <td>text</td>
              <td>text</td>
              <td>text</td>
              <td>text</td>
              <td>text</td>
              <td>text</td>
            </tr>
            <tr>
              <td>text</td>
              <td>text</td>
              <td>text</td>
              <td>text</td>
              <td>text</td>
              <td>text</td>
              <td>text</td>
              <td>text</td>
            </tr>
          </tbody>
        </table>
        <!-- 수질정보/설계조건 테이블 -->
        <div class="row-tables">
          <div class="row-table-block">
            <div class="structure-title">수질정보</div>
            <table class="mini-table">
              <tbody>
                <tr>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                </tr>
                <tr>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="row-table-block">
            <div class="structure-title">설계조건</div>
            <table class="mini-table">
              <tbody>
                <tr>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                </tr>
                <tr>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                  <td>text</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div v-else-if="activeTab === 2">
        <!-- 3D 레이아웃 정보 탭 -->
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
        <!-- 구조물/기기/배관/표준배치 탭 -->
        <div class="layout3d-structure-tabs">
          <button
            v-for="(tab, idx) in layout3dTabs"
            :key="tab"
            :class="[
              'layout3d-structure-tab',
              { active: layout3dActiveTab === idx },
            ]"
            @click="layout3dActiveTab = idx"
          >
            {{ tab }}
          </button>
        </div>
        <!-- 구조물 테이블 -->
        <div class="layout3d-table-wrap">
          <table class="mini-table">
            <thead>
              <tr>
                <th>순번</th>
                <th>구조물</th>
                <th>기기명</th>
                <th>기기타입</th>
                <th>3D모델</th>
                <th>모델특성</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>text</td>
                <td>text</td>
                <td>text</td>
                <td>text</td>
                <td>text</td>
                <td>text</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else-if="activeTab === 3">
        <!-- 산출물 탭 -->
        <div class="output-subtabs">
          <button
            v-for="(tab, idx) in outputTabs"
            :key="tab"
            :class="['output-subtab', { active: outputActiveTab === idx }]"
            @click="outputActiveTab = idx"
          >
            {{ tab }}
          </button>
        </div>
        <div class="output-file-list">
          <div v-for="n in 12" :key="n" class="output-file-card">
            <div class="file-title">제목</div>
            <div class="file-meta">PDF &nbsp; 8.5MB &nbsp; 2025.05.20</div>
            <div class="file-actions">
              <button class="btn-icon" title="다운로드"><span>⬇️</span></button>
              <button class="btn-icon" title="더보기"><span>⋯</span></button>
            </div>
          </div>
        </div>
        <div class="output-pagination">
          <button class="btn-page" disabled>⏮</button>
          <button class="btn-page" disabled>〈</button>
          <button class="btn-page active">1</button>
          <button class="btn-page">2</button>
          <button class="btn-page">3</button>
          <button class="btn-page">〉</button>
          <button class="btn-page">⏭</button>
        </div>
      </div>
      <div v-else-if="activeTab === 4">
        <!-- 설계조건 탭 -->
        <div class="designcond-btns">
          <button
            class="btn-designcond"
            :class="{ active: designcondActiveTab === 0 }"
            @click="designcondActiveTab = 0"
          >
            수리 조건
          </button>
          <button
            class="btn-designcond"
            :class="{ active: designcondActiveTab === 1 }"
            @click="designcondActiveTab = 1"
          >
            콘크리트 구조물 설정
          </button>
        </div>
        <div class="designcond-table-wrap">
          <table class="mini-table">
            <tbody>
              <tr>
                <td>text</td>
                <td>text</td>
                <td>text</td>
                <td>text</td>
              </tr>
              <tr>
                <td>text</td>
                <td>text</td>
                <td>text</td>
                <td>text</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="designcond-pagination">
          <button class="btn-page" disabled>⏮</button>
          <button class="btn-page" disabled>〈</button>
          <button class="btn-page active">1</button>
          <button class="btn-page">2</button>
          <button class="btn-page">3</button>
          <button class="btn-page">4</button>
          <button class="btn-page">999</button>
          <button class="btn-page">〉</button>
          <button class="btn-page">⏭</button>
        </div>
      </div>
      <div v-else>
        <div class="empty-tab">탭 내용 (샘플)</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
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
  border-top: 2px solid #222;
  border-bottom: 2px solid #222;
  margin-bottom: 1.5rem;
}
.project-info-table .row {
  display: flex;
  border-bottom: 1px solid #ddd;
}
.project-info-table .row:last-child {
  border-bottom: none;
}
.project-info-table .cell {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-right: 1px solid #eee;
}
.project-info-table .cell.label {
  font-weight: bold;
  background: #f7f7f7;
}
.project-info-table .cell:last-child {
  border-right: none;
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
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;
}
.btn-page {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s, border 0.2s;
}
.btn-page.active {
  background: #1a73e8;
  color: #fff;
  border: 1px solid #1a73e8;
}
.btn-page:disabled {
  color: #bbb;
  cursor: not-allowed;
  background: #f7f7f7;
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
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;
}
</style>
