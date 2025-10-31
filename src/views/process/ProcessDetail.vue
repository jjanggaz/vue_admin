<template>
  <div class="process-detail" :class="props.class">
    <!-- 공정 기본 정보 -->
    <div class="process-info-section">
      <div class="form-header">
        <div class="form-grid">
          <div class="form-group">
            <label class="required"
              >단위 <span class="required-mark">*</span></label
            >
            <select
              v-model="selectedUnit"
              @change="handleUnitChange"
              :class="{ error: !selectedUnit }"
              :disabled="!props.isRegisterMode"
            >
              <option value="">{{ t("common.select") }}</option>
              <option
                v-for="unit in unitSystems"
                :key="unit.unit_system_id"
                :value="unit.system_code"
              >
                {{ unit.system_name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="required"
              >{{ t("process.processType") }}
              <span class="required-mark">*</span></label
            >
            <select
              :value="processStore.processDetail.processType || ''"
              @change="handleProcessTypeChange"
              :key="`processType-${(filteredProcessTypeOptions?.length || 0)}`"
              :disabled="!props.isRegisterMode"
            >
              <option value="">{{ t("common.select") }}</option>
              <option
                v-for="option in (filteredProcessTypeOptions || [])"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="required"
              >{{ t("process.subCategory") }}
              <span class="required-mark">*</span></label
            >
            <select
              :value="processStore.processDetail.subCategory || ''"
              @change="handleSubCategoryChange"
              :key="`subCategory-${(processStore.searchSubCategoryOptions?.length || 0)}`"
              :disabled="!props.isRegisterMode"
            >
              <option value="">{{ t("common.select") }}</option>
              <option
                v-for="option in (processStore.searchSubCategoryOptions || [])"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="required"
              >{{ t("process.processName") }}
              <span class="required-mark">*</span></label
            >
            <select
              :value="processStore.processDetail.processName || ''"
              @change="handleProcessNameChange"
              :key="`processName-${(processStore.searchProcessNameOptions?.length || 0)}`"
              :disabled="!props.isRegisterMode"
            >
              <option value="">{{ t("common.select") }}</option>
              <option
                v-for="option in (processStore.searchProcessNameOptions || [])"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ t("process.processSymbol") }}</label>
            <div class="file-input-group">
              <input
                type="file"
                accept=".svg"
                @change="handleFileChange('processSymbol', $event)"
                style="display: none"
                ref="processSymbolInput"
              />
              <button
                type="button"
                @click="processSymbolInput?.click()"
                class="file-select-btn"
              >
                {{ t("common.selectFile") }}
              </button>
              <span class="selected-file">
                <div style="position: relative; display: inline-block;">
                  <span
                    v-if="!processStore.processSymbolPreviewUrl"
                    style="color: #6b7280; font-size: 14px; font-style: italic; display: block; padding: 40px 10px; text-align: center;"
                  >
                    {{ t("common.noFile") }}
                  </span>
                  <img
                    v-else
                    :src="processStore.processSymbolPreviewUrl"
                    alt="공정심볼 미리보기"
                    style="max-width: 100px; max-height: 100px; vertical-align: middle; display: block;"
                  />
                  <button
                    v-if="(processStore.processDetail.symbolId && processStore.processDetail.symbolId !== '00000000-0000-0000-0000-000000000000') || processStore.processSymbolPreviewUrl"
                    @click="handleDeleteProcessSymbol"
                    title="심볼 삭제"
                    style="position: absolute; top: 0; right: 0; width: 20px; height: 20px; border-radius: 0; border: none; background-color: rgba(0, 0, 0, 0.5); color: white; font-size: 18px; font-weight: normal; font-family: Arial, sans-serif; line-height: 1; text-align: center; cursor: pointer; transition: background-color 0.2s; z-index: 10; padding: 1px 0 0 0; margin: 0;"
                    @mouseover="$event.target.style.backgroundColor='rgba(0,0,0,0.7)'"
                    @mouseout="$event.target.style.backgroundColor='rgba(0,0,0,0.5)'"
                  >
                    ×
                  </button>
                </div>
                <button
                  v-if="processStore.processDetail.symbolId && processStore.processDetail.symbolId !== '00000000-0000-0000-0000-000000000000'"
                  @click="downloadProcessSymbol"
                  class="btn btn-sm btn-outline-primary download-btn"
                  title="공정심볼 다운로드"
                  style="margin-left: 10px; vertical-align: middle;"
                >
                  <i class="fas fa-download"></i>
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- 등록 버튼을 우측 위에 배치 -->
        <div class="register-button-container">
          <button @click="handleMainSave" class="btn btn-primary save-btn">
            등록
          </button>
        </div>
      </div>
    </div>

    <!-- 파일명 규칙 안내 -->
    <div style="color: red; padding: 10px 15px; margin-bottom: 15px; text-align: center;">
      ⚠️ 파일명 규칙: 영문만 사용, 공백 불가, 100자 이내, 특수 기호는 "_ - ()"만 허용합니다.
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <!-- 계산식 관리 섹션 -->
      <div class="formula-section">
        <div class="tab-header">
          <div class="grid-title">
            <h4>계산식</h4>
          </div>
          <div
            class="tab-actions"
            v-if="!props.isRegisterMode || isBasicInfoRegistered"
          >
            <button @click="openFormulaModal" class="btn btn-primary">
              {{ t("common.add") }}
            </button>
            <button
              @click="handleFormulaDelete"
              class="btn btn-danger"
              :disabled="!selectedFormulaItems || (Array.isArray(selectedFormulaItems) && selectedFormulaItems.length === 0)"
            >
              {{ t("common.delete") }}
            </button>
            <button @click="handleFormulaSave" class="btn btn-success">
              저장
            </button>
          </div>
        </div>

        <!-- 공정 등록 모드에서 기본정보 미등록 시 안내 메시지 -->
        <div
          v-if="props.isRegisterMode && !isBasicInfoRegistered"
          class="formula-placeholder"
        >
          <div class="placeholder-message">
            <p>{{ t("process.registerBasicInfoFirst") }}</p>
          </div>
        </div>

        <DataTable
          v-if="!props.isRegisterMode || isBasicInfoRegistered"
          :columns="formulaColumns"
          :data="processStore.formulaList || []"
          :selectable="false"
          :max-height="formulaTableMaxHeight"
          :key="formulaTableKey"
        >
          <template #cell-select="{ item, index }">
            <input
              type="radio"
              :name="`formulaSelect`"
              :value="item"
              v-model="selectedFormulaItems"
              @change="handleFormulaSelectionChange"
            />
          </template>
          <template #cell-file_name="{ item, index }">
            <div class="formula-name-container">
              <div class="file-selection-group">
                <input
                  type="file"
                  accept=".py"
                  @change="handleFormulaFileChange(item, $event)"
                  style="display: none"
                  :data-formula-input="item.id"
                />
                <button
                  type="button"
                  @click="selectFormulaFile(item)"
                  class="file-select-btn"
                >
                  {{ t("common.selectFile") }}
                </button>
                <span class="selected-file">
                  {{ item.file_name || (item as any)?._file?.name || t("common.noFile") }}
                  <button
                    v-if="item.formula_id"
                    @click="downloadFormulaFromList(item)"
                    class="btn btn-sm btn-outline-primary download-btn"
                    title="계산식 다운로드"
                  >
                    <i class="fas fa-download"></i>
                  </button>
                </span>
              </div>
            </div>
          </template>
          <template #cell-component="{ item, index }">
            <button
              class="file-select-btn"
              @click="toggleComponentsGrid(item, index)"
              :title="'컴포넌트 목록 보기'"
            >
              컴포넌트
            </button>
          </template>
          <template #cell-registrationDate="{ item }">
            {{ formatDateTime(item.registrationDate) }}
          </template>
        </DataTable>

        <!-- Components 목록 섹션 -->
        <div v-if="showComponentsGrid" class="components-section">
          <div class="tab-header">
            <div class="grid-title">
              <h4>Components 목록</h4>
            </div>
            <div class="tab-actions">
              <button @click="closeComponentsGrid" class="btn btn-secondary">
                닫기
              </button>
            </div>
          </div>

          <DataTable
            :columns="componentsColumns"
            :data="componentsList"
            :selectable="false"
          >
            <template #cell-category="{ item }">
              <span>{{ item.category }}</span>
            </template>
            <template #cell-component="{ item }">
              <span>{{ item.component }}</span>
            </template>
            <template #cell-type="{ item }">
              <span>{{ item.type }}</span>
            </template>
            <template #cell-codeKey="{ item }">
              <span>{{ item.codeKey }}</span>
            </template>
            <template #cell-item="{ item }">
              <span>{{ item.item }}</span>
            </template>
          </DataTable>
        </div>

        <!-- 공정카드 섹션 -->
        <div class="pfd-section">
          <div class="tab-header">
            <div class="grid-title">
              <h4>공정카드</h4>
            </div>
            <div
              class="tab-actions"
              v-if="
                !props.isRegisterMode ||
                (props.isRegisterMode && isBasicInfoRegistered)
              "
            >
              <button @click="openPfdModal" class="btn btn-primary">
                {{ t("common.add") }}
              </button>
              <button
                @click="handlePfdDelete"
                class="btn btn-danger"
                :disabled="selectedPfdItems.length === 0"
              >
                {{ t("common.delete") }}
              </button>
              <button @click="handlePfdSave" class="btn btn-success">
                저장
              </button>
            </div>
          </div>

          <!-- 공정 등록 모드에서 기본정보 미등록 시 안내 메시지 -->
          <div
            v-if="props.isRegisterMode && !isBasicInfoRegistered"
            class="formula-placeholder"
          >
            <div class="placeholder-message">
              <p>{{ t("process.registerBasicInfoForPfd") }}</p>
            </div>
          </div>

          <DataTable
            v-if="
              !props.isRegisterMode ||
              (props.isRegisterMode && isBasicInfoRegistered)
            "
            :columns="pfdColumns"
            :data="processStore.pfdList || []"
            :selectable="false"
            :max-height="pfdTableMaxHeight"
            :sticky-header="pfdTableMaxHeight !== 'auto'"
          >
            <template #cell-select="{ item, index }">
              <input
                type="radio"
                :name="`pfdSelect`"
                :value="item"
                v-model="selectedPfdItems"
                @change="handlePfdSelectionChange"
              />
            </template>
            <template #cell-pfdFileName="{ item, index }">
              <div class="pfd-filename-container">
                <div class="file-selection-group">
                  <input
                    type="file"
                    accept=".dwg,.pdf,.png,.jpg,.jpeg"
                    @change="handlePfdFileChange(item, $event)"
                    style="display: none"
                    :data-pfd-input="item.id"
                  />
                  <button
                    type="button"
                    @click="selectPfdFile(item)"
                    class="file-select-btn"
                  >
                    {{ t("common.selectFile") }}
                  </button>
                  <span class="selected-file">
                    {{ item.pfdFileName || t("common.noFile") }}
                    <button
                      v-if="
                        item.drawing_id &&
                        !item.drawing_id.startsWith('temp_pfd_drawing_')
                      "
                      @click="downloadPfd(item.drawing_id)"
                      class="btn btn-sm btn-outline-primary download-btn"
                      title="공정카드 다운로드"
                    >
                      <i class="fas fa-download"></i>
                    </button>
                  </span>
                </div>
              </div>
            </template>
            <template #cell-svgFile="{ item }">
              <div class="file-selection-group">
                <input
                  type="file"
                  accept=".svg"
                  @change="handleSvgFileChange(item, $event)"
                  style="display: none"
                  :data-svg-input="item.id"
                />
                <button
                  type="button"
                  @click="selectSvgFile(item)"
                  class="file-select-btn"
                >
                  {{ t("common.selectFile") }}
                </button>
                <span class="selected-file">
                  {{ getSvgFileName(item) }}
                  <button
                    v-if="hasValidSvgFile(item)"
                    @click="downloadPfdSvgFile(item)"
                    class="btn btn-sm btn-outline-primary download-btn"
                    title="Svg 파일 다운로드"
                  >
                    <i class="fas fa-download"></i>
                  </button>
                </span>
              </div>
            </template>
            <template #cell-mappingPidList="{ item }">
              <button
                class="btn btn-sm btn-primary"
                :disabled="
                  !item.drawing_id ||
                  item.drawing_id.startsWith('temp_pfd_drawing_')
                "
                @click="openMappingPidModal(item)"
                :title="
                  !item.drawing_id ||
                  item.drawing_id.startsWith('temp_pfd_drawing_')
                    ? 'PFD를 먼저 저장해주세요'
                    : item.hasPidMapping
                    ? 'P&ID 매핑 보기'
                    : 'P&ID 매핑 추가'
                "
              >
                P&ID
              </button>
            </template>
          </DataTable>
        </div>
      </div>

      <!-- P&ID 목록 섹션 -->
      <div v-if="showPidListInMain" class="pid-section">
        <div class="tab-header">
          <div class="grid-title">
            <h4>P&ID</h4>
          </div>
          <div class="tab-actions">
            <button class="btn btn-primary" @click="addMappingPidRow">
              추가
            </button>
            <button
              class="btn btn-danger"
              @click="deleteSelectedMappingPidItems"
              :disabled="!selectedMappingPidItems || (Array.isArray(selectedMappingPidItems) && selectedMappingPidItems.length === 0)"
            >
              삭제
            </button>
            <button @click="confirmMappingPid" class="btn btn-success">
              저장
            </button>
            <button @click="closePidListInMain" class="btn btn-secondary">
              닫기
            </button>
          </div>
        </div>

        <DataTable
          :columns="mappingPidColumns"
          :data="mappingPidList || []"
          :selectable="false"
          :max-height="pidTableMaxHeight"
          :sticky-header="pidTableMaxHeight !== 'auto'"
        >
          <template #cell-select="{ item, index }">
            <input
              type="radio"
              :name="`pidSelect`"
              :value="item"
              v-model="selectedMappingPidItems"
              @change="handleMappingPidSelectionChange"
            />
          </template>
          <template #cell-pidFile="{ item }">
            <div class="file-selection-group">
              <button
                class="btn btn-sm btn-primary"
                @click="selectPidFile(item)"
              >
                파일선택
              </button>
              <span v-if="item.pidFileName" class="selected-file">
                {{ item.pidFileName }}
                <button
                  v-if="item.pidFileName"
                  @click="downloadPid(item.drawing_id)"
                  class="btn btn-sm btn-outline-primary download-btn"
                  title="P&ID 다운로드"
                >
                  <i class="fas fa-download"></i>
                </button>
              </span>
              <span v-else class="no-file">{{ t("common.noFile") }}</span>
            </div>
          </template>
          <template #cell-excelFile="{ item }">
            <div class="file-selection-group">
              <button
                class="btn btn-sm btn-primary"
                @click="selectExcelFile(item)"
                :disabled="
                  !item.drawing_id ||
                  item.drawing_id.startsWith('temp_pid_drawing_')
                "
                :title="
                  !item.drawing_id ||
                  item.drawing_id.startsWith('temp_pid_drawing_')
                    ? 'P&ID 파일을 먼저 저장해주세요'
                    : '매핑 Excel 파일 선택'
                "
              >
                파일선택
              </button>
              <span
                v-if="item.excelFileName || item.excel_file_name"
                class="selected-file"
              >
                {{ item.excel_file_name || item.excelFileName }}
                <button
                  v-if="item.excelFileName || item.excel_file_name"
                  @click="
                    downloadMappingExcel(
                      item.excel_drawing_id,
                      item.excel_file_name || item.excelFileName
                    )
                  "
                  class="btn btn-sm btn-outline-primary download-btn"
                  title="매핑 Excel 다운로드"
                >
                  <i class="fas fa-download"></i>
                </button>
                <span
                  v-else-if="
                    (item.excel_file_name || item.excelFileName) &&
                    !item.excel_drawing_id
                  "
                  class="text-muted"
                  style="font-size: 11px"
                  title="excel_drawing_id가 없어 다운로드할 수 없습니다"
                >
                  (다운로드 불가)
                </span>
              </span>
              <span v-else class="no-file">{{ t("common.noFile") }}</span>
            </div>
          </template>
          <template #cell-svgFile="{ item }">
            <div class="file-selection-group">
              <button
                class="btn btn-sm btn-primary"
                @click="selectSvgFileForPid(item)"
                :disabled="
                  !item.drawing_id ||
                  item.drawing_id.startsWith('temp_pid_drawing_')
                "
                :title="
                  !item.drawing_id ||
                  item.drawing_id.startsWith('temp_pid_drawing_')
                    ? 'P&ID 파일을 먼저 저장해주세요'
                    : 'Svg 도면 파일 선택'
                "
              >
                파일선택
              </button>
              <span
                v-if="item.svgFileName || item.svg_file_name"
                class="selected-file"
              >
                {{ item.svg_file_name || item.svgFileName }}
                <button
                  v-if="item.svgFileName || item.svg_file_name"
                  @click="
                    downloadMappingSvg(
                      item.svg_drawing_id,
                      item.svg_file_name || item.svgFileName
                    )
                  "
                  class="btn btn-sm btn-outline-primary download-btn"
                  title="매핑 Svg 다운로드"
                >
                  <i class="fas fa-download"></i>
                </button>
                <span
                  v-else-if="
                    (item.svg_file_name || item.svgFileName) &&
                    !item.svg_drawing_id
                  "
                  class="text-muted"
                  style="font-size: 11px"
                  title="svg_drawing_id가 없어 다운로드할 수 없습니다"
                >
                  (다운로드 불가)
                </span>
              </span>
              <span v-else class="no-file">{{ t("common.noFile") }}</span>
            </div>
          </template>
          <template #cell-pidComponent="{ item }">
            <button
              class="btn btn-sm btn-primary"
              :disabled="
                !item.drawing_id ||
                item.drawing_id.startsWith('temp_pid_drawing_') ||
                !isPidRowSaved(item)
              "
              @click="openPidComponentModal(item)"
              :title="
                !isPidRowSaved(item)
                  ? 'P&ID를 먼저 저장해주세요'
                  : 'P&ID 컴포넌트'
              "
            >
              P&ID 컴포넌트
            </button>
          </template>
        </DataTable>
      </div>

      <!-- Hidden file inputs -->
      <input
        type="file"
        accept=".dwg"
        @change="handlePidFileSelected"
        style="display: none"
        ref="pidFileInput"
      />
      <input
        type="file"
        accept=".xlsx,.xls"
        @change="handleExcelFileSelected"
        style="display: none"
        ref="excelFileInput"
      />
      <input
        type="file"
        accept=".svg"
        @change="handleSvgFileSelected"
        style="display: none"
        ref="svgFileInput"
      />
    </div>

    <!-- P&ID 컴포넌트 섹션 -->
    <div v-if="showPidComponentSection" class="pid-component-section">
      <div class="tab-header">
        <div class="grid-title">
          <h4>P&ID Components</h4>
        </div>
        <div class="tab-actions">
          <button @click="handlePidComponentSave" class="btn btn-success">
            저장
          </button>
          <button @click="closePidComponentSection" class="btn btn-secondary">
            닫기
          </button>
        </div>
      </div>

      <DataTable
        :columns="pidComponentColumns"
        :data="pidComponentList || []"
        :selectable="false"
        :max-height="pidComponentTableMaxHeight"
        :sticky-header="pidComponentTableMaxHeight !== 'auto'"
      >
        <template #cell-select="{ item, index }">
          <input
            type="checkbox"
            :value="item"
            v-model="selectedPidComponentItems"
            @change="handlePidComponentSelectionChange"
          />
        </template>
        <template #cell-no="{ item, index }">
          <span>{{ item.no || index + 1 }}</span>
        </template>
        <template #cell-pid_id="{ item }">
          <input
            v-model.number="item.input_poc"
            type="number"
            class="form-control"
            placeholder="POC IN 입력"
            min="0"
            step="1"
          />
        </template>
        <template #cell-category="{ item }">
          <input
            type="text"
            :value="item.category"
            class="form-control"
            readonly
            disabled
            placeholder="구분"
          />
        </template>
        <template #cell-middleCategory="{ item }">
          <input
            type="text"
            :value="item.middleCategory"
            class="form-control"
            readonly
            disabled
            placeholder="중분류"
          />
        </template>
        <template #cell-smallCategory="{ item }">
          <input
            type="text"
            :value="item.smallCategory"
            class="form-control"
            readonly
            disabled
            placeholder="소분류"
          />
        </template>
        <template #cell-equipmentType="{ item }">
          <input
            type="text"
            :value="item.equipmentType || ''"
            class="form-control"
            readonly
            disabled
          />
        </template>
        <template #cell-standard_quantity="{ item }">
          <input
            type="number"
            v-model="item.standard_quantity"
            class="form-control"
            placeholder="0"
            min="0"
            step="1"
          />
        </template>
        <template #cell-spare_quantity="{ item }">
          <input
            type="number"
            v-model="item.spare_quantity"
            class="form-control"
            placeholder="0"
            min="0"
            step="1"
          />
        </template>
      </DataTable>
    </div>
  </div>

  <!-- 계산식 파일 첨부 모달 -->
  <div
    v-if="processStore.showFormulaModal"
    class="modal-overlay"
    @click="closeFormulaModal"
  >
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ t("process.formulaFileAttachment") }}</h3>
        <button @click="closeFormulaModal" class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="file-input-group">
          <input
            type="file"
            multiple
            accept=".py"
            @change="handleFormulaFilesSelected"
            style="display: none"
            ref="formulaFileInput"
          />
          <button @click="formulaFileInput?.click()" class="btn btn-primary">
            {{ t("common.selectFiles") }}
          </button>
          <span class="selected-files-info">
            {{
              selectedFormulaFiles.length > 0
                ? `${selectedFormulaFiles.length}개 파일 선택됨`
                : t("common.noFilesSelected")
            }}
          </span>
        </div>

        <div v-if="selectedFormulaFiles.length > 0" class="selected-files-list">
          <h4>{{ t("common.selectedFiles") }}:</h4>
          <ul>
            <li v-for="file in selectedFormulaFiles" :key="file.name">
              {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
            </li>
          </ul>
        </div>
      </div>
      <div class="modal-footer">
        <button
          @click="uploadFormulaFiles"
          class="btn btn-primary"
          :disabled="!selectedFormulaFiles.length"
        >
          {{ t("common.upload") }}
        </button>
        <button @click="closeFormulaModal" class="btn btn-secondary">
          {{ t("common.cancel") }}
        </button>
      </div>
    </div>
  </div>
  <!-- 공정카드 파일 첨부 모달 -->
  <div v-if="showPfdModal" class="modal-overlay" @click="closePfdModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ t("process.pfdFileAttachment") }}</h3>
        <button @click="closePfdModal" class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="file-input-group">
          <input
            type="file"
            multiple
            accept=".dwg,.pdf,.png,.jpg,.jpeg"
            @change="handlePfdFilesSelected"
            style="display: none"
            ref="pfdFileInput"
          />
          <button @click="pfdFileInput?.click()" class="btn btn-primary">
            {{ t("common.selectFiles") }}
          </button>
          <span class="selected-files-info">
            {{
              selectedPfdFiles.length > 0
                ? `${selectedPfdFiles.length}개 파일 선택됨`
                : t("common.noFilesSelected")
            }}
          </span>
        </div>

        <div v-if="selectedPfdFiles.length > 0" class="selected-files-list">
          <h4>{{ t("common.selectedFiles") }}:</h4>
          <ul>
            <li v-for="file in selectedPfdFiles" :key="file.name">
              {{ file.name }} ({{ (file.size / 1024).toFixed(2) }} KB)
            </li>
          </ul>
        </div>
      </div>
      <div class="modal-footer">
        <button
          @click="uploadPfdFiles"
          class="btn btn-primary"
          :disabled="!selectedPfdFiles.length"
        >
          {{ t("common.upload") }}
        </button>
        <button @click="closePfdModal" class="btn btn-secondary">
          {{ t("common.cancel") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useProcessStore } from "@/stores/processStore";
import DataTable from "@/components/common/DataTable.vue";
import type { TableColumn } from "@/types/components";
import { request } from "@/utils/request";

// Props 정의
interface Props {
  processId?: string;
  processCode?: string;
  class?: string; // class 속성 추가
  isRegisterMode?: boolean; // 공정 등록 모드 여부
  initialProcessType?: string | null; // 초기 공정구분 값
  initialSubCategory?: string | null; // 초기 공정 중분류 값
}

const props = withDefaults(defineProps<Props>(), {
  processId: "",
  processCode: "",
  class: "",
  isRegisterMode: false,
  initialProcessType: null,
  initialSubCategory: null,
});

// Emits 정의
const emit = defineEmits<{
  "update-success": [];
}>();

// Composables
const route = useRoute();
const { t } = useI18n();
const processStore = useProcessStore();

// 공정 등록/수정 화면에서는 'INP_OUTP' (유입/유출) 항목 제외
const filteredProcessTypeOptions = computed(() => {
  return processStore.processTypeOptions.filter(
    (option) => option.value !== "INP_OUTP"
  );
});

// Reactive references
const selectedFormulaItems = ref<any[]>([]);
const selectedPfdItems = ref<any[]>([]);
const selectedFormulaFiles = ref<File[]>([]);
const selectedPfdFiles = ref<File[]>([]);
const processSymbolInput = ref<HTMLInputElement | null>(null);
const formulaFileInput = ref<HTMLInputElement | null>(null);
const pfdFileInput = ref<HTMLInputElement | null>(null);

// P&ID 매핑 관련 상태
const currentPfdItemForMapping = ref<any>(null);
const currentPidItemForMapping = ref<any>(null); // P&ID 파일 선택용 참조 변수
const mappingPidList = ref<any[]>([]);
const selectedMappingPidItems = ref<any[]>([]);
const initialMappingPidList = ref<any[]>([]); // 초기 P&ID 목록 데이터 저장

// Svg 파일 관련 상태
const currentPfdItemForSvg = ref<any>(null);
const currentPidItemForSvg = ref<any>(null);
const svgFileInput = ref<HTMLInputElement>();

// P&ID 컴포넌트 관련 상태
const pidComponentList = ref<any[]>([]);
const selectedPidComponentItems = ref<any[]>([]);
const currentDrawingId = ref<string>(""); // 현재 선택된 drawing_id 저장
const deletedPidComponentIds = ref<any>([]); // 삭제된 컴포넌트 ID들 추적

// P&ID 컴포넌트 추가 버튼 비활성화 여부 (제한 없음)
// P&ID 컴포넌트 select 옵션 데이터
const categoryOptions = ref([
  { value: null, label: "선택하세요" },
  { value: "STRUCT_WWTP", label: "토목" },
  { value: "EQUIP", label: "기계" },
]);

// 중분류 옵션 (동적으로 로드됨)
const middleCategoryOptions = ref([{ value: null, label: "선택하세요" }]);

// 소분류 옵션 (동적으로 로드됨)
const smallCategoryOptions = ref([{ value: null, label: "선택하세요" }]);

// 장비유형 옵션 (동적으로 로드됨)
const equipmentTypeOptions = ref([{ value: null, label: "선택하세요" }]);

// P&ID 목록 메인화면 표시 상태
const showPidListInMain = ref(false);

// 공정카드 섹션 표시 상태
const showPfdSection = ref(false);

// Components 그리드 표시 상태
const showComponentsGrid = ref(false);
const componentsList = ref<any[]>([]);
const currentFormulaItem = ref<any>(null);

// P&ID 컴포넌트 섹션 표시 여부
const showPidComponentSection = ref(false);
const selectedPidForComponent = ref<any>(null);
const pidComponentDrawingId = ref<string>(""); // P&ID Components용 drawing_id 저장

// 변경사항 추적용 초기 상태 저장
const initialFormulaList = ref<any[]>([]);
const initialPidComponentList = ref<any[]>([]);

// 기본정보 등록 완료 상태 (공정 등록 모드에서만 사용)
const isBasicInfoRegistered = ref(false);

// 생성된 공정 ID (공정 등록 모드에서만 사용)
const createdProcessId = ref<string | null>(null);

// P&ID 매핑 모달 파일 입력 refs
const pidFileInput = ref<HTMLInputElement>();
const excelFileInput = ref<HTMLInputElement>();

// 단위 선택
const selectedUnit = ref("");

// 단위 시스템 옵션 (Pipe.vue 패턴 참조, 추후 API에서 로드하도록 변경 가능)
const unitSystems = ref<
  Array<{
    unit_system_id: string;
    system_name: string;
    system_code: string;
    description: string;
    is_active: boolean;
  }>
>([
  {
    unit_system_id: "1",
    system_name: "Metric",
    system_code: "METRIC",
    description: "Metric System",
    is_active: true,
  },
  {
    unit_system_id: "2",
    system_name: "Uscs",
    system_code: "USCS",
    description: "US Customary System",
    is_active: true,
  },
]);

// 필수 입력 검증을 위한 computed 속성들
const hasProcessSymbolFile = computed(() => {
  return !!(
    processStore.selectedFiles["processSymbol"] ||
    (processStore.processDetail.processSymbol &&
      processStore.processDetail.processSymbol.trim() !== "")
  );
});

// 렌더 키 (계산식 그리드 강제 리렌더용)
const formulaTableKey = ref(0);

// 그리드 스크롤 높이: 10건 초과 시 스크롤 적용
const formulaTableMaxHeight = computed(() =>
  ((Array.isArray(processStore.formulaList)
    ? processStore.formulaList.length
    : (processStore.formulaList as any)?.length || 0) > 10)
    ? "420px"
    : "auto"
);
const pfdTableMaxHeight = computed(() =>
  ((Array.isArray(processStore.pfdList)
    ? processStore.pfdList.length
    : (processStore.pfdList as any)?.length || 0) > 10)
    ? "420px"
    : "auto"
);
const pidTableMaxHeight = computed(() =>
  (((mappingPidList as any)?.value?.length || (mappingPidList as any)?.length || 0) > 10)
    ? "420px"
    : "auto"
);
const pidComponentTableMaxHeight = computed(() =>
  (((pidComponentList as any)?.value?.length || (pidComponentList as any)?.length || 0) > 10)
    ? "420px"
    : "auto"
);

// 컬럼 정의
const formulaColumns: TableColumn[] = [
  { key: "select", title: "선택", sortable: false },
  { key: "no", title: "No.", sortable: false },
  { key: "file_name", title: "등록 계산식", sortable: false },
  { key: "registrationDate", title: "등록일자", sortable: false },
  { key: "component", title: "컴포넌트", sortable: false, hidden: true },
  { key: "formula_id", title: "Formula ID", sortable: false, hidden: true },
  {
    key: "process_dependencies",
    title: "Process Dependencies",
    sortable: false,
    hidden: true,
  },
];

const pfdColumns: TableColumn[] = [
  { key: "select", title: "선택", sortable: false },
  { key: "no", title: "No.", sortable: false },
  { key: "pfdFileName", title: "공정카드 파일", sortable: false },
  { key: "svgFile", title: "Svg 파일", sortable: false },
  { 
    key: "registrationDate", 
    title: "등록일자", 
    sortable: false,
    formatter: (value: any, item: any) => {
      return item?.registrationDate || item?.created_at || value || '-';
    }
  },
  { key: "mappingPidList", title: "매핑 P&ID 목록", sortable: false },
  { key: "symbol_id", title: "Symbol ID", sortable: false, hidden: true },
];

const componentsColumns: TableColumn[] = [
  { key: "category", title: "분류", sortable: false },
  { key: "component", title: "Components", sortable: false },
  { key: "type", title: "유형", sortable: false },
  { key: "codeKey", title: "코드 키", sortable: false },
  { key: "item", title: "ITEM", sortable: false },
];

// P&ID 매핑 목록 컬럼 정의
const mappingPidColumns: TableColumn[] = [
  { key: "select", title: "선택", sortable: false },
  { key: "no", title: "No.", sortable: false },
  { key: "pidFile", title: "P&ID", sortable: false },
  { key: "excelFile", title: "매핑 Excel", sortable: false },
  { key: "svgFile", title: "Svg 도면", sortable: false },
  { key: "pidComponent", title: "P&ID 컴포넌트", sortable: false },
  {
    key: "excel_drawing_id",
    title: "Excel Drawing ID",
    sortable: false,
    hidden: true,
  },
  {
    key: "svg_drawing_id",
    title: "Svg Drawing ID",
    sortable: false,
    hidden: true,
  },
];

// P&ID 컴포넌트 컬럼 정의
const pidComponentColumns: TableColumn[] = [
  { key: "select", title: "선택", sortable: false, width: "60px" },
  { key: "no", title: "No.", sortable: false, width: "50px" },
  { key: "pid_id", title: "POC IN", sortable: false, width: "80px" },
  { key: "category", title: "구분", sortable: false, width: "100px" },
  { key: "smallCategory", title: "대분류", sortable: false, width: "120px" },
  { key: "middleCategory", title: "중분류", sortable: false, width: "120px" },
  { key: "equipmentType", title: "유형", sortable: false, width: "250px" },
  {
    key: "standard_quantity",
    title: "총수량",
    sortable: false,
    width: "80px",
  },
  {
    key: "spare_quantity",
    title: "수량(예비)",
    sortable: false,
    width: "80px",
    hidden: true,
  },
];

// 유틸리티 함수들 (사용하지 않음)
// const extractFileNameFromUri = (uri: string): string => {
//   if (!uri) return '';
//   const parts = uri.split('/');
//   return parts[parts.length - 1] || uri;
// };

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// 날짜를 YYYY-MM-DD 포맷으로 변환하는 헬퍼 함수
const formatDateString = (
  dateValue: string | Date | undefined | null
): string => {
  if (!dateValue) return "";

  // 이미 YYYY-MM-DD 포맷인 경우
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  // Date 객체인 경우
  if (dateValue instanceof Date) {
    return formatDate(dateValue);
  }

  // ISO 문자열인 경우
  if (typeof dateValue === "string") {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return formatDate(date);
      }
    } catch (e) {
      console.warn("날짜 파싱 실패:", dateValue);
    }
  }

  return "";
};

// 날짜를 YYYY-MM-DD HH:MI 형식으로 변환하는 헬퍼 함수
const formatDateTime = (
  dateValue: string | Date | undefined | null
): string => {
  if (!dateValue) {
    return "";
  }

  // 이미 "YYYY-MM-DD HH:MI" 형식인 경우 그대로 반환
  if (typeof dateValue === "string") {
    const trimmedValue = dateValue.trim();
    
    // 이미 포맷된 형식 체크 (YYYY-MM-DD HH:MI 또는 YYYY-MM-DD HH:MM)
    const alreadyFormattedPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    if (alreadyFormattedPattern.test(trimmedValue)) {
      return trimmedValue;
    }
    
    // 문자열이 비어있으면 빈 문자열 반환
    if (trimmedValue === "") {
      return "";
    }
  }

  let date: Date;
  
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === "string") {
    try {
      date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return "";
      }
    } catch (e) {
      return "";
    }
  } else {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Svg 파일명 가져오는 함수
const getSvgFileName = (item: any): string => {
  // 1. svgFileName이 있으면 사용
  if (item.svgFileName) {
    return item.svgFileName;
  }

  // 2. symbol_uri가 있으면 경로에서 파일명 추출
  if (item.symbol_uri) {
    try {
      // 절대 URL인지 확인
      if (
        item.symbol_uri.startsWith("http://") ||
        item.symbol_uri.startsWith("https://")
      ) {
        // 절대 URL인 경우
        const url = new URL(item.symbol_uri);
        const pathname = url.pathname;
        const fileName = pathname.split("/").pop(); // 마지막 경로 세그먼트를 파일명으로 사용

        if (fileName && fileName.trim() !== "") {
          return fileName;
        }
      } else {
        // 상대 경로인 경우 직접 파일명 추출
        const uri = item.symbol_uri;
        const lastSlashIndex = uri.lastIndexOf("/");
        if (lastSlashIndex !== -1) {
          const fileName = uri.substring(lastSlashIndex + 1);
          if (fileName && fileName.trim() !== "") {
            return fileName;
          }
        }
      }
    } catch (error) {
      console.warn("symbol_uri 파싱 실패:", error);

      // 파싱 실패 시 문자열에서 파일명 추출 시도
      const uri = item.symbol_uri;
      const lastSlashIndex = uri.lastIndexOf("/");
      if (lastSlashIndex !== -1) {
        const fileName = uri.substring(lastSlashIndex + 1);
        if (fileName && fileName.trim() !== "") {
          return fileName;
        }
      }
    }
  }

  // 3. symbol_id가 있고 pfdFileName이 있으면 확장자를 .svg로 치환
  if (item.symbol_id && item.pfdFileName) {
    const pfdFileName = item.pfdFileName;
    // 확장자 제거 후 .svg 추가
    const baseName = pfdFileName.replace(/\.[^/.]+$/, "");
    return `${baseName}.svg`;
  }

  // 4. symbol_id만 있고 pfdFileName이 없으면 기본 파일명 생성
  if (item.symbol_id) {
    return `svg_file_${item.symbol_id.substring(0, 8)}.svg`;
  }

  // 5. 모두 없으면 '선택된 파일 없음'
  return t("common.noFile");
};

// Svg 파일이 유효한지 확인하는 함수
const hasValidSvgFile = (item: any): boolean => {
  const fileName = getSvgFileName(item);
  return fileName && fileName !== t("common.noFile") && fileName.trim() !== "";
};

// API 함수들
const searchPfdDrawingAPI = async (processId: string) => {
  try {
    if (!processId) {
      return [];
    }

    const requestBody = {
      drawing_type: "PFDCARD",
      process_id: parseInt(processId, 10),
    };

    const response = await request(
      "/api/process/drawing_master/search",
      {},
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.success) {
      console.error("PFD 도면 검색 API 응답 오류:", response);
      return [];
    }

    const pfdItems =
      response.response?.map((item: any, index: number) => {
        // API 응답에서 파일명을 찾기 위한 모든 가능한 필드 확인
        const possibleFileNameFields = [
          "file_name",
          "drawing_name",
          "pfd",
          "name",
          "filename",
          "original_name",
        ];
        let fileName = "";

        // current_file.file_name을 우선적으로 확인
        if (item.current_file?.file_name) {
          fileName = item.current_file.file_name;
        } else {
          for (const field of possibleFileNameFields) {
            if (item[field]) {
              fileName = item[field];
              break;
            }
          }
        }

        const drawingId = item.drawing_id || item.id;

        // 등록일자: API 응답의 created_at 찾기 (다양한 위치 확인)
        const registrationDate = item.created_at 
          || item.current_file?.created_at 
          || null;

        return {
          id: `pfd-${index + 1}`,
          no: index + 1,
          pfdFileName: fileName,
          registrationDate: registrationDate,
          mappingPidList: "보기",
          remarks: item.remarks || "",
          drawing_id: drawingId,
          symbol_id: item.symbol_id || item.symbolId || null,
          symbol_uri: item.symbol_uri || item.symbolUri || null,
        };
      }) || [];

    return pfdItems;
  } catch (error) {
    console.error("PFD 도면 검색 API 호출 실패:", error);
    return [];
  }
};

// 계산식 검색 API 호출 함수
const searchFormulaAPI = async () => {
  try {
    let processId: string;

    if (props.isRegisterMode) {
      // 공정 등록 모드일 때는 생성된 공정 ID 사용
      if (!createdProcessId.value) {
        return { data: [] };
      }
      processId = createdProcessId.value;
    } else {
      // 공정 상세 모드일 때는 기존 로직 사용
      processId = props.processId || (route.params.id as string);
      if (!processId) {
        return { data: [] };
      }
    }

    const requestBody = {
      search_field: "process_id",
      search_value: processId + "", // 동적으로 process_id 사용 (API에서 process_id 를 string으로 인식하고 있어 ""추가)
      order_by: "created_at",
      //process_id: processId // 동적으로 process_id 사용
    };

    const response = await request(
      "/api/process/formula/search",
      {},
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.success) {
      // request 함수에서 반환된 오류 응답 처리
      console.error("API 응답 오류:", response);

      // 실제 인증 오류인지 확인
      const isAuthError =
        response.status === 401 ||
        response.message?.includes("Authentication required") ||
        response.message?.includes("세션이 만료되었습니다") ||
        response.response?.error_code === "SESSION_REQUIRED";

      if (isAuthError) {
        console.warn("⚠️ 인증이 만료되었습니다. 로그인이 필요합니다.");

        // 인증 오류 시 빈 데이터 반환
        return {
          success: false,
          error: "AUTH_REQUIRED",
          message: "인증이 필요합니다. 다시 로그인해주세요.",
          data: [],
        };
      }

      // 400 상태 코드이지만 실제로는 404 오류인 경우 처리
      if (
        response.status === 404 ||
        (response.status === 400 && response.message?.includes("Not Found"))
      ) {
        console.warn(
          "⚠️ /api/process/formula/search API가 구현되지 않았습니다. 백엔드 개발자에게 문의하세요."
        );

        // 임시로 더미 데이터 반환하여 그리드가 정상적으로 표시되도록 함
        return {
          success: true,
          response: [
            {
              id: "1",
              formula_name: "계산식_001",
              created_at: "2024-01-15",
              formula_scope: "PROCESS",
              output_type: "number",
            },
            {
              id: "2",
              formula_name: "계산식_002",
              created_at: "2024-01-20",
              formula_scope: "PROCESS",
              output_type: "number",
            },
          ],
        };
      } else if (response.status === 400) {
        // 400 오류에서도 인증 관련 메시지가 있는지 다시 한번 확인
        if (
          response.message?.includes("SESSION_REQUIRED") ||
          response.message?.includes("Authentication required") ||
          response.message?.includes("세션이 만료되었습니다") ||
          response.response?.error_code === "SESSION_REQUIRED"
        ) {
          console.warn(
            "⚠️ 400 오류에서 인증 문제를 발견했습니다. 인증이 필요합니다."
          );

          return {
            success: false,
            error: "AUTH_REQUIRED",
            message: "인증이 필요합니다. 다시 로그인해주세요.",
            data: [],
          };
        }

        return { data: [] };
      }

      throw new Error(
        `HTTP error! status: ${response.status}, message: ${response.message}`
      );
    }

    return response;
  } catch (error: any) {
    console.error("계산식 검색 API 호출 실패:", error);

    // 네트워크 오류나 기타 오류 시에도 빈 데이터 반환
    if (
      error.message &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError"))
    ) {
      return { data: [] };
    }

    // 기타 오류 시에도 빈 데이터 반환하여 화면이 정상적으로 로드되도록 함
    return { data: [] };
  }
};

const createFormulaAPI = async (
  processId: string,
  formulaName: string,
  formulaCode: string,
  siteFile?: File
) => {
  try {
    console.log("createFormulaAPI 호출됨:", {
      processId,
      formulaName,
      formulaCode,
      siteFile: siteFile ? siteFile.name : "",
    });

    const formData = new FormData();
    formData.append("process_id", processId);
    formData.append("formula_name", formulaName);
    formData.append("formula_code", formulaCode);
    formData.append("formula_scope", "PROCESS"); // 서버에서 요구하는 필드
    if (siteFile) {
      formData.append("siteFile", siteFile); // 서버에서 요구하는 필드명
    }

    console.log("FormData 생성 완료, API 호출 시작");
    const response = await request("/api/process/formula/create", undefined, {
      method: "POST",
      body: formData,
      // headers는 request.ts에서 자동으로 설정됨 (FormData일 때 Content-Type 자동 설정)
    });

    console.log("createFormulaAPI 응답 수신:", response);

    const data = response;
    console.log("createFormulaAPI 응답 데이터 구조 분석:", {
      success: data.success,
      status: data.status,
      response: data.response,
      responseStatus: data.response?.status,
      responseMessage: data.response?.message,
    });

    // API 응답에서 status가 'skipped'인 경우 처리 (중복 파일로 인한 건너뛰기)
    if (data.response && data.response.status === "skipped") {
      console.warn(
        "계산식이 이미 존재하여 건너뛰었습니다:",
        data.response.message
      );
      console.log("중복된 계산식 정보:", data.response.data);

      // 중복된 파일이 있는 경우 실패로 처리 (최상위 success: true 무시)
      throw new Error(`계산식이 이미 존재합니다: ${data.response.message}`);
    }

    // 일반적인 HTTP 에러 처리
    if (!response.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error("계산식 생성 API 호출 실패:", error);
    throw error;
  }
};

const deleteFormulaAPI = async (formulaId: string) => {
  try {
    const response = await request(
      `/api/process/formula/delete/${formulaId}`,
      {},
      {
        method: "DELETE",
        headers: {
          user_Id: localStorage.getItem("authUserId") || "",
          wai_lang: localStorage.getItem("wai_lang") || "ko",
        },
      }
    );

    if (!response.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error: any) {
    console.error("계산식 삭제 API 호출 실패:", error);
    throw error;
  }
};

// P&ID drawing 삭제 API
const deletePidDrawingAPI = async (drawingId: string) => {
  try {
    const response = await request(
      `/api/process/drawing/delete/${drawingId}`,
      {},
      {
        method: "DELETE",
        headers: {
          user_Id: localStorage.getItem("authUserId") || "",
          wai_lang: localStorage.getItem("wai_lang") || "ko",
        },
      }
    );

    if (!response.success) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("P&ID drawing 삭제 API 호출 실패:", error);
    throw error;
  }
};

// 이벤트 핸들러들
const handleProcessTypeChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value || null;

  // 즉시 값 업데이트
  processStore.processDetail.processType = selectedValue;

  // 하위 선택값들 즉시 초기화
  processStore.processDetail.subCategory = null;
  processStore.processDetail.processName = null;

  // DOM 업데이트를 기다린 후 API 호출
  await nextTick();

  try {
    if (selectedValue) {
      // 로딩 상태를 변경하지 않고 조용히 API 호출
      await processStore.loadSubCategoryCodesSilent(selectedValue);
    } else {
      // 공정구분이 선택되지 않은 경우 중분류와 공정명 옵션 초기화
      processStore.searchSubCategoryOptions.splice(
        0,
        processStore.searchSubCategoryOptions.length
      );
      processStore.searchProcessNameOptions.splice(
        0,
        processStore.searchProcessNameOptions.length
      );
    }
  } catch (error) {
    console.error("공정 중분류 로드 실패:", error);
    // 오류 발생 시에도 옵션 초기화
    processStore.searchSubCategoryOptions.splice(
      0,
      processStore.searchSubCategoryOptions.length
    );
    processStore.searchProcessNameOptions.splice(
      0,
      processStore.searchProcessNameOptions.length
    );
  }
};
const handleSubCategoryChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value || null;

  // 즉시 값 업데이트
  processStore.processDetail.subCategory = selectedValue;

  // 하위 선택값 즉시 초기화
  processStore.processDetail.processName = null;

  // DOM 업데이트를 기다린 후 API 호출
  await nextTick();

  try {
    if (processStore.processDetail.processType && selectedValue) {
      // 로딩 상태를 변경하지 않고 조용히 API 호출
      await processStore.loadProcessNameCodesSilent(selectedValue);
    } else {
      // 중분류가 선택되지 않은 경우 공정명 옵션 초기화
      processStore.searchProcessNameOptions.splice(
        0,
        processStore.searchProcessNameOptions.length
      );
    }
  } catch (error) {
    console.error("공정명 로드 실패:", error);
    // 오류 발생 시에도 옵션 초기화
    processStore.searchProcessNameOptions.splice(
      0,
      processStore.searchProcessNameOptions.length
    );
  }
};
const handleProcessNameChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const selectedValue = target.value;

  // processStore에 값 설정
  processStore.setProcessDetail({ processName: selectedValue });
};

const handleUnitChange = () => {
  // 단위 변경 시 필요한 로직 추가
};

const handleFileChange = async (key: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    if (key === "processSymbol") {
      const success = processStore.handleProcessSymbolFileChange(file);
      if (!success) {
        target.value = "";
        return;
      }
    } else {
      processStore.setSelectedFile(key, file);
    }
  }
};

const getSelectedFilesText = (key: string) => {
  if (key === "processSymbol" && processStore.selectedFiles["processSymbol"]) {
    const fileName = processStore.selectedFiles["processSymbol"].name;
    // 경로 제외 파일명만 반환
    return fileName.split("/").pop() || fileName;
  }
  return "";
};

const getProcessSymbolFileName = () => {
  // 공정 등록 모드일 때는 빈 값 반환
  if (props.isRegisterMode) {
    return "";
  }

  const processSymbol = processStore.processDetail.processSymbol;

  // null, undefined, 빈 문자열 체크
  if (
    processSymbol &&
    processSymbol !== null &&
    processSymbol !== undefined &&
    processSymbol.trim() !== ""
  ) {
    // 파일명만 추출하여 반환
    const fileName = processSymbol.split("/").pop() || processSymbol;
    return fileName;
  }
  return "";
};

// 모달 관련 함수들
const openFormulaModal = () => {
  processStore.setShowFormulaModal(true);
  selectedFormulaFiles.value = [];
};

const closeFormulaModal = () => {
  processStore.setShowFormulaModal(false);
  selectedFormulaFiles.value = [];
};

const showPfdModal = ref(false);

const openPfdModal = () => {
  showPfdModal.value = true;
  selectedPfdFiles.value = [];
};

const closePfdModal = () => {
  showPfdModal.value = false;
  selectedPfdFiles.value = [];
};

// Components 그리드 관련 함수들
const toggleComponentsGrid = (formulaItem: any, index: number) => {
  console.log("컴포넌트 버튼 클릭:", formulaItem, index);

  // 해당 행 선택
  selectedFormulaItems.value = formulaItem;

  if (
    showComponentsGrid.value &&
    currentFormulaItem.value?.id === formulaItem.id
  ) {
    // 같은 계산식의 컴포넌트 그리드가 이미 열려있으면 닫기
    closeComponentsGrid();
  } else {
    // 새로운 계산식의 컴포넌트 그리드 열기
    currentFormulaItem.value = formulaItem;
    loadComponentsData(formulaItem);
    showComponentsGrid.value = true;
  }
};

const closeComponentsGrid = () => {
  showComponentsGrid.value = false;
  currentFormulaItem.value = null;
  componentsList.value = [];
};

const loadComponentsData = (formulaItem: any) => {
  console.log("loadComponentsData 호출됨:", formulaItem);

  // process_dependencies 데이터 파싱
  const parsedComponents: any[] = [];

  // formulaItem이 없거나 process_dependencies가 없는 경우 빈 배열로 초기화
  if (!formulaItem || !formulaItem.process_dependencies) {
    console.log(
      "formulaItem 또는 process_dependencies가 없어 Components 목록을 초기화합니다."
    );
    componentsList.value = [];
    return;
  }

  console.log("process_dependencies 데이터:", formulaItem.process_dependencies);

  // process_dependencies가 직접 배열인 경우 파싱
  if (Array.isArray(formulaItem.process_dependencies)) {
    const items = formulaItem.process_dependencies;
    console.log("process_dependencies 배열 데이터:", items);

    items.forEach((item: any, index: number) => {
      const parsedItem = {
        id: `component_${index}`,
        category: item.level1_value || "", // 분류: level1_value
        component: item.level2_value || "", // Components: level2_value
        type: item.level3_value || "", // 유형: level3_value
        codeKey: item.code || "", // 코드 키: code
        item: item.value || item.value_en || "", // ITEM: value 또는 value_en
      };
      parsedComponents.push(parsedItem);
    });
  }
  // process_dependencies의 items 배열 파싱 (하위 호환성)
  else if (
    formulaItem.process_dependencies.items &&
    Array.isArray(formulaItem.process_dependencies.items)
  ) {
    const items = formulaItem.process_dependencies.items;
    console.log("process_dependencies items 데이터:", items);

    items.forEach((item: any, index: number) => {
      const parsedItem = {
        id: `component_${index}`,
        category: item.level1_value || "", // 분류: level1_value
        component: item.level2_value || "", // Components: level2_value
        type: item.level3_value || "", // 유형: level3_value
        codeKey: item.code || "", // 코드 키: code
        item: item.value || item.value_en || "", // ITEM: value 또는 value_en
      };
      parsedComponents.push(parsedItem);
    });
  }

  // 기존 equipments_set 파싱 (하위 호환성을 위해 유지)
  if (formulaItem.process_dependencies.equipments_set) {
    const equipments = formulaItem.process_dependencies.equipments_set;
    console.log("equipments_set 데이터:", equipments);

    equipments.forEach((equipment: any, index: number) => {
      if (equipment.equip_item) {
        const parsedEquipment = {
          id: `equipment_${index}`,
          category: equipment.equip_item.code_hierarchy?.level1?.value || "", // 분류: level1_value
          component: equipment.equip_item.code_hierarchy?.level2?.value || "", // Components: level2_value
          type: equipment.equip_item.code_hierarchy?.level3?.value || "", // 유형: level3_value
          codeKey: equipment.equip_item.code || "", // 코드 키: code
          item: equipment.equip_item.value || "", // ITEM: value
        };
        parsedComponents.push(parsedEquipment);
      }
    });
  }

  // 기존 structures_set 파싱 (하위 호환성을 위해 유지)
  if (formulaItem.process_dependencies.structures_set) {
    const structures = formulaItem.process_dependencies.structures_set;
    console.log("structures_set 데이터:", structures);

    structures.forEach((structure: any, index: number) => {
      if (structure.structure_item) {
        const parsedStructure = {
          id: `structure_${index}`,
          category:
            structure.structure_item.code_hierarchy?.level1?.value || "", // 분류: level1_value
          component:
            structure.structure_item.code_hierarchy?.level2?.value || "", // Components: level2_value
          type: structure.structure_item.code_hierarchy?.level3?.value || "", // 유형: level3_value
          codeKey: structure.structure_item.code || "", // 코드 키: code
          item: structure.structure_item.value || "", // ITEM: value
        };
        parsedComponents.push(parsedStructure);
      }
    });
  }

  console.log("파싱된 컴포넌트 목록:", parsedComponents);

  // 데이터가 없을 경우 빈 배열로 초기화
  if (parsedComponents.length === 0) {
    console.log(
      "process_dependencies 데이터가 없어 Components 목록을 초기화합니다."
    );
    componentsList.value = [];
  } else {
    componentsList.value = parsedComponents;
  }
};

// 파일 선택 핸들러들
const handleFormulaFilesSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const fileArray = Array.from(target.files);

    // Python 파일만 필터링
    const formulaFiles = fileArray.filter((file) =>
      file.name.toLowerCase().endsWith(".py")
    );

    const unsupportedFiles = fileArray.filter(
      (file) => !file.name.toLowerCase().endsWith(".py")
    );

    if (unsupportedFiles.length > 0) {
      alert(
        `Python 파일(.py)만 선택 가능합니다.\n\n선택된 파일 중 지원하지 않는 파일:\n${unsupportedFiles
          .map((f) => f.name)
          .join("\n")}`
      );
    }

    selectedFormulaFiles.value = formulaFiles;
  }
};

const handlePfdFilesSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const fileArray = Array.from(target.files);

    // 공정카드 관련 파일만 필터링
    const pfdFiles = fileArray.filter((file) => {
      const fileName = file.name.toLowerCase();
      return (
        fileName.endsWith(".dwg") ||
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".png") ||
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg")
      );
    });

    const unsupportedFiles = fileArray.filter((file) => {
      const fileName = file.name.toLowerCase();
      return (
        !fileName.endsWith(".dwg") &&
        !fileName.endsWith(".pdf") &&
        !fileName.endsWith(".png") &&
        !fileName.endsWith(".jpg") &&
        !fileName.endsWith(".jpeg")
      );
    });

    if (unsupportedFiles.length > 0) {
      alert(
        `공정카드 관련 파일(.dwg, .pdf, .png, .jpg, .jpeg)만 선택 가능합니다.\n\n선택된 파일 중 지원하지 않는 파일:\n${unsupportedFiles
          .map((f) => f.name)
          .join("\n")}`
      );
    }

    selectedPfdFiles.value = pfdFiles;
  }
};

// 파일 업로드 함수들
const uploadFormulaFiles = () => {
  if (selectedFormulaFiles.value.length === 0) {
    alert("업로드할 파일을 선택해주세요.");
    return;
  }

  const newFormulaItems = selectedFormulaFiles.value.map((file, index) => {
    return {
      id: `formula_${Date.now()}_${index}`,
      no: processStore.formulaList.length + index + 1,
      registeredFormula: file.name.replace(".py", ""),
      formula_code: "",
      registrationDate: formatDate(new Date()),
      infoOverview: "",
      remarks: "",
      _file: file,
      isSaved: false, // 새로 추가된 계산식은 저장되지 않은 상태
    };
  });

  const updatedFormulaList = [...processStore.formulaList, ...newFormulaItems];
  processStore.setFormulaList(updatedFormulaList);

  alert(`계산식 파일 ${newFormulaItems.length}개가 그리드에 추가되었습니다.`);

  closeFormulaModal();
};

const uploadPfdFiles = () => {
  if (selectedPfdFiles.value.length === 0) {
    alert("업로드할 파일을 선택해주세요.");
    return;
  }

  const newPfdItems = selectedPfdFiles.value.map((file, index) => {
    return {
      id: `pfd_${Date.now()}_${index}`,
      no: processStore.pfdList.length + index + 1,
      pfdFileName: file.name,
      registrationDate: formatDate(new Date()),
      mappingPidList: "보기",
      remarks: "",
      _file: file,
      drawing_id: `temp_pfd_drawing_${Date.now()}_${index}`,
    };
  });

  const updatedPfdList = [...processStore.pfdList, ...newPfdItems];
  processStore.setPfdList(updatedPfdList);

  closePfdModal();
};

// 선택 관련 함수들
const handleFormulaSelectionChange = () => {
  // 계산식 row가 선택되면 공정카드 버튼 클릭 이벤트 호출
  if (selectedFormulaItems.value) {
    const selectedItem = selectedFormulaItems.value;
    const selectedIndex = processStore.formulaList.findIndex(
      (item) => item.id === selectedItem.id
    );

    if (selectedIndex !== -1) {
      handleProcessManagementClick(selectedItem, selectedIndex);
    }
  }
};

// P&ID 컴포넌트 버튼 클릭 핸들러
const isPidRowSaved = (item: any): boolean => {
  if (!item) return false;
  // 1) drawing_id 존재 여부
  if (!item.drawing_id) return false;
  // 2) 임시 drawing_id 여부
  if (typeof item.drawing_id === 'string' && item.drawing_id.startsWith('temp_pid_drawing_')) return false;
  // 3) 파일 존재 여부 (pidFileName 또는 업로드된 pidFile 중 하나)
  if (!item.pidFileName && !(item as any).pidFile) return false;
  // 4) isSaved 플래그가 있으면 그 값 사용
  if (Object.prototype.hasOwnProperty.call(item, 'isSaved')) {
    return !!item.isSaved;
  }
  // 위 조건 통과 시 저장된 것으로 간주
  return true;
};

const openPidComponentModal = async (item: any) => {
  console.log("=== P&ID 컴포넌트 모달 열기 ===");
  console.log("전달받은 item:", item);
  console.log("item.drawing_id:", item.drawing_id);
  console.log("item.current_file_drawing_id:", item.current_file_drawing_id);

  // P&ID row가 저장된 상태인지 확인
  if (!isPidRowSaved(item)) {
    alert("P&ID 컴포넌트를 보려면 먼저 P&ID를 저장해주세요.");
    return;
  }

  // drawing_id 저장 (우선순위: current_file_drawing_id > drawing_id)
  const drawingIdToUse = item.current_file_drawing_id || item.drawing_id || "";
  console.log("사용할 drawing_id:", drawingIdToUse);

  currentDrawingId.value = drawingIdToUse;

  // 해당 row 선택
  selectedMappingPidItems.value = item;

  // 선택된 P&ID 정보 저장
  selectedPidForComponent.value = item;

  // P&ID Components용 drawing_id 저장 (계속 사용하기 위해)
  pidComponentDrawingId.value = drawingIdToUse;

  console.log("설정된 값들:", {
    currentDrawingId: currentDrawingId.value,
    pidComponentDrawingId: pidComponentDrawingId.value,
    selectedPidForComponent: selectedPidForComponent.value,
  });

  // P&ID 컴포넌트 섹션 표시
  showPidComponentSection.value = true;

  // 선택 상태 초기화
  selectedPidComponentItems.value = [];

  // currentDrawingId 재설정 (혹시 누락된 경우를 대비)
  currentDrawingId.value = item.drawing_id || "";

  // P&ID 컴포넌트 데이터 초기화 및 로드
  pidComponentList.value = [];
  await loadPidComponentData(item);

  // P&ID 컴포넌트 섹션으로 스크롤
  setTimeout(() => {
    const pidComponentSection = document.querySelector(
      ".pid-component-section"
    );
    if (pidComponentSection) {
      pidComponentSection.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
};

// P&ID 컴포넌트 데이터 로드 (기존 데이터 초기화)
const loadPidComponentData = async (pidItem: any) => {
  // 데이터 초기화
  pidComponentList.value = [];

  await loadPidComponentDataInternal(pidItem);
};

// P&ID 컴포넌트 데이터 로드 (기존 데이터 유지)
const loadPidComponentDataWithoutClear = async (pidItem: any) => {
  await loadPidComponentDataInternal(pidItem);
};

// component_hierachy 파싱 함수
const parseComponentHierarchy = (hierarchyString: string) => {
  console.log("=== component_hierachy 파싱 시작 ===");
  console.log("입력 문자열:", hierarchyString);

  const result = {
    level1_code_key: "",
    level1_korean_name: "",
    level2_code_key: "",
    level2_korean_name: "",
    level3_code_key: "",
    level3_korean_name: "",
    level4_code_key: "",
    level4_korean_name: "",
  };

  if (!hierarchyString) {
    console.log("hierarchy 문자열이 비어있음");
    return result;
  }

  try {
    // " | " 기준으로 각 레벨 분리
    const levels = hierarchyString.split(" | ");
    console.log("분리된 레벨들:", levels);

    levels.forEach((level, index) => {
      console.log(`레벨 ${index + 1} 처리:`, level);

      // 각 레벨에서 코드키와 한국어 설명 추출: "(레벨X) CODE_KEY / 한국어설명 / 영어설명" 형태
      const match = level.match(
        /\(레벨\d+\)\s*([A-Z_0-9]+)\s*\/\s*([^/]+)\s*\/\s*(.+)$/
      );
      if (match && match[1] && match[2]) {
        const codeKey = match[1];
        const koreanName = match[2].trim();
        console.log(`레벨 ${index + 1} 추출:`, { codeKey, koreanName });

        if (index === 0) {
          result.level1_code_key = codeKey;
          result.level1_korean_name = koreanName;
        } else if (index === 1) {
          result.level2_code_key = codeKey;
          result.level2_korean_name = koreanName;
        } else if (index === 2) {
          result.level3_code_key = codeKey;
          result.level3_korean_name = koreanName;
        } else if (index === 3) {
          result.level4_code_key = codeKey;
          result.level4_korean_name = koreanName;
        }
      } else {
        console.log(`레벨 ${index + 1} 파싱 실패:`, level);
      }
    });

    console.log("파싱 완료 결과:", result);
  } catch (error) {
    console.error("component_hierachy 파싱 중 오류:", error);
  }

  console.log("=== component_hierachy 파싱 끝 ===");
  return result;
};
// 로드된 데이터를 기반으로 select 박스 옵션들 자동 생성 함수
const generateSelectOptionsFromLoadedData = async () => {
  console.log("=== 로드된 데이터 기반 select 옵션 자동 생성 시작 ===");

  try {
    // 로드된 컴포넌트들에서 고유한 값들 추출
    const uniqueLevel1Codes = [
      ...new Set(
        pidComponentList.value
          .map((item) => item.level1_code_key)
          .filter(Boolean)
      ),
    ];
    const uniqueLevel2Codes = [
      ...new Set(
        pidComponentList.value
          .map((item) => item.level2_code_key)
          .filter(Boolean)
      ),
    ];
    const uniqueLevel3Codes = [
      ...new Set(
        pidComponentList.value
          .map((item) => item.level3_code_key)
          .filter(Boolean)
      ),
    ];
    const uniqueEquipmentTypes = [
      ...new Set(
        pidComponentList.value
          .map((item) => item.component_type)
          .filter(Boolean)
      ),
    ];

    console.log("추출된 고유 코드들:", {
      level1Codes: uniqueLevel1Codes,
      level2Codes: uniqueLevel2Codes,
      level3Codes: uniqueLevel3Codes,
      equipmentTypes: uniqueEquipmentTypes,
    });

    // 중분류 옵션 생성 (level2_code_key 기반)
    if (uniqueLevel2Codes.length > 0) {
      console.log("중분류 옵션 생성 시작...");

      // 실제 중분류 옵션을 API에서 가져오는 대신, 로드된 데이터 기반으로 생성
      const middleOptions = await Promise.all(
        uniqueLevel2Codes.map(async (code) => {
          // 해당 코드의 상위 레벨 찾기
          const parentCode = pidComponentList.value.find(
            (item) => item.level2_code_key === code
          )?.level1_code_key;

          if (parentCode) {
            try {
              const requestData = {
                search_field: "parent_key",
                search_value: parentCode,
                order_by: "code_order",
                order_direction: "asc",
              };

              const response = await request(
                "/api/process/code/search",
                undefined,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(requestData),
                }
              );

              if (
                response.success &&
                response.response &&
                Array.isArray(response.response)
              ) {
                return response.response
                  .filter((item) => item.code_key === code)
                  .map((item: any) => ({
                    value: item.code_key,
                    label: item.code_value,
                  }));
              }
            } catch (error) {
              console.error(`중분류 ${code} API 호출 실패:`, error);
            }
          }

          // API 호출 실패 시 기본값 반환
          return [
            {
              value: code,
              label: code,
            },
          ];
        })
      );

      // 중복 제거 및 평탄화
      const flatMiddleOptions = middleOptions
        .flat()
        .filter(
          (option, index, self) =>
            self.findIndex((o) => o.value === option.value) === index
        );

      middleCategoryOptions.value = [
        { value: "", label: "선택하세요" },
        ...flatMiddleOptions,
      ];

      console.log("중분류 옵션 생성 완료:", middleCategoryOptions.value);

      // 생성된 옵션을 각 행에 할당
      pidComponentList.value.forEach((item) => {
        item._middleCategoryOptions = middleCategoryOptions.value;
      });
    }

    // 소분류 옵션 생성 (level3_code_key 기반)
    if (uniqueLevel3Codes.length > 0) {
      console.log("소분류 옵션 생성 시작...");

      const smallOptions = await Promise.all(
        uniqueLevel3Codes.map(async (code) => {
          // 해당 코드의 상위 레벨 찾기
          const parentCode = pidComponentList.value.find(
            (item) => item.level3_code_key === code
          )?.level2_code_key;

          if (parentCode) {
            try {
              const requestData = {
                search_field: "parent_key",
                search_value: parentCode,
                order_by: "code_order",
                order_direction: "asc",
              };

              const response = await request(
                "/api/process/code/search",
                undefined,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(requestData),
                }
              );

              if (
                response.success &&
                response.response &&
                Array.isArray(response.response)
              ) {
                return response.response
                  .filter((item) => item.code_key === code)
                  .map((item: any) => ({
                    value: item.code_key,
                    label: item.code_value,
                  }));
              }
            } catch (error) {
              console.error(`소분류 ${code} API 호출 실패:`, error);
            }
          }

          // API 호출 실패 시 기본값 반환
          return [
            {
              value: code,
              label: code,
            },
          ];
        })
      );

      // 중복 제거 및 평탄화
      const flatSmallOptions = smallOptions
        .flat()
        .filter(
          (option, index, self) =>
            self.findIndex((o) => o.value === option.value) === index
        );

      smallCategoryOptions.value = [
        { value: "", label: "선택하세요" },
        ...flatSmallOptions,
      ];

      console.log("소분류 옵션 생성 완료:", smallCategoryOptions.value);

      // 생성된 옵션을 각 행에 할당
      pidComponentList.value.forEach((item) => {
        item._smallCategoryOptions = smallCategoryOptions.value;
      });
    }

    // 장비유형 옵션 생성 (component_type 기반)
    if (uniqueEquipmentTypes.length > 0) {
      console.log("장비유형 옵션 생성 시작...");

      const equipmentOptions = await Promise.all(
        uniqueEquipmentTypes.map(async (code) => {
          // 해당 코드의 상위 레벨 찾기
          const parentCode = pidComponentList.value.find(
            (item) => item.component_type === code
          )?.level3_code_key;

          if (parentCode) {
            try {
              const requestData = {
                search_field: "parent_key",
                search_value: parentCode,
                order_by: "code_order",
                order_direction: "asc",
              };

              const response = await request(
                "/api/process/code/search",
                undefined,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(requestData),
                }
              );

              if (
                response.success &&
                response.response &&
                Array.isArray(response.response)
              ) {
                return response.response
                  .filter((item) => item.code_key === code)
                  .map((item: any) => ({
                    value: item.code_key,
                    label: item.code_value,
                  }));
              }
            } catch (error) {
              console.error(`장비유형 ${code} API 호출 실패:`, error);
            }
          }

          // API 호출 실패 시 기본값 반환
          return [
            {
              value: code,
              label: code,
            },
          ];
        })
      );

      // 중복 제거 및 평탄화
      const flatEquipmentOptions = equipmentOptions
        .flat()
        .filter(
          (option, index, self) =>
            self.findIndex((o) => o.value === option.value) === index
        );

      equipmentTypeOptions.value = [
        { value: "", label: "선택하세요" },
        ...flatEquipmentOptions,
      ];

      console.log("장비유형 옵션 생성 완료:", equipmentTypeOptions.value);

      // 생성된 옵션을 각 행에 할당
      pidComponentList.value.forEach((item) => {
        item._equipmentTypeOptions = equipmentTypeOptions.value;
      });
    }
  } catch (error) {
    console.error("select 옵션 자동 생성 중 오류:", error);
  }

  console.log("=== 로드된 데이터 기반 select 옵션 자동 생성 완료 ===");
};
// P&ID 컴포넌트 데이터 로드 내부 함수
const loadPidComponentDataInternal = async (pidItem: any) => {
  // drawing_id가 있는 경우에만 API 호출
  if (pidItem.drawing_id) {
    try {
      console.log("=== P&ID 컴포넌트 API 호출 시작 ===");
      console.log("사용할 drawing_id:", pidItem.drawing_id);

      // 기존 API 엔드포인트 사용 (작동 확인됨)
      const requestData = {
        search_field: "pid_id",
        search_value: pidItem.drawing_id,
      };

      console.log("API 엔드포인트:", "/api/process/components/search");
      console.log("요청 데이터:", requestData);

      const response = await request(
        "/api/process/components/search",
        undefined,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log("=== P&ID 컴포넌트 API 응답 결과 ===");
      console.log("전체 응답 객체:", response);
      console.log("응답 성공 여부 (success):", response.success);
      console.log("응답 HTTP 상태 (status):", response.status);
      console.log("응답 메시지 (message):", response.message);
      console.log("응답 데이터 (response):", response.response);

      if (response && response.response) {
        console.log("응답 데이터 타입:", typeof response.response);
        console.log(
          "응답 데이터가 배열인지:",
          Array.isArray(response.response)
        );

        if (Array.isArray(response.response)) {
          console.log("응답 데이터 길이:", response.response.length);
          console.log("응답 데이터 상세 내용:");
          response.response.forEach((item, index) => {
            console.log(`  컴포넌트 ${index + 1}:`, item);
          });
        } else {
          console.log("응답 데이터 내용 (배열이 아님):", response.response);
        }
      } else {
        console.log("응답 데이터가 없습니다.");
      }
      console.log("=== P&ID 컴포넌트 API 응답 결과 끝 ===");

      if (response && response.response && Array.isArray(response.response)) {
        // 응답 데이터에 No 컬럼과 고유 ID 추가, component_hierachy 파싱
        const newComponents = response.response.map(
          (item: any, index: number) => {
            // component_hierachy 파싱
            const hierarchyData = parseComponentHierarchy(
              item.component_hierachy
            );

            console.log(`컴포넌트 ${index + 1} hierarchy 파싱 결과:`, {
              원본: item.component_hierachy,
              파싱결과: hierarchyData,
            });

            return {
              ...item,
              id:
                item.component_id ||
                `loaded_comp_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}_${index}`, // 고유한 id 생성
              no: pidComponentList.value.length + index + 1, // 기존 데이터 개수를 고려한 번호
              _isLoadedFromServer: true, // 서버에서 로드된 데이터임을 표시
              // 파싱된 hierarchy 데이터 추가
              level1_code_key: hierarchyData.level1_code_key,
              level1_korean_name: hierarchyData.level1_korean_name,
              level2_code_key: hierarchyData.level2_code_key,
              level2_korean_name: hierarchyData.level2_korean_name,
              level3_code_key: hierarchyData.level3_code_key,
              level3_korean_name: hierarchyData.level3_korean_name,
              level4_code_key: hierarchyData.level4_code_key,
              level4_korean_name: hierarchyData.level4_korean_name,
              // P&ID Components 그리드 텍스트 박스용 매핑 (한국어 이름 사용)
              category: hierarchyData.level1_korean_name, // 구분: 기계
              middleCategory: hierarchyData.level2_korean_name, // 중분류: 펌프
              smallCategory: hierarchyData.level3_korean_name, // 소분류: 수중모터펌프
              equipmentType: hierarchyData.level4_korean_name || "", // 장비유형: 수중오수모터펌프(자동착탈식) - 파싱된 값이 없으면 공백
              // POC IN 항목을 input_poc로 매핑
              input_poc: Number(item.input_poc) || 0, // API 응답의 input_poc 값
              // 각 행별 개별 옵션 저장
              _middleCategoryOptions: [],
              _smallCategoryOptions: [],
              _equipmentTypeOptions: [],
            };
          }
        );

        // 기존 데이터에 새로운 데이터 추가
        pidComponentList.value = [...pidComponentList.value, ...newComponents];

        console.log("=== P&ID Components 그리드 데이터 최종 결과 ===");
        console.log("총 컴포넌트 수:", pidComponentList.value.length);
        pidComponentList.value.forEach((component, index) => {
          if (
            component.category ||
            component.middleCategory ||
            component.smallCategory ||
            component.equipmentType ||
            component.input_poc
          ) {
            console.log(`컴포넌트 ${index + 1} 매핑 정보:`, {
              id: component.id,
              POC_IN_input_poc: component.input_poc,
              구분_category: component.category,
              중분류_middleCategory: component.middleCategory,
              소분류_smallCategory: component.smallCategory,
              장비유형_equipmentType: component.equipmentType,
              원본_component_type: component.component_type,
              수량상용: component.standard_quantity,
              수량예비: component.spare_quantity,
            });
          }
        });
        console.log("=== P&ID Components 그리드 데이터 최종 결과 끝 ===");

        // 로드된 데이터를 기반으로 select 박스 옵션들 자동 생성
        await generateSelectOptionsFromLoadedData();

        // 초기 상태 저장 (깊은 복사)
        initialPidComponentList.value = JSON.parse(
          JSON.stringify(pidComponentList.value)
        );
        console.log("✅ P&ID Components 초기 상태 저장 완료");
      }
    } catch (error) {
      console.log("=== P&ID 컴포넌트 API 호출 에러 ===");
      console.error("P&ID 컴포넌트 데이터 로드 실패:", error);
      console.log("에러 상세:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      console.log("=== P&ID 컴포넌트 API 호출 에러 끝 ===");
      pidComponentList.value = [];
      initialPidComponentList.value = []; // 초기 상태도 초기화
    }
  } else {
  }
};

// P&ID 컴포넌트 구분 변경 핸들러
const handlePidComponentCategoryChange = async (item: any) => {
  console.log("P&ID 컴포넌트 구분 변경:", item.category, "- 행 ID:", item.id);

  if (item.category) {
    try {
      // 직접 API 호출로 중분류 옵션 가져오기
      const requestData = {
        search_field: "parent_key",
        search_value: item.category,
        order_by: "code_order",
        order_direction: "asc",
      };

      console.log(
        "중분류 옵션 API 호출 - 행 ID:",
        item.id,
        "구분:",
        item.category
      );

      const response = await request("/api/process/code/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (
        response.success &&
        response.response &&
        Array.isArray(response.response)
      ) {
        const subCategoryOptions = response.response.map((item: any) => ({
          value: item.code_key,
          label: item.code_value,
        }));

        // 해당 행의 개별 옵션만 업데이트
        item._middleCategoryOptions = [
          { value: "", label: "선택하세요" },
          ...subCategoryOptions,
        ];

        console.log(
          `행 ${item.id} 중분류 옵션 업데이트:`,
          item._middleCategoryOptions
        );
      } else {
        console.log("P&ID 컴포넌트 중분류 API 응답이 올바르지 않음");
        item._middleCategoryOptions = [{ value: "", label: "선택하세요" }];
      }
    } catch (error) {
      console.error("P&ID 컴포넌트 중분류 옵션 로드 실패:", error);
      // 에러 발생 시 기본 옵션으로 설정
      item._middleCategoryOptions = [{ value: "", label: "선택하세요" }];
    }
  } else {
    // 구분이 선택되지 않았을 때 중분류 옵션 초기화
    item._middleCategoryOptions = [{ value: "", label: "선택하세요" }];
  }

  // 하위 필드들 초기화 (해당 행만)
  item.middleCategory = "";
  item.smallCategory = "";
  item.equipmentType = "";

  // 하위 옵션들도 초기화 (해당 행만)
  item._middleCategoryOptions = [{ value: "", label: "선택하세요" }];
  item._smallCategoryOptions = [{ value: "", label: "선택하세요" }];
  item._equipmentTypeOptions = [{ value: "", label: "선택하세요" }];

  console.log(`행 ${item.id} 구분 변경 완료 - 하위 필드들 초기화됨`);
};

// P&ID 컴포넌트 중분류 변경 핸들러
const handlePidComponentMiddleCategoryChange = async (item: any) => {
  console.log(
    "P&ID 컴포넌트 중분류 변경:",
    item.middleCategory,
    "- 행 ID:",
    item.id
  );

  if (item.middleCategory) {
    try {
      // 직접 API 호출로 소분류 옵션 가져오기
      const requestData = {
        search_field: "parent_key",
        search_value: item.middleCategory,
        order_by: "code_order",
        order_direction: "asc",
      };

      console.log(
        "소분류 옵션 API 호출 - 행 ID:",
        item.id,
        "중분류:",
        item.middleCategory
      );

      const response = await request("/api/process/code/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("P&ID 컴포넌트 소분류 API 응답:", response);

      if (
        response.success &&
        response.response &&
        Array.isArray(response.response)
      ) {
        const subCategoryOptions = response.response.map((item: any) => ({
          value: item.code_key,
          label: item.code_value,
        }));

        console.log("P&ID 컴포넌트 소분류 옵션 생성:", subCategoryOptions);

        // 해당 행의 개별 옵션만 업데이트
        item._smallCategoryOptions = [
          { value: "", label: "선택하세요" },
          ...subCategoryOptions,
        ];

        console.log(
          `행 ${item.id} 소분류 옵션 업데이트:`,
          item._smallCategoryOptions
        );
      } else {
        console.log("P&ID 컴포넌트 소분류 API 응답이 올바르지 않음");
        item._smallCategoryOptions = [{ value: "", label: "선택하세요" }];
      }
    } catch (error) {
      console.error("P&ID 컴포넌트 소분류 옵션 로드 실패:", error);
      item._smallCategoryOptions = [{ value: "", label: "선택하세요" }];
    }
  } else {
    // 중분류가 선택되지 않았을 때 소분류 옵션 초기화
    item._smallCategoryOptions = [{ value: "", label: "선택하세요" }];
  }

  // 하위 필드들 초기화 (해당 행만)
  item.smallCategory = "";
  item.equipmentType = "";

  // 하위 옵션들도 초기화 (해당 행만)
  item._smallCategoryOptions = [{ value: "", label: "선택하세요" }];
  item._equipmentTypeOptions = [{ value: "", label: "선택하세요" }];

  console.log(`행 ${item.id} 중분류 변경 완료 - 하위 필드들 초기화됨`);
};

// P&ID 컴포넌트 소분류 변경 핸들러
const handlePidComponentSmallCategoryChange = async (item: any) => {
  console.log("P&ID 컴포넌트 소분류 변경:", item.smallCategory);

  if (item.smallCategory) {
    try {
      // 직접 API 호출로 장비유형 옵션 가져오기
      const requestData = {
        search_field: "parent_key",
        search_value: item.smallCategory,
        order_by: "code_order",
        order_direction: "asc",
      };

      console.log("P&ID 컴포넌트 장비유형 API 요청:", requestData);

      const response = await request("/api/process/code/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("P&ID 컴포넌트 장비유형 API 응답:", response);

      if (
        response.success &&
        response.response &&
        Array.isArray(response.response)
      ) {
        const equipmentTypeOptionsData = response.response.map((item: any) => ({
          value: item.code_key,
          label: item.code_value,
        }));

        console.log(
          "P&ID 컴포넌트 장비유형 옵션 생성:",
          equipmentTypeOptionsData
        );

        // 해당 행의 개별 옵션만 업데이트
        item._equipmentTypeOptions = [
          { value: "", label: "선택하세요" },
          ...equipmentTypeOptionsData,
        ];

        console.log(
          `행 ${item.id} 장비유형 옵션 업데이트:`,
          item._equipmentTypeOptions
        );
      } else {
        console.log("P&ID 컴포넌트 장비유형 API 응답이 올바르지 않음");
        item._equipmentTypeOptions = [{ value: "", label: "선택하세요" }];
      }
    } catch (error) {
      console.error("P&ID 컴포넌트 장비유형 옵션 로드 실패:", error);
      item._equipmentTypeOptions = [{ value: "", label: "선택하세요" }];
    }
  } else {
    // 소분류가 선택되지 않았을 때 장비유형 옵션 초기화 (해당 행만)
    item._equipmentTypeOptions = [{ value: "", label: "선택하세요" }];
  }

  // 하위 필드 초기화 (해당 행만)
  item.equipmentType = "";

  console.log(`행 ${item.id} 소분류 변경 완료 - 하위 필드들 초기화됨`);
};

// P&ID 컴포넌트 장비유형 변경 핸들러
const handlePidComponentEquipmentTypeChange = async (item: any) => {
  console.log(
    "P&ID 컴포넌트 장비유형 변경:",
    item.equipmentType,
    "- 행 ID:",
    item.id
  );

  if (item.equipmentType) {
    try {
      // 장비유형이 선택되었을 때 추가 처리 로직이 있다면 여기에 구현
      console.log(`행 ${item.id} 장비유형 선택 완료:`, item.equipmentType);

      // 필요시 추가 필드 초기화 로직
      // 예: item.someOtherField = '';
    } catch (error) {
      console.error("P&ID 컴포넌트 장비유형 처리 실패:", error);
    }
  }

  console.log(`행 ${item.id} 장비유형 변경 완료`);
};

// 공정카드 버튼 클릭 핸들러
const handleProcessManagementClick = (item: any, index: number) => {
  console.log("공정카드 버튼 클릭:", item, index);

  // 해당 row 선택
  selectedFormulaItems.value = item;

  // 공정 등록 모드에서는 기본정보가 등록된 후에만 공정카드 섹션 표시
  if (props.isRegisterMode && !isBasicInfoRegistered.value) {
    console.log(
      "공정 등록 모드에서 기본정보가 등록되지 않아 공정카드 섹션을 표시하지 않습니다."
    );
    return;
  }

  // 공정카드 섹션 표시
  showPfdSection.value = true;
  // 공정카드 섹션으로 스크롤
  setTimeout(() => {
    const pfdSection = document.querySelector(".pfd-section");
    if (pfdSection) {
      pfdSection.scrollIntoView({ behavior: "smooth" });
    }
  }, 100);
};

// 변경사항 확인 함수들
const hasFormulaChanges = () => {
  // initialFormulaList나 formulaList가 없으면 변경사항 없음
  if (!processStore.initialFormulaList || !processStore.formulaList) {
    return false;
  }

  // 삭제된 행 감지
  const deletedRows = processStore.initialFormulaList.filter((initialItem) => {
    if (!initialItem.formula_id) return false;
    return !processStore.formulaList.some(
      (currentItem) =>
        currentItem.formula_id &&
        currentItem.formula_id === initialItem.formula_id
    );
  });

  // 추가된 행 감지
  const addedRows = processStore.formulaList.filter((currentItem) => {
    // 새로 추가된 행은 id가 'formula_'로 시작하고 formula_id가 없는 경우
    if (currentItem.id.startsWith("formula_") && !currentItem.formula_id) {
      return true;
    }

    // isSaved가 false인 행은 새로 추가된 행으로 간주
    if (currentItem.isSaved === false) {
      return true;
    }

    // 기존 행이지만 formula_id가 있고 initialFormulaList에 없는 경우
    if (!currentItem.formula_id) return false;
    return !processStore.initialFormulaList.some(
      (initialItem) =>
        initialItem.formula_id &&
        initialItem.formula_id === currentItem.formula_id
    );
  });

  // 삭제나 추가가 있으면 변경사항 있음
  if (deletedRows.length > 0 || addedRows.length > 0) {
    return true;
  }

  // 수정된 행 감지 (formula_id가 있는 기존 행의 내용 변경)
  for (const currentItem of processStore.formulaList) {
    if (!currentItem.formula_id || currentItem.formula_id.startsWith("temp_"))
      continue;

    const initialItem = processStore.initialFormulaList.find(
      (item) => item.formula_id === currentItem.formula_id
    );

    if (initialItem) {
      // 주요 필드 변경 확인
      if (
        currentItem.file_name !== initialItem.file_name ||
        currentItem.formula_code !== initialItem.formula_code ||
        (currentItem as any)._file !== undefined
      ) {
        return true;
      }
    }
  }

  return false;
};
const hasPfdChanges = () => {
  if (!processStore.initialPfdList || !processStore.pfdList) {
    console.log("hasPfdChanges: initialPfdList 또는 pfdList가 없습니다");
    return false;
  }

  console.log("hasPfdChanges 체크:", {
    initialCount: processStore.initialPfdList.length,
    currentCount: processStore.pfdList.length,
  });

  // drawing_id 기준으로 비교 (id는 저장 후 변경될 수 있음)
  const initialDrawingIds = processStore.initialPfdList
    .filter((item) => item.drawing_id && !item.drawing_id.startsWith("temp_"))
    .map((item) => item.drawing_id)
    .sort();
  const currentDrawingIds = processStore.pfdList
    .filter((item) => item.drawing_id && !item.drawing_id.startsWith("temp_"))
    .map((item) => item.drawing_id)
    .sort();

  // 임시 ID (저장되지 않은 항목) 개수 확인
  const initialTempCount = processStore.initialPfdList.filter(
    (item) => !item.drawing_id || item.drawing_id.startsWith("temp_")
  ).length;
  const currentTempCount = processStore.pfdList.filter(
    (item) => !item.drawing_id || item.drawing_id.startsWith("temp_")
  ).length;

  console.log("hasPfdChanges 상세:", {
    initialTempCount,
    currentTempCount,
    initialDrawingIds: initialDrawingIds.length,
    currentDrawingIds: currentDrawingIds.length,
  });

  // 임시 항목이 추가되었는지 확인
  if (currentTempCount > initialTempCount) {
    console.log("임시 항목이 추가됨");
    return true;
  }

  // 저장된 항목 수가 변경되었는지 확인
  if (initialDrawingIds.length !== currentDrawingIds.length) {
    console.log("저장된 항목 수가 변경됨");
    return true;
  }

  // 각 항목의 주요 필드가 변경되었는지 확인 (drawing_id 기준)
  for (const currentItem of processStore.pfdList) {
    if (!currentItem.drawing_id || currentItem.drawing_id.startsWith("temp_"))
      continue;

    const initialItem = processStore.initialPfdList.find(
      (item) => item.drawing_id === currentItem.drawing_id
    );
    if (!initialItem) {
      console.log("새로운 drawing_id 추가됨:", currentItem.drawing_id);
      return true; // 새로운 drawing_id 추가됨
    }

    // 파일명이 변경되었는지 확인
    if (
      currentItem.pfdFileName !== initialItem.pfdFileName ||
      currentItem.svgFileName !== initialItem.svgFileName
    ) {
      console.log("파일명 변경됨");
      return true;
    }
  }

  console.log("hasPfdChanges: 변경사항 없음");
  return false;
};

const hasMappingPidChanges = () => {
  const currentList = mappingPidList.value.map((item) => ({
    id: item.id,
    drawing_id: item.drawing_id,
    pidFileName: item.pidFileName,
    excelFileName: item.excelFileName,
    svgFileName: item.svgFileName,
  }));
  const initialList = initialMappingPidList.value.map((item) => ({
    id: item.id,
    drawing_id: item.drawing_id,
    pidFileName: item.pidFileName,
    excelFileName: item.excelFileName,
    svgFileName: item.svgFileName,
  }));
  return JSON.stringify(initialList) !== JSON.stringify(currentList);
};

const hasPidComponentChanges = () => {
  // 빈 배열 체크
  const initial = initialPidComponentList.value || [];
  const current = pidComponentList.value || [];
  
  if (initial.length === 0 && current.length === 0) {
    return false;
  }

  // 데이터 정규화 함수
  const normalize = (list: any[]) =>
    list.map((item) => ({
      pid_id: item.pid_id ?? null,
      category: item.category ?? null,
      middleCategory: item.middleCategory ?? null,
      smallCategory: item.smallCategory ?? null,
      equipmentType: item.equipmentType ?? null,
      standard_quantity: Number(item.standard_quantity ?? 0),
    }));

  const normalizedInitial = normalize(initial);
  const normalizedCurrent = normalize(current);

  return (
    JSON.stringify(normalizedInitial) !== JSON.stringify(normalizedCurrent)
  );
};

// 컴포넌트 섹션 닫기

// P&ID 컴포넌트 섹션 닫기
const closePidComponentSection = () => {
  console.log("P&ID 컴포넌트 섹션 닫기 버튼 클릭");

  // 변경사항 확인
  if (hasPidComponentChanges()) {
    if (!confirm("수정사항이 있습니다. 창을 닫으시겠습니까?")) {
      return;
    }
  }

  showPidComponentSection.value = false;
  selectedPidForComponent.value = null;
  pidComponentList.value = [];
  currentDrawingId.value = ""; // drawing_id 초기화
  pidComponentDrawingId.value = ""; // P&ID Components용 drawing_id 초기화
  deletedPidComponentIds.value = []; // 삭제 목록 초기화
  initialPidComponentList.value = []; // 초기 상태 초기화
  console.log("P&ID 컴포넌트 섹션 닫기 완료");
};

// P&ID 컴포넌트 선택 변경 핸들러
const handlePidComponentSelectionChange = () => {
  // v-model로 자동으로 selectedPidComponentItems가 업데이트됨
  console.log("선택된 P&ID 컴포넌트 항목들:", selectedPidComponentItems.value);
  console.log("선택된 항목 수:", selectedPidComponentItems.value.length);
  console.log(
    "선택된 항목들의 ID들:",
    selectedPidComponentItems.value.map((item) => item.id)
  );
  console.log(
    "선택된 항목들의 component_id들:",
    selectedPidComponentItems.value.map((item) => item.component_id)
  );

  // 현재 그리드의 모든 항목 ID도 출력
  console.log(
    "그리드의 모든 항목 ID들:",
    pidComponentList.value.map((item) => item.id)
  );
  console.log(
    "그리드의 모든 항목 component_id들:",
    pidComponentList.value.map((item) => item.component_id)
  );
};

// P&ID 컴포넌트 행 삭제
const deletePidComponentRow = () => {
  if (selectedPidComponentItems.value.length === 0) {
    alert("삭제할 행을 선택해주세요.");
    return;
  }

  console.log("=== P&ID 컴포넌트 삭제 시작 ===");
  console.log("선택된 항목들:", selectedPidComponentItems.value);

  // 삭제할 항목들을 구분 (저장된 항목과 임시 항목)
  const savedItems = selectedPidComponentItems.value.filter(
    (item) => item.component_id
  );
  const tempItems = selectedPidComponentItems.value.filter(
    (item) => !item.component_id
  );

  console.log("저장된 항목 수:", savedItems.length);
  console.log("임시 항목 수:", tempItems.length);

  // 삭제할 항목들을 삭제 목록에 추가 (저장 시 처리)
  const allItemsToDelete = selectedPidComponentItems.value;

  if (allItemsToDelete.length > 0) {
    // 저장된 항목들의 component_id를 삭제 목록에 추가 (중복 방지)
    const savedComponentIds = savedItems.map((item) => item.component_id);
    if (savedComponentIds.length > 0) {
      // 중복 제거하여 추가
      const newComponentIds = savedComponentIds.filter(
        (id) => !deletedPidComponentIds.value.includes(id)
      );
      if (newComponentIds.length > 0) {
        deletedPidComponentIds.value.push(...newComponentIds);
        console.log("삭제할 컴포넌트 ID들 추가:", newComponentIds);
      } else {
        console.log("이미 삭제 목록에 있는 컴포넌트 ID들:", savedComponentIds);
      }
    }

    // 임시 항목들의 id를 삭제 목록에 추가 (중복 방지)
    const tempItemIds = tempItems.map((item) => item.id);
    if (tempItemIds.length > 0) {
      // 임시 항목 삭제를 위한 별도 배열 사용
      if (!deletedPidComponentIds.value.tempItemIds) {
        deletedPidComponentIds.value.tempItemIds = [];
      }
      // 중복 제거하여 추가
      const newTempItemIds = tempItemIds.filter(
        (id) => !deletedPidComponentIds.value.tempItemIds.includes(id)
      );
      if (newTempItemIds.length > 0) {
        deletedPidComponentIds.value.tempItemIds.push(...newTempItemIds);
        console.log("삭제할 임시 항목 ID들 추가:", newTempItemIds);
      } else {
        console.log("이미 삭제 목록에 있는 임시 항목 ID들:", tempItemIds);
      }
    }

    console.log("현재 삭제 목록:", deletedPidComponentIds.value);
  }

  // UI에서 즉시 삭제 (시각적 피드백)
  const selectedIds = selectedPidComponentItems.value.map((item) => item.id);
  pidComponentList.value = pidComponentList.value.filter(
    (item) => !selectedIds.includes(item.id)
  );

  // 선택 상태 초기화
  selectedPidComponentItems.value = [];

  console.log("P&ID 컴포넌트 UI에서 삭제 완료 (API 호출은 저장 시)");
};

// 장비유형 코드로부터 이름을 가져오는 헬퍼 함수
const getEquipmentTypeName = (equipmentTypeCode: string) => {
  if (!equipmentTypeCode) return "";

  // equipmentTypeOptions에서 해당 코드의 이름을 찾기
  const option = equipmentTypeOptions.value.find(
    (opt) => opt.value === equipmentTypeCode
  );
  return option ? option.label : equipmentTypeCode;
};

// readonly select용 label 가져오기 함수들
const getCategoryLabel = (categoryCode: string) => {
  if (!categoryCode) return "";

  // categoryOptions에서 해당 코드의 이름을 찾기
  const option = categoryOptions.value.find(
    (opt) => opt.value === categoryCode
  );
  return option ? option.label : categoryCode;
};

const getMiddleCategoryLabel = (middleCategoryCode: string) => {
  if (!middleCategoryCode) return "";

  // middleCategoryOptions에서 해당 코드의 이름을 찾기
  const option = middleCategoryOptions.value.find(
    (opt) => opt.value === middleCategoryCode
  );
  return option ? option.label : middleCategoryCode;
};

const getSmallCategoryLabel = (smallCategoryCode: string) => {
  if (!smallCategoryCode) return "";

  // smallCategoryOptions에서 해당 코드의 이름을 찾기
  const option = smallCategoryOptions.value.find(
    (opt) => opt.value === smallCategoryCode
  );
  return option ? option.label : smallCategoryCode;
};

const getEquipmentTypeLabel = (equipmentTypeCode: string) => {
  if (!equipmentTypeCode) return "";

  // equipmentTypeOptions에서 해당 코드의 이름을 찾기
  const option = equipmentTypeOptions.value.find(
    (opt) => opt.value === equipmentTypeCode
  );
  // 매핑되는 코드가 없는 경우 공백으로 표시
  return option ? option.label : "";
};
// P&ID 컴포넌트 삭제 API
const deletePidComponentAPI = async (componentId: string) => {
  try {
    console.log("P&ID 컴포넌트 삭제 API 호출 시작 - componentId:", componentId);

    const response = await fetch(
      `/api/process/component/delete/${componentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          system_code: import.meta.env.VITE_SYSTEM_CODE,
          user_Id: localStorage.getItem("authUserId") || "",
          wai_lang: localStorage.getItem("wai_lang") || "ko",
        },
        credentials: "include",
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!responseData.success) {
      throw new Error(`API error: ${responseData.message || "Unknown error"}`);
    }

    console.log("P&ID 컴포넌트 삭제 API 호출 성공:", responseData);
    return responseData;
  } catch (error) {
    console.error("P&ID 컴포넌트 삭제 API 호출 실패:", error);
    throw error;
  }
};

// P&ID 컴포넌트 수정 API
const updatePidComponentAPI = async (
  componentId: string,
  componentData: any
) => {
  try {
    console.log("P&ID 컴포넌트 수정 API 호출 시작 - componentId:", componentId);
    console.log("수정할 데이터:", componentData);

    const response = await fetch(
      `/api/process/component/update/${componentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          system_code: import.meta.env.VITE_SYSTEM_CODE,
          user_Id: localStorage.getItem("authUserId") || "",
          wai_lang: localStorage.getItem("wai_lang") || "ko",
        },
        credentials: "include",
        body: JSON.stringify(componentData),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!responseData.success) {
      throw new Error(`API error: ${responseData.message || "Unknown error"}`);
    }

    console.log("P&ID 컴포넌트 수정 API 호출 성공:", responseData);
    return responseData;
  } catch (error) {
    console.error("P&ID 컴포넌트 수정 API 호출 실패:", error);
    throw error;
  }
};

// P&ID 컴포넌트 저장 핸들러
// P&ID 컴포넌트 필수입력 검증
const validatePidComponentData = () => {
  const errors: string[] = [];

  // hierarchy 필드들(구분, 중분류, 소분류, 장비유형) 필수체크 제외
  // pidComponentList.value.forEach((item, index) => {
  //   const rowNumber = index + 1;
  //
  //   if (!item.category) {
  //     errors.push(`${rowNumber}행: 구분을 선택해주세요.`);
  //   }
  //   if (!item.middleCategory) {
  //     errors.push(`${rowNumber}행: 중분류를 선택해주세요.`);
  //   }
  //   if (!item.smallCategory) {
  //     errors.push(`${rowNumber}행: 소분류를 선택해주세요.`);
  //   }
  //   if (!item.equipmentType) {
  //     errors.push(`${rowNumber}행: 장비유형을 선택해주세요.`);
  //   }
  // });

  return errors;
};

const handlePidComponentSave = async () => {
  try {
    console.log("P&ID 컴포넌트 저장 버튼 클릭");
    console.log("저장할 P&ID 컴포넌트 데이터:", pidComponentList.value);

    // 필수입력 검증
    const validationErrors = validatePidComponentData();
    if (validationErrors.length > 0) {
      alert(
        "다음 필수입력 항목을 확인해주세요:\n" + validationErrors.join("\n")
      );
      return;
    }

    // 삭제할 컴포넌트들 처리
    const hasDeletions =
      deletedPidComponentIds.value.length > 0 ||
      deletedPidComponentIds.value.tempItemIds?.length > 0;
    const hasData = pidComponentList.value.length > 0;

    if (hasDeletions) {
      console.log("=== 삭제할 컴포넌트 처리 시작 ===");
      console.log("삭제할 컴포넌트 ID들:", deletedPidComponentIds.value);

      // 저장된 항목들 서버에서 삭제
      for (const componentId of deletedPidComponentIds.value) {
        if (typeof componentId === "string") {
          console.log(`서버에서 삭제할 컴포넌트: ${componentId}`);
          await deletePidComponentAPI(componentId);
        }
      }

      // 임시 항목들은 이미 UI에서 삭제되었으므로 별도 처리 불필요
      if (deletedPidComponentIds.value.tempItemIds?.length > 0) {
        console.log(
          "임시 항목들은 이미 UI에서 삭제됨:",
          deletedPidComponentIds.value.tempItemIds
        );
      }

      console.log("=== 삭제할 컴포넌트 처리 완료 ===");

      // 삭제 목록 초기화
      deletedPidComponentIds.value = [];
    }

    // 그리드 데이터가 없고 삭제할 항목도 없으면 저장하지 않음
    if (
      pidComponentList.value.length === 0 &&
      deletedPidComponentIds.value.length === 0
    ) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // 수정할 항목과 신규 추가할 항목 구분
    console.log("=== 항목 구분 디버깅 시작 ===");
    console.log("전체 pidComponentList:", pidComponentList.value);

    const updateItems = pidComponentList.value.filter((item) => {
      const isLoadedFromServer = item._isLoadedFromServer === true;
      const hasComponentId = !!item.component_id;
      const isUuidFormat =
        item.component_id && uuidRegex.test(item.component_id);
      const isUpdateItem = isLoadedFromServer && hasComponentId && isUuidFormat;

      console.log(`항목 ${item.id} 구분 결과:`, {
        component_id: item.component_id,
        _isLoadedFromServer: item._isLoadedFromServer,
        hasComponentId,
        isUuidFormat,
        isUpdateItem,
        전체데이터: item,
      });

      return isUpdateItem;
    });

    const createItems = pidComponentList.value.filter((item) => {
      const isNotLoadedFromServer = item._isLoadedFromServer !== true;
      const hasNoComponentId = !item.component_id;
      const isTempId = item.component_id?.startsWith("temp_comp_");
      const isNotUuidFormat =
        item.component_id && !uuidRegex.test(item.component_id);
      const isCreateItem =
        isNotLoadedFromServer ||
        hasNoComponentId ||
        isTempId ||
        isNotUuidFormat;

      console.log(`항목 ${item.id} 신규 구분 결과:`, {
        component_id: item.component_id,
        _isLoadedFromServer: item._isLoadedFromServer,
        isNotLoadedFromServer,
        hasNoComponentId,
        isTempId,
        isNotUuidFormat,
        isCreateItem,
      });

      return isCreateItem;
    });

    console.log("수정할 항목 수:", updateItems.length);
    console.log("신규 추가할 항목 수:", createItems.length);
    console.log(
      "수정할 항목들:",
      updateItems.map((item) => ({
        id: item.id,
        component_id: item.component_id,
      }))
    );
    console.log(
      "신규 추가할 항목들:",
      createItems.map((item) => ({
        id: item.id,
        component_id: item.component_id,
      }))
    );
    console.log("=== 항목 구분 디버깅 끝 ===");

    // 수정할 항목들 처리
    if (updateItems.length > 0) {
      console.log("=== 기존 항목 수정 처리 시작 ===");
      console.log("수정할 항목들 상세:", updateItems);
      for (const item of updateItems) {
        console.log(`수정할 항목 상세 정보:`, {
          component_id: item.component_id,
          standard_quantity: item.standard_quantity,
          spare_quantity: item.spare_quantity,
          standard_quantityType: typeof item.standard_quantity,
          spare_quantityType: typeof item.spare_quantity,
        });

        // ProcessDetail 컴포넌트의 processId 가져오기
        let processId: string;
        if (props.isRegisterMode) {
          processId = createdProcessId.value || "";
        } else {
          processId = props.processId || (route.params.id as string) || "";
        }

        const componentData = {
          process_id: processId, // ProcessDetail 컴포넌트 마운트 - processId
          mapping_type: "PID_EXCEL", // 고정값
          pid_id: pidComponentDrawingId.value || currentDrawingId.value, // P&ID 선택행에서 전달받은 drawing_id
          // 기존 항목 수정 시에는 hierarchy 필드들(category, middleCategory, smallCategory, equipmentType) 제외
          input_poc: Number(item.input_poc) || 0, // POC IN 값
          standard_quantity: Number(item.standard_quantity) || 0, // 수량(상용)
          spare_quantity: Number(item.spare_quantity) || 0, // 수량(예비)
          is_active: true, // 고정값
        };

        console.log(
          `항목 ${item.component_id} 수정 데이터 (새로운 구조):`,
          componentData
        );
        console.log(`매개변수 확인:`, {
          process_id: componentData.process_id,
          mapping_type: componentData.mapping_type,
          pid_id: componentData.pid_id,
          // component_type 제거됨 (기존 항목 수정 시 hierarchy 필드 제외)
          input_poc: componentData.input_poc,
          standard_quantity: componentData.standard_quantity,
          spare_quantity: componentData.spare_quantity,
          is_active: componentData.is_active,
        });
        await updatePidComponentAPI(item.component_id, componentData);
      }
      console.log("=== 기존 항목 수정 처리 완료 ===");
    }

    // 신규 추가할 항목들 처리
    if (createItems.length > 0) {
      console.log("=== 신규 항목 추가 처리 시작 ===");
      console.log("신규 추가할 항목들 상세:", createItems);

      // UUID 형식 검증
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      // ProcessDetail 컴포넌트의 processId 가져오기
      let processId: string;
      if (props.isRegisterMode) {
        processId = createdProcessId.value || "";
      } else {
        processId = props.processId || (route.params.id as string) || "";
      }

      const componentData = createItems.map((item) => {
        // UUID 형식 검증 (pid_id 필드 사용)
        if (!item.pid_id || item.pid_id.length === 0) {
          throw new Error("P&ID ID가 누락되었습니다.");
        }

        // UUID 형식이 아닌 경우 에러
        if (!uuidRegex.test(item.pid_id)) {
          throw new Error(
            "P&ID ID가 올바른 UUID 형식이 아닙니다: " + item.pid_id
          );
        }

        return {
          process_id: processId, // ProcessDetail 컴포넌트 마운트 - processId
          mapping_type: "PID_EXCEL", // 고정값
          pid_id: pidComponentDrawingId.value || currentDrawingId.value, // P&ID 선택행에서 전달받은 drawing_id
          component_type: item.equipmentType, // 장비유형 select의 code
          input_poc: Number(item.input_poc) || 0, // POC IN 값
          standard_quantity: Number(item.standard_quantity) || 0, // 수량(상용)
          spare_quantity: Number(item.spare_quantity) || 0, // 수량(예비)
          is_active: true, // 고정값
        };
      });

      console.log("추출된 신규 컴포넌트 데이터:", componentData);

      // API 요청 데이터 준비
      const requestData = {
        components: componentData,
      };
      console.log("신규 추가 API 요청 데이터:", requestData);
      console.log("JSON 변환된 요청 데이터:", JSON.stringify(requestData));

      console.log("=== P&ID 컴포넌트 신규 추가 API 호출 시작 ===");
      console.log("API 엔드포인트:", "/api/process/component/create");
      console.log("요청 헤더:", {
        "Content-Type": "application/json",
        system_code: import.meta.env.VITE_SYSTEM_CODE,
        user_Id: localStorage.getItem("authUserId") || "",
        wai_lang: localStorage.getItem("wai_lang") || "ko",
      });

      // API 호출
      const response = await request(
        "/api/process/component/create",
        undefined,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log("=== P&ID 컴포넌트 신규 추가 API 응답 ===");
      console.log("신규 추가 API 응답 전체:", response);
      console.log("응답 성공 여부:", response.success);
      console.log("응답 상태:", response.status);
      console.log("응답 메시지:", response.message);
      console.log("응답 데이터:", response.response);

      if (!response.success) {
        console.error("=== P&ID 컴포넌트 신규 추가 API 실패 ===");
        console.error("실패 상태:", response.status);
        console.error("실패 메시지:", response.message);
        console.error("실패 응답 데이터:", response.response);

        // 백엔드 오류 분석
        if (
          response.status === 500 &&
          response.message &&
          response.message.includes("AttributeError")
        ) {
          console.error("🚨 백엔드 AttributeError 감지:");
          console.error("- 오류 유형: current_user.user_id 접근 오류");
          console.error(
            "- 원인: current_user가 딕셔너리로 전달되었는데 객체 속성으로 접근 시도"
          );
          console.error(
            '- 해결방안: 백엔드에서 current_user["user_id"] 또는 getattr() 사용 필요'
          );
          console.error("- 전송된 데이터:", JSON.stringify(requestData));

          throw new Error(
            `백엔드 오류: current_user.user_id 접근 실패\n백엔드 개발자에게 문의하세요.\n\n오류 세부사항:\n- 파일: process_pid_components.py:51\n- 원인: 'dict' object has no attribute 'user_id'\n- 해결: current_user['user_id'] 사용 필요`
          );
        } else {
          throw new Error(
            `신규 추가 실패: ${response.message || "알 수 없는 오류"}`
          );
        }
      }

      console.log("=== 신규 항목 추가 처리 완료 ===");
    }

    // 모든 처리 완료 후 성공 메시지
    if (hasDeletions && !hasData) {
      // 삭제만 있는 경우
      alert("P&ID 컴포넌트가 성공적으로 삭제되었습니다.");
    } else {
      // 수정/추가가 있는 경우
      alert("P&ID 컴포넌트 데이터가 성공적으로 저장되었습니다.");
    }
    console.log("P&ID 컴포넌트 저장 성공");

    // 저장 성공 후 그리드 상태 업데이트 (API 재호출 대신 저장된 데이터 반영)
    console.log("P&ID Components 저장 성공 후 그리드 상태 업데이트");

    // 신규 추가된 항목들의 임시 ID를 실제 component_id로 업데이트
    if (createItems.length > 0) {
      console.log("신규 추가된 항목들의 상태 업데이트 시작");

      createItems.forEach((createItem, index) => {
        const itemIndex = pidComponentList.value.findIndex(
          (item) => item.id === createItem.id
        );
        if (itemIndex !== -1) {
          // 저장 완료 상태로 표시
          pidComponentList.value[itemIndex].isSaved = true;
          console.log(`신규 항목 ${createItem.id} 저장 완료 상태로 업데이트`);
        }
      });
    }

    // 수정된 항목들의 상태 업데이트
    if (updateItems.length > 0) {
      console.log("수정된 항목들의 상태 업데이트 시작");

      updateItems.forEach((updateItem) => {
        const itemIndex = pidComponentList.value.findIndex(
          (item) => item.component_id === updateItem.component_id
        );
        if (itemIndex !== -1) {
          // 저장 완료 상태로 표시
          pidComponentList.value[itemIndex].isSaved = true;
          console.log(
            `수정 항목 ${updateItem.component_id} 저장 완료 상태로 업데이트`
          );
        }
      });
    }

    // 초기값 업데이트 (저장된 상태를 반영)
    // const updatedComponentList = JSON.parse(JSON.stringify(pidComponentList.value));
    // initialPidComponentList.value = updatedComponentList;

    console.log("P&ID Components 그리드 상태 업데이트 완료 (데이터 유지)");
    console.log("현재 그리드 데이터 수:", pidComponentList.value.length);
    // console.log('업데이트된 초기값 데이터 수:', initialPidComponentList.value.length);

    // P&ID 컴포넌트 저장 성공 후 그리드 상태만 업데이트 (DIV 닫히는 현상 방지)
    console.log(
      "=== P&ID 컴포넌트 저장 완료 - 그리드 상태 업데이트만 수행 ==="
    );
    console.log("P&ID Components 섹션 유지 (DIV 닫히는 현상 방지)");
  } catch (error) {
    console.error("P&ID 컴포넌트 저장 실패:", error);
    alert(`P&ID 컴포넌트 저장 실패: ${error.message}`);
  }
};
// 공정심볼 다운로드 함수 (store 함수 래퍼)
const downloadProcessSymbol = async () => {
  await processStore.downloadProcessSymbol(getProcessSymbolFileName);
};

// 공정심볼 삭제 핸들러 (화면에서만 제거, 실제 삭제는 저장 시 처리)
const handleDeleteProcessSymbol = () => {
  const symbolId = processStore.processDetail.symbolId;
  const hasSelectedFile = processStore.selectedFiles["processSymbol"];
  
  // 삭제할 심볼이 없는 경우
  if (!hasSelectedFile && (!symbolId || symbolId === "00000000-0000-0000-0000-000000000000")) {
    alert("삭제할 공정심볼이 없습니다.");
    return;
  }

  // 미리보기 URL 해제
  processStore.clearProcessSymbolPreview();
  
  // 선택된 파일 제거
  const updatedSelectedFiles = { ...processStore.selectedFiles };
  delete updatedSelectedFiles["processSymbol"];
  processStore.setSelectedFiles(updatedSelectedFiles);
  
  // processDetail에서 심볼 표시 정보 초기화
  // originalSymbolId와 originalProcessSymbol은 유지하여 저장 시 삭제 감지
  if (symbolId && symbolId !== "00000000-0000-0000-0000-000000000000") {
    // 서버에 저장된 심볼 삭제 표시 (화면에서만 제거, originalSymbolId는 유지하여 저장 시 DELETE API 호출)
    processStore.setProcessDetail({
      processSymbol: "",
      symbolId: "00000000-0000-0000-0000-000000000000", // 화면 표시용으로 빈 UUID 설정
      // originalSymbolId와 originalProcessSymbol은 유지하여 저장 시 삭제 감지
    });
  } else {
    // 새로 선택한 파일만 취소
    processStore.setProcessDetail({
      processSymbol: "",
    });
  }
};

// 공정카드 Svg 파일 다운로드 함수
const downloadPfdSvgFile = async (pfdItem: any) => {
  try {
    console.log("=== 공정카드 Svg 파일 다운로드 시작 ===");
    console.log("pfdItem 정보:", {
      symbol_id: pfdItem.symbol_id,
      symbol_uri: pfdItem.symbol_uri,
      svgFileName: pfdItem.svgFileName,
      pfdFileName: pfdItem.pfdFileName,
    });

    const symbolId = pfdItem.symbol_id;

    if (!symbolId) {
      console.log("❌ symbol_id가 없어서 다운로드 불가");
      alert("다운로드할 Svg 파일이 없습니다.");
      return;
    }

    console.log("다운로드할 symbol_id:", symbolId);

    // API 호출하여 파일 다운로드
    const response = await fetch(`/api/process/symbol/download/${symbolId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        system_code: import.meta.env.VITE_SYSTEM_CODE,
        user_Id: localStorage.getItem("authUserId") || "",
        wai_lang: localStorage.getItem("wai_lang") || "ko",
      },
    });

    if (!response.ok) {
      throw new Error(
        `다운로드 실패: ${response.status} ${response.statusText}`
      );
    }

    // 파일명 추출 (우선순위: Content-Disposition 헤더 > getSvgFileName)
    const contentDisposition = response.headers.get("Content-Disposition");
    let fileName = "";

    // 1. Content-Disposition 헤더에서 파일명 추출 시도
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1].replace(/['"]/g, "");
      }
    }

    // 2. Content-Disposition에서 파일명을 못 찾으면 getSvgFileName 사용
    if (!fileName) {
      const svgFileName = getSvgFileName(pfdItem);
      if (svgFileName && svgFileName !== t("common.noFile")) {
        fileName = svgFileName;
        console.log("getSvgFileName에서 다운로드 파일명 설정:", fileName);
      }
    }

    console.log("Svg 파일 다운로드 파일명 최종 결정:", fileName);

    // 응답을 JSON으로 파싱
    const responseData = await response.json();
    console.log("Svg 파일 다운로드 API 응답:", responseData);

    // response_body에서 SVG 내용 추출
    let svgContent = "";
    if (responseData.success && responseData.response_body) {
      svgContent = responseData.response_body;
    } else {
      throw new Error("SVG 내용을 찾을 수 없습니다.");
    }

    // SVG 유효성 검사
    if (
      !svgContent.trim().startsWith("<svg") &&
      !svgContent.trim().startsWith("<?xml")
    ) {
      throw new Error("유효하지 않은 SVG 형식입니다.");
    }

    // Blob으로 변환하여 다운로드
    const blob = new Blob([svgContent], {
      type: "image/svg+xml",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log("✅ 공정카드 Svg 파일 다운로드 완료:", {
      fileName: fileName,
      symbol_id: pfdItem.symbol_id,
      symbol_uri: pfdItem.symbol_uri,
      source: "downloadPfdSvgFile",
    });
  } catch (error) {
    console.error("공정카드 Svg 파일 다운로드 실패:", error);
    alert(
      "공정카드 Svg 파일 다운로드에 실패했습니다: " + (error.message || error)
    );
  }
};

// 계산식 목록에서 다운로드 함수 (원본 데이터 사용)
const downloadFormulaFromList = async (formulaItem: any) => {
  try {
    // 원본 데이터에서 다운로드 URL 확인
    const originalData = formulaItem._originalData || formulaItem;

    // 다운로드 URL이 있는지 확인
    let downloadUrl =
      originalData.download_url || originalData.file_url || originalData.url;

    if (downloadUrl) {
      // 외부 URL인 경우 직접 다운로드
      if (downloadUrl.startsWith("http")) {
        window.open(downloadUrl, "_blank");
        return;
      }
    }

    // 다운로드 URL이 없으면 기존 방식 사용
    if (formulaItem.formula_id) {
      console.log("=== downloadFormulaFromList에서 downloadFormula 호출 ===");
      console.log("formulaItem.formula_id:", formulaItem.formula_id);
      console.log("formulaItem.file_name:", formulaItem.file_name);
      await downloadFormula(formulaItem.formula_id, formulaItem.file_name);
    } else {
      throw new Error("다운로드할 계산식 정보가 없습니다.");
    }
  } catch (error) {
    console.error("계산식 다운로드 실패:", error);
    alert("계산식 다운로드에 실패했습니다: " + (error.message || error));
  }
};

// 계산식 다운로드 함수
const downloadFormula = async (formulaId: string, fileName?: string) => {
  try {
    console.log("=== downloadFormula 함수 호출 ===");
    console.log("formulaId:", formulaId);
    console.log("fileName:", fileName);

    if (!formulaId) {
      alert("다운로드할 계산식이 없습니다.");
      return;
    }

    // API 호출하여 파일 다운로드
    const response = await fetch(`/api/process/formula/download/${formulaId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        system_code: import.meta.env.VITE_SYSTEM_CODE,
        user_Id: localStorage.getItem("authUserId") || "",
        wai_lang: localStorage.getItem("wai_lang") || "ko",
      },
    });

    // 응답을 텍스트로 먼저 확인
    const responseText = await response.text();

    if (!response.ok) {
      // 에러 응답의 상세 내용 확인
      let errorMessage = `다운로드 실패: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage += ` - ${
          errorData.message || errorData.detail || "알 수 없는 오류"
        }`;
      } catch (e) {
        errorMessage += ` - ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    // JSON 응답인지 확인
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      // JSON이 아니면 직접 파일 내용으로 처리
      const blob = new Blob([responseText], {
        type: "text/plain",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const finalFileName = fileName || "formula.py";
      link.download = finalFileName; // file_name 사용

      console.log("다운로드 파일명 설정:", {
        전달된_fileName: fileName,
        최종_파일명: finalFileName,
      });
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    }

    // JSON 응답 처리
    let fileContent = "";
    let responseFileName = fileName || "formula.py"; // 매개변수로 받은 fileName 사용

    if (responseData.success && responseData.response_body) {
      fileContent = responseData.response_body;
    } else if (responseData.download_url) {
      // 다운로드 URL이 있는 경우
      window.open(responseData.download_url, "_blank");
      return;
    } else {
      throw new Error("파일 내용을 찾을 수 없습니다.");
    }

    // 파일명 추출 (매개변수로 받은 fileName을 우선 사용)
    if (responseData.file_name && !fileName) {
      responseFileName = responseData.file_name;
    }

    console.log("JSON 응답 처리 - 파일명 설정:", {
      매개변수_fileName: fileName,
      응답_file_name: responseData.file_name,
      최종_파일명: responseFileName,
    });

    // Blob으로 변환하여 다운로드
    const blob = new Blob([fileContent], {
      type: "text/plain",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = responseFileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("계산식 다운로드 실패:", error);
    alert("계산식 다운로드에 실패했습니다: " + (error.message || error));
  }
};
// 공정카드 다운로드 함수
const downloadPfd = async (drawingId: string) => {
  try {
    console.log("=== 공정카드 파일 다운로드 시작 ===");
    console.log("drawingId:", drawingId);

    if (!drawingId) {
      alert("다운로드할 공정카드가 없습니다.");
      return;
    }

    // API 호출하여 파일 다운로드
    const response = await fetch(`/api/process/drawing/download/${drawingId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        system_code: import.meta.env.VITE_SYSTEM_CODE,
        user_Id: localStorage.getItem("authUserId") || "",
        wai_lang: localStorage.getItem("wai_lang") || "ko",
      },
    });

    if (!response.ok) {
      throw new Error(
        `다운로드 실패: ${response.status} ${response.statusText}`
      );
    }

    // 응답을 JSON으로 파싱
    const responseData = await response.json();

    console.log("공정카드 API 응답 전체 구조:", responseData);

    // response_body 파싱 (JSON 문자열을 객체로 변환)
    let actualDownloadData = null;
    if (responseData.response_body) {
      try {
        actualDownloadData = JSON.parse(responseData.response_body);
        console.log("response_body 파싱 결과:", actualDownloadData);
      } catch (e) {
        console.error("response_body 파싱 실패:", e);
      }
    }

    // 실제 다운로드 URL과 파일 정보 추출
    const downloadUrl =
      actualDownloadData?.download_url || responseData.download_url;
    const fileInfo = actualDownloadData?.file_info;

    console.log("추출된 downloadUrl:", downloadUrl);
    console.log("추출된 fileInfo:", fileInfo);

    // download_url이 있으면 실제 파일 다운로드
    if (downloadUrl) {
      // 파일명 추출
      let fileName = "";

      console.log("파일명 추출 디버깅:");
      console.log("- fileInfo 존재 여부:", !!fileInfo);
      console.log(
        "- fileInfo.file_name 존재 여부:",
        !!(fileInfo && fileInfo.file_name)
      );
      console.log("- fileInfo.file_name 값:", fileInfo?.file_name);

      if (fileInfo && fileInfo.file_name) {
        fileName = fileInfo.file_name;
        console.log("fileInfo.file_name에서 추출된 파일명:", fileName);
      } else {
        console.log("fileInfo.file_name이 없음, 기본값 사용:", fileName);
      }

      console.log("공정카드 다운로드 URL:", downloadUrl);
      console.log("공정카드 파일명:", fileName);

      // 직접 링크로 다운로드
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.target = "_blank";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("공정카드 파일 다운로드 완료:", fileName);
      return;
    } else {
      // response_body에서 파일 내용 추출
      let fileContent = "";
      if (responseData.success && responseData.response_body) {
        fileContent = responseData.response_body;
      } else {
        throw new Error("파일 내용을 찾을 수 없습니다.");
      }

      // 파일명 추출 (responseData.file_info.file_name 사용)
      let fileName = "";
      if (responseData.file_info && responseData.file_info.file_name) {
        fileName = responseData.file_info.file_name;
      }

      // Blob으로 변환하여 다운로드
      const blob = new Blob([fileContent], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("공정카드 다운로드 실패:", error);
    alert("공정카드 다운로드에 실패했습니다: " + (error.message || error));
  }
};

// Excel 파일 다운로드 함수
// 매핑 Svg 다운로드 함수 (svg_drawing_id 사용)
const downloadMappingSvg = async (
  svgDrawingId: string,
  svgFileName?: string
) => {
  try {
    console.log("=== 매핑 Svg 파일 다운로드 시작 ===");
    console.log("svgDrawingId:", svgDrawingId);
    console.log("svgFileName:", svgFileName);

    if (!svgDrawingId) {
      console.error(
        "svg_drawing_id가 없습니다. 매핑 Svg 다운로드를 할 수 없습니다."
      );
      alert(
        "Svg 파일이 저장되지 않아서 다운로드할 수 없습니다. 먼저 Svg 파일을 저장해주세요."
      );
      return;
    }

    // 임시 ID인 경우 처리
    if (svgDrawingId.startsWith("temp_svg_drawing_")) {
      console.warn("임시 Svg drawing_id로 다운로드 시도:", svgDrawingId);
      alert(
        "Svg 파일이 아직 저장되지 않았습니다. P&ID 저장 버튼을 클릭하여 파일을 먼저 저장해주세요."
      );
      return;
    }

    // API 호출하여 파일 다운로드 URL 획득
    const response = await fetch(
      `/api/process/drawing/download/${svgDrawingId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          system_code: import.meta.env.VITE_SYSTEM_CODE,
          user_Id: localStorage.getItem("authUserId") || "",
          wai_lang: localStorage.getItem("wai_lang") || "ko",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `다운로드 실패: ${response.status} ${response.statusText}`
      );
    }

    // 응답을 JSON으로 파싱
    const responseData = await response.json();

    console.log("매핑 Svg API 응답 전체 구조:", responseData);

    // response_body 파싱 (JSON 문자열을 객체로 변환)
    let actualDownloadData = null;
    if (responseData.response_body) {
      try {
        actualDownloadData = JSON.parse(responseData.response_body);
        console.log("매핑 Svg response_body 파싱 결과:", actualDownloadData);
      } catch (e) {
        console.error("매핑 Svg response_body 파싱 실패:", e);
      }
    }

    // 실제 다운로드 URL과 파일 정보 추출
    const downloadUrl =
      actualDownloadData?.download_url || responseData.download_url;
    const fileInfo = actualDownloadData?.file_info;

    console.log("매핑 Svg 추출된 downloadUrl:", downloadUrl);
    console.log("매핑 Svg 추출된 fileInfo:", fileInfo);

    // download_url이 있으면 실제 파일 다운로드
    if (downloadUrl) {
      // 파일명 추출 (우선순위: 파라미터로 받은 파일명 > API 응답의 file_name)
      let fileName = "";

      console.log("매핑 Svg 파일명 추출 디버깅:");
      console.log("- 파라미터 svgFileName:", svgFileName);
      console.log("- fileInfo 존재 여부:", !!fileInfo);
      console.log(
        "- fileInfo.file_name 존재 여부:",
        !!(fileInfo && fileInfo.file_name)
      );
      console.log("- fileInfo.file_name 값:", fileInfo?.file_name);

      if (svgFileName) {
        fileName = svgFileName;
        console.log("파라미터에서 추출된 파일명:", fileName);
      } else if (fileInfo && fileInfo.file_name) {
        fileName = fileInfo.file_name;
        console.log("fileInfo.file_name에서 추출된 파일명:", fileName);
      } else {
        console.log("파일명을 찾을 수 없음, 기본값 사용:", fileName);
      }

      console.log("매핑 Svg 파일 다운로드 URL:", downloadUrl);
      console.log("매핑 Svg 파일명:", fileName);

      // 직접 링크로 다운로드
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.target = "_blank";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("매핑 Svg 파일 다운로드 완료:", fileName);
      return;
    } else {
      throw new Error("다운로드 URL을 찾을 수 없습니다.");
    }
  } catch (error: any) {
    console.error("매핑 Svg 파일 다운로드 실패:", error);
    alert(`매핑 Svg 파일 다운로드에 실패했습니다: ${error.message}`);
  }
};

// 매핑 Excel 다운로드 함수 (excel_drawing_id 사용)
const downloadMappingExcel = async (
  excelDrawingId: string,
  excelFileName?: string
) => {
  try {
    console.log("=== 매핑 Excel 파일 다운로드 시작 ===");
    console.log("excelDrawingId:", excelDrawingId);
    console.log("excelFileName:", excelFileName);

    if (!excelDrawingId) {
      console.error(
        "excel_drawing_id가 없습니다. 매핑 Excel 다운로드를 할 수 없습니다."
      );
      alert(
        "Excel 파일이 저장되지 않아서 다운로드할 수 없습니다. 먼저 Excel 파일을 저장해주세요."
      );
      return;
    }

    // 임시 ID인 경우 처리
    if (excelDrawingId.startsWith("temp_excel_drawing_")) {
      console.warn("임시 Excel drawing_id로 다운로드 시도:", excelDrawingId);
      alert(
        "Excel 파일이 아직 저장되지 않았습니다. P&ID 저장 버튼을 클릭하여 파일을 먼저 저장해주세요."
      );
      return;
    }

    // API 호출하여 파일 다운로드 URL 획득
    const response = await fetch(
      `/api/process/drawing/download/${excelDrawingId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          system_code: import.meta.env.VITE_SYSTEM_CODE,
          user_Id: localStorage.getItem("authUserId") || "",
          wai_lang: localStorage.getItem("wai_lang") || "ko",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `다운로드 실패: ${response.status} ${response.statusText}`
      );
    }

    // 응답을 JSON으로 파싱
    const responseData = await response.json();

    console.log("매핑 Excel API 응답 전체 구조:", responseData);

    // response_body 파싱 (JSON 문자열을 객체로 변환)
    let actualDownloadData = null;
    if (responseData.response_body) {
      try {
        actualDownloadData = JSON.parse(responseData.response_body);
        console.log("매핑 Excel response_body 파싱 결과:", actualDownloadData);
      } catch (e) {
        console.error("매핑 Excel response_body 파싱 실패:", e);
      }
    }

    // 실제 다운로드 URL과 파일 정보 추출
    const downloadUrl =
      actualDownloadData?.download_url || responseData.download_url;
    const fileInfo = actualDownloadData?.file_info;

    console.log("매핑 Excel 추출된 downloadUrl:", downloadUrl);
    console.log("매핑 Excel 추출된 fileInfo:", fileInfo);

    // download_url이 있으면 실제 파일 다운로드
    if (downloadUrl) {
      // 파일명 추출 (우선순위: 파라미터로 받은 파일명 > API 응답의 file_name)
      let fileName = "";

      console.log("매핑 Excel 파일명 추출 디버깅:");
      console.log("- 파라미터 excelFileName:", excelFileName);
      console.log("- fileInfo 존재 여부:", !!fileInfo);
      console.log(
        "- fileInfo.file_name 존재 여부:",
        !!(fileInfo && fileInfo.file_name)
      );
      console.log("- fileInfo.file_name 값:", fileInfo?.file_name);

      if (excelFileName) {
        fileName = excelFileName;
        console.log("파라미터에서 추출된 파일명:", fileName);
      } else if (fileInfo && fileInfo.file_name) {
        fileName = fileInfo.file_name;
        console.log("fileInfo.file_name에서 추출된 파일명:", fileName);
      } else {
        console.log("파일명을 찾을 수 없음, 기본값 사용:", fileName);
      }

      console.log("매핑 Excel 파일 다운로드 URL:", downloadUrl);
      console.log("매핑 Excel 파일명:", fileName);

      // 직접 링크로 다운로드
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.target = "_blank";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("매핑 Excel 파일 다운로드 완료:", fileName);
      return;
    } else {
      throw new Error("다운로드 URL을 찾을 수 없습니다.");
    }
  } catch (error: any) {
    console.error("매핑 Excel 파일 다운로드 실패:", error);
    alert(`매핑 Excel 파일 다운로드에 실패했습니다: ${error.message}`);
  }
};

const downloadExcel = async (drawingId: string) => {
  try {
    console.log("=== Excel 파일 다운로드 시작 ===");
    console.log("drawingId:", drawingId);

    if (!drawingId) {
      alert("다운로드할 Excel 파일이 없습니다.");
      return;
    }

    // API 호출하여 파일 다운로드 URL 획득
    const response = await fetch(`/api/process/drawing/download/${drawingId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        system_code: import.meta.env.VITE_SYSTEM_CODE,
        user_Id: localStorage.getItem("authUserId") || "",
        wai_lang: localStorage.getItem("wai_lang") || "ko",
      },
    });

    if (!response.ok) {
      throw new Error(
        `다운로드 실패: ${response.status} ${response.statusText}`
      );
    }

    // 응답을 JSON으로 파싱
    const responseData = await response.json();

    console.log("Excel API 응답 전체 구조:", responseData);

    // response_body 파싱 (JSON 문자열을 객체로 변환)
    let actualDownloadData = null;
    if (responseData.response_body) {
      try {
        actualDownloadData = JSON.parse(responseData.response_body);
        console.log("Excel response_body 파싱 결과:", actualDownloadData);
      } catch (e) {
        console.error("Excel response_body 파싱 실패:", e);
      }
    }

    // 실제 다운로드 URL과 파일 정보 추출
    const downloadUrl =
      actualDownloadData?.download_url || responseData.download_url;
    const fileInfo = actualDownloadData?.file_info;

    console.log("Excel 추출된 downloadUrl:", downloadUrl);
    console.log("Excel 추출된 fileInfo:", fileInfo);

    // download_url이 있으면 실제 파일 다운로드
    if (downloadUrl) {
      // 파일명 추출
      let fileName = "";

      console.log("Excel 파일명 추출 디버깅:");
      console.log("- fileInfo 존재 여부:", !!fileInfo);
      console.log(
        "- fileInfo.file_name 존재 여부:",
        !!(fileInfo && fileInfo.file_name)
      );
      console.log("- fileInfo.file_name 값:", fileInfo?.file_name);

      if (fileInfo && fileInfo.file_name) {
        fileName = fileInfo.file_name;
        console.log("fileInfo.file_name에서 추출된 파일명:", fileName);
      } else {
        console.log("fileInfo.file_name이 없음, 기본값 사용:", fileName);
      }

      console.log("Excel 파일 다운로드 URL:", downloadUrl);
      console.log("Excel 파일명:", fileName);

      // 직접 링크로 다운로드
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.target = "_blank";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Excel 파일 다운로드 완료:", fileName);
      return;
    } else {
      throw new Error("다운로드 URL을 찾을 수 없습니다.");
    }
  } catch (error: any) {
    console.error("Excel 파일 다운로드 실패:", error);
    alert(`Excel 파일 다운로드에 실패했습니다: ${error.message}`);
  }
};
// P&ID SVG 도면 다운로드 함수
const downloadPidSvg = async (pidItem: any) => {
  try {
    console.log("=== P&ID SVG 도면 파일 다운로드 시작 ===");
    console.log("pidItem:", pidItem);
    console.log("drawing_id:", pidItem.drawing_id);
    console.log("svg_file_name:", pidItem.svg_file_name || pidItem.svgFileName);

    if (!pidItem.drawing_id) {
      alert("P&ID drawing_id가 없어서 SVG 도면을 다운로드할 수 없습니다.");
      return;
    }

    const fileName = pidItem.svg_file_name || pidItem.svgFileName || "";

    console.log("P&ID SVG 다운로드 API 호출:", {
      api: `/api/process/drawing/download/${pidItem.drawing_id}`,
      drawing_id: pidItem.drawing_id,
      expected_file: fileName,
    });

    const response = await request(
      `/api/process/drawing/download/${pidItem.drawing_id}`,
      undefined,
      {
        method: "GET",
      }
    );

    console.log("P&ID SVG 다운로드 API 응답:", response);

    if (response.success) {
      // API 응답 구조 상세 분석
      console.log("=== API 응답 구조 상세 분석 ===");
      console.log("response 전체:", response);
      console.log("response.response:", response.response);
      console.log("response.response 타입:", typeof response.response);

      // response.response가 문자열인 경우 JSON 파싱 시도
      let responseData = response.response;
      if (typeof response.response === "string") {
        try {
          responseData = JSON.parse(response.response);
          console.log("JSON 파싱 후 responseData:", responseData);
        } catch (parseError) {
          console.error("JSON 파싱 실패:", parseError);
          responseData = response.response;
        }
      }

      // download_url 추출 시도 (여러 경로에서)
      let downloadUrl = null;
      let fileInfo = null;

      // 1단계: responseData에서 직접 확인
      if (responseData && typeof responseData === "object") {
        downloadUrl = responseData.download_url;
        fileInfo = responseData.file_info;

        console.log("1단계 - responseData에서 추출:", {
          download_url: downloadUrl,
          file_info: fileInfo,
          responseData_keys: Object.keys(responseData),
        });
      }

      // 2단계: response에서 직접 확인 (responseData에서 찾지 못한 경우)
      if (!downloadUrl && response.download_url) {
        downloadUrl = response.download_url;
        fileInfo = response.file_info;

        console.log("2단계 - response에서 직접 추출:", {
          download_url: downloadUrl,
          file_info: fileInfo,
        });
      }

      // download_url이 있는 경우 다운로드 처리
      if (downloadUrl) {
        // file_info에서 실제 파일명 추출
        const actualFileName = fileInfo?.file_name || fileName;

        console.log("✅ P&ID SVG 다운로드 정보:", {
          download_url: downloadUrl,
          file_name: actualFileName,
          expires_in: response.response?.expires_in || response.expires_in,
        });

        // 직접 링크로 다운로드
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = actualFileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("P&ID SVG 파일 다운로드 완료:", actualFileName);
        return;
      } else {
        console.warn("download_url을 찾을 수 없습니다.");
        alert("SVG 파일 다운로드 URL을 찾을 수 없습니다.");
      }
    } else {
      console.error("P&ID SVG 다운로드 API 실패:", response);
      alert(`SVG 파일 다운로드 실패: ${response.message || "알 수 없는 오류"}`);
    }
  } catch (error) {
    console.error("P&ID SVG 다운로드 실패:", error);
    alert(`SVG 파일 다운로드 실패: ${error.message || error}`);
  }
};

// P&ID 다운로드 함수
const downloadPid = async (drawingId: string) => {
  try {
    console.log("=== P&ID 파일 다운로드 시작 ===");
    console.log("drawingId:", drawingId);

    if (!drawingId) {
      alert(
        "P&ID 파일이 저장되지 않아서 다운로드할 수 없습니다. 먼저 P&ID 파일을 저장해주세요."
      );
      return;
    }

    // 임시 ID인 경우 처리
    if (drawingId.startsWith("temp_pid_drawing_")) {
      console.warn("임시 P&ID drawing_id로 다운로드 시도:", drawingId);
      alert(
        "P&ID 파일이 아직 저장되지 않았습니다. P&ID 저장 버튼을 클릭하여 파일을 먼저 저장해주세요."
      );
      return;
    }

    // API 호출하여 파일 다운로드
    const response = await fetch(`/api/process/drawing/download/${drawingId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        system_code: import.meta.env.VITE_SYSTEM_CODE,
        user_Id: localStorage.getItem("authUserId") || "",
        wai_lang: localStorage.getItem("wai_lang") || "ko",
      },
    });

    if (!response.ok) {
      throw new Error(
        `다운로드 실패: ${response.status} ${response.statusText}`
      );
    }

    // 응답을 JSON으로 파싱
    const responseData = await response.json();

    console.log("P&ID API 응답 전체 구조:", responseData);

    // response_body 파싱 (JSON 문자열을 객체로 변환)
    let actualDownloadData = null;
    if (responseData.response_body) {
      try {
        actualDownloadData = JSON.parse(responseData.response_body);
        console.log("P&ID response_body 파싱 결과:", actualDownloadData);
      } catch (e) {
        console.error("P&ID response_body 파싱 실패:", e);
      }
    }

    // 실제 다운로드 URL과 파일 정보 추출
    const downloadUrl =
      actualDownloadData?.download_url || responseData.download_url;
    const fileInfo = actualDownloadData?.file_info;

    console.log("P&ID 추출된 downloadUrl:", downloadUrl);
    console.log("P&ID 추출된 fileInfo:", fileInfo);

    // download_url이 있으면 실제 파일 다운로드
    if (downloadUrl) {
      // 파일명 추출
      let fileName = "";

      console.log("P&ID 파일명 추출 디버깅:");
      console.log("- fileInfo 존재 여부:", !!fileInfo);
      console.log(
        "- fileInfo.file_name 존재 여부:",
        !!(fileInfo && fileInfo.file_name)
      );
      console.log("- fileInfo.file_name 값:", fileInfo?.file_name);

      if (fileInfo && fileInfo.file_name) {
        fileName = fileInfo.file_name;
        console.log("fileInfo.file_name에서 추출된 파일명:", fileName);
      } else {
        console.log("fileInfo.file_name이 없음, 기본값 사용:", fileName);
      }

      console.log("P&ID 다운로드 URL:", downloadUrl);
      console.log("P&ID 파일명:", fileName);

      // 직접 링크로 다운로드
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.target = "_blank";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("P&ID 파일 다운로드 완료:", fileName);
      return;
    } else {
      // response_body에서 파일 내용 추출
      let fileContent = "";
      if (responseData.success && responseData.response_body) {
        fileContent = responseData.response_body;
      } else {
        throw new Error("파일 내용을 찾을 수 없습니다.");
      }

      // 파일명 추출 (responseData.file_info.file_name 사용)
      let fileName = "";
      if (responseData.file_info && responseData.file_info.file_name) {
        fileName = responseData.file_info.file_name;
      }

      // Blob으로 변환하여 다운로드
      const blob = new Blob([fileContent], {
        type: "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error("P&ID 다운로드 실패:", error);
    alert("P&ID 다운로드에 실패했습니다: " + (error.message || error));
  }
};

// Svg 파일 선택 (공정카드 그리드용)
const selectSvgFile = (item: any) => {
  currentPfdItemForSvg.value = item;
  // 동적으로 ref를 찾아서 클릭
  const inputElement = document.querySelector(
    `input[data-svg-input="${item.id}"]`
  ) as HTMLInputElement;
  if (inputElement) {
    inputElement.click();
  }
};

// Svg 파일 변경 핸들러 (공정카드 그리드용)
const handleSvgFileChange = (item: any, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    console.log("Svg 파일 선택됨:", file.name);

    // 공정카드 그리드에서 선택된 경우
    if (
      currentPfdItemForSvg.value &&
      currentPfdItemForSvg.value.id === item.id
    ) {
      // processStore.pfdList에서 해당 항목을 찾아서 업데이트
      const itemIndex = processStore.pfdList.findIndex(
        (pfdItem) => pfdItem.id === item.id
      );
      if (itemIndex !== -1) {
        processStore.pfdList[itemIndex].svgFileName = file.name;
        processStore.pfdList[itemIndex].svgFile = file;
        processStore.pfdList[
          itemIndex
        ].svg_drawing_id = `temp_svg_drawing_${Date.now()}`;
        console.log("Svg 파일이 processStore.pfdList에 업데이트됨:", file.name);
      }
    }

    console.log("Svg 파일 선택 완료:", file.name);
  }
};

// PFD 파일 선택 (공정카드 그리드용)
const selectPfdFile = (item: any) => {
  // 동적으로 ref를 찾아서 클릭
  const inputElement = document.querySelector(
    `input[data-pfd-input="${item.id}"]`
  ) as HTMLInputElement;
  if (inputElement) {
    inputElement.click();
  }
};

// PFD 파일 변경 핸들러 (공정카드 그리드용)
const handlePfdFileChange = (item: any, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    console.log("PFD 파일 선택됨:", file.name);

    // processStore.pfdList에서 해당 항목을 찾아서 업데이트
    const itemIndex = processStore.pfdList.findIndex(
      (pfdItem) => pfdItem.id === item.id
    );
    if (itemIndex !== -1) {
      processStore.pfdList[itemIndex].pfdFileName = file.name;
      (processStore.pfdList[itemIndex] as any)._file = file; // _file 속성으로 저장 (processPfdChanges에서 감지)
      processStore.pfdList[
        itemIndex
      ].drawing_id = `temp_pfd_drawing_${Date.now()}`;
      console.log("PFD 파일이 processStore.pfdList에 업데이트됨:", file.name);
      console.log("PFD 파일 객체 저장 확인:", {
        fileName: file.name,
        hasFileObject: !!(processStore.pfdList[itemIndex] as any)._file,
        drawingId: processStore.pfdList[itemIndex].drawing_id,
      });
    }

    console.log("PFD 파일 선택 완료:", file.name);
  }
};

// 계산식 파일 선택 (계산식 그리드용)
const selectFormulaFile = (item: any) => {
  // 동적으로 ref를 찾아서 클릭
  const inputElement = document.querySelector(
    `input[data-formula-input="${item.id}"]`
  ) as HTMLInputElement;
  if (inputElement) {
    inputElement.click();
  }
};
// 계산식 파일 변경 핸들러 (계산식 그리드용)
const handleFormulaFileChange = (item: any, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    console.log("계산식 파일 선택됨:", file.name);

    // .py 확장자 validation
    const allowedExtensions = [".py"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      alert("계산식 파일은 .py 확장자만 허용됩니다.");
      target.value = ""; // 파일 선택 초기화
      return;
    }

    // 즉시 슬롯 항목 반영 (임시 표시)
    (item as any).file_name = file.name;

    // processStore.formulaList에서 해당 항목을 찾아서 업데이트 (id -> formula_id -> 객체 참조)
    let itemIndex = processStore.formulaList.findIndex(
      (formulaItem) => formulaItem.id === item.id
    );
    if (itemIndex === -1 && (item as any).formula_id) {
      itemIndex = processStore.formulaList.findIndex(
        (formulaItem) => (formulaItem as any).formula_id === (item as any).formula_id
      );
    }
    if (itemIndex === -1) {
      itemIndex = processStore.formulaList.findIndex((formulaItem) => formulaItem === item);
    }

    if (itemIndex !== -1) {
      const row = processStore.formulaList[itemIndex] as any;
      // 표시 컬럼(file_name)에 파일명 저장
      row.file_name = file.name;
      // 하위 호환: 기존 필드도 유지 갱신
      row.registeredFormula = file.name.replace(".py", "");
      row._file = file;
      row.isSaved = false;
      if (!row.formula_id) row.formula_id = `temp_formula_${Date.now()}`;
      // 반응성 갱신 보장
      processStore.setFormulaList([...processStore.formulaList]);
    } else {
      // id 매칭 실패 시에도 전체 리스트 재할당로 리렌더 유도
      processStore.setFormulaList([...processStore.formulaList]);
    }

    // 그리드 강제 리렌더
    formulaTableKey.value++;

    console.log("계산식 파일 선택 완료:", file.name);
  }
};

// Svg 파일 선택 (P&ID 그리드용)
const selectSvgFileForPid = (item: any) => {
  // P&ID 파일이 저장되어 drawing_id가 생성된 이후에만 활성화
  if (!item.drawing_id || item.drawing_id.startsWith("temp_pid_drawing_")) {
    alert("Svg 도면 파일을 선택하려면 먼저 P&ID 파일을 저장해주세요.");
    return;
  }

  console.log("SVG 파일 선택 버튼 클릭:", {
    itemId: item.id,
    drawingId: item.drawing_id,
    parentDrawingId: item.parent_drawing_id,
    svgFileName: item.svgFileName,
    svgDrawingId: item.svg_drawing_id,
  });

  // mappingPidList에서 최신 item 찾기
  const currentItem = mappingPidList.value.find(
    (i) => i.id === item.id || i.drawing_id === item.drawing_id
  );
  if (currentItem) {
    // 두 개의 참조 모두 설정하여 호환성 보장
    currentPfdItemForSvg.value = currentItem;
    currentPidItemForSvg.value = currentItem;
  } else {
    currentPfdItemForSvg.value = item;
    currentPidItemForSvg.value = item;
  }

  // 파일 input 초기화 (연속 클릭 가능하도록)
  if (svgFileInput.value) {
    svgFileInput.value.value = "";
  }

  console.log("SVG 파일 선택 대상 설정 완료:", {
    currentPfdItemForSvg: currentPfdItemForSvg.value?.id,
    currentPidItemForSvg: currentPidItemForSvg.value?.id,
  });

  svgFileInput.value?.click();
};

// Svg 파일 선택 핸들러
const handleSvgFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    console.log("SVG 파일 선택 시작:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      currentPfdItemForSvg: currentPfdItemForSvg.value?.id,
      currentPidItemForSvg: currentPidItemForSvg.value?.id,
    });

    // *.svg 파일만 허용
    if (!file.name.toLowerCase().endsWith(".svg")) {
      alert("Svg 파일은 *.svg 형식만 선택 가능합니다.");
      target.value = ""; // 파일 선택 초기화
      return;
    }

    // 현재 선택된 항목 찾기 (여러 방법으로 시도)
    let targetItem = currentPidItemForSvg.value;

    if (!targetItem) {
      // currentPidItemForSvg가 없으면 currentPfdItemForSvg 사용
      targetItem = currentPfdItemForSvg.value;
    }

    if (!targetItem) {
      console.error("❌ SVG 파일 선택 시 현재 선택된 항목을 찾을 수 없습니다.");
      alert("파일을 선택할 항목이 없습니다.");
      target.value = "";
      return;
    }

    console.log("SVG 파일 선택 대상 항목:", {
      id: targetItem.id,
      drawing_id: targetItem.drawing_id,
      parent_drawing_id: targetItem.parent_drawing_id,
      svg_drawing_id: targetItem.svg_drawing_id,
    });

    // P&ID 그리드에서 선택된 경우 (우선 처리)
    if (
      currentPidItemForSvg.value &&
      targetItem.id === currentPidItemForSvg.value.id
    ) {
      console.log("P&ID 그리드에서 Svg 파일 변경 감지:", {
        item: targetItem,
        file: file.name,
        drawing_type: "SVG",
      });

      // targetItem에 저장 (파일명 강제 업데이트)
      console.log("SVG 파일명 업데이트 전:", {
        oldFileName: targetItem.svgFileName,
        newFileName: file.name,
        oldFileObject: !!(targetItem as any).svgFile,
      });

      targetItem.svgFileName = file.name;
      targetItem.svg_file_name = file.name; // API 응답 필드와 동기화
      targetItem.svgFile = file; // 실제 File 객체 저장

      console.log("SVG 파일명 업데이트 후:", {
        fileName: targetItem.svgFileName,
        file_name: targetItem.svg_file_name,
        hasFileObject: !!(targetItem as any).svgFile,
      });

      // 기존 svg_drawing_id가 있으면 유지, 없으면 임시 ID 생성
      if (
        !targetItem.svg_drawing_id ||
        targetItem.svg_drawing_id.startsWith("temp_")
      ) {
        targetItem.svg_drawing_id = `temp_svg_drawing_${Date.now()}`;
        console.log(
          "새로운 SVG 파일 - 임시 svg_drawing_id 생성:",
          targetItem.svg_drawing_id
        );
      } else {
        console.log(
          "기존 SVG 파일 재선택 - svg_drawing_id 유지:",
          targetItem.svg_drawing_id
        );
      }

      // mappingPidList에서 해당 항목을 찾아서 업데이트
      const itemIndex = mappingPidList.value.findIndex(
        (pidItem) => pidItem.id === targetItem.id
      );
      if (itemIndex !== -1) {
        console.log("그리드 SVG 파일명 업데이트 전:", {
          index: itemIndex,
          oldFileName: mappingPidList.value[itemIndex].svgFileName,
          newFileName: file.name,
        });

        // 파일명 강제 업데이트
        mappingPidList.value[itemIndex].svgFileName = file.name;
        mappingPidList.value[itemIndex].svg_file_name = file.name; // API 응답 필드와 동기화
        mappingPidList.value[itemIndex].svgFile = file;

        // 기존 svg_drawing_id가 있으면 유지, 없으면 임시 ID 생성
        if (
          !mappingPidList.value[itemIndex].svg_drawing_id ||
          mappingPidList.value[itemIndex].svg_drawing_id.startsWith("temp_")
        ) {
          mappingPidList.value[
            itemIndex
          ].svg_drawing_id = `temp_svg_drawing_${Date.now()}`;
          console.log(
            "새로운 SVG 파일 - 그리드에 임시 svg_drawing_id 설정:",
            mappingPidList.value[itemIndex].svg_drawing_id
          );
        } else {
          console.log(
            "기존 SVG 파일 재선택 - 그리드에서 svg_drawing_id 유지:",
            mappingPidList.value[itemIndex].svg_drawing_id
          );
        }

        // Vue 반응성을 위해 배열 재할당 (강제 업데이트)
        mappingPidList.value = [...mappingPidList.value];

        console.log("그리드 SVG 파일명 업데이트 후:", {
          index: itemIndex,
          fileName: mappingPidList.value[itemIndex].svgFileName,
          file_name: mappingPidList.value[itemIndex].svg_file_name,
          hasFileObject: !!(mappingPidList.value[itemIndex] as any).svgFile,
        });

        console.log("✅ Svg 파일이 mappingPidList에 업데이트됨:", {
          index: itemIndex,
          fileName: file.name,
          itemId: mappingPidList.value[itemIndex].id,
          svgDrawingId: mappingPidList.value[itemIndex].svg_drawing_id,
          hasFileObject: !!(mappingPidList.value[itemIndex] as any).svgFile,
          isExistingFile:
            !mappingPidList.value[itemIndex].svg_drawing_id.startsWith("temp_"),
        });
      } else {
        console.error(
          "❌ mappingPidList에서 해당 항목을 찾을 수 없음:",
          targetItem.id
        );

        // mappingPidList에서 찾을 수 없는 경우, 여러 방법으로 찾기
        const alternativeIndex = mappingPidList.value.findIndex(
          (item) => item.drawing_id === targetItem.drawing_id
        );

        if (alternativeIndex !== -1) {
          console.log("대체 방법으로 그리드 SVG 파일명 업데이트:", {
            index: alternativeIndex,
            oldFileName: mappingPidList.value[alternativeIndex].svgFileName,
            newFileName: file.name,
          });

          // 파일명 강제 업데이트
          mappingPidList.value[alternativeIndex].svgFileName = file.name;
          mappingPidList.value[alternativeIndex].svg_file_name = file.name;
          mappingPidList.value[alternativeIndex].svgFile = file;
          mappingPidList.value[
            alternativeIndex
          ].svg_drawing_id = `temp_svg_drawing_${Date.now()}`;

          // Vue 반응성을 위해 배열 재할당 (강제 업데이트)
          mappingPidList.value = [...mappingPidList.value];

          console.log(
            "✅ Svg 파일이 mappingPidList에 대체 방법으로 업데이트됨:",
            {
              index: alternativeIndex,
              fileName: file.name,
              drawingId: mappingPidList.value[alternativeIndex].drawing_id,
              hasFileObject: !!(mappingPidList.value[alternativeIndex] as any)
                .svgFile,
            }
          );
        } else {
          // 마지막 시도: parent_drawing_id로 찾기
          const parentIndex = mappingPidList.value.findIndex(
            (item) => item.parent_drawing_id === targetItem.parent_drawing_id
          );

          if (parentIndex !== -1) {
            console.log("parent_drawing_id로 그리드 SVG 파일명 업데이트:", {
              index: parentIndex,
              oldFileName: mappingPidList.value[parentIndex].svgFileName,
              newFileName: file.name,
            });

            // 파일명 강제 업데이트
            mappingPidList.value[parentIndex].svgFileName = file.name;
            mappingPidList.value[parentIndex].svg_file_name = file.name;
            mappingPidList.value[parentIndex].svgFile = file;
            mappingPidList.value[
              parentIndex
            ].svg_drawing_id = `temp_svg_drawing_${Date.now()}`;

            // Vue 반응성을 위해 배열 재할당 (강제 업데이트)
            mappingPidList.value = [...mappingPidList.value];

            console.log(
              "✅ Svg 파일이 mappingPidList에 parent_drawing_id로 업데이트됨:",
              {
                index: parentIndex,
                fileName: file.name,
                parentDrawingId:
                  mappingPidList.value[parentIndex].parent_drawing_id,
                hasFileObject: !!(mappingPidList.value[parentIndex] as any)
                  .svgFile,
              }
            );
          } else {
            console.error("❌ mappingPidList에서 해당 항목을 찾을 수 없음:", {
              targetItemId: targetItem.id,
              targetItemDrawingId: targetItem.drawing_id,
              targetItemParentDrawingId: targetItem.parent_drawing_id,
              mappingPidListLength: mappingPidList.value.length,
              mappingPidListItems: mappingPidList.value.map((item) => ({
                id: item.id,
                drawing_id: item.drawing_id,
                parent_drawing_id: item.parent_drawing_id,
              })),
            });
          }
        }
      }

      // P&ID 그리드에서는 즉시 저장하지 않고 저장 버튼 클릭 시에만 처리
      console.log("P&ID 그리드 Svg 파일 선택 완료 - 저장 버튼 클릭 시 처리됨");
    }
    // 공정카드 그리드에서 선택된 경우
    else if (
      currentPfdItemForSvg.value &&
      targetItem.id === currentPfdItemForSvg.value.id
    ) {
      console.log("공정카드 그리드에서 SVG 파일 선택됨:", {
        itemId: targetItem.id,
        fileName: file.name,
      });

      // targetItem에 저장
      targetItem.svgFileName = file.name;
      targetItem.svgFile = file; // 실제 File 객체 저장
      targetItem.svg_drawing_id = `temp_svg_drawing_${Date.now()}`;

      // processStore.pfdList에서 해당 항목을 찾아서 업데이트
      const itemIndex = processStore.pfdList.findIndex(
        (pfdItem) => pfdItem.id === targetItem.id
      );
      if (itemIndex !== -1) {
        processStore.pfdList[itemIndex].svgFileName = file.name;
        processStore.pfdList[itemIndex].svgFile = file;
        processStore.pfdList[
          itemIndex
        ].svg_drawing_id = `temp_svg_drawing_${Date.now()}`;

        console.log("✅ SVG 파일이 processStore.pfdList에 업데이트됨:", {
          index: itemIndex,
          fileName: file.name,
          itemId: processStore.pfdList[itemIndex].id,
        });
      } else {
        console.error(
          "❌ processStore.pfdList에서 해당 항목을 찾을 수 없음:",
          targetItem.id
        );
      }

      console.log("공정카드 그리드 SVG 파일 선택 완료");
    }
    // 어느 그리드에서도 선택되지 않은 경우
    else {
      console.warn(
        "⚠️ SVG 파일 선택 시 어느 그리드에서도 해당 항목을 찾을 수 없습니다:",
        {
          targetItemId: targetItem.id,
          currentPidItemForSvg: currentPidItemForSvg.value?.id,
          currentPfdItemForSvg: currentPfdItemForSvg.value?.id,
        }
      );
    }

    console.log("SVG 파일 선택 완료:", file.name);
    console.log(
      "현재 mappingPidList 상태:",
      mappingPidList.value.map((item) => ({
        id: item.id,
        svgFileName: item.svgFileName,
        hasFileObject: !!(item as any).svgFile,
      }))
    );
  }
};
// P&ID 그리드 저장 시 Excel 파일 업로드 함수
const handleExcelFileUploadForPid = async (pidItem: any, excelFile: File) => {
  try {
    console.log("P&ID Excel 파일 업로드 시작:", {
      pidItem: pidItem,
      excelFile: excelFile.name,
      current_row_drawing_id: pidItem.drawing_id, // 현재 row의 drawing_id (parent_drawing_id로 사용)
      excel_drawing_id: pidItem.excel_drawing_id,
      note: "pid_id에 현재 row의 drawing_id 전달 (API 요구사항)",
    });

    // processId 확인
    let processId: string;
    if (props.isRegisterMode) {
      if (!createdProcessId.value) {
        console.error("공정 등록 모드에서 createdProcessId가 없습니다.");
        alert("공정을 먼저 등록해주세요.");
        return;
      }
      processId = createdProcessId.value;
    } else {
      processId = props.processId || (route.params.id as string);
      if (!processId) {
        console.error("processId를 찾을 수 없습니다.");
        alert("공정 ID를 찾을 수 없습니다.");
        return;
      }
    }

    // FormData 생성
    const formData = new FormData();

    // 백엔드 API 컨트롤러 구조에 맞게 수정
    // excelData Map에 담을 데이터 (Map<String, Object>로 전달)
    const excelData: any = {
      process_id: processId,
      drawing_type: "EXCEL",
      parent_drawing_id: pidItem.drawing_id,
      excel_type: "MAPPING",
      remarks: "",
    };

    // 기존 Excel 파일이 있는 경우 force_update: true 추가
    if (pidItem.excel_drawing_id) {
      excelData.force_update = true;
      console.log("기존 Excel 파일 재선택 - force_update: true 추가");
    }

    // excelData Map의 각 필드를 FormData에 추가
    Object.keys(excelData).forEach((key) => {
      formData.append(key, excelData[key]);
    });

    // 백엔드가 정확히 기대하는 파라미터명: excelFile
    formData.append("excelFile", excelFile);

    console.log("🚀 Excel 파일 업로드 API 호출 시작:", {
      api: "/api/process/excel/child/upload",
      excelData: excelData,
      excelFile: excelFile.name,
      fileSize: excelFile.size,
      fileType: excelFile.type,
      note: '백엔드 컨트롤러 구조에 맞게 수정: @RequestParam Map<String, Object> excelData, @RequestParam("excelFile") MultipartFile',
    });

    // FormData 내용 상세 로깅
    console.log("📋 FormData 내용 상세:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(`${key}: "${value}"`);
      }
    }

    // API 요청 전 최종 검증
    console.log("🔍 API 요청 전 최종 검증:");
    console.log("- excelData Map:", excelData);
    console.log(
      "- excelFile:",
      excelFile.name,
      "(크기:",
      excelFile.size,
      ", 타입:",
      excelFile.type,
      ")"
    );
    console.log("- API 엔드포인트:", "/api/process/excel/child/upload");
    console.log(
      '- 백엔드 컨트롤러 구조: @RequestParam Map<String, Object> excelData, @RequestParam("excelFile") MultipartFile'
    );

    let response;
    let apiEndpoint = "/api/process/excel/child/upload";

    try {
      response = await request(apiEndpoint, undefined, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
    } catch (firstError) {
      console.warn("첫 번째 API 엔드포인트 실패, 대안 시도:", firstError);

      // 대안 1: 다른 Excel 업로드 엔드포인트 시도
      const alternativeEndpoints = [
        "/api/process/drawing/child/upload", // Excel을 drawing으로 처리
        "/api/process/excel/upload",
        "/api/process/drawing/excel/upload",
        "/api/process/child/excel/upload",
      ];

      for (const altEndpoint of alternativeEndpoints) {
        try {
          console.log(`대안 API 엔드포인트 시도: ${altEndpoint}`);
          response = await request(altEndpoint, undefined, {
            method: "POST",
            body: formData,
            headers: {
              Accept: "application/json",
            },
          });

          if (response.success) {
            console.log(`✅ 대안 API 성공: ${altEndpoint}`);
            apiEndpoint = altEndpoint;
            break;
          }
        } catch (altError) {
          console.warn(`대안 API 실패: ${altEndpoint}`, altError);
        }
      }

      // 모든 대안이 실패한 경우 원래 에러 사용
      if (!response || !response.success) {
        throw firstError;
      }
    }

    console.log("Excel 파일 업로드 API 응답:", response);

    if (response.success) {
      console.log("✅ P&ID Excel 파일 업로드 성공");

      // 업로드 성공 시 그리드 데이터 업데이트
      console.log("Excel 업로드 성공 - 그리드 업데이트 시작");
      console.log("pidItem 정보:", {
        id: pidItem.id,
        drawing_id: pidItem.drawing_id,
        parent_drawing_id: pidItem.parent_drawing_id,
      });

      // 여러 방법으로 해당 항목 찾기
      let itemIndex = mappingPidList.value.findIndex(
        (item) => item.id === pidItem.id
      );

      if (itemIndex === -1) {
        // ID로 찾지 못한 경우 drawing_id로 찾기
        itemIndex = mappingPidList.value.findIndex(
          (item) => item.drawing_id === pidItem.drawing_id
        );
      }

      if (itemIndex === -1) {
        // parent_drawing_id로 찾기
        itemIndex = mappingPidList.value.findIndex(
          (item) => item.parent_drawing_id === pidItem.parent_drawing_id
        );
      }

      if (itemIndex !== -1) {
        console.log("Excel 업로드 대상 항목 찾음:", {
          index: itemIndex,
          itemId: mappingPidList.value[itemIndex].id,
          drawingId: mappingPidList.value[itemIndex].drawing_id,
        });

        // API 응답에서 excel_drawing_id 업데이트
        if (response.response?.excel_drawing_id) {
          mappingPidList.value[itemIndex].excel_drawing_id =
            response.response.excel_drawing_id;
          console.log(
            "✅ Excel drawing_id 업데이트 완료:",
            response.response.excel_drawing_id
          );
        } else {
          console.warn(
            "⚠️ API 응답에 excel_drawing_id가 없습니다:",
            response.response
          );
        }

        // Excel 파일명 업데이트
        mappingPidList.value[itemIndex].excel_file_name = excelFile.name;
        mappingPidList.value[itemIndex].excelFileName = excelFile.name;
        console.log("✅ Excel 파일명 업데이트 완료:", excelFile.name);

        // Vue 반응성을 위해 배열 재할당
        mappingPidList.value = [...mappingPidList.value];

        // 초기값도 업데이트하여 다음 저장 시 중복 저장 방지
        const initialItemIndex = initialMappingPidList.value.findIndex(
          (item) => item.id === pidItem.id
        );
        if (initialItemIndex !== -1) {
          initialMappingPidList.value[initialItemIndex].excel_drawing_id =
            response.response?.excel_drawing_id;
          initialMappingPidList.value[initialItemIndex].excel_file_name =
            excelFile.name;
          initialMappingPidList.value[initialItemIndex].excelFileName =
            excelFile.name;
          console.log(
            "✅ Excel 업로드 후 초기값 업데이트 완료 - 중복 저장 방지"
          );
        }

        console.log("✅ Excel 업로드 후 그리드 업데이트 완료");
      } else {
        console.error(
          "❌ Excel 업로드 후 그리드에서 해당 항목을 찾을 수 없습니다:",
          {
            pidItemId: pidItem.id,
            pidItemDrawingId: pidItem.drawing_id,
            pidItemParentDrawingId: pidItem.parent_drawing_id,
            mappingPidListLength: mappingPidList.value.length,
            mappingPidListItems: mappingPidList.value.map((item) => ({
              id: item.id,
              drawing_id: item.drawing_id,
              parent_drawing_id: item.parent_drawing_id,
            })),
          }
        );
      }

      // Excel 파일 업로드 완료 - 별도 메시지 없음 (저장 버튼 클릭 시 통합 메시지)

      // 기존 Excel 파일이 재선택된 경우 P&ID 컴포넌트 그리드 갱신
      if (pidItem.excel_drawing_id) {
        console.log(
          "🔄 기존 Excel 파일 재선택 - P&ID 컴포넌트 그리드 갱신 시작"
        );
        try {
          // 현재 선택된 P&ID 항목이 있는지 확인
          if (
            selectedMappingPidItems.value &&
            (selectedMappingPidItems.value as any).id === pidItem.id
          ) {
            console.log(
              "✅ 현재 선택된 P&ID 항목과 일치 - P&ID 컴포넌트 모달 재호출"
            );
            await openPidComponentModal(pidItem);
          } else {
            console.log(
              "ℹ️ 현재 선택된 P&ID 항목과 다름 - P&ID 컴포넌트 갱신 생략"
            );
          }
        } catch (componentError) {
          console.error("❌ P&ID 컴포넌트 그리드 갱신 실패:", componentError);
        }
      }

      // Excel 파일 업로드 성공 후 그리드 새로고침 제거 (그리드 내용 지워짐 방지)
      console.log(
        "=== Excel 파일 업로드 성공 - 그리드 새로고침 건너뛰기 (데이터 유지) ==="
      );
    } else {
      console.error("❌ P&ID Excel 파일 업로드 실패:", response);
      console.error("실패 상세 정보:", {
        status: response.status,
        message: response.message,
        response: response.response,
        errorDetail: response.response?.detail || response.response?.message,
      });

      // 400 에러의 경우 더 상세한 정보 제공
      if (response.status === 400) {
        const errorMsg =
          response.response?.detail || response.message || "알 수 없는 오류";
        console.error("🚨 400 에러 가능한 원인들:");
        console.error(
          "1. API 엔드포인트가 잘못됨: /api/process/excel/child/upload"
        );
        console.error("2. excelData Map의 필드가 백엔드 요구사항과 다름");
        console.error("3. drawing_type, excel_type 값이 잘못됨");
        console.error("4. parent_drawing_id가 유효하지 않음");
        console.error("5. excelFile 파라미터는 올바르게 전달됨");

        alert(
          `Excel 파일 업로드 실패 (400 에러):\n${errorMsg}\n\n현재 파라미터 구조:\n- excelData Map: ${JSON.stringify(
            excelData
          )}\n- excelFile: ${
            excelFile.name
          }\n- 백엔드 컨트롤러 구조에 맞게 수정됨\n\n백엔드 개발자에게 문의하세요.`
        );
      } else {
        alert(
          `Excel 파일 업로드 실패: ${response.message || "알 수 없는 오류"}`
        );
      }
    }
  } catch (error) {
    console.error("P&ID Excel 파일 업로드 중 오류:", error);
    alert(`Excel 파일 업로드 실패: ${error.message || error}`);
  }
};

// P&ID 그리드에서 Excel 파일 삭제 함수
const handleExcelFileDeleteForPid = async (pidItem: any) => {
  try {
    console.log("P&ID Excel 파일 삭제 시작:", {
      pidItem: pidItem,
      excel_drawing_id: pidItem.excel_drawing_id,
    });

    if (!pidItem.excel_drawing_id) {
      console.warn("Excel drawing_id가 없어서 삭제할 수 없습니다.");
      return;
    }

    const response = await request(
      `/api/process/excel/child/delete/${pidItem.excel_drawing_id}`,
      undefined,
      {
        method: "DELETE",
      }
    );

    console.log("Excel 파일 삭제 API 응답:", response);

    if (response.success) {
      console.log("✅ P&ID Excel 파일 삭제 성공");

      // 삭제 성공 시 그리드 데이터 업데이트
      const itemIndex = mappingPidList.value.findIndex(
        (item) => item.drawing_id === pidItem.drawing_id
      );
      if (itemIndex !== -1) {
        mappingPidList.value[itemIndex].excel_drawing_id = null;
        mappingPidList.value[itemIndex].excel_file_name = "";
        mappingPidList.value[itemIndex].excelFileName = "";
        console.log("Excel 파일 정보 초기화 완료");

        // 초기값도 업데이트하여 다음 저장 시 중복 저장 방지
        const initialItemIndex = initialMappingPidList.value.findIndex(
          (item) => item.drawing_id === pidItem.drawing_id
        );
        if (initialItemIndex !== -1) {
          initialMappingPidList.value[initialItemIndex].excel_drawing_id = null;
          initialMappingPidList.value[initialItemIndex].excel_file_name = "";
          initialMappingPidList.value[initialItemIndex].excelFileName = "";
          console.log("✅ Excel 삭제 후 초기값 업데이트 완료 - 중복 저장 방지");
        }
      }

      // Excel 파일 삭제 완료 - 별도 메시지 없음 (저장 버튼 클릭 시 통합 메시지)

      // Excel 파일 삭제 성공 후 그리드 새로고침 제거 (그리드 내용 지워짐 방지)
      console.log(
        "=== Excel 파일 삭제 성공 - 그리드 새로고침 건너뛰기 (데이터 유지) ==="
      );
    } else {
      console.error("❌ P&ID Excel 파일 삭제 실패:", response);
      alert(`Excel 파일 삭제 실패: ${response.message || "알 수 없는 오류"}`);
    }
  } catch (error) {
    console.error("P&ID Excel 파일 삭제 중 오류:", error);
    alert(`Excel 파일 삭제 실패: ${error.message || error}`);
  }
};
// P&ID 그리드에서 Svg 파일 변경 시 즉시 처리 함수 (사용 안함 - 저장 버튼 클릭 시에만 처리)
// const handleSvgFileChangeForPid = async (pidItem: any, svgFile: File) => {
//   // 이 함수는 중복 호출을 방지하기 위해 비활성화됨
//   // P&ID 그리드에서는 저장 버튼 클릭 시 handleSvgFileUploadForPid만 호출됨
// };
// P&ID 그리드 저장 시 Svg 도면 파일 업로드 함수
const handleSvgFileUploadForPid = async (pidItem: any, svgFile: File) => {
  try {
    console.log("P&ID Svg 도면 파일 업로드 시작:", {
      pidItem: pidItem,
      svgFile: svgFile.name,
      current_row_drawing_id: pidItem.drawing_id, // 현재 row의 drawing_id (parent_drawing_id로 사용)
      svg_drawing_id: pidItem.svg_drawing_id,
      note: "parent_drawing_id에 현재 row의 drawing_id 전달, drawing_id는 테스트를 위해 비움",
    });

    // processId 확인
    let processId: string;
    if (props.isRegisterMode) {
      if (!createdProcessId.value) {
        console.error("공정 등록 모드에서 createdProcessId가 없습니다.");
        alert("공정을 먼저 등록해주세요.");
        return;
      }
      processId = createdProcessId.value;
    } else {
      processId = props.processId || (route.params.id as string);
      if (!processId) {
        console.error("processId를 찾을 수 없습니다.");
        alert("공정 ID를 찾을 수 없습니다.");
        return;
      }
    }

    // FormData 생성
    const formData = new FormData();

    // drawingData를 개별 필드로 FormData에 추가
    formData.append("process_id", processId);
    formData.append("drawing_type", "SVG");
    formData.append("parent_drawing_id", pidItem.drawing_id); // 현재 row의 drawing_id 값 전달

    // svg_drawing_id가 있으면 drawing_id로 요청에 포함
    if (pidItem.svg_drawing_id && !pidItem.svg_drawing_id.startsWith("temp_")) {
      formData.append("drawing_id", pidItem.svg_drawing_id);
      formData.append("force_update", "true"); // 기존 SVG 파일 재선택 시 force_update 추가
      console.log(
        "✅ 기존 svg_drawing_id를 drawing_id로 포함:",
        pidItem.svg_drawing_id
      );
      console.log("✅ 기존 SVG 파일 재선택 - force_update: true 추가");
    } else {
      console.log(
        "ℹ️ svg_drawing_id가 없거나 임시 ID - drawing_id 포함 안함:",
        pidItem.svg_drawing_id
      );
    }

    // siteFile에 선택된 Svg 도면 파일정보 전달
    formData.append("siteFile", svgFile);

    console.log("🚀 Svg 도면 업로드 API 호출 시작:", {
      api: "/api/process/drawing/child/upload",
      process_id: processId,
      drawing_type: "SVG",
      parent_drawing_id: pidItem.drawing_id,
      drawing_id:
        pidItem.svg_drawing_id && !pidItem.svg_drawing_id.startsWith("temp_")
          ? pidItem.svg_drawing_id
          : "",
      siteFile: svgFile.name,
      fileSize: svgFile.size,
      fileType: svgFile.type,
      note: "parent_drawing_id = 현재 P&ID row의 drawing_id, drawing_id = 기존 svg_drawing_id (있는 경우)",
    });

    // FormData 내용 확인
    console.log("📋 FormData 내용:");
    console.log("process_id:", processId);
    console.log("drawing_type:", "SVG");
    console.log("parent_drawing_id:", pidItem.drawing_id);
    console.log(
      "drawing_id:",
      pidItem.svg_drawing_id && !pidItem.svg_drawing_id.startsWith("temp_")
        ? pidItem.svg_drawing_id
        : ""
    );
    console.log(
      "siteFile: File(" +
        svgFile.name +
        ", " +
        svgFile.size +
        " bytes, " +
        svgFile.type +
        ")"
    );

    // FormData 실제 내용 검증
    console.log("📋 FormData 실제 전송 내용:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
        );
      } else {
        console.log(`${key}: "${value}"`);
      }
    }

    // /api/process/drawing/child/upload API 호출
    console.log("🌐 API 호출 직전 최종 확인:", {
      api: "/api/process/drawing/child/upload",
      method: "POST",
      formData_keys: Array.from(formData.keys()),
      formData_values: Array.from(formData.entries()).map(([key, value]) => ({
        key,
        value: value instanceof File ? `File(${value.name})` : value,
      })),
    });

    const response = await request(
      "/api/process/drawing/child/upload",
      undefined,
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("🌐 API 응답 수신:", {
      success: response.success,
      status: response.status,
      hasResponse: !!response.response,
      responseKeys: response.response ? Object.keys(response.response) : [],
    });

    console.log("📥 Svg 도면 업로드 API 응답:", response);
    console.log("📊 응답 상세:", {
      success: response.success,
      status: response.status,
      message: response.message,
      response_data: response.response,
    });

    // 백엔드에서 P&ID 파일이 수정되었는지 확인
    if (response.response) {
      console.log("🔍 백엔드 응답 분석:", {
        새로_생성된_svg_drawing_id: response.response.drawing_id,
        부모_drawing_id: response.response.parent_drawing_id,
        수정된_파일_타입: response.response.drawing_type,
        전체_응답: response.response,
        응답_키들: Object.keys(response.response),
      });

      // drawing_type이 없거나 SVG가 아닌 경우 경고
      if (!response.response.drawing_type) {
        console.warn(
          "⚠️ 경고: 백엔드 응답에 drawing_type이 없습니다. 전체 응답:",
          response.response
        );
      } else if (response.response.drawing_type !== "SVG") {
        console.warn(
          "⚠️ 경고: 백엔드에서 SVG가 아닌 타입으로 처리됨:",
          response.response.drawing_type
        );
      } else {
        console.log("✅ 백엔드에서 SVG 타입으로 정상 처리됨");
      }
    } else {
      console.warn(
        "⚠️ 경고: 백엔드 응답에 response 객체가 없습니다. 전체 응답:",
        response
      );
    }

    if (response.success) {
      console.log("SVG 파일 업로드 성공 - 그리드 업데이트 시작");
      console.log("pidItem 정보:", {
        id: pidItem.id,
        drawing_id: pidItem.drawing_id,
        parent_drawing_id: pidItem.parent_drawing_id,
      });

      // 여러 방법으로 해당 항목 찾기
      let itemIndex = mappingPidList.value.findIndex(
        (item) => item.id === pidItem.id
      );

      if (itemIndex === -1) {
        // ID로 찾지 못한 경우 drawing_id로 찾기
        itemIndex = mappingPidList.value.findIndex(
          (item) => item.drawing_id === pidItem.drawing_id
        );
      }

      if (itemIndex === -1) {
        // parent_drawing_id로 찾기
        itemIndex = mappingPidList.value.findIndex(
          (item) => item.parent_drawing_id === pidItem.parent_drawing_id
        );
      }

      if (itemIndex !== -1) {
        console.log("SVG 업로드 대상 항목 찾음:", {
          index: itemIndex,
          itemId: mappingPidList.value[itemIndex].id,
          drawingId: mappingPidList.value[itemIndex].drawing_id,
        });

        // API 응답에서 svg_drawing_id 추출 (여러 경로 시도)
        const svgDrawingId =
          response.response?.data?.drawing_id ||
          response.response?.drawing_id ||
          response.drawing_id;

        if (svgDrawingId) {
          mappingPidList.value[itemIndex].svg_drawing_id = svgDrawingId;
          console.log("✅ SVG drawing_id 업데이트 완료:", svgDrawingId);
        } else {
          console.warn("⚠️ API 응답에 svg_drawing_id가 없습니다:", {
            response: response.response,
            availableKeys: Object.keys(response.response || {}),
            dataKeys: Object.keys(response.response?.data || {}),
          });
        }

        // Vue 반응성을 위해 배열 재할당
        mappingPidList.value = [...mappingPidList.value];

        console.log("✅ SVG 업로드 후 그리드 업데이트 완료");
      } else {
        console.error(
          "❌ SVG 업로드 후 그리드에서 해당 항목을 찾을 수 없습니다:",
          {
            pidItemId: pidItem.id,
            pidItemDrawingId: pidItem.drawing_id,
            pidItemParentDrawingId: pidItem.parent_drawing_id,
            mappingPidListLength: mappingPidList.value.length,
            mappingPidListItems: mappingPidList.value.map((item) => ({
              id: item.id,
              drawing_id: item.drawing_id,
              parent_drawing_id: item.parent_drawing_id,
            })),
          }
        );
      }

      console.log("✅ P&ID Svg 도면 업로드 성공:", svgFile.name);
      // alert(`Svg 도면이 성공적으로 업로드되었습니다: ${svgFile.name}`); // 자동 저장 시에는 alert 제거

      // 기존 SVG 파일이 재선택된 경우 P&ID 컴포넌트 그리드 갱신
      if (
        pidItem.svg_drawing_id &&
        !pidItem.svg_drawing_id.startsWith("temp_")
      ) {
        console.log("🔄 기존 SVG 파일 재선택 - P&ID 컴포넌트 그리드 갱신 시작");
        try {
          // 현재 선택된 P&ID 항목이 있는지 확인
          if (
            selectedMappingPidItems.value &&
            (selectedMappingPidItems.value as any).id === pidItem.id
          ) {
            console.log(
              "✅ 현재 선택된 P&ID 항목과 일치 - P&ID 컴포넌트 모달 재호출"
            );
            await openPidComponentModal(pidItem);
          } else {
            console.log(
              "ℹ️ 현재 선택된 P&ID 항목과 다름 - P&ID 컴포넌트 갱신 생략"
            );
          }
        } catch (componentError) {
          console.error("❌ P&ID 컴포넌트 그리드 갱신 실패:", componentError);
        }
      }

      // SVG 파일 업로드 성공 후 그리드 새로고침 제거 (그리드 내용 지워짐 방지)
      console.log(
        "=== SVG 파일 업로드 성공 - 그리드 새로고침 건너뛰기 (데이터 유지) ==="
      );
    } else {
      console.error("❌ P&ID Svg 도면 업로드 실패:", response);
      console.error("실패 상세:", {
        status: response.status,
        message: response.message,
        response: response.response,
      });

      // API가 구현되지 않은 경우 확인
      if (response.status === 404 || response.message?.includes("Not Found")) {
        alert(
          `⚠️ Svg 도면 업로드 API가 구현되지 않았습니다.\n백엔드 개발자에게 문의하세요.\n\nAPI: /api/process/drawing/child/upload`
        );
      } else {
        alert(`Svg 도면 업로드 실패: ${response.message || "알 수 없는 오류"}`);
      }
    }
  } catch (error) {
    console.error("P&ID Svg 도면 업로드 처리 실패:", error);
    alert(`Svg 도면 업로드 실패: ${error.message || error}`);
  }
};

// P&ID 그리드에서 Svg 도면 파일 삭제 함수
const handleSvgFileDeleteForPid = async (pidItem: any) => {
  try {
    console.log("P&ID Svg 도면 파일 삭제 시작:", {
      pidItem: pidItem,
      svg_drawing_id: pidItem.svg_drawing_id,
    });

    // svg_drawing_id가 있는 경우에만 삭제 API 호출
    if (pidItem.svg_drawing_id && !pidItem.svg_drawing_id.startsWith("temp_")) {
      const response = await request(
        `/api/process/drawing/delete/${pidItem.svg_drawing_id}`,
        undefined,
        {
          method: "DELETE",
        }
      );

      console.log("Svg 도면 삭제 API 응답:", response);

      if (response.success) {
        // 성공 시 svg_drawing_id 초기화
        const itemIndex = mappingPidList.value.findIndex(
          (item) => item.id === pidItem.id
        );
        if (itemIndex !== -1) {
          mappingPidList.value[itemIndex].svg_drawing_id = null;
          mappingPidList.value[itemIndex].svgFileName = "";
          (mappingPidList.value[itemIndex] as any).svgFile = null;
          console.log("Svg drawing_id 초기화 완료");
        }

        console.log("P&ID Svg 도면 삭제 성공");

        // SVG 파일 삭제 성공 후 그리드 새로고침 제거 (그리드 내용 지워짐 방지)
        console.log(
          "=== SVG 파일 삭제 성공 - 그리드 새로고침 건너뛰기 (데이터 유지) ==="
        );
      } else {
        console.error("P&ID Svg 도면 삭제 실패:", response);
        alert(`Svg 도면 삭제 실패: ${response.message || "알 수 없는 오류"}`);
      }
    } else {
      // 임시 ID이거나 ID가 없는 경우 로컬에서만 삭제
      const itemIndex = mappingPidList.value.findIndex(
        (item) => item.id === pidItem.id
      );
      if (itemIndex !== -1) {
        mappingPidList.value[itemIndex].svg_drawing_id = null;
        mappingPidList.value[itemIndex].svgFileName = "";
        (mappingPidList.value[itemIndex] as any).svgFile = null;
        console.log("임시 Svg 파일 로컬 삭제 완료");
      }
    }
  } catch (error) {
    console.error("P&ID Svg 도면 삭제 처리 실패:", error);
    alert(`Svg 도면 삭제 실패: ${error.message || error}`);
  }
};
// Svg 파일 다운로드
const downloadSvg = async (drawingId: string) => {
  try {
    console.log("Svg 파일 다운로드 시작:", drawingId);

    const response = await request(
      `/api/process/drawing/download/${drawingId}`,
      undefined,
      {
        method: "GET",
      }
    );

    if (!response.success) {
      throw new Error(`Svg 파일 다운로드 실패: ${response.message}`);
    }

    const responseData = response.response;
    console.log("Svg 파일 다운로드 응답:", responseData);

    if (responseData.download_url) {
      // 외부 URL인 경우 CORS 처리
      try {
        const fileResponse = await fetch(responseData.download_url, {
          mode: "cors",
          credentials: "omit",
        });

        if (!fileResponse.ok) {
          throw new Error(`파일 다운로드 실패: ${fileResponse.status}`);
        }

        const blob = await fileResponse.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = responseData.file_info?.file_name || "svg_file.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (corsError) {
        console.warn("CORS 오류로 인한 대체 방법 사용:", corsError);
        window.open(responseData.download_url, "_blank");
      }
    } else if (responseData.response_body) {
      // 직접 파일 내용인 경우
      const blob = new Blob([responseData.response_body], {
        type: "image/svg+xml",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = responseData.file_info?.file_name || "svg_file.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      throw new Error("다운로드할 파일을 찾을 수 없습니다.");
    }

    console.log("Svg 파일 다운로드 완료");
  } catch (error: any) {
    console.error("Svg 파일 다운로드 실패:", error);
    alert(`Svg 파일 다운로드 실패: ${error.message}`);
  }
};

// 공정카드 섹션 닫기
const closePfdSection = () => {
  showPfdSection.value = false;
  // P&ID 영역도 함께 닫기
  showPidListInMain.value = false;
  // P&ID Components 설정도 함께 닫기
  showPidComponentSection.value = false;
  selectedPidForComponent.value = null;
  pidComponentList.value = [];
  selectedPidComponentItems.value = [];
  currentDrawingId.value = ""; // drawing_id 초기화
};

// 공정카드 저장 핸들러
const handlePfdSave = async () => {
  try {
    console.log("공정카드 저장 버튼 클릭");

    let processId: string;

    if (props.isRegisterMode) {
      // 공정 등록 모드일 때는 생성된 공정 ID 사용
      if (!createdProcessId.value) {
        alert("공정이 등록되지 않았습니다. 먼저 기본정보를 등록해주세요.");
        return;
      }
      processId = createdProcessId.value;
      console.log("공정 등록 모드 - 생성된 공정 ID 사용:", processId);
    } else {
      // 공정 상세 모드일 때는 기존 로직 사용
      processId = props.processId || (route.params.id as string);
      if (!processId) {
        alert("공정 ID가 없습니다.");
        return;
      }
    }

    // PFD 변경사항 처리
    const hasChanges = await processPfdChanges(processId);

    if (hasChanges) {
      console.log("공정카드 저장 완료");

      // PFD 저장 후 그리드 새로고침
      console.log("PFD 그리드 새로고침 시작...");
      await refreshPfdData();
      console.log("PFD 그리드 새로고침 완료");

      alert("공정카드가 저장되었습니다.");
    } else {
      console.log("저장할 변경사항이 없습니다.");
      alert("변경사항이 없습니다.");
    }
  } catch (error: any) {
    console.error("공정카드 저장 실패:", error);
    alert(`공정카드 저장 실패: ${error.message}`);
  }
};
// PFD 변경사항 처리 함수
const processPfdChanges = async (processId: string) => {
  console.log("=== PFD 변경사항 처리 시작 ===");
  console.log("initialPfdList 존재:", !!processStore.initialPfdList);
  console.log("pfdList 존재:", !!processStore.pfdList);
  console.log("initialPfdList 길이:", processStore.initialPfdList?.length || 0);
  console.log("pfdList 길이:", processStore.pfdList?.length || 0);

  if (processStore.initialPfdList && processStore.pfdList) {
    // 삭제된 행들 감지 (더 정확한 비교)
    const deletedRows = processStore.initialPfdList.filter((initialItem) => {
      // drawing_id가 없는 항목은 삭제 대상이 아님
      if (!initialItem.drawing_id || initialItem.drawing_id.startsWith("temp_"))
        return false;

      // 현재 리스트에서 해당 항목을 찾기 (id와 drawing_id 모두 확인)
      const foundInCurrent = processStore.pfdList.some((currentItem) => {
        // id가 같은 경우 (같은 행)
        if (currentItem.id === initialItem.id) return true;
        // drawing_id가 같은 경우 (같은 파일)
        if (
          currentItem.drawing_id &&
          currentItem.drawing_id === initialItem.drawing_id
        )
          return true;
        return false;
      });

      console.log(`삭제 감지 - 초기항목:`, {
        id: initialItem.id,
        drawing_id: initialItem.drawing_id,
        foundInCurrent,
        willBeDeleted: !foundInCurrent,
      });

      return !foundInCurrent;
    });

    // 추가된 행들 감지 (더 정확한 비교)
    const addedRows = processStore.pfdList.filter((currentItem) => {
      // drawing_id가 없는 항목은 추가 대상이 아님
      if (!currentItem.drawing_id) return false;

      // initialPfdList에서 해당 항목을 찾기 (id 우선 확인)
      const foundInInitial = processStore.initialPfdList.some((initialItem) => {
        // id가 같은 경우 (같은 행) - 이것이 가장 중요
        if (initialItem.id === currentItem.id) return true;
        return false;
      });

      // 기존 행이면 신규 추가가 아님 (파일 변경이어도 기존 행)
      if (foundInInitial) {
        console.log(`기존 행 확인 - 신규 추가 아님:`, {
          id: currentItem.id,
          drawing_id: currentItem.drawing_id,
          isExistingRow: true,
        });
        return false;
      }

      // 새로 추가된 행은 id가 'pfd_'로 시작하고 drawing_id가 임시 ID인 경우
      if (
        currentItem.id.startsWith("pfd_") &&
        currentItem.drawing_id?.startsWith("temp_pfd_drawing_")
      ) {
        console.log(`신규 추가 감지 - 임시 ID:`, {
          id: currentItem.id,
          drawing_id: currentItem.drawing_id,
          hasFile: !!(currentItem as any)._file,
          hasSvgFile: !!(currentItem as any).svgFile,
        });
        return true;
      }

      // 다른 경우도 신규 추가로 간주 (실제로는 드물게 발생)
      console.log(`신규 추가 감지 - 기타 경우:`, {
        id: currentItem.id,
        drawing_id: currentItem.drawing_id,
        foundInInitial,
        willBeAdded: !foundInInitial,
        pfdFileName: currentItem.pfdFileName,
        hasFile: !!(currentItem as any)._file,
        hasSvgFile: !!(currentItem as any).svgFile,
      });

      return !foundInInitial;
    });

    // 수정된 행들 감지 (Svg 파일 변경 포함)
    const modifiedRows = processStore.pfdList.filter((currentItem) => {
      // initialPfdList에서 해당 행 찾기 (id로만 확인)
      const initialItem = processStore.initialPfdList.find((initialItem) => {
        // id가 같은 경우 (같은 행)
        if (initialItem.id === currentItem.id) return true;
        return false;
      });

      if (!initialItem) {
        console.log(`수정 감지 실패 - 초기 항목을 찾을 수 없음:`, {
          id: currentItem.id,
          drawing_id: currentItem.drawing_id,
        });
        return false;
      }

      // PFD 파일이나 Svg 파일이 변경된 경우 감지
      const currentPfdFile = (currentItem as any)._file;
      const currentSvgFile = (currentItem as any).svgFile;
      const initialPfdFile = (initialItem as any)?._file;
      const initialSvgFile = (initialItem as any)?.svgFile;

      // 파일명이 변경된 경우 감지
      const pfdFileNameChanged =
        currentItem.pfdFileName !== initialItem.pfdFileName;
      const svgFileNameChanged =
        (currentItem as any).svgFileName !== (initialItem as any).svgFileName;

      // 파일 객체가 변경된 경우 감지
      const pfdFileChanged =
        currentPfdFile &&
        (!initialPfdFile || currentPfdFile.name !== initialPfdFile.name);
      const svgFileChanged =
        (currentSvgFile &&
          (!initialSvgFile ||
            (currentSvgFile as any).name !== (initialSvgFile as any).name)) ||
        (!currentSvgFile && initialSvgFile);

      const isModified =
        pfdFileNameChanged ||
        svgFileNameChanged ||
        pfdFileChanged ||
        svgFileChanged;

      console.log(`수정 감지 - 현재항목:`, {
        id: currentItem.id,
        drawing_id: currentItem.drawing_id,
        initialId: initialItem.id,
        initialDrawingId: initialItem.drawing_id,
        pfdFileNameChanged,
        svgFileNameChanged,
        pfdFileChanged,
        svgFileChanged,
        isModified,
        currentPfdFileName: currentItem.pfdFileName,
        initialPfdFileName: initialItem.pfdFileName,
        currentSvgFileName: (currentItem as any).svgFileName,
        initialSvgFileName: (initialItem as any).svgFileName,
        currentPfdFileObject: currentPfdFile?.name,
        initialPfdFileObject: initialPfdFile?.name,
        currentSvgFileObject: (currentSvgFile as any)?.name,
        initialSvgFileObject: (initialSvgFile as any)?.name,
      });

      return isModified;
    });

    // 중복 처리 방지: 수정된 행이 추가된 행에 포함되지 않도록 확인
    const finalAddedRows = addedRows.filter((addedItem) => {
      const isAlsoModified = modifiedRows.some(
        (modifiedItem) => modifiedItem.id === addedItem.id
      );
      if (isAlsoModified) {
        console.log(`중복 처리 방지 - 수정된 행을 추가 행에서 제외:`, {
          id: addedItem.id,
          drawing_id: addedItem.drawing_id,
        });
        return false;
      }
      return true;
    });

    console.log("PFD 변경사항 확인:", {
      deletedRows: deletedRows.length,
      addedRows: finalAddedRows.length,
      modifiedRows: modifiedRows.length,
      initialCount: processStore.initialPfdList.length,
      currentCount: processStore.pfdList.length,
      duplicatePrevention: addedRows.length - finalAddedRows.length,
    });

    // 변경사항이 없는 경우
    if (
      deletedRows.length === 0 &&
      finalAddedRows.length === 0 &&
      modifiedRows.length === 0
    ) {
      console.log("PFD 변경사항이 없습니다.");
      return false;
    }

    // 삭제된 행 처리
    if (deletedRows.length > 0) {
      try {
        console.log("=== PFD 삭제 API 호출 시작 ===");
        const deletePromises = deletedRows.map(async (row) => {
          if (!row.drawing_id) return null;

          try {
            const response = await request(
              `/api/process/drawing/delete/${row.drawing_id}`,
              {},
              {
                method: "DELETE",
                headers: {
                  user_Id: localStorage.getItem("authUserId") || "",
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.success) {
              // 404 Not Found 오류인 경우 무시하고 계속 진행
              if (
                response.status === 404 ||
                response.message?.includes("not found")
              ) {
                console.warn(
                  `PFD 삭제 건너뛰기 - ID가 존재하지 않음: ${row.drawing_id}`
                );
                return {
                  success: true,
                  drawing_id: row.drawing_id,
                  skipped: true,
                };
              }
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return { success: true, drawing_id: row.drawing_id };
          } catch (deleteError: any) {
            // 404 오류나 "not found" 메시지가 포함된 경우 무시
            if (
              deleteError.message?.includes("not found") ||
              deleteError.message?.includes("404") ||
              (deleteError.message?.includes("DrawingMasters with ID") &&
                deleteError.message?.includes("not found"))
            ) {
              console.warn(
                `PFD 삭제 건너뛰기 - ID가 존재하지 않음: ${row.drawing_id}`
              );
              return {
                success: true,
                drawing_id: row.drawing_id,
                skipped: true,
              };
            }
            throw deleteError;
          }
        });

        await Promise.all(deletePromises);
        console.log("=== PFD 삭제 API 호출 완료 ===");
      } catch (error) {
        console.error("PFD 삭제 실패:", error);
        throw error;
      }
    }

    // 추가된 행 처리
    if (finalAddedRows.length > 0) {
      try {
        console.log("=== PFD 추가 API 호출 시작 ===");
        for (const pfdItem of finalAddedRows) {
          const file = (pfdItem as any)._file;
          const svgFile = (pfdItem as any).svgFile;

          // PFD 파일이나 Svg 파일 중 하나라도 있어야 처리
          if (!file && !svgFile) {
            console.warn("PFD 파일과 Svg 파일이 모두 없어서 건너뛰기:", {
              id: pfdItem.id,
              pfdFileName: pfdItem.pfdFileName,
              drawing_id: pfdItem.drawing_id,
              hasFile: !!file,
              hasSvgFile: !!svgFile,
              fileObject: file,
              svgFileObject: svgFile,
            });
            continue;
          }

          const formData = new FormData();

          // drawingData를 개별 필드로 FormData에 추가
          formData.append("process_id", processId);
          formData.append("drawing_type", "PFDCARD");

          // PFD 파일이 있는 경우에만 전달
          if (file) {
            console.log("PFD 파일을 siteFile로 전달:", file.name);
            formData.append("siteFile", file);
          }

          // Svg 파일이 있는 경우에만 전달
          if (svgFile) {
            console.log(
              "Svg 파일 정보를 symbolFile로 전달:",
              (pfdItem as any).svgFileName
            );
            formData.append("symbolFile", svgFile);
          }

          console.log("PFD API 호출 시작...");
          console.log("PFD FormData 내용:");
          console.log("process_id:", processId);
          console.log("drawing_type:", "PFDCARD");
          console.log("siteFile:", file ? file.name : "");
          console.log(
            "symbolFile:",
            svgFile ? (pfdItem as any).svgFileName : ""
          );
          const response = await request(
            "/api/process/drawing/create",
            undefined,
            {
              method: "POST",
              body: formData,
            }
          );

          console.log("PFD API 호출 완료:", response);

          if (!response.success) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const responseData = response;
          console.log("PFD 도면 생성 API 응답:", responseData);
          console.log("응답 구조 분석:");
          console.log("- responseData.response:", responseData.response);
          console.log(
            "- responseData.response?.drawing_id:",
            responseData.response?.drawing_id
          );
          console.log(
            "- responseData.response?.data:",
            responseData.response?.data
          );
          console.log(
            "- responseData.response?.data?.drawing_id:",
            responseData.response?.data?.drawing_id
          );

          // drawing_id 추출 (여러 가능한 경로 확인)
          let drawingId =
            responseData.response?.drawing_id ||
            responseData.response?.data?.drawing_id ||
            responseData.response?.id ||
            responseData.drawing_id ||
            responseData.id;

          // symbol_id 추출 (Svg 파일이 있는 경우)
          let symbolId =
            responseData.response?.symbol_id ||
            responseData.response?.data?.symbol_id ||
            responseData.symbol_id;

          console.log("추출된 drawing_id:", drawingId);
          console.log("추출된 symbol_id:", symbolId);
          console.log("API 응답 전체 구조:", {
            response: responseData.response,
            data: responseData.response?.data,
            directResponse: responseData,
            allKeys: Object.keys(responseData),
            responseKeys: Object.keys(responseData.response || {}),
            dataKeys: Object.keys(responseData.response?.data || {}),
          });

          if (drawingId) {
            const updatedPfdList = processStore.pfdList.map((item) => {
              if (item.id === pfdItem.id) {
                return {
                  ...item,
                  drawing_id: drawingId,
                  symbol_id: symbolId || item.symbol_id, // symbol_id 업데이트
                  hasPidMapping: false, // 초기값은 false로 설정
                };
              }
              return item;
            });
            processStore.setPfdList(updatedPfdList);
            console.log("✅ PFD drawing_id 및 symbol_id 업데이트 완료:", {
              itemId: pfdItem.id,
              oldDrawingId: pfdItem.drawing_id,
              newDrawingId: drawingId,
              symbolId,
            });

            // 업데이트된 drawing_id 유효성 검증
            const updatedItem = processStore.pfdList.find(
              (item) => item.id === pfdItem.id
            );
            if (updatedItem && updatedItem.drawing_id === drawingId) {
              console.log("✅ drawing_id 업데이트 검증 성공");
            } else {
              console.error("❌ drawing_id 업데이트 검증 실패:", {
                expectedDrawingId: drawingId,
                actualDrawingId: updatedItem?.drawing_id,
              });
            }

            // PFD 저장 후 P&ID 매핑 정보 확인 및 업데이트
            await updatePfdPidMappingInfo(drawingId, pfdItem.id);

            // PFD 저장 후 그리드 새로고침은 하지 않음 (기존 상태 유지)
            // await refreshPfdData();
          } else {
            console.error(
              "❌ drawing_id 추출 실패 - API 응답에서 drawing_id를 찾을 수 없습니다:",
              {
                itemId: pfdItem.id,
                pfdFileName: pfdItem.pfdFileName,
                responseData: responseData,
                availablePaths: [
                  "responseData.response?.drawing_id",
                  "responseData.response?.data?.drawing_id",
                  "responseData.response?.id",
                  "responseData.drawing_id",
                  "responseData.id",
                ],
              }
            );

            // drawing_id가 없어도 파일명은 업데이트된 상태로 유지
            console.log("⚠️ drawing_id 없이 파일명만 업데이트된 상태로 유지");
          }
        }
        console.log("추가된 PFD 처리 완료");
      } catch (error) {
        console.error("PFD 추가 실패:", error);
        throw error;
      }
    }
    // 수정된 행 처리 (Svg 파일 변경)
    if (modifiedRows.length > 0) {
      try {
        console.log("=== PFD 수정 API 호출 시작 ===");
        for (const pfdItem of modifiedRows) {
          console.log("수정된 PFD 항목:", pfdItem);

          // 초기 항목 찾기 (id로 찾기)
          const initialItem = processStore.initialPfdList.find(
            (initialItem) => initialItem.id === pfdItem.id
          );

          if (!initialItem) {
            console.error("❌ 초기 항목을 찾을 수 없음:", pfdItem.id);
            continue;
          }

          // 실제 UUID 형식의 drawing_id 사용 (초기 값)
          const actualDrawingId = initialItem.drawing_id;
          console.log("수정 API 호출용 drawing_id:", {
            currentDrawingId: pfdItem.drawing_id,
            actualDrawingId: actualDrawingId,
            isUuidFormat:
              actualDrawingId && !actualDrawingId.startsWith("temp_"),
          });

          // 변경된 파일 정보 확인
          const currentPfdFile = (pfdItem as any)._file;
          const currentSvgFile = (pfdItem as any).svgFile;
          const initialPfdFile = (initialItem as any)?._file;
          const initialSvgFile = (initialItem as any)?.svgFile;

          // 파일 객체 상태 상세 로깅
          console.log("파일 객체 상태 확인:", {
            itemId: pfdItem.id,
            currentPfdFile: currentPfdFile
              ? { name: currentPfdFile.name, size: currentPfdFile.size }
              : null,
            currentSvgFile: currentSvgFile
              ? {
                  name: (currentSvgFile as any).name,
                  size: (currentSvgFile as any).size,
                }
              : null,
            initialPfdFile: initialPfdFile
              ? { name: initialPfdFile.name, size: initialPfdFile.size }
              : null,
            initialSvgFile: initialSvgFile
              ? {
                  name: (initialSvgFile as any).name,
                  size: (initialSvgFile as any).size,
                }
              : null,
          });

          // PFD 파일 변경 감지 (더 정확한 로직)
          const pfdFileChanged =
            currentPfdFile &&
            (!initialPfdFile || currentPfdFile.name !== initialPfdFile.name);

          // SVG 파일 변경 감지 (더 정확한 로직)
          const svgFileChanged =
            (currentSvgFile &&
              (!initialSvgFile ||
                (currentSvgFile as any).name !==
                  (initialSvgFile as any).name)) ||
            (!currentSvgFile && initialSvgFile);

          // 파일명 변경 감지 (추가 확인)
          const pfdFileNameChanged =
            pfdItem.pfdFileName !== initialItem.pfdFileName;
          const svgFileNameChanged =
            (pfdItem as any).svgFileName !== (initialItem as any).svgFileName;

          console.log("파일 변경 감지 상세:", {
            itemId: pfdItem.id,
            pfdFileChanged,
            svgFileChanged,
            pfdFileNameChanged,
            svgFileNameChanged,
            currentPfdFileName: pfdItem.pfdFileName,
            initialPfdFileName: initialItem.pfdFileName,
            currentSvgFileName: (pfdItem as any).svgFileName,
            initialSvgFileName: (initialItem as any).svgFileName,
          });

          // 파일 변경 감지 (파일 객체 변경 또는 파일명 변경)
          const hasFileChange =
            pfdFileChanged ||
            svgFileChanged ||
            pfdFileNameChanged ||
            svgFileNameChanged;

          if (hasFileChange) {
            console.log("파일 변경 감지:", {
              pfdFileChanged,
              svgFileChanged,
              pfdFileNameChanged,
              svgFileNameChanged,
              pfdFileName: currentPfdFile?.name,
              svgFileName: (currentSvgFile as any)?.name,
            });

            const formData = new FormData();

            // PFD 파일만 변경된 경우: drawingId와 siteFile만 전달
            if (
              (pfdFileChanged || pfdFileNameChanged) &&
              currentPfdFile &&
              !svgFileChanged &&
              !svgFileNameChanged
            ) {
              console.log(
                "PFD 파일만 변경 - siteFile만 전달:",
                currentPfdFile.name
              );
              formData.append("siteFile", currentPfdFile);
            }
            // SVG 파일만 변경된 경우: drawingId와 symbolFile만 전달
            else if (
              (svgFileChanged || svgFileNameChanged) &&
              !pfdFileChanged &&
              !pfdFileNameChanged
            ) {
              if (currentSvgFile) {
                console.log(
                  "SVG 파일만 변경 - symbolFile만 전달:",
                  (currentSvgFile as any).name
                );
                formData.append("symbolFile", currentSvgFile);
              } else {
                console.log("SVG 파일 삭제 - symbolFile 빈 값 전달");
                formData.append("symbolFile", ""); // 빈 값으로 전송하여 삭제
              }
            }
            // PFD와 SVG 파일 모두 변경된 경우: 기존 방식 유지
            else if (
              (pfdFileChanged || pfdFileNameChanged) &&
              (svgFileChanged || svgFileNameChanged)
            ) {
              console.log("PFD와 SVG 파일 모두 변경 - 전체 매개변수 전달");
              formData.append("process_id", processId);
              formData.append("drawing_type", "PFDCARD");

              if (currentPfdFile) {
                console.log(
                  "PFD 파일을 siteFile로 업데이트:",
                  currentPfdFile.name
                );
                formData.append("siteFile", currentPfdFile);
              }

              if (currentSvgFile) {
                console.log("Svg 파일 업데이트:", (currentSvgFile as any).name);
                formData.append("symbolFile", currentSvgFile);
              } else {
                console.log("Svg 파일 삭제");
                formData.append("symbolFile", ""); // 빈 값으로 전송하여 삭제
              }
            }
            // 파일명만 변경된 경우 (파일 객체는 없지만 파일명이 변경됨)
            else {
              console.log("파일명만 변경된 경우 - 전체 매개변수 전달");
              formData.append("process_id", processId);
              formData.append("drawing_type", "PFDCARD");

              // 파일명 변경 정보 전달
              if (pfdFileNameChanged) {
                formData.append("pfdFileName", pfdItem.pfdFileName);
              }
              if (svgFileNameChanged) {
                formData.append(
                  "svgFileName",
                  (pfdItem as any).svgFileName || ""
                );
              }
            }

            // FormData 내용 로그 출력
            console.log("FormData 매개변수 확인:");
            for (let [key, value] of (formData as any).entries()) {
              if (value instanceof File) {
                console.log(`${key}:`, {
                  name: value.name,
                  size: value.size,
                  type: value.type,
                });
              } else {
                console.log(`${key}:`, value);
              }
            }

            // UUID 형식 검증
            const uuidRegex =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (
              !actualDrawingId ||
              actualDrawingId.startsWith("temp_") ||
              !uuidRegex.test(actualDrawingId)
            ) {
              console.error("❌ 유효하지 않은 drawing_id:", {
                actualDrawingId,
                itemId: pfdItem.id,
                isTempId: actualDrawingId?.startsWith("temp_"),
                isUuidFormat: actualDrawingId
                  ? uuidRegex.test(actualDrawingId)
                  : false,
                message: "UUID 형식이 아니거나 임시 ID입니다.",
              });
              continue;
            }

            const response = await request(
              `/api/process/drawing/${actualDrawingId}`,
              undefined,
              {
                method: "PATCH",
                body: formData,
              }
            );

            console.log("PFD 파일 업데이트 API 호출 완료:", response);

            if (!response.success) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            // symbol_id 추출 및 업데이트 (Svg 파일이 변경된 경우)
            if (svgFileChanged) {
              const symbolId =
                response.response?.symbol_id ||
                response.response?.data?.symbol_id;
              if (symbolId !== undefined) {
                const updatedPfdList = processStore.pfdList.map((item) => {
                  if (item.id === pfdItem.id) {
                    return { ...item, symbol_id: symbolId };
                  }
                  return item;
                });
                processStore.setPfdList(updatedPfdList);
                console.log("✅ PFD symbol_id 업데이트 완료:", {
                  itemId: pfdItem.id,
                  drawingId: actualDrawingId,
                  symbolId,
                });
              }
            }

            console.log("✅ PFD 파일 업데이트 완료:", {
              itemId: pfdItem.id,
              drawingId: actualDrawingId,
              pfdFileName: pfdItem.pfdFileName,
            });
          } else {
            console.log("파일 변경사항 없음, 건너뛰기:", pfdItem.drawing_id);
          }
        }
        console.log("수정된 PFD 처리 완료");
      } catch (error) {
        console.error("PFD 수정 실패:", error);
        throw error;
      }
    }

    // 변경사항이 없으면 false 반환
    if (
      deletedRows.length === 0 &&
      addedRows.length === 0 &&
      modifiedRows.length === 0
    ) {
      console.log("PFD 변경사항이 없습니다.");
      return false;
    }

    // 초기값 업데이트
    const updatedPfdList = JSON.parse(JSON.stringify(processStore.pfdList));
    processStore.setInitialPfdList(updatedPfdList);

    // 그리드 갱신을 위한 강제 리렌더링 트리거
    console.log(
      "PFD 그리드 갱신 완료 - symbol_id 포함:",
      updatedPfdList.map((item) => ({
        id: item.id,
        drawing_id: item.drawing_id,
        symbol_id: item.symbol_id,
      }))
    );

    console.log("=== PFD 변경사항 처리 완료 ===");
    return true;
  } else {
    // initialPfdList나 pfdList가 없는 경우
    console.log("PFD 데이터가 없습니다. 변경사항이 없습니다.");
    return false;
  }
};

const handlePfdSelectionChange = () => {
  console.log("선택된 공정카드 항목:", selectedPfdItems.value);

  // 공정카드 row가 선택되면 P&ID 버튼 클릭 이벤트 호출
  if (selectedPfdItems.value) {
    const selectedItem = selectedPfdItems.value;
    console.log("공정카드 선택으로 인한 P&ID 버튼 클릭 시뮬레이션");
    openMappingPidModal(selectedItem);
  }
};

// 삭제 함수들
const handleFormulaDelete = () => {
  if (!selectedFormulaItems.value) {
    alert("삭제할 항목을 선택해주세요.");
    return;
  }

  const confirmed = confirm("선택된 계산식을 삭제하시겠습니까?");
  if (!confirmed) return;

  const updatedList = processStore.formulaList.filter(
    (item) => item.id !== selectedFormulaItems.value.id
  );
  processStore.setFormulaList(updatedList);
  selectedFormulaItems.value = null;
  // 반응성 플러시 후 강제 리렌더 유도
  Promise.resolve().then(() => {
    formulaTableKey.value++;
  });

  console.log("계산식 그리드에서 삭제 완료");
};
// 계산식 저장 핸들러
const handleFormulaSave = async () => {
  try {
    console.log("계산식 저장 버튼 클릭");

    let processId: string;

    if (props.isRegisterMode) {
      // 공정 등록 모드일 때는 생성된 공정 ID 사용
      if (!createdProcessId.value) {
        alert("공정이 등록되지 않았습니다. 먼저 기본정보를 등록해주세요.");
        return;
      }
      processId = createdProcessId.value;
      console.log("공정 등록 모드 - 생성된 공정 ID 사용:", processId);
    } else {
      // 공정 상세 모드일 때는 기존 로직 사용
      processId = props.processId || (route.params.id as string);
      if (!processId) {
        alert("공정 ID가 없습니다.");
        return;
      }
    }

    // 계산식 변경사항 처리
    const hasChanges = await processFormulaChanges(processId);

    if (hasChanges) {
      console.log("계산식 저장 완료");

      // 저장 완료 후 그리드 상태 확인
      console.log("=== 저장 완료 후 그리드 상태 확인 ===");
      console.log(
        "processStore.formulaList 길이:",
        processStore.formulaList.length
      );
      console.log(
        "processStore.formulaList 내용:",
        processStore.formulaList.map((item) => ({
          id: item.id,
          registeredFormula: item.registeredFormula,
          isSaved: item.isSaved,
          file_name: item.file_name,
        }))
      );

      // 계산식 그리드 새로고침
      await refreshFormulaData();
      console.log("계산식 그리드 새로고침 완료");

      // 렌더 강제 갱신
      formulaTableKey.value++;

      alert("계산식 저장이 완료되었습니다.");
    } else {
      console.log("저장할 변경사항이 없습니다.");
      alert("저장할 계산식 변경사항이 없습니다.");
    }
  } catch (error: any) {
    console.error("계산식 저장 실패:", error);
    alert(`계산식 저장 실패: ${error.message}`);
  }
};
// 계산식 변경사항 처리 함수
const processFormulaChanges = async (processId: string) => {
  console.log("=== 계산식 변경사항 처리 시작 ===");
  console.log("initialFormulaList 존재:", !!processStore.initialFormulaList);
  console.log("formulaList 존재:", !!processStore.formulaList);
  console.log(
    "initialFormulaList 길이:",
    processStore.initialFormulaList?.length || 0
  );
  console.log("formulaList 길이:", processStore.formulaList?.length || 0);

  if (processStore.initialFormulaList && processStore.formulaList) {
    // 삭제된 행들 감지
    const deletedRows = processStore.initialFormulaList.filter(
      (initialItem) => {
        if (!initialItem.formula_id) return false;
        return !processStore.formulaList.some(
          (currentItem) =>
            currentItem.formula_id &&
            currentItem.formula_id === initialItem.formula_id
        );
      }
    );

    // 추가된 행들 감지
    const addedRows = processStore.formulaList.filter((currentItem) => {
      // 새로 추가된 행은 id가 'formula_'로 시작하고 formula_id가 없는 경우
      if (currentItem.id.startsWith("formula_") && !currentItem.formula_id) {
        console.log("새로 추가된 계산식 감지 (ID 기준):", currentItem.id);
        return true;
      }

      // isSaved가 false인 행은 새로 추가된 행으로 간주
      if (currentItem.isSaved === false) {
        console.log("새로 추가된 계산식 감지 (isSaved 기준):", currentItem.id);
        return true;
      }

      // 기존 행이지만 formula_id가 있고 initialFormulaList에 없는 경우
      if (!currentItem.formula_id) return false;
      const isNewItem = !processStore.initialFormulaList.some(
        (initialItem) =>
          initialItem.formula_id &&
          initialItem.formula_id === currentItem.formula_id
      );
      if (isNewItem) {
        console.log(
          "새로 추가된 계산식 감지 (formula_id 기준):",
          currentItem.formula_id
        );
      }
      return isNewItem;
    });

    console.log("계산식 변경사항 확인:", {
      deletedRows: deletedRows.length,
      addedRows: addedRows.length,
      initialCount: processStore.initialFormulaList.length,
      currentCount: processStore.formulaList.length,
    });

    // 디버깅을 위한 상세 로그
    console.log("=== 계산식 그리드 상세 분석 ===");
    console.log(
      "현재 formulaList:",
      processStore.formulaList.map((item) => ({
        id: item.id,
        formula_id: item.formula_id,
        registeredFormula: item.registeredFormula,
        isSaved: item.isSaved,
      }))
    );
    console.log(
      "초기 initialFormulaList:",
      processStore.initialFormulaList.map((item) => ({
        id: item.id,
        formula_id: item.formula_id,
        registeredFormula: item.registeredFormula,
        isSaved: item.isSaved,
      }))
    );

    // addedRows 상세 정보 로그
    if (addedRows.length > 0) {
      console.log("추가된 계산식 상세 정보:", addedRows);
      addedRows.forEach((row, index) => {
        console.log(`추가된 계산식 ${index + 1}:`, {
          id: row.id,
          registeredFormula: row.registeredFormula,
          formula_code: row.formula_code,
          _file: (row as any)._file,
          formula_id: row.formula_id,
        });
      });
    }

    // 삭제된 행 처리
    if (deletedRows.length > 0) {
      try {
        console.log("=== 계산식 삭제 API 호출 시작 ===");
        const deletePromises = deletedRows.map((row, index) => {
          let formulaId = row.formula_id;
          if (!formulaId && row.id && row.id.startsWith("existing_formula_")) {
            formulaId = row.id.replace("existing_formula_", "");
          }

          if (!formulaId) {
            console.error("삭제할 formula_id를 찾을 수 없습니다:", row);
            return Promise.reject(
              new Error("삭제할 formula_id를 찾을 수 없습니다")
            );
          }

          return deleteFormulaAPI(formulaId);
        });

        await Promise.all(deletePromises);
        console.log("=== 계산식 삭제 API 호출 완료 ===");
      } catch (error) {
        console.error("계산식 삭제 실패:", error);
        throw error;
      }
    }

    // 추가된 행 처리
    if (addedRows.length > 0) {
      try {
        console.log("=== 계산식 추가 API 호출 시작 ===");
        console.log("processId:", processId);
        console.log("추가할 계산식 개수:", addedRows.length);

        const results = await Promise.allSettled(
          addedRows.map((formula, index) => {
            console.log(`계산식 ${index + 1} API 호출 시작:`, {
              processId: processId,
              formulaName: formula.registeredFormula,
              formulaCode: formula.formula_code || "",
              file: (formula as any)._file,
            });
            return createFormulaAPI(
              processId,
              formula.registeredFormula,
              formula.formula_code || "",
              (formula as any)._file
            );
          })
        );

        // 성공한 계산식과 실패한 계산식 분리
        const successfulFormulas: any[] = [];
        const failedFormulas: any[] = [];

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const addedRow = addedRows[index];
            const apiResponse = result.value;

            // API 응답 구조 디버깅
            console.log("=== API 응답 구조 분석 ===");
            console.log("apiResponse:", apiResponse);
            console.log("apiResponse.response:", apiResponse?.response);
            console.log(
              "apiResponse.response.data:",
              apiResponse?.response?.data
            );
            console.log(
              "apiResponse.response.data.response:",
              apiResponse?.response?.data?.response
            );
            console.log(
              "apiResponse.response.data.response.data:",
              apiResponse?.response?.data?.response?.data
            );
            console.log(
              "apiResponse.response.data.response.data.formula_id:",
              apiResponse?.response?.data?.response?.data?.formula_id
            );
            console.log(
              "apiResponse.response.data.response.data.files:",
              apiResponse?.response?.data?.response?.data?.files
            );
            console.log(
              "apiResponse.response.data.response.data.files.python:",
              apiResponse?.response?.data?.response?.data?.files?.python
            );
            console.log("=== API 응답 구조 분석 끝 ===");

            // API 응답에서 file_name과 formula_id 추출
            const fileName =
              apiResponse?.response?.file_name ||
              apiResponse?.file_name ||
              apiResponse?.response?.data?.files?.python?.original_filename ||
              apiResponse?.response?.data?.response?.files?.python
                ?.original_filename ||
              apiResponse?.response?.data?.response?.data?.files?.python
                ?.original_filename;
            const formulaId =
              apiResponse?.response?.formula_id ||
              apiResponse?.formula_id ||
              apiResponse?.response?.data?.formula_id ||
              apiResponse?.response?.data?.response?.formula_id ||
              apiResponse?.response?.data?.response?.data?.formula_id;

            if (fileName) {
              addedRow.file_name = fileName;
              console.log(
                `계산식 file_name 업데이트: ${addedRow.registeredFormula} -> ${fileName}`
              );
            }

            if (formulaId) {
              addedRow.formula_id = formulaId;
              console.log(
                `계산식 formula_id 업데이트: ${addedRow.registeredFormula} -> ${formulaId}`
              );
            } else {
              console.log(
                `계산식 formula_id 추출 실패: ${addedRow.registeredFormula}`
              );
              console.log("추출 시도한 경로들:", {
                "apiResponse?.response?.formula_id":
                  apiResponse?.response?.formula_id,
                "apiResponse?.formula_id": apiResponse?.formula_id,
                "apiResponse?.response?.data?.formula_id":
                  apiResponse?.response?.data?.formula_id,
                "apiResponse?.response?.data?.response?.formula_id":
                  apiResponse?.response?.data?.response?.formula_id,
                "apiResponse?.response?.data?.response?.data?.formula_id":
                  apiResponse?.response?.data?.response?.data?.formula_id,
              });
            }

            successfulFormulas.push(addedRow);
          } else {
            failedFormulas.push({
              formula: addedRows[index],
              error: result.reason,
            });
            console.warn(
              `계산식 추가 실패: ${addedRows[index].registeredFormula}`,
              result.reason
            );
          }
        });

        console.log(
          `계산식 처리 완료: 성공 ${successfulFormulas.length}개, 실패 ${failedFormulas.length}개`
        );

        // 성공한 계산식의 isSaved 상태와 file_name을 업데이트
        const updatedFormulaList = processStore.formulaList.map((item) => {
          const successfulFormula = successfulFormulas.find(
            (sf) => sf.id === item.id
          );
          if (successfulFormula) {
            console.log(
              `계산식 저장 완료 - ${item.registeredFormula} (ID: ${item.id})`
            );
            return {
              ...item,
              isSaved: true,
              file_name: successfulFormula.file_name || item.file_name, // file_name 업데이트
              formula_id: successfulFormula.formula_id || item.formula_id, // formula_id 업데이트
            };
          }
          return item;
        });
        processStore.setFormulaList(updatedFormulaList);
        console.log("계산식 저장 상태 업데이트 완료");
        console.log("업데이트된 계산식 목록:", updatedFormulaList);

        // formula_id 설정 확인
        console.log("=== formula_id 설정 확인 ===");
        updatedFormulaList.forEach((item, index) => {
          console.log(`계산식 ${index + 1}:`, {
            id: item.id,
            registeredFormula: item.registeredFormula,
            formula_id: item.formula_id,
            file_name: item.file_name,
            isSaved: item.isSaved,
          });
        });
        console.log("=== formula_id 설정 확인 끝 ===");

        // 그리드 상태 확인
        console.log("=== 그리드 상태 확인 ===");
        console.log(
          "processStore.formulaList 길이:",
          processStore.formulaList.length
        );
        console.log(
          "processStore.formulaList 내용:",
          processStore.formulaList.map((item) => ({
            id: item.id,
            registeredFormula: item.registeredFormula,
            isSaved: item.isSaved,
            file_name: item.file_name,
          }))
        );

        // 실패한 계산식이 있는 경우 사용자에게 알림
        if (failedFormulas.length > 0) {
          const failedNames = failedFormulas
            .map((f) => f.formula.registeredFormula)
            .join(", ");
          const failedReasons = failedFormulas
            .map((f) => f.error.message || f.error)
            .join("\n");
          alert(
            `일부 계산식 저장에 실패했습니다:\n${failedNames}\n\n실패 사유:\n${failedReasons}`
          );
        }
      } catch (error) {
        console.error("계산식 추가 실패:", error);
        throw error;
      }
    }

    // 추가된 행이 감지되지 않은 경우 대안 로직 실행
    if (
      addedRows.length === 0 &&
      processStore.formulaList.length > processStore.initialFormulaList.length
    ) {
      console.log("=== 추가된 행 감지 실패 - 대안 로직 실행 ===");
      console.log("현재 행 수:", processStore.formulaList.length);
      console.log("초기 행 수:", processStore.initialFormulaList.length);

      // 현재 행에서 초기 행에 없는 항목들을 찾기
      const alternativeAddedRows = processStore.formulaList.filter(
        (currentItem) => {
          // 초기 목록에 같은 ID나 formula_id가 없으면 새로 추가된 것으로 간주
          const existsInInitial = processStore.initialFormulaList.some(
            (initialItem) => {
              if (initialItem.id === currentItem.id) return true;
              if (
                initialItem.formula_id &&
                currentItem.formula_id &&
                initialItem.formula_id === currentItem.formula_id
              )
                return true;
              return false;
            }
          );

          if (!existsInInitial) {
            console.log(
              "대안 로직으로 새로 추가된 계산식 감지:",
              currentItem.id
            );
            return true;
          }
          return false;
        }
      );

      if (alternativeAddedRows.length > 0) {
        console.log(
          "대안 로직으로 추가된 행 감지 성공:",
          alternativeAddedRows.length,
          "개"
        );
        addedRows.push(...alternativeAddedRows);
      }
    }

    // 변경사항이 없으면 false 반환
    if (deletedRows.length === 0 && addedRows.length === 0) {
      console.log("계산식 변경사항이 없습니다.");
      return false;
    }

    // 초기값 업데이트
    const updatedFormulaList = JSON.parse(
      JSON.stringify(processStore.formulaList)
    );
    processStore.setInitialFormulaList(updatedFormulaList);

    // 초기값 업데이트 후 그리드 상태 재확인
    console.log("=== 초기값 업데이트 후 그리드 상태 ===");
    console.log(
      "processStore.formulaList 길이:",
      processStore.formulaList.length
    );
    console.log(
      "processStore.initialFormulaList 길이:",
      processStore.initialFormulaList.length
    );

    // 그리드 갱신을 위한 강제 리렌더링 트리거
    console.log(
      "계산식 그리드 갱신 완료 - file_name 포함:",
      updatedFormulaList.map((item) => ({
        id: item.id,
        formula_id: item.formula_id,
        file_name: item.file_name,
        isSaved: item.isSaved,
      }))
    );

    // 최종 그리드 상태 확인
    console.log("=== 최종 그리드 상태 확인 ===");
    console.log(
      "processStore.formulaList 최종 길이:",
      processStore.formulaList.length
    );
    console.log(
      "processStore.initialFormulaList 최종 길이:",
      processStore.initialFormulaList.length
    );
    console.log(
      "processStore.formulaList 최종 내용:",
      processStore.formulaList
    );

    console.log("=== 계산식 변경사항 처리 완료 ===");
    return true;
  }
};

const handlePfdDelete = () => {
  if (!selectedPfdItems.value) {
    alert("삭제할 항목을 선택해주세요.");
    return;
  }

  const confirmed = confirm("선택된 공정카드를 삭제하시겠습니까?");
  if (!confirmed) return;

  // 삭제될 PFD 항목의 drawing_id 확인
  const deletedDrawingId = selectedPfdItems.value.drawing_id;

  // P&ID Components 섹션이 열려있고, 삭제될 PFD와 연관된 경우 섹션 닫기
  if (showPidComponentSection.value && selectedPidForComponent.value) {
    // 현재 열린 P&ID Components가 삭제될 PFD와 연관된 경우 확인
    if (
      selectedPidForComponent.value.parent_drawing_id === deletedDrawingId ||
      pidComponentDrawingId.value === deletedDrawingId
    ) {
      console.log("삭제되는 PFD와 연관된 P&ID Components 섹션 닫기");
      closePidComponentSection();
    }
  }

  // P&ID 매핑 영역이 열려있고, 삭제될 PFD와 연관된 경우 영역 닫기
  if (showPidListInMain.value && currentPfdItemForMapping.value) {
    // 현재 열린 P&ID 매핑이 삭제될 PFD와 연관된 경우 확인
    if (
      currentPfdItemForMapping.value.drawing_id === deletedDrawingId ||
      currentPfdItemForMapping.value.id === selectedPfdItems.value.id
    ) {
      console.log("삭제되는 PFD와 연관된 P&ID 매핑 영역 닫기");
      closePidListInMain();
    }
  }

  const updatedList = processStore.pfdList.filter(
    (item) => item.id !== selectedPfdItems.value.id
  );
  processStore.setPfdList(updatedList);
  selectedPfdItems.value = null;

  console.log("공정카드 삭제 완료 - P&ID 관련 영역들도 함께 닫힘");
};

// 메인 저장 버튼 핸들러 (기본 정보만 저장)
const handleMainSave = async () => {
  try {
    console.log("등록 버튼 클릭 - 기본 정보만 저장");

    if (props.isRegisterMode) {
      // 공정 등록 모드일 때
      console.log("공정 등록 모드 - 새 공정 생성");
      await createNewProcess();
    } else {
      // 공정 상세 모드일 때
      const processId = props.processId || (route.params.id as string);
      if (!processId) {
        alert("공정 ID가 없습니다.");
        return;
      }

      // 기본 정보만 저장 처리
      await saveBasicProcessInfo(processId);
    }

    console.log("기본 정보 저장 완료");
  } catch (error: any) {
    console.error("기본 정보 저장 실패:", error);
    alert(`기본 정보 저장 실패: ${error.message}`);
  }
};

// 공정 등록 모드일 때 새 공정 생성하는 함수
const createNewProcess = async () => {
  try {
    console.log("새 공정 생성 처리 시작");

    // 필수 필드 검증

    if (!selectedUnit.value) {
      alert("단위를 선택해주세요.");
      return;
    }

    if (!processStore.processDetail.processType) {
      alert("공정구분을 선택해주세요.");
      return;
    }

    if (!processStore.processDetail.subCategory) {
      alert("공정 중분류를 선택해주세요.");
      return;
    }

    console.log("공정명 검증:", {
      processName: processStore.processDetail.processName,
      processNameType: typeof processStore.processDetail.processName,
      isEmpty: !processStore.processDetail.processName,
      isNull: processStore.processDetail.processName === null,
      isUndefined: processStore.processDetail.processName === undefined,
      isEmptyString: processStore.processDetail.processName === "",
    });

    if (!processStore.processDetail.processName) {
      alert("공정명을 선택해주세요.");
      return;
    }

    // 공정심볼 파일이 있는지 확인 (선택사항)
    const symbolFile = processStore.selectedFiles["processSymbol"];

    // 공정명에서 실제 코드 값 찾기
    const selectedProcessNameOption =
      processStore.searchProcessNameOptions.find(
        (option) => option.value === processStore.processDetail.processName
      );

    if (!selectedProcessNameOption) {
      alert("선택된 공정명을 찾을 수 없습니다.");
      return;
    }

    // FormData로 파일과 함께 전송
    const formData = new FormData();

    // 기본 정보 파라미터들
    formData.append("unit_system_code", selectedUnit.value);
    formData.append("process_code", selectedProcessNameOption.value);
    formData.append("process_name", selectedProcessNameOption.label);
    formData.append(
      "process_type_code",
      processStore.processDetail.processType
    );
    formData.append("process_category", processStore.processDetail.subCategory);

    // 파일 파라미터 (있는 경우에만)
    if (symbolFile) {
      formData.append("siteFile", symbolFile);
    }

    console.log("새 공정 생성 요청 데이터 (FormData):");
    console.log("unit_system_code:", selectedUnit.value);
    console.log("process_code:", selectedProcessNameOption.value);
    console.log("process_name:", selectedProcessNameOption.label);
    console.log("process_type_code:", processStore.processDetail.processType);
    console.log("process_category:", processStore.processDetail.subCategory);
    console.log("siteFile:", symbolFile);

    // /api/process/master/create API 호출 (FormData로 전송)
    const response = await request("/api/process/master/create", undefined, {
      method: "POST",
      body: formData,
    });

    console.log("새 공정 생성 응답:", response);

    // 응답 검증 - 최상위 레벨과 내부 response 모두 확인
    const hasError =
      !response.success ||
      (response.status >= 400 && response.status < 600) ||
      (response.response &&
        response.response.data &&
        !response.response.data.success) ||
      (response.response &&
        response.response.data &&
        response.response.data.status >= 400 &&
        response.response.data.status < 600);

    if (hasError) {
      let errorMessage = "공정 등록에 실패했습니다.";

      // 내부 response의 에러 정보 우선 확인
      if (
        response.response &&
        response.response.data &&
        !response.response.data.success
      ) {
        // 중복 에러 처리 (409) - detail과 data.message 모두 확인
        if (response.response.data.status === 409) {
          if (response.response.data.detail) {
            errorMessage = response.response.data.detail;
          } else if (response.response.data.message) {
            errorMessage = response.response.data.message;
          }
        }
        // 422 에러 처리 (필드 검증 실패)
        else if (
          response.response.data.status === 422 &&
          response.response.data.detail &&
          Array.isArray(response.response.data.detail)
        ) {
          errorMessage = response.response.data.detail.join(", ");
        }
        // 기타 내부 에러 메시지 - data.message도 확인
        else if (response.response.data.detail) {
          errorMessage = response.response.data.detail;
        } else if (response.response.data.message) {
          errorMessage = response.response.data.message;
        }
      }
      // 최상위 레벨 에러 처리
      else if (response.status === 409 && response.response?.data?.detail) {
        errorMessage = response.response.data.detail;
      } else if (
        response.status === 422 &&
        response.response?.detail &&
        Array.isArray(response.response.detail)
      ) {
        errorMessage = response.response.detail.join(", ");
      } else if (response.response?.data?.detail) {
        errorMessage = response.response.data.detail;
      } else if (response.response?.detail) {
        errorMessage = response.response.detail;
      } else if (response.message) {
        errorMessage = response.message;
      }

      console.error("공정 등록 실패:", errorMessage);
      alert(`공정 등록 실패: ${errorMessage}`);
      return;
    }

    console.log("새 공정 생성 완료:", response);
    alert("공정이 성공적으로 등록되었습니다.");

    // 생성된 공정 ID 저장
    if (
      response.response &&
      response.response.data &&
      response.response.data.response &&
      response.response.data.response.process_id
    ) {
      createdProcessId.value =
        response.response.data.response.process_id.toString();
      console.log("생성된 공정 ID 저장:", createdProcessId.value);
    } else {
      console.error("process_id를 찾을 수 없습니다. 응답 구조:", response);
    }

    // 기본정보 등록 완료 상태로 설정
    isBasicInfoRegistered.value = true;

    // 기본 정보 저장 후 공정카드 데이터 로드
    await refreshPfdData();
    console.log("공정카드 데이터 로드 완료");

    // 계산식 데이터도 새로고침
    await refreshFormulaData();
    console.log("계산식 데이터 로드 완료");

    // 공정 등록 성공 후 창은 닫지 않고 그리드만 갱신
    console.log("공정 등록 완료 - 그리드 갱신 완료");
  } catch (error: any) {
    console.error("새 공정 생성 실패:", error);
    throw error;
  }
};
// 기본 정보만 저장하는 함수
const saveBasicProcessInfo = async (processId: string) => {
  try {
    console.log("기본 정보 저장 처리 시작");

    let hasAnyChanges = false;

    // 공정심볼 파일 변경 감지
    const symbolFile = processStore.selectedFiles["processSymbol"];
    const hasProcessSymbolChanged =
      symbolFile !== undefined && symbolFile !== null;

    // 심볼 파일 삭제 여부 확인
    const originalSymbolId = processStore.processDetail.originalSymbolId;
    const currentSymbolId = processStore.processDetail.symbolId;
    const currentProcessSymbol = processStore.processDetail.processSymbol;
    
    // 기존에 심볼 파일이 있었고, 새로운 파일이 선택되지 않았으며, 현재 심볼이 비어있는 경우 삭제로 판단
    const isSymbolDeleted = 
      originalSymbolId && 
      originalSymbolId !== "00000000-0000-0000-0000-000000000000" &&
      !hasProcessSymbolChanged &&
      (!currentProcessSymbol || currentProcessSymbol.trim() === "");

    if (hasProcessSymbolChanged) {
      hasAnyChanges = true;
      console.log("공정심볼 파일 변경 감지됨:", symbolFile.name);

      // processDetail에 siteFile 추가
      processStore.setProcessDetail({
        siteFile: symbolFile,
      });

      console.log("processDetail에 siteFile 설정:", symbolFile.name);
    } else if (isSymbolDeleted) {
      hasAnyChanges = true;
      console.log("공정심볼 파일 삭제 감지됨:", originalSymbolId);
    } else {
      console.log("공정심볼 파일 변경 없음");
    }

    // 기본 정보 변경사항 감지 (단위, 공정구분, 공정 중분류, 공정명 등)
    const currentProcessDetail = processStore.processDetail;
    if (currentProcessDetail) {
      // 기본 정보가 입력되어 있으면 변경사항이 있다고 간주
      if (
        currentProcessDetail.processNm ||
        currentProcessDetail.processType ||
        currentProcessDetail.subCategory ||
        currentProcessDetail.unit ||
        currentProcessDetail.processName
      ) {
        hasAnyChanges = true;
        console.log("기본 정보 변경사항 감지됨");
      }
    }

    // 변경사항이 있는지 확인
    if (!hasAnyChanges) {
      console.log("저장할 변경사항이 없습니다.");
      alert("저장할 내용이 없습니다.");
      return;
    }

    // 공정명 정보 로깅
    if (currentProcessDetail) {
      const selectedProcessNameOption =
        processStore.searchProcessNameOptions.find(
          (option) => option.value === currentProcessDetail.processName
        );

      console.log("현재 기본 정보:", {
        processNm: currentProcessDetail.processNm,
        processType: currentProcessDetail.processType,
        subCategory: currentProcessDetail.subCategory,
        unit: currentProcessDetail.unit,
        processName: currentProcessDetail.processName,
        processNameLabel: selectedProcessNameOption?.label,
      });
    }

    // 공정심볼 파일이 있는 경우에만 저장
    if (hasProcessSymbolChanged) {
      try {
        console.log("공정심볼 파일과 함께 저장 시작");

        // processName을 label 값으로 변환하여 저장
        const processDetailForSave = { ...processStore.processDetail };
        const selectedProcessNameOption =
          processStore.searchProcessNameOptions.find(
            (option) => option.value === processDetailForSave.processName
          );
        if (selectedProcessNameOption) {
          processDetailForSave.processName = selectedProcessNameOption.label;
        }

        // 공정심볼파일이 변경된 경우에만 siteFile 포함
        if (hasProcessSymbolChanged) {
          processDetailForSave.siteFile = symbolFile;
        } else {
          // 공정심볼파일이 변경되지 않은 경우 siteFile 제거
          delete processDetailForSave.siteFile;
        }

        await processStore.updateProcess(processId, processDetailForSave);

        // 업데이트 성공 후 선택된 파일 상태 초기화
        if (hasProcessSymbolChanged) {
          const updatedSelectedFiles = { ...processStore.selectedFiles };
          delete updatedSelectedFiles["processSymbol"];
          processStore.setSelectedFiles(updatedSelectedFiles);

          // processDetail에서 siteFile 제거
          processStore.setProcessDetail({
            siteFile: null,
          });

          console.log("업데이트 성공 후 파일 상태 초기화 완료");
        }
        console.log("기본 정보 업데이트 완료");
        
        // 공정심볼 파일 저장 후 process_master 정보 새로고침
        await processStore.searchProcessById(processId);
        // 새로고침된 symbolId로 미리보기 다시 로드
        const newSymbolId = processStore.processDetail.symbolId;
        if (newSymbolId && newSymbolId !== "00000000-0000-0000-0000-000000000000") {
          await processStore.loadProcessSymbolPreview();
        } else {
          // symbolId가 없거나 빈 UUID인 경우 미리보기 URL 해제
          processStore.clearProcessSymbolPreview();
        }
        
        alert("기본 정보가 저장되었습니다.");
      } catch (updateError: any) {
        console.error("기본 정보 업데이트 실패:", updateError);
        throw updateError;
      }
    } else {
      // 공정심볼 파일이 없는 경우 기본 정보만 저장
      try {
        console.log("기본 정보만 저장 시작");

        // 심볼 파일 삭제 처리
        if (isSymbolDeleted && originalSymbolId) {
          console.log("공정심볼 파일 삭제 API 호출:", originalSymbolId);
          try {
            // DELETE API 호출
            await processStore.deleteProcessSymbol(originalSymbolId);
            console.log("공정심볼 파일 삭제 성공");
          } catch (deleteError: any) {
            console.error("공정심볼 파일 삭제 실패:", deleteError);
            // 삭제 실패해도 계속 진행 (경고만 표시)
            alert(`공정심볼 파일 삭제에 실패했습니다: ${deleteError.message || deleteError}`);
          }
        }

        // processName을 label 값으로 변환하여 저장
        const processDetailForSave = { ...processStore.processDetail };
        const selectedProcessNameOption =
          processStore.searchProcessNameOptions.find(
            (option) => option.value === processDetailForSave.processName
          );
        if (selectedProcessNameOption) {
          processDetailForSave.processName = selectedProcessNameOption.label;
        }

        // 공정심볼파일이 변경되지 않은 경우 siteFile 제거
        delete processDetailForSave.siteFile;

        // 심볼 파일이 삭제된 경우 symbolId를 빈 UUID로 설정
        if (isSymbolDeleted) {
          processDetailForSave.symbolId = "00000000-0000-0000-0000-000000000000";
          processDetailForSave.processSymbol = "";
        }

        await processStore.updateProcess(processId, processDetailForSave);
        console.log("기본 정보 업데이트 완료");

        // 심볼 파일이 삭제된 경우 미리보기 URL 해제
        if (isSymbolDeleted) {
          processStore.clearProcessSymbolPreview();
          // processDetail에서도 symbolId 업데이트
          processStore.setProcessDetail({
            symbolId: "00000000-0000-0000-0000-000000000000",
            processSymbol: "",
          });
        }

        alert("기본 정보가 저장되었습니다.");

        // 기본 정보 저장 후 공정카드 데이터 로드
        await refreshPfdData();
        console.log("공정카드 데이터 로드 완료");
      } catch (updateError: any) {
        console.error("기본 정보 업데이트 실패:", updateError);
        throw updateError;
      }
    }
  } catch (error: any) {
    console.error("기본 정보 저장 실패:", error);
    throw error;
  }
};

// 메인 업데이트 함수
const handleUpdate = async () => {
  try {
    console.log("공정 수정 처리 시작");

    const processId = props.processId || (route.params.id as string);

    if (!processId) {
      throw new Error("공정 ID가 없습니다.");
    }

    let hasAnyChanges = false;

    // 공정심볼 파일 변경 감지
    const hasProcessSymbolChanged =
      processStore.selectedFiles["processSymbol"] !== undefined;
    if (hasProcessSymbolChanged) {
      hasAnyChanges = true;
      console.log("공정심볼 파일 변경 감지됨");

      // processDetail에 siteFile 추가
      const symbolFile = processStore.selectedFiles["processSymbol"];
      processStore.setProcessDetail({
        siteFile: symbolFile,
      });

      console.log("processDetail에 siteFile 설정:", symbolFile.name);
    }

    // 공정 정보 업데이트
    if (hasAnyChanges) {
      try {
        await processStore.updateProcess(processId, processStore.processDetail);

        // 업데이트 성공 후 선택된 파일 상태 초기화
        if (hasProcessSymbolChanged) {
          const updatedSelectedFiles = { ...processStore.selectedFiles };
          delete updatedSelectedFiles["processSymbol"];
          processStore.setSelectedFiles(updatedSelectedFiles);

          // processDetail에서 siteFile 제거
          processStore.setProcessDetail({
            siteFile: null,
          });

          console.log("업데이트 성공 후 파일 상태 초기화 완료");
        }
        console.log("공정 정보 업데이트 완료");
      } catch (updateError: any) {
        console.error("공정 정보 업데이트 실패:", updateError);
        throw updateError;
      }
    }

    // 계산식 그리드 처리
    console.log("=== 계산식 삭제 감지 시작 ===");
    console.log("initialFormulaList 존재:", !!processStore.initialFormulaList);
    console.log("formulaList 존재:", !!processStore.formulaList);
    console.log(
      "initialFormulaList 길이:",
      processStore.initialFormulaList?.length || 0
    );
    console.log("formulaList 길이:", processStore.formulaList?.length || 0);

    if (processStore.initialFormulaList && processStore.formulaList) {
      // 모든 삭제된 항목들 감지
      const allDeletedRows = processStore.initialFormulaList.filter(
        (initialItem) => {
          console.log("초기 항목 확인:", {
            id: initialItem.id,
            formula_id: initialItem.formula_id,
            registeredFormula: initialItem.registeredFormula,
          });

          // formula_id가 있는 경우 formula_id로 비교
          if (initialItem.formula_id) {
            const exists = processStore.formulaList.some(
              (currentItem) =>
                currentItem.formula_id &&
                currentItem.formula_id === initialItem.formula_id
            );
            console.log("formula_id로 비교 - 존재 여부:", exists);
            return !exists;
          }
          // formula_id가 없는 경우 id로 비교
          const exists = processStore.formulaList.some(
            (currentItem) => currentItem.id === initialItem.id
          );
          console.log("id로 비교 - 존재 여부:", exists);
          return !exists;
        }
      );

      console.log("감지된 삭제된 항목 수:", allDeletedRows.length);

      // 서버에서 삭제해야 하는 항목들
      // 1. formula_id가 있는 항목
      // 2. existing_formula_ 접두사가 있는 항목 (서버에서 가져온 기존 데이터)
      const deletedRows = allDeletedRows.filter((item) => {
        if (item.formula_id) {
          return true; // formula_id가 있으면 서버 삭제 대상
        }
        if (item.id && item.id.startsWith("existing_formula_")) {
          return true; // existing_formula_ 접두사가 있으면 서버 삭제 대상
        }
        return false;
      });

      // 로컬에서만 삭제된 항목들 (새로 추가된 항목)
      const locallyDeletedRows = allDeletedRows.filter((item) => {
        if (item.formula_id) {
          return false; // formula_id가 있으면 서버 삭제 대상
        }
        if (item.id && item.id.startsWith("existing_formula_")) {
          return false; // existing_formula_ 접두사가 있으면 서버 삭제 대상
        }
        return true; // 그 외는 로컬 삭제 대상
      });

      const addedRows = processStore.formulaList.filter((currentItem) => {
        // 새로 추가된 행은 id가 'formula_'로 시작하고 formula_id가 없는 경우
        if (currentItem.id.startsWith("formula_") && !currentItem.formula_id) {
          return true;
        }
        // 기존 행이지만 formula_id가 있고 initialFormulaList에 없는 경우
        return (
          currentItem.formula_id &&
          !processStore.initialFormulaList.some(
            (initialItem) =>
              initialItem.formula_id &&
              initialItem.formula_id === currentItem.formula_id
          )
        );
      });

      console.log("계산식 변경사항 확인:", {
        allDeletedRows: allDeletedRows.length,
        deletedRows: deletedRows.length,
        locallyDeletedRows: locallyDeletedRows.length,
        addedRows: addedRows.length,
        initialCount: processStore.initialFormulaList.length,
        currentCount: processStore.formulaList.length,
      });

      console.log(
        "모든 삭제된 행 상세 정보:",
        allDeletedRows.map((item) => ({
          id: item.id,
          formula_id: item.formula_id,
          registeredFormula: item.registeredFormula,
          hasFormulaId: !!item.formula_id,
          전체객체: item,
        }))
      );

      console.log(
        "서버에서 삭제할 행 상세 정보:",
        deletedRows.map((item) => ({
          id: item.id,
          formula_id: item.formula_id,
          registeredFormula: item.registeredFormula,
          hasFormulaId: !!item.formula_id,
        }))
      );

      console.log("로컬에서 삭제된 항목 수:", locallyDeletedRows.length);
      console.log(
        "로컬에서 삭제된 항목들:",
        locallyDeletedRows.map((item) => ({
          id: item.id,
          formula_id: item.formula_id,
        }))
      );

      // 상세 디버깅을 위한 로그
      console.log(
        "초기 계산식 데이터:",
        processStore.initialFormulaList.map((item) => ({
          id: item.id,
          formula_id: item.formula_id,
          registeredFormula: item.registeredFormula,
        }))
      );

      console.log(
        "현재 계산식 데이터:",
        processStore.formulaList.map((item) => ({
          id: item.id,
          formula_id: item.formula_id,
          registeredFormula: item.registeredFormula,
        }))
      );

      console.log("=== 계산식 삭제 감지 완료 ===");

      if (
        deletedRows.length > 0 ||
        locallyDeletedRows.length > 0 ||
        addedRows.length > 0
      ) {
        hasAnyChanges = true;

        // 삭제된 행 처리
        if (deletedRows.length > 0) {
          try {
            console.log("=== 계산식 삭제 API 호출 시작 ===");
            console.log("삭제할 항목 수:", deletedRows.length);
            console.log(
              "삭제할 항목들:",
              deletedRows.map((item) => ({
                id: item.id,
                formula_id: item.formula_id,
                registeredFormula: item.registeredFormula,
              }))
            );

            const deletePromises = deletedRows.map((row, index) => {
              // formula_id가 있으면 사용, 없으면 id에서 추출
              let formulaId = row.formula_id;
              if (
                !formulaId &&
                row.id &&
                row.id.startsWith("existing_formula_")
              ) {
                // existing_formula_123 형태에서 123 추출
                formulaId = row.id.replace("existing_formula_", "");
              }

              console.log(
                `[${index + 1}/${
                  deletedRows.length
                }] 계산식 삭제 API 호출 시작:`,
                {
                  id: row.id,
                  formula_id: row.formula_id,
                  extracted_formula_id: formulaId,
                  registeredFormula: row.registeredFormula,
                }
              );

              if (!formulaId) {
                console.error("삭제할 formula_id를 찾을 수 없습니다:", row);
                return Promise.reject(
                  new Error("삭제할 formula_id를 찾을 수 없습니다")
                );
              }

              return deleteFormulaAPI(formulaId);
            });

            console.log("삭제 API 호출 대기 중...");
            const results = await Promise.all(deletePromises);
            console.log("=== 계산식 삭제 API 호출 완료 ===");
            console.log("삭제 결과:", results);
          } catch (error) {
            console.error("=== 계산식 삭제 실패 ===", error);
          }
        } else {
          console.log("서버에서 삭제할 계산식 항목이 없습니다.");
        }

        // 로컬에서 삭제된 항목들 처리
        if (locallyDeletedRows.length > 0) {
          console.log(
            "로컬에서 삭제된 계산식 항목 수:",
            locallyDeletedRows.length
          );
          console.log(
            "로컬에서 삭제된 항목들은 서버 삭제가 필요하지 않습니다."
          );
        }

        // 추가된 행 처리
        if (addedRows.length > 0) {
          try {
            const formulaPromises = addedRows.map((formula) =>
              createFormulaAPI(
                processId,
                formula.registeredFormula,
                formula.formula_code || "",
                (formula as any)._file
              )
            );
            await Promise.all(formulaPromises);
            console.log("추가된 계산식 처리 완료");

            // 저장된 계산식의 isSaved 상태를 true로 업데이트
            const updatedFormulaList = processStore.formulaList.map((item) => {
              if (addedRows.some((addedRow) => addedRow.id === item.id)) {
                return { ...item, isSaved: true };
              }
              return item;
            });
            processStore.setFormulaList(updatedFormulaList);
            console.log("계산식 저장 상태 업데이트 완료");
          } catch (error) {
            console.error("계산식 추가 실패:", error);
          }
        }
      }
    } else {
      console.log("=== 계산식 삭제 감지 실패 ===");
      console.log("initialFormulaList 또는 formulaList가 없습니다.");
      console.log("initialFormulaList:", processStore.initialFormulaList);
      console.log("formulaList:", processStore.formulaList);
    }

    // PFD 그리드 처리
    if (processStore.initialPfdList && processStore.pfdList) {
      const deletedPfdRows = processStore.initialPfdList.filter(
        (initialItem) => {
          if (!initialItem.drawing_id) return false;
          return !processStore.pfdList.some(
            (currentItem) =>
              currentItem.drawing_id &&
              currentItem.drawing_id === initialItem.drawing_id
          );
        }
      );

      const addedPfdRows = processStore.pfdList.filter((currentItem) => {
        // 새로 추가된 행은 id가 'pfd_'로 시작하고 drawing_id가 임시 ID인 경우
        if (
          currentItem.id.startsWith("pfd_") &&
          currentItem.drawing_id?.startsWith("temp_pfd_drawing_")
        ) {
          return true;
        }
        // 기존 행이지만 drawing_id가 있고 initialPfdList에 없는 경우
        if (!currentItem.drawing_id) return false;
        return !processStore.initialPfdList.some(
          (initialItem) =>
            initialItem.drawing_id &&
            initialItem.drawing_id === currentItem.drawing_id
        );
      });

      console.log("PFD 변경사항 확인:", {
        deletedRows: deletedPfdRows.length,
        addedRows: addedPfdRows.length,
        initialCount: processStore.initialPfdList.length,
        currentCount: processStore.pfdList.length,
      });

      if (deletedPfdRows.length > 0 || addedPfdRows.length > 0) {
        hasAnyChanges = true;

        // 삭제된 행 처리
        if (deletedPfdRows.length > 0) {
          try {
            const deletePromises = deletedPfdRows.map(async (row) => {
              if (!row.drawing_id) return null;

              try {
                const response = await request(
                  `/api/process/drawing/delete/${row.drawing_id}`,
                  {},
                  {
                    method: "DELETE",
                    headers: {
                      user_Id: localStorage.getItem("authUserId") || "",
                      wai_lang: localStorage.getItem("wai_lang") || "ko",
                    },
                  }
                );

                if (!response.success) {
                  // 404 Not Found 오류인 경우 무시하고 계속 진행
                  if (
                    response.status === 404 ||
                    response.message?.includes("not found")
                  ) {
                    console.warn(
                      `PFD 삭제 건너뛰기 - ID가 존재하지 않음: ${row.drawing_id}`
                    );
                    return {
                      success: true,
                      drawing_id: row.drawing_id,
                      skipped: true,
                    };
                  }
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                return { success: true, drawing_id: row.drawing_id };
              } catch (deleteError: any) {
                // 404 오류나 "not found" 메시지가 포함된 경우 무시
                if (
                  deleteError.message?.includes("not found") ||
                  deleteError.message?.includes("404") ||
                  (deleteError.message?.includes("DrawingMasters with ID") &&
                    deleteError.message?.includes("not found"))
                ) {
                  console.warn(
                    `PFD 삭제 건너뛰기 - ID가 존재하지 않음: ${row.drawing_id}`
                  );
                  return {
                    success: true,
                    drawing_id: row.drawing_id,
                    skipped: true,
                  };
                }
                throw deleteError;
              }
            });

            const results = await Promise.all(deletePromises);
            const successfulDeletes = results.filter(
              (r) => r && r.success && !r.skipped
            );
            const skippedDeletes = results.filter((r) => r && r.skipped);

            console.log(
              `삭제된 PFD 처리 완료: ${successfulDeletes.length}개 삭제, ${skippedDeletes.length}개 건너뛰기`
            );
          } catch (error) {
            console.error("PFD 삭제 실패:", error);
            // 개별 삭제 실패는 전체 프로세스를 중단시키지 않음
          }
        }

        // 추가된 행 처리
        if (addedPfdRows.length > 0) {
          try {
            for (const pfdItem of addedPfdRows) {
              if (!pfdItem._file) continue;

              const formData = new FormData();

              // drawingData Map에 담을 데이터 객체 생성
              // drawingData를 개별 필드로 FormData에 추가
              formData.append("process_id", parseInt(processId, 10).toString());
              formData.append("drawing_type", "PFDCARD");
              formData.append("remarks", pfdItem.remarks || "");

              // 파일을 직접 FormData에 추가
              formData.append("siteFile", pfdItem._file);

              // FormData 디버깅
              console.log("PFD FormData 내용:");
              console.log("process_id:", parseInt(processId, 10).toString());
              console.log("drawing_type:", "PFDCARD");
              console.log("remarks:", pfdItem.remarks || "");
              console.log("siteFile:", pfdItem._file.name);
              console.log("file size:", pfdItem._file.size);
              console.log(
                "file type:",
                pfdItem._file.type || "application/octet-stream"
              );

              // 파일 크기 검증 (10MB 제한)
              const maxFileSize = 10 * 1024 * 1024; // 10MB
              if (pfdItem._file && pfdItem._file.size > maxFileSize) {
                throw new Error(
                  `파일 크기가 너무 큽니다. 최대 ${
                    maxFileSize / (1024 * 1024)
                  }MB까지 업로드 가능합니다.`
                );
              }

              console.log("PFD 파일 업로드 시작:", {
                fileName: pfdItem._file.name,
                fileSize: pfdItem._file.size,
                fileSizeMB:
                  (pfdItem._file.size / (1024 * 1024)).toFixed(2) + "MB",
                fileType: pfdItem._file.type || "application/octet-stream", // DWG 파일 타입 설정
              });

              // 사용자에게 업로드 시작 알림
              if (pfdItem._file.size > 1024 * 1024) {
                // 1MB 이상인 경우
                console.log(
                  `대용량 파일 업로드 중... (${(
                    pfdItem._file.size /
                    (1024 * 1024)
                  ).toFixed(2)}MB)`
                );
              }

              // FormData entries 확인
              for (let [key, value] of (formData as any).entries()) {
                console.log(`${key}:`, value);
              }

              console.log("PFD API 호출 시작...");

              // 타임아웃 설정 (10분)
              const controller = new AbortController();
              const timeoutId = setTimeout(() => {
                controller.abort();
                console.error("PFD API 호출 타임아웃 (10분)");
              }, 10 * 60 * 1000);

              try {
                const response = await request(
                  "/api/process/drawing/create",
                  undefined,
                  {
                    method: "POST",
                    body: formData,
                    signal: controller.signal,
                    // headers는 request.ts에서 자동으로 설정됨 (FormData일 때 Content-Type 자동 설정)
                  }
                );

                clearTimeout(timeoutId);
                console.log("PFD API 호출 완료:", response);

                if (!response.success) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const responseData = response;
                console.log("PFD 도면 생성 API 응답:", responseData);

                // drawing_id 추출 (여러 가능한 경로 확인)
                let drawingId =
                  responseData.response?.drawing_id ||
                  responseData.response?.data?.drawing_id ||
                  responseData.response?.id ||
                  responseData.drawing_id ||
                  responseData.id;

                console.log("PFD 모달 업로드 - 추출된 drawing_id:", drawingId);
                console.log("PFD 모달 업로드 - API 응답 구조:", {
                  response: responseData.response,
                  data: responseData.response?.data,
                  directResponse: responseData,
                });

                if (drawingId) {
                  const updatedPfdList = processStore.pfdList.map((item) => {
                    if (item.id === pfdItem.id) {
                      return {
                        ...item,
                        drawing_id: drawingId,
                        hasPidMapping: false, // 초기값은 false로 설정
                      };
                    }
                    return item;
                  });
                  processStore.setPfdList(updatedPfdList);

                  console.log(
                    "✅ PFD 모달 업로드 - drawing_id 업데이트 완료:",
                    {
                      itemId: pfdItem.id,
                      oldDrawingId: pfdItem.drawing_id,
                      newDrawingId: drawingId,
                    }
                  );

                  // 업데이트된 drawing_id 유효성 검증
                  const updatedItem = processStore.pfdList.find(
                    (item) => item.id === pfdItem.id
                  );
                  if (updatedItem && updatedItem.drawing_id === drawingId) {
                    console.log(
                      "✅ PFD 모달 업로드 - drawing_id 업데이트 검증 성공"
                    );
                  } else {
                    console.error(
                      "❌ PFD 모달 업로드 - drawing_id 업데이트 검증 실패:",
                      {
                        expectedDrawingId: drawingId,
                        actualDrawingId: updatedItem?.drawing_id,
                      }
                    );
                  }

                  // PFD 저장 후 그리드 새로고침
                  await refreshPfdData();
                } else {
                  console.error("❌ PFD 모달 업로드 - drawing_id 추출 실패:", {
                    itemId: pfdItem.id,
                    responseData: responseData,
                  });

                  // drawing_id가 없어도 그리드 새로고침은 수행
                  await refreshPfdData();
                }
              } catch (apiError: any) {
                clearTimeout(timeoutId);

                if (apiError.name === "AbortError") {
                  throw new Error(
                    "파일 업로드 시간이 초과되었습니다. 파일 크기를 확인해주세요."
                  );
                }

                console.error("PFD API 호출 실패:", apiError);
                throw apiError;
              }
            }
            console.log("추가된 PFD 처리 완료");
          } catch (error: any) {
            console.error("PFD 추가 실패:", error);

            // 구체적인 에러 메시지 표시
            let errorMessage = "PFD 파일 업로드에 실패했습니다.";
            if (error.message) {
              if (error.message.includes("Failed to fetch")) {
                errorMessage =
                  "서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.";
              } else if (error.message.includes("파일 크기가 너무 큽니다")) {
                errorMessage = error.message;
              } else if (error.message.includes("timeout")) {
                errorMessage =
                  "파일 업로드 시간이 초과되었습니다. 파일 크기를 확인해주세요.";
              } else {
                errorMessage = error.message;
              }
            }

            alert(errorMessage);
            throw error; // 에러를 다시 throw하여 상위에서 처리할 수 있도록 함
          }
        }
      }
    }

    if (hasAnyChanges) {
      alert("공정 수정이 완료되었습니다.");
      emit("update-success");
    } else {
      alert("변경사항이 없습니다.");
    }
  } catch (error: any) {
    console.error("공정 수정 실패:", error);
    alert(`공정 수정 실패: ${error.message}`);
  }
};
// P&ID 매핑 모달 관련 함수들
const openMappingPidModal = async (pfdItem: any) => {
  console.log("P&ID 목록 표시:", pfdItem);
  console.log("PFD 아이템 drawing_id:", pfdItem.drawing_id);
  console.log("PFD 아이템 id:", pfdItem.id);
  console.log("PFD 아이템 모든 키:", Object.keys(pfdItem));

  // 해당 row 선택
  selectedPfdItems.value = pfdItem;

  // PFD drawing_id 확인
  if (!pfdItem.drawing_id) {
    alert(
      "P&ID 매핑을 위해서는 먼저 PFD 파일을 저장해야 합니다.\n메인 저장 버튼을 클릭하여 PFD를 저장한 후 다시 시도해주세요."
    );
    return;
  }

  // 임시 ID인 경우 P&ID 매핑을 허용하지 않음
  if (pfdItem.drawing_id.startsWith("temp_pfd_drawing_")) {
    console.warn("PFD drawing_id가 임시 ID입니다:", pfdItem.drawing_id);
    alert(
      "P&ID 매핑을 위해서는 먼저 PFD 파일을 저장해야 합니다.\n공정카드 저장 버튼을 클릭하여 PFD를 저장한 후 다시 시도해주세요."
    );
    return;
  }

  // P&ID 창이 다시 열릴 때 'P&ID Components' 섹션은 유지 (DIV 닫히는 현상 방지)
  if (showPidComponentSection.value) {
    console.log(
      "P&ID Components 섹션이 열려있지만 유지합니다 (DIV 닫히는 현상 방지)"
    );
  }

  currentPfdItemForMapping.value = pfdItem;
  selectedMappingPidItems.value = []; // 선택된 항목들 초기화
  showPidListInMain.value = true; // 메인화면에 표시

  // P&ID 목록 데이터 로드 - drawing_id를 parent_drawing_id로 전달
  await loadMappingPidList(pfdItem);

  // P&ID 목록 데이터가 없는 경우에도 P&ID Components 섹션은 유지 (DIV 닫히는 현상 방지)
  if (mappingPidList.value.length === 0) {
    console.log(
      "P&ID 목록 데이터가 없지만 P&ID Components 섹션은 유지합니다 (DIV 닫히는 현상 방지)"
    );
  }
};

// P&ID 목록 메인화면 닫기
const closePidListInMain = () => {
  // 변경사항 확인 (P&ID와 공정카드 모두 확인)
  if (hasMappingPidChanges() || hasPfdChanges()) {
    if (!confirm("수정사항이 있습니다. 창을 닫으시겠습니까?")) {
      return;
    }
  }

  showPidListInMain.value = false;
  currentPfdItemForMapping.value = null;
  mappingPidList.value = [];
  selectedMappingPidItems.value = [];
  initialMappingPidList.value = [];

  // P&ID Components 설정도 함께 닫기
  showPidComponentSection.value = false;
  selectedPidForComponent.value = null;
  pidComponentList.value = [];
  selectedPidComponentItems.value = [];
  currentDrawingId.value = ""; // drawing_id 초기화
  initialPidComponentList.value = []; // 초기 상태 초기화
};

// P&ID 매핑 폼 초기화 함수
const resetMappingPidForm = async () => {
  // 그리드 데이터 초기화
  mappingPidList.value = [];
  selectedMappingPidItems.value = [];
  initialMappingPidList.value = []; // 초기값도 초기화

  // 파일 입력 초기화
  if (pidFileInput.value) {
    pidFileInput.value.value = "";
  }
  if (excelFileInput.value) {
    excelFileInput.value.value = "";
  }

  // PFD 탭 그리드 새로고침
  await refreshPfdData();

  console.log("P&ID 매핑 폼 초기화 완료");
};

// PFD의 P&ID 매핑 정보 확인 및 업데이트 함수
const updatePfdPidMappingInfo = async (
  drawingId: string,
  pfdItemId: string
) => {
  try {
    console.log("P&ID 매핑 정보 확인 시작:", { drawingId, pfdItemId });

    // P&ID 도면 검색 API 호출
    const response = await request(
      "/api/process/drawing_child/search",
      {},
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          search_field: "drawing_id",
          search_value: drawingId,
          order_by: "created_at",
        }),
      }
    );

    if (
      response.success &&
      response.response &&
      Array.isArray(response.response)
    ) {
      const hasPidMapping = response.response.length > 0;
      console.log("P&ID 매핑 정보 확인 결과:", {
        drawingId,
        hasPidMapping,
        count: response.response.length,
      });

      // PFD 리스트에서 해당 아이템의 hasPidMapping 업데이트
      const updatedPfdList = processStore.pfdList.map((item) => {
        if (item.id === pfdItemId) {
          return { ...item, hasPidMapping };
        }
        return item;
      });
      processStore.setPfdList(updatedPfdList);

      console.log("PFD P&ID 매핑 정보 업데이트 완료:", hasPidMapping);
    } else {
      console.log("P&ID 매핑 정보 없음 또는 API 오류");
    }
  } catch (error) {
    console.error("P&ID 매핑 정보 확인 실패:", error);
  }
};

// PFD 데이터 새로고침 함수
const refreshPfdData = async () => {
  try {
    let processId: string;

    if (props.isRegisterMode) {
      // 공정 등록 모드일 때는 생성된 공정 ID 사용
      if (!createdProcessId.value) {
        console.warn(
          "공정이 등록되지 않아서 PFD 데이터 새로고침을 건너뜁니다."
        );
        return;
      }
      processId = createdProcessId.value;
    } else {
      // 공정 상세 모드일 때는 기존 로직 사용
      processId = props.processId || (route.params.id as string);
    }

    const pfdDrawingsData = await searchPfdDrawingAPI(processId);

    if (pfdDrawingsData && Array.isArray(pfdDrawingsData)) {
      const pfdItems = await Promise.all(
        pfdDrawingsData.map(async (item: any, index: number) => {
          const drawingId =
            item.drawing_id || item.id || `pfd_drawing_${index + 1}`;

          // P&ID 매핑 정보 확인
          let hasPidMapping = false;
          if (drawingId && !drawingId.startsWith("temp_")) {
            try {
              const pidResponse = await request(
                "/api/process/drawing_child/search",
                {},
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                  body: JSON.stringify({
                    search_field: "drawing_id",
                    search_value: drawingId,
                    order_by: "created_at",
                  }),
                }
              );

              if (
                pidResponse.success &&
                pidResponse.response &&
                Array.isArray(pidResponse.response)
              ) {
                hasPidMapping = pidResponse.response.length > 0;
              }
            } catch (error) {
              console.warn("P&ID 매핑 정보 확인 실패:", error);
            }
          }

          // 등록일자: 기존 registrationDate가 있으면 사용, 없으면 API 응답의 created_at 사용
          const registrationDate = item.registrationDate 
            || item.created_at 
            || item.current_file?.created_at 
            || null;

          return {
            id: `pfd_${index + 1}`,
            no: index + 1,
            pfdFileName: item.current_file?.file_name || item.pfdFileName || "",
            registrationDate: registrationDate,
            mappingPidList: "",
            remarks: item.remarks || "",
            drawing_id: drawingId,
            hasPidMapping,
            symbol_id: item.symbol_id || item.symbolId || null,
            symbol_uri: item.symbol_uri || item.symbolUri || null,
          };
        })
      );

      processStore.setPfdList(pfdItems);
      const initialPfdData = JSON.parse(JSON.stringify(pfdItems));
      processStore.setInitialPfdList(initialPfdData);
    } else {
      processStore.setPfdList([]);
      processStore.setInitialPfdList([]);
    }
  } catch (error) {
    console.error("PFD 데이터 새로고침 실패:", error);
  }
};

// 계산식 데이터 새로고침 함수
const refreshFormulaData = async () => {
  try {
    console.log("계산식 데이터 새로고침 시작...");

    const formulaResult = await searchFormulaAPI();

    if (
      formulaResult &&
      formulaResult.response &&
      Array.isArray(formulaResult.response)
    ) {
      console.log("계산식 API 응답 데이터:", formulaResult.response);

      const formulaItems = formulaResult.response.map(
        (item: any, index: number) => {
          return {
            id: `existing_formula_${item.id || index}`,
            no: (index + 1).toString(),
            file_name: item.file_name || "NONE",
            formula_code: item.formula_code || "",
            registrationDate:
              item.created_at ||
              item.registration_date ||
              formatDate(new Date()),
            infoOverview: item.formula_scope || "",
            remarks: item.output_type || "",
            formula_id: item.formula_id || item.id,
            process_dependencies: item.process_dependencies || null,
            _originalData: item, // 원본 데이터 보존
          };
        }
      );

      processStore.setFormulaList(formulaItems);
      const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
      processStore.setInitialFormulaList(initialFormulaData);

      console.log("계산식 데이터 새로고침 완료:", formulaItems.length, "개");
    } else {
      console.log("계산식 데이터가 없습니다.");
      processStore.setFormulaList([]);
      processStore.setInitialFormulaList([]);
    }
  } catch (error) {
    console.error("계산식 데이터 새로고침 실패:", error);
  }
};
const confirmMappingPid = async () => {
  try {
    console.log("P&ID 매핑 확인:", mappingPidList.value);
    console.log("현재 PFD 아이템:", currentPfdItemForMapping.value);
    console.log("초기 P&ID 목록:", initialMappingPidList.value);
    console.log("초기 목록 개수:", initialMappingPidList.value.length);
    console.log("현재 목록 개수:", mappingPidList.value.length);

    // 각 항목의 상세 정보 출력
    console.log("=== 초기 목록 상세 정보 ===");
    initialMappingPidList.value.forEach((item, index) => {
      console.log(`초기 항목 ${index + 1}:`, {
        drawing_id: item.drawing_id,
        pidFileName: item.pidFileName,
        hasPidFile: !!(item as any).pidFile,
        hasSvgFile: !!(item as any).svgFile,
        pidFileObject: (item as any).pidFile,
        svgFileObject: (item as any).svgFile,
        allKeys: Object.keys(item),
      });
    });

    console.log("=== 현재 목록 상세 정보 ===");
    mappingPidList.value.forEach((item, index) => {
      console.log(`현재 항목 ${index + 1}:`, {
        drawing_id: item.drawing_id,
        pidFileName: item.pidFileName,
        hasPidFile: !!(item as any).pidFile,
        hasSvgFile: !!(item as any).svgFile,
        pidFileObject: (item as any).pidFile,
        svgFileObject: (item as any).svgFile,
        allKeys: Object.keys(item),
      });
    });

    // process_id 설정
    let processId: string;

    if (props.isRegisterMode) {
      // 공정 등록 모드일 때는 생성된 공정 ID 사용
      if (!createdProcessId.value) {
        alert("공정이 등록되지 않았습니다. 먼저 기본정보를 등록해주세요.");
        return;
      }
      processId = createdProcessId.value;
      console.log("공정 등록 모드 - 생성된 공정 ID 사용:", processId);
    } else {
      // 공정 상세 모드일 때는 기존 로직 사용
      processId = props.processId || (route.params.id as string);
      if (!processId) {
        alert("공정 ID가 없습니다.");
        return;
      }
    }

    // 삭제된 row 찾기 (초기값에는 있지만 현재 목록에는 없는 항목들)
    const deletedRows = initialMappingPidList.value.filter((initialItem) => {
      // drawing_id가 있거나, drawing_id가 없어도 pidFileName이 있는 항목은 삭제 대상으로 간주
      if (!initialItem.drawing_id && !initialItem.pidFileName) return false;

      return !mappingPidList.value.some((currentItem) => {
        // drawing_id가 있는 경우 drawing_id로 비교
        if (initialItem.drawing_id && currentItem.drawing_id) {
          return currentItem.drawing_id === initialItem.drawing_id;
        }
        // drawing_id가 없는 경우 pidFileName으로 비교
        return currentItem.pidFileName === initialItem.pidFileName;
      });
    });

    console.log("삭제된 P&ID row들:", deletedRows);

    // 새로 추가된 항목들과 파일이 변경된 기존 항목들 필터링
    const validMappings = mappingPidList.value.filter((item) => {
      const isNewItem = !item.drawing_id;
      const hasPidFile = !!(item as any).pidFile;
      const hasSvgFile = !!(item as any).svgFile;
      const hasAnyFile = hasPidFile || hasSvgFile;

      console.log(`항목 필터링 체크 - ${item.pidFileName || "no name"}:`, {
        drawing_id: item.drawing_id,
        isNewItem,
        hasPidFile,
        hasSvgFile,
        hasAnyFile,
        pidFileObject: (item as any).pidFile,
        svgFileObject: (item as any).svgFile,
      });

      // 새로 추가된 항목인 경우
      if (isNewItem && hasAnyFile) {
        console.log(`✅ 새 항목으로 선택됨: ${item.pidFileName || "no name"}`);
        return true;
      }

      // 기존 항목에서 파일이 변경된 경우 감지
      if (!isNewItem) {
        const initialItem = initialMappingPidList.value.find(
          (initialItem) =>
            initialItem.drawing_id && initialItem.drawing_id === item.drawing_id
        );

        if (initialItem) {
          // P&ID 파일 변경 감지
          const currentPidFile = (item as any).pidFile;
          const initialPidFile = (initialItem as any)?.pidFile;
          const pidFileChanged =
            currentPidFile &&
            (!initialPidFile || currentPidFile.name !== initialPidFile?.name);

          // Excel 파일 변경 감지 (더 정확한 로직)
          const currentExcelFile = (item as any).excelFile;
          const initialExcelFile = (initialItem as any)?.excelFile;
          // Excel 파일이 새로 선택되었거나, 기존 파일과 다른 파일로 변경된 경우만 변경으로 감지
          const excelFileChanged =
            currentExcelFile &&
            (!initialExcelFile ||
              currentExcelFile.name !== initialExcelFile?.name);

          // Excel 파일명 변경 감지 (파일 객체가 없어도 파일명이 변경된 경우)
          const currentExcelFileName =
            item.excelFileName || item.excel_file_name;
          const initialExcelFileName =
            initialItem.excelFileName || initialItem.excel_file_name;
          // 파일명이 실제로 변경된 경우만 변경으로 감지 (빈 문자열과 undefined는 동일하게 처리)
          const excelFileNameChanged =
            (currentExcelFileName || "") !== (initialExcelFileName || "");

          // Svg 파일 변경 감지
          const currentSvgFile = (item as any).svgFile;
          const initialSvgFile = (initialItem as any)?.svgFile;
          // SVG 파일이 새로 선택되었거나, 기존 파일과 다른 파일로 변경된 경우만 변경으로 감지
          const svgFileChanged =
            (currentSvgFile &&
              (!initialSvgFile ||
                currentSvgFile.name !== initialSvgFile?.name)) ||
            (!currentSvgFile && initialSvgFile);

          // Svg 파일명 변경 감지 (파일 객체가 없어도 파일명이 변경된 경우)
          const currentSvgFileName = item.svgFileName || item.svg_file_name;
          const initialSvgFileName =
            initialItem.svgFileName || initialItem.svg_file_name;
          // 파일명이 실제로 변경된 경우만 변경으로 감지 (빈 문자열과 undefined는 동일하게 처리)
          const svgFileNameChanged =
            (currentSvgFileName || "") !== (initialSvgFileName || "");

          // 실제 파일 변경 여부 확인 (파일 객체나 파일명 중 하나라도 변경된 경우)
          const actualExcelFileChanged =
            excelFileChanged || excelFileNameChanged;
          const actualSvgFileChanged = svgFileChanged || svgFileNameChanged;

          const hasFileChanges =
            pidFileChanged || actualExcelFileChanged || actualSvgFileChanged;

          console.log(
            `기존 항목 변경사항 체크 - ${item.pidFileName || "no name"}:`,
            {
              drawing_id: item.drawing_id,
              pidFileChanged,
              excelFileChanged,
              excelFileNameChanged,
              actualExcelFileChanged,
              svgFileChanged,
              svgFileNameChanged,
              actualSvgFileChanged,
              hasFileChanges,
            }
          );

          return hasFileChanges;
        }
      }

      console.log(`항목 체크 - ${item.pidFileName || "no name"}:`, {
        isNewItem,
        hasPidFile,
        hasSvgFile,
        hasAnyFile,
        shouldInclude: false,
        drawing_id: item.drawing_id,
      });

      return false;
    });

    console.log("새로 추가된 P&ID 항목들:", validMappings);

    // 1. 삭제 처리
    if (deletedRows.length > 0) {
      console.log(`삭제할 P&ID 항목 ${deletedRows.length}개 처리 시작`);

      try {
        const deletePromises = deletedRows.map(async (row) => {
          console.log("삭제 대상 항목 확인:", {
            row: row,
            drawing_id: row.drawing_id,
            pidFileName: row.pidFileName,
            hasDrawingId: !!row.drawing_id,
          });

          if (!row.drawing_id) {
            console.log("drawing_id가 없어서 삭제 건너뛰기:", row);
            return null;
          }

          try {
            await deletePidDrawingAPI(row.drawing_id);
            console.log(`P&ID 삭제 성공 - drawing_id: ${row.drawing_id}`);
            return { success: true, drawing_id: row.drawing_id };
          } catch (deleteError: any) {
            // 404 오류나 "not found" 메시지가 포함된 경우 무시
            if (
              deleteError.message?.includes("not found") ||
              deleteError.message?.includes("404") ||
              (deleteError.message?.includes("DrawingMasters with ID") &&
                deleteError.message?.includes("not found"))
            ) {
              console.warn(
                `P&ID 삭제 건너뛰기 - ID가 존재하지 않음: ${row.drawing_id}`
              );
              return {
                success: true,
                drawing_id: row.drawing_id,
                skipped: true,
              };
            }
            throw deleteError;
          }
        });

        const results = await Promise.all(deletePromises);
        const successfulDeletes = results.filter(
          (r) => r && r.success && !r.skipped
        );
        const skippedDeletes = results.filter((r) => r && r.skipped);

        console.log(
          `P&ID 삭제 처리 완료: ${successfulDeletes.length}개 삭제, ${skippedDeletes.length}개 건너뛰기`
        );

        // 삭제된 P&ID 중에 현재 열린 P&ID Components와 연관된 것이 있는지 확인
        if (showPidComponentSection.value && selectedPidForComponent.value) {
          const deletedDrawingIds = deletedRows
            .map((row) => row.drawing_id)
            .filter(Boolean);
          const currentComponentDrawingId =
            selectedPidForComponent.value.drawing_id ||
            pidComponentDrawingId.value;

          if (deletedDrawingIds.includes(currentComponentDrawingId)) {
            console.log(
              "삭제된 P&ID와 연관된 P&ID Components 섹션 닫기:",
              currentComponentDrawingId
            );
            closePidComponentSection();
          }
        }
      } catch (error) {
        console.error("P&ID 삭제 실패:", error);
        // 개별 삭제 실패는 전체 프로세스를 중단시키지 않음
      }
    }

    // 2. 삭제만 수행하는 경우 처리
    console.log("조건 확인:", {
      deletedRowsLength: deletedRows.length,
      validMappingsLength: validMappings.length,
      shouldDeleteOnly: deletedRows.length > 0 && validMappings.length === 0,
    });

    // 삭제만 수행하는 경우 (삭제할 항목이 있고, 저장할 새 데이터가 없는 경우)
    if (deletedRows.length > 0 && validMappings.length === 0) {
      alert("P&ID 매핑이 저장되었습니다.");
      // 공정카드 그리드 새로고침 (P&ID 버튼 상태 업데이트를 위해)
      await refreshPfdData();

      // P&ID 삭제 완료 후 그리드 상태 업데이트 (데이터 유지, DIV는 열린 상태 유지)
      console.log(
        "=== P&ID 삭제 완료 - 그리드 상태 업데이트 시작 (데이터 유지, DIV 열린 상태 유지) ==="
      );
      if (currentPfdItemForMapping.value) {
        console.log("현재 PFD 아이템:", {
          id: currentPfdItemForMapping.value.id,
          drawing_id: currentPfdItemForMapping.value.drawing_id,
          pfdFileName: currentPfdItemForMapping.value.pfdFileName,
        });

        // P&ID 삭제 성공 후 초기값 업데이트 (그리드 데이터는 유지)
        console.log("1단계: P&ID 삭제 성공 후 초기값 업데이트");

        // 현재 그리드 데이터를 초기값으로 설정 (삭제된 상태를 반영)
        console.log("2단계: 현재 그리드 상태를 초기값으로 업데이트");
        const updatedMappingPidList = JSON.parse(
          JSON.stringify(mappingPidList.value)
        );
        initialMappingPidList.value = updatedMappingPidList;

        console.log("3단계: P&ID 그리드 상태 업데이트 완료 (데이터 유지)");
        console.log(
          "업데이트된 초기값 길이:",
          initialMappingPidList.value.length
        );
        console.log("현재 그리드 데이터 길이:", mappingPidList.value.length);
      }

      // P&ID Components 그리드 새로고침 - mappingPidList에서 최신 drawing_id 사용
      if (mappingPidList.value.length > 0) {
        const latestPidItem =
          mappingPidList.value[mappingPidList.value.length - 1];
        console.log(
          "P&ID Components 새로고침용 최신 P&ID 아이템:",
          latestPidItem
        );
        await loadPidComponentDataWithoutClear(latestPidItem);
      } else {
        // P&ID가 모두 삭제된 경우 P&ID Components 그리드 초기화 및 섹션 닫기
        pidComponentList.value = [];
        console.log("P&ID가 모두 삭제되어 P&ID Components 그리드 초기화");

        // P&ID Components 섹션이 열려있다면 닫기
        if (showPidComponentSection.value) {
          console.log("P&ID가 모두 삭제되어 P&ID Components 섹션 닫기");
          closePidComponentSection();
        }

        // P&ID가 모두 삭제된 경우에만 P&ID DIV도 닫기
        console.log("P&ID가 모두 삭제되어 P&ID DIV 닫기");
        showPidListInMain.value = false;
        currentPfdItemForMapping.value = null;
        mappingPidList.value = [];
        selectedMappingPidItems.value = [];
        initialMappingPidList.value = [];
      }
      // P&ID 모달이 삭제되어 함수 호출 제거
      return;
    }

    // 삭제와 저장이 모두 있는 경우
    if (deletedRows.length > 0 && validMappings.length > 0) {
      // 삭제와 저장이 모두 수행됨 - 메시지는 저장 완료 후에 표시
    }
    // 3. 저장이 필요한 경우 (새 데이터가 있는 경우만)
    if (validMappings.length > 0) {
      console.log("새 데이터 저장 시작 - 항목 수:", validMappings.length);
      // 필수 입력 검증 (새로 추가된 항목들에 대해서만)
      const invalidItems = validMappings.filter((item) => {
        const hasPfdFile = !!item.pidFile;
        const hasSvgFile = !!(item as any).svgFile;
        const isNewItem = !item.drawing_id; // drawing_id가 없으면 새로 추가된 항목
        const hasExistingData =
          item.pidFileName && item.pidFileName.trim() !== ""; // 기존 데이터가 있는지 확인

        // 새로 추가된 항목인 경우에만 파일 업로드 검증
        if (isNewItem) {
          // PFD 파일이 있는 경우에만 파일명 검증
          if (
            hasPfdFile &&
            (!item.pidFileName || item.pidFileName.trim() === "")
          ) {
            return true;
          }

          // 새 항목인데 PFD 파일도 Svg 파일도 없는 경우는 유효하지 않음
          if (!hasPfdFile && !hasSvgFile) {
            return true;
          }
        }

        // 기존 항목인 경우, 기존 데이터가 있으면 유효함 (새로운 파일 업로드가 없어도 됨)
        if (!isNewItem && hasExistingData) {
          return false; // 유효함
        }

        // 기존 항목인데 기존 데이터도 없고 새로운 파일도 없는 경우만 무효
        if (!isNewItem && !hasExistingData && !hasPfdFile && !hasSvgFile) {
          return true;
        }

        return false;
      });

      if (invalidItems.length > 0) {
        alert("P&ID 파일명은 필수 입력 항목입니다.\n모든 항목을 입력해주세요.");
        return;
      }
      // parent_drawing_id 설정 - loadMappingPidList에서 이미 설정된 값 사용
      const parentDrawingId =
        validMappings[0]?.parent_drawing_id ||
        currentPfdItemForMapping.value?.drawing_id;
      console.log("P&ID 매핑 parent_drawing_id 설정:", {
        currentPfdItem: currentPfdItemForMapping.value,
        currentPfdDrawingId: currentPfdItemForMapping.value?.drawing_id,
        firstValidMappingParentId: validMappings[0]?.parent_drawing_id,
        parentDrawingId: parentDrawingId,
      });

      if (!parentDrawingId) {
        console.error("parent_drawing_id가 없습니다:", {
          currentPfdItem: currentPfdItemForMapping.value,
          drawing_id: currentPfdItemForMapping.value?.drawing_id,
          validMappings: validMappings,
        });
        alert(
          "P&ID 매핑을 위한 PFD drawing_id가 없습니다. PFD를 먼저 저장해주세요."
        );
        return;
      }

      // P&ID 매핑 데이터 즉시 저장
      try {
        console.log(
          "P&ID 매핑 새 데이터 생성 시작:",
          validMappings.length,
          "개"
        );

        const pidMappingPromises = validMappings.map(async (item) => {
          // parent_drawing_id 설정
          if (!item.parent_drawing_id) {
            item.parent_drawing_id = parentDrawingId;
          }

          const isNewItem = !item.drawing_id;

          console.log("P&ID 매핑 아이템 저장:", {
            item: item,
            parent_drawing_id: item.parent_drawing_id,
            pidFile: item.pidFile?.name,
            excelFile: item.excelFile?.name || "",
            svgFile: (item as any).svgFile?.name || "",
            isNewItem: isNewItem,
          });

          const formData = new FormData();

          // drawingData를 개별 필드로 FormData에 추가
          formData.append("process_id", processId);
          formData.append("drawing_type", "PNID");
          formData.append("parent_drawing_id", item.parent_drawing_id);
          formData.append("remarks", item.remarks || "");

          // P&ID 파일 추가 (있는 경우에만)
          if (item.pidFile) {
            console.log("P&ID 파일 추가:", {
              fileName: item.pidFile.name,
              fileSize: item.pidFile.size,
              fileType: item.pidFile.type,
            });
            formData.append("siteFile", item.pidFile);
          }

          // Excel 파일 추가 (있는 경우에만)
          if (item.excelFile) {
            console.log("Excel 파일 추가:", {
              fileName: item.excelFile.name,
              fileSize: item.excelFile.size,
              fileType: item.excelFile.type,
            });
            formData.append("excelFile", item.excelFile);
          }

          // Svg 파일이 변경된 경우 symbolFile로 전달
          const currentSvgFile = (item as any).svgFile;
          const initialItem = initialMappingPidList.value.find(
            (initialItem) =>
              initialItem.drawing_id &&
              initialItem.drawing_id === item.drawing_id
          );
          const initialSvgFile = (initialItem as any)?.svgFile;

          // Svg 파일 변경 감지
          const svgFileChanged =
            (currentSvgFile &&
              (!initialSvgFile ||
                (currentSvgFile as any).name !==
                  (initialSvgFile as any).name)) ||
            (!currentSvgFile && initialSvgFile);

          // P&ID 파일이나 Excel 파일 변경 여부 확인
          const currentPidFile = (item as any).pidFile;
          const currentExcelFile = (item as any).excelFile;
          const initialPidFile = (initialItem as any)?.pidFile;
          const initialExcelFile = (initialItem as any)?.excelFile;

          const pidFileChanged =
            currentPidFile &&
            (!initialPidFile || currentPidFile.name !== initialPidFile?.name);
          // Excel 파일 변경 감지: 새 파일이 선택되었거나, 기존 파일과 다른 파일로 변경된 경우
          const excelFileChanged =
            currentExcelFile &&
            (!initialExcelFile ||
              currentExcelFile.name !== initialExcelFile?.name);
          const hasMainFileChanges =
            pidFileChanged || excelFileChanged || isNewItem;

          // Excel 파일 중복 저장 방지 로직
          const hasExistingExcelFile =
            item.excel_drawing_id &&
            (item.excel_file_name || item.excelFileName);
          const shouldSkipExcelSave = hasExistingExcelFile && !currentExcelFile;

          // 파일 변경 상태 로깅
          console.log("=== P&ID 저장 시 파일 변경 상태 확인 ===", {
            itemId: item.id,
            pidFileName: item.pidFileName,
            pidFileChanged,
            excelFileChanged,
            svgFileChanged,
            hasMainFileChanges,
            isNewItem,
            hasExistingExcelFile: hasExistingExcelFile,
            shouldSkipExcelSave: shouldSkipExcelSave,
            excel_drawing_id: item.excel_drawing_id,
            excel_file_name: item.excel_file_name || item.excelFileName,
          });

          // Excel 파일 변경 시 별도 API 호출 (P&ID 그리드 전용)
          // 이미 저장된 Excel 파일이 있는 경우 중복 저장 방지

          if (excelFileChanged && !shouldSkipExcelSave) {
            console.log("🔄 Excel 파일 변경 감지 - Excel 전용 API 호출 시작");
            if (currentExcelFile) {
              console.log(
                "📄 Excel 파일 업로드:",
                (currentExcelFile as any).name
              );
              console.log(
                "📍 중복 호출 방지: 저장 버튼 클릭 시에만 호출됨 (파일 선택 시 즉시 호출 안함)"
              );
              console.log(
                "⚠️ 주의: 이 API는 Excel 파일만 처리하며 P&ID 파일은 수정하지 않아야 함"
              );

              // Excel 파일 업로드 전 현재 상태 저장
              const beforeUploadState = {
                itemId: item.id,
                drawingId: item.drawing_id,
                parentDrawingId: item.parent_drawing_id,
                excelDrawingId: item.excel_drawing_id,
              };
              console.log("Excel 업로드 전 상태:", beforeUploadState);

              await handleExcelFileUploadForPid(item, currentExcelFile);

              // Excel 업로드 후 그리드에서 excel_drawing_id 확인 및 업데이트
              console.log(
                "Excel 업로드 완료 - 그리드 excel_drawing_id 확인 시작"
              );
              const updatedItemIndex = mappingPidList.value.findIndex(
                (gridItem) => gridItem.id === item.id
              );
              if (updatedItemIndex !== -1) {
                console.log("Excel 업로드 후 그리드 항목 확인:", {
                  index: updatedItemIndex,
                  beforeExcelDrawingId: beforeUploadState.excelDrawingId,
                  afterExcelDrawingId:
                    mappingPidList.value[updatedItemIndex].excel_drawing_id,
                  isUpdated:
                    mappingPidList.value[updatedItemIndex].excel_drawing_id !==
                    beforeUploadState.excelDrawingId,
                });

                // excel_drawing_id가 업데이트되지 않은 경우 경고
                if (
                  !mappingPidList.value[updatedItemIndex].excel_drawing_id ||
                  mappingPidList.value[updatedItemIndex].excel_drawing_id ===
                    beforeUploadState.excelDrawingId
                ) {
                  console.warn(
                    "⚠️ Excel 업로드 후 excel_drawing_id가 업데이트되지 않았습니다. API 응답을 확인해주세요."
                  );
                } else {
                  console.log(
                    "✅ Excel 업로드 후 excel_drawing_id가 성공적으로 업데이트되었습니다."
                  );
                }
              } else {
                console.error(
                  "❌ Excel 업로드 후 그리드에서 해당 항목을 찾을 수 없습니다."
                );
              }
            } else {
              console.log("🗑️ P&ID Excel 파일 삭제 - 별도 API 호출");
              await handleExcelFileDeleteForPid(item);
              console.log("✅ Excel 파일 삭제 완료");
            }
            console.log("✅ Excel 파일 처리 완료");
          } else if (shouldSkipExcelSave) {
            console.log("⚠️ 이미 저장된 Excel 파일이 있음 - 중복 저장 방지:", {
              excel_drawing_id: item.excel_drawing_id,
              excel_file_name: item.excel_file_name || item.excelFileName,
              hasNewFile: !!currentExcelFile,
            });
          } else {
            console.log("ℹ️ Excel 파일 변경 없음 - Excel API 호출 건너뛰기");
          }

          // Svg 파일 변경 시 별도 API 호출 (P&ID 그리드 전용)
          if (svgFileChanged) {
            console.log("🔄 SVG 파일 변경 감지 - SVG 전용 API 호출 시작");
            if (currentSvgFile) {
              console.log("📄 SVG 파일 업로드:", (currentSvgFile as any).name);
              console.log(
                "📍 중복 호출 방지: 저장 버튼 클릭 시에만 호출됨 (파일 선택 시 즉시 호출 안함)"
              );
              console.log(
                "⚠️ 주의: 이 API는 SVG 파일만 처리하며 P&ID 파일은 수정하지 않아야 함"
              );

              // SVG 파일 업로드 전 현재 상태 저장
              const beforeUploadState = {
                itemId: item.id,
                drawingId: item.drawing_id,
                parentDrawingId: item.parent_drawing_id,
                svgDrawingId: item.svg_drawing_id,
              };
              console.log("SVG 업로드 전 상태:", beforeUploadState);

              await handleSvgFileUploadForPid(item, currentSvgFile);

              // SVG 업로드 후 그리드에서 svg_drawing_id 확인 및 업데이트
              console.log("SVG 업로드 완료 - 그리드 svg_drawing_id 확인 시작");
              const updatedItemIndex = mappingPidList.value.findIndex(
                (gridItem) => gridItem.id === item.id
              );
              if (updatedItemIndex !== -1) {
                console.log("SVG 업로드 후 그리드 항목 확인:", {
                  index: updatedItemIndex,
                  beforeSvgDrawingId: beforeUploadState.svgDrawingId,
                  afterSvgDrawingId:
                    mappingPidList.value[updatedItemIndex].svg_drawing_id,
                  isUpdated:
                    mappingPidList.value[updatedItemIndex].svg_drawing_id !==
                    beforeUploadState.svgDrawingId,
                });

                // svg_drawing_id가 업데이트되지 않은 경우 경고
                if (
                  !mappingPidList.value[updatedItemIndex].svg_drawing_id ||
                  mappingPidList.value[updatedItemIndex].svg_drawing_id ===
                    beforeUploadState.svgDrawingId
                ) {
                  console.warn(
                    "⚠️ SVG 업로드 후 svg_drawing_id가 업데이트되지 않았습니다. API 응답을 확인해주세요."
                  );
                } else {
                  console.log(
                    "✅ SVG 업로드 후 svg_drawing_id가 성공적으로 업데이트되었습니다."
                  );
                }
              } else {
                console.error(
                  "❌ SVG 업로드 후 그리드에서 해당 항목을 찾을 수 없습니다."
                );
              }

              console.log("✅ SVG 파일 업로드 완료");
            } else {
              console.log("🗑️ P&ID Svg 파일 삭제 - 별도 API 호출");
              await handleSvgFileDeleteForPid(item);
              console.log("✅ SVG 파일 삭제 완료");
            }
            console.log("✅ SVG 파일 처리 완료");
          } else {
            console.log("ℹ️ SVG 파일 변경 없음 - SVG API 호출 건너뛰기");
          }

          // Excel/Svg 파일만 변경되고 P&ID 파일은 변경되지 않은 경우 메인 API 호출 건너뛰기
          console.log("파일 변경 상태 확인:", {
            svgFileChanged,
            pidFileChanged,
            excelFileChanged,
            hasMainFileChanges,
            isNewItem,
            shouldSkipMainApi:
              (svgFileChanged || excelFileChanged) &&
              !pidFileChanged &&
              !isNewItem,
          });

          if (
            (svgFileChanged || excelFileChanged) &&
            !pidFileChanged &&
            !isNewItem
          ) {
            const changeType =
              svgFileChanged && excelFileChanged
                ? "excel_svg_change"
                : svgFileChanged
                ? "svg_only_change"
                : "excel_only_change";
            console.log(
              `✅ ${
                svgFileChanged && excelFileChanged
                  ? "Excel/Svg"
                  : svgFileChanged
                  ? "Svg"
                  : "Excel"
              } 파일만 변경됨 - 메인 P&ID API 호출 건너뛰기`
            );
            console.log("별도 Excel/Svg API만 호출되고 메인 P&ID API는 건너뜀");
            console.log(
              "⚠️ 중요: 이 경우에도 그리드 갱신은 실행되어야 함 (skipped: true로 표시)"
            );
            return { success: true, skipped: true, reason: changeType };
          }

          console.log("P&ID 매핑 FormData 내용:");
          console.log("process_id:", processId);
          console.log("drawing_type:", "PNID");
          console.log("parent_drawing_id:", item.parent_drawing_id);
          console.log("remarks:", item.remarks || "");
          console.log("pid_file (siteFile):", item.pidFile?.name || "");
          console.log("excel_file:", item.excelFile?.name || "");
          console.log(
            "svg_file (symbolFile):",
            (item as any).svgFile?.name || ""
          );

          let response;
          if (isNewItem) {
            // 새 데이터 - 생성 API 호출
            console.log("P&ID 새 데이터 생성 API 호출");
            response = await request("/api/process/drawing/create", undefined, {
              method: "POST",
              body: formData,
            });
          } else {
            // 기존 데이터 - 수정 API 호출 (FormData로 파일 포함 전송)
            console.log("P&ID 기존 데이터 수정 API 호출");
            console.log("수정할 drawing_id:", item.drawing_id);

            // FormData에 drawing_id 추가
            formData.append("drawing_id", item.drawing_id);

            console.log("P&ID 수정 FormData 내용:");
            console.log("process_id:", processId);
            console.log("drawing_type:", "PNID");
            console.log("parent_drawing_id:", item.parent_drawing_id);
            console.log("drawing_id:", item.drawing_id);
            console.log("remarks:", item.remarks || "");
            console.log("pid_file:", item.pidFile?.name || "");
            console.log("excel_file:", item.excelFile?.name || "");
            console.log("svg_file:", (item as any).svgFile?.name || "");

            response = await request(
              `/api/process/drawing/${item.drawing_id}`,
              undefined,
              {
                method: "PATCH",
                body: formData,
              }
            );
          }

          console.log("P&ID API 응답 전체 구조:", {
            response: response,
            success: response.success,
            status: response.status,
            message: response.message,
            responseData: response.response,
            responseDataType: typeof response.response,
            isArray: Array.isArray(response.response),
            hasDrawingId: !!response.response?.drawing_id,
            hasDataDrawingId: !!response.response?.data?.drawing_id,
            hasDirectDrawingId: !!response.drawing_id,
            responseKeys: Object.keys(response.response || {}),
            dataKeys: Object.keys(response.response?.data || {}),
            drawingId:
              response.response?.data?.drawing_id ||
              response.response?.drawing_id ||
              response.drawing_id,
          });

          if (!response.success) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          return response;
        });

        const results = await Promise.all(pidMappingPromises);
        const successfulSaves = results.filter((r) => r && r.success);
        const skippedSaves = results.filter((r) => r && r.skipped);

        console.log("P&ID 매핑 저장 완료:", {
          total: results.length,
          successfulSaves: successfulSaves.length,
          skippedSaves: skippedSaves.length,
          totalProcessed: successfulSaves.length + skippedSaves.length,
          skippedReasons: skippedSaves.map((s) => s.reason),
        });

        // 건너뛴 저장에 대한 상세 로그
        if (skippedSaves.length > 0) {
          console.log("=== 건너뛴 저장 상세 정보 ===");
          skippedSaves.forEach((skippedSave, index) => {
            console.log(`건너뛴 저장 ${index + 1}:`, {
              reason: skippedSave.reason,
              success: skippedSave.success,
              skipped: skippedSave.skipped,
            });
          });
        }

        // 성공한 저장이나 건너뛴 저장(Excel/Svg만 변경)이 있는 경우 그리드 갱신
        const totalProcessedSaves =
          successfulSaves.length + skippedSaves.length;

        if (totalProcessedSaves > 0) {
          // API 응답에서 drawing_id, excel_drawing_id, svg_drawing_id 업데이트
          successfulSaves.forEach((saveResponse, index) => {
            const validMapping = validMappings[index];
            if (saveResponse.response && validMapping) {
              const itemIndex = mappingPidList.value.findIndex(
                (item) => item.id === validMapping.id
              );
              if (itemIndex !== -1) {
                console.log("P&ID API 응답 처리 시작:", {
                  itemIndex,
                  itemId: validMapping.id,
                  responseData: saveResponse.response,
                });

                // API 응답 구조 분석 및 drawing_id 추출
                console.log("API 응답 구조 분석:", {
                  saveResponse: saveResponse,
                  response: saveResponse.response,
                  responseData: saveResponse.response?.data,
                  responseType: typeof saveResponse.response,
                  isArray: Array.isArray(saveResponse.response),
                  hasDrawingId: !!saveResponse.response?.drawing_id,
                  hasDataDrawingId: !!saveResponse.response?.data?.drawing_id,
                  hasDirectDrawingId: !!saveResponse.drawing_id,
                  dataKeys: Object.keys(saveResponse.response?.data || {}),
                  responseKeys: Object.keys(saveResponse.response || {}),
                });

                // API 응답에서 drawing_id 추출 (여러 경로 시도)
                const drawingId =
                  saveResponse.response?.data?.drawing_id ||
                  saveResponse.response?.drawing_id ||
                  saveResponse.drawing_id;
                const excelDrawingId =
                  saveResponse.response?.data?.excel_drawing_id ||
                  saveResponse.response?.excel_drawing_id ||
                  saveResponse.excel_drawing_id;
                const svgDrawingId =
                  saveResponse.response?.data?.svg_drawing_id ||
                  saveResponse.response?.svg_drawing_id ||
                  saveResponse.svg_drawing_id;

                if (drawingId) {
                  mappingPidList.value[itemIndex].drawing_id = drawingId;
                  console.log("✅ P&ID drawing_id 업데이트:", drawingId);

                  // drawing_id가 설정되면 관련 항목들 활성화 상태 확인
                  console.log(
                    "P&ID drawing_id 설정 완료 - 관련 항목 활성화 상태:",
                    {
                      itemId: validMapping.id,
                      drawingId: drawingId,
                      hasExcelFile: !!(mappingPidList.value[itemIndex] as any)
                        .excelFile,
                      hasSvgFile: !!(mappingPidList.value[itemIndex] as any)
                        .svgFile,
                      excelDrawingId:
                        mappingPidList.value[itemIndex].excel_drawing_id,
                      svgDrawingId:
                        mappingPidList.value[itemIndex].svg_drawing_id,
                      isTempId: drawingId.startsWith("temp_"),
                      willActivateItems: !drawingId.startsWith("temp_"),
                    }
                  );
                } else {
                  console.warn("⚠️ API 응답에 drawing_id가 없습니다:", {
                    saveResponse: saveResponse,
                    response: saveResponse.response,
                    availableKeys: Object.keys(saveResponse.response || {}),
                  });
                }

                // API 응답에서 excel_drawing_id 추출하여 업데이트
                if (excelDrawingId) {
                  mappingPidList.value[itemIndex].excel_drawing_id =
                    excelDrawingId;
                  console.log("✅ Excel drawing_id 업데이트:", excelDrawingId);
                }

                // API 응답에서 svg_drawing_id 추출하여 업데이트
                if (svgDrawingId) {
                  mappingPidList.value[itemIndex].svg_drawing_id = svgDrawingId;
                  console.log("✅ Svg drawing_id 업데이트:", svgDrawingId);
                }

                // Vue 반응성을 위해 배열 재할당
                mappingPidList.value = [...mappingPidList.value];

                console.log("P&ID API 응답 처리 완료:", {
                  itemIndex,
                  finalDrawingId: mappingPidList.value[itemIndex].drawing_id,
                  finalExcelDrawingId:
                    mappingPidList.value[itemIndex].excel_drawing_id,
                  finalSvgDrawingId:
                    mappingPidList.value[itemIndex].svg_drawing_id,
                });
              } else {
                console.error(
                  "❌ P&ID API 응답 처리 시 그리드에서 해당 항목을 찾을 수 없습니다:",
                  validMapping.id
                );
              }
            }
          });

          // 저장 완료 메시지
          alert("P&ID 매핑이 저장되었습니다.");

          // PFD 아이템의 hasPidMapping 상태 업데이트
          if (currentPfdItemForMapping.value) {
            const updatedPfdList = processStore.pfdList.map((item) => {
              if (item.id === currentPfdItemForMapping.value.id) {
                return { ...item, hasPidMapping: true };
              }
              return item;
            });
            processStore.setPfdList(updatedPfdList);
            console.log("PFD hasPidMapping 상태 업데이트 완료");
          }

          // 저장 성공 후 공정카드 그리드 갱신 (P&ID 버튼 상태 업데이트를 위해)
          console.log("=== P&ID 저장 완료 - 공정카드 그리드 갱신 시작 ===");

          // 공정카드 그리드 새로고침 (PFD 데이터 새로고침)
          await refreshPfdData();
          console.log("공정카드 그리드 새로고침 완료");

          // P&ID 저장 완료 후 공정카드 그리드의 P&ID 버튼 클릭 이벤트 시뮬레이션
          console.log(
            "=== P&ID 저장 완료 - 공정카드 그리드 P&ID 버튼 클릭 이벤트 시뮬레이션 시작 ==="
          );
          if (currentPfdItemForMapping.value) {
            console.log("현재 PFD 아이템:", {
              id: currentPfdItemForMapping.value.id,
              drawing_id: currentPfdItemForMapping.value.drawing_id,
              pfdFileName: currentPfdItemForMapping.value.pfdFileName,
            });

            // P&ID 저장 성공 후 초기값 업데이트 (그리드 데이터는 유지)
            console.log("1단계: P&ID 저장 성공 후 초기값 업데이트");

            // 현재 그리드 데이터를 초기값으로 설정 (저장된 상태를 반영)
            console.log("2단계: 현재 그리드 상태를 초기값으로 업데이트");
            const updatedMappingPidList = JSON.parse(
              JSON.stringify(mappingPidList.value)
            );
            initialMappingPidList.value = updatedMappingPidList;

            console.log("3단계: P&ID 그리드 상태 업데이트 완료 (데이터 유지)");
            console.log(
              "업데이트된 초기값 길이:",
              initialMappingPidList.value.length
            );
            console.log(
              "현재 그리드 데이터 길이:",
              mappingPidList.value.length
            );
            console.log("현재 P&ID 그리드 상태:", {
              showPidListInMain: showPidListInMain.value,
              mappingPidListLength: mappingPidList.value.length,
              currentPfdItemForMapping: !!currentPfdItemForMapping.value,
            });
          } else {
            console.warn(
              "⚠️ currentPfdItemForMapping.value가 없어서 P&ID 그리드를 새로고침할 수 없습니다."
            );
          }

          console.log(
            "=== P&ID 저장 후 그리드 상태 업데이트 완료 (데이터 유지, DIV 열린 상태 유지) ==="
          );
        }
      } catch (error: any) {
        console.error("P&ID 매핑 저장 실패:", error);
        alert(`P&ID 매핑 저장 실패: ${error.message}`);
        return;
      }
    }

    // 실제 변경사항이 있는지 확인 (삭제된 항목이 있거나 새로 추가된 항목이 있는 경우)
    const hasRealChanges = deletedRows.length > 0 || validMappings.length > 0;

    console.log("변경사항 확인:", {
      deletedRows: deletedRows.length,
      validMappings: validMappings.length,
      hasRealChanges,
      initialLength: initialMappingPidList.value.length,
      currentLength: mappingPidList.value.length,
      deletedRowDetails: deletedRows.map((row) => ({
        drawing_id: row.drawing_id,
        pidFileName: row.pidFileName,
      })),
      validMappingDetails: validMappings.map((item) => ({
        pidFileName: item.pidFileName,
        hasPidFile: !!(item as any).pidFile,
        hasSvgFile: !!(item as any).svgFile,
      })),
    });

    if (!hasRealChanges) {
      console.log("조건 확인: 실제로 변경사항 없음");
      alert("변경사항이 없습니다.");
      throw new Error("변경사항 없음 - 함수 종료");
    }

    // 이 지점에 도달했다면 실제로 저장이 필요한 경우
    console.log(
      "실제 저장이 필요한 경우 - validMappings:",
      validMappings.length,
      "deletedRows:",
      deletedRows.length
    );

    // validMappings.length > 0 조건에서 실제 저장과 그리드 갱신이 이미 수행됨
    // 여기서는 삭제만 있는 경우나 변경사항이 없는 경우를 처리

    console.log("P&ID 매핑 처리 완료");

    // P&ID 매핑 처리 완료 후 그리드 새로고침 제거 (그리드 내용 지워짐 방지)
    console.log(
      "=== P&ID 매핑 처리 완료 - 그리드 새로고침 건너뛰기 (데이터 유지) ==="
    );

    return true;
  } catch (error: any) {
    // 변경사항 없음 오류는 무시
    if (error.message === "변경사항 없음 - 함수 종료") {
      console.log("변경사항 없음으로 함수 종료됨");
      return;
    }

    console.error("P&ID 매핑 저장 실패:", error);
    alert(`P&ID 매핑 저장 실패: ${error.message}`);
  }
};
const loadMappingPidList = async (pfdItem: any) => {
  try {
    console.log("=== P&ID 매핑 목록 로드 시작 ===");
    console.log("전달받은 pfdItem:", pfdItem);
    console.log("pfdItem.drawing_id:", pfdItem?.drawing_id);
    console.log("pfdItem.id:", pfdItem?.id);
    console.log("pfdItem.no:", pfdItem?.no);

    // drawing_id가 없으면 parent_drawing_id 사용
    const drawingId = pfdItem?.drawing_id || pfdItem?.parent_drawing_id;
    if (!drawingId) {
      console.error(
        "drawing_id와 parent_drawing_id가 모두 없습니다. pfdItem:",
        pfdItem
      );
      mappingPidList.value = [];
      return;
    }

    console.log("사용할 drawing_id:", {
      drawing_id: pfdItem?.drawing_id,
      parent_drawing_id: pfdItem?.parent_drawing_id,
      final_drawing_id: drawingId,
    });

    // P&ID 도면 검색 API 호출
    const requestBody = {
      search_field: "drawing_id",
      search_value: drawingId,
    };

    console.log("P&ID 도면 검색 API 호출:", requestBody);

    const response = await request(
      "/api/process/drawing_child/search",
      undefined,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.success) {
      console.error("P&ID 도면 검색 API 응답 오류:", response);
      mappingPidList.value = [];
      return;
    }

    // 새로운 API 응답 구조: response.items 배열 사용
    const pidDrawingsData = response.response?.items || response.response || [];
    console.log("P&ID 도면 검색 API 응답:", pidDrawingsData);
    console.log("API 응답 데이터 타입:", typeof pidDrawingsData);
    console.log(
      "API 응답 데이터 길이:",
      Array.isArray(pidDrawingsData) ? pidDrawingsData.length : "배열이 아님"
    );

    // API 응답 구조 상세 분석
    if (Array.isArray(pidDrawingsData) && pidDrawingsData.length > 0) {
      console.log("=== API 응답 구조 상세 분석 ===");
      pidDrawingsData.forEach((item, index) => {
        console.log(`응답 항목 ${index + 1}:`, {
          전체_객체: item,
          키들: Object.keys(item),
          child_drawings: item.child_drawings,
          child_drawings_length: Array.isArray(item.child_drawings)
            ? item.child_drawings.length
            : "child_drawings가 배열이 아님",
        });

        if (Array.isArray(item.child_drawings)) {
          item.child_drawings.forEach((child, childIndex) => {
            console.log(`  자식 도면 ${childIndex + 1}:`, {
              전체_객체: child,
              키들: Object.keys(child),
              excel_drawing_id: child.excel_drawing_id,
              svg_drawing_id: child.svg_drawing_id,
              detail: child.detail,
              detail_키들: child.detail
                ? Object.keys(child.detail)
                : "detail 없음",
            });
          });
        }
      });
      console.log("=== API 응답 구조 분석 완료 ===");
    }

    if (Array.isArray(pidDrawingsData) && pidDrawingsData.length > 0) {
      // child_drawings 배열을 기반으로 그리드 데이터 생성
      const allChildDrawings: any[] = [];

      pidDrawingsData.forEach((parentItem: any, parentIndex: number) => {
        console.log(
          `P&ID 부모 아이템 ${parentIndex + 1} - 원본 API 응답:`,
          parentItem
        );

        if (
          parentItem.child_drawings &&
          Array.isArray(parentItem.child_drawings)
        ) {
          parentItem.child_drawings.forEach(
            (childDrawing: any, childIndex: number) => {
              console.log(
                `P&ID 자식 도면 ${childIndex + 1} - child_drawings:`,
                childDrawing
              );

              allChildDrawings.push({
                parentItem: parentItem,
                childDrawing: childDrawing,
                parentIndex: parentIndex,
                childIndex: childIndex,
              });
            }
          );
        }
      });

      console.log(
        "모든 child_drawings 수집 완료:",
        allChildDrawings.length,
        "개"
      );

      if (allChildDrawings.length > 0) {
        const pidItems = allChildDrawings.map((item, index: number) => {
          const childDrawing = item.childDrawing;

          // P&ID 파일명 추출
          const pidFileName =
            childDrawing.detail?.current_file?.file_name ||
            childDrawing.current_file?.file_name ||
            childDrawing.file_name ||
            childDrawing.detail?.file_name ||
            "";

          // 매핑 Excel 파일명 추출 - detail 객체에서 가져오기
          const excelFileName =
            childDrawing.detail?.excel_file_name ||
            childDrawing.excel_file_name ||
            "";

          // Excel drawing_id 추출 - detail 객체에서 가져오기
          const excelDrawingId =
            childDrawing.detail?.excel_drawing_id ||
            childDrawing.excel_drawing_id ||
            null;

          // SVG 도면 파일명 추출 - detail 객체에서 가져오기
          const svgFileName =
            childDrawing.detail?.svg_file_name ||
            childDrawing.svg_file_name ||
            "";

          // SVG drawing_id 추출 - detail 객체에서 가져오기
          const svgDrawingId =
            childDrawing.detail?.svg_drawing_id ||
            childDrawing.svg_drawing_id ||
            null;

          console.log(`P&ID 아이템 ${index + 1} - 추출된 파일명들:`, {
            pidFileName,
            excelFileName,
            svgFileName,
            excelDrawingId,
            svgDrawingId,
            excel_drawing_id_원본: childDrawing.excel_drawing_id,
            svg_drawing_id_원본: childDrawing.svg_drawing_id,
            detail_excel_drawing_id: childDrawing.detail?.excel_drawing_id,
            detail_svg_drawing_id: childDrawing.detail?.svg_drawing_id,
            detail_svg_file_name: childDrawing.detail?.svg_file_name,
            detail_excel_file_name: childDrawing.detail?.excel_file_name,
            childDrawing_svg_file_name: childDrawing.svg_file_name,
            childDrawing_excel_file_name: childDrawing.excel_file_name,
            전체_childDrawing_객체: childDrawing,
          });

          // drawing_id 설정
          const drawingId =
            childDrawing.drawing_id ||
            childDrawing.file_id ||
            childDrawing.id ||
            childDrawing.detail?.current_file?.drawing_id ||
            childDrawing.current_file?.drawing_id ||
            childDrawing.detail?.drawing_id;

          return {
            id: `pid_${index + 1}`,
            no: index + 1,
            pidFileName: pidFileName,
            excelFileName: excelFileName,
            remarks: childDrawing.remarks || childDrawing.description || "",
            parent_drawing_id: drawingId,
            drawing_id: drawingId,
            symbol_id: childDrawing.symbol_id || null,
            excel_drawing_id: excelDrawingId,
            svg_drawing_id: svgDrawingId,
            current_file_drawing_id:
              childDrawing.detail?.current_file?.drawing_id ||
              childDrawing.current_file?.drawing_id,
            file_id:
              childDrawing.detail?.current_file?.file_id ||
              childDrawing.file_id,
            excel_file_name: excelFileName, // 매핑 Excel 파일명
            svg_file_name: svgFileName, // Svg 도면 파일명
            file_uri:
              childDrawing.detail?.current_file?.file_uri ||
              childDrawing.current_file?.file_uri ||
              childDrawing.file_uri,
            file_size:
              childDrawing.detail?.current_file?.file_size ||
              childDrawing.current_file?.file_size ||
              childDrawing.file_size,
            file_type:
              childDrawing.detail?.current_file?.file_type ||
              childDrawing.current_file?.file_type ||
              childDrawing.file_type,
            pidFile: null, // 파일 객체는 나중에 선택 시 설정
            excelFile: null, // 파일 객체는 나중에 선택 시 설정
            svgFile: null, // 파일 객체는 나중에 선택 시 설정
            svgFileName: svgFileName, // 기존 필드와 호환성을 위해 유지
          };
        });

        console.log("P&ID 아이템 생성 완료:", pidItems.length, "개");

        // P&ID 그리드 재조회 시 P&ID Components 그리드 내용 초기화
        console.log("P&ID 그리드 재조회 - P&ID Components 그리드 초기화");
        pidComponentList.value = [];
        selectedPidComponentItems.value = [];
        showPidComponentSection.value = false;
        selectedPidForComponent.value = null;
        pidComponentDrawingId.value = "";
        deletedPidComponentIds.value = [];

        // pidItems가 생성되었으므로 바로 사용
        mappingPidList.value = pidItems;
        // 초기값 저장 (깊은 복사)
        initialMappingPidList.value = JSON.parse(JSON.stringify(pidItems));

        // 그리드 갱신을 위한 강제 리렌더링 트리거
        console.log(
          "P&ID 그리드 갱신 완료 - hidden 변수들 포함:",
          pidItems.map((item) => ({
            id: item.id,
            drawing_id: item.drawing_id,
            symbol_id: item.symbol_id,
            pidFileName: item.pidFileName,
            excel_drawing_id: item.excel_drawing_id,
            svg_drawing_id: item.svg_drawing_id,
          }))
        );

        console.log("=== P&ID 매핑 목록 로드 완료 ===");
        console.log("로드된 P&ID 항목 수:", mappingPidList.value.length, "개");
        console.log("로드된 P&ID 목록:", mappingPidList.value);
        console.log(
          "P&ID 초기값 저장 완료:",
          initialMappingPidList.value.length,
          "개"
        );
      } else {
        // child_drawings가 없는 경우 빈 배열로 설정
        // P&ID 그리드 재조회 시 P&ID Components 그리드 내용 초기화
        console.log(
          "P&ID 그리드 재조회 (데이터 없음) - P&ID Components 그리드 초기화"
        );
        pidComponentList.value = [];
        selectedPidComponentItems.value = [];
        showPidComponentSection.value = false;
        selectedPidForComponent.value = null;
        pidComponentDrawingId.value = "";
        deletedPidComponentIds.value = [];

        mappingPidList.value = [];
        initialMappingPidList.value = [];
        console.log(
          "P&ID 매핑 목록 로드 완료 (데이터 없음):",
          mappingPidList.value
        );
        console.log(
          "P&ID 초기값 저장 완료 (데이터 없음):",
          initialMappingPidList.value
        );
      }
    } else {
      // 기존 데이터가 없는 경우 빈 배열로 설정
      // P&ID 그리드 재조회 시 P&ID Components 그리드 내용 초기화
      console.log(
        "P&ID 그리드 재조회 (전체 데이터 없음) - P&ID Components 그리드 초기화"
      );
      pidComponentList.value = [];
      selectedPidComponentItems.value = [];
      showPidComponentSection.value = false;
      selectedPidForComponent.value = null;
      pidComponentDrawingId.value = "";
      deletedPidComponentIds.value = [];

      mappingPidList.value = [];
      initialMappingPidList.value = [];
      console.log(
        "P&ID 매핑 목록 로드 완료 (데이터 없음):",
        mappingPidList.value
      );
      console.log(
        "P&ID 초기값 저장 완료 (데이터 없음):",
        initialMappingPidList.value
      );
    }
  } catch (error) {
    console.error("P&ID 매핑 목록 로드 실패:", error);
    mappingPidList.value = [];
  }
};

// P&ID 매핑 모달 추가 함수들
const addMappingPidRow = () => {
  const parentDrawingId = currentPfdItemForMapping.value?.drawing_id;
  console.log("새 행 추가 - parent_drawing_id:", parentDrawingId);

  const newRow = {
    id: `mapping_${Date.now()}`,
    no: mappingPidList.value.length + 1,
    pidFileName: "",
    excelFileName: "",
    parent_drawing_id: parentDrawingId, // 현재 PFD의 drawing_id를 parent_drawing_id로 전달
    excel_drawing_id: null, // Hidden 변수 추가
    svg_drawing_id: null, // Hidden 변수 추가
  };

  mappingPidList.value.push(newRow);

  // 새로 추가된 행을 현재 선택된 항목으로 설정
  currentPidItemForMapping.value = newRow;

  console.log("새 행 추가 완료:", newRow);
  console.log(
    "새 행을 currentPidItemForMapping으로 설정:",
    currentPidItemForMapping.value?.id
  );
};

const selectPidFile = (item: any) => {
  console.log("P&ID 파일 선택 버튼 클릭:", {
    itemId: item.id,
    drawingId: item.drawing_id,
    parentDrawingId: item.parent_drawing_id,
    pidFileName: item.pidFileName,
  });

  // mappingPidList에서 최신 item 찾기
  const currentItem = mappingPidList.value.find((i) => i.id === item.id);
  if (currentItem) {
    // 두 개의 참조 모두 설정하여 호환성 보장
    currentPfdItemForMapping.value = currentItem;
    currentPidItemForMapping.value = currentItem;
  } else {
    currentPfdItemForMapping.value = item;
    currentPidItemForMapping.value = item;
  }

  // 파일 input 초기화 (연속 클릭 가능하도록)
  if (pidFileInput.value) {
    pidFileInput.value.value = "";
  }

  console.log("P&ID 파일 선택 대상 설정 완료:", {
    currentPfdItemForMapping: currentPfdItemForMapping.value?.id,
    currentPidItemForMapping: currentPidItemForMapping.value?.id,
  });

  pidFileInput.value?.click();
};

const selectExcelFile = (item: any) => {
  // P&ID 파일이 저장되어 drawing_id가 생성된 이후에만 활성화
  if (!item.drawing_id || item.drawing_id.startsWith("temp_pid_drawing_")) {
    alert("매핑 Excel 파일을 선택하려면 먼저 P&ID 파일을 저장해주세요.");
    return;
  }

  // mappingPidList에서 최신 item 찾기
  const currentItem = mappingPidList.value.find(
    (i) => i.id === item.id || i.drawing_id === item.drawing_id
  );
  if (currentItem) {
    currentPfdItemForMapping.value = currentItem;
  } else {
    currentPfdItemForMapping.value = item;
  }

  // 파일 input 초기화 (연속 클릭 가능하도록)
  if (excelFileInput.value) {
    excelFileInput.value.value = "";
  }

  excelFileInput.value?.click();
};

const handlePidFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];

    console.log("P&ID 파일 선택 시작:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      currentPfdItemForMapping: currentPfdItemForMapping.value?.id,
      currentPidItemForMapping: currentPidItemForMapping.value?.id,
    });

    // *.dwg 파일만 허용
    if (!file.name.toLowerCase().endsWith(".dwg")) {
      alert("P&ID 파일은 *.dwg 형식만 선택 가능합니다.");
      target.value = ""; // 파일 선택 초기화
      return;
    }

    // 현재 선택된 항목 찾기 (여러 방법으로 시도)
    let targetItem = currentPidItemForMapping.value;

    if (!targetItem) {
      // currentPidItemForMapping이 없으면 currentPfdItemForMapping 사용
      targetItem = currentPfdItemForMapping.value;
    }

    if (!targetItem) {
      console.error(
        "❌ P&ID 파일 선택 시 현재 선택된 항목을 찾을 수 없습니다."
      );
      alert("파일을 선택할 항목이 없습니다.");
      target.value = "";
      return;
    }

    console.log("P&ID 파일 선택 대상 항목:", {
      id: targetItem.id,
      drawing_id: targetItem.drawing_id,
      parent_drawing_id: targetItem.parent_drawing_id,
    });

    // targetItem에 저장
    targetItem.pidFileName = file.name;
    targetItem.pidFile = file; // 실제 File 객체 저장

    // mappingPidList에서 해당 항목을 찾아서 업데이트
    const itemIndex = mappingPidList.value.findIndex(
      (item) => item.id === targetItem.id
    );
    if (itemIndex !== -1) {
      mappingPidList.value[itemIndex].pidFileName = file.name;
      mappingPidList.value[itemIndex].pidFile = file;

      // 반응성을 위해 Vue의 반응형 시스템에 알림
      mappingPidList.value = [...mappingPidList.value];

      console.log("✅ P&ID 파일이 mappingPidList에 업데이트됨:", {
        index: itemIndex,
        fileName: file.name,
        itemId: mappingPidList.value[itemIndex].id,
        hasFileObject: !!(mappingPidList.value[itemIndex] as any).pidFile,
      });
    } else {
      console.error(
        "❌ mappingPidList에서 해당 항목을 찾을 수 없음:",
        targetItem.id
      );

      // mappingPidList에서 찾을 수 없는 경우, 전체 리스트에서 해당 drawing_id로 찾기
      const alternativeIndex = mappingPidList.value.findIndex(
        (item) => item.drawing_id === targetItem.drawing_id
      );

      if (alternativeIndex !== -1) {
        mappingPidList.value[alternativeIndex].pidFileName = file.name;
        mappingPidList.value[alternativeIndex].pidFile = file;

        // 반응성을 위해 Vue의 반응형 시스템에 알림
        mappingPidList.value = [...mappingPidList.value];

        console.log(
          "✅ P&ID 파일이 mappingPidList에 대체 방법으로 업데이트됨:",
          {
            index: alternativeIndex,
            fileName: file.name,
            drawingId: mappingPidList.value[alternativeIndex].drawing_id,
            hasFileObject: !!(mappingPidList.value[alternativeIndex] as any)
              .pidFile,
          }
        );
      } else {
        console.error(
          "❌ mappingPidList에서 drawing_id로도 해당 항목을 찾을 수 없음:",
          targetItem.drawing_id
        );

        // 마지막 시도: parent_drawing_id로 찾기
        const parentIndex = mappingPidList.value.findIndex(
          (item) => item.parent_drawing_id === targetItem.parent_drawing_id
        );

        if (parentIndex !== -1) {
          mappingPidList.value[parentIndex].pidFileName = file.name;
          mappingPidList.value[parentIndex].pidFile = file;

          // 반응성을 위해 Vue의 반응형 시스템에 알림
          mappingPidList.value = [...mappingPidList.value];

          console.log(
            "✅ P&ID 파일이 mappingPidList에 parent_drawing_id로 업데이트됨:",
            {
              index: parentIndex,
              fileName: file.name,
              parentDrawingId:
                mappingPidList.value[parentIndex].parent_drawing_id,
              hasFileObject: !!(mappingPidList.value[parentIndex] as any)
                .pidFile,
            }
          );
        } else {
          console.error(
            "❌ mappingPidList에서 parent_drawing_id로도 해당 항목을 찾을 수 없음:",
            targetItem.parent_drawing_id
          );
          console.error(
            "전체 mappingPidList:",
            mappingPidList.value.map((item) => ({
              id: item.id,
              drawing_id: item.drawing_id,
              parent_drawing_id: item.parent_drawing_id,
            }))
          );
        }
      }
    }

    console.log("P&ID 파일 선택 완료:", file.name);
    console.log(
      "현재 mappingPidList 상태:",
      mappingPidList.value.map((item) => ({
        id: item.id,
        pidFileName: item.pidFileName,
        hasFileObject: !!(item as any).pidFile,
      }))
    );
  }
};

const handleExcelFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0] && currentPfdItemForMapping.value) {
    const file = target.files[0];

    console.log("Excel 파일 선택 시작:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      currentItem: currentPfdItemForMapping.value.id,
    });

    // Excel 파일 확장자 검증
    const allowedExtensions = [".xlsx", ".xls"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      alert("Excel 파일은 *.xlsx 또는 *.xls 형식만 선택 가능합니다.");
      target.value = ""; // 파일 선택 초기화
      return;
    }

    // currentPfdItemForMapping에 저장
    currentPfdItemForMapping.value.excelFileName = file.name;
    currentPfdItemForMapping.value.excel_file_name = file.name; // API 응답 필드와 동기화
    currentPfdItemForMapping.value.excelFile = file; // 실제 File 객체 저장

    // mappingPidList에서 해당 항목을 찾아서 업데이트
    const itemIndex = mappingPidList.value.findIndex(
      (item) => item.id === currentPfdItemForMapping.value.id
    );
    if (itemIndex !== -1) {
      mappingPidList.value[itemIndex].excelFileName = file.name;
      mappingPidList.value[itemIndex].excel_file_name = file.name; // API 응답 필드와 동기화
      mappingPidList.value[itemIndex].excelFile = file;
      mappingPidList.value[
        itemIndex
      ].excel_drawing_id = `temp_excel_drawing_${Date.now()}`;

      // 반응성을 위해 Vue의 반응형 시스템에 알림
      mappingPidList.value = [...mappingPidList.value];

      console.log("✅ Excel 파일이 mappingPidList에 업데이트됨:", {
        index: itemIndex,
        fileName: file.name,
        itemId: mappingPidList.value[itemIndex].id,
        hasFileObject: !!(mappingPidList.value[itemIndex] as any).excelFile,
      });
    } else {
      console.error(
        "❌ mappingPidList에서 해당 항목을 찾을 수 없음:",
        currentPfdItemForMapping.value.id
      );

      // mappingPidList에서 찾을 수 없는 경우, 전체 리스트에서 해당 drawing_id로 찾기
      const alternativeIndex = mappingPidList.value.findIndex(
        (item) => item.drawing_id === currentPfdItemForMapping.value.drawing_id
      );

      if (alternativeIndex !== -1) {
        mappingPidList.value[alternativeIndex].excelFileName = file.name;
        mappingPidList.value[alternativeIndex].excel_file_name = file.name;
        mappingPidList.value[alternativeIndex].excelFile = file;
        mappingPidList.value[
          alternativeIndex
        ].excel_drawing_id = `temp_excel_drawing_${Date.now()}`;

        // 반응성을 위해 Vue의 반응형 시스템에 알림
        mappingPidList.value = [...mappingPidList.value];

        console.log(
          "✅ Excel 파일이 mappingPidList에 대체 방법으로 업데이트됨:",
          {
            index: alternativeIndex,
            fileName: file.name,
            drawingId: mappingPidList.value[alternativeIndex].drawing_id,
            hasFileObject: !!(mappingPidList.value[alternativeIndex] as any)
              .excelFile,
          }
        );
      } else {
        console.error(
          "❌ mappingPidList에서 drawing_id로도 해당 항목을 찾을 수 없음:",
          currentPfdItemForMapping.value.drawing_id
        );
      }
    }

    console.log("Excel 파일 선택 완료:", file.name);
    console.log(
      "현재 mappingPidList 상태:",
      mappingPidList.value.map((item) => ({
        id: item.id,
        excelFileName: item.excelFileName,
        excel_file_name: item.excel_file_name,
        hasFileObject: !!(item as any).excelFile,
      }))
    );
  }
};

// P&ID 매핑 목록 체크박스 관련 함수들
const handleSelectAllMappingPid = () => {
  if (selectedMappingPidItems.value.length === mappingPidList.value.length) {
    selectedMappingPidItems.value = [];
  } else {
    selectedMappingPidItems.value = [...mappingPidList.value];
  }
};

const handleMappingPidSelectionChange = async () => {
  console.log("선택된 P&ID 항목들:", selectedMappingPidItems.value);

  // P&ID 목록 row가 선택되면 P&ID 컴포넌트 버튼 클릭 이벤트 호출
  if (selectedMappingPidItems.value) {
    const selectedItem = selectedMappingPidItems.value;
    console.log("P&ID 선택으로 인한 P&ID 컴포넌트 버튼 클릭 시뮬레이션");
    await openPidComponentModal(selectedItem);
  }
};

const deleteSelectedMappingPidItems = () => {
  if (!selectedMappingPidItems.value) {
    alert("삭제할 항목을 선택해주세요.");
    return;
  }

  if (confirm("선택된 P&ID 항목을 삭제하시겠습니까?")) {
    // 삭제될 P&ID 항목의 drawing_id 확인
    const deletedDrawingId = selectedMappingPidItems.value.drawing_id;

    // P&ID Components 섹션이 열려있고, 삭제될 P&ID와 연관된 경우 섹션 닫기
    if (showPidComponentSection.value && selectedPidForComponent.value) {
      const currentComponentDrawingId =
        selectedPidForComponent.value.drawing_id || pidComponentDrawingId.value;

      if (currentComponentDrawingId === deletedDrawingId) {
        console.log(
          "삭제되는 P&ID와 연관된 P&ID Components 섹션 닫기:",
          deletedDrawingId
        );
        closePidComponentSection();
      }
    }

    mappingPidList.value = mappingPidList.value.filter(
      (item) => item.id !== selectedMappingPidItems.value.id
    );
    selectedMappingPidItems.value = null;
    console.log("선택된 P&ID 항목 삭제 완료");
  }
};

// 컴포넌트 외부에서 사용할 수 있는 메서드들
defineExpose({
  t,
  handleUpdate,
  hasPfdChanges,
  hasMappingPidChanges,
  hasPidComponentChanges,
  hasFormulaChanges,
});
// 컴포넌트 마운트 시 실행
onMounted(async () => {
  try {
    let processId: string | null = null;

    if (!props.isRegisterMode) {
      // 공정 상세 모드일 때만 processId 사용
      processId = props.processId || (route.params.id as string);
      // 공정 상세 모드에서는 기본정보가 이미 등록되어 있다고 가정
      isBasicInfoRegistered.value = true;
    }

    console.log(
      "ProcessDetail 컴포넌트 마운트 - processId:",
      processId,
      "isRegisterMode:",
      props.isRegisterMode
    );

    if (props.isRegisterMode) {
      // 공정 등록 모드일 때 초기값 설정
      console.log("공정 등록 모드 - 초기값 설정");
      console.log("전달받은 조회조건 값:", {
        initialProcessType: props.initialProcessType,
        initialSubCategory: props.initialSubCategory,
      });

      selectedUnit.value = "METRIC";

      // processDetail 초기화 (조회조건 값을 초기값으로 설정)
      processStore.setProcessDetail({
        unit_system_code: "METRIC",
        processType: props.initialProcessType || "",
        subCategory: props.initialSubCategory || "",
        processName: "",
        processSymbol: "",
      });

      // 공정 등록 모드에서는 중분류와 공정명 옵션 초기화
      processStore.searchSubCategoryOptions = [];
      processStore.searchProcessNameOptions = [];

      // 초기 공정구분이 있으면 중분류 옵션 로드
      if (props.initialProcessType) {
        console.log(
          "초기 공정구분으로 중분류 옵션 로드:",
          props.initialProcessType
        );
        try {
          await processStore.loadSubCategoryCodesSilent(
            props.initialProcessType
          );
        } catch (error) {
          console.error("초기 공정구분으로 중분류 옵션 로드 실패:", error);
        }
      }

      // 초기 공정 중분류가 있으면 공정명 옵션 로드
      if (props.initialSubCategory && props.initialProcessType) {
        console.log(
          "초기 공정 중분류로 공정명 옵션 로드:",
          props.initialSubCategory
        );
        try {
          await processStore.loadProcessNameCodesSilent(
            props.initialSubCategory
          );
        } catch (error) {
          console.error("초기 공정 중분류로 공정명 옵션 로드 실패:", error);
        }
      }

      // 계산식 그리드 초기화
      processStore.setFormulaList([]);
      processStore.setInitialFormulaList([]);

      // 공정카드 그리드 초기화
      processStore.setPfdList([]);
      processStore.setInitialPfdList([]);

      // P&ID 목록 초기화
      mappingPidList.value = [];
      initialMappingPidList.value = [];
      selectedMappingPidItems.value = [];

      // P&ID 매핑 그리드 초기화
      mappingPidList.value = [];
      // processStore에 setMappingPidList 함수가 없으므로 로컬 상태만 초기화

      // 공정심볼 관련 상태 초기화
      processStore.setSelectedFiles({}); // 선택된 파일들 초기화
      if (processSymbolInput.value) {
        processSymbolInput.value.value = ""; // 파일 입력 필드 초기화
      }

      // 기본정보 등록 완료 상태 초기화
      isBasicInfoRegistered.value = false;

      // 생성된 공정 ID 초기화
      createdProcessId.value = null;

      // 공정 타입 옵션들 로드
      await processStore.loadProcessTypeCodes();
    } else if (props.processId) {
      // 공정 상세 정보 로드
      console.log("=== 공정 상세 정보 로드 시작 ===");
      console.log("props.processId:", props.processId);
      console.log("props.processCode:", props.processCode);
      console.log("props.isRegisterMode:", props.isRegisterMode);
      console.log(
        "searchProcessById 호출 전 - props.processId:",
        props.processId
      );
      await processStore.searchProcessById(props.processId);
      console.log("searchProcessById 호출 완료");
      console.log("공정 상세 정보 로드 완료:", processStore.processDetail);
      console.log("공정 타입:", processStore.processDetail.processType);
      console.log("공정 중분류:", processStore.processDetail.subCategory);
      // 공정 상세 정보 로드 완료

      // 공정심볼 파일명 표시 확인

      // 단위 시스템 코드를 화면에 매핑

      if (processStore.processDetail.unit_system_code) {
        selectedUnit.value = processStore.processDetail.unit_system_code;
      }

      // symbolId가 있으면 공정심볼 미리보기 로드 (빈 UUID 제외)
      const symbolId = processStore.processDetail.symbolId;
      if (symbolId && symbolId !== "00000000-0000-0000-0000-000000000000") {
        await processStore.loadProcessSymbolPreview();
      }

      // 드롭다운 옵션 상태 확인

      // 공정명 값 설정 확인

      // 공정 타입 옵션들 먼저 로드
      await processStore.loadProcessTypeCodes();

      // 공정 타입, 중분류, 공정명 옵션들 로드
      if (processStore.processDetail.processType) {
        console.log(
          "공정 타입 옵션 로드:",
          processStore.processDetail.processType
        );
        // 중분류 옵션 로드
        await processStore.loadSubCategoryCodes(
          processStore.processDetail.processType
        );

        if (processStore.processDetail.subCategory) {
          console.log(
            "중분류 옵션 로드:",
            processStore.processDetail.subCategory
          );
          // 공정명 옵션 로드
          await processStore.loadProcessNameCodes(
            processStore.processDetail.subCategory
          );

          // 공정명 옵션들이 완전히 로드될 때까지 대기
          await nextTick();

          // 공정명 셀렉트박스 값이 옵션에 존재하는지 확인
          if (
            processStore.processDetail.processName &&
            processStore.searchProcessNameOptions?.length > 0
          ) {
            // 현재 공정명 값이 옵션에 존재하는지 확인 (여러 방법으로 시도)
            let matchedOption = null;

            // 1. 정확한 값 비교
            matchedOption = processStore.searchProcessNameOptions.find(
              (option) =>
                option.value === processStore.processDetail.processName
            );

            if (!matchedOption) {
              // 2. 문자열 변환 후 비교
              matchedOption = processStore.searchProcessNameOptions.find(
                (option) =>
                  String(option.value) ===
                  String(processStore.processDetail.processName)
              );

              if (!matchedOption) {
                // 3. 라벨로 비교
                matchedOption = processStore.searchProcessNameOptions.find(
                  (option) =>
                    option.label === processStore.processDetail.processName
                );

                if (matchedOption) {
                  console.log("라벨로 매칭된 옵션:", matchedOption);
                  // 라벨이 일치하면 value로 업데이트
                  processStore.setProcessDetail({
                    processName: matchedOption.value,
                  });
                }
              }

              if (!matchedOption) {
                // 4. process_code로 비교 (더 정확한 매칭)
                if (processStore.processDetail.processCode) {
                  matchedOption = processStore.searchProcessNameOptions.find(
                    (option) =>
                      option.value === processStore.processDetail.processCode
                  );
                  if (matchedOption) {
                    console.log("process_code로 매칭된 옵션:", matchedOption);
                    processStore.setProcessDetail({
                      processName: matchedOption.value,
                    });
                  }
                }
              }
            }

            if (!matchedOption) {
              console.warn("공정명 옵션에 일치하는 값이 없습니다:", {
                processName: processStore.processDetail.processName,
                processCode: processStore.processDetail.processCode,
                optionsCount: processStore.searchProcessNameOptions.length,
              });
              // 일치하는 값이 없는 경우 빈 값으로 설정하지 않고 그대로 유지
            }
          }
        }
      }

      // 계산식 검색 API 호출하여 계산식 데이터 로드
      try {
        console.log("계산식 검색 API 호출 시작...");
        const formulaResult = await searchFormulaAPI();

        if (
          formulaResult &&
          formulaResult.response &&
          Array.isArray(formulaResult.response)
        ) {
          console.log("계산식 API 응답 데이터:", formulaResult.response);

          const formulaItems = formulaResult.response.map(
            (item: any, index: number) => {
              console.log(`계산식 아이템 ${index} 원본 데이터:`, item);

              const formulaItem = {
                id: `existing_formula_${item.id || index}`, // 기존 데이터는 existing_ 접두사 사용
                no: index + 1,
                registeredFormula: item.formula_name || item.name || "",
                formula_code: item.formula_code || item.code || "",
                registrationDate:
                  item.created_at ||
                  item.registration_date ||
                  formatDate(new Date()),
                infoOverview: item.formula_scope || item.scope || "",
                remarks: item.output_type || item.type || "",
                formula_id: item.formula_id || item.id || null,
                file_name: item.file_name || null, // file_name 추가
                process_dependencies: item.process_dependencies || null, // process_dependencies 추가
                _file: undefined,
                isSaved: true, // 기존 데이터는 저장된 상태
                _originalData: item, // 원본 데이터 보존
              };

              console.log("계산식 아이템 생성 (response):", {
                원본_item_id: item.id,
                원본_formula_id: item.formula_id,
                생성된_id: formulaItem.id,
                생성된_formula_id: formulaItem.formula_id,
                formula_name: item.formula_name,
                전체_생성된_아이템: formulaItem,
              });

              return formulaItem;
            }
          );

          processStore.setFormulaList(formulaItems);
          const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
          processStore.setInitialFormulaList(initialFormulaData);

          console.log("계산식 데이터 로드 완료:", formulaItems.length, "개");
        } else if (
          formulaResult &&
          "data" in formulaResult &&
          Array.isArray(formulaResult.data)
        ) {
          const formulaItems = formulaResult.data.map(
            (item: any, index: number) => {
              const formulaItem = {
                id: `existing_formula_${item.id || index}`, // 기존 데이터는 existing_ 접두사 사용
                no: index + 1,
                registeredFormula: item.formula_name || item.name || "",
                formula_code: item.formula_code || item.code || "",
                registrationDate:
                  item.created_at ||
                  item.registration_date ||
                  formatDate(new Date()),
                infoOverview: item.formula_scope || item.scope || "",
                remarks: item.output_type || item.type || "",
                formula_id: item.formula_id || item.id || null,
                file_name: item.file_name || null, // file_name 추가
                process_dependencies: item.process_dependencies || null, // process_dependencies 추가
                _file: undefined,
                isSaved: true, // 기존 데이터는 저장된 상태
                _originalData: item, // 원본 데이터 보존
              };

              console.log("계산식 아이템 생성 (data):", {
                원본_item_id: item.id,
                원본_formula_id: item.formula_id,
                생성된_id: formulaItem.id,
                생성된_formula_id: formulaItem.formula_id,
                formula_name: item.formula_name,
              });

              return formulaItem;
            }
          );

          processStore.setFormulaList(formulaItems);
          const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
          processStore.setInitialFormulaList(initialFormulaData);

          console.log(
            "계산식 데이터 로드 완료 (data 필드):",
            formulaItems.length,
            "개"
          );
        } else {
          console.log("계산식 데이터가 없습니다.");
          processStore.setFormulaList([]);
          processStore.setInitialFormulaList([]);
        }
      } catch (error) {
        console.error("계산식 데이터 로드 실패:", error);
        processStore.setFormulaList([]);
        processStore.setInitialFormulaList([]);
      }

      // PFD 도면 검색 API 호출하여 데이터 로드
      try {
        const pfdDrawingsData = await searchPfdDrawingAPI(processId);

        if (pfdDrawingsData && Array.isArray(pfdDrawingsData)) {
          const pfdItems = pfdDrawingsData.map((item: any, index: number) => {
            const drawingId =
              item.drawing_id || item.id || `pfd_drawing_${index + 1}`;

            // 등록일자: 기존 registrationDate가 있으면 사용, 없으면 API 응답의 created_at 사용
            const registrationDate = item.registrationDate 
              || item.created_at 
              || item.current_file?.created_at 
              || null;

            return {
              id: `pfd_${index + 1}`,
              no: index + 1,
              pfdFileName:
                item.current_file?.file_name || item.pfdFileName || "",
              registrationDate: registrationDate,
              mappingPidList: "",
              remarks: item.remarks || "",
              drawing_id: drawingId,
              symbol_id: item.symbol_id || item.symbolId || null,
              symbol_uri: item.symbol_uri || item.symbolUri || null,
            };
          });

          processStore.setPfdList(pfdItems);
          const initialPfdData = JSON.parse(JSON.stringify(pfdItems));
          processStore.setInitialPfdList(initialPfdData);
        } else {
          processStore.setPfdList([]);
          processStore.setInitialPfdList([]);
        }
      } catch (error) {
        console.error("PFD 데이터 로드 실패:", error);
        processStore.setPfdList([]);
        processStore.setInitialPfdList([]);
      }

    } else {
      console.warn("processId가 없습니다.");
    }
  } catch (error) {
    console.error("컴포넌트 초기화 실패:", error);
  }
});

// props 변경 감지
watch(
  () => props.processCode,
  async (newProcessCode, oldProcessCode) => {
    if (newProcessCode && newProcessCode !== oldProcessCode) {
      console.log(
        "processCode 변경 감지:",
        oldProcessCode,
        "->",
        newProcessCode
      );
      try {
        // 새로운 공정 정보 로드
        await processStore.searchProcessById(newProcessCode);

        // 단위 시스템 코드를 화면에 매핑 (watch)

        if (processStore.processDetail.unit_system_code) {
          selectedUnit.value = processStore.processDetail.unit_system_code;
          console.log(
            "단위 시스템 코드 매핑 완료 (watch):",
            selectedUnit.value
          );
        }

        // 공정 타입 옵션들 먼저 로드
        await processStore.loadProcessTypeCodes();

        // 공정 타입, 중분류, 공정명 옵션들 로드
        if (processStore.processDetail.processType) {
          // 중분류 옵션 로드
          await processStore.loadSubCategoryCodes(
            processStore.processDetail.processType
          );

          if (processStore.processDetail.subCategory) {
            // 공정명 옵션 로드
            await processStore.loadProcessNameCodes(
              processStore.processDetail.subCategory
            );

            // 공정명 옵션들이 완전히 로드될 때까지 대기
            await nextTick();

            // 공정명 셀렉트박스 값이 옵션에 존재하는지 확인 (watch)
            if (
              processStore.processDetail.processName &&
              processStore.searchProcessNameOptions?.length > 0
            ) {
              // 현재 공정명 값이 옵션에 존재하는지 확인 (여러 방법으로 시도)
              let matchedOption = null;

              // 1. 정확한 값 비교
              matchedOption = processStore.searchProcessNameOptions.find(
                (option) =>
                  option.value === processStore.processDetail.processName
              );

              if (!matchedOption) {
                // 2. 문자열 변환 후 비교
                matchedOption = processStore.searchProcessNameOptions.find(
                  (option) =>
                    String(option.value) ===
                    String(processStore.processDetail.processName)
                );

                if (!matchedOption) {
                  // 3. 라벨로 비교
                  matchedOption = processStore.searchProcessNameOptions.find(
                    (option) =>
                      option.label === processStore.processDetail.processName
                  );

                  if (matchedOption) {
                    console.log("라벨로 매칭된 옵션 (watch):", matchedOption);
                    // 라벨이 일치하면 value로 업데이트
                    processStore.setProcessDetail({
                      processName: matchedOption.value,
                    });
                  }
                }
              }

              if (!matchedOption) {
                // 일치하는 값이 없는 경우 '-- 선택 --'으로 설정
                processStore.setProcessDetail({ processName: "" });
              }
            }
          }
        }

        // 계산식 검색 API 호출하여 계산식 데이터 로드
        try {
          console.log("계산식 검색 API 호출 시작 (watch)...");
          const formulaResult = await searchFormulaAPI();

          if (
            formulaResult &&
            formulaResult.response &&
            Array.isArray(formulaResult.response)
          ) {
            const formulaItems = formulaResult.response.map(
              (item: any, index: number) => {
                const formulaItem = {
                  id: `existing_formula_${item.id || index}`, // 기존 데이터는 existing_ 접두사 사용
                  no: index + 1,
                  registeredFormula: item.formula_name || item.name || "",
                  formula_code: item.formula_code || item.code || "",
                  registrationDate:
                    item.created_at ||
                    item.registration_date ||
                    formatDate(new Date()),
                  infoOverview: item.formula_scope || item.scope || "",
                  remarks: item.output_type || item.type || "",
                  formula_id: item.formula_id || item.id || null,
                  file_name: item.file_name || null, // file_name 추가
                  _file: undefined,
                  isSaved: true, // 기존 데이터는 저장된 상태
                  _originalData: item, // 원본 데이터 보존
                };

                console.log("계산식 아이템 생성 (watch, response):", {
                  원본_item_id: item.id,
                  원본_formula_id: item.formula_id,
                  생성된_id: formulaItem.id,
                  생성된_formula_id: formulaItem.formula_id,
                  formula_name: item.formula_name,
                });

                return formulaItem;
              }
            );

            processStore.setFormulaList(formulaItems);
            const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
            processStore.setInitialFormulaList(initialFormulaData);

            console.log(
              "계산식 데이터 로드 완료 (watch):",
              formulaItems.length,
              "개"
            );
          } else if (
            formulaResult &&
            "data" in formulaResult &&
            Array.isArray(formulaResult.data)
          ) {
            const formulaItems = formulaResult.data.map(
              (item: any, index: number) => {
                const formulaItem = {
                  id: `existing_formula_${item.id || index}`, // 기존 데이터는 existing_ 접두사 사용
                  no: index + 1,
                  registeredFormula: item.formula_name || item.name || "",
                  formula_code: item.formula_code || item.code || "",
                  registrationDate:
                    item.created_at ||
                    item.registration_date ||
                    formatDate(new Date()),
                  infoOverview: item.formula_scope || item.scope || "",
                  remarks: item.output_type || item.type || "",
                  formula_id: item.formula_id || item.id || null,
                  file_name: item.file_name || null, // file_name 추가
                  process_dependencies: item.process_dependencies || null, // process_dependencies 추가
                  _file: undefined,
                  isSaved: true, // 기존 데이터는 저장된 상태
                  _originalData: item, // 원본 데이터 보존
                };

                console.log("계산식 아이템 생성 (watch, data):", {
                  원본_item_id: item.id,
                  원본_formula_id: item.formula_id,
                  생성된_id: formulaItem.id,
                  생성된_formula_id: formulaItem.formula_id,
                  formula_name: item.formula_name,
                });

                return formulaItem;
              }
            );

            processStore.setFormulaList(formulaItems);
            const initialFormulaData = JSON.parse(JSON.stringify(formulaItems));
            processStore.setInitialFormulaList(initialFormulaData);

            console.log(
              "계산식 데이터 로드 완료 (watch, data 필드):",
              formulaItems.length,
              "개"
            );
          } else {
            console.log("계산식 데이터가 없습니다 (watch).");
            processStore.setFormulaList([]);
            processStore.setInitialFormulaList([]);
          }
        } catch (error) {
          console.error("계산식 데이터 로드 실패 (watch):", error);
          processStore.setFormulaList([]);
          processStore.setInitialFormulaList([]);
        }

        // 계산식 초기값 저장
        const initialFormulaData = JSON.parse(
          JSON.stringify(processStore.formulaList)
        );
        processStore.setInitialFormulaList(initialFormulaData);
      } catch (error) {
        console.error("새로운 공정 정보 로드 실패:", error);
      }
    }
  },
  { immediate: false }
);

// 공정명 옵션이 로드된 후 값 자동 설정
watch(
  () => processStore.searchProcessNameOptions,
  async (newOptions, oldOptions) => {
    // 옵션이 로드되고, processName이 있는데 select box에 반영되지 않은 경우
    if (
      newOptions &&
      newOptions.length > 0 &&
      processStore.processDetail.processName &&
      !props.isRegisterMode
    ) {
      await nextTick();

      // 현재 공정명 값이 옵션에 존재하는지 확인
      let matchedOption = null;

      // 1. 정확한 값 비교
      matchedOption = newOptions.find(
        (option) =>
          option.value === processStore.processDetail.processName
      );

      if (!matchedOption) {
        // 2. 문자열 변환 후 비교
        matchedOption = newOptions.find(
          (option) =>
            String(option.value) ===
            String(processStore.processDetail.processName)
        );

        if (!matchedOption) {
          // 3. 라벨로 비교
          matchedOption = newOptions.find(
            (option) =>
              option.label === processStore.processDetail.processName
          );

          if (matchedOption) {
            console.log("공정명 옵션 watch: 라벨로 매칭된 옵션:", matchedOption);
            // 라벨이 일치하면 value로 업데이트
            processStore.setProcessDetail({
              processName: matchedOption.value,
            });
          }
        }
      }

      // 4. process_code로 비교 (더 정확한 매칭)
      if (!matchedOption && processStore.processDetail.processCode) {
        matchedOption = newOptions.find(
          (option) =>
            option.value === processStore.processDetail.processCode
        );
        if (matchedOption) {
          console.log("공정명 옵션 watch: process_code로 매칭된 옵션:", matchedOption);
        }
      }

      // 매칭된 옵션이 있고, 현재 값이 다르면 업데이트
      if (matchedOption && matchedOption.value !== processStore.processDetail.processName) {
        console.log("공정명 옵션 watch: 값 업데이트", {
          현재값: processStore.processDetail.processName,
          새값: matchedOption.value,
        });
        processStore.setProcessDetail({
          processName: matchedOption.value,
        });
      }
    }
  },
  { deep: true }
);
</script>

<style scoped>
.process-detail {
  padding: 5px 20px 5px 20px;
}

.process-info-section {
  margin-bottom: 8px;
  padding: 8px 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.process-info-section h3 {
  margin-bottom: 0;
  color: #333;
}

.form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.form-grid {
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;
  align-items: flex-start;
  width: 100%;
  flex: 1;
}

.register-button-container {
  display: flex;
  align-items: flex-start;
  padding-top: 5px; /* 더 위로 이동 */
}

.register-button-container .save-btn {
  width: 60px; /* 버튼 폭 줄임 */
  padding: 14px 12px; /* 세로 패딩 더 늘림 */
  font-size: 13px; /* 폰트 크기 줄임 */
  background-color: #0056b3 !important;
  border-color: #0056b3 !important;

  &:hover {
    background-color: #004085 !important;
    border-color: #004085 !important;
  }

  &:focus {
    background-color: #0056b3 !important;
    border-color: #0056b3 !important;
    box-shadow: 0 0 0 0.2rem rgba(0, 86, 179, 0.25) !important;
  }
}

/* 필수 입력 표시 스타일 */
.required {
  font-weight: 600;
}

.required-mark {
  color: #dc3545;
  font-weight: bold;
  margin-left: 2px;
}

/* 에러 상태 스타일 */
.error {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.file-select-btn.error {
  background-color: #dc3545;
  border-color: #dc3545;
}

.selected-file.error {
  color: #dc3545;
  font-weight: 500;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
  white-space: nowrap;
}

.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  min-width: 140px;
}

.file-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 160px;
}

.file-select-btn {
  padding: 8px 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
}

.file-select-btn:hover {
  background: #0056b3;
}

.selected-file {
  color: #000 !important;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 80px;
}

.pfd-section {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 2px solid #e9ecef;
}

.components-section {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

.pid-section {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 2px solid #e9ecef;
}

.pid-save-section {
  margin-top: 10px;
  text-align: right;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.grid-title {
  margin: 0;
}

.grid-title h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.tab-header h3 {
  margin: 0;
  color: #333;
}
.tab-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.save-btn-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  padding-right: 0;
}

.save-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  width: 80px;
}

.btn-danger {
  background: #0056b3;
  color: white;
}

.btn-success {
  background: #0056b3;
  color: white;
}

.btn-success:hover {
  background: #004085;
}

.btn-danger:hover {
  background: #004085;
}

.btn-danger:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #0056b3;
  color: white;
}

.btn-secondary:hover {
  background: #004085;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 8px 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 8px 20px;
  border-top: 1px solid #e9ecef;
}

.selected-files-info {
  color: #666;
  font-size: 14px;
}

.selected-files-list {
  margin-top: 15px;
}

.selected-files-list h4 {
  margin-bottom: 8px;
  color: #333;
}

.selected-files-list ul {
  list-style: none;
  padding: 0;
}

.selected-files-list li {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

/* P&ID 매핑 모달 스타일 */
.large-modal {
  max-width: 1200px !important;
  width: 95% !important;
  max-height: 85vh !important;
}

.modal-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.mapping-pid-table {
  width: 100%;
  overflow-x: auto;
}

.pid-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.pid-table th,
.pid-table td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  vertical-align: top;
}

.pid-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.pid-table tr.alternate-row {
  background-color: #f8f9fa;
}

.pid-table tr:hover {
  background-color: #f0f0f0;
}

.file-selection-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.file-info {
  margin-top: 4px;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #000 !important;
  font-size: 13px;
  flex: 1;
  min-width: 0;
}

.clear-file {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  margin: 0;
}

.clear-file:hover {
  color: #c82333;
}

.no-file {
  color: #000;
  font-size: 13px;
  font-style: italic;
  flex: 1;
  min-width: 0;
}

.svg-conversion-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.conversion-status {
  font-size: 12px;
  color: #6c757d;
}

.info-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
}

.info-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
}

/* 컴포넌트 버튼 스타일 */
.btn-component {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-component:hover {
  background-color: #0056b3;
}

.btn-component:active {
  background-color: #004085;
}

/* 공정관리 버튼 스타일 */
.btn-process-management {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-process-management:hover {
  background-color: #2563eb;
}

.btn-process-management:active {
  background-color: #1d4ed8;
}

/* 계산식 영역 안내 메시지 스타일 */
.formula-placeholder {
  padding: 40px 20px;
  text-align: center;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  margin: 20px 0;
}

.placeholder-message {
  color: #6c757d;
  font-size: 16px;
  font-weight: 500;
}

.placeholder-message p {
  margin: 0;
  padding: 0;
}

/* 비활성화된 버튼 스타일 */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #e9ecef;
  border-color: #dee2e6;
  color: #6c757d;
}

/* 비활성화된 컴포넌트 버튼 스타일 */
.btn-component:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #e9ecef;
  border-color: #dee2e6;
  color: #6c757d;
}

/* 비활성화된 공정관리 버튼 스타일 */
.btn-process-management:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #e9ecef;
  border-color: #dee2e6;
  color: #6c757d;
}

/* P&ID 컴포넌트 섹션 여백 */
.pid-component-section {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

/* P&ID 컴포넌트 그리드 스타일 */
.pid-component-section .data-table {
  min-width: 810px; /* 최소 폭 설정 (120+100+120+120+150+100+100) */
  overflow-x: auto;
}

.pid-component-section .data-table table {
  table-layout: fixed;
  width: 100%;
  min-width: 810px;
  border-spacing: 0;
  border-collapse: separate;
}

.pid-component-section .data-table th,
.pid-component-section .data-table td {
  padding: 4px 3px;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 컬럼별 폭 설정 */
.pid-component-section .data-table th:nth-child(1),
.pid-component-section .data-table td:nth-child(1) {
  width: 120px;
  min-width: 120px;
}

.pid-component-section .data-table th:nth-child(2),
.pid-component-section .data-table td:nth-child(2) {
  width: 100px;
  min-width: 100px;
}

.pid-component-section .data-table th:nth-child(3),
.pid-component-section .data-table td:nth-child(3) {
  width: 120px;
  min-width: 120px;
}

.pid-component-section .data-table th:nth-child(4),
.pid-component-section .data-table td:nth-child(4) {
  width: 120px;
  min-width: 120px;
}

.pid-component-section .data-table th:nth-child(5),
.pid-component-section .data-table td:nth-child(5) {
  width: 150px;
  min-width: 150px;
}

.pid-component-section .data-table th:nth-child(6),
.pid-component-section .data-table td:nth-child(6) {
  width: 100px;
  min-width: 100px;
}

.pid-component-section .data-table th:nth-child(7),
.pid-component-section .data-table td:nth-child(7) {
  width: 100px;
  min-width: 100px;
}

/* 입력 필드 스타일 */
.pid-component-section .form-control {
  width: 100%;
  padding: 3px 5px;
  font-size: 12px;
  border: 1px solid #ced4da;
  border-radius: 3px;
}

/* select 요소 스타일 */
.pid-component-section select.form-control {
  background-color: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 5px center;
  background-size: 14px;
  padding-right: 22px;
}

.pid-component-section select.form-control:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* P&ID ID 읽기 전용 표시 스타일 */
.pid-component-section .pid-id-display {
  display: inline-block;
  padding: 6px 8px;
  font-size: 13px;
  color: #495057;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  width: 100%;
  min-height: 32px;
  line-height: 20px;
  font-weight: 500;
}

/* P&ID 컴포넌트 필수입력 필드 스타일 */
.pid-component-section .form-control.required {
  border-left: 3px solid #dc3545;
}

.pid-component-section .form-control.required:focus {
  border-color: #80bdff;
  border-left-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* P&ID 컴포넌트 필수입력 필드 에러 상태 */
.pid-component-section .form-control.required.error {
  border-color: #dc3545;
  border-left-color: #dc3545;
}

.pid-component-section .form-control.required.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

/* P&ID 컴포넌트 추가 버튼 비활성화 스타일 */
.pid-component-section .btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
  background-color: #6c757d;
  border-color: #6c757d;
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.pid-component-section .btn-primary:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* 비활성화된 버튼에 대한 추가 스타일 */
.pid-component-section .btn:disabled:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: #ffffff !important;
}

/* 공정심볼 다운로드 버튼 스타일 */
.download-btn {
  margin-left: 10px;
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #007bff;
  background-color: transparent;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background-color: #007bff;
  color: white;
}

.download-btn:active {
  transform: translateY(1px);
}

/* 계산식 이름과 다운로드 버튼 컨테이너 */
.formula-name-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.formula-name {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

/* 공정카드 파일명과 다운로드 버튼 컨테이너 */
.pfd-filename-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pfd-filename {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

/* Svg 파일 선택 그룹 스타일 */
.file-selection-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #333;
  font-size: 14px;
}

.no-file {
  color: #999;
  font-style: italic;
  font-size: 14px;
}

.readonly-select-display {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  color: #495057;
  font-size: 14px;
  min-height: 38px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>