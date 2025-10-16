import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request } from '@/utils/request'

// 장비 아이템 인터페이스
interface EquipmentItem {
  equipment_id: string
  created_at: string
  is_active: boolean
  equipment_code: string
  equipment_type: string
  vendor_id: string
  model_number: string
  manufacturer?: string
  vendor_name?: string
  search_criteria?: Record<string, unknown>
  output_values?: Record<string, unknown>
  specifications?: Record<string, unknown>
  [key: string]: unknown  // 동적 필드를 위한 인덱스 시그니처
}

// 코드 검색 요청 인터페이스
interface CodeSearchRequest {
  search_field: string
  search_value: string
}

export const useCatalogStore = defineStore('catalog', () => {
  // 상태
  const equipmentList = ref<EquipmentItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 페이징 상태
  const totalItems = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalPages = ref(0)
  
  // 동적 컬럼 정보
  const availableFields = ref<Array<{
    field_name: string
    name_kr?: string
    category?: string
    type?: string
  }>>([])
  
  // 코드 정보
  const codeNameKr = ref('')
  const codeNameEn = ref('')

  // 계산된 속성
  const hasEquipment = computed(() => equipmentList.value.length > 0)

  // 코드 검색 API 호출
  const searchCode = async (searchValue: string) => {
    try {
      const requestData: CodeSearchRequest = {
        search_field: 'code_key',
        search_value: searchValue.trim()
      }

      const response = await request('/api/process/code/search', undefined, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      console.log('코드 검색 API 응답:', response)
      
      if (response.success && response.response) {
        console.log('코드 검색 성공:', response.response)
        
        // 코드 정보 저장
        if (response.response && response.response.length > 0) {
          const codeData = response.response[0]
          codeNameKr.value = codeData.code_value || ''
          codeNameEn.value = codeData.code_value_en || ''
          console.log('저장된 코드 정보:', { 
            code_name_kr: codeNameKr.value, 
            code_name_en: codeNameEn.value 
          })
        }
        
        return response.response
      } else {
        console.warn('코드 검색 결과가 없습니다.')
        codeNameKr.value = ''
        codeNameEn.value = ''
        return null
      }
    } catch (err: unknown) {
      console.error('코드 검색 API 오류:', err)
      return null
    }
  }

  // 컬럼 정보 조회 API 호출
  const getColumnInfo = async (searchKey: string) => {
    try {
      const response = await request(`/api/machine/catalog/column/${searchKey}`, undefined, {
        method: 'GET'
      })
      
      if (response.success && response.response) {
        console.log('컬럼 정보 조회 성공:', response.response)
        
        // available_fields 직접 사용
        if (response.response.available_fields) {
          console.log('[machineStore] available_fields 원본 데이터:', response.response.available_fields)
          
          // available_fields를 그대로 사용하되, category 정보 추가
          const fieldsWithCategory = response.response.available_fields.map((field: {
            field_name: string
            name_kr?: string
            type?: string
          }) => ({
            ...field,
            category: field.type || 'unknown' // type 필드를 category로 매핑
          }))
          
          availableFields.value = fieldsWithCategory
          console.log('[machineStore] 추출된 필드 정보:', fieldsWithCategory)
          console.log('[machineStore] availableFields.value 설정 완료:', availableFields.value)
        } else {
          console.warn('[machineStore] response.response.available_fields가 없습니다.')
          availableFields.value = []
        }
        
        return response.response
      } else {
        console.warn('컬럼 정보가 없습니다.')
        availableFields.value = []
        return null
      }
    } catch (err: unknown) {
      console.error('컬럼 정보 조회 API 오류:', err)
      availableFields.value = []
      return null
    }
  }

  // 장비 검색 API 호출
  const searchEquipment = async (searchValue: string, page: number = 1) => {
    if (!searchValue.trim()) {
      error.value = '검색값을 입력해주세요.'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // 기존 형식만 사용
      const requestData = {
        search_field: 'equipment_type',
        search_value: searchValue.trim(),
        order_by: 'equipment_code',
        include_vendor: true,
        page: page,
        page_size: pageSize.value
      }
      
      console.log('[machineStore] API 요청 데이터:', requestData)
      console.log('[machineStore] 요청 바디:', JSON.stringify(requestData))
      
      const response = await request('/api/machine/catalog/search', undefined, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      // API 응답 콘솔로그 출력
      console.log('[machineStore] 장비 검색 API 응답:', response)
      console.log('[machineStore] 장비 검색 API 응답 데이터:', response?.response)
      
      if (response && response.success && response.response && response.response.items) {
        // items의 첫 번째 항목의 키 출력 (디버깅용)
        if (response.response.items.length > 0) {
          console.log('첫 번째 아이템의 키들:', Object.keys(response.response.items[0]))
          console.log('첫 번째 아이템 전체:', response.response.items[0])
        }
        
        equipmentList.value = response.response.items
        totalItems.value = response.response.total || 0
        currentPage.value = response.response.page || 1
        pageSize.value = response.response.page_size || 20
        totalPages.value = response.response.total_pages || 0
      } else {
        equipmentList.value = []
        totalItems.value = 0
        currentPage.value = 1
        totalPages.value = 0
        error.value = '검색 결과가 없습니다.'
      }
    } catch (err: unknown) {
      console.error('장비 검색 API 오류:', err)
      error.value = (err as Error).message || '장비 검색 중 오류가 발생했습니다.'
      equipmentList.value = []
    } finally {
      isLoading.value = false
    }
  }

  // 장비 목록 초기화
  const clearEquipmentList = () => {
    equipmentList.value = []
    error.value = null
    availableFields.value = []
    totalItems.value = 0
    currentPage.value = 1
    totalPages.value = 0
    codeNameKr.value = ''
    codeNameEn.value = ''
  }

  // 특정 장비 선택
  const selectEquipment = (equipment: EquipmentItem) => {
    console.log('선택된 장비:', equipment)
    // 선택된 장비 처리 로직 추가 가능
  }

  // Unity 이벤트 처리 관련 상태
  const equipmentParams = ref({
    codeKey: '',
    reqValue: '',
    columnName: ''
  })

  // 테스트용 변수
  const testCodeKey = ref('')

  // 더블클릭 감지용 상태
  const clickState = ref({
    count: 0,
    lastTime: 0,
    lastRow: null as number | null
  })

  const DOUBLE_CLICK_THRESHOLD = 400 // 400ms 내 더블클릭으로 간주

  // dtd 객체 로드 대기 함수
  const waitForDtd = (maxAttempts = 10, delay = 100) => {
    return new Promise((resolve) => {
      let attempts = 0
      
      const checkDtd = () => {
        attempts++
        if ((window as { dtd?: { SendCommand?: (target: string, command: string, data: Record<string, unknown>) => void } }).dtd && typeof (window as { dtd?: { SendCommand?: (target: string, command: string, data: Record<string, unknown>) => void } }).dtd?.SendCommand === 'function') {
          resolve(true)
        } else if (attempts < maxAttempts) {
          setTimeout(checkDtd, delay)
        } else {
          resolve(false)
        }
      }
      
      checkDtd()
    })
  }

  // 장비 정보 전송 함수 (더블클릭 시 호출)
  const showEquipmentDetails = async (equipment: EquipmentItem) => {
    console.log('[Settings] 장비 정보 전송:', equipment)
    
    // 조회조건의 equipment_type 값 가져오기 (equipmentParams.codeKey 또는 equipment.equipment_type)
    const equipmentType = equipmentParams.value.codeKey || equipment.equipment_type || ''
    
    // dtd.SendCommand 호출
    const commandData = {
      equipment_id: equipment.equipment_id || '',
      equipment_code: equipment.equipment_code || '',
      equipment_type: equipmentType,
      vendor_id: equipment.vendor_id || '',
      model_number: equipment.model_number || '',
      manufacturer: equipment.manufacturer || '',
      search_criteria: equipment.search_criteria || null,
      output_values: equipment.output_values || null,
      specifications: equipment.specifications || null
    }
    
    console.log('[Settings] dtd.SendCommand 호출:', commandData)
    console.log('[Settings] search_criteria:', commandData.search_criteria)
    console.log('[Settings] output_values:', commandData.output_values)
    console.log('[Settings] specifications:', commandData.specifications)
    
    try {
      // dtd 객체 로드 대기 (최대 1초)
      const dtdAvailable = await waitForDtd(10, 100)
      
      if (dtdAvailable) {
        ;(window as unknown as { dtd: { SendCommand: (target: string, command: string, data: Record<string, unknown>) => void } }).dtd.SendCommand("web", "Catalog", commandData)
        console.log('[Settings] dtd.SendCommand 호출 완료')
      } else {
        console.warn('[Settings] dtd.SendCommand가 사용할 수 없습니다. 대체 방법 사용')
        
        // 대체 방법 1: window.postMessage 사용
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'DISPATCH_UNITY_CATALOG_EVENT',
            eventData: {
              source: 'equipment_catalog',
              codeKey: commandData.equipment_type,
              reqValue: commandData.equipment_id,
              columnName: commandData.model_number,
              commandData: commandData
            }
          }, '*')
          console.log('[Settings] window.parent.postMessage로 대체 전송 완료')
        } else {
          // 대체 방법 2: localStorage에 저장
          localStorage.setItem('equipmentCatalogSelection', JSON.stringify(commandData))
          console.log('[Settings] localStorage에 데이터 저장:', commandData)
        }
      }
    } catch (error) {
      console.error('[Settings] dtd.SendCommand 호출 오류:', error)
      
      // 오류 발생 시에도 대체 방법 시도
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'EQUIPMENT_SELECTION',
            data: commandData
          }, '*')
          console.log('[Settings] 오류 후 window.parent.postMessage로 대체 전송')
        }
      } catch (fallbackError) {
        console.error('[Settings] 대체 방법도 실패:', fallbackError)
      }
    }
  }

  // 행 클릭 핸들러 (더블클릭 감지 포함)
  const handleRowClick = (equipment: EquipmentItem, index: number) => {
    const currentTime = Date.now()
    const state = clickState.value
    
    // 같은 행이고 시간 간격이 짧으면 클릭 카운트 증가
    if (state.lastRow === index && (currentTime - state.lastTime) < DOUBLE_CLICK_THRESHOLD) {
      state.count++
    } else {
      // 다른 행이거나 시간 간격이 길면 클릭 카운트 리셋
      state.count = 1
    }
    
    // 클릭 정보 업데이트
    state.lastTime = currentTime
    state.lastRow = index
    
    // 더블클릭 감지 (2번째 클릭)
    if (state.count === 2) {
      showEquipmentDetails(equipment)
      
      // 상태 초기화
      state.count = 0
      state.lastTime = 0
      state.lastRow = null
      return
    }
    
    // 일반 클릭 처리 (단일 클릭)
    if (state.count === 1) {
      selectEquipment(equipment)
    }
    
    // 일정 시간 후 상태 초기화
    setTimeout(() => {
      if (state.lastTime === currentTime && state.count === 1) {
        state.count = 0
        state.lastTime = 0
        state.lastRow = null
      }
    }, DOUBLE_CLICK_THRESHOLD)
  }

  // 장비 검색 실행 함수
  const executeSearch = async (codeKey: string) => {
    if (!codeKey || codeKey.trim() === '') {
      console.log('[Settings] codeKey가 없어서 조회 건너뜀')
      return
    }
    
    console.log('[Settings] 자동 조회 시작:', codeKey)
    console.log('[Settings] catalogStore 확인:', { searchCode: typeof searchCode, getColumnInfo: typeof getColumnInfo, searchEquipment: typeof searchEquipment })
    
    try {
      // 1단계: 코드 검색
      const codeResult = await searchCode(codeKey)
      if (codeResult) {
        console.log('[Settings] 코드 검색 결과:', codeResult)
      }
      
      // 2단계: 컬럼 정보 조회
      const columnInfo = await getColumnInfo(codeKey)
      if (columnInfo) {
        console.log('[Settings] 컬럼 정보:', columnInfo)
      }
      
      // 3단계: 장비 검색
      await searchEquipment(codeKey, 1)
      console.log('[Settings] 자동 조회 완료')
    } catch (error: unknown) {
      console.error('[Settings] 자동 조회 중 오류:', error)
    }
  }

  // UnityEvent 테스트 함수
  const testUnityEvent = async () => {
    console.log('[Settings] UnityEvent 테스트 시작')
    console.log('[Settings] 테스트 CodeKey:', testCodeKey.value)
    
    if (!testCodeKey.value || testCodeKey.value.trim() === '') {
      console.warn('[Settings] CodeKey를 입력해주세요.')
      alert('CodeKey를 입력해주세요.')
      return
    }
    
    // handleUnityEvent를 직접 호출하기 위한 CustomEvent 생성
    const customEvent = new CustomEvent('unity-catalog-popup-open', {
      detail: {
        source: 'unity_common_equipment',
        codeKey: testCodeKey.value,
        reqValue: '',
        columnName: ''
      },
      bubbles: true
    })
    
    console.log('[Settings] CustomEvent 생성:', customEvent)
    console.log('[Settings] CustomEvent detail:', customEvent.detail)
    
    // document.dispatchEvent로 handleUnityEvent 호출
    document.dispatchEvent(customEvent)
    
    // executeSearch를 직접 호출하여 검색 실행 보장
    await executeSearch(testCodeKey.value)
    
    console.log('[Settings] UnityEvent 테스트 완료')
  }

  // 카탈로그 팝업 오픈 함수
  const catalogPopUpOpen = (codeKey: string, reqValue: string, columnName: string) => {
    console.log('[WebApp] 카탈로그 팝업 오픈:', {
      codeKey: codeKey,
      reqValue: reqValue,
      columnName: columnName
    })
    
    // 매개변수 저장
    equipmentParams.value.codeKey = codeKey || ''
    equipmentParams.value.reqValue = reqValue || ''
    equipmentParams.value.columnName = columnName || ''
  }

  // unity-catalog-popup-open 이벤트 핸들러 함수
  const handleUnityEvent = (event: Event) => {
    const { source, codeKey, reqValue, columnName } = (event as CustomEvent).detail
    
    if (source !== 'unity_common_equipment') return
    if (!codeKey) return
    
    const safeReqValue = reqValue || 0
    const safeColumnName = columnName || ''
    
    catalogPopUpOpen(codeKey, safeReqValue, safeColumnName)
  }

  // postMessage 이벤트 핸들러 함수
  const handlePostMessage = (event: MessageEvent) => {
    if (event.data?.type === 'DISPATCH_UNITY_CATALOG_EVENT') {
      const eventData = event.data.eventData
      const customEvent = new CustomEvent('unity-catalog-popup-open', {
        detail: {
          source: eventData.source,
          codeKey: eventData.codeKey,
          reqValue: eventData.reqValue,
          columnName: eventData.columnName
        },
        bubbles: true
      })
      
      document.dispatchEvent(customEvent)
    }
  }

  return {
    // 상태
    equipmentList,
    isLoading,
    error,
    
    // 페이징 상태
    totalItems,
    currentPage,
    pageSize,
    totalPages,
    
    // 동적 컬럼 정보
    availableFields,
    
    // 코드 정보
    codeNameKr,
    codeNameEn,
    
    // Unity 이벤트 처리 관련 상태
    equipmentParams,
    testCodeKey,
    clickState,
    
    // 계산된 속성
    hasEquipment,
    
    // 액션
    searchCode,
    getColumnInfo,
    searchEquipment,
    clearEquipmentList,
    selectEquipment,
    
    // Unity 이벤트 처리 액션
    showEquipmentDetails,
    handleRowClick,
    executeSearch,
    testUnityEvent,
    catalogPopUpOpen,
    handleUnityEvent,
    handlePostMessage
  }
})
