// 프로젝트 관리 페이지
const ProjectManagement = () => import("@/views/project/ProjectManagement.vue");
const Project = () => import("@/views/project/Project.vue");
const ApprovalPending = () => import("@/views/project/ApprovalPending.vue");
const RecommendedProject = () =>
  import("@/views/project/RecommendedProject.vue");

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
      path: "approvalPending",
      name: "ApprovalPending",
      component: ApprovalPending,
      meta: {
        titleKey: "tabs.project.approvalPending",
        breadcrumbKeys: [
          "pageTitles.projectManagement",
          "tabs.project.approvalPending",
        ],
      },
    },
    {
      path: "recommendedProject",
      name: "RecommendedProject",
      component: RecommendedProject,
      meta: {
        titleKey: "tabs.project.recommendedProject",
        breadcrumbKeys: [
          "pageTitles.projectManagement",
          "tabs.project.recommendedProject",
        ],
      },
    },
  ],
};
