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

        <div class="card mb-4">
          <div class="card-body">
            <div class="form-group mb-2">
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
            <p v-if="searchQuery" class="text-muted mb-0">
              Searching for: "{{ searchQuery }}"
            </p>
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
            </p>
          </div>
          
          <div v-if="products.length === 0" class="text-center p-4">
            <h3>No products found</h3>
            <p v-if="searchQuery" class="text-muted">
              Try different keywords or 
              <button @click="clearSearch" class="btn btn-outline">Clear Search</button>
            </p>
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
import type { Product } from '~/types'

const { getAllProducts, searchProducts } = useProducts()
const route = useRoute()
const router = useRouter()

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')

let searchTimeout: NodeJS.Timeout

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('Fetching products...')
    console.log('Search query:', searchQuery.value)
    
    let response
    if (searchQuery.value.trim()) {
      response = await searchProducts(searchQuery.value, { limit: 12 })
      console.log('Search API Response:', response)
    } else {
      response = await getAllProducts({ limit: 12 })
      console.log('All Products API Response:', response)
    }
    
    products.value = response.products
    
  } catch (err: any) {
    console.error('Error fetching products:', err)
    error.value = err.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

const onSearchInput = () => {
  console.log('User typed:', searchQuery.value)
  
  clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(() => {
    console.log('Debounced search triggered after 500ms')
    updateURL()
    fetchProducts()
  }, 500)
}

const clearSearch = () => {
  console.log('Clearing search')
  searchQuery.value = ''
  updateURL()
  fetchProducts()
}

const updateURL = () => {
  const query: Record<string, string> = {}
  
  if (searchQuery.value.trim()) {
    query.q = searchQuery.value
  }
  
  console.log('Updating URL with query:', query)
  router.push({ query })
}

const parseURLParams = () => {
  const query = route.query
  console.log('URL query params:', query)
  
  if (query.q) {
    searchQuery.value = query.q as string
    console.log('Found search query in URL:', searchQuery.value)
  }
}

onMounted(async () => {
  console.log('Products page mounted')
  
  parseURLParams()
  
  await fetchProducts()
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

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
}
</style>