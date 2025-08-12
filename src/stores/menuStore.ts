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
}

export const useMenuStore = defineStore("menu", {
  state: () => ({
    menus: [] as MenuItem[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // 메뉴 목록 조회
    async fetchMenus(params: MenuQueryParams = {}) {
      this.loading = true;
      this.error = null;

      try {
        const queryParams: Record<string, string | boolean> = {};

        // 메뉴 타입 설정
        if (params.menu_type !== undefined)
          queryParams.menu_type = params.menu_type;

        // 정렬 설정 - 고정값
        queryParams.order_by = "menu_order";
        queryParams.order_direction = "asc";

        // 전체 값을 받아야하므로 get_all은 true로 보내주기로 하기로함
        queryParams.get_all = true;

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
        } else {
          this.menus = [];
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

    // 상태 초기화
    resetState() {
      this.menus = [];
      this.loading = false;
      this.error = null;
    },
  },
});
