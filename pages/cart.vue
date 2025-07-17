<template>
  <div class="cart-page">
    <div class="container">
      <h1>Shopping Cart</h1>
      
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-content">
          <div class="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products to your cart to see them here.</p>
          <NuxtLink to="/products" class="btn btn-primary">Continue Shopping</NuxtLink>
        </div>
      </div>
      
      <div v-else class="cart-content">
        <div class="cart-items">
          <div class="cart-header">
            <h2>Items in Cart ({{ itemCount }})</h2>
          </div>
          
          <div class="cart-items-list">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <div class="item-image">
                <img :src="item.product.thumbnail" :alt="item.product.title" />
              </div>
              
              <div class="item-details">
                <h3>{{ item.product.title }}</h3>
                <p class="item-brand">{{ item.product.brand }}</p>
                <p class="item-price">${{ item.product.price.toFixed(2) }}</p>
              </div>
              
              <div class="item-quantity">
                <button @click="decreaseQuantity(item)" class="qty-btn">-</button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button @click="increaseQuantity(item)" class="qty-btn">+</button>
              </div>
              
              <div class="item-total">
                ${{ (item.product.price * item.quantity).toFixed(2) }}
              </div>
              
              <button @click="removeItem(item)" class="remove-btn">
                <RemoveIcon />
              </button>
            </div>
          </div>
        </div>
        
        <div class="cart-summary">
          <div class="summary-card">
            <h3>Order Summary</h3>
            
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>

            <!-- TODO: Show tax amount here if needed -->
            
            <div class="summary-row">
              <span>Discount:</span>
              <span class="discount-amount">-${{ discount.toFixed(2) }}</span>
            </div>
            
            <div class="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            
            <div class="summary-row total-row">
              <span>Estimated Total:</span>
              <span class="total-amount">${{ total.toFixed(2) }}</span>
            </div>
            
            <div class="cart-actions">
              <button @click="clearCart" class="btn btn-outline">
                Clear Cart
              </button>
              <NuxtLink to="/checkout" class="btn btn-primary">
                Proceed to Checkout
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { CartItem } from '~/types'

const cartStore = useCartStore()
const { items: cartItems, itemCount, total, subtotal, discount } = storeToRefs(cartStore)

const increaseQuantity = (item: CartItem) => {
  cartStore.updateQuantity(item.id, item.quantity + 1)
}

const decreaseQuantity = (item: CartItem) => {
  if (item.quantity > 1) {
    cartStore.updateQuantity(item.id, item.quantity - 1)
  }
}

const removeItem = (item: CartItem) => {
  cartStore.removeFromCart(item.id)
}

const clearCart = () => {
  if (confirm('Are you sure you want to clear your cart?')) {
    cartStore.clearCart()
  }
}

// Remove icon component
const RemoveIcon = () => h('svg', {
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor'
}, [
  h('polyline', { points: '3,6 5,6 21,6', 'stroke-width': '2' }),
  h('path', { d: 'M19,6V20A2,2 0 0,1 17,22H7A2,2 0 0,1 5,20V6M8,6V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V6', 'stroke-width': '2' }),
  h('line', { x1: '10', y1: '11', x2: '10', y2: '17', 'stroke-width': '2' }),
  h('line', { x1: '14', y1: '11', x2: '14', y2: '17', 'stroke-width': '2' })
])
</script>

<style scoped>
.cart-page {
  min-height: 80vh;
  padding: 2rem 0;
}

.cart-page h1 {
  margin-bottom: 2rem;
}

.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.empty-cart-content {
  text-align: center;
}

.empty-cart-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-cart-content h2 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.empty-cart-content p {
  color: var(--text-light);
  margin-bottom: 2rem;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}

.cart-items {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.cart-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.cart-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.item-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.item-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.item-brand {
  color: var(--text-light);
  font-size: 0.875rem;
  margin: 0 0 0.25rem 0;
}

.item-price {
  color: var(--primary-color);
  font-weight: 600;
  margin: 0;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 0.25rem;
}

.qty-btn {
  background: none;
  border: none;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-color);
  transition: background-color 0.2s ease;
}

.qty-btn:hover {
  background-color: var(--light-color);
}

.qty-value {
  min-width: 30px;
  text-align: center;
  font-weight: 500;
}

.item-total {
  font-weight: 600;
  color: var(--primary-color);
  text-align: right;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease;
}

.remove-btn:hover {
  background-color: #fee2e2;
}

.cart-summary {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.summary-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.summary-card h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.total-row {
  font-size: 1.125rem;
  font-weight: 600;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
  margin-top: 1rem;
}

.total-amount {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cart-actions .btn {
  width: 100%;
  text-align: center;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .cart-item {
    grid-template-columns: 60px 1fr;
    gap: 1rem;
  }
  
  .item-quantity,
  .item-total {
    grid-column: 1 / -1;
    justify-self: start;
  }
  
  .remove-btn {
    grid-column: 1 / -1;
    justify-self: end;
  }
}
</style>