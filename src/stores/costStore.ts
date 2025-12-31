import { ref } from "vue";
import { request } from "../utils/request";

export interface CostItem {
  historyId: string;
  equipmentCode: string;
  equipmentId: string;
  priceDate: string;
  priceReference: string;
  priceType: string;
  priceUnitCode: string;
  priceUnitSymbol: string;
  priceValue: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CostCreateRequest {
  historyId: string;
  equipmentCode: string;
  equipmentId: string;
  priceDate: string;
  priceReference: string;
  priceType: string;
  priceUnitCode: string;
  priceUnitSymbol: string;
  priceValue: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CostUpdateRequest {
  historyId: string;
  equipmentCode: string;
  equipmentId: string;
  priceDate: string;
  priceReference: string;
  priceType: string;
  priceUnitCode: string;
  priceUnitSymbol: string;
  priceValue: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface CostQueryParams {
  page?: number;
  page_size?: number;
  search_value?: string;
}

export interface CostListResponse {
  response: {
    data?: CostItem[];
    items?: CostItem[];
    total?: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
  };
}

// State
const costList = ref<CostItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const totalPages = ref(1);

// Actions
export const useCostStore = () => {
  // 단가 목록 조회
  const loadCostList = async (
    params: CostQueryParams
  ): Promise<CostListResponse> => {
    loading.value = true;
    try {
      const searchParams: Record<string, unknown> = {
        page: params.page ?? currentPage.value,
        page_size: params.page_size ?? pageSize.value,
      };

      // 검색어가 있으면 추가
      if (params.search_value) {
        searchParams.search_value = params.search_value;
      }

      const result = await request("/api/cost/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      console.log("단가 목록 조회 성공:", result);

      const data =
        result.response?.data ||
        result.response?.items ||
        result.response ||
        [];
      costList.value = Array.isArray(data) ? data : [];

      // 페이지네이션 정보 업데이트
      if (result.response?.total !== undefined) {
        totalCount.value = result.response.total;
      } else {
        totalCount.value = costList.value.length;
      }

      if (result.response?.total_pages !== undefined) {
        totalPages.value = result.response.total_pages;
      } else {
        totalPages.value = Math.ceil(totalCount.value / pageSize.value) || 1;
      }

      if (result.response?.page !== undefined) {
        currentPage.value = result.response.page;
      }

      return result;
    } catch (error: unknown) {
      console.error("단가 목록 조회 실패:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 단가 등록
  const createCost = async (data: CostCreateRequest): Promise<unknown> => {
    try {
      const response = await request("/api/cost-targets", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("단가 등록 응답:", response);

      // 로컬 데이터에 추가
      const newItem: CostItem = {
        id:
          response.response?.data?.id ||
          response.response?.id ||
          Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString().split("T")[0],
      };
      costList.value.unshift(newItem);
      totalCount.value += 1;

      return response;
    } catch (error: unknown) {
      console.error("단가 등록 실패:", error);
      throw error;
    }
  };

  // 단가 수정
  const updateCost = async (
    costId: string,
    data: CostUpdateRequest
  ): Promise<unknown> => {
    try {
      const response = await request(`/api/cost-targets/${costId}`, undefined, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("단가 수정 응답:", response);

      // 로컬 데이터 업데이트
      const index = costList.value.findIndex((item) => item.id === costId);
      if (index !== -1) {
        costList.value[index] = {
          ...costList.value[index],
          ...data,
        };
      }

      return response;
    } catch (error: unknown) {
      console.error("단가 수정 실패:", error);
      throw error;
    }
  };

  // 단가 삭제
  const deleteCost = async (costId: string): Promise<unknown> => {
    try {
      const response = await request(`/api/cost-targets/${costId}`, undefined, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("단가 삭제 응답:", response);

      // 로컬 데이터에서 제거
      const index = costList.value.findIndex((item) => item.id === costId);
      if (index !== -1) {
        costList.value.splice(index, 1);
        totalCount.value -= 1;
      }

      return response;
    } catch (error: unknown) {
      console.error("단가 삭제 실패:", error);
      throw error;
    }
  };

  // 다중 단가 삭제
  const deleteMultipleCosts = async (costIds: string[]): Promise<void> => {
    try {
      for (const id of costIds) {
        await deleteCost(id);
      }
    } catch (error: unknown) {
      console.error("다중 단가 삭제 실패:", error);
      throw error;
    }
  };

  // 로컬 데이터에서 단가 업데이트
  const updateLocalCost = (costId: string, updatedCost: CostItem): void => {
    const index = costList.value.findIndex((cost) => cost.id === costId);
    if (index !== -1) {
      costList.value[index] = { ...updatedCost };
    }
  };

  // 로컬 데이터에서 단가 추가
  const addLocalCost = (newCost: CostItem): void => {
    costList.value.unshift(newCost);
    totalCount.value += 1;
  };

  // 로컬 데이터에서 단가 제거
  const removeLocalCost = (costId: string): void => {
    const index = costList.value.findIndex((cost) => cost.id === costId);
    if (index !== -1) {
      costList.value.splice(index, 1);
      totalCount.value -= 1;
    }
  };

  // 페이지 변경
  const setCurrentPage = (page: number): void => {
    currentPage.value = page;
  };

  // 페이지 크기 변경
  const setPageSize = (size: number): void => {
    pageSize.value = size;
  };

  // 상태 초기화
  const resetState = (): void => {
    costList.value = [];
    loading.value = false;
    currentPage.value = 1;
    totalCount.value = 0;
    totalPages.value = 1;
  };

  return {
    // State
    costList,
    loading,
    currentPage,
    pageSize,
    totalCount,
    totalPages,

    // Actions
    loadCostList,
    createCost,
    updateCost,
    deleteCost,
    deleteMultipleCosts,
    updateLocalCost,
    addLocalCost,
    removeLocalCost,
    setCurrentPage,
    setPageSize,
    resetState,
  };
};
