<template>
  <div class="model-management-layout">
    <!-- Action Header -->
    <div class="action-header">
      <button class="add-btn">
        <span class="add-icon">+</span>
        새모델 업로드
      </button>
    </div>
    
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
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: $spacing-xl;
  
  .add-btn {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-sm $spacing-md;
    background-color: $primary-color;
    color: $text-white;
    border: none;
    border-radius: $border-radius-md;
    font-weight: $font-weight-md;
    cursor: pointer;
    transition: $transition-base;
    
    &:hover {
      background-color: darken($primary-color, 10%);
    }
    
    .add-icon {
      font-size: $font-size-lg;
      font-weight: $font-weight-bold;
    }
  }
}
</style>
