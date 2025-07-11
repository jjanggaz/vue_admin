import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

// 페이지 컴포넌트들을 lazy loading으로 import
const Dashboard = () => import("@/views/dashboard/Dashboard.vue");

// 프로젝트 관리 페이지
const ProjectManagement = () => import("@/views/project/ProjectManagement.vue");
const Project = () => import("@/views/project/Project.vue");
const ProjectApp = () => import("@/views/project/ProjectApp.vue");
const ProjectItem = () => import("@/views/project/ProjectItem.vue");

const AssetManagement = () => import("@/views/asset/AssetManagement.vue");
const MachineList = () => import("@/views/machine/MachineList.vue");
const UserManagement = () => import("@/views/user/UserManagement.vue");
const CodeManagement = () => import("@/views/code/CodeManagement.vue");
const Login = () => import("@/views/auth/Login.vue");

// 공정 관리 페이지
const ProcessManagement = () => import("@/views/process/ProcessManagement.vue");
const Process = () => import("@/views/process/Process.vue");

// 3D 모델 관리 페이지
const ModelManagement = () => import("@/views/model/ModelManagement.vue");
const Model3D = () => import("@/views/model/Model3D.vue");
const Revit = () => import("@/views/model/Revit.vue");
const Standard = () => import("@/views/model/Standard.vue");

import { useAuthStore } from "../stores/authStore";

const routes: RouteRecordRaw[] = [
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
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: "대시보드",
      icon: "dashboard",
    },
  },
  {
    path: "/project",
    name: "ProjectManagement",
    component: ProjectManagement,
    redirect: "/project/project",
    meta: {
      requiresAuth: true,
      title: "프로젝트 관리",
      icon: "project",
    },
    children: [
      {
        path: "project",
        name: "Project",
        component: Project,
        meta: {
          title: "프로젝트",
          breadcrumb: ["프로젝트 관리", "프로젝트"],
        },
      },
      {
        path: "projectApp",
        name: "ProjectApp",
        component: ProjectApp,
        meta: {
          title: "승인대기",
          breadcrumb: ["프로젝트 관리", "승인대기"],
        },
      },
      {
        path: "projectItem",
        name: "ProjectItem",
        component: ProjectItem,
        meta: {
          title: "항목관리",
          breadcrumb: ["프로젝트 관리", "항목관리"],
        },
      },
    ],
  },
  {
    path: "/asset",
    name: "AssetManagement",
    component: AssetManagement,
    meta: {
      requiresAuth: true,
      title: "유일충류 관리",
      icon: "asset",
    },
  },
  {
    path: "/process",
    name: "ProcessManagement",
    component: ProcessManagement,
    redirect: "/process/process",
    meta: {
      requiresAuth: true,
      title: "공정 관리",
      icon: "process",
    },
    children: [
      {
        path: "process",
        name: "Process",
        component: Process,
        meta: {
          title: "공정",
          breadcrumb: ["공정", "공정 관리"],
        },
      },
      {
        path: "output",
        name: "Output",
        component: () => import("@/views/process/Output.vue"),
        meta: {
          title: "Output",
          breadcrumb: ["공정", "Output"],
        },
      },
      {
        path: "detail/:id",
        name: "ProcessDetail",
        component: () => import("@/views/process/ProcessDetail.vue"),
        meta: {
          title: "공정 상세",
          breadcrumb: ["공정", "공정 상세"],
        },
      },
    ],
  },
  {
    path: "/model",
    name: "ModelManagement",
    component: ModelManagement,
    redirect: "/model/3d",
    meta: {
      requiresAuth: true,
      title: "3D모델 관리",
      icon: "model",
    },
    children: [
      {
        path: "3d",
        name: "Model3D",
        component: Model3D,
        meta: {
          title: "3D 모델 관리",
          breadcrumb: ["3D모델 관리", "3D모델 관리"],
        },
      },
      {
        path: "revit",
        name: "Revit",
        component: Revit,
        meta: {
          title: "Revit 관리",
          breadcrumb: ["3D모델 관리", "Revit 관리"],
        },
      },
      {
        path: "standard",
        name: "Standard",
        component: Standard,
        meta: {
          title: "표준배치 관리",
          breadcrumb: ["3D모델 관리", "표준배치 관리"],
        },
      },
    ],
  },
  {
    path: "/machine",
    name: "MachineList",
    component: MachineList,
    meta: {
      requiresAuth: true,
      title: "기기리스트 관리",
      icon: "machine",
    },
  },
  {
    path: "/user",
    name: "UserManagement",
    component: UserManagement,
    meta: {
      requiresAuth: true,
      title: "사용자 관리",
      icon: "user",
    },
  },
  {
    path: "/code",
    name: "CodeManagement",
    component: CodeManagement,
    meta: {
      requiresAuth: true,
      title: "코드 관리",
      icon: "code",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/error/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 네비게이션 가드
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isLoggedIn;
  const userId = authStore.user?.user_id;
  const userName = authStore.user?.name;
  const userRole = authStore.user?.role || null;

  const requiresAuth = to.meta.requiresAuth ?? true;
  const requiresAdmin = to.meta.roles || null;

  console.log(
    "[router/index.ts] isLoggedIn: ",
    isLoggedIn,
    ", userId: ",
    userId,
    ", userName: ",
    userName,
    ", userRole: ",
    userRole,
    ", requiresAuth: ",
    requiresAuth,
    ", requiresAdmin: ",
    requiresAdmin
  );

  // const authStore = useAuthStore();
  // const isLoggedIn = authStore.isLoggedIn;
  // const userRole = authStore.user?.role || null;

  // const requiresAuth = to.meta.requiresAuth as boolean | undefined;
  // const requiresAdmin = to.meta.requiresAdmin as boolean | undefined;

  // ✅ 인증 필요하지만 로그인 안 한 경우 → 로그인 페이지로
  if (requiresAuth && !isLoggedIn) {
    console.log("인증 필요하지만 로그인 안 한 경우 → 로그인 페이지로 >> ");
    return next("/login");
  }

  // ✅ 관리자 권한 필요하지만 일반 사용자일 경우 → 홈으로 리디렉션
  if (requiresAdmin && userRole !== "admin") {
    console.log(
      "관리자 권한 필요하지만 일반 사용자일 경우 → 홈으로 리디렉션 >> "
    );
    return next("/dashboard");
  }

  // ✅ 문제 없으면 통과
  next();

  // const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  // if (to.meta.requiresAuth && !isAuthenticated) {
  //   next('/login')
  // } else if (to.name === 'Login' && isAuthenticated) {
  //   next('/dashboard')
  // } else {
  //   next()
  // }
});

// 페이지 타이틀 설정
router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - WAI DESIGN`;
  } else {
    document.title = "WAI DESIGN";
  }
});

export default router;
