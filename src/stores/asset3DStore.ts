import { defineStore } from "pinia";
import { ref } from "vue";
import { request } from "@/utils/request";

interface Asset3DTreeNode {
  code_key: string;
  code_value: string;
  code_value_en?: string;
  code_level?: number;
  code_order?: number;
  children?: Asset3DTreeNode[];
  [key: string]: unknown;
}

export const useAsset3DStore = defineStore("asset3d", () => {
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

  const loading = ref(false);
  const error = ref<string | null>(null);
  const codeTreeCache = ref<Record<string, Asset3DTreeNode[]>>({});

  // 3D Asset 검색 결과 데이터
  const searchResults = ref<{
    total: number;
    total_pages: number;
    page: number;
    page_size: number;
    items: Record<string, unknown>[];
    search_info?: Record<string, unknown>;
  } | null>(null);

  // 액션
  const fetchCommonCodes = async (parentKey: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/asset3D/common/code", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // 3D Asset 관련 공통코드 조회를 위한 파라미터
          parent_key: parentKey,
        }),
      });

      if (response?.response) {
        // 단위 시스템 설정
        if (response.response.unitSystems) {
          unitSystems.value = response.response.unitSystems;
        }

        // 3D Asset명(2차 깊이별) 설정
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
      const response = await request("/api/asset3D/depth", undefined, {
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

  // 코드 트리 조회 함수
  // 트리 노드를 Asset3DTreeNode 형식으로 변환하는 헬퍼 함수
  const convertTreeNode = (node: Record<string, unknown>): Asset3DTreeNode | null => {
    const codeKey = node.code_key;
    const codeValue = node.code_value || node.code_value_en;
    const codeValueEn = node.code_value_en;
    
    if (!codeKey || !codeValue) {
      return null;
    }

    const treeNode: Asset3DTreeNode = {
      code_key: String(codeKey),
      code_value: String(codeValue),
      code_level: typeof node.code_level === "number" ? node.code_level : undefined,
      code_order: typeof node.code_order === "number" ? node.code_order : undefined,
      children: [],
    };

    if (codeValueEn && typeof codeValueEn === "string") {
      treeNode.code_value_en = codeValueEn;
    }

    // children이 있으면 재귀적으로 변환
    if (Array.isArray(node.children) && node.children.length > 0) {
      treeNode.children = node.children
        .map((child: unknown) => {
          if (child && typeof child === "object") {
            return convertTreeNode(child as Record<string, unknown>);
          }
          return null;
        })
        .filter((node): node is Asset3DTreeNode => node !== null);
    }

    return treeNode;
  };

  const buildTreeFromCodeGroups = (rawData: unknown): Asset3DTreeNode[] => {
    if (!rawData || typeof rawData !== "object") {
      console.warn("[asset3DStore] codeTree raw 데이터가 객체가 아닙니다:", rawData);
      return [];
    }

    const unwrapped =
      (rawData as { data?: Record<string, unknown> })?.data || rawData;

    // 새로운 API 응답 형식: data.tree 배열 형태
    const responseData = unwrapped as {
      tree?: Array<Record<string, unknown>>;
      code_groups?: Record<
        string,
        {
          level_2?: Array<Record<string, unknown>>;
          level_3?: Array<Record<string, unknown>>;
          level_4?: Array<Record<string, unknown>>;
        }
      >;
    };

    // tree 배열이 있으면 직접 변환
    if (Array.isArray(responseData.tree) && responseData.tree.length > 0) {
      console.log("[asset3DStore] codeTree tree 배열 형식으로 파싱:", {
        treeLength: responseData.tree.length,
      });
      
      const roots = responseData.tree
        .map((node) => convertTreeNode(node))
        .filter((node): node is Asset3DTreeNode => node !== null);

      const sortTreeNodes = (nodes: Asset3DTreeNode[]) => {
        nodes.sort((a, b) => {
          const orderA = a.code_order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.code_order ?? Number.MAX_SAFE_INTEGER;
          if (orderA === orderB) {
            return a.code_value.localeCompare(b.code_value, "ko");
          }
          return orderA - orderB;
        });
        nodes.forEach((node) => {
          if (node.children && node.children.length) {
            sortTreeNodes(node.children);
          }
        });
      };

      sortTreeNodes(roots);

      console.log("[asset3DStore] buildTreeFromCodeGroups 결과 (tree 형식):", {
        rootCount: roots.length,
        sample: roots.slice(0, 5),
      });

      return roots;
    }

    // 기존 code_groups 형식 처리
    const codeGroups = responseData.code_groups;
    if (!codeGroups) {
      console.warn("[asset3DStore] codeTree 응답에 code_groups 또는 tree가 없습니다:", rawData);
      return [];
    }

    const roots: Asset3DTreeNode[] = [];

    Object.entries(codeGroups).forEach(([groupKey, group]) => {
      const level3Items = Array.isArray(group?.level_3) ? group.level_3 : [];
      const level4Items = Array.isArray(group?.level_4) ? group.level_4 : [];

      console.log("[asset3DStore] codeTree 그룹 파싱:", {
        groupKey,
        level3Count: level3Items.length,
        level4Count: level4Items.length,
      });

      const level3Map: Record<string, Asset3DTreeNode> = {};

      level3Items.forEach((item) => {
        const codeKeyRaw = item?.code_key;
        const codeValueRaw = item?.code_value ?? item?.code_value_en;
        const codeValueEnRaw = item?.code_value_en;
        const codeKey =
          typeof codeKeyRaw === "string"
            ? codeKeyRaw
            : codeKeyRaw != null
            ? String(codeKeyRaw)
            : "";
        const codeValue =
          typeof codeValueRaw === "string"
            ? codeValueRaw
            : codeValueRaw != null
            ? String(codeValueRaw)
            : "";
        const codeValueEn =
          typeof codeValueEnRaw === "string"
            ? codeValueEnRaw
            : codeValueEnRaw != null
            ? String(codeValueEnRaw)
            : undefined;

        if (!codeKey || !codeValue) {
          return;
        }

        const node: Asset3DTreeNode = {
          code_key: codeKey,
          code_value: codeValue,
          code_level:
            typeof (item as Record<string, unknown>)["code_level"] === "number"
              ? ((item as Record<string, number>).code_level as number)
              : undefined,
          code_order:
            typeof (item as Record<string, unknown>)["code_order"] === "number"
              ? ((item as Record<string, number>).code_order as number)
              : undefined,
          children: [],
        };

        if (codeValueEn) {
          node.code_value_en = codeValueEn;
        }

        level3Map[codeKey] = node;
        roots.push(node);
      });

      level4Items.forEach((item) => {
        const codeKeyRaw = item?.code_key;
        const codeValueRaw = item?.code_value ?? item?.code_value_en;
        const codeValueEnRaw = item?.code_value_en;
        const parentKeyRaw = item?.parent_key;

        const codeKey =
          typeof codeKeyRaw === "string"
            ? codeKeyRaw
            : codeKeyRaw != null
            ? String(codeKeyRaw)
            : "";
        const codeValue =
          typeof codeValueRaw === "string"
            ? codeValueRaw
            : codeValueRaw != null
            ? String(codeValueRaw)
            : "";
        const codeValueEn =
          typeof codeValueEnRaw === "string"
            ? codeValueEnRaw
            : codeValueEnRaw != null
            ? String(codeValueEnRaw)
            : undefined;
        const parentKey =
          typeof parentKeyRaw === "string"
            ? parentKeyRaw
            : parentKeyRaw != null
            ? String(parentKeyRaw)
            : "";

        if (!codeKey || !codeValue) {
          return;
        }

        const childNode: Asset3DTreeNode = {
          code_key: codeKey,
          code_value: codeValue,
          code_level:
            typeof (item as Record<string, unknown>)["code_level"] === "number"
              ? ((item as Record<string, number>).code_level as number)
              : undefined,
          code_order:
            typeof (item as Record<string, unknown>)["code_order"] === "number"
              ? ((item as Record<string, number>).code_order as number)
              : undefined,
        };

        if (codeValueEn) {
          childNode.code_value_en = codeValueEn;
        }

        if (parentKey && level3Map[parentKey]) {
          const parentNode = level3Map[parentKey];
          if (!parentNode.children) {
            parentNode.children = [];
          }
          parentNode.children.push(childNode);
        } else {
          console.warn(
            "[asset3DStore] level4 parent 미존재, 루트로 추가:",
            childNode
          );
          roots.push(childNode);
        }
      });
    });

    const sortTreeNodes = (nodes: Asset3DTreeNode[]) => {
      nodes.sort((a, b) => {
        const orderA = a.code_order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.code_order ?? Number.MAX_SAFE_INTEGER;
        if (orderA === orderB) {
          return a.code_value.localeCompare(b.code_value, "ko");
        }
        return orderA - orderB;
      });
      nodes.forEach((node) => {
        if (node.children && node.children.length) {
          sortTreeNodes(node.children);
        }
      });
    };

    sortTreeNodes(roots);

    console.log("[asset3DStore] buildTreeFromCodeGroups 결과:", {
      rootCount: roots.length,
      sample: roots.slice(0, 5),
    });

    return roots;
  };

  const fetchAsset3DCodeTree = async (
    codeGroup: string,
    forceReload = false
  ) => {
    if (!forceReload && codeTreeCache.value[codeGroup]) {
      console.log("[asset3DStore] codeTree 캐시 사용:", {
        codeGroup,
        treeLength: codeTreeCache.value[codeGroup].length,
      });
      return codeTreeCache.value[codeGroup];
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/asset3D/common/codeTree", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          code_group: "PIPE_S",
          parent_key: "P_VALV"
        }),
      });

      // API 응답 구조: response.response.data.tree 또는 response.response.tree
      const responseData = response?.response;
      const treeData = buildTreeFromCodeGroups(responseData);
      console.log("[asset3DStore] codeTree 응답:", response);
      console.log("[asset3DStore] codeTree 응답 요약:", {
        codeGroup,
        raw: response?.response,
        treeLength: treeData.length,
        samples: {
          nodes: treeData.slice(0, 5),
          firstChildren:
            treeData.length > 0 && treeData[0].children
              ? treeData[0].children.slice(0, 3)
              : [],
        },
      });

      codeTreeCache.value[codeGroup] = treeData;

      return codeTreeCache.value[codeGroup];
    } catch (err) {
      console.error("3D Asset 코드 트리 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "3D Asset 코드 트리 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteAsset3D = async (
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
        `/api/asset3D/delete/${encodeURIComponent(equipmentId)}`,
        undefined,
        {
          method: "POST",
          body: JSON.stringify(params),
          headers: { "Content-Type": "application/json" },
        }
      );

      return response;
    } catch (err) {
      console.error("3D Asset 삭제 실패:", err);
      error.value =
        err instanceof Error ? err.message : "3D Asset 삭제에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchAsset3DDetailCommon = async (equipmentType: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/asset3D/detail/common/${encodeURIComponent(equipmentType)}`,
        undefined,
        { method: "POST" }
      );

      return response;
    } catch (err) {
      console.error("3D Asset 공통 상세 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "3D Asset 공통 상세 조회에 실패했습니다.";
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
    searchResults,
    loading,
    error,
    // 액션
    fetchCommonCodes,
    fetchThirdDepth,
    fetchAsset3DCodeTree,
    deleteAsset3D,
    fetchAsset3DDetailCommon,
  };
});
