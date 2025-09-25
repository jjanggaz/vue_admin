import { defineStore } from "pinia";
import { ref } from "vue";
import { request } from "@/utils/request";

export const useStructureStore = defineStore("structure", () => {
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

  // 구조물 검색 결과 데이터
  const searchResults = ref<Array<Record<string, unknown>>>([]);

  // 공통 코드 조회 결과 데이터
  const editSecondDepth = ref<Record<string, unknown>[]>([]);
  const editThirdDepth = ref<Record<string, unknown>[]>([]);
  const editFourthDepth = ref<Record<string, unknown>[]>([]);
  const editFifthDepth = ref<Record<string, unknown>[]>([]);

  // 구조물 공식 검색 결과 데이터
  const formulaSearchResults = ref<Array<Record<string, unknown>>>([]);

  // 등록 화면용 별도 depth 변수들
  const createSecondDepth = ref<Record<string, unknown>[]>([]);
  const createThirdDepth = ref<Record<string, unknown>[]>([]);
  const createFourthDepth = ref<Record<string, unknown>[]>([]);
  const createFifthDepth = ref<Record<string, unknown>[]>([]);

  // 구조물 등록 API
  const createStructure = async (formData: FormData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await request("/api/structure/create", undefined, {
        method: "POST",
        body: formData,
      });
      return response;
    } catch (err) {
      console.error("구조물 등록 실패:", err);
      error.value =
        err instanceof Error ? err.message : "구조물 등록에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 액션
  const fetchCommonCodes = async (parentKey: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/structure/common/code", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // structure 관련 공통코드 조회를 위한 파라미터
          parent_key: parentKey,
        }),
      });

      if (response?.response) {
        // 단위 시스템 설정
        if (response.response.unitSystems) {
          unitSystems.value = response.response.unitSystems;
        }

        // 구조물 타입(2차 깊이별) 설정
        if (response.response.secondDepth) {
          secondDepth.value = response.response.secondDepth;
        }
      }

      return response;
    } catch (err) {
      console.error("구조물 공통코드 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "구조물 공통코드 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 등록 화면용 공통코드 조회 함수 (fetchCommonCodes2)
  const fetchCommonCodes2 = async (parentKey: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/structure/common/code", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // structure 관련 공통코드 조회를 위한 파라미터
          parent_key: parentKey,
        }),
      });

      if (response?.response) {
        // 단위 시스템 설정
        if (response.response.unitSystems) {
          unitSystems.value = response.response.unitSystems;
        }

        // 등록 화면용 구조물 타입(2차 깊이별) 설정
        if (response.response.secondDepth) {
          createSecondDepth.value = response.response.secondDepth;
        }
      }

      return response;
    } catch (err) {
      console.error("구조물 등록용 공통코드 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "구조물 등록용 공통코드 조회에 실패했습니다.";
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
      const response = await request("/api/structure/depth", undefined, {
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
      console.error("구조물 깊이별 공통코드 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "구조물 깊이별 공통코드 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 깊이별 공통코드 조회 함수
  const fetchThirdDepth2 = async (parentValue: string, level: number) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/structure/depth", undefined, {
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
          createThirdDepth.value = response.response;
        } else if (level === 4) {
          createFourthDepth.value = response.response;
        } else if (level === 5) {
          createFifthDepth.value = response.response;
        }
      }

      return response;
    } catch (err) {
      console.error("구조물 깊이별 공통코드 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "구조물 깊이별 공통코드 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 구조물 검색 리스트 조회 함수
  const fetchSearchList = async (searchParams: Record<string, unknown>) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/structure/search", undefined, {
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
      console.error("구조물 검색 실패:", err);
      error.value =
        err instanceof Error ? err.message : "구조물 검색에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 구조물 삭제 함수
  const deleteStructure = async (
    structureId: string,
    deleteParams: {
      dtdx_model_file_id?: string;
      formula_id?: string;
      rvt_model_file_id?: string;
      thumbnail_symbol_id?: string;
    }
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/structure/delete/${structureId}`,
        undefined,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deleteParams),
        }
      );

      return response;
    } catch (err) {
      console.error("구조물 삭제 실패:", err);
      error.value =
        err instanceof Error ? err.message : "구조물 삭제에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 구조물 공통 코드 조회 함수
  const fetchStructureCommonCode = async (searchValue: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/structure/common/code/${searchValue}`,
        undefined,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.response?.data) {
        const responseData = response.response.data;

        if (responseData?.hierarchy) {
          const hierarchy = responseData.hierarchy;

          // hierarchy 배열을 depth별로 분류하여 저장
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
        }
      }

      return response;
    } catch (err) {
      console.error("구조물 공통 코드 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "구조물 공통 코드 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 구조물 공식 삭제 함수
  const deleteStructureFormula = async (
    structureId: string,
    formulaId: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/structure/delete/formula`,
        undefined,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            structure_id: structureId,
            formula_id: formulaId,
          }),
        }
      );

      return response;
    } catch (err) {
      console.error("구조물 공식 삭제 실패:", err);
      error.value =
        err instanceof Error ? err.message : "구조물 공식 삭제에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 구조물 수정 함수
  const updateStructure = async (structureId: string, formData: FormData) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/structure/update/${structureId}`,
        undefined,
        {
          method: "POST",
          body: formData,
        }
      );

      return response;
    } catch (err) {
      console.error("구조물 수정 실패:", err);
      error.value =
        err instanceof Error ? err.message : "구조물 수정에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 구조물 공식 검색 함수
  const fetchStructureFormula = async (formulaId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/structure/search/formula/${formulaId}`,
        undefined,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.response?.data?.items) {
        formulaSearchResults.value = response.response.data.items;
      }

      return response;
    } catch (err) {
      console.error("구조물 공식 검색 실패:", err);
      error.value =
        err instanceof Error ? err.message : "구조물 공식 검색에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // 상태
    unitSystems,
    secondDepth,
    thirdDepth,
    fourthDepth,
    fifthDepth,
    searchResults,
    editSecondDepth,
    editThirdDepth,
    editFourthDepth,
    editFifthDepth,
    formulaSearchResults,
    loading,
    error,
    // 등록 화면용 별도 depth 변수들
    createSecondDepth,
    createThirdDepth,
    createFourthDepth,
    createFifthDepth,
    // 액션
    fetchCommonCodes,
    fetchCommonCodes2,
    fetchThirdDepth,
    fetchThirdDepth2,
    fetchSearchList,
    createStructure,
    deleteStructure,
    fetchStructureCommonCode,
    fetchStructureFormula,
    deleteStructureFormula,
    updateStructure,
  };
});
