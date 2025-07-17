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
        <button
          class="btn btn-primary btn-edit"
          @click="handleEdit"
          :disabled="selectedItems.length !== 1"
        >
          {{ t("common.edit") }}
        </button>
        <button class="btn btn-primary btn-regist" @click="handleRegist">
          {{ t("common.register") }}
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
    <!-- 등록 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>
            {{
              isEditMode
                ? t("recommendedProcess.editProcess")
                : t("recommendedProcess.registerProcess")
            }}
          </h3>
          <button class="btn-close" @click="isRegistModalOpen = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt>{{ t("recommendedProcess.inflowType") }}</dt>
            <dd>
              <input
                id="process-inflowType"
                v-model="newProcess.inflowType"
                type="text"
                :placeholder="t('placeholder.recommendedProcessInflowType')"
              />
            </dd>
            <dt>{{ t("recommendedProcess.applicationField") }}</dt>
            <dd>
              <input
                id="process-applicationField"
                v-model="newProcess.applicationField"
                type="text"
                :placeholder="
                  t('placeholder.recommendedProcessApplicationField')
                "
              />
            </dd>
            <dt>{{ t("recommendedProcess.solution") }}</dt>
            <dd>
              <input
                id="process-solution"
                v-model="newProcess.solution"
                type="text"
                :placeholder="t('placeholder.recommendedProcessSolution')"
              />
            </dd>
            <dt>{{ t("recommendedProcess.layout3d") }}</dt>
            <dd>
              <input
                id="process-layout3d"
                v-model="newProcess.layout3d"
                type="text"
                :placeholder="t('placeholder.recommendedProcessLayout3d')"
              />
            </dd>
            <dt>{{ t("recommendedProcess.remarks") }}</dt>
            <dd>
              <input
                id="process-remarks"
                v-model="newProcess.remarks"
                type="text"
                :placeholder="t('placeholder.recommendedProcessRemarks')"
              />
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isRegistModalOpen = false">
            {{ t("common.cancel") }}
          </button>
          <button class="btn btn-primary" @click="saveProcess">
            {{ t("common.save") }}
          </button>
        </div>
      </div>
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
    sortable: true,
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
    sortable: true,
  },
  {
    key: "layout3d",
    title: t("recommendedProcess.layout3d"),
    width: "180px",
    sortable: true,
  },
  {
    key: "remarks",
    title: t("recommendedProcess.remarks"),
    width: "200px",
    sortable: true,
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
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newProcess = ref<ProcessItem>({
  id: 0,
  inflowType: "",
  applicationField: "",
  solution: "",
  layout3d: "",
  remarks: "",
});

// --- computed로 페이징 및 필터 처리 ---
const filteredProcessList = computed(() => {
  if (searchOption.value && searchQuery.value) {
    return processList.value.filter((process) => {
      const key = searchOption.value as keyof ProcessItem;
      return (
        process[key] &&
        process[key]!.toString()
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
    processList.value = [
      {
        id: 1,
        inflowType: "생활하수",
        applicationField: "소규모 마을",
        solution: "MBR",
        layout3d: "Standard-A",
        remarks: "",
      },
      {
        id: 2,
        inflowType: "산업폐수",
        applicationField: "식품 공장",
        solution: "A2O + MBR",
        layout3d: "Standard-B",
        remarks: "고농도 유기물",
      },
      {
        id: 3,
        inflowType: "축산분뇨",
        applicationField: "양돈 농가",
        solution: "혐기소화 + SBR",
        layout3d: "Standard-C",
        remarks: "",
      },
      {
        id: 4,
        inflowType: "생활하수",
        applicationField: "아파트 단지",
        solution: "MBR",
        layout3d: "Standard-A",
        remarks: "",
      },
      {
        id: 5,
        inflowType: "산업폐수",
        applicationField: "반도체 공장",
        solution: "고도산화처리",
        layout3d: "Custom-A",
        remarks: "난분해성 물질",
      },
      {
        id: 6,
        inflowType: "생활하수",
        applicationField: "리조트",
        solution: "SBR",
        layout3d: "Standard-D",
        remarks: "계절적 변동",
      },
      {
        id: 7,
        inflowType: "산업폐수",
        applicationField: "제지 공장",
        solution: "DAF + 활성슬러지",
        layout3d: "Standard-E",
        remarks: "",
      },
      {
        id: 8,
        inflowType: "축산분뇨",
        applicationField: "양계 농가",
        solution: "혐기소화",
        layout3d: "Standard-C",
        remarks: "",
      },
      {
        id: 9,
        inflowType: "생활하수",
        applicationField: "관광단지",
        solution: "MBR",
        layout3d: "Standard-A",
        remarks: "",
      },
      {
        id: 10,
        inflowType: "산업폐수",
        applicationField: "화학 공장",
        solution: "Fenton + MBR",
        layout3d: "Custom-B",
        remarks: "독성 물질 포함",
      },
      {
        id: 11,
        inflowType: "생활하수",
        applicationField: "소규모 마을",
        solution: "SBR",
        layout3d: "Standard-D",
        remarks: "",
      },
      {
        id: 12,
        inflowType: "축산분뇨",
        applicationField: "낙농 농가",
        solution: "혐기소화 + MBR",
        layout3d: "Standard-C",
        remarks: "",
      },
    ];
    totalCount.value = processList.value.length;
    totalPages.value = Math.ceil(totalCount.value / pageSize.value);
  } catch (error) {
    console.error("데이터 로드 실패:", error);
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
  key: string;
  direction: "asc" | "desc";
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

// 등록 버튼 핸들러
const handleRegist = () => {
  isRegistModalOpen.value = true;
  isEditMode.value = false;
  newProcess.value = {
    id: 0,
    inflowType: "",
    applicationField: "",
    solution: "",
    layout3d: "",
    remarks: "",
  };
};

// 공정 저장
const saveProcess = () => {
  if (
    !newProcess.value.inflowType ||
    !newProcess.value.applicationField ||
    !newProcess.value.solution ||
    !newProcess.value.layout3d
  ) {
    alert(t("messages.warning.pleaseCompleteRequiredFields"));
    return;
  }

  if (isEditMode.value) {
    // 수정 모드: 기존 공정 정보 업데이트
    const idx = processList.value.findIndex(
      (p) => p.id === newProcess.value.id
    );
    if (idx !== -1) {
      processList.value[idx] = { ...newProcess.value };
      alert(t("messages.success.processInfoUpdated"));
    }
  } else {
    // 등록 모드: 새 공정 추가
    const nextId = Math.max(...processList.value.map((p) => p.id), 0) + 1;
    processList.value.push({
      ...newProcess.value,
      id: nextId,
    });
    alert(t("messages.success.processRegistered"));
  }
  isRegistModalOpen.value = false;
  newProcess.value = {
    id: 0,
    inflowType: "",
    applicationField: "",
    solution: "",
    layout3d: "",
    remarks: "",
  };
  isEditMode.value = false;
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

// 선택된 항목 수정
const handleEdit = () => {
  if (selectedItems.value.length !== 1) {
    alert(t("messages.warning.selectOneItemToEdit"));
    return;
  }
  const itemToEdit = selectedItems.value[0];
  isRegistModalOpen.value = true;
  isEditMode.value = true;
  newProcess.value = { ...itemToEdit };
};
</script>

<style scoped lang="scss">
.recommended-process {
  padding: $spacing-lg;
}
</style>
