<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Page Title -->
      <div class="page-title-section">
        <h1 class="page-title">{{ currentPageTitle }}</h1>
      </div>

      <!-- Tab Navigation -->
      <div class="navigation-section">
        <TabNavigation v-if="currentTabs.length > 1" :tabs="currentTabs" />
      </div>

      <!-- User Section -->
      <div class="user-section">
        <!-- <Date /> -->
        <span class="user-id">
          <span class="user-name">{{ userName }}</span
          ><br />
          <span class="user-info">{{ userRole ? ` (${userRole})` : "" }}</span>
        </span>
        <button class="logout-btn" @click="handleLogout">
          {{ t("common.logout") }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import { computed } from "vue";
import TabNavigation from "@/components/common/TabNavigation.vue";
import type { TabItem } from "@/components/common/TabNavigation.vue";
import Date from "../../utils/headerDate.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();
const userName = authStore.user?.fullName;
const userRole = authStore.user?.roleName;

console.log("[AppHeader.vue] store/authStore.ts > authStore.user : ", userName);
console.log(
  "[AppHeader.vue] store/authStore.ts > authStore.user.roleName : ",
  userRole
);

const handleLogout = async () => {
  console.log("[AppHeader.vue] handleLogout()");
  await authStore.logout();
  router.push("/login");
};

// 각 섹션별 탭들 정의
const sectionTabs = {
  model: [
    {
      name: "RevitManagement",
      label: t("tabs.model.revitManagement"),
      to: "/model/revit",
    },
    {
      name: "StandardPlacement",
      label: t("tabs.model.standardPlacement"),
      to: "/model/standard",
    },
    {
      name: "3D Asset",
      label: t("tabs.model.asset3d"),
      to: "/model/3dAsset",
    },
  ],
  asset: [
    { name: "Inflow", label: t("tabs.asset.inflow"), to: "/asset/inflow" },
    { name: "Outflow", label: t("tabs.asset.outflow"), to: "/asset/outflow" },
    // {
    //   name: "RecommendedProcess",
    //   label: t("tabs.asset.recommendedProcess"),
    //   to: "/asset/recommended",
    // },
  ],
  process: [
    {
      name: "Process",
      label: t("tabs.process.process"),
      to: "/process/process",
    },
    // { name: 'Output', label: '공정 출력', to: '/process/output' }
  ],
  project: [
    {
      name: "Project",
      label: t("tabs.project.project"),
      to: "/project/project",
    },
    {
      name: "ApprovalPending",
      label: t("tabs.project.approvalPending"),
      to: "/project/approvalPending",
    },
    {
      name: "RecommendedProject",
      label: t("tabs.project.recommendedProject"),
      to: "/project/recommendedProject",
    },
  ],
  machine: [
    {
      name: "Structure",
      label: t("tabs.machine.structure"),
      to: "/machine/structure",
    },
    {
      name: "Machine",
      label: t("tabs.machine.machine"),
      to: "/machine/machine",
    },
    {
      name: "Pipe",
      label: t("tabs.machine.pipe"),
      to: "/machine/pipe",
    },
    {
      name: "Electrical",
      label: t("tabs.machine.electrical"),
      to: "/machine/electrical",
    },
    {
      name: "Measurement",
      label: t("tabs.machine.measurement"),
      to: "/machine/measurement",
    },
    {
      name: "Asset3D",
      label: t("tabs.machine.3dAsset"),
      to: "/machine/asset3D",
    },
  ],
  user: [
    {
      name: "AccountManagement",
      label: t("tabs.user.account"),
      to: "/user/account",
    },
    { name: "RoleManagement", label: t("tabs.user.role"), to: "/user/role" },
    { name: "MenuManagement", label: t("tabs.user.menu"), to: "/user/menu" },
  ],
  // 향후 다른 섹션에 하위 탭이 필요하면 여기에 추가
  // project: [
  //   {
  //     name: 'ProjectList',
  //     label: '프로젝트 목록',
  //     to: '/project/list'
  //   },
  //   {
  //     name: 'ProjectCreate',
  //     label: '프로젝트 생성',
  //     to: '/project/create'
  //   }
  // ]
};

// 현재 라우트에 따라 표시할 탭들을 계산
const currentTabs = computed<TabItem[]>(() => {
  const currentPath = route.path;

  // 3D 모델 관리 섹션인 경우
  if (currentPath.startsWith("/model")) {
    return sectionTabs.model;
  } else if (currentPath.startsWith("/asset")) {
    return sectionTabs.asset;
  } else if (currentPath.startsWith("/process")) {
    // 공정 관리 섹션인 경우
    return sectionTabs.process;
  } else if (currentPath.startsWith("/project")) {
    return sectionTabs.project;
  } else if (currentPath.startsWith("/machine")) {
    return sectionTabs.machine;
  } else if (currentPath.startsWith("/user")) {
    return sectionTabs.user;
  }

  // 다른 섹션들은 탭이 없음 (단일 페이지)
  return [];
});

// 현재 페이지 제목을 계산
const currentPageTitle = computed<string>(() => {
  const currentPath = route.path;

  // 1뎁스 경로별 제목 (탭을 포함하는 상위 섹션 제목)
  if (currentPath.startsWith("/dashboard")) return t("pageTitles.dashboard");
  if (currentPath.startsWith("/project"))
    return t("pageTitles.projectManagement");
  if (currentPath.startsWith("/asset")) return t("pageTitles.assetManagement");
  if (currentPath.startsWith("/process"))
    return t("pageTitles.processManagement");
  if (currentPath.startsWith("/model")) return t("pageTitles.modelManagement"); // 하위 탭이 있는 경우에도 상위 제목 유지
  if (currentPath.startsWith("/machine"))
    return t("pageTitles.machineManagement");
  if (currentPath.startsWith("/user")) return t("pageTitles.userManagement");
  if (currentPath.startsWith("/code")) return t("pageTitles.codeManagement");
  if (currentPath.startsWith("/vendors"))
    return t("pageTitles.vendorsManagement");

  return t("pageTitles.default");
});
</script>

<style scoped lang="scss">
.user-id {
  color: #333333;
  font-size: $font-size-sm;
}

.app-header {
  position: fixed;
  top: 0;
  left: 260px;
  right: 0;
  height: 70px;
  background-color: #ffffff;
  border-bottom: 1px solid $border-form;
  z-index: 90;
  transition: left .3s ease;
}

:deep(.sidebar) {
  background-color: red !important;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $spacing-xxl;
  gap: 20px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
}

.page-title-section {
  .page-title {
    font-size: $font-size-xl;
    font-weight: 600;
    color: $text-color;
    margin: 0;
    white-space: nowrap;

    @media (max-width: 768px) {
      font-size: 20px;
    }
  }
}

.navigation-section {
  display: flex;
  align-items: center;
  flex: 1;
  overflow-x: auto;

  :deep(.tab-navigation) {
    border-bottom: none;
    background: transparent;
    width: 100%;

    .tab-item {
      height: 69px;
      border-bottom: 4px solid transparent;
      border-radius: 0;
      padding: 0 20px;
      font-size: $font-size-sm;
      color: #555555;

      &:hover:not(.disabled) {
        background: $background-light;
      }

      &.active {
        border-bottom-color: $text-sky;
        background: transparent;
        color: #000000;
        font-weight: 600;
      }

      &:not(.active) {
        color: #555555;
        border-bottom-color: transparent;
      }
    }
  }
}

.user-section {
  display: flex;
  align-items: center;
  gap: 30px;

  .user-id {
    font-size: $font-size-sm;
    font-weight: 600;

    .user-name {
      color: #333333;
      font-size: 14px;
      font-weight: 500;
    }

    .user-info {
      color: #484848;
      font-size: 12px;
      font-weight: 400;
    }
  }

  .logout-btn {
    min-width: 72px;
    height: 32px;
    padding: 0 $spacing-xs;
    background-color: transparent;
    border: 1px solid #333333;
    border-radius: 5px;
    color: #333333;
    font-size: 15px;
    font-weight: 600;

    &:hover {
      border-color: #279bd8;
      color: #279bd8;
    }
  }
}

@media (max-width: $breakpoint-lg) {
  .app-header {
    left: 0;
  }
}
</style>
