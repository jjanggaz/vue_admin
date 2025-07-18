<template>
  <div class="test-page">
    <div class="page-header">
      <h1>{{ t("pageTitles.test") }}</h1>
      <p>파일 첨부 기능 테스트 페이지</p>
    </div>

    <div class="content-wrapper">
      <div class="upload-section">
        <h2>파일 업로드 테스트</h2>

        <div class="file-upload-area">
          <input
            ref="fileInput"
            type="file"
            multiple
            @change="handleFileSelect"
            class="file-input"
            id="fileInput"
          />
          <label
            for="fileInput"
            class="file-upload-label"
            :class="{ 'drag-over': isDragOver }"
            @dragenter.prevent="handleDragEnter"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <div class="upload-icon">📁</div>
            <div class="upload-text">
              <p>파일을 선택하거나 드래그하여 업로드하세요</p>
              <p class="upload-hint">최대 10MB, 여러 파일 선택 가능</p>
            </div>
          </label>
        </div>

        <div v-if="selectedFiles.length > 0" class="selected-files">
          <h3>선택된 파일 목록</h3>
          <div class="file-list">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="file-item"
            >
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
              </div>
              <button @click="removeFile(index)" class="remove-btn">×</button>
            </div>
          </div>
        </div>

        <div class="upload-actions">
          <button
            @click="uploadFiles"
            :disabled="selectedFiles.length === 0 || uploading"
            class="btn btn-primary"
          >
            {{ uploading ? "업로드 중..." : "파일 업로드" }}
          </button>
          <button @click="clearFiles" class="btn btn-secondary">
            전체 삭제
          </button>
        </div>

        <div v-if="uploadProgress > 0" class="upload-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <span class="progress-text">{{ uploadProgress }}%</span>
        </div>
      </div>

      <div class="uploaded-files-section">
        <h2>업로드된 파일 목록</h2>
        <div v-if="uploadedFiles.length === 0" class="no-files">
          업로드된 파일이 없습니다.
        </div>
        <div v-else class="uploaded-list">
          <div
            v-for="file in uploadedFiles"
            :key="file.id"
            class="uploaded-item"
          >
            <div class="file-details">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-date">{{ formatDate(file.uploadDate) }}</span>
            </div>
            <div class="file-actions">
              <button @click="downloadFile(file)" class="btn btn-sm">
                다운로드
              </button>
              <button
                @click="deleteFile(file.id)"
                class="btn btn-sm btn-danger"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// 파일 관련 상태
const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<File[]>([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const isDragOver = ref(false);

// 업로드된 파일 목록 (실제로는 서버에서 받아와야 함)
const uploadedFiles = reactive([
  {
    id: 1,
    name: "test-file-1.pdf",
    uploadDate: new Date(),
    size: 1024000,
  },
  {
    id: 2,
    name: "test-image.jpg",
    uploadDate: new Date(),
    size: 2048000,
  },
]);

// 파일 선택 처리
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newFiles = Array.from(target.files);
    addFiles(newFiles);
  }
};

// 파일 추가 공통 함수
const addFiles = (files: File[]) => {
  // 파일 크기 제한 (10MB)
  const maxSize = 10 * 1024 * 1024;
  const validFiles = files.filter((file) => {
    if (file.size > maxSize) {
      alert(`${file.name}은(는) 파일 크기가 너무 큽니다. (최대 10MB)`);
      return false;
    }
    return true;
  });

  selectedFiles.value.push(...validFiles);
};

// 드래그 앤 드롭 이벤트 핸들러
const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  // 자식 요소로 이동할 때 dragleave가 발생하는 것을 방지
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;

  if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
    isDragOver.value = false;
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (files) {
    const fileArray = Array.from(files);
    addFiles(fileArray);
  }
};

// 파일 제거
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

// 전체 파일 삭제
const clearFiles = () => {
  selectedFiles.value = [];
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// 파일 크기 포맷팅
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

// 파일 업로드 (실제 구현 시 Python 백엔드 API 호출)
const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return;

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // 실제 구현에서는 FormData를 사용하여 파일 전송
    const formData = new FormData();
    selectedFiles.value.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    // 진행률 시뮬레이션 (실제로는 axios의 onUploadProgress 사용)
    const progressInterval = setInterval(() => {
      uploadProgress.value += 10;
      if (uploadProgress.value >= 100) {
        clearInterval(progressInterval);
        // 업로드 완료 시 업로드된 파일 목록에 추가
        selectedFiles.value.forEach((file) => {
          uploadedFiles.push({
            id: uploadedFiles.length + 1,
            name: file.name,
            uploadDate: new Date(),
            size: file.size,
          });
        });
        clearFiles();
        uploadProgress.value = 0;
        uploading.value = false;
      }
    }, 200);

    // 실제 API 호출 예시:
    // const response = await axios.post('/api/upload', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    //   onUploadProgress: (progressEvent) => {
    //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    //     uploadProgress.value = percentCompleted;
    //   },
    // });
  } catch (error) {
    console.error("파일 업로드 중 오류:", error);
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

// 파일 다운로드
const downloadFile = (file: any) => {
  // 실제 구현에서는 서버에서 파일 다운로드
  console.log("파일 다운로드:", file.name);
  // window.open(`/api/download/${file.id}`, '_blank');
};

// 파일 삭제
const deleteFile = (fileId: number) => {
  const index = uploadedFiles.findIndex((file) => file.id === fileId);
  if (index > -1) {
    uploadedFiles.splice(index, 1);
  }
  // 실제 구현에서는 서버에서도 파일 삭제
  // await axios.delete(`/api/files/${fileId}`);
};
</script>

<style scoped lang="scss">
@use "sass:color";
.test-page {
  padding: $spacing-xl;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: $spacing-xl;

  h1 {
    color: $text-color;
    margin-bottom: $spacing-sm;
  }

  p {
    color: $text-light;
  }
}

.content-wrapper {
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
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
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
