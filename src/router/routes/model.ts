// 3D 모델 관리 페이지
const ModelManagement = () => import("@/views/model/ModelManagement.vue");
const Revit = () => import("@/views/model/Revit.vue");
const Standard = () => import("@/views/model/Standard.vue");
const Asset3D = () => import("@/views/model/Asset3D.vue");

export const modelRoute = {
  path: "/model",
  name: "ModelManagement",
  component: ModelManagement,
  redirect: "/model/revit",
  meta: {
    requiresAuth: true,
    titleKey: "pageTitles.modelManagement",
    icon: "model",
  },
  children: [
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
        titleKey: "tabs.model.standardPlacement",
        breadcrumbKeys: [
          "pageTitles.modelManagement",
          "tabs.model.standardPlacement",
        ],
      },
    },
    {
      path: "3dAsset",
      name: "3D Asset",
      component: Asset3D,
      meta: {
        titleKey: "tabs.model.asset3d",
        breadcrumbKeys: ["pageTitles.modelManagement", "tabs.model.asset3d"],
      },
    },
  ],
};
