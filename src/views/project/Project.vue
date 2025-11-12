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
              placeholder="검색어를 입력하세요"
              v-model="searchQueryInput"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn-search" @click="handleSearch">
            {{ t("common.search") }}
          </button>
          <span
            v-if="approvalPendingCount > 0"
            class="blink-alert"
            @click="goToApprovalPending"
          >
            승인요청이 있습니다
          </span>
        </div>
      </div>
      <button class="btn btn-delete" @click="handleDelete">
        {{ t("common.delete") }}
      </button>
    </div>
    <!-- 데이터 테이블 -->
    <DataTable
      ref="dataTableRef"
      :columns="tableColumns"
      :data="paginatedProjectList"
      :loading="false"
      :selectable="true"
      selectionMode="multiple"
      :showSelectAll="true"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
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

    <!-- ProjectDetail 모달 -->
    <ProjectDetail
      v-if="showProjectDetail"
      :project-data="selectedProjectData"
      @close="closeProjectDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useI18n } from "vue-i18n";
import ProjectDetail from "./components/ProjectDetail.vue";
import { useProjectStore, type ProjectItem } from "@/stores/projectStore";
import { useRouter } from "vue-router";

const { t } = useI18n();
const projectStore = useProjectStore();
const router = useRouter();

// 모달 상태
const showProjectDetail = ref(false);
const selectedProjectData = ref<{
  project_id: string;
  project_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean | null;
  owner_id: string;
  project_status: string;
  description: string | null;
  created_at: string;
  project_code: string;
  version_id: string;
  created_by: string | null;
  client_id: string;
  unit_system: string;
  country_code: string;
  language_code: string;
  updated_at: string | null;
  business_type: string;
  orderer: string;
  site_id: string;
  updated_by: string;
  client: {
    contact_person: string;
    location: string | null;
    phone_number: string;
    client_type: string | null;
    client_name: string;
    client_id: string;
    email: string;
  };
  site: {
    site_name: string;
    site_address: string;
    capacity_unit: string;
    site_id: string;
    site_capacity: number;
  };
} | null>(null);
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
    title: "시설용량 (m³/d)",
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
  {
    key: "detail",
    title: "상세정보",
    width: "100px",
    sortable: false,
    hidden: true,
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

// 승인대기 건수 (서버에서 반환된 approvalCount 사용)
const approvalPendingCount = computed(() => {
  return projectStore.approvalCount || 0;
});

const goToApprovalPending = () => {
  router.push({ name: "ApprovalPending" });
};

const handlePageChange = async (page: number) => {
  try {
    // 현재 검색 조건과 정렬 조건을 유지하면서 페이지 변경
    await projectStore.changePage(page, {
      search_value: searchQueryInput.value,
      order_by: projectStore.sortField,
      order_direction: projectStore.sortOrder,
    });
  } catch (error: any) {
    console.error("페이지 변경 실패:", error);
    const errorMessage = error?.message || "페이지 변경에 실패했습니다.";
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

// 삭제 버튼 핸들러
const handleDelete = async () => {
  if (!selectedItems.value.length) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  const targets =
    selectedItems.value
      .map((selected) =>
        projectStore.originalApiData?.find(
          (it) => it.project_id === (selected as any).id
        )
      )
      .filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? [];

  if (!targets.length) {
    alert(t("messages.error.deleteFailed"));
    return;
  }

  const confirmMessage =
    selectedItems.value.length > 1
      ? t("messages.confirm.deleteItems", { count: selectedItems.value.length })
      : t("messages.confirm.deleteItem");
  if (!confirm(confirmMessage)) return;

  let successCount = 0;
  let failCount = 0;

  for (const target of targets) {
    try {
      const result = await projectStore.deleteProject(target.project_id, {
        clientId: target.client_id,
        siteId: target.site_id,
      });

      if (result?.success) {
        successCount += 1;
      } else {
        failCount += 1;
      }
    } catch (error) {
      console.error("프로젝트 삭제 실패:", error);
      failCount += 1;
    }
  }

  if (successCount > 0) {
    if (failCount > 0) {
      alert(`${successCount}건 삭제 성공, ${failCount}건 삭제 실패`);
    } else {
      alert(t("messages.success.deleted"));
    }

    await projectStore.changePage(projectStore.currentPage, {
      search_value: searchQueryInput.value,
      order_by: projectStore.sortField,
      order_direction: projectStore.sortOrder,
    });
  } else {
    alert(t("messages.error.deleteFailed"));
  }

  selectedItems.value = [];
};

// 상세 보기 - 모달로 열기
const viewDetail = (item: ProjectItem) => {
  if (item.id) {
    // projectStore에서 원본 API 응답 데이터를 찾아서 사용
    const originalData = projectStore.projectList.find(
      (project) => project.id === item.id
    );

    if (originalData && projectStore.originalApiData) {
      // API 응답의 원본 데이터를 그대로 사용
      const apiItem = projectStore.originalApiData.find(
        (apiItem) => apiItem.project_id === item.id
      );
      if (apiItem) {
        selectedProjectData.value = apiItem;
        showProjectDetail.value = true;
        return;
      }
    }

    // fallback: ProjectItem의 데이터를 사용
    selectedProjectData.value = {
      project_id: item.id,
      project_name: item.project_name || "",
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      is_active: null,
      owner_id: "",
      project_status: item.project_status || "",
      description: null,
      created_at: item.created_at || "",
      project_code: "",
      version_id: "",
      created_by: null,
      client_id: "",
      unit_system: item.unit_system || "",
      country_code: item.country_code || "",
      language_code: "",
      updated_at: null,
      business_type: "",
      orderer: "",
      site_id: "",
      updated_by: "",
      client: {
        contact_person: item.contact_person || "",
        location: null,
        phone_number: "",
        client_type: null,
        client_name: item.client_name || "",
        client_id: "",
        email: "",
      },
      site: {
        site_name: item.client_name || "", // client_name을 site_name으로 사용
        site_address: "",
        capacity_unit: "",
        site_id: "",
        site_capacity: parseFloat(item.site_capacity) || 0,
      },
    };
    showProjectDetail.value = true;
  }
};

// 모달 닫기
const closeProjectDetail = () => {
  showProjectDetail.value = false;
  selectedProjectData.value = null;
};

onMounted(async () => {
  try {
    await projectStore.loadInitialData();
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
      height:40px;
    }
  }
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
