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
            <select id="role" v-model="searchOption">
              <option value="">{{ t("placeholder.selectItem") }}</option>
              <option value="username">{{ t("columns.user.id") }}</option>
              <option value="full_name">{{ t("columns.user.name") }}</option>
              <option value="organization">
                {{ t("columns.user.corpName") }}
              </option>
              <option value="email">{{ t("columns.user.email") }}</option>
              <option value="contact_info">
                {{ t("columns.user.contactInfo") }}
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
              v-model="searchQuery"
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
          :disabled="selectedItems.length !== 1"
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
      ref="dataTableRef"
      :columns="tableColumns"
      :data="paginatedUserList"
      :loading="userStore.loading"
      :selectable="true"
      :selected-items="selectedItems"
      :selection-mode="'single'"
      :show-select-all="false"
      :select-header-text="t('common.selectColumn')"
      row-key="user_id"
      :stickyHeader="true"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <template #cell-is_active="{ value }">
        <span :class="value ? 'status-active' : 'status-inactive'">
          {{
            value
              ? t("common.userStatus.active")
              : t("common.userStatus.inactive")
          }}
        </span>
      </template>
    </DataTable>
    <!-- Pagination -->
    <div class="pagination-container">
      <div class="total-count">
        {{
          t("common.totalCount", {
            count: userStore.totalCount || 0,
          })
        }}
      </div>
      <Pagination
        :current-page="userStore.page"
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

            <dt>{{ t("columns.user.userType") }}</dt>
            <dd>
              <select id="user-type" v-model="newUser.user_type">
                <option value="INTERNAL">
                  {{ t("common.userType.internal") }}
                </option>
                <option value="EXTERNAL">
                  {{ t("common.userType.external") }}
                </option>
              </select>
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

            <dt>{{ t("columns.user.contactInfo") }}</dt>
            <dd>
              <input
                id="user-contact"
                v-model="newUser.contact_info"
                type="text"
                :placeholder="t('placeholder.userContactInfo')"
                @input="handleContactInput"
              />
            </dd>
            <dt>{{ t("columns.user.description") }}</dt>
            <dd>
              <textarea
                id="user-description"
                v-model="newUser.description"
                :placeholder="t('placeholder.userDescription')"
                rows="3"
              />
            </dd>
            <dt>{{ t("columns.user.role") }}</dt>
            <dd>
              <select id="user-role" v-model="newUser.is_superuser">
                <option :value="false">{{ t("common.userRole.user") }}</option>
                <option :value="true">{{ t("common.userRole.admin") }}</option>
              </select>
            </dd>
            <dt>{{ t("columns.user.roleGroup") }}</dt>
            <dd>
              <select id="user-role-group" v-model="newUser.role_id">
                <option value="">{{ t("placeholder.selectItem") }}</option>
                <option
                  v-for="role in userStore.roles"
                  :key="role.role_id"
                  :value="role.role_id"
                >
                  {{ role.role_name }}
                </option>
              </select>
            </dd>
            <dt v-if="isEditMode">{{ t("columns.user.status") }}</dt>
            <dd v-if="isEditMode">
              <select id="user-status" v-model="newUser.is_active">
                <option :value="true">
                  {{ t("common.userStatus.active") }}
                </option>
                <option :value="false">
                  {{ t("common.userStatus.inactive") }}
                </option>
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
import { useTranslateMessage } from "@/utils/translateMessage";
import { useUserStore, type User } from "@/stores/userStore";

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();
const userStore = useUserStore();

// 폼용 사용자 인터페이스 (UI 전용)
interface UserForm {
  username: string;
  password: string;
  passwordConfirm: string;
  full_name: string;
  email: string;
  organization: string;
  user_type: "INTERNAL" | "EXTERNAL"; // 사내/사외 구분
  contact_info: string;
  description: string;
  is_superuser: boolean;
  is_active?: boolean; // 수정 모드에서만 사용
  role_id?: string | number | undefined; // 역할 ID 추가 (빈 문자열도 허용)
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "user_id", title: "ID", width: "0px", sortable: false, hidden: true },
  {
    key: "row_number",
    title: t("common.no"),
    width: "80px",
    sortable: false,
    formatter: (value, item) => {
      const index = paginatedUserList.value.findIndex(
        (user) => user.user_id === item.user_id
      );
      return (userStore.page - 1) * userStore.page_size + index + 1;
    },
  },
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
    key: "user_type",
    title: t("columns.user.userType"),
    width: "100px",
    sortable: true,
    formatter: (value) => {
      if (!value || value === null || value === undefined || value === "") {
        return "-"; // 데이터가 없는 경우 "-" 표시
      }
      return value === "INTERNAL"
        ? t("common.userType.internal")
        : t("common.userType.external");
    },
  },
  {
    key: "organization",
    title: t("columns.user.corpName"),
    width: "150px",
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
    sortable: false,
    formatter: (value) =>
      value ? t("common.userRole.admin") : t("common.userRole.user"),
  },
  {
    key: "role_name",
    title: t("columns.user.roleGroup"),
    width: "120px",
    sortable: false,
  },
  {
    key: "is_active",
    title: t("columns.user.status"),
    width: "100px",
    sortable: false,
  },
  {
    key: "description",
    title: t("columns.user.description"),
    width: "200px",
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
const dataTableRef = ref<InstanceType<typeof DataTable> | null>(null);
const newUser = ref<UserForm>({
  username: "",
  password: "",
  passwordConfirm: "",
  full_name: "",
  email: "",
  organization: "",
  user_type: "INTERNAL",
  contact_info: "",
  description: "",
  is_superuser: false,
  is_active: true, // 기본값은 활성 상태
  role_id: undefined, // 역할 ID 초기값
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

// 연락처 입력 필드 숫자만 허용하고 하이픈 자동 추가
const handleContactInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  // 숫자가 아닌 문자 제거
  const numericValue = value.replace(/[^0-9]/g, "");

  // 하이픈 자동 추가 (010-0000-0000 형식)
  let formattedValue = numericValue;
  if (numericValue.length > 3 && numericValue.length <= 7) {
    formattedValue = numericValue.slice(0, 3) + "-" + numericValue.slice(3);
  } else if (numericValue.length > 7) {
    formattedValue =
      numericValue.slice(0, 3) +
      "-" +
      numericValue.slice(3, 7) +
      "-" +
      numericValue.slice(7, 11);
  }

  newUser.value.contact_info = formattedValue;
};

// --- computed로 페이징 및 필터 처리 ---
const filteredUserList = computed(() => {
  // 서버 측 검색을 사용하므로 항상 서버 데이터 반환
  return userStore.users || [];
});

const totalPagesComputed = computed(() => {
  // 항상 서버의 totalPages를 사용하여 일관성 유지
  return userStore.totalPages || 1;
});

const paginatedUserList = computed(() => {
  return filteredUserList.value;
});

// 데이터 로드 함수
const loadData = async () => {
  try {
    // 사용자 목록과 역할 목록을 동시에 로드
    await Promise.all([
      userStore.fetchUsers({
        page: userStore.page,
        page_size: userStore.page_size,
      }),
      userStore.fetchRoles(), // 역할 목록 로드
    ]);
  } catch (error: any) {
    console.error("데이터 로드 실패:", error);
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.dataLoadFailed"
    );
    alert(errorMessage);
  }
};

const handleSelectionChange = (selected: User[]) => {
  selectedItems.value = selected;
};

// 페이지 변경 핸들러
const handlePageChange = async (page: number) => {
  // 현재 검색 조건을 유지하면서 페이지 변경
  try {
    await userStore.changePage(page, {
      search_field: searchOptionInput.value,
      search_value: searchQueryInput.value,
    });
    selectedItems.value = [];
  } catch (error: any) {
    console.error("페이지 변경 실패:", error);
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.pageChangeFailed"
    );
    alert(errorMessage);
  }
};

// 정렬 변경 핸들러
const handleSortChange = async (sortInfo: {
  key: string | null;
  direction: "asc" | "desc" | null;
}) => {
  console.log("정렬 변경:", sortInfo);

  try {
    const params: any = {
      page: userStore.page,
      page_size: userStore.page_size,
      search_field: searchOptionInput.value,
      search_value: searchQueryInput.value,
    };

    // 정렬 조건이 있을 때만 추가
    if (sortInfo.key && sortInfo.direction) {
      params.order_by = sortInfo.key;
      params.order_direction = sortInfo.direction;
    }

    await userStore.fetchUsers(params);
  } catch (error: any) {
    console.error("정렬 실패:", error);
    const errorMessage = error?.message || "정렬에 실패했습니다.";
    alert(errorMessage);
  }
};

// 행 클릭 핸들러
const handleRowClick = (item: User) => {
  console.log("Row clicked:", item);
  // DataTable의 내부 선택 기능 사용
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadData();
});

// 검색 기능 구현
const handleSearch = async () => {
  // 검색 조건을 실제 검색값에 복사
  searchOptionInput.value = searchOption.value;
  searchQueryInput.value = searchQuery.value;

  // 검색시 선택된 항목 초기화
  selectedItems.value = [];

  // 검색시 정렬 상태 초기화
  if (dataTableRef.value) {
    dataTableRef.value.resetSort();
  }

  // 서버 측 검색 실행
  try {
    await userStore.fetchUsers({
      page: 1, // 검색 시 첫 페이지로 이동
      page_size: userStore.page_size,
      search_field: searchOptionInput.value,
      search_value: searchQueryInput.value,
      // 정렬 조건 제거 (초기화)
    });
  } catch (error: any) {
    console.error("검색 실패:", error);
    const errorMessage = error?.message || "검색에 실패했습니다.";
    alert(errorMessage);
  }
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
    user_type: "INTERNAL",
    contact_info: "",
    description: "",
    is_superuser: false,
    is_active: true, // 등록 시 기본값은 활성 상태
    role_id: "", // 메뉴권한 ID 초기화 (빈 문자열로 설정하여 "항목을 선택해주세요" 표시)
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
    !newUser.value.email ||
    !newUser.value.role_id ||
    newUser.value.role_id === "" // 메뉴권한 선택 필수
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

      console.log(
        "수정 모드 - user_type 값:",
        newUser.value.user_type,
        "타입:",
        typeof newUser.value.user_type
      );
      console.log(
        "수정 모드 - is_active 값:",
        newUser.value.is_active,
        "타입:",
        typeof newUser.value.is_active
      );
      console.log(
        "수정 모드 - password 값:",
        newUser.value.password,
        "confirm_password 값:",
        newUser.value.passwordConfirm
      );
      console.log(
        "수정 모드 - role_id 값:",
        newUser.value.role_id,
        "타입:",
        typeof newUser.value.role_id
      );

      await userStore.updateUser(selectedUser.user_id, {
        username: newUser.value.username,
        full_name: newUser.value.full_name,
        email: newUser.value.email,
        organization: newUser.value.organization,
        contact_info: newUser.value.contact_info,
        description: newUser.value.description,
        is_superuser: newUser.value.is_superuser,
        user_type: newUser.value.user_type,
        is_active: newUser.value.is_active, // 수정 시 상태 포함
        password: newUser.value.password, // 비밀번호 필드 추가
        confirm_password: newUser.value.passwordConfirm, // 비밀번호 확인 필드 추가
        role_id: newUser.value.role_id, // 메뉴권한 ID 그대로 전송
      });

      alert(t("messages.success.userInfoUpdated"));
      await loadData(); // 사용자 목록 새로고침
      selectedItems.value = []; // 선택 항목 초기화(또는 최신 객체로 재할당)
    } else {
      // 등록 모드: 새 사용자 추가
      console.log("전송할 사용자 데이터:", {
        username: newUser.value.username,
        password: newUser.value.password,
        confirm_password: newUser.value.passwordConfirm,
        full_name: newUser.value.full_name,
        email: newUser.value.email,
        organization: newUser.value.organization,
        contact_info: newUser.value.contact_info,
        description: newUser.value.description,
        is_superuser: newUser.value.is_superuser,
        user_type: newUser.value.user_type,
        role_id: newUser.value.role_id,
      });

      console.log(
        "user_type 값:",
        newUser.value.user_type,
        "타입:",
        typeof newUser.value.user_type
      );
      console.log(
        "role_id 값:",
        newUser.value.role_id,
        "타입:",
        typeof newUser.value.role_id
      );

      await userStore.createUser({
        username: newUser.value.username,
        password: newUser.value.password,
        confirm_password: newUser.value.passwordConfirm,
        full_name: newUser.value.full_name,
        email: newUser.value.email,
        organization: newUser.value.organization,
        contact_info: newUser.value.contact_info,
        description: newUser.value.description,
        is_superuser: newUser.value.is_superuser,
        user_type: newUser.value.user_type,
        role_id: newUser.value.role_id, // 메뉴권한 ID 그대로 전송
        // 등록 시에는 is_active를 제외 (서버에서 기본값 처리)
      });
      alert(t("messages.success.userRegistered"));
      await loadData(); // 사용자 목록 새로고침
      selectedItems.value = []; // 선택 항목 초기화(또는 최신 객체로 재할당)
    }

    isRegistModalOpen.value = false;
    newUser.value = {
      username: "",
      password: "",
      passwordConfirm: "",
      full_name: "",
      email: "",
      organization: "",
      user_type: "INTERNAL",
      contact_info: "",
      description: "",
      is_superuser: false,
      is_active: true,
      role_id: "",
    };
    isEditMode.value = false;
    isIdChecked.value = false;
  } catch (error: any) {
    console.error("사용자 저장 실패:", error);
    const errorMessage = error?.message || t("messages.error.saveFailed");
    alert(errorMessage);
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
  } catch (error: any) {
    console.error("중복 체크 실패:", error);
    const errorMessage =
      error?.message || t("messages.error.duplicateCheckFailed");
    alert(errorMessage);
  } finally {
    // 로딩 상태 복원
    userStore.loading = false;
  }
};

// 선택된 항목 삭제
const handleDelete = async () => {
  if (selectedItems.value.length !== 1) {
    alert(t("messages.warning.pleaseSelectOneItemToDelete"));
    return;
  }
  if (confirm(t("messages.confirm.deleteItem"))) {
    try {
      const userId = selectedItems.value[0].user_id;
      await userStore.deleteUser(userId);
      selectedItems.value = [];
      alert(t("messages.success.deleted"));
      await loadData(); // 사용자 목록 새로고침
      selectedItems.value = []; // 선택 항목 초기화(또는 최신 객체로 재할당)
    } catch (error: any) {
      console.error("삭제 실패:", error);
      const errorMessage = error?.message || t("messages.error.deleteFailed");
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
  showPasswordChange.value = false;

  // role_id 설정 로직 개선
  let roleId: string | number | undefined = "";

  // itemToEdit.role_name이 존재하는지 확인
  if ((itemToEdit as any).role_name) {
    if (userStore.roles.length > 0) {
      // role_name을 기준으로 역할을 찾아서 role_id를 가져옴
      const role = userStore.roles.find(
        (r) => r.role_name === (itemToEdit as any).role_name
      );
      roleId = role ? role.role_id : "";
    } else {
      roleId = "";
    }
  }

  newUser.value = {
    username: itemToEdit.username,
    password: "",
    passwordConfirm: "",
    full_name: itemToEdit.full_name,
    email: itemToEdit.email,
    organization: itemToEdit.organization,
    user_type: itemToEdit.user_type || "INTERNAL", // null인 경우 기본값 설정
    contact_info: itemToEdit.contact_info || "",
    description: itemToEdit.description || "",
    is_superuser: itemToEdit.is_superuser,
    is_active: itemToEdit.is_active, // 수정 시 현재 상태 유지
    role_id: roleId,
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

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
  position: relative;

  .total-count {
    position: absolute;
    left: 1rem;
    font-size: 0.9rem;
    color: #374151;
    font-weight: 500;
  }
}

.form-item {
  width: 240px;

  select {
    appearance: none;
    background-image: url(../../assets/icons/ico_select-down.svg);
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 12px auto;
    width: 240px;
    height: 40px;
    padding: 8px 32px 8px 8px;
    border: 1px solid #e7e6ed;
    border-radius: 4px;
    font-size: 15px;
    font-weight: 400;
    min-width: 120px;

    &:focus {
      outline: none;
      border-color: $primary-color;
      background-image: url(../../assets/icons/ico_select-up.svg);
      z-index: 2;
    }
  }
}
</style>
