<template>
    <div class="unit-dateTime">
      <p>{{ time }}</p>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue'
  import moment from 'moment'
  
  export default defineComponent({
    name: 'MyClock',
    props: {
      format: { type: String, default: 'YYYY-MM-DD HH:mm:ss' },
    },
    data(): { time: string | null; timerId: number | undefined } {
      return { time: null, timerId: undefined }
    },
    mounted() {
      const callback = () => (this.time = moment().format(this.format))
      callback()
      this.timerId = setInterval(callback, 1000)
    },
    beforeUnmount() {
      clearInterval(this.timerId)
    },
  })
  </script>
  
  <style lang="scss" scoped>
  .notification-dropdown {
    cursor: pointer;
  
    .notification-dropdown__icon {
      position: relative;
      display: flex;
      align-items: center;
    }
  
    .va-dropdown__anchor {
      display: inline-block;
    }
  }

  .unit-dateTime {
    p {
      color: #333333;
      font-size: 14px;
      font-weight: 400;
    }
  }
  </style>
  