<template>
  <div class="asset3d-library-register-tab">
    <!-- 등록 폼 -->
    <div class="filter-bar">
      <div class="form-group">
        <label class="required">단위</label>
        <select v-model="selectedUnit" class="form-select">
          <option value="">-- 선택 --</option>
          <option
            v-for="unit in asset3DStore.unitSystems"
            :key="unit.unit_system_id"
            :value="unit.system_code"
          >
            {{ unit.system_name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label class="required">3D ASSET 카테고리</label>
        <select v-model="selectedCategory" class="form-select">
          <option value="">-- 선택 --</option>
          <option value="INTERIOR">인테리어</option>
          <option value="STRUCTURE">구조물</option>
        </select>
      </div>
      <div class="form-group">
        <label class="required">3D 모델명</label>
        <input
          type="text"
          v-model="modelName"
          class="form-input"
          placeholder="모델명 입력"
        />
      </div>
      <div class="form-group">
        <label>3D모델 업로드</label>
        <div class="file-upload-group">
          <input
          type="text"
          class="form-input file-name-input"
          :value="modelFileName"
          readonly
          placeholder="파일 선택"
          />
          <input
          type="file"
          ref="modelFileInput"
          accept=".dtdx"
          style="display: none"
          @change="handleModelFileChange"
          />
          <button
            type="button"
            class="btn-ellipsis"
            @click="modelFileInput?.click()"
          >
          </button>
        </div>
      </div>
      <div class="form-group">
        <label>3D모델 썸네일</label>
        <div class="file-upload-group">
          <input
          type="text"
          class="form-input file-name-input"
          :value="thumbnailFileName"
          readonly
          placeholder="파일 선택"
          />
          <input
          type="file"
          ref="thumbnailFileInput"
          accept=".jpg,.jpeg,.png,.gif"
          style="display: none"
          @change="handleThumbnailFileChange"
          />
          <button
            type="button"
            class="btn-ellipsis"
            @click="thumbnailFileInput?.click()"
          >
          </button>
        </div>
      </div>
      <div class="form-group right-align">
        <button type="button" class="btn-register" @click="handleRegister">
          등록
        </button>
      </div>
    </div>

    <!-- 파일명 규칙 경고 메시지 -->
    <div class="warning-message">
      <span class="caution-ico">
        {{ t("messages.warning.invalidFormulaFileNameFormat") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAsset3DStore } from "@/stores/asset3DStore";

// Props 정의
interface Props {
  isEditMode?: boolean;
  editItem?: Record<string, unknown> | null;
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
  editItem: null,
});

const { t } = useI18n();
const asset3DStore = useAsset3DStore();

// 폼 데이터
const selectedUnit = ref("");
const selectedCategory = ref("");
const modelName = ref("");
const modelFile = ref<File | null>(null);
const modelFileName = ref("");
const thumbnailFile = ref<File | null>(null);
const thumbnailFileName = ref("");

// 파일 input refs
const modelFileInput = ref<HTMLInputElement | null>(null);
const thumbnailFileInput = ref<HTMLInputElement | null>(null);

// 3D 모델 파일 변경 핸들러
const handleModelFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files?.[0];

  if (file) {
    // 파일명 validation
    if (!validateFileName(file.name)) {
      alert(t("messages.warning.invalidFormulaFileNameFormat"));
      input.value = "";
      modelFileName.value = "";
      modelFile.value = null;
      return;
    }

    // 확장자 검증
    if (!file.name.toLowerCase().endsWith(".dtdx")) {
      alert("3D 모델 파일은 .dtdx 확장자만 허용됩니다.");
      input.value = "";
      modelFileName.value = "";
      modelFile.value = null;
      return;
    }

    modelFileName.value = file.name;
    modelFile.value = file;
  } else {
    modelFileName.value = "";
    modelFile.value = null;
  }
};

// 썸네일 파일 변경 핸들러
const handleThumbnailFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files?.[0];

  if (file) {
    // 파일명 validation
    if (!validateFileName(file.name)) {
      alert(t("messages.warning.invalidFormulaFileNameFormat"));
      input.value = "";
      thumbnailFileName.value = "";
      thumbnailFile.value = null;
      return;
    }

    // 확장자 검증
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      alert("썸네일 파일은 .jpg, .jpeg, .png, .gif 확장자만 허용됩니다.");
      input.value = "";
      thumbnailFileName.value = "";
      thumbnailFile.value = null;
      return;
    }

    thumbnailFileName.value = file.name;
    thumbnailFile.value = file;
  } else {
    thumbnailFileName.value = "";
    thumbnailFile.value = null;
  }
};

// 파일명 validation 함수
const validateFileName = (fileName: string): boolean => {
  // 확장자 제거
  const lastDotIndex = fileName.lastIndexOf(".");
  const nameWithoutExt =
    lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;

  // 파일명이 비어있으면 안 됨
  if (!nameWithoutExt || nameWithoutExt.trim() === "") {
    return false;
  }

  // 100자 이내 체크
  if (nameWithoutExt.length > 100) {
    return false;
  }

  // 영문, 숫자, 특수 기호 "_-()"만 허용
  const fileNameRegex = /^[a-zA-Z0-9_\-().]+$/;
  if (!fileNameRegex.test(nameWithoutExt)) {
    return false;
  }

  return true;
};

// 등록 핸들러
const handleRegister = async () => {
  // 필수 항목 검증
  if (!selectedUnit.value) {
    alert("단위를 선택해주세요.");
    return;
  }

  if (!selectedCategory.value) {
    alert("3D ASSET 카테고리를 선택해주세요.");
    return;
  }

  if (!modelName.value || modelName.value.trim() === "") {
    alert("3D 모델명을 입력해주세요.");
    return;
  }

  // 모델명 validation
  if (!validateFileName(modelName.value)) {
    alert(t("messages.warning.invalidFormulaFileNameFormat"));
    return;
  }

  try {
    // TODO: 등록 API 호출
    console.log("등록 데이터:", {
      unit: selectedUnit.value,
      category: selectedCategory.value,
      modelName: modelName.value,
      modelFile: modelFile.value,
      thumbnailFile: thumbnailFile.value,
    });

    alert("등록되었습니다.");

    // 성공 시 초기화
    selectedUnit.value = "";
    selectedCategory.value = "";
    modelName.value = "";
    modelFileName.value = "";
    modelFile.value = null;
    thumbnailFileName.value = "";
    thumbnailFile.value = null;
    if (modelFileInput.value) {
      modelFileInput.value.value = "";
    }
    if (thumbnailFileInput.value) {
      thumbnailFileInput.value.value = "";
    }
  } catch (error) {
    console.error("등록 실패:", error);
    alert("등록에 실패했습니다.");
  }
};
</script>

<style scoped lang="scss">
$mobile: 768px;
$tablet: 1024px;

.filter-bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  align-items: flex-end;
  gap: 20px 10px;

  // 태블릿 크기에서 2열로 변경
  @media (max-width: $tablet) {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }

  // 모바일 크기에서 1열로 변경
  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex-shrink: 0;
  margin-bottom: 0;
  width: 100%;

  &.right-align {
    justify-content: flex-end;
    align-items: flex-start;
    flex: 0 0 auto;
    margin-left: auto;
  }
}

label {
  display: inline-block;
  margin-bottom: 0;
  color: #333333;
  font-size: 13px;
  font-weight: 600;
  min-width: 100px;
  flex-shrink: 0;

  &.required::after {
    content: "*";
    color: #333333;
    margin-left: 4px;
  }
}

input,
select {
  appearance: none;
  position: relative;
  width: 100%;
  min-width: 0;
  height: 40px;
  border: 1px solid #e7e6ed;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 400;

  &:disabled {
    border: 1px solid #dfdfdf;
    background-color: #f0f0f0;
  }
}

input {
  padding: 0 10px;

  &:focus {
    border-color: #3b82f6;
  }
}

select {
  padding: 0 32px 0 10px;
  background-color: transparent;
  background-image: url(../../../assets/icons/ico_select-down.svg);
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px auto;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background-image: url(../../../assets/icons/ico_select-up.svg);
  }
}

.input-with-button {
  display: flex;
  gap: 8px;
  align-items: center;

  .form-input {
    flex: 1;
  }
}

.file-upload-group {
  display: flex;
  gap: 8px;
  align-items: center;

  .form-input {
    flex: 1;
  }
}

.btn-ellipsis {
  flex-shrink: 0;
  white-space: nowrap;
  width: 44px;
  height: 40px;
  padding: 0 10px;
  background: url(../../../assets/icons/ico_ellipsis-btn.svg) no-repeat center / 18px auto;
  background-color: #3e435e;
  border-radius: 4px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  cursor: pointer;

  &:hover,
  &:active {
    background-color: #3c4973;
  }
}

.btn-register {
  height: 40px;
  background: #222e77;
  color: #ffffff;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #29378c;
  } 

  &:active {
    background: #29378c;
  }

  @media (max-width: $mobile) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.warning-message {
  position: relative;
  text-align: center;
  padding: 20px 0;

  .caution-ico {
    display: inline-block;
    padding: 2px 0 1.5px 18px;
    color: #FF3B30;
    font-size: 14px;
    font-weight: 400;
    font-family: "Noto Sans KR";
    letter-spacing: -0.056px;
    background: url(../../../assets/icons/ico_caution.svg) no-repeat 0 center / 16px auto;

    @media (max-width: 550px) {
      font-size: 13px; 
    }
  }
}
</style>
