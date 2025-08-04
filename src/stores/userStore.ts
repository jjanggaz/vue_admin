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
  dept_id: string;
  contact_info: string;
  description: string;
  password?: string;
  confirm_password?: string;
  is_active?: boolean; // 수정 시에만 사용
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

        const response = await request("/api/v1/auth/users/", queryParams, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // API 응답 구조에 따라 처리
        if (Array.isArray(response.response)) {
          // 응답이 배열인 경우
          this.users = response.response;
          this.totalCount = response.response.length;
          this.currentPage = 1;
          this.itemsPerPage = response.response.length;
          this.hasMore = false;
        } else {
          // 응답이 객체인 경우 (UserListResponse 형태)
          this.users = response.response.data;
          this.totalCount = response.response.total_count;
          this.currentPage = response.response.page;
          this.itemsPerPage = response.response.items_per_page;
          this.hasMore = response.response.has_more;
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
        if (userData.dept_id && userData.dept_id.trim() !== "") {
          requestData.dept_id = userData.dept_id;
        }
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

        const response = await request("/api/v1/auth/users/", undefined, {
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
        if (userData.dept_id && userData.dept_id.trim() !== "") {
          requestData.dept_id = userData.dept_id;
        }
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
          `/api/v1/auth/users/${userId}`,
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

    // 사용자 삭제 (단건)
    async deleteUser(userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request(
          `/api/v1/auth/users/${userId}`,
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
          "/api/v1/auth/users/",
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
      return Math.ceil(state.totalCount / state.itemsPerPage);
    },
  },
});
