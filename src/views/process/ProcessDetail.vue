<template>
  <div class="process-detail" :class="props.class">
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


        <!-- 공정카드 탭 -->
        <div v-show="activeTab === 2" class="tab-panel">
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
          
          <div class="grid-title">
            <h4>PFD 목록</h4>
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


    <!-- 공정카드 파일 첨부 모달 -->
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
          <button class="btn btn-primary" @click="addMappingPidRow">추가</button>
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
      
      <!-- 모달 푸터 -->
      <div class="modal-footer">
        <div class="modal-footer-buttons">
          <button @click="confirmMappingPid" class="btn btn-primary">
            저장
          </button>
          <button @click="closeMappingPidModal" class="btn btn-secondary" style="margin-left: 15px;">
            취소
          </button>
        </div>
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
  class?: string; // class 속성 추가
}

const props = withDefaults(defineProps<Props>(), {
  processId: '',
  class: ''
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
const selectedPfdItems = ref<any[]>([]);
const selectedFormulaFiles = ref<File[]>([]);
const selectedPfdFiles = ref<File[]>([]);

// P&ID 매핑 모달 관련 상태
const showMappingPidModal = ref(false);
const currentPfdItemForMapping = ref<any>(null);
const mappingPidList = ref<any[]>([]);
const selectedMappingPidItems = ref<any[]>([]);
const initialMappingPidList = ref<any[]>([]); // 초기 P&ID 목록 데이터 저장

// P&ID 매핑 모달 파일 입력 refs
const pidFileInput = ref<HTMLInputElement>();
const excelFileInput = ref<HTMLInputElement>();

// 언어 및 단위 선택
const selectedLanguage = ref('');
const selectedUnit = ref('');

// 탭 설정
const tabs = ref([
  "계산식 관리",
  "컴포넌트",
  "공정카드",
]);

// 컬럼 정의
const formulaColumns: TableColumn[] = [
  { key: "no", title: "순번", sortable: true },
  { key: "registeredFormula", title: "등록 계산식", sortable: true },
  { key: "registrationDate", title: "등록일자", sortable: true, dateFormat: "YYYY-MM-DD" },
  { key: "infoOverview", title: "정보 개요", sortable: true },
  { key: "remarks", title: "비고", sortable: true },
  { key: "formula_id", title: "Formula ID", sortable: false, hidden: true }
];

const structColumns: TableColumn[] = [
  { key: "division", title: "구분", sortable: true },
  { key: "components", title: "Components", sortable: true },
  { key: "type", title: "유형", sortable: true },
  { key: "inputItem", title: "입력Item", sortable: true }
];


const pfdColumns: TableColumn[] = [
  { key: "pfdFileName", title: "공정카드 파일명", sortable: true },
  { key: "registrationDate", title: "등록일자", sortable: true, dateFormat: "YYYY-MM-DD" },
  { key: "infoOverview", title: "정보개요", sortable: true },
  { key: "mappingPidList", title: "매핑 P&ID 목록", sortable: false },
  { key: "remarks", title: "비고", sortable: true }
];

// P&ID 매핑 목록 컬럼 정의 (사용하지 않음)
// const mappingPidColumns: TableColumn[] = [
//   { key: "no", title: "No.", sortable: false },
//   { key: "pidFile", title: "P&ID (*)", sortable: false },
//   { key: "mappingExcel", title: "매핑 Excel (*)", sortable: false },
//   { key: "infoOverview", title: "정보개요(기기명+대수)", sortable: false },
//   { key: "svgPreview", title: "Svg 도면 미리보기", sortable: false }
// ];

// 유틸리티 함수들 (사용하지 않음)
// const extractFileNameFromUri = (uri: string): string => {
//   if (!uri) return '';
//   const parts = uri.split('/');
//   return parts[parts.length - 1] || uri;
// };

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// API 함수들
const searchPfdDrawingAPI = async (processId: string) => {
  try {
    console.log('PFD 도면 검색 API 호출 시작 - 엔드포인트: /api/process/drawing_master/search');
    
    if (!processId) {
      console.warn('processId가 없어서 PFD 도면 검색을 건너뜁니다.');
      return [];
    }
    
    const requestBody = {
      drawing_type: 'PFD',
      process_id: parseInt(processId, 10)
    };
    
    console.log('PFD 도면 검색 요청 데이터:', requestBody);
    
    const response = await request('/api/process/drawing_master/search', {}, {
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
      console.log(`PFD 아이템 ${index + 1} - 원본 API 응답:`, item);
      console.log(`PFD 아이템 ${index + 1} - 모든 키:`, Object.keys(item));
      
      // drawing_id 필드 확인
      console.log(`PFD 아이템 ${index + 1} - drawing_id:`, item.drawing_id);
      console.log(`PFD 아이템 ${index + 1} - id:`, item.id);
      console.log(`PFD 아이템 ${index + 1} - drawing_id 또는 id 존재 여부:`, !!(item.drawing_id || item.id));
      
      // API 응답에서 파일명을 찾기 위한 모든 가능한 필드 확인
      const possibleFileNameFields = ['file_name', 'drawing_name', 'pfd', 'name', 'filename', 'original_name'];
      let fileName = '공정카드 파일';
      
      // current_file.file_name을 우선적으로 확인
      if (item.current_file?.file_name) {
        fileName = item.current_file.file_name;
        console.log(`PFD 아이템 ${index + 1} - 파일명 발견 (current_file.file_name):`, fileName);
      } else {
        for (const field of possibleFileNameFields) {
          if (item[field]) {
            fileName = item[field];
            console.log(`PFD 아이템 ${index + 1} - 파일명 발견 (${field}):`, fileName);
            break;
          }
        }
      }
      
      console.log(`PFD 아이템 ${index + 1} - 최종 파일명:`, fileName);
      
      const drawingId = item.drawing_id || item.id;
      console.log(`PFD 아이템 ${index + 1} - 최종 drawing_id:`, drawingId);
      
      return {
        id: `pfd-${index + 1}`,
        pfdFileName: fileName,
        registrationDate: item.created_at || item.uploaded_at || formatDate(new Date()),
        infoOverview: item.drawing_title || item.info_overview || '',
        mappingPidList: '보기',
        remarks: item.remarks || '',
        drawing_id: drawingId
      };
    }) || [];

    console.log('PFD 도면 데이터 변환 결과:', pfdItems);
    return pfdItems;
  } catch (error) {
    console.error('PFD 도면 검색 API 호출 실패:', error);
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
    formData.append('formula_scope', 'PROCESS'); // 서버에서 요구하는 필드
    if (siteFile) {
      formData.append('python_file', siteFile); // 서버에서 요구하는 필드명
    }

    const response = await request('/api/process/formula/create', undefined, {
      method: 'POST',
      body: formData
      // headers는 request.ts에서 자동으로 설정됨 (FormData일 때 Content-Type 자동 설정)
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
    console.log('--- deleteFormulaAPI 호출 시작 ---');
    console.log('formulaId:', formulaId);
    console.log('API URL:', `/api/process/formula/delete/${formulaId}`);
    
    const response = await request(`/api/process/formula/delete/${formulaId}`, {}, {
      method: 'DELETE',
      headers: {
        'user_Id': localStorage.getItem('authUserId') || '',
        'wai_lang': localStorage.getItem('wai_lang') || 'ko'
      }
    });

    console.log('API 응답 수신:', response);

    if (!response.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('--- deleteFormulaAPI 성공 ---');
    return response;
  } catch (error: any) {
    console.error('--- deleteFormulaAPI 실패 ---');
    console.error('formulaId:', formulaId);
    console.error('error:', error);
    throw error;
  }
};


// P&ID drawing 삭제 API
const deletePidDrawingAPI = async (drawingId: string) => {
  try {
    console.log('P&ID drawing 삭제 API 호출 시작 - drawingId:', drawingId);
    
    const response = await request(`/api/process/drawing/delete/${drawingId}`, {}, {
      method: 'DELETE',
      headers: {
        'user_Id': localStorage.getItem('authUserId') || '',
        'wai_lang': localStorage.getItem('wai_lang') || 'ko'
      }
    });

    if (!response.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('P&ID drawing 삭제 API 호출 성공:', response);
    return response;
  } catch (error) {
    console.error('P&ID drawing 삭제 API 호출 실패:', error);
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
  // 공정명 변경 처리
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
  
  // null, undefined, 빈 문자열 체크
  if (processSymbol && processSymbol !== null && processSymbol !== undefined && processSymbol.trim() !== '') {
    // 파일명만 추출하여 반환
    const fileName = processSymbol.split('/').pop() || processSymbol;
    return fileName;
  }
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

const showPfdModal = ref(false);


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


const handlePfdFilesSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const fileArray = Array.from(target.files);
    
    // 공정카드 관련 파일만 필터링
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
      alert(`공정카드 관련 파일(.dwg, .pdf, .png, .jpg, .jpeg)만 선택 가능합니다.\n\n선택된 파일 중 지원하지 않는 파일:\n${unsupportedFiles.map(f => f.name).join('\n')}`);
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
  alert(`공정카드 파일 ${newPfdItems.length}개가 그리드에 추가되었습니다.\n저장 버튼을 클릭하면 서버에도 반영됩니다.`);
  
  closePfdModal();
};

// 선택 관련 함수들
const handleFormulaSelectionChange = (items: any[]) => {
  selectedFormulaItems.value = items;
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




const handlePfdDelete = () => {
  if (selectedPfdItems.value.length === 0) {
    alert('삭제할 항목을 선택해주세요.');
    return;
  }

  const confirmed = confirm(`선택된 공정카드 ${selectedPfdItems.value.length}개를 삭제하시겠습니까?`);
  if (!confirmed) return;

  const updatedList = processStore.pfdList.filter(
    item => !selectedPfdItems.value.some(selected => selected.id === item.id)
  );
  processStore.setPfdList(updatedList);
  selectedPfdItems.value = [];
  
  console.log('PFD 그리드에서 삭제 완료:', selectedPfdItems.value.length, '개');
  alert('선택된 공정카드가 그리드에서 삭제되었습니다.\n저장 버튼을 클릭하면 서버에도 반영됩니다.');
};

// 페이지네이션 핸들러들
const handleFormulaPageChange = (page: number) => {
  console.log('계산식 페이지 변경:', page);
};

const handleStructPageChange = (page: number) => {
  console.log('컴포넌트 페이지 변경:', page);
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
    console.log('=== 계산식 삭제 감지 시작 ===');
    console.log('initialFormulaList 존재:', !!processStore.initialFormulaList);
    console.log('formulaList 존재:', !!processStore.formulaList);
    console.log('initialFormulaList 길이:', processStore.initialFormulaList?.length || 0);
    console.log('formulaList 길이:', processStore.formulaList?.length || 0);
    
    if (processStore.initialFormulaList && processStore.formulaList) {
      // 모든 삭제된 항목들 감지
      const allDeletedRows = processStore.initialFormulaList.filter(initialItem => {
        console.log('초기 항목 확인:', {
          id: initialItem.id,
          formula_id: initialItem.formula_id,
          registeredFormula: initialItem.registeredFormula
        });
        
        // formula_id가 있는 경우 formula_id로 비교
        if (initialItem.formula_id) {
          const exists = processStore.formulaList.some(currentItem => 
            currentItem.formula_id && currentItem.formula_id === initialItem.formula_id
          );
          console.log('formula_id로 비교 - 존재 여부:', exists);
          return !exists;
        }
        // formula_id가 없는 경우 id로 비교
        const exists = processStore.formulaList.some(currentItem => 
          currentItem.id === initialItem.id
        );
        console.log('id로 비교 - 존재 여부:', exists);
        return !exists;
      });
      
      console.log('감지된 삭제된 항목 수:', allDeletedRows.length);
      
      // 서버에서 삭제해야 하는 항목들
      // 1. formula_id가 있는 항목
      // 2. existing_formula_ 접두사가 있는 항목 (서버에서 가져온 기존 데이터)
      const deletedRows = allDeletedRows.filter(item => {
        if (item.formula_id) {
          return true; // formula_id가 있으면 서버 삭제 대상
        }
        if (item.id && item.id.startsWith('existing_formula_')) {
          return true; // existing_formula_ 접두사가 있으면 서버 삭제 대상
        }
        return false;
      });
      
      // 로컬에서만 삭제된 항목들 (새로 추가된 항목)
      const locallyDeletedRows = allDeletedRows.filter(item => {
        if (item.formula_id) {
          return false; // formula_id가 있으면 서버 삭제 대상
        }
        if (item.id && item.id.startsWith('existing_formula_')) {
          return false; // existing_formula_ 접두사가 있으면 서버 삭제 대상
        }
        return true; // 그 외는 로컬 삭제 대상
      });
      
      const addedRows = processStore.formulaList.filter(currentItem => {
        // 새로 추가된 행은 id가 'formula_'로 시작하고 formula_id가 없는 경우
        if (currentItem.id.startsWith('formula_') && !currentItem.formula_id) {
          return true;
        }
        // 기존 행이지만 formula_id가 있고 initialFormulaList에 없는 경우
        return currentItem.formula_id && !processStore.initialFormulaList.some(initialItem => 
          initialItem.formula_id && initialItem.formula_id === currentItem.formula_id
        );
      });
      
      console.log('계산식 변경사항 확인:', {
        allDeletedRows: allDeletedRows.length,
        deletedRows: deletedRows.length,
        locallyDeletedRows: locallyDeletedRows.length,
        addedRows: addedRows.length,
        initialCount: processStore.initialFormulaList.length,
        currentCount: processStore.formulaList.length
      });
      
      console.log('모든 삭제된 행 상세 정보:', allDeletedRows.map(item => ({
        id: item.id,
        formula_id: item.formula_id,
        registeredFormula: item.registeredFormula,
        hasFormulaId: !!item.formula_id,
        전체객체: item
      })));
      
      console.log('서버에서 삭제할 행 상세 정보:', deletedRows.map(item => ({
        id: item.id,
        formula_id: item.formula_id,
        registeredFormula: item.registeredFormula,
        hasFormulaId: !!item.formula_id
      })));
      
      
      console.log('로컬에서 삭제된 항목 수:', locallyDeletedRows.length);
      console.log('로컬에서 삭제된 항목들:', locallyDeletedRows.map(item => ({
        id: item.id,
        formula_id: item.formula_id
      })));
      
      // 상세 디버깅을 위한 로그
      console.log('초기 계산식 데이터:', processStore.initialFormulaList.map(item => ({
        id: item.id,
        formula_id: item.formula_id,
        registeredFormula: item.registeredFormula
      })));
      
      console.log('현재 계산식 데이터:', processStore.formulaList.map(item => ({
        id: item.id,
        formula_id: item.formula_id,
        registeredFormula: item.registeredFormula
      })));
      
      console.log('=== 계산식 삭제 감지 완료 ===');
      
      if (deletedRows.length > 0 || locallyDeletedRows.length > 0 || addedRows.length > 0) {
        hasAnyChanges = true;
        
                 // 삭제된 행 처리
         if (deletedRows.length > 0) {
           try {
             console.log('=== 계산식 삭제 API 호출 시작 ===');
             console.log('삭제할 항목 수:', deletedRows.length);
             console.log('삭제할 항목들:', deletedRows.map(item => ({
               id: item.id,
               formula_id: item.formula_id,
               registeredFormula: item.registeredFormula
             })));
             
             const deletePromises = deletedRows.map((row, index) => {
               // formula_id가 있으면 사용, 없으면 id에서 추출
               let formulaId = row.formula_id;
               if (!formulaId && row.id && row.id.startsWith('existing_formula_')) {
                 // existing_formula_123 형태에서 123 추출
                 formulaId = row.id.replace('existing_formula_', '');
               }
               
               console.log(`[${index + 1}/${deletedRows.length}] 계산식 삭제 API 호출 시작:`, {
                 id: row.id,
                 formula_id: row.formula_id,
                 extracted_formula_id: formulaId,
                 registeredFormula: row.registeredFormula
               });
               
               if (!formulaId) {
                 console.error('삭제할 formula_id를 찾을 수 없습니다:', row);
                 return Promise.reject(new Error('삭제할 formula_id를 찾을 수 없습니다'));
               }
               
               return deleteFormulaAPI(formulaId);
             });
             
             console.log('삭제 API 호출 대기 중...');
             const results = await Promise.all(deletePromises);
             console.log("=== 계산식 삭제 API 호출 완료 ===");
             console.log("삭제 결과:", results);
           } catch (error) {
             console.error("=== 계산식 삭제 실패 ===", error);
           }
         } else {
           console.log('서버에서 삭제할 계산식 항목이 없습니다.');
         }
         
         // 로컬에서 삭제된 항목들 처리
         if (locallyDeletedRows.length > 0) {
           console.log('로컬에서 삭제된 계산식 항목 수:', locallyDeletedRows.length);
           console.log('로컬에서 삭제된 항목들은 서버 삭제가 필요하지 않습니다.');
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
    } else {
      console.log('=== 계산식 삭제 감지 실패 ===');
      console.log('initialFormulaList 또는 formulaList가 없습니다.');
      console.log('initialFormulaList:', processStore.initialFormulaList);
      console.log('formulaList:', processStore.formulaList);
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
        // 새로 추가된 행은 id가 'pfd_'로 시작하고 drawing_id가 임시 ID인 경우
        if (currentItem.id.startsWith('pfd_') && currentItem.drawing_id?.startsWith('temp_pfd_drawing_')) {
          return true;
        }
        // 기존 행이지만 drawing_id가 있고 initialPfdList에 없는 경우
        if (!currentItem.drawing_id) return false;
        return !processStore.initialPfdList.some(initialItem => 
          initialItem.drawing_id && initialItem.drawing_id === currentItem.drawing_id
        );
      });
      
      console.log('PFD 변경사항 확인:', {
        deletedRows: deletedPfdRows.length,
        addedRows: addedPfdRows.length,
        initialCount: processStore.initialPfdList.length,
        currentCount: processStore.pfdList.length
      });
      
      if (deletedPfdRows.length > 0 || addedPfdRows.length > 0) {
        hasAnyChanges = true;
        
        // 삭제된 행 처리
        if (deletedPfdRows.length > 0) {
          try {
            const deletePromises = deletedPfdRows.map(async (row) => {
              if (!row.drawing_id) return null;
              
              try {
                const response = await request(`/api/process/drawing/delete/${row.drawing_id}`, {}, {
                  method: 'DELETE',
                  headers: {
                    'user_Id': localStorage.getItem('authUserId') || '',
                    'wai_lang': localStorage.getItem('wai_lang') || 'ko'
                  }
                });
                
                if (!response.success) {
                  // 404 Not Found 오류인 경우 무시하고 계속 진행
                  if (response.status === 404 || response.message?.includes('not found')) {
                    console.warn(`PFD 삭제 건너뛰기 - ID가 존재하지 않음: ${row.drawing_id}`);
                    return { success: true, drawing_id: row.drawing_id, skipped: true };
                  }
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return { success: true, drawing_id: row.drawing_id };
              } catch (deleteError: any) {
                // 404 오류나 "not found" 메시지가 포함된 경우 무시
                if (deleteError.message?.includes('not found') || 
                    deleteError.message?.includes('404') ||
                    deleteError.message?.includes('DrawingMasters with ID') && deleteError.message?.includes('not found')) {
                  console.warn(`PFD 삭제 건너뛰기 - ID가 존재하지 않음: ${row.drawing_id}`);
                  return { success: true, drawing_id: row.drawing_id, skipped: true };
                }
                throw deleteError;
              }
            });
            
            const results = await Promise.all(deletePromises);
            const successfulDeletes = results.filter(r => r && r.success && !r.skipped);
            const skippedDeletes = results.filter(r => r && r.skipped);
            
            console.log(`삭제된 PFD 처리 완료: ${successfulDeletes.length}개 삭제, ${skippedDeletes.length}개 건너뛰기`);
          } catch (error) {
            console.error("PFD 삭제 실패:", error);
            // 개별 삭제 실패는 전체 프로세스를 중단시키지 않음
          }
        }
        
        // 추가된 행 처리
        if (addedPfdRows.length > 0) {
          try {
            for (const pfdItem of addedPfdRows) {
              if (!pfdItem._file) continue;
              
              const formData = new FormData();
              formData.append('process_id', parseInt(processId, 10).toString());
              formData.append('drawing_type', 'PFD'); // PFD 도면 타입 추가
              // DWG 파일의 경우 MIME 타입을 명시적으로 설정
              const fileBlob = new Blob([pfdItem._file], { 
                type: pfdItem._file.type || 'application/octet-stream' 
              });
              formData.append('siteFile', fileBlob, pfdItem._file.name);
              formData.append('remarks', pfdItem.remarks || '');
              
              // FormData 디버깅
              console.log('PFD FormData 내용:');
              console.log('process_id:', parseInt(processId, 10));
              console.log('drawing_type:', 'PFD');
              console.log('file:', pfdItem._file);
              console.log('file name:', pfdItem._file.name);
              console.log('file size:', pfdItem._file.size);
              console.log('file type:', pfdItem._file.type || 'application/octet-stream');
              console.log('remarks:', pfdItem.remarks || '');
              
              // 파일 크기 검증 (10MB 제한)
              const maxFileSize = 10 * 1024 * 1024; // 10MB
              if (pfdItem._file && pfdItem._file.size > maxFileSize) {
                throw new Error(`파일 크기가 너무 큽니다. 최대 ${maxFileSize / (1024 * 1024)}MB까지 업로드 가능합니다.`);
              }
              
              console.log('PFD 파일 업로드 시작:', {
                fileName: pfdItem._file.name,
                fileSize: pfdItem._file.size,
                fileSizeMB: (pfdItem._file.size / (1024 * 1024)).toFixed(2) + 'MB',
                fileType: pfdItem._file.type || 'application/octet-stream' // DWG 파일 타입 설정
              });
              
              // 사용자에게 업로드 시작 알림
              if (pfdItem._file.size > 1024 * 1024) { // 1MB 이상인 경우
                console.log(`대용량 파일 업로드 중... (${(pfdItem._file.size / (1024 * 1024)).toFixed(2)}MB)`);
              }
              
              // FormData entries 확인
              for (let [key, value] of (formData as any).entries()) {
                console.log(`${key}:`, value);
              }
              
              console.log('PFD API 호출 시작...');
              
              // 타임아웃 설정 (10분)
              const controller = new AbortController();
              const timeoutId = setTimeout(() => {
                controller.abort();
                console.error('PFD API 호출 타임아웃 (10분)');
              }, 10 * 60 * 1000);
              
              try {
                const response = await request('/api/process/drawing/create', undefined, {
                  method: 'POST',
                  body: formData,
                  signal: controller.signal
                  // headers는 request.ts에서 자동으로 설정됨 (FormData일 때 Content-Type 자동 설정)
                });
                
                clearTimeout(timeoutId);
                console.log('PFD API 호출 완료:', response);
                
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
                  
                  // PFD 저장 후 그리드 새로고침
                  await refreshPfdData();
                }
              } catch (apiError: any) {
                clearTimeout(timeoutId);
                
                if (apiError.name === 'AbortError') {
                  throw new Error('파일 업로드 시간이 초과되었습니다. 파일 크기를 확인해주세요.');
                }
                
                console.error('PFD API 호출 실패:', apiError);
                throw apiError;
              }
            }
            console.log("추가된 PFD 처리 완료");
          } catch (error: any) {
            console.error("PFD 추가 실패:", error);
            
            // 구체적인 에러 메시지 표시
            let errorMessage = "PFD 파일 업로드에 실패했습니다.";
            if (error.message) {
              if (error.message.includes("Failed to fetch")) {
                errorMessage = "서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.";
              } else if (error.message.includes("파일 크기가 너무 큽니다")) {
                errorMessage = error.message;
              } else if (error.message.includes("timeout")) {
                errorMessage = "파일 업로드 시간이 초과되었습니다. 파일 크기를 확인해주세요.";
              } else {
                errorMessage = error.message;
              }
            }
            
            alert(errorMessage);
            throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록 함
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
  console.log('PFD 아이템 drawing_id:', pfdItem.drawing_id);
  console.log('PFD 아이템 id:', pfdItem.id);
  console.log('PFD 아이템 모든 키:', Object.keys(pfdItem));
  
  // PFD drawing_id 확인
  if (!pfdItem.drawing_id) {
    alert('P&ID 매핑을 위해서는 먼저 PFD 파일을 저장해야 합니다.\n메인 저장 버튼을 클릭하여 PFD를 저장한 후 다시 시도해주세요.');
    return;
  }
  
  // 임시 ID인 경우 경고 (하지만 진행은 허용)
  if (pfdItem.drawing_id.startsWith('temp_pfd_drawing_')) {
    console.warn('PFD drawing_id가 임시 ID입니다:', pfdItem.drawing_id);
    // 임시 ID라도 P&ID 매핑을 허용하되, 실제 저장 시에는 문제가 될 수 있음을 로그로 기록
  }
  
  currentPfdItemForMapping.value = pfdItem;
  selectedMappingPidItems.value = []; // 선택된 항목들 초기화
  showMappingPidModal.value = true;
  
  // P&ID 목록 데이터 로드 - drawing_id를 parent_drawing_id로 전달
  await loadMappingPidList(pfdItem);
};

const closeMappingPidModal = () => {
  showMappingPidModal.value = false;
  currentPfdItemForMapping.value = null;
  mappingPidList.value = [];
  selectedMappingPidItems.value = []; // 선택된 항목들 초기화
  initialMappingPidList.value = []; // 초기값도 초기화
};

// P&ID 매핑 폼 초기화 함수
const resetMappingPidForm = async () => {
  // 그리드 데이터 초기화
  mappingPidList.value = [];
  selectedMappingPidItems.value = [];
  initialMappingPidList.value = []; // 초기값도 초기화
  
  // 파일 입력 초기화
  if (pidFileInput.value) {
    pidFileInput.value.value = '';
  }
  if (excelFileInput.value) {
    excelFileInput.value.value = '';
  }
  
  // PFD 탭 그리드 새로고침
  await refreshPfdData();
  
  console.log('P&ID 매핑 폼 초기화 완료');
};

// PFD 데이터 새로고침 함수
const refreshPfdData = async () => {
  try {
    const processId = props.processId || (route.params.id as string);
    console.log('PFD 데이터 새로고침 시작...');
    
    const pfdDrawingsData = await searchPfdDrawingAPI(processId);
    
    if (pfdDrawingsData && Array.isArray(pfdDrawingsData)) {
      const pfdItems = pfdDrawingsData.map((item: any, index: number) => {
        console.log(`새로고침 PFD 아이템 ${index + 1}:`, item);
        
        const drawingId = item.drawing_id || item.id || `pfd_drawing_${index + 1}`;
        
        return {
          id: `pfd_${index + 1}`,
          pfdFileName: item.current_file?.file_name || item.pfdFileName || '공정카드 파일',
          registrationDate: item.registrationDate || item.created_at || item.uploaded_at || formatDate(new Date()),
          infoOverview: item.infoOverview || item.drawing_title || item.info_overview || '',
          mappingPidList: '보기',
          remarks: item.remarks || '',
          drawing_id: drawingId
        };
      });
      
      processStore.setPfdList(pfdItems);
      const initialPfdData = JSON.parse(JSON.stringify(pfdItems));
      processStore.setInitialPfdList(initialPfdData);
      
      console.log('PFD 데이터 새로고침 완료:', pfdItems.length, '개');
    } else {
      console.log('PFD 데이터가 없습니다.');
      processStore.setPfdList([]);
      processStore.setInitialPfdList([]);
    }
  } catch (error) {
    console.error('PFD 데이터 새로고침 실패:', error);
  }
};

const confirmMappingPid = async () => {
  try {
    console.log('P&ID 매핑 확인:', mappingPidList.value);
    console.log('현재 PFD 아이템:', currentPfdItemForMapping.value);
    console.log('초기 P&ID 목록:', initialMappingPidList.value);
    console.log('초기 목록 개수:', initialMappingPidList.value.length);
    console.log('현재 목록 개수:', mappingPidList.value.length);
    console.log('초기 목록:', initialMappingPidList.value);
    console.log('현재 목록:', mappingPidList.value);
    
    // 삭제된 row 찾기 (초기값에는 있지만 현재 목록에는 없는 항목들)
    const deletedRows = initialMappingPidList.value.filter(initialItem => {
      // drawing_id가 있거나, drawing_id가 없어도 pidFileName이 있는 항목은 삭제 대상으로 간주
      if (!initialItem.drawing_id && !initialItem.pidFileName) return false;
      
      return !mappingPidList.value.some(currentItem => {
        // drawing_id가 있는 경우 drawing_id로 비교
        if (initialItem.drawing_id && currentItem.drawing_id) {
          return currentItem.drawing_id === initialItem.drawing_id;
        }
        // drawing_id가 없는 경우 pidFileName으로 비교
        return currentItem.pidFileName === initialItem.pidFileName;
      });
    });
    
    console.log('삭제된 P&ID row들:', deletedRows);
    
    // 파일 객체가 있는 항목들 중에서 새로 추가된 항목들만 (drawing_id가 없거나 undefined인 항목들)
    const validMappings = mappingPidList.value.filter(item => 
      item.pidFile && (!item.drawing_id || item.drawing_id === undefined) // 파일 객체가 있고 새 항목인 경우만 처리 대상
    );
    
    console.log('새로 추가된 P&ID 항목들 (drawing_id가 없고 파일 객체가 있는 항목들):', validMappings);
    console.log('현재 mappingPidList 전체:', mappingPidList.value);
    console.log('validMappings 조건 확인:', mappingPidList.value.map(item => ({
      pidFile: !!item.pidFile,
      pidFileValue: item.pidFile,
      pidFileName: item.pidFileName,
      drawing_id: item.drawing_id,
      isNewItem: !item.drawing_id, // drawing_id가 없으면 새 항목
      condition1: !!item.pidFile,
      condition2: (!item.drawing_id || item.drawing_id === undefined),
      bothConditions: !!item.pidFile && (!item.drawing_id || item.drawing_id === undefined)
    })));
    
    // 각 항목의 상태를 상세히 로깅
    mappingPidList.value.forEach((item, index) => {
      console.log(`항목 ${index + 1}:`, {
        pidFile: !!item.pidFile,
        pidFileName: item.pidFileName,
        drawing_id: item.drawing_id,
        isExistingItem: !!item.drawing_id,
        willBeSaved: !!item.pidFile
      });
    });
    
    // 1. 삭제 처리
    if (deletedRows.length > 0) {
      console.log(`삭제할 P&ID 항목 ${deletedRows.length}개 처리 시작`);
      
      try {
        const deletePromises = deletedRows.map(async (row) => {
          console.log('삭제 대상 항목 확인:', {
            row: row,
            drawing_id: row.drawing_id,
            pidFileName: row.pidFileName,
            hasDrawingId: !!row.drawing_id
          });
          
          if (!row.drawing_id) {
            console.log('drawing_id가 없어서 삭제 건너뛰기:', row);
            return null;
          }
          
          try {
            await deletePidDrawingAPI(row.drawing_id);
            console.log(`P&ID 삭제 성공 - drawing_id: ${row.drawing_id}`);
            return { success: true, drawing_id: row.drawing_id };
          } catch (deleteError: any) {
            // 404 오류나 "not found" 메시지가 포함된 경우 무시
            if (deleteError.message?.includes('not found') || 
                deleteError.message?.includes('404') ||
                deleteError.message?.includes('DrawingMasters with ID') && deleteError.message?.includes('not found')) {
              console.warn(`P&ID 삭제 건너뛰기 - ID가 존재하지 않음: ${row.drawing_id}`);
              return { success: true, drawing_id: row.drawing_id, skipped: true };
            }
            throw deleteError;
          }
        });
        
        const results = await Promise.all(deletePromises);
        const successfulDeletes = results.filter(r => r && r.success && !r.skipped);
        const skippedDeletes = results.filter(r => r && r.skipped);
        
        console.log(`P&ID 삭제 처리 완료: ${successfulDeletes.length}개 삭제, ${skippedDeletes.length}개 건너뛰기`);
      } catch (error) {
        console.error("P&ID 삭제 실패:", error);
        // 개별 삭제 실패는 전체 프로세스를 중단시키지 않음
      }
    }
    
    // 2. 삭제만 수행하는 경우 처리
    console.log('조건 확인:', {
      deletedRowsLength: deletedRows.length,
      validMappingsLength: validMappings.length,
      shouldDeleteOnly: deletedRows.length > 0 && validMappings.length === 0
    });
    
    // 삭제만 수행하는 경우 (삭제할 항목이 있고, 저장할 새 데이터가 없는 경우)
    if (deletedRows.length > 0 && validMappings.length === 0) {
      console.log('P&ID 삭제만 수행됨 - 저장할 새 데이터 없음');
      console.log('삭제된 항목 수:', deletedRows.length);
      console.log('저장할 새 데이터 수:', validMappings.length);
      alert('P&ID 항목이 삭제되었습니다.');
      // PFD 데이터 새로고침
      await refreshPfdData();
      closeMappingPidModal();
      return;
    }
    
    // 삭제와 저장이 모두 있는 경우
    if (deletedRows.length > 0 && validMappings.length > 0) {
      console.log('P&ID 삭제와 저장 모두 수행됨');
      console.log('삭제된 항목 수:', deletedRows.length);
      console.log('저장할 새 데이터 수:', validMappings.length);
    }
    
    // 3. 새 데이터 저장이 필요한 경우
    if (validMappings.length > 0) {
      console.log('새 데이터 저장 시작 - 항목 수:', validMappings.length);
      // 필수 입력 검증 (파일 객체가 있는 항목들에 대해서만)
      const invalidItems = validMappings.filter(item => 
        !item.pidFileName || item.pidFileName.trim() === ''
      );
      
      if (invalidItems.length > 0) {
        alert('P&ID 파일명은 필수 입력 항목입니다.\n모든 항목을 입력해주세요.');
        return;
      }
      // parent_drawing_id 설정 - loadMappingPidList에서 이미 설정된 값 사용
      const parentDrawingId = validMappings[0]?.parent_drawing_id || currentPfdItemForMapping.value?.drawing_id;
      console.log('P&ID 매핑 parent_drawing_id 설정:', {
        currentPfdItem: currentPfdItemForMapping.value,
        currentPfdDrawingId: currentPfdItemForMapping.value?.drawing_id,
        firstValidMappingParentId: validMappings[0]?.parent_drawing_id,
        parentDrawingId: parentDrawingId
      });
      
      if (!parentDrawingId) {
        console.error('parent_drawing_id가 없습니다:', {
          currentPfdItem: currentPfdItemForMapping.value,
          drawing_id: currentPfdItemForMapping.value?.drawing_id,
          validMappings: validMappings
        });
        alert('P&ID 매핑을 위한 PFD drawing_id가 없습니다. PFD를 먼저 저장해주세요.');
        return;
      }
      
      // P&ID 매핑 데이터 즉시 저장
      try {
        console.log('P&ID 매핑 새 데이터 생성 시작:', validMappings.length, '개');
        
        const pidMappingPromises = validMappings.map(async (item) => {
          // parent_drawing_id 설정
          if (!item.parent_drawing_id) {
            item.parent_drawing_id = parentDrawingId;
          }
          
          console.log('P&ID 매핑 아이템 저장:', {
            item: item,
            parent_drawing_id: item.parent_drawing_id,
            pidFile: item.pidFile?.name,
            excelFile: item.excelFile?.name || '없음',
            isNewItem: !item.drawing_id
          });
          
          // 새 데이터 - 생성 API 호출 (validMappings에서 이미 새 데이터만 필터링됨)
          console.log('새 데이터 - 생성 API 호출');
          
          const formData = new FormData();
          formData.append('process_id', props.processId || (route.params.id as string));
          formData.append('drawing_type', 'PNID');
          formData.append('parent_drawing_id', item.parent_drawing_id);
          
          // P&ID 파일 추가
          const pidFileBlob = new Blob([item.pidFile], { 
            type: item.pidFile.type || 'application/octet-stream' 
          });
          formData.append('siteFile', pidFileBlob, item.pidFile.name);
          
          // Excel 파일 추가 (있는 경우에만)
          if (item.excelFile) {
          const excelFileBlob = new Blob([item.excelFile], { 
            type: item.excelFile.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          });
          formData.append('excelFile', excelFileBlob, item.excelFile.name);
          }
          
          formData.append('info_overview', item.infoOverview || '');
          formData.append('remarks', item.remarks || '');
          
          console.log('P&ID 매핑 FormData 내용:');
          console.log('process_id:', props.processId || (route.params.id as string));
          console.log('drawing_type:', 'PNID');
          console.log('parent_drawing_id:', item.parent_drawing_id);
          console.log('pid_file:', item.pidFile.name);
          console.log('excel_file:', item.excelFile?.name || '없음');
          
          const response = await request('/api/process/drawing/create', undefined, {
            method: 'POST',
            body: formData
          });
          
          if (!response.success) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return response;
        });
        
        const results = await Promise.all(pidMappingPromises);
        const successfulSaves = results.filter(r => r && r.success);
        
        console.log('P&ID 매핑 저장 완료:', {
          total: results.length,
          successfulSaves: successfulSaves.length
        });
        
        if (successfulSaves.length > 0) {
          alert(`P&ID 매핑 ${successfulSaves.length}개가 성공적으로 저장되었습니다.`);
        }
        
        // 저장 성공 후 화면 초기화
        await resetMappingPidForm();
        
      } catch (error: any) {
        console.error('P&ID 매핑 저장 실패:', error);
        alert(`P&ID 매핑 저장 실패: ${error.message}`);
        return;
      }
    } else {
      // 아무 작업도 수행하지 않은 경우
      console.log('아무 작업도 수행하지 않음');
      console.log('삭제된 항목 수:', deletedRows.length);
      console.log('저장할 새 데이터 수:', validMappings.length);
      console.log('현재 목록 전체:', mappingPidList.value);
      
      if (deletedRows.length === 0 && validMappings.length === 0) {
        console.log('조건 확인: 삭제할 항목 없음, 저장할 새 데이터 없음');
        alert('저장할 P&ID 매핑 데이터가 없습니다.\n새 파일을 선택하거나 기존 항목을 삭제해주세요.');
      }
    }
    
    closeMappingPidModal();
    
  } catch (error: any) {
    console.error('P&ID 매핑 저장 실패:', error);
    alert(`P&ID 매핑 저장 실패: ${error.message}`);
  }
};

const loadMappingPidList = async (pfdItem: any) => {
  try {
    console.log('P&ID 매핑 목록 로드 시작:', pfdItem);
    console.log('parent_drawing_id:', pfdItem.drawing_id);
    
    const parentDrawingId = pfdItem.drawing_id;
    if (!parentDrawingId) {
      console.error('parent_drawing_id가 없습니다.');
      mappingPidList.value = [];
      return;
    }
    
    // P&ID 도면 검색 API 호출
    const requestBody = {
      search_field: "parent_drawing_id",
      search_value: parentDrawingId
    };
    
    console.log('P&ID 도면 검색 API 호출:', requestBody);
    
    const response = await request('/api/process/drawing_child/search', undefined, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.success) {
      console.error('P&ID 도면 검색 API 응답 오류:', response);
      mappingPidList.value = [];
      return;
    }
    
    const pidDrawingsData = response.response || [];
    console.log('P&ID 도면 검색 API 응답:', pidDrawingsData);
    
    if (Array.isArray(pidDrawingsData) && pidDrawingsData.length > 0) {
      // child_drawings 배열을 기반으로 그리드 데이터 생성
      const allChildDrawings: any[] = [];
      
      pidDrawingsData.forEach((parentItem: any, parentIndex: number) => {
        console.log(`P&ID 부모 아이템 ${parentIndex + 1} - 원본 API 응답:`, parentItem);
        
        if (parentItem.child_drawings && Array.isArray(parentItem.child_drawings)) {
          parentItem.child_drawings.forEach((childDrawing: any, childIndex: number) => {
            console.log(`P&ID 자식 도면 ${childIndex + 1} - child_drawings:`, childDrawing);
            
            allChildDrawings.push({
              parentItem: parentItem,
              childDrawing: childDrawing,
              parentIndex: parentIndex,
              childIndex: childIndex
            });
          });
        }
      });
      
      console.log('모든 child_drawings 수집 완료:', allChildDrawings.length, '개');
      
      if (allChildDrawings.length > 0) {
        const pidItems = allChildDrawings.map((item, index: number) => {
          const childDrawing = item.childDrawing;
          
          // 디버깅을 위한 상세 로그
          console.log(`P&ID 아이템 ${index + 1} - childDrawing 구조:`, {
            childDrawing: childDrawing,
            detail: childDrawing.detail,
            current_file: childDrawing.detail?.current_file,
            file_name_from_detail: childDrawing.detail?.current_file?.file_name,
            file_name_from_root: childDrawing.file_name,
            current_file_from_root: childDrawing.current_file?.file_name,
            drawing_id: childDrawing.drawing_id,
            file_id: childDrawing.file_id,
            description: childDrawing.description,
            current_file_drawing_id: childDrawing.detail?.current_file?.drawing_id || childDrawing.current_file?.drawing_id
          });
          
          // detail.current_file.file_name을 우선적으로 사용하고, fallback으로 다른 경로들 확인
          const pidFileName = childDrawing.detail?.current_file?.file_name || 
                             childDrawing.current_file?.file_name || 
                             childDrawing.file_name || 
                             childDrawing.detail?.file_name || '';
          
          console.log(`P&ID 아이템 ${index + 1} - 최종 pidFileName:`, pidFileName);
          
          // infoOverview 설정을 위한 디버깅 (description만 사용)
          const infoOverview = childDrawing.description || '';
          console.log(`P&ID 아이템 ${index + 1} - infoOverview 설정 (description만 사용):`, {
            description: childDrawing.description,
            final_infoOverview: infoOverview
          });
          
          // drawing_id 설정을 위한 디버깅
          const drawingId = childDrawing.drawing_id || 
                           childDrawing.file_id || 
                           childDrawing.id ||
                           childDrawing.detail?.current_file?.drawing_id ||
                           childDrawing.current_file?.drawing_id ||
                           childDrawing.detail?.drawing_id;
          console.log(`P&ID 아이템 ${index + 1} - drawing_id 설정:`, {
            childDrawing_drawing_id: childDrawing.drawing_id,
            childDrawing_file_id: childDrawing.file_id,
            childDrawing_id: childDrawing.id,
            detail_current_file_drawing_id: childDrawing.detail?.current_file?.drawing_id,
            current_file_drawing_id: childDrawing.current_file?.drawing_id,
            detail_drawing_id: childDrawing.detail?.drawing_id,
            final_drawing_id: drawingId
          });
        
        return {
          id: `pid_${index + 1}`,
          no: index + 1,
            pidFileName: pidFileName,
            excelFileName: childDrawing.excel_file_name || childDrawing.excel_file || '',
            infoOverview: infoOverview,
            remarks: childDrawing.remarks || '',
          parent_drawing_id: parentDrawingId,
            drawing_id: drawingId,
            current_file_drawing_id: childDrawing.detail?.current_file?.drawing_id || childDrawing.current_file?.drawing_id,
            file_id: childDrawing.detail?.current_file?.file_id || childDrawing.file_id,
            file_uri: childDrawing.detail?.current_file?.file_uri || childDrawing.current_file?.file_uri || childDrawing.file_uri,
            file_size: childDrawing.detail?.current_file?.file_size || childDrawing.current_file?.file_size || childDrawing.file_size,
            file_type: childDrawing.detail?.current_file?.file_type || childDrawing.current_file?.file_type || childDrawing.file_type,
          pidFile: null, // 파일 객체는 나중에 선택 시 설정
          excelFile: null // 파일 객체는 나중에 선택 시 설정
        };
      });
      
      mappingPidList.value = pidItems;
        // 초기값 저장 (깊은 복사)
        initialMappingPidList.value = JSON.parse(JSON.stringify(pidItems));
      console.log('P&ID 매핑 목록 로드 완료:', mappingPidList.value.length, '개');
        console.log('P&ID 초기값 저장 완료:', initialMappingPidList.value.length, '개');
      } else {
        // child_drawings가 없는 경우 빈 행 1개 추가
        const emptyRow = {
          id: 'pid_1',
          no: 1,
          pidFileName: '',
          excelFileName: '',
          infoOverview: '예: 펌프, 2대',
          remarks: '',
          parent_drawing_id: parentDrawingId,
          drawing_id: null,
          pidFile: null,
          excelFile: null
        };
        
        mappingPidList.value = [emptyRow];
        // 초기값 저장 (깊은 복사)
        initialMappingPidList.value = JSON.parse(JSON.stringify([emptyRow]));
        console.log('P&ID 매핑 목록 로드 완료 (빈 행):', mappingPidList.value);
        console.log('P&ID 초기값 저장 완료 (빈 행):', initialMappingPidList.value);
      }
    } else {
      // 기존 데이터가 없는 경우 빈 행 1개 추가
      const emptyRow = {
        id: 'pid_1',
        no: 1,
        pidFileName: '',
        excelFileName: '',
        infoOverview: '예: 펌프, 2대',
        remarks: '',
        parent_drawing_id: parentDrawingId,
        drawing_id: null,
        pidFile: null,
        excelFile: null
      };
      
      mappingPidList.value = [emptyRow];
      // 초기값 저장 (깊은 복사)
      initialMappingPidList.value = JSON.parse(JSON.stringify([emptyRow]));
      console.log('P&ID 매핑 목록 로드 완료 (빈 행):', mappingPidList.value);
      console.log('P&ID 초기값 저장 완료 (빈 행):', initialMappingPidList.value);
    }
    
  } catch (error) {
    console.error('P&ID 매핑 목록 로드 실패:', error);
    mappingPidList.value = [];
  }
};

// P&ID 매핑 모달 추가 함수들
const addMappingPidRow = () => {
  const parentDrawingId = currentPfdItemForMapping.value?.drawing_id;
  console.log('새 행 추가 - parent_drawing_id:', parentDrawingId);
  
  const newRow = {
    id: `mapping_${Date.now()}`,
    no: mappingPidList.value.length + 1,
    pidFileName: '',
    excelFileName: '',
    infoOverview: '예: 펌프, 2대',
    parent_drawing_id: parentDrawingId // 현재 PFD의 drawing_id를 parent_drawing_id로 전달
  };
  mappingPidList.value.push(newRow);
  console.log('새 행 추가 완료:', newRow);
};

const selectPidFile = (item: any) => {
  currentPfdItemForMapping.value = item;
  pidFileInput.value?.click();
};

const selectExcelFile = (item: any) => {
  currentPfdItemForMapping.value = item;
  excelFileInput.value?.click();
};

const handlePidFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentPfdItemForMapping.value) {
    const file = target.files[0];
    
    // *.dwg 파일만 허용
    if (!file.name.toLowerCase().endsWith('.dwg')) {
      alert('P&ID 파일은 *.dwg 형식만 선택 가능합니다.');
      target.value = ''; // 파일 선택 초기화
      return;
    }
    
    currentPfdItemForMapping.value.pidFileName = file.name;
    currentPfdItemForMapping.value.pidFile = file; // 실제 File 객체 저장
    console.log('P&ID 파일 선택됨:', file.name);
  }
};

const handleExcelFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentPfdItemForMapping.value) {
    const file = target.files[0];
    currentPfdItemForMapping.value.excelFileName = file.name;
    currentPfdItemForMapping.value.excelFile = file; // 실제 File 객체 저장
    console.log('Excel 파일 선택됨:', file.name);
  }
};

const clearPidFile = (item: any) => {
  item.pidFileName = '';
  item.pidFile = null; // File 객체도 삭제
};

const clearExcelFile = (item: any) => {
  item.excelFileName = '';
  item.excelFile = null; // File 객체도 삭제
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
       // 공정 상세 정보 로드 완료
       
       // 공정심볼 파일명 표시 확인
       
       // 언어 및 단위 시스템 코드를 화면에 매핑
       if (processStore.processDetail.language_code) {
         selectedLanguage.value = processStore.processDetail.language_code;
       }
       
       if (processStore.processDetail.unit_system_code) {
         selectedUnit.value = processStore.processDetail.unit_system_code;
       }
       
       // 드롭다운 옵션 상태 확인
       
       // 공정명 값 설정 확인
      
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
                
                if (!matchedOption) {
                  // 일치하는 값이 없는 경우 '-- 선택 --'으로 설정
                  processStore.setProcessDetail({ processName: '' });
                }
              }
          }
        }
      
      // 계산식 검색 API 호출하여 계산식 데이터 로드
      try {
        console.log('계산식 검색 API 호출 시작...');
        const formulaResult = await searchFormulaAPI();
        
        if (formulaResult && formulaResult.response && Array.isArray(formulaResult.response)) {
          const formulaItems = formulaResult.response.map((item: any, index: number) => {
            const formulaItem = {
              id: `existing_formula_${item.id || index}`, // 기존 데이터는 existing_ 접두사 사용
              no: (index + 1).toString().padStart(3, '0'),
              registeredFormula: item.formula_name || item.name || '',
              formula_code: item.formula_code || item.code || '',
              registrationDate: item.created_at || item.registration_date || formatDate(new Date()),
              infoOverview: item.formula_scope || item.scope || '',
              remarks: item.output_type || item.type || '',
              formula_id: item.formula_id || item.id || null,
              _file: undefined
            };
            
            console.log('계산식 아이템 생성 (response):', {
              원본_item_id: item.id,
              원본_formula_id: item.formula_id,
              생성된_id: formulaItem.id,
              생성된_formula_id: formulaItem.formula_id,
              formula_name: item.formula_name
            });
            
            return formulaItem;
          });
          
          processStore.setFormulaList(formulaItems);
          const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
          processStore.setInitialFormulaList(initialFormulaData);
          
          console.log('계산식 데이터 로드 완료:', formulaItems.length, '개');
        } else if (formulaResult && 'data' in formulaResult && Array.isArray(formulaResult.data)) {
          const formulaItems = formulaResult.data.map((item: any, index: number) => {
            const formulaItem = {
              id: `existing_formula_${item.id || index}`, // 기존 데이터는 existing_ 접두사 사용
              no: (index + 1).toString().padStart(3, '0'),
              registeredFormula: item.formula_name || item.name || '',
              formula_code: item.formula_code || item.code || '',
              registrationDate: item.created_at || item.registration_date || formatDate(new Date()),
              infoOverview: item.formula_scope || item.scope || '',
              remarks: item.output_type || item.type || '',
              formula_id: item.formula_id || item.id || null,
              _file: undefined
            };
            
            console.log('계산식 아이템 생성 (data):', {
              원본_item_id: item.id,
              원본_formula_id: item.formula_id,
              생성된_id: formulaItem.id,
              생성된_formula_id: formulaItem.formula_id,
              formula_name: item.formula_name
            });
            
            return formulaItem;
          });
          
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
          const pfdItems = pfdDrawingsData.map((item: any, index: number) => {
            console.log(`onMounted PFD 아이템 ${index + 1}:`, item);
            console.log(`onMounted PFD 아이템 ${index + 1} - pfdFileName:`, item.pfdFileName);
            console.log(`onMounted PFD 아이템 ${index + 1} - drawing_id:`, item.drawing_id);
            console.log(`onMounted PFD 아이템 ${index + 1} - id:`, item.id);
            
            const drawingId = item.drawing_id || item.id || `pfd_drawing_${index + 1}`;
            console.log(`onMounted PFD 아이템 ${index + 1} - 최종 drawing_id:`, drawingId);
            
            return {
              id: `pfd_${index + 1}`,
              pfdFileName: item.current_file?.file_name || item.pfdFileName || '공정카드 파일',
              registrationDate: item.registrationDate || item.created_at || item.uploaded_at || formatDate(new Date()),
              infoOverview: item.infoOverview || item.drawing_title || item.info_overview || '',
              mappingPidList: '보기',
              remarks: item.remarks || '',
              drawing_id: drawingId
            };
          });
          
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
               
               if (!matchedOption) {
                 // 일치하는 값이 없는 경우 '-- 선택 --'으로 설정
                 processStore.setProcessDetail({ processName: '' });
               }
             }
                  }
      }
      
      // 계산식 검색 API 호출하여 계산식 데이터 로드
      try {
        console.log('계산식 검색 API 호출 시작 (watch)...');
        const formulaResult = await searchFormulaAPI();
        
        if (formulaResult && formulaResult.response && Array.isArray(formulaResult.response)) {
          const formulaItems = formulaResult.response.map((item: any, index: number) => {
            const formulaItem = {
              id: `existing_formula_${item.id || index}`, // 기존 데이터는 existing_ 접두사 사용
              no: (index + 1).toString().padStart(3, '0'),
              registeredFormula: item.formula_name || item.name || '',
              formula_code: item.formula_code || item.code || '',
              registrationDate: item.created_at || item.registration_date || formatDate(new Date()),
              infoOverview: item.formula_scope || item.scope || '',
              remarks: item.output_type || item.type || '',
              formula_id: item.formula_id || item.id || null,
              _file: undefined
            };
            
            console.log('계산식 아이템 생성 (watch, response):', {
              원본_item_id: item.id,
              원본_formula_id: item.formula_id,
              생성된_id: formulaItem.id,
              생성된_formula_id: formulaItem.formula_id,
              formula_name: item.formula_name
            });
            
            return formulaItem;
          });
          
          processStore.setFormulaList(formulaItems);
          const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
          processStore.setInitialFormulaList(initialFormulaData);
          
          console.log('계산식 데이터 로드 완료 (watch):', formulaItems.length, '개');
        } else if (formulaResult && 'data' in formulaResult && Array.isArray(formulaResult.data)) {
          const formulaItems = formulaResult.data.map((item: any, index: number) => {
            const formulaItem = {
              id: `existing_formula_${item.id || index}`, // 기존 데이터는 existing_ 접두사 사용
              no: (index + 1).toString().padStart(3, '0'),
              registeredFormula: item.formula_name || item.name || '',
              formula_code: item.formula_code || item.code || '',
              registrationDate: item.created_at || item.registration_date || formatDate(new Date()),
              infoOverview: item.formula_scope || item.scope || '',
              remarks: item.output_type || item.type || '',
              formula_id: item.formula_id || item.id || null,
              _file: undefined
            };
            
            console.log('계산식 아이템 생성 (watch, data):', {
              원본_item_id: item.id,
              원본_formula_id: item.formula_id,
              생성된_id: formulaItem.id,
              생성된_formula_id: formulaItem.formula_id,
              formula_name: item.formula_name
            });
            
            return formulaItem;
          });
          
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

.grid-title {
  margin-bottom: 15px;
}

.grid-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
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
