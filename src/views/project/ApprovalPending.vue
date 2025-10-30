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
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }
  if (
    confirm(
      t("messages.confirm.deleteItems", { count: selectedItems.value.length })
    )
  ) {
    const selectedIds = selectedItems.value.map((item) => item.id);
    approvalList.value = approvalList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert(t("messages.success.deleted"));
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
.btns {
  display: flex;
  gap: 0.5rem;
}
</style>
