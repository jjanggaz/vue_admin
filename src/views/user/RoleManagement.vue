<template>
  <div class="role-management">
    <!-- Title Section -->
    <div class="title-section">
      <h2 class="page-title">{{ t("columns.roleGroup.title") }}</h2>
    </div>

    <!-- Action Bar with Search and Buttons -->
    <div class="action-bar">
      <div class="search-bar">
        <div class="search-inputs">
          <select v-model="searchField" class="search-select">
            <option value="">
              {{ t("placeholder.selectItem") }}
            </option>
            <option value="role_code">
              {{ t("columns.roleGroup.roleCode") }}
            </option>
            <option value="role_name">
              {{ t("columns.roleGroup.roleName") }}
            </option>
            <option value="description">
              {{ t("columns.roleGroup.description") }}
            </option>
          </select>
          <input
            v-model="searchValue"
            type="text"
            :placeholder="t('placeholder.search')"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="btn btn-primary" @click="handleSearch">
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

    <!-- Role Table -->
    <DataTable
      :columns="tableColumns"
      :data="roleStore.roles"
      :loading="roleStore.loading"
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
      <template #cell-is_active="{ item }">
        <span :class="['status-badge', item.is_active ? 'active' : 'inactive']">
          {{ item.is_active ? t("common.active") : t("common.inactive") }}
        </span>
      </template>
      <template #cell-menu_permissions="{ item }">
        <span class="menu-permissions">
          {{ item.menu_permissions ? item.menu_permissions : "-" }}
        </span>
      </template>
    </DataTable>

    <!-- Pagination -->
    <div class="pagination-container">
      <Pagination
        :current-page="roleStore.page"
        :total-pages="Math.ceil(roleStore.totalCount / roleStore.page_size)"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 등록/수정 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>
            {{
              isEditMode
                ? t("columns.roleGroup.edit")
                : t("columns.roleGroup.register")
            }}
          </h3>
          <button class="btn-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <dl class="column-regist">
              <dt>{{ t("columns.roleGroup.roleCode") }}</dt>
              <dd>
                <input
                  id="role-code"
                  v-model="roleForm.role_code"
                  type="text"
                  :placeholder="t('placeholder.enterRoleCode')"
                  :disabled="isEditMode"
                  required
                />
              </dd>
              <dt>{{ t("columns.roleGroup.roleName") }}</dt>
              <dd>
                <input
                  id="role-name"
                  v-model="roleForm.role_name"
                  type="text"
                  :placeholder="t('placeholder.enterRoleName')"
                  required
                />
              </dd>
              <dt>{{ t("columns.roleGroup.description") }}</dt>
              <dd>
                <textarea
                  id="role-description"
                  v-model="roleForm.description"
                  :placeholder="t('placeholder.enterDescription')"
                  rows="3"
                ></textarea>
              </dd>
              <dt>{{ t("columns.roleGroup.status") }}</dt>
              <dd>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="roleForm.is_active" />
                  {{ t("common.active") }}
                </label>
              </dd>
            </dl>
            <div class="modal-footer">
              <button type="submit" class="btn btn-primary">
                {{ isEditMode ? t("common.update") : t("common.register") }}
              </button>
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModal"
              >
                {{ t("common.cancel") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { useRoleStore } from "@/stores/roleStore";
import { useI18n } from "vue-i18n";
import DataTable from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import type { Role, RoleFormData } from "@/stores/roleStore";

const { t } = useI18n();
const roleStore = useRoleStore();

// 상태 관리
const selectedItems = ref<Role[]>([]);
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const editingRoleId = ref<number | null>(null);

// 검색 관련
const searchField = ref("role_name");
const searchValue = ref("");

// 폼 데이터
const roleForm = reactive<RoleFormData>({
  role_code: "",
  role_name: "",
  description: "",
  is_active: true,
});

// 테이블 컬럼 정의
const tableColumns = [
  {
    key: "role_code",
    title: t("columns.roleGroup.roleCode"),
    width: "120px",
    sortable: true,
  },
  {
    key: "role_name",
    title: t("columns.roleGroup.roleName"),
    width: "150px",
    sortable: true,
  },
  {
    key: "description",
    title: t("columns.roleGroup.description"),
    width: "200px",
    sortable: false,
  },
  {
    key: "is_active",
    title: t("columns.roleGroup.status"),
    width: "100px",
    sortable: false,
  },
  {
    key: "menu_permissions",
    title: t("columns.roleGroup.menuPermissions"),
    width: "150px",
    sortable: false,
  },
];

// 컴포넌트 마운트 시 권한 목록 로드
onMounted(async () => {
  await loadRoles();
});

// 권한 목록 로드
const loadRoles = async () => {
  try {
    await roleStore.fetchRoles({
      search_field:
        searchField.value && searchValue.value ? searchField.value : undefined,
      search_value: searchValue.value || undefined,
      page: roleStore.page,
      page_size: roleStore.page_size,
    });
  } catch (error) {
    console.error("권한 목록 로드 실패:", error);
  }
};

// 검색 처리
const handleSearch = async () => {
  roleStore.page = 1;
  await loadRoles();
};

// 페이지 변경
const handlePageChange = async (page: number) => {
  await roleStore.changePage(page, {
    search_field:
      searchField.value && searchValue.value ? searchField.value : undefined,
    search_value: searchValue.value || undefined,
  });
};

// 정렬 변경
const handleSortChange = async (sortInfo: any) => {
  await roleStore.fetchRoles({
    search_field: searchField.value || undefined,
    search_value: searchValue.value || undefined,
    page: roleStore.page,
    page_size: roleStore.page_size,
    order_by: sortInfo.key || undefined,
    order_direction: sortInfo.direction || undefined,
  });
};

// 선택 변경
const handleSelectionChange = (items: Role[]) => {
  selectedItems.value = items;
};

// 행 클릭
const handleRowClick = (row: Role) => {
  console.log("행 클릭된 데이터:", row); // 디버깅용 로그
  selectedItems.value = [row];
  console.log("선택된 아이템:", selectedItems.value); // 디버깅용 로그
};

// 등록 모달 열기
const handleRegist = () => {
  isEditMode.value = false;
  editingRoleId.value = null;
  resetForm();
  isRegistModalOpen.value = true;
};

// 수정 모달 열기
const handleEdit = () => {
  if (selectedItems.value.length === 1) {
    const role = selectedItems.value[0];
    console.log("수정할 권한 데이터:", role); // 디버깅용 로그
    console.log("role.role_code:", role.role_code);
    console.log("role.role_name:", role.role_name);
    console.log("role.description:", role.description);
    console.log("role.is_active:", role.is_active);

    isEditMode.value = true;
    editingRoleId.value = role.role_id;

    // roleForm에 데이터 바인딩
    roleForm.role_code = role.role_code || "";
    roleForm.role_name = role.role_name || "";
    roleForm.description = role.description || "";
    roleForm.is_active = role.is_active !== undefined ? role.is_active : true;

    console.log("바인딩된 roleForm:", roleForm); // 디버깅용 로그
    isRegistModalOpen.value = true;
  }
};

// 삭제 처리
const handleDelete = async () => {
  if (selectedItems.value.length === 1) {
    const role = selectedItems.value[0];
    if (
      confirm(`${t("messages.confirm.confirmDelete")} "${role.role_name}"?`)
    ) {
      try {
        await roleStore.deleteRole(role.role_id);
        selectedItems.value = [];
        alert(t("messages.success.deleteSuccess"));
      } catch (error) {
        console.error("권한 삭제 실패:", error);
        alert(t("messages.error.deleteFailed"));
      }
    }
  }
};

// 폼 제출
const handleSubmit = async () => {
  try {
    if (isEditMode.value && editingRoleId.value) {
      await roleStore.updateRole(editingRoleId.value, roleForm);
      alert(t("messages.success.updateSuccess"));
    } else {
      await roleStore.createRole(roleForm);
      alert(t("messages.success.registerSuccess"));
    }

    closeModal();
    await loadRoles();
  } catch (error) {
    console.error("권한 저장 실패:", error);
    alert(t("messages.error.saveFailed"));
  }
};

// 모달 닫기
const closeModal = () => {
  isRegistModalOpen.value = false;
  resetForm();
};

// 폼 초기화
const resetForm = () => {
  roleForm.role_code = "";
  roleForm.role_name = "";
  roleForm.description = "";
  roleForm.is_active = true;
  console.log("폼 초기화 완료:", roleForm); // 디버깅용 로그
};
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.title-section {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.search-bar {
  flex: 1; /* Search bar takes available space */
  margin-right: 20px; /* Space between search bar and buttons */
}

.search-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 120px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.btns {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

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
  min-width: 500px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.column-regist dt {
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.column-regist dd {
  margin-bottom: 15px;
}

.column-regist input,
.column-regist textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.column-regist textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.modal-footer {
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.menu-permissions {
  color: #666;
  font-size: 14px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-delete {
  background-color: #dc3545;
}

.btn-delete:hover {
  background-color: #c82333;
}

.btn-delete:disabled {
  background-color: #6c757d;
}
</style>
