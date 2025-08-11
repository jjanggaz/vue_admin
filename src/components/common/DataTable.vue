<template>
  <div
    class="data-table-container"
    :class="{ 'with-scroll': maxHeight !== 'auto' }"
    :style="maxHeight !== 'auto' ? { maxHeight } : {}"
  >
    <table class="data-table">
      <thead>
        <tr>
          <th v-if="selectable" class="checkbox-cell">
            <template v-if="showSelectAll && selectionMode !== 'none'">
              <input
                type="checkbox"
                :checked="allSelected"
                :disabled="data.length === 0 || selectionMode === 'single'"
                @change="toggleSelectAll"
              />
            </template>
            <template v-else-if="selectHeaderText">
              <span class="select-header-text">{{ selectHeaderText }}</span>
            </template>
            <template v-else>
              <span class="select-header-text">선택</span>
            </template>
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            v-show="!column.hidden"
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
            <span>{{ $t("datatable.loading") }}</span>
            <!-- 데이터를 불러오는 중... -->
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
                <p>{{ $t("datatable.noData") }}</p>
                <!-- 등록된 데이터가 없습니다 -->
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
              v-show="!column.hidden"
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
  hidden?: boolean;
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
  selectionMode?: "multiple" | "single" | "none"; // 선택 모드: 다중선택, 단일선택, 선택불가
  showSelectAll?: boolean; // 전체선택 체크박스 표시 여부
  selectHeaderText?: string; // 선택 컬럼 헤더 텍스트
  maxHeight?: string; // 테이블 최대 높이 (스크롤 적용)
  stickyHeader?: boolean; // 헤더 고정 여부
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowKey: "id",
  selectable: false,
  selectedItems: () => [],
  selectionMode: "multiple",
  showSelectAll: true,
  selectHeaderText: "",
  maxHeight: "auto",
  stickyHeader: false,
});

const emit = defineEmits<{
  "sort-change": [{ key: string | null; direction: "asc" | "desc" | null }];
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
    // 이미 선택된 경우 선택 해제
    localSelected.value.splice(index, 1);
  } else {
    // 선택되지 않은 경우 선택
    if (props.selectionMode === "single") {
      // 단일 선택 모드: 기존 선택을 모두 해제하고 현재 항목만 선택
      localSelected.value = [item];
    } else {
      // 다중 선택 모드: 현재 항목 추가
      localSelected.value.push(item);
    }
  }
  emit("selection-change", [...localSelected.value]);
};

const handleRowClick = (item: any, index: number) => {
  // row 클릭 시 row-click 이벤트 발생
  emit("row-click", item, index);

  // 선택 모드에 따라 row 클릭 시 선택 토글
  if (props.selectable && props.selectionMode !== "none") {
    if (props.selectionMode === "single") {
      // 단일 선택 모드: 이미 선택된 항목이면 해제, 아니면 선택
      const itemKey = getRowKey(item, -1);
      const isCurrentlySelected = localSelected.value.some(
        (selected) => getRowKey(selected, -1) === itemKey
      );

      if (isCurrentlySelected) {
        // 이미 선택된 경우 선택 해제
        localSelected.value = [];
      } else {
        // 선택되지 않은 경우 선택
        localSelected.value = [item];
      }
      emit("selection-change", [...localSelected.value]);
    } else {
      // 다중 선택 모드: 토글
      toggleSelectRow(item);
    }
  }
};

// 정렬 상태 관리
const sortConfig = ref<SortConfig>({
  key: props.defaultSort?.key || null,
  direction: props.defaultSort?.direction || null,
});

// 정렬된 데이터 계산 (서버 측 정렬 사용)
const sortedData = computed(() => {
  // 서버에서 정렬된 데이터를 받아오므로 클라이언트 측 정렬 불필요
  return props.data;
});

// 정렬 처리
const handleSort = (column: TableColumn) => {
  if (!column.sortable) return;

  let shouldEmitEvent = false;
  let eventData: { key: string | null; direction: "asc" | "desc" | null } = {
    key: null,
    direction: null,
  };

  if (sortConfig.value.key === column.key) {
    // 같은 컬럼 클릭 시 방향 변경
    if (sortConfig.value.direction === "asc") {
      sortConfig.value.direction = "desc";
      eventData = { key: column.key, direction: "desc" };
      shouldEmitEvent = true;
    } else if (sortConfig.value.direction === "desc") {
      // 정렬 초기화 - 서버에 정렬 없음을 알림
      sortConfig.value.key = null;
      sortConfig.value.direction = null;
      eventData = { key: null, direction: null };
      shouldEmitEvent = true;
    } else {
      sortConfig.value.direction = "asc";
      eventData = { key: column.key, direction: "asc" };
      shouldEmitEvent = true;
    }
  } else {
    // 다른 컬럼 클릭 시 새로운 정렬
    sortConfig.value.key = column.key;
    sortConfig.value.direction = "asc";
    eventData = { key: column.key, direction: "asc" };
    shouldEmitEvent = true;
  }

  if (shouldEmitEvent) {
    emit("sort-change", eventData);
  }
};

// 정렬 초기화 함수
const resetSort = () => {
  sortConfig.value.key = null;
  sortConfig.value.direction = null;
};

// 컴포넌트 외부에서 접근할 수 있도록 노출
defineExpose({
  resetSort,
});

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

// 정렬 변경 감지 - 중복 emit 방지를 위해 제거
// watch(
//   sortConfig,
//   (newSort) => {
//     if (newSort.key && newSort.direction) {
//       emit("sort-change", { key: newSort.key, direction: newSort.direction });
//     }
//   },
//   { deep: true }
// );
</script>

<style scoped lang="scss">
.data-table-container {
  background: $background-color;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;

  &.with-scroll {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
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
    vertical-align: middle;

    input[type="checkbox"] {
      margin: 0;
      cursor: pointer;
    }

    .select-header-text {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }
  }

  thead {
    background-color: $background-light;
    position: sticky;
    top: 0;
    z-index: 1;

    th {
      font-weight: $font-weight-md;
      color: $text-color;
      font-size: $font-size-sm;
      position: relative;
      background-color: $background-light; // 스크롤 시 배경색 유지

      &.sortable {
        cursor: pointer;
        user-select: none;
        transition: $transition-base;

        &:hover {
          background-color: darken($background-light, 3%);
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

  // stickyHeader가 false일 때 헤더 고정 해제
  &:not(.with-scroll) thead {
    position: static;
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
