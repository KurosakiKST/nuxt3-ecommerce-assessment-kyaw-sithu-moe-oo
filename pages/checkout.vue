<template>
  <div class="checkout-page">
    <div class="container">
      <div class="checkout-header">
        <h1>Checkout</h1>
        <CheckoutSteps :current-step="step" />
      </div>

      <div class="checkout-content">
        <div class="checkout-form">
          <!-- Step 1: Shipping Information -->
          <ShippingForm v-if="step === 1" v-model="shippingForm" @submit="nextStep" />

          <!-- Step 2: Payment Information -->
          <PaymentForm v-else-if="step === 2" :shipping-address="shippingForm" @submit="handlePaymentSubmit"
            @previous-step="step = 1" />

          <!-- Step 3: Order Review -->
          <OrderReviewSummary v-else-if="step === 3" :shipping-info="shippingForm" :payment-info="paymentInfo"
            :order-items="cartItems" :total-amount="finalTotal" @edit-shipping="step = 1" @edit-payment="step = 2"
            @previous-step="step = 2" @place-order="placeOrder" />
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import CheckoutSteps from '@/components/checkout/CheckoutSteps.vue'
import ShippingForm from '@/components/checkout/ShippingForm.vue'
import PaymentForm from '@/components/checkout/PaymentForm.vue'
import OrderReviewSummary from '@/components/checkout/OrderReviewSummary.vue'

const cartStore = useCartStore()
const { items: cartItems } = storeToRefs(cartStore)

const step = ref(1)

const shippingForm = reactive({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
})

const paymentInfo = reactive({
  method: 'card',
  cardNumber: '',
  cardName: ''
})

const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.product.price * item.quantity)
  }, 0)
})

const tax = computed(() => subtotal.value * 0.08)
const finalTotal = computed(() => subtotal.value + tax.value)

const nextStep = () => {
  if (step.value < 3) {
    step.value++
  }
}

const handlePaymentSubmit = (paymentData) => {
  Object.assign(paymentInfo, {
    method: paymentData.paymentMethod,
    cardNumber: paymentData.creditCardData?.cardNumber || '',
    cardName: paymentData.creditCardData?.cardName || ''
  })
  nextStep()
}

const placeOrder = async () => {
  try {
    console.log('Order placed successfully!')
    cartStore.clearCart()
    alert('Order placed successfully! (Demo mode)')
  } catch (error) {
    console.error('Error placing order:', error)
    alert('Error placing order. Please try again.')
  }
}
</script>

<style scoped>
.checkout-page {
  padding: 2rem 0;
  min-height: 80vh;
}

.checkout-header {
  text-align: center;
  margin-bottom: 3rem;
}

.checkout-header h1 {
  margin-bottom: 2rem;
}

.checkout-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}

.checkout-form {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.order-summary {
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
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.summary-items {
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.summary-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.item-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
}

.item-details p {
  margin: 0;
  color: var(--text-light);
  font-size: 0.875rem;
}

.item-price {
  font-weight: 600;
  color: var(--primary-color);
}

.summary-totals {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.total-row {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .order-summary {
    position: static;
  }
}
</style>