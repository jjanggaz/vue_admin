<template>
  <div class="dashboard-card project-status-card">
    <div class="card-header">
      <h3>{{ t("dashboard.projectStatus.title") }}</h3>
      <div class="status-summary">
        <div class="summary-item">
          <span class="value">{{ totalProjects }}</span>
          <span class="label">{{ t("dashboard.projectStatus.total") }}</span>
        </div>
        <div class="summary-item">
          <span class="value">{{ inProgressProjects }}</span>
          <span class="label">{{
            t("dashboard.projectStatus.inProgress")
          }}</span>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div class="chart-footer">
      <div class="footer-info">
        <span class="info-text"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const { t } = useI18n();

interface Props {
  monthlyData?: Array<{
    month: string;
    inProgress: number;
    completed: number;
  }>;
}

const props = withDefaults(defineProps<Props>(), {
  monthlyData: () => [
    { month: "1월", inProgress: 12, completed: 8 },
    { month: "2월", inProgress: 15, completed: 10 },
    { month: "3월", inProgress: 18, completed: 12 },
    { month: "4월", inProgress: 16, completed: 14 },
    { month: "5월", inProgress: 19, completed: 16 },
    { month: "6월", inProgress: 22, completed: 18 },
  ],
});

const totalProjects = computed(() =>
  Math.max(...props.monthlyData.map((item) => item.inProgress + item.completed))
);

const inProgressProjects = computed(
  () => props.monthlyData[props.monthlyData.length - 1]?.inProgress || 0
);

const chartData = computed(() => ({
  labels: props.monthlyData.map((item) => item.month),
  datasets: [
    {
      label: t("dashboard.projectStatus.inProgress"),
      data: props.monthlyData.map((item) => item.inProgress),
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#3b82f6",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
    },
    {
      label: t("dashboard.projectStatus.completed"),
      data: props.monthlyData.map((item) => item.completed),
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#10b981",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#ffffff",
      bodyColor: "#ffffff",
      borderColor: "#e5e7eb",
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
      ticks: {
        stepSize: 5,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  interaction: {
    mode: "nearest" as const,
    axis: "x" as const,
    intersect: false,
  },
};
</script>

<style scoped lang="scss">
.project-status-card {
  min-height: 400px;

  .card-header {
    align-items: flex-start;

    .status-summary {
      display: flex;
      gap: 20px;

      .summary-item {
        text-align: center;

        .value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        .label {
          font-size: 11px;
          color: #6b7280;
        }
      }
    }
  }

  .chart-container {
    height: 250px;
    min-height: 250px;
    margin-bottom: 20px;
  }

  .chart-footer {
    padding: 15px 0;

    .footer-info {
      text-align: center;

      .info-text {
        font-size: 12px;
        color: #6b7280;
        font-style: italic;
      }
    }
  }
}
</style>
