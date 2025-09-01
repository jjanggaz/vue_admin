<template>
  <div class="process-page">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="search-bar">
        <!-- 첫 번째 줄: 언어, 단위 -->
        <div class="search-row first-row">
          <div class="group-form">
            <label for="searchLanguage" class="label-title">언어</label>
            <div class="form-item">
              <select
                id="searchLanguage"
                v-model="selectedLanguage"
                class="form-select"
                @change="handleLanguageChange"
              >
                <option value="ko">국문</option>
                <option value="en">영어</option>
              </select>
            </div>
          </div>
          <div class="group-form">
            <label for="searchUnit" class="label-title">단위</label>
            <div class="form-item">
              <select
                id="searchUnit"
                v-model="selectedUnit"
                class="form-select"
                @change="handleUnitChange"
              >
                <option value="METRIC">Metric</option>
                <option value="IMPERIAL">Imperial</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- 두 번째 줄: 공정구분, 공정중분류, 공정명, 버튼들 -->
        <div class="search-row second-row">
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
          </div>
          
          <div class="group-form">
            <div class="form-item button-group">
              <button class="btn btn-primary btn-search" @click="handleSearch">
                {{ t("common.search") }}
              </button>
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
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <!-- DataTable row-key가 default로 id로 설정돼있어서 추가 수정함함 -->
    <!-- 디버깅: 데이터 확인 -->

    
    <DataTable
      v-if="isComponentMounted && processStore.paginatedProcessList && processStore.paginatedProcessList.length >= 0"
      :columns="tableColumns"
      :data="processStore.paginatedProcessList"
      :loading="processStore.loading"
      :selectable="true"
      :selected-items="processStore.selectedItems"
      row-key="id"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- 공정심볼 SVG 미리보기 + 파일명 슬롯 -->
      <template #cell-symbol_download="{ item }">
        <!-- 디버깅: symbol_download 값 확인 -->
        <div style="display: none;">
          Debug: {{ JSON.stringify(item.symbol_download) }}
        </div>
        
        <!-- symbol_download가 없거나 null이거나 빈 문자열이거나 {}이거나 빈 객체인 경우 공백 표시 -->
        <div v-if="!item.symbol_download || item.symbol_download === '' || item.symbol_download === null || item.symbol_download === 'null' || item.symbol_download === '{}' || (typeof item.symbol_download === 'string' && item.symbol_download.trim() === '{}') || (typeof item.symbol_download === 'object' && Object.keys(item.symbol_download).length === 0)" class="empty-symbol">
          &nbsp;
        </div>
        
        <!-- symbol_download가 있는 경우 SVG 미리보기 + 파일명 표시 -->
        <div v-else class="svg-preview-container">
          <!-- SVG 미리보기 -->
          <div class="svg-preview-section">
            <!-- SVG 코드가 직접 포함된 경우 -->
            <div 
              v-if="typeof item.symbol_download === 'string' && item.symbol_download.includes('<svg')"
              class="svg-preview"
              v-html="item.symbol_download"
            ></div>
            
            <!-- SVG 파일 경로인 경우 -->
            <img 
              v-else-if="typeof item.symbol_download === 'string' && item.symbol_download.toLowerCase().endsWith('.svg')"
              :src="`/${item.symbol_download}`" 
              :alt="item.symbol_download"
              class="svg-preview"
              @error="handleSvgError"
              @load="handleSvgLoad"
            />
            
            <!-- 그 외의 경우 -->
            <span v-else class="svg-fallback">
              {{ item.symbol_download || '-' }}
            </span>
          </div>
          
          <!-- 파일명 표시 (symbol_uri에서 경로 제외) -->
          <span class="filename-text">
            {{ getFileNameFromUri(item.process_symbol) || getFileNameFromUri(item.symbol_download) || 'symbol.svg' }}
          </span>
        </div>
      </template>
      
      <!-- 보기 버튼 슬롯 -->
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
        <div class="modal-container large-modal">
          <div class="modal-header">
            <h3>{{ t("process.registerProcess") }}</h3>
            <button class="btn-close" @click="closeRegistModal">×</button>
          </div>
          <div class="modal-body">
            <!-- 상단: 기본 정보 입력 -->
            <div class="form-section">
              <!-- 첫 번째 줄: 언어, 단위 -->
              <div class="form-row">
                <div class="form-group">
                  <label class="essential">⊙ 언어</label>
                  <select v-model="registForm.language" class="form-select">
                    <option value="ko">국문</option>
                    <option value="en">영어</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="essential">⊙ 단위</label>
                  <select v-model="registForm.unit" class="form-select">
                    <option value="metric">Metric</option>
                    <option value="imperial">Imperial</option>
                  </select>
                </div>
              </div>
              <!-- 두 번째 줄: 공정구분, 공정 중분류, 공정명, 공정심볼 파일 -->
              <div class="form-row">
                <div class="form-group">
                  <label class="essential">⊙ 공정구분</label>
                  <select
                    v-model="registForm.processType"
                    class="form-select"
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
                </div>
                <div class="form-group">
                  <label class="essential">⊙ 공정 중분류</label>
                  <select
                    v-model="registForm.processSubCategory"
                    class="form-select"
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
                </div>
                <div class="form-group">
                  <label>⊙ 공정명</label>
                  <select
                    v-model="registForm.processNm"
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
                <div class="form-group">
                  <label class="essential">⊙ 공정심볼 파일</label>
                  <div class="file-input-group">
                    <input
                      type="file"
                      accept=".svg"
                      @change="handleProcessSymbolFileChange"
                      style="display: none"
                      ref="processSymbolFileInput"
                    />
                    <button type="button" @click="$refs.processSymbolFileInput.click()" class="file-select-btn">
                      파일선택 (svg)
                    </button>
                    <span class="selected-file">{{ getProcessSymbolFileName() || '선택된 파일 없음' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 중간: 파일 업로드 그리드 -->
            <div class="file-upload-section">
              <h4>⊙ 파일 업로드</h4>
              <div class="grid-actions">
                <button class="btn btn-primary btn-sm" @click="addFileUploadRow">+ 행 추가</button>
                <button class="btn btn-danger btn-sm" @click="deleteSelectedFileRows" :disabled="selectedFileRows.length === 0">삭제</button>
              </div>
              <div class="file-upload-table">
                <table class="upload-table">
                  <thead>
                    <tr>
                      <th>
                        <input 
                          type="checkbox" 
                          @change="handleSelectAllFileRows"
                          :checked="selectedFileRows.length === fileUploadRows.length && fileUploadRows.length > 0"
                          :indeterminate="selectedFileRows.length > 0 && selectedFileRows.length < fileUploadRows.length"
                        />
                      </th>
                      <th>No.</th>
                      <th>계산식(*)</th>
                      <th>컨포넌트</th>
                      <th>수리계통도 (*)</th>
                      <th>PFD (*)</th>
                      <th>P&ID (*)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in fileUploadRows" :key="row.id" :class="{ 'alternate-row': index % 2 === 1 }">
                      <td>
                        <input 
                          type="checkbox" 
                          :value="row"
                          v-model="selectedFileRows"
                        />
                      </td>
                      <td>{{ row.no }}</td>
                      <td>
                        <div class="file-selection-group">
                          <button class="btn btn-primary btn-sm" @click="selectFormulaFile(row)">파일선택</button>
                          <div class="file-info">
                            <span v-if="row.formulaFile" class="selected-file">
                              {{ row.formulaFile.name }}
                              <button class="clear-file" @click="clearFormulaFile(row)">&times;</button>
                            </span>
                            <span v-else class="no-file">선택된 파일 없음</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button class="btn btn-secondary btn-sm" @click="openComponentModal(row)">설정</button>
                      </td>
                      <td>
                        <div class="file-selection-group">
                          <button class="btn btn-primary btn-sm" @click="selectHydraulicFile(row)">파일선택</button>
                          <div class="file-info">
                            <span v-if="row.hydraulicFile" class="selected-file">
                              {{ row.hydraulicFile.name }}
                              <button class="clear-file" @click="clearHydraulicFile(row)">&times;</button>
                            </span>
                            <span v-else class="no-file">선택된 파일 없음</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="file-selection-group">
                          <button class="btn btn-primary btn-sm" @click="selectPfdFile(row)">파일선택</button>
                          <div class="file-info">
                            <span v-if="row.pfdFile" class="selected-file">
                              {{ row.pfdFile.name }}
                              <button class="clear-file" @click="clearPfdFile(row)">&times;</button>
                            </span>
                            <span v-else class="no-file">선택된 파일 없음</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button 
                          v-if="row.pidStatus === 'completed'" 
                          class="btn btn-success btn-sm"
                          disabled
                        >
                          등록완료
                        </button>
                        <button 
                          v-else 
                          class="btn btn-secondary btn-sm" 
                          @click="openPidListModal(row)"
                        >
                          등록
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Hidden file inputs -->
            <input
              type="file"
              accept=".svg"
              @change="handleProcessSymbolFileSelected"
              style="display: none"
              ref="processSymbolFileInput"
            />
            <input
              type="file"
              accept=".py,.xlsx,.xls,.csv"
              @change="handleFormulaFileSelected"
              style="display: none"
              ref="formulaFileInput"
            />
            <input
              type="file"
              accept=".dwg,.dxf"
              @change="handleHydraulicFileSelected"
              style="display: none"
              ref="hydraulicFileInput"
            />
            <input
              type="file"
              accept=".dwg,.dxf"
              @change="handlePfdFileSelected"
              style="display: none"
              ref="pfdFileInput"
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" @click="saveProcessRegistration">저장</button>
            <button class="btn btn-secondary" @click="closeRegistModal">닫기</button>
          </div>
        </div>
      </div>

    <!-- 컴포넌트 설정 모달 -->
    <div v-if="showComponentModal" class="modal-overlay component-modal-overlay">
      <div class="component-modal-container">
        <div class="modal-header">
          <h3>컴포넌트 설정</h3>
          <button class="btn-close" @click="closeComponentModal">×</button>
        </div>
        <div class="component-modal-body">
                  <div class="component-table-section">
          <table class="component-table">
            <thead>
              <tr>
                <th>
                  구분
                  <span class="sort-icon">▼</span>
                </th>
                <th>
                  Components
                  <span class="sort-icon">▼</span>
                </th>
                <th>
                  유형
                  <span class="sort-icon">▼</span>
                </th>
                <th>
                  입력Item
                  <span class="sort-icon">▼</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(comp, idx) in componentModalData.components" :key="idx">
                <td>
                  <input class="form-input" v-model="comp.division" placeholder="구분" />
                </td>
                <td>
                  <input class="form-input" v-model="comp.components" placeholder="Components" />
                </td>
                <td>
                  <input class="form-input" v-model="comp.type" placeholder="유형" />
                </td>
                <td>
                  <input class="form-input" v-model="comp.inputItem" placeholder="입력Item" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
                  <div class="modal-footer">
            <button class="btn btn-primary" @click="saveComponentModal">저장</button>
            <button class="btn btn-secondary" @click="resetComponentModal">초기화</button>
          </div>
      </div>
    </div>

    <!-- P&ID 목록 모달 -->
    <div v-if="showPidListModal" class="modal-overlay pid-list-modal-overlay">
      <div class="pid-list-modal-container">
        <div class="modal-header">
          <h3>P&ID 목록</h3>
          <div class="modal-actions">
            <button class="btn btn-primary">Zip 등록</button>
            <button class="btn btn-primary" @click="addPidListRow">+ 행 추가</button>
            <button 
              class="btn btn-danger" 
              @click="deleteSelectedPidListItems"
              :disabled="selectedPidListItems.length === 0"
            >
              삭제
            </button>
            <button class="btn-close" @click="closePidListModal">×</button>
          </div>
        </div>
        <div class="modal-body">
          <div class="pid-list-table">
            <table class="pid-table">
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      @change="handleSelectAllPidList"
                      :checked="selectedPidListItems.length === pidListItems.length && pidListItems.length > 0"
                      :indeterminate="selectedPidListItems.length > 0 && selectedPidListItems.length < pidListItems.length"
                    />
                  </th>
                  <th>No.</th>
                  <th>P&ID (*)</th>
                  <th>매핑 Excel (*)</th>
                  <th>SVG 파일</th>
                  <th>정보개요(기기명+대수)</th>
                  <th>Svg 도면 미리보기</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in pidListItems" :key="item.id" :class="{ 'alternate-row': index % 2 === 1 }">
                  <td>
                    <input 
                      type="checkbox" 
                      :value="item"
                      v-model="selectedPidListItems"
                      @change="handlePidListSelectionChange"
                    />
                  </td>
                  <td>{{ item.no }}</td>
                  <td>
                    <div class="file-selection-group">
                      <button class="btn btn-sm btn-primary" @click="selectPidFile(item)">파일선택</button>
                      <div class="file-info">
                        <span v-if="item.pidFileName" class="selected-file">
                          {{ item.pidFileName }}
                          <button class="clear-file" @click="clearPidFile(item)">&times;</button>
                        </span>
                        <span v-else class="no-file">선택된 파일 없음</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="file-selection-group">
                      <button class="btn btn-sm btn-primary" @click="selectExcelFile(item)">파일선택</button>
                      <div class="file-info">
                        <span v-if="item.excelFileName" class="selected-file">
                          {{ item.excelFileName }}
                          <button class="clear-file" @click="clearExcelFile(item)">&times;</button>
                        </span>
                        <span v-else class="no-file">선택된 파일 없음</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="svg-conversion-group">
                      <button class="btn btn-sm btn-primary" @click="convertSvg(item)">변환</button>
                      <span class="conversion-status">{{ item.svgStatus || '대기' }}</span>
                    </div>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      v-model="item.infoOverview" 
                      class="info-input"
                      placeholder="예: 펌프, 2대"
                    />
                  </td>
                  <td>
                    <button class="btn btn-sm btn-secondary" @click="previewSvg(item)">보기</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Hidden file inputs -->
          <input
            type="file"
            accept=".dwg"
            @change="handlePidFileSelected"
            style="display: none"
            ref="pidFileInput"
          />
          <input
            type="file"
            accept=".xlsx,.xls"
            @change="handleExcelFileSelected"
            style="display: none"
            ref="excelFileInput"
          />
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
          <div v-if="!selectedProcessId" class="loading-placeholder">
            <p>공정 정보를 불러오는 중...</p>
          </div>
          <ProcessDetail
            v-else
            :key="`process-detail-${selectedProcessId}`"
            :process-id="String(selectedProcessId)"
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
            @click="handleDetailSave"
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
import { ref, onMounted, computed, reactive } from "vue";
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
  language: string;
  unit: string;
}

interface FileUploadRow {
  id: string;
  no: number;
  formulaFile: File | null;
  hydraulicFile: File | null;
  pfdFile: File | null;
  pidStatus: 'pending' | 'completed';
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
  { 
    key: "symbol_download", 
    title: t("process.processSymbol"), 
    sortable: true,
    formatter: (value) => value || '-'
  }, // 공정심볼 (SVG 미리보기)
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
 const isComponentMounted = ref(false);

// 언어 및 단위 선택
const selectedLanguage = ref<string>("ko");
const selectedUnit = ref<string>("METRIC");

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
  language: "ko",
  unit: "metric",
});

// 파일 업로드 그리드 관련 상태
const fileUploadRows = ref<FileUploadRow[]>([]);
const selectedFileRows = ref<FileUploadRow[]>([]);
const currentFileRow = ref<FileUploadRow | null>(null);

// 컴포넌트 설정 모달 상태
const showComponentModal = ref(false);
const componentModalData = reactive<{
  row: FileUploadRow | null;
  components: Array<{ division: string; components: string; type: string; inputItem: string }>;
}>({
  row: null,
  components: []
});

// P&ID 목록 모달 상태
const showPidListModal = ref(false);
const pidListItems = ref<Array<{
  id: string;
  no: number;
  pidFileName: string;
  excelFileName: string;
  svgStatus: string;
  infoOverview: string;
}>>([]);
const selectedPidListItems = ref<any[]>([]);
const currentPidItem = ref<any>(null);

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

// SVG 에러 처리 함수
const handleSvgError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  const container = img.parentElement;
  if (container) {
    img.style.display = 'none';
    const fallback = container.querySelector('.svg-fallback') as HTMLElement;
    if (fallback) {
      fallback.style.display = 'inline';
    }
  }
};

// SVG 로드 성공 처리 함수
const handleSvgLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.log('SVG 로드 성공:', img.src);
};

// 상세 모달 저장 핸들러
const handleDetailSave = async () => {
  try {
    if (processDetailRef.value?.handleUpdate) {
      await processDetailRef.value.handleUpdate();
    }
  } catch (error) {
    console.error('상세 모달 저장 중 오류:', error);
  }
};

// URI에서 파일명만 추출하는 함수
const getFileNameFromUri = (uri: string | null | undefined): string => {
  if (!uri || typeof uri !== 'string') {
    return '-';
  }
  
  // 경로 구분자로 분할하여 마지막 부분(파일명) 추출
  const pathParts = uri.split(/[/\\]/);
  const fileName = pathParts[pathParts.length - 1];
  
  // 파일명이 비어있거나 경로가 없는 경우
  if (!fileName || fileName === uri) {
    return uri;
  }
  
  return fileName;
};



const handleRegist = () => {
  isRegistModalOpen.value = true;
  // 등록 모달용 공정구분 코드 로드
  processStore.loadProcessTypeCodes();
  
  // 초기 파일 업로드 행 추가
  if (fileUploadRows.value.length === 0) {
    addFileUploadRow();
  }
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
     language: "ko",
     unit: "metric",
   };
   // 파일 선택 상태도 초기화
   selectedFiles.value = {};
   // 첨부된 파일 목록도 초기화
   attachedFiles.value = {
     calculation: [],
     pfd: [],
     hydraulic: [],
   };
   // 파일 업로드 그리드 초기화
   fileUploadRows.value = [];
   selectedFileRows.value = [];
   currentFileRow.value = null;
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

// 새로운 등록 모달 관련 함수들
const addFileUploadRow = () => {
  const newRow: FileUploadRow = {
    id: `row_${Date.now()}`,
    no: fileUploadRows.value.length + 1,
    formulaFile: null,
    hydraulicFile: null,
    pfdFile: null,
    pidStatus: 'pending'
  };
  fileUploadRows.value.push(newRow);
};

const handleSelectAllFileRows = () => {
  if (selectedFileRows.value.length === fileUploadRows.value.length) {
    selectedFileRows.value = [];
  } else {
    selectedFileRows.value = [...fileUploadRows.value];
  }
};

const deleteSelectedFileRows = () => {
  if (selectedFileRows.value.length === 0) {
    alert('삭제할 항목을 선택해주세요.');
    return;
  }
  
  if (confirm(`선택된 ${selectedFileRows.value.length}개 항목을 삭제하시겠습니까?`)) {
    const selectedIds = selectedFileRows.value.map(row => row.id);
    fileUploadRows.value = fileUploadRows.value.filter(row => !selectedIds.includes(row.id));
    selectedFileRows.value = [];
  }
};



const selectFormulaFile = (row: FileUploadRow) => {
  currentFileRow.value = row;
  (document.querySelector('input[ref="formulaFileInput"]') as HTMLInputElement)?.click();
};

const selectHydraulicFile = (row: FileUploadRow) => {
  currentFileRow.value = row;
  (document.querySelector('input[ref="hydraulicFileInput"]') as HTMLInputElement)?.click();
};

const selectPfdFile = (row: FileUploadRow) => {
  currentFileRow.value = row;
  (document.querySelector('input[ref="pfdFileInput"]') as HTMLInputElement)?.click();
};

const handleProcessSymbolFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    if (!file.name.toLowerCase().endsWith('.svg')) {
      alert('SVG 파일만 선택할 수 있습니다. 다시 선택해주세요.');
      target.value = '';
      return;
    }
    
    registForm.value.processSymbolFile = file;
    console.log('공정심볼 파일 선택됨:', file.name);
  }
};

const getProcessSymbolFileName = () => {
  const processSymbolFile = registForm.value.processSymbolFile;
  if (processSymbolFile) {
    // 경로 제외 파일명만 반환
    return processSymbolFile.name.split('/').pop() || processSymbolFile.name;
  }
  return '';
};

const handleFormulaFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentFileRow.value) {
    currentFileRow.value.formulaFile = target.files[0];
  }
};

const handleHydraulicFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentFileRow.value) {
    currentFileRow.value.hydraulicFile = target.files[0];
  }
};

const handlePfdFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentFileRow.value) {
    currentFileRow.value.pfdFile = target.files[0];
  }
};

const clearFormulaFile = (row: FileUploadRow) => {
  row.formulaFile = null;
};

const clearHydraulicFile = (row: FileUploadRow) => {
  row.hydraulicFile = null;
};

const clearPfdFile = (row: FileUploadRow) => {
  row.pfdFile = null;
};

const openComponentModal = (row: FileUploadRow) => {
  componentModalData.row = row;
  // 기존 데이터가 있으면 복사, 없으면 4줄 샘플 데이터 설정
  componentModalData.components = Array.isArray((row as any).components)
    ? JSON.parse(JSON.stringify((row as any).components))
    : [
        { division: "공용구조물", components: "구조물", type: "", inputItem: "SBR 반응조 구조물" },
        { division: "공용구조물", components: "구조물", type: "", inputItem: "" },
        { division: "공용구조물", components: "구조물", type: "", inputItem: "" },
        { division: "공용기계", components: "송풍기", type: "터보블로워(VVVF)", inputItem: "반응조 송풍기" }
      ];
  showComponentModal.value = true;
};

const closeComponentModal = () => {
  showComponentModal.value = false;
  componentModalData.row = null;
  componentModalData.components = [];
};

// 컴포넌트 설정 초기화
const resetComponentModal = () => {
  componentModalData.components = [
    { division: "공용구조물", components: "구조물", type: "", inputItem: "SBR 반응조 구조물" },
    { division: "공용구조물", components: "구조물", type: "", inputItem: "" },
    { division: "공용구조물", components: "구조물", type: "", inputItem: "" },
    { division: "공용기계", components: "송풍기", type: "터보블로워(VVVF)", inputItem: "반응조 송풍기" }
  ];
};

// P&ID 목록 모달 관련 함수들
const openPidListModal = (row: FileUploadRow) => {
  showPidListModal.value = true;
  // 초기 데이터 설정
  pidListItems.value = [
    {
      id: '1',
      no: 1,
      pidFileName: '유량조정조 1번.dwg',
      excelFileName: '유량조정조 1번.excel',
      svgStatus: '대기',
      infoOverview: '예: 펌프, 2대'
    },
    {
      id: '2',
      no: 2,
      pidFileName: '',
      excelFileName: '',
      svgStatus: '대기',
      infoOverview: '예: 펌프, 2대'
    }
  ];
  selectedPidListItems.value = [];
};

const closePidListModal = () => {
  showPidListModal.value = false;
  pidListItems.value = [];
  selectedPidListItems.value = [];
};

const addPidListRow = () => {
  const newRow = {
    id: `pid_${Date.now()}`,
    no: pidListItems.value.length + 1,
    pidFileName: '',
    excelFileName: '',
    svgStatus: '대기',
    infoOverview: '예: 펌프, 2대'
  };
  pidListItems.value.push(newRow);
};

const handleSelectAllPidList = () => {
  if (selectedPidListItems.value.length === pidListItems.value.length) {
    selectedPidListItems.value = [];
  } else {
    selectedPidListItems.value = [...pidListItems.value];
  }
};

const handlePidListSelectionChange = () => {
  console.log('선택된 P&ID 항목들:', selectedPidListItems.value);
};

const deleteSelectedPidListItems = () => {
  if (selectedPidListItems.value.length === 0) {
    alert('삭제할 항목을 선택해주세요.');
    return;
  }
  
  if (confirm(`선택된 ${selectedPidListItems.value.length}개 항목을 삭제하시겠습니까?`)) {
    const selectedIds = selectedPidListItems.value.map(item => item.id);
    pidListItems.value = pidListItems.value.filter(item => !selectedIds.includes(item.id));
    selectedPidListItems.value = [];
    console.log('선택된 P&ID 항목들 삭제 완료');
  }
};

const selectPidFile = (item: any) => {
  currentPidItem.value = item;
  (document.querySelector('input[ref="pidFileInput"]') as HTMLInputElement)?.click();
};

const selectExcelFile = (item: any) => {
  currentPidItem.value = item;
  (document.querySelector('input[ref="excelFileInput"]') as HTMLInputElement)?.click();
};

const handlePidFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentPidItem.value) {
    const file = target.files[0];
    currentPidItem.value.pidFileName = file.name;
    console.log('P&ID 파일 선택됨:', file.name);
  }
};

const handleExcelFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentPidItem.value) {
    const file = target.files[0];
    currentPidItem.value.excelFileName = file.name;
    console.log('Excel 파일 선택됨:', file.name);
  }
};

const clearPidFile = (item: any) => {
  item.pidFileName = '';
};

const clearExcelFile = (item: any) => {
  item.excelFileName = '';
};

const convertSvg = (item: any) => {
  if (item.pidFileName) {
    item.svgStatus = '변환 중...';
    // 실제 SVG 변환 로직 구현 필요
    setTimeout(() => {
      item.svgStatus = '완료';
    }, 2000);
  } else {
    alert('P&ID 파일을 먼저 선택해주세요.');
  }
};

const previewSvg = (item: any) => {
  if (item.svgStatus === '완료') {
    alert('SVG 미리보기 기능을 구현하세요.');
  } else {
    alert('SVG 변환이 완료되지 않았습니다.');
  }
};

// 컴포넌트 행 추가 (ProcessDetail.vue 컴포넌트 탭과 동일한 필드 구조)
const addComponentRow = () => {
  componentModalData.components.push({
    division: "",
    components: "",
    type: "",
    inputItem: ""
  });
};

// 컴포넌트 행 삭제 (마지막 행 삭제)
const removeComponentRow = () => {
  if (componentModalData.components.length > 0) {
    componentModalData.components.pop();
  }
};

// 컴포넌트 설정 저장
const saveComponentModal = () => {
  if (componentModalData.row) {
    // row에 컴포넌트 데이터 저장
    (componentModalData.row as any).components = JSON.parse(JSON.stringify(componentModalData.components));
  }
  showComponentModal.value = false;
};

const registerPid = (row: FileUploadRow) => {
  row.pidStatus = 'completed';
  alert('P&ID 등록이 완료되었습니다.');
};

const saveProcessRegistration = async () => {
  try {
    // 기본 정보 검증
    if (!registForm.value.language || !registForm.value.unit || !registForm.value.processType || !registForm.value.processNm) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    // 공정심볼 파일 검증
    if (!registForm.value.processSymbolFile) {
      alert('공정심볼 파일을 선택해주세요.');
      return;
    }

    // 파일 업로드 검증
    if (fileUploadRows.value.length === 0) {
      alert('최소 하나의 파일 업로드 행을 추가해주세요.');
      return;
    }

    // 선택된 공정명의 label과 value 찾기
    const selectedProcessNameOption =
      processStore.searchProcessNameOptions.find(
        (option) => option.value === registForm.value.processNm
      );

    if (!selectedProcessNameOption) {
      alert('유효하지 않은 공정명입니다.');
      return;
    }

    // API 호출을 위한 데이터 준비
    const requestData = {
      language_code: registForm.value.language,
      unit_system_code: registForm.value.unit,
      process_code: selectedProcessNameOption.value,
      process_name: selectedProcessNameOption.label,
      process_type_code: registForm.value.processType,
      process_category: registForm.value.processSubCategory,
      process_symbol_file: registForm.value.processSymbolFile,
      file_upload_rows: fileUploadRows.value
    };

    console.log('공정 등록 저장:', {
      formData: registForm.value,
      fileRows: fileUploadRows.value,
      requestData: requestData
    });

    // 실제 API 호출
    const result = await processStore.createProcess(requestData);
    console.log('공정 등록 API 응답:', result);

    alert('공정 등록이 완료되었습니다.');
    closeRegistModal();
  } catch (error) {
    console.error('공정 등록 실패:', error);
    alert('공정 등록에 실패했습니다.');
  }
};

// 상세 보기 이동
const viewDetail = (item: ProcessItem) => {
  // process_id가 없으면 id를 사용
  const processId = item.process_id || item.id;
  
  if (processId) {
    selectedProcessId.value = processId;
    isDetailModalOpen.value = true;
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



// 선택된 항목 변경 핸들러
const handleSelectionChange = (items: ProcessItem[]) => {
  processStore.setSelectedItems(items);
};

// 언어 및 단위 변경 핸들러
const handleLanguageChange = () => {
  console.log('언어 변경:', selectedLanguage.value);
  // 언어 변경 시 필요한 로직 추가
};

const handleUnitChange = () => {
  console.log('단위 변경:', selectedUnit.value);
  // 단위 변경 시 필요한 로직 추가
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

    // 3. 컴포넌트 마운트 완료 표시
    isComponentMounted.value = true;
    console.log("=== Process.vue 초기화 완료 ===");
  } catch (error) {
    console.error("Process.vue 초기화 중 오류 발생:", error);
    // 오류가 발생해도 컴포넌트는 마운트된 것으로 표시
    isComponentMounted.value = true;
  }
});
</script>

<style scoped lang="scss">
.process-page {
  padding: $spacing-lg;
}

// 공정심볼 스타일
.empty-symbol {
  min-height: 20px;
  min-width: 20px;
}

// SVG 미리보기 + 파일명 스타일 (1줄 표시, 클릭 가능)
.svg-preview-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
  
  .svg-preview-section {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    .svg-preview {
      width: 20px;
      height: 20px;
      object-fit: contain;
      border-radius: 3px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      
      &.clickable {
        cursor: pointer;
      }
      
      &:hover {
        transform: scale(1.1);
        transition: transform 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }
      
      // SVG 코드를 직접 렌더링할 때의 스타일
      svg {
        width: 100%;
        height: 100%;
        fill: currentColor;
      }
    }
    
    .svg-fallback {
      font-size: 11px;
      color: #6c757d;
      font-family: monospace;
      
      &.clickable {
        cursor: pointer;
      }
      
      &.fallback-only {
        display: inline;
      }
    }
  }
  
  .filename-text {
    font-size: 12px;
    color: #495057;
    font-family: monospace;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
  }
  
  .download-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
  
  &:hover .download-icon {
    opacity: 1;
    color: #007bff;
  }
}

.process-3d-page {
  padding: $spacing-lg;
}

.action-bar {
  display: flex;
  margin-bottom: $spacing-lg;
  
        .search-bar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
    
    // 각 줄의 스타일
    .search-row {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
      width: 100%;
      flex-wrap: wrap;
      
      &.first-row {
        // 첫 번째 줄: 언어, 단위
        .group-form {
          flex: 0 0 auto;
          min-width: 0;
          
          // 셀렉트 폭 조정
          .form-select {
            max-width: 100px;
            min-width: 80px;
          }
          
          // 라벨 폭 조정
          .label-title {
            font-size: 0.85rem;
            white-space: nowrap;
          }
        }
      }
      
      &.second-row {
        // 두 번째 줄: 공정구분, 공정중분류, 공정명, 버튼들
        .group-form {
          flex: 0 0 auto;
          min-width: 0;
          
          // 셀렉트 폭 조정
          .form-select {
            max-width: 100px;
            min-width: 80px;
          }
          
          // 라벨 폭 조정
          .label-title {
            font-size: 0.85rem;
            white-space: nowrap;
          }
        }
      }
    }
    
    .group-form {
      margin-bottom: 1rem;
      min-width: 0;
      
      // 셀렉트 폭 조정
      .form-select {
        max-width: 180px;
        min-width: 120px;
      }
      
      // 버튼 그룹 스타일
      .button-group {
        display: flex;
        gap: 1rem;
        align-items: center;
        
        .btn {
          margin-right: 0;
        }
      }
    }
  }
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

// 새로운 등록 모달 스타일
.large-modal {
  max-width: 90vw;
  max-height: 90vh;
  width: 1200px;
}

.form-section {
  margin-bottom: 2rem;
  
  .form-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    
    .form-group {
      flex: 1;
      min-width: 200px;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #333;
        
        &.essential::after {
          content: " (*)";
          color: #dc3545;
          font-weight: bold;
        }
      }
      
      .form-select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
        font-size: 0.875rem;
      }
    }
  }
}

.file-upload-section {
  margin-bottom: 2rem;
  
  h4 {
    margin-bottom: 1rem;
    font-weight: 600;
    color: #333;
  }
  
  .grid-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .file-upload-table {
    overflow-x: auto;
    
    .upload-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      
      th, td {
        padding: 0.75rem;
        border: 1px solid #ddd;
        text-align: left;
        vertical-align: middle;
      }
      
      th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #333;
      }
      
      .alternate-row {
        background-color: #f8f9fa;
      }
      
      .file-selection-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        
        .file-info {
          .selected-file {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            background-color: #e9ecef;
            border-radius: 4px;
            font-size: 0.8rem;
            
            .clear-file {
              border: none;
              background: none;
              color: #dc3545;
              cursor: pointer;
              font-size: 1rem;
              padding: 0;
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              
              &:hover {
                background-color: #dc3545;
                color: white;
                border-radius: 50%;
              }
            }
          }
          
          .no-file {
            color: #6c757d;
            font-style: italic;
            font-size: 0.8rem;
          }
        }
      }
    }
  }
}

// 컴포넌트 설정 팝업 스타일 - 최상단에 표시
.component-modal-overlay {
  z-index: 9999; // 최상단에 표시되도록 매우 높은 z-index 설정
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.component-modal-container {
  z-index: 10000; // 오버레이보다 더 높게 설정
  width: 80vw;
  max-width: 1000px;
  height: 80vh;
  max-height: 700px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.component-modal-body {
  padding: 2.5rem;
  flex: 1 1 0;
  overflow-y: auto;
}

.component-table-section {
  width: 100%;
  margin-bottom: 2rem;
}

.component-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;

  th, td {
    border: 1px solid #e0e0e0;
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
    text-align: left;
    min-height: 60px;
  }
  th {
    background: #f8f9fa;
    font-weight: 600;
    position: relative;
    font-size: 1.2rem;
    
    .sort-icon {
      margin-left: 8px;
      font-size: 14px;
      color: #666;
    }
  }
  td {
    background: #fff;
    vertical-align: middle;
  }
  input.form-input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1.1rem;
    background: #fff;
    height: 45px;
    
    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    }
  }
}

.component-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

// P&ID 목록 모달 스타일
.pid-list-modal-overlay {
  z-index: 9999;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pid-list-modal-container {
  z-index: 10000;
  width: 70vw;
  max-width: 900px;
  height: 70vh;
  max-height: 600px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.pid-list-table {
  width: 100%;
  overflow-x: auto;
}

.pid-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.pid-table th,
.pid-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
}

.pid-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.pid-table tr.alternate-row {
  background-color: #f8f9fa;
}

.pid-table tr:hover {
  background-color: #f0f0f0;
}

.file-selection-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-info {
  margin-top: 4px;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #007bff;
  font-size: 13px;
}

.clear-file {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  margin: 0;
}

.clear-file:hover {
  color: #c82333;
}

.no-file {
  color: #6c757d;
  font-size: 13px;
  font-style: italic;
}

// 공정심볼 파일 입력 그룹 스타일 (ProcessDetail.vue와 동일)
.file-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-select-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.file-select-btn:hover {
  background: #0056b3;
}

.selected-file {
  color: #007bff;
  font-size: 13px;
  flex: 1;
}

.svg-conversion-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.conversion-status {
  font-size: 12px;
  color: #6c757d;
}

.info-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
}

.info-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.modal-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>