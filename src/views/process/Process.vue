<template>
  <div class="process-page">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="search-bar">
        <!-- 조회조건: 단위, 공정구분, 공정중분류, 공정명, 검색 버튼 -->
        <div class="search-row first-row">
          <div class="group-form">
            <label for="searchUnit" class="label-title">{{
              t("codeManagement.categories.unit")
            }}</label>
            <div class="form-item">
              <select
                id="searchUnit"
                v-model="selectedUnit"
                class="form-select"
                @change="handleUnitChange"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="unit in pipeStore.unitSystems"
                  :key="unit.unit_system_id"
                  :value="unit.system_code"
                >
                  {{ unit.system_name }}
                </option>
              </select>
            </div>
          </div>
          <div class="group-form">
            <label for="searchOption" class="label-title">{{
              t("process.processType")
            }}</label>
            <div class="form-item">
              <select
                id="searchProcessType"
                :value="processStore.searchProcessType || ''"
                class="form-select"
                @change="handleSearchProcessTypeChange"
                :key="`searchProcessType-${processStore.searchProcessTypeOptions.length}`"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="option in processStore.searchProcessTypeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="group-form">
            <label for="searchSubCategory" class="label-title">{{
              t("process.subCategory")
            }}</label>
            <div class="form-item">
              <select
                id="searchSubCategory"
                :value="processStore.searchSubCategoryInput || ''"
                class="form-select"
                @change="handleSubCategoryChange"
                :key="`searchSubCategory-${processStore.searchSubCategoryOptions.length}`"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="option in processStore.searchSubCategoryOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="group-form" style="margin-right: 10px">
            <label for="searchProcessName" class="label-title">{{
              t("process.processName")
            }}</label>
            <div class="form-item">
              <select
                id="searchProcessName"
                :value="processStore.searchProcessName || ''"
                class="form-select"
                @change="handleProcessNameChange"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="option in processStore.searchProcessNameOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="group-form">
            <div class="form-item button-group">
              <button class="btn btn-search" @click="handleSearch">
                {{ t("common.search") }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="btns">
        <button class="btn btn-register" @click="handleRegist">
          {{ t("common.register") }}
        </button>
        <button
          class="btn btn-delete"
          @click="handleDelete"
          :disabled="processStore.selectedItems.length === 0"
        >
          {{ t("common.delete") }}
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <!-- DataTable row-key가 default로 id로 설정돼있어서 추가 수정함함 -->
    <!-- 디버깅: 데이터 확인 -->
    <div class="table-wrapper">
      <DataTable
        v-if="
          isComponentMounted &&
          processStore.processList &&
          processStore.processList.length >= 0
        "
        :columns="tableColumns"
        :data="processStore.processList"
        :loading="processStore.loading"
        :selectable="true"
        :selected-items="processStore.selectedItems"
        row-key="id"
        :stickyHeader="true"
        :maxHeight="'100%'"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <!-- 공정심볼 텍스트 표시 슬롯 -->
        <template #cell-symbol_download="{ item }">
          <span class="symbol-text">
            {{
              getFileNameFromUri(item.process_symbol) ||
              getFileNameFromUri(item.symbol_download) ||
              "-"
            }}
          </span>
        </template>

        <!-- 보기 버튼 슬롯 -->
        <template #cell-viewDetail="{ item }">
          <button class="btn btn-view" @click.stop="viewDetail(item)">
            {{ t("process.viewDetail") }}
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Pagination -->
    <div class="pagination-container">
      <div class="total-count">
        {{
          t("common.totalCount", {
            count: processStore.totalCount || 0,
          })
        }}
      </div>
      <Pagination
        :current-page="processStore.currentPage"
        :total-pages="processStore.totalPages"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 등록 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container large-modal">
        <div class="modal-header">
          <h3>{{ t("process.registerProcess") }}</h3>
          <button class="close-btn" @click="closeRegistModal"></button>
        </div>
        <div class="modal-body">
          <!-- 상단: 기본 정보 입력 -->
          <div class="form-section">
            <!-- 첫 번째 줄: 단위 -->
            <div class="form-row">
              <div class="form-group">
                <label class="essential">{{
                  t("codeManagement.categories.unit")
                }}</label>
                <select v-model="registForm.unit" class="form-select">
                  <option value="">{{ t("common.select") }}</option>
                  <option
                    v-for="unit in pipeStore.unitSystems"
                    :key="unit.unit_system_id"
                    :value="unit.system_code"
                  >
                    {{ unit.system_name }}
                  </option>
                </select>
              </div>
            </div>
            <!-- 두 번째 줄: 공정구분, 공정 중분류, 공정명, 공정심볼 파일 -->
            <div class="form-row">
              <div class="form-group">
                <label class="essential">{{ t("process.processType") }}</label>
                <select
                  v-model="registForm.processType"
                  class="form-select"
                  @change="handleRegistProcessTypeChange"
                >
                  <option :value="null">{{ t("common.select") }}</option>
                  <option
                    v-for="option in processStore.searchProcessTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="essential">{{ t("process.subCategory") }}</label>
                <select
                  v-model="registForm.processSubCategory"
                  class="form-select"
                  @change="handleRegistSubCategoryChange"
                >
                  <option :value="null">{{ t("common.select") }}</option>
                  <option
                    v-for="option in processStore.searchSubCategoryOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="essential">{{ t("process.processName") }}</label>
                <select v-model="registForm.processNm" class="form-select">
                  <option :value="null">{{ t("common.select") }}</option>
                  <option
                    v-for="option in processStore.searchProcessNameOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="essential">{{
                  t("process.processSymbolFile")
                }}</label>
                <div class="file-input-group">
                  <input
                    type="file"
                    accept=".svg"
                    @change="handleProcessSymbolFileChange"
                    style="display: none"
                    ref="processSymbolFileInput"
                    id="processSymbolFileInput"
                  />
                  <label for="processSymbolFileInput" class="btn btn-file">
                    {{ t("common.selectFile") }}
                  </label>
                  <span class="selected-file">{{
                    getProcessSymbolFileName() || t("common.noFile")
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 중간: 파일 업로드 그리드 -->
          <div class="file-upload-section">
            <h4>{{ t("process.fileUpload") }}</h4>
            <div class="grid-actions">
              <button class="btn btn-primary" @click="addFileUploadRow">
                {{ t("process.addRow") }}
              </button>
              <button
                class="btn btn-danger"
                @click="deleteSelectedFileRows"
                :disabled="selectedFileRows.length === 0"
              >
                {{ t("common.delete") }}
              </button>
            </div>
            <div class="file-upload-table">
              <table class="upload-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        @change="handleSelectAllFileRows"
                        :checked="
                          selectedFileRows.length === fileUploadRows.length &&
                          fileUploadRows.length > 0
                        "
                        :indeterminate="
                          selectedFileRows.length > 0 &&
                          selectedFileRows.length < fileUploadRows.length
                        "
                      />
                    </th>
                    <th>{{ t("common.no") }}.</th>
                    <th>{{ t("process.formulaRequired") }}</th>
                    <th>{{ t("process.pfdRequired") }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in fileUploadRows"
                    :key="row.id"
                    :class="{ 'alternate-row': index % 2 === 1 }"
                  >
                    <td>
                      <input
                        type="checkbox"
                        :value="row"
                        v-model="selectedFileRows"
                      />
                    </td>
                    <td>{{ row.no }}</td>
                    <td>
                      <div class="file-input-group">
                        <button
                          class="btn btn-primary"
                          @click="selectFormulaFile(row)"
                        >
                          {{ t("common.selectFile") }}
                        </button>
                        <span class="selected-files-info">
                          {{
                            row.formulaFile
                              ? `${row.formulaFile.name} (${(
                                  row.formulaFile.size / 1024
                                ).toFixed(2)} KB)`
                              : t("common.noFile")
                          }}
                        </span>
                        <button
                          v-if="row.formulaFile"
                          class="clear-file"
                          @click="clearFormulaFile(row)"
                          :title="t('process.removeFile')"
                        >
                          &times;
                        </button>
                      </div>
                    </td>
                    <td>
                      <div class="file-input-group">
                        <button
                          class="btn btn-primary"
                          @click="selectPfdFile(row)"
                        >
                          {{ t("common.selectFile") }}
                        </button>
                        <span class="selected-files-info">
                          {{
                            row.pfdFile
                              ? `${row.pfdFile.name} (${(
                                  row.pfdFile.size / 1024
                                ).toFixed(2)} KB)`
                              : t("common.noFile")
                          }}
                        </span>
                        <button
                          v-if="row.pfdFile"
                          class="clear-file"
                          @click="clearPfdFile(row)"
                          :title="t('process.removeFile')"
                        >
                          &times;
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Hidden file inputs -->
          <input
            type="file"
            accept=".svg"
            @change="handleProcessSymbolFileChange"
            style="display: none"
            ref="processSymbolFileInput"
          />
          <input
            type="file"
            accept=".py,.xlsx,.xls,.csv"
            @change="handleFormulaFileSelected"
            style="display: none"
            ref="formulaFileInput"
          />
          <input
            type="file"
            accept=".dwg,.dxf"
            @change="handlePfdFileSelected"
            style="display: none"
            ref="pfdFileInput"
          />
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="saveProcessRegistration">
            {{ t("common.save") }}
          </button>
          <button class="btn btn-secondary" @click="closeRegistModal">
            {{ t("common.close") }}
          </button>
        </div>
      </div>
    </div>

    <!-- ProcessDetail 모달 -->
    <div v-if="isDetailModalOpen" class="modal-overlay detail-modal-overlay">
      <div class="modal-container detail-modal-container">
        <div class="modal-header">
          <h3>
            {{
              isRegisterMode
                ? t("process.registerProcess")
                : t("process.processDetail")
            }}
          </h3>
          <button class="close-btn" @click="closeDetailModal"></button>
        </div>
        <div class="modal-body detail-modal-body">
          <div v-if="!selectedProcessId" class="loading-placeholder">
            <p>{{ t("process.loadingProcessInfo") }}</p>
          </div>
          <ProcessDetail
            v-else
            :key="`process-detail-${selectedProcessId}`"
            :process-id="String(selectedProcessIdForApi)"
            :process-code="String(selectedProcessId)"
            :is-register-mode="isRegisterMode"
            :initial-process-type="processStore.searchProcessType"
            :initial-sub-category="processStore.searchSubCategoryInput"
            ref="processDetailRef"
            class="popup-mode"
            @update-success="closeDetailModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import ProcessDetail from "./ProcessDetail.vue";
import { useI18n } from "vue-i18n";
import { useTranslateMessage } from "@/utils/translateMessage";
import { useProcessStore, type ProcessItem } from "@/stores/processStore";
import { usePipeStore } from "@/stores/pipeStore";

const { t, locale } = useI18n();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = useTranslateMessage();

const processStore = useProcessStore();
const pipeStore = usePipeStore();

// 언어 변경 감지하여 옵션 재로드
watch(
  () => locale.value,
  async (newLocale, oldLocale) => {
    if (newLocale !== oldLocale && oldLocale !== undefined) {
      try {
        // Process Type 옵션 재로드
        await processStore.loadProcessTypeCodes();

        // Sub Category가 선택되어 있으면 재로드
        if (processStore.searchProcessType) {
          await processStore.loadSubCategoryCodes(
            processStore.searchProcessType
          );
        }
      } catch (error) {
        console.error("언어 변경 시 옵션 재로드 실패:", error);
      }
    }
  }
);

interface RegistForm {
  processType: string | null;
  processSubCategory: string | null;
  processNm: string | null;
  subCategory: string;
  processSymbol: string;
  pidInfo: string;
  processSymbolFile: File | null;
  calculationFile: File | null;
  pidFile: File | null;
  pfdFile: File | null;
  excelFile: File | null;
  unit: string;
}

interface FileUploadRow {
  id: string;
  no: number;
  formulaFile: File | null;
  pfdFile: File | null;
  // 원본 파일 정보 저장 (ProcessDetail.vue와 동일한 로직)
  originalFormulaFile?: string | null;
  originalPfdFile?: string | null;
}

// 첨부된 파일 목록을 관리하는 인터페이스
interface AttachedFiles {
  calculation: string[];
  pfd: string[];
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "process_id", title: "Process ID", sortable: false, hidden: true }, // process_id (숨김)
  { key: "symbol_id", title: "Symbol ID", sortable: false, hidden: true }, // symbol_id (숨김)
  {
    key: "process_type_nm",
    title: t("process.processType"),
    sortable: false,
    formatter: (value, row) => {
      // 언어가 영어인 경우 level2_code_value_en 사용
      if (locale.value === "en" && row.level2_code_value_en) {
        return row.level2_code_value_en;
      }
      return value || "-";
    },
  }, // 공정구분
  {
    key: "sub_category_nm",
    title: t("process.subCategory"),
    sortable: false,
    formatter: (value, row) => {
      // 언어가 영어인 경우 level3_code_value_en 사용
      if (locale.value === "en" && row.level3_code_value_en) {
        return row.level3_code_value_en;
      }
      return value || "-";
    },
  }, // 공정 중분류
  {
    key: "process_name",
    title: t("process.processName"),
    sortable: false,
    formatter: (value, row) => {
      // level3_code_key와 process_code가 같으면 공정명을 표시하지 않음
      if (row.level3_code_key === row.process_code) {
        return "-";
      }
      // 언어가 영어인 경우 level4_code_value_en 사용
      if (locale.value === "en" && row.level4_code_value_en) {
        return row.level4_code_value_en;
      }
      return value || "-";
    },
  }, // 공정명
  {
    key: "symbol_download",
    title: t("process.processSymbol"),
    sortable: false,
    formatter: (value) => value || "-",
  }, // 공정심볼 (SVG 미리보기)
  {
    key: "viewDetail",
    title: t("common.detailInfo"),
    sortable: false,
    formatter: (value) => formatDate(value),
  }, // 상세보기
];

// 로컬 상태 (store에서 관리되지 않는 것들)
const sortColumn = ref<string | null>(null);
const sortOrder = ref<"asc" | "desc" | null>(null);
const isRegistModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const isRegisterMode = ref(false);

// 파일 입력 ref
const processSymbolFileInput = ref<HTMLInputElement | null>(null);
const formulaFileInput = ref<HTMLInputElement | null>(null);
const pfdFileInput = ref<HTMLInputElement | null>(null);
const selectedProcessSymbolFile = ref<File | null>(null);
const selectedProcessId = ref<string | undefined>(undefined);
const selectedProcessIdForApi = ref<string | undefined>(undefined);
const processDetailRef = ref<InstanceType<typeof ProcessDetail> | null>(null);
const isComponentMounted = ref(false);

// 단위 선택
const selectedUnit = ref<string>("");

// 등록 폼 데이터
const registForm = ref<RegistForm>({
  processType: null,
  processSubCategory: null,
  processNm: null,
  subCategory: "",
  processSymbol: "",
  pidInfo: "",
  processSymbolFile: null,
  calculationFile: null,
  pidFile: null,
  pfdFile: null,
  excelFile: null,
  unit: "METRIC",
});

// 파일 업로드 그리드 관련 상태
const fileUploadRows = ref<FileUploadRow[]>([]);
const selectedFileRows = ref<FileUploadRow[]>([]);
const currentFileRow = ref<FileUploadRow | null>(null);

// 첨부된 파일 목록 상태
const attachedFiles = ref<AttachedFiles>({
  calculation: [],
  pfd: [],
});

// 파일 선택 관련 상태
const selectedFiles = ref<{ [key: string]: File }>({});

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ko-KR");
};

// URI에서 파일명만 추출하는 함수
const getFileNameFromUri = (uri: string | null | undefined): string => {
  if (!uri || typeof uri !== "string") {
    return "-";
  }

  // 경로 구분자로 분할하여 마지막 부분(파일명) 추출
  const pathParts = uri.split(/[/\\]/);
  const fileName = pathParts[pathParts.length - 1];

  // 파일명이 비어있거나 경로가 없는 경우
  if (!fileName || fileName === uri) {
    return uri;
  }

  return fileName;
};

const handleRegist = () => {
  // ProcessDetail 모달을 공정 등록 모드로 열기
  isRegisterMode.value = true;
  selectedProcessId.value = "new"; // 새 공정임을 나타내는 값
  selectedProcessIdForApi.value = undefined; // API 호출용 ID 초기화
  isDetailModalOpen.value = true;
};

const closeRegistModal = () => {
  isRegistModalOpen.value = false;
  // 폼 초기화
  registForm.value = {
    processType: null,
    processSubCategory: null,
    processNm: null,
    subCategory: "",
    processSymbol: "",
    pidInfo: "",
    processSymbolFile: null,
    calculationFile: null,
    pidFile: null,
    pfdFile: null,
    excelFile: null,
    unit: "METRIC",
  };

  // 파일 입력 초기화
  if (processSymbolFileInput.value) {
    processSymbolFileInput.value.value = "";
  }
  selectedProcessSymbolFile.value = null;
  // 파일 선택 상태도 초기화
  selectedFiles.value = {};
  // 첨부된 파일 목록도 초기화
  attachedFiles.value = {
    calculation: [],
    pfd: [],
  };
  // 파일 업로드 그리드 초기화
  fileUploadRows.value = [];
  selectedFileRows.value = [];
  currentFileRow.value = null;
};

const handleDelete = async () => {
  if (processStore.selectedItems.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  const confirmed = confirm(t("process.deleteConfirmMessage"));

  if (confirmed) {
    // 선택된 항목들의 process_id 추출 (catch 블록에서도 사용하기 위해 밖으로 이동)
    const selectedProcessIds = processStore.selectedItems.map(
      (item) => item.process_id
    );

    const selectedSymbolIds = processStore.selectedItems
      .map((item) => item.symbol_id || "")
      .filter((id) => id !== "");

    try {
      // processStore를 통한 삭제 처리
      const { successCount, failCount, results } =
        await processStore.deleteProcesses(
          selectedProcessIds,
          selectedSymbolIds
        );

      // API 응답 콘솔 출력
      console.log("=== 삭제 API 응답 ===");
      console.log("전체 응답 결과:", results);
      console.log("성공 건수:", successCount);
      console.log("실패 건수:", failCount);
      results?.forEach((result: any, index: number) => {
        console.log(
          `항목 ${index + 1} (process_id: ${selectedProcessIds[index]}):`,
          result
        );
      });

      if (failCount > 0) {
        // 실패한 항목들의 메시지 수집
        const failMessages: string[] = [];
        results?.forEach((result: any, index: number) => {
          if (!result.success) {
            // API 응답의 상세 메시지 추출 (여러 경로 확인)
            const errorMessage =
              result.response?.data?.message ||
              result.response?.message ||
              result.data?.message ||
              result.error?.message ||
              result.error?.response?.data?.message ||
              result.error?.response?.message ||
              result.message ||
              "삭제 실패";
            failMessages.push(
              `항목 ${index + 1} (process_id: ${
                selectedProcessIds[index]
              }): ${errorMessage}`
            );
          }
        });

        // 실패 메시지가 있으면 상세 메시지 표시, 없으면 기본 메시지
        const failMessageText =
          failMessages.length > 0
            ? `${successCount}개 항목 삭제 성공\n\n${failCount}개 항목 삭제 실패:\n${failMessages.join(
                "\n"
              )}`
            : `${successCount}개 항목 삭제 성공, ${failCount}개 항목 삭제 실패`;

        alert(failMessageText);
      } else {
        alert(t("messages.success.deleted"));
      }
    } catch (error: any) {
      console.error("삭제 처리 중 오류:", error);

      // 에러가 results를 포함하고 있는 경우 (모든 항목 삭제 실패)
      if (error?.results) {
        console.log("=== 삭제 API 응답 (에러 포함) ===");
        console.log("전체 응답 결과:", error.results);

        // 실패한 항목들의 상세 에러 메시지 수집
        const failMessages: string[] = [];
        error.results?.forEach((result: any, index: number) => {
          console.log(`항목 ${index + 1}:`, result);

          if (!result.success) {
            // API 응답의 상세 메시지 추출 (여러 경로 확인)
            const errorMessage =
              result.response?.data?.message ||
              result.response?.message ||
              result.data?.message ||
              result.error?.message ||
              result.error?.response?.data?.message ||
              result.error?.response?.message ||
              result.message ||
              "삭제 실패";

            failMessages.push(
              `항목 ${index + 1} (process_id: ${
                selectedProcessIds[index]
              }): ${errorMessage}`
            );
          }
        });

        // 상세 에러 메시지가 있으면 표시
        if (failMessages.length > 0) {
          alert(`삭제 실패:\n\n${failMessages.join("\n")}`);
        } else {
          // 기본 에러 메시지 추출
          const errorMessage =
            error?.response?.data?.message ||
            error?.data?.message ||
            error?.message ||
            translateMessage(error?.message, "messages.error.deleteFailed");
          alert(errorMessage);
        }
      } else {
        // 일반 에러인 경우 상세 메시지 추출
        const errorMessage =
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          translateMessage(error?.message, "messages.error.deleteFailed");
        alert(errorMessage);
      }
    }
  }
};

// 새로운 등록 모달 관련 함수들
const addFileUploadRow = () => {
  const newRow: FileUploadRow = {
    id: `row_${Date.now()}`,
    no: fileUploadRows.value.length + 1,
    formulaFile: null,
    pfdFile: null,
  };
  fileUploadRows.value.push(newRow);
};

const handleSelectAllFileRows = () => {
  if (selectedFileRows.value.length === fileUploadRows.value.length) {
    selectedFileRows.value = [];
  } else {
    selectedFileRows.value = [...fileUploadRows.value];
  }
};

const deleteSelectedFileRows = () => {
  if (selectedFileRows.value.length === 0) {
    alert(t("process.selectItemToDelete"));
    return;
  }

  if (
    confirm(
      t("process.deleteSelectedItemsConfirm", {
        count: selectedFileRows.value.length,
      })
    )
  ) {
    const selectedIds = selectedFileRows.value.map((row) => row.id);
    fileUploadRows.value = fileUploadRows.value.filter(
      (row) => !selectedIds.includes(row.id)
    );
    selectedFileRows.value = [];
  }
};

const selectFormulaFile = (row: FileUploadRow) => {
  currentFileRow.value = row;
  formulaFileInput.value?.click();
};

const selectPfdFile = (row: FileUploadRow) => {
  currentFileRow.value = row;
  pfdFileInput.value?.click();
};

const handleProcessSymbolFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (target.files && target.files[0]) {
    const file = target.files[0];

    if (!file.name.toLowerCase().endsWith(".svg")) {
      alert(t("process.onlySvgFile"));
      target.value = "";
      return;
    }

    registForm.value.processSymbolFile = file;
    selectedProcessSymbolFile.value = file; // 반응성을 위해 추가
  }
};

const getProcessSymbolFileName = () => {
  // selectedProcessSymbolFile을 우선적으로 사용 (반응성 보장)
  if (selectedProcessSymbolFile.value) {
    return selectedProcessSymbolFile.value.name;
  }

  // fallback: registForm의 processSymbolFile 사용
  const processSymbolFile = registForm.value.processSymbolFile;
  if (processSymbolFile) {
    return processSymbolFile.name;
  }

  return "";
};

const handleFormulaFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentFileRow.value) {
    const file = target.files[0];

    // Python 파일만 허용
    if (!file.name.toLowerCase().endsWith(".py")) {
      alert(t("process.onlyPythonFile"));
      target.value = "";
      return;
    }

    // 원본 파일 정보 저장 (ProcessDetail.vue와 동일한 로직)
    if (!currentFileRow.value.originalFormulaFile) {
      // 기존 파일이 있다면 원본으로 저장
      currentFileRow.value.originalFormulaFile =
        currentFileRow.value.formulaFile?.name || null;
    }

    currentFileRow.value.formulaFile = file;
  }
};

const handlePfdFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentFileRow.value) {
    const file = target.files[0];

    // PFD 파일 타입 검증 (.dwg, .dxf, .pdf, .png, .jpg, .jpeg)
    const allowedExtensions = [".dwg", ".dxf", ".pdf", ".png", ".jpg", ".jpeg"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      alert(t("process.onlyPfdFile"));
      target.value = "";
      return;
    }

    // 원본 파일 정보 저장 (ProcessDetail.vue와 동일한 로직)
    if (!currentFileRow.value.originalPfdFile) {
      // 기존 파일이 있다면 원본으로 저장
      currentFileRow.value.originalPfdFile =
        currentFileRow.value.pfdFile?.name || null;
    }

    currentFileRow.value.pfdFile = file;
  }
};

const clearFormulaFile = (row: FileUploadRow) => {
  row.formulaFile = null;
};

const clearPfdFile = (row: FileUploadRow) => {
  row.pfdFile = null;
};

const saveProcessRegistration = async () => {
  try {
    // 기본 정보 검증 (공정명도 필수 입력값)
    if (
      !registForm.value.unit ||
      !registForm.value.processType ||
      !registForm.value.processNm
    ) {
      alert(t("messages.warning.pleaseCompleteRequiredFields"));
      return;
    }

    // 공정심볼 파일 검증
    const symbolFile =
      selectedProcessSymbolFile.value || registForm.value.processSymbolFile;
    if (!symbolFile) {
      alert(t("process.selectProcessSymbolFile"));
      return;
    }

    // 파일 업로드 검증 - 첫 행이 추가된 데이터로 간주
    if (fileUploadRows.value.length === 0) {
      alert(t("process.addAtLeastOneFileRow"));
      return;
    }

    // 첫 행 검증 - 첫 행은 반드시 추가된 데이터로 간주
    const firstRow = fileUploadRows.value[0];
    if (!firstRow) {
      alert(t("process.firstRowNotExists"));
      return;
    }

    // 첫 행에 최소 하나의 파일이 있어야 함
    const hasAnyFile = firstRow.formulaFile || firstRow.pfdFile;
    if (!hasAnyFile) {
      alert(t("process.selectAtLeastOneFileInFirstRow"));
      return;
    }

    // 선택된 공정명의 label과 value 찾기 (공정명은 필수 입력값)
    const selectedProcessNameOption = registForm.value.processNm
      ? processStore.searchProcessNameOptions.find(
          (option) => option.value === registForm.value.processNm
        )
      : null;

    // 계산식 파일이 있는 행들을 찾아서 처리 (ProcessDetail.vue의 uploadFormulaFiles 로직 참고)
    const formulaFiles = fileUploadRows.value
      .filter((row) => {
        return (
          row.formulaFile &&
          row.formulaFile instanceof File &&
          row.formulaFile.name &&
          row.formulaFile.size > 0
        );
      })
      .map((row, index) => {
        return {
          id: `formula_${Date.now()}_${index}`,
          no: (index + 1).toString().padStart(3, "0"),
          registeredFormula: row.formulaFile?.name.replace(".py", "") || "",
          formula_code: "",
          registrationDate: new Date().toISOString().split("T")[0],
          infoOverview: "",
          remarks: "",
          _file: row.formulaFile,
        };
      });

    // 공정명 select 선택 상태에 따라 process_code와 process_name 설정
    let processCode, processName;

    if (selectedProcessNameOption && selectedProcessNameOption.value) {
      // 공정명 select가 선택된 상태
      processCode = selectedProcessNameOption.value;
      processName = selectedProcessNameOption.label;
    } else {
      // 공정명이 필수이므로 이 경우는 발생하지 않아야 함
      throw new Error("공정명이 선택되지 않았습니다.");
    }

    // API 호출을 위한 데이터 준비
    const requestData = {
      unit_system_code: registForm.value.unit,
      process_code: processCode,
      process_name: processName,
      process_type_code: registForm.value.processType,
      process_category: registForm.value.processSubCategory,
      process_symbol_file: symbolFile,
      siteFile: symbolFile, // createProcess에서 사용할 siteFile 추가
      file_upload_rows: fileUploadRows.value,
      formula_files: formulaFiles, // 계산식 파일 정보 추가
    };

    // 실제 API 호출
    await processStore.createProcess(requestData);

    // 성공 메시지에 계산식 파일 정보 포함
    let successMessage = t("process.processRegistrationCompleted");
    if (formulaFiles.length > 0) {
      successMessage += `\n${t("process.formulaFilesRegistered", {
        count: formulaFiles.length,
      })}`;
    }

    alert(successMessage);
    closeRegistModal();
  } catch (error) {
    console.error("공정 등록 실패:", error);
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.processRegisterFailed"
    );
    alert(errorMessage);
  }
};

// 상세 보기 이동
const viewDetail = (item: ProcessItem) => {
  // process_id만 사용하여 상세보기
  const processId = item.process_id;

  if (processId) {
    selectedProcessId.value = item.process_code; // 화면 표시용 (process_code)
    selectedProcessIdForApi.value = processId; // API 호출용 (process_id)
    isDetailModalOpen.value = true;
  } else {
    console.error("process_id가 없습니다:", item);
  }
};

const closeDetailModal = async () => {
  try {
    // 변경사항 확인
    if (processDetailRef.value) {
      const hasPfdChanges = processDetailRef.value.hasPfdChanges?.() || false;
      const hasMappingPidChanges =
        processDetailRef.value.hasMappingPidChanges?.() || false;
      const hasPidComponentChanges =
        processDetailRef.value.hasPidComponentChanges?.() || false;
      const hasFormulaChanges =
        processDetailRef.value.hasFormulaChanges?.() || false;

      if (
        hasPfdChanges ||
        hasMappingPidChanges ||
        hasPidComponentChanges ||
        hasFormulaChanges
      ) {
        if (!confirm(t("process.hasChangesConfirm"))) {
          return;
        }
      }
    }

    isDetailModalOpen.value = false;
    selectedProcessId.value = undefined;
    selectedProcessIdForApi.value = undefined;
    isRegisterMode.value = false; // 등록 모드 초기화

    // 메인화면 그리드 재조회
    try {
      await processStore.searchProcesses();
    } catch (error) {
      console.error("메인화면 그리드 재조회 실패:", error);
    }
  } catch (error) {
    console.error("closeDetailModal 함수 실행 중 오류:", error);
  }
};

// ProcessDetail 컴포넌트에서 직접 업데이트를 처리하므로 이 함수는 불필요
// const handleDetailUpdate = async () => { ... };

const handlePageChange = async (page: number) => {
  processStore.setCurrentPage(page);

  // 페이지 변경 시 새로운 API 호출로 서버에서 해당 페이지 데이터 가져오기
  await processStore.searchProcesses();
};

const handleSortChange = (sortInfo: {
  key: string | null;
  direction: "asc" | "desc" | null;
}) => {
  sortColumn.value = sortInfo.key;
  sortOrder.value = sortInfo.direction;
};

// 선택된 항목 변경 핸들러
const handleSelectionChange = (items: ProcessItem[]) => {
  processStore.setSelectedItems(items);
};

// 단위 변경 핸들러
const handleUnitChange = async () => {
  // 단위 변경 시 재조회 수행
  await handleSearch();
};

// 검색 옵션 변경 핸들러
const handleSearchProcessTypeChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value || null;

  // 즉시 값 업데이트
  processStore.setSearchProcessType(selectedValue);

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 중분류 옵션 초기화
    processStore.searchSubCategoryOptions.splice(
      0,
      processStore.searchSubCategoryOptions.length
    );
    processStore.setSearchSubCategoryInput(null);
    // 공정명 옵션도 초기화
    processStore.searchProcessNameOptions.splice(
      0,
      processStore.searchProcessNameOptions.length
    );
    processStore.setSearchProcessName(null);
  } else {
    const selectedOption = processStore.searchProcessTypeOptions.find(
      (option) => option.value === selectedValue
    );

    if (selectedOption) {
      // 중분류 옵션과 값 초기화 (공정구분이 변경되면 중분류는 '-- 선택 --' 상태로)
      processStore.searchSubCategoryOptions.splice(
        0,
        processStore.searchSubCategoryOptions.length
      );
      processStore.setSearchSubCategoryInput(null);

      // 공정명 옵션과 값 초기화
      processStore.searchProcessNameOptions.splice(
        0,
        processStore.searchProcessNameOptions.length
      );
      processStore.setSearchProcessName(null);

      // 새로운 공정구분에 맞는 중분류 옵션 로드
      await handleSubCategoryCode();
    }
  }

  // 공정구분 변경 시 재조회 수행
  await handleSearch();
};

// 중분류 변경 핸들러
const handleSubCategoryChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value || null;

  // 즉시 값 업데이트
  processStore.setSearchSubCategoryInput(selectedValue);

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 공정명 옵션 초기화
    processStore.searchProcessNameOptions.splice(
      0,
      processStore.searchProcessNameOptions.length
    );
    processStore.setSearchProcessName(null);
  } else {
    // 공정명 옵션과 값 초기화 (중분류가 변경되면 공정명은 '-- 선택 --' 상태로)
    processStore.searchProcessNameOptions.splice(
      0,
      processStore.searchProcessNameOptions.length
    );
    processStore.setSearchProcessName(null);

    // 새로운 중분류에 맞는 공정명 옵션 로드
    await handleProcessNameCodeSearch();
  }

  // 중분류 변경 시 재조회 수행
  await handleSearch();
};

// 공정명 변경 핸들러
const handleProcessNameChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value || null;

  // 즉시 값 업데이트
  processStore.setSearchProcessName(selectedValue);

  // 공정명 변경 시 재조회 수행
  await handleSearch();
};

// 등록 모달 공정구분 변경 핸들러
const handleRegistProcessTypeChange = () => {
  const selectedValue = registForm.value.processType;

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 중분류 및 공정명 옵션 초기화
    processStore.searchSubCategoryOptions.splice(
      0,
      processStore.searchSubCategoryOptions.length
    );
    processStore.searchProcessNameOptions.splice(
      0,
      processStore.searchProcessNameOptions.length
    );
    registForm.value.processSubCategory = null;
    registForm.value.processNm = null;
  } else {
    // 중분류 옵션 로드
    handleRegistMiddleCodeSearch();
  }
};

// 등록 모달 중분류 변경 핸들러
const handleRegistSubCategoryChange = () => {
  const selectedValue = registForm.value.processSubCategory;

  if (selectedValue === null || selectedValue === "") {
    // null 또는 공백값이 선택된 경우 공정명 옵션 초기화
    processStore.searchProcessNameOptions.splice(
      0,
      processStore.searchProcessNameOptions.length
    );
    registForm.value.processNm = null;
  } else {
    // 공정명 옵션 로드
    handleRegistProcessNameCodeSearch();
  }
};

// 검색 기능 구현
const handleSearch = async () => {
  try {
    // 단위 정보를 processStore에 설정
    if (typeof processStore.setSearchUnit === "function") {
      processStore.setSearchUnit(selectedUnit.value);
    } else {
      console.error("processStore.setSearchUnit 함수가 존재하지 않습니다.");
      return;
    }

    // 검색 시 페이지를 1로 초기화
    processStore.setCurrentPage(1);

    await processStore.searchProcesses();
  } catch (error: any) {
    const errorMessage = translateMessage(
      error?.message,
      "messages.error.searchFailed"
    );
    alert(errorMessage);
  }
};

// 중분류 코드 로드
const handleSubCategoryCode = async () => {
  try {
    if (processStore.searchProcessType) {
      await processStore.loadSubCategoryCodesSilent(
        processStore.searchProcessType
      );
    }
  } catch (error: any) {
    const errorMessage = error?.message || "중분류 코드 로드 실패";
    alert(`중분류 코드 로드 실패: ${errorMessage}`);
  }
};

// 공정명 코드 로드
const handleProcessNameCodeSearch = async () => {
  try {
    if (processStore.searchSubCategoryInput) {
      await processStore.loadProcessNameCodesSilent(
        processStore.searchSubCategoryInput
      );
    }
  } catch (error: any) {
    const errorMessage = error?.message || "공정명 코드 로드 실패";
    alert(`공정명 코드 로드 실패: ${errorMessage}`);
  }
};

// 등록 모달용 중분류 코드 로드
const handleRegistMiddleCodeSearch = async () => {
  try {
    if (registForm.value.processType) {
      await processStore.loadSubCategoryCodesSilent(
        registForm.value.processType
      );
    }
  } catch (error: any) {
    const errorMessage = error?.message || "등록 모달 중분류 코드 로드 실패";
    alert(`등록 모달 중분류 코드 로드 실패: ${errorMessage}`);
  }
};

// 등록 모달용 공정명 코드 로드
const handleRegistProcessNameCodeSearch = async () => {
  try {
    if (registForm.value.processSubCategory) {
      await processStore.loadProcessNameCodesSilent(
        registForm.value.processSubCategory
      );
    }
  } catch (error: any) {
    const errorMessage = error?.message || "등록 모달 공정명 코드 로드 실패";
    alert(`등록 모달 공정명 코드 로드 실패: ${errorMessage}`);
  }
};

onMounted(async () => {
  try {
    // 0. 단위 시스템 옵션 로드 (Pipe.vue와 동일한 방식)
    try {
      await pipeStore.fetchCommonCodes("PIPE_S");
    } catch (error) {
      console.error("단위 시스템 옵션 로드 실패:", error);
    }

    // 0-1. 화면 로드 시 select 박스 선택 초기화
    // 단위 초기화
    selectedUnit.value = "";
    if (typeof processStore.setSearchUnit === "function") {
      processStore.setSearchUnit("");
    }

    // 공정구분 초기화
    if (typeof processStore.setSearchProcessType === "function") {
      processStore.setSearchProcessType(null);
    }

    // 공정 중분류 초기화
    if (typeof processStore.setSearchSubCategoryInput === "function") {
      processStore.setSearchSubCategoryInput(null);
      // 중분류 옵션도 초기화
      processStore.searchSubCategoryOptions.splice(
        0,
        processStore.searchSubCategoryOptions.length
      );
    }

    // 공정명 초기화
    if (typeof processStore.setSearchProcessName === "function") {
      processStore.setSearchProcessName(null);
      // 공정명 옵션도 초기화
      processStore.searchProcessNameOptions.splice(
        0,
        processStore.searchProcessNameOptions.length
      );
    }

    // 1. 초기 공정구분 옵션 로드
    try {
      await processStore.loadProcessTypeCodes();
    } catch (error) {
      console.error("공정구분 옵션 로드 실패:", error);
    }

    // 2. 화면 로드 시 초기 검색 수행하여 표에 데이터 표시
    try {
      await processStore.searchProcesses();
    } catch (error) {
      console.error("초기 검색 실패:", error);
    }

    // 3. 컴포넌트 마운트 완료 표시
    isComponentMounted.value = true;
  } catch (error) {
    console.error("Process.vue 초기화 중 오류 발생:", error);
    // 오류가 발생해도 컴포넌트는 마운트된 것으로 표시
    isComponentMounted.value = true;
  }
});
</script>

<style scoped lang="scss">
@use "sass:color";

.process-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
  padding: 40px 24px;

  @media (max-width: 768px) {
    padding: 40px 0;
  }
}

.action-bar {
  flex-shrink: 0;
  margin-bottom: 20px;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}

.pagination-container {
  flex-shrink: 0;
  margin-top: 10px;
}

:deep(.process-page .data-table) {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;

  table {
    min-width: 100%;
  }
}

:deep(.process-page .data-table .table-header) {
  background-color: $background-light;
}

:deep(.process-page .data-table .table-header .header-cell:hover) {
  background-color: $background-light;
  color: inherit;
}

:deep(.process-page .data-table .table-body tr:nth-child(even)) {
  background-color: #f8f9fb;
}

// 공정심볼 텍스트 스타일
.symbol-text {
  font-size: 12px;
  color: #495057;
  font-family: monospace;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.process-3d-page {
  padding: $spacing-lg;
}

// ProcessDetail 모달 스타일
.detail-modal-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.detail-modal-container {
  display: flex;
  flex-direction: column;
  min-width: 1200px;
  max-width: 95vw;
  min-height: 600px;
  max-height: 80vh;
  overflow: auto;
  padding: 20px 10px 16px 20px;
  background-color: #ffffff;
}

.detail-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 10px 0 0;
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

  .process-page {
    padding: 0;
    height: auto;
    overflow: visible;

    // 팝업 모드에서 스크롤바 강제 표시
    &.popup-mode {
      overflow: visible;

      // 하위 요소들도 스크롤바 설정
      .action-bar,
      .tab-action-bar,
      .tab-content {
        max-height: none;
        overflow: visible;
      }

      // 탭 컨텐츠 영역 스크롤바 설정
      .tab-content .content {
        max-height: none;
        overflow: visible;
      }
    }
  }
}

// 공정심볼 행 스타일
.process-symbol-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3.5rem;

  .file-name-input {
    flex: 1;
    max-width: 400px;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    font-size: 0.95rem;
    height: 48px;
  }
}

// 파일 첨부 영역 스타일
.file-attachment-section {
  font-weight: bold;
  color: #333;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.file-attachment-area {
  margin-top: 0.5rem;

  .attachment-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
    min-width: 1100px;

    .attachment-column {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 2rem;
      background-color: #f9f9f9;
      min-height: 200px;
      min-width: 320px;

      .attachment-header {
        margin-bottom: 1rem;

        .attachment-title {
          font-weight: bold;
          color: #333;
          font-size: 0.9rem;

          &.essential::after {
            content: " *";
            color: #dc3545;
            font-weight: bold;
          }
        }
      }

      .file-input-row {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.5rem;

        .file-name-input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
          font-size: 0.875rem;
        }
      }

      .attached-files-list {
        .file-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;

          .file-number {
            width: 24px;
            text-align: center;
            font-weight: bold;
            color: #666;
            font-size: 0.875rem;
          }

          .file-name {
            flex: 1;
            font-size: 0.875rem;

            &.error-file {
              color: #dc3545;
              font-weight: bold;
            }
          }

          .file-delete-btn {
            width: 24px;
            height: 24px;
            border: none;
            background-color: #6c757d;
            color: white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
              background-color: #5a6268;
            }

            &.error-delete {
              background-color: #dc3545;

              &:hover {
                background-color: #c82333;
              }
            }
          }
        }
      }
    }
  }
}

// 새로운 등록 모달 스타일
.large-modal {
  max-width: 90vw;
  max-height: 90vh;
  width: 1200px;
}

.form-section {
  margin-bottom: 2rem;

  .form-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    .form-group {
      flex: 1;
      min-width: 200px;

      label {
        display: block;
        font-weight: 500;
        color: #333;

        &.essential::after {
          content: " (*)";
          color: #dc3545;
          font-weight: bold;
        }
      }

      .form-select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
        font-size: 0.875rem;
      }
    }
  }
}

.file-upload-section {
  margin-bottom: 2rem;

  h4 {
    margin-bottom: 1rem;
    font-weight: 600;
    color: #333;
  }

  .grid-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .file-upload-table {
    overflow-x: auto;

    .upload-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      th,
      td {
        padding: 0.75rem;
        border: 1px solid #ddd;
        text-align: left;
        vertical-align: middle;
      }

      th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #333;
      }

      .alternate-row {
        background-color: #f8f9fa;
      }

      .file-selection-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .file-info {
          .selected-file {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.5rem;
            background-color: #e9ecef;
            border-radius: 4px;
            font-size: 0.8rem;

            .clear-file {
              border: none;
              background: none;
              color: #dc3545;
              cursor: pointer;
              font-size: 1rem;
              padding: 0;
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;

              &:hover {
                background-color: #dc3545;
                color: white;
                border-radius: 50%;
              }
            }
          }

          .no-file {
            color: #6c757d;
            font-style: italic;
            font-size: 0.8rem;
          }
        }
      }
    }
  }
}

// 공정심볼 파일 입력 그룹 스타일 (ProcessDetail.vue와 동일)
.file-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-file {
  color: #007bff;
  font-size: 13px;
  flex: 1;
}
</style>
