import { defineStore } from "pinia";
import { request } from "../utils/request";

// API 응답 구조에 맞는 인터페이스
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
  menu_permissions?: string;
}

// 권한 상세 조회용 인터페이스
export interface RoleDetail {
  role_id: number;
  role_code: string;
  role_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  menus: RoleMenu[];
}

// 권한 메뉴 인터페이스
export interface RoleMenu {
  menu_id: string;
  menu_name: string;
  menu_type: "ROOT" | "ITEM";
  menu_order: number;
  menu_is_active: boolean;
}

// 권한 등록/수정 시 전달할 메뉴 인터페이스
export interface RoleMenuRequest {
  menu_id: string;
  menu_name: string;
  parent_menu_id: string | null;
  system_code: string | null;
  menu_type: "ROOT" | "ITEM";
}

// 권한 등록/수정용 인터페이스
export interface RoleFormData {
  role_code: string;
  role_name: string;
  description: string | null;
  is_active: boolean;
  menus?: RoleMenuRequest[]; // 메뉴 요청 객체 배열로 변경
}

export interface RoleListResponse {
  items: Role[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  search_info: any | null;
}

export interface RoleQueryParams {
  search_field?: string;
  search_value?: string;
  page?: number;
  page_size?: number;
  order_by?: string;
  order_direction?: "asc" | "desc";
}

export const useRoleStore = defineStore("role", {
  state: () => ({
    roles: [] as Role[],
    loading: false,
    totalCount: 0,
    page: 1,
    page_size: 20,
    hasMore: false,
    error: null as string | null,
  }),

  actions: {
    // 권한 목록 조회
    async fetchRoles(params: RoleQueryParams = {}) {
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

        const response = await request("/api/roles/list", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(queryParams),
        });

        // API 응답 처리
        if (response.response && response.response.items) {
          this.roles = response.response.items;
          this.totalCount = response.response.total;
          this.page = response.response.page;
          this.page_size = response.response.page_size;
          this.hasMore = response.response.page < response.response.total_pages;
        } else {
          this.roles = [];
          this.totalCount = 0;
          this.page = 1;
          this.page_size = 20;
          this.hasMore = false;
        }

        console.log("권한 목록 조회 성공:", response);
      } catch (error) {
        console.error("권한 목록 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
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
      await this.fetchRoles({
        page,
        page_size: this.page_size,
        ...searchParams,
      });
    },

    // 페이지 크기 변경
    async changePageSize(pageSize: number) {
      await this.fetchRoles({
        page: 1, // 페이지 크기 변경 시 첫 페이지로
        page_size: pageSize,
      });
    },

    // 권한 등록
    async createRole(roleData: RoleFormData) {
      this.loading = true;
      this.error = null;

      try {
        // API 요청 형식에 맞게 데이터 변환
        const requestData: any = {
          role_code: roleData.role_code,
          role_name: roleData.role_name,
          description: roleData.description || "",
          is_active: roleData.is_active,
        };

        // menus 필드가 있으면 추가
        if (roleData.menus && roleData.menus.length > 0) {
          requestData.menus = roleData.menus;
        }

        const response = await request("/api/roles/create", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        // 등록 후 목록 새로고침
        await this.fetchRoles({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("권한 등록 성공:", response);
        return response.response;
      } catch (error) {
        console.error("권한 등록 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 권한 수정
    async updateRole(roleId: number, roleData: Partial<RoleFormData>) {
      this.loading = true;
      this.error = null;

      try {
        // API 요청 형식에 맞게 데이터 변환
        const requestData: any = {};
        if (roleData.role_code !== undefined)
          requestData.role_code = roleData.role_code;
        if (roleData.role_name !== undefined)
          requestData.role_name = roleData.role_name;
        if (roleData.description !== undefined)
          requestData.description = roleData.description || "";
        if (roleData.is_active !== undefined)
          requestData.is_active = roleData.is_active;
        if (roleData.menus !== undefined) requestData.menus = roleData.menus;

        const response = await request(
          `/api/roles/update/${roleId}`,
          undefined,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        // 수정 후 목록 새로고침
        await this.fetchRoles({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("권한 수정 성공:", response);
        return response.response;
      } catch (error) {
        console.error("권한 수정 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 권한 상세 조회
    async fetchRoleDetail(roleId: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request(`/api/roles/${roleId}`, undefined, {
          method: "GET",
        });

        console.log("권한 상세 조회 성공:", response);
        return response.response;
      } catch (error) {
        console.error("권한 상세 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 권한 삭제
    async deleteRole(roleId: number) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request(
          `/api/roles/delete/${roleId}`,
          undefined,
          {
            method: "DELETE",
          }
        );

        // 삭제 후 목록 새로고침
        await this.fetchRoles({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("권한 삭제 성공:", response);
        return response.response;
      } catch (error) {
        console.error("권한 삭제 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 상태 초기화
    resetState() {
      this.roles = [];
      this.loading = false;
      this.totalCount = 0;
      this.page = 1;
      this.page_size = 20;
      this.hasMore = false;
      this.error = null;
    },
  },
});
