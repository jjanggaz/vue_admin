<template>
  <div class="vertical-data-table-container">
    <table class="vertical-data-table">
      <tbody>
        <tr v-if="loading" class="loading-row">
          <td colspan="2" class="loading-message">
            <div class="loading-spinner"></div>
            <span>{{ $t("datatable.loading") }}</span>
          </td>
        </tr>
        <tr v-else-if="data.length === 0" class="empty-row">
          <td colspan="2" class="empty-message">
            <slot name="empty">
              <div class="empty-state">
                <span class="empty-icon">📂</span>
                <p>{{ $t("datatable.noData") }}</p>
              </div>
            </slot>
          </td>
        </tr>
        <template v-else>
          <!-- 각 데이터 항목을 2열로 배치 -->
          <tr
            v-for="(item, index) in data"
            :key="getRowKey(item, index)"
            :class="['data-row', { selected: isSelected(item) }]"
            @click="handleRowClick(item, index)"
          >
            <td class="column-name">{{ item.columnName }}</td>
            <td class="column-value">{{ item.value }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: Array<{ columnName: string; value: string }>;
  loading?: boolean;
  rowKey?: string;
  selectable?: boolean;
  selectedItems?: any[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowKey: "id",
  selectable: false,
  selectedItems: () => [],
});

const emit = defineEmits<{
  "row-click": [item: any, index: number];
  "selection-change": [selectedItems: any[]];
}>();

const isSelected = (item: any): boolean => {
  const itemKey = getRowKey(item, -1);
  return props.selectedItems.some(
    (selected) => getRowKey(selected, -1) === itemKey
  );
};

const handleRowClick = (item: any, index: number) => {
  emit("row-click", item, index);
};

// 유틸리티 함수들
const getRowKey = (item: any, index: number) => {
  return item[props.rowKey] || index;
};
</script>

<style scoped lang="scss">
.vertical-data-table-container {
  background: $background-color;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
}

.vertical-data-table {
  width: 100%;
  border-collapse: collapse;

  td {
    padding: $spacing-sm $spacing-md;
    text-align: center;
    border: 1px solid $border-color;
    font-size: $font-size-sm;
    color: $text-color;
  }

  tbody {
    .data-row {
      transition: $transition-base;

      &.selected {
        background-color: rgba($primary-color, 0.1);
      }

      &:hover {
        background-color: $background-light;
        cursor: pointer;
      }

      .column-name {
        font-weight: $font-weight-md;
        background-color: $background-light;
        width: 40%;
      }

      .column-value {
        width: 60%;
        word-break: break-all;
      }
    }

    .loading-message,
    .empty-message {
      text-align: center;
      padding: $spacing-xxl;
    }

    .loading-message {
      color: $text-light;

      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid $border-color;
        border-radius: 50%;
        border-top-color: $primary-color;
        animation: spin 1s ease-in-out infinite;
        margin-right: $spacing-sm;
      }
    }

    .empty-message {
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $spacing-md;

        .empty-icon {
          font-size: 2rem;
          opacity: 0.5;
        }

        p {
          color: $text-light;
          margin: 0;
          font-style: italic;
        }
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 반응형 처리
@media (max-width: $breakpoint-md) {
  .vertical-data-table {
    td {
      padding: $spacing-sm $spacing-md;
      font-size: 12px;
    }
  }
}
</style>
