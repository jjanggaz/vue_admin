<template>
  <div class="water-code-management">
    <div class="page-content">
      <div class="content-wrapper">
        <!-- 왼쪽: DataTable -->
        <div class="table-section">
          <div class="section-header">
            <h3>{{ t("waterCode.parameterList") }}</h3>
            <div class="header-buttons">
              <button
                class="btn btn-update"
                @click="handleUpdateClick"
                :disabled="!selectedParameter"
              >
                {{ t("common.update") }}
              </button>
              <button
                class="btn btn-danger"
                @click="handleDeleteClick"
                :disabled="!selectedParameter"
              >
                {{ t("common.delete") }}
              </button>
            </div>
          </div>
          <div class="table-container">
            <DataTable
              :columns="tableColumns"
              :data="waterQualityParameters"
              maxHeight="100%"
              :stickyHeader="true"
              :selectable="true"
              selectionMode="single"
              :showSelectAll="false"
              :selectHeaderText="t('common.selectColumn')"
              row-key="parameter_id"
              :selected-items="selectedParameter ? [selectedParameter] : []"
              @selection-change="handleSelectionChange"
            />
          </div>
        </div>

        <!-- 오른쪽: 파라미터 설정 폼 -->
        <div class="form-section">
          <div class="section-header">
            <h3>
              {{
                isEditMode
                  ? t("waterCode.parameterUpdate")
                  : t("waterCode.parameterRegister")
              }}
            </h3>
          </div>
          <div class="form-container">
            <form @submit.prevent="handleSubmit" class="parameter-form">
              <div class="form-group">
                <label class="form-label essential">{{
                  t("waterCode.parameterCode")
                }}</label>
                <input
                  type="text"
                  v-model="formData.parameter_code"
                  class="form-input"
                  :placeholder="t('placeholder.parameterCode')"
                />
              </div>

              <div class="form-group">
                <label class="form-label essential">{{
                  t("waterCode.parameterName")
                }}</label>
                <input
                  type="text"
                  v-model="formData.parameter_name"
                  class="form-input"
                  :placeholder="t('placeholder.parameterName')"
                />
              </div>

              <div class="form-group">
                <label class="form-label essential">{{
                  t("waterCode.parameterNameEn")
                }}</label>
                <input
                  type="text"
                  v-model="formData.parameter_name_en"
                  class="form-input"
                  :placeholder="t('placeholder.parameterNameEn')"
                />
              </div>

              <div class="form-group">
                <label class="form-label essential">{{
                  t("waterCode.defaultUnit")
                }}</label>
                <input
                  type="text"
                  v-model="formData.default_unit"
                  class="form-input"
                  :placeholder="t('placeholder.defaultUnit')"
                />
              </div>

              <div class="form-group">
                <label class="form-label">{{
                  t("waterCode.description")
                }}</label>
                <textarea
                  v-model="formData.description"
                  class="form-textarea"
                  :placeholder="t('placeholder.description')"
                  rows="4"
                ></textarea>
              </div>

              <div class="form-actions">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="handleCancel"
                  :disabled="isSubmitting"
                  v-if="isEditMode"
                >
                  {{ t("common.cancel") }}
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  {{
                    isSubmitting
                      ? t("common.processing")
                      : isEditMode
                      ? t("common.save")
                      : t("common.register")
                  }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import { useInflowStore } from "@/stores/inflow";

// Props 정의
interface Props {
  flowDirection: string;
}

const props = withDefaults(defineProps<Props>(), {
  flowDirection: "INFLUENT",
});

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

const inflowStore = useInflowStore();

// 인터페이스 정의
interface WaterQualityParameter {
  parameter_id: string;
  parameter_code: string;
  parameter_name: string;
  parameter_name_en: string;
  parameter_type: string;
  default_unit: string;
  description: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

// 폼 데이터
const formData = ref<Partial<WaterQualityParameter>>({
  parameter_code: "",
  parameter_name: "",
  parameter_name_en: "",
  default_unit: "",
  description: "",
  is_active: true,
});

// 제출 상태
const isSubmitting = ref(false);

// 선택된 파라미터
const selectedParameter = ref<WaterQualityParameter | null>(null);

// 수정 모드 여부
const isEditMode = ref(false);

// 선택 변경 핸들러
const handleSelectionChange = (items: WaterQualityParameter[]) => {
  if (items.length > 0) {
    selectedParameter.value = items[0];
  } else {
    selectedParameter.value = null;
  }
};

// 수정 버튼 클릭 핸들러
const handleUpdateClick = () => {
  if (!selectedParameter.value) return;

  // 선택된 항목을 폼에 로드
  formData.value = {
    parameter_id: selectedParameter.value.parameter_id,
    parameter_code: selectedParameter.value.parameter_code,
    parameter_name: selectedParameter.value.parameter_name,
    parameter_name_en: selectedParameter.value.parameter_name_en,
    default_unit: selectedParameter.value.default_unit,
    description: selectedParameter.value.description,
    is_active: selectedParameter.value.is_active,
  };

  isEditMode.value = true;
};

// 삭제 버튼 클릭 핸들러
const handleDeleteClick = async () => {
  if (!selectedParameter.value) return;

  const confirmMessage = selectedParameter.value.parameter_name
    ? `${t("messages.confirm.deleteItem")} (${
        selectedParameter.value.parameter_name
      })`
    : t("messages.confirm.deleteItem");

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    await inflowStore.deleteWaterQualityParameter(
      selectedParameter.value.parameter_id
    );

    // 성공 후 데이터 새로고침
    await inflowStore.fetchWaterQualityParameters(props.flowDirection);

    // 선택 해제
    selectedParameter.value = null;

    // 폼 초기화
    resetForm();

    alert(t("messages.success.deleted"));
  } catch (error) {
    console.error("파라미터 삭제 실패:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.deleteFailed"
    );
    alert(errorMessage);
  }
};

// 테이블 컬럼 정의
const tableColumns: TableColumn[] = [
  {
    key: "parameter_code",
    title: t("columns.waterCode.parameterCode"),
    sortable: false,
  },
  {
    key: "parameter_name",
    title: t("columns.waterCode.parameterName"),
    sortable: false,
  },
  {
    key: "parameter_name_en",
    title: t("columns.waterCode.parameterNameEn"),
    sortable: false,
  },
  {
    key: "default_unit",
    title: t("columns.waterCode.defaultUnit"),
    sortable: false,
  },
  {
    key: "description",
    title: t("columns.waterCode.description"),
    sortable: false,
  },
];

// 수질 파라미터 목록 (store에서 가져오기)
const waterQualityParameters = computed(
  () => inflowStore.waterQualityParameters
);

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  try {
    await inflowStore.fetchWaterQualityParameters(props.flowDirection);
  } catch (error) {
    console.error("수질 파라미터 로드 실패:", error);
  }
});

// Validation 함수
const validateForm = (): string | null => {
  // 파라미터 코드 검증
  if (!formData.value.parameter_code?.trim()) {
    return t("validation.required", {
      field: t("waterCode.parameterCode"),
    });
  }

  // 파라미터명 검증
  if (!formData.value.parameter_name?.trim()) {
    return t("validation.required", {
      field: t("waterCode.parameterName"),
    });
  }

  // 영문 파라미터명 검증
  if (!formData.value.parameter_name_en?.trim()) {
    return t("validation.required", {
      field: t("waterCode.parameterNameEn"),
    });
  }

  // 기본 단위 검증
  if (!formData.value.default_unit?.trim()) {
    return t("validation.required", {
      field: t("waterCode.defaultUnit"),
    });
  }

  return null;
};

// 폼 제출 처리 (등록/수정)
const handleSubmit = async () => {
  if (isSubmitting.value) return;

  // Validation 체크
  const errorMessage = validateForm();
  if (errorMessage) {
    alert(errorMessage);
    return;
  }

  isSubmitting.value = true;

  try {
    // 사용여부를 무조건 true로 설정하고 flow_direction 추가
    const submitData = {
      ...formData.value,
      is_active: true,
      flow_direction: props.flowDirection,
    };

    if (isEditMode.value) {
      // 수정 모드
      if (!formData.value.parameter_id) {
        alert(t("messages.error.parameterUpdateFailed"));
        isSubmitting.value = false;
        return;
      }
      await inflowStore.updateWaterQualityParameter(
        formData.value.parameter_id,
        submitData
      );
      alert(t("messages.success.parameterUpdateSuccess"));
    } else {
      // 등록 모드
      await inflowStore.createWaterQualityParameter(submitData);
      alert(t("messages.success.parameterCreateSuccess"));
    }

    // 성공 후 폼 초기화
    resetForm();
    // 데이터 새로고침
    await inflowStore.fetchWaterQualityParameters(props.flowDirection);
  } catch (error) {
    console.error(isEditMode.value ? "수정 실패:" : "등록 실패:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      isEditMode.value
        ? "messages.error.parameterUpdateFailed"
        : "messages.error.parameterCreateFailed"
    );
    alert(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};

// 취소 핸들러
const handleCancel = () => {
  resetForm();
};

// 폼 초기화
const resetForm = () => {
  formData.value = {
    parameter_code: "",
    parameter_name: "",
    parameter_name_en: "",
    default_unit: "",
    description: "",
    is_active: true,
  };
  isEditMode.value = false;
  selectedParameter.value = null;
};

// 삭제 처리 제거 (추가 전용이므로)
</script>

<style scoped lang="scss">
.water-code-management {
  padding: 0;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;

  .page-content {
    min-width: 0;
    width: 100%;

    h2 {
      margin-bottom: $spacing-lg;
      color: $text-color;
    }
  }

  .content-wrapper {
    display: flex;
    gap: 20px;
    min-width: 0;
    width: 100%;
    height: 70vh;

    // 반응형 처리: 작은 화면에서는 세로 배치
    @media (max-width: 1024px) {
      flex-direction: column;
      gap: 20px;
      height: 80vh;
    }

    .table-section {
      flex: 2;
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .section-header {
        margin-bottom: $spacing-xs;
        padding-bottom: $spacing-xs;
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          color: #202020;
          font-size: 16px;
          font-weight: 600;
        }

        .header-buttons {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .btn {
          width: 45px;
          height: 32px;
          padding: 0 8px;
          border-radius: $border-radius-sm;
          border: 1px solid transparent;
          color: #ffffff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;

          &.btn-update {
            background-color: #222e77;
            
            &:hover {
              background-color: #29378c;
            }
            &:disabled {
              background-color: #abaebd;
              cursor: not-allowed;
            }
          }

          &.btn-danger {
            background-color: #3e435e;
            
            &:hover {
              background-color: #3c4973;
            }
            &:disabled {
              background-color: #abaebd;
              cursor: not-allowed;
            }
          }
        }
      }
    }

    .form-section {
      flex: 1;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      overflow: visible;
      display: flex;
      flex-direction: column;
      padding-top: 12px;

      .form-container {
        min-width: 0;
        overflow: hidden;
        overflow: auto;
        min-height: 0;
      }

      @media (max-width: 1024px) {
        min-width: 100%;
        max-width: 100%;
      }

      .section-header {
        margin-bottom: 16px;
        padding-bottom: $spacing-xs;
        border-bottom: 2px solid #000000;
        flex-shrink: 0;

        h3 {
          color: #202020;
          font-size: 16px;
          font-weight: $font-weight-bold;
        }
      }

      input,
      select,
      textarea {
        border: 1px solid #e7e6ed;
        border-radius: 4px;

        &:focus {
          border: 1px solid #279bd8;
          box-shadow: none;
        }
      }
    }
    @media (max-width: 1024px) {
      .form-section {
        padding-top: 0;
      }
    }

    .table-section {
      .table-container {
        min-width: 0;
        flex: 1;
        overflow: hidden;
      }
    }

    .form-section {
      .form-container {
        min-width: 0;
        flex: 1;
        overflow: hidden;
      }
    }
  }
}

// 폼 스타일
.parameter-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  padding-right: 6px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  &.with-scroll {
    overflow-y: auto;
  }
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #dddddd;
    border-radius: 3px;

    &:hover {
      background-color: #b9b9b9;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    margin-bottom: 0;

    .form-label {
      color: #333333;
      font-weight: 600;
      font-size: 13px;

      &.essential::after {
        content: " *";
        color: #333333;
      }
    }

    .form-input,
    .form-textarea {
      padding: 8px;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
      font-size: 14px;
      transition: border-color 0.2s ease;

      &:focus {
        outline: none;
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba($primary-color, 0.1);
      }

      &:disabled {
        background-color: $background-light;
        color: $text-light;
        cursor: not-allowed;
      }

      &.error {
        border-color: $error-color;
        box-shadow: 0 0 0 2px rgba($error-color, 0.1);
      }
    }

    .error-message {
      color: $error-color;
      font-size: 12px;
      margin-top: 2px;
    }

    .form-textarea {
      resize: none;
      height: 80px;

      -webkit-overflow-scrolling: touch;

      &.with-scroll {
        overflow-y: auto;
      }
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background-color: #dddddd;
        border-radius: 3px;

        &:hover {
          background-color: #b9b9b9;
        }
      }
    }
  }

  .form-actions {
    display: flex;
    gap: $spacing-sm;
    justify-content: flex-end;
    padding-top: 10px;
    border-top: 1px solid #000000;
    flex-shrink: 0;

    .btn {
      width: 45px;
      height: 32px;
      padding: 0 8px;
      border-radius: $border-radius-sm;
      border: 1px solid transparent;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.btn-secondary {
        background-color: white;
        border-color: $border-color;
        color: $text-color;
        &:hover:not(:disabled) {
          background-color: $background-light;
        }
      }

      &.btn-danger {
        background-color: $error-color;
        color: white;
        &:hover:not(:disabled) {
          background-color: darken($error-color, 10%);
        }
      }
    }
  }
}
</style>
