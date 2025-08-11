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

// 권한 등록/수정용 인터페이스
export interface RoleFormData {
  role_code: string;
  role_name: string;
  description: string;
  is_active?: boolean;
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
    page_size: 10,
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

        if (response.success) {
          this.roles = response.response.items || [];
          this.totalCount = response.response.total || 0;
          this.page = response.response.page || 1;
          this.page_size = response.response.page_size || 10;
          this.hasMore = response.response.total_pages > this.page;
        } else {
          throw new Error(
            response.message || "권한 목록을 불러오는데 실패했습니다."
          );
        }
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

    // 페이지 변경
    async changePage(
      page: number,
      searchParams?: { search_field?: string; search_value?: string }
    ) {
      this.page = page;
      await this.fetchRoles({
        page,
        search_field: searchParams?.search_field,
        search_value: searchParams?.search_value,
      });
    },

    // 페이지 크기 변경
    async changePageSize(pageSize: number) {
      this.page_size = pageSize;
      this.page = 1; // 페이지 크기 변경 시 첫 페이지로 이동
      await this.fetchRoles({ page: 1, page_size: pageSize });
    },

    // 권한 등록
    async createRole(roleData: RoleFormData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request("/api/roles/create", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roleData),
        });

        if (response.success) {
          // 새로 등록된 권한을 목록에 추가
          const newRole: Role = {
            role_id: response.response.role_id || Date.now(), // 임시 ID 생성
            role_code: roleData.role_code,
            role_name: roleData.role_name,
            description: roleData.description,
            is_active: roleData.is_active ?? true,
            created_at: new Date().toISOString(),
            updated_at: null,
            created_by: null,
            updated_by: null,
          };

          this.roles.unshift(newRole);
          this.totalCount += 1;

          return response.response;
        } else {
          throw new Error(response.message || "권한 등록에 실패했습니다.");
        }
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
        const response = await request(
          `/api/roles/update/${roleId}`,
          undefined,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(roleData),
          }
        );

        if (response.success) {
          // 로컬 상태 업데이트
          const roleIndex = this.roles.findIndex(
            (role) => role.role_id === roleId
          );
          if (roleIndex !== -1) {
            this.roles[roleIndex] = {
              ...this.roles[roleIndex],
              ...roleData,
              updated_at: new Date().toISOString(),
            };
          }

          return response.response;
        } else {
          throw new Error(response.message || "권한 수정에 실패했습니다.");
        }
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

        if (response.success) {
          // 로컬 상태에서 제거
          const roleIndex = this.roles.findIndex(
            (role) => role.role_id === roleId
          );
          if (roleIndex !== -1) {
            this.roles.splice(roleIndex, 1);
            this.totalCount -= 1;
          }

          return response.response;
        } else {
          throw new Error(response.message || "권한 삭제에 실패했습니다.");
        }
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
      this.page_size = 10;
      this.hasMore = false;
      this.error = null;
    },
  },
});
