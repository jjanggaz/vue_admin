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
        <button class="btn-view" @click.stop="viewMenuPermissions(item)">
          {{ t("common.view") }}
        </button>
      </template>
    </DataTable>

    <!-- Pagination -->
    <div class="pagination-container">
      <div class="total-count">
        {{
          t("common.totalCount", {
            count: roleStore.totalCount || 0,
          })
        }}
      </div>
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
          <button class="btn-close" @click="closeModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <dl class="column-regist">
              <div class="regist-item">
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
              </div>
              <div class="regist-item">
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
              </div>
              <div class="regist-item">
                <dt>{{ t("columns.roleGroup.description") }}</dt>
                <dd>
                  <input
                    id="role-description"
                    v-model="roleForm.description"
                    type="text"
                    :placeholder="t('placeholder.enterDescription')"
                  />
                </dd>
              </div>
              <div class="regist-item">
                <dt>{{ t("columns.roleGroup.status") }}</dt>
                <dd>
                  <select v-model="roleForm.is_active" required>
                    <option :value="true">{{ t("common.active") }}</option>
                    <option :value="false">{{ t("common.inactive") }}</option>
                  </select>
                </dd>
              </div>
            </dl>

            <!-- 메뉴 권한 선택 섹션 -->
            <div class="menu-permissions-section first-section">
              <h4>{{ t("columns.roleGroup.menuPermissions") }}</h4>

              <div class="menu-tables-container">
                <!-- WAI_WEB_VIEW 메뉴 테이블 -->
                <div class="menu-table-wrapper">
                  <h5>{{ t("menuManagement.waiDesignMenu") }}</h5>
                  <AccordionTable
                    :columns="viewMenuColumns"
                    :data="viewMenus"
                    :loading="false"
                    expand-column="menu_name"
                    children-key="children"
                    row-key="menu_id"
                    :selectable="true"
                    :selection-mode="'multiple'"
                    :selected-items="selectedViewMenus"
                    @selection-change="handleViewMenuSelection"
                  >
                    <template #cell-menu_name="{ item }">
                      <span class="menu-name">{{ item.menu_name }}</span>
                    </template>
                    <template #cell-menu_type="{ item }">
                      {{ item.menu_type }}
                    </template>
                    <template #cell-menu_order="{ item }">
                      {{ item.menu_order }}
                    </template>
                  </AccordionTable>
                </div>

                <!-- WAI_WEB_ADMIN 메뉴 테이블 -->
                <div class="menu-table-wrapper">
                  <h5>{{ t("menuManagement.adminMenu") }}</h5>
                  <AccordionTable
                    :columns="adminMenuColumns"
                    :data="adminMenus"
                    :loading="false"
                    expand-column="menu_name"
                    children-key="children"
                    row-key="menu_id"
                    :selectable="true"
                    :selection-mode="'multiple'"
                    :selected-items="selectedAdminMenus"
                    @selection-change="handleAdminMenuSelection"
                  >
                    <template #cell-menu_name="{ item }">
                      <span class="menu-name">{{ item.menu_name }}</span>
                    </template>
                    <template #cell-menu_type="{ item }">
                      {{ item.menu_type }}
                    </template>
                    <template #cell-menu_order="{ item }">
                      {{ item.menu_order }}
                    </template>
                  </AccordionTable>
                </div>
              </div>
            </div>
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

    <!-- 메뉴권한 상세 모달 -->
    <div v-if="isMenuPermissionsModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>
            {{ selectedRoleDetail?.role_name }} ({{
              selectedRoleDetail?.description
            }})
          </h3>
          <button class="btn-close" @click="closeMenuPermissionsModal">
          </button>
        </div>
        <div class="modal-body">
          <!-- WAI_WEB_VIEW 메뉴 테이블 -->
          <div class="menu-permissions-section">
            <h4>{{ t("menuManagement.waiDesignMenu") }}</h4>
            <AccordionTable
              :columns="menuPermissionsColumns"
              :data="getViewMenus(selectedRoleDetail?.menus || [])"
              :loading="roleStore.loading"
              expand-column="menu_name"
              children-key="children"
              row-key="menu_id"
              :expanded-items="[]"
            >
              <template #cell-menu_name="{ item }">
                <span class="menu-name">{{ item.menu_name }}</span>
              </template>
              <template #cell-menu_type="{ item }">
                {{ item.menu_type }}
              </template>
              <template #cell-menu_order="{ item }">
                {{ item.menu_order }}
              </template>
            </AccordionTable>
          </div>

          <!-- WAI_WEB_ADMIN 메뉴 테이블 -->
          <div class="menu-permissions-section">
            <h4>{{ t("menuManagement.adminMenu") }}</h4>
            <AccordionTable
              :columns="menuPermissionsColumns"
              :data="getAdminMenus(selectedRoleDetail?.menus || [])"
              :loading="roleStore.loading"
              expand-column="menu_name"
              children-key="children"
              row-key="menu_id"
              :expanded-items="[]"
            >
              <template #cell-menu_name="{ item }">
                <span class="menu_name">{{ item.menu_name }}</span>
              </template>
              <template #cell-menu_type="{ item }">
                {{ item.menu_type }}
              </template>
              <template #cell-menu_order="{ item }">
                {{ item.menu_order }}
              </template>
            </AccordionTable>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeMenuPermissionsModal">
            {{ t("common.close") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { useRoleStore } from "@/stores/roleStore";
import { useMenuStore } from "@/stores/menuStore";
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import DataTable from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import AccordionTable, {
  type AccordionTableColumn,
} from "@/components/common/AccordionTable.vue";
import type {
  Role,
  RoleFormData,
  RoleDetail,
  RoleMenuRequest,
} from "@/stores/roleStore";
import type { MenuItem } from "@/stores/menuStore";

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

const roleStore = useRoleStore();
const menuStore = useMenuStore();

// 상태 관리
const selectedItems = ref<Role[]>([]);
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const editingRoleId = ref<number | null>(null);
const isMenuPermissionsModalOpen = ref(false);
const selectedRoleDetail = ref<RoleDetail | null>(null);

// 메뉴 데이터 상태
const viewMenus = ref<MenuItem[]>([]);
const adminMenus = ref<MenuItem[]>([]);
const selectedViewMenus = ref<MenuItem[]>([]);
const selectedAdminMenus = ref<MenuItem[]>([]);

// 검색 관련
const searchField = ref("");
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

// 메뉴권한 테이블 컬럼 정의
const menuPermissionsColumns: AccordionTableColumn[] = [
  {
    key: "menu_name",
    title: t("menuManagement.columns.menuName"),
    width: "60%",
  },
  {
    key: "menu_type",
    title: t("menuManagement.columns.menuType"),
    width: "25%",
  },
  {
    key: "menu_order",
    title: t("menuManagement.columns.menuOrder"),
    width: "15%",
  },
];

// WAI_WEB_VIEW 메뉴 테이블 컬럼 정의
const viewMenuColumns: AccordionTableColumn[] = [
  {
    key: "selection",
    title: "",
    width: "40px",
  },
  {
    key: "menu_name",
    title: t("menuManagement.columns.menuName"),
    width: "200px",
  },
  {
    key: "menu_type",
    title: t("menuManagement.columns.menuType"),
    width: "120px",
  },
  {
    key: "menu_order",
    title: t("menuManagement.columns.menuOrder"),
    width: "80px",
  },
];

// WAI_WEB_ADMIN 메뉴 테이블 컬럼 정의
const adminMenuColumns: AccordionTableColumn[] = [
  {
    key: "selection",
    title: "",
    width: "40px",
  },
  {
    key: "menu_name",
    title: t("menuManagement.columns.menuName"),
    width: "200px",
  },
  {
    key: "menu_type",
    title: t("menuManagement.columns.menuType"),
    width: "120px",
  },
  {
    key: "menu_order",
    title: t("menuManagement.columns.menuOrder"),
    width: "80px",
  },
];

// 컴포넌트 마운트 시 권한 목록 로드
onMounted(async () => {
  await loadRoles();
  await loadMenuData();
});

// 권한 목록 로드
const loadRoles = async () => {
  try {
    // 체크된 row 초기화
    selectedItems.value = [];

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

// 메뉴 데이터 로드
const loadMenuData = async () => {
  try {
    // WAI_WEB_VIEW 메뉴 데이터 로드
    await menuStore.fetchMenus({ menu_type: "WAI_WEB_VIEW" });
    viewMenus.value = [...menuStore.menus];

    // WAI_WEB_ADMIN 메뉴 데이터 로드
    await menuStore.fetchMenus({ menu_type: "WAI_WEB_ADMIN" });
    adminMenus.value = [...menuStore.menus];
  } catch (error: any) {
    console.error("메뉴 데이터 로드 실패:", error);
  }
};

// 메뉴 선택 처리
const handleViewMenuSelection = (selectedItems: MenuItem[]) => {
  selectedViewMenus.value = [...selectedItems];
};

const handleAdminMenuSelection = (selectedItems: MenuItem[]) => {
  selectedAdminMenus.value = [...selectedItems];
};

// 메뉴권한 상세 모달에서 메뉴 분리 함수
const getViewMenus = (menus: any[]) => {
  return menus.filter((menu: any) => menu.system_code === "WAI_WEB_VIEW");
};

const getAdminMenus = (menus: any[]) => {
  return menus.filter((menu: any) => menu.system_code === "WAI_WEB_ADMIN");
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
const handleEdit = async () => {
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

    // 기존 권한의 메뉴 정보를 가져와서 선택 상태 복원
    try {
      const roleDetail = await roleStore.fetchRoleDetail(role.role_id);
      if (roleDetail && roleDetail.menus) {
        // 모든 레벨의 메뉴 ID를 재귀적으로 수집하는 함수
        const collectAllMenuIds = (menus: any[]): string[] => {
          const allIds: string[] = [];

          menus.forEach((menu) => {
            // 현재 메뉴 ID 추가
            if (menu.menu_id) {
              allIds.push(menu.menu_id);
            }

            // children이 있으면 재귀적으로 처리
            if (menu.children && menu.children.length > 0) {
              allIds.push(...collectAllMenuIds(menu.children));
            }
          });

          return allIds;
        };

        // 모든 레벨의 메뉴 ID 수집
        const allExistingMenuIds = collectAllMenuIds(roleDetail.menus);
        console.log("수집된 모든 메뉴 ID들:", allExistingMenuIds);

        // WAI_WEB_VIEW 메뉴들에서 기존 선택된 것들 찾기 (모든 레벨 포함)
        const findSelectedMenus = (
          menus: MenuItem[],
          selectedIds: string[]
        ): MenuItem[] => {
          const selected: MenuItem[] = [];

          const traverseMenus = (menuList: MenuItem[]) => {
            menuList.forEach((menu) => {
              // 현재 메뉴가 선택되어 있는지 확인
              if (selectedIds.includes(menu.menu_id)) {
                selected.push(menu);
                console.log(
                  `메뉴 선택됨: ${menu.menu_name} (ID: ${menu.menu_id}, 타입: ${menu.menu_type})`
                );
              }

              // children이 있으면 재귀적으로 처리
              if (menu.children && menu.children.length > 0) {
                traverseMenus(menu.children);
              }
            });
          };

          traverseMenus(menus);
          return selected;
        };

        // VIEW 메뉴들에서 선택된 것들 찾기
        selectedViewMenus.value = findSelectedMenus(
          viewMenus.value,
          allExistingMenuIds
        );

        // ADMIN 메뉴들에서 선택된 것들 찾기
        selectedAdminMenus.value = findSelectedMenus(
          adminMenus.value,
          allExistingMenuIds
        );

        console.log("기존 선택된 메뉴 복원 (모든 레벨 포함):", {
          view: selectedViewMenus.value,
          admin: selectedAdminMenus.value,
        });
      }
    } catch (error) {
      console.error("기존 메뉴 정보 로드 실패:", error);
    }

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
        // 목록 새로고침
        await loadRoles();
      } catch (error) {
        console.error("권한 삭제 실패:", error);
        const errorMessage = translateMessage(
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : undefined,
          "messages.error.deleteFailed"
        );
        alert(errorMessage);
      }
    }
  }
};

// 폼 제출
const handleSubmit = async () => {
  try {
    // 선택된 메뉴들을 합쳐서 menus 배열 생성
    const selectedMenus = [
      ...selectedViewMenus.value,
      ...selectedAdminMenus.value,
    ];

    // roleForm에 menus 추가 - 필요한 모든 메뉴 정보 포함
    const formDataWithMenus = {
      ...roleForm,
      menus: selectedMenus.map(
        (menu): RoleMenuRequest => ({
          menu_id: menu.menu_id,
          menu_name: menu.menu_name,
          parent_menu_id: menu.parent_menu_id || null,
          system_code: menu.system_code || null,
          menu_type: menu.menu_type,
        })
      ),
    };

    if (isEditMode.value && editingRoleId.value) {
      await roleStore.updateRole(editingRoleId.value, formDataWithMenus);
      alert(t("messages.success.updateSuccess"));
    } else {
      await roleStore.createRole(formDataWithMenus);
      alert(t("messages.success.registerSuccess"));
    }

    closeModal();
    // 목록 새로고침
    await loadRoles();
  } catch (error: any) {
    console.error("권한 저장 실패:", error);
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.saveFailed"
    );
    alert(errorMessage);
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

  // 선택된 메뉴들도 초기화
  selectedViewMenus.value = [];
  selectedAdminMenus.value = [];

  console.log("폼 초기화 완료:", roleForm); // 디버깅용 로그
};

// 메뉴권한 상세 보기
const viewMenuPermissions = async (role: Role) => {
  try {
    const roleDetail = await roleStore.fetchRoleDetail(role.role_id);
    selectedRoleDetail.value = roleDetail;
    isMenuPermissionsModalOpen.value = true;
  } catch (error) {
    console.error("메뉴권한 조회 실패:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.loadFailed"
    );
    alert(errorMessage);
  }
};

// 메뉴권한 모달 닫기
const closeMenuPermissionsModal = () => {
  isMenuPermissionsModalOpen.value = false;
  selectedRoleDetail.value = null;
};
</script>

<style scoped>
.title-section {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.search-bar {
  flex: 1;
  margin-right: 20px;
}

.search-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-select {
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
    background-image: url(../../assets/icons/ico_select-up.svg);
  }
}

.search-input {
  min-width: 240px;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #e7e6ed;
  border-radius: 4px;
}

.btns {
  display: flex;
  gap: 10px;
}

.modal-container {
  min-width: 900px;
  max-width: 1200px;
}

.column-regist {
  grid-template-columns: repeat(4, minmax(200px, 1fr));
  gap: 20px 10px;
  margin-bottom: 0;

  .regist-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.column-regist dt {
  font-size: 13px;
  font-weight: 600;
  color: #333333;
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
  .btn {
    &:first-child {
      min-width: 770px;

      @media (max-width: 1200px) {
        width: calc(70% - 5px);
        min-width: calc(70% - 5px);
      }
    }
  }
}

.menu-permissions {
  margin-top: 20px;
}

.menu-permissions-section + .menu-permissions-section {
  margin-top: 40px;
}

.menu-permissions-section.first-section {
  margin-top: 20px;
}

.menu-permissions-section h4 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.menu-tables-container {
  display: flex;
  gap: 20px;
}

.menu-table-wrapper {
  flex: 1;
}

.menu-table-wrapper h5 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #555;
}

.usage-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.used {
    border: 1px solid #d4edda;
    color: #155724;
  }

  &.unused {
    border: 1px solid #f8d7da;
    color: #721c24;
  }
}
</style>
