<template>
  <div class="project-management">
    <div class="action-bar">
      <div></div>
      <div class="btns">
        <button
          class="btn btn-primary btn-delete"
          @click="handleDelete"
          :disabled="selectedItems.length === 0"
        >
          삭제
        </button>
      </div>
    </div>
    <DataTable
      :columns="tableColumns"
      :data="paginatedList"
      :loading="loading"
      :selectable="true"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
    >
      <template #cell-action="{ item }">
        <button class="btn-approve" title="승인">✔️</button>
        <button class="btn-reject" title="반려">❌</button>
      </template>
    </DataTable>
    <div class="pagination-container">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPagesComputed"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";

interface ApprovalItem {
  id: string;
  name: string;
  client: string;
  manager: string;
  type: string;
  capacity: string;
  process: string;
  createdAt: string;
  country: string;
  detail: string;
}

const tableColumns: TableColumn[] = [
  { key: "id", title: "순번", width: "60px", sortable: false },
  { key: "name", title: "프로젝트명", width: "180px", sortable: true },
  { key: "client", title: "고객사", width: "120px", sortable: true },
  { key: "manager", title: "설계담당자", width: "120px", sortable: true },
  { key: "type", title: "유입종류", width: "100px", sortable: true },
  { key: "capacity", title: "시설용량(m³/d)", width: "120px", sortable: true },
  { key: "process", title: "적용공정", width: "120px", sortable: true },
  { key: "createdAt", title: "생성일", width: "120px", sortable: true },
  { key: "country", title: "국가", width: "100px", sortable: true },
  { key: "detail", title: "상세정보", width: "100px", sortable: false },
  { key: "action", title: "처리", width: "80px", sortable: false },
];

const approvalList = ref<ApprovalItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedItems = ref<ApprovalItem[]>([]);

const totalCountComputed = computed(() => approvalList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return approvalList.value.slice(start, end);
});

const handleSelectionChange = (selected: ApprovalItem[]) => {
  selectedItems.value = selected;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  selectedItems.value = [];
};

const handleDelete = () => {
  if (selectedItems.value.length === 0) {
    alert("삭제할 항목을 선택하세요.");
    return;
  }
  if (
    confirm(`선택된 ${selectedItems.value.length}개의 항목을 삭제하시겠습니까?`)
  ) {
    const selectedIds = selectedItems.value.map((item) => item.id);
    approvalList.value = approvalList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert("삭제되었습니다.");
  }
};

// 샘플 데이터 로드 함수
const loadData = () => {
  approvalList.value = [
    {
      id: "1",
      name: "텍스트",
      client: "텍스트",
      manager: "텍스트",
      type: "텍스트",
      capacity: "텍스트",
      process: "텍스트",
      createdAt: "텍스트",
      country: "텍스트",
      detail: "텍스트",
    },
    {
      id: "999",
      name: "텍스트",
      client: "텍스트",
      manager: "텍스트",
      type: "텍스트",
      capacity: "텍스트",
      process: "텍스트",
      createdAt: "텍스트",
      country: "텍스트",
      detail: "텍스트",
    },
  ];
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.project-management {
  padding: $spacing-lg;
}
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.btns {
  display: flex;
  gap: 0.5rem;
}
.btn-approve {
  background: #e6f4ea;
  border: 1px solid #6fcf97;
  color: #219653;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-right: 4px;
}
.btn-reject {
  background: #fbeaea;
  border: 1px solid #eb5757;
  color: #eb5757;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 1.1rem;
  cursor: pointer;
}
</style>
