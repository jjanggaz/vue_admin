import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import i18n from "@/i18n";

// 로그인 페이지
const Login = () => import("@/views/auth/Login.vue");

// 대시보드 페이지
const Dashboard = () => import("@/views/dashboard/Dashboard.vue");

// 에러 페이지
const NotFound = () => import("@/views/error/NotFound.vue");

// 각 화면별 라우트 import
import { projectRoute } from "./routes/project";
import { assetRoute } from "./routes/asset";
import { processRoute } from "./routes/process";
import { modelRoute } from "./routes/model";
import { machineRoute } from "./routes/machine";
import { userRoute } from "./routes/user";
import { vendorsRoute } from "./routes/vendors";
import { codeRoute } from "./routes/code";
import { testRoute } from "./routes/test";
import { costRoute } from "./routes/cost";

import { useAuthStore } from "../stores/authStore";

// 기본 라우트 (모든 사용자에게 공통)
const baseRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      requiresAuth: false,
      layout: "blank",
    },
  },
  {
    path: "/",
    redirect: "/code",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      requiresAuth: true,
      titleKey: "pageTitles.dashboard",
      icon: "dashboard",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
  testRoute,
];

// 코드별 라우트 매핑
const codeBasedRoutes = {
  WEB01: null, // 대시보드는 baseRoutes에 포함되어 있음
  WEB02: codeRoute,
  WEB03: projectRoute,
  WEB04: assetRoute,
  WEB05: processRoute,
  WEB06: machineRoute,
  WEB07: costRoute,
  WEB08: modelRoute,
  WEB09: userRoute,
  WEB10: vendorsRoute,
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: baseRoutes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 코드 기반 라우트 동적 추가 함수
export const addRoleBasedRoutes = (userCodes: string[]) => {
  if (!userCodes || userCodes.length === 0) {
    console.warn("[Router] 사용자 코드가 없습니다.");
    return;
  }

  // 코드 기반으로 라우트 추가
  const roleRoutes = userCodes
    .map((code) => codeBasedRoutes[code as keyof typeof codeBasedRoutes])
    .filter((route): route is NonNullable<typeof route> => route !== null); // null 값 제거 및 타입 가드

  if (roleRoutes.length > 0) {
    // 기존 권한별 라우트 제거 (중복 방지)
    const existingRoutes = router.getRoutes();
    roleRoutes.forEach((route) => {
      const existingRoute = existingRoutes.find(
        (r: any) => r.path === route.path
      );
      if (existingRoute && existingRoute.name) {
        try {
          router.removeRoute(String(existingRoute.name));
        } catch (error) {
          console.warn(
            `[Router] 라우트 제거 실패: ${String(existingRoute.name)}`,
            error
          );
        }
      }
    });

    // 새로운 권한별 라우트 추가
    roleRoutes.forEach((route) => {
      try {
        router.addRoute(route);
      } catch (error) {
        console.error(`[Router] 라우트 추가 실패: ${route.path}`, error);
      }
    });

    console.log(
      `[Router] 사용자 코드 기반 라우트 추가 완료 (${roleRoutes.length}개)`
    );
  } else {
    console.warn(
      `[Router] 유효한 라우트 코드가 없습니다: ${userCodes.join(", ")}`
    );
  }
};

// 네비게이션 가드
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  let isLoggedIn = authStore.isLoggedIn;
  const userName = authStore.user?.username;

  const requiresAuth = to.meta.requiresAuth ?? true;

  console.log(
    "[router/index.ts] isLoggedIn: ",
    isLoggedIn,
    ", userName: ",
    userName,
    ", requiresAuth: ",
    requiresAuth
  );

  // ✅ 새창에서 로그인 상태 확인 (sessionStorage가 비어있을 수 있음)
  // 단, 로그인 페이지에서는 토큰 검증 스킵
  if (!isLoggedIn && to.path !== "/login") {
    console.log("로그인 상태가 false, 토큰 유효성 확인 시도...");
    await authStore.checkTokenValidity();
    isLoggedIn = authStore.isLoggedIn; // 스토어 상태를 다시 가져옴
    console.log("토큰 유효성 확인 후 authStore.isLoggedIn 상태:", isLoggedIn);
  }

  // ✅ 인증 필요하지만 로그인 안 한 경우 → 로그인 페이지로
  if (requiresAuth && !isLoggedIn) {
    console.log("인증 필요하지만 로그인 안 한 경우 → 로그인 페이지로 >> ");
    return next("/login");
  }

  // ✅ 로그인된 사용자의 기본 정보 확인
  if (requiresAuth && isLoggedIn) {
    // localStorage에서 사용자 정보 확인
    const authName = localStorage.getItem("authName");
    const authUsername = localStorage.getItem("authUsername");
    const authCodes = localStorage.getItem("authCodes");

    if (!authName || !authUsername || !authCodes) {
      console.log(
        "localStorage에 사용자 정보가 없음, 로그아웃 처리 후 로그인 페이지로 >> "
      );
      await authStore.logout();
      return next("/login");
    }
  }

  // ✅ 이미 로그인된 사용자가 로그인 페이지 접근 시 → 코드관리 페이지로
  if (to.path === "/login" && isLoggedIn) {
    console.log("이미 로그인된 사용자가 로그인 페이지 접근 → 코드관리 페이지로 >> ");
    return next("/code");
  }

  // ✅ 문제 없으면 통과
  next();
});

// 페이지 타이틀 설정
router.afterEach((to) => {
  const titleKey = to.meta.titleKey as string;
  if (titleKey) {
    const translatedTitle = i18n.global.t(titleKey);
    document.title = `${translatedTitle} - WAI DESIGN`;
  } else {
    document.title = i18n.global.t("pageTitles.default");
  }
});

export default router;
