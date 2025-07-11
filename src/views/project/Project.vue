<template>
  <div class="project-management">
    <!-- 검색 바 -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="search" class="label-search">검색</label>
          <div class="form-item">
            <input
              type="text"
              id="search"
              placeholder="검색어를 입력하세요."
              v-model="searchQueryInput"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn-search" @click="handleSearch">검색</button>
        </div>
      </div>
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
        <button class="btn-view" @click.stop="viewDetail(item)">보기</button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useRouter } from "vue-router";

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
  { key: "id", title: "순번", width: "60px", sortable: false },
  { key: "name", title: "프로젝트명", width: "180px", sortable: true },
  { key: "client", title: "고객사", width: "120px", sortable: true },
  { key: "manager", title: "설계담당자", width: "120px", sortable: true },
  { key: "type", title: "유입종류", width: "100px", sortable: true },
  { key: "capacity", title: "시설용량(m³/d)", width: "120px", sortable: true },
  { key: "process", title: "적용 공정", width: "120px", sortable: true },
  { key: "createdAt", title: "생성일", width: "120px", sortable: true },
  { key: "country", title: "국가", width: "100px", sortable: true },
  { key: "detail", title: "상세정보", width: "100px", sortable: false },
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
    alert("삭제할 항목을 선택하세요.");
    return;
  }
  if (
    confirm(`선택된 ${selectedItems.value.length}개의 항목을 삭제하시겠습니까?`)
  ) {
    const selectedIds = selectedItems.value.map((item) => item.id);
    projectList.value = projectList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert("삭제되었습니다.");
  }
};

// 상세 보기 이동
const router = useRouter();
const viewDetail = (item: ProjectItem) => {
  if (item.id) {
    router.push({ name: "ProjectDetail", params: { id: item.id } });
  }
};

onMounted(() => {
  // 샘플 데이터
  projectList.value = Array.from({ length: 11 }, (_, i) => ({
    id: (i + 1).toString(),
    name: `프로젝트${i + 1}`,
    client: `고객사${(i % 5) + 1}`,
    manager: `설계자${(i % 3) + 1}`,
    type: ["A", "B", "C"][i % 3],
    capacity: `${100 + i * 10}`,
    process: ["공정1", "공정2"][i % 2],
    createdAt: `2023-01-${(i % 28) + 1}`,
    country: ["한국", "일본", "미국"][i % 3],
    detail: "-",
  }));
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
.pagination-container {
  margin-top: 1rem;
}
</style>
