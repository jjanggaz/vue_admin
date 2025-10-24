<template>
  <div class="inflow">
    <div class="page-content">
      <div class="action-bar tab-action-bar">
        <div class="swiper-bar">
          <div class="tabs-wrapper">
            <button
              class="btn-scroll left"
              :disabled="!canScrollLeft"
              @click="scrollTabs(-1)"
            >
              <img
                src="/images/icons/leftArrow.svg"
                alt="t('common.previous')"
              />
            </button>
            <div class="tabs" ref="tabsContainer" @scroll="updateScrollButtons">
              <div
                v-for="(tab, idx) in tabs"
                :key="tab.flow_type_id || tab.name"
                :class="['tab', { active: activeTab === idx }]"
                :style="{
                  backgroundColor: tab.symbol_color || '#f0f0f0',
                  color: getTextColor(tab.symbol_color || '#f0f0f0'),
                }"
                @click="onTabClick(idx)"
                :title="tab.flow_type_code ? tab.flow_type_code : tab.name"
              >
                {{ tab.name }}
              </div>
            </div>
            <button
              class="btn-scroll right"
              :disabled="!canScrollRight"
              @click="scrollTabs(1)"
            >
              <img src="/images/icons/rightArrow.svg" alt="t('common.next')" />
            </button>
          </div>
        </div>

        <div class="tab-buttons">
          <div class="btns">
            <button class="btn btn-create" @click="openModal">
              {{ t("inflow.registerNew") }}
            </button>
            <button class="btn btn-update" @click="openUpdateModal">
              {{ t("inflow.update") }}
            </button>
            <button
              class="btn btn-code-management"
              @click="openCodeManagementModal"
            >
              {{ t("inflow.codeManagement") }}
            </button>
          </div>
        </div>
      </div>

      <div class="tab-content">
        <div class="content-wrapper">
          <div class="tab-content-metric">
            <div class="section-header">
              <h3>Metric</h3>
            </div>
            <div v-if="activeTab >= 0" class="content">
              <DataTable
                :columns="gridColumns"
                :data="currentMetricGridData"
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template
                  #cell-item="{ item, index }: { item: GridRow, index: number }"
                >
                  <select
                    v-if="item.parameter_name === ''"
                    v-model="item.parameter_code"
                    @change="
                      onParameterSelect(item.parameter_code, index, true, false)
                    "
                    class="form-input"
                  >
                    <option value="">{{ t("common.select") }}</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.parameter_name }}</span>
                </template>
                <template #cell-is_active="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_active" disabled />
                </template>
                <template #cell-is_required="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_required" disabled />
                </template>
              </DataTable>

              <div class="action-bar">
                <div class="title">
                  <h4>{{ t("inflow.formulaList") }}</h4>
                </div>
                <div class="btns">
                  <button class="btn btn-add" @click="deleteMetricFormula">
                    {{ t("inflow.delete") }}
                  </button>
                </div>
              </div>

              <DataTable
                :columns="gridColumns2"
                :data="currentGridData2"
                maxHeight="300px"
                :stickyHeader="true"
                :selectable="true"
                selectionMode="single"
                :showSelectAll="false"
                :selectedItems="selectedMetricFormula"
                @selection-change="onMetricFormulaSelectionChange"
              />
            </div>
          </div>

          <div class="tab-content-imperial">
            <div class="section-header">
              <h3>Imperial</h3>
            </div>
            <div v-if="activeTab >= 0" class="content">
              <DataTable
                :columns="gridColumns"
                :data="currentImperialGridData"
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template
                  #cell-item="{ item, index }: { item: GridRow, index: number }"
                >
                  <select
                    v-if="item.parameter_name === ''"
                    v-model="item.parameter_code"
                    @change="
                      onParameterSelect(
                        item.parameter_code,
                        index,
                        false,
                        false
                      )
                    "
                    class="form-input"
                  >
                    <option value="">{{ t("common.select") }}</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.parameter_name }}</span>
                </template>
                <template #cell-is_active="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_active" disabled />
                </template>
                <template #cell-is_required="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_required" disabled />
                </template>
              </DataTable>

              <div class="action-bar">
                <div class="title">
                  <h4>{{ t("inflow.formulaList") }}</h4>
                </div>
                <div class="btns">
                  <button class="btn btn-add" @click="deleteImperialFormula">
                    {{ t("inflow.delete") }}
                  </button>
                </div>
              </div>

              <DataTable
                :columns="gridColumns2"
                :data="currentImperialGridData2"
                maxHeight="300px"
                :stickyHeader="true"
                :selectable="true"
                selectionMode="single"
                :showSelectAll="false"
                :selectedItems="selectedImperialFormula"
                @selection-change="onImperialFormulaSelectionChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 신규등록 -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t("inflow.registerNew") }}</h3>
          <button class="close-btn" @click="closeModal" aria-label="Close">
            ×
          </button>
        </div>
        <div class="modal-body">
          <!-- 첫 번째 줄: 유입종류명 국문, 유입종류명 영문, 비고 -->
          <dl class="column-regist">
            <dt class="essential">{{ t("inflow.typeNameKo") }}</dt>
            <dd>
              <select
                v-model="selectedInputType"
                @change="onInputTypeChange"
                class="form-input"
                required
              >
                <option value="">선택</option>
                <option
                  v-for="code in inflowStore.commonCodes"
                  :key="code.code_id"
                  :value="code.code_key"
                >
                  {{ code.code_value }}
                </option>
              </select>
            </dd>
            <dt class="essential">{{ t("inflow.typeNameEn") }}</dt>
            <dd>
              <input
                type="text"
                v-model="newInflowTypeNameEn"
                :placeholder="t('placeholder.inflowTypeName')"
                class="form-input"
                readonly
                disabled
              />
            </dd>
            <dt>{{ t("common.etc") }}</dt>
            <dd>
              <input
                type="text"
                v-model="uploadForm.title"
                class="form-input"
              />
            </dd>
          </dl>
          <!-- 두 번째 줄: 심볼색상, 파일 업로드 -->
          <dl class="column-regist">
            <dt>{{ t("inflow.symbolColor") }}</dt>
            <dd>
              <div class="color-picker-container">
                <input
                  type="color"
                  v-model="selectedColor"
                  class="color-input"
                  @change="updateColor"
                />
                <span class="color-text">{{ selectedColor }}</span>
              </div>
            </dd>
            <dt>{{ t("common.fileUpload") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  :value="
                    uploadForm.file
                      ? uploadForm.file.name
                      : uploadForm.existingFileName || ''
                  "
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                  class="file-name-input"
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileUpload"
                    accept=".svg"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
            <dt>{{ t("common.symbolImage") }}</dt>
            <dd>
              <div class="symbol-image-preview">
                <span v-if="!symbolImageContent" class="no-symbol-message">{{
                  t("common.noAttachedSymbolImage")
                }}</span>
                <div v-else v-html="symbolImageContent"></div>
              </div>
            </dd>
          </dl>

          <div class="modal-content-wrapper">
            <div class="modal-tab-content-metric">
              <div class="section-header">
                <h3>Metric</h3>
              </div>
              <dl class="column-regist">
                <dt class="essential">{{ t("inflow.uploadFormula") }}</dt>
                <dd>
                  <div class="file-upload-row" id="metricFileUpload">
                    <input
                      type="text"
                      :value="metricFileName || ''"
                      :placeholder="t('placeholder.selectFile')"
                      readonly
                      class="file-name-input"
                    />
                    <label class="file-select-btn">
                      {{ t("common.selectFile") }}
                      <input
                        type="file"
                        @change="handleMetricFileUpload"
                        accept=".py"
                        style="display: none"
                      />
                    </label>
                  </div>
                </dd>
              </dl>

              <DataTable
                :columns="gridColumns"
                :data="
                  metricFileData.length > 0 ? metricFileData : currentGridData
                "
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template
                  #cell-item="{ item, index }: { item: GridRow, index: number }"
                >
                  <select
                    v-if="item.parameter_name === ''"
                    v-model="item.parameter_code"
                    @change="
                      onParameterSelect(item.parameter_code, index, true, true)
                    "
                    class="form-input"
                  >
                    <option value="">{{ t("common.select") }}</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.parameter_name }}</span>
                </template>
                <template #cell-is_active="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_active" />
                </template>
                <template #cell-is_required="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_required" />
                </template>
              </DataTable>
            </div>

            <div class="modal-tab-content-imperial">
              <div class="section-header">
                <h3>Imperial</h3>
              </div>
              <dl class="column-regist">
                <dt class="essential">{{ t("inflow.uploadFormula") }}</dt>
                <dd>
                  <div class="file-upload-row" id="imperialFileUpload">
                    <input
                      type="text"
                      :value="imperialFileName || ''"
                      :placeholder="t('placeholder.selectFile')"
                      readonly
                      class="file-name-input"
                    />
                    <label class="file-select-btn">
                      {{ t("common.selectFile") }}
                      <input
                        type="file"
                        @change="handleImperialFileUpload"
                        accept=".py"
                        style="display: none"
                      />
                    </label>
                  </div>
                </dd>
              </dl>

              <DataTable
                :columns="gridColumns"
                :data="
                  isImperialFileAttached ? imperialFileData : currentGridData
                "
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template
                  #cell-item="{ item, index }: { item: GridRow, index: number }"
                >
                  <select
                    v-if="item.parameter_name === ''"
                    v-model="item.parameter_code"
                    @change="
                      onParameterSelect(item.parameter_code, index, false, true)
                    "
                    class="form-input"
                  >
                    <option value="">{{ t("common.select") }}</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.parameter_name }}</span>
                </template>
                <template #cell-is_active="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_active" />
                </template>
                <template #cell-is_required="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_required" />
                </template>
              </DataTable>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeModal">
            {{ t("common.cancel") }}
          </button>
          <button
            class="btn btn-confirm"
            @click="createNewTab"
            :disabled="isCreating"
          >
            {{ isCreating ? t("common.processing") : t("common.register") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal 수정 -->
    <div
      v-if="isUpdateModalOpen"
      class="modal-overlay"
      @click="closeUpdateModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t("inflow.update") }}</h3>
          <button
            class="close-btn"
            @click="closeUpdateModal"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <!-- 첫 번째 줄: 유입종류명 국문, 유입종류명 영문, 비고 -->
          <dl class="column-regist">
            <dt class="essential">{{ t("inflow.typeNameKo") }}</dt>
            <dd>
              <select
                v-model="selectedInputType"
                @change="onInputTypeChange"
                class="form-input"
                required
                disabled
              >
                <option value="">선택</option>
                <option
                  v-for="code in inflowStore.commonCodes"
                  :key="code.code_id"
                  :value="code.code_key"
                >
                  {{ code.code_value }}
                </option>
              </select>
            </dd>
            <dt class="essential">{{ t("inflow.typeNameEn") }}</dt>
            <dd>
              <input
                type="text"
                v-model="newInflowTypeNameEn"
                :placeholder="t('placeholder.inflowTypeName')"
                class="form-input"
                readonly
                disabled
              />
            </dd>
            <dt>{{ t("common.etc") }}</dt>
            <dd>
              <input
                type="text"
                v-model="uploadForm.title"
                class="form-input"
              />
            </dd>
          </dl>
          <!-- 두 번째 줄: 심볼색상, 파일 업로드, 심볼이미지 -->
          <dl class="column-regist">
            <dt>{{ t("inflow.symbolColor") }}</dt>
            <dd>
              <div class="color-picker-container">
                <input
                  type="color"
                  v-model="selectedColor"
                  class="color-input"
                  @change="updateColor"
                />
                <span class="color-text">{{ selectedColor }}</span>
              </div>
            </dd>
            <dt>{{ t("common.fileUpload") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  :value="
                    uploadForm.file
                      ? uploadForm.file.name
                      : uploadForm.existingFileName || ''
                  "
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                  class="file-name-input"
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileUpload"
                    accept=".svg"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
            <dt>{{ t("common.symbolImage") }}</dt>
            <dd>
              <div class="symbol-image-preview">
                <span v-if="!symbolImageContent" class="no-symbol-message">
                  {{ t("common.noSymbolImage") }}
                </span>
              </div>
            </dd>
          </dl>

          <div class="modal-content-wrapper">
            <div class="modal-tab-content-metric">
              <div class="section-header">
                <h3>Metric</h3>
              </div>
              <dl class="column-regist">
                <dt class="essential">{{ t("inflow.uploadFormula") }}</dt>
                <dd>
                  <div class="file-upload-row" id="updateMetricFileUpload">
                    <input
                      type="text"
                      :value="metricFileName || ''"
                      :placeholder="t('placeholder.selectFile')"
                      readonly
                      class="file-name-input"
                    />
                    <label class="file-select-btn">
                      {{ t("common.selectFile") }}
                      <input
                        type="file"
                        @change="handleMetricFileUpload"
                        accept=".py"
                        style="display: none"
                      />
                    </label>
                  </div>
                </dd>
              </dl>

              <DataTable
                :columns="gridColumns"
                :data="
                  isMetricFileAttached ? metricFileData : currentMetricGridData
                "
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template
                  #cell-item="{ item, index }: { item: GridRow, index: number }"
                >
                  <select
                    v-if="item.parameter_name === ''"
                    v-model="item.parameter_code"
                    @change="
                      onParameterSelect(item.parameter_code, index, true, true)
                    "
                    class="form-input"
                  >
                    <option value="">{{ t("common.select") }}</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.parameter_name }}</span>
                </template>
                <template #cell-is_active="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_active" />
                </template>
                <template #cell-is_required="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_required" />
                </template>
              </DataTable>
            </div>

            <div class="modal-tab-content-imperial">
              <div class="section-header">
                <h3>Imperial</h3>
              </div>
              <dl class="column-regist">
                <dt class="essential">{{ t("inflow.uploadFormula") }}</dt>
                <dd>
                  <div class="file-upload-row" id="updateImperialFileUpload">
                    <input
                      type="text"
                      :value="imperialFileName || ''"
                      :placeholder="t('placeholder.selectFile')"
                      readonly
                      class="file-name-input"
                    />
                    <label class="file-select-btn">
                      {{ t("common.selectFile") }}
                      <input
                        type="file"
                        @change="handleImperialFileUpload"
                        accept=".py"
                        style="display: none"
                      />
                    </label>
                  </div>
                </dd>
              </dl>

              <DataTable
                :columns="gridColumns"
                :data="
                  isImperialFileAttached
                    ? imperialFileData
                    : currentImperialGridData
                "
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template
                  #cell-item="{ item, index }: { item: GridRow, index: number }"
                >
                  <select
                    v-if="item.parameter_name === ''"
                    v-model="item.parameter_code"
                    @change="
                      onParameterSelect(item.parameter_code, index, false, true)
                    "
                    class="form-input"
                  >
                    <option value="">{{ t("common.select") }}</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.parameter_name }}</span>
                </template>
                <template #cell-is_active="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_active" />
                </template>
                <template #cell-is_required="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_required" />
                </template>
              </DataTable>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeUpdateModal">
            {{ t("common.cancel") }}
          </button>
          <button
            class="btn btn-confirm"
            @click="updateTab"
            :disabled="isUpdating"
          >
            {{ isUpdating ? t("common.processing") : t("common.update") }}
          </button>
        </div>
      </div>
    </div>

    <!-- 코드 관리 모달 -->
    <div
      v-if="isCodeManagementModalOpen"
      class="modal-overlay"
      @click="closeCodeManagementModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ t("inflow.codeManagement") }}</h3>
          <button
            class="close-btn"
            @click="closeCodeManagementModal"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <WaterCodeManagement :flowDirection="'INFLUENT'" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeCodeManagementModal">
            {{ t("common.close") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted, onBeforeUnmount } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useI18n } from "vue-i18n";
import { useInflowStore } from "@/stores/inflow";
import WaterCodeManagement from "./components/WaterCodeManagement.vue";

const { t } = useI18n();
const inflowStore = useInflowStore();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = (
  message: string | undefined,
  fallbackKey: string
): string => {
  if (!message) return t(fallbackKey);
  return message.startsWith("messages.") ? t(message) : message;
};
const newInflowTypeName = ref("");
const newInflowTypeNameEn = ref("");
const selectedInputType = ref(""); // 선택된 유입종류 코드

// 색상 선택 관련 상태
const selectedColor = ref("#3b82f6"); // 기본 파란색
const showColorPicker = ref(false);
const symbolImageContent = ref(""); // 심볼 이미지 콘텐츠

// 로딩 상태
const isCreating = ref(false);
const isUpdating = ref(false);

// 컴포넌트 마운트 시 유입종류 데이터 로드
onMounted(async () => {
  await loadWaterFlowTypes();
  await loadInputTypes(); // 공통코드 로드 추가
  await loadWaterQualityParameters(); // 수질 파라미터 로드 추가
  // 초기 렌더 후 스크롤 버튼 상태 계산 및 리사이즈 관찰 시작
  nextTick(() => {
    updateScrollButtons();
    if (tabsContainer.value && "ResizeObserver" in window) {
      resizeObserver.value = new ResizeObserver(() => {
        updateScrollButtons();
      });
      resizeObserver.value.observe(tabsContainer.value);
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
  });
});

// 유입 종류 공통코드 로드
const loadInputTypes = async () => {
  try {
    await inflowStore.fetchCommonCodes("INPUT_TYPE", "IN_TYPE", true);
  } catch (error) {
    console.error("유입 종류 공통코드 로드 실패:", error);
  }
};

// 수질 파라미터 로드
const loadWaterQualityParameters = async () => {
  try {
    if (typeof inflowStore.fetchWaterQualityParameters !== "function") {
      console.error("fetchWaterQualityParameters가 함수가 아닙니다!");

      return;
    }

    await inflowStore.fetchWaterQualityParameters("INFLUENT");
  } catch (error) {
    console.error("수질 파라미터 로드 실패:", error);
  }
};

// 유입종류 선택 변경 시 영문명 자동 입력
const onInputTypeChange = () => {
  if (selectedInputType.value && inflowStore.commonCodes.length > 0) {
    const selectedCode = inflowStore.commonCodes.find(
      (code) => code.code_key === selectedInputType.value
    );
    if (selectedCode) {
      newInflowTypeName.value = selectedCode.code_value; // 한글명 설정
      newInflowTypeNameEn.value = selectedCode.code_value_en; // 영문명 설정
    }
  } else {
    newInflowTypeName.value = "";
    newInflowTypeNameEn.value = "";
  }
};

interface GridRow {
  id: number;
  mapping_id: string;
  parameter_id: string;
  parameter_name: string; // item을 parameter_name으로 변경
  parameter_code: string;
  influent: number;
  unit: string;
  is_active: boolean;
  is_required: boolean;
  remarks: string;
}

interface TabInfo {
  name: string;
  flow_type_id?: string; // 데이터베이스 ID 추가
  flow_type_code?: string; // 코드 추가
  symbol_color?: string; // 심볼 색상 추가
}

interface GridRow2 {
  id: number; // 순번
  formula_id: string; // 삭제 시 사용할 formula_id
  formula: string; // formula_name 표시
  uploadDate: string; // created_at을 YYYY-MM-DD 형태로 변환
  created_at: string; // 원본 created_at (비교용)
  isLatest: boolean; // 가장 최근 업로드된 항목인지 여부
}

interface UploadForm {
  title: string;
  category: string;
  file: File | null;
  existingFileName?: string; // 기존 파일명 표시용
}

const uploadForm = ref<UploadForm>({
  title: "",
  category: "",
  file: null,
});

// 데이터베이스에서 가져온 탭 데이터
const tabs = ref<TabInfo[]>([]);
const isLoadingTabs = ref(true);

const activeTab = ref(0);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const tabsContainer = ref<HTMLElement | null>(null);
const resizeObserver = ref<ResizeObserver | null>(null);
const selectedMetricFormulaId = ref<string | null>(null);
const selectedImperialFormulaId = ref<string | null>(null);
const handleResize = () => {
  nextTick(() => updateScrollButtons());
};

// Metric 계산식 선택 변경 핸들러
const onMetricFormulaSelectionChange = (selectedItems: GridRow2[]) => {
  if (selectedItems.length > 0) {
    selectedMetricFormulaId.value = selectedItems[0].formula_id;
  } else {
    selectedMetricFormulaId.value = null;
  }
};

// Imperial 계산식 선택 변경 핸들러
const onImperialFormulaSelectionChange = (selectedItems: GridRow2[]) => {
  if (selectedItems.length > 0) {
    selectedImperialFormulaId.value = selectedItems[0].formula_id;
  } else {
    selectedImperialFormulaId.value = null;
  }
};

// Metric 계산식 삭제 함수
const deleteMetricFormula = async () => {
  if (!selectedMetricFormulaId.value) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  // 선택된 항목이 최신 항목인지 확인
  const selectedItem = currentGridData2.value.find(
    (item) => item.formula_id === selectedMetricFormulaId.value
  );
  if (selectedItem?.isLatest) {
    alert(t("messages.warning.cannotDeleteLatestFormula"));
    return;
  }

  if (confirm(t("messages.confirm.deleteMetricFormula"))) {
    try {
      await inflowStore.deleteFormula(selectedMetricFormulaId.value);

      // 삭제 성공 시 현재 탭의 데이터 다시 로드
      const currentTab = tabs.value[activeTab.value];
      if (currentTab && currentTab.flow_type_code && currentTab.flow_type_id) {
        await loadWaterFlowTypeParameters(
          currentTab.flow_type_code,
          currentTab.flow_type_id
        );
      }

      // 선택 초기화
      selectedMetricFormulaId.value = null;

      alert(t("messages.success.metricFormulaDeleteSuccess"));
    } catch (error) {
      console.error("Metric 계산식 삭제 실패:", error);
      const errorMessage = translateMessage(
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : undefined,
        "messages.error.formulaDeleteFailed"
      );
      alert(errorMessage);
    }
  }
};

// Imperial 계산식 삭제 함수
const deleteImperialFormula = async () => {
  if (!selectedImperialFormulaId.value) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }

  // 선택된 항목이 최신 항목인지 확인
  const selectedItem = currentImperialGridData2.value.find(
    (item) => item.formula_id === selectedImperialFormulaId.value
  );
  if (selectedItem?.isLatest) {
    alert(t("messages.warning.cannotDeleteLatestFormula"));
    return;
  }

  if (confirm(t("messages.confirm.deleteImperialFormula"))) {
    try {
      await inflowStore.deleteFormula(selectedImperialFormulaId.value);

      // 삭제 성공 시 현재 탭의 데이터 다시 로드
      const currentTab = tabs.value[activeTab.value];
      if (currentTab && currentTab.flow_type_code && currentTab.flow_type_id) {
        await loadWaterFlowTypeParameters(
          currentTab.flow_type_code,
          currentTab.flow_type_id
        );
      }

      // 선택 초기화
      selectedImperialFormulaId.value = null;

      alert(t("messages.success.imperialFormulaDeleteSuccess"));
    } catch (error) {
      console.error("Imperial 계산식 삭제 실패:", error);
      const errorMessage = translateMessage(
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : undefined,
        "messages.error.formulaDeleteFailed"
      );
      alert(errorMessage);
    }
  }
};

// 유입종류별 파라미터 데이터 로드
const loadWaterFlowTypeParameters = async (
  flowTypeCode: string,
  flowTypeId: string
) => {
  try {
    // 유입종류별 파라미터 조회
    await inflowStore.fetchWaterFlowTypeParameters(
      "INFLUENT",
      flowTypeCode,
      flowTypeId
    );

    // 조회된 파라미터를 그리드 데이터로 변환
    if (inflowStore.waterFlowTypeParameters) {
      const metricParams: GridRow[] = [];
      const imperialParams: GridRow[] = [];

      // Metric 파라미터 처리
      if (
        inflowStore.waterFlowTypeParameters.metric &&
        Array.isArray(inflowStore.waterFlowTypeParameters.metric)
      ) {
        inflowStore.waterFlowTypeParameters.metric.forEach((param) => {
          const gridRow: GridRow = {
            id: 0, // 나중에 재정렬
            mapping_id: param.mapping_id,
            parameter_id: param.parameter_id || "",
            parameter_name: param.parameter_name,
            parameter_code: param.parameter_code,
            influent: parseFloat(String(param.default_value || 0)) || 0,
            unit: param.parameter_unit || "",
            is_active: !!param.is_active,
            is_required: !!param.is_required,
            remarks: param.remarks || "",
          };
          metricParams.push(gridRow);
        });
      }

      // Imperial 파라미터 처리
      if (
        inflowStore.waterFlowTypeParameters.imperial &&
        Array.isArray(inflowStore.waterFlowTypeParameters.imperial)
      ) {
        inflowStore.waterFlowTypeParameters.imperial.forEach((param) => {
          const gridRow: GridRow = {
            id: 0, // 나중에 재정렬
            mapping_id: param.mapping_id,
            parameter_id: param.parameter_id || "",
            parameter_name: param.parameter_name,
            parameter_code: param.parameter_code,
            influent: parseFloat(String(param.default_value || 0)) || 0,
            unit: param.parameter_unit || "",
            is_active: !!param.is_active,
            is_required: !!param.is_required,
            remarks: param.remarks || "",
          };
          imperialParams.push(gridRow);
        });
      }

      // ID 재정렬
      metricParams.forEach((item, index) => {
        item.id = index + 1;
      });

      imperialParams.forEach((item, index) => {
        item.id = index + 1;
      });

      // Metric과 Imperial 데이터를 각각 저장
      metricTabGridData.value[activeTab.value] = metricParams;
      imperialTabGridData.value[activeTab.value] = imperialParams;

      // Metric 계산식 데이터 처리
      if (
        inflowStore.waterFlowTypeParameters.metric_formulas?.data?.formulas &&
        Array.isArray(
          inflowStore.waterFlowTypeParameters.metric_formulas.data.formulas
        )
      ) {
        const formulas =
          inflowStore.waterFlowTypeParameters.metric_formulas.data.formulas;

        // created_at 기준으로 정렬하여 가장 최근 항목 찾기
        const sortedFormulas = [...formulas].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestCreatedAt = sortedFormulas[0]?.created_at;

        const metricFormulas: GridRow2[] = formulas.map((formula, index) => ({
          id: index + 1, // 순번
          formula_id: formula.formula_id, // 삭제 시 사용할 formula_id
          formula: formula.formula_name,
          uploadDate: new Date(formula.created_at)
            .toLocaleString("sv-SE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(",", ""), // YYYY-MM-DD HH:mm 형태로 변환 (24시간)
          created_at: formula.created_at, // 원본 created_at
          isLatest: formula.created_at === latestCreatedAt, // 가장 최근 항목인지 여부
        }));
        tabGridData2.value[activeTab.value] = metricFormulas;
      } else {
        tabGridData2.value[activeTab.value] = [];
      }

      // Imperial 계산식 데이터 처리
      if (
        inflowStore.waterFlowTypeParameters.imperial_formulas?.data?.formulas &&
        Array.isArray(
          inflowStore.waterFlowTypeParameters.imperial_formulas.data.formulas
        )
      ) {
        const formulas =
          inflowStore.waterFlowTypeParameters.imperial_formulas.data.formulas;

        // created_at 기준으로 정렬하여 가장 최근 항목 찾기
        const sortedFormulas = [...formulas].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const latestCreatedAt = sortedFormulas[0]?.created_at;

        const imperialFormulas: GridRow2[] = formulas.map((formula, index) => ({
          id: index + 1, // 순번
          formula_id: formula.formula_id, // 삭제 시 사용할 formula_id
          formula: formula.formula_name,
          uploadDate: new Date(formula.created_at)
            .toLocaleString("sv-SE", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(",", ""), // YYYY-MM-DD HH:mm 형태로 변환 (24시간)
          created_at: formula.created_at, // 원본 created_at
          isLatest: formula.created_at === latestCreatedAt, // 가장 최근 항목인지 여부
        }));
        imperialTabGridData2.value[activeTab.value] = imperialFormulas;
      } else {
        imperialTabGridData2.value[activeTab.value] = [];
      }
    } else {
      // 파라미터가 없으면 빈 배열
      metricTabGridData.value[activeTab.value] = [];
      imperialTabGridData.value[activeTab.value] = [];
    }
  } catch (error) {
    console.error("파라미터 데이터 로드 실패:", error);

    // 에러 발생 시 빈 배열
    tabGridData.value[activeTab.value] = [];
  }
};

// 유입종류 데이터 로드
const loadWaterFlowTypes = async () => {
  try {
    isLoadingTabs.value = true;

    // 유입종류 목록 조회
    await inflowStore.fetchWaterFlowTypes("INFLUENT");

    // 조회된 데이터를 탭 형태로 변환
    if (inflowStore.waterFlowTypes && inflowStore.waterFlowTypes.length > 0) {
      tabs.value = inflowStore.waterFlowTypes.map((waterFlowType) => ({
        name: waterFlowType.flow_type_name,
        flow_type_id: waterFlowType.flow_type_id,
        flow_type_code: waterFlowType.flow_type_code,
        symbol_color: waterFlowType.symbol_info?.symbol_color,
      }));
    } else {
      // 데이터가 없으면 기본 탭 설정
      tabs.value = [{ name: t("placeholder.noData") }];
    }

    // 첫 번째 탭을 활성화하고 파라미터 로드
    if (tabs.value.length > 0) {
      activeTab.value = 0;

      // 첫 번째 탭의 파라미터도 로드
      const firstTab = tabs.value[0];
      if (firstTab && firstTab.flow_type_code && firstTab.flow_type_id) {
        await loadWaterFlowTypeParameters(
          firstTab.flow_type_code,
          firstTab.flow_type_id
        );
      }
    }
  } catch (error) {
    console.error("유입종류 데이터 로드 실패:", error);

    // 에러 발생 시 기본 탭 설정
    tabs.value = [{ name: t("messages.error.loadFailed") }];
  } finally {
    isLoadingTabs.value = false;

    // 스크롤 버튼 상태 업데이트
    nextTick(() => {
      updateScrollButtons();
    });
  }
};

// 모달 관련 상태
const isModalOpen = ref(false);
const isUpdateModalOpen = ref(false);
const isCodeManagementModalOpen = ref(false);
const newTabName = ref("");

// 파일 선택 관련 상태
const metricFileData = ref<GridRow[]>([]);
const imperialFileData = ref<GridRow[]>([]);
const metricFileName = ref<string>("");
const imperialFileName = ref<string>("");
const metricFile = ref<File | null>(null);
const imperialFile = ref<File | null>(null);
const isMetricFileAttached = ref<boolean>(false);
const isImperialFileAttached = ref<boolean>(false);

// 여기2
const gridColumns: TableColumn[] = [
  { key: "id", title: t("columns.inflow.no"), width: "80px" },
  { key: "item", title: t("columns.inflow.item") },
  { key: "influent", title: t("columns.inflow.influent") },
  { key: "unit", title: t("columns.inflow.unit") },
  { key: "is_active", title: t("columns.inflow.active") },
  { key: "is_required", title: t("columns.inflow.isRequired") },
  { key: "remarks", title: t("columns.inflow.remarks") },
];

const gridColumns2: TableColumn[] = [
  { key: "id", title: t("columns.inflow.no"), width: "80px" },
  { key: "formula", title: t("columns.inflow.formula") },
  { key: "uploadDate", title: t("columns.inflow.uploadDate") },
];

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    // 허용된 파일 확장자 체크
    const allowedExtensions = [".svg"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      alert(t("messages.warning.invalidFileType"));
      target.value = ""; // 파일 선택 초기화
      return;
    }

    uploadForm.value.file = file;

    // SVG 미리보기: 파일 내용을 읽어 symbolImageContent에 주입
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = String(reader.result || "");
        // 간단한 검증: '<svg' 태그 포함 여부 확인
        if (result.includes("<svg")) {
          symbolImageContent.value = result;
        } else {
          symbolImageContent.value = "";
        }
      } catch (e) {
        console.error("SVG 미리보기 로드 실패:", e);
        symbolImageContent.value = "";
      }
    };
    reader.onerror = () => {
      console.error("파일 읽기 에러");
      symbolImageContent.value = "";
    };
    reader.readAsText(file);
  }
};

// Metric 파일 업로드 핸들러
const handleMetricFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    // .py 파일인지 확인
    if (!file.name.endsWith(".py")) {
      alert(t("messages.warning.pythonFileOnly"));
      return;
    }

    metricFileName.value = file.name;
    metricFile.value = file; // 파일 저장

    // 파일 첨부 시 즉시 그리드 초기화 및 플래그 설정
    metricFileData.value = [];
    isMetricFileAttached.value = true;

    try {
      // FormData 생성하여 API 호출
      const formData = new FormData();
      formData.append("file", file);
      formData.append("unit_system", "METRIC");

      // API 호출하여 계산식 추출
      const response = await inflowStore.extractFormula(formData);

      console.log("API 응답:", response);

      if (
        response &&
        response.response &&
        response.response.data &&
        response.response.data.input_parameters
      ) {
        const inputParameters = response.response.data.input_parameters;
        const extractedData: GridRow[] = [];
        let idCounter = 1;

        // input_parameters의 각 key(parameter_code)를 waterQualityParameters와 비교
        Object.keys(inputParameters).forEach((parameterCode) => {
          // waterQualityParameters에서 해당 parameter_code를 찾기
          const matchingParameter = inflowStore.waterQualityParameters.find(
            (param) =>
              param.parameter_code.toLowerCase() === parameterCode.toLowerCase()
          );

          if (matchingParameter) {
            const paramData = inputParameters[parameterCode];
            const gridRow: GridRow = {
              id: idCounter++,
              mapping_id: "",
              parameter_id: matchingParameter.parameter_id || "",
              parameter_name: matchingParameter.parameter_name,
              parameter_code: matchingParameter.parameter_code,
              influent: paramData.value || 0,
              unit: paramData.unit || "mg/L", // waterQualityParameters.default_unit 사용할건지 나중에 확인
              is_active: true,
              is_required: false,
              remarks: paramData.description || "",
            };
            extractedData.push(gridRow);
          }
        });

        metricFileData.value = extractedData;
        console.log("Metric 계산식 추출 완료:", extractedData);
      } else {
        // input_parameters가 없어도 이미 빈 배열로 초기화됨
        console.log("input_parameters가 없어서 빈 배열 유지");
      }
    } catch (error) {
      console.error("계산식 추출 에러:", error);
      // 에러 발생 시에도 빈 배열 유지 (이미 초기화됨)
      alert(t("messages.warning.fileReadError"));
    }
  }
};

// Imperial 파일 업로드 핸들러
const handleImperialFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    // .py 파일인지 확인
    if (!file.name.endsWith(".py")) {
      alert(t("messages.warning.pythonFileOnly"));
      return;
    }

    imperialFileName.value = file.name;
    imperialFile.value = file; // 파일 저장

    // 파일 첨부 시 즉시 그리드 초기화 및 플래그 설정
    imperialFileData.value = [];
    isImperialFileAttached.value = true;

    try {
      // FormData 생성하여 API 호출
      const formData = new FormData();
      formData.append("file", file);
      formData.append("unit_system", "IMPERIAL");

      // API 호출하여 계산식 추출
      const response = await inflowStore.extractFormula(formData);

      console.log("API 응답:", response);

      if (
        response &&
        response.response &&
        response.response.data &&
        response.response.data.input_parameters
      ) {
        const inputParameters = response.response.data.input_parameters;
        const extractedData: GridRow[] = [];
        let idCounter = 1;

        // input_parameters의 각 key(parameter_code)를 waterQualityParameters와 비교
        Object.keys(inputParameters).forEach((parameterCode) => {
          // waterQualityParameters에서 해당 parameter_code를 찾기
          const matchingParameter = inflowStore.waterQualityParameters.find(
            (param) =>
              param.parameter_code.toLowerCase() === parameterCode.toLowerCase()
          );

          if (matchingParameter) {
            const paramData = inputParameters[parameterCode];
            const gridRow: GridRow = {
              id: idCounter++,
              mapping_id: "",
              parameter_id: matchingParameter.parameter_id || "",
              parameter_name: matchingParameter.parameter_name,
              parameter_code: matchingParameter.parameter_code,
              influent: paramData.value || 0,
              unit: paramData.unit || "mg/L", // waterQualityParameters.default_unit 사용할건지 나중에 확인
              is_active: true,
              is_required: false,
              remarks: paramData.description || "",
            };
            extractedData.push(gridRow);
          }
        });

        imperialFileData.value = extractedData;
        console.log("Imperial 계산식 추출 완료:", extractedData);
      } else {
        // input_parameters가 없어도 이미 빈 배열로 초기화됨
        console.log("input_parameters가 없어서 빈 배열 유지");
      }
    } catch (error) {
      console.error("계산식 추출 에러:", error);
      // 에러 발생 시에도 빈 배열 유지 (이미 초기화됨)
      alert(t("messages.warning.fileReadError"));
    }
  }
};

// 색상 업데이트 함수
const updateColor = (event: Event) => {
  const target = event.target as HTMLInputElement;
  selectedColor.value = target.value;
  showColorPicker.value = false;
};

// 배경색에 따른 텍스트 색상 계산 함수
const getTextColor = (backgroundColor: string): string => {
  // hex 색상을 RGB로 변환
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // 휘도 계산 (0.299 * R + 0.587 * G + 0.114 * B)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // 휘도가 0.5보다 크면 검은색, 작으면 흰색
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

// 각 탭별 데이터
const tabGridData = ref<{ [key: number]: GridRow[] }>({});

// Metric용 데이터
const metricTabGridData = ref<{ [key: number]: GridRow[] }>({});

// Imperial용 데이터
const imperialTabGridData = ref<{ [key: number]: GridRow[] }>({});

// Imperial 계산식용 데이터
const imperialTabGridData2 = ref<{ [key: number]: GridRow2[] }>({});

// 각 탭별 데이터 복사본을 Metric/Imperial용으로 초기화
Object.keys(tabGridData.value).forEach((key) => {
  const tabKey = parseInt(key);
  metricTabGridData.value[tabKey] = [...tabGridData.value[tabKey]];
  imperialTabGridData.value[tabKey] = [...tabGridData.value[tabKey]];
});

// 수질 파라미터 선택 시 처리 함수
const onParameterSelect = (
  parameterCode: string,
  rowIndex: number,
  isMetric: boolean = true,
  isModal: boolean = false
) => {
  const selectedParameter = inflowStore.waterQualityParameters.find(
    (param) => param.parameter_code === parameterCode
  );

  console.log("선택된 파라미터:", selectedParameter);
  console.log("전체 수질 파라미터 목록:", inflowStore.waterQualityParameters);

  if (selectedParameter) {
    // 선택된 행 업데이트
    const targetData = isModal
      ? isMetric
        ? metricFileData.value
        : imperialFileData.value
      : isMetric
      ? metricTabGridData.value[activeTab.value]
      : imperialTabGridData.value[activeTab.value];

    if (targetData && targetData[rowIndex]) {
      targetData[rowIndex].parameter_name = selectedParameter.parameter_name;
      targetData[rowIndex].parameter_code = selectedParameter.parameter_code; // parameter_code 저장
      targetData[rowIndex].unit = selectedParameter.default_unit;
      // influent 값은 기본값이 있으면 설정, 없으면 0
      targetData[rowIndex].influent = 0;
      targetData[rowIndex].remarks = selectedParameter.description || "";

      console.log("업데이트된 행 데이터:", targetData[rowIndex]);
    }
  }
};

const tabGridData2 = ref<{ [key: number]: GridRow2[] }>({});

// 현재 활성 탭에 따른 데이터 반환
const currentGridData = computed(() => {
  return tabGridData.value[activeTab.value] || [];
});

// Metric 탭 데이터
const currentMetricGridData = computed(() => {
  return metricTabGridData.value[activeTab.value] || [];
});

// Imperial 탭 데이터
const currentImperialGridData = computed(() => {
  return imperialTabGridData.value[activeTab.value] || [];
});

const currentGridData2 = computed(() => {
  return tabGridData2.value[activeTab.value] || [];
});

// Imperial 계산식 데이터
const currentImperialGridData2 = computed(() => {
  return imperialTabGridData2.value[activeTab.value] || [];
});

// 선택된 Metric 계산식
const selectedMetricFormula = computed(() => {
  if (!selectedMetricFormulaId.value) return [];
  const formula = currentGridData2.value.find(
    (item) => item.formula_id === selectedMetricFormulaId.value
  );
  return formula ? [formula] : [];
});

// 선택된 Imperial 계산식
const selectedImperialFormula = computed(() => {
  if (!selectedImperialFormulaId.value) return [];
  const formula = currentImperialGridData2.value.find(
    (item) => item.formula_id === selectedImperialFormulaId.value
  );
  return formula ? [formula] : [];
});

// 모달 관련 함수
const openModal = () => {
  isModalOpen.value = true;
  newTabName.value = "";
  symbolImageContent.value = ""; // 심볼 이미지 콘텐츠 초기화

  // 파일 첨부 플래그 초기화
  isMetricFileAttached.value = false;
  isImperialFileAttached.value = false;
};

const openCodeManagementModal = () => {
  isCodeManagementModalOpen.value = true;
};

const closeCodeManagementModal = () => {
  isCodeManagementModalOpen.value = false;
};

const openUpdateModal = async () => {
  if (activeTab.value < 0 || !tabs.value[activeTab.value]) {
    alert(t("messages.warning.selectTabToEdit"));
    return;
  }

  // 심볼 이미지 콘텐츠 초기화
  symbolImageContent.value = "";

  // 현재 선택된 탭의 정보로 수정 폼 초기화
  const currentTab = tabs.value[activeTab.value];
  if (currentTab) {
    // 현재 탭의 데이터를 폼에 설정
    newInflowTypeName.value = currentTab.name || "";

    // 원본 데이터에서 색상 정보 가져오기
    const originalWaterFlowType = inflowStore.waterFlowTypes.find(
      (wft) => wft.flow_type_id === currentTab.flow_type_id
    );
    selectedColor.value =
      originalWaterFlowType?.symbol_info?.symbol_color || "#3b82f6";
    uploadForm.value.title = originalWaterFlowType?.description || ""; // description을 비고 input에 설정

    // 심볼 파일 정보 조회하여 첨부파일 input에 표시
    if (originalWaterFlowType?.svg_symbol_id) {
      try {
        const fileInfoResponse = await inflowStore.fetchSymbolFileInfo(
          originalWaterFlowType.svg_symbol_id
        );
        if (
          fileInfoResponse?.response?.uploaded_files &&
          fileInfoResponse.response.uploaded_files.length > 0
        ) {
          // uploaded_at 기준으로 정렬하여 가장 최신 파일 찾기
          const latestFile = fileInfoResponse.response.uploaded_files.sort(
            (a: Record<string, unknown>, b: Record<string, unknown>) =>
              new Date(String(b.uploaded_at)).getTime() -
              new Date(String(a.uploaded_at)).getTime()
          )[0];

          // 파일명을 input에 표시하기 위해 별도 상태 추가
          uploadForm.value.existingFileName = latestFile.original_filename;
        }

        // 심볼 이미지 표시를 위한 콘텐츠 저장
        if (fileInfoResponse?.response?.file_info?.response?.content) {
          symbolImageContent.value =
            fileInfoResponse.response.file_info.response.content;
        }
      } catch (error) {
        console.error("파일 정보 조회 실패:", error);
        // 에러가 발생해도 모달은 계속 진행
      }
    }
    // flow_type_code에서 공통코드 찾기
    if (currentTab.flow_type_code && inflowStore.commonCodes.length > 0) {
      const matchedCode = inflowStore.commonCodes.find(
        (code) => code.code_key === currentTab.flow_type_code
      );
      if (matchedCode) {
        selectedInputType.value = matchedCode.code_key;
        newInflowTypeNameEn.value = matchedCode.code_value_en || "";
      }
    }

    // 현재 탭의 Metric과 Imperial 데이터를 수정 폼에 복사
    if (metricTabGridData.value[activeTab.value]) {
      metricFileData.value = [...metricTabGridData.value[activeTab.value]];
    }
    if (imperialTabGridData.value[activeTab.value]) {
      imperialFileData.value = [...imperialTabGridData.value[activeTab.value]];
    }
  }

  // 파일 첨부 플래그 초기화
  isMetricFileAttached.value = false;
  isImperialFileAttached.value = false;

  isUpdateModalOpen.value = true;

  // 모달이 열린 후 SVG 이미지 주입
  nextTick(() => {
    if (symbolImageContent.value) {
      const symbolPreview = document.querySelector(".symbol-image-preview");
      if (symbolPreview) {
        symbolPreview.innerHTML = symbolImageContent.value;
      }
    }
  });
};

const closeModal = () => {
  isModalOpen.value = false;
  // 폼 초기화
  selectedInputType.value = "";
  newInflowTypeName.value = "";
  newInflowTypeNameEn.value = "";
  uploadForm.value.title = "";
  uploadForm.value.file = null; // 파일 첨부 초기화
  uploadForm.value.existingFileName = ""; // 기존 파일명 초기화
  selectedColor.value = "#3b82f6"; // 심볼 색상 초기화
  symbolImageContent.value = ""; // 심볼 이미지 콘텐츠 초기화
  metricFileData.value = [];
  imperialFileData.value = [];
  metricFileName.value = "";
  imperialFileName.value = "";
  metricFile.value = null;
  imperialFile.value = null;
  isMetricFileAttached.value = false;
  isImperialFileAttached.value = false;
};

const closeUpdateModal = () => {
  isUpdateModalOpen.value = false;
  // 수정 폼 초기화
  selectedInputType.value = "";
  newInflowTypeName.value = "";
  newInflowTypeNameEn.value = "";
  uploadForm.value.title = "";
  uploadForm.value.existingFileName = ""; // 기존 파일명 초기화
  selectedColor.value = "#3b82f6"; // 심볼 색상 초기화
  metricFileData.value = [];
  imperialFileData.value = [];
  metricFileName.value = "";
  imperialFileName.value = "";
  metricFile.value = null;
  imperialFile.value = null;
  isMetricFileAttached.value = false;
  isImperialFileAttached.value = false;
};

const createNewTab = async () => {
  if (!selectedInputType.value) {
    alert(t("messages.warning.selectInflowType"));
    return;
  }

  if (!newInflowTypeName.value.trim()) {
    alert(t("messages.warning.enterInflowTypeName"));
    return;
  }

  isCreating.value = true;

  try {
    // Metric 파라미터 데이터 준비 (선택된 파라미터만)
    console.log("원본 metricFileData:", metricFileData.value);

    const metricParameters =
      metricFileData.value.length > 0
        ? metricFileData.value
            .filter((item) => item.parameter_code && item.parameter_code !== "") // 선택된 파라미터만 필터링
            .map((item) => ({
              parameter_code: item.parameter_code, // 저장된 parameter_code 사용
              parameter_name: item.parameter_name,
              is_active: item.is_active,
              is_required: item.is_required,
              default_value: item.influent,
              parameter_unit: item.unit,
              remarks: item.remarks || undefined,
            }))
        : undefined;

    console.log("등록할 Metric 파라미터:", metricParameters);
    metricParameters?.forEach((param, index) => {
      console.log(`Metric 파라미터 ${index + 1}:`, {
        parameter_code: param.parameter_code,
        parameter_name: param.parameter_name,
        is_active: param.is_active,
        is_required: param.is_required,
        default_value: param.default_value,
        parameter_unit: param.parameter_unit,
        remarks: param.remarks,
      });
    });

    // Imperial 파라미터 데이터 준비 (선택된 파라미터만)
    console.log("원본 imperialFileData:", imperialFileData.value);

    const imperialParameters =
      imperialFileData.value.length > 0
        ? imperialFileData.value
            .filter((item) => item.parameter_code && item.parameter_code !== "") // 선택된 파라미터만 필터링
            .map((item) => ({
              parameter_code: item.parameter_code, // 저장된 parameter_code 사용
              parameter_name: item.parameter_name,
              is_active: item.is_active,
              is_required: item.is_required,
              default_value: item.influent,
              parameter_unit: item.unit,
              remarks: item.remarks || undefined,
            }))
        : undefined;

    console.log("등록할 Imperial 파라미터:", imperialParameters);
    imperialParameters?.forEach((param, index) => {
      console.log(`Imperial 파라미터 ${index + 1}:`, {
        parameter_code: param.parameter_code,
        parameter_name: param.parameter_name,
        is_active: param.is_active,
        is_required: param.is_required,
        default_value: param.default_value,
        parameter_unit: param.parameter_unit,
        remarks: param.remarks,
      });
    });

    // 유입종류와 파라미터를 한 번에 등록
    const requestData = {
      waterFlowTypeData: {
        flow_type_code: selectedInputType.value, // 선택된 공통코드의 code_key 사용
        flow_type_name: newInflowTypeName.value.trim(),
        flow_type_name_en: newInflowTypeNameEn.value.trim() || undefined,
        flow_direction: "INFLUENT",
        description: uploadForm.value.title || undefined,
        symbol_color: selectedColor.value, // 심볼 색상 추가
        is_active: true,
        is_required: true,
        metric_parameters: metricParameters,
        imperial_parameters: imperialParameters,
      },
      symbolFile: uploadForm.value.file || undefined, // 파일첨부
      metricFile: metricFile.value || undefined, // Metric 계산식 파일
      imperialFile: imperialFile.value || undefined, // Imperial 계산식 파일
    };

    const response = await inflowStore.createWaterFlowType(requestData);

    // 폼 초기화
    selectedInputType.value = "";
    newInflowTypeName.value = "";
    newInflowTypeNameEn.value = "";
    uploadForm.value.title = "";
    selectedColor.value = "#3b82f6"; // 심볼 색상 초기화
    metricFileData.value = [];
    imperialFileData.value = [];
    metricFileName.value = "";
    imperialFileName.value = "";
    metricFile.value = null;
    imperialFile.value = null;

    closeModal();

    // 유입종류 목록을 다시 로드해서 탭 업데이트
    await loadWaterFlowTypes();

    // 새로 등록된 항목으로 이동 (마지막 탭)
    nextTick(async () => {
      activeTab.value = tabs.value.length - 1;
      updateScrollButtons();
      if (tabsContainer.value) {
        tabsContainer.value.scrollTo({
          left: tabsContainer.value.scrollWidth,
          behavior: "smooth",
        });
      }

      // 새로 등록된 탭의 파라미터도 로드
      const newTab = tabs.value[tabs.value.length - 1];
      if (newTab && newTab.flow_type_code && newTab.flow_type_id) {
        await loadWaterFlowTypeParameters(
          newTab.flow_type_code,
          newTab.flow_type_id
        );
      }
    });

    // API 응답의 message를 사용하거나 기본 메시지 표시
    const successMessage = translateMessage(
      response?.message,
      "messages.success.waterFlowTypeCreateSuccess"
    );
    alert(successMessage);
  } catch (error: unknown) {
    console.error("유입종류 또는 파라미터 등록 실패:", error);

    // request 유틸리티에서 표준화된 에러 객체의 message 사용
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.waterFlowTypeCreateFailed"
    );
    alert(errorMessage);
  } finally {
    isCreating.value = false;
  }
};

const updateTab = async () => {
  if (activeTab.value < 0 || !tabs.value[activeTab.value]) {
    alert(t("messages.warning.selectTabToEdit"));
    return;
  }

  if (!selectedInputType.value) {
    alert(t("messages.warning.selectInflowType"));
    return;
  }

  if (!newInflowTypeName.value.trim()) {
    alert(t("messages.warning.enterInflowTypeName"));
    return;
  }

  isUpdating.value = true;

  try {
    const currentTab = tabs.value[activeTab.value];
    const flowTypeId = currentTab.flow_type_id;

    if (!flowTypeId) {
      alert(t("messages.warning.cannotEditTab"));
      return;
    }

    // 현재 탭의 원본 데이터에서 svg_symbol_id 가져오기
    const originalWaterFlowType = inflowStore.waterFlowTypes.find(
      (wft) => wft.flow_type_id === currentTab.flow_type_id
    );

    // Metric 파라미터 데이터 준비
    // 파일이 첨부되었으면 metricFileData 사용, 아니면 currentMetricGridData 사용
    const metricParameters = isMetricFileAttached.value
      ? metricFileData.value
          .filter((item) => item.parameter_code && item.parameter_code !== "") // 선택된 파라미터만 필터링
          .map((item) => ({
            flow_type_id: flowTypeId, // flow_type_id 추가
            parameter_id: item.parameter_id || "", // parameter_id 사용 (없으면 빈 값)
            parameter_code: item.parameter_code,
            parameter_name: item.parameter_name,
            is_active: item.is_active,
            is_required: item.is_required,
            default_value: item.influent,
            parameter_unit: item.unit,
            remarks: item.remarks || undefined,
          }))
      : currentMetricGridData.value.length > 0
      ? currentMetricGridData.value
          .filter((item) => item.parameter_code && item.parameter_code !== "")
          .map((item) => ({
            flow_type_id: flowTypeId,
            parameter_id: item.parameter_id || "",
            parameter_code: item.parameter_code,
            parameter_name: item.parameter_name,
            is_active: item.is_active,
            is_required: item.is_required,
            default_value: item.influent,
            parameter_unit: item.unit,
            remarks: item.remarks || undefined,
          }))
      : undefined;

    // Imperial 파라미터 데이터 준비
    // 파일이 첨부되었으면 imperialFileData 사용, 아니면 currentImperialGridData 사용
    const imperialParameters = isImperialFileAttached.value
      ? imperialFileData.value
          .filter((item) => item.parameter_code && item.parameter_code !== "") // 선택된 파라미터만 필터링
          .map((item) => ({
            flow_type_id: flowTypeId, // flow_type_id 추가
            parameter_id: item.parameter_id || "", // parameter_id 사용 (없으면 빈 값)
            parameter_code: item.parameter_code,
            parameter_name: item.parameter_name,
            is_active: item.is_active,
            is_required: item.is_required,
            default_value: item.influent,
            parameter_unit: item.unit,
            remarks: item.remarks || undefined,
          }))
      : currentImperialGridData.value.length > 0
      ? currentImperialGridData.value
          .filter((item) => item.parameter_code && item.parameter_code !== "")
          .map((item) => ({
            flow_type_id: flowTypeId,
            parameter_id: item.parameter_id || "",
            parameter_code: item.parameter_code,
            parameter_name: item.parameter_name,
            is_active: item.is_active,
            is_required: item.is_required,
            default_value: item.influent,
            parameter_unit: item.unit,
            remarks: item.remarks || undefined,
          }))
      : undefined;

    // 유입종류 수정
    const requestData = {
      waterFlowTypeData: {
        flow_type_id: flowTypeId, // flow_type_id 추가
        flow_direction: "INFLUENT", // flow_direction 하드코딩
        flow_type_code: currentTab.flow_type_code, // flow_type_code 추가
        flow_type_name: newInflowTypeName.value.trim(),
        flow_type_name_en: newInflowTypeNameEn.value.trim() || undefined,
        description: uploadForm.value.title || undefined,
        svg_symbol_id: originalWaterFlowType?.svg_symbol_id, // SVG 심볼 ID 추가
        symbol_color: selectedColor.value, // 심볼 색상 추가
        is_active: true,
        metric_parameters: metricParameters,
        imperial_parameters: imperialParameters,
      },
      symbolFile: uploadForm.value.file || undefined, // 파일첨부
      metricFile: metricFile.value || undefined, // Metric 계산식 파일
      imperialFile: imperialFile.value || undefined, // Imperial 계산식 파일
    };

    const response = await inflowStore.updateWaterFlowType(
      flowTypeId,
      requestData
    );

    // 파라미터는 별도로 처리 (기존 파라미터 삭제 후 재등록이 필요할 수 있음)
    // TODO: 파라미터 수정 로직 구현

    closeUpdateModal();

    // 유입종류 목록을 다시 로드해서 탭 업데이트
    await loadWaterFlowTypes();

    // 수정된 탭으로 다시 이동
    nextTick(async () => {
      // 수정된 탭을 찾아서 activeTab 설정
      const updatedTabIndex = tabs.value.findIndex(
        (tab) => tab.flow_type_id === flowTypeId
      );
      if (updatedTabIndex >= 0) {
        activeTab.value = updatedTabIndex;
        updateScrollButtons();

        // 수정된 탭의 파라미터도 로드
        const updatedTab = tabs.value[updatedTabIndex];
        if (
          updatedTab &&
          updatedTab.flow_type_code &&
          updatedTab.flow_type_id
        ) {
          await loadWaterFlowTypeParameters(
            updatedTab.flow_type_code,
            updatedTab.flow_type_id
          );
        }
      }
    });

    // API 응답의 message를 사용하거나 기본 메시지 표시
    const successMessage = translateMessage(
      response?.message,
      "messages.success.waterFlowTypeUpdateSuccess"
    );
    alert(successMessage);
  } catch (error: unknown) {
    console.error("유입종류 수정 실패:", error);

    // request 유틸리티에서 표준화된 에러 객체의 message 사용
    const errorMessage = translateMessage(
      error && typeof error === "object" && "message" in error
        ? (error as { message: string }).message
        : undefined,
      "messages.error.waterFlowTypeUpdateFailed"
    );
    alert(errorMessage);
  } finally {
    isUpdating.value = false;
  }
};

const onTabClick = async (index: number) => {
  activeTab.value = index;

  // 탭 변경 시 해당 탭의 데이터가 없으면 초기화
  if (!metricTabGridData.value[index]) {
    metricTabGridData.value[index] = [];
  }
  if (!imperialTabGridData.value[index]) {
    imperialTabGridData.value[index] = [];
  }
  if (!imperialTabGridData2.value[index]) {
    imperialTabGridData2.value[index] = [];
  }

  // 선택된 탭의 유입종류 코드로 파라미터 조회
  const selectedTab = tabs.value[index];
  if (selectedTab && selectedTab.flow_type_code && selectedTab.flow_type_id) {
    await loadWaterFlowTypeParameters(
      selectedTab.flow_type_code,
      selectedTab.flow_type_id
    );
  }
};

const updateScrollButtons = () => {
  if (!tabsContainer.value) return;
  const { scrollLeft, clientWidth, scrollWidth } = tabsContainer.value;
  canScrollLeft.value = scrollLeft > 0;
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth;
};

const scrollTabs = (direction: number) => {
  if (!tabsContainer.value) return;
  const { scrollLeft, clientWidth } = tabsContainer.value;
  const newScrollLeft = scrollLeft + direction * clientWidth;
  tabsContainer.value.scrollTo({ left: newScrollLeft, behavior: "smooth" });
};

onBeforeUnmount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
    resizeObserver.value = null;
  }
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("orientationchange", handleResize);
});
</script>

<style scoped lang="scss">
@use "sass:color";

/* 수정 모달 크기 제한 */
.update-modal-content {
  max-width: 1700px !important;
  max-height: 900px !important;
  overflow-y: auto;
}

.update-modal-body {
  max-height: 800px;
  overflow-y: auto;
}

.symbol-image-preview svg {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

.inflow {
  padding: $spacing-xl;
  min-width: 0; // 전체 컨테이너가 축소될 수 있도록 허용

  .page-content {
    min-width: 0; // 페이지 컨텐츠가 축소될 수 있도록 허용

    h2 {
      margin-bottom: $spacing-lg;
      color: $text-color;
    }

    p {
      color: $text-light;
    }
  }

  // 좌우 배치를 위한 스타일
  .content-wrapper,
  .modal-content-wrapper {
    display: flex;
    gap: $spacing-lg;
    min-width: 0; // flex 컨테이너가 축소될 수 있도록 허용

    // 반응형 처리: 작은 화면에서는 세로 배치
    @media (max-width: 1024px) {
      flex-direction: column;
      gap: $spacing-md;
    }

    .tab-content-metric,
    .tab-content-imperial,
    .modal-tab-content-metric,
    .modal-tab-content-imperial {
      flex: 1;
      background: white;
      border-radius: $border-radius-md;
      padding: $spacing-sm;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      min-width: 0; // flex 아이템이 컨테이너를 벗어나지 않도록
      overflow: hidden; // 내부 컨텐츠가 넘칠 때 숨김
      max-width: 100%; // 최대 너비 제한

      // 반응형 처리
      @media (max-width: 1024px) {
        min-width: 100%;
        max-width: 100%;
      }

      .section-header {
        margin-bottom: $spacing-sm;
        padding-bottom: $spacing-sm;
        border-bottom: 2px solid $primary-color;

        h3 {
          margin: 0;
          color: $primary-color;
          font-size: $font-size-lg;
          font-weight: $font-weight-bold;
        }

        .tab-info {
          font-size: $font-size-sm;
          color: $text-light;

          small {
            font-size: 0.75rem; // $font-size-xs 대신 직접 값 사용
            opacity: 0.7;
          }
        }
      }

      .content,
      .action-bar {
        min-width: 0; // 컨텐츠 영역이 축소될 수 있도록 허용

        .action-bar {
          margin: $spacing-sm 0;
        }
      }
    }

    // 모달 내부에서는 배경색과 그림자 제거
    .modal-tab-content-metric,
    .modal-tab-content-imperial {
      background: transparent;
      box-shadow: none;
      // border: 1px solid $border-color;
    }
  }

  // 로딩 및 빈 데이터 상태 스타일
  .loading-container,
  .no-data-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background: white;
    border-radius: $border-radius-md;
    border: 1px solid $border-color;

    p {
      color: $text-light;
      font-size: 1rem; // $font-size-md 대신 직접 값 사용
    }
  }

  // 탭 로딩 상태
  .tab.loading {
    background-color: $background-light;
    color: $text-light;
    cursor: default;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: $spacing-lg;
  border-radius: $border-radius-md;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  max-width: 90%;
  max-height: 90vh;
  width: 100%;

  // 반응형 처리
  @media (max-width: 768px) {
    max-width: 95%;
    padding: $spacing-md;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-color;
  padding-bottom: $spacing-sm;
  margin-bottom: $spacing-sm;

  h3 {
    margin: 0;
    font-size: $font-size-lg;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: $text-light;
    &:hover {
      color: $text-color;
    }
  }
}

.modal-body {
  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    label {
      font-weight: $font-weight-bold;
    }

    .form-input {
      padding: $spacing-sm;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1px solid $border-color;

  .btn {
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-sm;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .btn-cancel {
    background-color: #fff;
    border-color: $border-color;
    color: $text-color;
    &:hover {
      background-color: $background-light;
    }
  }

  .btn-confirm {
    background-color: $primary-color;
    color: #fff;
    &:hover {
      background-color: color.scale($primary-color, $lightness: -10%);
    }
  }
}

// 색상 선택기 스타일
.color-picker-container {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  .color-preview {
    width: 40px;
    height: 40px;
    border-radius: $border-radius-sm;
    border: 2px solid $border-color;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      border-color: $primary-color;
      transform: scale(1.05);
    }
  }

  .color-input {
    width: 50px;
    height: 40px;
    border: none;
    border-radius: $border-radius-sm;
    cursor: pointer;
    background: transparent;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
      border: none;
    }

    &::-webkit-color-swatch {
      border: 2px solid $border-color;
      border-radius: $border-radius-sm;
    }
  }

  .color-text {
    font-family: monospace;
    font-size: $font-size-sm;
    color: $text-light;
    background: $background-light;
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    border: 1px solid $border-color;
  }
}

// 모달 내부 파일 업로드 폼 스타일은 상단의 dt/dd 구조와 동일하게 적용

// 탭 스크롤 관련 스타일
.action-bar {
  min-width: 0; // 액션 바가 축소될 수 있도록 허용
  display: flex;
  justify-content: flex-end; // 버튼을 오른쪽 끝에 배치
  margin-bottom: $spacing-sm;
}

.tab-action-bar {
  min-width: 0; // 탭 액션 바가 축소될 수 있도록 허용
}

.swiper-bar {
  display: flex;
  align-items: center;
  width: 100%;
  flex: 1; // 전체 공간을 차지하도록
  min-width: 0; // 스와이퍼 바가 축소될 수 있도록 허용
}

.tabs-wrapper {
  display: flex;
  align-items: center;
  flex: 1; // swiper-bar 내에서 전체 공간 차지
  overflow: hidden;
  min-width: 0; // flex 아이템이 축소될 수 있도록 허용
}

.tabs {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  flex: 1;
  min-width: 0; // flex 아이템이 축소될 수 있도록 허용
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE/Edge

  &::-webkit-scrollbar {
    display: none; // Chrome/Safari
  }

  .tab {
    flex-shrink: 0; // 탭이 축소되지 않도록
    white-space: nowrap; // 텍스트 줄바꿈 방지
    max-width: 200px; // 개별 탭의 최대 너비 제한
    overflow: hidden; // 넘치는 텍스트 숨김
  }
}

.btn-scroll {
  background: $primary-color;
  color: white;
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 2.5rem; // 탭의 높이와 맞춤 (padding 0.5rem * 2 + 텍스트 높이)
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  min-width: 30px;

  img {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1); // 흰색으로 변경
  }

  &:hover:not(:disabled) {
    background: color.scale($primary-color, $lightness: -10%);
  }

  &:disabled {
    background: $background-light;
    cursor: not-allowed;

    img {
      filter: brightness(0) invert(0.5); // 회색으로 변경
    }
  }

  &.left {
    margin-right: 8px;
  }

  &.right {
    margin-left: 8px;
  }
}

.symbol-image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  overflow: hidden;
}

.symbol-image-preview svg {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}

.no-symbol-message {
  color: #6b7280;
  font-size: 14px;
  font-style: italic;
}
</style>
