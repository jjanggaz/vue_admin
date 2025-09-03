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
              <img src="/images/icons/leftArrow.svg" alt="이전" />
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
                :title="
                  tab.flow_type_code ? `코드: ${tab.flow_type_code}` : tab.name
                "
              >
                {{ tab.name }}
              </div>
            </div>
            <button
              class="btn-scroll right"
              :disabled="!canScrollRight"
              @click="scrollTabs(1)"
            >
              <img src="/images/icons/rightArrow.svg" alt="다음" />
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
                    v-if="item.item === ''"
                    v-model="item.item"
                    @change="onParameterSelect(item.item, index, true, false)"
                    class="form-input"
                  >
                    <option value="">선택</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-is_active="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_active" />
                </template>
                <template #cell-is_required="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_required" />
                </template>
              </DataTable>

              <div class="action-bar">
                <div class="title">
                  <h4>{{ t("inflow.formulaList") }}</h4>
                </div>
                <div class="btns">
                  <button class="btn btn-add">{{ t("inflow.delete") }}</button>
                </div>
              </div>

              <DataTable
                :columns="gridColumns2"
                :data="currentGridData2"
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template #cell-formula="{ item }">
                  <span>{{ item.formula }}</span>
                </template>
                <template #cell-apply="{ item }: { item: GridRow2 }">
                  <input
                    type="checkbox"
                    v-model="item.apply"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
                <template #cell-remarks="{ item, index }">
                  <input
                    v-if="index === currentGridData2.length - 1"
                    type="text"
                    v-model="item.remarks"
                    class="form-input"
                  />
                  <span v-else>{{ item.remarks }}</span>
                </template>
              </DataTable>
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
                    v-if="item.item === ''"
                    v-model="item.item"
                    @change="onParameterSelect(item.item, index, false, false)"
                    class="form-input"
                  >
                    <option value="">선택</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-is_active="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_active" />
                </template>
                <template #cell-is_required="{ item }: { item: GridRow }">
                  <input type="checkbox" v-model="item.is_required" />
                </template>
              </DataTable>

              <div class="action-bar">
                <div class="title">
                  <h4>{{ t("inflow.formulaList") }}</h4>
                </div>
                <div class="btns">
                  <button class="btn btn-add">{{ t("inflow.delete") }}</button>
                </div>
              </div>

              <DataTable
                :columns="gridColumns2"
                :data="currentGridData2"
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template #cell-formula="{ item }">
                  <span>{{ item.formula }}</span>
                </template>
                <template #cell-apply="{ item }: { item: GridRow2 }">
                  <input
                    type="checkbox"
                    v-model="item.apply"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
                <template #cell-remarks="{ item, index }">
                  <input
                    v-if="index === currentGridData2.length - 1"
                    type="text"
                    v-model="item.remarks"
                    class="form-input"
                  />
                  <span v-else>{{ item.remarks }}</span>
                </template>
              </DataTable>
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
          </dl>
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
                    accept=".svg,.png,.jpg,.jpeg,.gif"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
          </dl>
          <dl class="column-regist">
            <dt>{{ t("common.etc") }}</dt>
            <dd>
              <input
                type="text"
                v-model="uploadForm.title"
                class="form-input"
              />
            </dd>
          </dl>

          <div class="modal-content-wrapper">
            <div class="modal-tab-content-metric">
              <div class="section-header">
                <h3>Metric</h3>
              </div>
              <div class="upload-and-button-row">
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
                <div class="action-bar">
                  <div class="btns">
                    <button class="btn btn-add" @click="addModalMetricRow">
                      {{ t("inflow.addItem") }}
                    </button>
                  </div>
                </div>
              </div>

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
                    v-if="item.item === ''"
                    v-model="item.item"
                    @change="onParameterSelect(item.item, index, true, true)"
                    class="form-input"
                  >
                    <option value="">선택</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
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
              <div class="upload-and-button-row">
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
                <div class="action-bar">
                  <div class="btns">
                    <button class="btn btn-add" @click="addModalImperialRow">
                      {{ t("inflow.addItem") }}
                    </button>
                  </div>
                </div>
              </div>

              <DataTable
                :columns="gridColumns"
                :data="
                  imperialFileData.length > 0
                    ? imperialFileData
                    : currentGridData
                "
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template
                  #cell-item="{ item, index }: { item: GridRow, index: number }"
                >
                  <select
                    v-if="item.item === ''"
                    v-model="item.item"
                    @change="onParameterSelect(item.item, index, false, true)"
                    class="form-input"
                  >
                    <option value="">선택</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
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
          <button class="btn btn-confirm" @click="createNewTab">
            {{ t("common.register") }}
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
      <div class="modal-content update-modal-content" @click.stop>
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
        <div class="modal-body update-modal-body">
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
          </dl>
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
                    accept=".svg,.png,.jpg,.jpeg,.gif"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
          </dl>
          <dl class="column-regist">
            <dt>{{ t("common.etc") }}</dt>
            <dd>
              <input
                type="text"
                v-model="uploadForm.title"
                class="form-input"
              />
            </dd>
          </dl>

          <div class="modal-content-wrapper">
            <div class="modal-tab-content-metric">
              <div class="section-header">
                <h3>Metric</h3>
              </div>
              <div class="upload-and-button-row">
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
                <div class="action-bar">
                  <div class="btns">
                    <button class="btn btn-add" @click="addModalMetricRow">
                      {{ t("inflow.addItem") }}
                    </button>
                  </div>
                </div>
              </div>

              <DataTable
                :columns="gridColumns"
                :data="
                  metricFileData.length > 0
                    ? metricFileData
                    : currentMetricGridData
                "
                maxHeight="300px"
                :stickyHeader="true"
              >
                <template
                  #cell-item="{ item, index }: { item: GridRow, index: number }"
                >
                  <select
                    v-if="item.item === ''"
                    v-model="item.item"
                    @change="onParameterSelect(item.item, index, true, true)"
                    class="form-input"
                  >
                    <option value="">선택</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
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
              <div class="upload-and-button-row">
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
                <div class="action-bar">
                  <div class="btns">
                    <button class="btn btn-add" @click="addModalImperialRow">
                      {{ t("inflow.addItem") }}
                    </button>
                  </div>
                </div>
              </div>

              <DataTable
                :columns="gridColumns"
                :data="
                  imperialFileData.length > 0
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
                    v-if="item.item === ''"
                    v-model="item.item"
                    @change="onParameterSelect(item.item, index, false, true)"
                    class="form-input"
                  >
                    <option value="">선택</option>
                    <option
                      v-for="param in inflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
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
          <button class="btn btn-confirm" @click="updateTab">
            {{ t("common.update") }}
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

    await inflowStore.fetchWaterQualityParameters();
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
  item: string;
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
  id: number;
  mapping_id: string;
  formula: string;
  uploadDate: string;
  author: string;
  apply: "Y" | "N";
  remarks: string;
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
const handleResize = () => {
  nextTick(() => updateScrollButtons());
};

// 유입종류별 파라미터 데이터 로드
const loadWaterFlowTypeParameters = async (flowTypeCode: string) => {
  try {
    // 유입종류별 파라미터 조회
    await inflowStore.fetchWaterFlowTypeParameters("INFLUENT", flowTypeCode);

    // 조회된 파라미터를 그리드 데이터로 변환
    // 여기
    if (
      inflowStore.waterFlowTypeParameters &&
      inflowStore.waterFlowTypeParameters.length > 0
    ) {
      const metricParams: GridRow[] = [];
      const imperialParams: GridRow[] = [];

      inflowStore.waterFlowTypeParameters.forEach((param) => {
        const gridRow: GridRow = {
          id: 0, // 나중에 재정렬
          mapping_id: param.mapping_id,
          item: param.parameter_name,
          influent: parseFloat(param.default_value) || 0,
          unit: param.parameter_unit || "",
          is_active: !!param.is_active,
          is_required: !!param.is_required,
          remarks: param.remarks || "",
        };

        // unit_system_code에 따라 분류
        if (param.unit_system_code === "IMPERIAL") {
          // IMPERIAL인 경우
          imperialParams.push(gridRow);
        } else {
          // METRIC이거나 기본값
          metricParams.push(gridRow);
        }
      });

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
    await inflowStore.fetchWaterFlowTypes({
      page: 1,
      page_size: 100, // 많은 데이터를 가져오기 위해 큰 값 설정
      order_by: "created_at",
      order_direction: "asc",
      flowTypeCode: "INFLUENT", // 유출종류 조회
    });

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
      tabs.value = [{ name: "데이터 없음" }];
    }

    // 첫 번째 탭을 활성화하고 파라미터 로드
    if (tabs.value.length > 0) {
      activeTab.value = 0;

      // 첫 번째 탭의 파라미터도 로드
      const firstTab = tabs.value[0];
      if (firstTab && firstTab.flow_type_code) {
        await loadWaterFlowTypeParameters(firstTab.flow_type_code);
      }
    }
  } catch (error) {
    console.error("유입종류 데이터 로드 실패:", error);

    // 에러 발생 시 기본 탭 설정
    tabs.value = [{ name: "로드 실패" }];
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
const newTabName = ref("");

// 파일 선택 관련 상태
const metricFileData = ref<GridRow[]>([]);
const imperialFileData = ref<GridRow[]>([]);
const metricFileName = ref<string>("");
const imperialFileName = ref<string>("");

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
  { key: "author", title: t("columns.inflow.author") },
  { key: "apply", title: t("columns.inflow.apply") },
  { key: "remarks", title: t("columns.inflow.remarks") },
];

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    // 허용된 파일 확장자 체크
    const allowedExtensions = [".svg", ".png", ".jpg", ".jpeg", ".gif"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      alert("SVG, PNG, JPG, JPEG, GIF 파일만 업로드 가능합니다.");
      target.value = ""; // 파일 선택 초기화
      return;
    }

    uploadForm.value.file = file;
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

    try {
      const fileContent = await readFileContent(file);
      const parsedData = parsePythonFile(fileContent);
      metricFileData.value = parsedData;
    } catch (error) {
      console.error("파일 파싱 에러:", error);
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

    try {
      const fileContent = await readFileContent(file);
      const parsedData = parsePythonFile(fileContent);
      imperialFileData.value = parsedData;
    } catch (error) {
      console.error("파일 파싱 에러:", error);
      alert(t("messages.warning.fileReadError"));
    }
  }
};

// 파일 내용 읽기
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("파일을 읽을 수 없습니다."));
      }
    };
    reader.onerror = () => reject(new Error("파일 읽기 실패"));
    reader.readAsText(file);
  });
};

// Python 파일 파싱
const parsePythonFile = (content: string): GridRow[] => {
  const lines = content.split("\n");
  const data: GridRow[] = [];
  let idCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    const line = originalLine.trim();

    // 빈 라인이나 특수 라인 건너뛰기
    if (line === "") {
      continue;
    }

    if (
      line.startsWith("import") ||
      line.startsWith("from") ||
      line.startsWith("def ") ||
      line.startsWith("class ") ||
      line.startsWith("if ") ||
      line.startsWith("for ") ||
      line.startsWith("while ") ||
      line.startsWith("try:") ||
      line.startsWith("except") ||
      line.startsWith("finally")
    ) {
      continue;
    }

    // 주석 처리
    if (line.startsWith("#")) {
      continue;
    }

    // = 기호가 있는지 확인
    if (line.includes("=")) {
      // 가장 단순한 분할 방식
      const parts = line.split("=");
      if (parts.length >= 2) {
        const varName = parts[0].trim();
        const value = parts.slice(1).join("=").trim(); // 여러 = 가 있을 경우 대비

        // 변수명이 유효한지 확인 (객체 속성 접근도 허용: DCN.influents.bod)
        if (
          /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/.test(varName)
        ) {
          // influents가 포함된 변수명만 허용
          const hasInfluents = varName.toLowerCase().includes("influents");

          if (!hasInfluents) {
            continue;
          }

          // 수질 관련 변수인지 확인 (변수명의 마지막 부분도 체크)
          const waterQualityKeywords = [
            "BOD",
            "COD",
            "SS",
            "TSS",
            "TN",
            "TP",
            "NH3",
            "NO3",
            "PO4",
            "pH",
            "DO",
            "TEMP",
            "FLOW",
            "MLSS",
            "SRT",
            "HRT",
            "INFLUENT",
            "EFFLUENT",
          ];
          const isWaterQuality = waterQualityKeywords.some((keyword) =>
            varName.toUpperCase().includes(keyword)
          );

          if (isWaterQuality) {
            // 값에서 숫자 추출
            let numericValue = 0;
            let unit = "mg/L";

            // 문자열에서 따옴표 제거
            let cleanValue = value.replace(/['"]/g, "").trim();

            // 숫자 찾기
            const numberMatch = cleanValue.match(/([0-9]+\.?[0-9]*)/);
            if (numberMatch) {
              numericValue = parseFloat(numberMatch[1]);

              // 단위 추출 시도
              if (cleanValue.includes("mg/L")) unit = "mg/L";
              else if (cleanValue.includes("%")) unit = "%";
              else if (cleanValue.includes("L/day")) unit = "L/day";
              else if (cleanValue.includes("day")) unit = "day";
              else if (cleanValue.includes("°C")) unit = "°C";
              else if (cleanValue.includes("㎥/d")) unit = "㎥/d";

              // 변수명에서 의미있는 부분 추출 (마지막 부분 사용)
              const nameParts = varName.split(".");
              const displayName = nameParts[nameParts.length - 1].toUpperCase();

              const item: GridRow = {
                id: idCounter++,
                mapping_id: "",
                item: displayName,
                influent: numericValue,
                unit: unit,
                is_active: true,
                is_required: false,
                remarks: "",
              };

              data.push(item);
            }
          }
        }
      }
    }
  }

  // 파싱된 데이터가 없으면 파일에서 모든 숫자 추출
  if (data.length === 0) {
    const allNumbers = content.match(/\b([0-9]+\.?[0-9]*)\b/g);
    if (allNumbers && allNumbers.length > 0) {
      allNumbers.slice(0, 8).forEach((num, index) => {
        data.push({
          id: index + 1,
          mapping_id: "",
          item: `VALUE_${index + 1}`,
          influent: parseFloat(num),
          unit: "-",
          is_active: true,
          is_required: false,
          remarks: `파일에서 추출된 숫자값`,
        });
      });
    } else {
      // 정말 아무것도 없으면 기본값
      data.push({
        id: 1,
        mapping_id: "",
        item: "NO_DATA",
        influent: 0,
        unit: "-",
        is_active: true,
        is_required: false,
        remarks: "파싱 가능한 데이터 없음",
      });
    }
  }

  return data;
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

// 각 탭별 데이터 복사본을 Metric/Imperial용으로 초기화
Object.keys(tabGridData.value).forEach((key) => {
  const tabKey = parseInt(key);
  metricTabGridData.value[tabKey] = [...tabGridData.value[tabKey]];
  imperialTabGridData.value[tabKey] = [...tabGridData.value[tabKey]];
});

// 모달용 Metric 데이터 추가 함수
const addModalMetricRow = () => {
  const currentData =
    metricFileData.value.length > 0
      ? metricFileData.value
      : currentGridData.value;
  const newId =
    currentData.length > 0
      ? Math.max(...currentData.map((item) => item.id)) + 1
      : 1;

  const newRow: GridRow = {
    id: newId,
    mapping_id: "",
    item: "", // 빈 값으로 시작, 선택 시 채워짐
    influent: 0,
    unit: "",
    is_active: true,
    is_required: false,
    remarks: "",
  };

  if (metricFileData.value.length > 0) {
    metricFileData.value = [...metricFileData.value, newRow];
  } else {
    metricFileData.value = [...currentGridData.value, newRow];
  }

  // 새로 추가된 행이 보이도록 스크롤 조정
  nextTick(() => {
    const modalMetricTable = document.querySelector(
      ".modal-tab-content-metric .data-table-container.with-scroll"
    );
    if (modalMetricTable) {
      modalMetricTable.scrollTop = modalMetricTable.scrollHeight;
    } else {
      // fallback: 일반적인 스크롤 컨테이너 찾기
      const scrollContainer = document.querySelector(
        ".modal-tab-content-metric .data-table-container"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  });
};

// 모달용 Imperial 데이터 추가 함수
const addModalImperialRow = () => {
  const currentData =
    imperialFileData.value.length > 0
      ? imperialFileData.value
      : currentGridData.value;
  const newId =
    currentData.length > 0
      ? Math.max(...currentData.map((item) => item.id)) + 1
      : 1;

  const newRow: GridRow = {
    id: newId,
    mapping_id: "",
    item: "", // 빈 값으로 시작, 선택 시 채워짐
    influent: 0,
    unit: "",
    is_active: true,
    is_required: false,
    remarks: "",
  };

  if (imperialFileData.value.length > 0) {
    imperialFileData.value = [...imperialFileData.value, newRow];
  } else {
    imperialFileData.value = [...currentGridData.value, newRow];
  }

  // 새로 추가된 행이 보이도록 스크롤 조정
  nextTick(() => {
    const modalImperialTable = document.querySelector(
      ".modal-tab-content-imperial .data-table-container.with-scroll"
    );
    if (modalImperialTable) {
      modalImperialTable.scrollTop = modalImperialTable.scrollHeight;
    } else {
      // fallback: 일반적인 스크롤 컨테이너 찾기
      const scrollContainer = document.querySelector(
        ".modal-tab-content-imperial .data-table-container"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  });
};

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
      targetData[rowIndex].item = selectedParameter.parameter_name;
      targetData[rowIndex].unit = selectedParameter.default_unit;
      // influent 값은 기본값이 있으면 설정, 없으면 0
      targetData[rowIndex].influent = 0;
      targetData[rowIndex].remarks = selectedParameter.description || "";
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

// 수질 검색 (임시 주석 처리)
// const searchWaterQuality = async () => {
//   try {
//     await waterQualityStore.fetchWaterQuality({
//       search_field:
//         searchField.value && searchValue.value ? searchField.value : undefined,
//       search_value: searchValue.value || undefined,
//       page: waterQualityStore.page,
//       page_size: waterQualityStore.page_size,
//     });
//   } catch (error) {
//     console.error("수질 검색 실패:", error);
//   }
// };

const currentGridData2 = computed(() => {
  return tabGridData2.value[activeTab.value] || [];
});

// 모달 관련 함수
const openModal = () => {
  isModalOpen.value = true;
  newTabName.value = "";
};

const openUpdateModal = async () => {
  if (activeTab.value < 0 || !tabs.value[activeTab.value]) {
    alert(t("messages.warning.selectTabToEdit"));
    return;
  }

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
            (a: any, b: any) =>
              new Date(b.uploaded_at).getTime() -
              new Date(a.uploaded_at).getTime()
          )[0];

          // 파일명을 input에 표시하기 위해 별도 상태 추가
          uploadForm.value.existingFileName = latestFile.original_filename;
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

  isUpdateModalOpen.value = true;
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
  metricFileData.value = [];
  imperialFileData.value = [];
  metricFileName.value = "";
  imperialFileName.value = "";
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

  try {
    // Metric 파라미터 데이터 준비
    const metricParameters =
      metricFileData.value.length > 0
        ? metricFileData.value.map((item) => ({
            parameter_name: item.item,
            is_active: item.is_active,
            is_required: item.is_required,
            default_value: item.influent,
            parameter_unit: item.unit,
            remarks: item.remarks || undefined,
          }))
        : undefined;

    // Imperial 파라미터 데이터 준비
    const imperialParameters =
      imperialFileData.value.length > 0
        ? imperialFileData.value.map((item) => ({
            parameter_name: item.item,
            is_active: item.is_active,
            is_required: item.is_required,
            default_value: item.influent,
            parameter_unit: item.unit,
            remarks: item.remarks || undefined,
          }))
        : undefined;

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
      if (newTab && newTab.flow_type_code) {
        await loadWaterFlowTypeParameters(newTab.flow_type_code);
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

    // 유입종류 수정
    const requestData = {
      waterFlowTypeData: {
        flow_type_code: selectedInputType.value,
        flow_type_name: newInflowTypeName.value.trim(),
        flow_type_name_en: newInflowTypeNameEn.value.trim() || undefined,
        flow_direction: "INFLUENT",
        description: uploadForm.value.title || undefined,
        svg_symbol_id: originalWaterFlowType?.svg_symbol_id, // SVG 심볼 ID 추가
        symbol_color: selectedColor.value, // 심볼 색상 추가
        is_active: true,
      },
      symbolFile: uploadForm.value.file || undefined, // 파일첨부
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
        if (updatedTab && updatedTab.flow_type_code) {
          await loadWaterFlowTypeParameters(updatedTab.flow_type_code);
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

  // 선택된 탭의 유입종류 코드로 파라미터 조회
  const selectedTab = tabs.value[index];
  if (selectedTab && selectedTab.flow_type_code) {
    await loadWaterFlowTypeParameters(selectedTab.flow_type_code);
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
  overflow-y: auto;
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

// 업로드와 버튼을 같은 줄에 배치
.upload-and-button-row {
  display: flex;
  align-items: flex-end;
  gap: $spacing-md;
  margin-bottom: $spacing-sm;

  .column-regist {
    flex: 1;
    margin-bottom: 0;
  }

  .action-bar {
    flex-shrink: 0;
    margin-bottom: 0;
  }
}

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
  max-width: calc(100% - 76px); // 좌우 버튼(30px+여백 8px씩) 제외
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
  height: 30px;
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
</style>
