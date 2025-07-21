<template>
  <aside class="filters-sidebar">
    <div class="filters-header">
      <h3>Advanced Filters</h3>
    </div>

    <!-- Category Filter -->
    <div class="filter-section">
      <h4>Category</h4>
      <select v-model="localFilters.selectedCategory" @change="emitFiltersChange" class="filter-select">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category.slug" :value="category.slug">
          {{ category.name }}
        </option>
      </select>
    </div>

    <!-- Price Range Filter -->
    <div class="filter-section">
      <h4>Price Range</h4>
      <div class="price-display">
        ${{ localFilters.minPrice }} - ${{ localFilters.maxPrice }}
      </div>

      <div class="price-inputs">
        <input v-model.number="localFilters.minPrice" type="number" :min="priceRange.min" :max="priceRange.max"
          class="form-input price-input" placeholder="Min" @change="emitFiltersChange" />
        <span>to</span>
        <input v-model.number="localFilters.maxPrice" type="number" :min="priceRange.min" :max="priceRange.max"
          class="form-input price-input" placeholder="Max" @change="emitFiltersChange" />
      </div>
    </div>

    <!-- Brand Filter -->
    <div class="filter-section">
      <h4>Brand</h4>
      <div class="brand-list">
        <label v-for="brand in displayedBrands" :key="brand" class="brand-item">
          <input v-model="localFilters.selectedBrands" type="checkbox" :value="brand" @change="emitFiltersChange" />
          {{ brand }}
        </label>
        <button v-if="availableBrands.length > 6" @click="showAllBrands = !showAllBrands" class="show-more-btn">
          {{ showAllBrands ? 'Show Less' : `+${availableBrands.length - 6} More` }}
        </button>
      </div>
    </div>

    <!-- Rating Filter -->
    <div class="filter-section">
      <h4>Rating</h4>
      <div class="rating-options">
        <button v-for="rating in [0, 1, 2, 3, 4, 5]" :key="rating" @click="setRating(rating)"
          :class="['rating-option', { 'active': localFilters.minRating === rating }]">
          <span v-if="rating === 0">All Ratings</span>
          <span v-else class="rating-stars">
            <span class="stars">{{ '★'.repeat(rating) }}{{ '☆'.repeat(5 - rating) }}</span>
            <span class="rating-text">{{ rating }}+ Stars</span>
          </span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Category, FilterState } from '~/types'

interface Props {
  filters: FilterState
  categories: Category[]
  availableBrands: string[]
  priceRange: { min: number; max: number }
}

interface Emits {
  (e: 'update:filters', filters: FilterState): void
  (e: 'clear-all'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive copy of filters
const localFilters = reactive<FilterState>({ ...props.filters })
const showAllBrands = ref(false)

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  Object.assign(localFilters, newFilters)
}, { deep: true })

// Computed
const displayedBrands = computed(() => {
  return showAllBrands.value
    ? props.availableBrands
    : props.availableBrands.slice(0, 6)
})

// Methods
const emitFiltersChange = () => {
  emit('update:filters', { ...localFilters })
}

const setRating = (rating: number) => {
  localFilters.minRating = rating
  emitFiltersChange()
}
</script>

<style scoped>
.filters-sidebar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.filters-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--dark-color);
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.price-display {
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: var(--primary-color);
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.price-input {
  flex: 1;
  font-size: 0.9rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

.brand-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.brand-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.show-more-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  padding: 0;
  margin-top: 0.5rem;
}

.rating-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-option {
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: left;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-option:hover {
  background: var(--light-color);
  border-color: var(--primary-color);
}

.rating-option.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  font-size: 1rem;
  letter-spacing: 1px;
}

.rating-text {
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .filters-sidebar {
    position: static;
    max-height: none;
  }
}
</style>