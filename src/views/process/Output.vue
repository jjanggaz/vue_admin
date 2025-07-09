<template>
  <div class="output-page">
    <div class="action-bar">
      <div class="swiper-bar">
        <!-- 탭 리스트 -->
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
      <div class="group-form">

       <button class="btn-regist" @click="handleRegist">신규등록</button>
      </div>
    </div>

    <!-- 탭 컨텐츠: 스와이프 가능 -->
    <div
      class="tab-content"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <DataTable
        v-if="activeTab === 0"
        :columns="tableColumns"
        :data="outputList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <DataTable
        v-if="activeTab === 1"
        :columns="tableColumns"
        :data="outputList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <DataTable
        v-if="activeTab === 2"
        :columns="tableColumns"
        :data="outputList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
    </div>

    <div class="pagination-container">
     <Pagination 
      :current-page="currentPage"
      :total-pages="totalPagesComputed"
      @page-change="handlePageChange"
     />
    </div>

    <!-- 등록 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>등록</h3>
          <button class="btn-close" @click="isRegistModalOpen = false">X</button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt class="essential">유입종류명</dt>
            <dd>
              <input v-model="newTypeName" type="text" class="form-input" placeholder="유입종류명을 입력하세요" />
            </dd>
            <dt>파일 업로드</dt>
            <dd>
              <input type="file" class="form-input" placeholder="" />
            </dd>
            <dt>비고</dt>
            <dd>
              <input type="text" class="form-input" placeholder="" />
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="handleSave">저장</button>
          <button class="btn btn-secondary" @click="isRegistModalOpen = false">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DataTable, { type TableColumn } from '@/components/common/DataTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import { formatDate } from '@/utils/dateUtils'

interface OutputItem {
  id: string
  name: string
  type: string
  createdAt: string
  status: string
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: 'id', title: 'ID', sortable: true, hidden: true },
  
  { key: 'num', title: '번호', sortable: true, formatter: (value, item, index) => String((index || 0) + 1) },
  { key: 'column', title: '항목', sortable: true },
  { key: 'influent', title: 'INFLUENT', sortable: true },
  { key: 'unit', title: 'UNIT', sortable: true },
  { key: 'etc', title: '비고', sortable: true },
]

const outputList = ref<OutputItem[]>([
  { num: '1', column: 'Column A', influent: 'Influent A', unit: '', etc: 'Etc A' },
])

const searchQuery = ref("");
const loading = ref(false)

const currentPage = ref(1)
const totalPages = ref(10)
const pageSize = ref(10);
const totalCount = ref(0);

const isRegistModalOpen = ref(false)
// 신규 탭 입력값
const newTypeName = ref('')
// 동적 탭 목록
const tabs = ref<string[]>(['탭1', '탭2', '탭3'])

const activeTab = ref(0)
let touchStartX = 0
let touchEndX = 0

const handleSortChange = (column: string, direction: 'asc' | 'desc') => {
  console.log(`Sorting by ${column} in ${direction} order`);
  // 정렬 로직 구현
}

const onTabClick = (idx: number) => {
  activeTab.value = idx
}
const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].clientX
}
const onTouchMove = (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].clientX
}
const onTouchEnd = () => {
  const delta = touchEndX - touchStartX
  if (delta > 50 && activeTab.value > 0) {
    activeTab.value--
  } else if (delta < -50 && activeTab.value < tabs.value.length - 1) {
    activeTab.value++
  }
}

const totalCountComputed = computed(() => filterOutoutList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);


const filterOutoutList = computed(() => {
  if (!searchQuery.value) return outputList.value;
  return outputList.value.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
});

const handleRowClick = (item: OutputItem) => {
  console.log('Row clicked:', item);
  // 행 클릭 시 상세보기 로직 구현
}

const handleRegist = () => {
  isRegistModalOpen.value = true;
  console.log('신규등록 버튼 클릭');
}

// 모달 저장 버튼: 새로운 탭 추가
const handleSave = () => {
  const name = newTypeName.value.trim()
  if (name) {
    tabs.value.push(name)
    newTypeName.value = ''
    console.log('새 탭 추가:', name)
  }
  isRegistModalOpen.value = false
}

// 페이지 로드 시 데이터 가져오기
const loadOutputList = async () => {
  loading.value = true;
  try {
    // API 호출 또는 데이터 로딩 로직
    // 예시: outputList.value = await fetchOutputData();
    console.log('Output data loaded');
  } catch (error) {
    console.error('Error loading output data:', error);
  } finally {
    loading.value = false;
  }
}

loadOutputList();

// 페이지 변경 핸들러
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadOutputList();
}
// 페이지네이션 관련 설정
const pagination = {
  currentPage: currentPage,
  totalPages: totalPages,
  pageSize: pageSize,
  totalCount: totalCount,
  onPageChange: handlePageChange
}

// 탭 스크롤 참조 및 버튼 상태
const tabsContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const updateScrollButtons = () => {
  const el = tabsContainer.value
  if (!el) return
  canScrollLeft.value = el.scrollLeft > 0
  canScrollRight.value = el.scrollWidth > el.clientWidth + el.scrollLeft
}

const scrollTabs = (dir: number) => {
  const el = tabsContainer.value
  if (!el) return
  el.scrollBy({ left: dir * 50, behavior: 'smooth' })
}
onMounted(updateScrollButtons)
</script>


<style scoped lang="scss">
</style>