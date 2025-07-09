<template>
  <div class="output-page">
   <div class="action-bar">
    <div class="slide-bar">
     <div class="group-form">

      <button class="btn-regist" @click="handleRegist">신규등록</button>
     </div>
    </div>
   </div>


   <DataTable 
    :columns="tableColumns"
    :data="outputList"
    :loading="loading"
    @sort-change="handleSortChange"
    @row-click="handleRowClick">
   </DataTable>

   <div class="pagination-container">
    <Pagination 
     :current-page="currentPage"
     :total-pages="totalPagesComputed"
     @page-change="handlePageChange"
    />
   </div>

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
        <input type="text" class="form-input" placeholder="" />
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

const isRegistModalOpen = ref(false);


const handleSortChange = (column: string, direction: 'asc' | 'desc') => {
  console.log(`Sorting by ${column} in ${direction} order`);
  // 정렬 로직 구현
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
  // 신규 등록 모달 열기
}

const handleSave = () => {
  console.log('저장 버튼 클릭');
  // 저장 로직 구현
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





</script>


<style scoped lang="scss">

</style>