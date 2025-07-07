<template>
  <div class="user-management">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="criteria">
        <div class="group-form">
          <label for="role" class="label-search">검색</label>
          <div class="form-item">
            <select id="role" v-model="searchOptionInput">
              <option value="">전체 조회</option>
              <option value="id">아이디</option>
              <option value="name">이름</option>
              <option value="corpName">업체</option>
              <option value="phone">전화번호</option>
              <option value="email">이메일</option>
              <option value="role">권한</option>
            </select>
          </div>
        </div>
        <div class="group-form">
          <div class="form-item">
            <input
              type="text"
              id="search"
              placeholder="검색어를 입력하세요."
              v-model="searchQueryInput"
            />
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
      :data="paginatedUserList"
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
          <h3>사용자 등록 및 수정</h3>
          <button class="btn-close" @click="isRegistModalOpen = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt>아이디</dt>
            <dd>
              <input
                id="user-id"
                v-model="newUser.name"
                type="text"
                placeholder=""
              />
              <button class="btn-check-id">중복체크</button>
            </dd>
            <dt>비밀번호</dt>
            <dd>
              <input
                id="user-pw"
                v-model="newUser.name"
                type="password"
                placeholder="비밀번호를 입력하세요"
              />
            </dd>
            <dt>비밀번호 확인</dt>
            <dd>
              <input
                id="confirm-pw"
                v-model="newUser.name"
                type="password"
                placeholder="비밀번호를 확인하세요"
              />
            </dd>
            <dt>이름</dt>
            <dd>
              <input
                id="user-name"
                v-model="newUser.name"
                type="text"
                placeholder="이름을 입력하세요"
              />
            </dd>
            <dt>업체명</dt>
            <dd>
              <input
                id="user-corp"
                v-model="newUser.name"
                type="text"
                placeholder="업체명을 입력하세요"
              />
            </dd>
            <dt>전화번호</dt>
            <dd>
              <input
                id="user-phone"
                v-model="newUser.name"
                type="text"
                placeholder="전화번호를 입력하세요"
              />
            </dd>
            <dt>이메일</dt>
            <dd>
              <input
                id="user-email"
                v-model="newUser.email"
                type="email"
                placeholder="이메일을 입력하세요"
              />
            </dd>
            <dt>사내외</dt>
            <dd>
              <select id="user-corp" v-model="newUser.name">
                <option value="">-- 선택 --</option>
                <option value="">사내</option>
                <option value=""></option>
              </select>
            </dd>
            <dt>권한</dt>
            <dd>
              <select id="user-role" v-model="newUser.role">
                <option value="">-- 선택 --</option>
                <option value="관리자">관리자</option>
                <option value="사용자"></option>
              </select>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isRegistModalOpen = false">
            취소
          </button>
          <button class="btn btn-primary" @click="saveUser">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  corpName?: string;
  phone?: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "id", title: "아이디", label: "아이디", width: 100, sortable: true },
  // { key: 'index', label: '번호', width: 50, sortable: true },
  { key: "name", title: "이름", label: "이름", width: 150, sortable: true },
  { key: "corpName", title: "업체", label: "업체", width: 150, sortable: true },
  {
    key: "phone",
    title: "전화번호",
    label: "전화번호",
    width: 150,
    sortable: true,
  },
  {
    key: "email",
    title: "이메일",
    label: "이메일",
    width: 200,
    sortable: true,
  },
  { key: "role", title: "권한", label: "권한", width: 150, sortable: true },
];

const userList = ref<UserItem[]>([]);
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
const selectedItems = ref<UserItem[]>([]);
const isRegistModalOpen = ref(false);
const newUser = ref<UserItem>({
  id: "",
  name: "",
  email: "",
  role: "",
  createdAt: "",
});

// --- computed로 페이징 및 필터 처리 ---
const filteredUserList = computed(() => {
  if (searchOption.value && searchQuery.value) {
    return userList.value.filter((user) => {
      const key = searchOption.value as keyof UserItem;
      return (
        user[key] &&
        user[key]!.toString()
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())
      );
    });
  }
  return userList.value;
});

const totalCountComputed = computed(() => filteredUserList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);

const paginatedUserList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUserList.value.slice(start, end);
});

// 데이터 로드 함수
const loadData = async () => {
  loading.value = true;
  try {
    userList.value = [
      {
        id: "1",
        name: "홍길동1",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
      {
        id: "2",
        name: "홍길동2",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
      {
        id: "3",
        name: "홍길동3",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
      {
        id: "4",
        name: "홍길동4",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
      {
        id: "5",
        name: "홍길동5",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
      {
        id: "6",
        name: "홍길동6",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
      {
        id: "7",
        name: "홍길동7",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
      {
        id: "8",
        name: "홍길동8",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
      {
        id: "9",
        name: "홍길동9",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
      {
        id: "10",
        name: "홍길동10",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
      {
        id: "11",
        name: "홍길동11",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
      },
    ];
    totalCount.value = userList.value.length;
    totalPages.value = Math.ceil(totalCount.value / pageSize.value);
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  } finally {
    loading.value = false;
  }
};

const handleSelectionChange = (selected: UserItem[]) => {
  selectedItems.value = selected;
};

// 페이지 변경 핸들러
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadData();
};

// 정렬 변경 핸들러
const handleSortChange = (sortInfo: {
  key: string;
  direction: "asc" | "desc";
}) => {
  sortColumn.value = sortInfo.key;
  sortOrder.value = sortInfo.direction;
  // 여기에 정렬 로직을 추가합니다.
  loadData();
};
// 행 클릭 핸들러
const handleRowClick = (item: UserItem) => {
  console.log("Row clicked:", item);
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadData();
});

// 검색 기능 구현
const handleSearch = () => {
  searchOption.value = searchOptionInput.value;
  searchQuery.value = searchQueryInput.value;
  currentPage.value = 1;
};

// 등록 버튼 핸들러
const handleRegist = () => {
  isRegistModalOpen.value = true;
};

// 사용자 저장
const saveUser = () => {
  if (!newUser.value.name || !newUser.value.email || !newUser.value.role) {
    alert("모든 필드를 입력하세요.");
    return;
  }
  const nextId = (userList.value.length + 1).toString();
  userList.value.push({
    ...newUser.value,
    id: nextId,
    createdAt: new Date().toISOString(),
  });
  alert("사용자가 등록되었습니다.");
  isRegistModalOpen.value = false;
  newUser.value = { id: "", name: "", email: "", role: "", createdAt: "" }; // 폼 초기화
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
    userList.value = userList.value.filter(
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
  console.log("수정할 항목:", itemToEdit);
  alert(`'${itemToEdit.name}' 사용자를 수정합니다.`);
};
</script>

<style scoped lang="scss">
.user-management {
  padding: $spacing-lg;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-body {
  margin-top: 1rem;
}
.modal-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
