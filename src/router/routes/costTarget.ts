import type { RouteRecordRaw } from "vue-router";

// CostTarget 페이지
const CostTarget = () => import("@/views/costTarget/CostTarget.vue");

export const costTargetRoute: RouteRecordRaw = {
  path: "/costTarget",
  name: "CostTarget",
  component: CostTarget,
  meta: {
    requiresAuth: true,
    titleKey: "pageTitles.costTarget",
    icon: "costTarget",
  },
};
