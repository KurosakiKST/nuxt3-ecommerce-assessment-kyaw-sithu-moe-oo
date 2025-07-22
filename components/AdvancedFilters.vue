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

      <!-- Display current range with validation feedback -->
      <div class="price-display">
        <span :class="{ 'price-warning': priceValidationError }">
          ${{ validatedMinPrice }} - ${{ validatedMaxPrice }}
        </span>
        <small v-if="priceValidationError" class="error-text">
          {{ priceValidationError }}
        </small>
      </div>

      <!-- Price Input Controls -->
      <div class="price-inputs">
        <div class="price-input-group">
          <label class="price-label">Min</label>
          <input v-model.number="localMinPrice" type="number" :min="priceRange.min" :max="priceRange.max"
            :class="['form-input', 'price-input', { 'input-error': priceValidationError }]" placeholder="Min"
            @input="handleMinPriceChange" @blur="validateAndUpdatePrices" />
        </div>

        <span class="price-separator">to</span>

        <div class="price-input-group">
          <label class="price-label">Max</label>
          <input v-model.number="localMaxPrice" type="number" :min="priceRange.min" :max="priceRange.max"
            :class="['form-input', 'price-input', { 'input-error': priceValidationError }]" placeholder="Max"
            @input="handleMaxPriceChange" @blur="validateAndUpdatePrices" />
        </div>
      </div>

      <!-- Price Range Slider -->
      <div class="price-slider-container">
        <input type="range" :min="priceRange.min" :max="priceRange.max" :value="validatedMinPrice"
          @input="handleSliderMinChange" class="price-slider price-slider-min" />
        <input type="range" :min="priceRange.min" :max="priceRange.max" :value="validatedMaxPrice"
          @input="handleSliderMaxChange" class="price-slider price-slider-max" />
        <div class="price-slider-track-fill" :style="trackFillStyle"></div>
      </div>
    </div>

    <!-- Brand Filter -->
    <div class="filter-section">
      <h4>Brand</h4>
      <div class="brand-list">
        <label v-for="brand in displayedBrands" :key="brand" class="brand-item">
          <input v-model="localFilters.selectedBrands" type="checkbox" :value="brand" @change="emitFiltersChange" />
          <span class="brand-name">{{ brand }}</span>
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

// Local state for price inputs
const localMinPrice = ref(props.filters.minPrice)
const localMaxPrice = ref(props.filters.maxPrice)
const priceValidationError = ref('')

let sliderTimeout: NodeJS.Timeout

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  Object.assign(localFilters, newFilters)
  localMinPrice.value = newFilters.minPrice
  localMaxPrice.value = newFilters.maxPrice
}, { deep: true })

// Computed for validated prices
const validatedMinPrice = computed(() => {
  if (localMinPrice.value > localMaxPrice.value) {
    return localMaxPrice.value
  }
  return Math.max(Math.min(localMinPrice.value, props.priceRange.max), props.priceRange.min)
})

const validatedMaxPrice = computed(() => {
  if (localMaxPrice.value < localMinPrice.value) {
    return localMinPrice.value
  }
  return Math.min(Math.max(localMaxPrice.value, props.priceRange.min), props.priceRange.max)
})

// Computed for displayed brands
const displayedBrands = computed(() => {
  return showAllBrands.value
    ? props.availableBrands
    : props.availableBrands.slice(0, 6)
})


const trackFillStyle = computed(() => {
  const range = props.priceRange.max - props.priceRange.min
  const minPercent = ((validatedMinPrice.value - props.priceRange.min) / range) * 100
  const maxPercent = ((validatedMaxPrice.value - props.priceRange.min) / range) * 100

  return {
    left: `${minPercent}%`,
    width: `${maxPercent - minPercent}%`
  }
})

// Price validation methods
const validatePrices = () => {
  priceValidationError.value = ''

  if (localMinPrice.value > localMaxPrice.value) {
    priceValidationError.value = 'Min price cannot be greater than max price'
    return false
  }

  if (localMinPrice.value < props.priceRange.min || localMinPrice.value > props.priceRange.max) {
    priceValidationError.value = `Min price must be between $${props.priceRange.min} and $${props.priceRange.max}`
    return false
  }

  if (localMaxPrice.value < props.priceRange.min || localMaxPrice.value > props.priceRange.max) {
    priceValidationError.value = `Max price must be between $${props.priceRange.min} and $${props.priceRange.max}`
    return false
  }

  return true
}

const validateAndUpdatePrices = () => {
  // Auto-correct invalid values
  if (localMinPrice.value > localMaxPrice.value) {
    // Swap values
    const temp = localMinPrice.value
    localMinPrice.value = localMaxPrice.value
    localMaxPrice.value = temp
    priceValidationError.value = 'Prices were swapped to maintain valid range'

    // Clear error after a delay
    setTimeout(() => {
      priceValidationError.value = ''
    }, 3000)
  }

  // Clamp to valid range
  localMinPrice.value = Math.max(Math.min(localMinPrice.value, props.priceRange.max), props.priceRange.min)
  localMaxPrice.value = Math.min(Math.max(localMaxPrice.value, props.priceRange.min), props.priceRange.max)

  // Emit the corrected values
  emitFiltersChange()
}

const handleMinPriceChange = () => {
  // Real-time validation feedback
  validatePrices()
}

const handleMaxPriceChange = () => {
  // Real-time validation feedback
  validatePrices()
}

const handleSliderMinChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  localMinPrice.value = parseInt(target.value)

  clearTimeout(sliderTimeout)
  sliderTimeout = setTimeout(() => {
    validateAndUpdatePrices()
  }, 300)
}

const handleSliderMaxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  localMaxPrice.value = parseInt(target.value)

  clearTimeout(sliderTimeout)
  sliderTimeout = setTimeout(() => {
    validateAndUpdatePrices()
  }, 300)
}

// Rating methods
const setRating = (rating: number) => {
  localFilters.minRating = rating
  emitFiltersChange()
}

// Main emit function
const emitFiltersChange = () => {
  const updatedFilters = {
    ...localFilters,
    minPrice: validatedMinPrice.value,
    maxPrice: validatedMaxPrice.value
  }
  emit('update:filters', updatedFilters)
}

onUnmounted(() => {
  clearTimeout(sliderTimeout)
})
</script>

<style scoped>
.filters-sidebar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.filters-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.clear-all-btn {
  background: var(--danger-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.clear-all-btn:hover {
  background: #dc2626;
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
}

/* Category Filter */
.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Price Range Styles */
.price-display {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
}

.price-warning {
  color: #f59e0b;
}

.error-text {
  display: block;
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  font-weight: normal;
}

.price-inputs {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.price-input-group {
  flex: 1;
}

.price-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.price-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
}

.price-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.price-separator {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

/* Price Slider Styles */
.price-slider-container {
  position: relative;
  margin: 1.5rem 0;
  height: 30px;
}

.price-slider {
  position: absolute;
  width: 100%;
  height: 6px;
  background: transparent;
  -webkit-appearance: none;
  appearance: none;
  pointer-events: none;
}

.price-slider-track-fill {
  position: absolute;
  top: 50%;
  height: 6px;
  transform: translateY(-50%);
  background-color: var(--primary-color);
  /* You can change this to a gradient if you want */
  border-radius: 3px;
  z-index: 0;
  pointer-events: none;
}

.price-slider::-webkit-slider-track {
  background: var(--border-color);
  height: 6px;
  border-radius: 3px;
}

.price-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid white;
}

.price-slider-min::-webkit-slider-thumb {
  background: #10b981;
}

.price-slider-max::-webkit-slider-thumb {
  background: var(--primary-color);
}

/* Firefox */
.price-slider::-moz-range-track {
  background: var(--border-color);
  height: 6px;
  border-radius: 3px;
  border: none;
}

.price-slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Price Presets */
.price-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.preset-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.preset-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.preset-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Brand Filter */
.brand-list {
  max-height: 200px;
  overflow-y: auto;
}

.brand-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: 4px;
}

.brand-item:hover {
  background: #f8fafc;
}

.brand-item input[type="checkbox"] {
  margin: 0;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.brand-name {
  font-size: 0.9rem;
  color: var(--text-color);
}

.show-more-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  transition: color 0.2s ease;
}

.show-more-btn:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Rating Filter */
.rating-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-option {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.rating-option:hover {
  border-color: var(--primary-color);
  background: #f8fafc;
}

.rating-option.active {
  border-color: var(--primary-color);
  background: rgba(37, 99, 235, 0.05);
}

.rating-stars {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  color: #fbbf24;
  font-size: 1rem;
}

.rating-text {
  font-size: 0.875rem;
  color: var(--text-color);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .filters-sidebar {
    position: relative;
    top: 0;
    margin-bottom: 1rem;
  }

  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .price-inputs {
    flex-direction: column;
    gap: 1rem;
  }

  .price-separator {
    text-align: center;
    margin: 0;
  }

  .price-presets {
    justify-content: center;
  }

  .brand-list {
    max-height: 150px;
  }
}

@media (max-width: 480px) {
  .filters-sidebar {
    padding: 1rem;
  }

  .price-display {
    font-size: 0.9rem;
    padding: 0.5rem;
  }

  .preset-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}

/* Custom scrollbar for brand list */
.brand-list::-webkit-scrollbar {
  width: 4px;
}

.brand-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.brand-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.brand-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-light);
}
</style>