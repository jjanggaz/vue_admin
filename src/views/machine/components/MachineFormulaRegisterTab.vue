<template>
  <div class="machine-formula-register-tab">
    <!-- 상단 필터: MachineRegisterTab와 동일한 스타일/구성 -->
    <div class="filter-bar">
      <div class="group-form inline">
        <span class="label">⊙ {{ t("common.language") }}</span>
        <select class="input select-sm">
          <option>ko</option>
          <option>en</option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ {{ t("common.unit") }}</span>
        <select class="input select-sm">
          <option>Metric</option>
          <option>Imperial</option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ 기계명 <span class="req">(＊)</span></span>
        <select class="input select-md">
          <option>전동식 밸브</option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ 기계종분류</span>
        <select class="input select-sm">
          <option>Turbo/수중</option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ 기계유형</span>
        <select class="input select-sm">
          <option>1상식</option>
        </select>
      </div>
      <div class="group-form inline">
        <span class="label">⊙ 기계유형분류</span>
        <select class="input select-sm">
          <option>---</option>
        </select>
      </div>
    </div>

    <!-- 계산식 버전 표 -->
    <DataTable
      :columns="versionColumns"
      :data="versionRows"
      :selectable="false"
    />

    <div class="actions">
      <button class="btn-primary">+ 계산식 추가</button>
    </div>

    <!-- 계산식 리스트 -->
    <div class="section-header">
      <div class="section-title">계산식 리스트</div>
      <div class="section-actions">
        <button class="btn-danger">{{ t("common.delete") }}</button>
      </div>
    </div>
    <DataTable
      :columns="listColumns"
      :data="listRows"
      :selectable="true"
      :selection-mode="'single'"
      :show-select-all="false"
      :select-header-text="t('common.selectColumn')"
      :selected-items="selectedItems"
      @selection-change="handleSelectionChange"
    />

    <div class="pagination-container">
      <Pagination :current-page="1" :total-pages="1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
const { t } = useI18n();

const versionColumns: TableColumn[] = [
  { key: "no", title: t("common.no"), width: "60px" },
  { key: "version", title: "계산식 버전", width: "200px" },
  { key: "createdAt", title: "생성일자", width: "160px" },
  { key: "applied", title: "적용버전", width: "120px" },
  { key: "remark", title: "비고", width: "160px" },
];
const versionRows = [
  {
    id: 1,
    no: 1,
    version: "○○○.PY",
    createdAt: "2025-01-01",
    applied: "○",
    remark: "*****",
  },
  {
    id: 2,
    no: 2,
    version: "v1.1.py",
    createdAt: "2025-01-10",
    applied: "",
    remark: "",
  },
];

const listColumns: TableColumn[] = [
  { key: "no", title: "No.", width: "80px" },
  { key: "name", title: "기계명", width: "180px" },
  { key: "type", title: "기계유형", width: "160px" },
  { key: "file", title: "계산식 (업로드 파일)", width: "280px" },
  { key: "remark", title: "비고", width: "160px" },
];
const listRows = [
  {
    id: 1,
    no: 1,
    name: "송풍기",
    type: "터보블로워",
    file: "upload.py",
    remark: "****",
  },
  {
    id: 2,
    no: 2,
    name: "송풍기2",
    type: "터보블로워",
    file: "-",
    remark: "****",
  },
];

// 선택 상태를 DataTable과 동기화 (Machine.vue의 사용 패턴 참고)
const selectedItems = ref<any[]>([]);
const handleSelectionChange = (items: any[]) => {
  selectedItems.value = items;
};
</script>

<style scoped lang="scss">
.filter-bar {
  display: grid;
  grid-template-columns: repeat(3, minmax(240px, 1fr));
  gap: 12px 16px;
  align-items: center;
  margin-bottom: 14px;
  background: #f7f9fc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}
.group-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.group-form.inline {
  flex-direction: row;
  align-items: center;
}
.label {
  font-size: 13px;
  color: #475467;
  min-width: 88px;
}
.req {
  color: #e74c3c;
}
.input {
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0 8px;
  background: #fff;
}
.select-sm {
  min-width: 120px;
}
.select-md {
  min-width: 220px;
}
.actions {
  display: flex;
  gap: 8px;
  margin: 8px 0 12px;
}
.btn-primary {
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
}
.btn-danger {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
}
.section-title {
  margin: 10px 0;
  font-weight: 600;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
}
.section-actions {
  display: flex;
  gap: 8px;
}
</style>
