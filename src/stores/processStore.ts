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
}

export interface GlobalProcessData {
  level2_code_key: string;
  level3_code_key: string;
  process_code: string;
}

export const useProcessStore = defineStore("process", () => {
  // 상태
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
  });

  const globalProcessData = ref<GlobalProcessData>({
    level2_code_key: "",
    level3_code_key: "",
    process_code: "",
  });

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
      // 4. 모든 값이 null인 경우
      else {
        requestData = {
          search_field: "process_code",
          search_value: "",
        };
      }

      console.log("검색 요청 데이터:", requestData);

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
      }
      if (error.request) {
        console.error("요청 오류:", error.request);
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
          console.log(
            "level2_code_value (공정구분):",
            processData.level2_code_value
          );
          console.log(
            "level3_code_value (공정 중분류):",
            processData.level3_code_value
          );
          console.log("process_name (공정명):", processData.process_name);
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
            description: processData.process_description || "",
            processSymbol: processData.symbol_uri || "",
          });

          if (processData.symbol_uri) {
            // 파일 정보 설정 (실제 구현에서는 파일 객체로 변환 필요)
            console.log("공정 심볼 파일:", processData.symbol_uri);
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

  const deleteProcesses = async (processIds: string[]) => {
    try {
      setLoading(true);
      console.log("삭제할 process_id 목록:", processIds);

      // 각 process_id에 대해 삭제 API 호출
      const deletePromises = processIds.map(async (processId) => {
        if (!processId) {
          console.warn("process_id가 없는 항목:", processId);
          return { success: false, message: "process_id가 없습니다." };
        }

        try {
          const result = await request(
            `/api/process/master/delete/${processId}`,
            undefined,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

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

  const createProcess = async (processData: any) => {
    try {
      setLoading(true);
      console.log("공정 등록 요청 데이터:", processData);

      const result = await request("/api/process/master/create", undefined, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processData),
      });

      console.log("공정 등록 API 응답:", result);

             if (result.success) {
         // 등록 성공 후 목록 새로고침
         await searchProcesses();
         return result;
       } else {
         const errorMessage = result.message || "등록 실패";
         throw new Error(errorMessage);
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
      
      // API 서버에서 요구하는 필드명으로 데이터 구조 변환
      const updateData = {
        process_code: processData.processCode || "",          // 공정 코드 (내부 코드값)
        process_type_code: processData.processType || "",     // 공정 타입 코드
        process_name: processData.processName || "",          // 공정명 (표시명)
        process_category: processData.subCategory || "",      // 공정 카테고리
        process_symbol: processData.processSymbol || "",      // 공정 심볼
        process_description: processData.description || "",   // 공정 설명
      };
      
      console.log("=== API 요청용 변환된 데이터 ===");
      console.log("process_code:", updateData.process_code);
      console.log("process_type_code:", updateData.process_type_code);
      console.log("process_name:", updateData.process_name);
      console.log("process_category:", updateData.process_category);
      console.log("process_symbol:", updateData.process_symbol);
      console.log("process_description:", updateData.process_description);

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
  };

  return {
    // 상태
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

    // computed
    filteredProcessList,
    totalCountComputed,
    totalPagesComputed,
    paginatedProcessList,

    // 액션
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
    resetState,
  };
});
