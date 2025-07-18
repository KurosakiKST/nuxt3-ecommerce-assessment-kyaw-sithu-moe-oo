<template>
  <div class="pagination-container">
    <div class="pagination">
      <button
        @click="goToPreviousPage"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        ← Previous
      </button>
      
      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="['page-btn', { 
            active: page === currentPage,
            dots: page === '...'
          }]"
          :disabled="page === '...'"
        >
          {{ page }}
        </button>
      </div>
      
      <button
        @click="goToNextPage"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        Next →
      </button>
    </div>
    
    <div class="pagination-info">
      <p>
        Page {{ currentPage }} of {{ totalPages }} 
        ({{ totalProducts }} total products)
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
  totalProducts: number
  maxVisiblePages?: number
}

interface Emits {
  (e: 'page-change', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 7
})

const emit = defineEmits<Emits>()

// Computed
const visiblePages = computed(() => {
  const delta = Math.floor(props.maxVisiblePages / 2)
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, props.currentPage - delta); 
       i <= Math.min(props.totalPages - 1, props.currentPage + delta); 
       i++) {
    range.push(i)
  }

  if (props.currentPage - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (props.currentPage + delta < props.totalPages - 1) {
    rangeWithDots.push('...', props.totalPages)
  } else if (props.totalPages > 1) {
    rangeWithDots.push(props.totalPages)
  }

  // Remove duplicates
  return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index)
})

// Methods
const goToPage = (page: number | string) => {
  if (typeof page === 'number' && page >= 1 && page <= props.totalPages) {
    emit('page-change', page)
  }
}

const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1)
  }
}

const goToNextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('page-change', props.currentPage + 1)
  }
}
</script>

<style scoped>
.pagination-container {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.pagination-btn {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--light-color);
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  min-width: 40px;
  text-align: center;
}

.page-btn:hover:not(:disabled) {
  background: var(--light-color);
  border-color: var(--primary-color);
}

.page-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-btn.dots {
  background: transparent;
  border: none;
  cursor: default;
}

.pagination-info {
  text-align: center;
}

.pagination-info p {
  margin: 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  .pagination-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  
  .page-numbers {
    flex-wrap: wrap;
  }
}
</style>