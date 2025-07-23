<template>
  <div class="accordion-table-container">
    <table class="accordion-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            v-show="!column.hidden"
            :class="column.className"
            :style="column.width ? { width: column.width } : {}"
          >
            <div class="th-content">
              <span class="th-text">{{ column.title }}</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading" class="loading-row">
          <td :colspan="columns.length" class="loading-message">
            <div class="loading-spinner"></div>
            <span>{{ $t("datatable.loading") }}</span>
            <!-- 데이터를 불러오는 중... -->
          </td>
        </tr>
        <tr v-else-if="sortedData.length === 0" class="empty-row">
          <td :colspan="columns.length" class="empty-message">
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
          <template
            v-for="(item, index) in sortedData"
            :key="getRowKey(item, index)"
          >
            <!-- Main Row -->
            <tr
              :class="['data-row', { selected: isSelected(item) }]"
              @click="handleRowClick(item, index)"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                v-show="!column.hidden"
                :class="column.className"
                :style="column.width ? { width: column.width } : {}"
              >
                <!-- Expand/Collapse Button for first column -->
                <div
                  v-if="column.key === expandColumn"
                  class="expand-cell-content"
                >
                  <button
                    v-if="hasChildren(item)"
                    class="expand-btn"
                    @click.stop="toggleExpand(item)"
                    :class="{ expanded: isExpanded(item) }"
                  >
                    ▼
                  </button>
                  <span v-else class="expand-placeholder"></span>
                  <slot
                    :name="`cell-${column.key}`"
                    :item="item"
                    :index="index"
                    :column="column"
                  >
                    {{ getCellValue(item, column) }}
                  </slot>
                </div>
                <!-- Other columns -->
                <slot
                  v-else
                  :name="`cell-${column.key}`"
                  :item="item"
                  :index="index"
                  :column="column"
                >
                  {{ getCellValue(item, column) }}
                </slot>
              </td>
            </tr>

            <!-- Child Rows -->
            <template v-if="hasChildren(item) && isExpanded(item)">
              <tr
                v-for="(child, childIndex) in getChildren(item)"
                :key="`${getRowKey(item, index)}-child-${childIndex}`"
                class="child-row"
                @click="handleChildRowClick(child, item, childIndex)"
              >
                <td
                  v-for="column in columns"
                  :key="column.key"
                  v-show="!column.hidden"
                  :class="column.className"
                  :style="column.width ? { width: column.width } : {}"
                >
                  <!-- Indent for first column -->
                  <div
                    v-if="column.key === expandColumn"
                    class="child-cell-content"
                  >
                    <span class="child-indent"></span>
                    <slot
                      :name="`cell-${column.key}`"
                      :item="child"
                      :index="childIndex"
                      :column="column"
                      :is-child="true"
                    >
                      {{ getCellValue(child, column) }}
                    </slot>
                  </div>
                  <!-- Other columns -->
                  <slot
                    v-else
                    :name="`cell-${column.key}`"
                    :item="child"
                    :index="childIndex"
                    :column="column"
                    :is-child="true"
                  >
                    {{ getCellValue(child, column) }}
                  </slot>
                </td>
              </tr>
            </template>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

export interface AccordionTableColumn {
  key: string;
  title: string;
  width?: string;
  hidden?: boolean;
  className?: string;
  formatter?: (value: any, item: any) => string;
}

interface Props {
  columns: AccordionTableColumn[];
  data: any[];
  loading?: boolean;
  expandColumn?: string; // 확장/축소 버튼이 표시될 컬럼 키
  childrenKey?: string; // 자식 데이터가 저장된 키 이름
  rowKey?: string; // 각 행을 식별하는 키
  expandedItems?: any[]; // 초기에 펼쳐진 아이템들
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  expandColumn: "",
  childrenKey: "children",
  rowKey: "id",
  expandedItems: () => [],
});

const emit = defineEmits<{
  "row-click": [item: any, index: number];
  "child-row-click": [child: any, parent: any, childIndex: number];
  expand: [item: any, expanded: boolean];
}>();

// 확장된 아이템들 관리
const expandedItems = ref<any[]>([]);

// 초기 확장된 아이템들 설정
watch(
  () => props.expandedItems,
  (newItems) => {
    expandedItems.value = [...newItems];
  },
  { immediate: true }
);

// 정렬된 데이터 (필요시 정렬 로직 추가)
const sortedData = computed(() => {
  return props.data || [];
});

// 행 키 생성
const getRowKey = (item: any, index: number) => {
  return item[props.rowKey] || index;
};

// 셀 값 가져오기
const getCellValue = (item: any, column: AccordionTableColumn) => {
  const value = item[column.key];
  if (column.formatter) {
    return column.formatter(value, item);
  }
  return value;
};

// 자식이 있는지 확인
const hasChildren = (item: any) => {
  const children = item[props.childrenKey];
  return children && Array.isArray(children) && children.length > 0;
};

// 자식 데이터 가져오기
const getChildren = (item: any) => {
  return item[props.childrenKey] || [];
};

// 확장 상태 확인
const isExpanded = (item: any) => {
  return expandedItems.value.some(
    (expandedItem) => getRowKey(expandedItem, 0) === getRowKey(item, 0)
  );
};

// 확장/축소 토글
const toggleExpand = (item: any) => {
  const itemKey = getRowKey(item, 0);
  const isCurrentlyExpanded = isExpanded(item);

  if (isCurrentlyExpanded) {
    expandedItems.value = expandedItems.value.filter(
      (expandedItem) => getRowKey(expandedItem, 0) !== itemKey
    );
  } else {
    expandedItems.value.push(item);
  }

  emit("expand", item, !isCurrentlyExpanded);
};

// 행 클릭 핸들러
const handleRowClick = (item: any, index: number) => {
  emit("row-click", item, index);
};

// 자식 행 클릭 핸들러
const handleChildRowClick = (child: any, parent: any, childIndex: number) => {
  emit("child-row-click", child, parent, childIndex);
};

// 선택 상태 확인 (필요시 구현)
const isSelected = (item: any) => {
  return false; // 선택 기능이 필요한 경우 props로 받아서 처리
};
</script>

<style scoped lang="scss">
.accordion-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.accordion-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: #4a5568;

    th {
      color: white;
      font-weight: 600;
      padding: 12px 16px;
      text-align: left;
      font-size: 14px;

      .th-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .th-text {
        flex: 1;
      }
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #e2e8f0;

      &:hover {
        background-color: #f7fafc;
      }

      &.child-row {
        background-color: #f8f9fa;

        &:hover {
          background-color: #e9ecef;
        }
      }

      &.loading-row {
        .loading-message {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
          font-size: 14px;
          background-color: #f9fafb;

          .loading-spinner {
            display: inline-block;
            width: 24px;
            height: 24px;
            border: 3px solid #e5e7eb;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 12px;
            vertical-align: middle;
          }

          span {
            vertical-align: middle;
          }
        }
      }

      &.empty-row {
        .empty-message {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
          background-color: #f9fafb;

          .empty-state {
            .empty-icon {
              font-size: 48px;
              display: block;
              margin-bottom: 16px;
            }

            p {
              margin: 0;
              font-size: 16px;
              color: #6b7280;
            }
          }
        }
      }
    }

    td {
      padding: 12px 16px;
      font-size: 14px;
      color: #333;
    }
  }
}

.expand-cell-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  padding: 2px;
  transition: transform 0.2s;
  min-width: 16px;

  &.expanded {
    transform: rotate(180deg);
  }

  &:hover {
    color: #333;
  }
}

.expand-placeholder {
  width: 16px;
}

.child-cell-content {
  display: flex;
  align-items: center;
}

.child-indent {
  width: 20px;
  height: 1px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
