<template>
  <div class="image-placeholder" :class="variant">
    <div class="placeholder-content">
      <div class="placeholder-icon">
        <slot name="icon">
          {{ defaultIcon }}
        </slot>
      </div>
      <div class="placeholder-text">
        <h4 class="placeholder-title">{{ title }}</h4>
        <p class="placeholder-description">{{ description }}</p>
      </div>
      <div v-if="showAction" class="placeholder-action">
        <slot name="action">
          <button class="btn btn-primary" @click="$emit('action-click')">
            {{ actionText }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'empty' | 'loading' | 'error' | 'no-data' | 'upload'
  title?: string
  description?: string
  showAction?: boolean
  actionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'no-data',
  title: '데이터가 없습니다',
  description: '표시할 데이터가 없습니다.',
  showAction: false,
  actionText: '새로 추가'
})

defineEmits<{
  'action-click': []
}>()

const defaultIcon = computed(() => {
  switch (props.variant) {
    case 'empty': return '📄'
    case 'loading': return '⏳'
    case 'error': return '❌'
    case 'upload': return '📤'
    default: return '📋'
  }
})
</script>

<style scoped lang="scss">
.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: $spacing-xxl;
  background-color: $background-light;
  border: 1px dashed $border-color;
  border-radius: $border-radius-lg;
  text-align: center;

  &.loading {
    border-style: solid;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }

  &.error {
    border-color: $error-color;
    background-color: rgba($error-color, 0.05);
  }

  &.upload {
    border-color: $primary-color;
    background-color: rgba($primary-color, 0.05);
    transition: $transition-base;

    &:hover {
      border-color: darken($primary-color, 10%);
      background-color: rgba($primary-color, 0.1);
    }
  }
}

.placeholder-content {
  max-width: 400px;
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: $spacing-lg;
  opacity: 0.6;
}

.placeholder-title {
  font-size: $font-size-large;
  font-weight: $font-weight-md;
  color: $text-color;
  margin: 0 0 $spacing-sm 0;
}

.placeholder-description {
  color: $text-light;
  margin: 0 0 $spacing-lg 0;
  line-height: 1.5;
}

.placeholder-action {
  .btn {
    padding: $spacing-sm $spacing-lg;
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
