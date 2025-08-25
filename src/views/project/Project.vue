<template>
  <div class="project-management">
    <!-- 검색 바 -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="search" class="label-search">{{
            t("common.search")
          }}</label>
          <div class="form-item">
            <input
              type="text"
              id="search"
              :placeholder="t('placeholder.searchQuery')"
              v-model="searchQueryInput"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn-search" @click="handleSearch">
            {{ t("common.search") }}
          </button>
        </div>
      </div>
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
    <!-- 데이터 테이블 -->
    <DataTable
      :columns="tableColumns"
      :data="paginatedProjectList"
      :loading="loading"
      :selectable="true"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
    >
      <template #cell-detail="{ item }">
        <button class="btn-view" @click.stop="viewDetail(item)">
          {{ t("common.view") }}
        </button>
      </template>
    </DataTable>
    <!-- 페이징 -->
    <div class="pagination-container">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPagesComputed"
        @page-change="handlePageChange"
      />
    </div>

    <!-- ProjectDetail 모달 -->
    <ProjectDetail
      v-if="showProjectDetail"
      :project-id="selectedProjectId"
      @close="closeProjectDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useI18n } from "vue-i18n";
import ProjectDetail from "./ProjectDetail.vue";

const { t } = useI18n();

// 모달 상태
const showProjectDetail = ref(false);
const selectedProjectId = ref("");

interface ProjectItem {
  id: string;
  name: string;
  client: string;
  manager: string;
  type: string;
  capacity: string;
  process: string;
  createdAt: string;
  country: string;
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
    key: "detail",
    title: t("columns.project.detail"),
    width: "100px",
    sortable: false,
  },
];

const projectList = ref<ProjectItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const selectedItems = ref<ProjectItem[]>([]);
const searchQueryInput = ref("");
const searchQuery = ref("");

const filteredProjectList = computed(() => {
  if (searchQuery.value) {
    return projectList.value.filter((project) =>
      Object.values(project).some(
        (v) =>
          v &&
          v.toString().toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    );
  }
  return projectList.value;
});

const totalCountComputed = computed(() => filteredProjectList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);

const paginatedProjectList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProjectList.value.slice(start, end);
});

const handleSelectionChange = (selected: ProjectItem[]) => {
  selectedItems.value = selected;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  selectedItems.value = [];
};

const handleSearch = () => {
  selectedItems.value = [];
  searchQuery.value = searchQueryInput.value;
  currentPage.value = 1;
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
    projectList.value = projectList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert(t("messages.success.deleted"));
  }
};

// 상세 보기 - 모달로 열기
const viewDetail = (item: ProjectItem) => {
  if (item.id) {
    selectedProjectId.value = item.id;
    showProjectDetail.value = true;
  }
};

// 모달 닫기
const closeProjectDetail = () => {
  showProjectDetail.value = false;
  selectedProjectId.value = "";
};

// 샘플 데이터 로드 함수
const loadData = () => {
  projectList.value = Array.from({ length: 11 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `${t("project.sample.name")}${i + 1}`,
    client: `${t("project.sample.client")}${(i % 5) + 1}`,
    manager: `${t("project.sample.manager")}${(i % 3) + 1}`,
    type: ["A", "B", "C"][i % 3],
    capacity: `${100 + i * 10}`,
    process: ["공정1", "공정2"][i % 2],
    createdAt: `2023-01-${(i % 28) + 1}`,
    country: ["한국", "일본", "미국"][i % 3],
    detail: "-",
  }));
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
.btns {
  display: flex;
  gap: 0.5rem;
}
.btn-search {
  margin-left: 0.5rem;
}

// 모달이 제대로 표시되도록 하는 스타일
:deep(.modal-overlay) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9999 !important;
}

:deep(.modal-content) {
  position: relative !important;
  z-index: 10000 !important;
}
</style>
