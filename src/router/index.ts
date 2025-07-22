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

// 프로젝트 관리 페이지
const ProjectManagement = () => import("@/views/project/ProjectManagement.vue");
const Project = () => import("@/views/project/Project.vue");
const ProjectApp = () => import("@/views/project/ProjectApp.vue");
const ProjectItem = () => import("@/views/project/ProjectItem.vue");
const ProjectDetail = () => import("@/views/project/ProjectDetail.vue");

// 자산 관리 페이지
const AssetManagement = () => import("@/views/asset/AssetManagement.vue");
const Inflow = () => import("@/views/asset/Inflow.vue");
const Outflow = () => import("@/views/asset/Outflow.vue");
const RecommendedProcess = () => import("@/views/asset/RecommendedProcess.vue");

// 공정 관리 페이지
const ProcessManagement = () => import("@/views/process/ProcessManagement.vue");
const Process = () => import("@/views/process/Process.vue");
const Output = () => import("@/views/process/Output.vue");
const ProcessDetail = () => import("@/views/process/ProcessDetail.vue");

// 3D 모델 관리 페이지
const ModelManagement = () => import("@/views/model/ModelManagement.vue");
const Model3D = () => import("@/views/model/Model3D.vue");
const Revit = () => import("@/views/model/Revit.vue");
const Standard = () => import("@/views/model/Standard.vue");

// 기계 관리 페이지
const MachineList = () => import("@/views/machine/MachineList.vue");
const Machine = () => import("@/views/machine/Machine.vue");
const MachineCodeManagement = () =>
  import("@/views/machine/MachineCodeManagement.vue");
const CostTarget = () => import("@/views/machine/CostTarget.vue");

// 사용자 관리 페이지
const UserManagement = () => import("@/views/user/UserManagement.vue");
const AccountManagement = () => import("@/views/user/AccountManagement.vue");
const RoleManagement = () => import("@/views/user/RoleManagement.vue");
const MenuManagement = () => import("@/views/user/MenuManagement.vue");

// 코드 관리 페이지
const CodeManagement = () => import("@/views/code/CodeManagement.vue");

// 테스트 페이지
const Test = () => import("@/views/test/Test.vue");

// 에러 페이지
const NotFound = () => import("@/views/error/NotFound.vue");

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
      titleKey: "pageTitles.dashboard",
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
      titleKey: "pageTitles.projectManagement",
      icon: "project",
    },
    children: [
      {
        path: "project",
        name: "Project",
        component: Project,
        meta: {
          titleKey: "tabs.project.project",
          breadcrumbKeys: [
            "pageTitles.projectManagement",
            "tabs.project.project",
          ],
        },
      },
      {
        path: "projectApp",
        name: "ProjectApp",
        component: ProjectApp,
        meta: {
          titleKey: "tabs.project.projectApp",
          breadcrumbKeys: [
            "pageTitles.projectManagement",
            "tabs.project.projectApp",
          ],
        },
      },
      {
        path: "projectItem",
        name: "ProjectItem",
        component: ProjectItem,
        meta: {
          titleKey: "tabs.project.projectItem",
          breadcrumbKeys: [
            "pageTitles.projectManagement",
            "tabs.project.projectItem",
          ],
        },
      },
      {
        path: "detail/:id",
        name: "ProjectDetail",
        component: ProjectDetail,
        meta: {
          titleKey: "projectDetail.title",
          breadcrumbKeys: [
            "pageTitles.projectManagement",
            "projectDetail.title",
          ],
        },
      },
    ],
  },
  {
    path: "/asset",
    name: "AssetManagement",
    component: AssetManagement,
    redirect: "/asset/inflow",
    meta: {
      requiresAuth: true,
      titleKey: "pageTitles.assetManagement",
      icon: "asset",
    },
    children: [
      {
        path: "inflow",
        name: "AssetInflow",
        component: Inflow,
        meta: {
          titleKey: "tabs.asset.inflow",
          breadcrumbKeys: ["pageTitles.assetManagement", "tabs.asset.inflow"],
        },
      },
      {
        path: "outflow",
        name: "AssetOutflow",
        component: Outflow,
        meta: {
          titleKey: "tabs.asset.outflow",
          breadcrumbKeys: ["pageTitles.assetManagement", "tabs.asset.outflow"],
        },
      },
      {
        path: "recommended",
        name: "AssetRecommended",
        component: RecommendedProcess,
        meta: {
          titleKey: "tabs.asset.recommendedProcess",
          breadcrumbKeys: [
            "pageTitles.assetManagement",
            "tabs.asset.recommendedProcess",
          ],
        },
      },
    ],
  },

  {
    path: "/process",
    name: "ProcessManagement",
    component: ProcessManagement,
    redirect: "/process/process",
    meta: {
      requiresAuth: true,
      titleKey: "pageTitles.processManagement",
      icon: "process",
    },
    children: [
      {
        path: "process",
        name: "Process",
        component: Process,
        meta: {
          titleKey: "tabs.process.process",
          breadcrumbKeys: [
            "pageTitles.processManagement",
            "tabs.process.process",
          ],
        },
      },
      {
        path: "output",
        name: "Output",
        component: Output,
        meta: {
          titleKey: "tabs.process.output",
          breadcrumbKeys: [
            "pageTitles.processManagement",
            "tabs.process.output",
          ],
        },
      },
      {
        path: "detail/:id",
        name: "ProcessDetail",
        component: ProcessDetail,
        meta: {
          titleKey: "processDetail.processName",
          breadcrumbKeys: [
            "pageTitles.processManagement",
            "processDetail.processName",
          ],
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
      titleKey: "pageTitles.modelManagement",
      icon: "model",
    },
    children: [
      {
        path: "3d",
        name: "Model3D",
        component: Model3D,
        meta: {
          titleKey: "tabs.model.model3d",
          breadcrumbKeys: ["pageTitles.modelManagement", "tabs.model.model3d"],
        },
      },
      {
        path: "revit",
        name: "Revit",
        component: Revit,
        meta: {
          titleKey: "tabs.model.revitManagement",
          breadcrumbKeys: [
            "pageTitles.modelManagement",
            "tabs.model.revitManagement",
          ],
        },
      },
      {
        path: "standard",
        name: "Standard",
        component: Standard,
        meta: {
          titleKey: "tabs.model.standardManagement",
          breadcrumbKeys: [
            "pageTitles.modelManagement",
            "tabs.model.standardManagement",
          ],
        },
      },
    ],
  },
  {
    path: "/machine",
    name: "MachineList",
    component: MachineList,
    redirect: "/machine/machine",
    meta: {
      requiresAuth: true,
      titleKey: "pageTitles.machineManagement",
      icon: "machine",
    },
    children: [
      {
        path: "machine",
        name: "Machine",
        component: Machine,
        meta: {
          titleKey: "tabs.machine.machine",
          breadcrumbKeys: [
            "pageTitles.machineManagement",
            "tabs.machine.machine",
          ],
        },
      },
      {
        path: "codeMng",
        name: "MachineCodeManagement",
        component: MachineCodeManagement,
        meta: {
          titleKey: "tabs.machine.machineCodeManagement",
          breadcrumbKeys: [
            "pageTitles.machineManagement",
            "tabs.machine.machineCodeManagement",
          ],
        },
      },
      {
        path: "costTarget",
        name: "CostTarget",
        component: CostTarget,
        meta: {
          titleKey: "tabs.machine.costTarget",
          breadcrumbKeys: [
            "pageTitles.machineManagement",
            "tabs.machine.costTarget",
          ],
        },
      },
    ],
  },
  {
    path: "/user",
    name: "UserManagement",
    component: UserManagement,
    redirect: "/user/account",
    meta: {
      requiresAuth: true,
      titleKey: "pageTitles.userManagement",
      icon: "user",
    },
    children: [
      {
        path: "account",
        name: "AccountManagement",
        component: AccountManagement,
        meta: {
          titleKey: "tabs.user.account",
        },
      },
      {
        path: "role",
        name: "RoleManagement",
        component: RoleManagement,
        meta: {
          titleKey: "tabs.user.role",
        },
      },
      {
        path: "menu",
        name: "MenuManagement",
        component: MenuManagement,
        meta: {
          titleKey: "tabs.user.menu",
        },
      },
    ],
  },
  {
    path: "/code",
    name: "CodeManagement",
    component: CodeManagement,
    meta: {
      requiresAuth: true,
      titleKey: "pageTitles.codeManagement",
      icon: "code",
    },
  },
  {
    path: "/test",
    name: "Test",
    component: Test,
    meta: {
      requiresAuth: true,
      titleKey: "pageTitles.test",
      icon: "test",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
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
  const userName = authStore.user?.username;
  const userRole = authStore.user?.role || null;

  const requiresAuth = to.meta.requiresAuth ?? true;
  const requiresAdmin = to.meta.roles || null;

  console.log(
    "[router/index.ts] isLoggedIn: ",
    isLoggedIn,
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

  // ✅ 이미 로그인된 사용자가 로그인 페이지 접근 시 → 대시보드로
  if (to.path === "/login" && isLoggedIn) {
    console.log("이미 로그인된 사용자가 로그인 페이지 접근 → 대시보드로 >> ");
    return next("/dashboard");
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
  const titleKey = to.meta.titleKey as string;
  if (titleKey) {
    const translatedTitle = i18n.global.t(titleKey);
    document.title = `${translatedTitle} - WAI DESIGN`;
  } else {
    document.title = i18n.global.t("pageTitles.default");
  }
});

export default router;
