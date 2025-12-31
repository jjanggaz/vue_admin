<template>
  <div ref="tabNavigationRef" class="tab-navigation">
    <router-link
      v-for="(tab, index) in tabs"
      :key="tab.name"
      :to="tab.to"
      class="tab-item"
      :class="{
        active: isActiveTab(tab),
        disabled: tab.disabled,
      }"
      :ref="el => (tabRefs[index] = el)"
      @click="handleTabClick(tab, index, $event)"
    >
      <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-text">{{ tab.label }}</span>
      <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from "vue-router";
  import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";

  export interface TabItem {
    name: string;
    label: string;
    to: string;
    icon?: string;
    badge?: string | number;
    disabled?: boolean;
  }

  interface Props {
    tabs: TabItem[];
    activeByRoute?: boolean; // 라우트 기반으로 활성 탭 결정
    activeTab?: string; // 수동으로 활성 탭 지정
  }

  const props = withDefaults(defineProps<Props>(), {
    activeByRoute: true,
  });

  const emit = defineEmits<{"tab-click": [tab: TabItem];}>();

  const route = useRoute();
  const tabRefs = ref<any[]>([]);
  const tabNavigationRef = ref<HTMLElement | null>(null);

  // 마우스 휠로 좌우 스크롤 처리
  const handleWheelScroll = (e: WheelEvent) => {
    if (tabNavigationRef.value) {
      e.preventDefault();
      tabNavigationRef.value.scrollLeft += e.deltaY;
    }
  };

  // 로컬 스토리지 키
  const STORAGE_KEY = "activeTabIndex";

  const isActiveTab = (tab: TabItem): boolean => {
    if (props.activeByRoute) return route.path === tab.to;
    return props.activeTab === tab.name;
  };

  const handleTabClick = async (tab: TabItem, index: number, event: Event) => {
    if (tab.disabled) {
      event.preventDefault();
      return;
    }

    emit("tab-click", tab);

    // 선택한 탭 인덱스를 저장
    localStorage.setItem(STORAGE_KEY, index.toString());

    await nextTick();

    const link = tabRefs.value[index];
    const el = link?.$el as HTMLElement;

    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  // 새로고침 시 마지막 스크롤 위치 복원
  onMounted(async () => {
    await nextTick();

    const savedIndex = localStorage.getItem(STORAGE_KEY);
    if (savedIndex !== null) {
      const index = parseInt(savedIndex, 10);
      const link = tabRefs.value[index];
      const el = link?.$el as HTMLElement;
      el?.scrollIntoView({ behavior: "auto", inline: "start", block: "nearest" });
    }

    // 휠 이벤트 리스너 등록
    if (tabNavigationRef.value) {
      tabNavigationRef.value.addEventListener("wheel", handleWheelScroll, { passive: false });
    }
  });

  onUnmounted(() => {
    if (tabNavigationRef.value) {
      tabNavigationRef.value.removeEventListener("wheel", handleWheelScroll);
    }
  });

  // 라우트 변경 시 마지막 위치 업데이트 (옵션)
  watch(() => route.path, () => {
    if (props.activeByRoute) {
      const activeIndex = props.tabs.findIndex(t => t.to === route.path);
      
      if (activeIndex !== -1) {
        localStorage.setItem(STORAGE_KEY, activeIndex.toString());
      }
    }
  });
</script>

<style scoped lang="scss">
.tab-navigation {
  display: flex;
  border-bottom: 1px solid $border-color;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 140px;
    text-decoration: none;
    color: $text-light;
    border-bottom: 2px solid transparent;
    transition: $transition-base;
    font-weight: $font-weight-md;
    white-space: nowrap;
    position: relative;
    scroll-margin-left: 20px;

    &:hover:not(.disabled) {
      color: $primary-color;
      background-color: rgba($primary-color, 0.05);
    }

    &.active {
      color: #000000;
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
      font-size: $font-size-lg;
      font-weight: 600;
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

    @media (max-width: $breakpoint-md) {
      min-width: 100px;
    }
  }
}

// 반응형 처리
@media (max-width: $breakpoint-md) {
  .tab-navigation {
    .tab-item {
      .tab-text {
        font-size: 16px;
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
