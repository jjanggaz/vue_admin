<template>
  <div class="user-management">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="criteria">
        <div class="group-form">
          <label for="role" class="label-search">검색</label>
          <div class="form-item">
            <select id="role">
              <option value="">항목을 선택하세요.</option>
              <option value=""></option>
              <option value=""></option>
            </select>
          </div>
        </div>
        <div class="group-form">
          <div class="form-item">
            <input type="text" id="search" placeholder="검색어를 입력하세요." />
          </div>
          <button class="btn-search">검색</button>
        </div>
      </div>
      <div class="btns">
        <button class="btn btn-primary btn-delete" @click="handleDelete" :disabled="selectedItems.length === 0">삭제</button>
        <button class="btn btn-primary btn-edit" @click="handleEdit" :disabled="selectedItems.length !== 1">수정</button>
        <button class="btn btn-primary btn-regist" @click="handleRegist">등록</button>
      </div>
    </div>
    <DataTable 
      :columns="tableColumns"
      :data="userList"
      :loading="loading"
      :selectable="true"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    />
    <!-- Pagination -->
     <div class="pagination-container">
      <Pagination 
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change
        ="handlePageChange"
      />
      </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import Pagination from '@/components/common/Pagination.vue'
  import DataTable, { type TableColumn } from '@/components/common/DataTable.vue';

  interface UserItem {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }

  // 테이블 컬럼 설정
  const tableColumns: TableColumn[] = [
    { key: 'id', title: '아이디', label: '아이디', width: 100, sortable: true },
    // { key: 'index', label: '번호', width: 50, sortable: true },
    { key: 'name', title: '이름', label: '이름', width: 150, sortable: true },
    { key: 'corpName', title: '업체', label: '업체', width: 150, sortable: true },
    { key: 'phone', title: '전화번호', label: '전화번호', width: 150, sortable: true },
    { key: 'email', title: '이메일', label: '이메일', width: 200, sortable: true },
    { key: 'role', title: '권한', label: '권한', width: 150, sortable: true }
  ]

  const userList = ref<UserItem[]>([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const pageSize = ref(10);
  const totalCount = ref(0);
  const sortColumn = ref<string | null>(null);
  const sortOrder = ref<'asc' | 'desc' | null>(null);
  const searchQuery = ref('');
  const selectedItems = ref<UserItem[]>([]);

  // 데이터 로드 함수
  const loadData = async () => {
    loading.value = true;
    try {
      userList.value = [
        { id: '1', name: '홍길동', email: '..@example.com', role: '관리자', createdAt: '2023-01-01' },
    ]
      totalCount.value = userList.value.length;
      totalPages.value = Math.ceil(totalCount.value / pageSize.value);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      loading.value = false;
    }
  };

  const handleSelectionChange = (selected: UserItem[]) => {
    selectedItems.value = selected;
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    currentPage.value = page;
    loadData();
  };

  // 정렬 변경 핸들러
  const handleSortChange = (sortInfo: { key: string; direction: 'asc' | 'desc' }) => {
    sortColumn.value = sortInfo.key;
    sortOrder.value = sortInfo.direction;
    // 여기에 정렬 로직을 추가합니다.
    loadData();
  };
  // 행 클릭 핸들러
  const handleRowClick = (item: UserItem) => {

    console.log('Row clicked:', item);
  };

  // 컴포넌트 마운트 시 데이터 로드
  onMounted(() => {
    loadData();
  });

  // 검색 기능 구현
  const handleSearch = () => {
    console.log('검색어:', searchQuery.value);
    loadData();
  };

  // 등록 버튼 핸들러
  const handleRegist = () => {
    console.log('등록 버튼 클릭');
    alert('사용자 등록 기능을 구현해야 합니다.');
  };

  // 선택된 항목 삭제
  const handleDelete = () => {
    if (selectedItems.value.length === 0) {
      alert('삭제할 항목을 선택하세요.');
      return;
    }
    if (confirm(`선택된 ${selectedItems.value.length}개의 항목을 삭제하시겠습니까?`)) {
      console.log('삭제할 항목:', selectedItems.value);
      const selectedIds = selectedItems.value.map(item => item.id);
      userList.value = userList.value.filter(item => !selectedIds.includes(item.id));
      selectedItems.value = [];
      alert('삭제되었습니다.');
    }
  };

  // 선택된 항목 수정
  const handleEdit = () => {
    if (selectedItems.value.length !== 1) {
      alert('수정할 항목을 하나만 선택하세요.');
      return;
    }
    const itemToEdit = selectedItems.value[0];
    console.log('수정할 항목:', itemToEdit);
    alert(`'${itemToEdit.name}' 사용자를 수정합니다.`);
  };



</script>

<style scoped lang="scss">
.user-management {
  padding: $spacing-lg;
}
</style>
