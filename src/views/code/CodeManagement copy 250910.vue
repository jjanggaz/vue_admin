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
            @change="handleCodeGroupChange"
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
            @change="handleCategory1Change"
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
            @change="handleCategory2Change"
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

        <DataTable
          :columns="tableColumns"
          :data="codeList"
          :loading="loading"
          :selectable="true"
          :selection-mode="'single'"
          :show-select-all="false"
          row-key="code_id"
          :select-header-text="t('common.selectColumn')"
          :selected-items="selectedItems"
          @selection-change="handleSelectionChange"
          @sort-change="handleSortChange"
          @row-click="handleRowClick"
        />

        <!-- Pagination -->
        <div class="pagination-container">
          <Pagination
            :current-page="currentPage"
            :total-count="totalCount"
            :page-size="pageSize"
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
              />
              <input
                id="code-high-code"
                v-model="newCode.parent_key"
                type="text"
                :placeholder="t('placeholder.codeHighCode')"
                :disabled="true"
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
            <dt>{{ t("columns.code.code_level") }}</dt>
            <dd>
              <input
                id="code-level"
                v-model="newCode.code_level"
                type="text"
                :placeholder="t('placeholder.codeLevel')"
              />
            </dd>
            <dt>{{ t("columns.code.usageStatus") }}</dt>
            <dd>
              <select v-model="newCode.is_active" class="filter-select">
                <option :value="true">사용</option>
                <option :value="false">미사용</option>
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
                type="text"
                :disabled="isEditMode"
              />
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
            <dt>{{ t("columns.code.usageStatus") }}</dt>
            <dd>
              <select v-model="newCode.is_active" class="filter-select">
                <option :value="true">사용</option>
                <option :value="false">미사용</option>
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
import { ref, onMounted, computed } from "vue";
import { request } from "../../utils/request";
import { useI18n } from "vue-i18n";
import CodeRegistrationModal from "./components/CodeRegistrationModal.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "./Pagination.vue";
import { resolveTotalPages, clampPage } from "./Pagination";

const SYSTEM_CODE = import.meta.env.VITE_SYSTEM_CODE;
console.log("SYSTEM_CODE :", SYSTEM_CODE);

const { t } = useI18n();

interface CodeItem {
  code_id: string;
  code_group: string;
  code_key: string;
  code_value: string;
  code_value_en: string;
  parent_key: string;
  code_level: string;
  code_order: string;
  is_active: boolean;
  description: string;
}

// interface QueryParams {
//   search_field?: string;
//   search_value?: string;
//   page?: number;
//   page_size?: number;
//   order_by?: string;
//   order_direction?: "asc" | "desc";
// }

const codeList = ref<CodeItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = ref(20);
const totalCount = ref(0);
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
  selectedGroup: any,
  selectedCategory1: any,
  selectedCategory2: any,
  selectedCategory3: any
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
  parent_key: "",
  code_level: "",
  description: "",
});

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
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
  {
    key: "code_order",
    title: t("columns.code.orderMovement"),
    width: "100px",
    sortable: true,
  },
  {
    key: "code_level",
    title: t("columns.code.code_level"),
    width: "100px",
    sortable: true,
  },
  {
    key: "is_active",
    title: t("columns.code.usageStatus"),
    width: "100px",
    sortable: true,
    formatter: (value: boolean) => (value ? "사용" : "미사용"),
  },
  {
    key: "description",
    title: t("columns.code.codeDescription"),
    width: "150px",
    sortable: true,
  },
];

// 검색조건 (1.코드그룹, 2, 대분류, 3.중분류, 4. 소분류)
const uniqueCodeGroups = ref<{ key: string; value: string }[]>([]);
const uniqueCategories1 = ref<{ key: string; value: string }[]>([]);
const uniqueCategories2 = ref<{ key: string; value: string }[]>([]);
const uniqueCategories3 = ref<{ key: string; value: string }[]>([]);

// 공용 함수: parent_key를 받아서 해당하는 카테고리 데이터를 로드
const loadCategoryData = async (
  parentKey: string,
  targetRef: any,
  categoryName: string
) => {
  try {
    const queryParams: Record<string, any> = {};

    if (parentKey) {
      // parent_key가 있으면 해당 값으로 검색
      queryParams.search_field = "parent_key";
      queryParams.search_value = parentKey;
    } else {
      // parent_key가 없으면 코드 그룹 조회 (최상위 레벨)
      queryParams.search_field = "parent_key";
      queryParams.search_value = "";
    }

    queryParams.page = 1;
    queryParams.page_size = 100; // 충분한 데이터를 가져오기 위해 큰 값 설정
    queryParams.order_by = "code_order";
    queryParams.order_direction = "asc";

    console.log(`${categoryName} 조회 파라미터:`, queryParams);

    const result = await request("/api/code/list", undefined, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(queryParams),
    });

    console.log(`${categoryName} 조회 결과:`, result);

    // API 응답에서 데이터 추출하여 code_key와 code_value로 매핑
    let items: any[] = [];
    if (result.response && Array.isArray(result.response.items)) {
      items = result.response.items;
    } else if (result.response && Array.isArray(result.response.data)) {
      items = result.response.data;
    } else if (Array.isArray(result.response)) {
      items = result.response;
    } else if (Array.isArray(result)) {
      items = result;
    }

    // 중복 제거 및 매핑
    const uniqueItems = items.reduce((acc: any[], item: any) => {
      const existing = acc.find(
        (existingItem) => existingItem.key === item.code_key
      );
      if (!existing) {
        acc.push({
          key: item.code_key,
          value: item.code_value,
        });
      }
      return acc;
    }, []);

    targetRef.value = uniqueItems;
    console.log(`매핑된 ${categoryName}:`, uniqueItems);
  } catch (error: any) {
    console.error(`${categoryName} 로드 실패:`, error);
    const errorMessage =
      error?.message || `${categoryName} 로드에 실패했습니다.`;
    console.error(errorMessage);
    targetRef.value = [];
  }
};

// 코드 그룹 로드 (parent_key 없음)
const loadCodeGroups = async () => {
  await loadCategoryData("", uniqueCodeGroups, "코드 그룹");
};

// 대분류 로드 (선택된 코드 그룹의 code_key를 parent_key로 사용)
const loadCategories1 = async (codeGroupKey: string) => {
  await loadCategoryData(codeGroupKey, uniqueCategories1, "대분류");
};

// 중분류 로드 (선택된 대분류의 code_key를 parent_key로 사용)
const loadCategories2 = async (category1Key: string) => {
  await loadCategoryData(category1Key, uniqueCategories2, "중분류");
};

// 소분류 로드 (선택된 중분류의 code_key를 parent_key로 사용)
const loadCategories3 = async (category2Key: string) => {
  await loadCategoryData(category2Key, uniqueCategories3, "소분류");
};

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
  //"detail": "지원하지 않는 검색 필드입니다. 지원 필드: ['code_id', 'code_group', 'code_key', 'code_value', 'code_value_en', 'parent_key', 'description', 'created_at']"

  const queryParams: Record<string, any> = {};

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
  console.log("queryParams :", queryParams);

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
  console.log("코드 목록 조회 성공:", result.response.items);
  //if (response.response && response.response.items) {

  loading.value = true;
  try {
    codeList.value = result.response.items || result;

    totalCount.value = result.response.total;
    totalPages.value = resolveTotalPages(totalCount.value, pageSize.value);

    console.log("totalCount.value :", totalCount.value);
    console.log("totalPages.value :", totalPages.value);

    // this.page = result.response.page;
    // this.page_size = result.response.page_size;

    // this.hasMore = result.response.page < result.response.total_pages;

    // totalCount.value = result.response.total;
  } catch (error: any) {
    console.error("데이터 로드 실패:", error);
    const errorMessage = error?.message || "데이터 로드에 실패했습니다.";
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

// --- computed로 페이징 및 필터 처리 ---
const filteredCodeList = computed(() => {
  return codeList.value.filter((code) => {
    const matchGroup =
      !searchCodeGroup.value || code.code_group === searchCodeGroup.value;
    const matchCategory1 =
      !searchCategory1.value || code.parent_key === searchCategory1.value;
    return matchGroup && matchCategory1;
  });
});

// 서버 페이징: API가 내려준 totalCount를 하단 카운터로 사용
// totalCount는 API 응답의 result.response.total로 설정됨

// 서버 페이징: 현재 페이지에 해당하는 데이터만 API에서 내려옴
const paginatedcodeList = computed(() => filteredCodeList.value);

const handleSelectionChange = (selected: CodeItem[]) => {
  // 단일 선택 보장
  selectedItems.value = selected.slice(0, 1);
  console.log("selectedItems.value :", selectedItems.value);
};

// 페이지 변경 핸들러
const handlePageChange = async (page: number) => {
  currentPage.value = clampPage(page, totalPages.value);
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
const handleModalSave = async (data: any[]) => {
  try {
    // const requestData = {
    //   code_group: newCode.value.code_group,
    //   code_key: newCode.value.code_key,
    //   code_value: newCode.value.code_value,
    //   code_value_en: newCode.value.code_value_en,
    //   code_order: newCode.value.code_order,
    //   is_active: newCode.value.is_active,
    //   parent_key: newCode.value.parent_key,
    //   code_level: newCode.value.code_level,
    //   description: newCode.value.description,
    // };
    console.log("모달에서 저장된 데이터:", data);
    console.log("data :", data);
    console.log("data :", JSON.stringify(data));

    console.log("등록 요청 데이터:", data);

    const response = await request("/api/code/multiCreate", undefined, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("다건등록 응답:", response);

    // 여기서 데이터를 메인 테이블에 추가하거나 처리
    alert(t("messages.success.codeRegistered"));
    isRegistModalOpen.value = false;
    isEditMode.value = false;

    // 모든 selectbox 데이터 refresh
    await refreshAllSelectBoxes();
  } catch (error: any) {
    console.error("코드 저장 실패:", error);
    const errorMessage = error?.message || t("messages.error.saveFailed");
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
    selectedGroup,
    selectedCategory1,
    selectedCategory2,
    selectedCategory3
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
    parent_key: parentKey,
    code_level: codeLevel,
    description: "",
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
    selectedGroup,
    selectedCategory1,
    selectedCategory2,
    selectedCategory3
  );

  console.log("handleMultiRegist - 자동 설정된 code_level:", codeLevel);
  console.log("handleMultiRegist - 자동 설정된 parent_key:", parentKey);

  // 모달에 전달할 props 값들을 설정 (key와 value 모두 전달)
  modalCodeGroup.value = { key: selectedGroup.key, value: selectedGroup.value };
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

  console.log("다건 등록 모드 - 선택된 데이터:", {
    codeGroup: modalCodeGroup,
    category1: modalCategory1,
    category2: modalCategory2,
    category3: modalCategory3,
  });
  console.log("모달에 전달될 props:", {
    selectedCodeGroup: modalCodeGroup,
    selectedCategory1: modalCategory1,
    selectedCategory2: modalCategory2,
    selectedCategory3: modalCategory3,
    selectedCodeLevel: modalCodeLevel,
    selectedParentKey: modalParentKey,
  });
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
      const requestData = {
        code_value: newCode.value.code_value,
        code_value_en: newCode.value.code_value_en,
        is_active: newCode.value.is_active,
        description: newCode.value.description,
      };

      console.log("수정 요청 데이터:", requestData);

      const response = await request(
        `/api/code/update/${newCode.value.code_id}`,
        undefined,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log("수정 응답:", response);

      // 성공 시 로컬 데이터도 업데이트
      const idx = codeList.value.findIndex(
        (u) => u.code_id === newCode.value.code_id
      );
      if (idx !== -1) {
        codeList.value[idx] = { ...newCode.value };
      }

      alert(t("messages.success.codeInfoUpdated"));
    } else {
      // 등록 모드: 새 코드 추가
      const requestData = {
        code_group: newCode.value.code_group,
        code_key: newCode.value.code_key,
        code_value: newCode.value.code_value,
        code_value_en: newCode.value.code_value_en,
        code_order: newCode.value.code_order,
        is_active: newCode.value.is_active,
        parent_key: newCode.value.parent_key,
        code_level: newCode.value.code_level,
        description: newCode.value.description,
      };

      console.log("등록 요청 데이터:", requestData);

      const response = await request("/api/code/create", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("등록 응답:", response);

      // 성공 시 로컬 데이터에 추가
      if (response && response.response && response.response.code_id) {
        codeList.value.push({
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
      parent_key: "",
      code_level: "",
      description: "",
    };
    isEditMode.value = false;

    // 모든 selectbox 데이터 refresh
    await refreshAllSelectBoxes();

    console.log("등록 성공 - 모든 selectbox 데이터 refresh 완료");
  } catch (error: any) {
    console.error("코드 저장 실패:", error);
    const errorMessage = error?.message || t("messages.error.saveFailed");
    alert(errorMessage);
  }
};

// 선택된 항목 삭제
const handleDelete = async () => {
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }
  if (confirm(t("messages.confirm.deleteItem"))) {
    console.log("삭제할 항목:", selectedItems.value);

    try {
      const code_id = selectedItems.value[0].code_id;

      const response = await request(`/api/code/delete/${code_id}`, undefined, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("삭제 응답:", response);

      selectedItems.value = [];
      alert(t("messages.success.deleted"));

      // 모든 selectbox 데이터 refresh
      await refreshAllSelectBoxes();

      console.log("삭제 성공 - 모든 selectbox 데이터 refresh 완료");

      selectedItems.value = []; // 선택 항목 초기화(또는 최신 객체로 재할당)
    } catch (error: any) {
      console.error("삭제 실패:", error);
      const errorMessage = error?.message || t("messages.error.deleteFailed");
      alert(errorMessage);
    }

    // const selectedIds = selectedItems.value.map((item) => item.code_id);
    // codeList.value = codeList.value.filter(
    //   (item) => !selectedIds.includes(item.code_id)
    // );
    // selectedItems.value = [];
    // alert(t("messages.success.deleted"));
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
  };

  console.log("수정 모드 - 선택된 항목:", itemToEdit);
  console.log("수정 모드 - newCode.is_active:", newCode.value.is_active);
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
