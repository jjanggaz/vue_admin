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
  svgFile?: File;
  svgFileName?: string;
  svg_drawing_id?: string;
  excel_file_name?: string;
  svg_file_name?: string;
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
  svgFile?: File;
  svgFileName?: string;
  svg_drawing_id?: string;
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
  const searchLanguage = ref<string>("ko");
  const searchUnit = ref<string>("METRIC");

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

  const setSearchLanguage = (value: string) => {
    searchLanguage.value = value;
  };

  const setSearchUnit = (value: string) => {
    searchUnit.value = value;
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

      // 조회조건에 따른 search_field와 search_value 설정
      let searchField = "";
      let searchValue = "";
      
      // 1. 공정구분만 선택된 경우
      if (searchProcessType.value && !searchSubCategoryInput.value && !searchProcessName.value) {
        searchField = "level2_code_key";
        searchValue = searchProcessType.value;
      }
      // 2. 공정구분과 공정 중분류만 선택된 경우
      else if (searchProcessType.value && searchSubCategoryInput.value && !searchProcessName.value) {
        searchField = "level3_code_key";
        searchValue = searchSubCategoryInput.value;
      }
      // 3. 공정구분, 공정 중분류, 공정명이 모두 선택된 경우
      else if (searchProcessType.value && searchSubCategoryInput.value && searchProcessName.value) {
        searchField = "process_code";
        searchValue = searchProcessName.value;
      }
      // 기본값 (모든 조건이 없는 경우)
      else {
        searchField = "process_code";
        searchValue = searchProcessName.value || "";
      }
      
      const requestData = {
        search_field: searchField,
        search_value: searchValue,
        language_code: searchLanguage.value,
        unit_system_code: searchUnit.value,
        level2_code_key: searchProcessType.value,
        level3_code_key: searchSubCategoryInput.value,
      };

      console.log("=== 조회조건 분석 ===");
      console.log("공정구분:", searchProcessType.value);
      console.log("공정 중분류:", searchSubCategoryInput.value);
      console.log("공정명:", searchProcessName.value);
      console.log("선택된 search_field:", searchField);
      console.log("선택된 search_value:", searchValue);
      
      console.log("=== API 호출 시작 ===");
      console.log("API URL:", "/api/process/master/search");
      console.log("Request Body:", JSON.stringify(requestData));
      
      let result;
      try {
        result = await request("/api/process/master/search", undefined, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
        console.log("=== API 호출 성공 ===");
      } catch (requestError) {
        console.error("=== API 호출 실패 ===");
        console.error("request 함수에서 에러 발생:", requestError);
        throw requestError;
      }
      
      console.log("=== API 호출 완료 ===");

      // API 응답 디버깅
      console.log("=== API 응답 디버깅 ===");
      console.log("requestData:", requestData);
      console.log("API 응답 result:", result);
      console.log("result.success:", result?.success);
      console.log("result.response:", result?.response);
      console.log("result.response 타입:", typeof result?.response);
      console.log("result.response 배열 여부:", Array.isArray(result?.response));

      // API 응답 구조 검증 및 안전한 처리
      if (result && result.success !== false) {
        let processDataArray = [];

        // 서버 응답 구조에 따른 처리
        if (result.items && Array.isArray(result.items)) {
          // 서버에서 직접 items 배열로 응답하는 경우
          processDataArray = result.items;
        } else if (Array.isArray(result.response)) {
          // 직접 배열로 응답이 온 경우
          processDataArray = result.response;
        } else if (
          result.response &&
          result.response.items &&
          Array.isArray(result.response.items)
        ) {
          // response.items 배열로 응답이 온 경우
          processDataArray = result.response.items;
        } else if (result.response && typeof result.response === "object") {
          // 단일 객체로 응답이 온 경우 배열로 변환
          processDataArray = [result.response];
        } else {
          processDataArray = [];
        }

        // 검색 결과를 processList에 설정
        if (processDataArray.length > 0) {
          // API 응답 데이터 구조 확인
          
          processList.value = processDataArray.map((item: any) => {
            // process_info 객체에서 데이터 추출
            const processInfo = item.process_info || item;
            
            return {
              id:
                processInfo.id ||
                processInfo.process_id ||
                processInfo.process_code ||
                `process_${Date.now()}_${Math.random()}`,
              process_id: processInfo.process_id || processInfo.id || processInfo.process_code || "",
              process_type: processInfo.level2_code_key || "",
              process_type_nm: processInfo.level2_code_value || "",
              process_nm: processInfo.process_name || "",
              process_name: processInfo.process_name || "", // 그리드에서 사용할 process_name 추가
              sub_category: processInfo.level3_code_key || "",
              sub_category_nm: processInfo.level3_code_value || "",
              level3_code_key: processInfo.level3_code_key || "", // 그리드에서 사용할 level3_code_key 추가
              process_code: processInfo.process_code || "",
              process_symbol: processInfo.symbol_uri || "📄",
              symbol_id: processInfo.symbol_id || null,
              symbol_download: (() => {
                const value = processInfo.symbol_download || processInfo.symbol_uri;
                // null, undefined, 빈 문자열, '{}', 'null', 빈 객체 등의 경우 null 반환
                if (!value || value === '' || value === '{}' || value === 'null' || value === 'undefined' || 
                    (typeof value === 'object' && Object.keys(value).length === 0)) {
                  return null;
                }
                return value;
              })(),
              viewDetail: "",
            };
          });

          totalCount.value = processList.value.length;
          totalPages.value = Math.ceil(totalCount.value / pageSize.value);
          currentPage.value = 1;

          // 검색 후 체크박스(선택된 항목들) 초기화
          selectedItems.value = [];

        } else {
          // 검색 결과가 없는 경우
          processList.value = [];
          totalCount.value = 0;
          totalPages.value = 1;
          currentPage.value = 1;
          // 체크박스(선택된 항목들) 초기화
          selectedItems.value = [];
        }
      } else {
        // API 호출 실패 또는 success: false인 경우
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
      console.error("=== 검색 중 예외 발생 ===");
      console.error("에러 타입:", typeof error);
      console.error("에러 객체:", error);
      console.error("에러 메시지:", error?.message);
      console.error("에러 스택:", error?.stack);

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
      console.log("=== searchProcessById 함수 호출 ===");
      console.log("전달받은 processId:", processId);

      if (!processId || processId === "undefined" || processId === "null") {
        return null;
      }

      // processId가 문자열이 아닌 경우 문자열로 변환
      const validProcessId = String(processId).trim();
      
      if (!validProcessId) {
        console.log("validProcessId가 유효하지 않음:", validProcessId);
        return null;
      }

      const requestData = {
        search_field: "process_id",
        search_value: validProcessId,
      };
      
      console.log("searchProcessById API 요청 데이터:", JSON.stringify(requestData));

      const result = await request("/api/process/master/search", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });


      // API 응답 구조 검증 및 안전한 처리
      if (result && result.success !== false) {
        let processData;

        // 응답 데이터 구조에 따른 처리
        if (Array.isArray(result.response) && result.response.length > 0) {
          // 배열로 응답이 온 경우 첫 번째 항목만 사용
          processData = result.response[0];
        } else if (
          result.response &&
          result.response.items &&
          Array.isArray(result.response.items) &&
          result.response.items.length > 0
        ) {
          // items 배열로 응답이 온 경우 첫 번째 항목만 사용
          processData = result.response.items[0];
        } else if (
          result.response &&
          typeof result.response === "object" &&
          !Array.isArray(result.response)
        ) {
          // 단일 객체로 응답이 온 경우
          processData = result.response;
        } else {
          return null;
        }

        // 검색된 데이터를 화면에 표시
        if (processData) {

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
            symbolId: processData.symbol_id || null,  // 심볼 ID 설정
            originalProcessSymbol: processData.symbol_uri && processData.symbol_uri !== null ? processData.symbol_uri : "",  // 원본 공정심볼 파일명 저장
            originalSymbolId: processData.symbol_id || null,    // 원본 심볼 ID 저장
            language_code: processData.language_code || null,   // 언어 코드
            unit_system_code: processData.unit_system_code || null,  // 단위 시스템 코드
          });


          if (processData.symbol_uri) {
            // 파일 정보 설정 (실제 구현에서는 파일 객체로 변환 필요)
          }

          return processData;
        }
      } else {
        // API 호출 실패 또는 success: false인 경우
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

      if (result.success) {
        // result.response에서 code_key를 키로, code_value를 값으로 하는 공정구분 콤보 옵션 생성
        if (result.response && Array.isArray(result.response)) {
          const options = result.response.map((item: any) => ({
            value: item.code_key,
            label: item.code_value,
          }));

          processTypeOptions.value = options;
          searchProcessTypeOptions.value = options;
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

      if (result.success) {
        // result.response에서 code_key를 키로, code_value를 값으로 하는 중분류 콤보 옵션 생성
        if (result.response && Array.isArray(result.response)) {
          searchSubCategoryOptions.value = result.response.map((item: any) => ({
            value: item.code_key,
            label: item.code_value,
          }));
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

  // 로딩 상태 변경 없이 중분류 코드를 로드하는 메서드
  const loadSubCategoryCodesSilent = async (parentKey: string) => {
    try {

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

      if (result.success) {
        // result.response에서 code_key를 키로, code_value를 값으로 하는 중분류 콤보 옵션 생성
        if (result.response && Array.isArray(result.response)) {
          const newOptions = result.response.map((item: any) => ({
            value: item.code_key,
            label: item.code_value,
          }));

          // 배열을 직접 교체하지 않고 기존 배열을 수정
          searchSubCategoryOptions.value.splice(0, searchSubCategoryOptions.value.length, ...newOptions);
        }
      } else {
        throw new Error(`중분류 코드 검색 실패: ${result.message}`);
      }
    } catch (error: any) {
      console.error("중분류 코드 검색 실패:", error);
      throw error;
    }
  };

  const loadProcessNameCodes = async (parentKey: string) => {
    try {
      setLoading(true);

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

      if (result.success) {
        // result.response에서 code_key를 키로, code_value를 값으로 하는 공정명 콤보 옵션 생성
        if (result.response && Array.isArray(result.response)) {
          searchProcessNameOptions.value = result.response.map((item: any) => ({
            value: item.code_key,
            label: item.code_value,
          }));
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

  // 로딩 상태 변경 없이 공정명 코드를 로드하는 메서드
  const loadProcessNameCodesSilent = async (parentKey: string) => {
    try {

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
        // result.response에서 code_key를 키로, code_value를 값으로 하는 공정명 콤보 옵션 생성
        if (result.response && Array.isArray(result.response)) {
          const newOptions = result.response.map((item: any) => ({
            value: item.code_key,
            label: item.code_value,
          }));

          // 배열을 직접 교체하지 않고 기존 배열을 수정
          searchProcessNameOptions.value.splice(0, searchProcessNameOptions.value.length, ...newOptions);
        }
      } else {
        throw new Error(`공정명 코드 검색 실패: ${result.message}`);
      }
    } catch (error: any) {
      console.error("공정명 코드 검색 실패:", error);
      throw error;
    }
  };

  const deleteProcesses = async (processIds: string[], symbolIds?: string[]) => {
    try {
      setLoading(true);

      // 각 process_id에 대해 삭제 API 호출
      const deletePromises = processIds.map(async (processId, index) => {
        if (!processId) {
          return { success: false, message: "process_id가 없습니다." };
        }

        try {
          // 해당 process_id에 대응하는 symbol_id 찾기
          const symbolId = symbolIds && symbolIds[index] ? symbolIds[index] : null;
          
          
          // 삭제 요청 데이터 준비
          const deleteData: any = {
            process_id: processId
          };
          
          if (symbolId && symbolId !== null && symbolId !== undefined && symbolId !== '') {
            deleteData.symbol_id = symbolId;
          }

          // request 함수의 두 번째 파라미터로 쿼리 파라미터 전달
          const queryParams = symbolIds && symbolIds[index] ? { symbol_id: symbolIds[index] } : undefined;
          
          
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
          formData.append('python_file', formulaItem._file); // 서버에서 요구하는 필드명
          formData.append('formula_scope', 'PROCESS'); // 서버에서 요구하는 필드
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
          
          const result = await request("/api/process/formula/create", undefined, {
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
        
        
        // API 응답의 모든 레벨에서 process_id 검색
        
        // process_id 추출 로직 강화 (모든 가능한 위치에서 process_id 찾기)
        let processId = null;
        
        // 1단계: result.response에서 직접 찾기
        if (result.response && typeof result.response === 'object') {
          const response = result.response as any;
          const directIds = [
            response.process_id,
            response.id,
            response.processId
          ];
          
          processId = directIds.find(id => id != null && id !== '');
        }
        
        // 2단계: result.response.data에서 찾기
        if (!processId && result.response?.data && typeof result.response.data === 'object') {
          const data = result.response.data as any;
          const dataIds = [
            data.process_id,
            data.id,
            data.processId
          ];
          
          processId = dataIds.find(id => id != null && id !== '');
        }
        
        // 3단계: result.response.data.response에서 찾기
        if (!processId && result.response?.data?.response && typeof result.response.data.response === 'object') {
          const nested = result.response.data.response as any;
          const nestedIds = [
            nested.process_id,
            nested.id,
            nested.processId
          ];
          
          processId = nestedIds.find(id => id != null && id !== '');
        }
        
        // 4단계: result 전체에서 찾기
        if (!processId) {
          const resultData = result as any;
          const resultIds = [
            resultData.process_id,
            resultData.id,
            resultData.processId
          ];
          
          processId = resultIds.find(id => id != null && id !== '');
        }
        
        
        // process_id를 찾지 못한 경우
        if (!processId) {
          console.error('❌ API 응답에서 process_id를 찾을 수 없습니다!');
          console.log('서버 개발자에게 /api/process/master/create API 응답에 process_id를 포함하도록 요청이 필요합니다.');
          throw new Error('process_id를 찾을 수 없습니다. API 응답에 process_id가 포함되어야 합니다.');
        }
        
        
        // 공정 등록 성공 후 계산식 파일들 별도 저장
        if (result.success && processData.formula_files && processData.formula_files.length > 0 && processId) {
          await saveFormulaFiles(processId, processData.formula_files);
        }
        
        return result;
      }

      // siteFile이 없는 경우 JSON으로 전송
      const { formula_files, ...createData } = processData;
      
      const result = await request("/api/process/master/create", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createData),
      });

      // API 응답의 모든 레벨에서 process_id 검색
      
      // process_id 추출 로직 강화 (모든 가능한 위치에서 process_id 찾기)
      let processId = null;
      
      // 1단계: result.response에서 직접 찾기
      if (result.response && typeof result.response === 'object') {
        const response = result.response as any;
        const directIds = [
          response.process_id,
          response.id,
          response.processId
        ];
        
        processId = directIds.find(id => id != null && id !== '');
      }
      
      // 2단계: result.response.data에서 찾기
      if (!processId && result.response?.data && typeof result.response.data === 'object') {
        const data = result.response.data as any;
        const dataIds = [
          data.process_id,
          data.id,
          data.processId
        ];
        
        processId = dataIds.find(id => id != null && id !== '');
      }
      
      // 3단계: result.response.data.response에서 찾기
      if (!processId && result.response?.data?.response && typeof result.response.data.response === 'object') {
        const nested = result.response.data.response as any;
        const nestedIds = [
          nested.process_id,
          nested.id,
          nested.processId
        ];
        
        processId = nestedIds.find(id => id != null && id !== '');
      }
      
      // 4단계: result 전체에서 찾기
      if (!processId) {
        const resultData = result as any;
        const resultIds = [
          resultData.process_id,
          resultData.id,
          resultData.processId
        ];
        
        processId = resultIds.find(id => id != null && id !== '');
      }
      
      
      // process_id를 찾지 못한 경우
      if (!processId) {
        console.error('❌ API 응답에서 process_id를 찾을 수 없습니다!');
        console.log('서버 개발자에게 /api/process/master/create API 응답에 process_id를 포함하도록 요청이 필요합니다.');
        throw new Error('process_id를 찾을 수 없습니다. API 응답에 process_id가 포함되어야 합니다.');
      }
      
      
      // 공정 등록 성공 후 계산식 파일들 별도 저장
      if (result.success && formula_files && formula_files.length > 0 && processId) {
        await saveFormulaFiles(processId, formula_files);
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
    searchLanguage,
    searchUnit,
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
    setSearchLanguage,
    setSearchUnit,
    setProcessDetail,
    setGlobalProcessData,
    searchProcesses,
    searchProcessById,
    loadProcessTypeCodes,
    loadSubCategoryCodes,
    loadProcessNameCodes,
    loadSubCategoryCodesSilent,
    loadProcessNameCodesSilent,
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
