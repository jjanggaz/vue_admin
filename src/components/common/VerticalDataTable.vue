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
                  :type="item.fieldType === 'number' ? 'number' : 'text'"
                  :step="item.fieldType === 'number' ? 'any' : undefined"
                  :inputmode="item.fieldType === 'number' ? 'decimal' : 'text'"
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
  border-top: 2px solid #000000;
  border-bottom: 1px solid #000000;
}

.vertical-data-table {
  width: 100%;
  border-collapse: collapse;

  td {
    text-align: left;
    height: 40px;
    padding: 2px 10px;
    color: #333333;
    font-size: 15px;
    font-weight: 500;
  }

  tbody {
    .data-row {
      transition: $transition-base;

      td {
        &:first-child {
          border-right: 1px solid #000000;
        }
      }

      &.selected {
        background-color: rgba($primary-color, 0.1);
      }

      &:hover {
        background-color: $background-light;
      }

      .column-name {
        font-weight: $font-weight-md;
        background-color: $background-light;
        width: 120px;
        max-width: 120px;
        min-width: 120px;
      }

      .column-value {
        width: 100%;
        word-break: break-all;

        .edit-field-select,
        .edit-field-input {
          width: 100%;
          height: 36px;
          padding: 0 10px;
          border: 1px solid #e7e6ed;
          border-radius: 4px;
          background: #ffffff;
          color: #333333;
          font-size: 400;

          &:focus {
            outline: none;
            border-color: #3b82f6;
          }
        }

        .edit-field-select {
          appearance: none;
          padding: 0 32px 0 10px;
          background-image: url(../assets/icons/ico_select-down.svg);
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 12px auto;
          
          &:focus {
            background-image: url(../assets/icons/ico_select-up.svg);
          }
        }

        .file-input-group {
          display: flex;
          gap: 10px;
          align-items: center;

          .edit-field-input {
            flex: 1;
          }

          .btn-attach-small {
            height: 36px;
            padding: 0 10px;
            border-radius: 4px;
            background: #3e435e;
            color: #ffffff;
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
            cursor: pointer;
            transition: background .2s ease-in-out;

            &:hover {
              background: #3c4973;
            }
          }
        }

        .file-download-link {
          color: #1a73e8;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            text-decoration: underline;
            text-underline-offset: 3.5px;
            color: #1557b0;
          }

          &:visited {
            color: #1a73e8;
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
