<template>
  <div class="role-management">
    <!-- Action Buttons -->
    <div class="action-bar">
      <div class="title-section">
        <h2 class="page-title">역할 그룹 목록</h2>
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

    <!-- Role Groups Table -->
    <DataTable
      :columns="tableColumns"
      :data="paginatedRoleList"
      :loading="roleStore.loading"
      :selectable="true"
      :selected-items="selectedItems"
      row-key="role_id"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <template #cell-index="{ index }">
        {{ index + 1 }}
      </template>
    </DataTable>

    <!-- Pagination -->
    <div class="pagination-container">
      <Pagination
        :current-page="roleStore.currentPage"
        :total-pages="totalPagesComputed"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 등록/수정 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>
            {{ isEditMode ? "역할 그룹 수정" : "역할 그룹 등록" }}
          </h3>
          <button class="btn-close" @click="isRegistModalOpen = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt>역할 이름</dt>
            <dd>
              <input
                id="role-name"
                v-model="newRole.role_name"
                type="text"
                placeholder="역할 이름을 입력하세요"
              />
            </dd>
            <dt>설명</dt>
            <dd>
              <textarea
                id="role-description"
                v-model="newRole.description"
                placeholder="역할에 대한 설명을 입력하세요"
                rows="3"
              ></textarea>
            </dd>
            <dt>메뉴권한</dt>
            <dd>
              <div class="menu-permissions">
                <div class="permission-group">
                  <label class="permission-label">
                    <input
                      type="checkbox"
                      v-model="newRole.permissions.basic_menu"
                    />
                    기본 메뉴
                  </label>
                </div>
                <div class="permission-group">
                  <label class="permission-label">
                    <input
                      type="checkbox"
                      v-model="newRole.permissions.approval_menu"
                    />
                    승인 메뉴
                  </label>
                </div>
                <div class="permission-group">
                  <label class="permission-label">
                    <input
                      type="checkbox"
                      v-model="newRole.permissions.admin_menu"
                    />
                    관리자 메뉴
                  </label>
                </div>
                <div class="permission-group">
                  <label class="permission-label">
                    <input
                      type="checkbox"
                      v-model="newRole.permissions.all_menu"
                    />
                    전체 메뉴
                  </label>
                </div>
              </div>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isRegistModalOpen = false">
            취소
          </button>
          <button class="btn btn-primary" @click="saveRole">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";

// 역할 그룹 인터페이스
interface RoleGroup {
  role_id: number;
  role_name: string;
  description: string;
  menu_permissions: string;
  created_at?: string;
  updated_at?: string;
}

// 역할 그룹 폼 인터페이스
interface RoleForm {
  role_name: string;
  description: string;
  permissions: {
    basic_menu: boolean;
    approval_menu: boolean;
    admin_menu: boolean;
    all_menu: boolean;
  };
}

// 역할 스토어 (임시 구현)
const roleStore = ref({
  loading: false,
  currentPage: 1,
  itemsPerPage: 10,
  totalPages: 1,
  roles: [] as RoleGroup[],
});

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "role_id", title: "ID", width: "0px", sortable: false, hidden: true },
  { key: "index", title: "순번", width: "60px", sortable: false },
  {
    key: "role_name",
    title: "역할 이름",
    width: "150px",
    sortable: true,
  },
  {
    key: "description",
    title: "설명",
    width: "300px",
    sortable: true,
  },
  {
    key: "menu_permissions",
    title: "메뉴권한",
    width: "200px",
    sortable: true,
  },
];

// 상태 관리
const selectedItems = ref<RoleGroup[]>([]);
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newRole = ref<RoleForm>({
  role_name: "",
  description: "",
  permissions: {
    basic_menu: false,
    approval_menu: false,
    admin_menu: false,
    all_menu: false,
  },
});

// 메뉴 권한 텍스트 생성
const getMenuPermissionsText = (permissions: RoleForm["permissions"]) => {
  const permissionTexts = [];
  if (permissions.basic_menu) permissionTexts.push("기본 메뉴");
  if (permissions.approval_menu) permissionTexts.push("승인 메뉴");
  if (permissions.admin_menu) permissionTexts.push("관리자 메뉴");
  if (permissions.all_menu) permissionTexts.push("ALL 메뉴");

  return permissionTexts.length > 0 ? permissionTexts.join("+") : "-";
};

// 메뉴 권한 텍스트를 권한 객체로 변환
const parseMenuPermissions = (permissionsText: string) => {
  const permissions = {
    basic_menu: false,
    approval_menu: false,
    admin_menu: false,
    all_menu: false,
  };

  if (permissionsText.includes("기본 메뉴")) permissions.basic_menu = true;
  if (permissionsText.includes("승인 메뉴")) permissions.approval_menu = true;
  if (permissionsText.includes("관리자 메뉴")) permissions.admin_menu = true;
  if (permissionsText.includes("ALL 메뉴")) permissions.all_menu = true;

  return permissions;
};

// 샘플 데이터 (실제로는 API에서 가져올 데이터)
const sampleRoles: RoleGroup[] = [
  {
    role_id: 1,
    role_name: "일반 사용자",
    description: "기본 메뉴 접근만 허용됨",
    menu_permissions: "기본 메뉴",
  },
  {
    role_id: 2,
    role_name: "승인자",
    description: "도면 승인 및 검토 가능",
    menu_permissions: "기본 메뉴+승인 메뉴",
  },
  {
    role_id: 3,
    role_name: "ADMIN",
    description: "전체 시스템 접근 가능",
    menu_permissions: "ALL 메뉴",
  },
];

// computed 속성들
const totalPagesComputed = computed(() => {
  return roleStore.value.totalPages || 1;
});

const paginatedRoleList = computed(() => {
  return roleStore.value.roles || [];
});

// 데이터 로드 함수
const loadData = async () => {
  try {
    roleStore.value.loading = true;
    // 실제로는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 500));
    roleStore.value.roles = sampleRoles;
    roleStore.value.totalPages = 1;
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  } finally {
    roleStore.value.loading = false;
  }
};

// 이벤트 핸들러들
const handleSelectionChange = (selected: RoleGroup[]) => {
  selectedItems.value = selected;
};

const handlePageChange = async (page: number) => {
  roleStore.value.currentPage = page;
  selectedItems.value = [];
  await loadData();
};

const handleSortChange = (sortInfo: {
  key: string;
  direction: "asc" | "desc";
}) => {
  console.log("정렬 변경:", sortInfo);
};

const handleRowClick = (item: RoleGroup) => {
  const index = selectedItems.value.findIndex(
    (selected) => selected.role_id === item.role_id
  );
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(item);
  }
};

const handleRegist = () => {
  isRegistModalOpen.value = true;
  isEditMode.value = false;
  newRole.value = {
    role_name: "",
    description: "",
    permissions: {
      basic_menu: false,
      approval_menu: false,
      admin_menu: false,
      all_menu: false,
    },
  };
};

const handleEdit = () => {
  if (selectedItems.value.length !== 1) {
    alert("수정할 항목을 하나만 선택해주세요.");
    return;
  }
  const itemToEdit = selectedItems.value[0];
  isRegistModalOpen.value = true;
  isEditMode.value = true;
  newRole.value = {
    role_name: itemToEdit.role_name,
    description: itemToEdit.description,
    permissions: parseMenuPermissions(itemToEdit.menu_permissions),
  };
};

const handleDelete = async () => {
  if (selectedItems.value.length === 0) {
    alert("삭제할 항목을 선택해주세요.");
    return;
  }
  if (
    confirm(`선택한 ${selectedItems.value.length}개 항목을 삭제하시겠습니까?`)
  ) {
    try {
      // 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 500));
      selectedItems.value = [];
      await loadData();
      alert("삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  }
};

const saveRole = async () => {
  if (!newRole.value.role_name || !newRole.value.description) {
    alert("모든 필수 항목을 입력해주세요.");
    return;
  }

  try {
    // 실제로는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 500));

    const menuPermissionsText = getMenuPermissionsText(
      newRole.value.permissions
    );

    if (isEditMode.value) {
      // 수정 모드
      const selectedRole = selectedItems.value[0];
      const updatedRole: RoleGroup = {
        ...selectedRole,
        role_name: newRole.value.role_name,
        description: newRole.value.description,
        menu_permissions: menuPermissionsText,
      };

      const index = roleStore.value.roles.findIndex(
        (r) => r.role_id === selectedRole.role_id
      );
      if (index !== -1) {
        roleStore.value.roles[index] = updatedRole;
      }
      alert("역할 그룹이 수정되었습니다.");
    } else {
      // 등록 모드
      const newRoleGroup: RoleGroup = {
        role_id: Date.now(), // 임시 ID
        role_name: newRole.value.role_name,
        description: newRole.value.description,
        menu_permissions: menuPermissionsText,
      };

      roleStore.value.roles.push(newRoleGroup);
      alert("역할 그룹이 등록되었습니다.");
    }

    isRegistModalOpen.value = false;
    newRole.value = {
      role_name: "",
      description: "",
      permissions: {
        basic_menu: false,
        approval_menu: false,
        admin_menu: false,
        all_menu: false,
      },
    };
    isEditMode.value = false;
  } catch (error) {
    console.error("저장 실패:", error);
    alert("저장에 실패했습니다.");
  }
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.role-management {
  padding: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section {
  .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
}

.btns {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &.btn-primary {
    background-color: #1e40af;
    color: white;

    &:hover:not(:disabled) {
      background-color: #1e3a8a;
    }

    &:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
  }

  &.btn-secondary {
    background-color: #6b7280;
    color: white;

    &:hover {
      background-color: #4b5563;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

// 모달 스타일
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
  max-height: 90vh;
  overflow-y: auto;
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

    textarea {
      resize: vertical;
      min-height: 80px;
    }
  }
}

.menu-permissions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-group {
  .permission-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;

    input[type="checkbox"] {
      width: auto;
      margin: 0;
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
