<template>
  <div class="project-management">
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="approval-search" class="label-search">{{
            t("common.search")
          }}</label>
          <div class="form-item">
            <input
              id="approval-search"
              type="text"
              placeholder="프로젝트명을 입력하세요"
              v-model="searchQueryInput"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn-search" @click="handleSearch">
            {{ t("common.search") }}
          </button>
          <span v-if="approvalPendingCount > 0" class="blink-alert">
            승인요청이 {{ approvalPendingCount }}건 있습니다
          </span>
        </div>
      </div>
    </div>
    <DataTable
      ref="dataTableRef"
      :columns="tableColumns"
      :data="paginatedProjectList"
      :loading="false"
      :selectable="true"
      selectionMode="single"
      :showSelectAll="false"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    />

    <div class="pagination-container">
      <div class="total-count">
        {{
          t("common.totalCount", {
            count: projectStore.totalCount || 0,
          })
        }}
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
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useProjectStore, type ProjectItem } from "@/stores/projectStore";

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();
const projectStore = useProjectStore();
const dataTableRef = ref<InstanceType<typeof DataTable> | null>(null);
const selectedItems = ref<ProjectItem[]>([]);

const tableColumns: TableColumn[] = [
  {
    key: "no",
    title: "순번",
    width: "80px",
    sortable: false,
  },
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
    title: "단위",
    width: "100px",
    sortable: false,
  },
  {
    key: "site_capacity",
    title: "시설용량",
    width: "120px",
    sortable: false,
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
];

const searchQueryInput = ref("");

// store에서 상태 가져오기 (computed로 반응성 보장)
const currentPage = computed(() => projectStore.currentPage);
const totalPages = computed(() => projectStore.totalPages);
const paginatedProjectList = computed(() => {
  const pageSize = projectStore.pageSize;
  const startIndex = (currentPage.value - 1) * pageSize;

  return projectStore.paginatedProjectList.map((item, index) => ({
    ...item,
    no: startIndex + index + 1,
  }));
});

// 승인대기 총건수 (서버에서 반환된 totalCount 사용)
const approvalPendingCount = computed(() => {
  return projectStore.totalCount || 0;
});

const handlePageChange = async (page: number) => {
  try {
    // 현재 검색 조건과 정렬 조건을 유지하면서 페이지 변경
    await projectStore.changePage(page, {
      search_value: searchQueryInput.value,
      order_by: projectStore.sortField,
      order_direction: projectStore.sortOrder,
      project_status: "SC_WAITAPPR",
    });
  } catch (error: any) {
    console.error("페이지 변경 실패:", error);
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.pageChangeFailed"
    );
    alert(errorMessage);
  }
};

const handleSelectionChange = (items: ProjectItem[]) => {
  selectedItems.value = items;
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
      project_status: "SC_WAITAPPR",
      // 정렬 조건 제거 (초기화)
    });
  } catch (error: any) {
    console.error("검색 실패:", error);
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.searchFailed"
    );
    alert(errorMessage);
  }
};

const handleSortChange = async (sortInfo: {
  key: string | null;
  direction: "asc" | "desc" | null;
}) => {
  try {
    const params: any = {
      page: projectStore.currentPage, // 현재 페이지 유지
      pageSize: projectStore.pageSize,
      search_value: searchQueryInput.value,
      project_status: "SC_WAITAPPR",
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

onMounted(async () => {
  try {
    await projectStore.fetchProjectList({
      page: 1,
      pageSize: projectStore.pageSize,
      search_value: "",
      project_status: "SC_WAITAPPR",
    });
  } catch (error) {
    console.error("초기 데이터 로드 실패:", error);
  }
});
</script>

<style scoped lang="scss">
.project-management {
  padding: $spacing-xxl $spacing-lg 0;
}

.group-form {
  .form-item {
    input {
      width: 240px;
      height: 40px;
    }
  }
}
</style>
