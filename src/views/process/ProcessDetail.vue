<template>
  <div class="process-detail">
    <!-- 공정 기본 정보 -->
    <div class="process-info-section">
      <div class="form-grid">
        <div class="form-group">
          <label>언어</label>
          <select v-model="selectedLanguage" @change="handleLanguageChange">
            <option value="">{{ t("common.select") }}</option>
            <option value="ko">국문</option>
            <option value="en">영어</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>단위</label>
          <select v-model="selectedUnit" @change="handleUnitChange">
            <option value="">{{ t("common.select") }}</option>
            <option value="METRIC">Metric</option>
            <option value="IMPERIAL">Imperial</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>{{ t("process.processType") }}</label>
          <select v-model="processStore.processDetail.processType" @change="handleProcessTypeChange">
            <option value="">{{ t("common.select") }}</option>
            <option v-for="option in processStore.processTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label>{{ t("process.subCategory") }}</label>
          <select v-model="processStore.processDetail.subCategory" @change="handleSubCategoryChange">
            <option value="">{{ t("common.select") }}</option>
            <option v-for="option in processStore.searchSubCategoryOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
                 <div class="form-group">
           <label>{{ t("process.processName") }}</label>
           <select v-model="processStore.processDetail.processName" @change="handleProcessNameChange">
             <option value="">{{ t("common.select") }}</option>
             <option v-for="option in processStore.searchProcessNameOptions" :key="option.value" :value="option.value">
               {{ option.label }}
             </option>
           </select>
           
         </div>
        
        <div class="form-group">
          <label>{{ t("process.processSymbol") }}</label>
          <div class="file-input-group">
            <input
              type="file"
              accept=".svg"
              @change="handleFileChange('processSymbol', $event)"
              style="display: none"
              ref="processSymbolInput"
            />
            <button type="button" @click="$refs.processSymbolInput.click()" class="file-select-btn">
              {{ t("common.selectFile") }}
            </button>
            <span class="selected-file">{{ getSelectedFilesText('processSymbol') || getProcessSymbolFileName() || t("common.noFile") }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="tabs-container">
      <div class="tabs-header" ref="tabsContainer">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          :class="['tab-button', { active: activeTab === index }]"
          @click="onTabClick(index)"
        >
          {{ tab }}
        </button>
      </div>

      <!-- 탭 내용 -->
      <div class="tab-content">
        <!-- 계산식 관리 탭 -->
        <div v-show="activeTab === 0" class="tab-panel">
          <div class="tab-header">
            <div class="tab-actions">
              <button @click="openFormulaModal" class="btn btn-primary">
                {{ t("common.add") }}
              </button>
              <button @click="handleFormulaDelete" class="btn btn-danger" :disabled="!selectedFormulaItems.length">
                {{ t("common.delete") }}
              </button>
            </div>
          </div>
          
          <DataTable
            :columns="formulaColumns"
            :data="processStore.formulaList"
            :selectable="true"
            @selection-change="handleFormulaSelectionChange"
          />
          
          <Pagination
            :current-page="1"
            :total-pages="1"
            :total-items="processStore.formulaList.length"
            @page-change="handleFormulaPageChange"
          />
        </div>

        <!-- 컴포넌트 탭 -->
        <div v-show="activeTab === 1" class="tab-panel">
          <div class="tab-header">
          </div>
          
          <DataTable
            :columns="structColumns"
            :data="processStore.structList"
            :selectable="false"
          />
          
          <Pagination
            :current-page="1"
            :total-pages="1"
            :total-items="processStore.structList.length"
            @page-change="handleStructPageChange"
          />
        </div>

        <!-- 수리계통도 탭 -->
        <div v-show="activeTab === 2" class="tab-panel">
          <div class="tab-header">
            <div class="tab-actions">
              <button @click="openHydraulicModal" class="btn btn-primary">
                {{ t("common.add") }}
              </button>
              <button @click="handleHydraulicDelete" class="btn btn-danger" :disabled="!selectedHydraulicItems.length">
                {{ t("common.delete") }}
              </button>
            </div>
          </div>
          
          <DataTable
            :columns="hydraulicColumns"
            :data="processStore.hydraulicList"
            :selectable="true"
            @selection-change="handleHydraulicSelectionChange"
          />
          
          <Pagination
            :current-page="1"
            :total-pages="1"
            :total-items="processStore.hydraulicList.length"
            @page-change="handleHydraulicPageChange"
          />
        </div>

        <!-- PFD 탭 -->
        <div v-show="activeTab === 3" class="tab-panel">
          <div class="tab-header">
            <div class="tab-actions">
              <button @click="openPfdModal" class="btn btn-primary">
                {{ t("common.add") }}
              </button>
              <button @click="handlePfdDelete" class="btn btn-danger" :disabled="!selectedPfdItems.length">
                {{ t("common.delete") }}
              </button>
            </div>
          </div>
          
          <DataTable
            :columns="pfdColumns"
            :data="processStore.pfdList"
            :selectable="true"
            @selection-change="handlePfdSelectionChange"
          >
            <template #cell-mappingPidList="{ item }">
              <button 
                class="btn btn-sm btn-outline-primary"
                @click="openMappingPidModal(item)"
              >
                보기
              </button>
            </template>
          </DataTable>
          
          <Pagination
            :current-page="1"
            :total-pages="1"
            :total-items="processStore.pfdList.length"
            @page-change="handlePfdPageChange"
          />
        </div>
      </div>
    </div>

    <!-- 계산식 파일 첨부 모달 -->
    <div v-if="processStore.showFormulaModal" class="modal-overlay" @click="closeFormulaModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t("process.formulaFileAttachment") }}</h3>
          <button @click="closeFormulaModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="file-input-group">
            <input
              type="file"
              multiple
              accept=".py"
              @change="handleFormulaFilesSelected"
              style="display: none"
              ref="formulaFileInput"
            />
            <button @click="$refs.formulaFileInput.click()" class="btn btn-primary">
              {{ t("common.selectFiles") }}
            </button>
            <span class="selected-files-info">
              {{ selectedFormulaFiles.length > 0 ? `${selectedFormulaFiles.length}개 파일 선택됨` : t("common.noFilesSelected") }}
            </span>
          </div>
          
          <div v-if="selectedFormulaFiles.length > 0" class="selected-files-list">
            <h4>{{ t("common.selectedFiles") }}:</h4>
            <ul>
              <li v-for="file in selectedFormulaFiles" :key="file.name">
                {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="uploadFormulaFiles" class="btn btn-primary" :disabled="!selectedFormulaFiles.length">
            {{ t("common.upload") }}
          </button>
          <button @click="closeFormulaModal" class="btn btn-secondary">
            {{ t("common.cancel") }}
          </button>
        </div>
      </div>
    </div>

    <!-- 수리계통도 파일 첨부 모달 -->
    <div v-if="showHydraulicModal" class="modal-overlay" @click="closeHydraulicModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t("process.hydraulicFileAttachment") }}</h3>
          <button @click="closeHydraulicModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="file-input-group">
            <input
              type="file"
              multiple
              accept=".dwg,.xlsx,.xls,.csv"
              @change="handleHydraulicFilesSelected"
              style="display: none"
              ref="hydraulicFileInput"
            />
            <button @click="$refs.hydraulicFileInput.click()" class="btn btn-primary">
              {{ t("common.selectFiles") }}
            </button>
            <span class="selected-files-info">
              {{ selectedHydraulicFiles.length > 0 ? `${selectedHydraulicFiles.length}개 파일 선택됨` : t("common.noFilesSelected") }}
            </span>
          </div>
          
          <div v-if="selectedHydraulicFiles.length > 0" class="selected-files-list">
            <h4>{{ t("common.selectedFiles") }}:</h4>
            <ul>
              <li v-for="file in selectedHydraulicFiles" :key="file.name">
                {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="uploadHydraulicFiles" class="btn btn-primary" :disabled="!selectedHydraulicFiles.length">
            {{ t("common.upload") }}
          </button>
          <button @click="closeHydraulicModal" class="btn btn-secondary">
            {{ t("common.cancel") }}
          </button>
        </div>
      </div>
    </div>

    <!-- PFD 파일 첨부 모달 -->
    <div v-if="showPfdModal" class="modal-overlay" @click="closePfdModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t("process.pfdFileAttachment") }}</h3>
          <button @click="closePfdModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="file-input-group">
            <input
              type="file"
              multiple
              accept=".dwg,.pdf,.png,.jpg,.jpeg"
              @change="handlePfdFilesSelected"
              style="display: none"
              ref="pfdFileInput"
            />
            <button @click="$refs.pfdFileInput.click()" class="btn btn-primary">
              {{ t("common.selectFiles") }}
            </button>
            <span class="selected-files-info">
              {{ selectedPfdFiles.length > 0 ? `${selectedPfdFiles.length}개 파일 선택됨` : t("common.noFilesSelected") }}
            </span>
          </div>
          
          <div v-if="selectedPfdFiles.length > 0" class="selected-files-list">
            <h4>{{ t("common.selectedFiles") }}:</h4>
            <ul>
              <li v-for="file in selectedPfdFiles" :key="file.name">
                {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="uploadPfdFiles" class="btn btn-primary" :disabled="!selectedPfdFiles.length">
            {{ t("common.upload") }}
          </button>
          <button @click="closePfdModal" class="btn btn-secondary">
            {{ t("common.cancel") }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- P&ID 매핑 목록 모달 -->
  <div v-if="showMappingPidModal" class="modal-overlay" @click="closeMappingPidModal">
    <div class="modal-content large-modal" @click.stop>
      <div class="modal-header">
        <h3>P&ID 목록</h3>
        <div class="modal-actions">
          <button class="btn btn-primary">Zip 등록</button>
          <button class="btn btn-primary" @click="addMappingPidRow">+ 행 추가</button>
          <button 
            class="btn btn-danger" 
            @click="deleteSelectedMappingPidItems"
            :disabled="selectedMappingPidItems.length === 0"
          >
            삭제
          </button>
          <button @click="closeMappingPidModal" class="modal-close">&times;</button>
        </div>
      </div>
      <div class="modal-body">
        <div class="mapping-pid-table">
          <table class="pid-table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    @change="handleSelectAllMappingPid"
                    :checked="selectedMappingPidItems.length === mappingPidList.length && mappingPidList.length > 0"
                    :indeterminate="selectedMappingPidItems.length > 0 && selectedMappingPidItems.length < mappingPidList.length"
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
              <tr v-for="(item, index) in mappingPidList" :key="item.id" :class="{ 'alternate-row': index % 2 === 1 }">
                <td>
                  <input 
                    type="checkbox" 
                    :value="item"
                    v-model="selectedMappingPidItems"
                    @change="handleMappingPidSelectionChange"
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
                      <span v-else class="no-file">{{ t("common.noFile") }}</span>
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
                      <span v-else class="no-file">{{ t("common.noFile") }}</span>
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
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProcessStore } from '@/stores/processStore';
import DataTable from '@/components/common/DataTable.vue';
import Pagination from '@/components/common/Pagination.vue';
import type { TableColumn } from '@/types/components';
import { request } from '@/utils/request';

// Props 정의
interface Props {
  processId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  processId: ''
});

// Emits 정의
const emit = defineEmits<{
  'update-success': [];
}>();

// Composables
const route = useRoute();
const { t } = useI18n();
const processStore = useProcessStore();

// Reactive references
const activeTab = ref(0);
const selectedFormulaItems = ref<any[]>([]);
const selectedHydraulicItems = ref<any[]>([]);
const selectedPfdItems = ref<any[]>([]);
const selectedFormulaFiles = ref<File[]>([]);
const selectedHydraulicFiles = ref<File[]>([]);
const selectedPfdFiles = ref<File[]>([]);

// P&ID 매핑 모달 관련 상태
const showMappingPidModal = ref(false);
const currentPfdItemForMapping = ref<any>(null);
const mappingPidList = ref<any[]>([]);
const selectedMappingPidItems = ref<any[]>([]);

// 언어 및 단위 선택
const selectedLanguage = ref('');
const selectedUnit = ref('');

// 탭 설정
const tabs = ref([
  "계산식 관리",
  "컴포넌트",
  "수리계통도",
  "PFD",
]);

// 컬럼 정의
const formulaColumns: TableColumn[] = [
  { key: "no", title: "순번", sortable: true },
  { key: "registeredFormula", title: "등록 계산식", sortable: true },
  { key: "registrationDate", title: "등록일자", sortable: true, dateFormat: "YYYY-MM-DD" },
  { key: "infoOverview", title: "정보 개요", sortable: true },
  { key: "remarks", title: "비고", sortable: true }
];

const structColumns: TableColumn[] = [
  { key: "division", title: "구분", sortable: true },
  { key: "components", title: "Components", sortable: true },
  { key: "type", title: "유형", sortable: true },
  { key: "inputItem", title: "입력Item", sortable: true }
];

const hydraulicColumns: TableColumn[] = [
  { key: "no", title: "순번", sortable: true },
  { key: "dwg", title: "도면파일 DWG", sortable: true },
  { key: "registrationDate", title: "등록일자", sortable: true, dateFormat: "YYYY-MM-DD" },
  { key: "infoOverview", title: "정보개요", sortable: true },
  { key: "svgPreview", title: "Svg 도면 미리보기", sortable: false },
  { key: "drawing_id", title: "Drawing ID", sortable: false, hidden: true }
];

const pfdColumns: TableColumn[] = [
  { key: "pfdFileName", title: "PFD 파일명", sortable: true },
  { key: "registrationDate", title: "등록일자", sortable: true, dateFormat: "YYYY-MM-DD" },
  { key: "infoOverview", title: "정보개요", sortable: true },
  { key: "mappingPidList", title: "매핑 P&ID 목록", sortable: false },
  { key: "remarks", title: "비고", sortable: true }
];

// P&ID 매핑 목록 컬럼 정의
const mappingPidColumns: TableColumn[] = [
  { key: "no", title: "No.", sortable: false },
  { key: "pidFile", title: "P&ID (*)", sortable: false },
  { key: "mappingExcel", title: "매핑 Excel (*)", sortable: false },
  { key: "svgFile", title: "SVG 파일", sortable: false },
  { key: "infoOverview", title: "정보개요(기기명+대수)", sortable: false },
  { key: "svgPreview", title: "Svg 도면 미리보기", sortable: false }
];

// 유틸리티 함수들
const extractFileNameFromUri = (uri: string): string => {
  if (!uri) return '';
  const parts = uri.split('/');
  return parts[parts.length - 1] || uri;
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// API 함수들
const searchPfdDrawingAPI = async (processId: string) => {
  try {
    console.log('PFD 도면 검색 API 호출 시작 - 엔드포인트: /process/drawing_files/list');
    
    if (!processId) {
      console.warn('processId가 없어서 PFD 도면 검색을 건너뜁니다.');
      return [];
    }
    
    const requestBody = {
      process_id: processId,
      drawing_type: 'PFD'
    };
    
    console.log('PFD 도면 검색 요청 데이터:', requestBody);
    
    const response = await request('/process/drawing_files/list', {}, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('PFD 도면 검색 API 응답:', response);
    console.log('PFD 도면 검색 API 응답.response:', response.response);
    console.log('PFD 도면 검색 API 응답.response 타입:', typeof response.response);
    console.log('PFD 도면 검색 API 응답.response 길이:', response.response?.length);

    if (!response.success) {
      console.error('PFD 도면 검색 API 응답 오류:', response);
      return [];
    }

    const pfdItems = response.response?.map((item: any, index: number) => {
      console.log(`PFD 아이템 ${index + 1}:`, item);
      return {
        id: `pfd-${index + 1}`,
        pfdFileName: item.file_name || item.drawing_name || 'PFD 파일',
        registrationDate: item.created_at || item.uploaded_at || formatDate(new Date()),
        infoOverview: item.drawing_title || item.info_overview || '',
        mappingPidList: '보기',
        remarks: item.remarks || '',
        drawing_id: item.drawing_id || item.id
      };
    }) || [];

    console.log('PFD 도면 데이터 변환 결과:', pfdItems);
    return pfdItems;
  } catch (error) {
    console.error('PFD 도면 검색 API 호출 실패:', error);
    return [];
  }
};

const searchHydraulicDrawingAPI = async (processId: string) => {
  try {
    console.log('수리계통도 도면 검색 API 호출 시작 - 엔드포인트: /api/v1/minio/drawing_files/list');
    
    if (!processId) {
      console.warn('processId가 없어서 수리계통도 도면 검색을 건너뜁니다.');
      return [];
    }
    
    const requestBody = {
      process_id: processId,
      drawing_type: 'HYD_DIAG'
    };
    
    console.log('수리계통도 도면 검색 요청 데이터:', requestBody);
    
    const response = await request('/api/v1/minio/drawing_files/list', {}, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('수리계통도 도면 검색 API 응답:', response);

    if (!response.success) {
      console.error('수리계통도 도면 검색 API 응답 오류:', response);
      
      // 실제 인증 오류인지 확인
      const isAuthError = response.status === 401 || 
                         response.message?.includes('Authentication required') ||
                         response.message?.includes('세션이 만료되었습니다') ||
                         response.response?.error_code === 'SESSION_REQUIRED';
      
      if (isAuthError) {
        console.warn('⚠️ 인증이 만료되었습니다. 로그인이 필요합니다.');
        return [];
      }
      
      // 404 오류인 경우 처리
      if (response.status === 404 || (response.status === 400 && response.message?.includes('Not Found'))) {
        console.log('수리계통도 도면 검색 API 엔드포인트가 존재하지 않습니다. 임시 더미 데이터로 초기화합니다.');
        console.warn('⚠️ /api/v1/minio/drawing_files/list API가 구현되지 않았습니다. 백엔드 개발자에게 문의하세요.');
        
        // 임시로 더미 데이터 반환
        return [
          {
            id: 'hydraulic_1',
            file_name: 'HYD_DIAG_001.dwg',
            file_uri: '/uploads/drawings/HYD_DIAG_001.dwg',
            created_at: '2024-01-15',
            info_overview: '수리계통도 도면 1',
            svg_preview: '/previews/HYD_DIAG_001.svg'
          },
          {
            id: 'hydraulic_2',
            file_name: 'HYD_DIAG_002.dwg',
            file_uri: '/uploads/drawings/HYD_DIAG_002.dwg',
            created_at: '2024-01-20',
            info_overview: '수리계통도 도면 2',
            svg_preview: '/previews/HYD_DIAG_002.svg'
          }
        ];
      }
      
      console.error('수리계통도 도면 검색 API 호출 실패:', response);
      return [];
    }
    
    // 성공적인 응답 처리
    if (response.data && Array.isArray(response.data)) {
      console.log('수리계통도 도면 검색 성공:', response.data.length, '개 파일');
      return response.data;
    } else if (response.response && Array.isArray(response.response)) {
      console.log('수리계통도 도면 검색 성공 (response 필드):', response.response.length, '개 파일');
      return response.response;
    } else {
      console.log('수리계통도 도면 검색 응답에 데이터가 없습니다.');
      return [];
    }
    
  } catch (error: any) {
    console.error('수리계통도 도면 검색 API 호출 실패:', error);
    return [];
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
      search_field: "process_id",
      search_value: processId + "", // 동적으로 process_id 사용 (API에서 process_id 를 string으로 인식하고 있어 ""추가)
      order_by: "created_at"
      //process_id: processId // 동적으로 process_id 사용
    };
    
    console.log('요청 데이터:', requestBody);
    console.log('사용된 processId:', processId);
    
    const response = await request('/api/process/formula/search', {}, {
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
  } catch (error: any) {
    console.error('계산식 검색 API 호출 실패:', error);
    
    // 네트워크 오류나 기타 오류 시에도 빈 데이터 반환
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
      console.log('네트워크 오류로 인해 빈 데이터로 초기화합니다.');
      return { data: [] };
    }
    
    // 기타 오류 시에도 빈 데이터 반환하여 화면이 정상적으로 로드되도록 함
    console.log('API 호출 실패로 인해 빈 데이터로 초기화합니다.');
    return { data: [] };
  }
};

const createFormulaAPI = async (processId: string, formulaName: string, formulaCode: string, siteFile?: File) => {
  try {
    const formData = new FormData();
    formData.append('process_id', processId);
    formData.append('formula_name', formulaName);
    formData.append('formula_code', formulaCode);
    if (siteFile) {
      formData.append('siteFile', siteFile);
    }

    const response = await request('/api/process/formula/create', formData, {
      method: 'POST',
      headers: {
        'user_Id': localStorage.getItem('authUserId') || '',
        'wai_lang': localStorage.getItem('wai_lang') || 'ko'
      }
    });

    if (!response.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = response;
    console.log('계산식 생성 API 응답:', data);
    return data;
  } catch (error: any) {
    console.error('계산식 생성 API 호출 실패:', error);
    throw error;
  }
};

const deleteFormulaAPI = async (formulaId: string) => {
  try {
    const response = await request(`/api/process/formula/delete/${formulaId}`, {}, {
      method: 'DELETE',
      headers: {
        'user_Id': localStorage.getItem('authUserId') || '',
        'wai_lang': localStorage.getItem('wai_lang') || 'ko'
      }
    });

    if (!response.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = response;
    console.log('계산식 삭제 API 응답:', data);
    return data;
  } catch (error: any) {
    console.error('계산식 삭제 API 호출 실패:', error);
    throw error;
  }
};

// 이벤트 핸들러들
const handleProcessTypeChange = () => {
  if (processStore.processDetail.processType) {
    processStore.loadSubCategoryCodes(processStore.processDetail.processType);
  }
  processStore.processDetail.subCategory = '';
  processStore.processDetail.processName = '';
};

const handleSubCategoryChange = () => {
  if (processStore.processDetail.processType && processStore.processDetail.subCategory) {
    processStore.loadProcessNameCodes(processStore.processDetail.subCategory);
  }
  processStore.processDetail.processName = '';
};

const handleProcessNameChange = () => {
  console.log('공정명 변경:', processStore.processDetail.processName);
};

const handleLanguageChange = () => {
  console.log('언어 변경:', selectedLanguage.value);
  // 언어 변경 시 필요한 로직 추가
};

const handleUnitChange = () => {
  console.log('단위 변경:', selectedUnit.value);
  // 단위 변경 시 필요한 로직 추가
};

const handleFileChange = async (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    if (key === 'processSymbol') {
      if (!file.name.toLowerCase().endsWith('.svg')) {
        alert('SVG 파일만 선택할 수 있습니다. 다시 선택해주세요.');
        target.value = '';
        return;
      }
    }
    
    processStore.setSelectedFile(key, file);
    
    if (key === 'processSymbol') {
      console.log('공정심볼 파일 선택됨:', file.name);
      
      if (!processStore.processDetail.originalProcessSymbol) {
        const currentSymbol = processStore.processDetail.processSymbol;
        const currentSymbolId = processStore.processDetail.symbolId;
        
        processStore.setProcessDetail({
          originalProcessSymbol: currentSymbol,
          originalSymbolId: currentSymbolId
        });
      }
      
      // 경로 제외 파일명만 저장
      const fileName = file.name.split('/').pop() || file.name;
      processStore.setProcessDetail({ processSymbol: fileName });
    }
  }
};

const getSelectedFilesText = (key: string) => {
  if (key === 'processSymbol' && processStore.selectedFiles['processSymbol']) {
    const fileName = processStore.selectedFiles['processSymbol'].name;
    // 경로 제외 파일명만 반환
    return fileName.split('/').pop() || fileName;
  }
  return '';
};

const getProcessSymbolFileName = () => {
  const processSymbol = processStore.processDetail.processSymbol;
  console.log('getProcessSymbolFileName - processSymbol:', processSymbol);
  console.log('getProcessSymbolFileName - processSymbol 타입:', typeof processSymbol);
  
  // null, undefined, 빈 문자열 체크
  if (processSymbol && processSymbol !== null && processSymbol !== undefined && processSymbol.trim() !== '') {
    // symbol_uri 전체 경로를 그대로 반환 (API 응답의 실제 저장 경로)
    console.log('getProcessSymbolFileName - symbol_uri 전체 경로:', processSymbol);
    return processSymbol;
  }
  console.log('getProcessSymbolFileName - processSymbol이 null이거나 빈 값');
  return '';
};

// 탭 관련 함수들
const onTabClick = (index: number) => {
  activeTab.value = index;
};

// 모달 관련 함수들
const openFormulaModal = () => {
  processStore.setShowFormulaModal(true);
  selectedFormulaFiles.value = [];
};

const closeFormulaModal = () => {
  processStore.setShowFormulaModal(false);
  selectedFormulaFiles.value = [];
};

const showHydraulicModal = ref(false);
const showPfdModal = ref(false);

const openHydraulicModal = () => {
  showHydraulicModal.value = true;
  selectedHydraulicFiles.value = [];
};

const closeHydraulicModal = () => {
  showHydraulicModal.value = false;
  selectedHydraulicFiles.value = [];
};

const openPfdModal = () => {
  showPfdModal.value = true;
  selectedPfdFiles.value = [];
};

const closePfdModal = () => {
  showPfdModal.value = false;
  selectedPfdFiles.value = [];
};

// 파일 선택 핸들러들
const handleFormulaFilesSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const fileArray = Array.from(target.files);
    
    // Python 파일만 필터링
    const formulaFiles = fileArray.filter(file =>
      file.name.toLowerCase().endsWith('.py')
    );
    
    const unsupportedFiles = fileArray.filter(file =>
      !file.name.toLowerCase().endsWith('.py')
    );
    
    if (unsupportedFiles.length > 0) {
      alert(`Python 파일(.py)만 선택 가능합니다.\n\n선택된 파일 중 지원하지 않는 파일:\n${unsupportedFiles.map(f => f.name).join('\n')}`);
    }
    
    selectedFormulaFiles.value = formulaFiles;
    console.log("Selected Formula files (Python only):", selectedFormulaFiles.value);
  }
};

const handleHydraulicFilesSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const fileArray = Array.from(target.files);
    selectedHydraulicFiles.value = fileArray;
    console.log("Selected Hydraulic files:", selectedHydraulicFiles.value);
  }
};

const handlePfdFilesSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const fileArray = Array.from(target.files);
    
    // PFD 관련 파일만 필터링
    const pfdFiles = fileArray.filter(file => {
      const fileName = file.name.toLowerCase();
      return fileName.endsWith('.dwg') || 
             fileName.endsWith('.pdf') || 
             fileName.endsWith('.png') || 
             fileName.endsWith('.jpg') || 
             fileName.endsWith('.jpeg');
    });
    
    const unsupportedFiles = fileArray.filter(file => {
      const fileName = file.name.toLowerCase();
      return !fileName.endsWith('.dwg') && 
             !fileName.endsWith('.pdf') && 
             !fileName.endsWith('.png') && 
             !fileName.endsWith('.jpg') && 
             !fileName.endsWith('.jpeg');
    });
    
    if (unsupportedFiles.length > 0) {
      alert(`PFD 관련 파일(.dwg, .pdf, .png, .jpg, .jpeg)만 선택 가능합니다.\n\n선택된 파일 중 지원하지 않는 파일:\n${unsupportedFiles.map(f => f.name).join('\n')}`);
    }
    
    selectedPfdFiles.value = pfdFiles;
    console.log("Selected PFD files:", selectedPfdFiles.value);
  }
};

// 파일 업로드 함수들
const uploadFormulaFiles = () => {
  if (selectedFormulaFiles.value.length === 0) {
    alert('업로드할 파일을 선택해주세요.');
    return;
  }

  const newFormulaItems = selectedFormulaFiles.value.map((file, index) => {
    return {
      id: `formula_${Date.now()}_${index}`,
      no: (processStore.formulaList.length + index + 1).toString().padStart(3, '0'),
      registeredFormula: file.name.replace('.py', ''),
      formula_code: '',
      registrationDate: formatDate(new Date()),
      infoOverview: '',
      remarks: '',
      _file: file
    };
  });

  const updatedFormulaList = [...processStore.formulaList, ...newFormulaItems];
  processStore.setFormulaList(updatedFormulaList);
  
  console.log('계산식 파일 업로드 완료:', newFormulaItems.length, '개');
  alert(`계산식 파일 ${newFormulaItems.length}개가 그리드에 추가되었습니다.`);
  
  closeFormulaModal();
};

const uploadHydraulicFiles = () => {
  if (selectedHydraulicFiles.value.length === 0) {
    alert('업로드할 파일을 선택해주세요.');
    return;
  }

  const newHydraulicItems = selectedHydraulicFiles.value.map((file, index) => {
    return {
      id: `hydraulic_${Date.now()}_${index}`,
      dwg: file.name.toLowerCase().endsWith('.dwg') ? file.name : '',
      xlsx: file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') ? file.name : '',
      csv: file.name.toLowerCase().endsWith('.csv') ? file.name : '',
      remarks: '',
      _file: file,
      drawing_id: `temp_drawing_${Date.now()}_${index}`
    };
  });

  const updatedHydraulicList = [...processStore.hydraulicList, ...newHydraulicItems];
  processStore.setHydraulicList(updatedHydraulicList);
  
  console.log('수리계통도 파일 업로드 완료:', newHydraulicItems.length, '개');
  alert(`수리계통도 파일 ${newHydraulicItems.length}개가 그리드에 추가되었습니다.`);
  
  closeHydraulicModal();
};

const uploadPfdFiles = () => {
  if (selectedPfdFiles.value.length === 0) {
    alert('업로드할 파일을 선택해주세요.');
    return;
  }

  const newPfdItems = selectedPfdFiles.value.map((file, index) => {
    return {
      id: `pfd_${Date.now()}_${index}`,
      pfdFileName: file.name,
      registrationDate: formatDate(new Date()),
      infoOverview: '',
      mappingPidList: '보기',
      remarks: '',
      _file: file,
      drawing_id: `temp_pfd_drawing_${Date.now()}_${index}`
    };
  });

  const updatedPfdList = [...processStore.pfdList, ...newPfdItems];
  processStore.setPfdList(updatedPfdList);
  
  console.log('PFD 파일 업로드 완료:', newPfdItems.length, '개');
  alert(`PFD 파일 ${newPfdItems.length}개가 그리드에 추가되었습니다.\n저장 버튼을 클릭하면 서버에도 반영됩니다.`);
  
  closePfdModal();
};

// 선택 관련 함수들
const handleFormulaSelectionChange = (items: any[]) => {
  selectedFormulaItems.value = items;
};

const handleHydraulicSelectionChange = (items: any[]) => {
  selectedHydraulicItems.value = items;
};

const handlePfdSelectionChange = (items: any[]) => {
  selectedPfdItems.value = items;
};

// 삭제 함수들
const handleFormulaDelete = () => {
  if (selectedFormulaItems.value.length === 0) {
    alert('삭제할 항목을 선택해주세요.');
    return;
  }

  const confirmed = confirm(`선택된 계산식 ${selectedFormulaItems.value.length}개를 삭제하시겠습니까?`);
  if (!confirmed) return;

  const updatedList = processStore.formulaList.filter(
    item => !selectedFormulaItems.value.some(selected => selected.id === item.id)
  );
  processStore.setFormulaList(updatedList);
  selectedFormulaItems.value = [];
  
  console.log('계산식 그리드에서 삭제 완료:', selectedFormulaItems.value.length, '개');
  alert('선택된 계산식이 그리드에서 삭제되었습니다.\n저장 버튼을 클릭하면 서버에도 반영됩니다.');
};



const handleHydraulicDelete = () => {
  if (selectedHydraulicItems.value.length === 0) {
    alert('삭제할 항목을 선택해주세요.');
    return;
  }

  const confirmed = confirm(`선택된 수리계통도 ${selectedHydraulicItems.value.length}개를 삭제하시겠습니까?`);
  if (!confirmed) return;

  const updatedList = processStore.hydraulicList.filter(
    item => !selectedHydraulicItems.value.some(selected => selected.id === item.id)
  );
  processStore.setHydraulicList(updatedList);
  selectedHydraulicItems.value = [];
  
  console.log('수리계통도 그리드에서 삭제 완료:', selectedHydraulicItems.value.length, '개');
  alert('선택된 수리계통도가 그리드에서 삭제되었습니다.\n저장 버튼을 클릭하면 서버에도 반영됩니다.');
};

const handlePfdDelete = () => {
  if (selectedPfdItems.value.length === 0) {
    alert('삭제할 항목을 선택해주세요.');
    return;
  }

  const confirmed = confirm(`선택된 PFD ${selectedPfdItems.value.length}개를 삭제하시겠습니까?`);
  if (!confirmed) return;

  const updatedList = processStore.pfdList.filter(
    item => !selectedPfdItems.value.some(selected => selected.id === item.id)
  );
  processStore.setPfdList(updatedList);
  selectedPfdItems.value = [];
  
  console.log('PFD 그리드에서 삭제 완료:', selectedPfdItems.value.length, '개');
  alert('선택된 PFD가 그리드에서 삭제되었습니다.\n저장 버튼을 클릭하면 서버에도 반영됩니다.');
};

// 페이지네이션 핸들러들
const handleFormulaPageChange = (page: number) => {
  console.log('계산식 페이지 변경:', page);
};

const handleStructPageChange = (page: number) => {
  console.log('컴포넌트 페이지 변경:', page);
};

const handleHydraulicPageChange = (page: number) => {
  console.log('수리계통도 페이지 변경:', page);
};

const handlePfdPageChange = (page: number) => {
  console.log('PFD 페이지 변경:', page);
};



// 메인 업데이트 함수
const handleUpdate = async () => {
  try {
    console.log("공정 수정 처리 시작");
    
    const processId = props.processId || (route.params.id as string);
    
    if (!processId) {
      throw new Error("공정 ID가 없습니다.");
    }
    
    let hasAnyChanges = false;
    
    // 공정심볼 파일 변경 감지
    const hasProcessSymbolChanged = processStore.selectedFiles['processSymbol'] !== undefined;
    if (hasProcessSymbolChanged) {
      hasAnyChanges = true;
      console.log('공정심볼 파일 변경 감지됨');
      
      // processDetail에 siteFile 추가
      const symbolFile = processStore.selectedFiles['processSymbol'];
      processStore.setProcessDetail({
        siteFile: symbolFile
      });
      
      console.log('processDetail에 siteFile 설정:', symbolFile.name);
    }
    
    // 공정 정보 업데이트
    if (hasAnyChanges) {
      try {
        await processStore.updateProcess(processId, processStore.processDetail);
        
        // 업데이트 성공 후 선택된 파일 상태 초기화
        if (hasProcessSymbolChanged) {
          const updatedSelectedFiles = { ...processStore.selectedFiles };
          delete updatedSelectedFiles['processSymbol'];
          processStore.setSelectedFiles(updatedSelectedFiles);
          
          // processDetail에서 siteFile 제거
          processStore.setProcessDetail({
            siteFile: null
          });
          
          console.log('업데이트 성공 후 파일 상태 초기화 완료');
        }
        console.log("공정 정보 업데이트 완료");
      } catch (updateError: any) {
        console.error("공정 정보 업데이트 실패:", updateError);
        throw updateError;
      }
    }
    
    // 계산식 그리드 처리
    if (processStore.initialFormulaList && processStore.formulaList) {
             const deletedRows = processStore.initialFormulaList.filter(initialItem => {
         return initialItem.formula_id && !processStore.formulaList.some(currentItem => 
           currentItem.formula_id && currentItem.formula_id === initialItem.formula_id
         );
       });
       
       const addedRows = processStore.formulaList.filter(currentItem => {
         if (currentItem.id.startsWith('formula_')) return true;
         return currentItem.formula_id && !processStore.initialFormulaList.some(initialItem => 
           initialItem.formula_id && initialItem.formula_id === currentItem.formula_id
         );
       });
      
      if (deletedRows.length > 0 || addedRows.length > 0) {
        hasAnyChanges = true;
        
                 // 삭제된 행 처리
         if (deletedRows.length > 0) {
           try {
             const deletePromises = deletedRows.map(row => {
               if (row.formula_id) {
                 return deleteFormulaAPI(row.formula_id);
               }
               return Promise.resolve();
             }).filter(promise => promise !== Promise.resolve());
             await Promise.all(deletePromises);
             console.log("삭제된 계산식 처리 완료");
           } catch (error) {
             console.error("계산식 삭제 실패:", error);
           }
         }
        
        // 추가된 행 처리
        if (addedRows.length > 0) {
          try {
            const formulaPromises = addedRows.map(formula => 
              createFormulaAPI(processId, formula.registeredFormula, formula.formula_code || '', (formula as any)._file)
            );
            await Promise.all(formulaPromises);
            console.log("추가된 계산식 처리 완료");
          } catch (error) {
            console.error("계산식 추가 실패:", error);
          }
        }
      }
    }
    
    // 수리계통도 그리드 처리
    if (processStore.initialHydraulicList && processStore.hydraulicList) {
      const deletedHydraulicRows = processStore.initialHydraulicList.filter(initialItem => {
        if (!initialItem.drawing_id) return false;
        return !processStore.hydraulicList.some(currentItem => 
          currentItem.drawing_id && currentItem.drawing_id === initialItem.drawing_id
        );
      });
      
      const addedHydraulicRows = processStore.hydraulicList.filter(currentItem => {
        if (currentItem.id.startsWith('hydraulic_')) return true;
        if (!currentItem.drawing_id) return false;
        return !processStore.initialHydraulicList.some(initialItem => 
          initialItem.drawing_id && initialItem.drawing_id === currentItem.drawing_id
        );
      });
      
      if (deletedHydraulicRows.length > 0 || addedHydraulicRows.length > 0) {
        hasAnyChanges = true;
        
        // 삭제된 행 처리
        if (deletedHydraulicRows.length > 0) {
          try {
            const deletePromises = deletedHydraulicRows.map(async (row) => {
              if (!row.drawing_id) return null;
              const response = await request(`/api/process/drawing/delete/${row.drawing_id}`, {}, {
                method: 'DELETE',
                headers: {
                  'user_Id': localStorage.getItem('authUserId') || '',
                  'wai_lang': localStorage.getItem('wai_lang') || 'ko'
                }
              });
              if (!response.success) throw new Error(`HTTP error! status: ${response.status}`);
              return { success: true, drawing_id: row.drawing_id };
            });
            await Promise.all(deletePromises);
            console.log("삭제된 수리계통도 처리 완료");
          } catch (error) {
            console.error("수리계통도 삭제 실패:", error);
          }
        }
        
        // 추가된 행 처리
        if (addedHydraulicRows.length > 0) {
          try {
            for (const hydraulicItem of addedHydraulicRows) {
              if (!hydraulicItem._file) continue;
              
              const formData = new FormData();
              formData.append('process_id', processId);
              formData.append('siteFile', hydraulicItem._file);
              formData.append('remarks', hydraulicItem.remarks || '');
              
              // FormData 디버깅
              console.log('FormData 내용:');
              console.log('process_id:', processId);
              console.log('file:', hydraulicItem._file);
              console.log('file name:', hydraulicItem._file.name);
              console.log('file size:', hydraulicItem._file.size);
              console.log('file type:', hydraulicItem._file.type);
              console.log('remarks:', hydraulicItem.remarks || '');
              
              // FormData entries 확인
              for (let [key, value] of (formData as any).entries()) {
                console.log(`${key}:`, value);
              }
              
              const response = await request('/api/process/drawing/create', formData, {
                method: 'POST',
                headers: {
                  'user_Id': localStorage.getItem('authUserId') || '',
                  'wai_lang': localStorage.getItem('wai_lang') || 'ko'
                },
                skipContentType: true // FormData 전송 시 Content-Type 헤더 자동 설정 방지
              });
              
              if (!response.success) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const responseData = response;
              console.log('수리계통도 도면 생성 API 응답:', responseData);
              
              if (responseData.drawing_id) {
                const updatedHydraulicList = processStore.hydraulicList.map(item => {
                  if (item.id === hydraulicItem.id) {
                    return { ...item, drawing_id: responseData.drawing_id };
                  }
                  return item;
                });
                processStore.setHydraulicList(updatedHydraulicList);
              }
            }
            console.log("추가된 수리계통도 처리 완료");
          } catch (error) {
            console.error("수리계통도 추가 실패:", error);
          }
        }
      }
    }
    
    // PFD 그리드 처리
    if (processStore.initialPfdList && processStore.pfdList) {
      const deletedPfdRows = processStore.initialPfdList.filter(initialItem => {
        if (!initialItem.drawing_id) return false;
        return !processStore.pfdList.some(currentItem => 
          currentItem.drawing_id && currentItem.drawing_id === initialItem.drawing_id
        );
      });
      
      const addedPfdRows = processStore.pfdList.filter(currentItem => {
        if (currentItem.id.startsWith('pfd_')) return true;
        if (!currentItem.drawing_id) return false;
        return !processStore.initialPfdList.some(initialItem => 
          initialItem.drawing_id && initialItem.drawing_id === initialItem.drawing_id
        );
      });
      
      if (deletedPfdRows.length > 0 || addedPfdRows.length > 0) {
        hasAnyChanges = true;
        
        // 삭제된 행 처리
        if (deletedPfdRows.length > 0) {
          try {
            const deletePromises = deletedPfdRows.map(async (row) => {
              if (!row.drawing_id) return null;
              const response = await request(`/api/process/drawing/delete/${row.drawing_id}`, {}, {
                method: 'DELETE',
                headers: {
                  'user_Id': localStorage.getItem('authUserId') || '',
                  'wai_lang': localStorage.getItem('wai_lang') || 'ko'
                }
              });
              if (!response.success) throw new Error(`HTTP error! status: ${response.status}`);
              return { success: true, drawing_id: row.drawing_id };
            });
            await Promise.all(deletePromises);
            console.log("삭제된 PFD 처리 완료");
          } catch (error) {
            console.error("PFD 삭제 실패:", error);
          }
        }
        
        // 추가된 행 처리
        if (addedPfdRows.length > 0) {
          try {
            for (const pfdItem of addedPfdRows) {
              if (!pfdItem._file) continue;
              
              const formData = new FormData();
              formData.append('process_id', processId);
              formData.append('siteFile', pfdItem._file);
              formData.append('remarks', pfdItem.remarks || '');
              
              // FormData 디버깅
              console.log('PFD FormData 내용:');
              console.log('process_id:', processId);
              console.log('file:', pfdItem._file);
              console.log('file name:', pfdItem._file.name);
              console.log('file size:', pfdItem._file.size);
              console.log('file type:', pfdItem._file.type);
              console.log('remarks:', pfdItem.remarks || '');
              
              // FormData entries 확인
              for (let [key, value] of (formData as any).entries()) {
                console.log(`${key}:`, value);
              }
              
              const response = await request('/api/process/drawing/create', formData, {
                method: 'POST',
                headers: {
                  'user_Id': localStorage.getItem('authUserId') || '',
                  'wai_lang': localStorage.getItem('wai_lang') || 'ko'
                },
                skipContentType: true // FormData 전송 시 Content-Type 헤더 자동 설정 방지
              });
              
              if (!response.success) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const responseData = response;
              console.log('PFD 도면 생성 API 응답:', responseData);
              
              if (responseData.drawing_id) {
                const updatedPfdList = processStore.pfdList.map(item => {
                  if (item.id === pfdItem.id) {
                    return { ...item, drawing_id: responseData.drawing_id };
                  }
                  return item;
                });
                processStore.setPfdList(updatedPfdList);
              }
            }
            console.log("추가된 PFD 처리 완료");
          } catch (error) {
            console.error("PFD 추가 실패:", error);
          }
        }
      }
    }
    
    if (hasAnyChanges) {
      alert("공정 수정이 완료되었습니다.");
      emit('update-success');
    } else {
      alert("변경사항이 없습니다.");
    }
    
  } catch (error: any) {
    console.error("공정 수정 실패:", error);
    alert(`공정 수정 실패: ${error.message}`);
  }
};

// P&ID 매핑 모달 관련 함수들
const openMappingPidModal = async (pfdItem: any) => {
  console.log('P&ID 매핑 모달 열기:', pfdItem);
  currentPfdItemForMapping.value = pfdItem;
  selectedMappingPidItems.value = []; // 선택된 항목들 초기화
  showMappingPidModal.value = true;
  
  // P&ID 목록 데이터 로드
  await loadMappingPidList(pfdItem);
};

const closeMappingPidModal = () => {
  showMappingPidModal.value = false;
  currentPfdItemForMapping.value = null;
  mappingPidList.value = [];
  selectedMappingPidItems.value = []; // 선택된 항목들 초기화
};

const loadMappingPidList = async (pfdItem: any) => {
  try {
    console.log('P&ID 매핑 목록 로드 시작:', pfdItem);
    
    // 임시 데이터 (실제 API 호출로 대체 필요)
    const mockData = [
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
    
    mappingPidList.value = mockData;
    console.log('P&ID 매핑 목록 로드 완료:', mappingPidList.value);
  } catch (error) {
    console.error('P&ID 매핑 목록 로드 실패:', error);
    mappingPidList.value = [];
  }
};

// P&ID 매핑 모달 추가 함수들
const addMappingPidRow = () => {
  const newRow = {
    id: `mapping_${Date.now()}`,
    no: mappingPidList.value.length + 1,
    pidFileName: '',
    excelFileName: '',
    svgStatus: '대기',
    infoOverview: '예: 펌프, 2대'
  };
  mappingPidList.value.push(newRow);
};

const selectPidFile = (item: any) => {
  currentPfdItemForMapping.value = item;
  (document.querySelector('input[ref="pidFileInput"]') as HTMLInputElement)?.click();
};

const selectExcelFile = (item: any) => {
  currentPfdItemForMapping.value = item;
  (document.querySelector('input[ref="excelFileInput"]') as HTMLInputElement)?.click();
};

const handlePidFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentPfdItemForMapping.value) {
    const file = target.files[0];
    currentPfdItemForMapping.value.pidFileName = file.name;
    console.log('P&ID 파일 선택됨:', file.name);
  }
};

const handleExcelFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentPfdItemForMapping.value) {
    const file = target.files[0];
    currentPfdItemForMapping.value.excelFileName = file.name;
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

// P&ID 매핑 목록 체크박스 관련 함수들
const handleSelectAllMappingPid = () => {
  if (selectedMappingPidItems.value.length === mappingPidList.value.length) {
    selectedMappingPidItems.value = [];
  } else {
    selectedMappingPidItems.value = [...mappingPidList.value];
  }
};

const handleMappingPidSelectionChange = () => {
  console.log('선택된 P&ID 항목들:', selectedMappingPidItems.value);
};

const deleteSelectedMappingPidItems = () => {
  if (selectedMappingPidItems.value.length === 0) {
    alert('삭제할 항목을 선택해주세요.');
    return;
  }
  
  if (confirm(`선택된 ${selectedMappingPidItems.value.length}개 항목을 삭제하시겠습니까?`)) {
    const selectedIds = selectedMappingPidItems.value.map(item => item.id);
    mappingPidList.value = mappingPidList.value.filter(item => !selectedIds.includes(item.id));
    selectedMappingPidItems.value = [];
    console.log('선택된 P&ID 항목들 삭제 완료');
  }
};

// 컴포넌트 외부에서 사용할 수 있는 메서드들
defineExpose({ t, handleUpdate });

// 컴포넌트 마운트 시 실행
onMounted(async () => {
  try {
    const processId = props.processId || (route.params.id as string);
    console.log('ProcessDetail 컴포넌트 마운트 - processId:', processId);
    
    if (processId) {
             // 공정 상세 정보 로드
       console.log('공정 상세 정보 로드 시작...');
       await processStore.searchProcessById(processId);
       console.log('공정 상세 정보 로드 완료:', processStore.processDetail);
       console.log('공정 타입:', processStore.processDetail.processType);
       console.log('공정 중분류:', processStore.processDetail.subCategory);
       console.log('공정명:', processStore.processDetail.processName);
       console.log('공정심볼 (symbol_uri):', processStore.processDetail.processSymbol);
       console.log('원본 공정심볼:', processStore.processDetail.originalProcessSymbol);
       console.log('심볼 ID:', processStore.processDetail.symbolId);
       console.log('언어 코드:', processStore.processDetail.language_code);
       console.log('단위 시스템 코드:', processStore.processDetail.unit_system_code);
       console.log('전체 processDetail 객체:', JSON.stringify(processStore.processDetail, null, 2));
       
       // 공정심볼 파일명 표시 확인
       if (processStore.processDetail.processSymbol && processStore.processDetail.processSymbol !== null && processStore.processDetail.processSymbol.trim() !== '') {
         console.log('공정심볼 파일명이 설정됨:', processStore.processDetail.processSymbol);
         console.log('getProcessSymbolFileName() 결과:', getProcessSymbolFileName());
       } else {
         console.log('공정심볼 파일명이 설정되지 않음 (null 또는 빈 값)');
         console.log('processSymbol 값:', processStore.processDetail.processSymbol);
         console.log('processSymbol 타입:', typeof processStore.processDetail.processSymbol);
       }
       
       // 언어 및 단위 시스템 코드를 화면에 매핑
       if (processStore.processDetail.language_code) {
         selectedLanguage.value = processStore.processDetail.language_code;
         console.log('언어 코드 매핑 완료:', selectedLanguage.value);
       }
       
       if (processStore.processDetail.unit_system_code) {
         selectedUnit.value = processStore.processDetail.unit_system_code;
         console.log('단위 시스템 코드 매핑 완료:', selectedUnit.value);
       }
       
       // 드롭다운 옵션 상태 확인
       console.log('공정 타입 옵션:', processStore.processTypeOptions);
       console.log('중분류 옵션:', processStore.searchSubCategoryOptions);
       console.log('공정명 옵션:', processStore.searchProcessNameOptions);
       
       // 공정명 값이 제대로 설정되었는지 확인
       console.log('=== 공정명 디버깅 ===');
       console.log('processStore.processDetail.processName 값:', processStore.processDetail.processName);
       console.log('processStore.processDetail.processName 타입:', typeof processStore.processDetail.processName);
       console.log('processStore.processDetail.processName === null:', processStore.processDetail.processName === null);
       console.log('processStore.processDetail.processName === undefined:', processStore.processDetail.processName === undefined);
       console.log('processStore.processDetail.processName === ""', processStore.processDetail.processName === "");
       console.log('========================');
      
             // 공정 타입 옵션들 먼저 로드
       await processStore.loadProcessTypeCodes();
       
               // 공정 타입, 중분류, 공정명 옵션들 로드
        if (processStore.processDetail.processType) {
          console.log('공정 타입 옵션 로드:', processStore.processDetail.processType);
          // 중분류 옵션 로드
          await processStore.loadSubCategoryCodes(processStore.processDetail.processType);
          
          if (processStore.processDetail.subCategory) {
            console.log('중분류 옵션 로드:', processStore.processDetail.subCategory);
            // 공정명 옵션 로드
            await processStore.loadProcessNameCodes(processStore.processDetail.subCategory);
            
            // 공정명 옵션들이 완전히 로드될 때까지 대기
            await nextTick();
            
                         // 공정명 옵션 상태 확인
             console.log('공정명 옵션 로드 완료 후 상태:', {
               optionsCount: processStore.searchProcessNameOptions?.length || 0,
               options: processStore.searchProcessNameOptions,
               currentValue: processStore.processDetail.processName
             });
             
             // 옵션의 실제 내용을 상세히 로깅
             if (processStore.searchProcessNameOptions?.length > 0) {
               console.log('=== 공정명 옵션 상세 내용 ===');
               processStore.searchProcessNameOptions.forEach((option, index) => {
                 console.log(`옵션 ${index + 1}:`, {
                   value: option.value,
                   label: option.label,
                   valueType: typeof option.value,
                   currentValue: processStore.processDetail.processName,
                   currentValueType: typeof processStore.processDetail.processName,
                   isEqual: option.value === processStore.processDetail.processName,
                   isEqualStrict: option.value === processStore.processDetail.processName,
                   isEqualLoose: option.value == processStore.processDetail.processName
                 });
               });
               console.log('============================');
             }
             
                           // 공정명 셀렉트박스 값이 옵션에 존재하는지 확인
              if (processStore.processDetail.processName && processStore.searchProcessNameOptions?.length > 0) {
                // 현재 공정명 값이 옵션에 존재하는지 확인 (여러 방법으로 시도)
                let matchedOption = null;
                
                // 1. 정확한 값 비교
                matchedOption = processStore.searchProcessNameOptions.find(
                  option => option.value === processStore.processDetail.processName
                );
                
                if (!matchedOption) {
                  // 2. 문자열 변환 후 비교
                  matchedOption = processStore.searchProcessNameOptions.find(
                    option => String(option.value) === String(processStore.processDetail.processName)
                  );
                  
                  if (!matchedOption) {
                    // 3. 라벨로 비교
                    matchedOption = processStore.searchProcessNameOptions.find(
                      option => option.label === processStore.processDetail.processName
                    );
                    
                    if (matchedOption) {
                      console.log('라벨로 매칭된 옵션:', matchedOption);
                      // 라벨이 일치하면 value로 업데이트
                      processStore.setProcessDetail({ processName: matchedOption.value });
                    }
                  }
                }
                
                if (matchedOption) {
                  console.log('공정명 옵션이 존재함:', matchedOption);
                } else {
                  console.warn('공정명 옵션에 해당 값이 존재하지 않음:', processStore.processDetail.processName);
                  console.log('사용 가능한 옵션들:', processStore.searchProcessNameOptions.map(opt => ({ value: opt.value, label: opt.label })));
                }
              } else {
                console.log('공정명 값이 없거나 옵션이 로드되지 않음');
              }
          }
        }
      
      // 계산식 검색 API 호출하여 계산식 데이터 로드
      try {
        console.log('계산식 검색 API 호출 시작...');
        const formulaResult = await searchFormulaAPI();
        
        if (formulaResult && formulaResult.response && Array.isArray(formulaResult.response)) {
          const formulaItems = formulaResult.response.map((item: any, index: number) => ({
            id: `formula_${Date.now()}_${index}`,
            no: (index + 1).toString().padStart(3, '0'),
            registeredFormula: item.formula_name || item.name || '',
            formula_code: item.formula_code || item.code || '',
            registrationDate: item.created_at || item.registration_date || formatDate(new Date()),
            infoOverview: item.formula_scope || item.scope || '',
            remarks: item.output_type || item.type || '',
            formula_id: item.id || null,
            _file: undefined
          }));
          
          processStore.setFormulaList(formulaItems);
          const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
          processStore.setInitialFormulaList(initialFormulaData);
          
          console.log('계산식 데이터 로드 완료:', formulaItems.length, '개');
        } else if (formulaResult && 'data' in formulaResult && Array.isArray(formulaResult.data)) {
          const formulaItems = formulaResult.data.map((item: any, index: number) => ({
            id: `formula_${Date.now()}_${index}`,
            no: (index + 1).toString().padStart(3, '0'),
            registeredFormula: item.formula_name || item.name || '',
            formula_code: item.formula_code || item.code || '',
            registrationDate: item.created_at || item.registration_date || formatDate(new Date()),
            infoOverview: item.formula_scope || item.scope || '',
            remarks: item.output_type || item.type || '',
            formula_id: item.id || null,
            _file: undefined
          }));
          
          processStore.setFormulaList(formulaItems);
          const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
          processStore.setInitialFormulaList(initialFormulaData);
          
          console.log('계산식 데이터 로드 완료 (data 필드):', formulaItems.length, '개');
        } else {
          console.log('계산식 데이터가 없습니다.');
          processStore.setFormulaList([]);
          processStore.setInitialFormulaList([]);
        }
      } catch (error) {
        console.error('계산식 데이터 로드 실패:', error);
        processStore.setFormulaList([]);
        processStore.setInitialFormulaList([]);
      }
      
      // 수리계통도 도면 검색 API 호출하여 데이터 로드
      try {
        console.log('수리계통도 도면 검색 API 호출 시작...');
        const drawingsData = await searchHydraulicDrawingAPI(processId);
        
        if (drawingsData && Array.isArray(drawingsData)) {
          const hydraulicItems = drawingsData.map((item: any, index: number) => ({
            id: `hydraulic_${index + 1}`,
            no: (index + 1).toString().padStart(3, '0'),
            dwg: item.file_uri ? extractFileNameFromUri(item.file_uri) : '',
            registrationDate: item.created_at || item.registration_date || formatDate(new Date()),
            infoOverview: item.info_overview || item.overview || '',
            svgPreview: item.svg_preview || item.preview || '',
            drawing_id: item.drawing_id || item.id || `drawing_${index + 1}`
          }));
          
          processStore.setHydraulicList(hydraulicItems);
          const initialHydraulicData = JSON.parse(JSON.stringify(hydraulicItems));
          processStore.setInitialHydraulicList(initialHydraulicData);
          
          console.log('수리계통도 데이터 로드 완료:', hydraulicItems.length, '개');
        } else {
          console.log('수리계통도 데이터가 없습니다.');
          processStore.setHydraulicList([]);
          processStore.setInitialHydraulicList([]);
        }
      } catch (error) {
        console.error('수리계통도 데이터 로드 실패:', error);
        processStore.setHydraulicList([]);
        processStore.setInitialHydraulicList([]);
      }
      
      // 컴포넌트 데이터 초기화 (예시 데이터)
      console.log('컴포넌트 데이터 초기화 시작...');
      const componentData = [
        {
          id: '1',
          division: '공용구조물',
          components: '구조물',
          type: '',
          inputItem: 'SBR 반응조 구조물'
        },
        {
          id: '2',
          division: '공용구조물',
          components: '구조물',
          type: '',
          inputItem: ''
        },
        {
          id: '3',
          division: '공용구조물',
          components: '구조물',
          type: '',
          inputItem: ''
        },
        {
          id: '4',
          division: '공용기계',
          components: '송풍기',
          type: '터보블로워(VVVF)',
          inputItem: '반응조 송풍기'
        }
      ];
      processStore.setStructList(componentData);
      console.log('컴포넌트 데이터 초기화 완료:', componentData);

      // PFD 도면 검색 API 호출하여 데이터 로드
      try {
        console.log('PFD 도면 검색 API 호출 시작...');
        const pfdDrawingsData = await searchPfdDrawingAPI(processId);
        
        if (pfdDrawingsData && Array.isArray(pfdDrawingsData)) {
          const pfdItems = pfdDrawingsData.map((item: any, index: number) => ({
            id: `pfd_${index + 1}`,
            pfdFileName: item.pfd || item.file_name || item.drawing_name || 'PFD 파일',
            registrationDate: item.created_at || item.uploaded_at || formatDate(new Date()),
            infoOverview: item.drawing_title || item.info_overview || '',
            mappingPidList: '보기',
            remarks: item.remarks || '',
            drawing_id: item.drawing_id || item.id || `pfd_drawing_${index + 1}`
          }));
          
          processStore.setPfdList(pfdItems);
          const initialPfdData = JSON.parse(JSON.stringify(pfdItems));
          processStore.setInitialPfdList(initialPfdData);
          
          console.log('PFD 데이터 로드 완료:', pfdItems.length, '개');
        } else {
          console.log('PFD 데이터가 없습니다.');
          processStore.setPfdList([]);
          processStore.setInitialPfdList([]);
        }
      } catch (error) {
        console.error('PFD 데이터 로드 실패:', error);
        processStore.setPfdList([]);
        processStore.setInitialPfdList([]);
      }
      
      console.log('ProcessDetail 컴포넌트 초기화 완료');
    } else {
      console.warn('processId가 없습니다.');
    }
  } catch (error) {
    console.error('컴포넌트 초기화 실패:', error);
  }
});

// props 변경 감지
watch(() => props.processId, async (newProcessId, oldProcessId) => {
  if (newProcessId && newProcessId !== oldProcessId) {
    console.log('processId 변경 감지:', oldProcessId, '->', newProcessId);
    try {
             // 새로운 공정 정보 로드
       await processStore.searchProcessById(newProcessId);
       
       // 언어 및 단위 시스템 코드를 화면에 매핑 (watch)
       if (processStore.processDetail.language_code) {
         selectedLanguage.value = processStore.processDetail.language_code;
         console.log('언어 코드 매핑 완료 (watch):', selectedLanguage.value);
       }
       
       if (processStore.processDetail.unit_system_code) {
         selectedUnit.value = processStore.processDetail.unit_system_code;
         console.log('단위 시스템 코드 매핑 완료 (watch):', selectedUnit.value);
       }
       
       // 공정 타입 옵션들 먼저 로드
       await processStore.loadProcessTypeCodes();
       
               // 공정 타입, 중분류, 공정명 옵션들 로드
        if (processStore.processDetail.processType) {
          // 중분류 옵션 로드
          await processStore.loadSubCategoryCodes(processStore.processDetail.processType);
          
          if (processStore.processDetail.subCategory) {
            // 공정명 옵션 로드
            await processStore.loadProcessNameCodes(processStore.processDetail.subCategory);
            
            // 공정명 옵션들이 완전히 로드될 때까지 대기
            await nextTick();
            
                         // 공정명 옵션 상태 확인
             console.log('공정명 옵션 로드 완료 후 상태 (watch):', {
               optionsCount: processStore.searchProcessNameOptions?.length || 0,
               options: processStore.searchProcessNameOptions,
               currentValue: processStore.processDetail.processName
             });
             
             // 옵션의 실제 내용을 상세히 로깅 (watch)
             if (processStore.searchProcessNameOptions?.length > 0) {
               console.log('=== 공정명 옵션 상세 내용 (watch) ===');
               processStore.searchProcessNameOptions.forEach((option, index) => {
                 console.log(`옵션 ${index + 1}:`, {
                   value: option.value,
                   label: option.label,
                   valueType: typeof option.value,
                   currentValue: processStore.processDetail.processName,
                   currentValueType: typeof processStore.processDetail.processName,
                   isEqual: option.value === processStore.processDetail.processName,
                   isEqualStrict: option.value === processStore.processDetail.processName,
                   isEqualLoose: option.value == processStore.processDetail.processName
                 });
               });
               console.log('====================================');
             }
             
             // 공정명 셀렉트박스 값이 옵션에 존재하는지 확인 (watch)
             if (processStore.processDetail.processName && processStore.searchProcessNameOptions?.length > 0) {
               // 현재 공정명 값이 옵션에 존재하는지 확인 (여러 방법으로 시도)
               let matchedOption = null;
               
               // 1. 정확한 값 비교
               matchedOption = processStore.searchProcessNameOptions.find(
                 option => option.value === processStore.processDetail.processName
               );
               
               if (!matchedOption) {
                 // 2. 문자열 변환 후 비교
                 matchedOption = processStore.searchProcessNameOptions.find(
                   option => String(option.value) === String(processStore.processDetail.processName)
                 );
                 
                 if (!matchedOption) {
                   // 3. 라벨로 비교
                   matchedOption = processStore.searchProcessNameOptions.find(
                     option => option.label === processStore.processDetail.processName
                   );
                   
                   if (matchedOption) {
                     console.log('라벨로 매칭된 옵션 (watch):', matchedOption);
                     // 라벨이 일치하면 value로 업데이트
                     processStore.setProcessDetail({ processName: matchedOption.value });
                   }
                 }
               }
               
               if (matchedOption) {
                 console.log('공정명 옵션이 존재함 (watch):', matchedOption);
               } else {
                 console.warn('공정명 옵션에 해당 값이 존재하지 않음 (watch):', processStore.processDetail.processName);
                 console.log('사용 가능한 옵션들 (watch):', processStore.searchProcessNameOptions.map(opt => ({ value: opt.value, label: opt.label })));
               }
             } else {
               console.log('공정명 값이 없거나 옵션이 로드되지 않음 (watch)');
             }
                  }
      }
      
      // 계산식 검색 API 호출하여 계산식 데이터 로드
      try {
        console.log('계산식 검색 API 호출 시작 (watch)...');
        const formulaResult = await searchFormulaAPI();
        
        if (formulaResult && formulaResult.response && Array.isArray(formulaResult.response)) {
          const formulaItems = formulaResult.response.map((item: any, index: number) => ({
            id: `formula_${Date.now()}_${index}`,
            no: (index + 1).toString().padStart(3, '0'),
            registeredFormula: item.formula_name || item.name || '',
            formula_code: item.formula_code || item.code || '',
            registrationDate: item.created_at || item.registration_date || formatDate(new Date()),
            infoOverview: item.formula_scope || item.scope || '',
            remarks: item.output_type || item.type || '',
            formula_id: item.id || null,
            _file: undefined
          }));
          
          processStore.setFormulaList(formulaItems);
          const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
          processStore.setInitialFormulaList(initialFormulaData);
          
          console.log('계산식 데이터 로드 완료 (watch):', formulaItems.length, '개');
        } else if (formulaResult && 'data' in formulaResult && Array.isArray(formulaResult.data)) {
          const formulaItems = formulaResult.data.map((item: any, index: number) => ({
            id: `formula_${Date.now()}_${index}`,
            no: (index + 1).toString().padStart(3, '0'),
            registeredFormula: item.formula_name || item.name || '',
            formula_code: item.formula_code || item.code || '',
            registrationDate: item.created_at || item.registration_date || formatDate(new Date()),
            infoOverview: item.formula_scope || item.scope || '',
            remarks: item.output_type || item.type || '',
            formula_id: item.id || null,
            _file: undefined
          }));
          
          processStore.setFormulaList(formulaItems);
          const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
          processStore.setInitialFormulaList(initialFormulaData);
          
          console.log('계산식 데이터 로드 완료 (watch, data 필드):', formulaItems.length, '개');
        } else {
          console.log('계산식 데이터가 없습니다 (watch).');
          processStore.setFormulaList([]);
          processStore.setInitialFormulaList([]);
        }
      } catch (error) {
        console.error('계산식 데이터 로드 실패 (watch):', error);
        processStore.setFormulaList([]);
        processStore.setInitialFormulaList([]);
      }
      
      // 수리계통도 도면 검색 API 호출하여 데이터 로드
      try {
        const drawingsData = await searchHydraulicDrawingAPI(newProcessId);
        
        if (drawingsData && Array.isArray(drawingsData)) {
          const hydraulicItems = drawingsData.map((item: any, index: number) => ({
            id: `hydraulic_${index + 1}`,
            no: (index + 1).toString().padStart(3, '0'),
            dwg: item.file_uri ? extractFileNameFromUri(item.file_uri) : '',
            registrationDate: item.created_at || item.registration_date || formatDate(new Date()),
            infoOverview: item.info_overview || item.overview || '',
            svgPreview: item.svg_preview || item.preview || '',
            drawing_id: item.drawing_id || item.id || `drawing_${index + 1}`
          }));
          
          processStore.setHydraulicList(hydraulicItems);
          const initialHydraulicData = JSON.parse(JSON.stringify(hydraulicItems));
          processStore.setInitialHydraulicList(initialHydraulicData);
        } else {
          processStore.setHydraulicList([]);
          processStore.setInitialHydraulicList([]);
        }
      } catch (error) {
        console.error('수리계통도 데이터 로드 실패:', error);
        processStore.setHydraulicList([]);
        processStore.setInitialHydraulicList([]);
      }
      
      // 계산식 초기값 저장
      const initialFormulaData = JSON.parse(JSON.stringify(processStore.formulaList));
      processStore.setInitialFormulaList(initialFormulaData);
      
    } catch (error) {
      console.error('새로운 공정 정보 로드 실패:', error);
    }
  }
}, { immediate: false });
</script>

<style scoped>
.process-detail {
  padding: 20px;
}

.process-info-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.process-info-section h3 {
  margin-bottom: 20px;
  color: #333;
}

.form-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 20px;
  align-items: flex-start;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
  white-space: nowrap;
}

.form-group select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  min-width: 140px;
}

.file-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 160px;
}

.file-select-btn {
  padding: 8px 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
}

.file-select-btn:hover {
  background: #0056b3;
}

.selected-file {
  color: #666;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 80px;
}

.tabs-container {
  margin-top: 20px;
}

.tabs-header {
  display: flex;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 20px;
  position: relative;
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #007bff;
}

.tab-button.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.tab-content {
  min-height: 400px;
}

.tab-panel {
  padding: 20px 0;
}

.tab-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}

.tab-header h3 {
  margin: 0;
  color: #333;
}

.tab-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-danger:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

.selected-files-info {
  color: #666;
  font-size: 14px;
}

.selected-files-list {
  margin-top: 20px;
}

.selected-files-list h4 {
  margin-bottom: 10px;
  color: #333;
}

.selected-files-list ul {
  list-style: none;
  padding: 0;
}

.selected-files-list li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

/* P&ID 매핑 모달 스타일 */
.large-modal {
  max-width: 1200px !important;
  width: 95% !important;
}

.modal-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mapping-pid-table {
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

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
}
</style>
