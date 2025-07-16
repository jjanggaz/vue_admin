<template>
  <div class="inflow">
    <div class="page-content">
      <div class="action-bar tab-action-bar">
       <div class="swiper-bar">

        <div class="tabs-wrapper">
         <button
           v-if="canScrollLeft"
           class="btn-scroll left"
           @click="scrollTabs(-1)"
         >
           ◀
         </button>
         <div class="tabs" ref="tabsContainer" @scroll="updateScrollButtons">
           <div
             v-for="(tab, idx) in tabs"
             :key="tab.name"
             :class="['tab', tab.className, { active: activeTab === idx }]"
             @click="onTabClick(idx)"
           >
             {{ tab.name }}
           </div>
         </div>
         <button
           v-if="canScrollRight"
           class="btn-scroll right"
           @click="scrollTabs(1)"
         >
           ▶
         </button>
        </div>
       </div>

       <div class="tab-buttons">
        <div class="btns">
         <button class="btn btn-create" @click="openModal">
           신규등록
         </button>
        </div>
       </div>
      </div>

      <div class="tab-content">
       <div v-if="activeTab >= 0" class="content">
        <DataTable :columns="gridColumns" :data="currentGridData">
          <template #cell-display="{ item }: { item: GridRow }">
            <input
              type="checkbox"
              v-model="item.display"
              true-value="Y"
              false-value="N"
            />
          </template>
        </DataTable>

        <div class="actioin-bar">
         <div class="btns">
          <button class="btn btn-add">항목 추가</button>
         </div>
        </div>


        <div class="btns center">
          <button class="btn btn-save">저장</button>
        </div>
       </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>신규 등록</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
           <dt class="essential">아웃풋명</dt>
           <dd>
             <input
               type="text"
               placeholder="유입종류명을 입력하세요"
               class="form-input"
             />
           </dd>
           
          </dl>

          <DataTable :columns="gridColumns" :data="currentGridData">
            <template #cell-display="{ item }: { item: GridRow }">
              <input
                type="checkbox"
                v-model="item.display"
                true-value="Y"
                false-value="N"
              />
            </template>
           </DataTable>

           <div class="action-bar">
            <div class="btns">
             <button class="btn btn-add">항목 추가</button>
            </div>
           </div>

           <dl class="column-regist">
            <dt>비고</dt>
            <dd>
              <input
                type="text"
                placeholder="계산식을 입력하세요"
                class="form-input"
              />
            </dd>
           </dl>

        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeModal">취소</button>
          <button class="btn btn-confirm" @click="createNewTab">등록</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
 import { ref, onMounted, nextTick, computed } from "vue";
 import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
 import Pagination from "@/components/common/Pagination.vue";


 // 공통 로딩 상태
 const loading = ref(false);

 interface GridRow {
  id: number;
  item: string;
  influent: number;
  unit: string;
  display: "Y" | "N";
  remarks: string;
}

interface TabInfo {
  name: string;
  className: string;
}

interface GridRow2 {
  id: number;
  formula: string;
  uploadDate: string;
  author: string;
  apply: "Y" | "N";
  remarks: string;
}

 const tabs = ref<TabInfo[]>([
   { name: "Sludge Cake", className: "tab-type-3" },
   { name: "GAS", className: "tab-type-2" },
 ]);
 const activeTab = ref(0);
 const canScrollLeft = ref(false);
 const canScrollRight = ref(false);
 const tabsContainer = ref<HTMLElement | null>(null);

 // 모달 관련 상태
 const isModalOpen = ref(false);
 const newTabName = ref("");

 const gridColumns: TableColumn[] = [
   { key: "id", title: "순번", width: "80px" },
   { key: "item", title: "항목" },
   { key: "influent", title: "INFLUENT" },
   { key: "unit", title: "UNIT" },
   { key: "remarks", title: "비고" },
 ];

 const gridData = ref<GridRow[]>([
   { id: 1, item: "BOD", influent: 150.0, unit: "mg/L", remarks: "" },
   { id: 2, item: "COD", influent: 250.0, unit: "mg/L", remarks: "" },
   { id: 3, item: "SS", influent: 120.0, unit: "mg/L", remarks: "측정 불가" },
   { id: 4, item: "T-N", influent: 40.0, unit: "mg/L", remarks: "" },
   { id: 5, item: "T-P", influent: 4.0, unit: "mg/L", remarks: "" },
 ]);

 const gridColumns2: TableColumn[] = [
   { key: "id", title: "순번", width: "80px" },
   { key: "formula", title: "계산식" },
   { key: "uploadDate", title: "업로드 일자" },
   { key: "author", title: "작성자" },
   { key: "apply", title: "적용선택" },
   { key: "remarks", title: "비고" },
 ];

 const gridData2 = ref<GridRow2[]>([
   { id: 1, formula: "BOD * 1.2", uploadDate: "2023-11-01", author: "Admin", apply: "Y", remarks: "기본 계산식" },
   { id: 2, formula: "COD / 2", uploadDate: "2023-11-02", author: "User1", apply: "N", remarks: "" },
   { id: 3, formula: "SS + 10", uploadDate: "2023-11-03", author: "User2", apply: "Y", remarks: "조정 계산식" },
 ]);

 // 각 탭별 데이터
 const tabGridData = ref<{ [key: number]: GridRow[] }>({
   0: [
     { id: 1, item: "BOD", influent: 150.0, unit: "mg/L", display: "Y", remarks: "" },
     { id: 2, item: "COD", influent: 250.0, unit: "mg/L", display: "Y", remarks: "" },
   ],
   1: [
     { id: 1, item: "TSS", influent: 200.0, unit: "mg/L", display: "Y", remarks: "Food Waste 데이터" },
     { id: 2, item: "pH", influent: 7.5, unit: "-", display: "N", remarks: "" },
   ],
   2: [
     { id: 1, item: "NH3-N", influent: 80.0, unit: "mg/L", display: "Y", remarks: "Live Stock 데이터" },
     { id: 2, item: "PO4-P", influent: 15.0, unit: "mg/L", display: "Y", remarks: "" },
   ],
   3: [
     { id: 1, item: "TS", influent: 3000.0, unit: "mg/L", display: "Y", remarks: "Sludge Cake 데이터" },
     { id: 2, item: "VS", influent: 2400.0, unit: "mg/L", display: "N", remarks: "" },
   ],
   4: [
     { id: 1, item: "CH4", influent: 65.0, unit: "%", display: "Y", remarks: "Digest 데이터" },
     { id: 2, item: "CO2", influent: 30.0, unit: "%", display: "Y", remarks: "" },
   ]
 });

 const tabGridData2 = ref<{ [key: number]: GridRow2[] }>({
   0: [
     { id: 1, formula: "BOD * 1.2", uploadDate: "2023-11-01", author: "Admin", apply: "Y", remarks: "swage 계산식" },
     { id: 2, formula: "COD / 2", uploadDate: "2023-11-02", author: "User1", apply: "N", remarks: "" },
   ],
   1: [
     { id: 1, formula: "TSS * 0.8", uploadDate: "2023-11-03", author: "Admin", apply: "Y", remarks: "Food Waste 계산식" },
   ],
   2: [
     { id: 1, formula: "NH3 + 5", uploadDate: "2023-11-04", author: "User2", apply: "Y", remarks: "Live Stock 계산식" },
   ],
   3: [
     { id: 1, formula: "TS / 100", uploadDate: "2023-11-05", author: "Admin", apply: "N", remarks: "Sludge Cake 계산식" },
   ],
   4: [
     { id: 1, formula: "CH4 * 1.1", uploadDate: "2023-11-06", author: "User3", apply: "Y", remarks: "Digest 계산식" },
   ]
 });

 // 현재 활성 탭에 따른 데이터 반환
 const currentGridData = computed(() => {
   return tabGridData.value[activeTab.value] || [];
 });

 const currentGridData2 = computed(() => {
   return tabGridData2.value[activeTab.value] || [];
 });

 // 모달 관련 함수
 const openModal = () => {
   isModalOpen.value = true;
   newTabName.value = "";
 };

 const closeModal = () => {
   isModalOpen.value = false;
 };

 const createNewTab = () => {
   if (!newTabName.value.trim()) {
     alert("탭 이름을 입력하세요.");
     return;
   }
   const newIndex = tabs.value.length;
   tabs.value.push({
     name: newTabName.value.trim(),
     className: `tab-type-${(newIndex % 3) + 1}`
   });
   
   // 새 탭을 위한 빈 데이터 배열 추가
   tabGridData.value[newIndex] = [];
   tabGridData2.value[newIndex] = [];
   
   closeModal();
   
   nextTick(() => {
     activeTab.value = newIndex;
     updateScrollButtons();
     if (tabsContainer.value) {
       tabsContainer.value.scrollTo({ left: tabsContainer.value.scrollWidth, behavior: 'smooth' });
     }
   });
 };

 const onTabClick = (index: number) => {
   activeTab.value = index;
 };

 const updateScrollButtons = () => {
   if (!tabsContainer.value) return;
   const { scrollLeft, clientWidth, scrollWidth } = tabsContainer.value;
   canScrollLeft.value = scrollLeft > 0;
   canScrollRight.value = scrollLeft + clientWidth < scrollWidth;
 };

 const scrollTabs = (direction: number) => {
   if (!tabsContainer.value) return;
   const { scrollLeft, clientWidth } = tabsContainer.value;
   const newScrollLeft = scrollLeft + direction * clientWidth;
   tabsContainer.value.scrollTo({ left: newScrollLeft, behavior: "smooth" });
 };
</script>

<style scoped lang="scss">
@use "sass:color";

.inflow {
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: $spacing-lg;
  border-radius: $border-radius-md;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  max-width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-color;
  padding-bottom: $spacing-md;
  margin-bottom: $spacing-lg;

  h3 {
    margin: 0;
    font-size: $font-size-lg;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: $text-light;
    &:hover {
      color: $text-color;
    }
  }
}

.modal-body {
  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    label {
      font-weight: $font-weight-bold;
    }

    .form-input {
      padding: $spacing-sm;
      border: 1px solid $border-color;
      border-radius: $border-radius-sm;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-md;
  margin-top: $spacing-xl;
  padding-top: $spacing-lg;
  border-top: 1px solid $border-color;

  .btn {
    padding: $spacing-sm $spacing-lg;
    border-radius: $border-radius-sm;
    cursor: pointer;
    border: 1px solid transparent;
  }

  .btn-cancel {
    background-color: #fff;
    border-color: $border-color;
    color: $text-color;
    &:hover {
      background-color: $background-light;
    }
  }

  .btn-confirm {
    background-color: $primary-color;
    color: #fff;
    &:hover {
      background-color: color.scale($primary-color, $lightness: -10%);
    }
  }
}
</style>
