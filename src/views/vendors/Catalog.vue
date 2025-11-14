<template>
  <div class="wrap-page sample-page">
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <h3>Equipment Catalog</h3>
      <button class="btn btn-close" @click="closeModal"></button>
    </div>
    
    <!-- 페이지 컨텐츠 -->
    <div class="page-content">
      <div class="box-division">
        <!-- 로딩 상태 표시 -->
        <div v-if="catalogStore.isLoading" class="loading-message">
          검색 중...
        </div>
        
        <!-- 에러 메시지 표시 -->
        <div v-if="catalogStore.error" class="error-message">
          {{ catalogStore.error }}
          </div>
        
        
        <!-- 데이터 테이블 -->
        <div class="table-wrapper">
          <DataTable 
            v-if="!catalogStore.isLoading && !catalogStore.error"
            :columns="equipmentColumns" 
            :data="equipmentData"
            :loading="false"
            :selectable="false"
          >
          </DataTable>
        </div>
        
        <!-- 검색 결과가 없을 때 -->
        <div v-if="!catalogStore.isLoading && !catalogStore.error && !catalogStore.hasEquipment" class="no-data-message">
          해당 기기의 카탈로그 정보를 찾을 수 없습니다.<br>
          관리자에게 문의하거나, 신규 등록을 진행해 주십시오.
          </div>
        
        <!-- 페이징 -->
        <div v-if="catalogStore.hasEquipment && catalogStore.totalPages > 1" class="pagination-container">
          <Pagination
            :current-page="catalogStore.currentPage"
            :total-pages="catalogStore.totalPages"
            @page-change="goToPage"
          />
        </div>
        
        <!-- 닫기 버튼 -->
        <div class="footer-actions">
          <button type="button" class="btn btn-close-page" @click="closeModal">
            닫기
          </button>
        </div>
        
          </div>
    </div>

    <!-- handleUnityEvent 테스트 섹션 -->
    <div class="test-section">
      <div class="test-controls">
        <span class="test-title">Unity Event 테스트</span>
        <div class="test-input-group">
          <label for="testCodeKey">CodeKey:</label>
          <input 
            id="testCodeKey"
            type="text" 
            v-model="catalogStore.testCodeKey" 
            placeholder="예: M_PMP0602" 
            class="test-input"
          >
        </div>
        <div class="test-button-group">
          <button type="button" class="btn btn-search" @click="catalogStore.testUnityEvent">
            조회
      </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch, nextTick, toRaw } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import Pagination from '@/components/common/Pagination.vue'
import { useCatalogStore } from '@/stores/catalogStore'

// 카탈로그 스토어 사용
const catalogStore = useCatalogStore()


// 매개변수 로그 출력
console.log('[Settings] 받은 매개변수:', {
  codeKey: catalogStore.equipmentParams.codeKey,
  reqValue: catalogStore.equipmentParams.reqValue,
  columnName: catalogStore.equipmentParams.columnName
})

// 기본 장비 카탈로그 컬럼 정의
const baseColumns = [
  { key: 'equipment_id', title: 'Equipment ID', hidden: true },
  { key: 'equipment_code', title: '장비 코드\n(Equipment Code)', hidden: true },
  { key: 'equipment_type', title: '장비 유형\n(Equipment Type)' },
  { key: 'vendor_id', title: 'Vendor ID', hidden: true },
  { key: 'manufacturer', title: '업체명\n(Vendor / Manufacturer)' },
  { key: 'model_number', title: '모델명\n(Model Name)' },
  { key: 'search_criteria', title: 'Search Criteria', hidden: true },
  { key: 'output_values', title: 'Output Values', hidden: true },
  { key: 'specifications', title: 'Specifications', hidden: true },
  { key: 'is_active', title: '활성 상태\n(Active Status)', hidden: true },
  { key: 'created_at', title: '생성일\n(Created At)', hidden: true },
]

// 동적 컬럼 생성 (available_fields 기반)
const equipmentColumns = computed(() => {
  console.log('[Settings] equipmentColumns computed 실행됨')
  console.log('[Settings] catalogStore.availableFields 상태:', catalogStore.availableFields)
  console.log('[Settings] availableFields 길이:', catalogStore.availableFields?.length || 0)
  
  const columns = [...baseColumns]
  
  // model_number 다음 위치 찾기 (인덱스 4)
  const insertIndex = columns.findIndex(col => col.key === 'model_number') + 1
  
  // available_fields의 field_name을 컬럼으로 추가
  if (catalogStore.availableFields && catalogStore.availableFields.length > 0) {
    console.log('[Settings] 동적 컬럼 생성 시작 - available_fields:', catalogStore.availableFields)
    
    const dynamicColumns = catalogStore.availableFields.map((field) => {
      // name_kr이 있으면 name_kr \n (field_name) 형식으로 줄바꿈 추가, 없으면 field_name을 카멜케이스로 변환
      const title = field.name_kr 
        ? `${field.name_kr}\n(${field.field_name})`
        : field.field_name.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
      
      return {
        key: field.field_name,
        title: title,
        category: field.category || 'unknown'
      }
    })
    
    console.log('[Settings] 생성된 동적 컬럼들:', dynamicColumns)
    
    // 동적 컬럼들을 model_number 다음에 삽입
    columns.splice(insertIndex, 0, ...dynamicColumns)
  } else {
    console.log('[Settings] availableFields가 없어서 동적 컬럼 생성 건너뜀')
  }
  
  console.log('[Settings] 최종 컬럼 목록:', columns)
  return columns
})

// 장비 데이터 (그리드에 표시할 데이터)
const equipmentData = computed(() => {
  console.log('[Settings] equipmentData computed 실행됨')
  console.log('[Settings] catalogStore.equipmentList:', catalogStore.equipmentList)
  
  if (!catalogStore.equipmentList || catalogStore.equipmentList.length === 0) {
    console.log('[Settings] 장비 목록이 비어있음')
    return []
  }
  
  // price 필드 포맷팅 함수
  const formatPriceField = (value: unknown, fieldName: string) => {
    if (fieldName.toLowerCase().includes('price')) {
      if (!value || value === '' || value === '견적필요') {
        return value || ''
      }
      
      // 숫자로 변환 시도
      const numValue = parseFloat(String(value))
      if (!isNaN(numValue)) {
        return numValue.toLocaleString('ko-KR')
      }
    }
    return value
  }
  
  const data = catalogStore.equipmentList.map((equipment) => {
    const formattedEquipment = { ...equipment }
    
    // 모든 필드를 순회하며 price 관련 필드 포맷팅
    Object.keys(formattedEquipment).forEach(key => {
      if (key.toLowerCase().includes('price')) {
        formattedEquipment[key] = formatPriceField(formattedEquipment[key], key)
      }
    })
    
    return {
      ...formattedEquipment,
      manufacturer: equipment.vendor_name || equipment.manufacturer || '',
      vendor_id: equipment.vendor_id || '',
      search_criteria: equipment.search_criteria ? toRaw(equipment.search_criteria) : null,
      output_values: equipment.output_values ? toRaw(equipment.output_values) : null,
      specifications: equipment.specifications ? toRaw(equipment.specifications) : null,
    }
  })
  
  console.log('[Settings] 변환된 장비 데이터:', data)
  return data
})


// 페이지 이동 함수
const goToPage = (page: number) => {
  if (page < 1 || page > catalogStore.totalPages) return
  
  const searchValue = catalogStore.equipmentParams.codeKey || ''
  if (searchValue) {
    catalogStore.searchEquipment(searchValue, page)
  }
}

const closeModal = () => {
  // 모달 닫기 로직
  window.close();
}


// codeKey가 변경될 때 자동 조회
watch(() => catalogStore.equipmentParams.codeKey, async (newCodeKey, oldCodeKey) => {
  console.log('[Settings] equipmentParams.codeKey 변경됨:', { 
    old: oldCodeKey, 
    new: newCodeKey 
  })
  
  // 값이 실제로 변경되었는지 확인
  if (newCodeKey === oldCodeKey) {
    console.log('[Settings] codeKey 값이 동일하여 조회 건너뜀')
    return
  }
  
  await catalogStore.executeSearch(newCodeKey)
})

// 장비 목록 변경 시 컬럼 정보 재조회
watch(() => catalogStore.equipmentList, async (newEquipmentList) => {
  if (newEquipmentList && newEquipmentList.length > 0 && catalogStore.equipmentParams.codeKey) {
    try {
      const equipmentTypes = [...new Set(newEquipmentList.map((item) => item.equipment_type).filter(Boolean))]
      if (equipmentTypes.length > 0 && typeof catalogStore.getColumnInfo === 'function') {
        await catalogStore.getColumnInfo(equipmentTypes[0])
      }
    } catch (error: unknown) {
      console.error('[Settings] 장비 목록 변경 시 컬럼 정보 재조회 오류:', error)
    }
  }
}, { deep: true })

// availableFields 변경 감지
watch(() => catalogStore.availableFields, (newFields) => {
  if (newFields && newFields.length > 0) {
    nextTick(() => {
      console.log('[Settings] availableFields 변경으로 인한 DOM 업데이트 완료')
    })
  }
}, { deep: true })



// 전역 함수로 노출 (Unity에서 호출하기 위해)
;(window as { CatalogPopUpOpen?: (codeKey: string, reqValue: string, columnName: string) => void }).CatalogPopUpOpen = (codeKey: string, reqValue: string, columnName: string) => {
  catalogStore.catalogPopUpOpen(codeKey, reqValue, columnName)
}

// 컴포넌트 마운트 시 이벤트 리스너 등록
onMounted(() => {
    document.addEventListener('unity-catalog-popup-open', catalogStore.handleUnityEvent);
    window.addEventListener('message', catalogStore.handlePostMessage);
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
    document.removeEventListener('unity-catalog-popup-open', catalogStore.handleUnityEvent);
    window.removeEventListener('message', catalogStore.handlePostMessage);
})


</script>




<style scoped lang="scss">
@use '@/styles/variables' as *;

.wrap-page {
  padding: 20px;
  overflow-x: hidden;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #333;
}

.page-content {
  overflow-x: hidden;
}

.page-footer {
  margin-top: 20px;
  padding: 15px;
  border-top: 1px solid #333;
  background-color: #2a2a2a;
}

.box-division {
  margin-bottom: 20px;
  overflow-x: hidden;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
  width: 100%;
  max-width: 100%;
  
  // DataTable 컨테이너 스타일
  :deep(.data-table-container) {
    overflow-x: visible;
    overflow-y: visible;
    width: 100%;
  }
  
  // DataTable 스타일
  :deep(.data-table) {
    width: 100%;
    min-width: 100%;
    table-layout: fixed;
    
    td {
      font-size: 12px;
      white-space: nowrap;
      padding: 6px 8px;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    th {
      white-space: pre-line;
      line-height: 1.3;
      text-align: center;
      font-size: 12px;
      padding: 8px 6px;
      min-width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.line-header {
  margin-bottom: 10px;
  font-size: 15px;
  color: #d4d4d4;
  
  > .title,
  > h5 {
    font-size: inherit;
    color: inherit;
    margin: 0;
  }
}

.loading-message,
.error-message,
.no-data-message {
  padding: 20px;
  text-align: center;
  color: #d4d4d4;
  font-size: 14px;
}

.error-message {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
}

.no-data-message {
  color: #888;
  font-style: italic;
  line-height: 1.6;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px;
}

.footer-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .btn-close-page {
    min-width: 120px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 500;
    background-color: #555;
    color: #fff;
    border: 1px solid #666;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #666;
      border-color: #777;
    }
    
    &:active {
      background-color: #444;
      transform: translateY(1px);
    }
  }
}

.test-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #2a2a2a;
}

.test-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.test-title {
  color: #d4d4d4;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
}

.test-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  
  label {
    font-size: 14px;
    color: #d4d4d4;
    white-space: nowrap;
    font-weight: 500;
  }
  
  .test-input {
    width: 200px;
    height: 32px;
    padding: 0 12px;
    border: 1px solid #1c1c1c;
    border-radius: 4px;
    background-color: #30343f;
    color: #d4d4d4;
    font-size: 14px;
    
    &::placeholder {
      color: #888;
    }
    
    &:focus {
      outline: none;
      border-color: #4a9eff;
      box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
    }
  }
}

.test-button-group {
  display: flex;
  gap: 10px;
}
</style>
