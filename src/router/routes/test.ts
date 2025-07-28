// 테스트 페이지
const Test = () => import("@/views/test/Test.vue");

export const testRoute = {
  path: "/test",
  name: "Test",
  component: Test,
  meta: {
    requiresAuth: true,
    titleKey: "pageTitles.test",
    icon: "test",
  },
};
