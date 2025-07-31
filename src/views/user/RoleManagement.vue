<template>
  <div class="role-management">
    <!-- Action Buttons -->
    <div class="action-bar">
      <div class="title-section">
        <h2 class="page-title">{{ t("roleGroup.title") }}</h2>
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

    <!-- Role Groups Table -->
    <DataTable
      :columns="tableColumns"
      :data="paginatedRoleList"
      :loading="roleStore.isLoading"
      :selectable="true"
      :selected-items="selectedItems"
      :selection-mode="'single'"
      :show-select-all="false"
      :select-header-text="t('common.selectColumn')"
      row-key="role_id"
      maxHeight="500px"
      :stickyHeader="true"
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
        :current-page="roleStore.currentPageNumber"
        :total-pages="totalPagesComputed"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 등록/수정 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>
            {{ isEditMode ? t("roleGroup.edit") : t("roleGroup.register") }}
          </h3>
          <button class="btn-close" @click="isRegistModalOpen = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt>{{ t("columns.roleGroup.roleName") }}</dt>
            <dd>
              <input
                id="role-name"
                v-model="newRole.role_name"
                type="text"
                :placeholder="t('placeholder.enterRoleName')"
              />
            </dd>
            <dt>{{ t("columns.roleGroup.description") }}</dt>
            <dd>
              <textarea
                id="role-description"
                v-model="newRole.description"
                :placeholder="t('placeholder.enterDescription')"
                rows="3"
              ></textarea>
            </dd>
            <dt>{{ t("columns.roleGroup.menuPermissions") }}</dt>
            <dd>
              <div class="menu-permissions-container">
                <div class="menu-permissions-header">
                  <label class="select-all-label">
                    <input
                      type="checkbox"
                      v-model="selectAllPermissions"
                      @change="handleSelectAllPermissions"
                    />
                    <span class="select-all-text">{{
                      t("menuPermissions.selectAll")
                    }}</span>
                  </label>
                </div>
                <div class="menu-permissions-table">
                  <AccordionTable
                    :columns="menuPermissionsColumns"
                    :data="menuPermissionsData"
                    :loading="false"
                    expand-column="name"
                    children-key="children"
                    row-key="id"
                    :expanded-items="expandedMenuPermissions"
                    @row-click="handleMenuPermissionClick"
                    @child-row-click="handleChildMenuPermissionClick"
                    @expand="handleMenuPermissionExpand"
                  >
                    <template #cell-checkbox="{ item }">
                      <input
                        type="checkbox"
                        :checked="item.checked"
                        @change="handleMenuPermissionCheckbox(item)"
                        @click.stop
                      />
                    </template>

                    <template #cell-name="{ item, isChild }">
                      <span class="menu-name">{{ item.name }}</span>
                    </template>
                  </AccordionTable>
                </div>
              </div>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isRegistModalOpen = false">
            {{ t("common.cancel") }}
          </button>
          <button class="btn btn-primary" @click="saveRole">
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
import AccordionTable, {
  type AccordionTableColumn,
} from "@/components/common/AccordionTable.vue";
import { useI18n } from "vue-i18n";
import { useRoleStore, type Role } from "@/stores/roleStore";

const { t } = useI18n();
const roleStore = useRoleStore();

// 역할 그룹 인터페이스 (기존 Role 인터페이스와 호환되도록 확장)
interface RoleGroup extends Role {
  menu_permissions?: string;
}

// 메뉴 권한 아이템 인터페이스
interface MenuPermissionItem {
  id: number;
  name: string;
  checked: boolean;
  children?: MenuPermissionItem[];
}

// 역할 그룹 폼 인터페이스
interface RoleForm {
  role_code: string;
  role_name: string;
  description: string;
  permissions: {
    basic_menu: boolean;
    approval_menu: boolean;
    admin_menu: boolean;
    all_menu: boolean;
  };
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "role_id", title: "ID", width: "0px", sortable: false, hidden: true },
  {
    key: "index",
    title: t("columns.roleGroup.no"),
    width: "60px",
    sortable: false,
  },
  {
    key: "role_name",
    title: t("columns.roleGroup.roleName"),
    width: "200px",
    sortable: true,
  },
  {
    key: "description",
    title: t("columns.roleGroup.description"),
    width: "400px",
    sortable: true,
  },
];

// 상태 관리
const selectedItems = ref<RoleGroup[]>([]);
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const newRole = ref<RoleForm>({
  role_code: "",
  role_name: "",
  description: "",
  permissions: {
    basic_menu: false,
    approval_menu: false,
    admin_menu: false,
    all_menu: false,
  },
});

// 메뉴 권한 관련 상태
const selectAllPermissions = ref(false);
const expandedMenuPermissions = ref<MenuPermissionItem[]>([]);

// 메뉴 권한 테이블 컬럼 설정
const menuPermissionsColumns: AccordionTableColumn[] = [
  {
    key: "checkbox",
    title: "",
    width: "40px",
  },
  {
    key: "name",
    title: t("menuPermissions.menuName"),
    width: "calc(100% - 40px)",
  },
];

// 메뉴 권한 데이터 (이미지 기반)
const menuPermissionsData = ref<MenuPermissionItem[]>([
  {
    id: 1,
    name: "프로젝트 관리",
    checked: true,
    children: [
      { id: 11, name: "신규생성", checked: true },
      { id: 12, name: "기존 프로젝트 불러오기", checked: true },
      { id: 13, name: "추천 프로젝트 불러오기", checked: true },
      { id: 14, name: "프로젝트 승인", checked: false },
    ],
  },
  {
    id: 2,
    name: "공정계획",
    checked: false,
    children: [
      { id: 21, name: "프로세스", checked: false },
      { id: 22, name: "추천공정", checked: false },
      { id: 23, name: "조건설정", checked: false },
      { id: 24, name: "시나리오 설정", checked: false },
      { id: 25, name: "기기리스트", checked: false },
    ],
  },
  {
    id: 3,
    name: "검토",
    checked: false,
  },
  {
    id: 4,
    name: "기기리스트",
    checked: false,
  },
  {
    id: 5,
    name: "P&ID",
    checked: false,
  },
  {
    id: 6,
    name: "PFD",
    checked: false,
  },
  {
    id: 7,
    name: "물질수지 및 계산서",
    checked: false,
  },
  {
    id: 8,
    name: "구조물 리스트",
    checked: false,
  },
]);

// 메뉴 권한 텍스트 생성
const getMenuPermissionsText = (permissions: RoleForm["permissions"]) => {
  const permissionTexts = [];
  if (permissions.basic_menu) permissionTexts.push(t("roleGroup.basicMenu"));
  if (permissions.approval_menu)
    permissionTexts.push(t("roleGroup.approvalMenu"));
  if (permissions.admin_menu) permissionTexts.push(t("roleGroup.adminMenu"));
  if (permissions.all_menu) permissionTexts.push(t("roleGroup.allMenu"));

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

  if (permissionsText.includes(t("roleGroup.basicMenu")))
    permissions.basic_menu = true;
  if (permissionsText.includes(t("roleGroup.approvalMenu")))
    permissions.approval_menu = true;
  if (permissionsText.includes(t("roleGroup.adminMenu")))
    permissions.admin_menu = true;
  if (permissionsText.includes(t("roleGroup.allMenu")))
    permissions.all_menu = true;

  return permissions;
};

// computed 속성들
const totalPagesComputed = computed(() => {
  return Math.ceil(roleStore.totalRoles / roleStore.currentPageSize) || 1;
});

const paginatedRoleList = computed(() => {
  return (roleStore.roleList as RoleGroup[]) || [];
});

// 데이터 로드 함수
const loadData = async () => {
  try {
    await roleStore.fetchRoles({
      page: roleStore.currentPageNumber,
      page_size: roleStore.currentPageSize,
    });
  } catch (error) {
    console.error("데이터 로드 실패:", error);
  }
};

// 이벤트 핸들러들
const handleSelectionChange = (selected: RoleGroup[]) => {
  selectedItems.value = selected;
};

const handlePageChange = async (page: number) => {
  await roleStore.changePage(page);
  selectedItems.value = []; // 페이지 변경 시 선택 초기화
};

const handleSortChange = (sortInfo: {
  key: string;
  direction: "asc" | "desc";
}) => {
  console.log("정렬 변경:", sortInfo);
};

const handleRowClick = (item: RoleGroup) => {
  // 단건선택: 클릭한 항목만 선택
  selectedItems.value = [item];
};

const handleRegist = () => {
  isRegistModalOpen.value = true;
  isEditMode.value = false;
  newRole.value = {
    role_code: "",
    role_name: "",
    description: "",
    permissions: {
      basic_menu: false,
      approval_menu: false,
      admin_menu: false,
      all_menu: false,
    },
  };

  // 메뉴 권한 데이터 초기화
  menuPermissionsData.value.forEach((item) => {
    item.checked = false;
    if (item.children) {
      item.children.forEach((child) => {
        child.checked = false;
      });
    }
  });
  selectAllPermissions.value = false;
};

const handleEdit = () => {
  if (selectedItems.value.length !== 1) {
    alert(t("messages.warning.selectOneItemToEdit"));
    return;
  }
  const itemToEdit = selectedItems.value[0];
  isRegistModalOpen.value = true;
  isEditMode.value = true;
  newRole.value = {
    role_code: itemToEdit.role_code,
    role_name: itemToEdit.role_name,
    description: itemToEdit.description || "",
    permissions: {
      basic_menu: false,
      approval_menu: false,
      admin_menu: false,
      all_menu: false,
    },
  };

  // 메뉴 권한 데이터 초기화
  menuPermissionsData.value.forEach((item) => {
    item.checked = false;
    if (item.children) {
      item.children.forEach((child) => {
        child.checked = false;
      });
    }
  });
  selectAllPermissions.value = false;
};

const handleDelete = async () => {
  if (selectedItems.value.length !== 1) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }
  if (confirm(t("messages.confirm.deleteItem"))) {
    try {
      const selectedRole = selectedItems.value[0];
      await roleStore.deleteRole(selectedRole.role_id);
      selectedItems.value = []; // 선택 초기화
      await loadData(); // 재조회
      alert(t("messages.success.deleted"));
    } catch (error) {
      console.error("삭제 실패:", error);
      alert(t("messages.error.deleteFailed"));
    }
  }
};

// 메뉴 권한 관련 핸들러 함수들
const handleSelectAllPermissions = () => {
  const updateChecked = (items: MenuPermissionItem[], checked: boolean) => {
    items.forEach((item) => {
      item.checked = checked;
      if (item.children) {
        updateChecked(item.children, checked);
      }
    });
  };

  updateChecked(menuPermissionsData.value, selectAllPermissions.value);
};

const handleMenuPermissionClick = (item: MenuPermissionItem) => {
  console.log("Menu permission clicked:", item);
};

const handleChildMenuPermissionClick = (
  child: MenuPermissionItem,
  parent: MenuPermissionItem
) => {
  console.log("Child menu permission clicked:", child, parent);
};

const handleMenuPermissionExpand = (
  item: MenuPermissionItem,
  expanded: boolean
) => {
  if (expanded) {
    expandedMenuPermissions.value.push(item);
  } else {
    const index = expandedMenuPermissions.value.findIndex(
      (menu) => menu.id === item.id
    );
    if (index > -1) {
      expandedMenuPermissions.value.splice(index, 1);
    }
  }
};

const handleMenuPermissionCheckbox = (item: MenuPermissionItem) => {
  // 부모 체크박스가 체크되면 모든 자식도 체크
  if (item.children) {
    item.children.forEach((child) => {
      child.checked = item.checked;
    });
  }

  // 자식 체크박스가 변경되면 부모 상태도 업데이트
  if (item.children) {
    const allChecked = item.children.every((child) => child.checked);
    const someChecked = item.children.some((child) => child.checked);

    if (allChecked) {
      item.checked = true;
    } else if (!someChecked) {
      item.checked = false;
    }
  }

  // 전체 선택 상태 업데이트
  const allItemsChecked = menuPermissionsData.value.every(
    (item) => item.checked
  );
  selectAllPermissions.value = allItemsChecked;
};

const saveRole = async () => {
  if (
    !newRole.value.role_code ||
    !newRole.value.role_name ||
    !newRole.value.description
  ) {
    alert(t("messages.warning.pleaseCompleteAllFields"));
    return;
  }

  try {
    if (isEditMode.value) {
      // 수정 모드
      const selectedRole = selectedItems.value[0];
      const updateData = {
        role_id: selectedRole.role_id,
        role_code: newRole.value.role_code,
        role_name: newRole.value.role_name,
        description: newRole.value.description || "",
        is_active: selectedRole.is_active,
      };

      await roleStore.updateRole(selectedRole.role_id, updateData);
      alert(t("messages.success.roleGroupUpdated"));
    } else {
      // 등록 모드
      const createData = {
        role_code: newRole.value.role_code,
        role_name: newRole.value.role_name,
        description: newRole.value.description || "",
      };

      await roleStore.createRole(createData);
      alert(t("messages.success.roleGroupRegistered"));
    }

    isRegistModalOpen.value = false;
    newRole.value = {
      role_code: "",
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

    // 저장 후 재조회
    await loadData();
  } catch (error) {
    console.error("저장 실패:", error);
    alert(t("messages.error.saveFailed"));
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
  max-height: 80vh;
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

    textarea {
      resize: vertical;
      min-height: 80px;
    }
  }
}

.menu-permissions-container {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.menu-permissions-header {
  background-color: #f9fafb;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;

  .select-all-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #374151;

    input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .select-all-text {
      font-weight: 600;
    }
  }
}

.menu-permissions-table {
  max-height: 200px;
  overflow-y: auto;
  width: 100%;

  :deep(.accordion-table-container) {
    box-shadow: none;
    border-radius: 0;
    width: 100%;
  }

  :deep(.accordion-table) {
    width: 100%;
    table-layout: fixed;

    thead {
      display: none; // 헤더 숨기기
    }

    tbody {
      tr {
        border-bottom: 1px solid #f3f4f6;

        &:hover {
          background-color: #f9fafb;
        }

        &.child-row {
          background-color: #fafbfc;

          &:hover {
            background-color: #f3f4f6;
          }
        }
      }

      td {
        padding: 8px 16px;
        font-size: 14px;
        color: #374151;
      }
    }
  }

  :deep(.expand-cell-content) {
    gap: 6px;
  }

  :deep(.child-cell-content) {
    padding-left: 20px;
  }

  :deep(.menu-name) {
    font-weight: 500;
  }

  :deep(input[type="checkbox"]) {
    width: 16px;
    height: 16px;
    margin: 0;
    cursor: pointer;
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
