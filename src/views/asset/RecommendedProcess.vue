<template>
  <div class="recommended-process">
    <div class="page-content">
      <div class="action-bar">
        <dl class="column-search">
          <dd>
           <select name="" id=""></select>
           <input type="text">
           <div class="group-form">
            <input type="text">
            <button class="btn btn-search">검색</button>
           </div>
          </dd>
        </dl>
      </div>

      <DataTable :columns="gridColumns" :data="paginatedData" />
      <Pagination
        :current-page="currentPage"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        @page-changed="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";

interface RecommendedProcessRow {
  id: number;
  inflowType: string;
  applicationField: string;
  solution: string;
  layout3d: string;
  remarks: string;
}

const gridColumns: TableColumn[] = [
  { key: "id", title: "순번", width: "80px" },
  { key: "inflowType", title: "유입종류" },
  { key: "applicationField", title: "적용분야" },
  { key: "solution", title: "솔루션" },
  { key: "layout3d", title: "3D 표준 배치도" },
  { key: "remarks", title: "비고" },
];

const gridData = ref<RecommendedProcessRow[]>([
  { id: 1, inflowType: "생활하수", applicationField: "소규모 마을", solution: "MBR", layout3d: "Standard-A", remarks: "" },
  { id: 2, inflowType: "산업폐수", applicationField: "식품 공장", solution: "A2O + MBR", layout3d: "Standard-B", remarks: "고농도 유기물" },
  { id: 3, inflowType: "축산분뇨", applicationField: "양돈 농가", solution: "혐기소화 + SBR", layout3d: "Standard-C", remarks: "" },
  { id: 4, inflowType: "생활하수", applicationField: "아파트 단지", solution: "MBR", layout3d: "Standard-A", remarks: "" },
  { id: 5, inflowType: "산업폐수", applicationField: "반도체 공장", solution: "고도산화처리", layout3d: "Custom-A", remarks: "난분해성 물질" },
  { id: 6, inflowType: "생활하수", applicationField: "리조트", solution: "SBR", layout3d: "Standard-D", remarks: "계절적 변동" },
  { id: 7, inflowType: "산업폐수", applicationField: "제지 공장", solution: "DAF + 활성슬러지", layout3d: "Standard-E", remarks: "" },
  { id: 8, inflowType: "축산분뇨", applicationField: "양계 농가", solution: "혐기소화", layout3d: "Standard-C", remarks: "" },
  { id: 9, inflowType: "생활하수", applicationField: "관광단지", solution: "MBR", layout3d: "Standard-A", remarks: "" },
  { id: 10, inflowType: "산업폐수", applicationField: "화학 공장", solution: "Fenton + MBR", layout3d: "Custom-B", remarks: "독성 물질 포함" },
  { id: 11, inflowType: "생활하수", applicationField: "소규모 마을", solution: "SBR", layout3d: "Standard-D", remarks: "" },
  { id: 12, inflowType: "축산분뇨", applicationField: "낙농 농가", solution: "혐기소화 + MBR", layout3d: "Standard-C", remarks: "" },
]);

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = computed(() => gridData.value.length);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return gridData.value.slice(start, end);
});

const handlePageChange = (page: number) => {
  currentPage.value = page;
};
</script>

<style scoped lang="scss">
.recommended-process {
  padding: $spacing-xl;

  .page-content {
    h2 {
      margin-bottom: $spacing-lg;
      color: $text-color;
    }

    p {
      color: $text-light;
    }
  }
}
</style>
