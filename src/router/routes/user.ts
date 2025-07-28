// 사용자 관리 페이지
const UserManagement = () => import("@/views/user/UserManagement.vue");
const AccountManagement = () => import("@/views/user/AccountManagement.vue");
const RoleManagement = () => import("@/views/user/RoleManagement.vue");
const MenuManagement = () => import("@/views/user/MenuManagement.vue");

export const userRoute = {
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
};
