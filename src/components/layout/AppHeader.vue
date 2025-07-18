<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Page Title -->
      <div class="page-title-section">
        <h1 class="page-title">{{ currentPageTitle }}</h1>
      </div>

      <!-- Tab Navigation -->
      <div class="navigation-section">
        <TabNavigation v-if="currentTabs.length > 0" :tabs="currentTabs" />
      </div>

      <!-- User Section -->
      <div class="user-section">
        <span class="user-id">{{ userName }} ({{ userRole }}) &nbsp;</span>
        <Date />
        <button class="logout-btn" @click="handleLogout">
          {{ t("common.logout") }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
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
const userName = authStore.user?.username;
const userRole = authStore.user?.role;

console.log(
  "[AppHeader.vue] store/authStore.ts > authStore.user : ",
  userName,
  ", userRole : ",
  userRole
);

const handleLogout = () => {
  console.log("[AppHeader.vue] handleLogout()");
  authStore.logout();
  router.push("/login");
};

// 각 섹션별 탭들 정의
const sectionTabs = {
  model: [
    { name: "Model3D", label: t("tabs.model.model3d"), to: "/model/3d" },
    {
      name: "RevitManagement",
      label: t("tabs.model.revitManagement"),
      to: "/model/revit",
    },
    {
      name: "StandardManagement",
      label: t("tabs.model.standardManagement"),
      to: "/model/standard",
    },
  ],
  asset: [
    { name: "Inflow", label: t("tabs.asset.inflow"), to: "/asset/inflow" },
    { name: "Outflow", label: t("tabs.asset.outflow"), to: "/asset/outflow" },
    {
      name: "RecommendedProcess",
      label: t("tabs.asset.recommendedProcess"),
      to: "/asset/recommended",
    },
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
      name: "ProjectApp",
      label: t("tabs.project.projectApp"),
      to: "/project/projectApp",
    },
    {
      name: "ProjectItem",
      label: t("tabs.project.projectItem"),
      to: "/project/projectItem",
    },
  ],
  machine: [
    {
      name: "Machine",
      label: t("tabs.machine.machine"),
      to: "/machine/machine",
    },
    {
      name: "MachineCodeManagement",
      label: t("tabs.machine.machineCodeManagement"),
      to: "/machine/codeMng",
    },
    {
      name: "CostTarget",
      label: t("tabs.machine.costTarget"),
      to: "/machine/costTarget",
    },
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

  return t("pageTitles.default");
});
</script>

<style scoped lang="scss">
.app-header {
  position: fixed;
  top: 0;
  left: 250px;
  right: 0;
  height: 70px;
  background-color: $background-color;
  border-bottom: 1px solid $border-color;
  z-index: 90;

  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-xl;
    gap: $spacing-xl;
  }

  .page-title-section {
    .page-title {
      font-size: $font-size-xl;
      font-weight: $font-weight-bold;
      color: $text-color;
      margin: 0;
      white-space: nowrap;
    }
  }

  .navigation-section {
    flex: 1;
    display: flex;
    align-items: center;

    :deep(.tab-navigation) {
      border-bottom: none;
      background: transparent;
      width: 100%;

      .tab-item {
        height: 70px;
        border-bottom: 3px solid transparent;
        border-radius: 0;
        padding: 0 $spacing-lg;
        font-size: $font-size-sm;
        color: $text-light;

        &:hover:not(.disabled) {
          background: $background-light;
        }

        &.active {
          border-bottom-color: $primary-color;
          background: transparent;
          color: $primary-color;
          font-weight: $font-weight-md;
        }

        &:not(.active) {
          color: $text-light;
          border-bottom-color: transparent;
        }
      }
    }
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: $spacing-lg;

    .user-id {
      color: $text-light;
      font-size: $font-size-sm;
    }

    .logout-btn {
      padding: $spacing-xs $spacing-md;
      background-color: transparent;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
      color: $text-light;
      font-size: $font-size-sm;
      cursor: pointer;
      transition: $transition-base;

      &:hover {
        background-color: $background-light;
        border-color: $primary-color;
        color: $primary-color;
      }
    }
  }
}

@media (max-width: $breakpoint-lg) {
  .app-header {
    left: 0;
  }
}
</style>
