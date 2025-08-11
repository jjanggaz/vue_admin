import { defineStore } from "pinia";
import { request } from "../utils/request";

// 메뉴 인터페이스
export interface MenuItem {
  menu_id: string;
  menu_name: string;
  menu_type: "ROOT" | "ITEM";
  menu_order: number;
  is_active: boolean;
  children?: MenuItem[];
  system_code: "WAI_WEB_VIEW" | "WAI_WEB_ADMIN";
  menu_code: string;
  route_path: string;
  icon: string;
  is_hide: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string;
  updated_by: string | null;
  parent_menu_id: string | null;
  component_path: string | null;
  api_endpoint: string | null;
  term_id: number;
}

// 메뉴 등록/수정용 인터페이스
export interface MenuFormData {
  menu_name: string;
  menu_type: "ROOT" | "ITEM";
  menu_order: number;
  is_active: boolean;
  system_code: "WAI_WEB_VIEW" | "WAI_WEB_ADMIN";
  parent_menu_id?: string | null;
  menu_code: string;
  route_path: string;
  icon: string;
  is_hide: boolean;
}

export interface MenuListResponse {
  items: MenuItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  search_info: any | null;
}

export interface MenuQueryParams {
  menu_type?: "WAI_WEB_VIEW" | "WAI_WEB_ADMIN";
  search_field?: string;
  search_value?: string;
  page?: number;
  page_size?: number;
  // order_by는 menu_order로 고정, order_direction은 asc로 고정 (정렬 기능 없음)
}

export const useMenuStore = defineStore("menu", {
  state: () => ({
    menus: [] as MenuItem[],
    loading: false,
    totalCount: 0,
    page: 1,
    page_size: 10,
    hasMore: false,
    error: null as string | null,
  }),

  actions: {
    // 메뉴 목록 조회
    async fetchMenus(params: MenuQueryParams = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams: Record<string, string> = {};

        // 메뉴 타입 설정
        if (params.menu_type !== undefined)
          queryParams.menu_type = params.menu_type;

        // 검색 조건 설정
        if (params.search_field !== undefined)
          queryParams.search_field = params.search_field;
        if (params.search_value !== undefined)
          queryParams.search_value = params.search_value;

        // 페이지네이션 설정
        queryParams.page = (params.page || this.page).toString();
        queryParams.page_size = (params.page_size || this.page_size).toString();

        // 정렬 설정 - roleStore와 동일한 구조
        // order_by는 menu_order로 고정, order_direction은 asc로 고정 (정렬 기능 없음)
        queryParams.order_by = "menu_order";
        queryParams.order_direction = "asc";

        const response = await request("/api/menus/list", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(queryParams),
        });

        // API 응답 처리
        if (response.response && response.response.items) {
          this.menus = response.response.items;
          this.totalCount = response.response.total;
          this.page = response.response.page;
          this.page_size = response.response.page_size;
          this.hasMore = response.response.page < response.response.total_pages;
        } else {
          this.menus = [];
          this.totalCount = 0;
          this.page = 1;
          this.page_size = 10;
          this.hasMore = false;
        }

        console.log("메뉴 목록 조회 성공:", response);
      } catch (error) {
        console.error("메뉴 목록 조회 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "메뉴 목록 조회에 실패했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 페이지 변경 (검색 조건 유지)
    async changePage(
      page: number,
      searchParams?: {
        menu_type?: "WAI_WEB_VIEW" | "WAI_WEB_ADMIN";
        search_field?: string;
        search_value?: string;
      }
    ) {
      await this.fetchMenus({
        page,
        page_size: this.page_size,
        ...searchParams,
      });
    },

    // 페이지 크기 변경
    async changePageSize(pageSize: number) {
      await this.fetchMenus({
        page: 1, // 페이지 크기 변경 시 첫 페이지로
        page_size: pageSize,
      });
    },

    // 메뉴 등록
    async createMenu(menuData: MenuFormData) {
      this.loading = true;
      this.error = null;

      try {
        // API 요청 형식에 맞게 데이터 변환
        const requestData = {
          menu_name: menuData.menu_name,
          menu_type: menuData.menu_type,
          menu_order: menuData.menu_order,
          is_active: menuData.is_active,
          system_code: menuData.system_code,
          parent_menu_id: menuData.parent_menu_id || null,
          menu_code: menuData.menu_code,
          route_path: menuData.route_path,
          icon: menuData.icon,
          is_hide: menuData.is_hide,
        };

        const response = await request("/api/menus/create", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        // 등록 후 목록 새로고침
        await this.fetchMenus({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("메뉴 등록 성공:", response);
        return response.response;
      } catch (error) {
        console.error("메뉴 등록 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 메뉴 수정
    async updateMenu(menuId: string, menuData: Partial<MenuFormData>) {
      this.loading = true;
      this.error = null;

      try {
        // API 요청 형식에 맞게 데이터 변환
        const requestData: any = {};
        if (menuData.menu_name !== undefined)
          requestData.menu_name = menuData.menu_name;
        if (menuData.menu_type !== undefined)
          requestData.menu_type = menuData.menu_type;
        if (menuData.menu_order !== undefined)
          requestData.menu_order = menuData.menu_order;
        if (menuData.is_active !== undefined)
          requestData.is_active = menuData.is_active;
        if (menuData.system_code !== undefined)
          requestData.system_code = menuData.system_code;
        if (menuData.parent_menu_id !== undefined)
          requestData.parent_menu_id = menuData.parent_menu_id;
        if (menuData.menu_code !== undefined)
          requestData.menu_code = menuData.menu_code;
        if (menuData.route_path !== undefined)
          requestData.route_path = menuData.route_path;
        if (menuData.icon !== undefined) requestData.icon = menuData.icon;
        if (menuData.is_hide !== undefined)
          requestData.is_hide = menuData.is_hide;

        const response = await request(
          `/api/menus/update/${menuId}`,
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
        await this.fetchMenus({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("메뉴 수정 성공:", response);
        return response.response;
      } catch (error) {
        console.error("메뉴 수정 실패:", error);
        this.error =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 메뉴 삭제
    async deleteMenu(menuId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await request(
          `/api/menus/delete/${menuId}`,
          undefined,
          {
            method: "DELETE",
          }
        );

        // 삭제 후 목록 새로고침
        await this.fetchMenus({
          page: this.page,
          page_size: this.page_size,
        });

        console.log("메뉴 삭제 성공:", response);
        return response.response;
      } catch (error) {
        console.error("메뉴 삭제 실패:", error);
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
      this.menus = [];
      this.loading = false;
      this.totalCount = 0;
      this.page = 1;
      this.page_size = 10;
      this.hasMore = false;
      this.error = null;
    },
  },
});
