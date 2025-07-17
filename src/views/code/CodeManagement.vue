<template>
  <div class="code-management">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="role" class="label-search">{{
            t("common.search")
          }}</label>
          <label for="codeGroup" class="label-title">{{
            t("columns.code.codeGroup")
          }}</label>
          <div class="form-item">
            <select id="codeGroup" v-model="searchCodeGroupInput">
              <option value="">{{ t("common.selectItem") }}</option>
              <option
                v-for="group in uniqueCodeGroups"
                :key="group"
                :value="group"
              >
                {{ group }}
              </option>
            </select>
          </div>
          <label for="highCode" class="label-title">{{
            t("columns.code.highCode")
          }}</label>
          <div class="form-item">
            <select id="highCode" v-model="searchHighCodeInput">
              <option value="">{{ t("common.selectItem") }}</option>
              <option v-for="high in uniqueHighCodes" :key="high" :value="high">
                {{ high }}
              </option>
            </select>
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
    <!-- 등록 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>
            {{ isEditMode ? t("common.editCode") : t("common.registerCode") }}
          </h3>
          <button class="btn-close" @click="isRegistModalOpen = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt>{{ t("columns.code.codeGroup") }}</dt>
            <dd>
              <input
                id="code-name"
                v-model="newCode.codeGroup"
                type="text"
                :placeholder="t('placeholder.codeGroup')"
                :disabled="isEditMode"
              />
            </dd>
            <dt>{{ t("columns.code.highCode") }}</dt>
            <dd>
              <input
                id="code-name"
                v-model="newCode.highCode"
                type="text"
                :placeholder="t('placeholder.codeHighCode')"
                :disabled="isEditMode"
              />
            </dd>
            <dt>{{ t("columns.code.codeName") }}</dt>
            <dd>
              <input
                id="code-corp"
                v-model="newCode.codeName"
                type="text"
                :placeholder="t('placeholder.codeCodeName')"
              />
            </dd>
            <dt>{{ t("columns.code.order") }}</dt>
            <dd>
              <input
                id="code-phone"
                v-model="newCode.rank"
                type="text"
                :placeholder="t('placeholder.codeOrder')"
              />
            </dd>
            <dt>{{ t("columns.code.description") }}</dt>
            <dd>
              <input
                id="code-email"
                v-model="newCode.etc"
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
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface CodeItem {
  id: string;
  codeGroup: string;
  highCode: string;
  codeName: string;
  rank: string;
  etc: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  //{ key: "id", title: "ID", width: "60px", sortable: true },
  {
    key: "codeGroup",
    title: t("columns.code.codeGroup"),
    width: "100px",
    sortable: true,
  },
  {
    key: "highCode",
    title: t("columns.code.highCode"),
    width: "100px",
    sortable: true,
  },
  {
    key: "codeName",
    title: t("columns.code.codeName"),
    width: "150px",
    sortable: true,
  },
  {
    key: "rank",
    title: t("columns.code.order"),
    width: "100px",
    sortable: true,
  },
  {
    key: "etc",
    title: t("columns.code.description"),
    width: "200px",
    sortable: true,
  },
];

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
const searchCodeGroup = ref("");
const searchHighCode = ref("");
const selectedItems = ref<CodeItem[]>([]);
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newCode = ref<CodeItem>({
  id: "",
  codeGroup: "",
  highCode: "",
  codeName: "",
  rank: "",
  etc: "",
});

// --- computed로 페이징 및 필터 처리 ---
const filteredCodeList = computed(() => {
  return codeList.value.filter((code) => {
    const matchGroup =
      !searchCodeGroup.value || code.codeGroup === searchCodeGroup.value;
    const matchHigh =
      !searchHighCode.value || code.highCode === searchHighCode.value;
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

// 코드그룹, 상위코드명 option용 computed
const uniqueCodeGroups = computed(() => {
  const set = new Set(codeList.value.map((item) => item.codeGroup));
  return Array.from(set);
});
const uniqueHighCodes = computed(() => {
  const set = new Set(codeList.value.map((item) => item.highCode));
  return Array.from(set);
});

// 데이터 로드 함수
const loadData = async () => {
  loading.value = true;
  try {
    codeList.value = [
      {
        id: "1",
        codeGroup: "그룹A",
        highCode: "상위1",
        codeName: "코드A-1",
        rank: "1",
        etc: "비고1",
      },
      {
        id: "2",
        codeGroup: "그룹A",
        highCode: "상위1",
        codeName: "코드A-2",
        rank: "2",
        etc: "비고2",
      },
      {
        id: "3",
        codeGroup: "그룹B",
        highCode: "상위2",
        codeName: "코드B-1",
        rank: "1",
        etc: "비고3",
      },
      {
        id: "4",
        codeGroup: "그룹B",
        highCode: "상위2",
        codeName: "코드B-2",
        rank: "2",
        etc: "비고4",
      },
      {
        id: "5",
        codeGroup: "그룹C",
        highCode: "상위3",
        codeName: "코드C-1",
        rank: "1",
        etc: "비고5",
      },
      {
        id: "6",
        codeGroup: "그룹C",
        highCode: "상위3",
        codeName: "코드C-2",
        rank: "2",
        etc: "비고6",
      },
      {
        id: "7",
        codeGroup: "그룹D",
        highCode: "상위4",
        codeName: "코드D-1",
        rank: "1",
        etc: "비고7",
      },
      {
        id: "8",
        codeGroup: "그룹D",
        highCode: "상위4",
        codeName: "코드D-2",
        rank: "2",
        etc: "비고8",
      },
      {
        id: "9",
        codeGroup: "그룹E",
        highCode: "상위5",
        codeName: "코드E-1",
        rank: "1",
        etc: "비고9",
      },
      {
        id: "10",
        codeGroup: "그룹E",
        highCode: "상위5",
        codeName: "코드E-2",
        rank: "2",
        etc: "비고10",
      },
      {
        id: "11",
        codeGroup: "그룹F",
        highCode: "상위6",
        codeName: "코드F-1",
        rank: "1",
        etc: "비고11",
      },
      {
        id: "12",
        codeGroup: "그룹F",
        highCode: "상위6",
        codeName: "코드F-2",
        rank: "2",
        etc: "비고12",
      },
    ];
    totalCount.value = codeList.value.length;
    totalPages.value = Math.ceil(totalCount.value / pageSize.value);
  } catch (error) {
    console.error("데이터 로드 실패:", error);
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

// 등록 버튼 핸들러
const handleRegist = () => {
  isRegistModalOpen.value = true;
  isEditMode.value = false;
  newCode.value = {
    id: "",
    codeGroup: "",
    highCode: "",
    codeName: "",
    rank: "",
    etc: "",
  };
};

// 사용자 저장
const saveCode = () => {
  if (
    !newCode.value.codeGroup ||
    !newCode.value.highCode ||
    !newCode.value.codeName ||
    !newCode.value.rank ||
    !newCode.value.etc
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
    codeGroup: "",
    highCode: "",
    codeName: "",
    rank: "",
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
  padding: $spacing-lg;
}
</style>
