<template>
  <div class="output-page">
    <div class="action-bar">
      <div class="swiper-bar">
        <!-- 탭 리스트 -->
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
              :key="tab"
              :class="['tab', { active: activeTab === idx }]"
              @click="onTabClick(idx)"
            >
              {{ tab }}
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
      <div class="group-form">
        <button class="btn-regist" @click="handleRegist">
          {{ t("output.registerNew") }}
        </button>
      </div>
    </div>

    <!-- 탭 컨텐츠: 스와이프 가능 -->
    <div
      class="tab-contents"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <DataTable
        v-if="activeTab === 0"
        :columns="tableColumns"
        :data="outputList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <DataTable
        v-if="activeTab === 1"
        :columns="tableColumns"
        :data="outputList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
      <DataTable
        v-if="activeTab === 2"
        :columns="tableColumns"
        :data="outputList"
        :loading="loading"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      />
    </div>

    <div class="pagination-container">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPagesComputed"
        @page-change="handlePageChange"
      />
    </div>

    <!-- 등록 모달 -->
    <div v-if="isRegistModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ t("output.register") }}</h3>
          <button
            class="btn-close"
            @click="isRegistModalOpen = false"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="modal-body">
          <dl class="column-regist">
            <dt class="essential">{{ t("output.inflowTypeName") }}</dt>
            <dd>
              <input
                v-model="newTypeName"
                type="text"
                class="form-input"
                :placeholder="t('output.enterInflowTypeName')"
              />
            </dd>
            <dt>{{ t("output.fileUpload") }}</dt>
            <dd>
              <div class="file-upload-row">
                <input
                  type="text"
                  class="file-name-input"
                  :value="selectedFile?.name || ''"
                  :placeholder="t('common.selectFilePlaceholder')"
                  readonly
                />
                <label class="file-select-btn">
                  {{ t("common.selectFile") }}
                  <input
                    type="file"
                    @change="handleFileChange"
                    style="display: none"
                  />
                </label>
              </div>
            </dd>
            <dt>{{ t("output.etc") }}</dt>
            <dd>
              <input type="text" class="form-input" />
            </dd>
          </dl>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="handleSave">
            {{ t("common.save") }}
          </button>
          <button class="btn btn-secondary" @click="isRegistModalOpen = false">
            {{ t("common.close") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import Pagination from "@/components/common/Pagination.vue";
import { formatDate } from "@/utils/dateUtils";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

interface OutputItem {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: string;
}

// 테이블 컬럼 설정
const tableColumns: TableColumn[] = [
  { key: "id", title: t("output.id"), sortable: true, hidden: true },

  {
    key: "num",
    title: t("output.number"),
    sortable: true,
    formatter: (value, item, index) => String((index || 0) + 1),
  },
  { key: "column", title: t("output.item"), sortable: true },
  { key: "influent", title: t("output.influent"), sortable: true },
  { key: "unit", title: t("output.unit"), sortable: true },
  { key: "etc", title: t("output.etc"), sortable: true },
];

const outputList = ref<OutputItem[]>([
  {
    num: "1",
    column: "Column A",
    influent: "Influent A",
    unit: "",
    etc: "Etc A",
  },
]);

const searchQuery = ref("");
const loading = ref(false);

const currentPage = ref(1);
const totalPages = ref(10);
const pageSize = ref(10);
const totalCount = ref(0);

const isRegistModalOpen = ref(false);
// 신규 탭 입력값
const newTypeName = ref("");
// 동적 탭 목록
const tabs = ref<string[]>(["탭1", "탭2", "탭3"]);

// 파일 선택 관련
const selectedFile = ref<File | null>(null);

const activeTab = ref(0);
let touchStartX = 0;
let touchEndX = 0;

const handleSortChange = (column: string, direction: "asc" | "desc") => {
  console.log(`Sorting by ${column} in ${direction} order`);
  // 정렬 로직 구현
};

const onTabClick = (idx: number) => {
  activeTab.value = idx;
};
const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].clientX;
};
const onTouchMove = (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].clientX;
};
const onTouchEnd = () => {
  const delta = touchEndX - touchStartX;
  if (delta > 50 && activeTab.value > 0) {
    activeTab.value--;
  } else if (delta < -50 && activeTab.value < tabs.value.length - 1) {
    activeTab.value++;
  }
};

const totalCountComputed = computed(() => filterOutoutList.value.length);
const totalPagesComputed = computed(
  () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
);

const filterOutoutList = computed(() => {
  if (!searchQuery.value) return outputList.value;
  return outputList.value.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
});

const handleRowClick = (item: OutputItem) => {
  console.log("Row clicked:", item);
  // 행 클릭 시 상세보기 로직 구현
};

const handleRegist = () => {
  isRegistModalOpen.value = true;
  console.log("신규등록 버튼 클릭");
};

// 파일 선택 핸들러
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

// 모달 저장 버튼: 새로운 탭 추가
const handleSave = () => {
  const name = newTypeName.value.trim();
  if (name) {
    tabs.value.push(name);
    newTypeName.value = "";
    console.log("새 탭 추가:", name);
  }
  isRegistModalOpen.value = false;
};

// 페이지 로드 시 데이터 가져오기
const loadOutputList = async () => {
  loading.value = true;
  try {
    // API 호출 또는 데이터 로딩 로직
    // 예시: outputList.value = await fetchOutputData();
    console.log("Output data loaded");
  } catch (error) {
    console.error("Error loading output data:", error);
  } finally {
    loading.value = false;
  }
};

loadOutputList();

// 페이지 변경 핸들러
const handlePageChange = (page: number) => {
  currentPage.value = page;
  loadOutputList();
};
// 페이지네이션 관련 설정
const pagination = {
  currentPage: currentPage,
  totalPages: totalPages,
  pageSize: pageSize,
  totalCount: totalCount,
  onPageChange: handlePageChange,
};

// 탭 스크롤 참조 및 버튼 상태
const tabsContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const updateScrollButtons = () => {
  const el = tabsContainer.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 0;
  canScrollRight.value = el.scrollWidth > el.clientWidth + el.scrollLeft;
};

const scrollTabs = (dir: number) => {
  const el = tabsContainer.value;
  if (!el) return;
  el.scrollBy({ left: dir * 50, behavior: "smooth" });
};
onMounted(updateScrollButtons);
</script>

<style scoped lang="scss"></style>
