// 공정 관리 페이지
const ProcessManagement = () => import("@/views/process/ProcessManagement.vue");
const Process = () => import("@/views/process/Process.vue");
const Output = () => import("@/views/process/Output.vue");
const ProcessDetail = () => import("@/views/process/ProcessDetail.vue");

export const processRoute = {
  path: "/process",
  name: "ProcessManagement",
  component: ProcessManagement,
  redirect: "/process/process",
  meta: {
    requiresAuth: true,
    titleKey: "pageTitles.processManagement",
    icon: "process",
  },
  children: [
    {
      path: "process",
      name: "Process",
      component: Process,
      meta: {
        titleKey: "tabs.process.process",
        breadcrumbKeys: [
          "pageTitles.processManagement",
          "tabs.process.process",
        ],
      },
    },
    {
      path: "output",
      name: "Output",
      component: Output,
      meta: {
        titleKey: "tabs.process.output",
        breadcrumbKeys: ["pageTitles.processManagement", "tabs.process.output"],
      },
    },
    {
      path: "detail/:id",
      name: "ProcessDetail",
      component: ProcessDetail,
      props: (route: any) => ({
        id: route.params.id,
        process_type: route.query.process_type,
        sub_category: route.query.sub_category,
        process_code: route.query.process_code,
      }),
      meta: {
        titleKey: "processDetail.processName",
        breadcrumbKeys: [
          "pageTitles.processManagement",
          "processDetail.processName",
        ],
      },
    },
  ],
};
