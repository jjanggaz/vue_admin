<template>
  <div class="project-management">
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="approval-search" class="label-search">{{ t("common.search") }}</label>
          <div class="form-item">
            <input id="approval-search" type="text" v-model="searchValue" @keyup.enter="handleSearch" />
          </div>
          <button class="btn-search" @click="handleSearch">{{ t("common.search") }}</button>
          <span v-if="approvalList.length > 0" class="blink-alert">
            승인요청이 {{ approvalList.length }}건 있습니다
          </span>
        </div>
      </div>
    </div>
    <DataTable
      :columns="tableColumns"
      :data="paginatedList"
      :loading="loading"
      :selectable="true"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
    />

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
import { useI18n } from "vue-i18n";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";

const { t } = useI18n();

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
  status: string;
}

const tableColumns: TableColumn[] = [
  { key: "id", title: t("columns.project.id"), width: "60px", sortable: false },
  {
    key: "name",
    title: t("columns.project.name"),
    width: "180px",
    sortable: true,
  },
  {
    key: "client",
    title: t("columns.project.client"),
    width: "120px",
    sortable: true,
  },
  {
    key: "manager",
    title: t("columns.project.manager"),
    width: "120px",
    sortable: true,
  },
  {
    key: "type",
    title: t("columns.project.type"),
    width: "100px",
    sortable: true,
  },
  {
    key: "capacity",
    title: t("columns.project.capacity"),
    width: "120px",
    sortable: true,
  },
  {
    key: "process",
    title: t("columns.project.process"),
    width: "120px",
    sortable: true,
  },
  {
    key: "createdAt",
    title: t("columns.project.createdAt"),
    width: "120px",
    sortable: true,
  },
  {
    key: "country",
    title: t("columns.project.country"),
    width: "100px",
    sortable: true,
  },
  {
    key: "status",
    title: "상태",
    width: "100px",
    sortable: true,
  },
];

const approvalList = ref<ApprovalItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedItems = ref<ApprovalItem[]>([]);
const searchValue = ref("");

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

const handleSearch = () => {
  // TODO: 승인대기 검색 로직 연동 시 구현
};

// 삭제 버튼 UI 제거로 핸들러 미사용

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
      status: "승인대기",
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
      status: "승인대기",
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
.search-bar {
  display: flex;
  align-items: center;
}
.group-form {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}
.label-search {
  margin-right: 0.5rem;
}
.form-item {
  margin-right: 0.5rem;
}
.btn-search {
  margin-left: 0.5rem;
}
.blink-alert {
  margin-left: 0.5rem;
  color: #e74c3c;
  font-weight: 700;
  animation: blink 1s step-start infinite;
}
@keyframes blink {
  50% { opacity: 0; }
}
.btns {
  display: flex;
  gap: 0.5rem;
}
</style>
