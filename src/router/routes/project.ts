// 프로젝트 관리 페이지
const ProjectManagement = () => import("@/views/project/ProjectManagement.vue");
const Project = () => import("@/views/project/Project.vue");
const ProjectApp = () => import("@/views/project/ProjectApp.vue");
const ProjectItem = () => import("@/views/project/ProjectItem.vue");
const ProjectDetail = () => import("@/views/project/ProjectDetail.vue");

export const projectRoute = {
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
        breadcrumbKeys: ["pageTitles.projectManagement", "projectDetail.title"],
      },
    },
  ],
};
