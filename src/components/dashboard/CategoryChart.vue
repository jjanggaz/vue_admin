<template>
  <div class="dashboard-card category-chart-card">
    <div class="card-header">
      <h3>{{ title }}</h3>
      <div class="total-summary">
        <span class="value">{{ totalCount }}</span>
        <span class="label">{{ totalLabel }}</span>
      </div>
    </div>

    <div class="chart-container">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>

    <div class="category-legend">
      <div
        v-for="category in categories"
        :key="category.name"
        class="legend-item"
      >
        <div
          class="color-indicator"
          :style="{ backgroundColor: category.color }"
        ></div>
        <span class="label">{{ category.name }}</span>
        <span class="count">{{ category.count }}</span>
        <span class="percentage">({{ category.percentage }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Category {
  name: string;
  key: string;
  count: number;
  color: string;
}

interface Props {
  title: string;
  totalLabel: string;
  categories: Category[];
}

const props = defineProps<Props>();

const totalCount = computed(() =>
  props.categories.reduce((sum, category) => sum + category.count, 0)
);

const chartData = computed(() => ({
  labels: props.categories.map((category) => category.name),
  datasets: [
    {
      data: props.categories.map((category) => category.count),
      backgroundColor: props.categories.map((category) => category.color),
      borderWidth: 0,
      cutout: "60%",
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.parsed;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0
          );
          const percentage = ((value / total) * 100).toFixed(1);
          return `${context.label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};
</script>

<style scoped lang="scss">
.category-chart-card {
  min-height: 300px;

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

    .total-summary {
      text-align: center;

      .value {
        display: block;
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
      }

      .label {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
      }
    }
  }

  .chart-container {
    height: 200px;
    margin-bottom: 15px;
  }

  .category-legend {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;

      .color-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .label {
        flex: 1;
        color: #374151;
      }

      .count {
        font-weight: 600;
        color: #1f2937;
        margin-right: 4px;
      }

      .percentage {
        color: #6b7280;
      }
    }
  }
}
</style>
