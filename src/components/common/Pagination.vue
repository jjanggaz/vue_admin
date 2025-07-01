<template>
  <div class="pagination">
    <!-- First page button -->
    <button 
      class="pagination-btn"
      :disabled="currentPage === 1"
      @click="$emit('page-change', 1)"
    >
      &laquo;
    </button>
    
    <!-- Previous page button -->
    <button 
      class="pagination-btn"
      :disabled="currentPage === 1"
      @click="$emit('page-change', currentPage - 1)"
    >
      &lsaquo;
    </button>

    <!-- Page numbers -->
    <template v-for="page in visiblePages" :key="page">
      <button
        v-if="page !== '...'"
        class="pagination-btn"
        :class="{ active: page === currentPage }"
        @click="$emit('page-change', page)"
      >
        {{ page }}
      </button>
      <span v-else class="pagination-ellipsis">...</span>
    </template>

    <!-- Next page button -->
    <button 
      class="pagination-btn"
      :disabled="currentPage === totalPages"
      @click="$emit('page-change', currentPage + 1)"
    >
      &rsaquo;
    </button>

    <!-- Last page button -->
    <button 
      class="pagination-btn"
      :disabled="currentPage === totalPages"
      @click="$emit('page-change', totalPages)"
    >
      &raquo;
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 5
})

defineEmits<{
  'page-change': [page: number]
}>()

const visiblePages = computed(() => {
  const { currentPage, totalPages, maxVisiblePages } = props
  const pages: (number | string)[] = []
  
  if (totalPages <= maxVisiblePages) {
    // 전체 페이지가 적으면 모두 표시
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // 복잡한 페이지네이션 로직
    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }
    
    // 첫 페이지
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }
    
    // 중간 페이지들
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    // 마지막 페이지
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
  }
  
  return pages
})
</script>

<style scoped lang="scss">
.pagination {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  justify-content: center;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: $spacing-xs;
  border: 1px solid $border-color;
  background-color: $background-color;
  color: $text-color;
  border-radius: $border-radius-sm;
  cursor: pointer;
  transition: $transition-base;
  font-size: $font-size-small;
  
  &:hover:not(:disabled) {
    border-color: $primary-color;
    color: $primary-color;
  }
  
  &.active {
    background-color: $primary-color;
    border-color: $primary-color;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      border-color: $border-color;
      color: $text-color;
    }
  }
}

.pagination-ellipsis {
  padding: $spacing-xs;
  color: $text-light;
  font-size: $font-size-small;
}
</style>
