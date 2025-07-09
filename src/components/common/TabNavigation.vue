<template>
  <div class="tab-navigation">
    <router-link 
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.to"
      class="tab-item"
      :class="{ 
        active: isActiveTab(tab),
        disabled: tab.disabled 
      }"
      @click="handleTabClick(tab)"
    >
      <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-text">{{ tab.label }}</span>
      <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

export interface TabItem {
  name: string
  label: string
  to: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

interface Props {
  tabs: TabItem[]
  activeByRoute?: boolean // 라우트 기반으로 활성 탭 결정
  activeTab?: string // 수동으로 활성 탭 지정
}

const props = withDefaults(defineProps<Props>(), {
  activeByRoute: true
})

const emit = defineEmits<{
  'tab-click': [tab: TabItem]
}>()

const route = useRoute()

const isActiveTab = (tab: TabItem): boolean => {
  if (props.activeByRoute) {
    // 라우트 기반 활성 상태 체크
    if (route.name === tab.name || route.path === tab.to) {
      return true
    }
    // 상세 페이지 같은 자식 경로일 경우, breadcrumb 첫 항목(label)과 탭 레이블 일치하면 활성
    const breadcrumb = (route.meta as any).breadcrumb as string[] | undefined
    if (breadcrumb && breadcrumb[0] === tab.label) {
      return true
    }
    return false
  } else {
    // 수동 지정된 활성 탭 체크
    return props.activeTab === tab.name
  }
}

const handleTabClick = (tab: TabItem) => {
  if (!tab.disabled) {
    emit('tab-click', tab)
  }
}
</script>

<style scoped lang="scss">
.tab-navigation {
  display: flex;
  border-bottom: 1px solid $border-color;
  margin-bottom: $spacing-xl;
  overflow-x: auto;
  scrollbar-width: none; // Firefox
  
  &::-webkit-scrollbar { // Chrome, Safari
    display: none;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    padding: $spacing-md $spacing-lg;
    text-decoration: none;
    color: $text-light;
    border-bottom: 2px solid transparent;
    transition: $transition-base;
    font-weight: $font-weight-md;
    white-space: nowrap;
    position: relative;
    
    &:hover:not(.disabled) {
      color: $primary-color;
      background-color: rgba($primary-color, 0.05);
    }

    &.active {
      color: $primary-color;
      border-bottom-color: $primary-color;
      background-color: rgba($primary-color, 0.08);
    }
    
    &.disabled {
      color: $text-light;
      opacity: 0.5;
      cursor: not-allowed;
      
      &:hover {
        color: $text-light;
        background-color: transparent;
      }
    }

    .tab-icon {
      font-size: $font-size-base;
    }

    .tab-text {
      font-size: $font-size-sm;
    }

    .tab-badge {
      background-color: $primary-color;
      color: white;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: $font-weight-bold;
    }
  }
}

// 반응형 처리
@media (max-width: $breakpoint-md) {
  .tab-navigation {
    .tab-item {
      padding: $spacing-sm $spacing-md;
      
      .tab-text {
        font-size: 12px;
      }
    }
  }
}

// 다크 모드 지원
@media (prefers-color-scheme: dark) {
  .tab-navigation {
    border-bottom-color: rgba(255, 255, 255, 0.1);
    
    .tab-item {
      color: rgba(56, 56, 56, 0.7);
      
      &:hover:not(.disabled) {
        color: $primary-color;
        background-color: rgba($primary-color, 0.1);
      }
      
      &.active {
        color: $primary-color;
        background-color: rgba($primary-color, 0.15);
      }
    }
  }
}
</style>
