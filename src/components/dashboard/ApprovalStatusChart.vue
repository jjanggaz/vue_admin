<template>
  <div class="dashboard-card approval-status-card">
    <div class="card-header">
      <h3>{{ t("dashboard.approvalStatus.title") }}</h3>
      <div class="approval-summary">
        <div class="summary-item">
          <span class="value">{{ totalApprovals }}</span>
          <span class="label">{{ t("dashboard.approvalStatus.total") }}</span>
        </div>
        <div class="summary-item">
          <span class="value">{{ thisMonthApprovals }}</span>
          <span class="label">{{
            t("dashboard.approvalStatus.thisMonth")
          }}</span>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
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
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const { t } = useI18n();

interface Props {
  monthlyData?: Array<{
    month: string;
    projectApproval: number;
    processApproval: number;
    modelApproval: number;
  }>;
}

const props = withDefaults(defineProps<Props>(), {
  monthlyData: () => [
    {
      month: "1월",
      projectApproval: 8,
      processApproval: 12,
      modelApproval: 15,
    },
    {
      month: "2월",
      projectApproval: 10,
      processApproval: 14,
      modelApproval: 18,
    },
    {
      month: "3월",
      projectApproval: 12,
      processApproval: 16,
      modelApproval: 20,
    },
    {
      month: "4월",
      projectApproval: 9,
      processApproval: 13,
      modelApproval: 17,
    },
    {
      month: "5월",
      projectApproval: 11,
      processApproval: 15,
      modelApproval: 19,
    },
    {
      month: "6월",
      projectApproval: 13,
      processApproval: 17,
      modelApproval: 22,
    },
  ],
});

const totalApprovals = computed(() =>
  props.monthlyData.reduce(
    (sum, month) =>
      sum + month.projectApproval + month.processApproval + month.modelApproval,
    0
  )
);

const thisMonthApprovals = computed(() => {
  const lastMonth = props.monthlyData[props.monthlyData.length - 1];
  return lastMonth
    ? lastMonth.projectApproval +
        lastMonth.processApproval +
        lastMonth.modelApproval
    : 0;
});

const chartData = computed(() => ({
  labels: props.monthlyData.map((item) => item.month),
  datasets: [
    {
      label: t("dashboard.approvalStatus.projectApproval"),
      data: props.monthlyData.map((item) => item.projectApproval),
      backgroundColor: "#93c5fd",
      borderColor: "#3b82f6",
      borderWidth: 1,
    },
    {
      label: t("dashboard.approvalStatus.processApproval"),
      data: props.monthlyData.map((item) => item.processApproval),
      backgroundColor: "#86efac",
      borderColor: "#10b981",
      borderWidth: 1,
    },
    {
      label: t("dashboard.approvalStatus.modelApproval"),
      data: props.monthlyData.map((item) => item.modelApproval),
      backgroundColor: "#fed7aa",
      borderColor: "#f59e0b",
      borderWidth: 1,
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
    x: {
      stacked: true,
      grid: {
        display: false,
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
      ticks: {
        stepSize: 10,
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
.approval-status-card {
  min-height: 400px;

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

    .approval-summary {
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
