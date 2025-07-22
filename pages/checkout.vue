<template>
  <div class="checkout-page">
    <div class="container">
      <div class="checkout-header">
        <h1>Secure Checkout</h1>
        <div class="user-info" v-if="user">
          <span>Welcome back, {{ user.firstName }}!</span>
        </div>
        <CheckoutSteps :current-step="step" />
      </div>

      <div class="checkout-content">
        <div class="checkout-form">
          <!-- Step 1: Shipping Information -->
          <ShippingForm v-if="step === 1" v-model="shippingForm" :pre-filled-data="preFilledShippingData"
            @submit="nextStep" />

          <!-- Step 2: Payment Information -->
          <PaymentForm v-else-if="step === 2" :shipping-address="shippingForm" @submit="handlePaymentSubmit"
            @previous-step="step = 1" />

          <!-- Step 3: Order Review -->
          <OrderReviewSummary v-else-if="step === 3" :shipping-info="shippingForm" :payment-info="paymentInfo"
            :order-items="cartItems" :total-amount="finalTotal" @edit-shipping="step = 1" @edit-payment="step = 2"
            @previous-step="step = 2" @order-placed="handleOrderPlaced" />
        </div>

        <div class="order-summary">
          <div class="summary-card">
            <h3>Order Summary</h3>

            <div class="summary-items">
              <div v-for="item in cartItems" :key="item.id" class="summary-item">
                <div class="item-info">
                  <img :src="item.product.thumbnail" :alt="item.product.title" class="item-image" />
                  <div class="item-details">
                    <h4>{{ item.product.title }}</h4>
                    <p>Qty: {{ item.quantity }}</p>
                  </div>
                </div>
                <div class="item-price">${{ (item.product.price * item.quantity).toFixed(2) }}</div>
              </div>
            </div>

            <div class="summary-totals">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Discount</span>
                <span class="discount-amount">-${{ discount.toFixed(2) }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div class="summary-row">
                <span>Tax</span>
                <span>${{ tax.toFixed(2) }}</span>
              </div>
              <div class="summary-row total-row">
                <span>Total</span>
                <span>${{ finalTotal.toFixed(2) }}</span>
              </div>
            </div>

            <!-- User Account Info -->
            <div class="account-info" v-if="user">
              <div class="account-badge">
                <UserIcon />
                <span>Logged in as {{ user.username }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import CheckoutSteps from '@/components/checkout/CheckoutSteps.vue'
import ShippingForm from '@/components/checkout/ShippingForm.vue'
import PaymentForm from '@/components/checkout/PaymentForm.vue'
import OrderReviewSummary from '@/components/checkout/OrderReviewSummary.vue'

// Add authentication middleware
definePageMeta({
  middleware: 'auth'
})

const cartStore = useCartStore()
const authStore = useAuthStore()
const { items: cartItems, discount } = storeToRefs(cartStore)
const { user } = storeToRefs(authStore)

const step = ref(1)

const shippingForm = reactive({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  email: '',
  shippingMethod: ''
})

const paymentInfo = reactive({
  method: 'card',
  cardNumber: '',
  cardName: ''
})

// Pre-fill shipping data from user profile
const preFilledShippingData = computed(() => {
  if (!user.value) return {}

  return {
    firstName: user.value.firstName || '',
    lastName: user.value.lastName || '',
    email: user.value.email || '',
    // Extend more data if available
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  }
})

// Auto-fill shipping form when user data is available
onMounted(() => {
  if (user.value) {
    Object.assign(shippingForm, preFilledShippingData.value)
  }
})

const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.product.price * item.quantity)
  }, 0)
})

const tax = computed(() => subtotal.value * 0.08)
const finalTotal = computed(() => subtotal.value - discount.value + tax.value)

const nextStep = () => {
  if (step.value < 3) {
    step.value++
  }
}

const handlePaymentSubmit = (paymentData: any) => {
  Object.assign(paymentInfo, {
    method: paymentData.paymentMethod,
    cardNumber: paymentData.creditCardData?.cardNumber || '',
    cardName: paymentData.creditCardData?.cardName || ''
  })
  nextStep()
}

// Handle successful order placement
const handleOrderPlaced = async (orderData: any) => {
  try {
    console.log('Order placed successfully!', orderData)

    // Clear cart after successful order
    cartStore.clearCart()

    // Redirect to success page
    await navigateTo('/order-success')
  } catch (error) {
    console.error('Error redirecting to success page:', error)
    alert('Order placed successfully!')
  }
}

// Icon component
const UserIcon = () => h('svg', {
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2'
}, [
  h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  h('circle', { cx: '12', cy: '7', r: '4' })
])
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  padding: 2rem 0;
  background-color: var(--light-color);
}

.checkout-header {
  text-align: center;
  margin-bottom: 3rem;
}

.checkout-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.user-info {
  margin-bottom: 1rem;
  color: var(--success-color);
  font-weight: 500;
}

.checkout-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-form {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.order-summary {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.summary-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  padding: 2rem;
}

.summary-card h3 {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.summary-items {
  margin-bottom: 2rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.summary-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex: 1;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.item-details h4 {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  color: var(--text-color);
}

.item-details p {
  font-size: 0.8rem;
  color: var(--text-light);
}

.item-price {
  font-weight: 600;
  color: var(--text-color);
}

.summary-totals {
  border-top: 2px solid var(--border-color);
  padding-top: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.total-row {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
  border-top: 1px solid var(--border-color);
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.account-info {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.account-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: var(--success-color);
  color: white;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .order-summary {
    position: static;
    order: -1;
  }
}
</style>