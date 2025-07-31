import { defineStore } from "pinia";
import { request } from "../utils/request";

// 역할 데이터 인터페이스
export interface Role {
  role_id: number;
  role_code: string;
  role_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

// 역할 목록 응답 인터페이스
export interface RoleListResponse {
  data: Role[];
  total_count: number;
  has_more: boolean;
  page: number;
  page_size: number;
}

// 역할 조회 파라미터 인터페이스
export interface RoleQueryParams {
  page?: number;
  page_size?: number;
}

export const useRoleStore = defineStore("role", {
  state: () => ({
    roles: [] as Role[],
    loading: false,
    totalCount: 0,
    currentPage: 1,
    pageSize: 10,
    hasMore: false,
    error: null as string | null,
  }),

  actions: {
    // 역할 목록 조회
    async fetchRoles(params: RoleQueryParams = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams: Record<string, string> = {};

        if (params.page !== undefined) {
          queryParams.page = params.page.toString();
        }
        if (params.page_size !== undefined) {
          queryParams.page_size = params.page_size.toString();
        }

        const response = await request(
          "/api/v1/auth/roles/filtered",
          queryParams,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // API 응답 구조에 따라 처리
        if (Array.isArray(response)) {
          // 응답이 배열인 경우
          this.roles = response;
          this.totalCount = response.length;
          this.currentPage = 1;
          this.pageSize = response.length;
          this.hasMore = false;
        } else {
          // 응답이 객체인 경우 (페이지네이션 포함)
          const roleResponse = response as RoleListResponse;
          this.roles = roleResponse.data || [];
          this.totalCount = roleResponse.total_count || 0;
          this.currentPage = roleResponse.page || 1;
          this.pageSize = roleResponse.page_size || 10;
          this.hasMore = roleResponse.has_more || false;
        }
      } catch (error) {
        console.error("역할 목록 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "역할 목록 조회 중 오류가 발생했습니다.";
        this.roles = [];
        this.totalCount = 0;
        this.hasMore = false;
      } finally {
        this.loading = false;
      }
    },

    // 페이지 변경
    async changePage(page: number) {
      this.currentPage = page;
      await this.fetchRoles({
        page: this.currentPage,
        page_size: this.pageSize,
      });
    },

    // 페이지 크기 변경
    async changePageSize(pageSize: number) {
      this.pageSize = pageSize;
      this.currentPage = 1; // 페이지 크기 변경 시 첫 페이지로 이동
      await this.fetchRoles({
        page: this.currentPage,
        page_size: this.pageSize,
      });
    },

    // 상태 초기화
    resetState() {
      this.roles = [];
      this.loading = false;
      this.totalCount = 0;
      this.currentPage = 1;
      this.pageSize = 10;
      this.hasMore = false;
      this.error = null;
    },
  },

  getters: {
    // 로딩 상태
    isLoading: (state) => state.loading,

    // 에러 상태
    hasError: (state) => state.error !== null,

    // 에러 메시지
    errorMessage: (state) => state.error,

    // 역할 목록
    roleList: (state) => state.roles,

    // 총 개수
    totalRoles: (state) => state.totalCount,

    // 현재 페이지
    currentPageNumber: (state) => state.currentPage,

    // 페이지 크기
    currentPageSize: (state) => state.pageSize,

    // 더 많은 데이터가 있는지
    hasMoreData: (state) => state.hasMore,
  },
});
