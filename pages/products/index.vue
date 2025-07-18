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
          <div class="products-info">
            <p>Showing {{ products.length }} products</p>
          </div>
          
          <div class="products-grid">
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

const { getAllProducts } = useProducts()

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('Fetching products...')
    const response = await getAllProducts({ limit: 12 })
    
    console.log('API Response:', response)
    products.value = response.products
    
  } catch (err: any) {
    console.error('Error fetching products:', err)
    error.value = err.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  console.log('Products page mounted, fetching products...')
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
  margin-bottom: 3rem;
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
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .products-hero {
    padding: 3rem 0;
  }
}
</style>