import type { RouteRecordRaw } from "vue-router";

// CostManagement 페이지
// const CostManagement = () => import("@/views/cost/CostManagement.vue");
const CostManagement = () => import("@/views/404.vue");

export const costRoute: RouteRecordRaw = {
  path: "/cost",
  name: "CostManagement",
  component: CostManagement,
  meta: {
    requiresAuth: true,
    titleKey: "pageTitles.cost",
    icon: "cost",
  },
};
