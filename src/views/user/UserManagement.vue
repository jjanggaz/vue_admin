<template>
  <div class="user-management">
    <!-- Add Button -->
    <div class="action-bar">
      <div class="criteria">
        <div class="group-form">
          <div class="form-item">
            <label for="search">검색</label>
            <select id="role">
              <option value="">항목을 선택하세요.</option>
              <option value=""></option>
              <option value=""></option>
            </select>
          </div>
        </div>
        <div class="group-form">
          <div class="form-item">
            <input type="text" id="search" placeholder="검색어를 입력하세요." />
          </div>
          <button class="btn-search">검색</button>
        </div>
      </div>
      <div class="btns">
        <button class="btn btn-primary btn-delete">삭제</button>
        <button class="btn btn-primary btn-edit">수정</button>
        <button class="btn btn-primary btn-regist">등록</button>
      </div>
    </div>
    <p>사용자 관리 페이지입니다.</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.user-management {
  padding: $spacing-lg;
}
</style>
