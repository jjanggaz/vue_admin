import { defineStore } from "pinia";
import { request } from "../utils/request";

// API 응답 구조에 맞는 인터페이스
export interface User {
  user_id: string;
  email: string;
  username: string;
  hashed_password?: string;
  full_name: string;
  organization: string;
  is_active: boolean;
  is_superuser: boolean;
  user_type: "INTERNAL" | "EXTERNAL" | null; // 사내/사외 구분 (null 허용)
  created_at: string;
  updated_at: string | null;
  last_login: string | null; // 마지막 로그인 시간 추가

  dept_id: string | null;
  contact_info: string | null;
  description: string | null;
  created_by: string | null;
  updated_by: string | null;
}

// 사용자 등록/수정용 인터페이스
export interface UserFormData {
  email: string;
  username: string;
  is_superuser: boolean;
  full_name: string;
  organization: string;
  user_type: "INTERNAL" | "EXTERNAL"; // 사내/사외 구분
  contact_info: string;
  description: string;
  password?: string;
  confirm_password?: string;
  is_active?: boolean; // 수정 시에만 사용
}

export interface UserListResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  search_info: any | null;
}

export interface UserQueryParams {
  search_field?: string;
  search_value?: string;
  page?: number;
  page_size?: number;
  order_by?: string;
  order_direction?: "asc" | "desc";
}

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as User[],
    loading: false,
    totalCount: 0,
    page: 1,
    page_size: 10,
    hasMore: false,
    error: null as string | null,
  }),

  actions: {
    // 사용자 목록 조회
    async fetchUsers(params: UserQueryParams = {}) {
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

        const response = await request("/api/users/list", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(queryParams),
        });

        // API 응답 처리
        if (response.response && response.response.items) {
          this.users = response.response.items;
          this.totalCount = response.response.total;
          this.page = response.response.page;
          this.page_size = response.response.page_size;
          this.hasMore = response.response.page < response.response.total_pages;
        } else {
          this.users = [];
          this.totalCount = 0;
          this.page = 1;
          this.page_size = 10;
          this.hasMore = false;
        }

        console.log("사용자 목록 조회 성공:", response);
      } catch (error) {
        console.error("사용자 목록 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "사용자 목록 조회에 실패했습니다.";
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
      await this.fetchUsers({
        page,
        page_size: this.page_size,
        ...searchParams,
      });
    },

    // 페이지 크기 변경
    async changePageSize(pageSize: number) {
      await this.fetchUsers({
        page: 1, // 페이지 크기 변경 시 첫 페이지로
        page_size: pageSize,
      });
    },

    // 사용자 등록
    async createUser(userData: UserFormData) {
      this.loading = true;
      this.error = null;

      try {
        // 새로운 API 스펙에 맞게 데이터 변환
        const requestData: any = {
          email: userData.email,
          username: userData.username,
          is_superuser: userData.is_superuser,
          full_name: userData.full_name,
          organization: userData.organization,
          password: userData.password,
          confirm_password: userData.confirm_password,
        };

        // user_type이 있는 경우 추가
        if (userData.user_type !== undefined) {
          requestData.user_type = userData.user_type;
        }

        // 빈 문자열이 아닌 경우에만 추가
        if (userData.contact_info && userData.contact_info.trim() !== "") {
          requestData.contact_info = userData.contact_info;
        }
        if (userData.description && userData.description.trim() !== "") {
          requestData.description = userData.description;
        }

        console.log(
          "사용자 등록 요청 데이터:",
          JSON.stringify(requestData, null, 2)
        );

        const response = await request("/api/users/create", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        // 등록 후 목록 새로고침
        await this.fetchUsers({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("사용자 등록 성공:", response);
        return response;
      } catch (error) {
        console.error("사용자 등록 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "사용자 등록에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 사용자 수정
    async updateUser(userId: string, userData: Partial<UserFormData>) {
      this.loading = true;
      this.error = null;

      try {
        // 새로운 API 스펙에 맞게 데이터 변환
        const requestData: any = {
          email: userData.email,
          username: userData.username,
          full_name: userData.full_name,
          organization: userData.organization,
          is_superuser: userData.is_superuser,
        };

        // user_type이 있는 경우 추가
        if (userData.user_type !== undefined) {
          requestData.user_type = userData.user_type;
        }

        // is_active가 있는 경우 추가
        if (userData.is_active !== undefined) {
          requestData.is_active = userData.is_active;
        }

        // 빈 문자열이 아닌 경우에만 추가
        if (userData.contact_info && userData.contact_info.trim() !== "") {
          requestData.contact_info = userData.contact_info;
        }
        if (userData.description && userData.description.trim() !== "") {
          requestData.description = userData.description;
        }

        // 비밀번호가 있는 경우에만 추가 (비밀번호와 확인 비밀번호 모두 있어야 함)
        if (userData.password !== undefined && userData.password !== null) {
          // 비밀번호가 빈 문자열이 아닌 경우에만 validation 체크
          if (userData.password.trim() !== "") {
            if (
              !userData.confirm_password ||
              userData.confirm_password.trim() === ""
            ) {
              throw new Error("비밀번호 확인이 필요합니다.");
            }
            if (userData.password !== userData.confirm_password) {
              throw new Error("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            }
            requestData.password = userData.password;
            requestData.confirm_password = userData.confirm_password;
          }
        }

        console.log(
          "사용자 수정 요청 데이터:",
          JSON.stringify(requestData, null, 2)
        );

        const response = await request(
          `/api/users/update/${userId}`,
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
        await this.fetchUsers({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("사용자 수정 성공:", response);
        return response;
      } catch (error) {
        console.error("사용자 수정 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "사용자 수정에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 사용자 삭제 (단건)
    async deleteUser(userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request(
          `/api/users/delete/${userId}`,
          undefined,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // 삭제 후 목록 새로고침
        await this.fetchUsers({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("사용자 삭제 성공:", response);
        return response;
      } catch (error) {
        console.error("사용자 삭제 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "사용자 삭제에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 사용자 ID 중복 체크
    async checkUserIdDuplicate(username: string): Promise<boolean> {
      try {
        const response = await request(
          `/api/users/check/${username}`,
          undefined,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // exists가 true면 중복, false면 중복되지 않음
        // 중복되지 않으면 true 반환 (사용 가능)
        return !response.response.exists;
      } catch (error) {
        console.error("사용자 ID 중복 체크 실패:", error);
        return false;
      }
    },

    // 상태 초기화
    resetState() {
      this.users = [];
      this.loading = false;
      this.totalCount = 0;
      this.page = 1;
      this.page_size = 10;
      this.hasMore = false;
      this.error = null;
    },
  },

  getters: {
    // 필터링된 사용자 목록 (클라이언트 측 검색용)
    filteredUsers: (state) => (searchOption: string, searchQuery: string) => {
      if (!searchOption || !searchQuery) {
        return state.users;
      }

      return state.users.filter((user) => {
        const key = searchOption as keyof User;
        const value = user[key];

        if (value === null || value === undefined) return false;

        // 권한 검색 시 특별 처리
        if (key === "is_superuser") {
          const roleText = value ? "관리자" : "사용자";
          return roleText.toLowerCase().includes(searchQuery.toLowerCase());
        }

        // 활성 상태 검색 시 특별 처리
        if (key === "is_active") {
          const statusText = value ? "활성" : "비활성";
          return statusText.toLowerCase().includes(searchQuery.toLowerCase());
        }

        // 사용자 타입 검색 시 특별 처리
        if (key === "user_type") {
          if (value === null || value === undefined) {
            return false; // null인 경우 검색 결과에서 제외
          }
          const typeText = value === "INTERNAL" ? "사내" : "사외";
          return typeText.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return value
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      });
    },

    // 총 페이지 수 계산
    totalPages: (state) => {
      return Math.ceil(state.totalCount / state.page_size);
    },
  },
});
