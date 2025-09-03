<template>
  <div class="water-code-management">
    <div class="page-content">
      <div class="content-wrapper">
        <!-- 왼쪽: DataTable -->
        <div class="table-section">
          <div class="section-header">
            <h3>{{ t("waterCode.parameterList") }}</h3>
          </div>
          <div class="table-container">
            <DataTable
              :columns="tableColumns"
              :data="waterQualityParameters"
              maxHeight="100%"
              :stickyHeader="true"
            />
          </div>
        </div>

        <!-- 오른쪽: 파라미터 설정 폼 -->
        <div class="form-section">
          <div class="section-header">
            <h3>{{ t("waterCode.parameterSettings") }}</h3>
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
                  :class="{ error: validationErrors.parameter_code }"
                  :placeholder="t('placeholder.parameterCode')"
                  @input="clearValidationError('parameter_code')"
                  required
                />
                <div
                  v-if="validationErrors.parameter_code"
                  class="error-message"
                >
                  {{ validationErrors.parameter_code }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label essential">{{
                  t("waterCode.parameterName")
                }}</label>
                <input
                  type="text"
                  v-model="formData.parameter_name"
                  class="form-input"
                  :class="{ error: validationErrors.parameter_name }"
                  :placeholder="t('placeholder.parameterName')"
                  @input="clearValidationError('parameter_name')"
                  required
                />
                <div
                  v-if="validationErrors.parameter_name"
                  class="error-message"
                >
                  {{ validationErrors.parameter_name }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label essential">{{
                  t("waterCode.parameterNameEn")
                }}</label>
                <input
                  type="text"
                  v-model="formData.parameter_name_en"
                  class="form-input"
                  :class="{ error: validationErrors.parameter_name_en }"
                  :placeholder="t('placeholder.parameterNameEn')"
                  @input="clearValidationError('parameter_name_en')"
                  required
                />
                <div
                  v-if="validationErrors.parameter_name_en"
                  class="error-message"
                >
                  {{ validationErrors.parameter_name_en }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label essential">{{
                  t("waterCode.defaultUnit")
                }}</label>
                <input
                  type="text"
                  v-model="formData.default_unit"
                  class="form-input"
                  :class="{ error: validationErrors.default_unit }"
                  :placeholder="t('placeholder.defaultUnit')"
                  @input="clearValidationError('default_unit')"
                  required
                />
                <div v-if="validationErrors.default_unit" class="error-message">
                  {{ validationErrors.default_unit }}
                </div>
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
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  {{
                    isSubmitting ? t("common.processing") : t("common.register")
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
import { useInflowStore } from "@/stores/inflow";

const { t } = useI18n();
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

// Validation 상태
const validationErrors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

// 상태 관리 (추가 전용이므로 편집 관련 상태 제거)

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
    await inflowStore.fetchWaterQualityParameters();
  } catch (error) {
    console.error("수질 파라미터 로드 실패:", error);
  }
});

// Validation 함수들
const validateForm = (): boolean => {
  validationErrors.value = {};
  let isValid = true;

  // 파라미터 코드 검증
  if (!formData.value.parameter_code?.trim()) {
    validationErrors.value.parameter_code = t("validation.required", {
      field: t("waterCode.parameterCode"),
    });
    isValid = false;
  }

  // 파라미터명 검증
  if (!formData.value.parameter_name?.trim()) {
    validationErrors.value.parameter_name = t("validation.required", {
      field: t("waterCode.parameterName"),
    });
    isValid = false;
  }

  // 기본 단위 검증
  if (!formData.value.default_unit?.trim()) {
    validationErrors.value.default_unit = t("validation.required", {
      field: t("waterCode.defaultUnit"),
    });
    isValid = false;
  }

  // 영문 파라미터명 검증
  if (!formData.value.parameter_name_en?.trim()) {
    validationErrors.value.parameter_name_en = t("validation.required", {
      field: t("waterCode.parameterNameEn"),
    });
    isValid = false;
  }

  return isValid;
};

const clearValidationError = (field: string) => {
  if (validationErrors.value[field]) {
    delete validationErrors.value[field];
  }
};

// 폼 제출 처리 (등록만)
const handleSubmit = async () => {
  if (isSubmitting.value) return;

  // Validation 체크
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // 사용여부를 무조건 true로 설정
    const submitData = {
      ...formData.value,
      is_active: true,
    };

    // API 호출로 등록 처리
    const response = await inflowStore.createWaterQualityParameter(submitData);

    // 성공 후 폼 초기화
    resetForm();
    // 데이터 새로고침
    await inflowStore.fetchWaterQualityParameters();

    // 성공 메시지 표시
    alert(t("messages.success.parameterCreateSuccess"));
  } catch (error) {
    console.error("등록 실패:", error);
    alert(t("messages.error.parameterCreateFailed"));
  } finally {
    isSubmitting.value = false;
  }
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
  validationErrors.value = {};
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
    gap: $spacing-md;
    min-width: 0;
    width: 100%;
    height: 70vh;

    // 반응형 처리: 작은 화면에서는 세로 배치
    @media (max-width: 1024px) {
      flex-direction: column;
      gap: $spacing-sm;
      height: 80vh;
    }

    .table-section {
      flex: 2;
      background: white;
      border-radius: $border-radius-md;
      padding: $spacing-sm;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .form-section {
      flex: 1;
      background: white;
      border-radius: $border-radius-md;
      padding: $spacing-sm;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      @media (max-width: 1024px) {
        min-width: 100%;
        max-width: 100%;
      }

      .section-header {
        margin-bottom: $spacing-xs;
        padding-bottom: $spacing-xs;
        border-bottom: 2px solid $primary-color;
        flex-shrink: 0;

        h3 {
          margin: 0;
          color: $primary-color;
          font-size: $font-size-base;
          font-weight: $font-weight-bold;
        }
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
  gap: $spacing-sm;
  height: 100%;
  overflow: hidden;

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-shrink: 0;

    .form-label {
      font-weight: $font-weight-bold;
      color: $text-color;
      font-size: 14px;

      &.essential::after {
        content: " *";
        color: $error-color;
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
    }
  }

  .form-actions {
    display: flex;
    gap: $spacing-sm;
    justify-content: flex-end;
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid $border-color;
    flex-shrink: 0;

    .btn {
      padding: 10px 20px;
      border-radius: $border-radius-sm;
      cursor: pointer;
      border: 1px solid transparent;
      font-size: 14px;
      font-weight: $font-weight-md;
      transition: all 0.2s ease;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &.btn-primary {
        background-color: $primary-color;
        color: white;
        &:hover:not(:disabled) {
          background-color: darken($primary-color, 10%);
        }
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
