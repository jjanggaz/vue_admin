<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <!-- <img src="/public/images/logo/logo_wai_sd.svg" alt="" /> -->
      <img :src="logoWaiSd" alt="WAI SD Logo" />

      <!-- Navigation Menu -->
      <nav class="nav-menu">
        <!-- 권한에 따른 메뉴 동적 표시 -->
        <template v-for="menuItem in availableMenus" :key="menuItem.path">
          <router-link :to="menuItem.path" class="nav-item">
            <span class="nav-icon">
              <img
                :src="menuItem.icon"
                alt="menu icon"
                width="24"
                height="24"
              />
            </span>
            <span class="nav-text">{{ t(menuItem.titleKey) }}</span>
          </router-link>
        </template>

        <!-- <router-link to="/test" class="nav-item">
          <span class="nav-icon">🧪</span>
          <span class="nav-text">{{ t("sidebar.test") }}</span>
        </router-link> -->
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import logoWaiSd from "@/assets/images/logo/logo_wai_sd.svg";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// 코드 기반 메뉴 정의
const codeBasedMenus = {
  WEB01: {
    path: "/dashboard",
    icon: "/images/icons/WEB01.svg",
    titleKey: "sidebar.dashboard",
  },
  WEB02: {
    path: "/code",
    icon: "/images/icons/ico_code.svg",
    titleKey: "sidebar.code",
  },
  WEB03: {
    path: "/project",
    icon: "/images/icons/ico_project.svg",
    titleKey: "sidebar.project",
  },
  WEB04: {
    path: "/asset",
    icon: "/images/icons/ico_inflow.svg",
    titleKey: "sidebar.asset",
  },
  WEB05: {
    path: "/process",
    icon: "/images/icons/ico_process.svg",
    titleKey: "sidebar.process",
  },
  WEB06: {
    path: "/machine",
    icon: "/images/icons/ico_constType.svg",
    titleKey: "sidebar.machine",
  },
  WEB07: {
    path: "/cost",
    icon: "/images/icons/ico_price.svg",
    titleKey: "sidebar.cost",
  },
  WEB08: {
    path: "/model",
    icon: "/images/icons/WEB08.svg",
    titleKey: "sidebar.model",
  },
  WEB09: {
    path: "/user",
    icon: "/images/icons/ico_user.svg",
    titleKey: "sidebar.user",
  },
  WEB10: {
    path: "/vendors",
    icon: "/images/icons/WEB10.svg",
    titleKey: "sidebar.vendors",
  },
};

// 현재 사용자 코드에 따른 메뉴 계산
const availableMenus = computed(() => {
  const userCodes = authStore.user?.codes;

  if (!userCodes || userCodes.length === 0) {
    return [];
  }

  // 코드 기반으로 메뉴 필터링
  return userCodes
    .map((code) => codeBasedMenus[code as keyof typeof codeBasedMenus])
    .filter(Boolean);
  // 라우트 확인 로직 비활성화 (타이밍 이슈로 인해)
  // .filter((menu) => {
  //   return router.hasRoute(menu.path.substring(1)); // '/' 제거
  // });
});
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  background-color: $background-darker;
  z-index: 100;

  .sidebar-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    img {
      width: 220px;
      height: auto;
      margin: $spacing-lg auto;
      padding: 0 $spacing-lg;
      object-fit: contain;
    }
  }

  .nav-menu {
    flex: 1;
    padding: $spacing-sm 0;

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0 $spacing-lg;
      color: rgba($text-white, 0.7);
      text-decoration: none;
      cursor: pointer;
      transition: $transition-base;
      border-left: 3px solid transparent;

      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: $text-white;
      }

      &.router-link-active {
        background-color: rgba($primary-color, 0.1);
        color: $text-white;
        border-left-color: $primary-color;

        .nav-icon {
          color: $primary-color;
        }
      }

      .nav-icon {
        font-size: 18px;
        margin-right: $spacing-md;
        width: 24px;
        height: 60px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .nav-text {
        font-size: $font-size-base;
        font-weight: $font-weight-md;
      }
    }
  }
}

@media (max-width: $breakpoint-lg) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.open {
      transform: translateX(0);
    }
  }
}
</style>
