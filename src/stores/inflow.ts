import { defineStore } from "pinia";
import { request } from "../utils/request";

// 심볼 정보 인터페이스
export interface SymbolInfo {
  symbol_name: string;
  symbol_code: string;
  symbol_type: string;
  symbol_color: string;
  svg_content: string | null;
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
  // 현재는 skip, limit만 사용하므로 빈 인터페이스로 유지
}

// Water Flow Type Parameter 관련 인터페이스
export interface WaterFlowTypeParameter {
  mapping_id: string;
  flow_type_id: string;
  parameter_id: string;
  parameter_name: string;
  parameter_code: string;
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

// 새로운 API 응답 구조를 위한 인터페이스
export interface WaterFlowTypeParametersResponse {
  metric: WaterFlowTypeParameter[];
  uscs: WaterFlowTypeParameter[];
  metric_formulas?: {
    data: {
      formulas: FormulaData[];
    };
    status: string;
  };
  uscs_formulas?: {
    data: {
      formulas: FormulaData[];
    };
    status: string;
  };
}

// 계산식 데이터 인터페이스
export interface FormulaData {
  formula_id: string;
  formula_name: string;
  formula_version: string;
  file_name: string;
  created_at: string;
  created_by: string;
  flow_type_id: string;
  unit_system_code: string;
  formula_scope: string;
  download_url: string;
  info_url: string;
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
  unit_system_code: "METRIC" | "USCS";
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
    unit_system_code: "METRIC" | "USCS";
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
  uscs_parameters?: Array<{
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
  unit_system_code: string; // METRIC 또는 USCS
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
    waterFlowTypeParameters: {
      metric: [],
      uscs: [],
    } as WaterFlowTypeParametersResponse, // 유입종류별 파라미터 목록
    waterQualityParameters: [] as WaterQualityParameter[], // 수질 파라미터 목록
    commonCodes: [] as CommonCode[], // 공통코드 목록
    loading: false,
    totalCount: 0,
    page: 1,
    page_size: 20,
    hasMore: false,
    error: null as string | null,
  }),

  actions: {
    // 유입종류 목록 조회
    async fetchWaterFlowTypes(flowTypeCode?: string) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams: Record<string, number | string> = {};

        // 검색 조건 설정 (skip, limit, flowTypeCode)
        queryParams.skip = 0;
        queryParams.limit = 100;

        // flowTypeCode가 없으면 기본값 사용 (INFLUENT)
        queryParams.flowTypeCode = flowTypeCode || "INFLUENT";

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
          this.totalCount = response.response.total || 0;
          this.page = response.response.page || 1;
          this.page_size = response.response.page_size || 20;
          this.hasMore =
            (response.response.page || 1) <
            (response.response.total_pages || 1);
        } else {
          this.waterFlowTypes = [];
          this.totalCount = 0;
          this.page = 1;
          this.page_size = 20;
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
      flowTypeCode: string,
      flowTypeId: string
    ) {
      this.loading = true;
      this.error = null;

      try {
        // flowDirection 유효성 검사
        if (!flowDirection || flowDirection.trim() === "") {
          this.waterFlowTypeParameters = { metric: [], uscs: [] };
          return { items: [], total: 0 };
        }

        // flowTypeCode 유효성 검사
        if (!flowTypeCode || flowTypeCode.trim() === "") {
          this.waterFlowTypeParameters = { metric: [], uscs: [] };
          return { items: [], total: 0 };
        }

        const encodedFlowTypeCode = encodeURIComponent(flowTypeCode);

        // 요청 본문 설정
        const requestBody = {
          flowDirection: flowDirection,
          flowTypeCode: encodedFlowTypeCode,
          flowTypeId: flowTypeId,
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
          // 새로운 구조: response.items.metric, response.items.uscs
          this.waterFlowTypeParameters = response.response.items;
        } else {
          this.waterFlowTypeParameters = { metric: [], uscs: [] };
        }

        return response.response;
      } catch (error) {
        console.error("유입종류 파라미터 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "유입종류 파라미터 조회에 실패했습니다.";
        this.waterFlowTypeParameters = { metric: [], uscs: [] };
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 수질 파라미터 목록 조회
    async fetchWaterQualityParameters(flowDirection: string) {
      this.loading = true;
      this.error = null;

      // 요청 본문 설정
      const requestBody = {
        flow_direction: flowDirection,
      };

      try {
        const response = await request("/api/inflow/listLookup", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        // API 응답 처리
        if (response.response && response.response.items) {
          console.log("수질 파라미터 API 응답:", response.response.items);
          this.waterQualityParameters = response.response.items;
        } else {
          console.log("수질 파라미터 응답이 비어있음:", response);
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

    // 유입종류 등록
    async createWaterFlowType(requestData: {
      waterFlowTypeData: WaterFlowTypeFormData;
      symbolFile?: File;
      metricFile?: File;
      uscsFile?: File;
    }) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();

        // waterFlowTypeData를 JSON 문자열로 변환하여 추가 (undefined 값 제거)
        const cleanWaterFlowTypeData = JSON.parse(
          JSON.stringify(requestData.waterFlowTypeData, (_key, value) => {
            return value === undefined ? null : value;
          })
        );
        formData.append(
          "waterFlowTypeData",
          JSON.stringify(cleanWaterFlowTypeData)
        );

        // 파일이 있으면 symbolFile로 추가
        if (requestData.symbolFile) {
          formData.append("symbolFile", requestData.symbolFile);
        }

        // Metric 계산식 파일이 있으면 metricFile로 추가
        if (requestData.metricFile) {
          formData.append("metricFile", requestData.metricFile);
        }

        // Uscs 계산식 파일이 있으면 uscsFile로 추가
        if (requestData.uscsFile) {
          formData.append("uscsFile", requestData.uscsFile);
        }

        const response = await request("/api/inflow/create", undefined, {
          method: "POST",
          body: formData,
        });

        // 등록 후 유입종류 목록 새로고침
        const flowTypeCode = requestData.waterFlowTypeData.flow_direction;
        await this.fetchWaterFlowTypes(flowTypeCode);

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
        metricFile?: File;
        uscsFile?: File;
      }
    ) {
      this.loading = true;
      this.error = null;

      try {
        const formData = new FormData();

        // waterFlowTypeData를 JSON 문자열로 변환하여 추가 (undefined 값 제거)
        const cleanWaterFlowTypeData = JSON.parse(
          JSON.stringify(requestData.waterFlowTypeData, (_key, value) => {
            return value === undefined ? null : value;
          })
        );
        formData.append(
          "waterFlowTypeData",
          JSON.stringify(cleanWaterFlowTypeData)
        );

        // 파일이 있으면 symbolFile로 추가
        if (requestData.symbolFile) {
          formData.append("symbolFile", requestData.symbolFile);
        }

        // Metric 계산식 파일이 있으면 metricFile로 추가
        if (requestData.metricFile) {
          formData.append("metricFile", requestData.metricFile);
        }

        // Uscs 계산식 파일이 있으면 uscsFile로 추가
        if (requestData.uscsFile) {
          formData.append("uscsFile", requestData.uscsFile);
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
        // 현재 store에 있는 데이터의 flow_direction 사용
        const currentFlowType = this.waterFlowTypes.find(
          (wft) => wft.flow_type_id === flowTypeId
        );
        const flowTypeCode = currentFlowType?.flow_direction;
        await this.fetchWaterFlowTypes(flowTypeCode);

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

    // 심볼 삭제
    async deleteSymbol(
      symbolId: string,
      flowTypeId: string,
      flowTypeCode: string,
      flowTypeName: string,
      symbolColor: string
    ) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request(
          `/api/inflow/symbols/${symbolId}`,
          undefined,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              flow_type_id: flowTypeId,
              flow_type_code: flowTypeCode,
              flow_type_name: flowTypeName,
              symbol_color: symbolColor,
            }),
          }
        );

        return response;
      } catch (error) {
        console.error("심볼 삭제 실패:", error);
        this.error =
          error instanceof Error ? error.message : "심볼 삭제에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
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
        // 현재 store에 있는 데이터의 flow_direction 사용
        const currentFlowType = this.waterFlowTypes.find(
          (wft) => wft.flow_type_id === flowTypeId
        );
        const flowTypeCode = currentFlowType?.flow_direction;
        await this.fetchWaterFlowTypes(flowTypeCode);

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

    // 계산식 파일 추출
    async extractFormula(formData: FormData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request(
          "/api/inflow/formula/extract",
          undefined,
          {
            method: "POST",
            body: formData,
          }
        );

        return response;
      } catch (error) {
        console.error("계산식 파일 추출 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "계산식 파일 추출에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 계산식 삭제
    async deleteFormula(
      formulaId: string,
      last_formula?: boolean,
      unit_system_code?: "METRIC" | "USCS",
      flow_type_id?: string
    ) {
      this.loading = true;
      this.error = null;

      try {
        const url = `/api/inflow/formula/${formulaId}`;

        const response = await request(url, undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            last_formula: !!last_formula,
            unit_system_code,
            flow_type_id,
          }),
        });

        return response;
      } catch (error) {
        console.error("계산식 삭제 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "계산식 삭제에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 상태 초기화
    resetState() {
      this.waterFlowTypes = [];
      this.waterFlowTypeParameters = { metric: [], uscs: [] };
      this.waterQualityParameters = [];
      this.commonCodes = [];
      this.loading = false;
      this.totalCount = 0;
      this.page = 1;
      this.page_size = 20;
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
