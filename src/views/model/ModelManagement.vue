<template>
  <div class="model-management-layout">
    
    <!-- Router View for Sub Pages -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 3D 모델 관리 메인 레이아웃
</script>

<style scoped lang="scss">
.model-management-layout {
  height: 100%;
  padding: $spacing-lg;
}

.action-header {
  justify-content: flex-end;
}
</style>
