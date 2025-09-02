<template>
  <div class="outflow">
    <div class="page-content">
      <div class="action-bar tab-action-bar">
        <div class="swiper-bar">
          <div class="tabs-wrapper">
            <button
              v-if="canScrollLeft"
              class="btn-scroll left"
              @click="scrollTabs(-1)"
            >
              ◀
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
              v-if="canScrollRight"
              class="btn-scroll right"
              @click="scrollTabs(1)"
            >
              ▶
            </button>
          </div>
        </div>

        <div class="tab-buttons">
          <div class="btns">
            <button class="btn btn-create" @click="openModal">
              {{ t("outflow.registerNew") }}
            </button>
            <button class="btn btn-update" @click="openUpdateModal">
              {{ t("outflow.update") }}
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
                      v-for="param in outflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-active="{ item }: { item: GridRow }">
                  <input
                    type="checkbox"
                    v-model="item.active"
                    true-value="Y"
                    false-value="N"
                  />
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
                      v-for="param in outflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-active="{ item }: { item: GridRow }">
                  <input
                    type="checkbox"
                    v-model="item.active"
                    true-value="Y"
                    false-value="N"
                  />
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
          <h3>{{ t("outflow.registerNew") }}</h3>
          <button class="close-btn" @click="closeModal" aria-label="Close">
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt class="essential">{{ t("outflow.typeNameKo") }}</dt>
            <dd>
              <select
                v-model="selectedOutputType"
                @change="onOutputTypeChange"
                class="form-input"
                required
              >
                <option value="">선택</option>
                <option
                  v-for="code in outflowStore.commonCodes"
                  :key="code.code_id"
                  :value="code.code_key"
                >
                  {{ code.code_value }}
                </option>
              </select>
            </dd>
            <dt class="essential">{{ t("outflow.typeNameEn") }}</dt>
            <dd>
              <input
                type="text"
                v-model="newOutflowTypeNameEn"
                :placeholder="t('placeholder.outflowTypeName')"
                class="form-input"
                readonly
                disabled
              />
            </dd>
          </dl>
          <dl class="column-regist">
            <dt>{{ t("outflow.symbolColor") }}</dt>
            <dd>
              <div class="color-picker-container">
                <!-- <div class="color-preview" 
                     :style="{ backgroundColor: selectedColor }"
                     @click="showColorPicker = !showColorPicker">
                </div> -->
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
                  :value="uploadForm.file ? uploadForm.file.name : ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                  class="file-name-input"
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileUpload"
                    accept=".3ds,.obj,.fbx,.dae"
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
                :placeholder="t('placeholder.outflowRemarks')"
                class="form-input"
              />
            </dd>
          </dl>

          <div class="modal-content-wrapper">
            <div class="modal-tab-content-metric">
              <div class="section-header">
                <h3>Metric</h3>
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
                      v-for="param in outflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-active="{ item }: { item: GridRow }">
                  <input
                    type="checkbox"
                    v-model="item.active"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
              </DataTable>
            </div>

            <div class="modal-tab-content-imperial">
              <div class="section-header">
                <h3>Imperial</h3>
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
                      v-for="param in outflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-active="{ item }: { item: GridRow }">
                  <input
                    type="checkbox"
                    v-model="item.active"
                    true-value="Y"
                    false-value="N"
                  />
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
          <h3>{{ t("outflow.update") }}</h3>
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
            <dt class="essential">{{ t("outflow.typeNameKo") }}</dt>
            <dd>
              <select
                v-model="selectedOutputType"
                @change="onOutputTypeChange"
                class="form-input"
                required
                disabled
              >
                <option value="">선택</option>
                <option
                  v-for="code in outflowStore.commonCodes"
                  :key="code.code_id"
                  :value="code.code_key"
                >
                  {{ code.code_value }}
                </option>
              </select>
            </dd>
            <dt class="essential">{{ t("outflow.typeNameEn") }}</dt>
            <dd>
              <input
                type="text"
                v-model="newOutflowTypeNameEn"
                :placeholder="t('placeholder.outflowTypeName')"
                class="form-input"
                readonly
                disabled
              />
            </dd>
          </dl>
          <dl class="column-regist">
            <dt>{{ t("outflow.symbolColor") }}</dt>
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
                  :value="uploadForm.file ? uploadForm.file.name : ''"
                  :placeholder="t('placeholder.selectFile')"
                  readonly
                  class="file-name-input"
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileUpload"
                    accept=".3ds,.obj,.fbx,.dae"
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
                :placeholder="t('placeholder.outflowRemarks')"
                class="form-input"
              />
            </dd>
          </dl>

          <div class="modal-content-wrapper">
            <div class="modal-tab-content-metric">
              <div class="section-header">
                <h3>Metric</h3>
              </div>
              <DataTable
                :columns="gridColumns"
                :data="
                  metricFileData.length > 0
                    ? metricFileData
                    : currentMetricGridData
                "
                maxHeight="200px"
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
                      v-for="param in outflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-active="{ item }: { item: GridRow }">
                  <input
                    type="checkbox"
                    v-model="item.active"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
              </DataTable>

              <div class="action-bar">
                <div class="btns">
                  <button class="btn btn-add" @click="addModalMetricRow">
                    {{ t("outflow.addItem") }}
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-tab-content-imperial">
              <div class="section-header">
                <h3>Imperial</h3>
              </div>
              <DataTable
                :columns="gridColumns"
                :data="
                  imperialFileData.length > 0
                    ? imperialFileData
                    : currentImperialGridData
                "
                maxHeight="200px"
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
                      v-for="param in outflowStore.waterQualityParameters"
                      :key="param.parameter_id"
                      :value="param.parameter_code"
                    >
                      {{ param.parameter_name }}
                    </option>
                  </select>
                  <span v-else>{{ item.item }}</span>
                </template>
                <template #cell-active="{ item }: { item: GridRow }">
                  <input
                    type="checkbox"
                    v-model="item.active"
                    true-value="Y"
                    false-value="N"
                  />
                </template>
              </DataTable>

              <div class="action-bar">
                <div class="btns">
                  <button class="btn btn-add" @click="addModalImperialRow">
                    {{ t("outflow.addItem") }}
                  </button>
                </div>
              </div>
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
import { ref, nextTick, computed, onMounted } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useI18n } from "vue-i18n";
import { useInflowStore } from "@/stores/inflow";

const { t } = useI18n();
const outflowStore = useInflowStore();

// 백엔드에서 반환되는 메시지가 다국어 키인 경우 번역 처리
const translateMessage = (
  message: string | undefined,
  fallbackKey: string
): string => {
  if (!message) return t(fallbackKey);
  return message.startsWith("messages.") ? t(message) : message;
};
const newOutflowTypeName = ref("");
const newOutflowTypeNameEn = ref("");
const selectedOutputType = ref(""); // 선택된 유출종류 코드

// 색상 선택 관련 상태
const selectedColor = ref("#3b82f6"); // 기본 파란색
const showColorPicker = ref(false);

// 수정 모달 관련 상태
const isUpdateModalOpen = ref(false);

// 컴포넌트 마운트 시 유출종류 데이터 로드
onMounted(async () => {
  await loadWaterFlowTypes();
  await loadOutputTypes(); // 공통코드 로드 추가
  await loadWaterQualityParameters(); // 수질 파라미터 로드 추가
});

// 유출 종류 공통코드 로드
const loadOutputTypes = async () => {
  try {
    await outflowStore.fetchCommonCodes("OUTPUT_TYPE", "OUT_TYPE", true);
    console.log("유출 종류 공통코드 로드 완료:", outflowStore.commonCodes);
  } catch (error) {
    console.error("유출 종류 공통코드 로드 실패:", error);
  }
};

// 수질 파라미터 로드
const loadWaterQualityParameters = async () => {
  try {
    console.log("수질 파라미터 로드 시작");
    console.log("outflowStore 객체:", outflowStore);
    console.log(
      "fetchWaterQualityParameters 함수:",
      outflowStore.fetchWaterQualityParameters
    );

    if (typeof outflowStore.fetchWaterQualityParameters !== "function") {
      console.error("fetchWaterQualityParameters가 함수가 아닙니다!");
      console.log("outflowStore의 모든 프로퍼티:", Object.keys(outflowStore));
      return;
    }

    await outflowStore.fetchWaterQualityParameters();
    console.log(
      "수질 파라미터 로드 완료:",
      outflowStore.waterQualityParameters
    );
  } catch (error) {
    console.error("수질 파라미터 로드 실패:", error);
  }
};

// 유출종류 선택 변경 시 영문명 자동 입력
const onOutputTypeChange = () => {
  if (selectedOutputType.value && outflowStore.commonCodes.length > 0) {
    const selectedCode = outflowStore.commonCodes.find(
      (code) => code.code_key === selectedOutputType.value
    );
    if (selectedCode) {
      newOutflowTypeName.value = selectedCode.code_value; // 한글명 설정
      newOutflowTypeNameEn.value = selectedCode.code_value_en; // 영문명 설정
    }
  } else {
    newOutflowTypeName.value = "";
    newOutflowTypeNameEn.value = "";
  }
};

interface GridRow {
  id: number;
  item: string;
  effluent: number;
  unit: string;
  active: "Y" | "N";
  remarks: string;
}

interface TabInfo {
  name: string;
  flow_type_id?: string; // 데이터베이스 ID 추가
  flow_type_code?: string; // 코드 추가
  symbol_color?: string; // 심볼 색상 추가
}

interface UploadForm {
  title: string;
  category: string;
  file: File | null;
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

// 유출종류별 파라미터 데이터 로드
const loadWaterFlowTypeParameters = async (flowTypeCode: string) => {
  try {
    console.log("파라미터 조회 시작:", {
      flowTypeCode: flowTypeCode,
      flowTypeCodeType: typeof flowTypeCode,
      flowTypeCodeValue: flowTypeCode,
      flowTypeCodeLength: flowTypeCode?.length,
    });

    // 유출종류별 파라미터 조회
    await outflowStore.fetchWaterFlowTypeParameters("EFFLUENT", flowTypeCode);

    // 조회된 파라미터를 그리드 데이터로 변환
    if (
      outflowStore.waterFlowTypeParameters &&
      outflowStore.waterFlowTypeParameters.length > 0
    ) {
      const metricParams: GridRow[] = [];
      const imperialParams: GridRow[] = [];

      outflowStore.waterFlowTypeParameters.forEach((param) => {
        const gridRow: GridRow = {
          id: 0, // 임시 ID, 나중에 재정렬
          item: param.parameter_name,
          effluent: parseFloat(param.default_value) || 0,
          unit: param.parameter_unit || "",
          active: param.is_active ? "Y" : "N",
          remarks: param.remarks || "",
        };

        // unit_system_code에 따라 분류
        if (param.unit_system_code === "IMPERIAL") {
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

      console.log("파라미터 데이터 변환 완료:", {
        total: outflowStore.waterFlowTypeParameters.length,
        metric: metricParams.length,
        imperial: imperialParams.length,
        metricData: metricParams,
        imperialData: imperialParams,
      });
    } else {
      // 파라미터가 없으면 빈 배열
      metricTabGridData.value[activeTab.value] = [];
      imperialTabGridData.value[activeTab.value] = [];
      console.log("파라미터 데이터 없음");
    }
  } catch (error) {
    console.error("파라미터 데이터 로드 실패:", error);

    // 에러 발생 시 빈 배열
    tabGridData.value[activeTab.value] = [];
  }
};

// 유출종류 데이터 로드
const loadWaterFlowTypes = async () => {
  try {
    isLoadingTabs.value = true;

    // 유출종류 목록 조회
    await outflowStore.fetchWaterFlowTypes({
      page: 1,
      page_size: 100, // 많은 데이터를 가져오기 위해 큰 값 설정
      order_by: "created_at",
      order_direction: "asc",
      flowTypeCode: "EFFLUENT", // 유출종류 조회
    });

    // 조회된 데이터를 탭 형태로 변환
    if (outflowStore.waterFlowTypes && outflowStore.waterFlowTypes.length > 0) {
      tabs.value = outflowStore.waterFlowTypes.map((waterFlowType, index) => ({
        name: waterFlowType.flow_type_name,
        flow_type_id: waterFlowType.flow_type_id,
        flow_type_code: waterFlowType.flow_type_code,
        symbol_color: waterFlowType.symbol_info?.symbol_color,
      }));

      console.log("로드된 유출종류 탭:", tabs.value);
      console.log(
        "첫 번째 탭의 flow_type_code:",
        tabs.value[0]?.flow_type_code
      );
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
    console.error("유출종류 데이터 로드 실패:", error);

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
const newTabName = ref("");

// 파일 선택 관련 상태
const metricFileData = ref<GridRow[]>([]);
const imperialFileData = ref<GridRow[]>([]);
const metricFileName = ref<string>("");
const imperialFileName = ref<string>("");

const gridColumns: TableColumn[] = [
  { key: "id", title: t("columns.outflow.no"), width: "80px" },
  { key: "item", title: t("columns.outflow.item") },
  { key: "effluent", title: t("columns.outflow.effluent") },
  { key: "unit", title: t("columns.outflow.unit") },
  { key: "active", title: t("columns.outflow.active") },
  { key: "remarks", title: t("columns.outflow.remarks") },
];

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    uploadForm.value.file = target.files[0];
  }
};

// Metric 파일 업로드 핸들러 (현재 사용하지 않음)
// const handleMetricFileUpload = async (event: Event) => {
//   const target = event.target as HTMLInputElement;
//   if (target.files && target.files[0]) {
//     const file = target.files[0];

//     // .py 파일인지 확인
//     if (!file.name.endsWith('.py')) {
//       alert('Python 파일(.py)만 업로드 가능합니다.');
//       return;
//     }

//     metricFileName.value = file.name;

//     try {
//       const fileContent = await readFileContent(file);
//       const parsedData = parsePythonFile(fileContent);
//       metricFileData.value = parsedData;
//     } catch (error) {
//       console.error('파일 파싱 에러:', error);
//       alert('파일을 읽는 중 오류가 발생했습니다.');
//     }
//   }
// };

// Imperial 파일 업로드 핸들러 (현재 사용하지 않음)
// const handleImperialFileUpload = async (event: Event) => {
//   const target = event.target as HTMLInputElement;
//   if (target.files && target.files[0]) {
//     const file = target.files[0];

//     // .py 파일인지 확인
//     if (!file.name.endsWith('.py')) {
//       alert('Python 파일(.py)만 업로드 가능합니다.');
//       return;
//     }

//     imperialFileName.value = file.name;

//     try {
//       const fileContent = await readFileContent(file);
//       const parsedData = parsePythonFile(fileContent);
//       imperialFileData.value = parsedData;
//     } catch (error) {
//       console.error('파일 파싱 에러:', error);
//       alert('파일을 읽는 중 오류가 발생했습니다.');
//     }
//   }
// };

// 파일 내용 읽기 (현재 사용하지 않음)
// const readFileContent = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       if (e.target?.result) {
//         resolve(e.target.result as string);
//       } else {
//         reject(new Error('파일을 읽을 수 없습니다.'));
//       }
//     };
//     reader.onerror = () => reject(new Error('파일 읽기 실패'));
//     reader.readAsText(file);
//   });
// };

// Python 파일 파싱 (현재 사용하지 않음)
// const parsePythonFile = (content: string): GridRow[] => {
//   // ... 파싱 로직 (생략)
//   return [];
// };

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

// Metric 데이터 추가 함수 (현재 사용하지 않음 - 메인 탭용)
// const addMetricRow = () => {
//   const currentData = metricTabGridData.value[activeTab.value] || [];
//   const newId = currentData.length > 0 ? Math.max(...currentData.map(item => item.id)) + 1 : 1;

//   const newRow: GridRow = {
//     id: newId,
//     item: "", // 빈 값으로 시작, 선택 시 채워짐
//     effluent: 0,
//     unit: "",
//     display: "Y",
//     remarks: "",
//   };

//   metricTabGridData.value[activeTab.value] = [...currentData, newRow];
//   console.log('Metric 행 추가됨:', newRow);

//   // 새로 추가된 행이 보이도록 스크롤 조정
//   nextTick(() => {
//     const metricTabContent = document.querySelector('.tab-content-metric .data-table-container.with-scroll');
//     if (metricTabContent) {
//       metricTabContent.scrollTop = metricTabContent.scrollHeight;
//     } else {
//       // fallback: 일반적인 스크롤 컨테이너 찾기
//       const scrollContainer = document.querySelector('.tab-content-metric .data-table-container');
//       if (scrollContainer) {
//         scrollContainer.scrollTop = scrollContainer.scrollHeight;
//       }
//     }
//   });
// };

// Imperial 데이터 추가 함수 (현재 사용하지 않음 - 메인 탭용)
// const addImperialRow = () => {
//   const currentData = imperialTabGridData.value[activeTab.value] || [];
//   const newId = currentData.length > 0 ? Math.max(...currentData.map(item => item.id)) + 1 : 1;

//   const newRow: GridRow = {
//     id: newId,
//     item: "", // 빈 값으로 시작, 선택 시 채워짐
//     effluent: 0,
//     unit: "",
//     display: "Y",
//     remarks: "",
//   };

//   imperialTabGridData.value[activeTab.value] = [...currentData, newRow];
//   console.log('Imperial 행 추가됨:', newRow);

//   // 새로 추가된 행이 보이도록 스크롤 조정
//   nextTick(() => {
//     const imperialTabContent = document.querySelector('.tab-content-imperial .data-table-container.with-scroll');
//     if (imperialTabContent) {
//       imperialTabContent.scrollTop = imperialTabContent.scrollHeight;
//     } else {
//       // fallback: 일반적인 스크롤 컨테이너 찾기
//       const scrollContainer = document.querySelector('.tab-content-imperial .data-table-container');
//       if (scrollContainer) {
//         scrollContainer.scrollTop = scrollContainer.scrollHeight;
//       }
//     }
//   });
// };

// 모달용 Metric 데이터 추가 함수
const addModalMetricRow = () => {
  const currentData =
    metricFileData.value.length > 0
      ? metricFileData.value
      : currentMetricGridData.value;
  const newId =
    currentData.length > 0
      ? Math.max(...currentData.map((item) => item.id)) + 1
      : 1;

  const newRow: GridRow = {
    id: newId,
    item: "", // 빈 값으로 시작, 선택 시 채워짐
    effluent: 0,
    unit: "",
    active: "Y",
    remarks: "",
  };

  if (metricFileData.value.length > 0) {
    metricFileData.value = [...metricFileData.value, newRow];
  } else {
    metricFileData.value = [...currentMetricGridData.value, newRow];
  }
  console.log("모달 Metric 행 추가됨:", newRow);

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
      : currentImperialGridData.value;
  const newId =
    currentData.length > 0
      ? Math.max(...currentData.map((item) => item.id)) + 1
      : 1;

  const newRow: GridRow = {
    id: newId,
    item: "", // 빈 값으로 시작, 선택 시 채워짐
    effluent: 0,
    unit: "",
    active: "Y",
    remarks: "",
  };

  if (imperialFileData.value.length > 0) {
    imperialFileData.value = [...imperialFileData.value, newRow];
  } else {
    imperialFileData.value = [...currentImperialGridData.value, newRow];
  }
  console.log("모달 Imperial 행 추가됨:", newRow);

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
  const selectedParameter = outflowStore.waterQualityParameters.find(
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
      // effluent 값은 기본값이 있으면 설정, 없으면 0
      targetData[rowIndex].effluent = 0;
      targetData[rowIndex].remarks = selectedParameter.description || "";

      console.log("파라미터 선택됨:", {
        parameter: selectedParameter,
        rowIndex,
        isMetric,
        isModal,
        updatedRow: targetData[rowIndex],
      });
    }
  }
};

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

// 모달 관련 함수
const openModal = async () => {
  isModalOpen.value = true;
  newTabName.value = "";

  // 모달 오픈 시 수질 파라미터 데이터를 가져와서 DataTable에 표시
  try {
    console.log("모달 오픈 - 수질 파라미터 로드 시작");

    // 수질 파라미터 목록 조회
    await outflowStore.fetchWaterQualityParameters();

    if (
      outflowStore.waterQualityParameters &&
      outflowStore.waterQualityParameters.length > 0
    ) {
      console.log(
        "수질 파라미터 로드 완료:",
        outflowStore.waterQualityParameters
      );

      // Metric용 데이터 생성
      const metricData: GridRow[] = [];
      const imperialData: GridRow[] = [];

      outflowStore.waterQualityParameters.forEach((param, index) => {
        // Metric 데이터
        const metricRow: GridRow = {
          id: index + 1,
          item: param.parameter_name,
          effluent: 0, // 기본값
          unit: param.default_unit || "mg/L",
          active: "Y",
          remarks: param.description || "",
        };
        metricData.push(metricRow);

        // Imperial 데이터 (동일한 구조로 생성)
        const imperialRow: GridRow = {
          id: index + 1,
          item: param.parameter_name,
          effluent: 0, // 기본값
          unit: param.default_unit || "mg/L", // 실제로는 Imperial 단위로 변환해야 함
          active: "Y",
          remarks: param.description || "",
        };
        imperialData.push(imperialRow);
      });

      // 모달용 파일 데이터에 설정 (기존 파일 데이터가 없으면)
      if (metricFileData.value.length === 0) {
        metricFileData.value = metricData;
        console.log("Metric 데이터 설정 완료:", metricData.length, "개");
      }

      if (imperialFileData.value.length === 0) {
        imperialFileData.value = imperialData;
        console.log("Imperial 데이터 설정 완료:", imperialData.length, "개");
      }
    } else {
      console.log("수질 파라미터가 없습니다.");
    }
  } catch (error) {
    console.error("모달 오픈 시 수질 파라미터 로드 실패:", error);
  }
};

const closeModal = () => {
  isModalOpen.value = false;
  // 폼 초기화
  selectedOutputType.value = "";
  newOutflowTypeName.value = "";
  newOutflowTypeNameEn.value = "";
  uploadForm.value.title = "";
  selectedColor.value = "#3b82f6"; // 심볼 색상 초기화
  metricFileData.value = [];
  imperialFileData.value = [];
  metricFileName.value = "";
  imperialFileName.value = "";
};

// 수정 모달 관련 함수
const openUpdateModal = async () => {
  if (activeTab.value < 0 || !tabs.value[activeTab.value]) {
    alert(t("messages.warning.selectTabToEdit"));
    return;
  }

  const currentTab = tabs.value[activeTab.value];

  // 현재 탭의 데이터를 폼에 설정
  newOutflowTypeName.value = currentTab.name || "";

  // 원본 데이터에서 색상 정보 가져오기
  const originalWaterFlowType = outflowStore.waterFlowTypes.find(
    (wft) => wft.flow_type_id === currentTab.flow_type_id
  );
  selectedColor.value =
    originalWaterFlowType?.symbol_info?.symbol_color || "#3b82f6";
  uploadForm.value.title = originalWaterFlowType?.description || ""; // description을 비고 input에 설정

  // flow_type_code에서 공통코드 찾기
  if (currentTab.flow_type_code && outflowStore.commonCodes.length > 0) {
    const matchedCode = outflowStore.commonCodes.find(
      (code) => code.code_key === currentTab.flow_type_code
    );
    if (matchedCode) {
      selectedOutputType.value = matchedCode.code_key;
      newOutflowTypeNameEn.value = matchedCode.code_value_en || "";
    }
  }

  // 현재 탭의 Metric과 Imperial 데이터를 수정 폼에 복사
  if (metricTabGridData.value[activeTab.value]) {
    metricFileData.value = [...metricTabGridData.value[activeTab.value]];
  }
  if (imperialTabGridData.value[activeTab.value]) {
    imperialFileData.value = [...imperialTabGridData.value[activeTab.value]];
  }

  // // 현재 탭의 데이터로 폼 초기화
  // selectedOutputType.value = currentTab.flow_type_code || "";
  // newOutflowTypeName.value = currentTab.name || "";
  // newOutflowTypeNameEn.value = ""; // 영문명은 API에서 가져와야 함

  // // 현재 탭의 파라미터 데이터 로드
  // if (currentTab.flow_type_code) {
  //   await loadWaterFlowTypeParameters(currentTab.flow_type_code);
  // }

  // 모달 열기
  isUpdateModalOpen.value = true;

  console.log("수정 모달 열림:", {
    activeTab: activeTab.value,
    currentTab: currentTab,
    selectedOutputType: selectedOutputType.value,
  });
};

const closeUpdateModal = () => {
  isUpdateModalOpen.value = false;
  // 수정 폼 초기화
  selectedOutputType.value = "";
  newOutflowTypeName.value = "";
  newOutflowTypeNameEn.value = "";
  uploadForm.value.title = "";
  selectedColor.value = "#3b82f6"; // 심볼 색상 초기화
  metricFileData.value = [];
  imperialFileData.value = [];
  metricFileName.value = "";
  imperialFileName.value = "";
};

const updateTab = async () => {
  try {
    const currentTab = tabs.value[activeTab.value];
    if (!currentTab || !currentTab.flow_type_id) {
      alert(t("messages.warning.cannotFindDataToEdit"));
      return;
    }

    // 현재 탭의 원본 데이터에서 svg_symbol_id 가져오기
    const originalWaterFlowType = outflowStore.waterFlowTypes.find(
      (wft) => wft.flow_type_id === currentTab.flow_type_id
    );

    // 수정할 데이터 준비
    const updateData = {
      flow_type_name: newOutflowTypeName.value.trim(),
      flow_type_name_en: newOutflowTypeNameEn.value.trim() || undefined,
      description: uploadForm.value.title || undefined,
      svg_symbol_id: originalWaterFlowType?.svg_symbol_id, // SVG 심볼 ID 추가
      symbol_color: selectedColor.value, // 심볼 색상 추가
      is_active: true,
    };

    // 수정 API 호출
    const response = await outflowStore.updateWaterFlowType(
      currentTab.flow_type_id,
      updateData
    );

    // 수정 완료 후 목록 새로고침
    await loadWaterFlowTypes();

    // 모달 닫기
    closeUpdateModal();

    // API 응답의 message를 사용하거나 기본 메시지 표시
    const successMessage = translateMessage(
      response?.message,
      "messages.success.outflowTypeUpdateSuccess"
    );
    alert(successMessage);
  } catch (error: unknown) {
    console.error("유출종류 수정 실패:", error);

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

const createNewTab = async () => {
  if (!selectedOutputType.value) {
    alert(t("messages.warning.selectOutflowType"));
    return;
  }

  if (!newOutflowTypeName.value.trim()) {
    alert(t("messages.warning.enterOutflowTypeName"));
    return;
  }

  try {
    // Metric 파라미터 데이터 준비
    const metricParameters =
      metricFileData.value.length > 0
        ? metricFileData.value.map((item) => ({
            parameter_name: item.item,
            is_required: item.active === "Y",
            default_value: item.effluent,
            parameter_unit: item.unit,
            remarks: item.remarks || undefined,
          }))
        : undefined;

    // Imperial 파라미터 데이터 준비
    const imperialParameters =
      imperialFileData.value.length > 0
        ? imperialFileData.value.map((item) => ({
            parameter_name: item.item,
            is_required: item.active === "Y",
            default_value: item.effluent,
            parameter_unit: item.unit,
            remarks: item.remarks || undefined,
          }))
        : undefined;

    // 유출종류와 파라미터를 한 번에 등록
    const response = await outflowStore.createWaterFlowType({
      flow_type_code: selectedOutputType.value, // 선택된 공통코드의 code_key 사용
      flow_type_name: newOutflowTypeName.value.trim(),
      flow_type_name_en: newOutflowTypeNameEn.value.trim() || undefined,
      flow_direction: "EFFLUENT",
      description: uploadForm.value.title || undefined,
      symbol_color: selectedColor.value, // 심볼 색상 추가
      is_active: true,
      metric_parameters: metricParameters,
      imperial_parameters: imperialParameters,
    });

    // 폼 초기화
    selectedOutputType.value = "";
    newOutflowTypeName.value = "";
    newOutflowTypeNameEn.value = "";
    uploadForm.value.title = "";
    selectedColor.value = "#3b82f6"; // 심볼 색상 초기화
    metricFileData.value = [];
    imperialFileData.value = [];
    metricFileName.value = "";
    imperialFileName.value = "";

    closeModal();

    // 유출종류 목록을 다시 로드해서 탭 업데이트
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
      "messages.success.outflowTypeCreateSuccess"
    );
    alert(successMessage);
  } catch (error: unknown) {
    console.error("유출종류 또는 파라미터 등록 실패:", error);

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
</script>

<style scoped lang="scss">
@use "sass:color";

.outflow {
  padding: $spacing-xl;

  .page-content {
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
    overflow-x: auto;

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
      padding: $spacing-lg;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      min-width: 0; // flex 아이템이 컨테이너를 벗어나지 않도록
      overflow: hidden; // 내부 컨텐츠가 넘칠 때 숨김

      // 반응형 처리
      @media (max-width: 1024px) {
        min-width: 100%;
        padding: $spacing-md;
      }

      .section-header {
        margin-bottom: $spacing-lg;
        padding-bottom: $spacing-md;
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
        .action-bar,
        .actioin-bar {
          margin: $spacing-lg 0;
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
  padding-bottom: $spacing-md;
  margin-bottom: $spacing-lg;

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
  margin-top: $spacing-xl;
  padding-top: $spacing-lg;
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

// 수정 모달 스타일
.update-modal-content {
  max-width: 1440px !important;
  max-height: 890px !important;
  overflow-y: auto;
}

.update-modal-body {
  max-height: 750px;
  overflow-y: auto;
}
</style>
