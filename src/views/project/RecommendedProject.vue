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
              :placeholder="t('placeholder.projectName')"
              v-model="searchQueryInput"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="btn btn-search" @click="handleSearch">
            {{ t("common.search") }}
          </button>
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
const searchQueryInput = ref("");

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
    sortable: false,
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
  {
    key: "recommended",
    title: t("columns.project.recommended"),
    width: "100px",
    sortable: false,
  },
];

// store에서 상태 가져오기 (computed로 반응성 보장)
const currentPage = computed(() => projectStore.currentPage);
const totalPages = computed(() => projectStore.totalPages);
const paginatedProjectList = computed(() => {
  const pageSize = projectStore.pageSize;
  const startIndex = (currentPage.value - 1) * pageSize;

  return projectStore.paginatedProjectList.map((item, index) => ({
    ...item,
    no: startIndex + index + 1,
    // project_recommended 값이 있으면 true, 없으면 false
    recommended: !!item.project_recommended,
  }));
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
      project_status: "SC_APPROVED",
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

const onToggleRecommended = async (
  e: Event,
  item: ProjectItem & { recommended?: boolean }
) => {
  const checkbox = e.target as HTMLInputElement;
  const nextValue = checkbox.checked;

  try {
    if (nextValue) {
      // 추천 설정
      if (!confirm(t("messages.confirm.confirmRecommendationSet"))) {
        checkbox.checked = item.recommended || false; // 취소 시 원상복구
        return;
      }

      const result = await projectStore.createRecommendation({
        project_id: item.id,
      });

      if (result?.success) {
        alert(t("messages.success.recommendationSetSuccess"));
        // 데이터 다시 로드
        await loadData({
          page: currentPage.value,
          search_value: searchQueryInput.value,
          order_by: projectStore.sortField,
          order_direction: projectStore.sortOrder,
        });
      } else {
        checkbox.checked = item.recommended || false; // 실패 시 원상복구
        const errorMessage = translateMessage(
          result?.message,
          "messages.error.recommendationCreateFailed"
        );
        alert(errorMessage);
      }
    } else {
      // 추천 해제
      if (!confirm(t("messages.confirm.confirmRecommendationRemove"))) {
        checkbox.checked = item.recommended || false; // 취소 시 원상복구
        return;
      }

      const recommendationId = item.project_recommended?.recommendation_id;
      if (!recommendationId) {
        checkbox.checked = item.recommended || false; // recommendation_id가 없으면 원상복구
        alert(t("messages.error.recommendationNotFound"));
        return;
      }

      const result = await projectStore.deleteRecommendation(recommendationId);

      if (result?.success) {
        alert(t("messages.success.recommendationRemoveSuccess"));
        // 데이터 다시 로드
        await loadData({
          page: currentPage.value,
          search_value: searchQueryInput.value,
          order_by: projectStore.sortField,
          order_direction: projectStore.sortOrder,
        });
      } else {
        checkbox.checked = item.recommended || false; // 실패 시 원상복구
        const errorMessage = translateMessage(
          result?.message,
          "messages.error.recommendationDeleteFailed"
        );
        alert(errorMessage);
      }
    }
  } catch (error: any) {
    console.error("추천 상태 변경 실패:", error);
    checkbox.checked = item.recommended || false; // 에러 시 원상복구
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.recommendationUpdateFailed"
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

  @media (max-width: 1024px) {
    padding: 40px 0;
  }
}
</style>
