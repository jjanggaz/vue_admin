import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { request } from "@/utils/request";

// Vendor 인터페이스 정의
export interface VendorItem {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorNameEn?: string;
  vendorType?: string;
  location?: string;
  address?: string;
  country?: string;
  countryCodeTel?: string;
  contactTel?: string;
  contactFax?: string;
  contactEmail?: string;
  mainDesignType?: string;
  manufacturerCategory?: string;
  mainProducts?: string;
  homepage?: string;
  brn?: string;
  dunsn?: string;
  certification?: string;
  note?: string;
  isPreferred?: boolean;
  preferredLevel?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// API 요청용 인터페이스
export interface VendorCreateRequest {
  vendorId: string;
  vendorName: string;
  vendorNameEn?: string;
  vendorType?: string;
  location?: string;
  address?: string;
  country?: string;
  countryCodeTel?: string;
  contactTel?: string;
  contactFax?: string;
  contactEmail?: string;
  mainDesignType?: string;
  manufacturerCategory?: string;
  mainProducts?: string;
  homepage?: string;
  brn?: string;
  dunsn?: string;
  certification?: string;
  note?: string;
  isPreferred?: boolean;
  preferredLevel?: number;
  isActive: boolean;
}

export interface VendorUpdateRequest {
  vendorName?: string;
  vendorNameEn?: string;
  vendorType?: string;
  location?: string;
  address?: string;
  country?: string;
  countryCodeTel?: string;
  contactTel?: string;
  contactFax?: string;
  contactEmail?: string;
  mainDesignType?: string;
  manufacturerCategory?: string;
  mainProducts?: string;
  homepage?: string;
  brn?: string;
  dunsn?: string;
  certification?: string;
  note?: string;
  isPreferred?: boolean;
  preferredLevel?: number;
  isActive?: boolean;
}

export interface VendorQueryParams {
  search_field?: string;
  search_value?: string;
  page?: number;
  page_size?: number;
  order_by?: string;
  order_direction?: "asc" | "desc";
}

export const useVendorsStore = defineStore("vendors", () => {
  // 상태
  const vendorList = ref<VendorItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const totalCount = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalPages = ref(1);

  // computed
  const vendorCount = computed(() => vendorList.value.length);

  // 공급업체 목록 조회
  const fetchVendorList = async (params?: VendorQueryParams) => {
    loading.value = true;
    error.value = null;

    try {
      const requestBody: Record<string, unknown> = {};
      
      if (params?.search_field) requestBody.search_field = params.search_field;
      if (params?.search_value) requestBody.search_value = params.search_value;
      if (params?.page) requestBody.page = params.page;
      if (params?.page_size) requestBody.page_size = params.page_size;
      if (params?.order_by) requestBody.order_by = params.order_by;
      if (params?.order_direction) requestBody.order_direction = params.order_direction;

      const response = await request("/api/vendor/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response?.response) {
        const items = response.response.items || response.response;
        
        // snake_case를 camelCase로 변환
        vendorList.value = items.map((item: Record<string, unknown>) => ({
          id: item.id,
          vendorId: item.vendor_id,
          vendorName: item.vendor_name,
          vendorNameEn: item.vendor_name_en,
          vendorType: item.vendor_type,
          location: item.location,
          address: item.address,
          country: item.country,
          countryCodeTel: item.country_code_tel,
          contactTel: item.contact_tel,
          contactFax: item.contact_fax,
          contactEmail: item.contact_email,
          mainDesignType: item.main_design_type,
          manufacturerCategory: item.manufacturer_category,
          mainProducts: item.main_products,
          homepage: item.homepage,
          brn: item.brn,
          dunsn: item.dunsn,
          certification: item.certification,
          note: item.note,
          isPreferred: item.is_preferred,
          preferredLevel: item.preferred_level,
          isActive: item.is_active,
          createdAt: item.created_at || item.createdAt,
          updatedAt: item.updated_at || item.updatedAt,
        }));
        
        // API 응답의 페이징 정보 저장
        totalCount.value = response.response.total || 0;
        currentPage.value = response.response.page || 1;
        pageSize.value = response.response.page_size || 10;
        totalPages.value = response.response.total_pages || 1;
      }

      return response;
    } catch (err) {
      console.error("공급업체 목록 조회 실패:", err);
      error.value =
        err instanceof Error ? err.message : "공급업체 목록 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 공급업체 상세 조회
  const fetchVendorDetail = async (vendorId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(`/api/vendor/${vendorId}`, undefined, {
        method: "GET",
      });

      return response?.response;
    } catch (err) {
      console.error("공급업체 상세 조회 실패:", err);
      error.value =
        err instanceof Error ? err.message : "공급업체 상세 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 공급업체 등록
  const createVendor = async (vendorData: VendorCreateRequest) => {
    loading.value = true;
    error.value = null;

    try {
      // camelCase를 snake_case로 변환
      const requestData = {
        vendor_id: vendorData.vendorId,
        vendor_name: vendorData.vendorName,
        vendor_name_en: vendorData.vendorNameEn,
        vendor_type: vendorData.vendorType,
        location: vendorData.location,
        address: vendorData.address,
        country: vendorData.country,
        country_code_tel: vendorData.countryCodeTel,
        contact_tel: vendorData.contactTel,
        contact_fax: vendorData.contactFax,
        contact_email: vendorData.contactEmail,
        main_design_type: vendorData.mainDesignType,
        manufacturer_category: vendorData.manufacturerCategory,
        main_products: vendorData.mainProducts,
        homepage: vendorData.homepage,
        brn: vendorData.brn,
        dunsn: vendorData.dunsn,
        certification: vendorData.certification,
        note: vendorData.note,
        is_preferred: vendorData.isPreferred,
        preferred_level: vendorData.preferredLevel,
        is_active: vendorData.isActive,
      };

      const response = await request("/api/vendor", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // 등록 성공 시 목록에 추가
      if (response?.response) {
        const newVendor: VendorItem = {
          id: response.response.id || Date.now().toString(),
          ...vendorData,
          createdAt: new Date().toISOString().split("T")[0],
        };
        vendorList.value.unshift(newVendor);
        totalCount.value += 1;
      }

      return response;
    } catch (err) {
      console.error("공급업체 등록 실패:", err);
      error.value =
        err instanceof Error ? err.message : "공급업체 등록에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 공급업체 수정
  const updateVendor = async (vendorId: string, vendorData: VendorUpdateRequest) => {
    loading.value = true;
    error.value = null;

    try {
      // camelCase를 snake_case로 변환
      const requestData: Record<string, unknown> = {};
      if (vendorData.vendorName !== undefined) requestData.vendor_name = vendorData.vendorName;
      if (vendorData.vendorNameEn !== undefined) requestData.vendor_name_en = vendorData.vendorNameEn;
      if (vendorData.vendorType !== undefined) requestData.vendor_type = vendorData.vendorType;
      if (vendorData.location !== undefined) requestData.location = vendorData.location;
      if (vendorData.address !== undefined) requestData.address = vendorData.address;
      if (vendorData.country !== undefined) requestData.country = vendorData.country;
      if (vendorData.countryCodeTel !== undefined) requestData.country_code_tel = vendorData.countryCodeTel;
      if (vendorData.contactTel !== undefined) requestData.contact_tel = vendorData.contactTel;
      if (vendorData.contactFax !== undefined) requestData.contact_fax = vendorData.contactFax;
      if (vendorData.contactEmail !== undefined) requestData.contact_email = vendorData.contactEmail;
      if (vendorData.mainDesignType !== undefined) requestData.main_design_type = vendorData.mainDesignType;
      if (vendorData.manufacturerCategory !== undefined) requestData.manufacturer_category = vendorData.manufacturerCategory;
      if (vendorData.mainProducts !== undefined) requestData.main_products = vendorData.mainProducts;
      if (vendorData.homepage !== undefined) requestData.homepage = vendorData.homepage;
      if (vendorData.brn !== undefined) requestData.brn = vendorData.brn;
      if (vendorData.dunsn !== undefined) requestData.dunsn = vendorData.dunsn;
      if (vendorData.certification !== undefined) requestData.certification = vendorData.certification;
      if (vendorData.note !== undefined) requestData.note = vendorData.note;
      if (vendorData.isPreferred !== undefined) requestData.is_preferred = vendorData.isPreferred;
      if (vendorData.preferredLevel !== undefined) requestData.preferred_level = vendorData.preferredLevel;
      if (vendorData.isActive !== undefined) requestData.is_active = vendorData.isActive;

      const response = await request(`/api/vendor/${vendorId}`, undefined, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // 수정 성공 시 로컬 목록 업데이트
      if (response?.response) {
        const index = vendorList.value.findIndex((v) => v.id === vendorId);
        if (index !== -1) {
          vendorList.value[index] = {
            ...vendorList.value[index],
            ...vendorData,
            updatedAt: new Date().toISOString().split("T")[0],
          };
        }
      }

      return response;
    } catch (err) {
      console.error("공급업체 수정 실패:", err);
      error.value =
        err instanceof Error ? err.message : "공급업체 수정에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 공급업체 삭제
  const deleteVendor = async (vendorId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(`/api/vendor/${vendorId}`, undefined, {
        method: "DELETE",
      });

      // 삭제 성공 시 로컬 목록에서 제거
      vendorList.value = vendorList.value.filter((v) => v.id !== vendorId);
      totalCount.value = Math.max(0, totalCount.value - 1);

      return response;
    } catch (err) {
      console.error("공급업체 삭제 실패:", err);
      error.value =
        err instanceof Error ? err.message : "공급업체 삭제에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 여러 공급업체 삭제
  const deleteVendors = async (vendorIds: string[]) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/vendor/batch", undefined, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: vendorIds }),
      });

      // 삭제 성공 시 로컬 목록에서 제거
      vendorList.value = vendorList.value.filter(
        (v) => !vendorIds.includes(v.id)
      );
      totalCount.value = Math.max(0, totalCount.value - vendorIds.length);

      return response;
    } catch (err) {
      console.error("공급업체 일괄 삭제 실패:", err);
      error.value =
        err instanceof Error ? err.message : "공급업체 일괄 삭제에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 로컬 상태 업데이트 헬퍼 함수들
  const addLocalVendor = (vendor: VendorItem) => {
    vendorList.value.unshift(vendor);
    totalCount.value += 1;
  };

  const updateLocalVendor = (vendorId: string, vendorData: Partial<VendorItem>) => {
    const index = vendorList.value.findIndex((v) => v.id === vendorId);
    if (index !== -1) {
      vendorList.value[index] = {
        ...vendorList.value[index],
        ...vendorData,
      };
    }
  };

  const removeLocalVendor = (vendorId: string) => {
    vendorList.value = vendorList.value.filter((v) => v.id !== vendorId);
    totalCount.value = Math.max(0, totalCount.value - 1);
  };

  // 상태 초기화
  const resetStore = () => {
    vendorList.value = [];
    loading.value = false;
    error.value = null;
    totalCount.value = 0;
    currentPage.value = 1;
    pageSize.value = 10;
    totalPages.value = 1;
  };

  return {
    // 상태
    vendorList,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    totalPages,
    // computed
    vendorCount,
    // 액션
    fetchVendorList,
    fetchVendorDetail,
    createVendor,
    updateVendor,
    deleteVendor,
    deleteVendors,
    // 로컬 상태 업데이트
    addLocalVendor,
    updateLocalVendor,
    removeLocalVendor,
    resetStore,
  };
});

