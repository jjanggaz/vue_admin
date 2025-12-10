import { defineStore } from "pinia";
import { ref } from "vue";
import { request } from "@/utils/request";

interface Asset3DTreeNode {
  code_key: string;
  code_value: string;
  code_level?: number;
  code_order?: number;
  children?: Asset3DTreeNode[];
  [key: string]: unknown;
}

export const useAsset3DStore = defineStore("asset3d", () => {
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

  // 3D Asset 검색 리스트 조회 함수
  const fetchSearchList = async (searchParams: Record<string, unknown>) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/asset3D/search", undefined, {
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
      console.error("3D Asset 검색 실패:", err);
      error.value =
        err instanceof Error ? err.message : "3D Asset 검색에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 3D Asset 공통 코드 조회 함수 (equipment_type 기반)
  const fetchAsset3DCommonCode = async (searchValue: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/asset3D/common/code/${searchValue}`,
        undefined,
        {
          method: "GET",
        }
      );

      // API 응답 구조에 맞게 수정 (사용자 제공 응답 구조: response.data)
      const responseData = response.response.data;

      console.log("3D Asset 공통 코드 조회 응답 데이터:", responseData);

      if (responseData?.hierarchy) {
        const hierarchy = responseData.hierarchy;

        // hierarchy 배열을 depth별로 분류하여 저장
        // level 1: 3D Asset (EQUIP) - secondDepth
        // level 2: 3D Asset명 (M_PUMP) - thirdDepth
        // level 3: 3D Asset종분류 (M_PMP03) - fourthDepth
        // level 4: 3D Asset유형 (M_PMP0302) - fifthDepth

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

        console.log("3D Asset 공통 코드 hierarchy 데이터 저장 완료:", {
          editSecondDepth: editSecondDepth.value,
          editThirdDepth: editThirdDepth.value,
          editFourthDepth: editFourthDepth.value,
          editFifthDepth: editFifthDepth.value,
        });
      }

      return response;
    } catch (err) {
      console.error("3D Asset 공통 코드 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "3D Asset 공통 코드 조회에 실패했습니다.";
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

        level3Map[codeKey] = node;
        roots.push(node);
      });

      level4Items.forEach((item) => {
        const codeKeyRaw = item?.code_key;
        const codeValueRaw = item?.code_value ?? item?.code_value_en;
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

  // 상세 깊이 코드 조회 (/api/asset3D/depth/detail)
  const fetchDepthDetail = async (codeGroup: string, codeLevel: number = 4) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/asset3D/depth/detail", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code_group: codeGroup,
          code_level: codeLevel,
        }),
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
        `/api/asset3D/depth/detail/searchType/${encodeURIComponent(searchKey)}`,
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
  const downloadExcelTemplate = async (asset3dName: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request(
        `/api/asset3D/tempExcel/${encodeURIComponent(asset3dName)}`,
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

  // 3D Asset Excel 파일 업로드
  const uploadAsset3DExcel = async (asset3dName: string, excelFile: File) => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("excel_file", excelFile);

      const response = await request(
        `/api/asset3D/uploadModelExcel/${encodeURIComponent(asset3dName)}`,
        undefined,
        {
          method: "POST",
          body: formData,
        }
      );

      return response;
    } catch (err) {
      console.error("3D Asset Excel 업로드 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "3D Asset Excel 업로드에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // 모델 ZIP 파일 업로드
  const uploadModelZip = async (asset3dName: string, zipFile: File) => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append("all_file", zipFile);

      const response = await request(
        `/api/asset3D/uploadModelZip/${encodeURIComponent(asset3dName)}`,
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

  const updateAsset3D = async (
    equipmentId: string,
    params: {
      equipment_type?: string;
      vendor_id?: string;
      model_number?: string;
      output_values?: Record<string, unknown>;
      search_criteria?: Record<string, unknown>;
      specifications?: Record<string, unknown>;
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
      const updateParams: Record<string, unknown> = {};
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
        `/api/asset3D/update/${encodeURIComponent(equipmentId)}`,
        undefined,
        {
          method: "POST",
          body: formData,
        }
      );

      return response;
    } catch (err) {
      console.error("3D Asset 수정 실패:", err);
      error.value =
        err instanceof Error ? err.message : "3D Asset 수정에 실패했습니다.";
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

  const fetchAsset3DDetailFiles = async (
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
        `/api/asset3D/detail/files/${encodeURIComponent(equipmentId)}`,
        undefined,
        {
          method: "POST",
          body: JSON.stringify(params),
          headers: { "Content-Type": "application/json" },
        }
      );

      return response;
    } catch (err) {
      console.error("3D Asset 파일 상세 조회 실패:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "3D Asset 파일 상세 조회에 실패했습니다.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchFormula = async (equipmentType: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/asset3D/search/formula", undefined, {
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

      const response = await request("/api/asset3D/create/formula", undefined, {
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
        `/api/asset3D/delete/formula/${encodeURIComponent(formulaId)}`,
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
    price_value?: number | string;
    price_reference?: string;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await request("/api/asset3D/price/history", undefined, {
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
    fetchAsset3DCommonCode,
    fetchAsset3DCodeTree,
    fetchDepthDetail,
    fetchDepthDetailBySearchType,
    downloadExcelTemplate,
    uploadAsset3DExcel,
    uploadModelZip,
    deleteAsset3D,
    updateAsset3D,
    fetchAsset3DDetailCommon,
    fetchAsset3DDetailFiles,
    searchFormula,
    createFormula,
    deleteFormula,
    createPriceHistory,
  };
});
