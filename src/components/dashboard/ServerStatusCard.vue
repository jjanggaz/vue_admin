<template>
  <div class="dashboard-card server-status-card">
    <div class="card-header">
      <h3>{{ t("dashboard.serverStatus.title") }}</h3>
      <div
        class="status-indicator"
        :class="{ online: isOnline, offline: !isOnline }"
      >
        <span class="status-dot"></span>
        <span class="status-text">{{
          isOnline
            ? t("dashboard.serverStatus.online")
            : t("dashboard.serverStatus.offline")
        }}</span>
      </div>
    </div>

    <div class="server-metrics">
      <!-- 용량 상태 (Doughnut Chart) -->
      <div class="metric-item capacity-metric">
        <div class="metric-header">
          <i class="fas fa-hdd"></i>
          <span class="metric-title">{{
            t("dashboard.serverStatus.capacity")
          }}</span>
        </div>
        <div class="chart-container">
          <canvas ref="capacityChart" width="160" height="140"></canvas>
        </div>
        <div class="metric-details">
          <span
            >사용: {{ formatBytes(serverStatus?.capacity?.used || 0) }}</span
          >
          <span
            >여유: {{ formatBytes(serverStatus?.capacity?.free || 0) }}</span
          >
        </div>
      </div>

      <!-- CPU 상태 (Gauge Chart) -->
      <div class="metric-item cpu-metric">
        <div class="metric-header">
          <i class="fas fa-microchip"></i>
          <span class="metric-title">{{
            t("dashboard.serverStatus.cpu")
          }}</span>
        </div>
        <div class="chart-container">
          <canvas ref="cpuChart" width="140" height="160"></canvas>
        </div>
        <div class="metric-details">
          <span
            >{{ t("dashboard.serverStatus.cores") }}:
            {{ serverStatus?.cpu?.cores || 0 }}</span
          >
          <span
            >{{ t("dashboard.serverStatus.temp") }}:
            {{ serverStatus?.cpu?.temperature || 0 }}°C</span
          >
        </div>
      </div>

      <!-- RAM 상태 (Gauge Chart) -->
      <div class="metric-item ram-metric">
        <div class="metric-header">
          <i class="fas fa-memory"></i>
          <span class="metric-title">{{
            t("dashboard.serverStatus.ram")
          }}</span>
        </div>
        <div class="chart-container">
          <canvas ref="ramChart" width="140" height="160"></canvas>
        </div>
        <div class="metric-details">
          <span>사용: {{ formatBytes(serverStatus?.ram?.used || 0) }}</span>
          <span>여유: {{ formatBytes(serverStatus?.ram?.free || 0) }}</span>
        </div>
      </div>

      <!-- 시스템 정보 (Line Chart) -->
      <div class="metric-item system-metric">
        <div class="metric-header">
          <i class="fas fa-server"></i>
          <span class="metric-title">{{
            t("dashboard.serverStatus.system")
          }}</span>
        </div>
        <div class="chart-container">
          <canvas ref="systemChart" width="160" height="120"></canvas>
        </div>
        <div class="metric-details">
          <span
            >{{ t("dashboard.serverStatus.uptime") }}:
            {{ formatUptime(serverStatus?.system?.uptime || 0) }}</span
          >
          <span
            >{{ t("dashboard.serverStatus.load") }}:
            {{
              formatLoadAverage(serverStatus?.system?.loadAverage || [0, 0, 0])
            }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { ServerStatus } from "@/stores/dashboardStore";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const { t } = useI18n();

interface Props {
  serverStatus?: ServerStatus | null;
}

const props = withDefaults(defineProps<Props>(), {
  serverStatus: null,
});

// 차트 refs
const capacityChart = ref<HTMLCanvasElement>();
const cpuChart = ref<HTMLCanvasElement>();
const ramChart = ref<HTMLCanvasElement>();
const systemChart = ref<HTMLCanvasElement>();

// 서버 온라인 상태 확인 (uptime이 있으면 온라인으로 간주)
const isOnline = computed(() => {
  return (
    props.serverStatus?.system?.uptime && props.serverStatus.system.uptime > 0
  );
});

// 바이트 단위 포맷팅
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// 업타임 포맷팅
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// 로드 평균 포맷팅
const formatLoadAverage = (loads: number[]): string => {
  if (loads.length === 0) return "0.00";
  return loads.map((load) => load.toFixed(2)).join(", ");
};

// 용량 차트 생성
const createCapacityChart = () => {
  if (!capacityChart.value || !props.serverStatus) return;

  const ctx = capacityChart.value.getContext("2d");
  if (!ctx) return;

  const used = props.serverStatus.capacity.used;
  const free = props.serverStatus.capacity.free;
  const total = props.serverStatus.capacity.total;

  new ChartJS(ctx, {
    type: "doughnut",
    data: {
      labels: ["사용", "여유"],
      datasets: [
        {
          data: [used, free],
          backgroundColor: ["#ef4444", "#10b981"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 10 },
            usePointStyle: true,
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${formatBytes(value)} (${percentage}%)`;
            },
          },
        },
      },
      cutout: "65%",
    },
  });
};

// CPU 게이지 차트 생성
const createCpuChart = () => {
  if (!cpuChart.value || !props.serverStatus) return;

  const ctx = cpuChart.value.getContext("2d");
  if (!ctx) return;

  const usage = props.serverStatus.cpu.usage;

  new ChartJS(ctx, {
    type: "doughnut",
    data: {
      labels: ["사용률", "여유"],
      datasets: [
        {
          data: [usage, 100 - usage],
          backgroundColor: ["#ef4444", "#e5e7eb"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (context.dataIndex === 0) {
                return `CPU 사용률: ${usage}%`;
              }
              return "";
            },
          },
        },
      },
      cutout: "70%",
    },
  });
};

// RAM 게이지 차트 생성
const createRamChart = () => {
  if (!ramChart.value || !props.serverStatus) return;

  const ctx = ramChart.value.getContext("2d");
  if (!ctx) return;

  const usage = props.serverStatus.ram.usage;

  new ChartJS(ctx, {
    type: "doughnut",
    data: {
      labels: ["사용률", "여유"],
      datasets: [
        {
          data: [usage, 100 - usage],
          backgroundColor: ["#f59e0b", "#e5e7eb"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              if (context.dataIndex === 0) {
                return `RAM 사용률: ${usage}%`;
              }
              return "";
            },
          },
        },
      },
      cutout: "70%",
    },
  });
};

// 시스템 로드 차트 생성
const createSystemChart = () => {
  if (!systemChart.value || !props.serverStatus) return;

  const ctx = systemChart.value.getContext("2d");
  if (!ctx) return;

  const loadAverage = props.serverStatus.system.loadAverage;
  const labels = ["1분", "5분", "15분"];

  new ChartJS(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "로드 평균",
          data: loadAverage.map((load) => Math.max(0, load)), // 음수 값은 0으로 처리
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const load = loadAverage[context.dataIndex];
              return `로드 평균: ${load.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: Math.max(...loadAverage.map((load) => Math.max(0, load))) * 1.2,
          ticks: {
            stepSize: 0.5,
          },
        },
      },
    },
  });
};

// 차트들 생성
const createCharts = () => {
  createCapacityChart();
  createCpuChart();
  createRamChart();
  createSystemChart();
};

// serverStatus가 변경될 때마다 차트 업데이트
watch(() => props.serverStatus, createCharts, { deep: true });

onMounted(() => {
  if (props.serverStatus) {
    createCharts();
  }
});
</script>

<style scoped lang="scss">
.server-status-card {
  min-height: 800px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;

      &.online {
        background-color: #dcfce7;
        color: #166534;
      }

      &.offline {
        background-color: #fee2e2;
        color: #991b1b;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: currentColor;
      }
    }
  }

  .server-metrics {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .metric-item {
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background-color: #f9fafb;
      text-align: center;
      min-height: 280px;

      .metric-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 12px;

        i {
          color: #6b7280;
          font-size: 14px;
        }

        .metric-title {
          font-weight: 600;
          color: #374151;
          font-size: 13px;
        }
      }

      .chart-container {
        height: 160px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        canvas {
          max-width: 100%;
          height: auto;
        }
      }

      .metric-details {
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-size: 11px;
        color: #6b7280;
      }

      &.capacity-metric {
        grid-column: span 2;
        min-height: 240px;

        .chart-container {
          height: 140px;
        }
      }

      &.cpu-metric,
      &.ram-metric {
        grid-column: span 1;
      }

      &.system-metric {
        grid-column: span 2;
        min-height: 200px;

        .chart-container {
          height: 120px;
        }
      }
    }
  }
}

// 반응형 디자인
@media (max-width: 768px) {
  .server-status-card {
    .server-metrics {
      grid-template-columns: 1fr;

      .metric-item {
        &.capacity-metric,
        &.system-metric {
          grid-column: span 1;
        }
      }
    }
  }
}
</style>
