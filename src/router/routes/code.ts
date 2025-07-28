// 코드 관리 페이지
const CodeManagement = () => import("@/views/code/CodeManagement.vue");

export const codeRoute = {
  path: "/code",
  name: "CodeManagement",
  component: CodeManagement,
  meta: {
    requiresAuth: true,
    titleKey: "pageTitles.codeManagement",
    icon: "code",
  },
};
