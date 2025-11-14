<template>
  <div class="code-management">
    <!-- Top Section - Search/Filter Controls -->
    <div class="search-section">
      <div class="search-filters">
        <div class="filter-group">
          <label class="filter-label"
            >⊙ {{ t("columns.code.codeGroup") }}</label
          >
          <select
            v-model="searchCodeGroupInput"
            class="filter-select"
            @change="
              handleCodeGroupChange();
              handleSearch();
            "
          >
            <option value="">{{ t("common.selectAll") }}</option>
            <option
              v-for="group in uniqueCodeGroups"
              :key="group.key"
              :value="group.key"
            >
              {{ group.value }} [{{ group.key }}]
              <!-- {{ group.value }} [{{ group.key }}] -->
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label"
            >⊙ {{ t("columns.code.majorCategory") }}</label
          >
          <select
            v-model="searchCategory1Input"
            class="filter-select"
            @change="
              handleCategory1Change();
              handleSearch();
            "
            :disabled="uniqueCategories1.length === 0"
          >
            <option value="">
              {{
                uniqueCategories1.length === 0 ? "내용없음" : t("common.select")
              }}
            </option>
            <option
              v-for="category in uniqueCategories1"
              :key="category.key"
              :value="category.key"
            >
              {{ category.value }} [{{ category.key }}]
              <!-- {{ category.value }} [{{ category.key }}] -->
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label"
            >⊙ {{ t("columns.code.mediumCategory") }}</label
          >
          <select
            v-model="searchCategory2Input"
            class="filter-select"
            @change="
              handleCategory2Change();
              handleSearch();
            "
            :disabled="uniqueCategories2.length === 0"
          >
            <option value="">
              {{
                uniqueCategories2.length === 0 ? "내용없음" : t("common.select")
              }}
            </option>
            <option
              v-for="category in uniqueCategories2"
              :key="category.key"
              :value="category.key"
            >
              {{ category.value }} [{{ category.key }}]
              <!-- {{ category.value }} [{{ category.key }}] -->
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label"
            >⊙ {{ t("columns.code.minorCategory") }}</label
          >
          <select
            v-model="searchCategory3Input"
            class="filter-select"
            @change="handleSearch()"
            :disabled="uniqueCategories3.length === 0"
          >
            <option value="">
              {{
                uniqueCategories3.length === 0 ? "내용없음" : t("common.select")
              }}
            </option>
            <option
              v-for="category in uniqueCategories3"
              :key="category.key"
              :value="category.key"
            >
              {{ category.value }} [{{ category.key }}]
              <!-- {{ category.value }} [{{ category.key }}] -->
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
      <!-- Main Data Table & Actions -->
      <div class="table-section">
        <div class="action-buttons">
          <button
            class="btn btn-secondary btn-register"
            @click="handleSingleRegist"
          >
            {{ t("common.register") }}
          </button>
          <button
            class="btn btn-secondary btn-multi-register"
            @click="handleMultiRegist"
            :disabled="!searchCodeGroupInput"
          >
            {{ t("common.multiRegister") }}
          </button>
          <button
            class="btn btn-secondary btn-edit"
            @click="handleEdit"
            :disabled="selectedItems.length !== 1"
          >
            {{ t("common.edit") }}
          </button>
          <button
            class="btn btn-secondary btn-delete"
            @click="handleDelete"
            :disabled="selectedItems.length === 0"
          >
            {{ t("common.delete") }}
          </button>
        </div>

        <div class="table-wrapper">
          <DataTable
            :columns="tableColumns"
            :data="codeList"
            :loading="loading"
            :selectable="true"
            :selection-mode="'multiple'"
            :show-select-all="true"
            row-key="code_id"
            :select-header-text="t('common.selectColumn')"
            :selected-items="selectedItems"
            @selection-change="handleSelectionChange"
            @sort-change="handleSortChange"
            @row-click="handleRowClick"
          />
        </div>

        <!-- Pagination -->
        <div class="pagination-container">
          <div class="total-count">
            {{
              t("common.totalCount", {
                count: totalCount || 0,
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
    </div>
    <!-- 등록 모달 컴포넌트 (다건등록) -->
    <CodeRegistrationModal
      :visible="isRegistModalOpen && !isEditMode && isMultiRegister"
      :selected-code-group="modalCodeGroup"
      :selected-category1="modalCategory1"
      :selected-category2="modalCategory2"
      :selected-category3="modalCategory3"
      :selected-code-level="modalCodeLevel"
      :selected-parent-key="modalParentKey"
      @close="isRegistModalOpen = false"
      @save="handleModalSave"
    />

    <!-- 새로운 등록 모달 (단건등록) -->
    <div
      v-if="isRegistModalOpen && !isEditMode && !isMultiRegister"
      class="modal-overlay"
    >
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ t("common.registerCode") }}</h3>
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
                :disabled="!!modalCodeGroup.key"
              />
              <input
                id="code-high-code"
                v-model="newCode.parent_key"
                type="hidden"
                :placeholder="t('placeholder.codeHighCode')"
                :disabled="true"
              />
              <input
                id="code-level"
                v-model="newCode.code_level"
                type="hidden"
                :placeholder="t('placeholder.codeLevel')"
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
                v-model="newCode.code_value"
                type="text"
                :placeholder="t('placeholder.codeCodeName')"
              />
            </dd>
            <dt>{{ t("columns.code.codeNameEnglish") }}</dt>
            <dd>
              <input
                id="code-name-english"
                v-model="newCode.code_value_en"
                type="text"
                :placeholder="t('placeholder.codeCodeName')"
              />
            </dd>
            <dt>{{ t("columns.code.orderMovement") }}</dt>
            <dd>
              <input
                id="code-order"
                v-model="newCode.code_order"
                type="number"
                :placeholder="t('placeholder.codeOrder')"
              />
            </dd>
            <dt>{{ t("columns.code.usageStatus") }}</dt>
            <dd>
              <select v-model="newCode.is_active" class="filter-select">
                <option :value="true">사용</option>
                <option :value="false">미사용</option>
              </select>
            </dd>
            <dt>{{ t("columns.code.isLeaf") }}</dt>
            <dd>
              <select v-model="newCode.is_leaf" class="filter-select">
                <option :value="true">Y</option>
                <option :value="false">N</option>
              </select>
            </dd>
            <dt>{{ t("columns.code.isAdminOnly") }}</dt>
            <dd>
              <select v-model="newCode.is_admin_only" class="filter-select">
                <option :value="true">{{ t("common.yes") }}</option>
                <option :value="false">{{ t("common.noOption") }}</option>
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
          <button class="btn btn-primary" @click="updateCode">
            {{ t("common.save") }}
          </button>
        </div>
      </div>
    </div>

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
                :disabled="true"
              />
              <input
                id="code_id"
                v-model="newCode.code_id"
                type="hidden"
                :disabled="isEditMode"
              />
              <input
                id="code-high-code"
                v-model="newCode.parent_key"
                type="hidden"
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
                :disabled="isEditMode"
              />
            </dd>
            <dt>{{ t("columns.code.codeNameKorean") }}</dt>
            <dd>
              <input
                id="code-name-korean"
                v-model="newCode.code_value"
                type="text"
                :placeholder="t('placeholder.codeCodeName')"
              />
            </dd>
            <dt>{{ t("columns.code.codeNameEnglish") }}</dt>
            <dd>
              <input
                id="code-name-korean"
                v-model="newCode.code_value_en"
                type="text"
                :placeholder="t('placeholder.codeCodeName')"
              />
            </dd>
            <dt>{{ t("columns.code.orderMovement") }}</dt>
            <dd>
              <input
                id="code-order"
                v-model="newCode.code_order"
                type="number"
                :placeholder="t('placeholder.codeOrder')"
              />
            </dd>
            <dt>{{ t("columns.code.usageStatus") }}</dt>
            <dd>
              <select v-model="newCode.is_active" class="filter-select">
                <option :value="true">사용</option>
                <option :value="false">미사용</option>
              </select>
            </dd>
            <dt>{{ t("columns.code.isLeaf") }}</dt>
            <dd>
              <select v-model="newCode.is_leaf" class="filter-select">
                <option :value="true">Y</option>
                <option :value="false">N</option>
              </select>
            </dd>
            <dt>{{ t("columns.code.isAdminOnly") }}</dt>
            <dd>
              <select v-model="newCode.is_admin_only" class="filter-select">
                <option :value="true">{{ t("common.yes") }}</option>
                <option :value="false">{{ t("common.noOption") }}</option>
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
          <button class="btn btn-primary" @click="updateCode">
            {{ t("common.save") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import CodeRegistrationModal from "./components/CodeRegistrationModal.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import {
  useCodeStore,
  type CodeItem,
  type CodeQueryParams,
  type CodeCreateRequest,
  type CodeUpdateRequest,
} from "@/stores/codeStore";

const SYSTEM_CODE = import.meta.env.VITE_SYSTEM_CODE;
console.log("SYSTEM_CODE :", SYSTEM_CODE);

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

// Store 사용
const codeStore = useCodeStore();

// interface QueryParams {
//   search_field?: string;
//   search_value?: string;
//   page?: number;
//   page_size?: number;
//   order_by?: string;
//   order_direction?: "asc" | "desc";
// }

// Store에서 상태 가져오기
const {
  codeList,
  loading,
  totalCount,
  uniqueCodeGroups,
  uniqueCategories1,
  uniqueCategories2,
  uniqueCategories3,
} = codeStore;

const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(20);
const sortColumn = ref<string | null>(null);
const sortOrder = ref<"asc" | "desc" | null>(null);
const searchCodeGroupInput = ref("");
const searchCategory1Input = ref("");
const searchCategory2Input = ref("");
const searchCategory3Input = ref("");
const searchCodeGroup = ref("");
const searchCategory1 = ref("");
const searchCategory2 = ref("");
const searchCategory3 = ref("");

const selectedItems = ref<CodeItem[]>([]);

// 모달용 변수들
const modalCodeGroup = ref<{ key: string; value: string }>({
  key: "",
  value: "",
});
const modalCategory1 = ref<{ key: string; value: string }>({
  key: "",
  value: "",
});
const modalCategory2 = ref<{ key: string; value: string }>({
  key: "",
  value: "",
});
const modalCategory3 = ref<{ key: string; value: string }>({
  key: "",
  value: "",
});
const modalCodeLevel = ref<string>("");
const modalParentKey = ref<string>("");

const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const isMultiRegister = ref(false);

// 선택된 카테고리들을 찾는 함수
const findSelectedCategories = () => {
  // 선택된 코드그룹의 key와 value 찾기 (선택사항)
  const selectedGroup = searchCodeGroupInput.value
    ? uniqueCodeGroups.value.find(
        (group) => group.key === searchCodeGroupInput.value
      )
    : null;

  // 선택된 대분류의 key와 value 찾기
  const selectedCategory1 = searchCategory1Input.value
    ? uniqueCategories1.value.find(
        (cat) => cat.key === searchCategory1Input.value
      )
    : null;

  // 선택된 중분류의 key와 value 찾기
  const selectedCategory2 = searchCategory2Input.value
    ? uniqueCategories2.value.find(
        (cat) => cat.key === searchCategory2Input.value
      )
    : null;

  // 선택된 소분류의 key와 value 찾기
  const selectedCategory3 = searchCategory3Input.value
    ? uniqueCategories3.value.find(
        (cat) => cat.key === searchCategory3Input.value
      )
    : null;

  return {
    selectedGroup,
    selectedCategory1,
    selectedCategory2,
    selectedCategory3,
  };
};

// 선택된 카테고리에 따라 code_level과 parent_key를 자동 설정하는 함수
const getAutoCodeLevel = (
  selectedGroup: { key: string; value: string } | null,
  selectedCategory1: { key: string; value: string } | null,
  selectedCategory2: { key: string; value: string } | null,
  selectedCategory3: { key: string; value: string } | null
) => {
  let autoCodeLevel = "";
  let parentKey = "";

  if (
    !selectedGroup &&
    !selectedCategory1 &&
    !selectedCategory2 &&
    !selectedCategory3
  ) {
    // 아무것도 선택하지 않은 경우
    autoCodeLevel = "1";
    parentKey = "";
  } else if (
    selectedGroup &&
    !selectedCategory1 &&
    !selectedCategory2 &&
    !selectedCategory3
  ) {
    // 코드그룹만 선택한 경우
    autoCodeLevel = "2";
    parentKey = selectedGroup.key;
  } else if (
    selectedGroup &&
    selectedCategory1 &&
    !selectedCategory2 &&
    !selectedCategory3
  ) {
    // 코드그룹/대분류만 선택한 경우
    autoCodeLevel = "3";
    parentKey = selectedCategory1.key;
  } else if (
    selectedGroup &&
    selectedCategory1 &&
    selectedCategory2 &&
    !selectedCategory3
  ) {
    // 코드그룹/대분류/중분류만 선택한 경우
    autoCodeLevel = "4";
    parentKey = selectedCategory2.key;
  } else if (
    selectedGroup &&
    selectedCategory1 &&
    selectedCategory2 &&
    selectedCategory3
  ) {
    // 코드그룹/대분류/중분류/소분류 모두 선택한 경우
    autoCodeLevel = "5";
    parentKey = selectedCategory3.key;
  }

  return {
    codeLevel: autoCodeLevel,
    parentKey: parentKey,
  };
};

const newCode = ref<CodeItem>({
  code_id: "",
  code_group: "",
  code_key: "",
  code_value: "",
  code_value_en: "",
  code_order: "",
  is_active: true,
  is_leaf: false,
  parent_key: "",
  code_level: "",
  description: "",
  is_admin_only: false,
});

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  {
    key: "code_order",
    title: t("columns.code.order"),
    width: "80px",
    sortable: true,
  },
  {
    key: "parent_key",
    title: t("columns.code.parentCode"),
    width: "100px",
    sortable: true,
    hidden: true,
  },
  {
    key: "code_group",
    title: t("columns.code.codeGroup"),
    width: "120px",
    sortable: true,
    hidden: true,
  },
  {
    key: "code_key",
    title: t("columns.code.code"),
    width: "100px",
    sortable: true,
  },
  {
    key: "code_value",
    title: t("columns.code.codeNameKorean"),
    width: "150px",
    sortable: true,
  },
  {
    key: "code_value_en",
    title: t("columns.code.codeNameEnglish"),
    width: "150px",
    sortable: true,
  },
  // {
  //   key: "code_order",
  //   title: t("columns.code.orderMovement"),
  //   width: "100px",
  //   sortable: true,
  // },
  // {
  //   key: "code_level",
  //   title: t("columns.code.code_level"),
  //   width: "100px",
  //   sortable: true,
  // },
  {
    key: "is_active",
    title: t("columns.code.usageStatus"),
    width: "100px",
    sortable: true,
    formatter: (value: boolean) => (value ? "사용" : "미사용"),
  },
  {
    key: "is_leaf",
    title: t("columns.code.isLeaf"),
    width: "100px",
    sortable: true,
    formatter: (value: boolean) => (value ? "Y" : "N"),
  },
  {
    key: "is_admin_only",
    title: t("columns.code.isAdminOnly"),
    width: "100px",
    sortable: true,
    formatter: (value: boolean | undefined | null) =>
      value === true ? "Y" : "N",
  },
  {
    key: "description",
    title: t("columns.code.codeDescription"),
    width: "150px",
    sortable: true,
  },
];

// 검색조건은 store에서 가져옴

// Store 함수들 사용
const { loadCodeGroups, loadCategories1, loadCategories2, loadCategories3 } =
  codeStore;

// 모든 selectbox 데이터를 refresh하는 공용 함수
const refreshAllSelectBoxes = async () => {
  // 코드그룹 selectbox refresh
  await loadCodeGroups();

  // 현재 선택된 값들에 따라 하위 카테고리들도 refresh
  if (searchCodeGroupInput.value) {
    await loadCategories1(searchCodeGroupInput.value);
  }
  if (searchCategory1Input.value) {
    await loadCategories2(searchCategory1Input.value);
  }
  if (searchCategory2Input.value) {
    await loadCategories3(searchCategory2Input.value);
  }

  // 메인 데이터 refresh
  await loadData();
};

// 드롭다운 변경 이벤트 핸들러들
const handleCodeGroupChange = async () => {
  // 하위 카테고리들 초기화
  searchCategory1Input.value = "";
  searchCategory2Input.value = "";
  searchCategory3Input.value = "";
  uniqueCategories1.value = [];
  uniqueCategories2.value = [];
  uniqueCategories3.value = [];

  if (searchCodeGroupInput.value) {
    await loadCategories1(searchCodeGroupInput.value);
  }
};

const handleCategory1Change = async () => {
  // 하위 카테고리들 초기화
  searchCategory2Input.value = "";
  searchCategory3Input.value = "";
  uniqueCategories2.value = [];
  uniqueCategories3.value = [];

  if (searchCategory1Input.value) {
    await loadCategories2(searchCategory1Input.value);
  }
};

const handleCategory2Change = async () => {
  // 하위 카테고리 초기화
  searchCategory3Input.value = "";
  uniqueCategories3.value = [];

  if (searchCategory2Input.value) {
    await loadCategories3(searchCategory2Input.value);
  }
};

// 기존 computed 속성들은 제거하고 ref로 변경됨

// 데이터 로드 함수
const loadData = async () => {
  // 체크된 row 모두 해제
  selectedItems.value = [];

  const queryParams: CodeQueryParams = {};

  // 검색 조건 설정
  console.log("searchCodeGroup.value :", searchCodeGroup.value);
  console.log("searchCategory1.value :", searchCategory1.value);
  console.log("searchCategory2.value :", searchCategory2.value);
  console.log("searchCategory3.value :", searchCategory3.value);

  if (searchCodeGroup.value && searchCategory1.value && searchCategory2.value) {
    queryParams.search_field = "parent_key";
    queryParams.search_value = searchCategory2.value;
  } else if (searchCodeGroup.value && searchCategory1.value) {
    // searchCodeGroup과 searchCategory1 모두 있으면 searchCategory1로 검색
    queryParams.search_field = "parent_key";
    queryParams.search_value = searchCategory1.value;
  } else if (searchCodeGroup.value) {
    // searchCodeGroup만 있으면 searchCodeGroup으로 검색
    queryParams.search_field = "parent_key";
    queryParams.search_value = searchCodeGroup.value;
  } else {
    // 둘 다 없으면 기본값
    queryParams.search_field = "parent_key";
    queryParams.search_value = "";
  }

  // 페이지네이션 설정 (서버 페이징)
  queryParams.page = currentPage.value;
  queryParams.page_size = pageSize.value;

  // 정렬 설정
  queryParams.order_by = "code_order";
  queryParams.order_direction = "asc";

  console.log("queryParams :", queryParams);

  try {
    await codeStore.loadCodeList(queryParams);

    // 총 페이지 수 계산
    totalPages.value = Math.ceil(totalCount.value / pageSize.value);

    console.log("totalCount.value :", totalCount.value);
    console.log("totalPages.value :", totalPages.value);
  } catch (error: unknown) {
    console.error("데이터 로드 실패:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.dataLoadFailed"
    );
    alert(errorMessage);
  }
};

// 서버 페이징: API가 내려준 totalCount를 하단 카운터로 사용
// totalCount는 API 응답의 result.response.total로 설정됨

const handleSelectionChange = (selected: CodeItem[]) => {
  selectedItems.value = selected;
  console.log("selectedItems.value :", selectedItems.value);
};

// 페이지 변경 핸들러
const handlePageChange = async (page: number) => {
  // 페이지 범위 검증
  if (page < 1) page = 1;
  if (page > totalPages.value) page = totalPages.value;

  currentPage.value = page;
  selectedItems.value = [];
  await loadData();
};

// 정렬 변경 핸들러
const handleSortChange = (sortInfo: {
  key: string | null;
  direction: "asc" | "desc" | null;
}) => {
  sortColumn.value = sortInfo.key ?? null;
  sortOrder.value = sortInfo.direction ?? null;
};

// 행 클릭 핸들러
const handleRowClick = (item: CodeItem) => {
  // 단일 선택: 클릭 시 해당 항목만 선택/해제
  const isSelected =
    selectedItems.value.length === 1 &&
    selectedItems.value[0].code_id === item.code_id;
  selectedItems.value = isSelected ? [] : [item];
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  await loadCodeGroups(); // 코드 그룹 데이터 먼저 로드
  await loadData(); // 메인 데이터 로드
});

// 검색 기능 구현
const handleSearch = () => {
  selectedItems.value = [];
  currentPage.value = 1;
  searchCodeGroup.value = searchCodeGroupInput.value;
  searchCategory1.value = searchCategory1Input.value;
  searchCategory2.value = searchCategory2Input.value;
  searchCategory3.value = searchCategory3Input.value;
  loadData(); // 검색 후 데이터 다시 로드
};

// 모달 저장 핸들러
const handleModalSave = async (data: CodeCreateRequest[]) => {
  try {
    console.log("모달에서 저장된 데이터:", data);
    console.log("등록 요청 데이터:", data);

    const response = await codeStore.createMultipleCodes(data);
    console.log("다건등록 응답:", response);

    // 여기서 데이터를 메인 테이블에 추가하거나 처리
    alert(t("messages.success.codeRegistered"));
    isRegistModalOpen.value = false;
    isEditMode.value = false;

    // 모든 selectbox 데이터 refresh
    await refreshAllSelectBoxes();
  } catch (error: unknown) {
    console.error("코드 저장 실패:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.saveFailed"
    );
    alert(errorMessage);
  }
};

// 단건 등록 버튼 핸들러
const handleSingleRegist = () => {
  // 모듈화된 함수를 사용하여 선택된 카테고리들 찾기
  const {
    selectedGroup,
    selectedCategory1,
    selectedCategory2,
    selectedCategory3,
  } = findSelectedCategories();

  console.log("handleSingleRegist - 선택된 카테고리들:", {
    selectedGroup,
    selectedCategory1,
    selectedCategory2,
    selectedCategory3,
  });

  // 모달에 전달할 props 값들을 설정 (key와 value 모두 전달)
  modalCodeGroup.value = selectedGroup
    ? { key: selectedGroup.key, value: selectedGroup.value }
    : { key: "", value: "" };
  modalCategory1.value = selectedCategory1
    ? { key: selectedCategory1.key, value: selectedCategory1.value }
    : { key: "", value: "" };
  modalCategory2.value = selectedCategory2
    ? { key: selectedCategory2.key, value: selectedCategory2.value }
    : { key: "", value: "" };
  modalCategory3.value = selectedCategory3
    ? { key: selectedCategory3.key, value: selectedCategory3.value }
    : { key: "", value: "" };

  isRegistModalOpen.value = true;
  isEditMode.value = false;
  isMultiRegister.value = false;

  // 모듈화된 함수를 사용하여 code_level과 parent_key 자동 설정
  const { codeLevel, parentKey } = getAutoCodeLevel(
    selectedGroup || null,
    selectedCategory1 || null,
    selectedCategory2 || null,
    selectedCategory3 || null
  );

  console.log("handleSingleRegist - 자동 설정된 code_level:", codeLevel);
  console.log("handleSingleRegist - 자동 설정된 parent_key:", parentKey);

  newCode.value = {
    code_id: "",
    code_group: selectedGroup ? selectedGroup.key : "",
    code_key: "",
    code_value: "",
    code_value_en: "",
    code_order: "1",
    is_active: true,
    is_leaf: false,
    parent_key: parentKey,
    code_level: codeLevel,
    description: "",
    is_admin_only: false,
  };

  console.log("단건 등록 모드 - 선택된 데이터:", {
    codeGroup: modalCodeGroup,
    category1: modalCategory1,
    category2: modalCategory2,
    category3: modalCategory3,
  });
};

// 다건 등록 버튼 핸들러
const handleMultiRegist = () => {
  // 코드그룹이 선택되지 않았으면 경고
  if (!searchCodeGroupInput.value) {
    alert("다건등록을 위해서는 코드그룹을 먼저 선택해주세요.");
    return;
  }

  // 모듈화된 함수를 사용하여 선택된 카테고리들 찾기
  const {
    selectedGroup,
    selectedCategory1,
    selectedCategory2,
    selectedCategory3,
  } = findSelectedCategories();

  console.log("handleMultiRegist - 선택된 카테고리들:", {
    selectedGroup,
    selectedCategory1,
    selectedCategory2,
    selectedCategory3,
  });

  // 선택된 코드그룹 정보 확인
  if (!selectedGroup) {
    alert("선택된 코드그룹 정보를 찾을 수 없습니다.");
    return;
  }

  // 모듈화된 함수를 사용하여 code_level과 parent_key 자동 설정
  const { codeLevel, parentKey } = getAutoCodeLevel(
    selectedGroup || null,
    selectedCategory1 || null,
    selectedCategory2 || null,
    selectedCategory3 || null
  );

  console.log("handleMultiRegist - 자동 설정된 code_level:", codeLevel);
  console.log("handleMultiRegist - 자동 설정된 parent_key:", parentKey);

  // 모달에 전달할 props 값들을 설정 (key와 value 모두 전달)
  // modalCodeGroup에는 마지막 선택된 분류를 세팅
  modalCodeGroup.value = selectedGroup
    ? { key: selectedGroup.key, value: selectedGroup.value }
    : { key: "", value: "" };
  modalCategory1.value = selectedCategory1
    ? { key: selectedCategory1.key, value: selectedCategory1.value }
    : { key: "", value: "" };
  modalCategory2.value = selectedCategory2
    ? { key: selectedCategory2.key, value: selectedCategory2.value }
    : { key: "", value: "" };
  modalCategory3.value = selectedCategory3
    ? { key: selectedCategory3.key, value: selectedCategory3.value }
    : { key: "", value: "" };
  modalCodeLevel.value = codeLevel;
  modalParentKey.value = parentKey;

  isRegistModalOpen.value = true;
  isEditMode.value = false;
  isMultiRegister.value = true;
};

// 사용자 저장
const updateCode = async () => {
  if (
    !newCode.value.code_group ||
    !newCode.value.code_key ||
    !newCode.value.code_value
  ) {
    alert(t("messages.warning.pleaseCompleteAllFields"));
    return;
  }

  try {
    if (isEditMode.value) {
      // 수정 모드: API 호출하여 서버에서 업데이트
      const requestData: CodeUpdateRequest = {
        code_value: newCode.value.code_value,
        code_value_en: newCode.value.code_value_en,
        code_order: newCode.value.code_order,
        is_active: newCode.value.is_active,
        is_leaf: newCode.value.is_leaf,
        description: newCode.value.description,
        is_admin_only: newCode.value.is_admin_only ?? false,
      };

      console.log("수정 요청 데이터:", requestData);

      const response = await codeStore.updateCode(
        newCode.value.code_id,
        requestData
      );
      console.log("수정 응답:", response);

      // 성공 시 로컬 데이터도 업데이트
      codeStore.updateLocalCode(newCode.value.code_id, newCode.value);

      alert(t("messages.success.codeInfoUpdated"));
    } else {
      // 등록 모드: 새 코드 추가
      const requestData: CodeCreateRequest = {
        code_group: newCode.value.code_group,
        code_key: newCode.value.code_key,
        code_value: newCode.value.code_value,
        code_value_en: newCode.value.code_value_en,
        code_order: newCode.value.code_order,
        is_active: newCode.value.is_active,
        is_leaf: newCode.value.is_leaf,
        parent_key: newCode.value.parent_key,
        code_level: newCode.value.code_level,
        description: newCode.value.description,
        is_admin_only: newCode.value.is_admin_only ?? false,
      };

      console.log("등록 요청 데이터:", requestData);

      const response = await codeStore.createCode(requestData);
      console.log("등록 응답:", response);

      // 성공 시 로컬 데이터에 추가
      if (response && response.response && response.response.code_id) {
        codeStore.addLocalCode({
          ...newCode.value,
          code_id: response.response.code_id,
        });
      }

      alert(t("messages.success.codeRegistered"));
    }

    // 성공 시 모달 닫기 및 초기화
    isRegistModalOpen.value = false;
    newCode.value = {
      code_id: "",
      code_group: "",
      code_key: "",
      code_value: "",
      code_value_en: "",
      code_order: "1",
      is_active: true,
      is_leaf: false,
      parent_key: "",
      code_level: "",
      description: "",
      is_admin_only: false,
    };
    isEditMode.value = false;

    // 모든 selectbox 데이터 refresh
    await refreshAllSelectBoxes();

    console.log("등록 성공 - 모든 selectbox 데이터 refresh 완료");
  } catch (error: unknown) {
    console.error("코드 저장 실패:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.saveFailed"
    );
    alert(errorMessage);
  }
};

// 선택된 항목 삭제
const handleDelete = async () => {
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  const deleteCount = selectedItems.value.length;
  const confirmMessage =
    deleteCount === 1
      ? t("messages.confirm.deleteItem")
      : `${deleteCount}개의 항목을 삭제하시겠습니까?`;

  if (confirm(confirmMessage)) {
    console.log("삭제할 항목:", selectedItems.value);

    try {
      let successCount = 0;
      let failCount = 0;

      // 선택된 모든 항목을 반복문으로 삭제
      for (const item of selectedItems.value) {
        try {
          const response = await codeStore.deleteCode(item.code_id);
          console.log(`삭제 성공 (${item.code_id}):`, response);

          // 성공 시 로컬 데이터에서 제거
          codeStore.removeLocalCode(item.code_id);
          successCount++;
        } catch (error) {
          console.error(`삭제 실패 (${item.code_id}):`, error);
          failCount++;
        }
      }

      selectedItems.value = [];

      // 결과 메시지
      if (failCount === 0) {
        alert(t("messages.success.deleted"));
      } else if (successCount === 0) {
        alert(t("messages.error.deleteFailed"));
      } else {
        alert(`${successCount}개 삭제 성공, ${failCount}개 삭제 실패`);
      }

      // 모든 selectbox 데이터 refresh
      await refreshAllSelectBoxes();

      console.log("삭제 완료 - 모든 selectbox 데이터 refresh 완료");
    } catch (error: unknown) {
      console.error("삭제 처리 실패:", error);
      const errorMessage = translateMessage(
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : undefined,
        "messages.error.deleteFailed"
      );
      alert(errorMessage);
    }
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
  newCode.value = {
    ...itemToEdit,
    is_active: itemToEdit.is_active, // boolean 값 그대로 사용
    is_admin_only: itemToEdit.is_admin_only ?? false, // boolean 값 그대로 사용
  };

  console.log("수정 모드 - 선택된 항목:", itemToEdit);
  console.log("수정 모드 - newCode.is_active:", newCode.value.is_active);
};
</script>

<style scoped lang="scss">
.code-management {
  padding: 20px;
  display: flex;
  flex-direction: column;
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

.action-buttons {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  justify-content: flex-end;
  flex-shrink: 0;
}

.table-wrapper {
  flex: 1;
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
