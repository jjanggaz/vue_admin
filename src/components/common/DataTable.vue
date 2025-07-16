<template>
  <div class="data-table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th v-if="selectable" class="checkbox-cell">
            <input
              type="checkbox"
              :checked="allSelected"
              :disabled="data.length === 0"
              @change="toggleSelectAll"
            />
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="{
              sortable: column.sortable,
              sorted: sortConfig.key === column.key,
              'sort-asc':
                sortConfig.key === column.key && sortConfig.direction === 'asc',
              'sort-desc':
                sortConfig.key === column.key &&
                sortConfig.direction === 'desc',
            }"
            @click="handleSort(column)"
            :style="column.width ? { width: column.width } : {}"
          >
            <div class="th-content">
              <span class="th-text">{{ column.title }}</span>
              <span v-if="column.sortable" class="sort-icon">
                <span
                  class="sort-arrow sort-up"
                  :class="{
                    active:
                      sortConfig.key === column.key &&
                      sortConfig.direction === 'asc',
                  }"
                  >▲</span
                >
                <span
                  class="sort-arrow sort-down"
                  :class="{
                    active:
                      sortConfig.key === column.key &&
                      sortConfig.direction === 'desc',
                  }"
                  >▼</span
                >
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading" class="loading-row">
          <td
            :colspan="selectable ? columns.length + 1 : columns.length"
            class="loading-message"
          >
            <div class="loading-spinner"></div>
            <span>데이터를 불러오는 중...</span>
          </td>
        </tr>
        <tr v-else-if="sortedData.length === 0" class="empty-row">
          <td
            :colspan="selectable ? columns.length + 1 : columns.length"
            class="empty-message"
          >
            <slot name="empty">
              <div class="empty-state">
                <span class="empty-icon">📂</span>
                <p>등록된 데이터가 없습니다</p>
              </div>
            </slot>
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="(item, index) in sortedData"
            :key="getRowKey(item, index)"
            :class="['data-row', { selected: isSelected(item) }]"
            @click="handleRowClick(item, index)"
          >
            <td v-if="selectable" class="checkbox-cell" @click.stop>
              <input
                type="checkbox"
                :checked="isSelected(item)"
                @change="toggleSelectRow(item)"
              />
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :class="column.className"
              :style="column.width ? { width: column.width } : {}"
            >
              <slot
                :name="`cell-${column.key}`"
                :item="item"
                :value="getColumnValue(item, column.key)"
                :index="index"
                :column="column"
              >
                {{ formatCellValue(item, column) }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  className?: string;
  formatter?: (value: any, item: any) => string;
  width?: string;
}

interface SortConfig {
  key: string | null;
  direction: "asc" | "desc" | null;
}

interface Props {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  rowKey?: string;
  defaultSort?: { key: string; direction: "asc" | "desc" };
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
  "sort-change": [{ key: string; direction: "asc" | "desc" }];
  "row-click": [item: any, index: number];
  "selection-change": [selectedItems: any[]];
}>();

// 선택 상태 관리
const localSelected = ref<any[]>([...props.selectedItems]);

watch(
  () => props.selectedItems,
  (newValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(localSelected.value)) {
      localSelected.value = [...newValue];
    }
  },
  { deep: true }
);

const allSelected = computed<boolean>({
  get() {
    return (
      props.data.length > 0 && localSelected.value.length === props.data.length
    );
  },
  set(value: boolean) {
    const newSelected = value ? [...props.data] : [];
    localSelected.value = newSelected;
    emit("selection-change", newSelected);
  },
});

const isSelected = (item: any): boolean => {
  const itemKey = getRowKey(item, -1);
  return localSelected.value.some(
    (selected) => getRowKey(selected, -1) === itemKey
  );
};

const toggleSelectAll = () => {
  allSelected.value = !allSelected.value;
};

const toggleSelectRow = (item: any) => {
  const itemKey = getRowKey(item, -1);
  const index = localSelected.value.findIndex(
    (selected) => getRowKey(selected, -1) === itemKey
  );

  if (index > -1) {
    localSelected.value.splice(index, 1);
  } else {
    localSelected.value.push(item);
  }
  emit("selection-change", [...localSelected.value]);
};

const handleRowClick = (item: any, index: number) => {
  if (props.selectable) {
    toggleSelectRow(item);
  }
  emit("row-click", item, index);
};

// 정렬 상태 관리
const sortConfig = ref<SortConfig>({
  key: props.defaultSort?.key || null,
  direction: props.defaultSort?.direction || null,
});

// 정렬된 데이터 계산
const sortedData = computed(() => {
  if (!sortConfig.value.key || !sortConfig.value.direction) {
    return props.data;
  }

  const sorted = [...props.data].sort((a, b) => {
    const aValue = getColumnValue(a, sortConfig.value.key!);
    const bValue = getColumnValue(b, sortConfig.value.key!);

    // null/undefined 처리
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // 숫자 비교
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.value.direction === "asc"
        ? aValue - bValue
        : bValue - aValue;
    }

    // 날짜 비교
    const aDate = new Date(aValue);
    const bDate = new Date(bValue);
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return sortConfig.value.direction === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    // 문자열 비교
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (sortConfig.value.direction === "asc") {
      return aStr.localeCompare(bStr, "ko-KR");
    } else {
      return bStr.localeCompare(aStr, "ko-KR");
    }
  });

  return sorted;
});

// 정렬 처리
const handleSort = (column: TableColumn) => {
  if (!column.sortable) return;

  if (sortConfig.value.key === column.key) {
    // 같은 컬럼 클릭 시 방향 변경
    if (sortConfig.value.direction === "asc") {
      sortConfig.value.direction = "desc";
    } else if (sortConfig.value.direction === "desc") {
      sortConfig.value.key = null;
      sortConfig.value.direction = null;
    } else {
      sortConfig.value.direction = "asc";
    }
  } else {
    // 다른 컬럼 클릭 시 새로운 정렬
    sortConfig.value.key = column.key;
    sortConfig.value.direction = "asc";
  }

  if (sortConfig.value.key && sortConfig.value.direction) {
    emit("sort-change", {
      key: sortConfig.value.key,
      direction: sortConfig.value.direction,
    });
  }
};

// 유틸리티 함수들
const getColumnValue = (item: any, key: string) => {
  return key.split(".").reduce((obj, k) => obj?.[k], item);
};

const getRowKey = (item: any, index: number) => {
  return item[props.rowKey] || index;
};

const formatCellValue = (item: any, column: TableColumn) => {
  const value = getColumnValue(item, column.key);

  if (column.formatter) {
    return column.formatter(value, item);
  }

  if (value == null) return "-";
  return String(value);
};

// 정렬 변경 감지
watch(
  sortConfig,
  (newSort) => {
    if (newSort.key && newSort.direction) {
      emit("sort-change", { key: newSort.key, direction: newSort.direction });
    }
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
@use "sass:color";

.data-table-container {
  background: $background-color;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: $spacing-md $spacing-lg;
    text-align: left;
    border-bottom: 1px solid $border-color;
  }

  th.checkbox-cell,
  td.checkbox-cell {
    width: 40px;
    text-align: center;
  }

  thead {
    background-color: $background-light;

    th {
      font-weight: $font-weight-md;
      color: $text-color;
      font-size: $font-size-sm;
      position: relative;

      &.sortable {
        cursor: pointer;
        user-select: none;
        transition: $transition-base;

        &:hover {
          background-color: color.scale($background-light, $lightness: -3%);
        }
      }

      .th-content {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .th-text {
          flex: 1;
        }

        .sort-icon {
          display: flex;
          flex-direction: column;
          margin-left: $spacing-xs;
          opacity: 0.3;
          transition: $transition-base;

          .sort-arrow {
            font-size: 8px;
            line-height: 1;
            color: $text-light;
            transition: $transition-base;

            &.sort-up {
              margin-bottom: 1px;
            }

            &.active {
              color: $primary-color;
              opacity: 1;
            }
          }
        }
      }

      &.sortable:hover .sort-icon {
        opacity: 0.7;
      }

      &.sorted .sort-icon {
        opacity: 1;
      }
    }
  }

  tbody {
    .data-row {
      transition: $transition-base;

      &.selected {
        background-color: rgba($primary-color, 0.1);
      }

      &:hover {
        background-color: $background-light;
      }
    }

    td {
      color: $text-color;
      font-size: $font-size-sm;
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
  .data-table {
    th,
    td {
      padding: $spacing-sm $spacing-md;
      font-size: 12px;
    }

    thead th .th-content .sort-icon {
      .sort-arrow {
        font-size: 6px;
      }
    }
  }
}
</style>
