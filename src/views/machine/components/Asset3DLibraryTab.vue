<template>
  <div class="asset3d-library-register-tab">
    <!-- 등록 폼 -->
    <div class="filter-bar">
      <div class="form-group">
        <label class="required">{{ t("common.unit") }}</label>
        <select v-model="selectedUnit" class="form-select">
          <option value="">{{ t("common.select") }}</option>
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
        <label class="required">{{ t("asset3D.category") }}</label>
        <select v-model="selectedCategory" class="form-select">
          <option value="">{{ t("common.select") }}</option>
          <option value="INTERIOR">{{ t("asset3D.categoryInterior") }}</option>
          <option value="STRUCTURE">{{ t("asset3D.categoryStructure") }}</option>
          <option value="ETC">{{ t("asset3D.categoryEtc") }}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="required">{{ t("asset3D.modelName") }}</label>
        <input
          type="text"
          v-model="modelName"
          class="form-input"
          :placeholder="t('asset3D.modelNamePlaceholder')"
        />
      </div>
      <div class="form-group">
        <label>{{ t("asset3D.modelUpload") }}</label>
        <div class="file-upload-group">
          <input
          type="text"
          class="form-input file-name-input"
          :value="modelFileName"
          readonly
          :placeholder="t('common.selectFile')"
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
            class="btn btn-ellipsis"
            @click="modelFileInput?.click()"
          >
          </button>
          <button
            v-if="modelDownloadUrl || modelFile"
            type="button"
            class="btn download-btn"
            @click="handleModelDownload"
            :title="t('asset3D.downloadModel')"
          >
            <span class="ico-download"></span>
          </button>
        </div>
      </div>
      <div class="form-group">
        <label>{{ t("asset3D.thumbnail") }}</label>
        <div class="file-upload-wrapper">
          <div class="file-upload-group">
            <input
              type="text"
              class="form-input file-name-input"
              :value="thumbnailFileName"
              readonly
              :placeholder="t('common.selectFile')"
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
              class="btn btn-ellipsis"
              @click="thumbnailFileInput?.click()"
            >
            </button>
            <button
              v-if="thumbnailDownloadUrl"
              type="button"
              class="btn-download"
              @click="handleThumbnailDownload"
              :title="t('asset3D.downloadThumbnail')"
            >
              <span class="ico-download"></span>
            </button>
          </div>
          <div v-if="thumbnailPreviewUrl" class="thumbnail-preview-wrapper">
            <button
              v-if="thumbnailPreviewUrl && (thumbnailDownloadUrl || thumbnailFile)"
              class="btn download-btn"
              @click="handleThumbnailDownload"
              :title="t('asset3D.downloadThumbnail')"
            >
              <span class="ico-download"></span>
            </button>
            <img
              :src="thumbnailPreviewUrl"
              :alt="t('asset3D.thumbnailPreview')"
              class="thumbnail-preview"
            />
            <button
              v-if="thumbnailPreviewUrl && (thumbnailDownloadUrl || thumbnailFile)"
              class="thumbnail-close-btn"
              @click="handleDeleteThumbnail"
              :title="t('asset3D.deleteThumbnail')"
            >
            </button>
          </div>
        </div>
      </div>
      <div class="form-group right-align">
        <button 
          type="button" 
          class="btn btn-register md" 
          @click="handleButtonClick"
          >
          {{ isEditMode ? t("common.save") : t("common.register") }}
        </button>
      </div>
      <!-- <div class="form-group right-align">
        <button type="button" class="btn btn-register md" @click="handleRegister">
          등록
        </button>
      </div> -->
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
import { ref, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useAsset3DStore } from "@/stores/asset3DStore";
import { request } from "@/utils/request";
import { getFileApiUrl } from "@/utils/config";

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
const modelDownloadUrl = ref<string>("");
const thumbnailFile = ref<File | null>(null);
const thumbnailFileName = ref("");
const thumbnailPreviewUrl = ref<string>("");
const thumbnailDownloadUrl = ref<string>("");

// 등록 모드에서 이미 저장된 데이터 추적용
const currentLibraryId = ref<string | null>(null);

// 파일 input refs
const modelFileInput = ref<HTMLInputElement | null>(null);
const thumbnailFileInput = ref<HTMLInputElement | null>(null);

// 수정 모드일 때 API 호출하여 데이터 로드
watch(
  () => props.editItem,
  async (newItem) => {
    if (props.isEditMode && newItem) {
      try {
        const editItemAny = newItem as any;
        // library_id 추출
        const libraryId = editItemAny.library_id || editItemAny.id || "";
        
        if (!libraryId) {
          console.error("library_id를 찾을 수 없습니다:", newItem);
          return;
        }

        const requestParams = {
          search_field: "library_id",
          search_value: libraryId,
        };

        console.log("========================================");
        console.log("[Asset3DLibraryTab] 수정 모드 API 호출");
        console.log("========================================");
        console.log("API 엔드포인트: POST /api/asset3D/search/3D_LIBRARY");
        console.log("매개변수:", JSON.stringify(requestParams, null, 2));
        console.log("library_id:", libraryId);
        console.log("========================================");

        // API 호출: /api/asset3D/search/3D_LIBRARY
        const response = await request("/api/asset3D/search/3D_LIBRARY", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestParams),
        });

        console.log("[Asset3DLibraryTab] API 응답:", response);

        if (response && response.success && response.response) {
          const data = response.response;
          // 배열인 경우 첫 번째 항목 사용
          const item = Array.isArray(data) ? data[0] : (data.items && Array.isArray(data.items) ? data.items[0] : data);

          if (item) {
            // category -> selectedCategory
            selectedCategory.value = String(item.category || "");
            
            // model_name -> modelName
            modelName.value = String(item.model_name || "");
            
            // unit_system_code -> selectedUnit
            selectedUnit.value = String(item.unit_system_code || "");
            
            // 3D 모델 파일 정보 설정 (dtdx_file 객체 참조)
            const dtdxFile = item.dtdx_file as Record<string, unknown> | undefined;
            if (dtdxFile && dtdxFile.file_name) {
              modelFileName.value = String(dtdxFile.file_name);
            } else if (item.dtdx_model_file_name) {
              modelFileName.value = String(item.dtdx_model_file_name);
            } else {
              modelFileName.value = "";
            }
            
            // 3D 모델 다운로드 URL 설정
            if (dtdxFile && dtdxFile.download_url) {
              modelDownloadUrl.value = String(dtdxFile.download_url);
            } else {
              modelDownloadUrl.value = "";
            }
            
            // 썸네일 파일명 설정 (thumbnail_file.file_name 우선, 없으면 thumbnail_file_name)
            const thumbnailFile = item.thumbnail_file as Record<string, unknown> | undefined;
            if (thumbnailFile && thumbnailFile.file_name) {
              thumbnailFileName.value = String(thumbnailFile.file_name);
            } else if (item.thumbnail_file_name) {
              thumbnailFileName.value = String(item.thumbnail_file_name);
            } else {
              thumbnailFileName.value = "";
            }
            
            // 썸네일 다운로드 URL 설정
            if (thumbnailFile && thumbnailFile.download_url) {
              thumbnailDownloadUrl.value = String(thumbnailFile.download_url);
            } else {
              thumbnailDownloadUrl.value = "";
            }
            
            // 썸네일 미리보기 로드
            if (thumbnailFile && thumbnailFile.download_url) {
              // download_url이 있으면 직접 사용
              thumbnailPreviewUrl.value = String(thumbnailFile.download_url);
            } else if (item.thumbnail_id) {
              // download_url이 없으면 API를 통해 로드
              try {
                const url = new URL(`/api/file/download/${item.thumbnail_id}`, window.location.origin);
                const headers: Record<string, string> = {
                  system_code: import.meta.env.VITE_SYSTEM_CODE,
                  user_Id: localStorage.getItem("authUserId") || "",
                  wai_lang: localStorage.getItem("wai_lang") || "ko",
                  authSuper: localStorage.getItem("authSuper") || "false",
                };
                
                const response = await fetch(url.toString(), {
                  method: "GET",
                  headers,
                  credentials: "include",
                });
                
                if (response.ok) {
                  const blob = await response.blob();
                  thumbnailPreviewUrl.value = URL.createObjectURL(blob);
                } else {
                  console.error("썸네일 로드 실패:", response.status, response.statusText);
                  thumbnailPreviewUrl.value = "";
                }
              } catch (error) {
                console.error("썸네일 로드 실패:", error);
                thumbnailPreviewUrl.value = "";
              }
            } else {
              thumbnailPreviewUrl.value = "";
            }

            console.log("[Asset3DLibraryTab] 폼 필드 설정 완료:", {
              category: selectedCategory.value,
              modelName: modelName.value,
              unit: selectedUnit.value,
            });
            
            // 데이터 로드 완료 후 초기값 저장
            await nextTick();
            saveInitialLibraryData();
          } else {
            console.warn("[Asset3DLibraryTab] 응답 데이터가 없습니다.");
          }
        } else {
          console.error("[Asset3DLibraryTab] API 호출 실패:", response);
        }
      } catch (error) {
        console.error("[Asset3DLibraryTab] API 호출 중 오류:", error);
      }
    } else {
      // 등록 모드에서는 빈 상태로 초기값 저장
      // 등록 모드로 전환 시 currentLibraryId 초기화
      currentLibraryId.value = null;
      await nextTick();
      saveInitialLibraryData();
    }
  },
  { immediate: true }
);

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
      modelDownloadUrl.value = ""; // 새 파일 선택 시 다운로드 URL 초기화
      return;
    }

    // 확장자 검증
    if (!file.name.toLowerCase().endsWith(".dtdx")) {
      alert(t("asset3D.error.modelFileExtensionOnly"));
      input.value = "";
      modelFileName.value = "";
      modelFile.value = null;
      modelDownloadUrl.value = ""; // 새 파일 선택 시 다운로드 URL 초기화
      return;
    }

    modelFileName.value = file.name;
    modelFile.value = file;
    modelDownloadUrl.value = ""; // 새 파일 선택 시 다운로드 URL 초기화 (업로드 후 서버에서 받아옴)
  } else {
    modelFileName.value = "";
    modelFile.value = null;
    modelDownloadUrl.value = ""; // 파일 초기화 시 다운로드 URL도 초기화
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
      thumbnailPreviewUrl.value = "";
      thumbnailDownloadUrl.value = "";
      return;
    }

    // 확장자 검증
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      alert(t("asset3D.error.thumbnailFileExtensionOnly"));
      input.value = "";
      thumbnailFileName.value = "";
      thumbnailFile.value = null;
      thumbnailPreviewUrl.value = "";
      thumbnailDownloadUrl.value = "";
      return;
    }

    thumbnailFileName.value = file.name;
    thumbnailFile.value = file;

    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      thumbnailPreviewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    thumbnailFileName.value = "";
    thumbnailFile.value = null;
    thumbnailPreviewUrl.value = "";
    thumbnailDownloadUrl.value = "";
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

// 3D 모델 다운로드 핸들러
const handleModelDownload = async () => {
  // 로컬 파일이 있는 경우 (새로 선택한 파일)
  if (modelFile.value) {
    try {
      const url = window.URL.createObjectURL(modelFile.value);
      const link = document.createElement("a");
      link.href = url;
      link.download = modelFileName.value || t("asset3D.defaultModelFileName");
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    } catch (error) {
      console.error("3D 모델 다운로드 실패:", error);
      alert(t("asset3D.error.downloadError"));
      return;
    }
  }

  // 서버에서 다운로드하는 경우
  if (!modelDownloadUrl.value) {
    alert(t("asset3D.error.noFileToDownload"));
    return;
  }
  
  try {
    // fetch로 파일을 blob으로 받아서 다운로드
    const response = await fetch(modelDownloadUrl.value, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`${t("asset3D.error.downloadFailed")}: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = modelFileName.value || t("asset3D.defaultModelFileName");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("3D 모델 다운로드 실패:", error);
    alert(t("asset3D.error.downloadFailed"));
  }
};

// 썸네일 다운로드 핸들러
const handleThumbnailDownload = async () => {
  // 로컬 파일이 있는 경우 (새로 선택한 파일)
  if (thumbnailFile.value) {
    try {
      const url = window.URL.createObjectURL(thumbnailFile.value);
      const link = document.createElement("a");
      link.href = url;
      link.download = thumbnailFileName.value || t("asset3D.defaultThumbnailFileName");
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    } catch (error) {
      console.error("썸네일 다운로드 실패:", error);
      alert(t("asset3D.error.downloadError"));
      return;
    }
  }

  // 서버에서 다운로드하는 경우
  if (!thumbnailDownloadUrl.value) {
    alert(t("asset3D.error.noFileToDownload"));
    return;
  }
  
  try {
    // fetch로 파일을 blob으로 받아서 다운로드
    const response = await fetch(thumbnailDownloadUrl.value, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`${t("asset3D.error.downloadFailed")}: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = thumbnailFileName.value || t("asset3D.defaultThumbnailFileName");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("썸네일 다운로드 실패:", error);
    alert(t("asset3D.error.downloadError"));
  }
};

// 썸네일 삭제 핸들러
const handleDeleteThumbnail = async () => {
  // 삭제할 썸네일이 없는 경우
  if (!thumbnailPreviewUrl.value && !thumbnailDownloadUrl.value && !thumbnailFile.value) {
    alert(t("asset3D.error.noThumbnailToDelete"));
    return;
  }

  // 확인 팝업
  if (!confirm(t("asset3D.confirm.deleteThumbnail"))) {
    return;
  }

  try {
    // 수정 모드이고 서버에 저장된 썸네일이 있는 경우 API 호출
    if (props.isEditMode && props.editItem && thumbnailDownloadUrl.value) {
      const editItemAny = props.editItem as any;
      const libraryId = editItemAny.library_id || editItemAny.id || "";
      
      if (!libraryId) {
        console.error("library_id를 찾을 수 없습니다:", props.editItem);
        alert(t("asset3D.error.libraryIdNotFound"));
        return;
      }
      
      console.log("썸네일 삭제 API 호출:", `/api/asset3D/library/thumbnail/delete/${libraryId}`);
      
      const response = await request(
        `/api/asset3D/library/thumbnail/delete/${libraryId}`,
        undefined,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response || !response.success) {
        throw new Error(response?.message || t("asset3D.error.thumbnailDeleteFailed"));
      }

      console.log("썸네일 삭제 성공:", response);
    }

    // 미리보기 URL 해제
    if (thumbnailPreviewUrl.value && thumbnailPreviewUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreviewUrl.value);
    }

    // 썸네일 관련 데이터 초기화
    thumbnailPreviewUrl.value = "";
    thumbnailDownloadUrl.value = "";
    thumbnailFileName.value = "";
    thumbnailFile.value = null;
    if (thumbnailFileInput.value) {
      thumbnailFileInput.value.value = "";
    }

    // 저장 후 Library 정보 재조회 (수정 모드인 경우)
    if (props.isEditMode && props.editItem) {
      const editItemAny = props.editItem as any;
      const libraryId = editItemAny.library_id || editItemAny.id || "";
      if (libraryId) {
        await reloadLibraryMasterData(libraryId);
        // 썸네일 삭제 후 초기 데이터 갱신하여 변경사항 체크에서 제외
        saveInitialLibraryData();
      }
    }

    alert(t("asset3D.success.thumbnailDeleted"));
  } catch (error) {
    console.error("썸네일 삭제 실패:", error);
    const errorMessage = error instanceof Error ? error.message : t("asset3D.error.thumbnailDeleteFailed");
    alert(errorMessage);
  }
};

// Library 마스터 정보 재조회 함수
const reloadLibraryMasterData = async (libraryId: string) => {
  try {
    const requestParams = {
      search_field: "library_id",
      search_value: libraryId,
    };

    const response = await request("/api/asset3D/search/3D_LIBRARY", undefined, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestParams),
    });

    if (response && response.success && response.response) {
      const data = response.response;
      const item = Array.isArray(data) ? data[0] : (data.items && Array.isArray(data.items) ? data.items[0] : data);

      if (item) {
        // 썸네일 파일 정보 업데이트
        const thumbnailFile = item.thumbnail_file as Record<string, unknown> | undefined;
        if (thumbnailFile && thumbnailFile.file_name) {
          thumbnailFileName.value = String(thumbnailFile.file_name);
        } else if (item.thumbnail_file_name) {
          thumbnailFileName.value = String(item.thumbnail_file_name);
        } else {
          thumbnailFileName.value = "";
        }
        
        // 썸네일 다운로드 URL 업데이트
        if (thumbnailFile && thumbnailFile.download_url) {
          thumbnailDownloadUrl.value = String(thumbnailFile.download_url);
        } else {
          thumbnailDownloadUrl.value = "";
        }
        
        // 썸네일 미리보기 URL 업데이트
        if (thumbnailFile && thumbnailFile.download_url) {
          thumbnailPreviewUrl.value = String(thumbnailFile.download_url);
        } else if (item.thumbnail_id) {
          try {
            const url = new URL(`/api/file/download/${item.thumbnail_id}`, window.location.origin);
            const headers: Record<string, string> = {
              system_code: import.meta.env.VITE_SYSTEM_CODE,
              user_Id: localStorage.getItem("authUserId") || "",
              wai_lang: localStorage.getItem("wai_lang") || "ko",
              authSuper: localStorage.getItem("authSuper") || "false",
            };
            
            const fileResponse = await fetch(url.toString(), {
              method: "GET",
              headers,
              credentials: "include",
            });
            
            if (fileResponse.ok) {
              const blob = await fileResponse.blob();
              thumbnailPreviewUrl.value = URL.createObjectURL(blob);
            } else {
              thumbnailPreviewUrl.value = "";
            }
          } catch (error) {
            console.error("썸네일 로드 실패:", error);
            thumbnailPreviewUrl.value = "";
          }
        } else {
          thumbnailPreviewUrl.value = "";
        }
      }
    }
  } catch (error) {
    console.error("Library 마스터 정보 재조회 실패:", error);
  }
};


// 버튼 클릭 핸들러 (디버깅용)
const handleButtonClick = (e: Event) => {
  console.log("========================================");
  console.log("[Asset3DLibrary] 버튼 클릭 이벤트 발생");
  console.log("========================================");
  e.preventDefault();
  e.stopPropagation();
  handleRegister();
};

// 등록/수정 핸들러
const handleRegister = async () => {
  // 함수 호출 확인을 위한 즉시 실행 로그
  console.log("========================================");
  console.log("[Asset3DLibrary] handleRegister 함수 호출됨 - 즉시 실행");
  console.log("========================================");
  console.log("현재 시간:", new Date().toISOString());
  console.log("selectedUnit:", selectedUnit.value);
  console.log("selectedCategory:", selectedCategory.value);
  console.log("modelName:", modelName.value);
  console.log("isEditMode:", props.isEditMode);
  console.log("editItem:", props.editItem);
  console.log("========================================");
  
  // 필수 항목 검증
  if (!selectedUnit.value) {
    console.log("[Asset3DLibrary] 검증 실패: 단위 미선택");
    alert(t("asset3D.error.selectUnit"));
    return;
  }

  if (!selectedCategory.value) {
    console.log("[Asset3DLibrary] 검증 실패: 카테고리 미선택");
    alert(t("asset3D.error.selectCategory"));
    return;
  }

  if (!modelName.value || modelName.value.trim() === "") {
    console.log("[Asset3DLibrary] 검증 실패: 모델명 미입력");
    alert(t("asset3D.error.enterModelName"));
    return;
  }

  console.log("[Asset3DLibrary] 필수 항목 검증 통과");

  try {
    console.log("========================================");
    console.log("[Asset3DLibrary] handleRegister 함수 시작");
    console.log("========================================");
    console.log("props.isEditMode:", props.isEditMode);
    console.log("props.editItem:", props.editItem);
    
    // 수정 모드인지 확인
    const isEditMode = props.isEditMode === true;
    const hasEditItem = props.editItem !== null && props.editItem !== undefined;
    const isAlreadySaved = !isEditMode && currentLibraryId.value !== null; // 등록 모드이지만 이미 저장된 데이터인 경우
    
    // 수정 모드이거나, 등록 모드이지만 이미 저장된 데이터인 경우 (currentLibraryId가 있는 경우) 업데이트로 처리
    const shouldUpdate = (isEditMode && hasEditItem) || isAlreadySaved;
    
    console.log("isEditMode:", isEditMode);
    console.log("hasEditItem:", hasEditItem);
    console.log("isAlreadySaved:", isAlreadySaved);
    console.log("shouldUpdate:", shouldUpdate);
    console.log("조건 확인 (isEditMode && hasEditItem):", isEditMode && hasEditItem);
    console.log("========================================");

    // 수정 모드이거나 이미 저장된 데이터인 경우 변경사항 확인
    if (shouldUpdate && !hasLibraryChanges()) {
      // 변경사항이 없으면 메시지 출력 후 종료
      alert(t("common.noChanges"));
      return;
    }

    if (isEditMode && hasEditItem) {
      // 수정 모드 처리
      const editItemAny = props.editItem as any;
      const libraryId = editItemAny.library_id || editItemAny.id || "";

      if (!libraryId) {
        alert(t("asset3D.error.libraryIdNotFound"));
        return;
      }

      console.log("========================================");
      console.log("[Asset3DLibrary] 수정 모드 저장 시작");
      console.log("========================================");
      console.log("library_id:", libraryId);
      console.log("========================================");

      // 카테고리 영문명 매핑
      const categoryEnMap: Record<string, string> = {
        INTERIOR: "Interior",
        STRUCTURE: "Structure",
      };
      const categoryEn = categoryEnMap[selectedCategory.value] || selectedCategory.value;

      // 라이브러리 업데이트 요청 데이터 구성
      const updateData: Record<string, unknown> = {
        category: selectedCategory.value,
        category_en: categoryEn,
        model_code: modelName.value.trim(),
        model_name: modelName.value.trim(),
        model_name_en: modelName.value.trim(),
        unit_system_code: selectedUnit.value,
        metadata: {},
        is_active: true,
        remarks: "",
      };

      // 라이브러리 업데이트 API 호출
      console.log("========================================");
      console.log("[Asset3DLibrary] 라이브러리 업데이트 API 호출 시작");
      console.log("========================================");
      console.log("📤 API 엔드포인트: /api/asset3D/library/update/" + libraryId);
      console.log("📤 HTTP 메서드: PATCH");
      console.log("📤 library_id:", libraryId);
      console.log("📤 요청 데이터:", JSON.stringify(updateData, null, 2));
      console.log("========================================");

      try {
        const updateResponse = await request(`/api/asset3D/library/update/${libraryId}`, undefined, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        console.log("📥 라이브러리 업데이트 응답:", updateResponse);

        if (!updateResponse || !updateResponse.success) {
          const errorMsg = updateResponse?.message || t("asset3D.error.libraryUpdateFailed");
          console.error("========================================");
          console.error("[Asset3DLibrary] 라이브러리 업데이트 실패");
          console.error("========================================");
          console.error("에러 메시지:", errorMsg);
          console.error("========================================");
          throw new Error(errorMsg);
        }

        console.log("========================================");
        console.log("[Asset3DLibrary] 라이브러리 업데이트 성공");
        console.log("========================================");
      } catch (updateError: any) {
        console.error("========================================");
        console.error("[Asset3DLibrary] 라이브러리 업데이트 API 호출 실패");
        console.error("========================================");
        console.error("에러:", updateError);
        console.error("에러 메시지:", updateError?.message || updateError?.response?.message || "알 수 없는 오류");
        console.error("========================================");
        throw updateError;
      }

      // 썸네일 파일이 새로 선택된 경우 별도 업로드 API 호출
      if (thumbnailFile.value) {
        console.log("========================================");
        console.log("[Asset3DLibrary] 썸네일 파일 업로드 시작 (수정 모드)");
        console.log("========================================");
        console.log("📤 API 엔드포인트: /api/asset3D/library/thumbnail/upload");
        console.log("📤 HTTP 메서드: POST");
        console.log("📤 library_id:", libraryId);
        console.log("📤 파일명:", thumbnailFile.value.name);
        console.log("📤 파일 크기:", thumbnailFile.value.size, "bytes");
        console.log("📤 파일 타입:", thumbnailFile.value.type);
        console.log("========================================");

        const formData = new FormData();
        formData.append("file", thumbnailFile.value);
        formData.append("library_id", String(libraryId));

        const url = new URL("/api/asset3D/library/thumbnail/upload", window.location.origin);
        const headers: Record<string, string> = {
          system_code: import.meta.env.VITE_SYSTEM_CODE,
          user_Id: localStorage.getItem("authUserId") || "",
          wai_lang: localStorage.getItem("wai_lang") || "ko",
          authSuper: localStorage.getItem("authSuper") || "false",
        };

        console.log("📤 요청 URL:", url.toString());
        console.log("📤 요청 헤더:", headers);
        console.log("📤 FormData 항목:");
        console.log(`  - file: File(${thumbnailFile.value.name}, ${thumbnailFile.value.size} bytes)`);
        console.log(`  - library_id: ${libraryId}`);
        console.log("========================================");

        const uploadResponse = await fetch(url.toString(), {
          method: "POST",
          headers,
          credentials: "include",
          body: formData,
        });

        console.log("📥 응답 상태:", uploadResponse.status, uploadResponse.statusText);
        const responseHeaders: Record<string, string> = {};
        uploadResponse.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        console.log("📥 응답 헤더:", responseHeaders);

        if (!uploadResponse.ok) {
          let errorMessage = `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`;
          try {
            const errorData = await uploadResponse.json();
            console.error("📥 에러 응답 데이터:", errorData);
            errorMessage = errorData.message || errorData.detail || errorMessage;
          } catch {
            const errorText = await uploadResponse.text();
            console.error("📥 에러 응답 텍스트:", errorText);
          }
          console.error("========================================");
          console.error("[Asset3DLibrary] 썸네일 파일 업로드 실패");
          console.error("========================================");
          throw new Error(`${t("asset3D.error.thumbnailUploadFailed")}: ${errorMessage}`);
        }

        const uploadResponseData = await uploadResponse.json();
        console.log("📥 응답 데이터:", uploadResponseData);
        console.log("========================================");
        console.log("[Asset3DLibrary] 썸네일 파일 업로드 성공");
        console.log("========================================");
      } else {
        console.log("[Asset3DLibrary] 썸네일 파일이 선택되지 않아 업로드를 건너뜁니다.");
      }

      // 3D 모델 파일이 새로 선택된 경우 별도 업로드 API 호출
      if (modelFile.value) {
        console.log("========================================");
        console.log("[Asset3DLibrary] 3D 모델 파일 업로드 시작 (수정 모드)");
        console.log("========================================");
        console.log("📤 API 엔드포인트: /api/asset3D/library/model/upload");
        console.log("📤 HTTP 메서드: POST");
        console.log("📤 library_id:", libraryId);
        console.log("📤 파일명:", modelFile.value.name);
        console.log("📤 파일 크기:", modelFile.value.size, "bytes");
        console.log("📤 파일 타입:", modelFile.value.type);
        console.log("========================================");

        const formData = new FormData();
        formData.append("file", modelFile.value);
        formData.append("library_id", String(libraryId));

        const url = new URL("/api/asset3D/library/model/upload", window.location.origin);
        const headers: Record<string, string> = {
          system_code: import.meta.env.VITE_SYSTEM_CODE,
          user_Id: localStorage.getItem("authUserId") || "",
          wai_lang: localStorage.getItem("wai_lang") || "ko",
          authSuper: localStorage.getItem("authSuper") || "false",
        };

        console.log("📤 요청 URL:", url.toString());
        console.log("📤 요청 헤더:", headers);
        console.log("📤 FormData 항목:");
        console.log(`  - file: File(${modelFile.value.name}, ${modelFile.value.size} bytes)`);
        console.log(`  - library_id: ${libraryId}`);
        console.log("========================================");

        const uploadResponse = await fetch(url.toString(), {
          method: "POST",
          headers,
          credentials: "include",
          body: formData,
        });

        console.log("📥 응답 상태:", uploadResponse.status, uploadResponse.statusText);
        const responseHeaders2: Record<string, string> = {};
        uploadResponse.headers.forEach((value, key) => {
          responseHeaders2[key] = value;
        });
        console.log("📥 응답 헤더:", responseHeaders2);

        if (!uploadResponse.ok) {
          let errorMessage = `HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`;
          try {
            const errorData = await uploadResponse.json();
            console.error("📥 에러 응답 데이터:", errorData);
            errorMessage = errorData.message || errorData.detail || errorMessage;
          } catch {
            const errorText = await uploadResponse.text();
            console.error("📥 에러 응답 텍스트:", errorText);
          }
          console.error("========================================");
          console.error("[Asset3DLibrary] 3D 모델 파일 업로드 실패");
          console.error("========================================");
          throw new Error(`${t("asset3D.error.modelUploadFailed")}: ${errorMessage}`);
        }

        const uploadResponseData = await uploadResponse.json();
        console.log("📥 응답 데이터:", uploadResponseData);
        console.log("========================================");
        console.log("[Asset3DLibrary] 3D 모델 파일 업로드 성공");
        console.log("========================================");
      } else {
        console.log("========================================");
        console.log("[Asset3DLibrary] 3D 모델 파일이 선택되지 않아 업로드를 건너뜁니다.");
        console.log("========================================");
      }

      console.log("========================================");
      console.log("[Asset3DLibrary] 수정 모드 저장 완료");
      console.log("========================================");
      console.log("✅ 모든 처리 완료");
      console.log("썸네일 파일 선택 여부:", !!thumbnailFile.value);
      console.log("3D 모델 파일 선택 여부:", !!modelFile.value);
      if (thumbnailFile.value) {
        console.log("썸네일 파일명:", thumbnailFile.value.name);
      }
      if (modelFile.value) {
        console.log("3D 모델 파일명:", modelFile.value.name);
      }
      console.log("========================================");

      alert(t("common.saved"));

      // 수정 모드에서는 새로 선택한 파일만 초기화 (썸네일 정보는 유지)
      modelFile.value = null;
      thumbnailFile.value = null;
      if (modelFileInput.value) {
        modelFileInput.value.value = "";
      }
      if (thumbnailFileInput.value) {
        thumbnailFileInput.value.value = "";
      }
      
      // 수정 모드에서는 썸네일 파일명과 미리보기는 유지
      // (서버에서 다시 로드하거나 기존 값 유지)
      
      // 저장 후 초기값 갱신
      saveInitialLibraryData();

      return;
    }

    console.log("========================================");
    console.log("[Asset3DLibrary] 등록 모드로 진행");
    console.log("========================================");
    console.log("📋 파일 상태 확인:");
    console.log("  - modelFile.value:", modelFile.value);
    console.log("  - modelFileName.value:", modelFileName.value);
    console.log("  - thumbnailFile.value:", thumbnailFile.value);
    console.log("  - thumbnailFileName.value:", thumbnailFileName.value);
    console.log("  - currentLibraryId.value:", currentLibraryId.value);
    console.log("  - isAlreadySaved:", isAlreadySaved);
    console.log("========================================");

    // 등록 모드이지만 이미 저장된 데이터인 경우 업데이트로 처리
    if (isAlreadySaved && currentLibraryId.value) {
      const libraryId = currentLibraryId.value;
      
      console.log("========================================");
      console.log("[Asset3DLibrary] 등록 모드에서 업데이트로 처리");
      console.log("========================================");
      console.log("library_id:", libraryId);
      console.log("========================================");

      // 카테고리 영문명 매핑
      const categoryEnMap: Record<string, string> = {
        INTERIOR: "Interior",
        STRUCTURE: "Structure",
      };
      const categoryEn = categoryEnMap[selectedCategory.value] || selectedCategory.value;

      // 라이브러리 업데이트 요청 데이터 구성
      const updateData: Record<string, unknown> = {
        category: selectedCategory.value,
        category_en: categoryEn,
        model_code: modelName.value.trim(),
        model_name: modelName.value.trim(),
        model_name_en: modelName.value.trim(),
        unit_system_code: selectedUnit.value,
        metadata: {},
        is_active: true,
        remarks: "",
      };

      // 라이브러리 업데이트 API 호출
      console.log("========================================");
      console.log("[Asset3DLibrary] 라이브러리 업데이트 API 호출 시작");
      console.log("========================================");
      console.log("📤 API 엔드포인트: /api/asset3D/library/update/" + libraryId);
      console.log("📤 HTTP 메서드: PATCH");
      console.log("📤 library_id:", libraryId);
      console.log("📤 요청 데이터:", JSON.stringify(updateData, null, 2));
      console.log("========================================");

      try {
        const updateResponse = await request(`/api/asset3D/library/update/${libraryId}`, undefined, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        console.log("📥 업데이트 응답:", updateResponse);

        if (!updateResponse || !updateResponse.success) {
          const errorMsg = updateResponse?.message || t("asset3D.error.libraryUpdateFailed");
          throw new Error(errorMsg);
        }

        // 썸네일 파일 업로드 (있는 경우)
        if (thumbnailFile.value) {
          console.log("========================================");
          console.log("[Asset3DLibrary] 썸네일 파일 업로드 시작 (등록 모드에서 업데이트)");
          console.log("========================================");
          console.log("📤 API 엔드포인트: /api/asset3D/library/thumbnail/upload");
          console.log("📤 HTTP 메서드: POST");
          console.log("📤 library_id:", libraryId);
          console.log("📤 파일명:", thumbnailFile.value.name);
          console.log("📤 파일 크기:", thumbnailFile.value.size, "bytes");
          console.log("📤 파일 타입:", thumbnailFile.value.type);
          console.log("========================================");

          const thumbnailFormData = new FormData();
          thumbnailFormData.append("file", thumbnailFile.value);
          thumbnailFormData.append("library_id", String(libraryId));

          const url = new URL("/api/asset3D/library/thumbnail/upload", window.location.origin);
          const headers: Record<string, string> = {
            system_code: import.meta.env.VITE_SYSTEM_CODE,
            user_Id: localStorage.getItem("authUserId") || "",
            wai_lang: localStorage.getItem("wai_lang") || "ko",
            authSuper: localStorage.getItem("authSuper") || "false",
          };

          console.log("📤 요청 URL:", url.toString());
          console.log("📤 요청 헤더:", headers);
          console.log("📤 FormData 항목:");
          console.log(`  - file: File(${thumbnailFile.value.name}, ${thumbnailFile.value.size} bytes)`);
          console.log(`  - library_id: ${libraryId}`);
          console.log("========================================");

          const thumbnailUploadResponse = await fetch(url.toString(), {
            method: "POST",
            headers,
            credentials: "include",
            body: thumbnailFormData,
          });

          console.log("📥 응답 상태:", thumbnailUploadResponse.status, thumbnailUploadResponse.statusText);

          if (!thumbnailUploadResponse.ok) {
            let errorMessage = `HTTP ${thumbnailUploadResponse.status}: ${thumbnailUploadResponse.statusText}`;
            try {
              const errorData = await thumbnailUploadResponse.json();
              console.error("📥 에러 응답 데이터:", errorData);
              errorMessage = errorData?.message || errorData?.detail || errorMessage;
            } catch {
              const errorText = await thumbnailUploadResponse.text();
              console.error("📥 에러 응답 텍스트:", errorText);
            }
            console.error("[Asset3DLibrary] 썸네일 파일 업로드 실패");
            console.error("========================================");
            throw new Error(`${t("asset3D.error.thumbnailUploadFailed")}: ${errorMessage}`);
          }

          const thumbnailUploadResponseData = await thumbnailUploadResponse.json();
          console.log("📥 응답 데이터:", thumbnailUploadResponseData);
          console.log("========================================");
          console.log("[Asset3DLibrary] 썸네일 파일 업로드 성공");
          console.log("========================================");
        } else {
          console.log("========================================");
          console.log("[Asset3DLibrary] 썸네일 파일이 선택되지 않아 업로드를 건너뜁니다.");
          console.log("========================================");
        }

        // 3D 모델 파일 업로드 (있는 경우)
        if (modelFile.value) {
          console.log("========================================");
          console.log("[Asset3DLibrary] 3D 모델 파일 업로드 시작 (등록 모드에서 업데이트)");
          console.log("========================================");
          console.log("📤 API 엔드포인트: /api/asset3D/library/model/upload");
          console.log("📤 HTTP 메서드: POST");
          console.log("📤 library_id:", libraryId);
          console.log("📤 파일명:", modelFile.value.name);
          console.log("📤 파일 크기:", modelFile.value.size, "bytes");
          console.log("📤 파일 타입:", modelFile.value.type);
          console.log("========================================");

          const modelFormData = new FormData();
          modelFormData.append("file", modelFile.value);
          modelFormData.append("library_id", String(libraryId));

          const url = new URL("/api/asset3D/library/model/upload", window.location.origin);
          const headers: Record<string, string> = {
            system_code: import.meta.env.VITE_SYSTEM_CODE,
            user_Id: localStorage.getItem("authUserId") || "",
            wai_lang: localStorage.getItem("wai_lang") || "ko",
            authSuper: localStorage.getItem("authSuper") || "false",
          };

          console.log("📤 요청 URL:", url.toString());
          console.log("📤 요청 헤더:", headers);
          console.log("📤 FormData 항목:");
          console.log(`  - file: File(${modelFile.value.name}, ${modelFile.value.size} bytes)`);
          console.log(`  - library_id: ${libraryId}`);
          console.log("========================================");

          const modelUploadResponse = await fetch(url.toString(), {
            method: "POST",
            headers,
            credentials: "include",
            body: modelFormData,
          });

          console.log("📥 응답 상태:", modelUploadResponse.status, modelUploadResponse.statusText);

          if (!modelUploadResponse.ok) {
            let errorMessage = `HTTP ${modelUploadResponse.status}: ${modelUploadResponse.statusText}`;
            try {
              const errorData = await modelUploadResponse.json();
              console.error("📥 에러 응답 데이터:", errorData);
              errorMessage = errorData?.message || errorData?.detail || errorMessage;
            } catch {
              const errorText = await modelUploadResponse.text();
              console.error("📥 에러 응답 텍스트:", errorText);
            }
            console.error("[Asset3DLibrary] 3D 모델 파일 업로드 실패");
            console.error("========================================");
            throw new Error(`${t("asset3D.error.modelUploadFailed")}: ${errorMessage}`);
          }

          const uploadResponseData = await modelUploadResponse.json();
          console.log("📥 응답 데이터:", uploadResponseData);
          console.log("========================================");
          console.log("[Asset3DLibrary] 3D 모델 파일 업로드 성공");
          console.log("========================================");
        } else {
          console.log("========================================");
          console.log("[Asset3DLibrary] 3D 모델 파일이 선택되지 않아 업로드를 건너뜁니다.");
          console.log("========================================");
        }

        console.log("========================================");
        console.log("[Asset3DLibrary] 등록 모드에서 업데이트 완료");
        console.log("========================================");

        alert(t("common.saved"));

        // 저장 후 초기값 갱신
        saveInitialLibraryData();

        return;
      } catch (error) {
        console.error("========================================");
        console.error("[Asset3DLibrary] 등록 모드에서 업데이트 실패");
        console.error("========================================");
        console.error("에러:", error);
        throw error;
      }
    }

    // 등록 모드 처리 - multipart/form-data로 한 번에 전송
    // 카테고리 영문명 매핑
    const categoryEnMap: Record<string, string> = {
      INTERIOR: "Interior",
      STRUCTURE: "Structure",
    };
    const categoryEn = categoryEnMap[selectedCategory.value] || selectedCategory.value;

    // FormData 생성
    const formData = new FormData();
    
    // 라이브러리 데이터를 FormData에 추가
    formData.append("category", selectedCategory.value);
    formData.append("category_en", categoryEn);
    formData.append("model_code", modelName.value.trim());
    formData.append("model_name", modelName.value.trim());
    formData.append("model_name_en", modelName.value.trim());
    formData.append("unit_system_code", selectedUnit.value);
    formData.append("metadata", JSON.stringify({}));
    formData.append("is_active", "true");
    formData.append("remarks", "");

    // 3D 모델 파일 추가 (있는 경우)
    if (modelFile.value) {
      console.log("📤 3D 모델 파일 추가 시작");
      console.log("  - 파일명:", modelFile.value.name);
      console.log("  - 파일 크기:", modelFile.value.size);
      console.log("  - 파일 타입:", modelFile.value.type);
      formData.append("modelFile", modelFile.value);
      console.log("✅ 3D 모델 파일 FormData에 추가 완료");
    } else {
      console.log("⚠️ 3D 모델 파일이 없습니다. modelFile.value:", modelFile.value);
    }

    // 썸네일 파일 추가 (있는 경우)
    if (thumbnailFile.value) {
      console.log("📤 썸네일 파일 추가 시작");
      console.log("  - 파일명:", thumbnailFile.value.name);
      console.log("  - 파일 크기:", thumbnailFile.value.size);
      console.log("  - 파일 타입:", thumbnailFile.value.type);
      formData.append("thumbnailFile", thumbnailFile.value);
      console.log("✅ 썸네일 파일 FormData에 추가 완료");
    } else {
      console.log("⚠️ 썸네일 파일이 없습니다. thumbnailFile.value:", thumbnailFile.value);
    }

    console.log("========================================");
    console.log("[Asset3DLibrary] 등록 요청 (multipart/form-data)");
    console.log("========================================");
    console.log("📤 API 엔드포인트: /api/asset3D/library/create");
    console.log("📤 HTTP 메서드: POST");
    console.log("📤 FormData 항목:");
    console.log(`  - category: ${selectedCategory.value}`);
    console.log(`  - category_en: ${categoryEn}`);
    console.log(`  - model_code: ${modelName.value.trim()}`);
    console.log(`  - model_name: ${modelName.value.trim()}`);
    console.log(`  - model_name_en: ${modelName.value.trim()}`);
    console.log(`  - unit_system_code: ${selectedUnit.value}`);
    if (modelFile.value) {
      console.log(`  - modelFile: File(${modelFile.value.name}, ${modelFile.value.size} bytes)`);
    }
    if (thumbnailFile.value) {
      console.log(`  - thumbnailFile: File(${thumbnailFile.value.name}, ${thumbnailFile.value.size} bytes)`);
    }
    console.log("========================================");

    // FormData 검증
    console.log("========================================");
    console.log("[Asset3DLibrary] FormData 최종 검증");
    console.log("========================================");
    // FormData의 모든 항목 확인 (디버깅용)
    const formDataEntries: Array<{ key: string; value: string | File }> = [];
    // FormData를 직접 순회할 수 없으므로, 추가한 항목들을 수동으로 확인
    formDataEntries.push({ key: "category", value: selectedCategory.value });
    formDataEntries.push({ key: "category_en", value: categoryEn });
    formDataEntries.push({ key: "model_code", value: modelName.value.trim() });
    formDataEntries.push({ key: "model_name", value: modelName.value.trim() });
    formDataEntries.push({ key: "model_name_en", value: modelName.value.trim() });
    formDataEntries.push({ key: "unit_system_code", value: selectedUnit.value });
    if (modelFile.value) {
      formDataEntries.push({ key: "modelFile", value: modelFile.value });
    }
    if (thumbnailFile.value) {
      formDataEntries.push({ key: "thumbnailFile", value: thumbnailFile.value });
    }
    console.log("FormData 항목 수:", formDataEntries.length);
    formDataEntries.forEach((entry) => {
      if (entry.value instanceof File) {
        console.log(`  ✅ ${entry.key}: File(${entry.value.name}, ${entry.value.size} bytes)`);
      } else {
        console.log(`  ✅ ${entry.key}: ${entry.value}`);
      }
    });
    console.log("========================================");

    // API 호출 (multipart/form-data)
    const url = new URL("/api/asset3D/library/create", window.location.origin);
    const headers: Record<string, string> = {
      system_code: import.meta.env.VITE_SYSTEM_CODE,
      user_Id: localStorage.getItem("authUserId") || "",
      wai_lang: localStorage.getItem("wai_lang") || "ko",
      authSuper: localStorage.getItem("authSuper") || "false",
      // Content-Type은 FormData 사용 시 브라우저가 자동으로 설정하므로 명시하지 않음
    };

    console.log("📤 요청 URL:", url.toString());
    console.log("📤 요청 헤더:", headers);
    console.log("📤 FormData 전송 시작...");
    console.log("========================================");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });

    console.log("📥 응답 상태:", response.status, response.statusText);
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log("📥 응답 헤더:", responseHeaders);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error("📥 에러 응답 데이터:", errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch {
        const errorText = await response.text();
        console.error("📥 에러 응답 텍스트:", errorText);
      }
      console.error("========================================");
      console.error("[Asset3DLibrary] 등록 실패");
      console.error("========================================");
      throw new Error(`${t("asset3D.error.registerFailed")}: ${errorMessage}`);
    }

    const responseData = await response.json();
    console.log("📥 응답 데이터:", responseData);
    console.log("========================================");
    console.log("[Asset3DLibrary] 등록 성공");
    console.log("========================================");

    if (!responseData || !responseData.success) {
      throw new Error(responseData?.message || t("asset3D.error.registerFailed"));
    }

    // 등록 모드에서 library_id 추출 및 저장
    const responseDataAny = responseData as any;
    const libraryId = responseDataAny.response?.library_id || responseDataAny.library_id || responseDataAny.id || null;
    if (libraryId) {
      currentLibraryId.value = String(libraryId);
      console.log("✅ library_id 저장:", currentLibraryId.value);
    }

    alert(t("common.registered"));

    // 성공 시 초기화하지 않고, 등록 모드에서 이미 저장된 데이터로 처리
    // (다시 저장 시 업데이트로 동작하도록)
    // 저장 후 초기값 갱신
    saveInitialLibraryData();
  } catch (error) {
    console.error("========================================");
    console.error("[Asset3DLibrary] 에러 발생");
    console.error("========================================");
    console.error("에러 타입:", error);
    console.error("에러 메시지:", error instanceof Error ? error.message : String(error));
    console.error("에러 스택:", error instanceof Error ? error.stack : "스택 없음");
    console.error("========================================");
    const errorMessage = error instanceof Error ? error.message : t("asset3D.error.registerFailed");
    alert(errorMessage);
  }
};

// 초기값 저장용
interface InitialLibraryData {
  selectedUnit: string;
  selectedCategory: string;
  modelName: string;
  modelFileName: string;
  modelDownloadUrl: string;
  thumbnailFileName: string;
  thumbnailDownloadUrl: string;
  hasModelFile: boolean;
  hasThumbnailFile: boolean;
}

const initialLibraryData = ref<InitialLibraryData | null>(null);

// 초기값 저장 함수
const saveInitialLibraryData = () => {
  initialLibraryData.value = {
    selectedUnit: selectedUnit.value,
    selectedCategory: selectedCategory.value,
    modelName: modelName.value,
    modelFileName: modelFileName.value,
    modelDownloadUrl: modelDownloadUrl.value,
    thumbnailFileName: thumbnailFileName.value,
    thumbnailDownloadUrl: thumbnailDownloadUrl.value,
    hasModelFile: !!modelFile.value,
    hasThumbnailFile: !!thumbnailFile.value,
  };
};

// 변경사항 확인 함수
const hasLibraryChanges = (): boolean => {
  if (!initialLibraryData.value) {
    // 초기값이 저장되지 않은 경우, 현재 입력값이 있는지 확인
    return !!(
      selectedUnit.value ||
      selectedCategory.value ||
      modelName.value ||
      modelFile.value ||
      thumbnailFile.value ||
      modelFileName.value ||
      thumbnailFileName.value
    );
  }

  const current = {
    selectedUnit: selectedUnit.value || "",
    selectedCategory: selectedCategory.value || "",
    modelName: modelName.value || "",
    modelFileName: modelFileName.value || "",
    modelDownloadUrl: modelDownloadUrl.value || "",
    thumbnailFileName: thumbnailFileName.value || "",
    thumbnailDownloadUrl: thumbnailDownloadUrl.value || "",
    hasModelFile: !!modelFile.value,
    hasThumbnailFile: !!thumbnailFile.value,
  };

  const initial = initialLibraryData.value;

  return (
    current.selectedUnit !== initial.selectedUnit ||
    current.selectedCategory !== initial.selectedCategory ||
    current.modelName !== initial.modelName ||
    current.modelFileName !== initial.modelFileName ||
    current.modelDownloadUrl !== initial.modelDownloadUrl ||
    current.thumbnailFileName !== initial.thumbnailFileName ||
    current.thumbnailDownloadUrl !== initial.thumbnailDownloadUrl ||
    current.hasModelFile !== initial.hasModelFile ||
    current.hasThumbnailFile !== initial.hasThumbnailFile
  );
};

// defineExpose로 변경사항 확인 함수 노출
defineExpose({
  hasLibraryChanges,
  saveInitialLibraryData,
});
</script>

<style scoped lang="scss">
$mobile: 768px;
$tablet: 1024px;

.form-group {
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
  font-size: 13px;
  min-width: 100px;
  flex-shrink: 0;

  &.required::after {
    content: "*";
    color: #333333;
    margin-left: 4px;
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

.file-upload-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.file-upload-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-width: 0;

  .form-input {
    flex: 1;
    min-width: 0;
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

.thumbnail-preview-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;

  .thumbnail-preview {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border: 1px solid #d0d5dd;
    border-radius: 4px;
    flex-shrink: 0;
    display: block;
  }


  .thumbnail-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    right: -2.5px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: rgba(62, 67, 94, 0.6);
    transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
    z-index: 10;
    opacity: 0;
    pointer-events: none;
    border: none;
    cursor: pointer;
    padding: 0;

    &::after {
      content: "x";
      display: inline-block;
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 10px;
      color: #ffffff;
    }
  }

  .thumbnail-preview:hover ~ .thumbnail-close-btn {
    opacity: 1;
    pointer-events: auto;
  }

  &:hover .thumbnail-close-btn {
    opacity: 1;
    pointer-events: auto;
  }

  .thumbnail-close-btn:hover {
    background-color: rgba(62, 67, 94, 1);
  }
}
</style>
