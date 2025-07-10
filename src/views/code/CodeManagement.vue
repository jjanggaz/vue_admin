<template>
  <div class="code-management">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="role" class="label-search">검색</label>
          <label for="codeGroup" class="label-title">코드그룹</label>
          <div class="form-item">
            <select id="codeGroup" v-model="searchCodeGroupInput">
              <option value="">항목을 선택해주세요</option>
              <option
                v-for="group in uniqueCodeGroups"
                :key="group"
                :value="group"
              >
                {{ group }}
              </option>
            </select>
          </div>
          <label for="highCode" class="label-title">상위코드명</label>
          <div class="form-item">
            <select id="highCode" v-model="searchHighCodeInput">
              <option value="">항목을 선택해주세요</option>
              <option v-for="high in uniqueHighCodes" :key="high" :value="high">
                {{ high }}
              </option>
            </select>
          </div>
          <button class="btn-search" @click="handleSearch">검색</button>
        </div>
      </div>
      <div class="btns">
        <button
          class="btn btn-primary btn-delete"
          @click="handleDelete"
          :disabled="selectedItems.length === 0"
        >
          삭제
        </button>
        <button
          class="btn btn-primary btn-edit"
          @click="handleEdit"
          :disabled="selectedItems.length !== 1"
        >
          수정
        </button>
        <button class="btn btn-primary btn-regist" @click="handleRegist">
          등록
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
          <h3>{{ isEditMode ? "코드 수정" : "코드 등록" }}</h3>
          <button class="btn-close" @click="isRegistModalOpen = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt>코드그룹</dt>
            <dd>
              <input
                id="code-name"
                v-model="newCode.codeGroup"
                type="text"
                placeholder=" 입력하세요"
              />
            </dd>
            <dt>상위코드</dt>
            <dd>
              <input
                id="code-name"
                v-model="newCode.highCode"
                type="text"
                placeholder=" 입력하세요"
              />
            </dd>
            <dt>코드</dt>
            <dd>
              <input
                id="code-corp"
                v-model="newCode.codeName"
                type="text"
                placeholder=" 입력하세요"
              />
            </dd>
            <dt>코드명</dt>
            <dd>
              <input
                id="code-phone"
                v-model="newCode.rank"
                type="text"
                placeholder=" 입력하세요"
              />
            </dd>
            <dt>설명</dt>
            <dd>
              <input
                id="code-email"
                v-model="newCode.etc"
                type="text"
                placeholder="을 입력하세요"
              />
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isRegistModalOpen = false">
            취소
          </button>
          <button class="btn btn-primary" @click="saveCode">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";

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
  { key: "codeGroup", title: "코드그룹", width: "100px", sortable: true },
  { key: "highCode", title: "상위코드명", width: "100px", sortable: true },
  { key: "codeName", title: "코드명", width: "150px", sortable: true },
  { key: "rank", title: "순서", width: "100px", sortable: true },
  { key: "etc", title: "설명", width: "200px", sortable: true },
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
    alert("모든 필드를 입력 해주세요.");
    return;
  }

  if (isEditMode.value) {
    // 수정 모드: 기존 정보 업데이트
    const idx = codeList.value.findIndex((u) => u.id === newCode.value.id);
    if (idx !== -1) {
      codeList.value[idx] = { ...newCode.value };
      alert("코드 정보가 수정되었습니다.");
    }
  } else {
    // 등록 모드: 새 코드 추가
    const nextId = (codeList.value.length + 1).toString();
    codeList.value.push({
      ...newCode.value,
      id: nextId,
    });
    alert("코드가 등록되었습니다.");
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
    alert("삭제할 항목을 선택하세요.");
    return;
  }
  if (
    confirm(`선택된 ${selectedItems.value.length}개의 항목을 삭제하시겠습니까?`)
  ) {
    console.log("삭제할 항목:", selectedItems.value);
    const selectedIds = selectedItems.value.map((item) => item.id);
    codeList.value = codeList.value.filter(
      (item) => !selectedIds.includes(item.id)
    );
    selectedItems.value = [];
    alert("삭제되었습니다.");
  }
};

// 선택된 항목 수정
const handleEdit = () => {
  if (selectedItems.value.length !== 1) {
    alert("수정할 항목을 하나만 선택하세요.");
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

.pagination-container {
  margin-top: 1rem;
}
</style>
