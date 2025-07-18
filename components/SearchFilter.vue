<template>
  <div class="search-container">
    <div class="search-box">
      <input
        v-model="localSearchQuery"
        type="text"
        :placeholder="placeholder"
        class="search-input"
        @input="handleInput"
      />
      <button
        v-if="localSearchQuery"
        @click="clearSearch"
        class="clear-search"
        title="Clear search"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  debounceMs?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search products...',
  debounceMs: 500
})

const emit = defineEmits<Emits>()

const localSearchQuery = ref(props.modelValue)
let searchTimeout: NodeJS.Timeout

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  localSearchQuery.value = newValue
})

// Debounced search handler
const handleInput = () => {
  clearTimeout(searchTimeout)
  
  // Immediately update the parent component
  emit('update:modelValue', localSearchQuery.value)
  
  // Debounce the search event
  searchTimeout = setTimeout(() => {
    emit('search', localSearchQuery.value)
  }, props.debounceMs)
}

const clearSearch = () => {
  localSearchQuery.value = ''
  emit('update:modelValue', '')
  emit('clear')
  emit('search', '')
}

// Cleanup on unmount
onUnmounted(() => {
  clearTimeout(searchTimeout)
})
</script>

<style scoped>
.search-container {
  flex: 1;
  min-width: 300px;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: var(--danger-color);
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.clear-search:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .search-container {
    min-width: auto;
  }
}
</style>