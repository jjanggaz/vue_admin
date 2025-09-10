// 기계 관리 페이지
const MachineManagement = () => import("@/views/machine/MachineManagement.vue");
const Structure = () => import("@/views/machine/structure.vue");
const Machine = () => import("@/views/machine/Machine.vue");
const Pipe = () => import("@/views/machine/pipe.vue");
const Electrical = () => import("@/views/machine/Electrical.vue");
const Measurement = () => import("@/views/machine/measurement.vue");
const MachineCodeManagement = () =>
  import("@/views/machine/MachineCodeManagement.vue");

export const machineRoute = {
  path: "/machine",
  name: "MachineManagement",
  component: MachineManagement,
  redirect: "/machine/structure",
  meta: {
    requiresAuth: true,
    titleKey: "pageTitles.machineManagement",
    icon: "machine",
  },
  children: [
    {
      path: "structure",
      name: "Structure",
      component: Structure,
      meta: {
        titleKey: "tabs.machine.structure",
        breadcrumbKeys: [
          "pageTitles.machineManagement",
          "tabs.machine.structure",
        ],
      },
    },
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
      path: "pipe",
      name: "Pipe",
      component: Pipe,
      meta: {
        titleKey: "tabs.machine.pipe",
        breadcrumbKeys: ["pageTitles.machineManagement", "tabs.machine.pipe"],
      },
    },
    {
      path: "electrical",
      name: "Electrical",
      component: Electrical,
      meta: {
        titleKey: "tabs.machine.electrical",
        breadcrumbKeys: [
          "pageTitles.machineManagement",
          "tabs.machine.electrical",
        ],
      },
    },
    {
      path: "measurement",
      name: "Measurement",
      component: Measurement,
      meta: {
        titleKey: "tabs.machine.measurement",
        breadcrumbKeys: [
          "pageTitles.machineManagement",
          "tabs.machine.measurement",
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
