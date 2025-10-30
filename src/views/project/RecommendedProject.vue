<template>
  <div class="project-management">
    <div class="tabs-action-bar">
      <div class="tabs-wrapper">
        <button
          v-for="(tab, idx) in tabs"
          :key="tab"
          :class="['tab', { active: activeTab === idx }]"
          @click="activeTab = idx"
        >
          {{ tab }}
        </button>
      </div>
      <button
        class="btn-delete"
        v-if="activeTab === 0"
        @click="deleteSelected('project')"
        :disabled="selectedProject.length === 0"
      >
        {{ t("common.delete") }}
      </button>
      <button
        class="btn-delete"
        v-else-if="activeTab === 1"
        @click="deleteSelected('client')"
        :disabled="selectedClient.length === 0"
      >
        {{ t("common.delete") }}
      </button>
      <button
        class="btn-delete"
        v-else
        @click="deleteSelected('etc')"
        :disabled="selectedEtc.length === 0"
      >
        {{ t("common.delete") }}
      </button>
    </div>
    <div v-if="activeTab === 0">
      <DataTable
        :columns="projectColumns"
        :data="projectRows"
        :selectable="true"
        :selected-items="selectedProject"
        @selection-change="(val) => (selectedProject = val)"
      >
        <template #cell-detail="{ item }">
          <input
            class="input-cell"
            :placeholder="t('placeholder.projectDetail')"
            v-model="item.detail"
          />
        </template>
        <template #cell-inputType="{ item }">
          <select v-model="item.inputType">
            <option>{{ t("common.select") }}</option>
          </select>
        </template>
        <template #cell-required="{ item }">
          <select v-model="item.required">
            <option>{{ t("common.select") }}</option>
          </select>
        </template>
        <template #cell-visible="{ item }">
          <select v-model="item.visible">
            <option>{{ t("common.select") }}</option>
          </select>
        </template>
        <template #cell-edit="{ item }">
          <button class="btn-edit">✏️</button>
        </template>
      </DataTable>
    </div>
    <div v-else-if="activeTab === 1">
      <DataTable
        :columns="clientColumns"
        :data="clientRows"
        :selectable="true"
        :selected-items="selectedClient"
        @selection-change="(val) => (selectedClient = val)"
      >
        <template #cell-detail="{ item }">
          <input
            class="input-cell"
            :placeholder="t('placeholder.projectDetail')"
            v-model="item.detail"
          />
        </template>
        <template #cell-inputType="{ item }">
          <select v-model="item.inputType">
            <option>{{ t("common.select") }}</option>
          </select>
        </template>
        <template #cell-required="{ item }">
          <select v-model="item.required">
            <option>{{ t("common.select") }}</option>
          </select>
        </template>
        <template #cell-edit="{ item }">
          <button class="btn-edit">✏️</button>
        </template>
      </DataTable>
    </div>
    <div v-else>
      <DataTable
        :columns="etcColumns"
        :data="etcRows"
        :selectable="true"
        :selected-items="selectedEtc"
        @selection-change="(val) => (selectedEtc = val)"
      >
        <template #cell-detail="{ item }">
          <input
            class="input-cell"
            :placeholder="t('placeholder.projectDetail')"
            v-model="item.detail"
          />
        </template>
        <template #cell-inputType="{ item }">
          <select v-model="item.inputType">
            <option>{{ t("common.select") }}</option>
          </select>
        </template>
        <template #cell-required="{ item }">
          <select v-model="item.required">
            <option>{{ t("common.select") }}</option>
          </select>
        </template>
        <template #cell-edit="{ item }">
          <button class="btn-edit">✏️</button>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
const { t } = useI18n();
const tabs = [
  t("project.tabs.projectInfo"),
  t("project.tabs.clientInfo"),
  t("project.tabs.etc"),
];
const activeTab = ref(0);

interface ItemRow {
  id: string;
  detail: string;
  inputType: string;
  required: string;
  visible?: string;
}

const projectColumns: TableColumn[] = [
  { key: "id", title: t("columns.project.id"), width: "60px" },
  { key: "detail", title: t("columns.project.detailItem") },
  { key: "inputType", title: t("columns.project.inputType") },
  { key: "required", title: t("columns.project.required") },
  { key: "visible", title: t("columns.project.visible") },
  { key: "edit", title: t("common.edit"), width: "60px" },
];
const clientColumns: TableColumn[] = [
  { key: "id", title: t("columns.project.id"), width: "60px" },
  { key: "detail", title: t("columns.project.detailItem") },
  { key: "inputType", title: t("columns.project.inputType") },
  { key: "required", title: t("columns.project.required") },
  { key: "edit", title: t("common.edit"), width: "60px" },
];
const etcColumns: TableColumn[] = [
  { key: "id", title: t("columns.project.id"), width: "60px" },
  { key: "detail", title: t("columns.project.detailItem") },
  { key: "inputType", title: t("columns.project.inputType") },
  { key: "required", title: t("columns.project.required") },
  { key: "edit", title: t("common.edit"), width: "60px" },
];

const projectRows = ref<ItemRow[]>([
  { id: "1", detail: "", inputType: "", required: "", visible: "" },
  { id: "2", detail: "", inputType: "", required: "", visible: "" },
  { id: "3", detail: "", inputType: "", required: "", visible: "" },
  { id: "4", detail: "", inputType: "", required: "", visible: "" },
  { id: "5", detail: "", inputType: "", required: "", visible: "" },
  { id: "6", detail: "", inputType: "", required: "", visible: "" },
  { id: "7", detail: "", inputType: "", required: "", visible: "" },
  { id: "8", detail: "", inputType: "", required: "", visible: "" },
  { id: "9", detail: "", inputType: "", required: "", visible: "" },
  { id: "10", detail: "", inputType: "", required: "", visible: "" },
  { id: "11", detail: "", inputType: "", required: "", visible: "" },
  { id: "12", detail: "", inputType: "", required: "", visible: "" },
  { id: "13", detail: "", inputType: "", required: "", visible: "" },
  { id: "14", detail: "", inputType: "", required: "", visible: "" },
  { id: "15", detail: "", inputType: "", required: "", visible: "" },
  { id: "16", detail: "", inputType: "", required: "", visible: "" },
  { id: "17", detail: "", inputType: "", required: "", visible: "" },
]);
const clientRows = ref<ItemRow[]>([
  { id: "1", detail: "", inputType: "", required: "", visible: "" },
  { id: "2", detail: "", inputType: "", required: "", visible: "" },
  { id: "3", detail: "", inputType: "", required: "", visible: "" },
  { id: "4", detail: "", inputType: "", required: "", visible: "" },
  { id: "5", detail: "", inputType: "", required: "", visible: "" },
  { id: "6", detail: "", inputType: "", required: "", visible: "" },
  { id: "7", detail: "", inputType: "", required: "", visible: "" },
  { id: "8", detail: "", inputType: "", required: "", visible: "" },
  { id: "9", detail: "", inputType: "", required: "", visible: "" },
  { id: "10", detail: "", inputType: "", required: "", visible: "" },
  { id: "11", detail: "", inputType: "", required: "", visible: "" },
  { id: "12", detail: "", inputType: "", required: "", visible: "" },
  { id: "13", detail: "", inputType: "", required: "", visible: "" },
  { id: "14", detail: "", inputType: "", required: "", visible: "" },
  { id: "15", detail: "", inputType: "", required: "", visible: "" },
  { id: "16", detail: "", inputType: "", required: "", visible: "" },
  { id: "17", detail: "", inputType: "", required: "", visible: "" },
]);
const etcRows = ref<ItemRow[]>([
  { id: "1", detail: "", inputType: "", required: "", visible: "" },
  { id: "2", detail: "", inputType: "", required: "", visible: "" },
  { id: "3", detail: "", inputType: "", required: "", visible: "" },
  { id: "4", detail: "", inputType: "", required: "", visible: "" },
  { id: "5", detail: "", inputType: "", required: "", visible: "" },
  { id: "6", detail: "", inputType: "", required: "", visible: "" },
  { id: "7", detail: "", inputType: "", required: "", visible: "" },
  { id: "8", detail: "", inputType: "", required: "", visible: "" },
  { id: "9", detail: "", inputType: "", required: "", visible: "" },
  { id: "10", detail: "", inputType: "", required: "", visible: "" },
  { id: "11", detail: "", inputType: "", required: "", visible: "" },
  { id: "12", detail: "", inputType: "", required: "", visible: "" },
  { id: "13", detail: "", inputType: "", required: "", visible: "" },
  { id: "14", detail: "", inputType: "", required: "", visible: "" },
  { id: "15", detail: "", inputType: "", required: "", visible: "" },
  { id: "16", detail: "", inputType: "", required: "", visible: "" },
  { id: "17", detail: "", inputType: "", required: "", visible: "" },
]);

const selectedProject = ref<ItemRow[]>([]);
const selectedClient = ref<ItemRow[]>([]);
const selectedEtc = ref<ItemRow[]>([]);

function deleteSelected(type: "project" | "client" | "etc") {
  if (type === "project") {
    if (!selectedProject.value.length) return;
    if (
      !confirm(
        t("messages.confirm.deleteItems", {
          count: selectedProject.value.length,
        })
      )
    )
      return;
    projectRows.value = projectRows.value.filter(
      (row) => !selectedProject.value.includes(row)
    );
    selectedProject.value = [];
  } else if (type === "client") {
    if (!selectedClient.value.length) return;
    if (
      !confirm(
        t("messages.confirm.deleteItems", {
          count: selectedClient.value.length,
        })
      )
    )
      return;
    clientRows.value = clientRows.value.filter(
      (row) => !selectedClient.value.includes(row)
    );
    selectedClient.value = [];
  } else {
    if (!selectedEtc.value.length) return;
    if (
      !confirm(
        t("messages.confirm.deleteItems", { count: selectedEtc.value.length })
      )
    )
      return;
    etcRows.value = etcRows.value.filter(
      (row) => !selectedEtc.value.includes(row)
    );
    selectedEtc.value = [];
  }
}
</script>

<style scoped lang="scss">
.project-management {
  padding: $spacing-lg;
}
.tabs-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.tabs-wrapper {
  display: flex;
  gap: 0.5rem;
}
.tab {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  border: none;
  background: none;
  color: #222;
  border-bottom: 2px solid transparent;
  transition: border 0.2s, color 0.2s;
}
.tab.active {
  color: #1a73e8;
  border-bottom: 2px solid #1a73e8;
  font-weight: bold;
}
.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}
.btn-delete {
  background: #3a3d4b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
}
.input-cell {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.btn-edit {
  background: #f7f7f7;
  border: 1px solid #bbb;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.1rem;
  cursor: pointer;
}
</style>
