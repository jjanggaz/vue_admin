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
              <!-- <span class="select-header-text">선택</span> -->
               <input
                type="checkbox"
                />
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
            :class="['data-row', { selected: isSelected(item), 'drag-over': dragOverIndex === index, 'dragging': isDragging && (draggedIndex === index || (window as any).__draggedRowIndex === index) }]"
            :draggable="false"
            @click="handleRowClick(item, index)"
            @dragover="handleDragOver($event, index)"
            @dragleave="handleDragLeave($event, index)"
            @drop="handleDrop($event, item, index)"
            @dragend="handleDragEnd"
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
  dateFormat?: string; // 날짜 포맷 (예: 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm')
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
  draggable?: boolean; // 드래그 앤 드롭 활성화 여부
  draggableCellKey?: string; // 드래그 가능한 셀의 컬럼 키 (지정하지 않으면 전체 행 드래그)
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
  draggable: false,
  draggableCellKey: undefined,
});

const emit = defineEmits<{
  "sort-change": [{ key: string | null; direction: "asc" | "desc" | null }];
  "row-click": [item: any, index: number];
  "selection-change": [selectedItems: any[]];
  "drag-start": [item: any, index: number];
  "drag-over": [index: number];
  "drag-leave": [index: number];
  "drop": [draggedItem: any, draggedIndex: number, targetItem: any, targetIndex: number];
  "drag-end": [];
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

// defaultSort prop 변경 시 정렬 상태 동기화
watch(
  () => props.defaultSort,
  (newDefaultSort) => {
    if (newDefaultSort) {
      sortConfig.value.key = newDefaultSort.key;
      sortConfig.value.direction = newDefaultSort.direction;
    } else {
      sortConfig.value.key = null;
      sortConfig.value.direction = null;
    }
  },
  { deep: true }
);

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
      // direction이 null인 경우 (초기 상태)
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

// 드래그 앤 드롭 상태 관리
const dragOverIndex = ref<number | null>(null);
const draggedItem = ref<any | null>(null);
const draggedIndex = ref<number | null>(null);
const isDragging = ref<boolean>(false);

// 드래그 시작
const handleDragStart = (event: DragEvent, item: any, index: number) => {
  if (!props.draggable) return;
  draggedItem.value = item;
  draggedIndex.value = index;
  isDragging.value = true;
  
  // 전역 상태에서 드래그 정보 확인 (순번 셀에서 시작한 경우)
  const globalIndex = (window as any).__draggedRowIndex;
  const globalItem = (window as any).__draggedRowItem;
  if (globalIndex !== undefined && globalItem) {
    draggedItem.value = globalItem;
    draggedIndex.value = globalIndex;
  }
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/html", String(draggedIndex.value));
    
    // 드래그 이미지 커스터마이징: 행 전체를 보이도록
    const rowElement = (event.currentTarget as HTMLElement).closest('tr') as HTMLElement;
    if (rowElement) {
      const dragImage = rowElement.cloneNode(true) as HTMLElement;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-9999px';
      dragImage.style.width = `${rowElement.offsetWidth}px`;
      dragImage.style.opacity = '0.8';
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  }
  emit("drag-start", draggedItem.value, draggedIndex.value);
};

// 드래그 오버
const handleDragOver = (event: DragEvent, index: number) => {
  if (!props.draggable) return;
  
  // 전역 상태에서 드래그 정보 확인 (순번 셀에서 시작한 경우)
  const globalIndex = (window as any).__draggedRowIndex;
  const globalItem = (window as any).__draggedRowItem;
  const currentDraggedIndex = draggedIndex.value !== null ? draggedIndex.value : globalIndex;
  
  if (currentDraggedIndex === null || currentDraggedIndex === index) return;
  
  // 전역 상태가 있으면 내부 상태도 업데이트
  if (globalIndex !== undefined && globalItem && draggedIndex.value === null) {
    draggedItem.value = globalItem;
    draggedIndex.value = globalIndex;
  }
  
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
  dragOverIndex.value = index;
  emit("drag-over", index);
};

// 드래그 리브
const handleDragLeave = (event: DragEvent, index: number) => {
  if (!props.draggable) return;
  // 관련된 요소로 이동하는 경우는 무시
  const relatedTarget = event.relatedTarget as HTMLElement;
  if (relatedTarget && event.currentTarget?.contains(relatedTarget)) {
    return;
  }
  dragOverIndex.value = null;
  emit("drag-leave", index);
};

// 드롭
const handleDrop = (event: DragEvent, targetItem: any, targetIndex: number) => {
  if (!props.draggable) return;
  
  // 전역 상태에서 드래그 정보 확인 (순번 셀에서 시작한 경우)
  const globalIndex = (window as any).__draggedRowIndex;
  const globalItem = (window as any).__draggedRowItem;
  
  let finalDraggedIndex = draggedIndex.value;
  let finalDraggedItem = draggedItem.value;
  
  if (globalIndex !== undefined && globalItem) {
    finalDraggedIndex = globalIndex;
    finalDraggedItem = globalItem;
    // 전역 상태를 내부 상태로 동기화
    draggedItem.value = globalItem;
    draggedIndex.value = globalIndex;
    // 전역 상태 정리
    (window as any).__draggedRowIndex = undefined;
    (window as any).__draggedRowItem = undefined;
  }
  
  if (finalDraggedIndex === null) return;
  
  event.preventDefault();
  event.stopPropagation();
  
  if (finalDraggedItem && finalDraggedIndex !== targetIndex) {
    emit("drop", finalDraggedItem, finalDraggedIndex, targetItem, targetIndex);
  }
  
  dragOverIndex.value = null;
  draggedItem.value = null;
  draggedIndex.value = null;
};

// 드래그 종료
const handleDragEnd = () => {
  if (!props.draggable) return;
  isDragging.value = false;
  dragOverIndex.value = null;
  draggedItem.value = null;
  draggedIndex.value = null;
  // 전역 상태도 정리
  (window as any).__draggedRowIndex = undefined;
  (window as any).__draggedRowItem = undefined;
  emit("drag-end");
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

// 날짜 포맷 함수
const formatDate = (dateString: string | Date, format: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    switch (format) {
      case "YYYY-MM-DD":
        return date.toISOString().split("T")[0];
      case "YYYY-MM-DD HH:mm":
        return date.toISOString().slice(0, 16).replace("T", " ");
      case "MM/DD/YYYY":
        return date.toLocaleDateString("en-US");
      case "DD/MM/YYYY":
        return date.toLocaleDateString("en-GB");
      default:
        return date.toISOString().split("T")[0]; // 기본값: YYYY-MM-DD
    }
  } catch {
    return "";
  }
};

const formatCellValue = (item: any, column: TableColumn) => {
  const value = getColumnValue(item, column.key);

  if (column.formatter) {
    return column.formatter(value, item);
  }

  // 날짜 포맷 처리
  if (column.dateFormat && value) {
    return formatDate(value, column.dateFormat);
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
  overflow: hidden;
  border-top: 2px solid #000000;
  border-bottom: 1px solid #000000;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &.with-scroll {
    overflow-y: auto;
  }
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #e7e6ed;
    border-radius: 3px;

    &:hover {
      background-color: #d7d5e4;
    }
  }
  &::-webkit-scrollbar-button:start:decrement {
    display:block;
    height:50px;
    width: 0;
    background-color: transparent;
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    height: 50px;
    max-height: 50px;
    text-align: left;
    white-space: nowrap;
  }

  th {
    padding: 0 20px;
  }
  
  td {
    padding: 6px 20px;
  }

  td + td {
    padding-top: 3px;
  }

  th.checkbox-cell,
  td.checkbox-cell {
    width: 40px;
    text-align: center;

    input[type="checkbox"] {
      appearance: none;
      width: 20px;
      height: 20px;
      border: none;
      background-color: transparent;
      background-image: url(../../assets/icons/ico_check-off.svg);
      background-repeat: no-repeat;
      background-position: center;
      background-size: 20px auto;
      cursor: pointer;

      &:checked {
        background-image: url(../../assets/icons/ico_check-on.svg);
      }

      &:disabled {
        background-image: url(../../assets/icons/ico_check-disabled.svg);
      }
    }

    .select-header-text {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }
  }

  thead {
    border-bottom: 0.6px solid #000000;
    position: sticky;
    top: 0;
    z-index: 1;

    th {
      text-align: center;
      font-weight: $font-weight-md;
      color: #333333;
      font-size: 15px;
      position: relative;

      &:nth-of-type(3) {
        text-align: left;
      }

      &.sortable {
        cursor: pointer;
        user-select: none;
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

      & td:nth-of-type(3) {
        text-align: left;
      }

      &:hover {
        background-color: #e3f1fa;
      }
      
      &.dragging {
        opacity: 0.5;
        background-color: #e3f1fa;
        border: 2px dashed #2196F3;
      }
    }

    td {
      text-align: center;
      color: #202020;
      font-size: 15px;
      font-weight: $font-weight-normal;
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
        p {
          color: #aaaaaa;
          font-weight: 400;
          font-size: 13px;
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
@media (max-width: 1024px) {
  .data-table {
    th {
      padding: 0 10px;
    }
    td {
      padding: 3px 10px;
    }

    thead {
      th {
        font-size: 13px;
      }
    }

    tbody {
      td {
        font-size: 13px;
      }
    }

    thead th .th-content .sort-icon {
      .sort-arrow {
        font-size: 6px;
      }
    }
  }
}

@media (max-width: 768px) {
  .data-table {
    th {
      padding: 0 6px;
    }
    td {
      padding: 1px 6px;
    }

    thead {
      th {
        font-size: 12px;
      }
    }
  
    tbody {
      td {
        font-size: 12px;
      }
    }
  }
}
</style>
