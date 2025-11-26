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
            ...
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
            ...
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
      <span class="warning-icon">⚠</span>
      <span class="warning-text">
        {{ t("messages.warning.invalidFormulaFileNameFormat") }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAsset3DStore } from "@/stores/asset3DStore";

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
.asset3d-library-register-tab {
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 14px;
  background: #f7f9fc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  flex-wrap: nowrap;

  // 모바일 크기에서 줄바꿈 허용
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
  }
}

.register-form {
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex-shrink: 0;

  // 단위, 카테고리는 고정 폭
  &:nth-child(1),
  &:nth-child(2) {
    width: 150px;
  }

  // 모델명과 파일 업로드 그룹은 동일한 폭
  &:nth-child(3),
  &:nth-child(4),
  &:nth-child(5) {
    flex: 1;
    min-width: 200px;
    max-width: 300px;
  }

  // 등록 버튼은 우측 정렬
  &.right-align {
    justify-content: flex-end;
    align-items: flex-end;
    flex: 0 0 auto;
    margin-left: auto;
  }
}

label {
  font-size: 13px;
  color: #475467;
  font-weight: 500;

  &.required::after {
    content: "*";
    color: #e74c3c;
    margin-left: 2px;
  }
}

.form-select {
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0 8px;
  background: #fff;
  font-size: 14px;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.form-input {
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0 8px;
  background: #fff;
  font-size: 14px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &.file-name-input {
    background-color: #f9fafb;
    cursor: default;
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
  width: 32px;
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background: #f9fafb;
    border-color: #98a2b3;
  }
}

.btn-register {
  height: 32px;
  padding: 0 24px;
  border: none;
  border-radius: 6px;
  background: #222e77;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #1a2561;
  }

  &:active {
    background: #141b4a;
  }
}

.warning-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}

.warning-icon {
  font-size: 18px;
  color: #f59e0b;
  flex-shrink: 0;
}

.warning-text {
  font-size: 13px;
  color: #ef4444;
  line-height: 1.5;
}
</style>
