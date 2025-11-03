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
  keyword?: string;
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
  const pageSize = ref(20);
  const totalPages = ref(1);
  const searchQuery = ref("");
  const detailVendor = ref<VendorItem | null>(null);

  // computed
  const vendorCount = computed(() => vendorList.value.length);

  // 공급업체 목록 조회
  const fetchVendorList = async (params?: VendorQueryParams) => {
    loading.value = true;
    error.value = null;

    try {
      const requestBody: Record<string, unknown> = {};

      if (params?.keyword !== undefined) requestBody.keyword = params.keyword;
      if (params?.page) requestBody.page = params.page;
      if (params?.page_size) requestBody.page_size = params.page_size;
      if (params?.order_by) requestBody.order_by = params.order_by;
      if (params?.order_direction)
        requestBody.order_direction = params.order_direction;

      console.log("fetchVendorList 호출 - 요청 파라미터:", requestBody);

      const response = await request("/api/vendor/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("fetchVendorList 응답:", response);

      if (response?.response) {
        const items = response.response.items || response.response;

        console.log("응답 items:", items);

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
          certification: item.certificaton || item.certification, // 백엔드 오타 대응
          note: item.note,
          isPreferred: item.is_preferred ?? false,
          preferredLevel: item.preferred_level ?? 0,
          isActive: item.is_active ?? true,
          createdAt: item.created_at || item.createdAt,
          updatedAt: item.updated_at || item.updatedAt,
        }));

        // API 응답의 페이징 정보 저장 (pageSize는 클라이언트에서 고정)
        totalCount.value = response.response.total || 0;
        currentPage.value = response.response.page || 1;
        // pageSize.value = response.response.page_size || 20; // 서버 응답 무시 (항상 20 유지)
        totalPages.value = response.response.total_pages || 1;

        console.log("페이징 정보 저장 (fetchVendorList):", {
          total: totalCount.value,
          page: currentPage.value,
          pageSize: pageSize.value, // 항상 20
          totalPages: totalPages.value,
          vendorListLength: vendorList.value.length,
        });
      }

      return response;
    } catch (err) {
      console.error("공급업체 목록 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "공급업체 목록 조회에 실패했습니다.";
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
      console.log("fetchVendorDetail 호출 - vendorId:", vendorId);

      const response = await request(
        `/api/vendor/detail/${vendorId}`,
        undefined,
        {
          method: "GET",
        }
      );

      console.log("fetchVendorDetail 응답:", response);

      return response?.response;
    } catch (err) {
      console.error("공급업체 상세 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "공급업체 상세 조회에 실패했습니다.";
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
      const requestData: Record<string, unknown> = {
        vendor_id: vendorData.vendorId,
        vendor_name: vendorData.vendorName,
        vendor_name_en: vendorData.vendorNameEn || "",
        vendor_type: vendorData.vendorType || "",
        location: vendorData.location || "",
        address: vendorData.address || "",
        country: vendorData.country || "",
        country_code_tel: vendorData.countryCodeTel || "",
        contact_tel: vendorData.contactTel || "",
        contact_fax: vendorData.contactFax || "",
        contact_email: vendorData.contactEmail || "",
        main_design_type: vendorData.mainDesignType || "",
        manufacturer_category: vendorData.manufacturerCategory || "",
        main_products: vendorData.mainProducts || "",
        homepage: vendorData.homepage || "",
        brn: vendorData.brn || "",
        dunsn: vendorData.dunsn || "",
        certificaton: vendorData.certification || "", // 백엔드 API 필드명 (오타)
        note: vendorData.note || "",
        is_preferred: vendorData.isPreferred ?? false,
        preferred_level: vendorData.preferredLevel || null,
        is_active: vendorData.isActive ?? true,
      };

      console.log("createVendor 호출 - requestData:", requestData);

      const response = await request("/api/vendor/create", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("createVendor 응답:", response);

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
  const updateVendor = async (
    vendorId: string,
    vendorData: VendorUpdateRequest
  ) => {
    loading.value = true;
    error.value = null;

    try {
      // camelCase를 snake_case로 변환
      const requestData: Record<string, unknown> = {};
      if (vendorData.vendorName !== undefined)
        requestData.vendor_name = vendorData.vendorName;
      if (vendorData.vendorNameEn !== undefined)
        requestData.vendor_name_en = vendorData.vendorNameEn || "";
      if (vendorData.vendorType !== undefined)
        requestData.vendor_type = vendorData.vendorType || "";
      if (vendorData.location !== undefined)
        requestData.location = vendorData.location || "";
      if (vendorData.address !== undefined)
        requestData.address = vendorData.address || "";
      if (vendorData.country !== undefined)
        requestData.country = vendorData.country || "";
      if (vendorData.countryCodeTel !== undefined)
        requestData.country_code_tel = vendorData.countryCodeTel || "";
      if (vendorData.contactTel !== undefined)
        requestData.contact_tel = vendorData.contactTel || "";
      if (vendorData.contactFax !== undefined)
        requestData.contact_fax = vendorData.contactFax || "";
      if (vendorData.contactEmail !== undefined)
        requestData.contact_email = vendorData.contactEmail || "";
      if (vendorData.mainDesignType !== undefined)
        requestData.main_design_type = vendorData.mainDesignType || "";
      if (vendorData.manufacturerCategory !== undefined)
        requestData.manufacturer_category =
          vendorData.manufacturerCategory || "";
      if (vendorData.mainProducts !== undefined)
        requestData.main_products = vendorData.mainProducts || "";
      if (vendorData.homepage !== undefined)
        requestData.homepage = vendorData.homepage || "";
      if (vendorData.brn !== undefined) requestData.brn = vendorData.brn || "";
      if (vendorData.dunsn !== undefined)
        requestData.dunsn = vendorData.dunsn || "";
      if (vendorData.certification !== undefined)
        requestData.certificaton = vendorData.certification || ""; // 백엔드 API 필드명 (오타)
      if (vendorData.note !== undefined)
        requestData.note = vendorData.note || "";
      if (vendorData.isPreferred !== undefined)
        requestData.is_preferred = vendorData.isPreferred ?? false;
      if (vendorData.preferredLevel !== undefined)
        requestData.preferred_level = vendorData.preferredLevel || null;
      if (vendorData.isActive !== undefined)
        requestData.is_active = vendorData.isActive ?? true;

      console.log(
        "updateVendor 호출 - vendorId:",
        vendorId,
        "requestData:",
        requestData
      );

      const response = await request(
        `/api/vendor/update/${vendorId}`,
        undefined,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      console.log("updateVendor 응답:", response);

      // 수정 성공 시 로컬 목록 업데이트
      if (response?.response) {
        const index = vendorList.value.findIndex(
          (v) => v.vendorId === vendorId
        );
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
      console.log("deleteVendor 호출 - vendorId:", vendorId);

      const response = await request(
        `/api/vendor/delete/${vendorId}`,
        undefined,
        {
          method: "DELETE",
        }
      );

      console.log("deleteVendor 응답:", response);

      // 삭제 성공 시 로컬 목록에서 제거
      vendorList.value = vendorList.value.filter(
        (v) => v.vendorId !== vendorId
      );
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

  // 여러 공급업체 삭제 (각각 개별 API 호출)
  const deleteVendors = async (vendorIds: string[]) => {
    loading.value = true;
    error.value = null;

    try {
      console.log("deleteVendors 호출 - vendorIds:", vendorIds);

      // 각 vendorId에 대해 개별 삭제 API 호출
      const deletePromises = vendorIds.map((vendorId) =>
        request(`/api/vendor/delete/${vendorId}`, undefined, {
          method: "DELETE",
        })
      );

      const responses = await Promise.all(deletePromises);

      console.log("deleteVendors 응답:", responses);

      // 삭제 성공 시 로컬 목록에서 제거
      vendorList.value = vendorList.value.filter(
        (v) => !vendorIds.includes(v.vendorId)
      );
      totalCount.value = Math.max(0, totalCount.value - vendorIds.length);

      return responses;
    } catch (err) {
      console.error("공급업체 일괄 삭제 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "공급업체 일괄 삭제에 실패했습니다.";
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

  const updateLocalVendor = (
    vendorId: string,
    vendorData: Partial<VendorItem>
  ) => {
    const index = vendorList.value.findIndex((v) => v.vendorId === vendorId);
    if (index !== -1) {
      vendorList.value[index] = {
        ...vendorList.value[index],
        ...vendorData,
      };
    }
  };

  const removeLocalVendor = (vendorId: string) => {
    vendorList.value = vendorList.value.filter((v) => v.vendorId !== vendorId);
    totalCount.value = Math.max(0, totalCount.value - 1);
  };

  // 데이터 로드 (검색 및 페이징 통합)
  const loadVendorData = async () => {
    loading.value = true;
    error.value = null;

    try {
      console.log(
        "loadVendorData 시작 - searchQuery.value:",
        searchQuery.value
      );
      console.log(
        "loadVendorData 시작 - pageSize.value:",
        pageSize.value,
        "(항상 10이어야 함)"
      );

      const requestBody: Record<string, unknown> = {
        keyword: searchQuery.value || "",
        page: currentPage.value,
        page_size: pageSize.value,
        order_by: "vendor_id",
        order_direction: "asc",
      };

      console.log(
        "loadVendorData 호출 - 요청 파라미터 (keyword 포함):",
        requestBody
      );

      const response = await request("/api/vendor/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("loadVendorData 응답:", response);

      if (response?.response) {
        const items = response.response.items || response.response;

        console.log("응답 items:", items);

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
          certification: item.certificaton || item.certification, // 백엔드 오타 대응
          note: item.note,
          isPreferred: item.is_preferred ?? false,
          preferredLevel: item.preferred_level ?? 0,
          isActive: item.is_active ?? true,
          createdAt: item.created_at || item.createdAt,
          updatedAt: item.updated_at || item.updatedAt,
        }));

        // API 응답의 페이징 정보 저장 (pageSize는 클라이언트에서 고정)
        totalCount.value = response.response.total || 0;
        currentPage.value = response.response.page || 1;
        // pageSize.value = response.response.page_size || 20; // 서버 응답 무시 (항상 20 유지)
        totalPages.value = response.response.total_pages || 1;

        console.log("페이징 정보 저장 (loadVendorData):", {
          total: totalCount.value,
          page: currentPage.value,
          pageSize: pageSize.value, // 항상 20
          totalPages: totalPages.value,
          vendorListLength: vendorList.value.length,
        });
      }

      return response;
    } catch (err) {
      console.error("공급업체 데이터 로드 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "공급업체 데이터 로드에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 검색 실행
  const executeSearch = async (searchValue: string) => {
    console.log("executeSearch 호출 - searchValue:", searchValue);
    searchQuery.value = searchValue;
    currentPage.value = 1; // 검색 시 첫 페이지로
    console.log("executeSearch - searchQuery 저장 완료:", searchQuery.value);
    await loadVendorData();
  };

  // 페이지 변경
  const changePage = async (page: number) => {
    console.log(
      "changePage 호출 - 이전 페이지:",
      currentPage.value,
      "→ 새 페이지:",
      page
    );
    currentPage.value = page;
    await loadVendorData();
  };

  // 상세정보 관련
  const setDetailVendor = (vendor: VendorItem | null) => {
    detailVendor.value = vendor ? { ...vendor } : null;
  };

  const updateDetailVendorField = (
    fieldName: keyof VendorItem,
    value: unknown
  ) => {
    if (!detailVendor.value) return;

    (detailVendor.value as Record<string, unknown>)[fieldName] = value;
  };

  const saveDetailVendor = async () => {
    if (!detailVendor.value) {
      throw new Error("저장할 상세정보가 없습니다.");
    }

    const updateData: VendorUpdateRequest = {
      vendorName: detailVendor.value.vendorName,
      vendorNameEn: detailVendor.value.vendorNameEn,
      vendorType: detailVendor.value.vendorType,
      location: detailVendor.value.location,
      address: detailVendor.value.address,
      country: detailVendor.value.country,
      countryCodeTel: detailVendor.value.countryCodeTel,
      contactTel: detailVendor.value.contactTel,
      contactFax: detailVendor.value.contactFax,
      contactEmail: detailVendor.value.contactEmail,
      mainDesignType: detailVendor.value.mainDesignType,
      manufacturerCategory: detailVendor.value.manufacturerCategory,
      mainProducts: detailVendor.value.mainProducts,
      homepage: detailVendor.value.homepage,
      brn: detailVendor.value.brn,
      dunsn: detailVendor.value.dunsn,
      certification: detailVendor.value.certification,
      note: detailVendor.value.note,
      isPreferred: detailVendor.value.isPreferred,
      preferredLevel: detailVendor.value.preferredLevel,
      isActive: detailVendor.value.isActive,
    };

    await updateVendor(detailVendor.value.vendorId, updateData);
    await loadVendorData();
  };

  // 상태 초기화
  const resetStore = () => {
    vendorList.value = [];
    loading.value = false;
    error.value = null;
    totalCount.value = 0;
    currentPage.value = 1;
    pageSize.value = 20;
    totalPages.value = 1;
    searchQuery.value = "";
    detailVendor.value = null;
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
    searchQuery,
    detailVendor,
    // computed
    vendorCount,
    // 액션
    fetchVendorList,
    fetchVendorDetail,
    createVendor,
    updateVendor,
    deleteVendor,
    deleteVendors,
    loadVendorData,
    executeSearch,
    changePage,
    // 상세정보 관련
    setDetailVendor,
    updateDetailVendorField,
    saveDetailVendor,
    // 로컬 상태 업데이트
    addLocalVendor,
    updateLocalVendor,
    removeLocalVendor,
    resetStore,
  };
});
