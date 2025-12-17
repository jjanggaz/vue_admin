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
              :placeholder="t('placeholder.projectName')"
              v-model="searchQueryInput"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn btn-search" @click="handleSearch">
            {{ t("common.search") }}
          </button>
          <span v-if="approvalPendingCount > 0" class="blink-alert">
            {{
              t("dashboard.approvalStatus.pendingRequest", {
                count: approvalPendingCount,
              })
            }}
          </span>
        </div>
      </div>
    </div>
    <DataTable
      ref="dataTableRef"
      :columns="tableColumns"
      :data="paginatedProjectList"
      :loading="false"
      :selectable="false"
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
import { useProjectStore } from "@/stores/projectStore";

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();
const projectStore = useProjectStore();
const dataTableRef = ref<InstanceType<typeof DataTable> | null>(null);

const tableColumns: TableColumn[] = [
  {
    key: "no",
    title: t("columns.project.no"),
    width: "80px",
    sortable: false,
  },
  {
    key: "project_name",
    title: t("columns.project.name"),
    width: "180px",
    sortable: false,
  },
  {
    key: "client_name",
    title: t("columns.project.client"),
    width: "120px",
    sortable: false,
  },
  {
    key: "contact_person",
    title: t("columns.project.contactPerson"),
    width: "120px",
    sortable: false,
  },
  {
    key: "unit_system",
    title: t("columns.project.unitSystem"),
    width: "100px",
    sortable: false,
  },
  {
    key: "inflow",
    title: t("columns.project.type"),
    width: "120px",
    sortable: false,
  },
  {
    key: "site_capacity",
    title: t("columns.project.siteCapacity"),
    width: "120px",
    sortable: false,
  },
  {
    key: "solution",
    title: t("columns.project.solution"),
    width: "120px",
    sortable: false,
  },
  {
    key: "created_at",
    title: t("columns.project.createdAt"),
    width: "120px",
    sortable: true,
    dateFormat: "YYYY-MM-DD",
  },
  {
    key: "country_code",
    title: t("columns.project.country"),
    width: "100px",
    sortable: false,
  },
  {
    key: "project_status",
    title: t("columns.project.status"),
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

  return projectStore.paginatedProjectList.map((item, index) => {
    // 원본 API 데이터 찾기
    const originalItem = projectStore.originalApiData?.find(
      (apiItem: any) => apiItem.project_id === item.id
    ) as any;

    // influent_types에서 flow_type_name 추출하여 콤마로 합치기
    const inflowTypes = Array.isArray(originalItem?.influent_types)
      ? originalItem.influent_types
      : [];
    const inflowNames = inflowTypes
      .map((type: any) => type?.flow_type_name)
      .filter((name: any) => name && typeof name === "string" && name.trim())
      .join(", ");
    const inflow = inflowNames || (item as any).inflow || "";

    // flow_rate 총합 계산 및 개별 값 추출 (null일 경우 0으로 처리)
    const flowRates = inflowTypes.map((type: any) => {
      const rate = type?.flow_rate;
      if (rate === null || rate === undefined) {
        return 0;
      }
      const numRate = Number(rate);
      return !isNaN(numRate) ? numRate : 0;
    });

    let siteCapacity = "";
    if (flowRates.length > 0) {
      const totalFlowRate = flowRates.reduce(
        (sum: number, rate: number) => sum + rate,
        0
      );
      // flow_rate_unit은 influent_types의 첫 번째 항목에서 가져오거나, project에서 가져옴
      const flowRateUnit =
        inflowTypes[0]?.flow_rate_unit || originalItem?.flow_rate_unit || "";
      const flowRateList = flowRates.join(", ");

      // 단일 값일 경우 괄호 없이 표시, 여러 값일 경우 괄호로 표시
      if (flowRates.length === 1) {
        siteCapacity = `${totalFlowRate}${
          flowRateUnit ? ` ${flowRateUnit}` : ""
        }`;
      } else {
        siteCapacity = `${totalFlowRate}${
          flowRateList
            ? ` (${flowRateList})${flowRateUnit ? ` ${flowRateUnit}` : ""}`
            : ""
        }`;
      }
    }

    // solution_summary 추출
    const solution =
      originalItem?.solution_summary &&
      typeof originalItem.solution_summary === "string"
        ? originalItem.solution_summary.trim()
        : (item as any).solution || "";

    return {
      ...item,
      no: startIndex + index + 1,
      inflow: inflow,
      site_capacity: siteCapacity,
      solution: solution,
    };
  });
});

// 승인대기 총건수 (서버에서 반환된 totalCount 사용)
const approvalPendingCount = computed(() => {
  return projectStore.totalCount || 0;
});

const loadData = async (params?: {
  page?: number;
  search_value?: string;
  order_by?: string;
  order_direction?: "asc" | "desc" | "";
}) => {
  try {
    await projectStore.fetchProjectList({
      page: params?.page ?? projectStore.currentPage,
      pageSize: projectStore.pageSize,
      search_value: params?.search_value ?? searchQueryInput.value,
      order_by: params?.order_by,
      order_direction: params?.order_direction,
      project_status: "SC_WAITAPPR",
    });
  } catch (error: any) {
    console.error("데이터 로드 실패:", error);
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.loadFailed"
    );
    alert(errorMessage);
    throw error;
  }
};

const handlePageChange = async (page: number) => {
  try {
    // 현재 검색 조건과 정렬 조건을 유지하면서 페이지 변경
    await loadData({
      page,
      search_value: searchQueryInput.value,
      order_by: projectStore.sortField,
      order_direction: projectStore.sortOrder,
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

const handleSearch = async () => {
  // 검색시 정렬 상태 초기화
  if (dataTableRef.value) {
    dataTableRef.value.resetSort();
  }

  // 서버 측 검색 실행
  try {
    await loadData({
      page: 1, // 검색 시 첫 페이지로 이동
      search_value: searchQueryInput.value,
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
    const params: {
      page?: number;
      search_value?: string;
      order_by?: string;
      order_direction?: "asc" | "desc" | "";
    } = {
      page: projectStore.currentPage, // 현재 페이지 유지
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

    await loadData(params);
  } catch (error: any) {
    console.error("정렬 실패:", error);
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.sortFailed"
    );
    alert(errorMessage);
  }
};

onMounted(async () => {
  try {
    await loadData({
      page: 1,
      search_value: "",
    });
  } catch (error) {
    console.error("초기 데이터 로드 실패:", error);
  }
});
</script>

<style scoped lang="scss">
.project-management {
  display: flex;
  flex-direction: column;
  padding: 40px 24px;

  @media (max-width: 1050px) {
    padding: 40px 0;
  }
}
</style>
