<template>
  <div class="products-page">
    <section class="products-section">
      <div class="container">
        <!-- Search with quick filter for category -->
        <div class="quick-filters-bar">
          <SearchFilter v-model="state.searchQuery" placeholder="Search products..." @search="handleSearch"
            @clear="handleClearSearch" />
        </div>

        <div class="products-layout">
          <!-- Advanced Filters Sidebar -->
          <AdvancedFilters :filters="state.filters" :categories="state.categories" :available-brands="availableBrands"
            :price-range="priceRange" @update:filters="handleFiltersUpdate" @clear-all="clearAllFilters" />

          <!-- Main Content -->
          <main class="products-main">
            <!-- Active Filters Display -->
            <ActiveFilters :search-query="state.searchQuery" :filters="state.filters" :sort-by="state.sortBy"
              :categories="state.categories" :price-range="priceRange" @clear-search="handleClearSearch"
              @clear-category="clearCategory" @clear-price="clearPriceFilter" @clear-rating="clearRatingFilter"
              @clear-sort="clearSort" @remove-brand="removeBrand" @clear-all="clearAllFilters" />

            <!-- Results Header -->
            <div class="results-header">
              <div class="results-info">
                <h2>{{ filteredProducts.length }} Products</h2>
                <p class="text-muted">
                  Showing {{ paginatedProducts.length }} of {{ filteredProducts.length }} products
                </p>
              </div>

              <!-- View and Sort Controls -->
              <div class="controls-group">
                <!-- View Toggle -->
                <div class="view-toggle">
                  <button @click="state.viewMode = 'grid'" :class="['view-btn', { active: state.viewMode === 'grid' }]"
                    title="Grid View">
                    ⊞
                  </button>
                  <button @click="state.viewMode = 'list'" :class="['view-btn', { active: state.viewMode === 'list' }]"
                    title="List View">
                    ☰
                  </button>
                </div>

                <!-- Sort Options -->
                <div class="sort-controls">
                  <select v-model="state.sortBy" @change="applySorting" class="sort-select">
                    <option value="">Sort by: Featured</option>
                    <option value="price-low">Sort by: Price Low-High</option>
                    <option value="price-high">Sort by: Price High-Low</option>
                    <option value="rating">Sort by: Highest Rated</option>
                    <option value="name">Sort by: Name A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="state.loading" class="loading-container">
              <div class="spinner"></div>
              <p>Loading products...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="state.error" class="error-container">
              <div class="alert alert-error">
                {{ state.error }}
                <button @click="fetchProducts" class="btn btn-primary mt-2">
                  Try Again
                </button>
              </div>
            </div>

            <!-- No Results -->
            <div v-else-if="filteredProducts.length === 0" class="no-results">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button @click="clearAllFilters" class="btn btn-outline">
                Clear All Filters
              </button>
            </div>

            <!-- Products Grid/List -->
            <div v-else :class="['products-container', state.viewMode]">
              <ProductCard v-for="product in paginatedProducts" :key="product.id" :product="product"
                :is-list-view="state.viewMode === 'list'" />
            </div>

            <!-- Pagination -->
            <ProductsPagination v-if="totalPages > 1" :current-page="state.currentPage" :total-pages="totalPages"
              :total-products="filteredProducts.length" @page-change="goToPage" />
          </main>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { FilterState } from '~/types'

import SearchFilter from '~/components/SearchFilter.vue'
import AdvancedFilters from '~/components/AdvancedFilters.vue'
import ActiveFilters from '~/components/ActiveFilters.vue'

// ✅ Fix: Use composable only once and destructure everything you need
const {
  state,
  availableBrands,
  priceRange,
  filteredProducts,
  totalPages,
  paginatedProducts,
  updatePriceRange  // ✅ Get updatePriceRange from the same instance
} = useProductsFilters()

// Use products API composable
const { getAllProducts, searchProducts, getCategories, getProductsByCategory } = useProducts()

// Router composables
const route = useRoute()
const router = useRouter()

// ✅ Add price validation helper function
const validateAndFixPriceRange = () => {
  const { min, max } = priceRange.value

  // Clamp values to absolute bounds
  state.filters.minPrice = Math.max(Math.min(state.filters.minPrice, max), min)
  state.filters.maxPrice = Math.min(Math.max(state.filters.maxPrice, min), max)

  // Fix min > max issue by swapping values
  if (state.filters.minPrice > state.filters.maxPrice) {
    const temp = state.filters.minPrice
    state.filters.minPrice = state.filters.maxPrice
    state.filters.maxPrice = temp

    // Optional: Show user feedback
    console.warn('Price range corrected: min and max values were swapped')
  }
}

// Utility functions for scroll management
const scrollToProducts = () => {
  const productsElement = document.querySelector('.products-main')
  if (productsElement) {
    const offset = 100
    const elementPosition = productsElement.getBoundingClientRect().top + window.pageYOffset

    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    })
  }
}

// Enhanced filter change handler (using composable state)
const handleFilterChange = (options: {
  updateFilters?: () => void
  refetchProducts?: boolean
  resetPage?: boolean
  updateUrl?: boolean
  scrollToTop?: boolean
} = {}) => {
  const {
    updateFilters,
    refetchProducts = false,
    resetPage = false,
    updateUrl = true,
    scrollToTop = true
  } = options

  // Execute filter updates if provided
  updateFilters?.()

  // Reset page if requested
  if (resetPage) {
    state.currentPage = 1
  }

  // Refetch products if needed
  if (refetchProducts) {
    fetchProducts()
  }

  // Update URL if requested
  if (updateUrl) {
    updateURL()
  }

  // Scroll to products section if requested
  if (scrollToTop) {
    nextTick(() => {
      scrollToProducts()
    })
  }
}

// ✅ Fixed filter clearing system
type FilterType = 'category' | 'price' | 'rating' | 'sort' | 'brand' | 'search' | 'all'

const clearFilter = (filterType: FilterType, data?: any) => {
  const filterActions: Record<FilterType, () => void> = {
    category: () => {
      state.filters.selectedCategory = ''
    },
    price: () => {
      // Use validated price range reset
      const { min, max } = priceRange.value
      updatePriceRange(min, max)
    },
    rating: () => {
      state.filters.minRating = 0
    },
    sort: () => {
      state.sortBy = ''
    },
    brand: () => {
      if (data && typeof data === 'string') {
        const index = state.filters.selectedBrands.indexOf(data)
        if (index > -1) {
          state.filters.selectedBrands.splice(index, 1)
        }
      }
    },
    search: () => {
      state.searchQuery = ''
    },
    all: () => {
      // Clear all filters at once with validation
      const { min, max } = priceRange.value

      state.searchQuery = ''
      state.filters.selectedCategory = ''
      state.filters.selectedBrands = []
      state.filters.minRating = 0
      state.sortBy = ''
      state.currentPage = 1

      // Use validated price reset
      updatePriceRange(min, max)
    }
  }

  // Execute the appropriate filter action
  const action = filterActions[filterType]
  if (action) {
    handleFilterChange({
      updateFilters: action,
      refetchProducts: ['category', 'search', 'all'].includes(filterType),
      resetPage: ['category', 'search', 'all'].includes(filterType)
    })
  }
}

// Event handlers (using composable state)
const handleSearch = (query: string) => {
  handleFilterChange({
    updateFilters: () => {
      state.searchQuery = query
    },
    refetchProducts: true,
    resetPage: true
  })
}

const handleClearSearch = () => {
  clearFilter('search')
}

// ✅ Fixed handleFiltersUpdate with validation
const handleFiltersUpdate = (newFilters: FilterState) => {
  handleFilterChange({
    updateFilters: () => {
      Object.assign(state.filters, newFilters)
      // Add validation after filter update
      validateAndFixPriceRange()
    },
    refetchProducts: true,
    resetPage: true
  })
}

// Clear functions (using the generic system)
const clearCategory = () => clearFilter('category')
const clearPriceFilter = () => clearFilter('price')
const clearRatingFilter = () => clearFilter('rating')
const clearSort = () => clearFilter('sort')
const removeBrand = (brand: string) => clearFilter('brand', brand)
const clearAllFilters = () => clearFilter('all')

// Pagination methods (using composable state)
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    handleFilterChange({
      updateFilters: () => {
        state.currentPage = page
      },
      refetchProducts: false,
      scrollToTop: true
    })
  }
}

// Sorting handler (using composable state)
const applySorting = () => {
  handleFilterChange({
    refetchProducts: false,
    scrollToTop: true
  })
}

// API Methods (using composable state)
const fetchProducts = async () => {
  try {
    state.loading = true
    state.error = null

    let response

    // API call logic (unchanged)
    if (state.searchQuery.trim() && state.filters.selectedCategory) {
      response = await getProductsByCategory(state.filters.selectedCategory, { limit: 100 })
      const searchTerm = state.searchQuery.toLowerCase()
      response.products = response.products.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      )
    } else if (state.searchQuery.trim()) {
      response = await searchProducts(state.searchQuery, { limit: 100 })
    } else if (state.filters.selectedCategory) {
      response = await getProductsByCategory(state.filters.selectedCategory, { limit: 100 })
    } else {
      response = await getAllProducts({ limit: 100 })
    }

    state.products = response.products

  } catch (err: any) {
    state.error = err.message || 'Failed to load products'
  } finally {
    state.loading = false
  }
}

const loadCategories = async () => {
  try {
    state.categories = await getCategories()
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

// URL management (using composable state)
const updateURL = () => {
  const query: Record<string, string> = {}

  if (state.searchQuery.trim()) query.q = state.searchQuery
  if (state.filters.selectedCategory) query.category = state.filters.selectedCategory
  if (state.filters.minPrice > priceRange.value.min) query.minPrice = state.filters.minPrice.toString()
  if (state.filters.maxPrice < priceRange.value.max) query.maxPrice = state.filters.maxPrice.toString()
  if (state.filters.selectedBrands.length > 0) query.brands = state.filters.selectedBrands.join(',')
  if (state.filters.minRating > 0) query.rating = state.filters.minRating.toString()
  if (state.sortBy) query.sort = state.sortBy
  if (state.currentPage > 1) query.page = state.currentPage.toString()

  router.push({ query })
}

// ✅ Fixed parseURLParams with validation
const parseURLParams = () => {
  const query = route.query

  if (query.q) state.searchQuery = query.q as string
  if (query.category) {
    state.filters.selectedCategory = query.category as string
  }
  if (query.minPrice) state.filters.minPrice = parseInt(query.minPrice as string) || 0
  if (query.maxPrice) state.filters.maxPrice = parseInt(query.maxPrice as string) || 2000
  if (query.brands) state.filters.selectedBrands = (query.brands as string).split(',').filter(Boolean)
  if (query.rating) state.filters.minRating = parseFloat(query.rating as string) || 0
  if (query.sort) state.sortBy = query.sort as string
  if (query.page) state.currentPage = parseInt(query.page as string) || 1

  // ✅ Validate price range after parsing URL params
  validateAndFixPriceRange()
}

// Initialize
onMounted(async () => {
  parseURLParams()
  await Promise.all([loadCategories(), fetchProducts()])
})
</script>

<style scoped>
.products-page {
  min-height: 100vh;
}

.products-section {
  padding: 0.1rem 0;
}

/* Quick Filters Bar */
.quick-filters-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  min-width: 150px;
}

/* Layout */
.products-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  align-items: start;
}

/* Main Content */
.products-main {
  min-height: 500px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.results-info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
}

.results-info p {
  margin: 0;
}

.controls-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* View Toggle */
.view-toggle {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  padding: 0.5rem 0.75rem;
  background: white;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  border-right: 1px solid var(--border-color);
}

.view-btn:last-child {
  border-right: none;
}

.view-btn:hover {
  background: var(--light-color);
}

.view-btn.active {
  background: var(--primary-color);
  color: white;
}

.sort-controls {
  display: flex;
  align-items: center;
}

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  min-width: 200px;
}

/* Products Container */
.products-container {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.products-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.products-container.list {
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Loading, Error, and Empty States */
.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error-container,
.no-results {
  text-align: center;
  padding: 4rem 2rem;
}

.alert {
  padding: 1rem;
  border-radius: var(--border-radius);
  margin: 2rem 0;
}

.alert-error {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .quick-filters-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filter-select {
    min-width: auto;
    flex: 1;
  }

  .products-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .products-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .products-container.grid {
    grid-template-columns: 1fr 1fr;
  }

  .controls-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}
</style>