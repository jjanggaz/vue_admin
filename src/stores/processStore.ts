import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { request } from "@/utils/request";

export interface ProcessItem {
  id: string;
  process_id: string;
  process_type: string;
  process_type_nm: string;
  process_nm: string;
  sub_category: string;
  sub_category_nm: string;
  process_code: string;
  process_symbol: string;
  symbol_id?: string | null;  // 심볼 ID 추가
  viewDetail: string | null;
}

export interface ProcessCodeOption {
  value: string;
  label: string;
}

export interface ProcessDetail {
  process_id?: string;
  processType: string | null;
  processName: string | null;
  subCategory: string | null;
  processCode: string | null;
  processSymbol: string;
  description: string;
  symbolId?: string | null;  // 공정 심볼 ID (공정 심볼 API에서 받은 값)
  originalProcessSymbol?: string;  // 화면 로드 시 원본 공정심볼 파일명 (변경 감지용)
  originalSymbolId?: string | null;  // 화면 로드 시 원본 심볼 ID (변경 감지용)
  language_code?: string | null;  // 언어 코드
  unit_system_code?: string | null;  // 단위 시스템 코드
  siteFile?: File | null;  // 공정심볼 파일 (업로드용)
}

// ProcessDetail.vue에서 사용하는 추가 인터페이스들
export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  hidden?: boolean;
}

export interface FormulaItem {
  id: string;
  no: string;
  registeredFormula: string;
  formula_code: string;
  registrationDate: string;
  infoOverview: string;
  remarks: string;
  formula_id?: string; // API에서 받은 ID (선택적)
  _file?: File; // hidden 속성으로 MultipartFile 정보 저장
}

export interface PidItem {
  id: string;
  pfdFileName: string;
  pidFileDwg: string;
  mappingExcel: string;
  infoOverview: string;
  svgPreview: string;
}

export interface PfdItem {
  id: string;
  pfdFileName: string;
  registrationDate: string;
  infoOverview: string;
  mappingPidList: string;
  remarks: string;
  drawing_id?: string;
  _file?: File;
}

export interface DesignItem {
  id: string;
  columnNm: string;
  influent: string;
  effluent: string;
  sludge: string;
  unit: string;
  remark: string;
}

export interface DesignCriteriaItem {
  id: string;
  columnNm: string;
  value: string;
  min: string;
  max: string;
  unit: string;
  remark: string;
}

export interface DesignParameterItem {
  id: string;
  columnNm: string;
  view: string;
}

export interface DesignEfficiencyItem {
  id: string;
  columnNm: string;
  value: string;
  min: string;
  max: string;
  unit: string;
  remark: string;
}

export interface HydraulicItem {
  id: string;
  dwg: string;
  xlsx: string;
  csv: string;
  remarks: string;
  _file?: File; // hidden 속성으로 MultipartFile 정보 저장
  drawing_id?: string; // 히든컬럼으로 drawing_id 저장
}

export interface StructItem {
  id: string;
  division: string;      // 구분
  components: string;    // Components
  type: string;          // 유형
  inputItem: string;     // 입력Item
}

export interface GlobalProcessData {
  level2_code_key: string;
  level3_code_key: string;
  process_code: string;
}

export const useProcessStore = defineStore("process", () => {
  // 기존 상태들
  const processList = ref<ProcessItem[]>([]);
  const selectedItems = ref<ProcessItem[]>([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const pageSize = ref(10);
  const totalCount = ref(0);

  // 검색 관련 상태
  const searchProcessType = ref<string | null>(null);
  const searchSubCategoryInput = ref<string | null>(null);
  const searchProcessName = ref<string | null>(null);

  // 코드 옵션 상태
  const processTypeOptions = ref<ProcessCodeOption[]>([]);
  const searchProcessTypeOptions = ref<ProcessCodeOption[]>([]);
  const searchSubCategoryOptions = ref<ProcessCodeOption[]>([]);
  const searchProcessNameOptions = ref<ProcessCodeOption[]>([]);

  // ProcessDetail 관련 상태
  const processDetail = ref<ProcessDetail>({
    process_id: undefined,
    processType: null,
    processName: null,
    subCategory: null,
    processCode: null,
    processSymbol: "",
    description: "",
    originalProcessSymbol: "",
    originalSymbolId: null,
  });

  const globalProcessData = ref<GlobalProcessData>({
    level2_code_key: "",
    level3_code_key: "",
    process_code: "",
  });

  // ProcessDetail.vue에서 이동한 상태들
  
  // P&ID 탭 관련 상태
  const pidList = ref<PidItem[]>([]);
  const currentPagePid = ref(1);
  const totalPagesPid = computed(() => Math.ceil(pidList.value.length / pageSize.value) || 1);
  const pagedPidList = computed(() =>
    pidList.value.slice(
      (currentPagePid.value - 1) * pageSize.value,
      currentPagePid.value * pageSize.value
    )
  );
  const selectedPidItems = ref<PidItem[]>([]);

  // 설계조건 탭 관련 상태
  const designList = ref<DesignItem[]>([]);
  const designCriteriaList = ref<DesignCriteriaItem[]>([]);
  const designParameterList = ref<DesignParameterItem[]>([]);
  const designEfficiencyList = ref<DesignEfficiencyItem[]>([]);

  // PFD 탭 관련 상태
  const pfdList = ref<PfdItem[]>([]);
  const selectedPfdItems = ref<PfdItem[]>([]);
  const initialPfdList = ref<PfdItem[]>([]); // 초기값 저장용

  // 계산식 관리 탭 관련 상태
  const formulaList = ref<FormulaItem[]>([]);
  const selectedFormulaItems = ref<FormulaItem[]>([]);
  const initialFormulaList = ref<FormulaItem[]>([]);

  // 수리계통도 탭 관련 상태
  const hydraulicList = ref<HydraulicItem[]>([]);
  const selectedHydraulicItems = ref<HydraulicItem[]>([]);
  const initialHydraulicList = ref<HydraulicItem[]>([]); // 초기값 저장용

  // 공용구조물 탭 관련 상태
  const structList = ref<StructItem[]>([]);

  // 파일 선택 관련 상태
  const selectedFiles = ref<{ [key: string]: File }>({});

  // 모달 관련 상태
  const showFormulaModal = ref(false);
  const selectedFormulaFiles = ref<File[]>([]);

  // computed
  const filteredProcessList = computed(() => {
    return processList.value;
  });

  const totalCountComputed = computed(() => filteredProcessList.value.length);
  const totalPagesComputed = computed(
    () => Math.ceil(totalCountComputed.value / pageSize.value) || 1
  );

  const paginatedProcessList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredProcessList.value.slice(start, end);
  });

  // 액션
  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setCurrentPage = (page: number) => {
    currentPage.value = page;
  };

  // ProcessDetail.vue에서 이동한 액션들
  
  // P&ID 관련 액션
  const setCurrentPagePid = (page: number) => {
    currentPagePid.value = page;
  };

  const setPidList = (list: PidItem[]) => {
    pidList.value = list;
  };

  const setSelectedPidItems = (items: PidItem[]) => {
    selectedPidItems.value = items;
  };

  // 기존 액션들 (실수로 삭제됨)
  const setSelectedItems = (items: ProcessItem[]) => {
    selectedItems.value = items;
  };

  const setSearchProcessType = (value: string | null) => {
    searchProcessType.value = value;
  };

  const setSearchSubCategoryInput = (value: string | null) => {
    searchSubCategoryInput.value = value;
  };

  const setSearchProcessName = (value: string | null) => {
    searchProcessName.value = value;
  };

  const setProcessDetail = (detail: Partial<ProcessDetail>) => {
    processDetail.value = { ...processDetail.value, ...detail };
  };

  const setGlobalProcessData = (data: Partial<GlobalProcessData>) => {
    globalProcessData.value = { ...globalProcessData.value, ...data };
  };

  // 설계조건 관련 액션
  const setDesignList = (list: DesignItem[]) => {
    designList.value = list;
  };

  const setDesignCriteriaList = (list: DesignCriteriaItem[]) => {
    designCriteriaList.value = list;
  };

  const setDesignParameterList = (list: DesignParameterItem[]) => {
    designParameterList.value = list;
  };

  const setDesignEfficiencyList = (list: DesignEfficiencyItem[]) => {
    designEfficiencyList.value = list;
  };

  // PFD 관련 액션
  const setPfdList = (list: PfdItem[]) => {
    pfdList.value = list;
  };

  const setInitialPfdList = (list: PfdItem[]) => {
    initialPfdList.value = list;
  };

  const setSelectedPfdItems = (items: PfdItem[]) => {
    selectedPfdItems.value = items;
  };

  // 계산식 관련 액션
  const setFormulaList = (list: FormulaItem[]) => {
    formulaList.value = list;
  };

  const setSelectedFormulaItems = (items: FormulaItem[]) => {
    selectedFormulaItems.value = items;
  };

  const setInitialFormulaList = (list: FormulaItem[]) => {
    initialFormulaList.value = list;
  };

  // 수리계통도 관련 액션
  const setHydraulicList = (list: HydraulicItem[]) => {
    hydraulicList.value = list;
  };

  const setInitialHydraulicList = (list: HydraulicItem[]) => {
    initialHydraulicList.value = list;
  };

  const setSelectedHydraulicItems = (items: HydraulicItem[]) => {
    selectedHydraulicItems.value = items;
  };

  // 공용구조물 관련 액션
  const setStructList = (list: StructItem[]) => {
    structList.value = list;
  };

  // 파일 관련 액션
  const setSelectedFiles = (files: { [key: string]: File }) => {
    selectedFiles.value = files;
  };

  const setSelectedFile = (key: string, file: File) => {
    selectedFiles.value[key] = file;
  };

  // 모달 관련 액션
  const setShowFormulaModal = (show: boolean) => {
    showFormulaModal.value = show;
  };

  const setSelectedFormulaFiles = (files: File[]) => {
    selectedFormulaFiles.value = files;
  };

  // API 호출 액션
  const searchProcesses = async () => {
    try {
      setLoading(true);
      console.log("검색 시작: /api/process/master/search");

      let requestData;

      // 1. searchProcessName.value != null 인 경우
      if (searchProcessName.value != null) {
        requestData = {
          search_field: "process_code",
          search_value: searchProcessName.value,
        };
      }
      // 2. searchProcessName.value == null && searchSubCategoryInput.value != null 인 경우
      else if (
        searchProcessName.value == null &&
        searchSubCategoryInput.value != null
      ) {
        requestData = {
          search_field: "level3_code_key",
          search_value: searchSubCategoryInput.value,
        };
      }
      // 3. searchProcessName.value == null && searchSubCategoryInput.value == null && searchProcessType.value != null 인 경우
      else if (
        searchProcessName.value == null &&
        searchSubCategoryInput.value == null &&
        searchProcessType.value != null
      ) {
        requestData = {
          search_field: "level2_code_key",
          search_value: searchProcessType.value,
        };
      }
      // 4. 모든 값이 null인 경우 - 기본 검색
      else {
        requestData = {
          search_field: "process_name",
          search_value: "",
        };
      }

      console.log("검색 요청 데이터:", requestData);
      console.log("검색 조건 상태:", {
        searchProcessName: searchProcessName.value,
        searchSubCategoryInput: searchSubCategoryInput.value,
        searchProcessType: searchProcessType.value
      });

      const result = await request("/api/process/master/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("검색 API 응답:", result);

      // API 응답 구조 검증 및 안전한 처리
      if (result && result.success !== false) {
        let processDataArray = [];

        // 응답 데이터 구조에 따른 처리
        if (Array.isArray(result.response)) {
          // 직접 배열로 응답이 온 경우
          processDataArray = result.response;
          console.log("직접 배열 응답:", processDataArray);
        } else if (
          result.response &&
          result.response.items &&
          Array.isArray(result.response.items)
        ) {
          // items 배열로 응답이 온 경우
          processDataArray = result.response.items;
          console.log("items 배열 응답:", processDataArray);
        } else if (result.response && typeof result.response === "object") {
          // 단일 객체로 응답이 온 경우 배열로 변환
          processDataArray = [result.response];
          console.log("단일 객체를 배열로 변환:", processDataArray);
        } else {
          console.log("응답 데이터가 없거나 예상과 다른 구조입니다.");
          processDataArray = [];
        }

        // 검색 결과를 processList에 설정
        if (processDataArray.length > 0) {
          // API 응답 데이터 구조 확인
          console.log("API 응답 데이터 샘플 (첫 번째 항목):", processDataArray[0]);
          console.log("API 응답에서 symbol_id 확인:", processDataArray[0]?.symbol_id);
          
          processList.value = processDataArray.map((item: any) => ({
            id:
              item.id ||
              item.process_id ||
              item.process_code ||
              `process_${Date.now()}_${Math.random()}`,
            process_id: item.process_id || item.id || item.process_code || "",
            process_type: item.level2_code_key || "",
            process_type_nm: item.level2_code_value || "",
            process_nm: item.process_name || "",
            sub_category: item.level3_code_key || "",
            sub_category_nm: item.level3_code_value || "",
            process_code: item.process_code || "",
            process_symbol: item.symbol_uri || "📄",
            symbol_id: item.symbol_id || null,
            symbol_download: (() => {
              const value = item.symbol_download || item.symbol_uri;
              // null, undefined, 빈 문자열, '{}', 'null', 빈 객체 등의 경우 null 반환
              if (!value || value === '' || value === '{}' || value === 'null' || value === 'undefined' || 
                  (typeof value === 'object' && Object.keys(value).length === 0)) {
                return null;
              }
              return value;
            })(),
            viewDetail: "",
          }));

          totalCount.value = processList.value.length;
          totalPages.value = Math.ceil(totalCount.value / pageSize.value);
          currentPage.value = 1;

          // 검색 후 체크박스(선택된 항목들) 초기화
          selectedItems.value = [];

          console.log("processList 업데이트 완료:", processList.value);
          console.log(
            "페이징 정보 - 총 개수:",
            totalCount.value,
            "총 페이지:",
            totalPages.value
          );
        } else {
          // 검색 결과가 없는 경우
          processList.value = [];
          totalCount.value = 0;
          totalPages.value = 1;
          currentPage.value = 1;
          // 체크박스(선택된 항목들) 초기화
          selectedItems.value = [];
          console.log("검색 결과가 없습니다.");
        }
      } else {
        // API 호출 실패 또는 success: false인 경우
        console.log("검색 실패:", result?.message || "알 수 없는 오류");
        processList.value = [];
        totalCount.value = 0;
        totalPages.value = 1;
        currentPage.value = 1;
        // 체크박스(선택된 항목들) 초기화
        selectedItems.value = [];

        // 사용자에게 오류 메시지 표시
        const errorMessage =
          result?.message ||
          result?.response?.message ||
          "검색 중 오류가 발생했습니다.";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("검색 중 예외 발생:", error);

      // 오류 상세 정보 로깅
      if (error.response) {
        console.error("응답 오류:", error.response);
        console.error("응답 상태:", error.response.status);
        console.error("응답 데이터:", error.response.data);
      }
      if (error.request) {
        console.error("요청 오류:", error.request);
      }

      // 400 에러인 경우 특별 처리
      if (error.response && error.response.status === 400) {
        console.error("400 Bad Request - 요청 데이터 형식 오류");
        console.error("요청 데이터:", error.config?.data || "데이터 없음");
        
        // 빈 목록으로 초기화하고 에러를 던지지 않음
        processList.value = [];
        totalCount.value = 0;
        totalPages.value = 1;
        currentPage.value = 1;
        selectedItems.value = [];
        
        // 사용자에게 알림
        throw new Error("검색 조건이 올바르지 않습니다. 검색 조건을 확인해주세요.");
      }

      // 오류 발생 시 테이블 초기화
      processList.value = [];
      totalCount.value = 0;
      totalPages.value = 1;
      currentPage.value = 1;
      // 체크박스(선택된 항목들) 초기화
      selectedItems.value = [];

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchProcessById = async (processId: string) => {
    try {
      setLoading(true);
      console.log("ProcessDetail 검색 시작: /api/process/master/search");
      console.log("전달받은 processId:", processId);
      console.log("processId 타입:", typeof processId);

      if (!processId || processId === "undefined" || processId === "null") {
        console.log("processId가 없거나 유효하지 않아서 검색을 건너뜁니다.");
        return null;
      }

      // processId가 문자열이 아닌 경우 문자열로 변환
      const validProcessId = String(processId).trim();
      
      if (!validProcessId) {
        console.log("processId가 빈 문자열이어서 검색을 건너뜁니다.");
        return null;
      }

      const requestData = {
        search_field: "process_id",
        search_value: validProcessId,
      };

      console.log("검색 요청 데이터:", requestData);
      console.log("요청 데이터 JSON:", JSON.stringify(requestData));

      const result = await request("/api/process/master/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("검색 API 응답:", result);

      // API 응답 구조 검증 및 안전한 처리
      if (result && result.success !== false) {
        let processData;

        // 응답 데이터 구조에 따른 처리
        if (Array.isArray(result.response) && result.response.length > 0) {
          // 배열로 응답이 온 경우 첫 번째 항목만 사용
          processData = result.response[0];
          console.log("배열 응답에서 첫 번째 항목 사용:", processData);
        } else if (
          result.response &&
          result.response.items &&
          Array.isArray(result.response.items) &&
          result.response.items.length > 0
        ) {
          // items 배열로 응답이 온 경우 첫 번째 항목만 사용
          processData = result.response.items[0];
          console.log("items 배열에서 첫 번째 항목 사용:", processData);
        } else if (
          result.response &&
          typeof result.response === "object" &&
          !Array.isArray(result.response)
        ) {
          // 단일 객체로 응답이 온 경우
          processData = result.response;
          console.log("단일 객체 응답 사용:", processData);
        } else {
          console.log("검색 결과가 없거나 응답 형식이 올바르지 않습니다.");
          console.log("응답 데이터:", result.response);
          return null;
        }

        // 검색된 데이터를 화면에 표시
        if (processData) {
          console.log("=== 검색된 공정 데이터 ===");
          console.log("전체 API 응답 데이터:", JSON.stringify(processData, null, 2));
          console.log(
            "level2_code_value (공정구분):",
            processData.level2_code_value
          );
          console.log(
            "level3_code_value (공정 중분류):",
            processData.level3_code_value
          );
          console.log("process_name (공정명):", processData.process_name);
          console.log("process_name 타입:", typeof processData.process_name);
          console.log("symbol_uri (공정심볼):", processData.symbol_uri);
          console.log("================================");

          // 전역변수에 공정 데이터 저장
          setGlobalProcessData({
            level2_code_key: processData.level2_code_key || "",
            level3_code_key: processData.level3_code_key || "",
            process_code: processData.process_code || "",
          });

          console.log(
            "전역변수에 저장된 공정 데이터:",
            globalProcessData.value
          );

          // 검색된 데이터를 화면 입력 필드에 설정
          setProcessDetail({
            process_id: processData.process_id || processId,
            processType: processData.level2_code_key || null,
            subCategory: processData.level3_code_key || null,
            processName: processData.process_name || null,
            processCode: processData.process_code || null,
            description: processData.process_description || "",
            processSymbol: processData.symbol_uri && processData.symbol_uri !== null ? processData.symbol_uri : "",
            originalProcessSymbol: processData.symbol_uri && processData.symbol_uri !== null ? processData.symbol_uri : "",  // 원본 공정심볼 파일명 저장
            originalSymbolId: processData.symbol_id || null,    // 원본 심볼 ID 저장
            language_code: processData.language_code || null,   // 언어 코드
            unit_system_code: processData.unit_system_code || null,  // 단위 시스템 코드
          });

          // setProcessDetail 호출 후 값 확인
          console.log("=== setProcessDetail 호출 후 확인 ===");
          console.log("설정된 processName:", processData.process_name || null);
          console.log("설정된 processName 타입:", typeof (processData.process_name || null));
          console.log("설정된 subCategory:", processData.level3_code_key || null);
          console.log("설정된 processType:", processData.level2_code_key || null);
          console.log("=====================================");

          if (processData.symbol_uri) {
            // 파일 정보 설정 (실제 구현에서는 파일 객체로 변환 필요)
            console.log("공정 심볼 파일:", processData.symbol_uri);
            console.log("원본 공정심볼 파일명:", processData.symbol_uri);
            console.log("원본 심볼 ID:", processData.symbol_id);
          }

          console.log("화면 입력 필드 업데이트 완료");
          return processData;
        }
      } else {
        // API 호출 실패 또는 success: false인 경우
        console.log("검색 실패:", result?.message || "알 수 없는 오류");
        const errorMessage =
          result?.message ||
          result?.response?.message ||
          "검색 중 오류가 발생했습니다.";
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("ProcessDetail 검색 중 예외 발생:", error);

      // 오류 상세 정보 로깅
      if (error.response) {
        console.error("응답 오류:", error.response);
      }
      if (error.request) {
        console.error("요청 오류:", error.request);
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadProcessTypeCodes = async () => {
    try {
      setLoading(true);
      console.log("공정 코드 검색 시작: /api/process/code/search");

      const requestData = {
        search_field: "parent_key",
        search_value: "PRC_FLW",
        order_by: "code_order",
        order_direction: "asc",
      };

      const result = await request("/api/process/code/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("API 응답:", result);

      if (result.success) {
        console.log("API 응답 데이터:", result.response);

        // result.response에서 code_key를 키로, code_value를 값으로 하는 공정구분 콤보 옵션 생성
        if (result.response && Array.isArray(result.response)) {
          const options = result.response.map((item: any) => ({
            value: item.code_key,
            label: item.code_value,
          }));

          processTypeOptions.value = options;
          searchProcessTypeOptions.value = options;

          console.log("생성된 공정구분 옵션:", processTypeOptions.value);
          console.log("생성된 검색 옵션:", searchProcessTypeOptions.value);
        }
      } else {
        throw new Error(`공정 코드 검색 실패: ${result.message}`);
      }
    } catch (error: any) {
      console.error("공정 코드 검색 실패:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadSubCategoryCodes = async (parentKey: string) => {
    try {
      setLoading(true);
      console.log("중분류 코드 검색 시작: /api/process/code/search");

      const requestData = {
        search_field: "parent_key",
        search_value: parentKey,
        order_by: "code_order",
        order_direction: "asc",
      };

      const result = await request("/api/process/code/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("API 응답:", result);

      if (result.success) {
        console.log("API 응답 데이터:", result.response);

        // result.response에서 code_key를 키로, code_value를 값으로 하는 중분류 콤보 옵션 생성
        if (result.response && Array.isArray(result.response)) {
          searchSubCategoryOptions.value = result.response.map((item: any) => ({
            value: item.code_key,
            label: item.code_value,
          }));

          console.log("생성된 중분류 옵션:", searchSubCategoryOptions.value);
        } else {
          console.log("중분류 데이터가 없습니다.");
        }
      } else {
        throw new Error(`중분류 코드 검색 실패: ${result.message}`);
      }
    } catch (error: any) {
      console.error("중분류 코드 검색 실패:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadProcessNameCodes = async (parentKey: string) => {
    try {
      setLoading(true);
      console.log("공정명 코드 검색 시작: /api/process/code/search");

      const requestData = {
        search_field: "parent_key",
        search_value: parentKey,
        order_by: "code_order",
        order_direction: "asc",
      };

      const result = await request("/api/process/code/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("API 응답:", result);

      if (result.success) {
        console.log("API 응답 데이터:", result.response);

        // result.response에서 code_key를 키로, code_value를 값으로 하는 공정명 콤보 옵션 생성
        if (result.response && Array.isArray(result.response)) {
          searchProcessNameOptions.value = result.response.map((item: any) => ({
            value: item.code_key,
            label: item.code_value,
          }));

          console.log("생성된 공정명 옵션:", searchProcessNameOptions.value);
        } else {
          console.log("공정명 데이터가 없습니다.");
        }
      } else {
        throw new Error(`공정명 코드 검색 실패: ${result.message}`);
      }
    } catch (error: any) {
      console.error("공정명 코드 검색 실패:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProcesses = async (processIds: string[], symbolIds?: string[]) => {
    try {
      setLoading(true);
      console.log("삭제할 process_id 목록:", processIds);
      console.log("삭제할 symbol_id 목록:", symbolIds);

      // 각 process_id에 대해 삭제 API 호출
      const deletePromises = processIds.map(async (processId, index) => {
        if (!processId) {
          console.warn("process_id가 없는 항목:", processId);
          return { success: false, message: "process_id가 없습니다." };
        }

        try {
          // 해당 process_id에 대응하는 symbol_id 찾기
          const symbolId = symbolIds && symbolIds[index] ? symbolIds[index] : null;
          
          console.log(`삭제 처리 중 - index: ${index}, processId: ${processId}, symbolId: ${symbolId}`);
          console.log(`symbolIds 배열:`, symbolIds);
          console.log(`symbolIds[${index}]:`, symbolIds ? symbolIds[index] : 'symbolIds is null/undefined');
          console.log(`symbolId 상세 정보:`, {
            value: symbolId,
            type: typeof symbolId,
            isNull: symbolId === null,
            isUndefined: symbolId === undefined,
            isEmpty: symbolId === '',
            isWhitespace: symbolId && symbolId.trim() === '',
            length: symbolId ? symbolId.length : 'N/A',
            charCodeAt: symbolId ? symbolId.split('').map(c => c.charCodeAt(0)) : 'N/A'
          });
          
          // 삭제 요청 데이터 준비
          const deleteData: any = {
            process_id: processId
          };
          
          if (symbolId && symbolId !== null && symbolId !== undefined && symbolId !== '') {
            deleteData.symbol_id = symbolId;
            console.log(`process_id ${processId}와 symbol_id ${symbolId} 삭제 요청`);
          } else {
            console.log(`process_id ${processId} 삭제 요청 (symbol_id 없음: ${symbolId})`);
          }
          
          console.log('최종 deleteData:', deleteData);

          // request 함수의 두 번째 파라미터로 쿼리 파라미터 전달
          const queryParams = symbolIds && symbolIds[index] ? { symbol_id: symbolIds[index] } : undefined;
          
          console.log('=== DELETE 요청 시작 ===');
          console.log('processId:', processId);
          console.log('queryParams:', queryParams);
          console.log('request 함수 호출 전');
          
          const result = await request(
            `/api/process/master/delete/${processId}`,
            queryParams,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          
          console.log('request 함수 호출 후');

          console.log(`process_id ${processId} 삭제 결과:`, result);
          return result;
        } catch (error: any) {
          console.error(`process_id ${processId} 삭제 실패:`, error);
          return { success: false, message: error.message || "삭제 실패" };
        }
      });

      // 모든 삭제 요청 완료 대기
      const deleteResults = await Promise.all(deletePromises);

      // 삭제 결과 분석
      const successCount = deleteResults.filter(
        (result) => result.success
      ).length;
      const failCount = deleteResults.filter(
        (result) => !result.success
      ).length;

      console.log("삭제 결과 요약:", {
        successCount,
        failCount,
        total: processIds.length,
      });

      if (successCount > 0) {
        // 성공한 항목들을 로컬 목록에서 제거
        const successProcessIds = processIds.filter(
          (_, index) => deleteResults[index].success
        );
        processList.value = processList.value.filter(
          (item) => !successProcessIds.includes(item.process_id)
        );

        totalCount.value = processList.value.length;
        totalPages.value = Math.ceil(totalCount.value / pageSize.value);

        // 선택된 항목 초기화
        selectedItems.value = [];

        return { successCount, failCount };
      } else {
        throw new Error("모든 항목 삭제에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("삭제 처리 중 오류:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 계산식 파일 저장 함수
  const saveFormulaFiles = async (processId: string, formulaFiles: any[]) => {
    try {
      console.log('=== 계산식 파일 저장 시작 ===');
      console.log('processId:', processId);
      console.log('formulaFiles:', formulaFiles);
      console.log('formulaFiles.length:', formulaFiles.length);
      
      if (!processId) {
        console.error('processId가 없습니다. processId:', processId);
        throw new Error('processId가 없습니다.');
      }
      
      console.log('processId 검증 통과:', processId);
      
      if (!formulaFiles || formulaFiles.length === 0) {
        console.log('저장할 계산식 파일이 없습니다.');
        return;
      }
      
      for (let i = 0; i < formulaFiles.length; i++) {
        const formulaItem = formulaFiles[i];
        console.log(`계산식 파일 ${i + 1}/${formulaFiles.length} 처리:`, formulaItem);
        
        if (formulaItem._file) {
          const formData = new FormData();
          formData.append('process_id', processId); // process_id 사용
          formData.append('formula_file', formulaItem._file);
          formData.append('registered_formula', formulaItem.registeredFormula);
          formData.append('formula_code', formulaItem.formula_code || '');
          formData.append('info_overview', formulaItem.infoOverview || '');
          formData.append('remarks', formulaItem.remarks || '');
          
                  console.log('=== 계산식 파일 저장 요청 ===');
        console.log('process_id:', processId);
        console.log('process_id 타입:', typeof processId);
        console.log('file_name:', formulaItem._file.name);
        console.log('file_size:', formulaItem._file.size);
        console.log('file_type:', formulaItem._file.type);
        console.log('registered_formula:', formulaItem.registeredFormula);
        console.log('formula_code:', formulaItem.formula_code);
        console.log('info_overview:', formulaItem.infoOverview);
        console.log('remarks:', formulaItem.remarks);
          
          const result = await request("/api/process/formula/upload", undefined, {
            method: "POST",
            body: formData,
          });
          
          console.log('계산식 파일 저장 응답:', result);
          
          if (!result.success) {
            console.error('계산식 파일 저장 실패:', result);
            throw new Error(`계산식 파일 저장 실패: ${result.message || '알 수 없는 오류'}`);
          }
        } else {
          console.warn('계산식 파일에 _file이 없습니다:', formulaItem);
        }
      }
      
      console.log('=== 모든 계산식 파일 저장 완료 ===');
    } catch (error) {
      console.error('계산식 파일 저장 중 오류:', error);
      throw error;
    }
  };

  const createProcess = async (processData: any) => {
    try {
      setLoading(true);
      console.log("=== processStore createProcess 시작 ===");
      console.log("공정 등록 요청 데이터:", processData);
      console.log("processData.siteFile:", processData.siteFile);
      console.log("processData.process_name:", processData.process_name);
      console.log("processData.process_code:", processData.process_code);
      console.log("processData.formula_files:", processData.formula_files);
      console.log("processData.formula_files?.length:", processData.formula_files?.length);
      console.log("processData 키들:", Object.keys(processData));
      console.log("=== processStore createProcess 데이터 확인 완료 ===");

      // siteFile이 있는 경우 FormData로 전송, 없으면 JSON으로 전송
      if (processData.siteFile) {
        console.log("=== FormData로 전송 (siteFile 포함) ===");
        console.log("siteFile:", processData.siteFile.name);
        console.log("siteFile 크기:", processData.siteFile.size);
        console.log("siteFile 타입:", processData.siteFile.type);
        
        // FormData로 공정 생성 API 호출
        const formData = new FormData();
        formData.append('language_code', processData.language_code || '');
        formData.append('unit_system_code', processData.unit_system_code || '');
        formData.append('process_code', processData.process_code || '');
        formData.append('process_name', processData.process_name || '');
        formData.append('process_type_code', processData.process_type_code || '');
        formData.append('process_category', processData.process_category || '');
        formData.append('siteFile', processData.siteFile);
        
        if (processData.file_upload_rows) {
          formData.append('file_upload_rows', JSON.stringify(processData.file_upload_rows));
        }
        
        if (processData.formula_files) {
          console.log('FormData에 formula_files 추가:', processData.formula_files);
          formData.append('formula_files', JSON.stringify(processData.formula_files));
        } else {
          console.log('processData.formula_files가 없어서 FormData에 추가하지 않음');
        }
        
        console.log('FormData 내용:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
        
        const result = await request("/api/process/master/create", undefined, {
          method: "POST",
          body: formData,
        });
        
        console.log("공정 등록 API 응답 (FormData):", result);
        console.log("=== API 응답 상세 분석 ===");
        console.log("result 타입:", typeof result);
        console.log("result 구조:", result);
        console.log("result.response 타입:", typeof result.response);
        console.log("result.response 구조:", result.response);
        console.log("result.response 키들:", result.response ? Object.keys(result.response) : 'response 없음');
        
        // API 응답의 모든 레벨에서 process_id 검색
        console.log("=== process_id 검색 시작 ===");
        console.log("result.process_id:", result.process_id);
        console.log("result.response.process_id:", result.response?.process_id);
        console.log("result.response.id:", result.response?.id);
        console.log("result.response.data:", result.response?.data);
        console.log("result.response.data.process_id:", result.response?.data?.process_id);
        console.log("result.response.data.id:", result.response?.data?.id);
        
        // process_id 추출 로직 강화 (모든 가능한 위치에서 process_id 찾기)
        let processId = null;
        
        // 1단계: result.response에서 직접 찾기
        if (result.response) {
          const directIds = [
            result.response.process_id,
            result.response.id,
            result.response.processId
          ];
          
          processId = directIds.find(id => id != null && id !== '');
          console.log("1단계 - result.response에서 직접 검색:", {
            directIds: directIds,
            found: processId
          });
        }
        
        // 2단계: result.response.data에서 찾기
        if (!processId && result.response?.data) {
          const dataIds = [
            result.response.data.process_id,
            result.response.data.id,
            result.response.data.processId
          ];
          
          processId = dataIds.find(id => id != null && id !== '');
          console.log("2단계 - result.response.data에서 검색:", {
            dataIds: dataIds,
            found: processId
          });
        }
        
        // 3단계: result.response.data.response에서 찾기
        if (!processId && result.response?.data?.response) {
          const nestedIds = [
            result.response.data.response.process_id,
            result.response.data.response.id,
            result.response.data.response.processId
          ];
          
          processId = nestedIds.find(id => id != null && id !== '');
          console.log("3단계 - result.response.data.response에서 검색:", {
            nestedIds: nestedIds,
            found: processId
          });
        }
        
        // 4단계: result 전체에서 찾기
        if (!processId) {
          const resultIds = [
            result.process_id,
            result.id,
            result.processId
          ];
          
          processId = resultIds.find(id => id != null && id !== '');
          console.log("4단계 - result 전체에서 검색:", {
            resultIds: resultIds,
            found: processId
          });
        }
        
        console.log("=== 최종 process_id 추출 결과 ===");
        console.log("추출된 process_id:", processId);
        console.log("process_id 타입:", typeof processId);
        
        // process_id를 찾지 못한 경우
        if (!processId) {
          console.error('❌ API 응답에서 process_id를 찾을 수 없습니다!');
          console.log('서버 개발자에게 /api/process/master/create API 응답에 process_id를 포함하도록 요청이 필요합니다.');
          throw new Error('process_id를 찾을 수 없습니다. API 응답에 process_id가 포함되어야 합니다.');
        }
        
        console.log("계산식 파일 저장 조건 확인:", {
          resultSuccess: result.success,
          formulaFiles: processData.formula_files,
          formulaFilesLength: processData.formula_files?.length,
          extractedProcessId: processId,
          response: result.response
        });
        
        // 공정 등록 성공 후 계산식 파일들 별도 저장
        if (result.success && processData.formula_files && processData.formula_files.length > 0 && processId) {
          console.log('공정 등록 성공 후 계산식 파일들 저장 시작, processId:', processId);
          await saveFormulaFiles(processId, processData.formula_files);
        } else {
          console.log('계산식 파일 저장 조건 미충족:', {
            resultSuccess: result.success,
            hasFormulaFiles: !!processData.formula_files,
            formulaFilesLength: processData.formula_files?.length,
            hasProcessId: !!processId,
            processId: processId
          });
        }
        
        return result;
      }

      // siteFile이 없는 경우 JSON으로 전송
      const { siteFile, formula_files, ...createData } = processData;
      
      const result = await request("/api/process/master/create", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createData),
      });

      console.log("공정 등록 API 응답:", result);
      console.log("=== API 응답 상세 분석 (JSON) ===");
      console.log("result 타입:", typeof result);
      console.log("result 구조:", result);
      console.log("result.response 타입:", typeof result.response);
      console.log("result.response 구조:", result.response);
      console.log("result.response 키들:", result.response ? Object.keys(result.response) : 'response 없음');
      
      // API 응답의 모든 레벨에서 process_id 검색
      console.log("=== process_id 검색 시작 (JSON) ===");
      console.log("result.process_id:", result.process_id);
      console.log("result.response.process_id:", result.response?.process_id);
      console.log("result.response.id:", result.response?.id);
      console.log("result.response.data:", result.response?.data);
      console.log("result.response.data.process_id:", result.response?.data?.process_id);
      console.log("result.response.data.id:", result.response?.data?.id);
      
      // process_id 추출 로직 강화 (모든 가능한 위치에서 process_id 찾기)
      let processId = null;
      
      // 1단계: result.response에서 직접 찾기
      if (result.response) {
        const directIds = [
          result.response.process_id,
          result.response.id,
          result.response.processId
        ];
        
        processId = directIds.find(id => id != null && id !== '');
        console.log("1단계 - result.response에서 직접 검색 (JSON):", {
          directIds: directIds,
          found: processId
        });
      }
      
      // 2단계: result.response.data에서 찾기
      if (!processId && result.response?.data) {
        const dataIds = [
          result.response.data.process_id,
          result.response.data.id,
          result.response.data.processId
        ];
        
        processId = dataIds.find(id => id != null && id !== '');
        console.log("2단계 - result.response.data에서 검색 (JSON):", {
          dataIds: dataIds,
          found: processId
        });
      }
      
      // 3단계: result.response.data.response에서 찾기
      if (!processId && result.response?.data?.response) {
        const nestedIds = [
          result.response.data.response.process_id,
          result.response.data.response.id,
          result.response.data.response.processId
        ];
        
        processId = nestedIds.find(id => id != null && id !== '');
        console.log("3단계 - result.response.data.response에서 검색 (JSON):", {
          nestedIds: nestedIds,
          found: processId
        });
      }
      
      // 4단계: result 전체에서 찾기
      if (!processId) {
        const resultIds = [
          result.process_id,
          result.id,
          result.processId
        ];
        
        processId = resultIds.find(id => id != null && id !== '');
        console.log("4단계 - result 전체에서 검색 (JSON):", {
          resultIds: resultIds,
          found: processId
        });
      }
      
      console.log("=== 최종 process_id 추출 결과 (JSON) ===");
      console.log("추출된 process_id:", processId);
      console.log("process_id 타입:", typeof processId);
      
      // process_id를 찾지 못한 경우
      if (!processId) {
        console.error('❌ API 응답에서 process_id를 찾을 수 없습니다!');
        console.log('서버 개발자에게 /api/process/master/create API 응답에 process_id를 포함하도록 요청이 필요합니다.');
        throw new Error('process_id를 찾을 수 없습니다. API 응답에 process_id가 포함되어야 합니다.');
      }
      
      console.log("계산식 파일 저장 조건 확인 (JSON):", {
        resultSuccess: result.success,
        formulaFiles: formula_files,
        formulaFilesLength: formula_files?.length,
        extractedProcessId: processId,
        response: result.response
      });
      
      // 공정 등록 성공 후 계산식 파일들 별도 저장
      if (result.success && formula_files && formula_files.length > 0 && processId) {
        console.log('공정 등록 성공 후 계산식 파일들 저장 시작 (JSON), processId:', processId);
        await saveFormulaFiles(processId, formula_files);
      } else {
        console.log('계산식 파일 저장 조건 미충족 (JSON):', {
          resultSuccess: result.success,
          hasFormulaFiles: !!formula_files,
          formulaFilesLength: formula_files?.length,
          hasProcessId: !!processId,
          processId: processId
        });
      }

      // HTTP 상태 코드 확인 (409 Conflict 등)
      if (result.status && result.status >= 400) {
        console.error("HTTP 오류 상태 코드:", result.status);
        
        let errorMessage = "공정 등록에 실패했습니다.";
        
        if (result.response) {
          try {
            const responseData = JSON.parse(result.response);
            if (responseData.detail) {
              errorMessage = responseData.detail;
            }
          } catch {
            // JSON 파싱 실패 시 기본 메시지 사용
          }
        }
        
        throw new Error(errorMessage);
      }

      // response.data.success 확인 (서버가 success: true와 함께 response.data.success: false를 보내는 경우)
      if (result.response && result.response.data && result.response.data.success === false) {
        console.error("API response.data 오류 응답:", result.response.data);
        
        let errorMessage = "공정 등록에 실패했습니다.";
        if (result.response.data.message) {
          errorMessage = result.response.data.message;
        }
        
        throw new Error(errorMessage);
      }
      
      // success 필드 확인
      if (result.success === false) {
        console.error("API 오류 응답:", result);
        
        let errorMessage = "공정 등록에 실패했습니다.";
        if (result.message) {
          errorMessage = result.message;
        } else if (result.response) {
          try {
            const responseData = JSON.parse(result.response);
            if (responseData.detail) {
              errorMessage = responseData.detail;
            }
          } catch {
            // JSON 파싱 실패 시 기본 메시지 사용
          }
        }
        
        throw new Error(errorMessage);
      }

      // message 필드에서 오류 키워드 확인 (서버가 success: true와 함께 오류 메시지를 보내는 경우)
      if (result.message && (
        result.message.includes("이미 사용 중인 값입니다") ||
        result.message.includes("실패") ||
        result.message.includes("오류") ||
        result.message.includes("에러")
      )) {
        console.error("API 오류 메시지 감지:", result.message);
        throw new Error(result.message);
      }

      if (result.success) {
        // 등록 성공
        console.log("공정 등록 성공");
        await searchProcesses();
        return result;
      } else {
        // 응답에 success 필드가 없는 경우
        throw new Error("API 응답 형식이 올바르지 않습니다.");
      }
    } catch (error: any) {
      console.error("등록 실패:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProcess = async (
    processId: string,
    processData: ProcessDetail
  ) => {
    try {
      setLoading(true);
      console.log("공정 수정 요청 데이터:", { processId, processData });

      // API 요청을 위한 데이터 구조 변환
      console.log("=== processData 원본 데이터 ===");
      console.log("processData.processType:", processData.processType);
      console.log("processData.processCode:", processData.processCode);
      console.log("processData.processName:", processData.processName);
      console.log("processData.subCategory:", processData.subCategory);
      console.log("processData.processSymbol:", processData.processSymbol);
      console.log("processData.description:", processData.description);
      console.log("processData.siteFile:", processData.siteFile);
      
      // siteFile이 있는 경우 FormData로 전송, 없으면 JSON으로 전송
      if (processData.siteFile) {
        console.log("=== FormData로 전송 (siteFile 포함) ===");
        console.log("siteFile:", processData.siteFile.name);
        console.log("siteFile 크기:", processData.siteFile.size);
        console.log("siteFile 타입:", processData.siteFile.type);
        
        // FormData로 공정 업데이트 API 호출
        const formData = new FormData();
        formData.append('process_code', processData.processCode || '');
        formData.append('process_type_code', processData.processType || '');
        formData.append('process_name', processData.processName || '');
        formData.append('process_category', processData.subCategory || '');
        formData.append('process_description', processData.description || '');
        formData.append('siteFile', processData.siteFile);
        
        if (processData.symbolId) {
          formData.append('symbol_id', processData.symbolId);
        }
        
        console.log('FormData 내용:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
        
        const result = await request(`/api/process/master/update/${processId}`, undefined, {
          method: "PUT",
          body: formData,
        });
        
        console.log("공정 수정 API 응답 (FormData):", result);
        return result;
      }
      
      // API 서버에서 요구하는 필드명으로 데이터 구조 변환
      const updateData: any = {
        process_code: processData.processCode || "",          // 공정 코드 (내부 코드값)
        process_type_code: processData.processType || "",     // 공정 타입 코드
        process_name: processData.processName || "",          // 공정명 (표시명)
        process_category: processData.subCategory || "",      // 공정 카테고리
        process_symbol: processData.processSymbol || "",      // 공정 심볼
        process_description: processData.description || "",   // 공정 설명
      };
      
      // symbol_id가 유효한 값인 경우에만 추가
      if (processData.symbolId && processData.symbolId.trim() !== "") {
        updateData.symbol_id = processData.symbolId;
      }
      
      console.log("=== API 요청용 변환된 데이터 ===");
      console.log("process_code:", updateData.process_code);
      console.log("process_type_code:", updateData.process_type_code);
      console.log("process_name:", updateData.process_name);
      console.log("process_category:", updateData.process_category);
      console.log("process_symbol:", updateData.process_symbol);
      console.log("process_description:", updateData.process_description);
      console.log("symbol_id:", updateData.symbol_id);

      console.log("=== 최종 API 요청 데이터 ===");
      console.log("URL:", `/api/process/master/update/${processId}`);
      console.log("Method:", "PUT");
      console.log("Request Body:", JSON.stringify(updateData, null, 2));
      
      const result = await request(`/api/process/master/update/${processId}`, undefined, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      console.log("공정 수정 API 응답:", result);

      // HTTP 상태 코드 확인 (409 Conflict 등)
      if (result.status && result.status >= 400) {
        console.error("HTTP 오류 상태 코드:", result.status);
        
        let errorMessage = "공정 수정에 실패했습니다.";
        
        if (result.response) {
          try {
            const responseData = JSON.parse(result.response);
            if (responseData.detail) {
              errorMessage = responseData.detail;
            }
          } catch {
            // JSON 파싱 실패 시 기본 메시지 사용
          }
        }
        
        throw new Error(errorMessage);
      }

      // success 필드 확인
      if (result.success === false) {
        console.error("API 오류 응답:", result);
        
        let errorMessage = "공정 수정에 실패했습니다.";
        if (result.message) {
          errorMessage = result.message;
        } else if (result.response) {
          try {
            const responseData = JSON.parse(result.response);
            if (responseData.detail) {
              errorMessage = responseData.detail;
            }
          } catch {
            // JSON 파싱 실패 시 기본 메시지 사용
          }
        }
        
        throw new Error(errorMessage);
      }

      // message 필드에서 오류 메시지 확인 (서버가 success: true와 함께 오류 메시지를 보내는 경우)
      if (result.message && (
        result.message.includes("이미 사용 중인 값입니다") ||
        result.message.includes("실패") ||
        result.message.includes("오류") ||
        result.message.includes("에러")
      )) {
        console.error("API 오류 메시지 감지:", result.message);
        throw new Error(result.message);
      }

      if (result.success) {
        // 수정 성공
        console.log("공정 수정 성공");
        return result;
      } else {
        // 응답에 success 필드가 없는 경우
        throw new Error("API 응답 형식이 올바르지 않습니다.");
      }
    } catch (error: any) {
      console.error("수정 실패:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 초기화
  const resetState = () => {
    processList.value = [];
    selectedItems.value = [];
    currentPage.value = 1;
    totalPages.value = 1;
    totalCount.value = 0;
    searchProcessType.value = null;
    searchSubCategoryInput.value = null;
    searchProcessName.value = null;
    processDetail.value = {
      process_id: undefined,
      processType: null,
      processName: null,
      subCategory: null,
      processCode: null,
      processSymbol: "",
      description: "",
    };
    globalProcessData.value = {
      level2_code_key: "",
      level3_code_key: "",
      process_code: "",
    };
    
    // ProcessDetail.vue 상태들도 초기화
    pidList.value = [];
    currentPagePid.value = 1;
    selectedPidItems.value = [];
    designList.value = [];
    designCriteriaList.value = [];
    designParameterList.value = [];
    designEfficiencyList.value = [];
    pfdList.value = [];
    selectedPfdItems.value = [];
    formulaList.value = [];
    selectedFormulaItems.value = [];
    initialFormulaList.value = [];
    hydraulicList.value = [];
    selectedHydraulicItems.value = [];
    structList.value = [];
    selectedFiles.value = {};
    showFormulaModal.value = false;
    selectedFormulaFiles.value = [];
    
    // 공정심볼 관련 상태 초기화
    processDetail.value.originalProcessSymbol = "";
    processDetail.value.originalSymbolId = null;
  };

  return {
    // 기존 상태
    processList,
    selectedItems,
    loading,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    searchProcessType,
    searchSubCategoryInput,
    searchProcessName,
    processTypeOptions,
    searchProcessTypeOptions,
    searchSubCategoryOptions,
    searchProcessNameOptions,
    processDetail,
    globalProcessData,

    // ProcessDetail.vue에서 이동한 상태들
    pidList,
    currentPagePid,
    totalPagesPid,
    pagedPidList,
    selectedPidItems,
    designList,
    designCriteriaList,
    designParameterList,
    designEfficiencyList,
    pfdList,
    selectedPfdItems,
    initialPfdList,
    formulaList,
    selectedFormulaItems,
    initialFormulaList,
    hydraulicList,
    initialHydraulicList,
    selectedHydraulicItems,
    structList,
    selectedFiles,
    showFormulaModal,
    selectedFormulaFiles,

    // computed
    filteredProcessList,
    totalCountComputed,
    totalPagesComputed,
    paginatedProcessList,

    // 기존 액션
    setLoading,
    setCurrentPage,
    setSelectedItems,
    setSearchProcessType,
    setSearchSubCategoryInput,
    setSearchProcessName,
    setProcessDetail,
    setGlobalProcessData,
    searchProcesses,
    searchProcessById,
    loadProcessTypeCodes,
    loadSubCategoryCodes,
    loadProcessNameCodes,
    deleteProcesses,
    createProcess,
    updateProcess,
    saveFormulaFiles,
    resetState,

    // ProcessDetail.vue에서 이동한 액션들
    setCurrentPagePid,
    setPidList,
    setSelectedPidItems,
    setDesignList,
    setDesignCriteriaList,
    setDesignParameterList,
    setDesignEfficiencyList,
    setPfdList,
    setInitialPfdList,
    setSelectedPfdItems,
    setFormulaList,
    setSelectedFormulaItems,
    setInitialFormulaList,
    setHydraulicList,
    setInitialHydraulicList,
    setSelectedHydraulicItems,
    setStructList,
    setSelectedFiles,
    setSelectedFile,
    setShowFormulaModal,
    setSelectedFormulaFiles,
  };
});
