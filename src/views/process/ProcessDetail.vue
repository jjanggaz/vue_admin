<template>
  <div class="process-page">
    <!-- Add Button -->
    <div class="action-bar">
      <dl class="column-search">
        <dt class="essential">공정구분</dt>
        <dd>
          <select name="" id="">
            <option value=""></option>
          </select>
        </dd>
        <dt class="essential">공정명</dt>
        <dd>
          <select name="" id="">
            <option value=""></option>
          </select>
        </dd>
        <dt>모드</dt>
        <dd>
          <select name="" id="">
            <option value=""></option>
          </select>
        </dd>
        <dt class="essential">공정심볼</dt>
        <dd>
          <input type="file" class="form-input" placeholder="">
        </dd>
        <!-- <dt class="essential">계산식</dt>
        <dd>
          <input type="text" class="form-input" placeholder="">
        </dd> -->
        <dt>비고</dt>
        <dd class="extend-all">
          <input type="text" class="form-input" placeholder="">
        </dd>
      </dl>


      <div class="btns">
        <button class="btn btn-primary btn-regist">
          등록
        </button>
        <button
          class="btn btn-primary btn-edit"
        >
          수정
        </button>
      </div>
    </div>
  </div>

  <div class="action-bar">
    <div class="swiper-bar">
      <div class="tabs-wrapper">
        <button v-if="canScrollLeft" class="btn-scroll left" @click="scrollTabs(-1)">◀</button>
        <div class="tabs" ref="tabsContainer" @scroll="updateScrollButtons">
          <div
            v-for="(tab, idx) in tabs"
            :key="tab"
            :class="['tab', { active: activeTab === idx }]"
            @click="onTabClick(idx)"
          >{{ tab }}</div>
        </div>
        <button v-if="canScrollRight" class="btn-scroll right" @click="scrollTabs(1)">▶</button>
      </div>
    </div>

  </div>

  <div class="tab-content">
    <div v-if="activeTab === 0" class="content">
      
      <div class="action-bar" style="justify-content: flex-end;">
        <div class="btns">
          <button class="btn btn-primary btn-regist">
            P&ID 추가
          </button>
          <button class="btn btn-primary btn-delete">
            삭제
          </button>
        </div>
      </div>
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
    <div v-if="activeTab === 1" class="content display-grid-2" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
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
      <div class="action-bar" style="justify-content: flex-end;">
        <div class="btns">
          <button class="btn btn-primary btn-add">
            추가
          </button>
          <button class="btn btn-primary btn-delete">
            삭제
          </button>
        </div>
      </div>
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
      <div class="action-bar" style="justify-content: flex-end;">
        <div class="btns">
          <button class="btn btn-primary btn-add">
            추가
          </button>
          <button class="btn btn-primary btn-delete">
            삭제
          </button>
        </div>
      </div>
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
      <div class="action-bar" style="justify-content: flex-end;">
        <div class="btns">
          <button class="btn btn-primary btn-add">
            추가
          </button>
          <button class="btn btn-primary btn-delete">
            삭제
          </button>
        </div>
      </div>
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
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import DataTable, { type TableColumn } from '@/components/common/DataTable.vue'
import Pagination from '@/components/common/Pagination.vue'

// 공통 로딩 상태
const loading = ref(false)

// 0: P&ID 탭용 컬럼/데이터
const pidColumns: TableColumn[] = [
  { key: 'dwg', title: '도면파일DWG' },
  { key: 'excel', title: 'Excel' },
  { key: 'info', title: '정보개요' },
  { key: 'view', title: 'Svg도면 미리보기'}
]
const pidList = ref([
  { dwg: 'pid1.dwg', excel: 'pid1.xlsx', info: 'P&ID 정보 1', view: 'pid1.svg' },
  { dwg: 'pid2.dwg', excel: 'pid2.xlsx', info: 'P&ID 정보 2', view: 'pid2.svg' }
])

// P&ID 탭 페이징 상태
const currentPagePid = ref(1)
const pageSize = ref(10)
const totalPagesPid = computed(() => Math.ceil(pidList.value.length / pageSize.value) || 1)
const pagedPidList = computed(() => pidList.value.slice((currentPagePid.value - 1) * pageSize.value, currentPagePid.value * pageSize.value))
// 페이지 변경 핸들러
const handlePageChangePid = (page: number) => { currentPagePid.value = page }

// 1: 설계조건 탭용 컬럼/데이터 (기존 복원)
const designColumns: TableColumn[] = [
  { key: 'columnNm', title: '항목' },
  { key: 'influent', title: 'Influent' },
  { key: 'effluent', title: 'Effluent' },
  { key: 'sludge', title: 'Sludge' },
  { key: 'unit', title: 'Unit' },
  { key: 'remark', title: 'Remark' }
]
const designList = ref([
  { columnNm: '', influent: '324', effluent: '245', sludge: '', unit: 'mg/L', remark: 'Remark A' },
  { columnNm: '', influent: '645', effluent: '134', sludge: '', unit: 'mg/L', remark: 'Remark B' }
])

const designCriteriaColumns: TableColumn[] = [
  { key: 'columnNm', title: '항목' },
  { key: 'value', title: 'Value' },
  { key: 'min', title: 'Min' },
  { key: 'max', title: 'Max' },
  { key: 'unit', title: 'Unit' },
  { key: 'remark', title: 'Remark' }
]
const designCriteriaList = ref([
  { columnNm: '', value: '10', min: '5', max: '15', unit: 'hr', remark: '기본' },
  { vcolumnNm: '', alue: '20', min: '10', max: '30', unit: '℃', remark: '고온' }
])

const designParameterColumns: TableColumn[] = [
  { key: 'columnNm', title: '항목' },
  { key: 'view', title: 'view' }
]
const designParameterList = ref([
  { columnNm: '', column: 'param1', view: 'view1' },
  { columnNm: '', column: 'param2', view: 'view2' }
])

// 5: 설계조건 효율 테이블용 컬럼/데이터
const designEfficiencyColumns: TableColumn[] = [
  { key: 'columnNm', title: '항목' },
  { key: 'value', title: 'Value' },
  { key: 'min', title: 'Min' },
  { key: 'max', title: 'Max' },
  { key: 'unit', title: 'Unit' },
  { key: 'remark', title: 'Remark' }
]
const designEfficiencyList = ref([
  { columnNm: '', value: '30', min: '20', max: '40', unit: '%', remark: '' },
  { columnNm: '', value: '50', min: '45', max: '55', unit: '%', remark: '' }
])

// 6: 계산식 관리 탭용 컬럼/데이터
const calculationColumns: TableColumn[] = [
  { key: 'no', title: '순번' },
  { key: 'formulaVersion', title: '계산식 버전' },
  { key: 'appliedVersion', title: '적용 버전' },
  { key: 'remark', title: '비고' }
]
const calculationList = ref([
  { no: '1', formulaVersion: 'v1.0', appliedVersion: 'v1.1', remark: '초기' },
  { no: '2', formulaVersion: 'v2.0', appliedVersion: 'v2.1', remark: '업데이트' }
])

// 7: PDF 탭용 컬럼/데이터
const pdfColumns: TableColumn[] = [
  { key: 'dwg', title: '도면파일DWG', sortable: true },
  { key: 'excel', title: 'Excel', sortable: true },
  { key: 'info', title: '정보개요', sortable: true },
  { key: 'view', title: 'Svg도면 미리보기', sortable: true }
]
const pdfList = ref([
  { dwg: 'file1.dwg', excel: 'file1.xlsx', info: '개요1', view: 'file1.svg' },
  { dwg: 'file2.dwg', excel: 'file2.xlsx', info: '개요2', view: 'file2.svg' }
])
const selectedPdfItems = ref<any[]>([])
const handlePdfSelectionChange = (items: any[]) => {
  selectedPdfItems.value = items
  console.log('PDF 선택 변경:', items)
}

// 8: 전기도면 탭용 컬럼/데이터
const electricColumns: TableColumn[] = [
  { key: 'dwg', title: '도면파일DWG', sortable: true },
  { key: 'excel', title: 'Excel', sortable: true },
  { key: 'info', title: '정보개요', sortable: true },
  { key: 'view', title: 'Svg도면 미리보기', sortable: true }
]
const electricList = ref([
  { dwg: 'elec1.dwg', excel: 'elec1.xlsx', info: '전도개요1', view: 'elec1.svg' },
  { dwg: 'elec2.dwg', excel: 'elec2.xlsx', info: '전도개요2', view: 'elec2.svg' }
])
// 전기도면 탭 선택 상태
const selectedElectricItems = ref<any[]>([])
const handleElectricSelectionChange = (items: any[]) => {
  selectedElectricItems.value = items
  console.log('전기도면 선택 변경:', items)
}

const structColumns: TableColumn[] = [
  { key: 'type', title: '구분', sortable: true },
  { key: 'components', title: 'Components', sortable: true },
  { key: 'equipmentType', title: '장비유형', sortable: true },
  { key: 'item', title: 'Item', sortable: true },
]
const structList = ref([
  { type: '', components: '', equipmentType: '', item: '' }
])

// PID 탭 선택 상태
const selectedPidItems = ref<any[]>([])
// PID 탭 선택 변경 핸들러
const handlePidSelectionChange = (items: any[]) => {
  selectedPidItems.value = items
  console.log('PID 선택 변경:', items)
}

// 9: Mcc 구성도 탭용 컬럼/데이터
const mccColumns: TableColumn[] = [
  { key: 'dwg', title: '도면파일DWG', sortable: true },
  { key: 'excel', title: 'Excel', sortable: true },
  { key: 'info', title: '정보개요', sortable: true },
  { key: 'view', title: 'Svg도면 미리보기', sortable: true }
]
const mccList = ref([
  { dwg: 'mcc1.dwg', excel: 'mcc1.xlsx', info: 'Mcc 정보 1', view: 'mcc1.svg' },
  { dwg: 'mcc2.dwg', excel: 'mcc2.xlsx', info: 'Mcc 정보 2', view: 'mcc2.svg' }
])
// Mcc 구성도 탭 선택 상태
const selectedMccItems = ref<any[]>([])
const handleMccSelectionChange = (items: any[]) => {
  selectedMccItems.value = items
  console.log('Mcc 구성도 선택 변경:', items)
}

// 정렬 이벤트 핸들러
const handleSortChange = (args: { key: string; direction: 'asc' | 'desc' }) => {
  console.log('정렬:', args.key, args.direction)
}
// 행 클릭 핸들러
const handleRowClick = (item: any, index: number) => {
  console.log('행 클릭:', item, index)
}

const tabs = ref(['P&ID', '설계조건', '공용구조물', '계산식 관리', 'PDF', '전기도면', 'Mcc 구성도'])
const activeTab = ref(0)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const tabsContainer = ref<HTMLElement | null>(null)

const onTabClick = (index: number) => {
  activeTab.value = index
}

const updateScrollButtons = () => {
  if (!tabsContainer.value) return
  const { scrollLeft, clientWidth, scrollWidth } = tabsContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth
}

const scrollTabs = (direction: number) => {
  if (!tabsContainer.value) return
  const { scrollLeft, clientWidth } = tabsContainer.value
  const newScrollLeft = scrollLeft + direction * clientWidth
  tabsContainer.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
}

onMounted(() => {
  nextTick(() => {
    updateScrollButtons()
  })
})

// PDF pagination state
const currentPagePdf = ref(1)
const totalPagesPdf = computed(() => Math.ceil(pdfList.value.length / pageSize.value) || 1)
const pagedPdfList = computed(() => pdfList.value.slice((currentPagePdf.value - 1) * pageSize.value, currentPagePdf.value * pageSize.value))
const handlePageChangePdf = (page: number) => { currentPagePdf.value = page }

// Electric pagination state
const currentPageElectric = ref(1)
const totalPagesElectric = computed(() => Math.ceil(electricList.value.length / pageSize.value) || 1)
const pagedElectricList = computed(() => electricList.value.slice((currentPageElectric.value - 1) * pageSize.value, currentPageElectric.value * pageSize.value))
const handlePageChangeElectric = (page: number) => { currentPageElectric.value = page }

// Mcc pagination state
const currentPageMcc = ref(1)
const totalPagesMcc = computed(() => Math.ceil(mccList.value.length / pageSize.value) || 1)
const pagedMccList = computed(() => mccList.value.slice((currentPageMcc.value - 1) * pageSize.value, currentPageMcc.value * pageSize.value))
const handlePageChangeMcc = (page: number) => { currentPageMcc.value = page }
</script>

<style scoped lang="scss">
.public-management-layout {
  height: 100%;
  padding: $spacing-lg;
}
</style>
