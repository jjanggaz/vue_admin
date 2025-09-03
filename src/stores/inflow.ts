import { defineStore } from "pinia";
import { request } from "../utils/request";

// 심볼 정보 인터페이스
export interface SymbolInfo {
  symbol_name: string;
  symbol_code: string;
  symbol_type: string;
  symbol_color: string;
  svg_content: string;
}

// 유입종류 인터페이스
export interface WaterFlowType {
  flow_type_id: string;
  flow_type_code: string;
  flow_type_name: string;
  flow_type_name_en?: string;
  flow_direction: string;
  description?: string;
  svg_symbol_id?: string;
  symbol_info?: SymbolInfo;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// 유입종류 목록 응답 인터페이스
export interface WaterFlowTypeListResponse {
  items: WaterFlowType[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  search_info: any | null;
}

// 유입종류 조회 파라미터 인터페이스
export interface WaterFlowTypeQueryParams {
  search_field?: string;
  search_value?: string;
  page?: number;
  page_size?: number;
  order_by?: string;
  order_direction?: "asc" | "desc";
  flowTypeCode?: string; // 유출종류 코드 추가
}

// Water Flow Type Parameter 관련 인터페이스
export interface WaterFlowTypeParameter {
  mapping_id: string;
  flow_type_id: string;
  parameter_id: string;
  is_required: boolean;
  default_value?: number;
  min_value?: number;
  max_value?: number;
  parameter_unit?: string;
  remarks?: string;
  created_at: string;
  created_by?: string;
  is_active: boolean;
  updated_at?: string;
  updated_by?: string;
  unit_system_code: string;
  unit_id?: string;
}

export interface WaterFlowTypeParameterFormData {
  flow_type_id: string;
  parameter_id?: string;
  parameter_name?: string;
  is_required?: boolean;
  default_value?: number;
  min_value?: number;
  max_value?: number;
  parameter_unit?: string;
  remarks?: string;
  unit_system_code: "METRIC" | "IMPERIAL";
  unit_id?: string;
}

export interface WaterFlowTypeParameterCreateRequest {
  flow_type_id: string;
  parameters: Array<{
    parameter_name: string;
    is_required?: boolean;
    default_value?: number;
    min_value?: number;
    max_value?: number;
    parameter_unit?: string;
    remarks?: string;
    unit_system_code: "METRIC" | "IMPERIAL";
    unit_id?: string;
  }>;
}

// 유입종류 등록/수정용 인터페이스
export interface WaterFlowTypeFormData {
  flow_type_id?: string; // UUID (수정 시 필요)
  flow_type_code: string; // 유입종류 코드 (필수)
  flow_type_name: string; // 유입종류명 (필수)
  flow_type_name_en?: string; // 영문 유입종류명 (선택)
  flow_direction: string; // 유입 방향 (필수)
  description?: string; // 설명 (선택)
  svg_symbol_id?: string; // SVG 심볼 ID (선택)
  symbol_color?: string; // 심볼 색상 (선택)
  is_active?: boolean; // 활성 상태 (기본값: true)
  metric_parameters?: Array<{
    parameter_name: string;
    is_required?: boolean;
    default_value?: number;
    parameter_unit?: string;
    remarks?: string;
  }>;
  imperial_parameters?: Array<{
    parameter_name: string;
    is_required?: boolean;
    default_value?: number;
    parameter_unit?: string;
    remarks?: string;
  }>;
}

// 수질 파라미터 인터페이스
export interface WaterQualityParameter {
  parameter_id: string;
  parameter_code: string;
  parameter_name: string;
  parameter_name_en: string;
  parameter_type: string;
  default_unit: string;
  description: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export interface WaterQualityParameterListResponse {
  items: WaterQualityParameter[];
  total: number;
}

// 공통코드 인터페이스
export interface CommonCode {
  code_id: string;
  created_at: string;
  system_code: string;
  is_active: boolean;
  is_leaf: boolean;
  code_group: string;
  code_key: string;
  code_value: string;
  code_value_en: string;
  parent_key: string;
  code_level: number;
  code_order: number;
  description: string;
  iso15926_rdl?: string;
  updated_at?: string;
  created_by: string;
  updated_by?: string;
}

export interface CommonCodeListResponse {
  items: CommonCode[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 유입종류 파라미터 응답 인터페이스
export interface WaterFlowTypeParameterResponse {
  mapping_id: string;
  flow_type_id: string;
  flow_type_code: string;
  flow_type_name: string;
  flow_type_name_en?: string;
  flow_direction: string;
  description?: string;
  parameter_id: string;
  parameter_code: string;
  parameter_name: string;
  parameter_name_en?: string;
  parameter_type: string;
  parameter_description?: string;
  is_required: boolean;
  default_value: string;
  min_value: string;
  max_value: string;
  parameter_unit: string;
  remarks: string;
  is_active: boolean;
  unit_system_code: string; // METRIC 또는 IMPERIAL
}

export interface WaterFlowTypeParameterListResponse {
  items: WaterFlowTypeParameterResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  search_info: {
    flow_direction: string;
    flow_type_code: string;
    page: number;
    page_size: number;
  };
}

// 유입종류 전용 Store
export const useInflowStore = defineStore("inflow", {
  state: () => ({
    waterFlowTypes: [] as WaterFlowType[], // 유입종류 목록
    waterFlowTypeParameters: [] as WaterFlowTypeParameterResponse[], // 유입종류별 파라미터 목록
    waterQualityParameters: [] as WaterQualityParameter[], // 수질 파라미터 목록
    commonCodes: [] as CommonCode[], // 공통코드 목록
    loading: false,
    totalCount: 0,
    page: 1,
    page_size: 10,
    hasMore: false,
    error: null as string | null,
  }),

  actions: {
    // 유입종류 목록 조회
    async fetchWaterFlowTypes(params: WaterFlowTypeQueryParams = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams: Record<string, string> = {};

        // 검색 조건 설정
        if (params.search_field !== undefined)
          queryParams.search_field = params.search_field;
        if (params.search_value !== undefined)
          queryParams.search_value = params.search_value;

        // 페이지네이션 설정
        queryParams.page = (params.page || this.page).toString();
        queryParams.page_size = (params.page_size || this.page_size).toString();

        // 정렬 설정
        if (params.order_by !== undefined)
          queryParams.order_by = params.order_by;
        if (params.order_direction !== undefined)
          queryParams.order_direction = params.order_direction;

        if (params.flowTypeCode !== undefined)
          queryParams.flowTypeCode = params.flowTypeCode;

        const response = await request("/api/inflow/list", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(queryParams),
        });

        // API 응답 처리
        if (response.response && response.response.items) {
          this.waterFlowTypes = response.response.items;
          this.totalCount = response.response.total;
          this.page = response.response.page;
          this.page_size = response.response.page_size;
          this.hasMore = response.response.page < response.response.total_pages;
        } else {
          this.waterFlowTypes = [];
          this.totalCount = 0;
          this.page = 1;
          this.page_size = 10;
          this.hasMore = false;
        }
      } catch (error) {
        console.error("유입종류 목록 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유입종류 목록 조회에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 유입종류별 파라미터 조회
    async fetchWaterFlowTypeParameters(
      flowDirection: string,
      flowTypeCode: string
    ) {
      this.loading = true;
      this.error = null;

      try {
        // flowDirection 유효성 검사
        if (!flowDirection || flowDirection.trim() === "") {
          this.waterFlowTypeParameters = [];
          return { items: [], total: 0 };
        }

        // flowTypeCode 유효성 검사
        if (!flowTypeCode || flowTypeCode.trim() === "") {
          this.waterFlowTypeParameters = [];
          return { items: [], total: 0 };
        }

        const encodedFlowTypeCode = encodeURIComponent(flowTypeCode);

        // 요청 본문 설정
        const requestBody = {
          flowDirection: flowDirection,
          flowTypeCode: encodedFlowTypeCode,
        };

        const url = "/api/inflow/parameters";

        const response = await request(url, undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // API 응답 처리
        if (response.response && response.response.items) {
          this.waterFlowTypeParameters = response.response.items;
        } else {
          this.waterFlowTypeParameters = [];
        }

        return response.response;
      } catch (error) {
        console.error("유입종류 파라미터 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유입종류 파라미터 조회에 실패했습니다.";
        this.waterFlowTypeParameters = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 수질 파라미터 목록 조회
    async fetchWaterQualityParameters() {
      this.loading = true;
      this.error = null;

      try {
        const response = await request("/api/inflow/listLookup", undefined, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // API 응답 처리
        if (response.response && response.response.items) {
          this.waterQualityParameters = response.response.items;
        } else {
          this.waterQualityParameters = [];
        }

        return response.response;
      } catch (error) {
        console.error("수질 파라미터 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "수질 파라미터 조회에 실패했습니다.";
        this.waterQualityParameters = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 공통코드 조회
    async fetchCommonCodes(
      codeGroup?: string,
      parentKey?: string,
      isActive?: boolean
    ) {
      this.loading = true;
      this.error = null;
      try {
        const queryParams: Record<string, string> = {};

        if (codeGroup) queryParams.code_group = codeGroup;
        if (parentKey) queryParams.parent_key = parentKey;
        if (isActive !== undefined) queryParams.is_active = isActive.toString();

        const queryString = new URLSearchParams(queryParams).toString();
        const url = `/api/inflow/common/codes${
          queryString ? `?${queryString}` : ""
        }`;
        const response = await request(url, undefined, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // API 응답 처리
        if (response.response && response.response.items) {
          this.commonCodes = response.response.items;
        } else {
          this.commonCodes = [];
        }

        return response.response;
      } catch (error) {
        console.error("공통코드 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "공통코드 조회에 실패했습니다.";
        this.commonCodes = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 페이지 변경 (검색 조건 유지)
    async changePage(
      page: number,
      searchParams?: { search_field?: string; search_value?: string }
    ) {
      await this.fetchWaterFlowTypes({
        page,
        page_size: this.page_size,
        ...searchParams,
      });
    },

    // 페이지 크기 변경
    async changePageSize(pageSize: number) {
      await this.fetchWaterFlowTypes({
        page: 1, // 페이지 크기 변경 시 첫 페이지로
        page_size: pageSize,
      });
    },

    // 유입종류 등록
    async createWaterFlowType(requestData: {
      waterFlowTypeData: WaterFlowTypeFormData;
      symbolFile?: File;
    }) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();

        // waterFlowTypeData를 JSON 문자열로 변환하여 추가
        formData.append(
          "waterFlowTypeData",
          JSON.stringify(requestData.waterFlowTypeData)
        );

        // 파일이 있으면 symbolFile로 추가
        if (requestData.symbolFile) {
          formData.append("symbolFile", requestData.symbolFile);
        }

        const response = await request("/api/inflow/create", undefined, {
          method: "POST",
          body: formData,
        });

        // 등록 후 유입종류 목록 새로고침
        await this.fetchWaterFlowTypes({
          page: this.page,
          page_size: this.page_size,
        });

        return response;
      } catch (error) {
        console.error("유입종류 등록 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유입종류 등록에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 유입종류 파라미터 등록
    async createWaterFlowTypeParameters(
      parameterData: WaterFlowTypeParameterCreateRequest
    ) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request(
          "/api/inflow/parameters/create",
          undefined,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(parameterData),
          }
        );

        return response;
      } catch (error) {
        console.error("유입종류 파라미터 등록 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유입종류 파라미터 등록에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 유입종류 수정
    async updateWaterFlowType(
      flowTypeId: string,
      requestData: {
        waterFlowTypeData: Partial<WaterFlowTypeFormData>;
        symbolFile?: File;
      }
    ) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();

        // waterFlowTypeData를 JSON 문자열로 변환하여 추가
        formData.append(
          "waterFlowTypeData",
          JSON.stringify(requestData.waterFlowTypeData)
        );

        // 파일이 있으면 symbolFile로 추가
        if (requestData.symbolFile) {
          formData.append("symbolFile", requestData.symbolFile);
        }

        const response = await request(
          `/api/inflow/update/${flowTypeId}`,
          undefined,
          {
            method: "POST",
            body: formData,
          }
        );

        // 수정 후 유입종류 목록 새로고침
        await this.fetchWaterFlowTypes({
          page: this.page,
          page_size: this.page_size,
        });

        return response;
      } catch (error) {
        console.error("유입종류 수정 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유입종류 수정에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 심볼 파일 정보 조회
    async fetchSymbolFileInfo(symbolId: string) {
      try {
        const response = await request(
          `/api/inflow/fileInfo/${symbolId}`,
          undefined,
          {
            method: "GET",
          }
        );
        return response;
      } catch (error) {
        console.error("심볼 파일 정보 조회 실패:", error);
        throw error;
      }
    },

    // 유입종류 삭제
    async deleteWaterFlowType(flowTypeId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request(
          `/api/inflow/delete/${flowTypeId}`,
          undefined,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // 삭제 후 유입종류 목록 새로고침
        await this.fetchWaterFlowTypes({
          page: this.page,
          page_size: this.page_size,
        });

        return response;
      } catch (error) {
        console.error("유입종류 삭제 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유입종류 삭제에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 수질 파라미터 등록
    async createWaterQualityParameter(
      parameterData: Partial<WaterQualityParameter>
    ) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request("/api/inflow/codeInsert", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parameterData),
        });

        return response;
      } catch (error) {
        console.error("수질 파라미터 등록 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "수질 파라미터 등록에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 상태 초기화
    resetState() {
      this.waterFlowTypes = [];
      this.waterFlowTypeParameters = [];
      this.waterQualityParameters = [];
      this.commonCodes = [];
      this.loading = false;
      this.totalCount = 0;
      this.page = 1;
      this.page_size = 10;
      this.hasMore = false;
      this.error = null;
    },
  },

  getters: {
    // 총 페이지 수 계산
    totalPages: (state) => {
      return Math.ceil(state.totalCount / state.page_size);
    },
  },
});
