<template>
  <div class="machine-register-tab">
    <!-- 상단 검색/필터 영역 (이미지 레이아웃 참고) -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label required">⊙ 기계명</span>
        <select
          class="input select-md"
          v-model="selectedMachineName"
          :disabled="isRegistered"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="machine in machineStore.secondDepth"
            :key="machine.code_id"
            :value="machine.code_key"
          >
            {{ machine.code_value }}
          </option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label required">⊙ Excel 업로드</span>
        <div class="file-upload-group">
          <input
            type="text"
            class="input file-name-input"
            :value="excelFileName"
            readonly
            placeholder="파일을 선택하세요"
          />
          <input
            type="file"
            ref="excelFileInput"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            style="display: none"
            @change="handleExcelFileChange"
          />
          <button
            type="button"
            class="btn-file"
            @click="excelFileInput?.click()"
          >
            파일 선택
          </button>
        </div>
      </div>
      <div class="group-form inline right-align">
        <button
          type="button"
          class="btn-outline"
          @click.prevent="onDownloadExcelTemplate"
        >
          Excel 양식 다운로드
        </button>
        <button
          type="button"
          class="btn-register"
          @click="handleMachineRegister"
        >
          기계 등록
        </button>
      </div>
    </div>

    <!-- 리스트 테이블 -->
    <div class="section-header">
      <div class="section-title">⊙ 기계리스트 업로드</div>
      <div class="section-actions">
        <div class="file-upload-group">
          <input
            type="text"
            class="input file-name-input"
            :value="bulkFileName"
            readonly
            placeholder="파일을 선택하세요"
          />
          <input
            type="file"
            ref="bulkFileInput"
            accept=".zip"
            style="display: none"
            @change="handleBulkFileChange"
          />
          <button
            type="button"
            class="btn-file"
            @click="bulkFileInput?.click()"
          >
            모델 대량 업로드
          </button>
          <button
            type="button"
            class="btn-register"
            @click="handleModelRegister"
          >
            모델 등록
          </button>
        </div>
      </div>
    </div>

    <!-- ZIP 파일 내부 파일 목록 테이블 -->
    <div
      v-if="showZipContents && zipFileList.length > 0"
      class="zip-contents-section"
    >
      <h4 class="zip-contents-title">
        {{ t("common.zipFileList") }} ({{
          t("common.filesCount", { count: zipFileList.length })
        }})
      </h4>
      <DataTable
        :columns="zipTableColumns"
        :data="zipFileList"
        :loading="false"
        :selectable="false"
        :show-select-all="false"
        :max-height="'300px'"
      >
        <!-- 파일 크기 포맷팅 슬롯 -->
        <template #cell-size="{ value }">
          {{ formatFileSize(value) }}
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useMachineStore } from "@/stores/machineStore";

const { t } = useI18n();
const machineStore = useMachineStore();

// 등록 완료 상태
const isRegistered = ref(false);

// 선택된 기계명
const selectedMachineName = ref("");

// 엑셀 업로드 입력 ref
const excelFileInput = ref<HTMLInputElement | null>(null);
const excelFileName = ref<string>("");
// 대량 업로드 입력 ref
const bulkFileInput = ref<HTMLInputElement | null>(null);
const bulkFileName = ref<string>("");

// ZIP 파일 내부 파일 목록
const zipFileList = ref<
  Array<{ name: string; size: number; type: string; lastModified?: string }>
>([]);
const showZipContents = ref(false);

// ZIP 파일 목록 테이블 컬럼
const zipTableColumns: TableColumn[] = [
  { key: "name", title: t("common.fileName"), width: "40%", sortable: false },
  { key: "type", title: t("common.fileType"), width: "20%", sortable: false },
  { key: "size", title: t("common.fileSize"), width: "20%", sortable: false },
  {
    key: "lastModified",
    title: t("common.lastModified"),
    width: "20%",
    sortable: false,
  },
];

// 파일 크기 포맷팅 함수
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ZIP 파일 내부 파일 목록 추출 함수
async function extractZipContents(file: File) {
  try {
    // JSZip 라이브러리 로드 시도
    let JSZip;
    try {
      const jszipModule = await import("jszip");
      JSZip = jszipModule.default;
    } catch (importError) {
      console.warn("JSZip 라이브러리를 로드할 수 없습니다:", importError);
      // JSZip 없이 기본 정보만 표시
      const fileInfo = {
        name: file.name,
        size: file.size,
        type: "ZIP Archive",
        lastModified: new Date(file.lastModified).toLocaleString(),
      };
      zipFileList.value = [fileInfo];
      showZipContents.value = true;
      return;
    }

    const zip = new JSZip();
    const zipData = await zip.loadAsync(file);

    const fileList: Array<{
      name: string;
      size: number;
      type: string;
      lastModified?: string;
    }> = [];

    // 허용된 파일 확장자 목록
    const allowedExtensions = [
      "dtdx",
      "rvt",
      "jpg",
      "jpeg",
      "png",
      "gif",
      //"svg",
    ];
    const invalidFiles: string[] = [];
    let hasAllowedFile = false;
    let hasDtdx = false;
    let hasImage = false;

    // ZIP 파일 내부의 모든 파일을 순회
    zipData.forEach((relativePath: string, zipEntry: any) => {
      if (!zipEntry.dir) {
        // 디렉토리가 아닌 파일만
        const fileExtension =
          relativePath.split(".").pop()?.toLowerCase() || "";
        let fileType = "Unknown";

        // 파일 확장자에 따른 타입 분류
        if (["dtdx"].includes(fileExtension)) {
          fileType = "3D Model";
        } else if (["rvt"].includes(fileExtension)) {
          fileType = "Revit Model";
        } else if (["svg"].includes(fileExtension)) {
          fileType = "Symbol";
        } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
          fileType = "Thumbnail Image";
        }

        // 허용/비허용 판정
        if (fileExtension && allowedExtensions.includes(fileExtension)) {
          hasAllowedFile = true;
          if (fileExtension === "dtdx") hasDtdx = true;
          // 썸네일 이미지는 필수 (svg 제외)
          if (["jpg", "jpeg", "png", "gif"].includes(fileExtension))
            hasImage = true;
          // svg는 심볼 파일로 허용되지만 필수는 아님
        } else if (fileExtension) {
          invalidFiles.push(relativePath);
        }

        // 파일 크기 가져오기
        let fileSize = 0;
        if (zipEntry._data?.uncompressedSize) {
          fileSize = zipEntry._data.uncompressedSize;
        } else if (zipEntry.uncompressedSize) {
          fileSize = zipEntry.uncompressedSize;
        } else if (zipEntry._data?.compressedSize) {
          fileSize = zipEntry._data.compressedSize;
        } else if (zipEntry.compressedSize) {
          fileSize = zipEntry.compressedSize;
        }

        fileList.push({
          name: relativePath,
          size: fileSize,
          type: fileType,
          lastModified: zipEntry.date
            ? zipEntry.date.toLocaleString()
            : "Unknown",
        });
      }
    });

    // 허용된 파일이 하나도 없으면 첨부 불가 처리
    if (!hasAllowedFile) {
      alert(t("messages.warning.noAllowedFileInZip"));
      zipFileList.value = [];
      showZipContents.value = false;
      bulkFileName.value = "";
      return;
    }

    // 필수 파일(.dtdx, 썸네일 이미지)이 모두 포함되어 있는지 검증
    if (!(hasDtdx && hasImage)) {
      const missing: string[] = [];
      if (!hasDtdx) missing.push("3D모델(.dtdx)");
      if (!hasImage) missing.push("썸네일 이미지(.jpg/.jpeg/.png/.gif)");
      alert(
        t("messages.warning.zipMissingRequiredFiles", {
          missing: missing.join(", "),
        })
      );
      zipFileList.value = [];
      showZipContents.value = false;
      bulkFileName.value = "";
      return;
    }

    // 허용되지 않은 파일이 있으면 경고
    if (invalidFiles.length > 0) {
      alert(
        t("messages.warning.zipInvalidFiles", {
          files: invalidFiles.join("\n"),
        })
      );
    }

    zipFileList.value = fileList;
    showZipContents.value = true;
  } catch (error) {
    console.error("ZIP 파일 읽기 실패:", error);
    alert(t("messages.warning.zipReadFail"));
    zipFileList.value = [];
    showZipContents.value = false;
  }
}

// 공통 검증 함수: 기계명 필수 체크
function validateBasicSelections(): boolean {
  if (!selectedMachineName.value) {
    alert(t("messages.warning.selectMachineName"));
    return false;
  }

  return true;
}

// 버튼 핸들러들
function onDownloadExcelTemplate() {
  if (!validateBasicSelections()) return;
  // TODO: 템플릿 다운로드 로직 연결
}

// 엑셀 파일 변경 핸들러
function handleExcelFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];

  if (!file) {
    excelFileName.value = "";
    return;
  }

  // 기본 선택 검증
  if (!validateBasicSelections()) {
    input.value = "";
    return;
  }

  // 확장자 검증
  const allowed = [".xlsx", ".xls"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!allowed.includes(ext)) {
    alert(
      t("messages.warning.excelFileOnly", { extensions: allowed.join(", ") })
    );
    input.value = "";
    excelFileName.value = "";
    return;
  }

  // 크기 검증 (예: 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    alert(
      t("messages.warning.fileSizeExceed", { size: maxSize / 1024 / 1024 })
    );
    input.value = "";
    excelFileName.value = "";
    return;
  }

  excelFileName.value = file.name;

  // TODO: 실제 파싱/업로드 로직 연결 (예: FormData 전송 또는 xlsx 파싱)
}

// 대량 업로드 파일 변경 핸들러
async function handleBulkFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];

  if (!file) {
    bulkFileName.value = "";
    zipFileList.value = [];
    showZipContents.value = false;
    return;
  }

  // 기본 선택 검증
  if (!validateBasicSelections()) {
    input.value = "";
    return;
  }

  // 확장자 검증
  const allowed = [".zip"];
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!allowed.includes(ext)) {
    alert(
      t("messages.warning.zipFileOnly", { extensions: allowed.join(", ") })
    );
    input.value = "";
    bulkFileName.value = "";
    zipFileList.value = [];
    showZipContents.value = false;
    return;
  }

  // 크기 검증 (예: 200MB)
  const maxSize = 200 * 1024 * 1024;
  if (file.size > maxSize) {
    alert(
      t("messages.warning.fileSizeExceed", { size: maxSize / 1024 / 1024 })
    );
    input.value = "";
    bulkFileName.value = "";
    zipFileList.value = [];
    showZipContents.value = false;
    return;
  }

  bulkFileName.value = file.name;

  // ZIP 파일인 경우 내부 파일 목록 추출
  if (file.name.toLowerCase().endsWith(".zip")) {
    await extractZipContents(file);
  } else {
    zipFileList.value = [];
    showZipContents.value = false;
  }

  // 파일 선택 후 input 초기화 (같은 파일 재선택 가능하도록)
  input.value = "";
}

// 기계 등록 핸들러
function handleMachineRegister() {
  if (!validateBasicSelections()) return;

  if (!excelFileName.value) {
    alert(t("messages.warning.selectExcelFile"));
    return;
  }

  // TODO: 기계 등록 로직 연결
  console.log("기계 등록:", excelFileName.value);
}

// 모델 등록 핸들러
function handleModelRegister() {
  if (!validateBasicSelections()) return;

  if (!bulkFileName.value) {
    alert(t("messages.warning.selectModelFile"));
    return;
  }

  // TODO: 모델 등록 로직 연결
  console.log("모델 등록:", bulkFileName.value);
}
</script>

<style scoped lang="scss">
// 반응형 브레이크포인트
$mobile: 768px;
$tablet: 1024px;
$desktop: 1200px;

.filter-bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  gap: 12px 16px;
  align-items: center;
  margin-bottom: 14px;
  background: #f7f9fc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);

  // 태블릿 크기에서 2열로 변경
  @media (max-width: $tablet) {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
    gap: 10px 12px;
    padding: 12px;
  }

  // 모바일 크기에서 1열로 변경
  @media (max-width: $mobile) {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 10px;
  }
}

.group-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0; // flex 아이템이 축소될 수 있도록 함

  &.wide {
    grid-column: span 2;

    @media (max-width: $tablet) {
      grid-column: span 1;
    }
  }

  &.inline {
    flex-direction: row;
    align-items: center;
    gap: 12px;

    @media (max-width: $mobile) {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }
  }

  &.right-align {
    justify-content: flex-end;
  }
}

.label {
  font-size: 13px;
  color: #475467;
  min-width: 100px;
  flex-shrink: 0;

  &.required::after {
    content: " (＊)";
    color: #e74c3c;
    margin-left: 4px;
  }

  @media (max-width: $mobile) {
    min-width: auto;
    font-size: 12px;
  }
}

.label .req {
  display: none;
}

.input {
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0 8px;
  background: #fff;
  width: 100%;
  min-width: 0; // input이 축소될 수 있도록 함

  @media (max-width: $mobile) {
    height: 28px;
    font-size: 12px;
  }
}

.select-sm {
  min-width: 120px;

  @media (max-width: $mobile) {
    min-width: 100px;
  }
}

.select-md {
  min-width: 220px;

  @media (max-width: $tablet) {
    min-width: 180px;
  }

  @media (max-width: $mobile) {
    min-width: 150px;
  }
}

.right-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: $mobile) {
    justify-content: center;
    gap: 6px;
  }
}

.btn-outline {
  background: #fff;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  color: #344054;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #98a2b3;
  }

  &:active {
    background: #f2f4f7;
  }

  @media (max-width: $mobile) {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.file-upload-group {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0; // flex 컨테이너가 축소될 수 있도록 함

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
}

.file-name-input {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  background-color: #f9fafb;
  color: #4b5563;
  font-size: 14px;
  cursor: default;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background-color: white;
  }

  @media (max-width: $mobile) {
    font-size: 12px;
    padding: 6px 8px;
  }
}

.btn-file {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #2563eb;
  }

  &:active {
    background: #1d4ed8;
  }

  @media (max-width: $mobile) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.btn-register {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: #059669;
  }

  &:active {
    background: #047857;
  }

  @media (max-width: $mobile) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.section-title {
  margin: 10px 0;
  font-weight: 600;
  font-size: 16px;

  @media (max-width: $mobile) {
    font-size: 14px;
    margin: 8px 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: $mobile) {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }
}

.section-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: $mobile) {
    justify-content: center;
    gap: 6px;
  }
}

.footer-actions {
  display: flex;
  justify-content: center;
  margin: 8px 0 4px;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: $mobile) {
    gap: 6px;
  }
}

.btn-primary {
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  white-space: nowrap;

  @media (max-width: $mobile) {
    padding: 6px 12px;
    font-size: 12px;
  }
}

// 테이블 반응형 처리
:deep(.data-table) {
  overflow-x: auto;

  @media (max-width: $mobile) {
    font-size: 12px;
  }
}

// 모달 내부 스크롤 처리
:deep(.modal-body) {
  max-height: 70vh;
  overflow-y: auto;

  @media (max-width: $mobile) {
    max-height: 60vh;
  }
}

// ZIP 파일 내부 목록 섹션
.zip-contents-section {
  margin: 16px 0;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.zip-contents-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}
</style>
