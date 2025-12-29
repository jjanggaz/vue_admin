<template>
  <div class="vendors-page">
    <div class="page-layout" :class="{ 'detail-open': isDetailPanelOpen }">
      <!-- 메인 콘텐츠 영역 -->
      <div class="main-content">
        <!-- 검색 바 -->
        <div class="action-bar">
          <div class="search-bar">
            <div class="group-form">
              <label for="search" class="label-search">{{
                t("common.search")
              }}</label>
              <div class="form-item">
                <input
                  type="text"
                  id="search"
                  :placeholder="t('placeholder.vendorsSearch')"
                  v-model="searchQueryInput"
                  @keyup.enter="handleSearch"
                />
              </div>
              <button class="btn-search" @click="handleSearch">
                {{ t("common.search") }}
              </button>
            </div>
          </div>
          <div class="btns">
            <button class="btn btn-primary btn-add" @click="openRegistModal">
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
          :data="vendorList"
          :loading="loading"
          :selectable="true"
          :selection-mode="'multiple'"
          :show-select-all="true"
          row-key="vendorId"
          :selected-items="selectedItems"
          @selection-change="handleSelectionChange"
        >
          <!-- 순번 슬롯 -->
          <template #cell-id="{ index }">
            {{ (currentPage - 1) * pageSize + index + 1 }}
          </template>

          <!-- 업체명 슬롯 (vendor_name / vendor_name_en) -->
          <template #cell-vendorName="{ item }">
            {{ item.vendorName
            }}{{ item.vendorNameEn ? " / " + item.vendorNameEn : "" }}
          </template>

          <!-- 연락처 슬롯 (country_code_tel + contact_tel) -->
          <template #cell-contactTel="{ item }">
            {{ item.countryCodeTel ? item.countryCodeTel + "-" : ""
            }}{{ item.contactTel || "" }}
          </template>

          <!-- 선호도 슬롯 -->
          <template #cell-isPreferred="{ value }">
            {{ value ? "활성" : "비활성" }}
          </template>

          <!-- 홈페이지 슬롯 (URL이 있으면 하이퍼링크로 표시) -->
          <template #cell-homepage="{ item }">
            <a
              v-if="item.homepage"
              :href="item.homepage"
              target="_blank"
              rel="noopener noreferrer"
              class="link-homepage"
              @click.stop
            >
              {{ item.homepage }}
            </a>
            <span v-else>-</span>
          </template>

          <template #cell-actions="{ item }">
            <button class="btn-edit" @click.stop="openDetailPanel(item)">
              {{ t("common.view") }}
            </button>
          </template>
        </DataTable>

        <!-- 페이징 -->
        <div class="pagination-container">
          <div class="total-count">
            {{
              t("common.totalCount", {
                count: vendorsStore.totalCount || 0,
              })
            }}
          </div>
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
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
              class="btn-close"
              @click="closeDetailPanel"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div class="detail-panel-body">
          <div class="detail-tables-container">
            <div class="detail-section">
              <VerticalDataTable
                :data="vendorVerticalData"
                :loading="false"
                :editMode="isDetailEditMode"
                @field-change="handleFieldChange"
              />
            </div>
            <!-- <div class="catalog-button-section">
              <button class="btn btn-catalog" @click="openCatalogModal">
                {{ t("common.catalog") || "카탈로그" }}
              </button>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 등록 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container modal-container-large">
        <div class="modal-header">
          <h3>{{ t("common.register") }}</h3>
          <button
            class="close-btn"
            @click="closeRegistModal"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt class="essential">{{ t("columns.vendors.vendorId") }}</dt>
            <dd>
              <input
                v-model="newVendor.vendorId"
                type="text"
                class="form-input"
                :disabled="isEditMode"
              />
            </dd>

            <dt class="essential">{{ t("columns.vendors.vendorName") }}</dt>
            <dd>
              <input
                v-model="newVendor.vendorName"
                type="text"
                class="form-input"
              />
            </dd>

            <dt class="essential">{{ t("columns.vendors.vendorNameEn") }}</dt>
            <dd>
              <input
                v-model="newVendor.vendorNameEn"
                type="text"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.vendorType") }}</dt>
            <dd>
              <input
                v-model="newVendor.vendorType"
                type="text"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.location") }}</dt>
            <dd>
              <input
                v-model="newVendor.location"
                type="text"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.address") }}</dt>
            <dd>
              <input
                v-model="newVendor.address"
                type="text"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.country") }}</dt>
            <dd>
              <input
                v-model="newVendor.country"
                type="text"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.countryCodeTel") }}</dt>
            <dd>
              <input
                v-model="newVendor.countryCodeTel"
                type="text"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.contactTel") }}</dt>
            <dd>
              <input
                v-model="newVendor.contactTel"
                type="tel"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.contactFax") }}</dt>
            <dd>
              <input
                v-model="newVendor.contactFax"
                type="tel"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.contactEmail") }}</dt>
            <dd>
              <input
                v-model="newVendor.contactEmail"
                type="email"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.mainDesignType") }}</dt>
            <dd>
              <input
                v-model="newVendor.mainDesignType"
                type="text"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.manufacturerCategory") }}</dt>
            <dd>
              <input
                v-model="newVendor.manufacturerCategory"
                type="text"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.mainProducts") }}</dt>
            <dd>
              <input
                v-model="newVendor.mainProducts"
                type="text"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.homepage") }}</dt>
            <dd>
              <input
                v-model="newVendor.homepage"
                type="url"
                class="form-input"
              />
            </dd>

            <dt>{{ t("columns.vendors.brn") }}</dt>
            <dd>
              <input v-model="newVendor.brn" type="text" class="form-input" />
            </dd>

            <dt>{{ t("columns.vendors.dunsn") }}</dt>
            <dd>
              <input v-model="newVendor.dunsn" type="text" class="form-input" />
            </dd>

            <dt>{{ t("columns.vendors.certification") }}</dt>
            <dd>
              <textarea
                v-model="newVendor.certification"
                class="form-input"
                rows="2"
              ></textarea>
            </dd>

            <dt>{{ t("columns.vendors.note") }}</dt>
            <dd>
              <textarea
                v-model="newVendor.note"
                class="form-input"
                rows="3"
              ></textarea>
            </dd>

            <dt>{{ t("columns.vendors.isPreferred") }}</dt>
            <dd>
              <select v-model="newVendor.isPreferred" class="form-input">
                <option :value="true">{{ t("common.status.active") }}</option>
                <option :value="false">
                  {{ t("common.status.inactive") }}
                </option>
              </select>
            </dd>

            <dt>{{ t("columns.vendors.preferredLevel") }}</dt>
            <dd>
              <input
                v-model.number="newVendor.preferredLevel"
                type="number"
                class="form-input"
                min="0"
              />
            </dd>

            <dt class="essential">{{ t("common.statusLabel") }}</dt>
            <dd>
              <select v-model="newVendor.isActive" class="form-input">
                <option :value="true">
                  {{ t("common.status.active") }}
                </option>
                <option :value="false">
                  {{ t("common.status.inactive") }}
                </option>
              </select>
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRegistModal">
            {{ t("common.cancel") }}
          </button>
          <button
            class="btn btn-primary"
            @click="handleSave"
            :disabled="!isFormValid"
          >
            {{ t("common.save") }}
          </button>
        </div>
      </div>
    </div>

    <!-- 카탈로그 모달 -->
    <div
      v-if="isCatalogModalOpen"
      class="modal-overlay"
      @click.self="closeCatalogModal"
    >
      <div class="modal-container modal-container-xlarge">
        <div class="modal-header">
          <h3>{{ t("common.catalog") || "카탈로그" }}</h3>
          <button
            class="close-btn"
            @click="closeCatalogModal"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="modal-body modal-body-catalog">
          <CatalogContent />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import VerticalDataTable from "@/components/common/VerticalDataTable.vue";
import CatalogContent from "@/views/vendors/Catalog.vue";
import { useI18n } from "vue-i18n";
import {
  useVendorsStore,
  type VendorItem,
  type VendorCreateRequest,
} from "@/stores/vendorsStore";
import { useCatalogStore } from "@/stores/catalogStore";

const { t } = useI18n();
const vendorsStore = useVendorsStore();
const catalogStore = useCatalogStore();

interface RegistForm {
  vendorId: string;
  vendorName: string;
  vendorNameEn: string;
  vendorType: string;
  location: string;
  address: string;
  country: string;
  countryCodeTel: string;
  contactTel: string;
  contactFax: string;
  contactEmail: string;
  mainDesignType: string;
  manufacturerCategory: string;
  mainProducts: string;
  homepage: string;
  brn: string;
  dunsn: string;
  certification: string;
  note: string;
  isPreferred: boolean;
  preferredLevel: number;
  isActive: boolean;
}

interface VerticalDataItem {
  columnName: string;
  value: string;
  editable?: boolean;
  fieldType?: string;
  options?: Array<{ label: string; value: string }>;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  {
    key: "id",
    title: t("columns.vendors.id"),
    width: "60px",
    sortable: false,
  },
  {
    key: "vendorId",
    title: t("columns.vendors.vendorId"),
    width: "120px",
    sortable: true,
    hidden: true, // Hidden 처리
  },
  {
    key: "vendorName",
    title: t("columns.vendors.vendorName"),
    width: "200px",
    sortable: true,
  },
  {
    key: "location",
    title: t("columns.vendors.location"),
    width: "120px",
    sortable: true,
  },
  {
    key: "contactTel",
    title: t("columns.vendors.contactTel"),
    width: "150px",
    sortable: true,
  },
  {
    key: "mainDesignType",
    title: t("columns.vendors.mainDesignType"),
    width: "120px",
    sortable: true,
  },
  {
    key: "mainProducts",
    title: t("columns.vendors.mainProducts"),
    width: "230px",
    sortable: true,
  },
  {
    key: "homepage",
    title: t("columns.vendors.homepage"),
    width: "180px",
    sortable: true,
  },
  {
    key: "isPreferred",
    title: t("columns.vendors.isPreferred"),
    width: "100px",
    sortable: true,
  },
  {
    key: "createdAt",
    title: t("columns.vendors.createdAt"),
    width: "120px",
    sortable: true,
    dateFormat: "YYYY-MM-DD",
  },
  {
    key: "actions",
    title: t("common.detailInfo"),
    width: "80px",
    sortable: false,
  },
];

// Store에서 상태 가져오기 (storeToRefs를 사용하여 reactivity 유지)
const { vendorList, loading, totalPages, currentPage, pageSize, detailVendor } =
  storeToRefs(vendorsStore);

// 컴포넌트 로컬 상태 (UI 전용)
const selectedItems = ref<VendorItem[]>([]);
const searchQueryInput = ref("");
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const editingVendorId = ref<string | null>(null);
const isDetailPanelOpen = ref(false);
const isDetailEditMode = ref(false);
const isCatalogModalOpen = ref(false);
const newVendor = ref<RegistForm>({
  vendorId: "",
  vendorName: "",
  vendorNameEn: "",
  vendorType: "",
  location: "",
  address: "",
  country: "KR",
  countryCodeTel: "+82",
  contactTel: "",
  contactFax: "",
  contactEmail: "",
  mainDesignType: "",
  manufacturerCategory: "",
  mainProducts: "",
  homepage: "",
  brn: "",
  dunsn: "",
  certification: "",
  note: "",
  isPreferred: false,
  preferredLevel: 0,
  isActive: true,
});

// 데이터 로드 함수 (store의 loadVendorData 사용)
const loadData = async () => {
  try {
    await vendorsStore.loadVendorData();
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    alert(t("messages.error.loadFailed"));
  }
};

const isFormValid = computed(() => {
  return (
    newVendor.value.vendorId.trim() !== "" &&
    newVendor.value.vendorName.trim() !== "" &&
    newVendor.value.vendorNameEn.trim() !== ""
  );
});

const handleSelectionChange = (selected: VendorItem[]) => {
  selectedItems.value = selected;
};

const handlePageChange = async (page: number) => {
  selectedItems.value = [];
  try {
    await vendorsStore.changePage(page);
  } catch (error) {
    console.error("페이지 변경 실패:", error);
    alert(t("messages.error.loadFailed"));
  }
};

const handleSearch = async () => {
  selectedItems.value = [];
  console.log("handleSearch 호출 - 검색어:", searchQueryInput.value);
  try {
    await vendorsStore.executeSearch(searchQueryInput.value);
  } catch (error) {
    console.error("검색 실패:", error);
    alert(t("messages.error.loadFailed"));
  }
};

const openRegistModal = () => {
  isEditMode.value = false;
  newVendor.value = {
    vendorId: "",
    vendorName: "",
    vendorNameEn: "",
    vendorType: "",
    location: "",
    address: "",
    country: "KR",
    countryCodeTel: "+82",
    contactTel: "",
    contactFax: "",
    contactEmail: "",
    mainDesignType: "",
    manufacturerCategory: "",
    mainProducts: "",
    homepage: "",
    brn: "",
    dunsn: "",
    certification: "",
    note: "",
    isPreferred: false,
    preferredLevel: 0,
    isActive: true,
  };
  isRegistModalOpen.value = true;
};

const closeRegistModal = () => {
  isRegistModalOpen.value = false;
  isEditMode.value = false;
  editingVendorId.value = null;
};

const openDetailPanel = (item: VendorItem) => {
  vendorsStore.setDetailVendor(item);
  isDetailPanelOpen.value = true;
  isDetailEditMode.value = false;
};

const closeDetailPanel = () => {
  isDetailPanelOpen.value = false;
  vendorsStore.setDetailVendor(null);
  isDetailEditMode.value = false;
};

const toggleEditMode = () => {
  isDetailEditMode.value = !isDetailEditMode.value;
};

const saveDetailChanges = async () => {
  if (!detailVendor.value) return;

  try {
    await vendorsStore.saveDetailVendor();
    alert(t("messages.success.updateSuccess"));
    isDetailEditMode.value = false;
  } catch (error) {
    console.error("상세정보 수정 실패:", error);
    alert(t("messages.error.updateFailed"));
  }
};

const openCatalogModal = () => {
  if (!detailVendor.value) {
    alert("업체 정보를 먼저 선택해주세요.");
    return;
  }
  isCatalogModalOpen.value = true;
};

const closeCatalogModal = () => {
  isCatalogModalOpen.value = false;
  // 카탈로그 데이터 초기화
  catalogStore.clearEquipmentList();
};

// VerticalDataTable용 데이터 구성
const vendorVerticalData = computed(() => {
  if (!detailVendor.value) return [];
  const item = detailVendor.value;
  const data: VerticalDataItem[] = [];

  data.push({
    columnName: t("columns.vendors.vendorId"),
    value: item.vendorId || "-",
  });
  data.push({
    columnName: t("columns.vendors.vendorName"),
    value: item.vendorName || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.vendorNameEn"),
    value: item.vendorNameEn || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.vendorType"),
    value: item.vendorType || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.location"),
    value: item.location || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.address"),
    value: item.address || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.country"),
    value: item.country || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.countryCodeTel"),
    value: item.countryCodeTel || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.contactTel"),
    value: item.contactTel || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.contactFax"),
    value: item.contactFax || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.contactEmail"),
    value: item.contactEmail || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.mainDesignType"),
    value: item.mainDesignType || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.manufacturerCategory"),
    value: item.manufacturerCategory || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.mainProducts"),
    value: item.mainProducts || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.homepage"),
    value: item.homepage || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.brn"),
    value: item.brn || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.dunsn"),
    value: item.dunsn || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.certification"),
    value: item.certification || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.note"),
    value: item.note || "-",
    editable: true,
  });
  data.push({
    columnName: t("columns.vendors.isPreferred"),
    value: item.isPreferred ? "true" : "false",
    editable: true,
    fieldType: "select",
    options: [
      { value: "true", label: t("common.status.active") },
      { value: "false", label: t("common.status.inactive") },
    ],
  });
  data.push({
    columnName: t("columns.vendors.preferredLevel"),
    value: item.preferredLevel?.toString() || "0",
    editable: true,
  });
  data.push({
    columnName: t("common.statusLabel"),
    value: item.isActive ? "true" : "false",
    editable: true,
    fieldType: "select",
    options: [
      { value: "true", label: t("common.status.active") },
      { value: "false", label: t("common.status.inactive") },
    ],
  });

  return data;
});

// 필드 변경 핸들러
const handleFieldChange = (columnName: string, newValue: string) => {
  if (!detailVendor.value) return;

  const fieldMap: Record<string, keyof VendorItem> = {
    [t("columns.vendors.vendorName")]: "vendorName",
    [t("columns.vendors.vendorNameEn")]: "vendorNameEn",
    [t("columns.vendors.vendorType")]: "vendorType",
    [t("columns.vendors.location")]: "location",
    [t("columns.vendors.address")]: "address",
    [t("columns.vendors.country")]: "country",
    [t("columns.vendors.countryCodeTel")]: "countryCodeTel",
    [t("columns.vendors.contactTel")]: "contactTel",
    [t("columns.vendors.contactFax")]: "contactFax",
    [t("columns.vendors.contactEmail")]: "contactEmail",
    [t("columns.vendors.mainDesignType")]: "mainDesignType",
    [t("columns.vendors.manufacturerCategory")]: "manufacturerCategory",
    [t("columns.vendors.mainProducts")]: "mainProducts",
    [t("columns.vendors.homepage")]: "homepage",
    [t("columns.vendors.brn")]: "brn",
    [t("columns.vendors.dunsn")]: "dunsn",
    [t("columns.vendors.certification")]: "certification",
    [t("columns.vendors.note")]: "note",
    [t("columns.vendors.preferredLevel")]: "preferredLevel",
  };

  const fieldKey = fieldMap[columnName];
  if (fieldKey) {
    if (fieldKey === "preferredLevel") {
      vendorsStore.updateDetailVendorField(fieldKey, parseInt(newValue) || 0);
    } else {
      vendorsStore.updateDetailVendorField(fieldKey, newValue);
    }
  } else if (columnName === t("columns.vendors.isPreferred")) {
    vendorsStore.updateDetailVendorField("isPreferred", newValue === "true");
  } else if (columnName === t("common.statusLabel")) {
    vendorsStore.updateDetailVendorField("isActive", newValue === "true");
  }
};

const handleSave = async () => {
  try {
    // 등록 로직만 처리 (수정은 saveDetailChanges에서 처리)
    const createData: VendorCreateRequest = {
      vendorId: newVendor.value.vendorId,
      vendorName: newVendor.value.vendorName,
      vendorNameEn: newVendor.value.vendorNameEn,
      vendorType: newVendor.value.vendorType,
      location: newVendor.value.location,
      address: newVendor.value.address,
      country: newVendor.value.country,
      countryCodeTel: newVendor.value.countryCodeTel,
      contactTel: newVendor.value.contactTel,
      contactFax: newVendor.value.contactFax,
      contactEmail: newVendor.value.contactEmail,
      mainDesignType: newVendor.value.mainDesignType,
      manufacturerCategory: newVendor.value.manufacturerCategory,
      mainProducts: newVendor.value.mainProducts,
      homepage: newVendor.value.homepage,
      brn: newVendor.value.brn,
      dunsn: newVendor.value.dunsn,
      certification: newVendor.value.certification,
      note: newVendor.value.note,
      isPreferred: newVendor.value.isPreferred,
      preferredLevel: newVendor.value.preferredLevel,
      isActive: newVendor.value.isActive,
    };

    await vendorsStore.createVendor(createData);
    alert(t("messages.success.registerSuccess"));

    closeRegistModal();
    selectedItems.value = [];
    await loadData();
  } catch (error) {
    console.error("저장 실패:", error);
    alert(t("messages.error.saveFailed"));
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
      const selectedVendorIds = selectedItems.value.map(
        (item) => item.vendorId
      );

      if (selectedVendorIds.length === 1) {
        await vendorsStore.deleteVendor(selectedVendorIds[0]);
      } else {
        await vendorsStore.deleteVendors(selectedVendorIds);
      }

      selectedItems.value = [];
      alert(t("messages.success.deleted"));
      await loadData();
    } catch (error) {
      console.error("삭제 실패:", error);
      alert(t("messages.error.deleteFailed"));
    }
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
@use "sass:color";

.vendors-page {
  padding: $spacing-lg;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
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
      .btn-save {
        padding: 0.5rem 1rem;
        border: 1px solid $border-color;
        border-radius: 4px;
        background: $background-light;
        color: $text-color;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .btn-save {
        background: $success-color;
        color: white;
        border-color: $success-color;
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

  .catalog-button-section {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $border-color;
    display: flex;
    justify-content: center;

    .btn-catalog {
      padding: 0.75rem 2rem;
      background-color: $primary-color;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: background-color 0.2s;

      &:hover {
        background-color: color.scale($primary-color, $lightness: -10%);
      }
    }
  }

  .detail-info {
    display: grid;
    grid-template-columns: 150px 1fr;
    gap: 0.75rem;
    align-items: center;

    dt {
      font-weight: bold;
      color: $text-color;
    }

    dd {
      margin: 0;
      color: $text-color;

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
      }

      select.form-input {
        width: 100%;
      }

      textarea.form-input {
        resize: vertical;
      }
    }
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

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-bar {
  display: flex;
  align-items: center;
}

.group-form {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.label-search {
  margin-right: 0.5rem;
}

.form-item {
  margin-right: 0.5rem;
}

.btns {
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

  &.btn-secondary {
    background-color: $background-light;
    color: $text-color;
    border: 1px solid $border-color;

    &:hover {
      background-color: color.scale($background-light, $lightness: -5%);
    }
  }
}

.btn-edit {
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    background-color: color.scale($primary-color, $lightness: -10%);
  }
}

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
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-container-large {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-container-xlarge {
  background: white;
  border-radius: 8px;
  width: 98%;
  max-width: 1800px;
  max-height: 95vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid $border-color;

  h3 {
    margin: 0;
    color: $text-color;
  }
}

.modal-body {
  padding: 1rem;
}

.modal-body-catalog {
  padding: 0;
  max-height: calc(95vh - 120px);
  overflow-y: auto;

  // Catalog 컴포넌트 내부의 중복 헤더와 닫기 버튼 숨기기
  :deep(.page-header) {
    display: none;
  }

  :deep(.wrap-page) {
    padding: 1rem;
  }

  :deep(.footer-actions) {
    display: none;
  }
}

.column-regist {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  align-items: center;

  dt {
    font-weight: bold;
    color: $text-color;

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
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid $border-color;
}

// 홈페이지 링크 스타일
.link-homepage {
  color: $primary-color;
  text-decoration: none;
  display: inline-block;
  max-width: 100%;
  word-break: break-all;
  overflow-wrap: break-word;
  line-height: 1.4;

  &:hover {
    text-decoration: underline;
    color: darken($primary-color, 10%);
  }

  &:visited {
    color: $primary-color;
  }
}
</style>
