<template>
  <div class="account-management">
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
              <option value="username">{{ t("columns.user.id") }}</option>
              <option value="full_name">{{ t("columns.user.name") }}</option>
              <option value="organization">
                {{ t("columns.user.corpName") }}
              </option>
              <option value="email">{{ t("columns.user.email") }}</option>
              <option value="is_superuser">{{ t("columns.user.role") }}</option>
              <option value="is_active">{{ t("columns.user.status") }}</option>
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
      :loading="userStore.loading"
      :selectable="true"
      :selected-items="selectedItems"
      row-key="user_id"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <template #cell-index="{ index }">
        {{ index + 1 }}
      </template>
      <template #cell-is_active="{ value }">
        <span :class="value ? 'status-active' : 'status-inactive'">
          {{
            value
              ? t("common.userStatus.active")
              : t("common.userStatus.inactive")
          }}
        </span>
      </template>
      <template #cell-last_login="{ value }">
        <span v-if="value">{{ formatDate(value) }}</span>
        <span v-else class="no-data">-</span>
      </template>
    </DataTable>
    <!-- Pagination -->
    <div class="pagination-container">
      <Pagination
        :current-page="userStore.currentPage"
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
                ? t("common.edit") + " " + t("common.user")
                : t("common.register") + " " + t("common.user")
            }}
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
                id="user-username"
                v-model="newUser.username"
                type="text"
                :placeholder="t('placeholder.userId')"
                :disabled="isEditMode"
                @input="resetIdChecked"
              />
              <button
                class="btn-check-id"
                v-if="!isEditMode"
                @click="handleCheckId"
                :disabled="userStore.loading"
              >
                {{
                  userStore.loading
                    ? t("common.checking")
                    : t("common.duplicateCheck")
                }}
              </button>
            </dd>
            <dt v-if="!isEditMode">{{ t("common.password") }}</dt>
            <dd v-if="!isEditMode">
              <input
                id="user-pw"
                v-model="newUser.password"
                type="password"
                :placeholder="t('placeholder.userPassword')"
              />
            </dd>
            <dt v-if="!isEditMode">{{ t("common.passwordConfirm") }}</dt>
            <dd v-if="!isEditMode">
              <input
                id="confirm-pw"
                v-model="newUser.passwordConfirm"
                type="password"
                :placeholder="t('placeholder.userPasswordConfirm')"
              />
            </dd>
            <!-- 수정 모드에서 비밀번호 변경 -->
            <dt v-if="isEditMode">{{ t("common.password") }}</dt>
            <dd v-if="isEditMode">
              <div v-if="!showPasswordChange">
                <button
                  type="button"
                  class="btn btn-secondary btn-change-password"
                  @click="showPasswordChange = true"
                >
                  {{ t("common.changePassword") }}
                </button>
              </div>
              <div v-else>
                <input
                  id="user-pw-edit"
                  v-model="newUser.password"
                  type="password"
                  :placeholder="t('placeholder.userPasswordChange')"
                />
                <button
                  type="button"
                  class="btn btn-secondary btn-cancel-password"
                  @click="cancelPasswordChange"
                >
                  {{ t("common.changePasswordCancel") }}
                </button>
              </div>
            </dd>
            <dt v-if="isEditMode && showPasswordChange">
              {{ t("common.passwordConfirm") }}
            </dt>
            <dd v-if="isEditMode && showPasswordChange">
              <input
                id="confirm-pw-edit"
                v-model="newUser.passwordConfirm"
                type="password"
                :placeholder="t('placeholder.userPasswordConfirm')"
              />
            </dd>
            <dt>{{ t("columns.user.name") }}</dt>
            <dd>
              <input
                id="user-name"
                v-model="newUser.full_name"
                type="text"
                :placeholder="t('placeholder.userName')"
              />
            </dd>
            <dt>{{ t("columns.user.corpName") }}</dt>
            <dd>
              <input
                id="user-corp"
                v-model="newUser.organization"
                type="text"
                :placeholder="t('placeholder.userCorpName')"
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
            <dt>{{ t("columns.user.deptId") }}</dt>
            <dd>
              <input
                id="user-dept"
                v-model="newUser.dept_id"
                type="text"
                :placeholder="t('placeholder.userDeptId')"
              />
            </dd>
            <dt>{{ t("columns.user.contactInfo") }}</dt>
            <dd>
              <input
                id="user-contact"
                v-model="newUser.contact_info"
                type="text"
                :placeholder="t('placeholder.userContactInfo')"
              />
            </dd>
            <dt>{{ t("columns.user.status") }}</dt>
            <dd>
              <select id="user-status" v-model="newUser.is_active">
                <option :value="true">
                  {{ t("common.userStatus.active") }}
                </option>
                <option :value="false">
                  {{ t("common.userStatus.inactive") }}
                </option>
              </select>
            </dd>
            <dt>{{ t("columns.user.role") }}</dt>
            <dd>
              <select id="user-role" v-model="newUser.is_superuser">
                <option :value="false">{{ t("common.userRole.user") }}</option>
                <option :value="true">{{ t("common.userRole.admin") }}</option>
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
import { useUserStore, type User, type UserFormData } from "@/stores/userStore";

const { t } = useI18n();
const userStore = useUserStore();

// 날짜 포맷 함수
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toISOString().split("T")[0]; // yyyy-mm-dd 형식
  } catch (error) {
    return "-";
  }
};

// 폼용 사용자 인터페이스 (UI 전용)
interface UserForm extends UserFormData {
  passwordConfirm?: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "user_id", title: "ID", width: "0px", sortable: false, hidden: true },
  { key: "index", title: t("columns.user.no"), width: "60px", sortable: false },
  {
    key: "username",
    title: t("columns.user.id"),
    width: "120px",
    sortable: true,
  },
  {
    key: "full_name",
    title: t("columns.user.name"),
    width: "120px",
    sortable: true,
  },
  {
    key: "organization",
    title: t("columns.user.corpName"),
    width: "150px",
    sortable: true,
  },
  {
    key: "dept_id",
    title: t("columns.user.deptId"),
    width: "100px",
    sortable: true,
  },
  {
    key: "contact_info",
    title: t("columns.user.contactInfo"),
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
    key: "is_superuser",
    title: t("columns.user.role"),
    width: "100px",
    sortable: true,
    formatter: (value) =>
      value ? t("common.userRole.admin") : t("common.userRole.user"),
  },
  {
    key: "is_active",
    title: t("columns.user.status"),
    width: "100px",
    sortable: true,
  },
  {
    key: "last_login",
    title: t("columns.user.lastLogin"),
    width: "120px",
    sortable: true,
  },
];

const searchOptionInput = ref("");
const searchQueryInput = ref("");
const searchOption = ref("");
const searchQuery = ref("");
const selectedItems = ref<User[]>([]);
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newUser = ref<UserForm>({
  username: "",
  password: "",
  passwordConfirm: "",
  full_name: "",
  email: "",
  organization: "",
  dept_id: null,
  contact_info: null,
  is_active: true,
  is_superuser: false,
});
const isIdChecked = ref(false);
const showPasswordChange = ref(false);

const resetIdChecked = () => {
  isIdChecked.value = false;
};

const cancelPasswordChange = () => {
  showPasswordChange.value = false;
  newUser.value.password = "";
  newUser.value.passwordConfirm = "";
};

// --- computed로 페이징 및 필터 처리 ---
const filteredUserList = computed(() => {
  if (searchOption.value && searchQuery.value) {
    return userStore.filteredUsers(searchOption.value, searchQuery.value);
  }
  return userStore.users || [];
});

const totalCountComputed = computed(() => {
  // 검색 조건이 있으면 필터링된 결과의 개수, 없으면 서버의 전체 개수
  if (searchOption.value && searchQuery.value) {
    return filteredUserList.value.length;
  }
  return userStore.totalCount || 0;
});

const totalPagesComputed = computed(() => {
  // 검색 조건이 있으면 필터링된 결과 기반으로 페이지 계산
  if (searchOption.value && searchQuery.value) {
    return Math.ceil(totalCountComputed.value / userStore.itemsPerPage) || 1;
  }
  return userStore.totalPages || 1;
});

const paginatedUserList = computed(() => {
  return filteredUserList.value;
});

// 데이터 로드 함수
const loadData = async () => {
  try {
    await userStore.fetchUsers({
      page: userStore.currentPage,
      itemsPerPage: userStore.itemsPerPage,
    });
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  }
};

const handleSelectionChange = (selected: User[]) => {
  selectedItems.value = selected;
};

// 페이지 변경 핸들러
const handlePageChange = async (page: number) => {
  await userStore.changePage(page);
  selectedItems.value = [];
};

// 정렬 변경 핸들러
const handleSortChange = (sortInfo: {
  key: string;
  direction: "asc" | "desc";
}) => {
  console.log("정렬 변경:", sortInfo);
  // 서버 측 정렬이 필요하다면 여기에 API 호출 추가
};

// 행 클릭 핸들러
const handleRowClick = (item: User) => {
  console.log("Row clicked:", item);
  // row 클릭 시 해당 항목 선택 토글
  const index = selectedItems.value.findIndex(
    (selected) => selected.user_id === item.user_id
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
  //검색시 선택된 항목 초기화
  selectedItems.value = [];
  searchOption.value = searchOptionInput.value;
  searchQuery.value = searchQueryInput.value;
  // 검색 시 첫 페이지로 이동
  userStore.changePage(1);
};

// 등록 버튼 핸들러
const handleRegist = () => {
  isRegistModalOpen.value = true;
  isEditMode.value = false;
  showPasswordChange.value = false;
  newUser.value = {
    username: "",
    password: "",
    passwordConfirm: "",
    full_name: "",
    email: "",
    organization: "",
    dept_id: null,
    contact_info: null,
    is_active: true,
    is_superuser: false,
  };
  isIdChecked.value = false;
};

// 사용자 저장
const saveUser = async () => {
  if (
    !newUser.value.username ||
    (!isEditMode.value && !newUser.value.password) ||
    (!isEditMode.value && !newUser.value.passwordConfirm) ||
    !newUser.value.full_name ||
    !newUser.value.organization ||
    !newUser.value.email
  ) {
    alert(t("messages.warning.pleaseCompleteAllFields"));
    return;
  }
  if (!isEditMode.value && !isIdChecked.value) {
    alert(t("messages.warning.pleaseCheckUsernameDuplication"));
    return;
  }

  // 비밀번호 변경 모드에서 필수 필드 검증
  if (isEditMode.value && showPasswordChange.value) {
    if (!newUser.value.password || !newUser.value.passwordConfirm) {
      alert(t("messages.warning.pleaseCompleteAllFields"));
      return;
    }
  }

  // 비밀번호 확인 검증 (등록 모드 또는 수정 모드에서 비밀번호 변경 시)
  if (
    (!isEditMode.value || showPasswordChange.value) &&
    newUser.value.password !== newUser.value.passwordConfirm
  ) {
    alert(t("messages.error.passwordsDoNotMatch"));
    return;
  }

  try {
    if (isEditMode.value) {
      // 수정 모드: 기존 사용자 정보 업데이트
      const selectedUser = selectedItems.value[0];
      await userStore.updateUser(selectedUser.user_id, {
        username: newUser.value.username,
        full_name: newUser.value.full_name,
        email: newUser.value.email,
        organization: newUser.value.organization,
        dept_id: newUser.value.dept_id,
        contact_info: newUser.value.contact_info,
        is_active: newUser.value.is_active,
        is_superuser: newUser.value.is_superuser,
      });

      alert(t("messages.success.userInfoUpdated"));
      await loadData(); // 사용자 목록 새로고침
      selectedItems.value = []; // 선택 항목 초기화(또는 최신 객체로 재할당)
    } else {
      // 등록 모드: 새 사용자 추가
      await userStore.createUser({
        username: newUser.value.username,
        password: newUser.value.password,
        full_name: newUser.value.full_name,
        email: newUser.value.email,
        organization: newUser.value.organization,
        dept_id: newUser.value.dept_id,
        contact_info: newUser.value.contact_info,
        is_active: newUser.value.is_active,
        is_superuser: newUser.value.is_superuser,
      });
      alert(t("messages.success.userRegistered"));
    }

    isRegistModalOpen.value = false;
    newUser.value = {
      username: "",
      password: "",
      passwordConfirm: "",
      full_name: "",
      email: "",
      organization: "",
      dept_id: null,
      contact_info: null,
      is_active: true,
      is_superuser: false,
    };
    isEditMode.value = false;
    isIdChecked.value = false;
  } catch (error) {
    console.error("사용자 저장 실패:", error);
    alert(t("messages.error.saveFailed"));
  }
};

// 중복체크 핸들러
const handleCheckId = async () => {
  if (!newUser.value.username) {
    alert(t("messages.warning.pleaseEnterUsername"));
    return;
  }

  try {
    // 중복 체크 중 로딩 표시
    userStore.loading = true;

    const isAvailable = await userStore.checkUserIdDuplicate(
      newUser.value.username
    );

    if (isAvailable) {
      alert(t("messages.success.idAvailable"));
      isIdChecked.value = true;
    } else {
      alert(t("messages.error.idAlreadyExists"));
      isIdChecked.value = false;
    }
  } catch (error) {
    console.error("중복 체크 실패:", error);
    alert(t("messages.error.duplicateCheckFailed"));
  } finally {
    // 로딩 상태 복원
    userStore.loading = false;
  }
};

// 선택된 항목 삭제
const handleDelete = async () => {
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }
  if (
    confirm(
      t("messages.confirm.deleteItems", { count: selectedItems.value.length })
    )
  ) {
    try {
      const userIds = selectedItems.value.map((user) => user.user_id);
      await userStore.deleteUsers(userIds);
      selectedItems.value = [];
      alert(t("messages.success.deleted"));
    } catch (error) {
      console.error("삭제 실패:", error);
      alert(t("messages.error.deleteFailed"));
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
  showPasswordChange.value = false;
  newUser.value = {
    username: itemToEdit.username,
    password: "",
    passwordConfirm: "",
    full_name: itemToEdit.full_name,
    email: itemToEdit.email,
    organization: itemToEdit.organization,
    dept_id: itemToEdit.dept_id,
    contact_info: itemToEdit.contact_info,
    is_active: itemToEdit.is_active,
    is_superuser: itemToEdit.is_superuser,
  };
};
</script>

<style scoped lang="scss">
.user-management {
  padding: $spacing-lg;
}

// 활성 상태 스타일
.status-active {
  color: #28a745;
  font-weight: 600;
}

.status-inactive {
  color: #dc3545;
  font-weight: 600;
}

.no-data {
  color: #6c757d;
  font-style: italic;
}

// 비밀번호 변경 버튼 스타일
.btn-change-password,
.btn-cancel-password {
  margin-left: 8px;
  padding: 6px 12px;
  font-size: 12px;
}

.btn-cancel-password {
  margin-top: 4px;
}
</style>
