<template>
  <div class="dashboard">
    <p>{{ $t("dashboard.title") }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
// 대시보드 로직
</script>

<style scoped lang="scss">
.dashboard {
  padding: $spacing-lg;
}
</style>
