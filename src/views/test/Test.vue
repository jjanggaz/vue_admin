<template>
  <div class="test-page">
    <div class="page-header">
      <h1>{{ t("pageTitles.test") }}</h1>
      <p>파일 첨부 기능 테스트 페이지</p>
    </div>

    <div class="content-wrapper">
      <FileUpload />
      <ExcelManagement />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import FileUpload from "./FileUpload.vue";
import ExcelManagement from "./ExcelManagement.vue";

const { t } = useI18n();
</script>

<style scoped lang="scss">
.test-page {
  padding: $spacing-xl;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: $spacing-xl;

  h1 {
    color: $text-color;
    margin-bottom: $spacing-sm;
  }

  p {
    color: $text-light;
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
}
</style>
