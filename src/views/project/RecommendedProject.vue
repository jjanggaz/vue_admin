<template>
  <div class="project-management">
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="recommended-search" class="label-search">
            {{ t("common.search") }}
          </label>
          <div class="form-item">
            <input
              type="text"
              id="recommended-search"
              class="input search-input"
              v-model="searchQuery"
              placeholder="검색 조건 입력"
              @keyup.enter="onSearch"
            />
          </div>
          <button class="btn-search" @click="onSearch">
            {{ t("common.search") }}
          </button>
        </div>
      </div>
    </div>
    <DataTable
      :columns="projectColumns"
      :data="paginatedRows"
      :selectable="false"
    >
      <template #cell-recommended="{ item }">
        <input
          type="checkbox"
          :checked="item.recommended"
          @change="onToggleRecommended($event, item)"
        />
      </template>
    </DataTable>
    <div class="pagination-container">
      <div class="total-count">
        {{ t("common.totalCount", { count: totalCount }) }}
      </div>
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
const { t } = useI18n();
const searchQuery = ref("");
const onSearch = () => {
  // TODO: 검색 기능 연동 시 API 호출 또는 필터링 구현
  // 현재는 UI만 구성
};

const onToggleRecommended = (e: Event, row: ItemRow) => {
  const checkbox = e.target as HTMLInputElement;
  const nextValue = checkbox.checked;

  if (nextValue) {
    if (!confirm("추천을 설정하시겠습니까?")) {
      checkbox.checked = row.recommended; // 취소 시 원상복구
      return;
    } else {
      alert("추천을 설정했습니다.");
    }
  } else {
    if (!confirm("추천을 해제하시겠습니까?")) {
      checkbox.checked = row.recommended; // 취소 시 원상복구
      return;
    } else {
      alert("추천을 해제했습니다.");
    }
  }

  row.recommended = nextValue;
};

interface ItemRow {
  id: string;
  no?: number;
  project_name: string;
  client_name: string;
  contact_person: string;
  inflow_type: string;
  site_capacity: string | number;
  solution: string;
  created_at: string;
  country_code: string;
  recommended: boolean;
}

const projectColumns: TableColumn[] = [
  { key: "no", title: "순번", width: "50px" },
  { key: "project_name", title: "프로젝트명", width: "200px" },
  { key: "client_name", title: "고객사", width: "150px" },
  { key: "contact_person", title: "설계 담당자", width: "100px" },
  { key: "inflow_type", title: "유입종류", width: "120px" },
  { key: "site_capacity", title: "시설용량", width: "100px" },
  { key: "solution", title: "솔루션", width: "150px" },
  { key: "created_at", title: "생성일", width: "100px" },
  { key: "country_code", title: "국가", width: "50px" },
  { key: "recommended", title: "추천여부", width: "50px" },
];

const projectRows = ref<ItemRow[]>([
  {
    id: "1",
    project_name: "프로젝트 A",
    client_name: "고객사 A",
    contact_person: "홍길동",
    inflow_type: "생활하수",
    site_capacity: 1000,
    solution: "솔루션1",
    created_at: "2025-01-01",
    country_code: "KR",
    recommended: false,
  },
  {
    id: "2",
    project_name: "프로젝트 B",
    client_name: "고객사 B",
    contact_person: "김영희",
    inflow_type: "산업폐수",
    site_capacity: 2000,
    solution: "솔루션2",
    created_at: "2025-01-05",
    country_code: "KR",
    recommended: true,
  },
]);

// 선택 컬럼 제거로 선택 상태 관리 불필요

// Pagination state (local)
const currentPage = ref(1);
const pageSize = 10;
const totalCount = computed(() => projectRows.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / pageSize))
);
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return projectRows.value.slice(start, start + pageSize).map((row, idx) => ({
    ...row,
    no: start + idx + 1,
  }));
});

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
</script>

<style scoped lang="scss">
.project-management {
  padding: $spacing-lg;
}
.action-bar {
  display: flex;
  justify-content: flex-start;
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
.search-input {
  max-width: 320px;
}
.action-bar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 0.5rem;
}
.btn-delete {
  background: #3a3d4b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
}
.btn-search {
  background: $primary-color;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
}
.input-cell {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.btn-edit {
  background: #f7f7f7;
  border: 1px solid #bbb;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.1rem;
  cursor: pointer;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
  position: relative;

  .total-count {
    position: absolute;
    left: 1rem;
    font-size: 0.9rem;
    color: $text-color;
    font-weight: 500;
  }
}
</style>
