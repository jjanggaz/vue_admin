<template>
  <div class="pagination">
    <!-- First page button -->
    <button 
      class="pagination-btn btn-first"
      :disabled="currentPage === 1"
      @click="$emit('page-change', 1)"
    >
    </button>
    
    <!-- Previous page button -->
    <button 
      class="pagination-btn btn-prev"
      :disabled="currentPage === 1"
      @click="$emit('page-change', currentPage - 1)"
    >
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
      class="pagination-btn btn-next"
      :disabled="currentPage === totalPages"
      @click="$emit('page-change', currentPage + 1)"
    >
    </button>

    <!-- Last page button -->
    <button 
      class="pagination-btn btn-last"
      :disabled="currentPage === totalPages"
      @click="$emit('page-change', totalPages)"
    >
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
  gap: $spacing-sm;
  justify-content: center;

  .btn-first,
  .btn-prev,
  .btn-next,
  .btn-last {
    border: 1px solid #767676;
  }

  [class*="btn-"] {
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 12px;
      height: 14px;
      transform: translate(-50%, -50%);
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
  }

  .btn-first {
    &:after {
      background-image: url(../../assets/icons/ico_pagenation-first.svg);
    }
  }
  .btn-prev {
    &:after {
      background-image: url(../../assets/icons/ico_pagenation-prev.svg);
    }
  }
  .btn-next {
    &:after {
      background-image: url(../../assets/icons/ico_pagenation-next.svg);
    }
  }
  .btn-last {
    &:after {
      background-image: url(../../assets/icons/ico_pagenation-last.svg);
    }
  }

  .btn-prev {
    margin-right: 20px;

  }
  .btn-next {
    margin-left: 20px;
  }
}

.pagination-btn {
  text-align: center;
  min-width: 40px;
  height: 40px;
  padding: $spacing-xs;
  border: 1px solid white;
  border-radius: 20px;
  background-color: white;
  color: #555555;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-size: $font-size-base;
  font-weight: $font-weight-bold;
  
  &.active {
    background-color: #222E77;
    color: white;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background-color:#ffffff;
    }
  }
}

.pagination-ellipsis {
  padding: $spacing-xs;
  color: $text-light;
  font-size: $font-size-sm;
}

@media (max-width: 768px) {
  .pagination {
    gap: 6px;

    .btn-prev {
      margin-right: 10px;
    }
    .btn-next {
      margin-left: 10px;
    }
  }

  .pagination-btn {
    min-width: 30px;
    height: 30px;
    line-height: 1;
    padding: 0;
    border-radius: 50%;
    font-size: 14px;
  }
}
</style>
