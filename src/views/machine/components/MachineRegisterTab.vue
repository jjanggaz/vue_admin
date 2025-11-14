<template>
  <div class="machine-register-tab">
    <!-- 상단 검색/필터 영역 (이미지 레이아웃 참고) -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label required"
          >⊙ {{ t("common.machineMajorCategory") }}</span
        >
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
        <span class="label required">⊙ {{ t("common.excelUpload") }}</span>
        <div class="file-upload-group">
          <input
            type="text"
            class="input file-name-input"
            :value="excelFileName"
            readonly
            :placeholder="t('placeholder.selectFile')"
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
            {{ t("common.selectFile") }}
          </button>
        </div>
      </div>
      <div class="group-form inline right-align">
        <button
          type="button"
          class="btn-outline"
          @click.prevent="onDownloadExcelTemplate"
        >
          {{ t("common.excelTemplateDownload") }}
        </button>
        <button
          type="button"
          class="btn-register"
          @click="handleMachineRegister"
        >
          {{ t("common.machineRegister") }}
        </button>
      </div>
    </div>

    <!-- 리스트 테이블 -->
    <div class="section-header">
      <div class="section-title">⊙ {{ t("common.machineUpload") }}</div>
      <div class="section-actions">
        <div class="file-upload-group">
          <input
            type="text"
            class="input file-name-input"
            :value="bulkFileName"
            readonly
            :placeholder="t('placeholder.selectFile')"
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
            {{ t("common.bulkModelUpload") }}
          </button>
          <button
            type="button"
            class="btn-register"
            @click="handleModelRegister"
          >
            {{ t("common.modelRegister") }}
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

        <!-- 결과 슬롯 -->
        <template #cell-result="{ item }">
          <span
            :class="{
              'result-success':
                item.result === t('messages.success.uploadSuccess'),
              'result-failed':
                item.result === t('messages.success.uploadFailed'),
              'result-skipped':
                item.result === t('messages.success.uploadSkipped'),
            }"
          >
            {{ item.result || "-" }}
          </span>
        </template>

        <!-- 비고 슬롯 -->
        <template #cell-remarks="{ item }">
          <span class="remarks-text" :title="item.remarks">
            {{ item.remarks || "-" }}
          </span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import { ref } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useMachineStore } from "@/stores/machineStore";

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

const machineStore = useMachineStore();

// 등록 완료 상태
const isRegistered = ref(false);

// 선택된 기계명
const selectedMachineName = ref("");

// 엑셀 업로드 입력 ref
const excelFileInput = ref<HTMLInputElement | null>(null);
const excelFileName = ref<string>("");
const excelFile = ref<File | null>(null);
// 대량 업로드 입력 ref
const bulkFileInput = ref<HTMLInputElement | null>(null);
const bulkFileName = ref<string>("");
const bulkFile = ref<File | null>(null);

// ZIP 파일 내부 파일 목록
const zipFileList = ref<
  Array<{
    name: string;
    size: number;
    type: string;
    lastModified?: string;
    result?: string;
    remarks?: string;
  }>
>([]);
const showZipContents = ref(false);

// 업로드 결과 저장
const uploadResult = ref<{
  success_files: Array<{ file_name: string; reason?: string }>;
  failed_files: Array<{ file_name: string; reason?: string }>;
  skipped_files: Array<{ file_name: string; reason?: string }>;
} | null>(null);

// ZIP 파일 목록 테이블 컬럼
const zipTableColumns: TableColumn[] = [
  { key: "name", title: t("common.fileName"), width: "25%", sortable: false },
  { key: "type", title: t("common.fileType"), width: "15%", sortable: false },
  { key: "size", title: t("common.fileSize"), width: "10%", sortable: false },
  {
    key: "lastModified",
    title: t("common.lastModified"),
    width: "15%",
    sortable: false,
  },
  { key: "result", title: t("common.result"), width: "10%", sortable: false },
  { key: "remarks", title: t("common.remarks"), width: "25%", sortable: false },
];

// 파일 크기 포맷팅 함수
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 업로드 결과에 따라 zipFileList 업데이트
const updateZipFileListWithResult = (resultData: any) => {
  if (!resultData?.details) return;

  const { success_files, failed_files, skipped_files } = resultData.details;

  // zipFileList의 각 항목에 대해 결과와 비고를 매핑
  zipFileList.value = zipFileList.value.map((file) => {
    // 성공 파일 체크
    const successFile = success_files?.find(
      (f: any) => f.file_name === file.name
    );
    if (successFile) {
      return {
        ...file,
        result: t("messages.success.uploadSuccess"),
        remarks: successFile.reason || "-",
      };
    }

    // 실패 파일 체크
    const failedFile = failed_files?.find(
      (f: any) => f.file_name === file.name
    );
    if (failedFile) {
      return {
        ...file,
        result: t("messages.success.uploadFailed"),
        remarks: failedFile.reason || "-",
      };
    }

    // 제외 파일 체크
    const skippedFile = skipped_files?.find(
      (f: any) => f.file_name === file.name
    );
    if (skippedFile) {
      return {
        ...file,
        result: t("messages.success.uploadSkipped"),
        remarks: skippedFile.reason || "-",
      };
    }

    // 매칭되지 않은 경우
    return {
      ...file,
      result: "-",
      remarks: "-",
    };
  });
};

// ZIP 파일 내부 파일 목록 추출 함수
const extractZipContents = async (file: File) => {
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
      "rfa",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "svg",
    ];
    const invalidFiles: string[] = [];
    const invalidFileNameFiles: string[] = [];
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
        } else if (["rfa"].includes(fileExtension)) {
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

          // 허용된 확장자를 가진 파일들의 파일명 validation 체크
          const validationResult = validateZipFileName(
            relativePath,
            allowedExtensions
          );
          if (!validationResult.isValid) {
            invalidFileNameFiles.push(relativePath);
          }
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
      bulkFile.value = null;
      if (bulkFileInput.value) {
        bulkFileInput.value.value = "";
      }
      return;
    }

    // 파일명 validation 실패한 파일이 있으면 첨부 불가 처리
    if (invalidFileNameFiles.length > 0) {
      alert(
        t("messages.warning.invalidFormulaFileNameFormat") +
          "\n\n" +
          t("messages.warning.zipInvalidFiles", {
            files: invalidFileNameFiles.join("\n"),
          })
      );
      zipFileList.value = [];
      showZipContents.value = false;
      bulkFileName.value = "";
      bulkFile.value = undefined as unknown as File;
      if (bulkFileInput.value) {
        bulkFileInput.value.value = "";
      }
      return;
    }

    // 필수 파일(.dtdx, 썸네일 이미지)이 모두 포함되어 있는지 검증
    // if (!(hasDtdx && hasImage)) {
    //   const missing: string[] = [];
    //   if (!hasDtdx) missing.push("3D모델(.dtdx)");
    //   if (!hasImage) missing.push("썸네일 이미지(.jpg/.jpeg/.png/.gif)");
    //   alert(
    //     t("messages.warning.zipMissingRequiredFiles", {
    //       missing: missing.join(", "),
    //     })
    //   );
    //   zipFileList.value = [];
    //   showZipContents.value = false;
    //   bulkFileName.value = "";
    //   bulkFile.value = null;
    //   return;
    // }

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
    bulkFileName.value = "";
    bulkFile.value = undefined as unknown as File;
    if (bulkFileInput.value) {
      bulkFileInput.value.value = "";
    }
  }
};

// ZIP 파일 내부 파일명 validation 함수
const validateZipFileName = (
  filePath: string,
  allowedExtensions: string[]
): { isValid: boolean; errorMessage?: string } => {
  // 파일 경로에서 파일명만 추출 (경로 구분자 처리)
  const fileName = filePath.split(/[\\/]/).pop() || filePath;

  if (!fileName || fileName.trim() === "") {
    return {
      isValid: false,
      errorMessage: t("messages.warning.invalidFormulaFileNameFormat"),
    };
  }

  // 확장자 추출
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

  // 허용된 확장자 체크
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return { isValid: true }; // 확장자 체크는 별도로 처리
  }

  // 파일명에서 확장자를 제거한 이름 부분 검증
  const extensionRegex = new RegExp(
    `\\.${fileExtension.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
    "i"
  );
  const fileNameWithoutExt = fileName.replace(extensionRegex, "");

  // 파일명이 비어있으면 안 됨
  if (!fileNameWithoutExt || fileNameWithoutExt.trim() === "") {
    return {
      isValid: false,
      errorMessage: t("messages.warning.invalidFormulaFileNameFormat"),
    };
  }

  // 파일명 validation: 영문만 사용, 공백 불가, 100자 이내, 특수 기호는 "_ - ()."만 허용
  const fileNameRegex = /^[a-zA-Z0-9_\-().]+$/;

  if (!fileNameRegex.test(fileNameWithoutExt)) {
    return {
      isValid: false,
      errorMessage: t("messages.warning.invalidFormulaFileNameFormat"),
    };
  }

  if (fileNameWithoutExt.length > 100) {
    return {
      isValid: false,
      errorMessage: t("messages.warning.invalidFormulaFileNameFormat"),
    };
  }

  return { isValid: true };
};

// 공통 검증 함수: 기계명 필수 체크
const validateBasicSelections = (): boolean => {
  if (!selectedMachineName.value) {
    alert(t("messages.warning.selectMachineMajorCategory"));
    return false;
  }

  return true;
};

// 버튼 핸들러들
const onDownloadExcelTemplate = async () => {
  if (!validateBasicSelections()) return;

  try {
    const response = await machineStore.downloadExcelTemplate(
      selectedMachineName.value
    );

    // download_url로 파일 다운로드
    const downloadUrl = response?.response?.data?.files?.[0]?.download_url;
    const originalFilename =
      response?.response?.data?.files?.[0]?.original_filename;

    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download =
        originalFilename || `${selectedMachineName.value}_template.xlsx`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(t("messages.warning.excelTemplateDownloadFailed"));
    }
  } catch (error: any) {
    console.error("Excel 템플릿 다운로드 실패:", error);
    // error.response의 message가 있으면 표시, 없으면 기본 메시지
    const errorMessage = translateMessage(
      error?.message,
      "messages.warning.excelTemplateDownloadFailed"
    );
    alert(errorMessage);
  }
};

// 엑셀 파일 변경 핸들러
const handleExcelFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];

  if (!file) {
    excelFileName.value = "";
    excelFile.value = null;
    return;
  }

  // 기본 선택 검증
  if (!validateBasicSelections()) {
    input.value = "";
    excelFile.value = null;
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
    excelFile.value = null;
    return;
  }

  // 크기 검증 (예: 200MB)
  const maxSize = 200 * 1024 * 1024; // 200MB
  if (file.size > maxSize) {
    alert(
      t("messages.warning.fileSizeExceed", { size: maxSize / 1024 / 1024 })
    );
    input.value = "";
    excelFileName.value = "";
    excelFile.value = null;
    return;
  }

  // 파일명 validation (확장자 제외)
  // 여러 확장자 중 하나를 사용할 수 있는 경우 (.xlsx, .xls)
  // 가장 긴 확장자부터 매칭하여 제거
  let fileNameWithoutExt = file.name;
  for (const allowedExt of allowed.sort((a, b) => b.length - a.length)) {
    if (file.name.toLowerCase().endsWith(allowedExt.toLowerCase())) {
      fileNameWithoutExt = file.name.substring(
        0,
        file.name.length - allowedExt.length
      );
      break;
    }
  }

  // 100자 이내 체크
  if (fileNameWithoutExt.length > 100) {
    alert(t("messages.warning.invalidFormulaFileNameFormat"));
    input.value = "";
    excelFileName.value = "";
    excelFile.value = null;
    return;
  }

  // 파일명 validation: 영문만 사용, 공백 불가, 100자 이내, 특수 기호는 "_ - ()."만 허용
  const fileNameRegex = /^[a-zA-Z0-9_\-().]+$/;
  if (!fileNameRegex.test(fileNameWithoutExt)) {
    alert(t("messages.warning.invalidFormulaFileNameFormat"));
    input.value = "";
    excelFileName.value = "";
    excelFile.value = null;
    return;
  }

  excelFileName.value = file.name;
  excelFile.value = file;
};

// 대량 업로드 파일 변경 핸들러
const handleBulkFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];

  if (!file) {
    bulkFileName.value = "";
    bulkFile.value = null;
    zipFileList.value = [];
    showZipContents.value = false;
    return;
  }

  // 기본 선택 검증
  if (!validateBasicSelections()) {
    input.value = "";
    bulkFile.value = null;
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
    bulkFile.value = null;
    zipFileList.value = [];
    showZipContents.value = false;
    return;
  }

  // 크기 검증 (예: 200MB)
  const maxSize = 200 * 1024 * 1024; // 200MB
  if (file.size > maxSize) {
    alert(
      t("messages.warning.fileSizeExceed", { size: maxSize / 1024 / 1024 })
    );
    input.value = "";
    bulkFileName.value = "";
    bulkFile.value = null;
    zipFileList.value = [];
    showZipContents.value = false;
    return;
  }

  bulkFileName.value = file.name;
  bulkFile.value = file;

  // ZIP 파일인 경우 내부 파일 목록 추출
  if (file.name.toLowerCase().endsWith(".zip")) {
    await extractZipContents(file);
  } else {
    zipFileList.value = [];
    showZipContents.value = false;
  }
};

// 기계 등록 핸들러
const handleMachineRegister = async () => {
  if (!validateBasicSelections()) return;

  if (!excelFileName.value || !excelFile.value) {
    alert(t("messages.warning.selectExcelFile"));
    return;
  }

  try {
    // machineStore의 uploadMachineExcel 함수 호출
    await machineStore.uploadMachineExcel(
      selectedMachineName.value,
      excelFile.value
    );

    alert(t("messages.success.machineRegistered"));

    // 성공 시 초기화
    excelFileName.value = "";
    excelFile.value = null;
    if (excelFileInput.value) {
      excelFileInput.value.value = "";
    }
    isRegistered.value = true;
  } catch (error) {
    console.error("기계 등록 실패:", error);
    const errorMessage = translateMessage(
      error instanceof Error ? error.message : undefined,
      "messages.error.saveFailed"
    );
    alert(errorMessage);
  }
};

// 모델 등록 핸들러
const handleModelRegister = async () => {
  if (!validateBasicSelections()) return;

  if (!bulkFileName.value || !bulkFile.value) {
    alert(t("messages.warning.selectModelFile"));
    return;
  }

  try {
    // machineStore의 uploadModelZip 함수 호출
    const response = await machineStore.uploadModelZip(
      selectedMachineName.value,
      bulkFile.value
    );

    // 업로드 결과 저장 및 그리드 업데이트
    const apiResponse = response?.response as any;
    const resultData = apiResponse?.data?.data;

    if (resultData?.summary && resultData?.details) {
      uploadResult.value = resultData.details;

      // zipFileList를 업로드 결과로 업데이트
      updateZipFileListWithResult(resultData);

      // 요약 정보 표시
      const summary = resultData.summary;
      const message = `${t("messages.success.uploadCompleted")}\n\n${t(
        "common.totalFiles"
      )}: ${summary.total_files || 0}\n${t("common.successCount")}: ${
        summary.success_count || 0
      }\n${t("common.skippedCount")}: ${summary.skipped_count || 0}\n${t(
        "common.failedCount"
      )}: ${summary.failed_count || 0}`;
      alert(message);
    } else {
      alert(t("messages.success.modelRegistered"));
    }
  } catch (error) {
    console.error("모델 등록 실패:", error);
    const errorMessage = translateMessage(
      error instanceof Error ? error.message : undefined,
      "messages.error.saveFailed"
    );
    alert(errorMessage);
  }
};
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

  // 결과 상태 스타일
  :deep(.result-success) {
    color: #10b981;
    font-weight: 600;
  }

  :deep(.result-failed) {
    color: #ef4444;
    font-weight: 600;
  }

  :deep(.result-skipped) {
    color: #f59e0b;
    font-weight: 600;
  }

  // 비고 텍스트 스타일
  :deep(.remarks-text) {
    font-size: 13px;
    color: #6b7280;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    cursor: help;
  }
}

.zip-contents-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}
</style>
