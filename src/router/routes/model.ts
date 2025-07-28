// 3D 모델 관리 페이지
const ModelManagement = () => import("@/views/model/ModelManagement.vue");
const Model3D = () => import("@/views/model/Model3D.vue");
const Revit = () => import("@/views/model/Revit.vue");
const Standard = () => import("@/views/model/Standard.vue");

export const modelRoute = {
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
};
