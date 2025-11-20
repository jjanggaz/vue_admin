<template>
  <div class="asset3d-preset-register-tab">
    <!-- 등록 폼 -->
    <div class="register-form">
      <div class="form-row">
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
            <option
              v-for="machine in machineOptions"
              :key="machine.code_id"
              :value="machine.code_key"
            >
              {{ machine.code_value }}
            </option>
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
        </div>
        <div class="form-group button-group">
          <button type="button" class="btn-add-row" @click="handleAddRow">
            +행 추가
          </button>
          <button type="button" class="btn-delete-row" @click="handleDeleteRow">
            -행 삭제
          </button>
        </div>
      </div>
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
        <template #cell-diameter="{ item }">
          <input
            type="text"
            v-model="item.diameter"
            class="table-input"
            placeholder="직경"
          />
        </template>
        <template #cell-equipmentCode="{ item }">
          <input
            type="text"
            v-model="item.equipmentCode"
            class="table-input"
            placeholder="장비 코드"
          />
        </template>
        <template #cell-dtdxModel="{ item }">
          <input
            type="text"
            v-model="item.dtdxModel"
            class="table-input"
            placeholder="Dtdx 모델"
          />
        </template>
        <template #cell-unitPrice="{ item }">
          <input
            type="text"
            v-model="item.unitPrice"
            class="table-input"
            placeholder="단가"
          />
        </template>
        <template #cell-length="{ item }">
          <input
            type="text"
            v-model="item.length"
            class="table-input"
            placeholder="길이"
          />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import DataTable, { type TableColumn } from "@/components/common/DataTable.vue";
import { useAsset3DStore } from "@/stores/asset3DStore";
import { useMachineStore } from "@/stores/machineStore";

const { t } = useI18n();
const asset3DStore = useAsset3DStore();
const machineStore = useMachineStore();

// 폼 데이터
const selectedUnit = ref("");
const selectedMachine = ref("");
const presetName = ref("");
const thumbnailFile = ref<File | null>(null);
const thumbnailFileName = ref("");
const thumbnailFileInput = ref<HTMLInputElement | null>(null);

// 연결기계 옵션
const machineOptions = ref<any[]>([]);

// 테이블 데이터
interface TableRow {
  id: number;
  no: number;
  type: string;
  diameter: string;
  equipmentCode: string;
  dtdxModel: string;
  unitPrice: string;
  length: string;
  remarks: string;
}

const tableRows = ref<TableRow[]>([]);
const selectedRows = ref<TableRow[]>([]);
let nextRowId = 1;

// 유형 옵션
const typeOptions = ref([
  { value: "piping", label: "배관" },
  { value: "flange", label: "플랜지" },
  { value: "longBendPipe", label: "롱곡관" },
  { value: "manualValve", label: "수동밸브" },
  { value: "stainlessFlexible", label: "스테인리스 플랙시블" },
  { value: "castIronSwingCheckValve", label: "주철스윙 체크밸브" },
  { value: "straightPipe", label: "직관" },
  { value: "tee", label: "티" },
]);

// 테이블 컬럼 정의
const tableColumns: TableColumn[] = [
  { key: "no", title: "번호", width: "80px", sortable: false },
  { key: "type", title: "유형", width: "150px", sortable: false },
  { key: "diameter", title: "직경", width: "120px", sortable: false },
  { key: "equipmentCode", title: "장비 코드", width: "200px", sortable: false },
  { key: "dtdxModel", title: "Dtdx 모델", width: "200px", sortable: false },
  { key: "unitPrice", title: "단가", width: "120px", sortable: false },
  { key: "length", title: "길이", width: "120px", sortable: false },
  { key: "remarks", title: "비고", width: "150px", sortable: false },
];

// 컴포넌트 마운트 시 초기화
onMounted(async () => {
  // 공통코드 조회
  try {
    await asset3DStore.fetchCommonCodes("");
    // 연결기계 옵션은 기계 대분류에서 가져옴
    await machineStore.fetchCommonCodes("");
    machineOptions.value = machineStore.secondDepth || [];
  } catch (error) {
    console.error("공통코드 조회 실패:", error);
  }
});

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
  } else {
    thumbnailFileName.value = "";
    thumbnailFile.value = null;
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
    diameter: "",
    equipmentCode: "",
    dtdxModel: "",
    unitPrice: "",
    length: "",
    remarks: "",
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

// 유형 변경 핸들러
const handleTypeChange = (item: TableRow) => {
  // 유형 변경 시 필요한 로직이 있으면 여기에 추가
  console.log("유형 변경:", item);
};
</script>

<style scoped lang="scss">
.asset3d-preset-register-tab {
  padding: 20px;
}

.register-form {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;

  &.button-group {
    flex: 0 0 auto;
    flex-direction: row;
    gap: 8px;
    align-items: flex-end;
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

.file-upload-group {
  display: flex;
  gap: 8px;
  align-items: center;

  .form-input {
    flex: 1;
  }
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

.table-section {
  margin-top: 20px;
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
</style>
