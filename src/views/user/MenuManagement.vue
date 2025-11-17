<template>
  <div class="menu-management">
    <!-- Header Section -->
    <div class="header-section">
      <h2 class="page-title">{{ t("menuManagement.title") }}</h2>

      <!-- Menu Type Selection -->
      <div class="menu-type-section">
        <h3>{{ t("menuManagement.menuType") }}</h3>
        <div class="radio-group">
          <label class="radio-label">
            <input
              type="radio"
              v-model="selectedMenuType"
              value="WAI_WEB_VIEW"
              name="menuType"
            />
            <span class="radio-text">{{
              t("menuManagement.waiDesignMenu")
            }}</span>
          </label>
          <label class="radio-label">
            <input
              type="radio"
              v-model="selectedMenuType"
              value="WAI_WEB_ADMIN"
              name="menuType"
            />
            <span class="radio-text">{{ t("menuManagement.adminMenu") }}</span>
          </label>
        </div>
      </div>

      <h3 class="menu-list-title">{{ t("menuManagement.menuList") }}</h3>
    </div>

    <!-- Menu List Table -->
    <AccordionTable
      :columns="tableColumns"
      :data="menuStore.menus"
      :loading="menuStore.loading"
      expand-column="menu_name"
      children-key="children"
      row-key="menu_id"
      :expanded-items="expandedMenus"
      @row-click="handleRowClick"
      @child-row-click="handleChildRowClick"
      @expand="handleExpand"
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

      <template #cell-is_active="{ item }">
        <span :class="['usage-status', item.is_active ? 'used' : 'unused']">
          {{ item.is_active ? t("common.used") : t("common.unused") }}
        </span>
      </template>

      <template #cell-edit="{ item }">
        <button class="btn-edit" @click.stop="editMenu(item)">
          {{ t("common.edit") }}
        </button>
      </template>
    </AccordionTable>

    <!-- Edit Menu Modal -->
    <div v-if="isEditModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ t("menuManagement.editMenu") }}</h3>
          <button class="btn-close" @click="isEditModalOpen = false">×</button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt>{{ t("menuManagement.columns.menuName") }}</dt>
            <dd>
              <input
                v-model="editingMenu.menu_name"
                type="text"
                :placeholder="t('placeholder.enterMenuName')"
                disabled
              />
            </dd>
            <dt>{{ t("menuManagement.columns.menuOrder") }}</dt>
            <dd>
              <input
                v-model="editingMenu.menu_order"
                type="number"
                :placeholder="t('placeholder.enterMenuOrder')"
              />
            </dd>
            <dt>{{ t("menuManagement.columns.isActive") }}</dt>
            <dd>
              <select v-model="editingMenu.is_active">
                <option :value="true">{{ t("menuManagement.used") }}</option>
                <option :value="false">{{ t("menuManagement.unused") }}</option>
              </select>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="isEditModalOpen = false">
            {{ t("common.cancel") }}
          </button>
          <button class="btn btn-primary" @click="saveMenu">
            {{ t("common.save") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import { useMenuStore } from "@/stores/menuStore";
import type { MenuItem } from "@/stores/menuStore";
import AccordionTable, {
  type AccordionTableColumn,
} from "@/components/common/AccordionTable.vue";

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

const menuStore = useMenuStore();

// 상태 관리
const selectedMenuType = ref("WAI_WEB_VIEW");
const expandedMenus = ref<MenuItem[]>([]);
const isEditModalOpen = ref(false);
const loading = ref(true); // 초기 로딩 상태를 true로 설정
const editingMenu = ref<MenuItem>({
  menu_id: "",
  menu_name: "",
  menu_type: "ROOT",
  menu_order: 0,
  is_active: true,
  system_code: "WAI_WEB_ADMIN",
  menu_code: "",
  route_path: "",
  icon: "",
  is_hide: false,
  created_at: "",
  updated_at: null,
  created_by: "",
  updated_by: null,
  parent_menu_id: null,
  component_path: null,
  api_endpoint: null,
  term_id: 0,
  children: [],
});

// 테이블 컬럼 설정
const tableColumns: AccordionTableColumn[] = [
  {
    key: "menu_name",
    title: t("menuManagement.columns.menuName"),
    width: "30%",
  },
  {
    key: "menu_type",
    title: t("menuManagement.columns.menuType"),
    width: "15%",
  },
  {
    key: "menu_order",
    title: t("menuManagement.columns.menuOrder"),
    width: "15%",
  },
  {
    key: "is_active",
    title: t("menuManagement.columns.isActive"),
    width: "15%",
  },
  {
    key: "edit",
    title: t("menuManagement.columns.edit"),
    width: "15%",
  },
];

// 샘플 메뉴 데이터는 이제 menuStore에서 관리

// 행 클릭 핸들러
const handleRowClick = (_item: MenuItem, _index: number) => {
  // 행 클릭 처리
};

// 자식 행 클릭 핸들러
const handleChildRowClick = (
  _child: MenuItem,
  _parent: MenuItem,
  _childIndex: number
) => {
  // 자식 행 클릭 처리
};

// 확장/축소 핸들러
const handleExpand = (item: MenuItem, expanded: boolean) => {
  if (expanded) {
    expandedMenus.value.push(item);
  } else {
    const index = expandedMenus.value.findIndex(
      (menu) => menu.menu_id === item.menu_id
    );
    if (index > -1) {
      expandedMenus.value.splice(index, 1);
    }
  }
};

// 메뉴 편집 함수
const editMenu = (menu: MenuItem) => {
  editingMenu.value = { ...menu };
  isEditModalOpen.value = true;
};

// 메뉴 저장 함수
const saveMenu = async () => {
  try {
    // menuStore를 사용하여 메뉴 수정
    await menuStore.updateMenu(editingMenu.value.menu_id, {
      menu_order: editingMenu.value.menu_order,
      is_active: editingMenu.value.is_active,
      system_code: selectedMenuType.value as "WAI_WEB_VIEW" | "WAI_WEB_ADMIN",
    });

    isEditModalOpen.value = false;
    alert(t("messages.success.menuUpdated"));

    // 수정 후 현재 선택된 메뉴 타입으로 데이터 재조회
    await loadData();
  } catch (error: any) {
    console.error("메뉴 저장 실패:", error);
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.saveFailed"
    );
    alert(errorMessage);
  }
};

// 데이터 로딩 함수
const loadData = async () => {
  try {
    loading.value = true;

    // menuStore를 사용하여 메뉴 타입별로 데이터 조회
    await menuStore.fetchMenus({
      menu_type: selectedMenuType.value as "WAI_WEB_VIEW" | "WAI_WEB_ADMIN",
    });

    // 기본적으로 첫 번째 메뉴는 펼쳐진 상태로 시작
    if (menuStore.menus.length > 0) {
      expandedMenus.value.push(menuStore.menus[0]);
    }
  } catch (error: any) {
    console.error("데이터 로딩 실패:", error);
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.loadFailed"
    );
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

// selectedMenuType 변경 감지하여 데이터 자동 로드
watch(selectedMenuType, () => {
  loadData();
});

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
// .menu-management {
//   padding: 20px;
// }

.header-section {
  margin-bottom: 30px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.menu-type-section {
  margin-bottom: 20px;

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #555;
    margin: 0 0 10px 0;
  }
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  input[type="radio"] {
    width: 16px;
    height: 16px;
    margin: 0;
  }

  .radio-text {
    font-size: 14px;
    color: #333;
  }
}

.menu-list-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.usage-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.used {
    background-color: #d4edda;
    color: #155724;
  }

  &.unused {
    background-color: #f8d7da;
    color: #721c24;
  }
}

.btn-edit {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;

  &:hover {
    background-color: #2563eb;
  }
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
    select {
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
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &.btn-secondary {
    background-color: #6b7280;
    color: white;

    &:hover {
      background-color: #4b5563;
    }
  }
}
</style>
