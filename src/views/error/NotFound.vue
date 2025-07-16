<template>
  <div class="not-found">
    <h1>404</h1>
    <p>{{ $t("error.notFound") }}</p>
    <router-link to="/dashboard" class="btn btn-primary">
      {{ $t("error.goDashboard") }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped lang="scss">
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;

  h1 {
    font-size: 4rem;
    color: $primary-color;
    margin-bottom: $spacing-lg;
  }

  p {
    color: $text-light;
    margin-bottom: $spacing-xl;
  }
}
</style>
