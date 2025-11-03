import { defineStore } from "pinia";
import { ref } from "vue";

export const useLoadingStore = defineStore("loading", () => {
  const isLoading = ref(false);
  const loadingCount = ref(0);

  const setLoading = (value: boolean) => {
    if (value) {
      loadingCount.value++;
      isLoading.value = true;
    } else {
      loadingCount.value = Math.max(0, loadingCount.value - 1);
      if (loadingCount.value === 0) {
        isLoading.value = false;
      }
    }
  };

  const resetLoading = () => {
    loadingCount.value = 0;
    isLoading.value = false;
  };

  return {
    isLoading,
    loadingCount,
    setLoading,
    resetLoading,
  };
});
