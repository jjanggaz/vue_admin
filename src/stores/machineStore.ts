import { defineStore } from "pinia";
import { ref } from "vue";
import { request } from "@/utils/request";

export const useMachineStore = defineStore("machine", () => {
  // 상태
  const langCodes = ref<
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

  const thirdDepth = ref<
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

  const fourthDepth = ref<
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

  const fifthDepth = ref<
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

  const loading = ref(false);
  const error = ref<string | null>(null);

  // 기계 검색 결과 데이터
  const searchResults = ref<{
    total: number;
    total_pages: number;
    page: number;
    page_size: number;
    items: Record<string, unknown>[];
    search_info?: Record<string, unknown>;
  } | null>(null);

  // 수정 화면용 별도 depth 변수들
  const editSecondDepth = ref<Record<string, unknown>[]>([]);
  const editThirdDepth = ref<Record<string, unknown>[]>([]);
  const editFourthDepth = ref<Record<string, unknown>[]>([]);
  const editFifthDepth = ref<Record<string, unknown>[]>([]);

  // 액션
  const fetchCommonCodes = async (parentKey: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/machine/common/code", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // machine 관련 공통코드 조회를 위한 파라미터
          parent_key: parentKey,
        }),
      });

      if (response?.response) {
        // 단위 시스템 설정
        if (response.response.unitSystems) {
          unitSystems.value = response.response.unitSystems;
        }

        // 기계명(2차 깊이별) 설정
        if (response.response.secondDepth) {
          secondDepth.value = response.response.secondDepth;
        }
      }

      return response;
    } catch (err) {
      console.error("공통코드 조회 실패:", err);
      error.value =
        err instanceof Error ? err.message : "공통코드 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 깊이별 공통코드 조회 함수
  const fetchThirdDepth = async (parentValue: string, level: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/machine/depth", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent_value: parentValue,
        }),
      });

      if (response?.response) {
        if (level === 3) {
          thirdDepth.value = response.response;
        } else if (level === 4) {
          fourthDepth.value = response.response;
        } else if (level === 5) {
          fifthDepth.value = response.response;
        }
      }

      return response;
    } catch (err) {
      console.error("깊이별 공통코드 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "깊이별 공통코드 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 기계 검색 리스트 조회 함수
  const fetchSearchList = async (searchParams: Record<string, unknown>) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/machine/search", undefined, {
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
      console.error("기계 검색 실패:", err);
      error.value =
        err instanceof Error ? err.message : "기계 검색에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 기계 공통 코드 조회 함수 (equipment_type 기반)
  const fetchMachineCommonCode = async (searchValue: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/machine/common/code/${searchValue}`,
        undefined,
        {
          method: "GET",
        }
      );

      // API 응답 구조에 맞게 수정 (사용자 제공 응답 구조: response.data)
      const responseData = response.response.data;

      console.log("기계 공통 코드 조회 응답 데이터:", responseData);

      if (responseData?.hierarchy) {
        const hierarchy = responseData.hierarchy;

        // hierarchy 배열을 depth별로 분류하여 저장
        // level 1: 기계 (EQUIP) - secondDepth
        // level 2: 기계명 (M_PUMP) - thirdDepth
        // level 3: 기계종분류 (M_PMP03) - fourthDepth
        // level 4: 기계유형 (M_PMP0302) - fifthDepth

        // 각 depth에 해당하는 데이터 추출
        const depth2Data = hierarchy.filter(
          (item: Record<string, unknown>) => item.level === 2
        );
        const depth3Data = hierarchy.filter(
          (item: Record<string, unknown>) => item.level === 3
        );
        const depth4Data = hierarchy.filter(
          (item: Record<string, unknown>) => item.level === 4
        );
        const depth5Data = hierarchy.filter(
          (item: Record<string, unknown>) => item.level === 5
        );

        // 수정 화면용 별도 depth 변수에 원본 데이터 저장
        editSecondDepth.value = depth2Data;
        editThirdDepth.value = depth3Data;
        editFourthDepth.value = depth4Data;
        editFifthDepth.value = depth5Data;

        console.log("기계 공통 코드 hierarchy 데이터 저장 완료:", {
          editSecondDepth: editSecondDepth.value,
          editThirdDepth: editThirdDepth.value,
          editFourthDepth: editFourthDepth.value,
          editFifthDepth: editFifthDepth.value,
        });
      }

      return response;
    } catch (err) {
      console.error("기계 공통 코드 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "기계 공통 코드 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 상세 깊이 코드 조회 (/api/machine/depth/detail)
  const fetchDepthDetail = async (
    codeGroup: string,
    codeLevel: number = 4,
    parentKey?: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const body: Record<string, unknown> = {
        code_group: codeGroup,
        code_level: codeLevel,
      };
      if (parentKey) {
        body.parent_key = parentKey;
      }

      const response = await request("/api/machine/depth/detail", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return response;
    } catch (err) {
      console.error("상세 깊이 코드 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "상세 깊이 코드 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 상세 깊이 코드 조회 (searchType)
  const fetchDepthDetailBySearchType = async (searchKey: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/machine/depth/detail/searchType/${encodeURIComponent(searchKey)}`,
        undefined,
        {
          method: "GET",
        }
      );
      return response;
    } catch (err) {
      console.error("상세 깊이 검색 타입 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "상세 깊이 검색 타입 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Excel 템플릿 다운로드
  const downloadExcelTemplate = async (machineName: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/machine/tempExcel/${encodeURIComponent(machineName)}`,
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
          : "Excel 템플릿 다운로드에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 기계 Excel 파일 업로드
  const uploadMachineExcel = async (machineName: string, excelFile: File) => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("excel_file", excelFile);

      const response = await request(
        `/api/machine/uploadModelExcel/${encodeURIComponent(machineName)}`,
        undefined,
        {
          method: "POST",
          body: formData,
        }
      );

      return response;
    } catch (err) {
      console.error("기계 Excel 업로드 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "기계 Excel 업로드에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 모델 ZIP 파일 업로드
  const uploadModelZip = async (machineName: string, zipFile: File) => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("all_file", zipFile);

      const response = await request(
        `/api/machine/uploadModelZip/${encodeURIComponent(machineName)}`,
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
        err instanceof Error ? err.message : "모델 ZIP 업로드에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteMachine = async (
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
        `/api/machine/delete/${encodeURIComponent(equipmentId)}`,
        undefined,
        {
          method: "POST",
          body: JSON.stringify(params),
          headers: { "Content-Type": "application/json" },
        }
      );

      return response;
    } catch (err) {
      console.error("기계 삭제 실패:", err);
      error.value =
        err instanceof Error ? err.message : "기계 삭제에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateMachine = async (
    equipmentId: string,
    params: {
      equipment_type?: string;
      vendor_id?: string;
      model_number?: string;
      output_values?: Record<string, any>;
      search_criteria?: Record<string, any>;
      specifications?: Record<string, any>;
      dtd_model_file?: File;
      thumbnail_file?: File;
      revit_model_file?: File;
      symbol_file?: File;
    }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();

      // updateParams 객체 생성
      const updateParams: any = {};
      if (params.equipment_type) {
        updateParams.equipment_type = params.equipment_type;
      }
      if (params.vendor_id) {
        updateParams.vendor_id = params.vendor_id;
      }
      if (params.model_number) {
        updateParams.model_number = params.model_number;
      }
      if (params.output_values) {
        updateParams.output_values = params.output_values;
      }
      if (params.search_criteria) {
        updateParams.search_criteria = params.search_criteria;
      }
      if (params.specifications) {
        updateParams.specifications = params.specifications;
      }

      // updateParams를 JSON 문자열로 FormData에 추가
      formData.append("updateParams", JSON.stringify(updateParams));

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
      if (params.symbol_file) {
        formData.append("symbol_file", params.symbol_file);
      }

      const response = await request(
        `/api/machine/update/${encodeURIComponent(equipmentId)}`,
        undefined,
        {
          method: "POST",
          body: formData,
        }
      );

      return response;
    } catch (err) {
      console.error("기계 수정 실패:", err);
      error.value =
        err instanceof Error ? err.message : "기계 수정에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchMachineDetailCommon = async (equipmentType: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/machine/detail/common/${encodeURIComponent(equipmentType)}`,
        undefined,
        { method: "POST" }
      );

      return response;
    } catch (err) {
      console.error("기계 공통 상세 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "기계 공통 상세 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchMachineDetailFiles = async (
    equipmentId: string,
    params: {
      equipment_type?: string;
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
        `/api/machine/detail/files/${encodeURIComponent(equipmentId)}`,
        undefined,
        {
          method: "POST",
          body: JSON.stringify(params),
          headers: { "Content-Type": "application/json" },
        }
      );

      return response;
    } catch (err) {
      console.error("기계 파일 상세 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "기계 파일 상세 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchFormula = async (equipmentType: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/machine/search/formula", undefined, {
        method: "POST",
        body: JSON.stringify({ equipment_type: equipmentType }),
        headers: { "Content-Type": "application/json" },
      });

      return response;
    } catch (err) {
      console.error("계산식 검색 실패:", err);
      error.value =
        err instanceof Error ? err.message : "계산식 검색에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createFormula = async (params: {
    python_file: File;
    formula_id?: string;
    equipment_type?: string;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("python_file", params.python_file);
      if (params.formula_id) {
        formData.append("formula_id", params.formula_id);
      }
      if (params.equipment_type) {
        formData.append("equipment_type", params.equipment_type);
      }

      const response = await request("/api/machine/create/formula", undefined, {
        method: "POST",
        body: formData,
      });

      return response;
    } catch (err) {
      console.error("계산식 생성 실패:", err);
      error.value =
        err instanceof Error ? err.message : "계산식 생성에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteFormula = async (formulaId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/machine/delete/formula/${encodeURIComponent(formulaId)}`,
        undefined,
        {
          method: "DELETE",
        }
      );

      return response;
    } catch (err) {
      console.error("계산식 삭제 실패:", err);
      error.value =
        err instanceof Error ? err.message : "계산식 삭제에 실패했습니다.";
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
      const response = await request("/api/machine/price/history", undefined, {
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
        err instanceof Error ? err.message : "가격 이력 생성에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // 상태
    langCodes,
    unitSystems,
    secondDepth,
    thirdDepth,
    fourthDepth,
    fifthDepth,
    searchResults,
    loading,
    error,
    // 수정 화면용 별도 depth 변수들
    editSecondDepth,
    editThirdDepth,
    editFourthDepth,
    editFifthDepth,
    // 액션
    fetchCommonCodes,
    fetchThirdDepth,
    fetchSearchList,
    fetchMachineCommonCode,
    fetchDepthDetail,
    fetchDepthDetailBySearchType,
    downloadExcelTemplate,
    uploadMachineExcel,
    uploadModelZip,
    deleteMachine,
    updateMachine,
    fetchMachineDetailCommon,
    fetchMachineDetailFiles,
    searchFormula,
    createFormula,
    deleteFormula,
    createPriceHistory,
  };
});
