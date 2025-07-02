<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const count = ref(0)
</script>

<template>
  <div class="hello-world fade-in">
    <h1 class="title">{{ msg }}</h1>

    <div class="card">
      <div class="card-body">
        <button 
          type="button" 
          class="btn btn-primary counter-btn" 
          @click="count++"
        >
          Count is {{ count }}
        </button>
        <p class="description">
          Edit
          <code class="code-highlight">components/HelloWorld.vue</code> 
          to test HMR
        </p>
      </div>
    </div>

    <div class="links-section">
      <p>
        Check out
        <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank" class="external-link">
          create-vue
        </a>, 
        the official Vue + Vite starter
      </p>
      <p>
        Learn more about IDE Support for Vue in the
        <a
          href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
          target="_blank"
          class="external-link"
        >
          Vue Docs Scaling up Guide
        </a>.
      </p>
      <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hello-world {
  max-width: 600px;
  margin: 0 auto;
  
  .title {
    color: $primary-color;
    margin-bottom: $spacing-xl;
    background: linear-gradient(135deg, $primary-color, $secondary-color);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .card {
    margin: $spacing-xl 0;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }

    .card-body {
      .counter-btn {
        font-size: $font-size-lg;
        padding: $spacing-md $spacing-xl;
        margin-bottom: $spacing-lg;
        
        &:hover {
          transform: scale(1.05);
        }

        &:active {
          transform: scale(0.95);
        }
      }

      .description {
        color: $text-light;
        font-size: $font-size-sm;
        
        .code-highlight {
          background-color: rgba($primary-color, 0.1);
          color: $primary-color;
          padding: 2px 6px;
          border-radius: $border-radius-sm;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 0.9em;
        }
      }
    }
  }

  .links-section {
    margin-top: $spacing-xl;
    
    p {
      margin-bottom: $spacing-md;
      line-height: $line-height-base * 1.2;
    }

    .external-link {
      color: $primary-color;
      font-weight: $font-weight-md;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: $transition-base;

      &:hover {
        border-bottom-color: $primary-color;
        color: darken($primary-color, 10%);
      }
    }
  }

  .read-the-docs {
    color: $text-light;
    font-size: $font-size-sm;
    margin-top: $spacing-lg;
    opacity: 0.8;
    transition: $transition-base;

    &:hover {
      opacity: 1;
    }
  }
}

// Responsive design
@media (max-width: $breakpoint-md) {
  .hello-world {
    padding: 0 $spacing-md;
    
    .title {
      font-size: $font-size-xl;
    }

    .card {
      .card-body {
        .counter-btn {
          font-size: $font-size-base;
          padding: $spacing-sm $spacing-lg;
        }
      }
    }
  }
}
</style>
