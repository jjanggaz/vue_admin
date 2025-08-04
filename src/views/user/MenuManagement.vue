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
              value="wai"
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
              value="admin"
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
      :data="menuList"
      :loading="loading"
      expand-column="name"
      children-key="children"
      row-key="id"
      :expanded-items="expandedMenus"
      @row-click="handleRowClick"
      @child-row-click="handleChildRowClick"
      @expand="handleExpand"
    >
      <template #cell-name="{ item, isChild }">
        <span class="menu-name">{{ item.name }}</span>
      </template>

      <template #cell-type="{ item }">
        {{ t(`menuManagement.menuTypes.${item.type}`) }}
      </template>

      <template #cell-usage="{ item }">
        <span :class="['usage-status', item.usage ? 'used' : 'unused']">
          {{
            item.usage ? t("menuManagement.used") : t("menuManagement.unused")
          }}
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
            <dt>{{ t("columns.menu.menuName") }}</dt>
            <dd>
              <input
                v-model="editingMenu.name"
                type="text"
                :placeholder="t('placeholder.enterMenuName')"
              />
            </dd>
            <dt>{{ t("columns.menu.menuType") }}</dt>
            <dd>
              <select v-model="editingMenu.type">
                <option value="list">
                  {{ t("menuManagement.menuTypes.list") }}
                </option>
                <option value="menu">
                  {{ t("menuManagement.menuTypes.menu") }}
                </option>
              </select>
            </dd>
            <dt>{{ t("columns.menu.sortOrder") }}</dt>
            <dd>
              <input
                v-model="editingMenu.sortOrder"
                type="text"
                :placeholder="t('placeholder.enterSortOrder')"
              />
            </dd>
            <dt>{{ t("columns.menu.usage") }}</dt>
            <dd>
              <select v-model="editingMenu.usage">
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
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import AccordionTable, {
  type AccordionTableColumn,
} from "@/components/common/AccordionTable.vue";

const { t } = useI18n();

// 메뉴 인터페이스
interface MenuItem {
  id: number;
  name: string;
  type: "list" | "menu";
  sortOrder: string;
  usage: boolean;
  children?: MenuItem[];
}

// 상태 관리
const selectedMenuType = ref("wai");
const expandedMenus = ref<MenuItem[]>([]);
const isEditModalOpen = ref(false);
const loading = ref(true); // 초기 로딩 상태를 true로 설정
const editingMenu = ref<MenuItem>({
  id: 0,
  name: "",
  type: "menu",
  sortOrder: "",
  usage: true,
});

// 테이블 컬럼 설정
const tableColumns: AccordionTableColumn[] = [
  {
    key: "name",
    title: t("columns.menu.menuName"),
    width: "40%",
  },
  {
    key: "type",
    title: t("columns.menu.menuType"),
    width: "15%",
  },
  {
    key: "sortOrder",
    title: t("columns.menu.sortOrder"),
    width: "15%",
  },
  {
    key: "usage",
    title: t("columns.menu.usage"),
    width: "15%",
  },
  {
    key: "edit",
    title: t("columns.menu.edit"),
    width: "15%",
  },
];

// 샘플 메뉴 데이터
const menuList = ref<MenuItem[]>([
  {
    id: 1,
    name: "프로젝트",
    type: "list",
    sortOrder: "1",
    usage: true,
    children: [
      {
        id: 11,
        name: "신규 생성",
        type: "menu",
        sortOrder: "1-1",
        usage: true,
      },
      {
        id: 12,
        name: "기존 프로젝트 불러오기",
        type: "menu",
        sortOrder: "1-2",
        usage: true,
      },
      {
        id: 13,
        name: "추천 프로젝트 불러오기",
        type: "menu",
        sortOrder: "1-3",
        usage: true,
      },
      {
        id: 14,
        name: "프로젝트 승인",
        type: "menu",
        sortOrder: "1-4",
        usage: true,
      },
    ],
  },
  {
    id: 2,
    name: "공정계획",
    type: "list",
    sortOrder: "2",
    usage: false,
    children: [
      {
        id: 21,
        name: "프로세스",
        type: "list",
        sortOrder: "2-1",
        usage: false,
      },
      {
        id: 22,
        name: "공정시나리오",
        type: "menu",
        sortOrder: "2-2",
        usage: false,
      },
    ],
  },
  {
    id: 3,
    name: "검토",
    type: "menu",
    sortOrder: "3",
    usage: true,
  },
  {
    id: 4,
    name: "기기리스트",
    type: "list",
    sortOrder: "4",
    usage: true,
  },
  {
    id: 5,
    name: "P&ID",
    type: "menu",
    sortOrder: "5",
    usage: true,
  },
  {
    id: 6,
    name: "PFD",
    type: "menu",
    sortOrder: "6",
    usage: true,
  },
  {
    id: 7,
    name: "물질수지 및 계산서",
    type: "menu",
    sortOrder: "7",
    usage: true,
  },
  {
    id: 8,
    name: "구조물 리스트",
    type: "menu",
    sortOrder: "8",
    usage: true,
  },
]);

// 행 클릭 핸들러
const handleRowClick = (item: MenuItem, index: number) => {
  console.log("Row clicked:", item);
};

// 자식 행 클릭 핸들러
const handleChildRowClick = (
  child: MenuItem,
  parent: MenuItem,
  childIndex: number
) => {
  console.log("Child row clicked:", child, parent);
};

// 확장/축소 핸들러
const handleExpand = (item: MenuItem, expanded: boolean) => {
  if (expanded) {
    expandedMenus.value.push(item);
  } else {
    const index = expandedMenus.value.findIndex((menu) => menu.id === item.id);
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
    // 실제로는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 메뉴 목록에서 해당 메뉴 찾아서 업데이트
    const updateMenuInList = (menus: MenuItem[], targetId: number): boolean => {
      for (let i = 0; i < menus.length; i++) {
        if (menus[i].id === targetId) {
          menus[i] = { ...editingMenu.value };
          return true;
        }
        if (menus[i].children) {
          if (updateMenuInList(menus[i].children!, targetId)) {
            return true;
          }
        }
      }
      return false;
    };

    updateMenuInList(menuList.value, editingMenu.value.id);

    isEditModalOpen.value = false;
    alert(t("messages.success.menuUpdated"));
  } catch (error: any) {
    console.error("메뉴 저장 실패:", error);
    const errorMessage = error?.message || t("messages.error.saveFailed");
    alert(errorMessage);
  }
};

// 데이터 로딩 함수
const loadData = async () => {
  try {
    loading.value = true;
    // 실제로는 API 호출
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 지연으로 로딩 시뮬레이션

    // 기본적으로 첫 번째 메뉴는 펼쳐진 상태로 시작
    if (menuList.value.length > 0) {
      expandedMenus.value.push(menuList.value[0]);
    }
  } catch (error: any) {
    console.error("데이터 로딩 실패:", error);
    const errorMessage = error?.message || "데이터 로딩에 실패했습니다.";
    alert(errorMessage);
  } finally {
    loading.value = false;
  }
};

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.menu-management {
  padding: 20px;
}

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
  max-width: 500px;
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

  &.btn-primary {
    background-color: #1e40af;
    color: white;

    &:hover {
      background-color: #1e3a8a;
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
</style>
