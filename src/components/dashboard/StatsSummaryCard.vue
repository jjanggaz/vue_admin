<template>
  <div class="dashboard-card stats-summary-card">
    <div class="card-icon" :class="iconClass">
      <i :class="icon"></i>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <div class="card-value">{{ value }}</div>
      <div class="card-change" :class="changeType">
        <i :class="changeIcon"></i>
        <span>{{ changeValue }}</span>
        <span class="change-label">{{ changeLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  title: string;
  value: string | number;
  changeValue: string;
  changeType: "increase" | "decrease" | "neutral";
  icon: string;
}

const props = defineProps<Props>();

const iconClass = computed(() => `icon-${props.changeType}`);
const changeIcon = computed(() => {
  switch (props.changeType) {
    case "increase":
      return "fas fa-arrow-up";
    case "decrease":
      return "fas fa-arrow-down";
    default:
      return "fas fa-minus";
  }
});

const changeLabel = computed(() => {
  switch (props.changeType) {
    case "increase":
      return "증가";
    case "decrease":
      return "감소";
    default:
      return "변동없음";
  }
});
</script>

<style scoped lang="scss">
.stats-summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;

  .card-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;

    &.icon-increase {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    &.icon-decrease {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    &.icon-neutral {
      background: linear-gradient(135deg, #6b7280, #4b5563);
    }
  }

  .card-content {
    flex: 1;

    .card-title {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }

    .card-value {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .card-change {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;

      &.increase {
        color: #10b981;
      }

      &.decrease {
        color: #ef4444;
      }

      &.neutral {
        color: #6b7280;
      }

      .change-label {
        color: #9ca3af;
        font-weight: 400;
      }
    }
  }
}
</style>
