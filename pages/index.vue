<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1>Welcome to E-Store</h1>
          <p>Discover amazing products at unbeatable prices</p>
          <NuxtLink to="/products" class="btn btn-primary">Shop Now</NuxtLink>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🚚</div>
            <h3>Free Shipping</h3>
            <p>On orders over $50</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💳</div>
            <h3>Secure Payment</h3>
            <p>100% secure transactions</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>Easy Returns</h3>
            <p>30-day return policy</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎧</div>
            <h3>24/7 Support</h3>
            <p>Always here to help</p>
          </div>
        </div>
      </div>
    </section>

    <section class="featured-products">
      <div class="container">
        <h2>Featured Products</h2>
        
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
        </div>
        
        <div v-else-if="error" class="alert alert-error">
          {{ error }}
        </div>
        
        <div v-else class="products-grid">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <section class="categories-section">
      <div class="container">
        <h2>Shop by Category</h2>
        
        <div v-if="categoriesLoading" class="loading-container">
          <div class="spinner"></div>
        </div>
        
        <div v-else class="categories-grid">
          <NuxtLink
            v-for="category in categories"
            :key="typeof category === 'string' ? category : category.slug"
            :to="`/products?category=${typeof category === 'string' ? category : category.slug}`"
            class="category-card"
          >
            <div class="category-icon">📦</div>
            <h3>{{ formatCategoryName(category) }}</h3>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Category, Product } from '~/types'

const { getFeaturedProducts, getCategories } = useProducts()

const featuredProducts = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const categoriesLoading = ref(true)
const error = ref<string | null>(null)

// Fetch featured products
onMounted(async () => {
  try {
    featuredProducts.value = await getFeaturedProducts(8)
  } catch (err: any) {
    error.value = err.message || 'Failed to load featured products'
  } finally {
    loading.value = false
  }

  try {
    const categoryResponses = await getCategories()
    categories.value = categoryResponses.map((cat: any) => ({
      slug: cat.slug,
      name: cat.name,
      url: cat.url
    }))
  } catch (err) {
    console.error('Failed to load categories:', err)
  } finally {
    categoriesLoading.value = false
  }
})

const formatCategoryName = (category: any) => {
  const categoryName = typeof category === 'string' ? category : (category?.slug || category?.name || 'unknown')
  
  return categoryName
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, var(--primary-color), #1d4ed8);
  color: white;
  padding: 6rem 0;
  text-align: center;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: white;
}

.hero-content p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.features-section {
  padding: 4rem 0;
  background-color: var(--light-color);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.featured-products {
  padding: 4rem 0;
}

.featured-products h2 {
  text-align: center;
  margin-bottom: 3rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.categories-section {
  padding: 4rem 0;
  background-color: var(--light-color);
}

.categories-section h2 {
  text-align: center;
  margin-bottom: 3rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.category-card {
  background-color: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  text-align: center;
  transition: all 0.2s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  color: var(--primary-color);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.category-card h3 {
  font-size: 1.125rem;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .features-grid,
  .products-grid,
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .features-grid,
  .products-grid,
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>