<template>
  <div class="process-page">
    <!-- Add Button -->
    <div class="action-bar">
      <dl class="column-search">
        <dt class="essential">공정구분</dt>
        <dd>
          <input type="text" class="form-input" placeholder="">
        </dd>
        <dt class="essential">공정명</dt>
        <dd>
          <input type="text" class="form-input" placeholder="">
        </dd>
        <dt>모드</dt>
        <dd>
          <input type="text" class="form-input" placeholder="">
        </dd>
        <dt class="essential">공정심볼</dt>
        <dd>
          <input type="text" class="form-input" placeholder="">
        </dd>
        <dt class="essential">계산식</dt>
        <dd>
          <input type="text" class="form-input" placeholder="">
        </dd>
        <dt>비고</dt>
        <dd class="extend-all">
          <input type="text" class="form-input" placeholder="">
        </dd>
      </dl>


      <div class="btns">
        <button class="btn btn-primary btn-regist">
          등록
        </button>
        <button
          class="btn btn-primary btn-edit"
        >
          수정
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.public-management-layout {
  height: 100%;
  padding: $spacing-lg;
}
</style>
