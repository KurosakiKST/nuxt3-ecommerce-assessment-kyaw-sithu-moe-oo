<template>
  <div class="product-card" :class="{ 'list-view': isListView }">
    <!-- List View Layout -->
    <div v-if="isListView" class="list-layout">
      <NuxtLink :to="`/products/${product.id}`" class="image-column">
        <div class="product-image">
          <img :src="product.thumbnail" :alt="product.title" />
          <div v-if="product.discountPercentage > 0" class="discount-badge">
            -{{ Math.round(product.discountPercentage) }}%
          </div>
        </div>
      </NuxtLink>

      <div class="content-column">
        <NuxtLink :to="`/products/${product.id}`" class="product-info">
          <h3 class="product-title">{{ product.title }}</h3>
          <p class="product-brand">{{ product.brand || '' }}</p>
          <div class="product-rating">
            <span class="stars">{{ getStars(product.rating) }}</span>
            <span class="rating-value">({{ product.rating }})</span>
          </div>
          <div class="product-price">
            <span v-if="product.discountPercentage > 0" class="original-price">
              ${{ product.price.toFixed(2) }}
            </span>
            <span class="current-price">
              ${{ discountedPrice.toFixed(2) }}
            </span>
          </div>
        </NuxtLink>

        <button @click="addToCart" class="btn btn-primary add-to-cart">
          Add to Cart
        </button>
      </div>
    </div>

    <!-- Grid View Layout (Default) -->
    <template v-else>
      <NuxtLink :to="`/products/${product.id}`" class="product-link">
        <div class="product-image">
          <img :src="product.thumbnail" :alt="product.title" />
          <div v-if="product.discountPercentage > 0" class="discount-badge">
            -{{ Math.round(product.discountPercentage) }}%
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-title">{{ product.title }}</h3>
          <p class="product-brand">{{ product.brand || '' }}</p>
          <div class="product-rating">
            <span class="stars">{{ getStars(product.rating) }}</span>
            <span class="rating-value">({{ product.rating }})</span>
          </div>
          <div class="product-price">
            <span v-if="product.discountPercentage > 0" class="original-price">
              ${{ product.price.toFixed(2) }}
            </span>
            <span class="current-price">
              ${{ discountedPrice.toFixed(2) }}
            </span>
          </div>
        </div>
      </NuxtLink>
      <button @click="addToCart" class="btn btn-primary add-to-cart">
        Add to Cart
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

interface Props {
  product: Product
  isListView?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isListView: false
})

const cartStore = useCartStore()

const discountedPrice = computed(() => {
  const discount = (props.product.price * props.product.discountPercentage) / 100
  return props.product.price - discount
})

const getStars = (rating: number) => {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 >= 0.5 ? 1 : 0
  const emptyStars = 5 - fullStars - halfStar

  return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(emptyStars)
}

const addToCart = () => {
  cartStore.addToCart(props.product)
}
</script>

<style scoped>
/* Base card styles */
.product-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

/* Common link styles */
.product-link,
.image-column,
.product-info {
  display: block;
  color: inherit;
  text-decoration: none;
}

/* Common image styles */
.product-image {
  position: relative;
  overflow: hidden;
  background-color: #f9fafb;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: var(--danger-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 600;
  z-index: 2;
}

/* Common content styles */
.product-title {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text-color);
}

.product-brand {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  min-height: 1.25rem;
  line-height: 1.25rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.stars {
  color: #f59e0b;
  font-size: 0.875rem;
}

.rating-value {
  color: var(--text-light);
  font-size: 0.875rem;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.original-price {
  color: var(--text-light);
  text-decoration: line-through;
  font-size: 0.875rem;
}

.current-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

/* GRID VIEW STYLES (Default) */
.product-card:not(.list-view) .product-image {
  padding-top: 100%;
}

.product-card:not(.list-view) .product-image img {
  position: absolute;
  top: 0;
  left: 0;
}

.product-card:not(.list-view) .product-info {
  padding: 1rem;
}

.product-card:not(.list-view) .product-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0.25rem;
}

.product-card:not(.list-view) .add-to-cart {
  width: 100%;
  margin: 0;
  border-radius: 0;
  padding: 0.75rem;
}

/* LIST VIEW STYLES */
.list-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 0;
  height: 100%;
  min-height: 180px;
}

.image-column {
  display: block;
}

.list-layout .product-image {
  padding-top: 0;
  height: 100%;
  min-height: 180px;
  border-radius: var(--border-radius) 0 0 var(--border-radius);
}

.content-column {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  min-height: 180px;
}

.list-layout .product-info {
  flex: 1;
}

.list-layout .product-title {
  white-space: normal;
  overflow: visible;
  text-overflow: initial;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.list-layout .add-to-cart {
  width: fit-content;
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  margin-top: 1rem;
}

/* Mobile responsive - maintain 2-column layout */
@media (max-width: 768px) {
  .list-layout {
    grid-template-columns: 150px 1fr;
    min-height: 160px;
  }

  .list-layout .product-image {
    min-height: 160px;
  }

  .content-column {
    padding: 1.25rem;
    min-height: 160px;
  }
}

@media (max-width: 480px) {
  .list-layout {
    grid-template-columns: 120px 1fr;
    min-height: 140px;
  }

  .list-layout .product-image {
    min-height: 140px;
  }

  .content-column {
    padding: 1rem;
    min-height: 140px;
  }

  .list-layout .add-to-cart {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  .list-layout .product-title {
    font-size: 1rem;
  }
}
</style>