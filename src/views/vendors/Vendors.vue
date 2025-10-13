<template>
  <div class="vendors-page">
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
          {{ t("common.add") }}
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
        {{ item.vendorName }}{{ item.vendorNameEn ? ' / ' + item.vendorNameEn : '' }}
      </template>

      <!-- 연락처 슬롯 (country_code_tel + contact_tel) -->
      <template #cell-contactTel="{ item }">
        {{ item.countryCodeTel ? item.countryCodeTel + '-' : '' }}{{ item.contactTel || '' }}
      </template>

      <!-- 선호여부 슬롯 -->
      <template #cell-isPreferred="{ value }">
        {{ value ? '활성' : '비활성' }}
      </template>

      <template #cell-actions="{ item }">
        <button class="btn-edit" @click.stop="editItem(item)">
          {{ t("common.edit") }}
        </button>
      </template>
    </DataTable>

    <!-- 페이징 -->
    <div class="pagination-container">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 등록/수정 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container modal-container-large">
        <div class="modal-header">
          <h3>{{ isEditMode ? t("common.edit") : t("common.register") }}</h3>
          <button
            class="btn-close"
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
              <input
                v-model="newVendor.brn"
                type="text"
                class="form-input"
              />
            </dd>
            
            <dt>{{ t("columns.vendors.dunsn") }}</dt>
            <dd>
              <input
                v-model="newVendor.dunsn"
                type="text"
                class="form-input"
              />
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
                <option :value="false">{{ t("common.status.inactive") }}</option>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import Pagination from "@/components/common/Pagination.vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useI18n } from "vue-i18n";
import {
  useVendorsStore,
  type VendorItem,
  type VendorCreateRequest,
  type VendorUpdateRequest,
} from "@/stores/vendorsStore";

const { t } = useI18n();
const vendorsStore = useVendorsStore();

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
    hidden: true,  // Hidden 처리
  },
  {
    key: "vendorName",
    title: "업체명",
    width: "200px",
    sortable: true,
  },
  {
    key: "location",
    title: "지역",
    width: "120px",
    sortable: true,
  },
  {
    key: "contactTel",
    title: "연락처",
    width: "150px",
    sortable: true,
  },
  {
    key: "mainDesignType",
    title: "설계적용",
    width: "120px",
    sortable: true,
  },
  {
    key: "mainProducts",
    title: "주요제품",
    width: "150px",
    sortable: true,
  },
  {
    key: "homepage",
    title: "홈페이지",
    width: "180px",
    sortable: true,
  },
  {
    key: "isPreferred",
    title: "선호여부",
    width: "100px",
    sortable: true,
  },
  {
    key: "createdAt",
    title: "생성일",
    width: "120px",
    sortable: true,
    dateFormat: "YYYY-MM-DD",
  },
  { key: "actions", title: t("common.edit"), width: "80px", sortable: false },
];

// Store에서 상태 가져오기 (storeToRefs를 사용하여 reactivity 유지)
const { vendorList, loading, totalPages, currentPage, pageSize } = storeToRefs(vendorsStore);

// 컴포넌트 로컬 상태 (UI 전용)
const selectedItems = ref<VendorItem[]>([]);
const searchQueryInput = ref("");
const isRegistModalOpen = ref(false);
const isEditMode = ref(false);
const editingVendorId = ref<string | null>(null);
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

const editItem = (item: VendorItem) => {
  isEditMode.value = true;
  editingVendorId.value = item.vendorId;
  newVendor.value = {
    vendorId: item.vendorId,
    vendorName: item.vendorName,
    vendorNameEn: item.vendorNameEn || "",
    vendorType: item.vendorType || "",
    location: item.location || "",
    address: item.address || "",
    country: item.country || "",
    countryCodeTel: item.countryCodeTel || "",
    contactTel: item.contactTel || "",
    contactFax: item.contactFax || "",
    contactEmail: item.contactEmail || "",
    mainDesignType: item.mainDesignType || "",
    manufacturerCategory: item.manufacturerCategory || "",
    mainProducts: item.mainProducts || "",
    homepage: item.homepage || "",
    brn: item.brn || "",
    dunsn: item.dunsn || "",
    certification: item.certification || "",
    note: item.note || "",
    isPreferred: item.isPreferred || false,
    preferredLevel: item.preferredLevel || 0,
    isActive: item.isActive,
  };
  isRegistModalOpen.value = true;
};

const handleSave = async () => {
  try {
    if (isEditMode.value && editingVendorId.value) {
      // 수정 로직
      const updateData: VendorUpdateRequest = {
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

      await vendorsStore.updateVendor(editingVendorId.value, updateData);
      alert(t("messages.success.updateSuccess"));
    } else {
      // 등록 로직
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
    }

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
      const selectedVendorIds = selectedItems.value.map((item) => item.vendorId);
      
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

  &.btn-primary {
    background-color: $primary-color;
    color: white;

    &:hover {
      background-color: color.scale($primary-color, $lightness: -10%);
    }

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

.pagination-container {
  display: flex;
  justify-content: center;
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

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: $text-light;

  &:hover {
    color: $text-color;
  }
}

.modal-body {
  padding: 1rem;
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
</style>
