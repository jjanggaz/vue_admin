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

// 유출종류 인터페이스
export interface OutflowWaterFlowType {
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

// 유출종류 목록 응답 인터페이스
export interface OutflowWaterFlowTypeListResponse {
  items: OutflowWaterFlowType[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  search_info: any | null;
}

// 유출종류 조회 파라미터 인터페이스
export interface OutflowWaterFlowTypeQueryParams {
  search_field?: string;
  search_value?: string;
  page?: number;
  page_size?: number;
  order_by?: string;
  order_direction?: "asc" | "desc";
  flowTypeCode?: string;
}

// 유출종류 파라미터 응답 인터페이스
export interface OutflowWaterFlowTypeParameterResponse {
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

export interface OutflowWaterFlowTypeParameterListResponse {
  items: OutflowWaterFlowTypeParameterResponse[];
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

// 수질 파라미터 인터페이스
export interface OutflowWaterQualityParameter {
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

export interface OutflowWaterQualityParameterListResponse {
  items: OutflowWaterQualityParameter[];
  total: number;
}

// 공통코드 인터페이스
export interface OutflowCommonCode {
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

export interface OutflowCommonCodeListResponse {
  items: OutflowCommonCode[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// 유출종류 등록/수정용 인터페이스
export interface OutflowWaterFlowTypeFormData {
  flow_type_id?: string; // UUID (수정 시 필요)
  flow_type_code: string; // 유출종류 코드 (필수)
  flow_type_name: string; // 유출종류명 (필수)
  flow_type_name_en?: string; // 영문 유출종류명 (선택)
  flow_direction: string; // 유출 방향 (필수)
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

export interface OutflowWaterFlowTypeParameterCreateRequest {
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

// 유출종류 전용 Store
export const useOutflowStore = defineStore("outflow", {
  state: () => ({
    waterFlowTypes: [] as OutflowWaterFlowType[], // 유출종류 목록
    waterFlowTypeParameters: [] as OutflowWaterFlowTypeParameterResponse[], // 유출종류별 파라미터 목록
    waterQualityParameters: [] as OutflowWaterQualityParameter[], // 수질 파라미터 목록
    commonCodes: [] as OutflowCommonCode[], // 공통코드 목록
    loading: false,
    totalCount: 0,
    page: 1,
    page_size: 10,
    hasMore: false,
    error: null as string | null,
  }),

  actions: {
    // 유출종류 목록 조회
    async fetchWaterFlowTypes(params: OutflowWaterFlowTypeQueryParams = {}) {
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

        const response = await request("/api/outflow/list", undefined, {
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

        console.log("유출종류 목록 조회 성공:", response);
      } catch (error) {
        console.error("유출종류 목록 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유출종류 목록 조회에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 유출종류별 파라미터 조회
    async fetchWaterFlowTypeParameters(flowTypeCode: string) {
      this.loading = true;
      this.error = null;

      try {
        console.log("fetchWaterFlowTypeParameters 호출됨:", {
          flowTypeCode: flowTypeCode,
          flowTypeCodeType: typeof flowTypeCode,
          flowTypeCodeLength: flowTypeCode?.length,
        });

        // flowTypeCode 유효성 검사
        if (!flowTypeCode || flowTypeCode.trim() === "") {
          console.error("flowTypeCode가 비어있습니다:", flowTypeCode);
          this.waterFlowTypeParameters = [];
          return { items: [], total: 0 };
        }

        const encodedFlowTypeCode = encodeURIComponent(flowTypeCode);
        const url = `/api/outflow/parameters/${encodedFlowTypeCode}`;
        console.log("요청 URL:", url);

        const response = await request(url, undefined, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("API 응답 상태:", {
          response: response,
          status: response?.status,
          success: response?.success,
        });

        // API 응답 처리
        if (response.response && response.response.items) {
          this.waterFlowTypeParameters = response.response.items;
          console.log("유출종류 파라미터 조회 성공:", response.response.items);
        } else {
          this.waterFlowTypeParameters = [];
          console.log("유출종류 파라미터가 비어있습니다.");
        }

        return response.response;
      } catch (error) {
        console.error("유출종류 파라미터 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유출종류 파라미터 조회에 실패했습니다.";
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
        const response = await request(
          "/api/outflow/water-quality-parameters",
          undefined,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // API 응답 처리
        if (response.response && response.response.items) {
          this.waterQualityParameters = response.response.items;
          console.log("수질 파라미터 조회 성공:", response.response.items);
        } else {
          this.waterQualityParameters = [];
          console.log("수질 파라미터가 비어있습니다.");
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
      console.log("공통코드 조회 시작");
      try {
        const queryParams: Record<string, string> = {};

        if (codeGroup) queryParams.code_group = codeGroup;
        if (parentKey) queryParams.parent_key = parentKey;
        if (isActive !== undefined) queryParams.is_active = isActive.toString();

        const queryString = new URLSearchParams(queryParams).toString();
        const url = `/api/outflow/common/codes${
          queryString ? `?${queryString}` : ""
        }`;
        console.log("공통코드 조회 URL:", url);
        const response = await request(url, undefined, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // API 응답 처리
        if (response.response && response.response.items) {
          this.commonCodes = response.response.items;
          console.log("공통코드 조회 성공:", response.response.items);
        } else {
          this.commonCodes = [];
          console.log("공통코드가 비어있습니다.");
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

    // 유출종류 등록
    async createWaterFlowType(waterFlowTypeData: OutflowWaterFlowTypeFormData) {
      this.loading = true;
      this.error = null;

      try {
        // 새로운 API 스펙에 맞게 데이터 변환
        const requestData: any = {
          flow_type_code: waterFlowTypeData.flow_type_code,
          flow_type_name: waterFlowTypeData.flow_type_name,
          flow_direction: waterFlowTypeData.flow_direction,
        };

        // 선택적 필드들 추가
        if (waterFlowTypeData.flow_type_name_en) {
          requestData.flow_type_name_en = waterFlowTypeData.flow_type_name_en;
        }

        if (waterFlowTypeData.description) {
          requestData.description = waterFlowTypeData.description;
        }

        if (waterFlowTypeData.svg_symbol_id) {
          requestData.svg_symbol_id = waterFlowTypeData.svg_symbol_id;
        }

        if (waterFlowTypeData.symbol_color) {
          requestData.symbol_color = waterFlowTypeData.symbol_color;
        }

        if (waterFlowTypeData.is_active !== undefined) {
          requestData.is_active = waterFlowTypeData.is_active;
        }

        // Metric 파라미터 추가
        if (
          waterFlowTypeData.metric_parameters &&
          waterFlowTypeData.metric_parameters.length > 0
        ) {
          requestData.metric_parameters =
            waterFlowTypeData.metric_parameters.map((param) => ({
              parameter_name: param.parameter_name,
              is_required: param.is_required || false,
              default_value: param.default_value,
              parameter_unit: param.parameter_unit,
              remarks: param.remarks,
              unit_system_code: "METRIC",
            }));
        }

        // Imperial 파라미터 추가
        if (
          waterFlowTypeData.imperial_parameters &&
          waterFlowTypeData.imperial_parameters.length > 0
        ) {
          requestData.imperial_parameters =
            waterFlowTypeData.imperial_parameters.map((param) => ({
              parameter_name: param.parameter_name,
              is_required: param.is_required || false,
              default_value: param.default_value,
              parameter_unit: param.parameter_unit,
              remarks: param.remarks,
              unit_system_code: "IMPERIAL",
            }));
        }

        console.log(
          "유출종류 등록 요청 데이터:",
          JSON.stringify(requestData, null, 2)
        );

        const response = await request("/api/outflow/create", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        // 등록 후 유출종류 목록 새로고침
        await this.fetchWaterFlowTypes({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("유출종류 등록 성공:", response);
        return response;
      } catch (error) {
        console.error("유출종류 등록 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유출종류 등록에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 유출종류 파라미터 등록
    async createWaterFlowTypeParameters(
      parameterData: OutflowWaterFlowTypeParameterCreateRequest
    ) {
      this.loading = true;
      this.error = null;

      try {
        console.log(
          "유출종류 파라미터 등록 요청 데이터:",
          JSON.stringify(parameterData, null, 2)
        );

        const response = await request(
          "/api/outflow/parameters/create",
          undefined,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(parameterData),
          }
        );

        console.log("유출종류 파라미터 등록 성공:", response);
        return response;
      } catch (error) {
        console.error("유출종류 파라미터 등록 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유출종류 파라미터 등록에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 유출종류 수정
    async updateWaterFlowType(
      flowTypeId: string,
      waterFlowTypeData: Partial<OutflowWaterFlowTypeFormData>
    ) {
      this.loading = true;
      this.error = null;

      try {
        const requestData: any = {};

        // 필드별로 값이 있는 경우에만 추가
        if (waterFlowTypeData.flow_type_code) {
          requestData.flow_type_code = waterFlowTypeData.flow_type_code;
        }
        if (waterFlowTypeData.flow_type_name) {
          requestData.flow_type_name = waterFlowTypeData.flow_type_name;
        }
        if (waterFlowTypeData.flow_type_name_en) {
          requestData.flow_type_name_en = waterFlowTypeData.flow_type_name_en;
        }
        if (waterFlowTypeData.flow_direction) {
          requestData.flow_direction = waterFlowTypeData.flow_direction;
        }
        if (waterFlowTypeData.description) {
          requestData.description = waterFlowTypeData.description;
        }
        if (waterFlowTypeData.svg_symbol_id) {
          requestData.svg_symbol_id = waterFlowTypeData.svg_symbol_id;
        }
        if (waterFlowTypeData.symbol_color) {
          requestData.symbol_color = waterFlowTypeData.symbol_color;
        }
        if (waterFlowTypeData.is_active !== undefined) {
          requestData.is_active = waterFlowTypeData.is_active;
        }

        console.log(
          "유출종류 수정 요청 데이터:",
          JSON.stringify(requestData, null, 2)
        );

        const response = await request(
          `/api/outflow/update/${flowTypeId}`,
          undefined,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        // 수정 후 유출종류 목록 새로고침
        await this.fetchWaterFlowTypes({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("유출종류 수정 성공:", response);
        return response;
      } catch (error) {
        console.error("유출종류 수정 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유출종류 수정에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 유출종류 삭제
    async deleteWaterFlowType(flowTypeId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request(
          `/api/outflow/delete/${flowTypeId}`,
          undefined,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // 삭제 후 유출종류 목록 새로고침
        await this.fetchWaterFlowTypes({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("유출종류 삭제 성공:", response);
        return response;
      } catch (error) {
        console.error("유출종류 삭제 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유출종류 삭제에 실패했습니다.";
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
    // 필터링된 유출종류 목록 (클라이언트 측 검색용)
    filteredWaterFlowTypes:
      (state) => (searchOption: string, searchQuery: string) => {
        if (!searchOption || !searchQuery) {
          return state.waterFlowTypes;
        }

        return state.waterFlowTypes.filter((waterFlowType) => {
          const key = searchOption as keyof OutflowWaterFlowType;
          const value = waterFlowType[key];

          if (value === null || value === undefined) return false;

          // 활성 상태 검색 시 특별 처리
          if (key === "is_active") {
            const statusText = value ? "활성" : "비활성";
            return statusText.toLowerCase().includes(searchQuery.toLowerCase());
          }

          // 유출 방향 검색 시 특별 처리
          if (key === "flow_direction") {
            const directionText =
              value === "IN"
                ? "유입"
                : value === "OUT"
                ? "유출"
                : value === "BOTH"
                ? "양방향"
                : String(value);
            return directionText
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          }

          return value
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });
      },

    // 활성화된 유출종류 목록만 가져오기
    activeWaterFlowTypes: (state) => {
      return state.waterFlowTypes.filter((item) => item.is_active);
    },

    // 총 페이지 수 계산
    totalPages: (state) => {
      return Math.ceil(state.totalCount / state.page_size);
    },
  },
});
