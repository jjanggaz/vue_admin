<template>
  <div id="app">
    <!-- 전역 로딩 오버레이 -->
    <div v-if="loadingStore.isLoading" class="global-loading-overlay">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <span class="loading-text">{{ $t("common.loading") }}</span>
      </div>
    </div>
    <AppLayout v-if="!isLoginPage">
      <router-view />
    </AppLayout>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppLayout from "./components/layout/AppLayout.vue";
import { useLoadingStore } from "./stores/loadingStore";

const route = useRoute();
const loadingStore = useLoadingStore();

const isLoginPage = computed(() => {
  return route.meta.layout === "blank" || route.name === "Login";
});
</script>

<style lang="scss">
#app {
  height: 100vh;
}

.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(2px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 2rem 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e0e0e0;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: loading-spin 1s linear infinite;
}

.loading-text {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

@keyframes loading-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
