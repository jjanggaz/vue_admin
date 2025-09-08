<template>
  <div class="machine-register-tab">
    <!-- 상단 검색/필터 영역 (이미지 레이아웃 참고) -->
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

    <!-- 리스트 테이블 -->
    <div class="section-header">
      <div class="section-title">⊙ {{ t("common.machineList") }}</div>
      <div class="section-actions">
        <button class="btn-outline" @click.prevent>excel 양식 다운로드</button>
        <button class="btn-outline" @click.prevent>excel 업로드</button>
        <button class="btn-outline" @click.prevent>모델 대량 업로드</button>
      </div>
    </div>
    <DataTable :columns="columns" :data="rows" :selectable="false">
      <!-- 파일 선택 셀 -->
      <template #cell-d3="{ index }">
        <div class="file-cell">
          <input
            class="file-name-input"
            :value="rows[index].d3 || ''"
            readonly
          />
          <input
            :id="`d3-${index}`"
            type="file"
            class="file-input"
            @change="(e) => handleFileChange('d3', index, e)"
          />
          <label :for="`d3-${index}`" class="btn-file">파일 선택</label>
        </div>
      </template>
      <template #cell-revit="{ index }">
        <div class="file-cell">
          <input
            class="file-name-input"
            :value="rows[index].revit || ''"
            readonly
          />
          <input
            :id="`revit-${index}`"
            type="file"
            class="file-input"
            @change="(e) => handleFileChange('revit', index, e)"
          />
          <label :for="`revit-${index}`" class="btn-file">파일 선택</label>
        </div>
      </template>
      <template #cell-d2="{ index }">
        <div class="file-cell">
          <input
            class="file-name-input"
            :value="rows[index].d2 || ''"
            readonly
          />
          <input
            :id="`d2-${index}`"
            type="file"
            class="file-input"
            @change="(e) => handleFileChange('d2', index, e)"
          />
          <label :for="`d2-${index}`" class="btn-file">파일 선택</label>
        </div>
      </template>
    </DataTable>
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

const columns: TableColumn[] = [
  { key: "no", title: "순번", width: "80px" },
  { key: "model", title: "기계 모델명", width: "220px" },
  { key: "d3", title: "3D 모델 (DTDX)", width: "220px" },
  { key: "revit", title: "REVIT 파일", width: "220px" },
  { key: "d2", title: "2D 심볼", width: "220px" },
  { key: "etc", title: "…", width: "120px" },
];

const rows = ref([
  { id: 1, no: 1, model: "송풍기 A", d3: "", revit: "", d2: "", etc: "" },
  { id: 2, no: 2, model: "송풍기 B", d3: "", revit: "", d2: "", etc: "" },
]);

function handleFileChange(
  column: "d3" | "revit" | "d2",
  index: number,
  e: Event
) {
  const input = e.target as HTMLInputElement;
  const file = input?.files && input.files[0];
  if (file) {
    rows.value[index][column] = file.name;
  } else {
    rows.value[index][column] = "";
  }
}
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
.group-form.wide {
  grid-column: span 2;
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
.right-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn-outline {
  background: #fff;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
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

.file-cell {
  display: flex;
  align-items: center;
}
.file-input {
  display: none;
}
.file-name-input {
  flex: 1;
  min-width: 160px;
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0 8px;
  margin-right: 8px;
  background: #fff;
}
.btn-file {
  display: inline-block;
  background: #f2f4f7;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
}

.footer-actions {
  display: flex;
  justify-content: center;
  margin: 8px 0 4px;
}
.btn-primary {
  background: #1a73e8;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
}
</style>
