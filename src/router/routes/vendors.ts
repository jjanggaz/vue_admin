// 공급업체 관리 페이지
const VendorsManagement = () => import("@/views/vendors/VendorsManagement.vue");
const Vendors = () => import("@/views/vendors/Vendors.vue");

export const vendorsRoute = {
  path: "/vendors",
  name: "VendorsManagement",
  component: VendorsManagement,
  redirect: "/vendors/list",
  meta: {
    requiresAuth: true,
    titleKey: "pageTitles.vendorsManagement",
    icon: "vendors",
  },
  children: [
    {
      path: "list",
      name: "VendorsList",
      component: Vendors,
      meta: {
        titleKey: "pageTitles.vendorsManagement",
        breadcrumbKeys: ["pageTitles.vendorsManagement"],
      },
    },
  ],
};

