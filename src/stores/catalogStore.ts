import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request } from '@/utils/request'

// 장비 검색 요청 인터페이스
interface EquipmentSearchRequest {
  search_field: string
  search_value: string
  order_by: string
  include_vendor: boolean
  page?: number
  page_size?: number
}

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
  search_criteria?: any
  output_values?: any
  specifications?: any
  [key: string]: any  // 동적 필드를 위한 인덱스 시그니처
}

// 장비 검색 응답 인터페이스
interface EquipmentSearchResponse {
  items: EquipmentItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 컬럼 정보 응답 인터페이스
interface ColumnInfoResponse {
  columns: any[]
  // 필요한 다른 필드 추가
}

// 코드 검색 요청 인터페이스
interface CodeSearchRequest {
  search_field: string
  search_value: string
}

// 코드 검색 응답 인터페이스
interface CodeSearchResponse {
  items: any[]
  // 필요한 다른 필드 추가
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
  const availableFields = ref<any[]>([])
  
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
    } catch (err: any) {
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
          const fieldsWithCategory = response.response.available_fields.map((field: any) => ({
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
    } catch (err: any) {
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
      // searchValue가 코드 형태인지 확인 (예: M_PMP0602)
      const isCodeFormat = /^[A-Z_]+[0-9]+$/.test(searchValue.trim())
      
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
    } catch (err: any) {
      console.error('장비 검색 API 오류:', err)
      error.value = err.message || '장비 검색 중 오류가 발생했습니다.'
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
    
    // 계산된 속성
    hasEquipment,
    
    // 액션
    searchCode,
    getColumnInfo,
    searchEquipment,
    clearEquipmentList,
    selectEquipment
  }
})
