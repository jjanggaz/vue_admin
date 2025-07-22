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
  created_at: string;
  updated_at: string | null;
  last_login: string | null;
  dept_id: string | null;
  contact_info: string | null;
  description: string | null;
  created_by: string | null;
  updated_by: string | null;
}

// 사용자 등록/수정용 인터페이스
export interface UserFormData
  extends Omit<
    User,
    | "user_id"
    | "hashed_password"
    | "created_at"
    | "updated_at"
    | "last_login"
    | "dept_id"
    | "contact_info"
    | "description"
    | "created_by"
    | "updated_by"
  > {
  password?: string;
}

export interface UserListResponse {
  data: User[];
  total_count: number;
  has_more: boolean;
  page: number;
  items_per_page: number;
}

export interface UserQueryParams {
  offset?: number;
  limit?: number;
  page?: number;
  itemsPerPage?: number;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [] as User[],
    loading: false,
    totalCount: 0,
    currentPage: 1,
    itemsPerPage: 10,
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

        if (params.offset !== undefined)
          queryParams.offset = params.offset.toString();
        if (params.limit !== undefined)
          queryParams.limit = params.limit.toString();
        if (params.page !== undefined)
          queryParams.page = params.page.toString();
        if (params.itemsPerPage !== undefined)
          queryParams.itemsPerPage = params.itemsPerPage.toString();

        const response = (await request(
          "/api/v1/auth/auth/users/",
          queryParams,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )) as UserListResponse;

        this.users = response.data;
        this.totalCount = response.total_count;
        this.currentPage = response.page;
        this.itemsPerPage = response.items_per_page;
        this.hasMore = response.has_more;

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

    // 페이지 변경
    async changePage(page: number) {
      await this.fetchUsers({
        page,
        itemsPerPage: this.itemsPerPage,
      });
    },

    // 페이지 크기 변경
    async changePageSize(itemsPerPage: number) {
      await this.fetchUsers({
        page: 1, // 페이지 크기 변경 시 첫 페이지로
        itemsPerPage,
      });
    },

    // 사용자 등록
    async createUser(userData: UserFormData) {
      this.loading = true;
      this.error = null;

      try {
        // API 스펙에 맞게 데이터 변환
        const requestData = {
          email: userData.email,
          username: userData.username,
          hashed_password: userData.password, // 비밀번호를 hashed_password로 전송
          full_name: userData.full_name,
          organization: userData.organization,
          is_active: userData.is_active,
          is_superuser: userData.is_superuser,
        };

        const response = await request("/api/v1/auth/auth/users/", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        // 등록 후 목록 새로고침
        await this.fetchUsers({
          page: this.currentPage,
          itemsPerPage: this.itemsPerPage,
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
        // API 스펙에 맞게 데이터 변환 (비밀번호가 있는 경우만 포함)
        const requestData: any = {
          email: userData.email,
          username: userData.username,
          full_name: userData.full_name,
          organization: userData.organization,
          is_active: userData.is_active,
          is_superuser: userData.is_superuser,
        };

        // 비밀번호가 있는 경우에만 추가
        if (userData.password) {
          requestData.hashed_password = userData.password;
        }

        const response = await request(
          `/api/v1/auth/auth/users/${userId}`,
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
          page: this.currentPage,
          itemsPerPage: this.itemsPerPage,
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

    // 사용자 삭제 (단일 또는 다건)
    async deleteUsers(userIds: string[]) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request("/api/v1/auth/auth/users/", undefined, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userIds }),
        });

        // 삭제 후 목록 새로고침
        await this.fetchUsers({
          page: this.currentPage,
          itemsPerPage: this.itemsPerPage,
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
        // 이미 조회된 데이터가 있으면 그것을 사용
        if (this.users.length > 0) {
          const existingUser = this.users.find(
            (user) => user.username === username
          );
          return !existingUser; // 중복되지 않으면 true 반환
        }

        // 데이터가 없는 경우에만 API 호출
        const allUsersResponse = (await request(
          "/api/v1/auth/auth/users/",
          {
            page: "1",
            itemsPerPage: "100000", // 아이디 중복체크 해야하므로 최대치로 설정
          },
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )) as UserListResponse;

        // 중복 체크
        const existingUser = allUsersResponse.data.find(
          (user) => user.username === username
        );
        return !existingUser; // 중복되지 않으면 true 반환
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
      this.currentPage = 1;
      this.itemsPerPage = 10;
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

        return value
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      });
    },

    // 총 페이지 수 계산
    totalPages: (state) => {
      return Math.ceil(state.totalCount / state.itemsPerPage);
    },
  },
});
