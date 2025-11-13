<template>
  <div class="pipe-page">
    <div class="page-layout" :class="{ 'detail-open': isDetailPanelOpen }">
      <!-- 메인 콘텐츠 영역 -->
      <div class="main-content">
        <!-- 검색 및 필터 바 -->
        <div class="search-filter-bar">
          <div class="filter-group">
            <div class="filter-item">
              <label for="unit">{{ t("common.unit") }}</label>
              <select id="unit" v-model="selectedUnit" class="form-select">
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
            <div class="filter-item">
              <label for="machineCategory">{{
                t("pipe.materialType")
              }}</label>
              <select
                id="machineCategory"
                v-model="selectedMachineCategory"
                class="form-select"
                @change="handleMachineCategoryChange"
              >
                <option value="">{{ t("common.select") }}</option>
                <option
                  v-for="category in pipeStore.secondDepth"
                  :key="category.code_id"
                  :value="category.code_key"
                >
                  {{ category.code_value }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label for="search">{{ t("common.search") }}</label>
              <input
                type="text"
                id="search"
                :placeholder="t('placeholder.pipeSearch')"
                v-model="searchQueryInput"
                @keyup.enter="handleSearch"
                class="form-input"
              />
              <button class="btn-detail-search" @click="toggleDetailSearch" style="display: none;">
                {{ t("common.detailCondition") }}
                <span class="arrow-icon">{{
                  isDetailSearchOpen ? "▲" : "▼"
                }}</span>
              </button>
              <button class="btn-search" @click="handleSearch">
                {{ t("common.search") }}
              </button>
            </div>
          </div>
        </div>

        <!-- 상세검색 패널 -->
        <div v-if="isDetailSearchOpen" class="detail-search-panel">
          <div class="detail-search-header">
            <h3>{{ t("common.detailCondition") }}</h3>
            <div class="detail-search-row">
              <div class="detail-search-item">
                <label>{{ t("pipe.pipeSubCategory") }}</label>
                <select
                  v-model="detailSearch.headerMachineSubCategory"
                  :disabled="
                    detailSearch.headerMachineCategoryOptions.length === 0
                  "
                  class="form-select"
                  @change="handleHeaderMachineSubCategoryChange"
                >
                  <option value="">{{ t("common.select") }}</option>
                  <option
                    v-for="opt in detailSearch.headerMachineCategoryOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.text }}
                  </option>
                </select>
              </div>
              <div class="detail-search-item">
                <label>{{ t("pipe.pipeCategory") }}</label>
                <select
                  v-model="detailSearch.headerMachineCategory"
                  :disabled="detailSearch.machineCategoryOptions.length === 0"
                  class="form-select"
                  @change="handleHeaderMachineCategoryChange"
                >
                  <option value="">{{ t("common.select") }}</option>
                  <option
                    v-for="opt in detailSearch.machineCategoryOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.text }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="detail-search-content">
            <div class="detail-search-columns">
              <!-- 왼쪽 컬럼 -->
              <div class="detail-search-column">
                <div
                  class="detail-search-item"
                  id="max_capacity_item"
                  style="display: none"
                >
                  <label class="label-capacity">{{
                    t("machine.capacity")
                  }}</label>
                  <input
                    type="number"
                    id="max_capacity"
                    v-model="detailSearch.max_capacity"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="capacity_item"
                  style="display: none"
                >
                  <label class="label-capacity">{{
                    t("machine.capacity")
                  }}</label>
                  <input
                    type="number"
                    id="capacity"
                    v-model="detailSearch.capacity"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="o2_transfer_rate_kgO2_hr_item"
                  style="display: none"
                >
                  <label class="label-capacity">{{
                    t("machine.capacity")
                  }}</label>
                  <input
                    type="number"
                    id="o2_transfer_rate_kgO2_hr"
                    v-model="detailSearch.o2_transfer_rate_kgO2_hr"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="agitated_volume_m3_item"
                  style="display: none"
                >
                  <label class="label-capacity">{{
                    t("machine.capacity")
                  }}</label>
                  <input
                    type="number"
                    id="agitated_volume_m3"
                    v-model="detailSearch.agitated_volume_m3"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="power_kW1_item"
                  style="display: none"
                >
                  <label class="label-power">{{ t("machine.power") }}</label>
                  <input
                    type="number"
                    id="power_kW1"
                    v-model="detailSearch.powerKw1"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="power_kW2_item"
                  style="display: none"
                >
                  <label class="label-power">{{ t("machine.power") }}</label>
                  <input
                    type="number"
                    id="power_kW2"
                    v-model="detailSearch.powerKw2"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>
              </div>

              <!-- 오른쪽 컬럼 -->
              <div class="detail-search-column">
                <div
                  class="detail-search-item"
                  id="pressure_kgf_cm2_item"
                  style="display: none"
                >
                  <label class="label-pressure">{{
                    t("machine.pressure")
                  }}</label>
                  <input
                    type="number"
                    id="pressure_kgf_cm2"
                    v-model="detailSearch.pressure_kgf_cm2"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="discharge_pressure_mmAq_item"
                  style="display: none"
                >
                  <label class="label-pressure">{{
                    t("machine.pressure")
                  }}</label>
                  <input
                    type="number"
                    id="discharge_pressure_mmAq"
                    v-model="detailSearch.discharge_pressure_mmAq"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="max_pump_head_m_item"
                  style="display: none"
                >
                  <label class="label-head">{{ t("machine.head") }}</label>
                  <input
                    type="number"
                    id="max_pump_head_m"
                    v-model="detailSearch.max_pump_head_m"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="max_head_m_item"
                  style="display: none"
                >
                  <label class="label-head">{{ t("machine.head") }}</label>
                  <input
                    type="number"
                    id="max_head_m"
                    v-model="detailSearch.max_head_m"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="max_press_kg_cm2_item"
                  style="display: none"
                >
                  <label class="label-pressure">{{
                    t("machine.pressure")
                  }}</label>
                  <input
                    type="number"
                    id="max_press_kg_cm2"
                    v-model="detailSearch.max_press_kg_cm2"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="diameter_mm_item"
                  style="display: none"
                >
                  <label class="label-diameter">{{
                    t("machine.diameter_mm")
                  }}</label>
                  <input
                    type="number"
                    id="diameter_mm"
                    v-model="detailSearch.diameter_mm"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="dia_phi_mm_item"
                  style="display: none"
                >
                  <label class="label-diameter">{{
                    t("machine.dia_phi_mm")
                  }}</label>
                  <input
                    type="number"
                    id="dia_phi_mm"
                    v-model="detailSearch.dia_phi_mm"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="dia_mm_item"
                  style="display: none"
                >
                  <label class="label-other">{{ t("machine.dia_mm") }}</label>
                  <input
                    type="number"
                    id="dia_mm"
                    v-model="detailSearch.dia_mm"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="height_mm_item"
                  style="display: none"
                >
                  <label class="label-other">{{
                    t("machine.height_mm")
                  }}</label>
                  <input
                    type="number"
                    id="height_mm"
                    v-model="detailSearch.height_mm"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="width_mm_item"
                  style="display: none"
                >
                  <label class="label-other">{{ t("machine.width_mm") }}</label>
                  <input
                    type="number"
                    id="width_mm"
                    v-model="detailSearch.width_mm"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>

                <div
                  class="detail-search-item"
                  id="diffuse_area_m2_item"
                  style="display: none"
                >
                  <label class="label-other">{{
                    t("machine.diffuse_area_m2")
                  }}</label>
                  <input
                    type="number"
                    id="diffuse_area_m2"
                    v-model="detailSearch.diffuse_area_m2"
                    :placeholder="t('placeholder.inputValueAbove')"
                    class="form-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 배관 리스트 헤더 -->
        <div class="pipe-list-header">
          <h2>배관 리스트</h2>
          <div class="action-buttons">
            <button
              class="btn btn-primary btn-register"
              @click="openRegistModal"
            >
              {{ t("common.register") }}
            </button>
            <button
              class="btn btn-primary btn-delete"
              @click="handleDelete"
              :disabled="selectedItems.length === 0"
            >
              {{ t("common.delete") }}
            </button>
          </div>
        </div>

        <!-- 데이터 테이블 -->
        <DataTable
          :columns="tableColumns"
          :data="paginatedMachineList"
          :loading="loading"
          :selectable="true"
          :selected-items="selectedItems"
          :selection-mode="'single'"
          :show-select-all="false"
          :select-header-text="t('common.selectColumn')"
          row-key="equipment_id"
          :stickyHeader="true"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <!-- 순번 슬롯 -->
          <template #cell-no="{ index }">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </template>

          <!-- 단가 슬롯 -->
          <template #cell-unit_price="{ item }">
            {{
              (() => {
                if (!item.output_values) return "-";
                const unitPriceKey = Object.keys(item.output_values).find(
                  (key) => key.startsWith("unit_price")
                );
                if (unitPriceKey && item.output_values[unitPriceKey]?.value) {
                  const unitPriceField = item.output_values[unitPriceKey];
                  return `${unitPriceField.value.toLocaleString()} ${
                    unitPriceField.unit_symbol || ""
                  }`;
                }
                return "-";
              })()
            }}
          </template>

          <!-- 계산식 슬롯 -->
          <template #cell-formula_file_name="{ item }">
            <a
              v-if="item.formula?.download_url"
              :href="item.formula.download_url"
              target="_blank"
              class="link-download"
            >
              {{ item.formula.file_name || "-" }}
            </a>
            <span v-else>{{ item.formula?.file_name || "-" }}</span>
          </template>

          <!-- 계산식 구분 슬롯 -->
          <template #cell-formula_scope="{ item }">
            {{
              item.formula?.is_ownship_formula === true
                ? t("common.equipmentTypeScope")
                : item.formula?.is_ownship_formula === false
                ? t("common.subCategoryScope")
                : "-"
            }}
          </template>

          <!-- 대분류 슬롯 (equipment_type_name은 full_hierarchy에서 파싱) -->
          <template #cell-equipment_type_name="{ item }">
            {{ getMajorCategory(item) }}
          </template>

          <!-- 중분류 슬롯 -->
          <template #cell-middle_category="{ item }">
            {{ getMiddleCategory(item) }}
          </template>

          <!-- 배관유형 슬롯 -->
          <template #cell-pipe_type="{ item }">
            {{ getPipeType(item) }}
          </template>

          <!-- 배관코드 슬롯 (줄바꿈 지원) -->
          <template #cell-equipment_code="{ item }">
            <span style="word-break: break-word; white-space: normal; line-height: 1.4; display: inline-block; max-width: 100%;">{{ item.equipment_code || "-" }}</span>
          </template>

          <!-- 업체명 슬롯 -->
          <template #cell-vendor_name="{ item }">
            {{ item.vendor_info?.vendor_name || "-" }}
          </template>

          <template #cell-fitting="{ item }">
            {{ getAdditionalFieldValue(item, "fitting") }}
          </template>

          <template #cell-body_material="{ item }">
            {{ getAdditionalFieldValue(item, "body_material") }}
          </template>

          <!-- 상세정보 액션 슬롯 -->
          <template #cell-details="{ item }">
            <button class="btn-view" @click.stop="openDetailPanel(item)">
              {{ t("common.view") }}
            </button>
          </template>
        </DataTable>

        <!-- 페이징 -->
        <div class="pagination-container">
          <div class="total-count">
            {{
              t("common.totalCount", {
                count: pipeStore.searchResults?.total || 0,
              })
            }}
          </div>
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPagesComputed"
            @page-change="handlePageChange"
          />
        </div>
      </div>

      <!-- 상세정보 패널 -->
      <div v-if="isDetailPanelOpen" class="detail-panel">
        <div class="detail-panel-header">
          <h3>{{ t("common.detailInfo") }}</h3>
          <div class="header-buttons">
            <button
              v-if="!isDetailEditMode"
              class="btn-edit"
              @click="toggleEditMode"
            >
              {{ t("common.edit") }}
            </button>
            <button
              v-if="isDetailEditMode"
              class="btn-save"
              @click="saveDetailChanges"
            >
              {{ t("common.save") }}
            </button>
            <button
              v-if="isDetailEditMode"
              class="btn-cancel"
              @click="cancelEditMode"
            >
              {{ t("common.cancel") }}
            </button>
            <button
              class="btn-close"
              @click="closeDetailPanel"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div class="detail-panel-body">
          <!-- 모델 썸네일 이미지 영역 -->
          <div class="model-thumbnail-section">
            <div v-if="thumbnailImageUrl" class="thumbnail-image-container">
              <!-- 로딩 오버레이 -->
              <div v-if="isThumbnailLoading" class="thumbnail-loading-overlay">
                <div class="loading-spinner"></div>
                <span class="loading-text">{{ t("common.loading") }}</span>
              </div>
              <!-- 이미지 -->
              <img
                :src="thumbnailImageUrl"
                :alt="t('common.modelThumbnailSection')"
                class="thumbnail-image"
                :class="{ hidden: isThumbnailLoading }"
                @load="isThumbnailLoading = false"
                @error="isThumbnailLoading = false"
              />
            </div>
            <div v-else class="thumbnail-placeholder">
              <span class="thumbnail-text">{{
                t("common.noModelThumbnail")
              }}</span>
            </div>
          </div>

          <div class="detail-tables-container">
            <!-- 사양 정보 -->
            <div class="detail-section">
              <VerticalDataTable
                :data="specVerticalData"
                :loading="false"
                :editMode="isDetailEditMode"
                @field-change="handleFieldChange"
                @file-attach="handleFileAttach"
                @file-remove="handleFileRemove"
                @file-download="handleFileDownload"
              />

              <!-- 숨겨진 파일 input들 -->
              <input
                type="file"
                ref="file3d"
                @change="handleFileSelect('3d', $event)"
                style="display: none"
                accept=".dtdx"
              />
              <input
                type="file"
                ref="fileThumbnail"
                @change="handleFileSelect('thumbnail', $event)"
                style="display: none"
                accept=".jpg,.jpeg,.png,.gif"
              />
              <input
                type="file"
                ref="fileRevit"
                @change="handleFileSelect('revit', $event)"
                style="display: none"
                accept=".rfa"
              />
              <input
                type="file"
                ref="fileSymbol"
                @change="handleFileSelect('symbol', $event)"
                style="display: none"
                accept=".svg"
              />
            </div>

            <!-- 단가이력 -->
            <div class="detail-section price-history-section">
              <h4 class="section-title">{{ t("common.priceHistory") }}</h4>
              <DataTable
                :columns="priceHistoryColumns"
                :data="priceHistoryData"
                :loading="false"
                :selectable="false"
                :stickyHeader="true"
              >
                <!-- 단가 슬롯 -->
                <template #cell-price_value="{ item }">
                  {{
                    item.price_value ? item.price_value.toLocaleString() : "-"
                  }}
                </template>

                <!-- 단가등록일 슬롯 -->
                <template #cell-price_date="{ item }">
                  {{ item.price_date || "-" }}
                </template>

                <!-- 단가유형 슬롯 -->
                <template #cell-price_type="{ item }">
                  {{ item.price_type || "-" }}
                </template>

                <!-- 단위 슬롯 -->
                <template #cell-price_unit_code="{ item }">
                  {{ item.price_unit_code || "-" }}
                </template>

                <!-- 단가 출처 슬롯 -->
                <template #cell-price_reference="{ item }">
                  {{ item.price_reference || "-" }}
                </template>
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 등록 모달: 내부 탭 구성 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container" style="max-width: 1600px; width: 98%">
        <div class="modal-header">
          <h3>{{ t("common.register") }}</h3>
          <button
            class="btn-close"
            @click="closeRegistModal"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <!-- 등록 폼 -->
          <div class="pipe-register-form">
            <!-- 상단 검색/필터 영역 -->
            <div class="filter-bar" style="display: flex; gap: 10px; align-items: center; flex-wrap: nowrap; overflow: hidden;">
              <div class="group-form inline" style="flex-shrink: 0; gap: 4px;">
                <span class="label required" style="min-width: auto; white-space: nowrap;"
                  >⊙ {{ t("common.unit") }}</span
                >
                <select
                  class="input select-md"
                  v-model="registerSelectedUnit"
                  :disabled="registerIsRegistered"
                  style="max-width: 70px; width: 70px; flex-shrink: 0;"
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
              <div class="group-form inline" style="flex-shrink: 0; gap: 4px;">
                <span class="label required" style="min-width: auto; white-space: nowrap;"
                  >⊙ {{ t("pipe.materialType") }}</span
                >
                <select
                  class="input select-md"
                  v-model="registerSelectedPipeName"
                  :disabled="registerIsRegistered"
                  style="max-width: 80px; width: 80px; flex-shrink: 0;"
                >
                  <option value="">{{ t("common.select") }}</option>
                  <option
                    v-for="pipe in pipeStore.secondDepth"
                    :key="pipe.code_id"
                    :value="pipe.code_key"
                  >
                    {{ pipe.code_value }}
                  </option>
                </select>
              </div>
              <div class="group-form inline" style="flex: 1; min-width: 0; gap: 6px;">
                <span class="label required" style="min-width: auto; white-space: nowrap;">⊙ {{ t("common.excelUpload") }}</span>
                <div class="file-upload-group" style="display: flex; gap: 6px; flex: 1; min-width: 0;">
                  <input
                    type="text"
                    class="input file-name-input"
                    :value="registerExcelFileName"
                    readonly
                    :placeholder="t('placeholder.selectFile')"
                    style="flex: 1; min-width: 0; width: 0;"
                  />
                  <input
                    type="file"
                    ref="registerExcelFileInput"
                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    style="display: none"
                    @change="handleRegisterExcelFileChange"
                  />
                  <button
                    type="button"
                    class="btn-file"
                    @click="registerExcelFileInput?.click()"
                    style="flex-shrink: 0; white-space: nowrap;"
                  >
                    {{ t("common.selectFile") }}
                  </button>
                </div>
              </div>
              <div class="group-form inline right-align" style="flex-shrink: 0; gap: 6px;">
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
                  @click="handlePipeRegister"
                >
                  {{ t("common.pipeRegistration") }}
                </button>
              </div>
            </div>

            <!-- 배관 리스트 업로드 영역 -->
            <div class="section-header">
              <div class="section-title">⊙ {{ t("common.pipeUpload") }}</div>
              <div class="section-actions">
                <div class="file-upload-group">
                  <input
                    type="text"
                    class="input file-name-input"
                    :value="registerBulkFileName"
                    readonly
                    :placeholder="t('placeholder.selectFile')"
                  />
                  <input
                    type="file"
                    ref="registerBulkFileInput"
                    accept=".zip"
                    style="display: none"
                    @change="handleRegisterBulkFileChange"
                  />
                  <button
                    type="button"
                    class="btn-file"
                    @click="registerBulkFileInput?.click()"
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
            <div class="model-register-warning">
              ⚠️ 파일명 규칙: 영문만 사용, 공백 불가, 100자 이내, 특수 기호는 "_ - ()"만 허용합니다.
            </div>

            <!-- ZIP 파일 내부 파일 목록 테이블 -->
            <div
              v-if="registerShowZipContents && registerZipFileList.length > 0"
              class="zip-contents-section"
            >
              <h4 class="zip-contents-title">
                {{ t("common.zipFileList") }} ({{
                  t("common.filesCount", { count: registerZipFileList.length })
                }})
              </h4>
              <DataTable
                :columns="registerZipTableColumns"
                :data="registerZipFileList"
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
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRegistModal">
            {{ t("common.close") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import VerticalDataTable from "@/components/common/VerticalDataTable.vue";
import { useI18n } from "vue-i18n";
import { usePipeStore } from "@/stores/pipeStore";

const { t, locale } = useI18n();
const pipeStore = usePipeStore();
const selectedMachineCategory = ref("");

interface PriceHistoryItem {
  price_value: number;
  price_date: string;
  price_type: string;
  price_unit_code: string;
  price_reference: string;
}

interface MachineItem {
  equipment_id: string;
  equipment_code: string;
  equipment_name: string;
  equipment_type: string;
  equipment_type_name?: string;
  manufacturer: string;
  model_number: string;
  // API 응답의 전체 데이터를 포함
  root_equipment_type?: string;
  capacity_unit?: string;
  file_download_url?: string;
  created_at: string;
  description?: string;
  vendor_info?: Record<string, unknown>;
  specifications?: Record<string, Record<string, unknown>>;
  search_criteria?: Record<string, Record<string, unknown>>;
  output_values?: Record<string, Record<string, unknown>>;
  updated_at: string;
  model_file_metadata?: Record<string, unknown>;
  dexpi_interface?: Record<string, unknown>;
  dexpi_component_id?: string;
  symbol_id?: string;
  symbol_metadata?: Record<string, unknown>;
  pressure_unit?: string;
  rfa_file_id?: string;
  is_active: boolean;
  file_name?: string;
  created_by: string;
  hierarchy_info?: Record<string, unknown>;
  model_file_id?: string;
  thumbnail_id?: string;
  power_unit?: string;
  vendor_id?: string;
  formula_id?: string;
  updated_by: string;
  manufacturer_en?: string;
  equipment_price_history?: PriceHistoryItem[];
}

// 테이블 컬럼 설정
const tableColumns = computed<TableColumn[]>(() => {
  const columns: TableColumn[] = [
    { key: "no", title: t("columns.pipe.no"), width: "60px", sortable: false },
    {
      key: "equipment_type_name",
      title: t("columns.pipe.majorCategory"),
      width: "120px",
      sortable: false,
    },
    {
      key: "middle_category",
      title: t("columns.pipe.middleCategory"),
      width: "120px",
      sortable: false,
    },
    {
      key: "pipe_type",
      title: t("columns.pipe.pipeType"),
      width: "120px",
      sortable: false,
    },
    {
      key: "equipment_code",
      title: t("columns.pipe.pcId"),
      width: "180px",
      sortable: false,
    },
    {
      key: "vendor_name",
      title: t("columns.pipe.company"),
      width: "150px",
      sortable: false,
    },
  ];

  if (selectedMachineCategory.value === "P_DI") {
    columns.push({
      key: "fitting",
      title: "피팅방식",
      width: "150px",
      sortable: false,
    });
  } else if (selectedMachineCategory.value === "P_VALV") {
    columns.push({
      key: "body_material",
      title: "몸체 재질",
      width: "150px",
      sortable: false,
    });
  }

  columns.push(
    {
      key: "model_number",
      title: t("columns.pipe.model"),
      width: "150px",
      sortable: false,
    },
    {
      key: "unit_price",
      title: t("columns.pipe.unitPrice"),
      width: "120px",
      sortable: false,
    },
    {
      key: "details",
      title: t("columns.pipe.details"),
      width: "100px",
      sortable: false,
    }
  );

  return columns;
});

// 단가이력 테이블 컬럼 설정
const priceHistoryColumns: TableColumn[] = [
  {
    key: "price_value",
    title: t("common.unitPrice"),
    width: "50px",
    sortable: false,
  },
  {
    key: "price_date",
    title: t("common.unitPriceDate"),
    width: "50px",
    sortable: false,
  },
  {
    key: "price_type",
    title: t("common.priceType"),
    width: "50px",
    sortable: false,
  },
  {
    key: "price_unit_code",
    title: t("common.unit"),
    width: "50px",
    sortable: false,
  },
  {
    key: "price_reference",
    title: "단가 출처",
    width: "100px",
    sortable: false,
  },
];

const machineList = ref<MachineItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const selectedItems = ref<MachineItem[]>([]);
const searchQueryInput = ref("");
// 검색어는 서버에서 처리하므로 클라이언트 사이드 searchQuery 제거
const selectedUnit = ref("");
const isRegistModalOpen = ref(false);
const isDetailPanelOpen = ref(false);
const detailItemData = ref<MachineItem | null>(null);
const thumbnailImageUrl = ref<string>("");
const isThumbnailLoading = ref(false);
const detailPriceReference = ref<string>("");

// 등록 팝업 관련 변수들
const registerIsRegistered = ref(false);
const registerSelectedUnit = ref("");
const registerSelectedPipeName = ref("");
const registerExcelFileInput = ref<HTMLInputElement | null>(null);
const registerExcelFileName = ref<string>("");
const registerExcelFile = ref<File | null>(null);
const registerBulkFileInput = ref<HTMLInputElement | null>(null);
const registerBulkFileName = ref<string>("");
const registerBulkFile = ref<File | null>(null);
const registerZipFileList = ref<
  Array<{
    name: string;
    size: number;
    type: string;
    lastModified?: string;
    result?: string;
    remarks?: string;
  }>
>([]);
const registerShowZipContents = ref(false);
const registerUploadResult = ref<{
  success_files: Array<{ file_name: string; reason?: string }>;
  failed_files: Array<{ file_name: string; reason?: string }>;
  skipped_files: Array<{ file_name: string; reason?: string }>;
} | null>(null);
const registerZipTableColumns: TableColumn[] = [
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

// full_hierarchy 파싱 함수
const parseHierarchy = (fullHierarchy?: string) => {
  if (!fullHierarchy) {
    return {
      majorCategory: null, // 레벨2 (대분류)
      middleCategory: null, // 레벨3 (중분류)
      pipeType: null, // 레벨4 (배관유형)
    };
  }

  // "|"로 레벨 구분
  const levels = fullHierarchy.split("|").map((level) => level.trim());

  const parseLevel = (levelStr: string) => {
    // "(레벨N) 코드 / 한국어명 / 영어명" 형식에서 한국어명 추출
    const match = levelStr.match(/\(레벨\d+\)\s+[^/]+\s+\/\s+([^/]+)\s*\/?/);
    return match ? match[1].trim() : null;
  };

  return {
    majorCategory: levels.length > 1 ? parseLevel(levels[1]) : null, // 레벨2
    middleCategory: levels.length > 2 ? parseLevel(levels[2]) : null, // 레벨3
    pipeType: levels.length > 3 ? parseLevel(levels[3]) : null, // 레벨4
  };
};

// hierarchy_info에서 값을 가져오는 헬퍼 함수들
const getMajorCategory = (item: MachineItem): string => {
  const hierarchyInfo = item.hierarchy_info as { full_hierarchy?: string } | undefined;
  if (hierarchyInfo?.full_hierarchy) {
    const parsed = parseHierarchy(hierarchyInfo.full_hierarchy);
    if (parsed.majorCategory) return parsed.majorCategory;
  }
  return item.equipment_type_name || "-";
};

const getMiddleCategory = (item: MachineItem): string => {
  const hierarchyInfo = item.hierarchy_info as {
    full_hierarchy?: string;
    middle_category_name?: string;
    middle_category?: string;
  } | undefined;
  if (hierarchyInfo?.full_hierarchy) {
    const parsed = parseHierarchy(hierarchyInfo.full_hierarchy);
    if (parsed.middleCategory) return parsed.middleCategory;
  }
  return (
    hierarchyInfo?.middle_category_name ||
    hierarchyInfo?.middle_category ||
    "-"
  );
};

const getPipeType = (item: MachineItem): string => {
  const hierarchyInfo = item.hierarchy_info as { full_hierarchy?: string } | undefined;
  if (hierarchyInfo?.full_hierarchy) {
    const parsed = parseHierarchy(hierarchyInfo.full_hierarchy);
    if (parsed.pipeType) return parsed.pipeType;
  }
  return item.equipment_type || "-";
};

const additionalFieldDefinitions: Record<
  string,
  {
    keyCandidates: string[];
    nameKoCandidates: string[];
    nameEnCandidates?: string[];
  }
> = {
  fitting: {
    keyCandidates: ["fitting", "fitting_code", "fittingType"],
    nameKoCandidates: ["피팅방식", "피팅방식(코드)"],
    nameEnCandidates: ["Fitting", "Fitting Type"],
  },
  body_material: {
    keyCandidates: ["body_material", "bodyMaterial", "body_material_code"],
    nameKoCandidates: ["몸체 재질"],
    nameEnCandidates: ["Body Material"],
  },
};

const formatFieldDisplayValue = (field: Record<string, unknown>): string => {
  if (!field) {
    return "-";
  }

  const rawValue =
    field.value ??
    field.display_value ??
    field.text ??
    field.default_value ??
    field.value_text ??
    field.raw_value;

  if (
    rawValue === null ||
    rawValue === undefined ||
    (typeof rawValue === "string" && rawValue.trim() === "")
  ) {
    return "-";
  }

  const valueText = Array.isArray(rawValue)
    ? rawValue.join(", ")
    : String(rawValue);

  const unit =
    (field.unit_symbol as string | undefined) ||
    (field.unit as string | undefined) ||
    (field.unit_text as string | undefined);

  return unit ? `${valueText} ${unit}` : valueText;
};

const getAdditionalFieldValue = (item: MachineItem, fieldKey: string): string => {
  const definition = additionalFieldDefinitions[fieldKey];
  if (!definition) {
    return "-";
  }

  const containers = [
    item.specifications,
    item.search_criteria,
    item.output_values,
  ] as Array<Record<string, unknown> | undefined>;

  for (const container of containers) {
    if (!container) continue;
    const containerRecord = container as Record<string, unknown>;

    // 1. 직접 키 매칭 시도
    for (const candidate of definition.keyCandidates) {
      const directField = containerRecord[candidate];
      if (
        directField &&
        typeof directField === "object" &&
        directField !== null
      ) {
        return formatFieldDisplayValue(directField as Record<string, unknown>);
      }
    }

    // 2. 객체 값 순회하며 세부 속성 매칭
    for (const value of Object.values(container)) {
      if (typeof value !== "object" || value === null) continue;
      const field = value as Record<string, unknown>;
      const keyCandidate = (field.key ?? field.field_name ?? field.name) as
        | string
        | undefined;
      if (
        keyCandidate &&
        definition.keyCandidates.some(
          (candidate) => candidate.toLowerCase() === keyCandidate.toLowerCase()
        )
      ) {
        return formatFieldDisplayValue(field);
      }

      const nameKo = field.name_kr as string | undefined;
      if (
        nameKo &&
        definition.nameKoCandidates.some(
          (candidate) => candidate.trim() === nameKo.trim()
        )
      ) {
        return formatFieldDisplayValue(field);
      }

      const englishCandidates = definition.nameEnCandidates;
      if (englishCandidates) {
        const nameEn =
          (field.name_en as string | undefined) ||
          (field.key_en as string | undefined);
        if (
          nameEn &&
          englishCandidates.some(
            (candidate) => candidate.toLowerCase() === nameEn.toLowerCase()
          )
        ) {
          return formatFieldDisplayValue(field);
        }
      }
    }
  }

  // 3. item 자체 프로퍼티 확인 (혹시 평탄화된 데이터가 있는 경우)
  const itemRecord = item as unknown as Record<string, unknown | undefined>;
  const flattenedValue = definition.keyCandidates
    .map((candidate) => itemRecord[candidate])
    .find((val) => val !== undefined && val !== null && val !== "");

  if (flattenedValue !== undefined && flattenedValue !== null) {
    return String(flattenedValue);
  }

  return "-";
};



// 상세검색 관련 변수들
const isDetailSearchOpen = ref(false);
const detailSearch = ref({
  machineType: "",
  machineSubtype: "",
  machineCategory: "",
  headerMachineCategory: "",
  headerMachineSubCategory: "",
  headerMachineCategoryOptions: [] as Array<{ value: string; text: string }>,
  machineCategoryOptions: [] as Array<{ value: string; text: string }>,
  // API에서 받은 필드 메타데이터 저장
  fieldsMetadata: {
    search_criteria: [] as any[],
    specifications: [] as any[],
  },
  max_capacity: "",
  capacity: "",
  o2_transfer_rate_kgO2_hr: "",
  agitated_volume_m3: "",
  powerKw1: "",
  powerKw2: "",

  pressure_kgf_cm2: "",
  discharge_pressure_mmAq: "",
  max_pump_head_m: "",
  max_head_m: "",
  max_press_kg_cm2: "",

  dia_mm: "",
  height_mm: "",
  width_mm: "",
  diffuse_area_m2: "",
  diameter_mm: "",
  dia_phi_mm: "",
});

// 헤더 전용 변수는 detailSearch로 통합 관리

// 편집 기능 제거로 관련 상태 제거
const isDetailEditMode = ref(false);

// 편집 모드 데이터
const editData = ref<{
  equipmentType: string;
  equipmentCode: string;
  vendor_id: string;
  modelNumber: string;
  model3dFile: string;
  revitFile: string;
  symbolFile: string;
  thumbnailFile: string;
  is_active: boolean;
  description: string;
  output_values: Record<string, any>;
  search_criteria: Record<string, any>;
  specifications: Record<string, any>;
}>({
  equipmentType: "",
  equipmentCode: "",
  vendor_id: "",
  modelNumber: "",
  model3dFile: "",
  revitFile: "",
  symbolFile: "",
  thumbnailFile: "",
  is_active: true,
  description: "",
  output_values: {},
  search_criteria: {},
  specifications: {},
});

// 원본 데이터 백업 (취소 시 복원용)
const originalItemData = ref<MachineItem | null>(null);

// 콤보박스 옵션들 (API로부터 동적 로드)
const manufacturers = ref<Array<{ value: string; label: string }>>([]);

const getLatestPriceReference = (history?: PriceHistoryItem[]) => {
  if (!history || history.length === 0) {
    return "";
  }

  const parseTime = (value?: string) => {
    if (!value) {
      return Number.NEGATIVE_INFINITY;
    }
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
  };

  return history.reduce((latest, current) => {
    if (!latest) {
      return current;
    }
    return parseTime(current.price_date) > parseTime(latest.price_date)
      ? current
      : latest;
  }).price_reference || "";
};

// VerticalDataTable용 사양 데이터 - 동적 생성
const specVerticalData = computed(() => {
  if (!detailItemData.value) return [];
  const item = detailItemData.value;
  const data: any[] = [];
  const isEnglish = locale.value === "en";

  // 1. 고정 필드
  data.push({
    columnName: t("columns.pipe.type"),
    value: item.equipment_type_name || "-",
  });
  data.push({
    columnName: t("columns.pipe.code"),
    value: isDetailEditMode.value 
      ? (detailItemData.value ? (detailItemData.value as any).equipment_code || "" : "")
      : item.equipment_code || "-",
    editable: false,
    fieldType: "input",
    maxLength: 60, // 최대 60 바이트
  });
  data.push({
    columnName: t("columns.pipe.company"),
    value: isDetailEditMode.value ? item.vendor_id || "" : item.vendor_id || "-",
    editable: false,
    fieldType: "select",
    options: manufacturers.value,
  });
  data.push({
    columnName: t("columns.pipe.model"),
    value: isDetailEditMode.value ? item.model_number || "" : item.model_number || "-",
    editable: false,
    fieldType: "input",
  });

  // 2. output_values 동적 추가
  if (item.output_values) {
    const providerLabel = isEnglish ? "Unit Price Source" : "단가출처";
    Object.entries(item.output_values).forEach(
      ([key, field]: [string, any]) => {
        // 원본 값과 현재 값 비교
        let isChanged = false;
        if (isDetailEditMode.value && originalItemData.value) {
          const originalValue =
            originalItemData.value.output_values?.[key]?.value;
          const currentValue = editData.value.output_values?.[key]?.value;
          // 값 비교 (숫자와 문자열 모두 고려)
          if (originalValue !== currentValue) {
            // null, undefined, 빈 문자열을 모두 동일하게 처리
            const normalizedOriginal =
              originalValue == null || originalValue === ""
                ? null
                : originalValue;
            const normalizedCurrent =
              currentValue == null || currentValue === "" ? null : currentValue;
            isChanged = normalizedOriginal !== normalizedCurrent;
          }
        }

        // 수정 모드일 때는 editData의 값을 사용, 아닐 때는 원본 값 사용
        const displayValue = isDetailEditMode.value
          ? editData.value.output_values?.[key]?.value ?? field.value
          : field.value;

        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: isDetailEditMode.value
            ? displayValue
            : typeof displayValue === "number"
            ? displayValue.toLocaleString()
            : displayValue,
          editable: true,
          fieldType: typeof field.value === "number" ? "number" : "input",
          originalType: typeof field.value,
          isChanged: isChanged, // 변경 여부 추가
        });

        const providerColumnName = `${
          isEnglish ? field.key || "-" : field.name_kr || "-"
        } (${providerLabel})`;
        const providerDisplayValue = isDetailEditMode.value
          ? editData.value.output_values?.[key]?.price_reference ??
            field.price_reference ??
            ""
          : field.price_reference || "-";

        data.push({
          columnName: providerColumnName,
          value: providerDisplayValue,
          editable: isDetailEditMode.value,
          fieldType: "input",
          originalType: "string",
          isChanged:
            isDetailEditMode.value &&
            originalItemData.value?.output_values?.[key]?.price_reference !==
              providerDisplayValue,
        });
      }
    );
  }

  // 3. search_criteria 동적 추가
  if (item.search_criteria) {
    Object.values(item.search_criteria).forEach((field: any) => {
      // 수정 모드이거나 값이 있는 경우 표시
      // if (
      //   isDetailEditMode.value ||
      //   (field.value !== null &&
      //     field.value !== undefined &&
      //     field.value !== "")
      // ) {
      data.push({
        columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
        value: isDetailEditMode.value
          ? field.value
          : typeof field.value === "number"
          ? field.value.toLocaleString()
          : field.value,
        editable: false,
        fieldType: typeof field.value === "number" ? "number" : "input",
        originalType: typeof field.value,
      });
      // }
    });
  }

  // 4. specifications 동적 추가
  if (item.specifications) {
    Object.values(item.specifications).forEach((field: any) => {
      // 수정 모드이거나 값이 있는 경우 표시
      if (
        isDetailEditMode.value ||
        (field.value !== null &&
          field.value !== undefined &&
          field.value !== "")
      ) {
        data.push({
          columnName: isEnglish ? field.key || "-" : field.name_kr || "-",
          value: isDetailEditMode.value
            ? field.value
            : typeof field.value === "number"
            ? field.value.toLocaleString()
            : field.value,
          editable: true,
          fieldType: typeof field.value === "number" ? "number" : "input",
          originalType: typeof field.value,
        });
      }
    });
  }

  // 5. 사용여부 (is_active) 필드 추가
  data.push({
    columnName: isEnglish ? "Usage Status" : "사용여부",
    value: isDetailEditMode.value
      ? item.is_active !== undefined ? item.is_active : true
      : item.is_active !== undefined
      ? item.is_active
        ? isEnglish
          ? "Used"
          : "사용"
        : isEnglish
        ? "Not Used"
        : "미사용"
      : "-",
    editable: true,
    fieldType: "select",
    options: [
      { value: true, label: isEnglish ? "Used" : "사용" },
      { value: false, label: isEnglish ? "Not Used" : "미사용" },
    ],
    originalType: "boolean",
  });

  // 6. 장비설명 (description) 필드 추가
  data.push({
    columnName: isEnglish ? "Equipment Description" : "장비설명",
    value: isDetailEditMode.value
      ? item.description || ""
      : item.description || "-",
    editable: true,
    fieldType: "textarea",
    originalType: "string",
  });

  // 7. 파일 필드 (3D, 썸네일, Revit)
  data.push({
    columnName: "3D",
    value: (item as any).model_file_info?.original_filename || "-",
    filePath: (item as any).model_file_info?.download_url,
    editable: true,
    fieldType: "file",
  });
  data.push({
    columnName: t("common.thumbnail"),
    value: (item as any).thumbnail_file_info?.original_filename || "-",
    filePath: (item as any).thumbnail_file_info?.download_url,
    editable: true,
    fieldType: "file",
  });
  data.push({
    columnName: "Revit",
    value: (item as any).rfa_file_info?.original_filename || "-",
    filePath: (item as any).rfa_file_info?.download_url,
    editable: true,
    fieldType: "file",
  });

  return data;
});

// 단가이력 데이터
const priceHistoryData = computed(() => {
  if (!detailItemData.value || !detailItemData.value.equipment_price_history) {
    return [];
  }
  return detailItemData.value.equipment_price_history;
});

// 검색 필터링은 서버에서 처리하므로 클라이언트 사이드 필터링 제거

// API 응답에서 페이징 정보를 받아오므로 서버 사이드 페이징 사용
const totalPagesComputed = computed(
  () => pipeStore.searchResults?.total_pages || 1
);

const paginatedMachineList = computed(() => {
  return machineList.value; // API에서 이미 페이징된 데이터를 받아옴
});

// (기존 단일 등록 폼 유효성 제거)

const handleSelectionChange = (selected: MachineItem[]) => {
  selectedItems.value = selected;
};

// 행 클릭 (RoleManagement.vue 패턴 적용)
const handleRowClick = (row: MachineItem) => {
  console.log("행 클릭된 데이터:", row); // 디버깅용 로그
  selectedItems.value = [row];
  console.log("선택된 아이템:", selectedItems.value); // 디버깅용 로그
};

// 페이지 변경 (RoleManagement.vue 패턴 적용)
const handlePageChange = async (page: number) => {
  currentPage.value = page;
  selectedItems.value = []; // 체크된 row 초기화
  await loadData();
};

// 검색 처리 (RoleManagement.vue 패턴 적용)
const handleSearch = async () => {
  selectedItems.value = []; // 체크된 row 초기화
  currentPage.value = 1;
  await loadData();
};

const resetRegisterModalState = () => {
  registerIsRegistered.value = false;
  registerSelectedUnit.value = "";
  registerSelectedPipeName.value = "";
  registerExcelFileName.value = "";
  registerExcelFile.value = null;
  if (registerExcelFileInput.value) {
    registerExcelFileInput.value.value = "";
  }
  registerBulkFileName.value = "";
  registerBulkFile.value = null;
  if (registerBulkFileInput.value) {
    registerBulkFileInput.value.value = "";
  }
  registerZipFileList.value = [];
  registerShowZipContents.value = false;
  registerUploadResult.value = null;
};

const openRegistModal = () => {
  resetRegisterModalState();
  isRegistModalOpen.value = true;
};

const closeRegistModal = async () => {
  isRegistModalOpen.value = false;
  // 등록 모달 닫을 때 데이터 새로고침
  await loadData();
};

// 파일 크기 포맷팅 함수
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 업로드 결과에 따라 registerZipFileList 업데이트
const updateRegisterZipFileListWithResult = (resultData: any) => {
  if (!resultData?.details) return;

  const { success_files, failed_files, skipped_files } = resultData.details;

  // registerZipFileList의 각 항목에 대해 결과와 비고를 매핑
  registerZipFileList.value = registerZipFileList.value.map((file) => {
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
const extractRegisterZipContents = async (file: File) => {
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
      registerZipFileList.value = [fileInfo];
      registerShowZipContents.value = true;
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
    let hasAllowedFile = false;

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
      registerZipFileList.value = [];
      registerShowZipContents.value = false;
      registerBulkFileName.value = "";
      registerBulkFile.value = null;
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

    registerZipFileList.value = fileList;
    registerShowZipContents.value = true;
  } catch (error) {
    console.error("ZIP 파일 읽기 실패:", error);
    alert(t("messages.warning.zipReadFail"));
    registerZipFileList.value = [];
    registerShowZipContents.value = false;
    registerBulkFile.value = null;
  }
};

// 공통 검증 함수: 단위 및 자재유형 필수 체크
const validateRegisterBasicSelections = (): boolean => {
  if (!registerSelectedUnit.value) {
    alert(t("messages.warning.selectUnit"));
    return false;
  }

  if (!registerSelectedPipeName.value) {
    alert(t("messages.warning.selectMachineMajorCategory"));
    return false;
  }

  return true;
};

// 엑셀 파일 선택 핸들러
const handleRegisterExcelFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    registerExcelFileName.value = file.name;
    registerExcelFile.value = file;
  }
};

// ZIP 파일 선택 핸들러
const handleRegisterBulkFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    registerBulkFileName.value = file.name;
    registerBulkFile.value = file;
    await extractRegisterZipContents(file);
  }
};

// 엑셀 템플릿 다운로드
const onDownloadExcelTemplate = async () => {
  if (!validateRegisterBasicSelections()) return;

  try {
    const response = await pipeStore.downloadExcelTemplate(
      registerSelectedPipeName.value
    );

    // download_url로 파일 다운로드
    const downloadUrl = response?.response?.data?.files?.[0]?.download_url;
    const originalFilename =
      response?.response?.data?.files?.[0]?.original_filename;

    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = originalFilename || "template.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert(t("messages.error.downloadFailed"));
    }
  } catch (error) {
    console.error("템플릿 다운로드 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : t("messages.error.downloadFailed");
    alert(errorMessage);
  }
};

// 배관 등록 핸들러
const handlePipeRegister = async () => {
  if (!validateRegisterBasicSelections()) return;

  if (!registerExcelFileName.value || !registerExcelFile.value) {
    alert(t("messages.warning.selectExcelFile"));
    return;
  }

  try {
    // pipeStore의 uploadPipeExcel 함수 호출
    const response = await pipeStore.uploadPipeExcel(
      registerSelectedPipeName.value,
      registerExcelFile.value
    );

    // API 응답에서 summary 정보 추출
    const apiResponse = response?.response as any;
    const summary = apiResponse?.data?.summary || apiResponse?.summary;

    if (summary) {
      const totalInserted = summary.total_inserted_rows || 0;
      const totalFailed = summary.total_failed_rows || 0;
      const totalUploaded = totalInserted + totalFailed;

      // 등록 결과 메시지 생성
      const resultMessage = `[등록결과]\n업로드 ${totalUploaded}건\n성공 ${totalInserted}건\n에러 ${totalFailed}건`;
      alert(resultMessage);
    } else {
      alert(t("messages.success.machineRegistered"));
    }

    // 성공 시 초기화
    registerExcelFileName.value = "";
    registerExcelFile.value = null;
    if (registerExcelFileInput.value) {
      registerExcelFileInput.value.value = "";
    }
    registerIsRegistered.value = true;
  } catch (error) {
    console.error("배관 등록 실패:", error);
    const errorMessage =
      error instanceof Error ? error.message : t("messages.error.saveFailed");
    alert(errorMessage);
  }
};

// 모델 등록 핸들러
const handleModelRegister = async () => {
  if (!validateRegisterBasicSelections()) return;

  if (!registerBulkFileName.value || !registerBulkFile.value) {
    alert(t("messages.warning.selectModelFile"));
    return;
  }

  try {
    // pipeStore의 uploadModelZip 함수 호출
    const response = await pipeStore.uploadModelZip(
      registerSelectedPipeName.value,
      registerBulkFile.value
    );

    // 업로드 결과 저장 및 그리드 업데이트
    const apiResponse = response?.response as any;
    const resultData = apiResponse?.data?.data;

    if (resultData?.summary && resultData?.details) {
      registerUploadResult.value = resultData.details;

      // registerZipFileList를 업로드 결과로 업데이트
      updateRegisterZipFileListWithResult(resultData);

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
    const errorMessage =
      error instanceof Error ? error.message : t("messages.error.saveFailed");
    alert(errorMessage);
  }
};

const handleDelete = async () => {
  if (selectedItems.value.length === 0) {
    alert(t("messages.warning.pleaseSelectItemToDelete"));
    return;
  }
  if (
    confirm(
      t("messages.confirm.deleteItems", { count: selectedItems.value.length })
    )
  ) {
    try {
      // 선택된 항목들에 대해 삭제 API 호출
      for (const item of selectedItems.value) {
        const deleteParams = {
          model_file_id: item.model_file_id,
          rfa_file_id: item.rfa_file_id,
          symbol_id: item.symbol_id,
          thumbnail_id: item.thumbnail_id,
          formula_id: item.formula_id,
        };

        await pipeStore.deletePipe(item.equipment_id, deleteParams);
      }

      selectedItems.value = [];
      alert(t("messages.success.deleted"));

      // 삭제 후 데이터 재조회
      await loadData();
    } catch (error) {
      console.error("삭제 실패:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("messages.error.deleteFailed");
      alert(errorMessage);
    }
  }
};

const openDetailPanel = async (item: MachineItem) => {
  // 이전 썸네일 초기화 (새 항목을 열 때마다 초기화)
  thumbnailImageUrl.value = "";
  isThumbnailLoading.value = false;

  // 단가이력에서 각 필드별 최신 단가출처를 output_values에 설정
  if (item.equipment_price_history && item.output_values) {
    const priceHistory = item.equipment_price_history;
    const parseTime = (value?: string) => {
      if (!value) {
        return Number.NEGATIVE_INFINITY;
      }
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? Number.NEGATIVE_INFINITY : time;
    };

    // 각 output_values 필드에 대해 해당 price_type의 최신 price_reference 찾기
    Object.entries(item.output_values).forEach(([key, field]: [string, any]) => {
      const priceType = (field.key || "").toUpperCase();
      if (priceType) {
        // 해당 price_type의 최신 이력 찾기
        const latestHistory = priceHistory
          .filter((h: PriceHistoryItem) => h.price_type?.toUpperCase() === priceType)
          .reduce((latest: PriceHistoryItem | null, current: PriceHistoryItem) => {
            if (!latest) {
              return current;
            }
            return parseTime(current.price_date) > parseTime(latest.price_date)
              ? current
              : latest;
          }, null);

        if (latestHistory && latestHistory.price_reference && item.output_values) {
          // output_values에 price_reference 설정
          if (!item.output_values[key]) {
            item.output_values[key] = {};
          }
          item.output_values[key].price_reference = latestHistory.price_reference;
        }
      }
    });
  }

  // 원본 데이터 백업 (깊은 복사) - price_reference 설정 후 백업
  originalItemData.value = JSON.parse(JSON.stringify(item));
  detailItemData.value = item;
  detailPriceReference.value = getLatestPriceReference(
    item.equipment_price_history
  );
  isDetailPanelOpen.value = true;
  isDetailEditMode.value = false;

  try {
    // 기계 공통 상세 정보 조회
    if (item.root_equipment_type) {
      const response = await pipeStore.fetchPipeDetailCommon(
        item.root_equipment_type
      );

      // 제조사 목록을 manufacturers에 세팅
      if (response?.response?.data) {
        manufacturers.value = response.response.data.map((vendor: any) => ({
          value: vendor.vendor_id,
          label: vendor.vendor_name,
        }));
      }
    }

    // 썸네일 이미지 URL 처리 - download_url 사용
    const thumbnailInfo = (item as any).thumbnail_file_info;
    if (thumbnailInfo?.download_url) {
      isThumbnailLoading.value = true;
      thumbnailImageUrl.value = thumbnailInfo.download_url;
    } else {
      thumbnailImageUrl.value = "";
    }
  } catch (error) {
    console.error("상세 정보 조회 실패:", error);
    isThumbnailLoading.value = false;
  }
};
const closeDetailPanel = () => {
  isDetailPanelOpen.value = false;
  detailItemData.value = null;
  originalItemData.value = null;
  isDetailEditMode.value = false;
  detailPriceReference.value = "";

  // 썸네일 이미지 URL 및 로딩 상태 초기화
  thumbnailImageUrl.value = "";
  isThumbnailLoading.value = false;
};

const toggleEditMode = () => {
  if (!isDetailEditMode.value && detailItemData.value) {
    // 편집 모드로 들어갈 때 현재 데이터로 editData 초기화
    editData.value = {
      equipmentType: detailItemData.value.equipment_type || "",
      equipmentCode: detailItemData.value.equipment_code || "",
      vendor_id: detailItemData.value.vendor_id || "",
      modelNumber: detailItemData.value.model_number || "",
      model3dFile: "",
      revitFile: "",
      symbolFile: "",
      thumbnailFile: "",
      is_active: detailItemData.value.is_active || true,
      description: detailItemData.value.description || "",
      output_values: {},
      search_criteria: {},
      specifications: {},
    };

    // output_values, search_criteria, specifications 초기화 (전체 객체 구조 유지)
    const item = detailItemData.value;

    if (item.output_values) {
      Object.entries(item.output_values).forEach(
        ([key, field]: [string, any]) => {
          // 전체 필드 객체를 복사하되, value만 editData에서 관리
          editData.value.output_values[key] = { ...field };
        }
      );
    }

    if (item.search_criteria) {
      Object.entries(item.search_criteria).forEach(
        ([key, field]: [string, any]) => {
          // 전체 필드 객체를 복사하되, value만 editData에서 관리
          editData.value.search_criteria[key] = { ...field };
        }
      );
    }

    if (item.specifications) {
      Object.entries(item.specifications).forEach(
        ([key, field]: [string, any]) => {
          // 전체 필드 객체를 복사하되, value만 editData에서 관리
          editData.value.specifications[key] = { ...field };
        }
      );
    }
  }
  isDetailEditMode.value = !isDetailEditMode.value;
};

const cancelEditMode = () => {
  // 수정 모드 취소 시 원본 데이터로 되돌리기
  if (originalItemData.value && detailItemData.value) {
    // 원본 데이터로 복원 (깊은 복사)
    detailItemData.value = JSON.parse(JSON.stringify(originalItemData.value));
    detailPriceReference.value = getLatestPriceReference(
      originalItemData.value.equipment_price_history
    );

    // 썸네일 이미지 URL도 복원
    const thumbnailInfo = (originalItemData.value as any).thumbnail_file_info;
    if (thumbnailInfo?.download_url) {
      thumbnailImageUrl.value = thumbnailInfo.download_url;
    } else {
      thumbnailImageUrl.value = "";
    }
  }

  // editData 초기화
  editData.value = {
    equipmentType: "",
    equipmentCode: "",
    vendor_id: "",
    modelNumber: "",
    model3dFile: "",
    revitFile: "",
    symbolFile: "",
    thumbnailFile: "",
    is_active: true,
    description: "",
    output_values: {},
    search_criteria: {},
    specifications: {},
  };

  // 선택된 파일 객체 초기화
  selected3dFile.value = null;
  selectedRevitFile.value = null;
  selectedSymbolFile.value = null;
  selectedThumbnailFile.value = null;

  isDetailEditMode.value = false;
};

const saveDetailChanges = async () => {
  if (!detailItemData.value) return;

  // 업체명 필수 검증
  if (!editData.value.vendor_id) {
    alert(t("messages.warning.selectManufacturer"));
    return;
  }

  try {
    const item = detailItemData.value;

    // 업데이트 파라미터 준비 (Machine.vue와 동일한 형식)
    const updateParams: any = {
      equipment_type: item.equipment_type,
      equipment_code: editData.value.equipmentCode || item.equipment_code || "",
      vendor_id: editData.value.vendor_id,
      model_number: editData.value.modelNumber,
    };

    // is_active와 description 추가
    if (editData.value.is_active !== undefined) {
      updateParams.is_active = editData.value.is_active;
    }
    if (editData.value.description !== undefined) {
      updateParams.description = editData.value.description;
    }

    // output_values, search_criteria, specifications 추가
    if (Object.keys(editData.value.output_values).length > 0) {
      updateParams.output_values = editData.value.output_values;
    }
    if (Object.keys(editData.value.search_criteria).length > 0) {
      updateParams.search_criteria = editData.value.search_criteria;
    }
    if (Object.keys(editData.value.specifications).length > 0) {
      updateParams.specifications = editData.value.specifications;
    }

    console.log("업데이트 파라미터:", updateParams);

    // 새로 추가된 파일들 확인 (저장된 File 객체 사용)
    if (selected3dFile.value) {
      updateParams.dtd_model_file = selected3dFile.value;
    }
    if (selectedThumbnailFile.value) {
      updateParams.thumbnail_file = selectedThumbnailFile.value;
    }
    if (selectedRevitFile.value) {
      updateParams.revit_model_file = selectedRevitFile.value;
    }
    if (selectedSymbolFile.value) {
      updateParams.symbol_file = selectedSymbolFile.value;
    }

    console.log("최종 업데이트 파라미터 (파일 포함):", updateParams);

    // API 호출
    const response = await pipeStore.updatePipe(
      item.equipment_id,
      updateParams
    );

    // API 응답 결과 console 출력
    console.log("상세정보 저장 API 응답:", response);

    if (response?.success) {
      // 저장 성공 후 편집 모드 종료
      isDetailEditMode.value = false;

      const createdPriceHistoryEntries: PriceHistoryItem[] = [];

      // output_values의 변경된 항목만 로그 출력 및 가격 이력 생성
      if (originalItemData.value && originalItemData.value.output_values) {
        for (const [key, originalField] of Object.entries(
          originalItemData.value.output_values
        )) {
          const originalValue = (originalField as any)?.value;
          const currentValue = editData.value.output_values?.[key]?.value;

          // 값 비교 (null, undefined, 빈 문자열을 모두 동일하게 처리)
          const normalizedOriginal =
            originalValue == null || originalValue === ""
              ? null
              : originalValue;
          const normalizedCurrent =
            currentValue == null || currentValue === "" ? null : currentValue;

          const isChanged = normalizedOriginal !== normalizedCurrent;

          if (isChanged) {
            // 가격 이력 생성 API 호출
            try {
              const currentField =
                editData.value.output_values?.[key] || originalField;
              await pipeStore.createPriceHistory({
                equipment_id: item.equipment_id,
                equipment_code: item.equipment_code,
                price_type: (currentField as any)?.key?.toUpperCase() || "",
                price_unit_code:
                  (currentField as any)?.unit_code ||
                  (originalField as any)?.unit_code,
                price_unit_symbol:
                  (currentField as any)?.unit_symbol ||
                  (originalField as any)?.unit_symbol,
                price_value: currentValue,
                price_reference:
                  (currentField as any)?.price_reference ??
                  (originalField as any)?.price_reference ??
                  "",
              });

              createdPriceHistoryEntries.push({
                price_value:
                  typeof currentValue === "number"
                    ? currentValue
                    : Number(currentValue) || 0,
                price_date: new Date().toISOString(),
                price_type:
                  (currentField as any)?.key?.toUpperCase() ||
                  (originalField as any)?.key?.toUpperCase() ||
                  "",
                price_unit_code:
                  (currentField as any)?.unit_code ||
                  (originalField as any)?.unit_code ||
                  "",
                price_reference:
                  (currentField as any)?.price_reference ??
                  (originalField as any)?.price_reference ??
                  "",
              });
            } catch (error) {
              console.error(`가격 이력 생성 실패 (${key}):`, error);
            }
          }
        }
      }
      
      // 선택된 파일 객체 초기화
      selected3dFile.value = null;
      selectedRevitFile.value = null;
      selectedSymbolFile.value = null;
      selectedThumbnailFile.value = null;
      
      // 응답에 오류 메시지가 있는 경우 경고 표시
      const errorMessage = response?.message || response?.response?.message;
      if (errorMessage && errorMessage.trim() !== "") {
        alert(errorMessage);
      } else {
        alert(t("messages.success.saved"));
      }

      // 데이터 새로고침 (loadData에서 상세정보창 닫기 처리)
      await loadData();

      if (createdPriceHistoryEntries.length > 0) {
        const refreshedItem = machineList.value.find(
          (machine) => machine.equipment_id === item.equipment_id
        );

        if (refreshedItem) {
          detailItemData.value = refreshedItem;
          originalItemData.value = JSON.parse(JSON.stringify(refreshedItem));
        } else if (detailItemData.value) {
          detailItemData.value.equipment_price_history =
            detailItemData.value.equipment_price_history || [];

          createdPriceHistoryEntries.forEach((entry) => {
            detailItemData.value!.equipment_price_history!.push(entry);
          });
        }
      }
    } else {
      throw new Error(response?.message || "저장에 실패했습니다.");
    }
  } catch (error) {
    console.error("저장 중 오류 발생:", error);
    alert(t("messages.error.saveFailed"));
  }
};

// 파일 첨부 관련 함수들

const handleFileSelect = (type: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // 파일 확장자 validation
    const allowedExtensions = {
      "3d": [".dtdx"],
      revit: [".rfa"],
      symbol: [".svg"],
      thumbnail: [".jpg", ".jpeg", ".png", ".gif"],
    };

    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    const allowedExts =
      allowedExtensions[type as keyof typeof allowedExtensions];

    if (!allowedExts.includes(fileExtension)) {
      alert(
        `허용되지 않는 파일 형식입니다.\n허용된 확장자: ${allowedExts.join(
          ", "
        )}`
      );
      // 파일 input 초기화
      target.value = "";
      return;
    }

    switch (type) {
      case "3d":
        editData.value.model3dFile = file.name;
        selected3dFile.value = file; // 파일 객체 저장
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          if (!(detailItemData.value as any).model_file_info) {
            (detailItemData.value as any).model_file_info = {};
          }
          (detailItemData.value as any).model_file_info.original_filename =
            file.name;
        }
        break;
      case "revit":
        editData.value.revitFile = file.name;
        selectedRevitFile.value = file; // 파일 객체 저장
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          if (!(detailItemData.value as any).rfa_file_info) {
            (detailItemData.value as any).rfa_file_info = {};
          }
          (detailItemData.value as any).rfa_file_info.original_filename =
            file.name;
        }
        break;
      case "symbol":
        editData.value.symbolFile = file.name;
        selectedSymbolFile.value = file; // 파일 객체 저장
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          if (!(detailItemData.value as any).symbol_file_info) {
            (detailItemData.value as any).symbol_file_info = {};
          }
          (detailItemData.value as any).symbol_file_info.original_filename =
            file.name;
        }
        break;
      case "thumbnail":
        editData.value.thumbnailFile = file.name;
        selectedThumbnailFile.value = file; // 파일 객체 저장
        // 그리드 데이터도 업데이트
        if (detailItemData.value) {
          if (!(detailItemData.value as any).thumbnail_file_info) {
            (detailItemData.value as any).thumbnail_file_info = {};
          }
          (detailItemData.value as any).thumbnail_file_info.original_filename =
            file.name;
        }
        break;
    }
    console.log(`${type} 파일 선택됨:`, file.name);
  }
};

// 그리드에서 필드 변경 처리
const handleFieldChange = (fieldName: string, value: string | boolean | number) => {
  const isEnglish = locale.value === "en";

  // editData에 반영
  // 배관코드 필드 확인 (columns.pipe.code)
  if (fieldName === t("columns.pipe.code")) {
    // 60바이트 제한 적용
    const strValue = String(value);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(strValue);
    if (bytes.length > 60) {
      // 60바이트를 초과하면 잘라냄
      let truncated = "";
      for (let i = 0; i < strValue.length; i++) {
        const test = truncated + strValue[i];
        if (encoder.encode(test).length > 60) {
          break;
        }
        truncated = test;
      }
      editData.value.equipmentCode = truncated;
      if (detailItemData.value) {
        detailItemData.value.equipment_code = truncated;
      }
      alert("배관코드는 최대 60바이트까지 입력 가능합니다.");
    } else {
      editData.value.equipmentCode = strValue;
      if (detailItemData.value) {
        detailItemData.value.equipment_code = strValue;
      }
    }
  }
  // 제조사 필드 확인 (columns.pipe.company)
  else if (fieldName === t("columns.pipe.company")) {
    editData.value.vendor_id = String(value);
    if (detailItemData.value) {
      detailItemData.value.vendor_id = String(value);
    }
    console.log("vendor_id 업데이트:", value);
  }
  // 모델명 필드 확인 (columns.pipe.model)
  else if (fieldName === t("columns.pipe.model")) {
    editData.value.modelNumber = String(value);
    if (detailItemData.value) {
      detailItemData.value.model_number = String(value);
    }
    console.log("modelNumber 업데이트:", value);
  }
  // 사용여부 필드 확인
  else if (fieldName === (isEnglish ? "Usage Status" : "사용여부")) {
    // value는 문자열이거나 실제 boolean 값일 수 있음
    let boolValue = false;
    if (typeof value === "boolean") {
      boolValue = value;
    } else {
      const strValue = String(value);
      boolValue = strValue === "true" || strValue === "사용" || strValue === "Used";
    }
    editData.value.is_active = boolValue;
    if (detailItemData.value) {
      detailItemData.value.is_active = boolValue;
    }
    console.log("is_active 업데이트:", boolValue);
  }
  // 장비설명 필드 확인
  else if (fieldName === (isEnglish ? "Equipment Description" : "장비설명")) {
    editData.value.description = String(value);
    if (detailItemData.value) {
      detailItemData.value.description = String(value);
    }
    console.log("description 업데이트:", value);
  }
  // 동적 필드 처리 (output_values, search_criteria, specifications)
  else {
    // detailItemData에서 해당 필드 찾기
    const item = detailItemData.value;
    if (!item) return;

    const providerSuffix = isEnglish
      ? " (Unit Price Source)"
      : " (단가출처)";

    // output_values에서 찾기
    if (item.output_values) {
      if (fieldName.endsWith(providerSuffix)) {
        const baseFieldName = fieldName.slice(
          0,
          fieldName.length - providerSuffix.length
        );
        const providerField = Object.entries(item.output_values).find(
          ([_, field]: [string, any]) => {
            const displayName = isEnglish ? field.key : field.name_kr;
            return displayName === baseFieldName;
          }
        );
        if (providerField) {
          const [key] = providerField;
          if (editData.value.output_values[key]) {
            const strValue = typeof value === "string" ? value.trim() : String(value);
            editData.value.output_values[key].price_reference = strValue;
          }
          return;
        }
      }

      const outputField = Object.entries(item.output_values).find(
        ([_, field]: [string, any]) => {
          const displayName = isEnglish ? field.key : field.name_kr;
          return displayName === fieldName;
        }
      );
      if (outputField) {
        const [key] = outputField;
                        // 객체 구조를 유지하면서 value만 업데이트
                if (editData.value.output_values[key]) {
                  // 입력값이 숫자로만 구성되어 있으면 Number로 변환
                  const strValue = String(value);
                  const numValue = Number(strValue);
                  editData.value.output_values[key].value =
                    !isNaN(numValue) && strValue !== "" ? numValue : strValue;
                  // detailItemData도 업데이트
                  if (item.output_values[key]) {
                    item.output_values[key].value = editData.value.output_values[key].value;
                  }
                }
        console.log(`output_values.${key}.value 업데이트:`, value);
        return;
      }
    }

    // search_criteria에서 찾기
    if (item.search_criteria) {
      const searchField = Object.entries(item.search_criteria).find(
        ([_, field]: [string, any]) => {
          const displayName = isEnglish ? field.key : field.name_kr;
          return displayName === fieldName;
        }
      );
      if (searchField) {
        const [key] = searchField;
                        // 객체 구조를 유지하면서 value만 업데이트
                if (editData.value.search_criteria[key]) {
                  // 입력값이 숫자로만 구성되어 있으면 Number로 변환
                  const strValue = String(value);
                  const numValue = Number(strValue);
                  editData.value.search_criteria[key].value =
                    !isNaN(numValue) && strValue !== "" ? numValue : strValue;
                  // detailItemData도 업데이트
                  if (item.search_criteria[key]) {
                    item.search_criteria[key].value = editData.value.search_criteria[key].value;
                  }
                }
        console.log(`search_criteria.${key}.value 업데이트:`, value);
        return;
      }
    }

    // specifications에서 찾기
    if (item.specifications) {
      const specField = Object.entries(item.specifications).find(
        ([_, field]: [string, any]) => {
          const displayName = isEnglish ? field.key : field.name_kr;
          return displayName === fieldName;
        }
      );
      if (specField) {
        const [key] = specField;
                        // 객체 구조를 유지하면서 value만 업데이트
                if (editData.value.specifications[key]) {
                  // 입력값이 숫자로만 구성되어 있으면 Number로 변환
                  const strValue = String(value);
                  const numValue = Number(strValue);
                  editData.value.specifications[key].value =
                    !isNaN(numValue) && strValue !== "" ? numValue : strValue;
                  // detailItemData도 업데이트
                  if (item.specifications[key]) {
                    item.specifications[key].value = editData.value.specifications[key].value;
                  }
                }
        console.log(`specifications.${key}.value 업데이트:`, value);
        return;
      }
    }
  }
};

// 파일 input refs
const file3d = ref<HTMLInputElement>();
const fileRevit = ref<HTMLInputElement>();
const fileSymbol = ref<HTMLInputElement>();
const fileThumbnail = ref<HTMLInputElement>();

// 선택된 파일 객체 저장 (저장 시 사용)
const selected3dFile = ref<File | null>(null);
const selectedRevitFile = ref<File | null>(null);
const selectedSymbolFile = ref<File | null>(null);
const selectedThumbnailFile = ref<File | null>(null);

// 그리드에서 파일 첨부 처리
const handleFileAttach = (fieldName: string) => {
  console.log(`파일 첨부 요청: ${fieldName}`);

  switch (fieldName) {
    case "3D":
      if (file3d.value) {
        file3d.value.click();
      }
      break;
    case "Revit":
      if (fileRevit.value) {
        fileRevit.value.click();
      }
      break;
    case t("common.symbol"):
      if (fileSymbol.value) {
        fileSymbol.value.click();
      }
      break;
    case t("common.thumbnail"):
      if (fileThumbnail.value) {
        fileThumbnail.value.click();
      }
      break;
    default:
      console.error(`지원하지 않는 필드명: ${fieldName}`);
  }
};

// 그리드에서 파일 첨부 취소 처리
const handleFileRemove = (fieldName: string) => {
  console.log(`파일 첨부 취소 요청: ${fieldName}`);

  switch (fieldName) {
    case "3D":
      editData.value.model3dFile = "";
      selected3dFile.value = null; // 저장된 파일 객체 초기화
      if (detailItemData.value) {
        // 기존 파일 정보 초기화
        (detailItemData.value as any).model_file_info = null;
      }
      // 파일 input 초기화
      if (file3d.value) {
        file3d.value.value = "";
      }
      break;
    case "Revit":
      editData.value.revitFile = "";
      selectedRevitFile.value = null; // 저장된 파일 객체 초기화
      if (detailItemData.value) {
        // 기존 파일 정보 초기화
        (detailItemData.value as any).rfa_file_info = null;
      }
      // 파일 input 초기화
      if (fileRevit.value) {
        fileRevit.value.value = "";
      }
      break;
    case t("common.symbol"):
      editData.value.symbolFile = "";
      selectedSymbolFile.value = null; // 저장된 파일 객체 초기화
      if (detailItemData.value) {
        // 기존 파일 정보 초기화
        (detailItemData.value as any).symbol_file_info = null;
      }
      // 파일 input 초기화
      if (fileSymbol.value) {
        fileSymbol.value.value = "";
      }
      break;
    case t("common.thumbnail"):
      editData.value.thumbnailFile = "";
      selectedThumbnailFile.value = null; // 저장된 파일 객체 초기화
      if (detailItemData.value) {
        // 기존 파일 정보 초기화
        (detailItemData.value as any).thumbnail_file_info = null;
      }
      // 파일 input 초기화
      if (fileThumbnail.value) {
        fileThumbnail.value.value = "";
      }
      break;
    default:
      console.error(`지원하지 않는 필드명: ${fieldName}`);
  }
};

// 파일 다운로드 핸들러
const handleFileDownload = (fieldName: string) => {
  console.log(`파일 다운로드 요청: ${fieldName}`);

  if (!detailItemData.value) return;

  const item = detailItemData.value;
  let fileInfo = null;

  // 필드명에 따라 파일 정보 가져오기
  switch (fieldName) {
    case "3D":
      fileInfo = (item as any).model_file_info;
      break;
    case t("common.thumbnail"):
      fileInfo = (item as any).thumbnail_file_info;
      break;
    case "Revit":
      fileInfo = (item as any).rfa_file_info;
      break;
    case t("common.symbol"):
      fileInfo = (item as any).symbol_file_info;
      break;
  }

  // download_url이 있으면 다운로드
  if (fileInfo?.download_url) {
    const downloadUrl = fileInfo.download_url;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileInfo.original_filename || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    alert(t("messages.warning.noFileToDownload"));
  }
};

// 데이터 로드 함수
// 데이터 로드 (RoleManagement.vue 패턴 적용)
const loadData = async () => {
  try {
    // 상세검색이 열려있고 기계유형 옵션이 있는데 선택하지 않은 경우
    if (
      isDetailSearchOpen.value &&
      detailSearch.value.machineCategoryOptions.length > 0 &&
      !detailSearch.value.headerMachineCategory
    ) {
      alert(t("messages.warning.selectPipeType"));
      return;
    }

    // 체크된 row 초기화
    selectedItems.value = [];

    // 기본 검색 파라미터
    const searchParams: any = {
      keyword: searchQueryInput.value,
      root_equipment_type: selectedMachineCategory.value,
      unit_system_code: selectedUnit.value,
      page: currentPage.value,
      page_size: pageSize.value,
    };

    // equipment_type 설정 (기계유형 우선, 없으면 기계중분류)
    if (isDetailSearchOpen.value) {
      if (detailSearch.value.headerMachineCategory) {
        // 기계유형이 선택된 경우
        searchParams.equipment_type = detailSearch.value.headerMachineCategory;
      } else if (detailSearch.value.headerMachineSubCategory) {
        // 기계유형은 없고 기계중분류만 선택된 경우
        searchParams.equipment_type =
          detailSearch.value.headerMachineSubCategory;
      }
    }

    // 상세검색이 열려있는 경우 상세검색 파라미터 추가
    if (isDetailSearchOpen.value) {
      const searchCriteria: any = {};
      const specifications: any = {};

      console.log("상세검색 데이터:", detailSearch.value);

      // search_criteria에 해당하는 필드들 처리
      const searchCriteriaFields = [
        "max_capacity",
        "capacity",
        "o2_transfer_rate_kgO2_hr",
        "agitated_volume_m3",
        "pressure_kgf_cm2",
        "discharge_pressure_mmAq",
        "dia_mm",
        "height_mm",
        "width_mm",
        "diffuse_area_m2",
        "diameter_mm",
        "dia_phi_mm",
      ];

      // specifications에 해당하는 필드들 처리
      const specificationsFields = [
        "max_pump_head_m",
        "max_head_m",
        "max_press_kg_cm2",
      ];

      // API에서 받은 unit_code를 사용하여 동적으로 단위 코드 설정
      const getUnitCodeForField = (
        fieldName: string,
        isSpecification: boolean = false
      ): string => {
        const metadata = isSpecification
          ? detailSearch.value.fieldsMetadata.specifications
          : detailSearch.value.fieldsMetadata.search_criteria;

        const fieldMetadata = metadata.find(
          (item: any) => item.field_name === fieldName
        );
        return fieldMetadata?.unit_code || "";
      };

      // search_criteria 필드들 체크
      searchCriteriaFields.forEach((field) => {
        const value =
          detailSearch.value[field as keyof typeof detailSearch.value];
        if (value && value !== "") {
          console.log(`search_criteria 필드 추가: ${field} = ${value}`);

          const unitCode = getUnitCodeForField(field, false);

          // 단위가 붙은 필드명을 기본 필드명으로 변환
          let apiFieldName = field;
          if (field.includes("_m3_min")) {
            apiFieldName = field.replace("_m3_min", "");
          } else if (field.includes("_ml_min")) {
            apiFieldName = field.replace("_ml_min", "");
          } else if (field.includes("_m3_hr")) {
            apiFieldName = field.replace("_m3_hr", "");
          } else if (field.includes("_kgO2_hr")) {
            apiFieldName = field.replace("_kgO2_hr", "");
          } else if (field.includes("_tonne")) {
            apiFieldName = field.replace("_tonne", "");
          } else if (field.includes("_m3")) {
            apiFieldName = field.replace("_m3", "");
          } else if (field.includes("_t")) {
            apiFieldName = field.replace("_t", "");
          } else if (field.includes("_kg_hr")) {
            apiFieldName = field.replace("_kg_hr", "");
          } else if (field.includes("_l_min")) {
            apiFieldName = field.replace("_l_min", "");
          } else if (field.includes("_kgf_cm2")) {
            apiFieldName = field.replace("_kgf_cm2", "");
          } else if (field.includes("_mmAq")) {
            apiFieldName = field.replace("_mmAq", "");
          } else if (field.includes("_mm")) {
            apiFieldName = field.replace("_mm", "");
          } else if (field.includes("_m2")) {
            apiFieldName = field.replace("_m2", "");
          } else if (field.includes("_kg_cm2")) {
            apiFieldName = field.replace("_kg_cm2", "");
          } else if (field.includes("_m")) {
            apiFieldName = field.replace("_m", "");
          }

          if (unitCode) {
            searchCriteria[apiFieldName] = {
              $gte: Number(value),
              unit_code: unitCode,
            };
          } else {
            searchCriteria[apiFieldName] = {
              $gte: Number(value),
            };
          }
        }
      });

      // powerKw1은 search_criteria의 power_kW로 매핑
      if (detailSearch.value.powerKw1 && detailSearch.value.powerKw1 !== "") {
        console.log(
          `search_criteria 필드 추가: power_kW = ${detailSearch.value.powerKw1}`
        );
        const unitCode = getUnitCodeForField("power_kW", false);
        if (unitCode) {
          searchCriteria["power"] = {
            $gte: Number(detailSearch.value.powerKw1),
            unit_code: unitCode,
          };
        } else {
          searchCriteria["power_kW"] = {
            $gte: Number(detailSearch.value.powerKw1),
          };
        }
      }

      // specifications 필드들 체크
      specificationsFields.forEach((field) => {
        const value =
          detailSearch.value[field as keyof typeof detailSearch.value];
        if (value && value !== "") {
          console.log(`specifications 필드 추가: ${field} = ${value}`);
          const unitCode = getUnitCodeForField(field, true);

          // 단위가 붙은 필드명을 기본 필드명으로 변환
          let apiFieldName = field;
          if (field.includes("_m")) {
            apiFieldName = field.replace("_m", "");
          } else if (field.includes("_kg_cm2")) {
            apiFieldName = field.replace("_kg_cm2", "");
          }

          if (unitCode) {
            specifications[apiFieldName] = {
              $gte: Number(value),
              unit_code: unitCode,
            };
          } else {
            specifications[apiFieldName] = {
              $gte: Number(value),
            };
          }
        }
      });

      // powerKw2는 specifications의 power_kW로 매핑
      if (detailSearch.value.powerKw2 && detailSearch.value.powerKw2 !== "") {
        console.log(
          `specifications 필드 추가: power_kW = ${detailSearch.value.powerKw2}`
        );
        const unitCode = getUnitCodeForField("power_kW", true);
        if (unitCode) {
          specifications["power"] = {
            $gte: Number(detailSearch.value.powerKw2),
            unit_code: unitCode,
          };
        } else {
          specifications["power_kW"] = {
            $gte: Number(detailSearch.value.powerKw2),
          };
        }
      }

      console.log("생성된 searchCriteria:", searchCriteria);
      console.log("생성된 specifications:", specifications);

      // 파라미터가 있는 경우에만 추가
      if (Object.keys(searchCriteria).length > 0) {
        searchParams.search_criteria = searchCriteria;
      }
      if (Object.keys(specifications).length > 0) {
        searchParams.specifications = specifications;
      }
    }

    console.log("검색 파라미터:", searchParams);

    // API 호출로 배관 검색 리스트 조회
    await pipeStore.fetchSearchList(searchParams);

    // API 응답 데이터를 machineList에 설정
    if (pipeStore.searchResults?.items) {
      machineList.value = pipeStore.searchResults
        .items as unknown as MachineItem[];
    } else {
      machineList.value = [];
    }
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    // 에러 발생 시 빈 배열로 초기화
    machineList.value = [];
  }
};

// 기계타입 매핑 함수는 더 이상 사용하지 않음

// 기계 대분류 변경 핸들러
const handleMachineCategoryChange = async () => {
  if (selectedMachineCategory.value) {
    await pipeStore.fetchThirdDepth(selectedMachineCategory.value, 3);
  }

  // 상세검색의 machineType 초기화
  detailSearch.value.machineType = "";
  detailSearch.value.machineSubtype = "";
  detailSearch.value.machineCategory = "";
  // 헤더 기계중분류 초기화 먼저
  detailSearch.value.headerMachineSubCategory = "";
  detailSearch.value.headerMachineCategory = "";
  detailSearch.value.headerMachineCategoryOptions = [];
  detailSearch.value.machineCategoryOptions = [];
  // 커스텀 필드 모두 숨김
  hideAllCustomFields();
  // 헤더 기계중분류 옵션 로딩 (code_level=3)
  try {
    if (selectedMachineCategory.value) {
      const selected = pipeStore.secondDepth.find(
        (row: any) => row.code_key === selectedMachineCategory.value
      );
      if (selected?.code_group) {
        const res = await pipeStore.fetchDepthDetail(selected.code_group, 3);
        const codes = (res as any)?.response?.data?.codes ?? [];
        if (Array.isArray(codes)) {
          const sorted = (codes as any[]).slice().sort((a: any, b: any) => {
            const ak = (a?.code_key ?? "") as string;
            const bk = (b?.code_key ?? "") as string;
            return ak.localeCompare(bk);
          });
          detailSearch.value.headerMachineCategoryOptions = sorted.map(
            (it: any) => ({
              value: it.code_key,
              text: it.code_value,
            })
          );
        } else {
          detailSearch.value.headerMachineCategoryOptions = [];
        }
      } else {
        detailSearch.value.headerMachineCategoryOptions = [];
      }
    } else {
      detailSearch.value.headerMachineCategoryOptions = [];
    }
  } catch (e) {
    console.error(e);
    detailSearch.value.headerMachineCategoryOptions = [];
  }
};

// 상세검색 관련 함수들
const toggleDetailSearch = async () => {
  // if (!selectedMachineCategory.value) {
  //   alert(t("common.selectCategory"));
  //   return;
  // }
  // 상세검색 오픈 시 헤더 선택값 초기화 및 기계유형 옵션 비우기
  detailSearch.value.headerMachineSubCategory = "";
  detailSearch.value.headerMachineCategory = "";
  detailSearch.value.machineCategoryOptions = [];
  isDetailSearchOpen.value = !isDetailSearchOpen.value;
};

// 필드 show/hide 처리 함수
const hideAllCustomFields = () => {
  const fields = [
    "dia_mm_item",
    "height_mm_item",
    "width_mm_item",
    "diffuse_area_m2_item",
    "power_kW1_item",
    "power_kW2_item",
    "diameter_mm_item",
    "dia_phi_mm_item",
    "pressure_kgf_cm2_item",
    "discharge_pressure_mmAq_item",
    "max_pump_head_m_item",
    "max_head_m_item",
    "max_capacity_item",
    "capacity_item",
    "max_press_kg_cm2_item",
    "o2_transfer_rate_kgO2_hr_item",
    "agitated_volume_m3_item",
  ];

  // 각 필드 숨기기
  fields.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.style.display = "none";
    }
  });

  // 모든 입력값 초기화
  detailSearch.value.max_capacity = "";
  detailSearch.value.capacity = "";
  detailSearch.value.o2_transfer_rate_kgO2_hr = "";
  detailSearch.value.agitated_volume_m3 = "";
  detailSearch.value.powerKw1 = "";
  detailSearch.value.powerKw2 = "";
  detailSearch.value.pressure_kgf_cm2 = "";
  detailSearch.value.discharge_pressure_mmAq = "";
  detailSearch.value.max_pump_head_m = "";
  detailSearch.value.max_head_m = "";
  detailSearch.value.max_press_kg_cm2 = "";
  detailSearch.value.diameter_mm = "";
  detailSearch.value.dia_phi_mm = "";
  detailSearch.value.dia_mm = "";
  detailSearch.value.height_mm = "";
  detailSearch.value.width_mm = "";
  detailSearch.value.diffuse_area_m2 = "";
};

const showFieldsByAvailableCriteria = (availableCriteria: any[]) => {
  console.log("showFieldsByAvailableCriteria 호출됨:", availableCriteria);

  const fieldMapping: { [key: string]: string } = {
    dia_mm: "dia_mm_item",
    height_mm: "height_mm_item",
    width_mm: "width_mm_item",
    diffuse_area_m2: "diffuse_area_m2_item",
    diameter_mm: "diameter_mm_item",
    dia_phi_mm: "dia_phi_mm_item",
    power_kW: "power_kW1_item",
    pressure_kgf_cm2: "pressure_kgf_cm2_item",
    discharge_pressure_mmAq: "discharge_pressure_mmAq_item",
    max_capacity_m3_min: "max_capacity_item",
    max_capacity_ml_min: "max_capacity_item",
    max_capacity_m3_hr: "max_capacity_item",
    o2_transfer_rate_kgO2_hr: "o2_transfer_rate_kgO2_hr_item",
    capacity_m3_hr: "capacity_item",
    capacity_tonne: "capacity_item",
    capacity_m3_min: "capacity_item",
    capacity_m3: "capacity_item",
    capacity_t: "capacity_item",
    capacity_kg_hr: "capacity_item",
    capacity_l_min: "capacity_item",
    agitated_volume_m3: "agitated_volume_m3_item",
  };

  // max_ 버전이 있는 필드명들을 추출 (max_ 제거한 버전)
  const maxFieldNames = availableCriteria
    .map((item) => {
      const fieldName = typeof item === "string" ? item : item.field_name;
      return fieldName;
    })
    .filter((name) => name.startsWith("max_"))
    .map((name) => name.replace("max_", ""));

  availableCriteria.forEach((criteria) => {
    // 새로운 구조: criteria는 { field_name, unit_code } 형태의 객체
    const fieldName =
      typeof criteria === "string" ? criteria : criteria.field_name;

    // max_ 버전이 있는 경우, 일반 버전은 스킵
    // 예: max_capacity_m3_min이 있으면 capacity_m3_min 스킵
    if (!fieldName.startsWith("max_") && maxFieldNames.includes(fieldName)) {
      return;
    }

    // max_capacity 필드들은 max_capacity_item으로 표시
    if (fieldName.includes("max_capacity")) {
      const element = document.getElementById("max_capacity_item");
      if (element) {
        element.style.display = "flex";
      }
    }
    // max_가 아닌 capacity로 시작하는 필드들은 모두 capacity_item으로 표시
    else if (fieldName.startsWith("capacity")) {
      const element = document.getElementById("capacity_item");
      if (element) {
        element.style.display = "flex";
      }
    } else {
      const elementId = fieldMapping[fieldName];
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.style.display = "flex";
        }
      }
    }
  });
};

const showFieldsBySpecifications = (specifications: any[]) => {
  const fieldMapping: { [key: string]: string } = {
    power_kW: "power_kW2_item",
    max_pump_head_m: "max_pump_head_m_item",
    max_head_m: "max_head_m_item",
    max_press_kg_cm2: "max_press_kg_cm2_item",
  };

  specifications.forEach((spec) => {
    // 새로운 구조: spec은 { field_name, unit_code } 형태의 객체
    const fieldName = typeof spec === "string" ? spec : spec.field_name;
    const elementId = fieldMapping[fieldName];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = "flex";
      }
    }
  });
};

// 헤더 기계유형 변경 시 상세 검색 타입 조회 호출
const handleHeaderMachineCategoryChange = async () => {
  const searchKey = detailSearch.value.headerMachineCategory;
  if (!searchKey) return;

  // 모든 커스텀 필드 hide
  hideAllCustomFields();

  try {
    const res = await pipeStore.fetchDepthDetailBySearchType(searchKey);
    const fieldsMetadata = (res as any)?.response?.data?.fields_metadata;

    // fieldsMetadata 저장
    if (fieldsMetadata) {
      detailSearch.value.fieldsMetadata = {
        search_criteria: fieldsMetadata.search_criteria || [],
        specifications: fieldsMetadata.specifications || [],
      };

      // 디버깅을 위한 로그
      console.log(
        "API 응답 - search_criteria:",
        fieldsMetadata.search_criteria
      );
      console.log("API 응답 - specifications:", fieldsMetadata.specifications);
    }

    if (fieldsMetadata?.search_criteria) {
      showFieldsByAvailableCriteria(fieldsMetadata.search_criteria);
    }

    if (fieldsMetadata?.specifications) {
      showFieldsBySpecifications(fieldsMetadata.specifications);
    }

    console.log("res 응답:", fieldsMetadata);
  } catch (e) {
    console.error(e);
  }
};

// 헤더 기계중분류 변경 시 세 번째 깊이 조회 호출
const handleHeaderMachineSubCategoryChange = async () => {
  const searchKey = detailSearch.value.headerMachineSubCategory;

  // 기계중분류가 변경되면 기계유형 초기화
  detailSearch.value.headerMachineCategory = "";
  detailSearch.value.machineCategoryOptions = [];

  // 모든 커스텀 필드 hide
  hideAllCustomFields();

  if (!searchKey) return;
  try {
    const res = await pipeStore.fetchThirdDepth(searchKey, 4);
    const codes = (res as any)?.response ?? [];
    if (Array.isArray(codes) && codes.length > 0) {
      const sorted = (codes as any[]).slice().sort((a: any, b: any) => {
        const ak = (a?.code_key ?? "") as string;
        const bk = (b?.code_key ?? "") as string;
        return ak.localeCompare(bk);
      });
      detailSearch.value.machineCategoryOptions = sorted.map((it: any) => ({
        value: it.code_key,
        text: it.code_value,
      }));
    } else {
      // fetchThirdDepth 결과가 빈값이면 fetchDepthDetailBySearchType 호출
      const searchRes = await pipeStore.fetchDepthDetailBySearchType(
        searchKey
      );
      const fieldsMetadata = (searchRes as any)?.response?.data
        ?.fields_metadata;

      // fieldsMetadata 저장
      if (fieldsMetadata) {
        detailSearch.value.fieldsMetadata = {
          search_criteria: fieldsMetadata.search_criteria || [],
          specifications: fieldsMetadata.specifications || [],
        };
      }

      if (fieldsMetadata?.search_criteria) {
        showFieldsByAvailableCriteria(fieldsMetadata.search_criteria);
      }

      if (fieldsMetadata?.specifications) {
        showFieldsBySpecifications(fieldsMetadata.specifications);
      }

      console.log("searchType 응답:", fieldsMetadata);
    }
  } catch (e) {
    console.error(e);
    detailSearch.value.machineCategoryOptions = [];
  }
};

// 단위 변경 시 재조회
watch(selectedUnit, async () => {
  if (selectedUnit.value) {
    currentPage.value = 1;
    await loadData();
  }
});

// 배관 대분류 변경 시 재조회
watch(selectedMachineCategory, async () => {
  currentPage.value = 1;
  await loadData();
});

onMounted(async () => {
  await pipeStore.fetchCommonCodes("PIPE_S");
  await loadData();
});
</script>

<style scoped lang="scss">
@use "sass:color";

.pipe-page {
  padding: $spacing-lg;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
}

.page-layout {
  display: grid;
  height: calc(100vh - #{$spacing-lg * 2});
  width: 100%;
  overflow: hidden;
  gap: 8px;
  grid-template-columns: 1fr; // 기본: 전체 너비
  transition: grid-template-columns 0.3s ease;

  &.detail-open {
    grid-template-columns: 2fr 1fr; // 상세보기 열림: 2/3 + 1/3
  }
}

.main-content {
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  min-width: 0;
}

.detail-panel {
  background: white;
  border-left: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;

  .detail-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid $border-color;
    background: $background-light;
    flex-shrink: 0;

    h3 {
      margin: 0;
      color: $text-color;
      font-size: 1.25rem;
    }

    .header-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .btn-edit,
      .btn-save,
      .btn-cancel {
        padding: 0.5rem 1rem;
        border: 1px solid $border-color;
        border-radius: 4px;
        background: $background-light;
        color: $text-color;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s ease;

        &:hover {
          background: color.scale($background-light, $lightness: -5%);
        }
      }

      .btn-save {
        background: $success-color;
        color: white;
        border-color: $success-color;

        &:hover {
          background: color.scale($success-color, $lightness: -10%);
        }
      }

      .btn-cancel {
        background: $error-color;
        color: white;
        border-color: $error-color;

        &:hover {
          background: color.scale($error-color, $lightness: -10%);
        }
      }

      .btn-close {
        padding: 0.5rem;
        border: none;
        background: transparent;
        color: $text-color;
        cursor: pointer;
        font-size: 1.25rem;
        border-radius: 4px;
      }
    }
  }

  .detail-panel-body {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;

    .model-thumbnail-section {
      width: 100%;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: center;

      .thumbnail-image-container {
        width: 280px;
        height: 210px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;

        .thumbnail-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: opacity 0.3s;

          &.hidden {
            opacity: 0;
          }
        }

        .thumbnail-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(2px);
          gap: 0.75rem;
          z-index: 1;

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid $border-color;
            border-top-color: $primary-color;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .loading-text {
            color: $text-light;
            font-size: 0.875rem;
          }
        }
      }

      .thumbnail-placeholder {
        width: 200px;
        height: 150px;
        border: 2px dashed $border-color;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: $background-light;

        .thumbnail-text {
          color: $text-light;
          font-size: 0.875rem;
          text-align: center;
        }
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    }

    .edit-fields-section {
      margin-top: 1.5rem;
      padding: 1rem;
      border: 1px solid $border-color;
      border-radius: 8px;
      background: $background-light;

      .edit-section-title {
        margin: 0 0 1rem 0;
        color: $text-color;
        font-size: 1rem;
        font-weight: 600;
      }

      .edit-field-group {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .edit-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .edit-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: $text-color;
        }

        .edit-select {
          padding: 0.5rem;
          border: 1px solid $border-color;
          border-radius: 4px;
          background: white;
          color: $text-color;
          font-size: 0.875rem;

          &:focus {
            outline: none;
            border-color: $primary-color;
          }
        }

        .file-input-group {
          display: flex;
          gap: 0.5rem;
          align-items: center;

          .edit-input {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid $border-color;
            border-radius: 4px;
            background: white;
            color: $text-color;
            font-size: 0.875rem;

            &:focus {
              outline: none;
              border-color: $primary-color;
            }
          }

          .btn-attach {
            padding: 0.5rem 1rem;
            border: 1px solid $border-color;
            border-radius: 4px;
            background: $background-light;
            color: $text-color;
            cursor: pointer;
            font-size: 0.875rem;
            white-space: nowrap;

            &:hover {
              background: $primary-color;
              color: white;
              border-color: $primary-color;
            }
          }
        }
      }
    }
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: $text-light;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: $text-color;
    }
  }
}

.detail-tables-container {
  width: 100%;
  overflow: hidden;
}

.detail-section {
  width: 100%;

  .section-title {
    margin: 0 0 12px 0;
    padding: 8px 12px;
    background: $background-light;
    border-left: 4px solid $primary-color;
    font-size: 1rem;
    font-weight: 600;
    color: $text-color;
    border-radius: 4px;
  }
}

.price-history-section {
  margin-top: 1.5rem;

  :deep(.data-table-container) {
    max-height: 250px;
    overflow-y: auto;
    overflow-x: auto;
    width: 100%;
  }

  :deep(.data-table) {
    min-width: 600px;
    width: 100%;
  }
}

// VerticalDataTable 스타일 오버라이드
.detail-section :deep(.vertical-data-table-container) {
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.detail-section :deep(.vertical-data-table) {
  font-size: 0.875rem;

  .column-name {
    background-color: #f8f9fa;
    font-weight: 500;
    color: $text-color;
    width: 35%;
  }

  .column-value {
    width: 65%;
    word-break: break-word;
  }
}

// 메인 콘텐츠 내 테이블도 제어 (중복 정의 제거)
:deep(.main-content .data-table) {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;

  table {
    min-width: 100%;
  }
}

.search-filter-bar {
  background: $background-light;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

// 상세검색 패널 스타일
.detail-search-panel {
  background: white;
  border: 1px solid $border-color;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .detail-search-header {
    position: relative;
    padding: 1rem;
    background: $background-light;
    border-bottom: 1px solid $border-color;
    border-radius: 8px 8px 0 0;

    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: $text-color;
    }

    .btn-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: $text-light;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: $text-color;
      }
    }

    .detail-search-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 1rem;
    }

    .detail-search-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-right: 1rem;

      &:last-child {
        margin-right: 0;
      }

      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: $text-color;
        margin-bottom: 0;
        min-width: 120px;
        flex-shrink: 0;

        &.label-machine-type {
          background: #f0f8ff;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border-left: 3px solid #4a90e2;
        }

        &.label-machine-subtype {
          background: #f0fff0;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border-left: 3px solid #32cd32;
        }

        &.label-machine-category {
          background: #fff0f5;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          border-left: 3px solid #ff69b4;
        }
      }

      .form-select {
        flex: 1;
        min-width: 0;
        padding: 0.5rem 0.75rem;
        border: 1px solid $border-color;
        border-radius: 4px;
        font-size: 0.875rem;

        &:focus {
          outline: none;
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        &:disabled {
          background-color: #f5f5f5;
          color: #999;
          cursor: not-allowed;
          border-color: #ddd;
        }
      }
    }
  }

  .detail-search-content {
    padding: 1.5rem;
  }

  .detail-search-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .detail-search-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .detail-search-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: $text-color;
      margin-bottom: 0;
      min-width: 120px;
      flex-shrink: 0;

      &.label-machine-type {
        background: #f0f8ff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #4a90e2;
      }

      &.label-machine-subtype {
        background: #f0fff0;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #32cd32;
      }

      &.label-machine-category {
        background: #fff0f5;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #ff69b4;
      }

      &.label-capacity {
        background: #fff5f0;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #ff8c42;
      }

      &.label-power {
        background: #f5f0ff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #8c42ff;
      }

      &.label-pressure {
        background: #f0fff5;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #42ff8c;
      }

      &.label-head {
        background: #fff0f5;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #ff428c;
      }

      &.label-material {
        background: #f0f5ff;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #428cff;
      }

      &.label-diameter {
        background: #fffcf0;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #ffdc42;
      }

      &.label-other {
        background: #f8f8f8;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        border-left: 3px solid #888;
      }
    }

    .form-input,
    .form-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid $border-color;
      border-radius: 4px;
      font-size: 0.875rem;
      flex: 1;
      min-width: 0;

      &:focus {
        outline: none;
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
      }

      &:disabled {
        background-color: #f5f5f5;
        color: #999;
        cursor: not-allowed;
        border-color: #ddd;
      }
    }
  }
}

.btn-detail-search {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .arrow-icon {
    font-size: 0.75rem;
    transition: transform 0.3s ease;
  }

  &:hover {
    background-color: color.scale(#6c757d, $lightness: -10%);
  }
}

.filter-group {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    font-weight: 500;
    color: $text-color;
    white-space: nowrap;
  }
}

.form-select {
  padding: 0.5rem;
  border: 1px solid $border-color;
  border-radius: 4px;
  font-size: 0.9rem;
  min-width: 120px;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }
}

.pipe-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    color: $text-color;
    font-size: 1.5rem;
  }
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &.btn-primary {
    color: white;

    &:disabled {
      background-color: $text-light;
      cursor: not-allowed;
    }
  }

  &.btn-secondary {
    background-color: $background-light;
    color: $text-color;
    border: 1px solid $border-color;

    &:hover {
      background-color: color.scale($background-light, $lightness: -5%);
    }
  }
}

.btn-search {
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: color.scale($primary-color, $lightness: -10%);
  }
}

.btn-view {
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: color.scale($primary-color, $lightness: -10%);
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
  position: relative;

  .total-count {
    position: absolute;
    left: 1rem;
    font-size: 0.9rem;
    color: $text-color;
    font-weight: 500;
  }
}

// 반응형 브레이크포인트
$mobile: 768px;
$tablet: 1024px;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;

  @media (max-width: $mobile) {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 98%;
  max-width: 1600px;
  max-height: 100vh;
  margin: 0; /* 상/하 여백 제거 */
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (max-width: $tablet) {
    width: 95%;
    max-width: 95vw;
  }

  @media (max-width: $mobile) {
    width: 100%;
    max-width: 100vw;
    max-height: 90vh;
    border-radius: 4px;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;

  h3 {
    margin: 0;
    color: $text-color;
    font-size: 1.25rem;

    @media (max-width: $mobile) {
      font-size: 1.1rem;
    }
  }

  @media (max-width: $mobile) {
    padding: 0.75rem;
  }
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: $text-light;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    color: $text-color;
  }

  @media (max-width: $mobile) {
    width: 24px;
    height: 24px;
    font-size: 1.2rem;
  }
}

.modal-body {
  padding: 0 1rem 1rem 1rem;
  flex: 1;
  min-height: 0; // flex 아이템이 축소될 수 있도록 함
  overflow-y: auto;

  @media (max-width: $mobile) {
    padding: 0 0.75rem 0.75rem 0.75rem;
  }
}


.column-regist {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: center;

  @media (max-width: $mobile) {
    grid-template-columns: 100px 1fr;
    gap: 0.75rem;
  }

  dt {
    font-weight: bold;
    color: $text-color;
    font-size: 0.9rem;

    @media (max-width: $mobile) {
      font-size: 0.8rem;
    }

    &.essential::after {
      content: " *";
      color: red;
    }
  }

  dd {
    margin: 0;
  }
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid $border-color;
  border-radius: 4px;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: $primary-color;
  }

  @media (max-width: $mobile) {
    padding: 0.4rem;
    font-size: 0.8rem;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid $border-color;
  flex-shrink: 0;
  flex-wrap: wrap;

  @media (max-width: $mobile) {
    padding: 0.75rem;
    gap: 0.4rem;
    justify-content: center;
  }
}

// 등록 폼 스타일
.pipe-register-form {
  width: 100%;
}

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

.select-md {
  min-width: 220px;

  @media (max-width: $tablet) {
    min-width: 180px;
  }

  @media (max-width: $mobile) {
    min-width: 150px;
  }
}

.file-upload-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;

  .file-name-input {
    flex: 1;
  }

  .btn-file {
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.875rem;
    white-space: nowrap;

    &:hover {
      background-color: #e5e7eb;
    }

    @media (max-width: $mobile) {
      padding: 0.4rem 0.8rem;
      font-size: 0.75rem;
    }
  }
}

.btn-outline {
  background: transparent;
  color: #475467;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;

  &:hover {
    background-color: #f9fafb;
  }

  @media (max-width: $mobile) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
}

.btn-register {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;

  &:hover {
    background-color: #357abd;
  }

  @media (max-width: $mobile) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e9f2;

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #101828;
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.model-register-warning {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #b54708;
}

.zip-contents-section {
  margin-top: 1rem;

  .zip-contents-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #475467;
    margin-bottom: 0.5rem;
  }
}

.result-success {
  color: #12b76a;
}

.result-failed {
  color: #f04438;
}

.result-skipped {
  color: #f79009;
}

.remarks-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
</style>
