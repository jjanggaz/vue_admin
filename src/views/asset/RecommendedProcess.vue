<template>
  <div class="recommended-process">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="searchOption" class="label-search">{{
            t("common.search")
          }}</label>
          <div class="form-item">
            <select id="searchOption" v-model="searchOptionInput">
              <option value="">{{ t("common.selectItem") }}</option>
              <option value="inflowType">
                {{ t("recommendedProcess.inflowType") }}
              </option>
              <option value="applicationField">
                {{ t("recommendedProcess.applicationField") }}
              </option>
              <option value="solution">
                {{ t("recommendedProcess.solution") }}
              </option>
              <option value="layout3d">
                {{ t("recommendedProcess.layout3d") }}
              </option>
              <option value="remarks">
                {{ t("recommendedProcess.remarks") }}
              </option>
            </select>
          </div>
        </div>
        <div class="group-form">
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
    <DataTable
      :columns="tableColumns"
      :data="paginatedProcessList"
      :loading="loading"
      :selectable="true"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    />
    <!-- Pagination -->
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
import { ref, onMounted, computed } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface ProcessItem {
  id: number;
  inflowType: string;
  applicationField: string;
  solution: string;
  layout3d: string;
  remarks: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  {
    key: "id",
    title: t("recommendedProcess.no"),
    width: "80px",
    sortable: false,
  },
  {
    key: "inflowType",
    title: t("recommendedProcess.inflowType"),
    width: "150px",
    sortable: true,
  },
  {
    key: "applicationField",
    title: t("recommendedProcess.applicationField"),
    width: "200px",
    sortable: true,
  },
  {
    key: "solution",
    title: t("recommendedProcess.solution"),
    width: "200px",
    sortable: false,
  },
  {
    key: "layout3d",
    title: t("recommendedProcess.layout3d"),
    width: "180px",
    sortable: false,
  },
  {
    key: "remarks",
    title: t("recommendedProcess.remarks"),
    width: "200px",
    sortable: false,
  },
];

const processList = ref<ProcessItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const sortColumn = ref<string | null>(null);
const sortOrder = ref<"asc" | "desc" | null>(null);
const searchOptionInput = ref("");
const searchQueryInput = ref("");
const searchOption = ref("");
const searchQuery = ref("");
const selectedItems = ref<ProcessItem[]>([]);

// --- computed로 페이징 및 필터 처리 ---
const filteredProcessList = computed(() => {
  if (searchOption.value && searchQuery.value) {
    return processList.value.filter((process) => {
      const key = searchOption.value as keyof ProcessItem;
      return (
        process[key] &&
        String(process[key])
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      );
    });
  }
  return processList.value;
});

const totalCountComputed = computed(() => filteredProcessList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);

const paginatedProcessList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredProcessList.value.slice(start, end);
});

// 데이터 로드 함수
const loadData = async () => {
  loading.value = true;
  try {
    // TODO: 실제 API 호출로 대체 필요
    processList.value = [];
    totalCount.value = 0;
    totalPages.value = 1;
  } catch (error: unknown) {
    console.error("데이터 로드 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : "데이터 로드에 실패했습니다.";
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selected: ProcessItem[]) => {
  selectedItems.value = selected;
};

// 페이지 변경 핸들러
const handlePageChange = (page: number) => {
  currentPage.value = page;
  selectedItems.value = [];
};

// 정렬 변경 핸들러
const handleSortChange = (sortInfo: {
  key: string | null;
  direction: "asc" | "desc" | null;
}) => {
  sortColumn.value = sortInfo.key;
  sortOrder.value = sortInfo.direction;
};

// 행 클릭 핸들러
const handleRowClick = (item: ProcessItem) => {
  console.log("Row clicked:", item);
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadData();
});

// 검색 기능 구현
const handleSearch = () => {
  //검색시 선택된 항목 초기화
  selectedItems.value = [];
  searchOption.value = searchOptionInput.value;
  searchQuery.value = searchQueryInput.value;
  currentPage.value = 1;
};

// 선택된 항목 삭제
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
    console.log("삭제할 항목:", selectedItems.value);
    const selectedIds = selectedItems.value.map((item) => item.id);
    processList.value = processList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert(t("messages.success.deleted"));
  }
};
</script>

<style scoped lang="scss">
.recommended-process {
  padding: $spacing-lg;
}
</style>
