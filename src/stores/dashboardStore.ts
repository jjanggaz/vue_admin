import { defineStore } from "pinia";
import { ref } from "vue";
import { request } from "@/utils/request";

export interface ServerStatus {
  capacity: {
    total: number;
    used: number;
    free: number;
  };
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  ram: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  system: {
    uptime: number;
    loadAverage: number[];
    osInfo: string;
  };
}

export interface DashboardData {
  data: {
    serverStatus: ServerStatus;
    projectStats: {
      total: number;
      inProgress: number;
      completed: number;
    };
    modelStats: {
      total: number;
      pending: number;
      approved: number;
    };
    approvalStats: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
  };
}

export const useDashboardStore = defineStore("dashboard", () => {
  const serverStatus = ref<ServerStatus | null>(null);
  const dashboardData = ref<DashboardData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // 대시보드 데이터 가져오기
  const fetchDashboardData = async () => {
    try {
      loading.value = true;
      error.value = null;

      const response = await request("/api/dashboard/server", {
        method: "GET",
      });

      if (response.success) {
        dashboardData.value = response.response;
        serverStatus.value = response.response.data.serverStatus;
      } else {
        error.value =
          response.message || "대시보드 데이터를 가져오는데 실패했습니다.";
      }
    } catch (err) {
      error.value = "대시보드 데이터를 가져오는 중 오류가 발생했습니다.";
      console.error("Dashboard store error:", err);
    } finally {
      loading.value = false;
    }
  };

  // 서버 상태 정보 초기화
  const resetServerStatus = () => {
    serverStatus.value = null;
  };

  // 전체 데이터 초기화
  const resetDashboardData = () => {
    dashboardData.value = null;
    serverStatus.value = null;
  };

  return {
    // State
    serverStatus,
    dashboardData,
    loading,
    error,

    // Actions
    fetchDashboardData,
    resetServerStatus,
    resetDashboardData,
  };
});
