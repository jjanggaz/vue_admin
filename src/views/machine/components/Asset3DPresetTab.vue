<template>
  <div class="asset3d-preset-register-tab">
    <!-- 등록 폼 -->
    <div class="filter-bar">
        <div class="form-group">
          <label class="required">단위</label>
          <select v-model="selectedUnit" class="form-select">
            <option value="">-- 선택 --</option>
            <option
              v-for="unit in asset3DStore.unitSystems"
              :key="unit.unit_system_id"
              :value="unit.system_code"
            >
              {{ unit.system_name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label class="required">연결기계</label>
          <select v-model="selectedMachine" class="form-select">
            <option value="">-- 선택 --</option>
          <option value="M_PUMP">펌프</option>
          <option value="M_AEBL">송풍기</option>
          </select>
        </div>
        <div class="form-group">
          <label class="required">프리셋 명</label>
          <input
            type="text"
            v-model="presetName"
            class="form-input"
            placeholder="프리셋 명을 입력해주세요."
          />
        </div>
        <div class="form-group">
          <label class="required">썸네일 업로드</label>
        <div class="file-upload-wrapper">
          <div class="file-upload-group">
            <input
              type="text"
              class="form-input file-name-input"
              :value="thumbnailFileName"
              readonly
              placeholder="파일 선택"
            />
            <input
              type="file"
              ref="thumbnailFileInput"
              accept=".jpg,.jpeg,.png,.gif"
              style="display: none"
              @change="handleThumbnailFileChange"
            />
            <button
              type="button"
              class="btn-ellipsis"
              @click="thumbnailFileInput?.click()"
            >
              ...
            </button>
          </div>
          <img
            v-if="thumbnailPreviewUrl"
            :src="thumbnailPreviewUrl"
            alt="썸네일 미리보기"
            class="thumbnail-preview"
          />
        </div>
      </div>
      <div class="form-group right-align">
        <button
          type="button"
          class="btn-register"
          @click="handleThumbnailRegister"
          :disabled="!thumbnailFile"
        >
          등록
            </button>
          </div>
        </div>

    <!-- 행 추가/삭제 버튼 -->
    <div class="button-row">
          <button type="button" class="btn-add-row" @click="handleAddRow">
            +행 추가
          </button>
          <button type="button" class="btn-delete-row" @click="handleDeleteRow">
            -행 삭제
          </button>
    </div>

    <!-- 데이터 테이블 -->
    <div class="table-section">
      <DataTable
        :columns="tableColumns"
        :data="tableRows"
        :selectable="true"
        :selection-mode="'multiple'"
        :show-select-all="true"
        :selected-items="selectedRows"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <template #cell-type="{ item }">
          <select
            v-model="item.type"
            class="table-select"
            @change="handleTypeChange(item)"
          >
            <option value="">-- 선택 --</option>
            <option
              v-for="type in typeOptions"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>
        </template>
        <template #cell-subType="{ item }">
          <div
            v-if="item.type === 'P_VALV'"
            class="subtype-cell-wrapper tree-select-wrapper"
          >
            <div
              class="tree-select-display"
              :class="{ open: openTreeDropdownRowId === item.id }"
              @click.stop="toggleTreeDropdown(item, $event)"
            >
              <span>{{
                item.subTypeLabel && item.subTypeLabel.length > 0
                  ? item.subTypeLabel
                  : t("common.select")
              }}</span>
              <span class="arrow">{{
                openTreeDropdownRowId === item.id ? "▲" : "▼"
              }}</span>
            </div>
            <button
              type="button"
              class="btn-search-subtype"
              title="자재 선택"
            >
              자재 선택
            </button>
          </div>
          <div v-else class="subtype-cell-wrapper">
            <select
              v-model="item.subType"
              class="table-select"
              :disabled="!item.type || !item.subTypeOptions || item.subTypeOptions.length === 0"
              @change="handleStandardSubTypeChange(item)"
            >
              <option value="">-- 선택 --</option>
              <option
                v-for="option in item.subTypeOptions || []"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <button
              type="button"
              class="btn-search-subtype"
              @click="handleSubTypeSearch(item)"
              title="자재 선택"
            >
              자재 선택
            </button>
          </div>
        </template>
        <template #cell-diameter="{ item }">
          <span class="table-text">{{ item.diameter || "-" }}</span>
        </template>
        <template #cell-equipmentCode="{ item }">
          <span class="table-text">{{ item.equipmentCode || "-" }}</span>
        </template>
        <template #cell-dtdxModel="{ item }">
          <span class="table-text">{{ item.dtdxModel || "-" }}</span>
        </template>
        <template #cell-unitPrice="{ item }">
          <span class="table-text">{{ item.unitPrice || "-" }}</span>
        </template>
        <template #cell-length="{ item }">
          <span class="table-text">{{ item.length || "-" }}</span>
        </template>
        <template #cell-remarks="{ item }">
          <input
            type="text"
            v-model="item.remarks"
            class="table-input"
            placeholder="비고"
          />
        </template>
      </DataTable>
    </div>

    <teleport to="body">
      <div
        v-if="openTreeDropdownRowId !== null && activeManualValveRow"
        class="tree-dropdown-portal"
        :style="{
          bottom: `${treeDropdownPosition.bottom}px`,
          left: `${treeDropdownPosition.left}px`,
          width: `${treeDropdownPosition.width}px`,
        }"
        ref="treeDropdownPortalRef"
      >
        <div class="tree-dropdown-panel">
          <div v-if="manualValveTreeLoading" class="tree-dropdown-state">
            {{ t("common.loading") }}...
          </div>
          <div v-else-if="manualValveTreeError" class="tree-dropdown-state error">
            {{ manualValveTreeError }}
          </div>
          <div v-else class="tree-node-list">
            <template v-for="node in manualValveTree" :key="node.code_key">
              <div class="tree-node-label">
                <div
                  class="tree-node-row"
                  :class="{
                    'is-selected': manualValveSelectedCode === node.code_key,
                    warning: node.children && node.children.length > 0,
                  }"
                  @click.stop="handleTreeSelect(activeManualValveRow, node)"
                >
                  <button
                    v-if="node.children && node.children.length"
                    type="button"
                    class="tree-node-toggle"
                    @click.stop="handleToggleParentNode(node.code_key)"
                  >
                    {{ isParentExpanded(node.code_key) ? "▾" : "▸" }}
                  </button>
                  <span class="node-text">{{ node.code_value }}</span>
                </div>
              </div>
              <div
                v-if="node.children && node.children.length"
                v-show="isParentExpanded(node.code_key)"
                class="tree-children-nodes"
              >
                <div
                  v-for="child in node.children"
                  :key="child.code_key"
                  class="tree-node-row child"
                  :class="{
                    'is-selected': manualValveSelectedCode === child.code_key,
                    warning: child.children && child.children.length > 0,
                  }"
                  @click.stop="handleTreeSelect(activeManualValveRow, child)"
                >
                  <button
                    v-if="child.children && child.children.length"
                    type="button"
                    class="tree-node-toggle"
                    @click.stop="handleToggleParentNode(child.code_key)"
                  >
                    {{ isParentExpanded(child.code_key) ? "▾" : "▸" }}
                  </button>
                  <span class="node-text">{{ child.code_value }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onActivated } from "vue";
import { useI18n } from "vue-i18n";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useAsset3DStore } from "@/stores/asset3DStore";

const { t } = useI18n();
const asset3DStore = useAsset3DStore();

// 폼 데이터
const selectedUnit = ref("");
const selectedMachine = ref("");
const presetName = ref("");
const thumbnailFile = ref<File | null>(null);
const thumbnailFileName = ref("");
const thumbnailFileInput = ref<HTMLInputElement | null>(null);
const thumbnailPreviewUrl = ref<string>("");

// 테이블 데이터
interface TableRow {
  id: number;
  no: number;
  type: string;
  subType: string;
  subTypeLabel?: string;
  diameter: string;
  equipmentCode: string;
  dtdxModel: string;
  unitPrice: string;
  length: string;
  remarks: string;
  subTypeOptions?: Array<{ value: string; label: string }>;
}

interface ManualValveTreeNode {
  code_key: string;
  code_value: string;
  code_level?: number;
  code_order?: number;
  children?: ManualValveTreeNode[];
}
interface ManualValveTreeNodeWithDepth extends ManualValveTreeNode {
  depth: number;
}
interface CodeKeyValue {
  code_key: string;
  code_value: string;
}

const tableRows = ref<TableRow[]>([]);
const selectedRows = ref<TableRow[]>([]);
let nextRowId = 1;
const manualValveTree = ref<ManualValveTreeNode[]>([]);
const manualValveTreeLoading = ref(false);
const manualValveTreeError = ref<string | null>(null);
const manualValveTreeInitialized = ref(false);
const openTreeDropdownRowId = ref<number | null>(null);
const activeManualValveRow = ref<TableRow | null>(null);
const manualValveSelectedCode = ref<string>("");
const manualValveExpandedKeys = ref<Set<string>>(new Set());
const treeDropdownAnchor = ref<HTMLElement | null>(null);
const treeDropdownPortalRef = ref<HTMLElement | null>(null);
const treeDropdownPosition = ref({ bottom: 0, left: 0, width: 0 });

const getTreeDropdownAnchorElement = (event?: MouseEvent) => {
  const target = event?.currentTarget as HTMLElement | null;
  if (!target) {
    return treeDropdownAnchor.value;
  }

  const container = target.closest(".tree-select-wrapper");
  const display = container?.querySelector<HTMLElement>(".tree-select-display");
  return display || target;
};

const updateTreeDropdownPosition = (target?: HTMLElement | null) => {
  const anchor = target || treeDropdownAnchor.value;
  if (!anchor) return;

  const rect = anchor.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  
  // 위 방향으로 펼쳐지도록 bottom 위치 계산 (viewport 기준)
  treeDropdownPosition.value = {
    bottom: viewportHeight - rect.top,
    left: rect.left + window.scrollX,
    width: rect.width,
  };
};

const closeManualValveDropdown = () => {
  openTreeDropdownRowId.value = null;
  activeManualValveRow.value = null;
  treeDropdownAnchor.value = null;
};

const resetManualValveTreeState = () => {
  manualValveTree.value = [];
  manualValveTreeLoading.value = false;
  manualValveTreeError.value = null;
  manualValveTreeInitialized.value = false;
  manualValveSelectedCode.value = "";
  manualValveExpandedKeys.value = new Set();
  closeManualValveDropdown();
};

// 유형 옵션
const typeOptions = ref([
  { value: "FIT_PIPE", label: "배관" },
  { value: "P_VALV", label: "수동 벨브" },
]);

// 테이블 컬럼 정의
const tableColumns: TableColumn[] = [
  { key: "no", title: "번호", width: "50px", sortable: false },
  { key: "type", title: "유형", width: "120px", sortable: false },
  { key: "subType", title: "세부유형", width: "310px", sortable: false },
  { key: "diameter", title: "직경", width: "70px", sortable: false },
  { key: "equipmentCode", title: "장비 코드", width: "120px", sortable: false },
  { key: "dtdxModel", title: "Dtdx 모델", width: "120px", sortable: false },
  { key: "unitPrice", title: "단가", width: "80px", sortable: false },
  { key: "length", title: "길이", width: "70px", sortable: false },
  { key: "remarks", title: "비고", width: "100px", sortable: false },
];

// 썸네일 파일 변경 핸들러
const handleThumbnailFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files?.[0];

  if (file) {
    // 파일명 validation
    if (!validateFileName(file.name)) {
      alert(t("messages.warning.invalidFormulaFileNameFormat"));
      input.value = "";
      thumbnailFileName.value = "";
      thumbnailFile.value = null;
      return;
    }

    // 확장자 검증
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!allowedExtensions.includes(fileExtension)) {
      alert("썸네일 파일은 .jpg, .jpeg, .png, .gif 확장자만 허용됩니다.");
      input.value = "";
      thumbnailFileName.value = "";
      thumbnailFile.value = null;
      return;
    }

    thumbnailFileName.value = file.name;
    thumbnailFile.value = file;

    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      thumbnailPreviewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    thumbnailFileName.value = "";
    thumbnailFile.value = null;
    thumbnailPreviewUrl.value = "";
  }
};

// 파일명 validation 함수
const validateFileName = (fileName: string): boolean => {
  // 확장자 제거
  const lastDotIndex = fileName.lastIndexOf(".");
  const nameWithoutExt =
    lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;

  // 파일명이 비어있으면 안 됨
  if (!nameWithoutExt || nameWithoutExt.trim() === "") {
    return false;
  }

  // 100자 이내 체크
  if (nameWithoutExt.length > 100) {
    return false;
  }

  // 영문, 숫자, 특수 기호 "_-()"만 허용
  const fileNameRegex = /^[a-zA-Z0-9_\-().]+$/;
  if (!fileNameRegex.test(nameWithoutExt)) {
    return false;
  }

  return true;
};

// 행 추가 핸들러
const handleAddRow = () => {
  tableRows.value.push({
    id: nextRowId++,
    no: tableRows.value.length + 1,
    type: "",
    subType: "",
    subTypeLabel: "",
    diameter: "",
    equipmentCode: "",
    dtdxModel: "",
    unitPrice: "",
    length: "",
    remarks: "",
    subTypeOptions: [],
  });
  // 번호 재정렬
  updateRowNumbers();
};

// 행 삭제 핸들러
const handleDeleteRow = () => {
  if (selectedRows.value.length === 0) {
    alert("삭제할 행을 선택해주세요.");
    return;
  }

  const selectedIds = selectedRows.value.map((row) => row.id);
  tableRows.value = tableRows.value.filter(
    (row) => !selectedIds.includes(row.id)
  );
  selectedRows.value = [];
  // 번호 재정렬
  updateRowNumbers();
};

// 번호 재정렬 함수
const updateRowNumbers = () => {
  tableRows.value.forEach((row, index) => {
    row.no = index + 1;
  });
};

// 선택 변경 핸들러
const handleSelectionChange = (items: TableRow[]) => {
  selectedRows.value = items;
};

const normalizeTreeNodes = (nodes: unknown[]): ManualValveTreeNode[] => {
  if (!Array.isArray(nodes)) {
    return [];
  }

  const clonedNodes = nodes.slice();

  const sortedNodes = clonedNodes.sort((a, b) => {
    const rawOrderA =
      (a as Record<string, unknown>)["code_order"] ??
      (a as Record<string, unknown>)["order"];
    const rawOrderB =
      (b as Record<string, unknown>)["code_order"] ??
      (b as Record<string, unknown>)["order"];

    const orderA =
      typeof rawOrderA === "number"
        ? rawOrderA
        : typeof rawOrderA === "string" && rawOrderA.trim() !== ""
        ? Number(rawOrderA)
        : Number.MAX_SAFE_INTEGER;

    const orderB =
      typeof rawOrderB === "number"
        ? rawOrderB
        : typeof rawOrderB === "string" && rawOrderB.trim() !== ""
        ? Number(rawOrderB)
        : Number.MAX_SAFE_INTEGER;

    if (Number.isNaN(orderA) && Number.isNaN(orderB)) {
      return 0;
    }
    if (Number.isNaN(orderA)) {
      return 1;
    }
    if (Number.isNaN(orderB)) {
      return -1;
    }
    if (orderA === orderB) {
      return 0;
    }
    return orderA - orderB;
  });

  return sortedNodes
    .map((node) => {
      if (typeof node !== "object" || node === null) {
        return null;
      }

      const rawNode = node as Record<string, unknown>;
      const childCandidates =
        rawNode["children"] ??
        rawNode["child"] ??
        rawNode["child_list"] ??
        rawNode["items"] ??
        rawNode["childrens"];

      const normalizedChildren = Array.isArray(childCandidates)
        ? normalizeTreeNodes(childCandidates)
        : [];

      const rawKey =
        rawNode["code_key"] ??
        rawNode["codeKey"] ??
        rawNode["value"] ??
        rawNode["id"];
      const rawLabel =
        rawNode["code_value"] ??
        rawNode["codeValue"] ??
        rawNode["label"] ??
        rawNode["name"] ??
        rawNode["value"];

      const codeKey =
        typeof rawKey === "string"
          ? rawKey
          : rawKey !== undefined && rawKey !== null
          ? String(rawKey)
          : "";
      const codeValue =
        typeof rawLabel === "string"
          ? rawLabel
          : rawLabel !== undefined && rawLabel !== null
          ? String(rawLabel)
          : "";

      if (!codeKey || !codeValue) {
        return null;
      }

      const rawLevel = rawNode["code_level"] ?? rawNode["level"];
      let codeLevel: number | undefined;
      if (typeof rawLevel === "number") {
        codeLevel = rawLevel;
      } else if (typeof rawLevel === "string") {
        const parsedLevel = Number(rawLevel);
        if (!Number.isNaN(parsedLevel)) {
          codeLevel = parsedLevel;
        }
      }

      const normalizedNode: ManualValveTreeNode = {
        code_key: codeKey,
        code_value: codeValue,
      };

      if (codeLevel !== undefined) {
        normalizedNode.code_level = codeLevel;
      }

      const rawOrder = rawNode["code_order"] ?? rawNode["order"];
      if (typeof rawOrder === "number") {
        normalizedNode.code_order = rawOrder;
      } else if (
        typeof rawOrder === "string" &&
        rawOrder.trim() !== "" &&
        !Number.isNaN(Number(rawOrder))
      ) {
        normalizedNode.code_order = Number(rawOrder);
      }

      if (normalizedChildren.length > 0) {
        normalizedNode.children = normalizedChildren.sort((a, b) => {
          const orderA = a.code_order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.code_order ?? Number.MAX_SAFE_INTEGER;
          if (orderA === orderB) {
            return a.code_value.localeCompare(b.code_value, "ko");
          }
          return orderA - orderB;
        });
      }

      return normalizedNode;
    })
    .filter(
      (node): node is ManualValveTreeNode => !!node && !!node.code_key && !!node.code_value
    );
};

const ensureManualValveTree = async (forceReload = false) => {
  if (!forceReload && (manualValveTreeInitialized.value || manualValveTreeLoading.value)) {
    return;
  }

  manualValveTreeLoading.value = true;
  manualValveTreeError.value = null;

  try {
    const response = await asset3DStore.fetchAsset3DCodeTree("MANUAL_VALVE", forceReload);
    const normalizedTree = normalizeTreeNodes(response || []);
    console.log("[Asset3DPreset] 수동 밸브 트리 응답:", {
      length: normalizedTree.length,
      sample: normalizedTree.slice(0, 5),
    });
    manualValveTree.value = normalizedTree;
    manualValveTreeInitialized.value = normalizedTree.length > 0;
  } catch (error: unknown) {
    console.error("수동 밸브 트리 조회 실패:", error);
    if (error && typeof error === "object" && "message" in error) {
      manualValveTreeError.value =
        String((error as { message?: string }).message) ||
        "세부유형 트리 정보를 불러오지 못했습니다.";
    } else {
      manualValveTreeError.value =
        "세부유형 트리 정보를 불러오지 못했습니다.";
    }
  } finally {
    manualValveTreeLoading.value = false;
  }
};

// 유형 변경 핸들러
const handleTypeChange = async (item: TableRow) => {
  console.log("[Asset3DPreset] 유형 변경 감지:", {
    rowId: item.id,
    previousType: item.type,
  });
  item.subType = "";
  item.subTypeLabel = "";
  item.subTypeOptions = [];
  openTreeDropdownRowId.value = null;

  if (!item.type) {
    return;
  }

  if (item.type === "P_VALV") {
    console.log("[Asset3DPreset] 수동 밸브 트리 조회 시도");
    await ensureManualValveTree();
    return;
  }

  try {
    await asset3DStore.fetchThirdDepth(item.type, 3);
    const depthItems =
      (asset3DStore.thirdDepth as CodeKeyValue[] | undefined) || [];
    console.log("[Asset3DPreset] 세부유형 API 응답:", {
      type: item.type,
      count: depthItems.length,
      itemsPreview: depthItems.slice(0, 5),
    });
    if (depthItems.length > 0) {
      item.subTypeOptions = depthItems.map((code) => ({
        value: code.code_key,
        label: code.code_value,
      }));
    }
  } catch (error) {
    console.error("세부유형 조회 실패:", error);
    item.subTypeOptions = [];
  }

  if (openTreeDropdownRowId.value === item.id) {
    closeManualValveDropdown();
  }
};

const handleStandardSubTypeChange = (item: TableRow) => {
  if (!item.subTypeOptions) {
    item.subTypeLabel = "";
    return;
  }

  const matched = item.subTypeOptions.find(
    (option) => option.value === item.subType
  );
  item.subTypeLabel = matched?.label || "";
};

const toggleTreeDropdown = async (item: TableRow, event?: MouseEvent) => {
  if (item.type !== "P_VALV") {
    closeManualValveDropdown();
    return;
  }

  const isOpen = openTreeDropdownRowId.value === item.id;
  if (isOpen) {
    closeManualValveDropdown();
    return;
  }

  await ensureManualValveTree();
  if (manualValveTreeError.value) {
    return;
  }

  activeManualValveRow.value = item;
  openTreeDropdownRowId.value = item.id;
  manualValveSelectedCode.value = item.subType || "";
  // 트리 열릴 때: 기존 선택값이 있으면 해당 경로만 펼치고, 없으면 모두 닫음
  expandManualValvePath(manualValveSelectedCode.value, true);
  const anchor = getTreeDropdownAnchorElement(event) || null;
  if (anchor) {
    treeDropdownAnchor.value = anchor;
  }
  updateTreeDropdownPosition(anchor);
};

const handleTreeSelect = (
  item: TableRow | null,
  selectedNode: ManualValveTreeNode | ManualValveTreeNodeWithDepth
) => {
  if (!item) return;

  const baseNode = selectedNode as ManualValveTreeNode;
  const hasChildren =
    Array.isArray(baseNode.children) && baseNode.children.length > 0;
  if (hasChildren) {
    handleToggleParentNode(baseNode.code_key);
    return;
  }

  const codeLevel =
    baseNode.code_level ??
    (selectedNode as ManualValveTreeNodeWithDepth).depth;

  if (codeLevel !== undefined && codeLevel !== 4) {
    alert("4레벨 코드를 선택하세요.");
    return;
  }

  item.subType = selectedNode.code_key;
  item.subTypeLabel = selectedNode.code_value;
  manualValveSelectedCode.value = selectedNode.code_key;
  expandManualValvePath(selectedNode.code_key);
  closeManualValveDropdown();
};

const handleToggleParentNode = (codeKey: string) => {
  if (!codeKey) {
    return;
  }
  const nextSet = new Set(manualValveExpandedKeys.value);
  if (nextSet.has(codeKey)) {
    nextSet.delete(codeKey);
  } else {
    nextSet.add(codeKey);
  }
  manualValveExpandedKeys.value = nextSet;
};

const isParentExpanded = (codeKey: string) =>
  manualValveExpandedKeys.value.has(codeKey);

const findPathToManualValveCode = (
  nodes: ManualValveTreeNode[],
  target: string,
  trail: string[] = []
): string[] => {
  for (const node of nodes) {
    const nextTrail = [...trail, node.code_key];
    if (node.code_key === target) {
      return nextTrail;
    }
    if (node.children && node.children.length) {
      const childPath = findPathToManualValveCode(
        node.children,
        target,
        nextTrail
      );
      if (childPath.length) {
        return childPath;
      }
    }
  }
  return [];
};

const expandManualValvePath = (codeKey: string, exclusive = false) => {
  if (!codeKey) {
    if (exclusive) {
      manualValveExpandedKeys.value = new Set();
    }
    return;
  }
  const path = findPathToManualValveCode(manualValveTree.value, codeKey);
  if (path.length <= 1) {
    if (exclusive) {
      manualValveExpandedKeys.value = new Set();
    }
    return;
  }
  // exclusive=true: 기존값이 속한 노드만 펼치고 나머지는 닫음
  const nextSet = exclusive
    ? new Set<string>()
    : new Set(manualValveExpandedKeys.value);
  path.slice(0, -1).forEach((key) => nextSet.add(key));
  manualValveExpandedKeys.value = nextSet;
};

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as Node;
  const isInsideAnchor =
    treeDropdownAnchor.value?.contains(target as Node) ?? false;
  const isInsidePortal =
    treeDropdownPortalRef.value?.contains(target as Node) ?? false;

  if (!isInsideAnchor && !isInsidePortal) {
    closeManualValveDropdown();
  }
};

const handleViewportChange = () => {
  if (openTreeDropdownRowId.value && treeDropdownAnchor.value) {
    updateTreeDropdownPosition();
  }
};

// 세부유형 조회 핸들러
const handleSubTypeSearch = (item: TableRow) => {
  // 세부유형 조회 로직
  console.log("세부유형 조회:", item);
  // TODO: 세부유형 조회 API 호출 또는 모달 열기
};

onMounted(async () => {
  resetManualValveTreeState();
  try {
    await asset3DStore.fetchCommonCodes("");
  } catch (error) {
    console.error("공통코드 조회 실패:", error);
  }

  document.addEventListener("click", handleGlobalClick);
  window.addEventListener("scroll", handleViewportChange, true);
  window.addEventListener("resize", handleViewportChange);
});

onActivated(() => {
  resetManualValveTreeState();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleGlobalClick);
  window.removeEventListener("scroll", handleViewportChange, true);
  window.removeEventListener("resize", handleViewportChange);
});

// 썸네일 등록 핸들러
const handleThumbnailRegister = async () => {
  if (!thumbnailFile.value) {
    alert("썸네일 파일을 선택해주세요.");
    return;
  }

  try {
    // TODO: 썸네일 업로드 API 호출
    // await asset3DStore.uploadThumbnail(thumbnailFile.value);
    alert("썸네일이 등록되었습니다.");
    // 등록 성공 후 파일 초기화
    thumbnailFileName.value = "";
    thumbnailFile.value = null;
    thumbnailPreviewUrl.value = "";
    if (thumbnailFileInput.value) {
      thumbnailFileInput.value.value = "";
    }
  } catch (error) {
    console.error("썸네일 등록 실패:", error);
    alert("썸네일 등록에 실패했습니다.");
  }
};
</script>

<style scoped lang="scss">
.asset3d-preset-register-tab {
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
  background: #f7f9fc;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  flex-wrap: nowrap;

  // 모바일 크기에서 줄바꿈 허용
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
  }
}

.register-form {
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex-shrink: 0;

  // 단위, 연결기계는 고정 폭
  &:nth-child(1),
  &:nth-child(2) {
    width: 150px;
  }

  // 프리셋 명과 썸네일 업로드는 동일한 폭
  &:nth-child(3),
  &:nth-child(4) {
  flex: 1;
    min-width: 250px;
    max-width: 350px;
  }

  // 등록 버튼은 우측 정렬
  &.right-align {
    justify-content: flex-start;
    align-items: flex-start;
    flex: 0 0 auto;
    margin-left: auto;
    padding-top: 26px; // label(13px) + gap(6px) + 컨트롤 높이(32px) - 등록 버튼 높이(32px) = 19px, 하지만 정확히 맞추기 위해 26px
  }
}

label {
  font-size: 13px;
  color: #475467;
  font-weight: 500;

  &.required::after {
    content: "*";
    color: #e74c3c;
    margin-left: 2px;
  }
}

.form-select {
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0 8px;
  background: #fff;
  font-size: 14px;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.form-input {
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  padding: 0 8px;
  background: #fff;
  font-size: 14px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &.file-name-input {
    background-color: #f9fafb;
    cursor: default;
  }
}

.file-upload-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.file-upload-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
  min-width: 0;

  .form-input {
    flex: 1;
    min-width: 0;
  }
}

.thumbnail-preview {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border: 1px solid #d0d5dd;
  border-radius: 4px;
  flex-shrink: 0;
}

.btn-ellipsis {
  width: 32px;
  height: 32px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background: #f9fafb;
    border-color: #98a2b3;
  }
}

.btn-register {
  height: 32px;
  padding: 0 24px;
  border: none;
  border-radius: 6px;
  background: #222e77;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #1a2561;
  }

  &:active {
    background: #141b4a;
  }
}

.btn-add-row,
.btn-delete-row {
  height: 32px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: #222e77;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #1a2561;
  }

  &:active {
    background: #141b4a;
  }
}

.btn-delete-row {
  background: #e74c3c;

  &:hover {
    background: #c0392b;
  }

  &:active {
    background: #a93226;
  }
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
  margin-top: 20px;
}

.table-section {
  margin-top: 0;
  width: 100%;
  overflow-x: hidden;

  :deep(.data-table) {
    width: 100%;
    table-layout: fixed;
  }

  :deep(.data-table th),
  :deep(.data-table td) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :deep(.data-table th.checkbox-cell),
  :deep(.data-table td.checkbox-cell) {
    text-overflow: clip;
    overflow: visible;
  }
}

.table-select,
.table-input {
  width: 100%;
  height: 28px;
  border: 1px solid #d0d5dd;
  border-radius: 4px;
  padding: 0 6px;
  background: #fff;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
}

.table-select {
  cursor: pointer;
}

.table-text {
  display: block;
  width: 100%;
  padding: 0 6px;
  font-size: 13px;
  line-height: 28px;
  color: #344054;
}

.subtype-cell-wrapper {
  display: flex;
  gap: 4px;
  align-items: center;
  width: 100%;
}

.tree-select-wrapper {
  position: relative;
  align-items: stretch;

  .tree-select-display {
    flex: 1;
    border: 1px solid #d0d5dd;
    border-radius: 4px;
    padding: 4px 8px;
    background: #fff;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;

    &.open {
      border-color: #3b82f6;
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
    }

    .arrow {
      font-size: 10px;
      color: #667085;
      margin-left: 8px;
    }
  }
}

.tree-dropdown-portal {
  position: fixed;
  z-index: 2000;
  pointer-events: none;
}

.tree-dropdown-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 6px;
  box-shadow: 0 -12px 24px rgba(15, 23, 42, 0.2);
  padding: 8px 0;
  pointer-events: auto;
}

.tree-dropdown-state {
  padding: 8px 12px;
  font-size: 13px;
  color: #475467;

  &.error {
    color: #e74c3c;
  }
}

.tree-node-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-node-label {
  padding: 4px 0;
}

.tree-node-row {
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  color: #344054;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #f3f4f6;
  }

  &.is-selected {
    background: #e0e7ff;
    color: #1d4ed8;
    font-weight: 600;
  }

  &.warning {
    background: #fff7ed;
    color: #b45309;

    &:hover {
      background: #ffedd5;
    }
  }

  &.child {
    padding-left: 24px;
  }
}

.tree-node-row .node-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.tree-node-toggle {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #475467;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1d4ed8;
  }
}

.tree-node-row .badge {
  font-size: 11px;
  color: #475467;
  background: #f2f4f7;
  border-radius: 999px;
  padding: 2px 6px;
  line-height: 1.4;
}
.btn-search-subtype {
  padding: 8px 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }
}

// 유형과 세부유형 컬럼 헤더 및 셀 중앙정렬
:deep(.data-table) {
  thead th:nth-of-type(3),
  thead th:nth-of-type(4),
  tbody td:nth-of-type(3),
  tbody td:nth-of-type(4) {
    text-align: center;
  }
}
</style>
