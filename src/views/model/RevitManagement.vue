<template>
  <div class="revit-management">
    <!-- Tab Navigation -->
    <TabNavigation 
      :tabs="tabItems" 
      @tab-click="handleTabClick" 
    />
    
    <div class="content">
      <h2>Revit 관리</h2>
      <p>Revit 파일 관리 페이지입니다.</p>
      
      <!-- 여기에 Revit 관련 컨텐츠 추가 -->
      <div class="placeholder-content">
        <div class="empty-state">
          <span class="empty-icon">🏗️</span>
          <h3>Revit 파일 관리</h3>
          <p>Revit 파일을 업로드하고 관리할 수 있습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TabNavigation, { type TabItem } from '@/components/common/TabNavigation.vue'

// 탭 설정 (Model3D와 동일)
const tabItems: TabItem[] = [
  {
    name: 'Model3D',
    label: '3D 모델 관리',
    to: '/model/3d',
    icon: '📦'
  },
  {
    name: 'RevitManagement',
    label: 'Revit 관리',
    to: '/model/revit',
    icon: '🏗️'
  },
  {
    name: 'StandardManagement',
    label: '표준배치 관리',
    to: '/model/standard',
    icon: '📐'
  }
]

const handleTabClick = (tab: TabItem) => {
  console.log('Tab clicked:', tab.name)
}
</script>

<style scoped lang="scss">
.revit-management {
  padding: $spacing-lg;
}

.content {
  h2 {
    color: $text-color;
    margin-bottom: $spacing-md;
  }
  
  p {
    color: $text-light;
    margin-bottom: $spacing-lg;
  }
}

.placeholder-content {
  background-color: $background-color;
  border-radius: $border-radius-lg;
  padding: $spacing-xxl;
  text-align: center;
  border: 1px solid $border-color;
}

.empty-state {
  .empty-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: $spacing-lg;
  }
  
  h3 {
    color: $text-color;
    margin-bottom: $spacing-md;
  }
  
  p {
    color: $text-light;
    max-width: 400px;
    margin: 0 auto;
  }
}
</style>
