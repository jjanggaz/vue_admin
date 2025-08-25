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
              placeholder="프로젝트명을 입력하세요"
              v-model="searchQueryInput"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn-search" @click="handleSearch">
            {{ t("common.search") }}
          </button>
        </div>
      </div>
      <!-- 삭제 버튼 제거됨 -->
    </div>
    <!-- 데이터 테이블 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">데이터를 불러오는 중...</div>
    </div>
    <DataTable
      ref="dataTableRef"
      v-else
      :columns="tableColumns"
      :data="paginatedProjectList"
      :loading="false"
      :selectable="false"
      :default-sort="
        projectStore.sortField && projectStore.sortOrder
          ? {
              key: projectStore.sortField,
              direction: projectStore.sortOrder,
            }
          : undefined
      "
      @sort-change="handleSortChange"
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
        :total-pages="totalPages"
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
import { ref, onMounted, computed } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useI18n } from "vue-i18n";
import ProjectDetail from "./ProjectDetail.vue";
import { useProjectStore, type ProjectItem } from "@/stores/projectStore";

const { t } = useI18n();
const projectStore = useProjectStore();

// 모달 상태
const showProjectDetail = ref(false);
const selectedProjectId = ref("");
const dataTableRef = ref<InstanceType<typeof DataTable> | null>(null);

const tableColumns: TableColumn[] = [
  {
    key: "project_name",
    title: "프로젝트명",
    width: "180px",
    sortable: false,
  },
  {
    key: "client_name",
    title: "고객사",
    width: "120px",
    sortable: false,
  },
  {
    key: "contact_person",
    title: "설계 담당자",
    width: "120px",
    sortable: false,
  },
  {
    key: "unit_system",
    title: "유입종류",
    width: "100px",
    sortable: true,
  },
  {
    key: "site_capacity",
    title: "시설용량",
    width: "120px",
    sortable: true,
  },
  {
    key: "solution",
    title: "솔루션",
    width: "120px",
    sortable: false,
  },
  {
    key: "created_at",
    title: "생성일",
    width: "120px",
    sortable: false,
    dateFormat: "YYYY-MM-DD",
  },
  {
    key: "country_code",
    title: "국가",
    width: "100px",
    sortable: false,
  },
  {
    key: "project_status",
    title: "상태",
    width: "100px",
    sortable: false,
  },
  {
    key: "detail",
    title: "상세정보",
    width: "100px",
    sortable: false,
  },
];

const searchQueryInput = ref("");

// store에서 상태 가져오기 (computed로 반응성 보장)
const loading = computed(() => projectStore.loading);
const currentPage = computed(() => projectStore.currentPage);
const totalPages = computed(() => projectStore.totalPages);
const paginatedProjectList = computed(() => projectStore.paginatedProjectList);

const handlePageChange = async (page: number) => {
  try {
    console.log("Project.vue - 페이지 변경 시작:", page);
    console.log("Project.vue - 현재 검색 조건:", searchQueryInput.value);
    console.log("Project.vue - 현재 정렬 조건:", {
      field: projectStore.sortField,
      order: projectStore.sortOrder,
    });

    // 현재 검색 조건과 정렬 조건을 유지하면서 페이지 변경
    await projectStore.changePage(page, {
      search_value: searchQueryInput.value,
      order_by: projectStore.sortField,
      order_direction: projectStore.sortOrder,
    });

    console.log("Project.vue - 페이지 변경 완료:", page);
    console.log("Project.vue - 변경 후 상태:", {
      currentPage: currentPage.value,
      totalPages: totalPages.value,
      paginatedProjectList: paginatedProjectList.value,
      projectListLength: projectStore.projectList.length,
    });

    // 추가 디버깅
    console.log("Project.vue - 추가 디버깅:", {
      paginatedProjectListType: typeof paginatedProjectList.value,
      paginatedProjectListIsArray: Array.isArray(paginatedProjectList.value),
      paginatedProjectListKeys: Object.keys(paginatedProjectList.value || {}),
      projectStoreProjectListType: typeof projectStore.projectList,
      projectStoreProjectListIsArray: Array.isArray(projectStore.projectList),
    });
  } catch (error: any) {
    console.error("페이지 변경 실패:", error);
    const errorMessage = error?.message || "페이지 변경에 실패했습니다.";
    alert(errorMessage);
  }
};

const handleSearch = async () => {
  // 검색시 정렬 상태 초기화
  if (dataTableRef.value) {
    dataTableRef.value.resetSort();
  }

  // 서버 측 검색 실행
  try {
    await projectStore.fetchProjectList({
      page: 1, // 검색 시 첫 페이지로 이동
      pageSize: projectStore.pageSize,
      search_value: searchQueryInput.value,
      // 정렬 조건 제거 (초기화)
    });
  } catch (error: any) {
    console.error("검색 실패:", error);
    const errorMessage = error?.message || "검색에 실패했습니다.";
    alert(errorMessage);
  }
};

const handleSortChange = async (sortInfo: {
  key: string | null;
  direction: "asc" | "desc" | null;
}) => {
  console.log("정렬 변경:", sortInfo);

  try {
    const params: any = {
      page: projectStore.currentPage, // 현재 페이지 유지 (AccountManagement.vue와 동일)
      pageSize: projectStore.pageSize,
      search_value: searchQueryInput.value,
    };

    // 정렬 조건 처리 (정렬 해제 포함)
    if (sortInfo.key && sortInfo.direction) {
      // 정렬 적용
      params.order_by = sortInfo.key;
      params.order_direction = sortInfo.direction;
    } else if (sortInfo.key === null && sortInfo.direction === null) {
      // 정렬 해제 - 빈 문자열로 전송하여 서버에서 정렬 없음을 인식
      params.order_by = "";
      params.order_direction = "" as const;
    }

    await projectStore.fetchProjectList(params);
  } catch (error: any) {
    console.error("정렬 실패:", error);
    const errorMessage = error?.message || "정렬에 실패했습니다.";
    alert(errorMessage);
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

onMounted(async () => {
  console.log("Project.vue - onMounted 시작");
  try {
    console.log("Project.vue - 초기 데이터 로드 시작");
    await projectStore.loadInitialData();
    console.log("Project.vue - 초기 데이터 로드 완료");
    console.log("Project.vue - 로드 후 상태:", {
      loading: loading,
      currentPage: currentPage,
      totalPages: totalPages,
      paginatedProjectList: paginatedProjectList,
    });

    // store 상태 직접 확인
    console.log("Project.vue - store 상태 직접 확인:", {
      projectListLength: projectStore.projectList.length,
      projectListFirstItem: projectStore.projectList[0],
      currentPageFromStore: projectStore.currentPage,
      pageSizeFromStore: projectStore.pageSize,
      totalCountFromStore: projectStore.totalCount,
    });
  } catch (error) {
    console.error("초기 데이터 로드 실패:", error);
  }
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: 200px;
}

.loading-spinner {
  color: #666;
  font-size: 1.1rem;
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
