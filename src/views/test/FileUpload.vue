<template>
  <div class="file-upload-component">
    <div class="upload-section">
      <h2>파일 업로드 테스트</h2>

      <div class="file-upload-area">
        <input
          ref="fileInput"
          type="file"
          @change="handleFileSelect"
          class="file-input"
          id="fileInput"
        />
        <label
          for="fileInput"
          class="file-upload-label"
          :class="{ 'drag-over': fileUploadStore.isDragOver }"
          @dragenter.prevent="handleDragEnter"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div class="upload-icon">📁</div>
          <div class="upload-text">
            <p>파일을 선택하거나 드래그하여 업로드하세요</p>
            <p class="upload-hint">
              최대 {{ fileUploadStore.maxFileSizeFormatted }}, 단일 파일만 선택
              가능
            </p>
          </div>
        </label>
      </div>

      <div v-if="fileUploadStore.hasSelectedFiles" class="selected-files">
        <h3>선택된 파일</h3>
        <div class="file-list">
          <div
            v-for="(file, index) in fileUploadStore.selectedFiles"
            :key="index"
            class="file-item"
          >
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{
                fileUploadStore.formatFileSize(file.size)
              }}</span>
            </div>
            <button
              @click="fileUploadStore.removeSelectedFile(index)"
              class="remove-btn"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <div class="upload-actions">
        <div class="folder-selector">
          <label for="uploadFolder">업로드 폴더:</label>
          <select
            id="uploadFolder"
            v-model="selectedUploadFolder"
            class="folder-select"
          >
            <option value="excel">엑셀</option>
            <option value="dwg">도면</option>
            <option value="etc">기타</option>
          </select>
        </div>
        <div class="action-buttons">
          <button
            @click="
              () =>
                fileUploadStore.uploadFiles(selectedUploadFolder, () =>
                  handleFolderChange()
                )
            "
            :disabled="
              !fileUploadStore.hasSelectedFiles || fileUploadStore.uploading
            "
            class="btn btn-primary"
          >
            {{ fileUploadStore.uploading ? "업로드 중..." : "파일 업로드" }}
          </button>
          <button @click="clearFiles" class="btn btn-secondary">
            파일 삭제
          </button>
        </div>
      </div>

      <div
        v-if="fileUploadStore.uploading || fileUploadStore.uploadProgress > 0"
        class="upload-progress"
      >
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: fileUploadStore.uploadProgress + '%' }"
          ></div>
        </div>
        <span class="progress-text">
          {{
            fileUploadStore.uploading
              ? fileUploadStore.uploadProgress + "%"
              : "완료!"
          }}
        </span>
      </div>
    </div>

    <div class="uploaded-files-section">
      <div class="section-header">
        <h2>업로드된 파일 목록</h2>
        <div class="folder-selector">
          <label for="viewFolder">조회 폴더:</label>
          <select
            id="viewFolder"
            v-model="selectedViewFolder"
            @change="handleFolderChange"
            class="folder-select"
          >
            <option value="excel">엑셀</option>
            <option value="dwg">도면</option>
            <option value="etc">기타</option>
          </select>
        </div>
      </div>
      <div v-if="!fileUploadStore.hasUploadedFiles" class="no-files">
        업로드된 파일이 없습니다.
      </div>
      <div v-else class="uploaded-list">
        <div
          v-for="file in fileUploadStore.uploadedFiles"
          :key="file.id"
          class="uploaded-item"
        >
          <div class="file-details">
            <span class="file-name">{{ file.originalName }}</span>
            <span class="file-date">{{ formatDate(file.uploadDate) }}</span>
            <span class="file-path">{{ file.filepath }}</span>
          </div>
          <div class="file-actions">
            <button
              @click="fileUploadStore.downloadFile(file)"
              class="btn btn-sm"
            >
              다운로드
            </button>
            <button
              @click="
                fileUploadStore.deleteUploadedFile(file.id, selectedViewFolder)
              "
              class="btn btn-sm btn-danger"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useFileUploadStore } from "@/stores/fileUploadStore";

const fileUploadStore = useFileUploadStore();

// 폴더 선택 상태
const selectedUploadFolder = ref("excel");
const selectedViewFolder = ref("excel");

// 파일 input 참조
const fileInput = ref<HTMLInputElement>();

// 폴더 변경 핸들러
const handleFolderChange = async () => {
  try {
    await fileUploadStore.loadUploadedFiles(selectedViewFolder.value);
  } catch (error) {
    console.error("폴더 변경 시 파일 목록 불러오기 실패:", error);
  }
};

// 컴포넌트 마운트 시 업로드된 파일 목록 불러오기
onMounted(async () => {
  try {
    await fileUploadStore.loadUploadedFiles(selectedViewFolder.value);
  } catch (error) {
    console.error("파일 목록 불러오기 실패:", error);
    console.warn("서버가 실행중이 아니거나 CORS 설정이 필요할 수 있습니다");
    // loadUploadedFiles에서 이미 alert 처리됨
  }
});

// 파일 선택 처리
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (target.files && target.files.length > 0) {
    const newFiles = Array.from(target.files);
    fileUploadStore.addFiles(newFiles);

    // 동일한 파일을 다시 선택할 수 있도록 input 값 초기화
    target.value = "";
  }
};

// 드래그 앤 드롭 이벤트 핸들러
const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  fileUploadStore.setDragOver(true);
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  fileUploadStore.setDragOver(true);
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  // 자식 요소로 이동할 때 dragleave가 발생하는 것을 방지
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;

  if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
    fileUploadStore.setDragOver(false);
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  fileUploadStore.setDragOver(false);

  const files = event.dataTransfer?.files;
  if (files) {
    const fileArray = Array.from(files);
    fileUploadStore.addFiles(fileArray);
  }
};

// 전체 파일 삭제 (input value도 초기화)
const clearFiles = () => {
  fileUploadStore.clearSelectedFiles();
  // input 값 초기화 (동일한 파일 재선택을 위해)
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// 날짜 포맷팅
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped lang="scss">
@use "sass:color";

.file-upload-component {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-xl;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
  }
}

.upload-section,
.uploaded-files-section {
  background: $background-light;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  border: 1px solid $border-color;

  h2 {
    color: $text-color;
    margin-bottom: $spacing-lg;
    font-size: $font-size-lg;
  }
}

.uploaded-files-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg;

    h2 {
      margin: 0;
    }

    .folder-selector {
      display: flex;
      align-items: center;
      gap: $spacing-sm;

      label {
        font-weight: $font-weight-md;
        color: $text-color;
      }

      .folder-select {
        padding: $spacing-xs $spacing-sm;
        border: 1px solid $border-color;
        border-radius: $border-radius-sm;
        background: white;
        font-size: $font-size-sm;
      }
    }
  }
}

.file-upload-area {
  margin-bottom: $spacing-lg;

  .file-input {
    display: none;
  }

  .file-upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xl;
    border: 2px dashed $border-color;
    border-radius: $border-radius-md;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      border-color: $primary-color;
      background-color: rgba($primary-color, 0.05);
    }

    &.drag-over {
      border-color: $primary-color;
      background-color: rgba($primary-color, 0.1);

      .upload-icon {
        transform: scale(1.1);
        transition: transform 0.2s ease;
      }

      .upload-text p {
        color: $primary-color;
        font-weight: $font-weight-md;
      }
    }

    .upload-icon {
      font-size: 48px;
      margin-bottom: $spacing-md;
    }

    .upload-text {
      text-align: center;

      p {
        margin: 0;
        color: $text-color;

        &.upload-hint {
          font-size: $font-size-sm;
          color: $text-light;
          margin-top: $spacing-xs;
        }
      }
    }
  }
}

.selected-files {
  margin-bottom: $spacing-lg;

  h3 {
    color: $text-color;
    margin-bottom: $spacing-md;
    font-size: $font-size-base;
  }
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background: $background-color;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;

  .file-info {
    display: flex;
    flex-direction: column;

    .file-name {
      font-weight: $font-weight-md;
      color: $text-color;
    }

    .file-size {
      font-size: $font-size-sm;
      color: $text-light;
    }
  }

  .remove-btn {
    background: $error-color;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;

    &:hover {
      background: color.scale($error-color, $lightness: -10%);
    }
  }
}

.upload-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;

  .folder-selector {
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    label {
      font-weight: $font-weight-md;
      color: $text-color;
    }

    .folder-select {
      padding: $spacing-xs $spacing-sm;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
      background: white;
      font-size: $font-size-sm;
    }
  }

  .action-buttons {
    display: flex;
    gap: $spacing-sm;
  }
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  .progress-bar {
    flex: 1;
    height: 8px;
    background: $border-color;
    border-radius: 4px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: $primary-color;
      transition: width 0.3s ease;
    }
  }

  .progress-text {
    font-size: $font-size-sm;
    color: $text-light;
    min-width: 40px;
  }
}

.uploaded-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.uploaded-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md;
  background: $background-color;
  border: 1px solid $border-color;
  border-radius: $border-radius-sm;

  .file-details {
    display: flex;
    flex-direction: column;

    .file-name {
      font-weight: $font-weight-md;
      color: $text-color;
    }

    .file-date {
      font-size: $font-size-sm;
      color: $text-light;
    }

    .file-path {
      font-size: $font-size-sm;
      color: $text-light;
      font-style: italic;
    }
  }

  .file-actions {
    display: flex;
    gap: $spacing-sm;
  }
}

.no-files {
  text-align: center;
  color: $text-light;
  padding: $spacing-xl;
}

.btn {
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $border-radius-sm;
  cursor: pointer;
  font-size: $font-size-sm;
  transition: $transition-base;

  &.btn-primary {
    background: $primary-color;
    color: white;

    &:hover:not(:disabled) {
      background: color.scale($primary-color, $lightness: -10%);
    }

    &:disabled {
      background: $border-color;
      cursor: not-allowed;
    }
  }

  &.btn-secondary {
    background: $background-darker;
    color: white;

    &:hover {
      background: color.scale($background-darker, $lightness: -10%);
    }
  }

  &.btn-danger {
    background: $error-color;
    color: white;

    &:hover {
      background: color.scale($error-color, $lightness: -10%);
    }
  }

  &.btn-sm {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-sm;
  }
}
</style>
