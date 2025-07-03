<template>
  <div class="not-found">
    <h1>404</h1>
    <p>페이지를 찾을 수 없습니다.</p>
    <router-link to="/dashboard" class="btn btn-primary">
      대시보드로 돌아가기
    </router-link>
  </div>
</template>

<script setup lang="ts">
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
