import { defineStore } from "pinia";
import { ref } from "vue";
import { request } from "@/utils/request";
import { useI18n } from "vue-i18n";

export const usePipeStore = defineStore("pipe", () => {
  const { t } = useI18n();

  // 상태
  const unitSystems = ref<
    Array<{
      unit_system_id: string;
      system_name: string;
      system_code: string;
      description: string;
      is_active: boolean;
    }>
  >([]);

  const secondDepth = ref<
    Array<{
      code_id: string;
      code_key: string;
      code_value: string;
      code_value_en: string;
      code_group: string;
      parent_key: string;
      is_active: boolean;
      code_order: number;
      description: string;
      system_code: string;
      is_leaf: boolean;
      code_level: number;
      created_at: string;
      updated_at: string | null;
      created_by: string;
      updated_by: string | null;
      iso15926_rdl: string | null;
    }>
  >([]);

  // 배관 검색 결과 데이터
  const searchResults = ref<{
    total: number;
    total_pages: number;
    page: number;
    page_size: number;
    items: Record<string, unknown>[];
    search_info?: Record<string, unknown>;
  } | null>(null);

  // 내부 상태 (export하지 않음)
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 액션
  const fetchCommonCodes = async (parentKey: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/pipe/common/code", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // pipe 관련 공통코드 조회를 위한 파라미터
          parent_key: parentKey,
        }),
      });

      if (response?.response) {
        // 단위 시스템 설정
        if (response.response.unitSystems) {
          unitSystems.value = response.response.unitSystems;
        }

        // 배관명(2차 깊이별) 설정
        if (response.response.secondDepth) {
          secondDepth.value = response.response.secondDepth;
        }
      }

      return response;
    } catch (err) {
      console.error("공통코드 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("messages.error.commonCodeRetrieveFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 배관 검색 리스트 조회 함수
  const fetchSearchList = async (searchParams: Record<string, unknown>) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/pipe/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      if (response?.response) {
        searchResults.value = response.response;
      }

      return response;
    } catch (err) {
      console.error("배관 검색 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("messages.error.pipeSearchFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Excel 템플릿 다운로드
  const downloadExcelTemplate = async (pipeName: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/pipe/tempExcel/${encodeURIComponent(pipeName)}`,
        undefined,
        {
          method: "GET",
        }
      );

      return response;
    } catch (err) {
      console.error("Excel 템플릿 다운로드 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("messages.error.excelTemplateDownloadFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 배관 Excel 파일 업로드
  const uploadPipeExcel = async (pipeName: string, excelFile: File) => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("excel_file", excelFile);

      const response = await request(
        `/api/pipe/uploadModelExcel/${encodeURIComponent(pipeName)}`,
        undefined,
        {
          method: "POST",
          body: formData,
        }
      );

      return response;
    } catch (err) {
      console.error("배관 Excel 업로드 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("messages.error.pipeExcelUploadFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 모델 ZIP 파일 업로드
  const uploadModelZip = async (pipeName: string, zipFile: File) => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("all_file", zipFile);

      const response = await request(
        `/api/pipe/uploadModelZip/${encodeURIComponent(pipeName)}`,
        undefined,
        {
          method: "POST",
          body: formData,
        }
      );

      return response;
    } catch (err) {
      console.error("모델 ZIP 업로드 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("messages.error.modelZipUploadFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePipe = async (
    equipmentId: string,
    params: {
      model_file_id?: string;
      rvt_file_id?: string;
      symbol_id?: string;
      thumbnail_id?: string;
      formula_id?: string;
    }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/pipe/delete/${encodeURIComponent(equipmentId)}`,
        undefined,
        {
          method: "POST",
          body: JSON.stringify(params),
          headers: { "Content-Type": "application/json" },
        }
      );

      return response;
    } catch (err) {
      console.error("배관 삭제 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("messages.error.pipeDeleteFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPipeDetailCommon = async (equipmentType: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/pipe/detail/common/${encodeURIComponent(equipmentType)}`,
        undefined,
        { method: "POST" }
      );

      return response;
    } catch (err) {
      console.error("배관 공통 상세 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("messages.error.pipeCommonDetailRetrieveFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePipe = async (
    equipmentId: string,
    params: {
      equipment_type?: string;
      equipment_code?: string;
      vendor_id?: string;
      model_number?: string;
      is_active?: boolean;
      description?: string;
      output_values?: Record<string, any>;
      search_criteria?: Record<string, any>;
      specifications?: Record<string, any>;
      dtd_model_file?: File;
      thumbnail_file?: File;
      revit_model_file?: File;
      rvt_model_file?: File;
      symbol_file?: File;
      model_file_info?: {
        model_file_id: string;
        model_file_delete_check: boolean;
      };
      thumbnail_file_info?: {
        thumbnail_id: string;
        thumbnail_file_delete_check: boolean;
      };
      rfa_file_info?: {
        rfa_file_id: string;
        rfa_file_delete_check: boolean;
      };
      symbol_file_info?: {
        symbol_id: string;
        symbol_file_delete_check: boolean;
      };
    }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      console.log("pipeStore.updatePipe 호출됨, params:", params);
      console.log(
        "pipeStore.updatePipe - params.model_file_info:",
        params.model_file_info
      );
      console.log(
        "pipeStore.updatePipe - params.thumbnail_file_info:",
        params.thumbnail_file_info
      );
      console.log(
        "pipeStore.updatePipe - params.rfa_file_info:",
        params.rfa_file_info
      );
      console.log(
        "pipeStore.updatePipe - params.symbol_file_info:",
        params.symbol_file_info
      );

      const formData = new FormData();

      // updateParams 객체 생성 (필수 필드 포함)
      const updateParams: any = {
        equipment_type: params.equipment_type || "",
        equipment_code: params.equipment_code || "",
        vendor_id: params.vendor_id || "",
        model_number: params.model_number || "",
      };

      // is_active와 description 추가
      if (params.is_active !== undefined && params.is_active !== null) {
        updateParams.is_active = params.is_active;
      }
      if (
        params.description !== undefined &&
        params.description !== null &&
        params.description !== ""
      ) {
        updateParams.description = params.description;
      }

      // output_values, search_criteria, specifications 추가 (빈 객체가 아닐 때만)
      if (
        params.output_values &&
        Object.keys(params.output_values).length > 0
      ) {
        updateParams.output_values = params.output_values;
      }
      if (
        params.search_criteria &&
        Object.keys(params.search_criteria).length > 0
      ) {
        updateParams.search_criteria = params.search_criteria;
      }
      if (
        params.specifications &&
        Object.keys(params.specifications).length > 0
      ) {
        updateParams.specifications = params.specifications;
      }

      // 삭제된 파일 정보 추가
      if (params.model_file_info) {
        updateParams.model_file_info = params.model_file_info;
        console.log(
          "pipeStore: model_file_info 추가됨",
          params.model_file_info
        );
      }
      if (params.thumbnail_file_info) {
        updateParams.thumbnail_file_info = params.thumbnail_file_info;
        console.log(
          "pipeStore: thumbnail_file_info 추가됨",
          params.thumbnail_file_info
        );
      }
      if (params.rfa_file_info) {
        updateParams.rfa_file_info = params.rfa_file_info;
        console.log("pipeStore: rfa_file_info 추가됨", params.rfa_file_info);
      }
      if (params.symbol_file_info) {
        updateParams.symbol_file_info = params.symbol_file_info;
        console.log(
          "pipeStore: symbol_file_info 추가됨",
          params.symbol_file_info
        );
      }

      console.log("pipeStore: 최종 updateParams", updateParams);

      // updateParams를 JSON 문자열로 FormData에 추가
      const updateParamsString = JSON.stringify(updateParams);
      console.log(
        "pipeStore: FormData에 추가될 updateParams JSON 문자열:",
        updateParamsString
      );
      formData.append("updateParams", updateParamsString);

      // FormData 내용 확인 (디버깅용)
      console.log(
        "pipeStore: FormData에 추가된 updateParams 값:",
        formData.get("updateParams")
      );

      // 파일들 추가
      if (params.dtd_model_file) {
        formData.append("dtd_model_file", params.dtd_model_file);
      }
      if (params.thumbnail_file) {
        formData.append("thumbnail_file", params.thumbnail_file);
      }
      if (params.revit_model_file) {
        formData.append("revit_model_file", params.revit_model_file);
      }
      if (params.rvt_model_file) {
        formData.append("rvt_model_file", params.rvt_model_file);
      }
      if (params.symbol_file) {
        formData.append("symbol_file", params.symbol_file);
      }

      const response = await request(
        `/api/pipe/update/${encodeURIComponent(equipmentId)}`,
        undefined,
        {
          method: "POST",
          body: formData,
        }
      );

      return response;
    } catch (err) {
      console.error("배관 수정 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("messages.error.pipeUpdateFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 가격 이력 생성
  const createPriceHistory = async (params: {
    equipment_id: string;
    equipment_code: string;
    price_type?: string;
    price_unit_code?: string;
    price_unit_symbol?: string;
    price_value?: any;
    price_reference?: string;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/pipe/price/history", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      return response;
    } catch (err) {
      console.error("가격 이력 생성 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : t("messages.error.priceHistoryCreateFailed");
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // 상태
    unitSystems,
    secondDepth,
    searchResults,
    // 액션
    fetchCommonCodes,
    fetchSearchList,
    downloadExcelTemplate,
    uploadPipeExcel,
    uploadModelZip,
    deletePipe,
    fetchPipeDetailCommon,
    updatePipe,
    createPriceHistory,
  };
});
