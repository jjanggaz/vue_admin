<template>
  <div class="accordion-table-container">
    <table class="accordion-table">
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
          <template
            v-for="(item, index) in sortedData"
            :key="getRowKey(item, index)"
          >
            <!-- Main Row -->
            <tr
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
                <!-- Expand/Collapse Button for first column -->
                <div
                  v-if="column.key === expandColumn"
                  class="expand-cell-content"
                >
                  <button
                    v-if="hasChildren(item)"
                    class="expand-btn"
                    @click.stop="toggleExpand(item, $event)"
                    @click.prevent
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
                <td v-if="selectable" class="checkbox-cell" @click.stop>
                  <input
                    type="checkbox"
                    :checked="isSelected(child)"
                    @change="toggleSelectRow(child)"
                  />
                </td>
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
  selectable?: boolean; // 체크박스 선택 가능 여부
  selectedItems?: any[]; // 선택된 아이템들
  selectionMode?: "multiple" | "single" | "none"; // 선택 모드: 다중선택, 단일선택, 선택불가
  showSelectAll?: boolean; // 전체선택 체크박스 표시 여부
  selectHeaderText?: string; // 선택 컬럼 헤더 텍스트
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  expandColumn: "menu_name",
  childrenKey: "children",
  rowKey: "id",
  selectable: false,
  selectedItems: () => [],
  selectionMode: "multiple",
  showSelectAll: true,
  selectHeaderText: "",
});

const emit = defineEmits<{
  "row-click": [item: any, index: number];
  "child-row-click": [child: any, parent: any, childIndex: number];
  expand: [item: any, expanded: boolean];
  "selection-change": [selectedItems: any[]];
}>();

// 확장된 아이템들 관리
const expandedItems = ref<any[]>([]);

// 선택 상태 관리
const localSelected = ref<any[]>([...props.selectedItems]);

// 선택된 아이템들 동기화
watch(
  () => props.selectedItems,
  (newSelected) => {
    if (JSON.stringify(newSelected) !== JSON.stringify(localSelected.value)) {
      localSelected.value = [...newSelected];
    }
  },
  { deep: true, immediate: true }
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
const toggleExpand = (item: any, event?: Event) => {
  // 이벤트 전파와 기본 동작 모두 방지
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

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

// 선택 상태 확인
const isSelected = (item: any): boolean => {
  const itemKey = getRowKey(item, -1);
  return localSelected.value.some(
    (selected) => getRowKey(selected, -1) === itemKey
  );
};

// 전체 선택 상태
const allSelected = computed<boolean>({
  get() {
    // 모든 항목(부모 + 자식)의 총 개수 계산
    let totalItems = 0;
    props.data.forEach((item) => {
      totalItems += 1; // 부모 항목
      if (hasChildren(item)) {
        totalItems += getChildren(item).length; // 자식 항목들
      }
    });

    return totalItems > 0 && localSelected.value.length === totalItems;
  },
  set(value: boolean) {
    if (value) {
      // 전체 선택: 모든 부모와 자식 항목 선택
      const allItems: any[] = [];
      props.data.forEach((item) => {
        allItems.push(item);
        if (hasChildren(item)) {
          const children = getChildren(item);
          children.forEach((child: any) => {
            allItems.push(child);
          });
        }
      });
      localSelected.value = allItems;
    } else {
      // 전체 해제
      localSelected.value = [];
    }
    emit("selection-change", localSelected.value);
  },
});

// 전체 선택 토글
const toggleSelectAll = () => {
  allSelected.value = !allSelected.value;
};

// 행 선택 토글
const toggleSelectRow = (item: any) => {
  const itemKey = getRowKey(item, -1);
  const index = localSelected.value.findIndex(
    (selected) => getRowKey(selected, -1) === itemKey
  );

  if (index > -1) {
    // 이미 선택된 경우 선택 해제
    localSelected.value.splice(index, 1);

    // 부모 항목인 경우 자식들도 모두 선택 해제
    if (hasChildren(item)) {
      const children = getChildren(item);
      children.forEach((child: any) => {
        const childKey = getRowKey(child, -1);
        const childIndex = localSelected.value.findIndex(
          (selected) => getRowKey(selected, -1) === childKey
        );
        if (childIndex > -1) {
          localSelected.value.splice(childIndex, 1);
        }
      });
    }
  } else {
    // 선택되지 않은 경우 선택
    if (props.selectionMode === "single") {
      // 단일 선택 모드: 기존 선택을 모두 해제하고 현재 항목만 선택
      localSelected.value = [item];
    } else {
      // 다중 선택 모드: 현재 항목 추가

      // 부모 항목인 경우 자식들도 모두 선택
      if (hasChildren(item)) {
        const children = getChildren(item);
        children.forEach((child: any) => {
          const childKey = getRowKey(child, -1);
          const isChildSelected = localSelected.value.some(
            (selected) => getRowKey(selected, -1) === childKey
          );
          if (!isChildSelected) {
            localSelected.value.push(child);
          }
        });
      }

      localSelected.value.push(item);
    }
  }
  // 선택 상태 변경 이벤트 발생 시 확장 상태 유지
  emit("selection-change", [...localSelected.value]);
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

  .checkbox-cell {
    width: 50px;
    text-align: center;
    padding: 8px 4px;

    input[type="checkbox"] {
      width: 16px;
      height: 16px;
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
