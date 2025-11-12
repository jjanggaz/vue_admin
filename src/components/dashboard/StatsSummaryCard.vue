<template>
  <div class="dashboard-card stats-summary-card">
    <div class="card-content">
      <div class="card-top">
        <h3 class="card-title">{{ title }}</h3>
        <div class="card-icon" :class="iconClass">
          <i :class="icon"></i>
        </div>
      </div>
      <div class="card-bottom">
        <div class="card-value">{{ value }}</div>
        <div class="card-change" :class="changeType">
          <i :class="changeIcon"></i>
          <span>{{ changeValue }}</span>
          <span class="change-label">{{ changeLabel }}</span>
        </div>
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
  padding: 24px;

  .card-content {
    flex: 1;

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 20px;
        color: #197FC5;
        font-weight: 500;
      }

      .card-icon {
        width: 21px;
        height: 19px;

        // &.icon-increase {
        //   background: linear-gradient(135deg, #10b981, #059669);
        // }

        // &.icon-decrease {
        //   background: linear-gradient(135deg, #ef4444, #dc2626);
        // }

        // &.icon-neutral {
        //   background: linear-gradient(135deg, #6b7280, #4b5563);
        // }
      }
    }

    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-value {
        font-size: 36px;
        font-weight: 600;
        color: #1f2937;
      }

      .card-change {
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
          margin-left: 10px;
          font-size: 14px;
          color: #82869d;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
