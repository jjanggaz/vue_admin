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
          {{ t("common.delete") }}
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
        <button class="btn-approve" :title="t('project.approve')">✔️</button>
        <button class="btn-reject" :title="t('project.reject')">❌</button>
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
  detail: string;
}

const tableColumns: TableColumn[] = [
  { key: "id", title: t("project.table.id"), width: "60px", sortable: false },
  {
    key: "name",
    title: t("project.table.name"),
    width: "180px",
    sortable: true,
  },
  {
    key: "client",
    title: t("project.table.client"),
    width: "120px",
    sortable: true,
  },
  {
    key: "manager",
    title: t("project.table.manager"),
    width: "120px",
    sortable: true,
  },
  {
    key: "type",
    title: t("project.table.type"),
    width: "100px",
    sortable: true,
  },
  {
    key: "capacity",
    title: t("project.table.capacity"),
    width: "120px",
    sortable: true,
  },
  {
    key: "process",
    title: t("project.table.process"),
    width: "120px",
    sortable: true,
  },
  {
    key: "createdAt",
    title: t("project.table.createdAt"),
    width: "120px",
    sortable: true,
  },
  {
    key: "country",
    title: t("project.table.country"),
    width: "100px",
    sortable: true,
  },
  {
    key: "detail",
    title: t("project.table.detail"),
    width: "100px",
    sortable: false,
  },
  { key: "action", title: t("common.action"), width: "80px", sortable: false },
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
    alert(t("project.delete.noItemsSelected"));
    return;
  }
  if (
    confirm(t("project.delete.confirm", { count: selectedItems.value.length }))
  ) {
    const selectedIds = selectedItems.value.map((item) => item.id);
    approvalList.value = approvalList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert(t("project.delete.deleted"));
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
