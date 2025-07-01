<template>
  <div id="app">
    <AppLayout v-if="!isLoginPage">
      <router-view />
    </AppLayout>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'

const route = useRoute()

const isLoginPage = computed(() => {
  return route.meta.layout === 'blank' || route.name === 'Login'
})
</script>

<style>
#app {
  height: 100vh;
}
</style>
