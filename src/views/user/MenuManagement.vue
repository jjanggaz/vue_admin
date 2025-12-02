<template>
  <div class="menu-management">
    <!-- Header Section -->
    <div class="header-section">
      <h2 class="page-title">{{ t("menuManagement.title") }}</h2>

      <!-- Menu Type Selection -->
      <div class="menu-type-section">
        <h3>{{ t("menuManagement.menuType") }}</h3>
        <div class="radio-group">
          <label class="radio-label" :class="{ active: selectedMenuType === 'WAI_WEB_VIEW' }">
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
          <label class="radio-label" :class="{ active: selectedMenuType === 'WAI_WEB_ADMIN' }">
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
        <button class="btn btn-edit sm" @click.stop="editMenu(item)">
          {{ t("common.edit") }}
        </button>
      </template>
    </AccordionTable>

    <!-- Edit Menu Modal -->
    <div v-if="isEditModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ t("menuManagement.editMenu") }}</h3>
          <button class="btn-close" @click="isEditModalOpen = false"></button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <div class="regist-item">
              <dt>{{ t("menuManagement.columns.menuName") }}</dt>
              <dd>
                <input
                  v-model="editingMenu.menu_name"
                  type="text"
                  :placeholder="t('placeholder.enterMenuName')"
                  disabled
                />
              </dd>
            </div>
            <div class="regist-item">
              <dt>{{ t("menuManagement.columns.menuOrder") }}</dt>
              <dd>
                <input
                  v-model="editingMenu.menu_order"
                  type="number"
                  :placeholder="t('placeholder.enterMenuOrder')"
                />
              </dd>
            </div>
            <div class="regist-item">
              <dt>{{ t("menuManagement.columns.isActive") }}</dt>
              <dd>
                <select v-model="editingMenu.is_active">
                  <option :value="true">{{ t("menuManagement.used") }}</option>
                  <option :value="false">{{ t("menuManagement.unused") }}</option>
                </select>
              </dd>
            </div>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="saveMenu">
            {{ t("common.save") }}
          </button>
          <button class="btn btn-secondary" @click="isEditModalOpen = false">
            {{ t("common.cancel") }}
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
.header-section {
  margin-bottom: 10px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 20px;
}

.menu-type-section {
  margin-bottom: 20px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 4px;
  }
}

.menu-list-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.usage-status {
  display: inline-block;
  height: 20px;
  line-height: 1.4;
  padding: 0 8px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 500;

  &.used {
    border: 1px solid #34C759;
    color: #34C759;
  }

  &.unused {
    border: 1px solid #707489;
    color: #707489;
  }
}

.column-regist {
  grid-template-columns: repeat(1, minmax(150px, 1fr));
  gap: 20px 10px;
  margin-bottom: 0;

  .regist-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
  }

  dt {
    min-width: 80px;
    color: #333333;
    font-size: 13px;
    font-weight: 600;
  }
}

.radio-group {
  gap: 0;

  .radio-label {
    background-color: #e7e6ed;
    border-radius: 10px 10px 0 0;
    height: 40px;
    padding: 0 20px;
    color: #484848;
    font-size: 15px;
    font-weight: 500;
    gap: 0;
    transition: background-color .2s ease-in-out;
  
    input[type="radio"] {
      display: none;
    }

    &.active {
      background-color: #0863e2;
      
      .radio-text {
        color: #ffffff;
      }
    }
  }
}
</style>
