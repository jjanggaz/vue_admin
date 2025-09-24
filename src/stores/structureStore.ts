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

  return {
    // 상태
    unitSystems,
    secondDepth,
    thirdDepth,
    fourthDepth,
    fifthDepth,
    searchResults,
    loading,
    error,
    // 액션
    fetchCommonCodes,
    fetchThirdDepth,
    fetchSearchList,
  };
});
