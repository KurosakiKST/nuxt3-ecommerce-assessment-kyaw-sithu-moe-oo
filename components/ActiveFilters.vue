<template>
  <div v-if="hasActiveFilters" class="active-filters-bar">
    <div class="active-filters-header">
      <h4>Active Filters:</h4>
      <button @click="$emit('clear-all')" class="clear-all-filters">
        Clear All
      </button>
    </div>

    <div class="active-filter-chips">
      <!-- Search Filter Chip -->
      <span v-if="searchQuery" class="filter-chip">
        Search: "{{ searchQuery }}"
        <button @click="$emit('clear-search')" class="remove-chip">✕</button>
      </span>

      <!-- Category Filter Chip -->
      <span v-if="filters.selectedCategory" class="filter-chip">
        {{ getCategoryDisplayName(filters.selectedCategory) }}
        <button @click="$emit('clear-category')" class="remove-chip">✕</button>
      </span>

      <!-- Price Range Filter Chip -->
      <span v-if="hasPriceFilter" class="filter-chip">
        ${{ filters.minPrice }}-${{ filters.maxPrice }}
        <button @click="$emit('clear-price')" class="remove-chip">✕</button>
      </span>

      <!-- Brand Filter Chips -->
      <span v-for="brand in filters.selectedBrands" :key="brand" class="filter-chip">
        {{ brand }}
        <button @click="$emit('remove-brand', brand)" class="remove-chip">✕</button>
      </span>

      <!-- Rating Filter Chip -->
      <span v-if="filters.minRating > 0" class="filter-chip">
        {{ filters.minRating }}+ Stars
        <button @click="$emit('clear-rating')" class="remove-chip">✕</button>
      </span>

      <!-- Sort Filter Chip -->
      <span v-if="sortBy" class="filter-chip">
        Sort: {{ getSortDisplayName(sortBy) }}
        <button @click="$emit('clear-sort')" class="remove-chip">✕</button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category, FilterState } from '~/types'

interface Props {
  searchQuery: string
  filters: FilterState
  sortBy: string
  categories: Category[]
  priceRange: { min: number; max: number }
}

interface Emits {
  (e: 'clear-search'): void
  (e: 'clear-category'): void
  (e: 'clear-price'): void
  (e: 'clear-rating'): void
  (e: 'clear-sort'): void
  (e: 'remove-brand', brand: string): void
  (e: 'clear-all'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Computed
const hasActiveFilters = computed(() => {
  return props.searchQuery ||
    props.filters.selectedCategory ||
    hasPriceFilter.value ||
    props.filters.selectedBrands.length > 0 ||
    props.filters.minRating > 0 ||
    props.sortBy
})

const hasPriceFilter = computed(() => {
  return props.filters.minPrice > props.priceRange.min ||
    props.filters.maxPrice < props.priceRange.max
})

// Utility methods
const getCategoryDisplayName = (slug: string) => {
  const category = props.categories.find(cat => cat.slug === slug)
  return category ? category.name : slug
}

const getSortDisplayName = (sortValue: string) => {
  const sortLabels: Record<string, string> = {
    'price-low': 'Price Low-High',
    'price-high': 'Price High-Low',
    'rating': 'Highest Rated',
    'name': 'Name A-Z'
  }
  return sortLabels[sortValue] || 'Featured'
}
</script>

<style scoped>
.active-filters-bar {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.active-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.active-filters-header h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
}

.clear-all-filters {
  background: var(--danger-color);
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.clear-all-filters:hover {
  background: #dc2626;
}

.active-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.remove-chip {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  font-weight: bold;
  padding: 0;
  margin-left: 0.25rem;
  font-size: 0.9rem;
}

.remove-chip:hover {
  color: #dc2626;
}

@media (max-width: 768px) {
  .active-filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .active-filter-chips {
    gap: 0.25rem;
  }

  .filter-chip {
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
  }
}
</style>