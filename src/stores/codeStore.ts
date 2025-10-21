import { ref } from "vue";
import { request } from "../utils/request";

export interface CodeItem {
  code_id: string;
  code_group: string;
  code_key: string;
  code_value: string;
  code_value_en: string;
  parent_key: string;
  code_level: string;
  code_order: string;
  is_active: boolean;
  description: string;
}

export interface CodeGroup {
  key: string;
  value: string;
}

export interface CodeListResponse {
  response: {
    items: CodeItem[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface CodeCreateRequest {
  code_group: string;
  code_key: string;
  code_value: string;
  code_value_en: string;
  code_order: string;
  is_active: boolean;
  parent_key: string;
  code_level: string;
  description: string;
}

export interface CodeUpdateRequest {
  code_value: string;
  code_value_en: string;
  code_order: string;
  is_active: boolean;
  description: string;
}

export interface CodeQueryParams {
  search_field?: string;
  search_value?: string;
  page?: number;
  page_size?: number;
  order_by?: string;
  order_direction?: "asc" | "desc";
}

// State
const codeList = ref<CodeItem[]>([]);
const loading = ref(false);
const totalCount = ref(0);
const uniqueCodeGroups = ref<CodeGroup[]>([]);
const uniqueCategories1 = ref<CodeGroup[]>([]);
const uniqueCategories2 = ref<CodeGroup[]>([]);
const uniqueCategories3 = ref<CodeGroup[]>([]);

// Actions
export const useCodeStore = () => {
  // 코드 목록 조회
  const loadCodeList = async (
    params: CodeQueryParams
  ): Promise<CodeListResponse> => {
    loading.value = true;
    try {
      const result = await request("/api/code/list", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      console.log("코드 목록 조회 성공:", result);

      if (result.response && result.response.items) {
        codeList.value = result.response.items;
        totalCount.value = result.response.total;
      } else {
        codeList.value = [];
        totalCount.value = 0;
      }

      return result;
    } catch (error: any) {
      console.error("코드 목록 조회 실패:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 카테고리 데이터 로드 (공용 함수)
  const loadCategoryData = async (
    parentKey: string,
    categoryName: string
  ): Promise<CodeGroup[]> => {
    try {
      const queryParams: CodeQueryParams = {};

      if (parentKey) {
        queryParams.search_field = "parent_key";
        queryParams.search_value = parentKey;
      } else {
        queryParams.search_field = "parent_key";
        queryParams.search_value = "";
      }

      queryParams.page = 1;
      queryParams.page_size = 100;
      queryParams.order_by = "code_order";
      queryParams.order_direction = "asc";

      console.log(`${categoryName} 조회 파라미터:`, queryParams);

      const result = await request("/api/code/list", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryParams),
      });

      console.log(`${categoryName} 조회 결과:`, result);

      // API 응답에서 데이터 추출하여 code_key와 code_value로 매핑
      let items: any[] = [];
      if (result.response && Array.isArray(result.response.items)) {
        items = result.response.items;
      } else if (result.response && Array.isArray(result.response.data)) {
        items = result.response.data;
      } else if (Array.isArray(result.response)) {
        items = result.response;
      } else if (Array.isArray(result)) {
        items = result;
      }

      // 중복 제거 및 매핑
      const uniqueItems = items.reduce((acc: CodeGroup[], item: any) => {
        const existing = acc.find(
          (existingItem) => existingItem.key === item.code_key
        );
        if (!existing) {
          acc.push({
            key: item.code_key,
            value: item.code_value,
          });
        }
        return acc;
      }, []);

      console.log(`매핑된 ${categoryName}:`, uniqueItems);
      return uniqueItems;
    } catch (error: any) {
      console.error(`${categoryName} 로드 실패:`, error);
      throw error;
    }
  };

  // 코드 그룹 로드
  const loadCodeGroups = async (): Promise<void> => {
    try {
      const groups = await loadCategoryData("", "코드 그룹");
      uniqueCodeGroups.value = groups;
    } catch (error) {
      console.error("코드 그룹 로드 실패:", error);
      uniqueCodeGroups.value = [];
    }
  };

  // 대분류 로드
  const loadCategories1 = async (codeGroupKey: string): Promise<void> => {
    try {
      const categories = await loadCategoryData(codeGroupKey, "대분류");
      uniqueCategories1.value = categories;
    } catch (error) {
      console.error("대분류 로드 실패:", error);
      uniqueCategories1.value = [];
    }
  };

  // 중분류 로드
  const loadCategories2 = async (category1Key: string): Promise<void> => {
    try {
      const categories = await loadCategoryData(category1Key, "중분류");
      uniqueCategories2.value = categories;
    } catch (error) {
      console.error("중분류 로드 실패:", error);
      uniqueCategories2.value = [];
    }
  };

  // 소분류 로드
  const loadCategories3 = async (category2Key: string): Promise<void> => {
    try {
      const categories = await loadCategoryData(category2Key, "소분류");
      uniqueCategories3.value = categories;
    } catch (error) {
      console.error("소분류 로드 실패:", error);
      uniqueCategories3.value = [];
    }
  };

  // 단건 코드 생성
  const createCode = async (data: CodeCreateRequest): Promise<any> => {
    try {
      const response = await request("/api/code/create", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("단건 코드 생성 응답:", response);
      return response;
    } catch (error: any) {
      console.error("단건 코드 생성 실패:", error);
      throw error;
    }
  };

  // 다건 코드 생성
  const createMultipleCodes = async (
    data: CodeCreateRequest[]
  ): Promise<any> => {
    try {
      const response = await request("/api/code/multiCreate", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("다건 코드 생성 응답:", response);
      return response;
    } catch (error: any) {
      console.error("다건 코드 생성 실패:", error);
      throw error;
    }
  };

  // 코드 수정
  const updateCode = async (
    codeId: string,
    data: CodeUpdateRequest
  ): Promise<any> => {
    try {
      const response = await request(`/api/code/update/${codeId}`, undefined, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("코드 수정 응답:", response);
      return response;
    } catch (error: any) {
      console.error("코드 수정 실패:", error);
      throw error;
    }
  };

  // 코드 삭제
  const deleteCode = async (codeId: string): Promise<any> => {
    try {
      const response = await request(`/api/code/delete/${codeId}`, undefined, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("코드 삭제 응답:", response);
      return response;
    } catch (error: any) {
      console.error("코드 삭제 실패:", error);
      throw error;
    }
  };

  // 모든 selectbox 데이터 refresh
  const refreshAllSelectBoxes = async (): Promise<void> => {
    await loadCodeGroups();
  };

  // 로컬 데이터에서 코드 업데이트
  const updateLocalCode = (codeId: string, updatedCode: CodeItem): void => {
    const idx = codeList.value.findIndex((code) => code.code_id === codeId);
    if (idx !== -1) {
      codeList.value[idx] = { ...updatedCode };
    }
  };

  // 로컬 데이터에서 코드 추가
  const addLocalCode = (newCode: CodeItem): void => {
    codeList.value.push(newCode);
  };

  // 로컬 데이터에서 코드 제거
  const removeLocalCode = (codeId: string): void => {
    const idx = codeList.value.findIndex((code) => code.code_id === codeId);
    if (idx !== -1) {
      codeList.value.splice(idx, 1);
    }
  };

  return {
    // State
    codeList,
    loading,
    totalCount,
    uniqueCodeGroups,
    uniqueCategories1,
    uniqueCategories2,
    uniqueCategories3,

    // Actions
    loadCodeList,
    loadCodeGroups,
    loadCategories1,
    loadCategories2,
    loadCategories3,
    createCode,
    createMultipleCodes,
    updateCode,
    deleteCode,
    refreshAllSelectBoxes,
    updateLocalCode,
    addLocalCode,
    removeLocalCode,
  };
};
