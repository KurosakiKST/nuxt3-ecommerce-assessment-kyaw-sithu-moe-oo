<template>
  <div class="products-page">
    <section class="products-section">
      <div class="container">
        <!-- Search with quick filter for category -->
        <div class="quick-filters-bar">
          <SearchFilter v-model="searchQuery" placeholder="Search products..." @search="handleSearch"
            @clear="handleClearSearch" />
        </div>

        <div class="products-layout">
          <!-- Advanced Filters Sidebar -->
          <AdvancedFilters :filters="filters" :categories="categories" :available-brands="availableBrands"
            :price-range="priceRange" @update:filters="handleFiltersUpdate" @clear-all="clearAllFilters" />

          <!-- Main Content -->
          <main class="products-main">
            <!-- Active Filters Display -->
            <ActiveFilters :search-query="searchQuery" :filters="filters" :sort-by="sortBy" :categories="categories"
              :price-range="priceRange" @clear-search="handleClearSearch" @clear-category="clearCategory"
              @clear-price="clearPriceFilter" @clear-rating="clearRatingFilter" @clear-sort="clearSort"
              @remove-brand="removeBrand" @clear-all="clearAllFilters" />

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
                  <button @click="viewMode = 'grid'" :class="['view-btn', { active: viewMode === 'grid' }]"
                    title="Grid View">
                    ⊞
                  </button>
                  <button @click="viewMode = 'list'" :class="['view-btn', { active: viewMode === 'list' }]"
                    title="List View">
                    ☰
                  </button>
                </div>

                <!-- Sort Options -->
                <div class="sort-controls">
                  <select v-model="sortBy" @change="applySorting" class="sort-select">
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
            <div v-if="loading" class="loading-container">
              <div class="spinner"></div>
              <p>Loading products...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-container">
              <div class="alert alert-error">
                {{ error }}
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
            <div v-else :class="['products-container', viewMode]">
              <ProductCard v-for="product in paginatedProducts" :key="product.id" :product="product"
                :is-list-view="viewMode === 'list'" />
            </div>

            <!-- Pagination -->
            <ProductsPagination v-if="totalPages > 1" :current-page="currentPage" :total-pages="totalPages"
              :total-products="filteredProducts.length" @page-change="goToPage" />
          </main>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category } from '~/types'

import SearchFilter from '~/components/SearchFilter.vue'
import AdvancedFilters from '~/components/AdvancedFilters.vue'
import ActiveFilters from '~/components/ActiveFilters.vue'

const { getAllProducts, searchProducts, getCategories, getProductsByCategory } = useProducts()
const route = useRoute()
const router = useRouter()

interface FilterState {
  selectedCategory: string
  minPrice: number
  maxPrice: number
  selectedBrands: string[]
  minRating: number
}

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const quickCategory = ref('')
const sortBy = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const itemsPerPage = 12

const filters = reactive<FilterState>({
  selectedCategory: '',
  minPrice: 0,
  maxPrice: 2000,
  selectedBrands: [],
  minRating: 0
})

// Computed properties
const availableBrands = computed(() => {
  const brands = new Set(
    products.value
      .map(product => product.brand)
      .filter(brand => brand && brand.trim() !== '')
  )
  return Array.from(brands).sort()
})

// Scroll to products function
const scrollToProducts = () => {
  const productsElement = document.querySelector('.products-main')
  if (productsElement) {
    const offset = 100 // Add some offset from the top
    const elementPosition = productsElement.getBoundingClientRect().top + window.pageYOffset

    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    })
  }
}

const priceRange = computed(() => {
  if (products.value.length === 0) return { min: 0, max: 2000 }

  const prices = products.value.map(product =>
    product.price - (product.price * product.discountPercentage / 100)
  )
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices))
  }
})

const filteredProducts = computed(() => {
  let filtered = [...products.value]

  // Price filter
  if (filters.minPrice > priceRange.value.min || filters.maxPrice < priceRange.value.max) {
    filtered = filtered.filter(product => {
      const price = product.price - (product.price * product.discountPercentage / 100)
      return price >= filters.minPrice && price <= filters.maxPrice
    })
  }

  // Brand filter
  if (filters.selectedBrands.length > 0) {
    filtered = filtered.filter(product =>
      filters.selectedBrands.includes(product.brand)
    )
  }

  // Rating filter
  if (filters.minRating > 0) {
    filtered = filtered.filter(product => product.rating >= filters.minRating)
  }

  return filtered
})

const sortedProducts = computed(() => {
  if (!sortBy.value) return filteredProducts.value

  const sorted = [...filteredProducts.value]

  switch (sortBy.value) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'name':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    default:
      return sorted
  }
})

// Pagination computed properties
const totalPages = computed(() => Math.ceil(sortedProducts.value.length / itemsPerPage))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedProducts.value.slice(start, end)
})

// Event handlers
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
  fetchProducts()
  updateURL()
  nextTick(() => {
    scrollToProducts()
  })
}

const handleClearSearch = () => {
  searchQuery.value = ''
  fetchProducts()
  updateURL()
}

const handleFiltersUpdate = (newFilters: FilterState) => {
  Object.assign(filters, newFilters)
  quickCategory.value = newFilters.selectedCategory
  currentPage.value = 1
  fetchProducts()
  updateURL()
  nextTick(() => {
    scrollToProducts()
  })
}

// Methods
const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null

    let response

    // Get 100 Products max only
    if (searchQuery.value.trim() && filters.selectedCategory) {
      response = await getProductsByCategory(filters.selectedCategory, { limit: 100 })
      const searchTerm = searchQuery.value.toLowerCase()
      response.products = response.products.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      )
    } else if (searchQuery.value.trim()) {
      response = await searchProducts(searchQuery.value, { limit: 100 })
    } else if (filters.selectedCategory) {
      response = await getProductsByCategory(filters.selectedCategory, { limit: 100 })
    } else {
      response = await getAllProducts({ limit: 100 })
    }

    products.value = response.products

  } catch (err: any) {
    error.value = err.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

const applySorting = () => {
  updateURL()
}

// Clear functions
const clearCategory = () => {
  filters.selectedCategory = ''
  quickCategory.value = ''
  fetchProducts()
  updateURL()
  nextTick(() => {
    scrollToProducts()
  })
}

const clearPriceFilter = () => {
  filters.minPrice = priceRange.value.min
  filters.maxPrice = priceRange.value.max
  updateURL()
  nextTick(() => {
    scrollToProducts()
  })
}

const clearRatingFilter = () => {
  filters.minRating = 0
  updateURL()
  nextTick(() => {
    scrollToProducts()
  })
}

const clearSort = () => {
  sortBy.value = ''
  updateURL()
  nextTick(() => {
    scrollToProducts()
  })
}

const removeBrand = (brand: string) => {
  const index = filters.selectedBrands.indexOf(brand)
  if (index > -1) {
    filters.selectedBrands.splice(index, 1)
    updateURL()
    nextTick(() => {
      scrollToProducts()
    })
  }
}

const clearAllFilters = () => {
  searchQuery.value = ''
  quickCategory.value = ''
  filters.selectedCategory = ''
  filters.minPrice = priceRange.value.min
  filters.maxPrice = priceRange.value.max
  filters.selectedBrands = []
  filters.minRating = 0
  sortBy.value = ''
  currentPage.value = 1
  fetchProducts()
  updateURL()
  nextTick(() => {
    scrollToProducts()
  })
}

// Pagination methods
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    updateURL()
    nextTick(() => {
      scrollToProducts()
    })
  }
}

// URL management
const updateURL = () => {
  const query: Record<string, string> = {}

  if (searchQuery.value.trim()) query.q = searchQuery.value
  if (filters.selectedCategory) query.category = filters.selectedCategory
  if (filters.minPrice > priceRange.value.min) query.minPrice = filters.minPrice.toString()
  if (filters.maxPrice < priceRange.value.max) query.maxPrice = filters.maxPrice.toString()
  if (filters.selectedBrands.length > 0) query.brands = filters.selectedBrands.join(',')
  if (filters.minRating > 0) query.rating = filters.minRating.toString()
  if (sortBy.value) query.sort = sortBy.value
  if (currentPage.value > 1) query.page = currentPage.value.toString()

  router.push({ query })
}

const parseURLParams = () => {
  const query = route.query

  if (query.q) searchQuery.value = query.q as string
  if (query.category) {
    filters.selectedCategory = query.category as string
    quickCategory.value = query.category as string
  }
  if (query.minPrice) filters.minPrice = parseInt(query.minPrice as string) || 0
  if (query.maxPrice) filters.maxPrice = parseInt(query.maxPrice as string) || 2000
  if (query.brands) filters.selectedBrands = (query.brands as string).split(',').filter(Boolean)
  if (query.rating) filters.minRating = parseFloat(query.rating as string) || 0
  if (query.sort) sortBy.value = query.sort as string
  if (query.page) currentPage.value = parseInt(query.page as string) || 1
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