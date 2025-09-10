<template>
  <div class="code-management">
    <!-- Top Section - Search/Filter Controls -->
    <div class="search-section">
      <div class="search-filters">
        <div class="filter-group">
          <label class="filter-label"
            >⊙ {{ t("columns.code.codeGroup") }}</label
          >
          <select v-model="searchCodeGroupInput" class="filter-select">
            <option value="">{{ t("placeholder.selectGroupName") }}</option>
            <option
              v-for="group in uniqueCodeGroups"
              :key="group"
              :value="group"
            >
              {{ group }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label"
            >⊙ {{ t("columns.code.majorCategory") }}</label
          >
          <select v-model="searchMajorCategoryInput" class="filter-select">
            <option value="">{{ t("common.select") }}</option>
            <option
              v-for="category in uniqueMajorCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label"
            >⊙ {{ t("columns.code.mediumCategory") }}</label
          >
          <select v-model="searchMediumCategoryInput" class="filter-select">
            <option value="">{{ t("common.select") }}</option>
            <option
              v-for="category in uniqueMediumCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label"
            >⊙ {{ t("columns.code.minorCategory") }}</label
          >
          <select v-model="searchMinorCategoryInput" class="filter-select">
            <option value="">{{ t("common.select") }}</option>
            <option
              v-for="category in uniqueMinorCategories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <button class="btn-search" @click="handleSearch">
          {{ t("common.search") }}
        </button>
      </div>
    </div>

    <!-- Main Content Section -->
    <div class="main-content">
      <!-- Left Section - Category Table -->
      <!-- <div class="category-sidebar">
        <div class="category-table-container">
          <VerticalDataTable :data="categoryData" :loading="false" />
        </div>
      </div> -->

      <!-- Right Section - Main Data Table & Actions -->
      <div class="table-section">
        <div class="action-buttons">
          <button class="btn btn-secondary btn-register" @click="handleRegist">
            {{ t("common.register") }}
          </button>
          <button
            class="btn btn-secondary btn-delete"
            @click="handleDelete"
            :disabled="selectedItems.length === 0"
          >
            {{ t("common.delete") }}
          </button>
          <button
            class="btn btn-secondary btn-edit"
            @click="handleEdit"
            :disabled="selectedItems.length !== 1"
          >
            {{ t("common.edit") }}
          </button>
        </div>

        <DataTable
          :columns="tableColumns"
          :data="paginatedcodeList"
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
    </div>
    <!-- 등록 모달 컴포넌트 -->
    <CodeRegistrationModal
      :visible="isRegistModalOpen && !isEditMode"
      @close="isRegistModalOpen = false"
      @save="handleModalSave"
    />

    <!-- 수정 모달 -->
    <div v-if="isRegistModalOpen && isEditMode" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ t("common.editCode") }}</h3>
          <button class="btn-close" @click="isRegistModalOpen = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt>{{ t("columns.code.codeGroup") }}</dt>
            <dd>
              <input
                id="code-group"
                v-model="newCode.code_group"
                type="text"
                :placeholder="t('placeholder.codeGroup')"
                :disabled="isEditMode"
              />
            </dd>
            <dt>{{ t("columns.code.parentCode") }}</dt>
            <dd>
              <input
                id="code-high-code"
                v-model="newCode.parent_key"
                type="text"
                :placeholder="t('placeholder.codeHighCode')"
                :disabled="isEditMode"
              />
            </dd>
            <dt>{{ t("columns.code.code") }}</dt>
            <dd>
              <input
                id="code-name"
                v-model="newCode.code_key"
                type="text"
                :placeholder="t('placeholder.codeCodeName')"
              />
            </dd>
            <dt>{{ t("columns.code.codeNameKorean") }}</dt>
            <dd>
              <input
                id="code-name-korean"
                v-model="newCode.code_name"
                type="text"
                :placeholder="t('placeholder.codeCodeName')"
              />
            </dd>
            <dt>{{ t("columns.code.codeNameEnglish") }}</dt>
            <dd>
              <input
                id="code-name-korean"
                v-model="newCode.code_name_en"
                type="text"
                :placeholder="t('placeholder.codeCodeName')"
              />
            </dd>
            <!-- <dt>{{ t("columns.code.orderMovement") }}</dt>
            <dd>
              <input
                id="code-rank"
                v-model="newCode.rank"
                type="text"
                :placeholder="t('placeholder.codeOrder')"
              />
            </dd> -->
            <dt>{{ t("columns.code.usageStatus") }}</dt>
            <dd>
              <select v-model="newCode.is_active" class="filter-select">
                <option value="Y">{{ t("common.used") }}</option>
                <option value="N">{{ t("common.unused") }}</option>
              </select>
            </dd>
            <dt>{{ t("columns.code.codeDescription") }}</dt>
            <dd>
              <input
                id="code-description"
                v-model="newCode.description"
                type="text"
                :placeholder="t('placeholder.codeDescription')"
              />
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isRegistModalOpen = false">
            {{ t("common.cancel") }}
          </button>
          <button class="btn btn-primary" @click="saveCode">
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
import VerticalDataTable from "@/components/common/VerticalDataTable.vue";
import CodeRegistrationModal from "./components/CodeRegistrationModal.vue";
import { request } from "../../utils/request";
import { useI18n } from "vue-i18n";

const SYSTEM_CODE = import.meta.env.VITE_SYSTEM_CODE;
console.log("SYSTEM_CODE :", SYSTEM_CODE);

const { t } = useI18n();

interface CodeItem {
  code_group: string;
  code_id: string;
  code_key: string;
  code_name: string;
  code_name_en: string;
  code_value: string;
  code_order: string;
  is_active: string;
  parent_key: string;
  description: string;
}

interface queryParams {
  search_field?: string;
  search_value?: string;
  page?: number;
  page_size?: number;
  order_by?: string;
  order_direction?: "asc" | "desc";
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  {
    key: "code_group",
    title: t("columns.code.codeGroupKorean"),
    width: "120px",
    sortable: true,
  },
  {
    key: "parent_key",
    title: t("columns.code.parentCode"),
    width: "100px",
    sortable: true,
  },
  {
    key: "code_key",
    title: t("columns.code.code"),
    width: "100px",
    sortable: true,
  },
  {
    key: "code_name",
    title: t("columns.code.codeNameKorean"),
    width: "150px",
    sortable: true,
  },
  {
    key: "code_order",
    title: t("columns.code.orderMovement"),
    width: "100px",
    sortable: true,
  },
  {
    key: "is_active",
    title: t("columns.code.usageStatus"),
    width: "100px",
    sortable: true,
    formatter: (value: string) =>
      value === "Y" ? t("common.used") : t("common.unused"),
  },
  {
    key: "description",
    title: t("columns.code.codeDescription"),
    width: "150px",
    sortable: true,
  },
];

// 카테고리 데이터 (2열 구조용)
const categoryData = ref([
  { columnName: "공정", value: "공정구분" },
  { columnName: "기계", value: "유형" },
  { columnName: "유입종류", value: "유입항목" },
  { columnName: "-", value: "-" },
  { columnName: "국가", value: "" },
  { columnName: "단위", value: "" },
  { columnName: "언어", value: "" },
]);

const codeList = ref<CodeItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const sortColumn = ref<string | null>(null);
const sortOrder = ref<"asc" | "desc" | null>(null);
const searchCodeGroupInput = ref("");
const searchHighCodeInput = ref("");
const searchMajorCategoryInput = ref("");
const searchMediumCategoryInput = ref("");
const searchMinorCategoryInput = ref("");
const searchCodeGroup = ref("");
const searchHighCode = ref("");

const selectedItems = ref<CodeItem[]>([]);

const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newCode = ref<CodeItem>({
  // id: "",
  // codeGroup: "",
  // highCode: "",
  // codeName: "",
  // codeNameKorean: "",
  // rank: "",
  // usage: "",
  // etc: "",
  code_id: "",
  code_group: "",
  code_key: "",
  code_name: "",
  code_name_en: "",
  code_value: "",
  code_order: "",
  is_active: "",
  parent_key: "",
  description: "",
});

// 검색조건 (1.코드그룹, 2, 대분류, 3.중분류, 4. 소분류)
// const uniqueCodeGroups = computed(() => {
//   const set = new Set(codeList.value.map((item) => item.code_group));
//   return Array.from(set);
// });
const uniqueCodeGroups = computed(() => {
  return ["1.코드그룹", "2.대분류", "3.중분류", "4.소분류"];
});

const uniqueMajorCategories = computed(() => {
  return ["공정", "기계", "유형", "유입종류"];
});
const uniqueMediumCategories = computed(() => {
  return ["전처리", "후처리", "송풍기", "펌프"];
});
const uniqueMinorCategories = computed(() => {
  return ["1차", "2차", "3차"];
});

// --- computed로 페이징 및 필터 처리 ---
const filteredCodeList = computed(() => {
  return codeList.value.filter((code) => {
    const matchGroup =
      !searchCodeGroup.value || code.code_group === searchCodeGroup.value;
    const matchHigh =
      !searchHighCode.value || code.parent_key === searchHighCode.value;
    return matchGroup && matchHigh;
  });
});

const totalCountComputed = computed(() => filteredCodeList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);

const paginatedcodeList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredCodeList.value.slice(start, end);
});

// 데이터 로드 함수
const loadData = async () => {
  //"detail": "지원하지 않는 검색 필드입니다. 지원 필드: ['code_id', 'code_group', 'code_key', 'code_value', 'code_value_en', 'parent_key', 'description', 'created_at']"

  const queryParams: Record<string, any> = {};

  // 검색 조건 설정
  queryParams.search_field = "";
  queryParams.search_value = "";

  // 페이지네이션 설정
  queryParams.page = 1;
  queryParams.page_size = 20;

  // 정렬 설정
  // if (params.order_by !== undefined)
  // queryParams.order_by = params.order_by;
  // if (params.order_direction !== undefined)
  // queryParams.order_direction = params.order_direction;

  // if (params.offset !== undefined)
  //   queryParams.offset = params.offset.toString();
  // if (params.limit !== undefined)
  //   queryParams.limit = params.limit.toString();
  // if (params.page !== undefined)
  //   queryParams.page = params.page.toString();
  // if (params.itemsPerPage !== undefined)
  //   queryParams.itemsPerPage = params.itemsPerPage.toString();

  const result = await request("/api/code/list", undefined, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(queryParams),
  });

  console.log("결과값 : ");
  console.log(result);

  // // API 응답 구조에 따라 처리
  // if (Array.isArray(response)) {
  //   // 응답이 배열인 경우
  //   this.users = response;
  //   this.totalCount = response.length;
  //   this.currentPage = 1;
  //   this.itemsPerPage = response.length;
  //   this.hasMore = false;
  // } else {
  //   // 응답이 객체인 경우 (UserListResponse 형태)
  //   this.users = response.data;
  //   this.totalCount = response.total_count;
  //   this.currentPage = response.page;
  //   this.itemsPerPage = response.items_per_page;
  //   this.hasMore = response.has_more;
  // }

  console.log("코드 목록 조회 성공:", result);
  console.log("코드 목록 조회 성공:", result.response);
  //if (response.response && response.response.items) {

  loading.value = true;
  try {
    codeList.value = result.response.items || result;
    // this.totalCount = response.response.total;
    // this.page = response.response.page;
    // this.page_size = response.response.page_size;
    // this.hasMore = response.response.page < response.response.total_pages;
    // codeList.value = [
    //   {
    //     id: "1",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "송풍기",
    //     rank: "1",
    //     usage: "Y",
    //     etc: "",
    //   },
    //   {
    //     id: "2",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "AI0101",
    //     codeNameKorean: "터보블로워(VVVF)",
    //     rank: "1",
    //     usage: "Y",
    //     etc: "",
    //   },
    //   {
    //     id: "3",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "",
    //     rank: "2",
    //     usage: "N",
    //     etc: "",
    //   },
    //   {
    //     id: "4",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "",
    //     rank: "3",
    //     usage: "N",
    //     etc: "",
    //   },
    //   {
    //     id: "5",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "",
    //     rank: "4",
    //     usage: "N",
    //     etc: "",
    //   },
    //   {
    //     id: "6",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "",
    //     rank: "5",
    //     usage: "N",
    //     etc: "",
    //   },
    //   {
    //     id: "7",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "",
    //     rank: "6",
    //     usage: "N",
    //     etc: "",
    //   },
    //   {
    //     id: "8",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "",
    //     rank: "7",
    //     usage: "N",
    //     etc: "",
    //   },
    //   {
    //     id: "9",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "",
    //     rank: "8",
    //     usage: "N",
    //     etc: "",
    //   },
    //   {
    //     id: "10",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "",
    //     rank: "9",
    //     usage: "N",
    //     etc: "",
    //   },
    //   {
    //     id: "11",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "",
    //     rank: "10",
    //     usage: "N",
    //     etc: "",
    //   },
    //   {
    //     id: "12",
    //     codeGroup: "equipment",
    //     highCode: "ME02",
    //     codeName: "",
    //     codeNameKorean: "",
    //     rank: "11",
    //     usage: "N",
    //     etc: "",
    //   },
    // ];
    totalCount.value = codeList.value.length;
    totalPages.value = Math.ceil(totalCount.value / pageSize.value);
  } catch (error: any) {
    console.error("데이터 로드 실패:", error);
    const errorMessage = error?.message || "데이터 로드에 실패했습니다.";
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selected: CodeItem[]) => {
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
const handleRowClick = (item: CodeItem) => {
  console.log("Row clicked:", item);
  // 행 클릭 시 해당 항목을 선택 상태로 토글 (다중선택)
  const index = selectedItems.value.findIndex(
    (selected) => selected.id === item.id
  );
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(item);
  }
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadData();
});

// 검색 기능 구현
const handleSearch = () => {
  selectedItems.value = [];
  currentPage.value = 1;
  searchCodeGroup.value = searchCodeGroupInput.value;
  searchHighCode.value = searchHighCodeInput.value;
};

// 모달 저장 핸들러
const handleModalSave = (data: CodeItem[]) => {
  console.log("모달에서 저장된 데이터:", data);
  // 여기서 데이터를 메인 테이블에 추가하거나 처리
  alert(t("messages.success.codeRegistered"));
  isRegistModalOpen.value = false;
};

// 등록 버튼 핸들러
const handleRegist = () => {
  isRegistModalOpen.value = true;
  isEditMode.value = false;
  newCode.value = {
    id: "",
    codeGroup: "",
    highCode: "",
    codeName: "",
    codeNameKorean: "",
    rank: "",
    usage: "",
    etc: "",
  };
};

// 사용자 저장
const saveCode = () => {
  if (
    !newCode.value.code_group ||
    !newCode.value.highCode ||
    !newCode.value.codeName ||
    !newCode.value.codeNameKorean ||
    !newCode.value.rank
  ) {
    alert(t("messages.warning.pleaseCompleteAllFields"));
    return;
  }

  if (isEditMode.value) {
    // 수정 모드: 기존 정보 업데이트
    const idx = codeList.value.findIndex((u) => u.id === newCode.value.id);
    if (idx !== -1) {
      codeList.value[idx] = { ...newCode.value };
      alert(t("messages.success.codeInfoUpdated"));
    }
  } else {
    // 등록 모드: 새 코드 추가
    const nextId = (codeList.value.length + 1).toString();
    codeList.value.push({
      ...newCode.value,
      id: nextId,
    });
    alert(t("messages.success.codeRegistered"));
  }

  isRegistModalOpen.value = false;
  newCode.value = {
    id: "",
    code_group: "",
    highCode: "",
    codeName: "",
    codeNameKorean: "",
    rank: "",
    usage: "",
    etc: "",
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
    codeList.value = codeList.value.filter(
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
  newCode.value = { ...itemToEdit };
};
</script>

<style scoped lang="scss">
.code-management {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Top Section - Search/Filter Controls
.search-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-filters {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
  flex: 1;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.btn-search {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-left: auto;

  &:hover {
    background-color: #2563eb;
  }
}

// Main Content Section
.main-content {
  display: flex;
  flex: 1;
  gap: 15px;
  min-height: 0;
  overflow: hidden;
}

// Left Section - Category Sidebar
.category-sidebar {
  width: 220px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex-shrink: 0;
}

.category-table-container {
  height: 100%;
  overflow-y: auto;
}

// Right Section - Table Section
.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &.btn-secondary {
    background-color: #6b7280;
    color: white;

    &:hover:not(:disabled) {
      background-color: #4b5563;
    }

    &:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
  }

  &.btn-primary {
    background-color: #3b82f6;
    color: white;

    &:hover:not(:disabled) {
      background-color: #2563eb;
    }

    &:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

// Modal Styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-container-large {
  background: white;
  border-radius: 8px;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;

    &:hover {
      color: #374151;
    }
  }
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.column-regist {
  dl {
    margin: 0;
  }

  dt {
    font-weight: 600;
    margin-bottom: 8px;
    color: #374151;
  }

  dd {
    margin: 0 0 20px 0;

    input,
    textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}
</style>
