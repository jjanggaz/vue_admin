import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { request } from "@/utils/request";

export interface ProjectItem {
  id: string;
  project_name: string;
  client_name: string;
  contact_person: string;
  unit_system: string;
  site_capacity: string;
  solution: string;
  created_at: string;
  country_code: string;
  project_status: string;
}

// API 응답 인터페이스
interface ApiProjectItem {
  project_id: string;
  project_name: string;
  client?: {
    client_name: string;
    contact_person: string;
  };
  site?: {
    site_capacity: number;
    capacity_unit: string;
  };
  unit_system: string;
  project_status: string;
  created_at: string;
  country_code: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface ProjectListParams {
  page?: number;
  pageSize?: number;
  search_value?: string;
  order_by?: string;
  order_direction?: "asc" | "desc" | "";
}

export const useProjectStore = defineStore("project", () => {
  // 상태
  const projectList = ref<ProjectItem[]>([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalCount = ref(0);
  const searchQuery = ref("");
  const sortField = ref<string>("");
  const sortOrder = ref<"asc" | "desc">("asc");

  // 계산된 속성
  const totalPages = computed(
    () => Math.ceil(totalCount.value / pageSize.value) || 1
  );

  const paginatedProjectList = computed(() => {
    // 서버 사이드 페이지네이션을 사용하므로 projectList.value를 그대로 반환
    // 서버에서 이미 해당 페이지의 데이터만 보내줌
    const result = projectList.value;
    console.log("paginatedProjectList 계산:", {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      totalItems: projectList.value.length,
      resultLength: result.length,
      result: result,
      projectListValue: projectList.value,
    });
    return result;
  });

  // API 응답을 테이블 데이터로 변환하는 함수
  const transformApiData = (apiItems: ApiProjectItem[]): ProjectItem[] => {
    return apiItems.map((item) => ({
      id: item.project_id || "",
      project_name: item.project_name || "",
      client_name: item.client?.client_name || "",
      contact_person: item.client?.contact_person || "",
      unit_system: item.unit_system || "",
      site_capacity: item.site
        ? `${item.site.site_capacity || 0} ${item.site.capacity_unit || ""}`
        : "",
      solution: "", // 솔루션은 아직 정의되지 않아 빈값으로 설정
      created_at: item.created_at || "",
      country_code: item.country_code || "",
      project_status: item.project_status || "",
    }));
  };

  // API 호출 함수
  const fetchProjectList = async (params: ProjectListParams = {}) => {
    try {
      loading.value = true;
      console.log("projectStore - API 호출 시작:", params);
      console.log("projectStore - 정렬 관련 파라미터:", {
        order_by: params.order_by,
        order_direction: params.order_direction,
      });

      const requestBody = {
        page: params.page || 1,
        pageSize: params.pageSize || pageSize.value,
        search_value: params.search_value || "",
        order_by: params.order_by || "",
        order_direction: params.order_direction || "asc",
      };

      console.log("요청 본문:", requestBody);

      const response = await request(`/api/project/list`, undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("API 응답:", response);

      if (response.success && response.response) {
        const apiItems = response.response.items || [];
        console.log("API 아이템 개수:", apiItems.length);

        projectList.value = transformApiData(apiItems);
        totalCount.value = response.response.total || 0;

        if (params.page) currentPage.value = params.page;
        if (params.pageSize) pageSize.value = params.pageSize;
        if (params.search_value !== undefined)
          searchQuery.value = params.search_value;
        // 정렬 상태 업데이트 (userStore.ts와 동일한 방식)
        if (params.order_by !== undefined) {
          // 빈 문자열인 경우 정렬 해제
          if (params.order_by === "") {
            sortField.value = "";
            console.log("projectStore - 정렬 필드 해제");
          } else {
            sortField.value = params.order_by;
            console.log("projectStore - 정렬 필드 업데이트:", params.order_by);
          }
        }
        if (params.order_direction !== undefined) {
          // 빈 문자열인 경우 정렬 해제
          if (params.order_direction === "") {
            sortOrder.value = "asc"; // 기본값으로 초기화
            console.log("projectStore - 정렬 방향 해제");
          } else {
            sortOrder.value = params.order_direction;
            console.log(
              "projectStore - 정렬 방향 업데이트:",
              params.order_direction
            );
          }
        }

        console.log("데이터 변환 완료:", projectList.value.length, "개 항목");
        console.log("총 개수:", totalCount.value);
        console.log("projectList 상태:", {
          length: projectList.value.length,
          firstItem: projectList.value[0],
          currentPage: currentPage.value,
          pageSize: pageSize.value,
        });
        console.log("paginatedProjectList 계산 결과:", {
          length: projectList.value.length,
          items: projectList.value,
        });
      } else {
        console.warn("API 응답이 성공이 아니거나 데이터가 없음:", response);
        projectList.value = [];
        totalCount.value = 0;
      }
    } catch (error) {
      console.error("프로젝트 목록 조회 실패:", error);
      // 에러 발생 시 빈 배열로 초기화
      projectList.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
      console.log("API 호출 완료, 로딩 상태:", loading.value);
    }
  };

  // 초기 데이터 로드
  const loadInitialData = async () => {
    console.log("초기 데이터 로드 시작");
    try {
      await fetchProjectList({
        page: 1,
        pageSize: pageSize.value,
      });
      console.log(
        "초기 데이터 로드 완료:",
        projectList.value.length,
        "개 항목"
      );
    } catch (error) {
      console.error("초기 데이터 로드 중 에러 발생:", error);
      throw error;
    }
  };

  // 검색
  const handleSearch = async (query: string) => {
    await fetchProjectList({
      page: 1,
      pageSize: pageSize.value,
      search_value: query,
    });
  };

  // 페이지 변경 (검색 조건과 정렬 조건 유지)
  const changePage = async (
    page: number,
    searchParams?: {
      search_value?: string;
      order_by?: string;
      order_direction?: "asc" | "desc";
    }
  ) => {
    console.log("projectStore - changePage 시작:", {
      page,
      pageSize: pageSize.value,
      searchParams,
      currentSearchQuery: searchQuery.value,
      currentSortField: sortField.value,
      currentSortOrder: sortOrder.value,
    });

    await fetchProjectList({
      page,
      pageSize: pageSize.value,
      search_value: searchParams?.search_value ?? searchQuery.value,
      order_by: searchParams?.order_by ?? sortField.value,
      order_direction: searchParams?.order_direction ?? sortOrder.value,
    });

    console.log("projectStore - changePage 완료:", {
      page,
      currentPage: currentPage.value,
      projectListLength: projectList.value.length,
      totalCount: totalCount.value,
    });
  };

  // 상태 초기화
  const resetState = () => {
    projectList.value = [];
    loading.value = false;
    currentPage.value = 1;
    totalCount.value = 0;
    searchQuery.value = "";
    sortField.value = "";
    sortOrder.value = "asc";
  };

  return {
    // 상태
    projectList,
    loading,
    currentPage,
    pageSize,
    totalCount,
    searchQuery,
    sortField,
    sortOrder,

    // 계산된 속성
    totalPages,
    paginatedProjectList,

    // 액션
    fetchProjectList,
    loadInitialData,
    handleSearch,
    changePage,
    resetState,
  };
});
