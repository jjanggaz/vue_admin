// 자산 관리 페이지
const AssetManagement = () => import("@/views/asset/AssetManagement.vue");
const Inflow = () => import("@/views/asset/Inflow.vue");
const Outflow = () => import("@/views/asset/Outflow.vue");
const RecommendedProcess = () => import("@/views/asset/RecommendedProcess.vue");

export const assetRoute = {
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
};
