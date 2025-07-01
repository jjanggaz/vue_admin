<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-wrapper">
      <AppHeader />
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: $background-light;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px; // Sidebar width
}

.main-content {
  flex: 1;
  padding: $spacing-lg;
  background-color: $background-light;
  min-height: calc(100vh - 70px); // Header height
}

@media (max-width: $breakpoint-lg) {
  .main-wrapper {
    margin-left: 0;
  }
}
</style>
