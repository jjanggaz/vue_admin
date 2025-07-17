<template>
  <div class="user-management">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="group-form">
          <label for="role" class="label-search">{{
            t("common.search")
          }}</label>
          <div class="form-item">
            <select id="role" v-model="searchOptionInput">
              <option value="">{{ t("common.selectItem") }}</option>
              <option value="id">{{ t("columns.user.id") }}</option>
              <option value="name">{{ t("columns.user.name") }}</option>
              <option value="corpName">{{ t("columns.user.corpName") }}</option>
              <option value="phone">{{ t("columns.user.phone") }}</option>
              <option value="email">{{ t("columns.user.email") }}</option>
              <option value="role">{{ t("columns.user.role") }}</option>
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
          <h3>
            {{ isEditMode ? t("common.editUser") : t("common.registerUser") }}
          </h3>
          <button class="btn-close" @click="isRegistModalOpen = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt>{{ t("columns.user.id") }}</dt>
            <dd>
              <input
                id="user-id"
                v-model="newUser.id"
                type="text"
                :placeholder="t('placeholder.userId')"
                :disabled="isEditMode"
                @input="resetIdChecked"
              />
              <button
                class="btn-check-id"
                v-if="!isEditMode"
                @click="handleCheckId"
              >
                {{ t("common.duplicateCheck") }}
              </button>
            </dd>
            <dt>{{ t("common.password") }}</dt>
            <dd>
              <input
                id="user-pw"
                v-model="newUser.pwd"
                type="password"
                :placeholder="t('placeholder.userPassword')"
              />
            </dd>
            <dt>{{ t("common.passwordConfirm") }}</dt>
            <dd>
              <input
                id="confirm-pw"
                v-model="newUser.pwdChk"
                type="password"
                :placeholder="t('placeholder.userPasswordConfirm')"
              />
            </dd>
            <dt>{{ t("columns.user.name") }}</dt>
            <dd>
              <input
                id="user-name"
                v-model="newUser.name"
                type="text"
                :placeholder="t('placeholder.userName')"
              />
            </dd>
            <dt>{{ t("columns.user.corpName") }}</dt>
            <dd>
              <input
                id="user-corp"
                v-model="newUser.corpName"
                type="text"
                :placeholder="t('placeholder.userCorpName')"
              />
            </dd>
            <dt>{{ t("columns.user.phone") }}</dt>
            <dd>
              <input
                id="user-phone"
                v-model="newUser.phone"
                type="text"
                :placeholder="t('placeholder.userPhone')"
              />
            </dd>
            <dt>{{ t("columns.user.email") }}</dt>
            <dd>
              <input
                id="user-email"
                v-model="newUser.email"
                type="email"
                :placeholder="t('placeholder.userEmail')"
              />
            </dd>
            <dt>{{ t("common.corpType") }}</dt>
            <dd>
              <select id="user-corpType" v-model="newUser.corpType">
                <option value="">{{ t("common.select") }}</option>
                <option value="사내">
                  {{ t("common.userCorpType.internal") }}
                </option>
                <option value="사외">
                  {{ t("common.userCorpType.external") }}
                </option>
              </select>
            </dd>
            <dt>{{ t("columns.user.role") }}</dt>
            <dd>
              <select id="user-role" v-model="newUser.role">
                <option value="">{{ t("common.select") }}</option>
                <option value="관리자">{{ t("common.userRole.admin") }}</option>
                <option value="사용자">{{ t("common.userRole.user") }}</option>
              </select>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isRegistModalOpen = false">
            {{ t("common.cancel") }}
          </button>
          <button class="btn btn-primary" @click="saveUser">
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

interface UserItem {
  id: string;
  pwd?: string;
  pwdChk?: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  corpName?: string;
  phone?: string;
  corpType: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "id", title: t("columns.user.id"), width: "100px", sortable: true },
  //{ key: 'index', label: '번호', width: "50px", sortable: true },
  {
    key: "name",
    title: t("columns.user.name"),
    width: "150px",
    sortable: true,
  },
  {
    key: "corpName",
    title: t("columns.user.corpName"),
    width: "150px",
    sortable: true,
  },
  {
    key: "phone",
    title: t("columns.user.phone"),
    width: "150px",
    sortable: true,
  },
  {
    key: "email",
    title: t("columns.user.email"),
    width: "200px",
    sortable: true,
  },
  {
    key: "role",
    title: t("columns.user.role"),
    width: "150px",
    sortable: true,
  },
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
const isEditMode = ref(false);
const newUser = ref<UserItem>({
  id: "",
  pwd: "",
  pwdChk: "",
  name: "",
  email: "",
  role: "",
  createdAt: "",
  corpName: "",
  phone: "",
  corpType: "",
});
const isIdChecked = ref(false);
const resetIdChecked = () => {
  isIdChecked.value = false;
};

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
        pwd: "",
        name: "홍길동1",
        email: "..@example.com",
        role: "사용자",
        createdAt: "2023-01-01",
        corpName: "업체1",
        phone: "010-1234-5678",
        corpType: "사내",
      },
      {
        id: "2",
        pwd: "",
        name: "홍길동2",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
        corpName: "업체2",
        phone: "010-1234-5678",
        corpType: "사외",
      },
      {
        id: "3",
        pwd: "",
        name: "홍길동3",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
        corpName: "업체3",
        phone: "010-1234-5678",
        corpType: "사내",
      },
      {
        id: "4",
        pwd: "",
        name: "홍길동4",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
        corpName: "업체4",
        phone: "010-1234-5678",
        corpType: "사내",
      },
      {
        id: "5",
        pwd: "",
        name: "홍길동5",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
        corpName: "업체5",
        phone: "010-1234-5678",
        corpType: "사외",
      },
      {
        id: "6",
        pwd: "",
        name: "홍길동6",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
        corpName: "업체6",
        phone: "010-1234-5678",
        corpType: "사외",
      },
      {
        id: "7",
        pwd: "",
        name: "홍길동7",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
        corpName: "업체7",
        phone: "010-1234-5678",
        corpType: "사외외",
      },
      {
        id: "8",
        pwd: "",
        name: "홍길동8",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
        corpName: "업체8",
        phone: "010-1234-5678",
        corpType: "사내",
      },
      {
        id: "9",
        pwd: "",
        name: "홍길동9",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
        corpName: "업체9",
        phone: "010-1234-5678",
        corpType: "사내",
      },
      {
        id: "10",
        pwd: "",
        name: "홍길동10",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
        corpName: "업체10",
        phone: "010-1234-5678",
        corpType: "사내",
      },
      {
        id: "11",
        pwd: "",
        name: "홍길동11",
        email: "..@example.com",
        role: "관리자",
        createdAt: "2023-01-01",
        corpName: "업체11",
        phone: "010-1234-5678",
        corpType: "사내",
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
  selectedItems.value = [];
  //loadData();
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
const handleRowClick = (item: UserItem) => {
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
  newUser.value = {
    id: "",
    pwd: "",
    pwdChk: "",
    name: "",
    email: "",
    role: "",
    createdAt: "",
    corpName: "",
    phone: "",
    corpType: "",
  };
  isIdChecked.value = false;
};

// 사용자 저장
const saveUser = () => {
  if (
    !newUser.value.id ||
    !newUser.value.pwd ||
    !newUser.value.pwdChk ||
    !newUser.value.name ||
    !newUser.value.corpName ||
    !newUser.value.phone ||
    !newUser.value.email ||
    !newUser.value.corpType ||
    !newUser.value.role
  ) {
    alert(t("messages.warning.pleaseCompleteAllFields"));
    return;
  }
  if (!isEditMode.value && !isIdChecked.value) {
    alert(t("messages.warning.pleaseCheckIdDuplication"));
    return;
  }

  if (newUser.value.pwd !== newUser.value.pwdChk) {
    alert(t("messages.error.passwordsDoNotMatch"));
    return;
  }
  if (isEditMode.value) {
    // 수정 모드: 기존 사용자 정보 업데이트
    const idx = userList.value.findIndex((u) => u.id === newUser.value.id);
    if (idx !== -1) {
      userList.value[idx] = { ...newUser.value };
      alert(t("messages.success.userInfoUpdated"));
    }
  } else {
    // 등록 모드: 새 사용자 추가
    const nextId = (userList.value.length + 1).toString();
    userList.value.push({
      ...newUser.value,
      id: nextId,
      createdAt: new Date().toISOString(),
    });
    alert(t("messages.success.userRegistered"));
  }
  isRegistModalOpen.value = false;
  newUser.value = {
    id: "",
    pwd: "",
    pwdChk: "",
    name: "",
    email: "",
    role: "",
    createdAt: "",
    corpName: "",
    phone: "",
    corpType: "",
  };
  isEditMode.value = false;
  isIdChecked.value = false;
};

// 중복체크 핸들러
const handleCheckId = () => {
  // 실제로는 서버에 중복 체크 요청을 해야 함
  if (!newUser.value.id) {
    alert(t("messages.warning.pleaseEnterId"));
    return;
  }

  //나중에 서버에 중복체크 요청을 해야 할 수 있음
  const exists = userList.value.some((user) => user.id === newUser.value.id);

  if (exists) {
    alert(t("messages.error.idAlreadyExists"));
    isIdChecked.value = false;
  } else {
    alert(t("messages.success.idAvailable"));
    isIdChecked.value = true;
  }
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
    userList.value = userList.value.filter(
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
  newUser.value = { ...itemToEdit };
};
</script>

<style scoped lang="scss">
.user-management {
  padding: $spacing-lg;
}
</style>
