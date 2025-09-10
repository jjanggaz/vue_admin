// 기계 관리 페이지
const MachineManagement = () => import("@/views/machine/MachineManagement.vue");
const Machine = () => import("@/views/machine/Machine.vue");
const MachineCodeManagement = () =>
  import("@/views/machine/MachineCodeManagement.vue");

export const machineRoute = {
  path: "/machine",
  name: "MachineManagement",
  component: MachineManagement,
  redirect: "/machine/machine",
  meta: {
    requiresAuth: true,
    titleKey: "pageTitles.machineManagement",
    icon: "machine",
  },
  children: [
    {
      path: "machine",
      name: "Machine",
      component: Machine,
      meta: {
        titleKey: "tabs.machine.machine",
        breadcrumbKeys: [
          "pageTitles.machineManagement",
          "tabs.machine.machine",
        ],
      },
    },
    {
      path: "codeMng",
      name: "MachineCodeManagement",
      component: MachineCodeManagement,
      meta: {
        titleKey: "tabs.machine.machineCodeManagement",
        breadcrumbKeys: [
          "pageTitles.machineManagement",
          "tabs.machine.machineCodeManagement",
        ],
      },
    },
  ],
};
