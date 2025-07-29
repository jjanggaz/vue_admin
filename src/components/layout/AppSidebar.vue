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
            <span class="nav-icon">{{ menuItem.icon }}</span>
            <span class="nav-text">{{ t(menuItem.titleKey) }}</span>
          </router-link>
        </template>

        <router-link to="/test" class="nav-item">
          <span class="nav-icon">🧪</span>
          <span class="nav-text">{{ t("sidebar.test") }}</span>
        </router-link>
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
  WEB01: { path: "/dashboard", icon: "📊", titleKey: "sidebar.dashboard" },
  WEB02: { path: "/code", icon: "🔑", titleKey: "sidebar.code" },
  WEB03: { path: "/project", icon: "📁", titleKey: "sidebar.project" },
  WEB04: { path: "/asset", icon: "⚙️", titleKey: "sidebar.asset" },
  WEB05: { path: "/process", icon: "🏗️", titleKey: "sidebar.process" },
  WEB06: { path: "/machine", icon: "🏭", titleKey: "sidebar.machine" },
  WEB07: { path: "/cost", icon: "💰", titleKey: "sidebar.cost" },
  WEB08: { path: "/model", icon: "📦", titleKey: "sidebar.model" },
  WEB09: { path: "/user", icon: "👥", titleKey: "sidebar.user" },
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
  background-color: $primary-color;
  color: white;
  z-index: 1000;
  overflow-y: auto;
}

.sidebar-content {
  padding: $spacing-lg;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-content img {
  width: 120px;
  margin-bottom: $spacing-xl;
  align-self: center;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: $spacing-md;
  text-decoration: none;
  color: white;
  border-radius: $border-radius-md;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.router-link-active {
    background-color: rgba(255, 255, 255, 0.2);
    font-weight: 600;
  }
}

.nav-icon {
  margin-right: $spacing-md;
  font-size: 1.2em;
}

.nav-text {
  font-size: 0.9em;
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
