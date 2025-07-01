import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 페이지 컴포넌트들을 lazy loading으로 import
const Dashboard = () => import('@/views/Dashboard.vue')
const ProjectManagement = () => import('@/views/ProjectManagement.vue')
const AssetManagement = () => import('@/views/AssetManagement.vue')
const PublicManagement = () => import('@/views/PublicManagement.vue')
const ModelManagement = () => import('@/views/ModelManagement.vue')
const MachineList = () => import('@/views/MachineList.vue')
const UserManagement = () => import('@/views/UserManagement.vue')
const Login = () => import('@/views/Login.vue')

// 3D 모델 관리 하위 페이지들
const Model3D = () => import('@/views/model/Model3D.vue')
const RevitManagement = () => import('@/views/model/RevitManagement.vue')
const StandardManagement = () => import('@/views/model/StandardManagement.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false,
      layout: 'blank'
    }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,
      title: '대시보드',
      icon: 'dashboard'
    }
  },
  {
    path: '/project',
    name: 'ProjectManagement',
    component: ProjectManagement,
    meta: {
      requiresAuth: true,
      title: '프로젝트 관리',
      icon: 'project'
    }
  },
  {
    path: '/asset',
    name: 'AssetManagement',
    component: AssetManagement,
    meta: {
      requiresAuth: true,
      title: '유일충류 관리',
      icon: 'asset'
    }
  },
  {
    path: '/public',
    name: 'PublicManagement',
    component: PublicManagement,
    meta: {
      requiresAuth: true,
      title: '공장 관리',
      icon: 'public'
    }
  },
  {
    path: '/model',
    name: 'ModelManagement',
    component: ModelManagement,
    redirect: '/model/3d',
    meta: {
      requiresAuth: true,
      title: '3D모델 관리',
      icon: 'model'
    },
    children: [
      {
        path: '3d',
        name: 'Model3D',
        component: Model3D,
        meta: {
          title: '3D 모델 관리',
          breadcrumb: ['3D모델 관리', '3D 모델 관리']
        }
      },
      {
        path: 'revit',
        name: 'RevitManagement',
        component: RevitManagement,
        meta: {
          title: 'Revit 관리',
          breadcrumb: ['3D모델 관리', 'Revit 관리']
        }
      },
      {
        path: 'standard',
        name: 'StandardManagement',
        component: StandardManagement,
        meta: {
          title: '표준배치 관리',
          breadcrumb: ['3D모델 관리', '표준배치 관리']
        }
      }
    ]
  },
  {
    path: '/machine',
    name: 'MachineList',
    component: MachineList,
    meta: {
      requiresAuth: true,
      title: '기기리스트 관리',
      icon: 'machine'
    }
  },
  {
    path: '/user',
    name: 'UserManagement',
    component: UserManagement,
    meta: {
      requiresAuth: true,
      title: '사용자 관리',
      icon: 'user'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 네비게이션 가드
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.name === 'Login' && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

// 페이지 타이틀 설정
router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - WAI DESIGN`
  } else {
    document.title = 'WAI DESIGN'
  }
})

export default router
