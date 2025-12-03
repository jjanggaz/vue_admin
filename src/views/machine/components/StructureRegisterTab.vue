<template>
  <div class="machine-register-tab">
    <!-- 상단 검색/필터 영역 (이미지 레이아웃 참고) -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label required"
          >{{ t("common.structureMajorCategory") }}</span
        >
        <select
          class="input select-md"
          v-model="selectedStructureType"
          :disabled="isRegistered"
          @change="handleStructureTypeChange"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="type in structureStore.createSecondDepth"
            :key="type.code_id as string"
            :value="type.code_key as string"
          >
            {{ type.code_value as string }}
          </option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label required"
          >{{ t("columns.machine.structureTypeDetail") }}</span
        >
        <select
          class="input select-md"
          v-model="selectedMachineName"
          :disabled="isRegistered"
        >
          <option value="">{{ t("common.select") }}</option>
          <option
            v-for="detail in structureStore.createThirdDepth"
            :key="detail.code_id as string"
            :value="detail.code_key as string"
          >
            {{ detail.code_value as string }}
          </option>
        </select>
      </div>

      <div class="group-form inline">
        <span
          class="label required long-label"
          v-html="'' + t('common.integratedFile').replace(/,/g, ',<br />')"
        ></span>
        <div class="file-input-wrapper">
          <button class="btn btn-file" @click="allFileInput?.click()">
            {{ t("common.fileSelect") }}
          </button>
          <input
            type="text"
            class="input"
            :value="allFileName || t('common.noFile')"
            readonly
          />
          <input
            type="file"
            ref="allFileInput"
            accept=".zip"
            style="display: none"
            @change="handleAllFileChange"
          />
        </div>
      </div>

      <!--
      <div class="group-form inline">
        <span class="label required">3D 구조물 계산식</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="formulaFileName || '선택된 파일 없음'"
            readonly
          />
          <input
            type="file"
            ref="formulaFileInput"
            accept=".py"
            style="display: none"
            @change="handleFormulaFileChange"
          />
          <button class="btn btn-file" @click="formulaFileInput?.click()">
            파일 선택
          </button>
        </div>
      </div>      
      <div class="group-form inline">
        <span class="label required">3D 구조물 DTD모델</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="dtdFileName || '선택된 파일 없음'"
            readonly
          />
          <input
            type="file"
            ref="dtdFileInput"
            accept=".dtdx"
            style="display: none"
            @change="handleDtdFileChange"
          />
          <button class="btn btn-file" @click="dtdFileInput?.click()">
            파일 선택
          </button>
        </div>
      </div>

      <div class="group-form inline">
        <span class="label required">모델 썸네일</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="thumbnailFileName || '선택된 파일 없음'"
            readonly
          />
          <input
            type="file"
            ref="thumbnailFileInput"
            accept=".png,.jpg,.jpeg,.gif"
            style="display: none"
            @change="handleThumbnailFileChange"
          />
          <button class="btn btn-file" @click="thumbnailFileInput?.click()">
            파일 선택
          </button>
        </div>
      </div>
      <div class="group-form inline">
        <span class="label">3D REVIT모델</span>
        <div class="file-input-wrapper">
          <input
            type="text"
            class="input"
            :value="revitFileName || '선택된 파일 없음'"
            readonly
          />
          <input
            type="file"
            ref="revitFileInput"
            accept=".rvt"
            style="display: none"
            @change="handleRevitFileChange"
          />
          <button class="btn btn-file" @click="revitFileInput?.click()">
            파일 선택
          </button>
        </div>
      </div>
      -->
      <div class="group-form inline">
        <span class="label">{{ t("common.remarks") }}</span>
        <input
          type="text"
          class="input"
          v-model="remarks"
          :placeholder="t('placeholder.recommendedProcessRemarks')"
        />
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
import { useTranslateMessage } from "@/utils/translateMessage";
import { ref, onMounted } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";

import { useStructureStore } from "@/stores/structureStore";

// 등록 전용 컴포넌트로 사용 (props 바인딩 제거)

const { t } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

const structureStore = useStructureStore();

const isRegistered = ref(false); // 등록 완료 상태

// 선택된 구조물 대분류 및 타입
const selectedStructureType = ref("");
const selectedMachineName = ref("");

// 비고 입력
const remarks = ref("");

// 파일 업로드 ref들
const allFileInput = ref<HTMLInputElement | null>(null);
const allFileName = ref<string>("");
const allFile = ref<File | null>(null);
const formulaFileInput = ref<HTMLInputElement | null>(null);
const formulaFileName = ref<string>("");
const formulaFile = ref<File | null>(null);
const dtdFileInput = ref<HTMLInputElement | null>(null);
const dtdFileName = ref<string>("");
const dtdFile = ref<File | null>(null);
const thumbnailFileInput = ref<HTMLInputElement | null>(null);
const thumbnailFileName = ref<string>("");
const thumbnailFile = ref<File | null>(null);
const revitFileInput = ref<HTMLInputElement | null>(null);
const revitFileName = ref<string>("");
const revitFile = ref<File | null>(null);

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
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 구조물 대분류 변경 시 하위 구조물 타입 로드
// 컴포넌트 마운트 시 공통코드 조회
onMounted(async () => {
  try {
    await structureStore.fetchCommonCodes2("STRUCT_WWTP");
  } catch (error) {
    console.error("구조물 공통코드 조회 실패:", error);
  }
});

const handleStructureTypeChange = async () => {
  selectedMachineName.value = "";
  // createThirdDepth 초기화
  structureStore.createThirdDepth = [];

  if (selectedStructureType.value) {
    await structureStore.fetchThirdDepth2(selectedStructureType.value, 3);
  }
};

// 공통 검증 함수: 구조물 대분류 및 타입 필수 체크
const validateBasicSelections = (): boolean => {
  if (!selectedStructureType.value) {
    alert(t("messages.warning.selectStructureType"));
    return false;
  }
  if (!selectedMachineName.value) {
    alert(t("messages.warning.selectStructureMachineName"));
    return false;
  }

  return true;
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

// 편집 모드 삭제 로직 제거

// ZIP 파일 내부 파일 목록 추출 함수 (임시 구현)
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
      "py",
      "dtdx",
      "rvt",
      "jpg",
      "jpeg",
      "png",
      "gif",
    ];
    const invalidFiles: string[] = [];
    const invalidFileNameFiles: string[] = [];
    let hasAllowedFile = false;
    let hasPy = false;
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
        if (["py"].includes(fileExtension)) {
          fileType = "Formula";
        } else if (["dtdx"].includes(fileExtension)) {
          fileType = "3D Model";
        } else if (["rvt"].includes(fileExtension)) {
          fileType = "Revit Model";
        } else if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
          fileType = "Thumbnail Image";
        }

        // 허용/비허용 판정
        if (fileExtension && allowedExtensions.includes(fileExtension)) {
          hasAllowedFile = true;
          if (fileExtension === "py") hasPy = true;
          if (fileExtension === "dtdx") hasDtdx = true;
          if (["jpg", "jpeg", "png", "gif"].includes(fileExtension))
            hasImage = true;

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

        // 파일 크기 가져오기 (여러 방법 시도)
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

        // 디버깅을 위한 로그
        console.log(`파일: ${relativePath}`, {
          uncompressedSize: zipEntry.uncompressedSize,
          compressedSize: zipEntry.compressedSize,
          _data: zipEntry._data,
          finalSize: fileSize,
        });

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
      alert(t("messages.warning.noAllowedFileInStructureZip"));
      zipFileList.value = [];
      showZipContents.value = false;
      allFileName.value = "";
      allFile.value = undefined as unknown as File;
      return;
    }

    // 파일명 validation 실패한 파일이 있으면 첨부 불가 처리
    if (invalidFileNameFiles.length > 0) {
      alert(
        t("messages.warning.invalidFormulaFileNameFormat") +
          "\n\n" +
          t("messages.warning.invalidFilesInZip", {
            files: invalidFileNameFiles.join("\n"),
          })
      );
      zipFileList.value = [];
      showZipContents.value = false;
      allFileName.value = "";
      allFile.value = undefined as unknown as File;
      if (allFileInput.value) {
        allFileInput.value.value = "";
      }
      return;
    }

    // 허용되지 않은 파일이 있으면 경고
    if (invalidFiles.length > 0) {
      alert(
        t("messages.warning.invalidFilesInZip", {
          files: invalidFiles.join("\n"),
        })
      );
    }

    zipFileList.value = fileList;
    showZipContents.value = true;
  } catch (error) {
    console.error("ZIP 파일 읽기 실패:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.warning.zipFileReadError"
    );
    alert(errorMessage);
    zipFileList.value = [];
    showZipContents.value = false;
    allFileName.value = "";
    allFile.value = undefined as unknown as File;
    if (allFileInput.value) {
      allFileInput.value.value = "";
    }
  }
};

// 파일 변경 핸들러들
const handleAllFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  if (file) {
    // 파일 크기 체크만 수행 (파일명 validation은 내부 파일에서 수행)
    const maxSize = 200;
    if (file.size > maxSize * 1024 * 1024) {
      alert(t("messages.warning.fileSizeExceed", { size: maxSize }));
      input.value = ""; // input 초기화
      return;
    }

    // ZIP 파일 확장자 체크
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".zip")) {
      alert(t("messages.warning.zipFileExtensionOnly"));
      input.value = ""; // input 초기화
      return;
    }

    allFileName.value = file.name;
    allFile.value = file;

    // ZIP 파일인 경우 내부 파일 목록 추출 (내부 파일명 validation 수행)
    if (file.name.toLowerCase().endsWith(".zip")) {
      await extractZipContents(file);
    } else {
      zipFileList.value = [];
      showZipContents.value = false;
    }
  }
  // 파일 선택 후 input 초기화 (같은 파일 재선택 가능하도록)
  input.value = "";
};

// 등록 함수
const onRegister = async () => {
  if (!validateBasicSelections()) return;

  if (!allFileName.value) {
    alert(t("messages.warning.selectAllFile"));
    return;
  }
  // 파일 첨부 validation
  // if (!formulaFileName.value) {
  //   alert("3D 구조물 계산식 파일을 선택해주세요.");
  //   return;
  // }
  // if (!dtdFileName.value) {
  //   alert("3D 구조물 DTD모델 파일을 선택해주세요.");
  //   return;
  // }
  // if (!thumbnailFileName.value) {
  //   alert("모델 썸네일 파일을 선택해주세요.");
  //   return;
  // }
  // REVIT 파일은 선택사항

  try {
    // FormData 생성
    const formData = new FormData();
    if (allFile.value) {
      formData.append("all_file", allFile.value);
    }
    // 첨부파일들 추가
    if (formulaFile.value) {
      formData.append("formula_file", formulaFile.value);
    }
    if (dtdFile.value) {
      formData.append("dtd_model_file", dtdFile.value);
    }
    if (thumbnailFile.value) {
      formData.append("thumbnail_file", thumbnailFile.value);
    }
    if (revitFile.value) {
      formData.append("revit_model_file", revitFile.value);
    }

    // 구조물 정보를 createParams로 구성
    const createParams = {
      structure_type: selectedStructureType.value,
      structure_type_detail: selectedMachineName.value,
      remarks: remarks.value,
    };

    // createParams를 JSON 문자열로 변환하여 추가
    formData.append("createParams", JSON.stringify(createParams));

    // API 호출
    const response = await structureStore.createStructure(formData);

    if (response?.success) {
      alert(t("messages.success.structureRegistered"));
      // 등록 완료 후 폼 초기화
      resetForm();
    } else {
      alert(t("messages.warning.structureRegisterFailed"));
    }
  } catch (error) {
    console.error("구조물 등록 실패:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.warning.structureRegisterError"
    );
    alert(errorMessage);
  }
};

// 폼 초기화 함수
const resetForm = () => {
  selectedStructureType.value = "";
  selectedMachineName.value = "";
  remarks.value = "";

  // 파일 초기화
  allFileName.value = "";
  allFile.value = null;
  formulaFileName.value = "";
  formulaFile.value = null;
  dtdFileName.value = "";
  dtdFile.value = null;
  thumbnailFileName.value = "";
  thumbnailFile.value = null;
  revitFileName.value = "";
  revitFile.value = null;

  // ZIP 파일 관련 초기화
  zipFileList.value = [];
  showZipContents.value = false;

  // 파일 입력 요소 초기화
  if (allFileInput.value) allFileInput.value.value = "";
  if (formulaFileInput.value) formulaFileInput.value.value = "";
  if (dtdFileInput.value) dtdFileInput.value.value = "";
  if (thumbnailFileInput.value) thumbnailFileInput.value.value = "";
  if (revitFileInput.value) revitFileInput.value.value = "";
};

// 수정 로직 제거 (StructureUpdateTab에서 처리)
defineExpose({ onRegister });
</script>

<style scoped lang="scss">
// 반응형 브레이크포인트
$mobile: 768px;
$tablet: 1024px;
$desktop: 1200px;

.filter-bar {
  input {
    width: 100%;
  }
}

.label .req {
  display: none;
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
  margin: 20px 0 10px;
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

.file-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  .input {
    flex: 1;
  }
}

// ZIP 파일 내용 섹션 스타일
.zip-contents-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;

  .zip-contents-title {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #495057;
  }
}
</style>
