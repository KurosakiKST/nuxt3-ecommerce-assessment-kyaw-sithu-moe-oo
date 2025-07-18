<template>
  <div class="products-page">
    <section class="products-hero">
      <div class="container">
        <div class="hero-content">
          <h1>Products</h1>
          <p>Discover our wide range of quality products</p>
        </div>
      </div>
    </section>

    <section class="products-section">
      <div class="container">
        <h2>All Products</h2>
        
        <!-- Search and Filter Section -->
        <div class="card mb-4">
          <div class="card-body">
            <!-- Search Input -->
            <div class="form-group mb-3">
              <label class="form-label">Search Products</label>
              <div class="search-box">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search products..."
                  class="form-input"
                  @input="onSearchInput"
                />
                <button
                  v-if="searchQuery"
                  @click="clearSearch"
                  class="clear-search"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <!-- Category Filter -->
            <div class="form-group mb-2">
              <label class="form-label">Filter by Category</label>
              <select 
                v-model="selectedCategory" 
                @change="onCategoryChange"
                class="form-select"
              >
                <option value="">All Categories</option>
                <option 
                  v-for="category in categories" 
                  :key="category.slug" 
                  :value="category.slug"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
            
            <!-- Active Filters Display -->
            <div v-if="searchQuery || selectedCategory" class="flex gap-2 flex-wrap">
              <span class="badge badge-primary" v-if="searchQuery">
                Search: "{{ searchQuery }}"
                <button @click="clearSearch" class="ml-1">✕</button>
              </span>
              <span class="badge badge-secondary" v-if="selectedCategory">
                Category: {{ getCategoryDisplayName(selectedCategory) }}
                <button @click="clearCategory" class="ml-1">✕</button>
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
        </div>
        
        <div v-else-if="error" class="alert alert-error">
          {{ error }}
          <button @click="fetchProducts" class="btn btn-primary" style="margin-top: 1rem;">
            Try Again
          </button>
        </div>
        
        <div v-else>
          <div class="text-center mb-3">
            <p class="text-muted">
              Showing {{ products.length }} products
              <span v-if="searchQuery"> for "{{ searchQuery }}"</span>
              <span v-if="selectedCategory"> in {{ getCategoryDisplayName(selectedCategory) }}</span>
            </p>
          </div>
          
          <!-- No Results State -->
          <div v-if="products.length === 0" class="text-center p-4">
            <h3>No products found</h3>
            <p class="text-muted">
              <span v-if="searchQuery && selectedCategory">
                No products match "{{ searchQuery }}" in {{ getCategoryDisplayName(selectedCategory) }}.
              </span>
              <span v-else-if="searchQuery">
                No products match "{{ searchQuery }}".
              </span>
              <span v-else-if="selectedCategory">
                No products found in {{ getCategoryDisplayName(selectedCategory) }}.
              </span>
              <span v-else>
                No products available.
              </span>
            </p>
            <div class="flex gap-2 justify-center mt-3">
              <button v-if="searchQuery" @click="clearSearch" class="btn btn-outline">
                Clear Search
              </button>
              <button v-if="selectedCategory" @click="clearCategory" class="btn btn-outline">
                Clear Category
              </button>
            </div>
          </div>
          
          <div v-else class="grid grid-cols-4 gap-3">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
            />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category } from '~/types'

const { getAllProducts, searchProducts, getCategories, getProductsByCategory } = useProducts()
const route = useRoute()
const router = useRouter()

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedCategory = ref('')

// Debouncing variables
let searchTimeout: NodeJS.Timeout

// Fetch products function
const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('Fetching products...')
    console.log('Search query:', searchQuery.value)
    console.log('Selected category:', selectedCategory.value)
    
    let response
    
    // Priority: Search + Category > Search only > Category only > All products
    if (searchQuery.value.trim() && selectedCategory.value) {
      // Search within a specific category
      console.log('Searching within category')
      response = await getProductsByCategory(selectedCategory.value, { limit: 50 })
      // Filter search results on client side
      const searchTerm = searchQuery.value.toLowerCase()
      response.products = response.products.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      )
      response.total = response.products.length
    } else if (searchQuery.value.trim()) {
      // Search only
      console.log('Search only')
      response = await searchProducts(searchQuery.value, { limit: 50 })
    } else if (selectedCategory.value) {
      // Category only - use the original kebab-case format
      console.log('Category only')
      const categoryForAPI = selectedCategory.value
      console.log('Using category for API:', categoryForAPI)
      response = await getProductsByCategory(categoryForAPI, { limit: 50 })
    } else {
      // All products
      console.log('All products')
      response = await getAllProducts({ limit: 50 })
    }
    
    console.log('API Response:', response)
    products.value = response.products
    
  } catch (err: any) {
    console.error('Error fetching products:', err)
    error.value = err.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

// Load categories function
const loadCategories = async () => {
  try {
    console.log('Loading categories...')
    const categoriesData = await getCategories()
    console.log('Categories loaded:', categoriesData)
    categories.value = categoriesData
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

// Debounced search function
const onSearchInput = () => {
  console.log('User typed:', searchQuery.value)
  
  // Clear previous timeout
  clearTimeout(searchTimeout)
  
  // Set new timeout for 500ms
  searchTimeout = setTimeout(() => {
    console.log('Debounced search triggered after 500ms')
    updateURL()
    fetchProducts()
  }, 500)
}

// Category change handler
const onCategoryChange = () => {
  console.log('Category changed to:', selectedCategory.value)
  updateURL()
  fetchProducts()
}

// Clear category function
const clearCategory = () => {
  console.log('Clearing category')
  selectedCategory.value = ''
  updateURL()
  fetchProducts()
}

// Clear search function
const clearSearch = () => {
  console.log('Clearing search')
  searchQuery.value = ''
  updateURL()
  fetchProducts()
}

// Get category display name by slug
const getCategoryDisplayName = (slug: string) => {
  const category = categories.value.find(cat => cat.slug === slug)
  return category ? category.name : slug
}

// URL management
const updateURL = () => {
  const query: Record<string, string> = {}
  
  if (searchQuery.value.trim()) {
    query.q = searchQuery.value
  }
  
  if (selectedCategory.value) {
    query.category = selectedCategory.value
  }
  
  console.log('Updating URL with query:', query)
  router.push({ query })
}

// Parse URL parameters
const parseURLParams = () => {
  const query = route.query
  console.log('URL query params:', query)
  
  if (query.q) {
    searchQuery.value = query.q as string
    console.log('Found search query in URL:', searchQuery.value)
  }
  
  if (query.category) {
    selectedCategory.value = query.category as string
    console.log('Found category in URL:', selectedCategory.value)
  }
}

// Fetch products when component mounts
onMounted(async () => {
  console.log('Products page mounted')
  
  // Parse URL parameters first
  parseURLParams()
  
  // Load categories and products in parallel
  await Promise.all([
    loadCategories(),
    fetchProducts()
  ])
})
</script>

<style scoped>
.products-page {
  min-height: 100vh;
}

.products-hero {
  background: linear-gradient(135deg, var(--primary-color), #1d4ed8);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: white;
}

.hero-content p {
  font-size: 1.25rem;
  margin-bottom: 0;
  opacity: 0.9;
}

.products-section {
  padding: 4rem 0;
}

.products-section h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-search:hover {
  color: var(--danger-color);
  background-color: #fee2e2;
}

.badge button {
  background: none;
  border: none;
  color: inherit;
  margin-left: 0.25rem;
  cursor: pointer;
  opacity: 0.8;
}

.badge button:hover {
  opacity: 1;
}

.products-info {
  margin-bottom: 2rem;
  text-align: center;
  color: var(--text-light);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.loading-container {
  text-align: center;
  padding: 3rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.alert {
  padding: 1rem;
  border-radius: var(--border-radius);
  margin: 2rem 0;
  text-align: center;
}

.alert-error {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* Custom styles only for specific positioning */

/* Mobile responsive - using utility classes where possible */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
}
</style>