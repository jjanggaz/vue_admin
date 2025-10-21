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
            <td class="column-value">
              <!-- 편집 모드이고 편집 가능한 필드인 경우 -->
              <template v-if="editMode && item.editable">
                <!-- 콤보박스 필드 -->
                <select
                  v-if="item.fieldType === 'select'"
                  :value="item.value"
                  @change="
                    emit(
                      'field-change',
                      item.columnName,
                      ($event.target as HTMLSelectElement).value
                    )
                  "
                  class="edit-field-select"
                >
                  <option value="">선택하세요</option>
                  <option
                    v-for="option in item.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <!-- 파일 첨부 필드 -->
                <div
                  v-else-if="item.fieldType === 'file'"
                  class="file-input-group"
                >
                  <input
                    type="text"
                    :value="item.value"
                    class="edit-field-input"
                    :placeholder="item.value ? '' : '파일을 선택하세요'"
                    readonly
                  />
                  <button
                    type="button"
                    class="btn-attach-small"
                    @click="
                      item.value && item.value !== '-'
                        ? emit('file-remove', item.columnName)
                        : emit('file-attach', item.columnName)
                    "
                  >
                    {{ item.value && item.value !== "-" ? "첨부취소" : "첨부" }}
                  </button>
                </div>

                <!-- 기본 텍스트 필드 -->
                <input
                  v-else
                  type="text"
                  :inputmode="item.fieldType === 'number' ? 'numeric' : 'text'"
                  :value="item.value"
                  @input="
                    emit(
                      'field-change',
                      item.columnName,
                      ($event.target as HTMLInputElement).value
                    )
                  "
                  class="edit-field-input"
                />
              </template>

              <!-- 일반 모드 -->
              <template v-else>
                <!-- select 타입인 경우 options에서 label 찾기 -->
                <template v-if="item.fieldType === 'select' && item.options">
                  {{
                    item.options.find((opt) => opt.value === item.value)
                      ?.label || item.value
                  }}
                </template>
                <!-- file 타입이고 값이 있으면 다운로드 가능하게 -->
                <template
                  v-else-if="
                    item.fieldType === 'file' &&
                    item.value &&
                    item.value !== '-'
                  "
                >
                  <span
                    class="file-download-link"
                    @click.stop="emit('file-download', item.columnName)"
                  >
                    {{ item.value }}
                  </span>
                </template>
                <template v-else>
                  {{ item.value }}
                </template>
              </template>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: Array<{
    columnName: string;
    value: string;
    editable?: boolean;
    fieldType?: string;
    options?: Array<{ value: string; label: string }>;
    filePath?: string;
  }>;
  loading?: boolean;
  rowKey?: string;
  selectable?: boolean;
  selectedItems?: any[];
  editMode?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowKey: "id",
  selectable: false,
  selectedItems: () => [],
  editMode: false,
});

const emit = defineEmits<{
  "row-click": [item: any, index: number];
  "selection-change": [selectedItems: any[]];
  "field-change": [fieldName: string, value: string];
  "file-attach": [fieldName: string];
  "file-remove": [fieldName: string];
  "file-download": [fieldName: string];
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
      }

      .column-name {
        font-weight: $font-weight-md;
        background-color: $background-light;
        width: 40%;
      }

      .column-value {
        width: 60%;
        word-break: break-all;

        .edit-field-select,
        .edit-field-input {
          width: 100%;
          padding: 0.25rem 0.5rem;
          border: 1px solid $border-color;
          border-radius: 4px;
          background: white;
          color: $text-color;
          font-size: $font-size-sm;

          &:focus {
            outline: none;
            border-color: $primary-color;
          }
        }

        .file-input-group {
          display: flex;
          gap: 0.25rem;
          align-items: center;

          .edit-field-input {
            flex: 1;
          }

          .btn-attach-small {
            padding: 0.25rem 0.5rem;
            border: 1px solid $border-color;
            border-radius: 4px;
            background: $background-light;
            color: $text-color;
            cursor: pointer;
            font-size: 0.75rem;
            white-space: nowrap;

            &:hover {
              background: $primary-color;
              color: white;
              border-color: $primary-color;
            }
          }
        }

        .file-download-link {
          color: $primary-color;
          cursor: pointer;
          text-decoration: underline;

          &:hover {
            color: darken($primary-color, 10%);
            font-weight: 500;
          }
        }
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
