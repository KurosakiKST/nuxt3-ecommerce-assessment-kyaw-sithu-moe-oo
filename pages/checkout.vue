<template>
  <div class="checkout-page">
    <div class="container">
      <div class="checkout-header">
        <h1>Checkout</h1>
        <div class="checkout-steps">
          <div class="step" :class="{ active: step >= 1 }">
            <span class="step-number">1</span>
            <span class="step-label">Shipping</span>
          </div>
          <div class="step" :class="{ active: step >= 2 }">
            <span class="step-number">2</span>
            <span class="step-label">Payment</span>
          </div>
          <div class="step" :class="{ active: step >= 3 }">
            <span class="step-number">3</span>
            <span class="step-label">Review</span>
          </div>
        </div>
      </div>
      
      <div class="checkout-content">
        <div class="checkout-form">
          <!-- Step 1: Shipping Information -->
          <div v-if="step === 1" class="checkout-step">
            <h2>Shipping Information</h2>
            
            <form @submit.prevent="nextStep">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName" class="form-label">First Name</label>
                  <input
                    id="firstName"
                    v-model="shippingForm.firstName"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="lastName" class="form-label">Last Name</label>
                  <input
                    id="lastName"
                    v-model="shippingForm.lastName"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="address" class="form-label">Street Address</label>
                <input
                  id="address"
                  v-model="shippingForm.address"
                  type="text"
                  class="form-input"
                  required
                />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="city" class="form-label">City</label>
                  <input
                    id="city"
                    v-model="shippingForm.city"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="state" class="form-label">State</label>
                  <input
                    id="state"
                    v-model="shippingForm.state"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="zipCode" class="form-label">ZIP Code</label>
                  <input
                    id="zipCode"
                    v-model="shippingForm.zipCode"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Continue to Payment</button>
              </div>
            </form>
          </div>
          
          <!-- Step 2: Payment Information -->
          <div v-else-if="step === 2" class="checkout-step">
            <h2>Payment Information</h2>
            
            <form @submit.prevent="nextStep">
              <!-- Payment Method Selection -->
              <div class="payment-methods">
                <h3>Select Payment Method</h3>
                <div class="payment-options">
                  <label class="payment-option" :class="{ active: paymentForm.method === 'card' }">
                    <input 
                      v-model="paymentForm.method" 
                      type="radio" 
                      value="card"
                      @change="resetPaymentErrors"
                    />
                    <div class="payment-option-content">
                      <div class="payment-icon">
                        <i class="fas fa-credit-card"></i>
                      </div>
                      <span>Credit/Debit Card</span>
                    </div>
                  </label>
                  
                  <label class="payment-option" :class="{ active: paymentForm.method === 'paypal' }">
                    <input 
                      v-model="paymentForm.method" 
                      type="radio" 
                      value="paypal"
                      @change="resetPaymentErrors"
                    />
                    <div class="payment-option-content">
                      <div class="payment-icon">
                        <i class="fab fa-paypal"></i>
                      </div>
                      <span>PayPal</span>
                    </div>
                  </label>
                  
                  <label class="payment-option" :class="{ active: paymentForm.method === 'apple-pay' }">
                    <input 
                      v-model="paymentForm.method" 
                      type="radio" 
                      value="apple-pay"
                      @change="resetPaymentErrors"
                    />
                    <div class="payment-option-content">
                      <div class="payment-icon">
                        <i class="fab fa-apple-pay"></i>
                      </div>
                      <span>Apple Pay</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Credit Card Form -->
              <div v-if="paymentForm.method === 'card'" class="credit-card-form">
                <h3>Card Information</h3>
                
                <div class="form-group">
                  <label for="cardNumber" class="form-label">Card Number</label>
                  <div class="card-input-wrapper">
                    <input
                      id="cardNumber"
                      v-model="paymentForm.cardNumber"
                      type="text"
                      class="form-input"
                      :class="{ 'form-error-input': errors.cardNumber }"
                      placeholder="1234 5678 9012 3456"
                      maxlength="19"
                      @input="formatCardNumber"
                      @blur="validateCardNumber"
                      required
                    />
                    <div class="card-type-icon">
                      <span v-if="cardType">{{ getCardIcon(cardType) }}</span>
                    </div>
                  </div>
                  <div v-if="errors.cardNumber" class="form-error">{{ errors.cardNumber }}</div>
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="expiryDate" class="form-label">Expiry Date</label>
                    <input
                      id="expiryDate"
                      v-model="paymentForm.expiryDate"
                      type="text"
                      class="form-input"
                      :class="{ 'form-error-input': errors.expiryDate }"
                      placeholder="MM/YY"
                      maxlength="5"
                      @input="formatExpiryDate"
                      @blur="validateExpiryDate"
                      required
                    />
                    <div v-if="errors.expiryDate" class="form-error">{{ errors.expiryDate }}</div>
                  </div>
                  
                  <div class="form-group">
                    <label for="cvv" class="form-label">CVV</label>
                    <input
                      id="cvv"
                      v-model="paymentForm.cvv"
                      type="text"
                      class="form-input"
                      :class="{ 'form-error-input': errors.cvv }"
                      placeholder="123"
                      maxlength="4"
                      @input="formatCVV"
                      @blur="validateCVV"
                      required
                    />
                    <div v-if="errors.cvv" class="form-error">{{ errors.cvv }}</div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="cardName" class="form-label">Name on Card</label>
                  <input
                    id="cardName"
                    v-model="paymentForm.cardName"
                    type="text"
                    class="form-input"
                    :class="{ 'form-error-input': errors.cardName }"
                    placeholder="John Doe"
                    @blur="validateCardName"
                    required
                  />
                  <div v-if="errors.cardName" class="form-error">{{ errors.cardName }}</div>
                </div>

                <!-- Billing Address -->
                <div class="billing-address">
                  <div class="billing-header">
                    <h3>Billing Address</h3>
                    <label class="checkbox-wrapper">
                      <input 
                        v-model="sameAsShipping" 
                        type="checkbox"
                        @change="toggleBillingAddress"
                      />
                      <span class="checkmark"></span>
                      Same as shipping address
                    </label>
                  </div>

                  <div v-if="!sameAsShipping" class="billing-form">
                    <div class="form-row">
                      <div class="form-group">
                        <label for="billingFirstName" class="form-label">First Name</label>
                        <input
                          id="billingFirstName"
                          v-model="billingForm.firstName"
                          type="text"
                          class="form-input"
                          required
                        />
                      </div>
                      <div class="form-group">
                        <label for="billingLastName" class="form-label">Last Name</label>
                        <input
                          id="billingLastName"
                          v-model="billingForm.lastName"
                          type="text"
                          class="form-input"
                          required
                        />
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label for="billingAddress" class="form-label">Street Address</label>
                      <input
                        id="billingAddress"
                        v-model="billingForm.address"
                        type="text"
                        class="form-input"
                        required
                      />
                    </div>
                    
                    <div class="form-row">
                      <div class="form-group">
                        <label for="billingCity" class="form-label">City</label>
                        <input
                          id="billingCity"
                          v-model="billingForm.city"
                          type="text"
                          class="form-input"
                          required
                        />
                      </div>
                      <div class="form-group">
                        <label for="billingState" class="form-label">State</label>
                        <input
                          id="billingState"
                          v-model="billingForm.state"
                          type="text"
                          class="form-input"
                          required
                        />
                      </div>
                      <div class="form-group">
                        <label for="billingZipCode" class="form-label">ZIP Code</label>
                        <input
                          id="billingZipCode"
                          v-model="billingForm.zipCode"
                          type="text"
                          class="form-input"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PayPal Option -->
              <div v-else-if="paymentForm.method === 'paypal'" class="payment-alternative">
                <div class="payment-placeholder">
                  <div class="payment-placeholder-icon">
                    <i class="fab fa-paypal"></i>
                  </div>
                  <h3>PayPal Payment</h3>
                  <p>You will be redirected to PayPal to complete your payment securely.</p>
                  <div class="paypal-demo-note">
                    <small>Demo Mode: PayPal integration would be implemented here</small>
                  </div>
                </div>
              </div>

              <!-- Apple Pay Option -->
              <div v-else-if="paymentForm.method === 'apple-pay'" class="payment-alternative">
                <div class="payment-placeholder">
                  <div class="payment-placeholder-icon">
                    <i class="fab fa-apple-pay"></i>
                  </div>
                  <h3>Apple Pay</h3>
                  <p>Use Touch ID or Face ID to pay with Apple Pay.</p>
                  <div class="apple-pay-demo-note">
                    <small>Demo Mode: Apple Pay integration would be implemented here</small>
                  </div>
                </div>
              </div>
              
              <div class="form-actions">
                <button @click="step = 1" type="button" class="btn btn-outline">Back to Shipping</button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="!isPaymentFormValid"
                >
                  Continue to Review
                </button>
              </div>
            </form>
          </div>
          
          <!-- Step 3: Order Review -->
          <div v-else-if="step === 3" class="checkout-step">
            <h2>Order Review</h2>
            
            <div class="review-sections">
              <!-- Shipping Summary -->
              <div class="review-section">
                <h3>Shipping Information</h3>
                <div class="review-content">
                  <p><strong>{{ shippingForm.firstName }} {{ shippingForm.lastName }}</strong></p>
                  <p>{{ shippingForm.address }}</p>
                  <p>{{ shippingForm.city }}, {{ shippingForm.state }} {{ shippingForm.zipCode }}</p>
                </div>
                <button @click="step = 1" class="btn-link">Edit</button>
              </div>

              <!-- Payment Summary -->
              <div class="review-section">
                <h3>Payment Method</h3>
                <div class="review-content">
                  <div v-if="paymentForm.method === 'card'" class="payment-summary">
                    <p><strong>Credit Card</strong></p>
                    <p>**** **** **** {{ paymentForm.cardNumber.slice(-4) }}</p>
                    <p>{{ paymentForm.cardName }}</p>
                  </div>
                  <div v-else-if="paymentForm.method === 'paypal'" class="payment-summary">
                    <p><strong>PayPal</strong></p>
                  </div>
                  <div v-else-if="paymentForm.method === 'apple-pay'" class="payment-summary">
                    <p><strong>Apple Pay</strong></p>
                  </div>
                </div>
                <button @click="step = 2" class="btn-link">Edit</button>
              </div>

              <!-- Order Items -->
              <div class="review-section">
                <h3>Order Items</h3>
                <div class="order-items">
                  <div v-for="item in cartItems" :key="item.id" class="order-item">
                    <img :src="item.product.thumbnail" :alt="item.product.title" class="item-image" />
                    <div class="item-details">
                      <h4>{{ item.product.title }}</h4>
                      <p>Quantity: {{ item.quantity }}</p>
                    </div>
                    <div class="item-price">${{ (item.product.price * item.quantity).toFixed(2) }}</div>
                  </div>
                </div>
              </div>

              <!-- Terms and Conditions -->
              <div class="terms-section">
                <label class="checkbox-wrapper">
                  <input 
                    v-model="termsAccepted" 
                    type="checkbox"
                    required
                  />
                  <span class="checkmark"></span>
                  I agree to the <a href="terms" class="terms-link" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> and <a href="privacy" class="terms-link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                </label>
              </div>
            </div>
            
            <div class="form-actions">
              <button @click="step = 2" type="button" class="btn btn-outline">Back to Payment</button>
              <button 
                @click="placeOrder" 
                class="btn btn-primary"
                :disabled="!termsAccepted || isProcessingOrder"
              >
                {{ isProcessingOrder ? 'Processing...' : `Place Order - $${finalTotal.toFixed(2)}` }}
              </button>
            </div>
          </div>
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
import { ref, reactive, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const { items: cartItems } = storeToRefs(cartStore)

// Checkout steps
const step = ref(1)

// Form data
const shippingForm = reactive({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
})

const paymentForm = reactive({
  method: 'card',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardName: ''
})

const billingForm = reactive({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
})

// Form states
const sameAsShipping = ref(true)
const termsAccepted = ref(false)
const isProcessingOrder = ref(false)

// Validation errors
const errors = reactive({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardName: ''
})

// Card type detection
const cardType = ref('')

// Card validation and formatting
const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '')
  const matches = value.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  
  if (parts.length) {
    paymentForm.cardNumber = parts.join(' ')
    detectCardType(match)
  } else {
    paymentForm.cardNumber = value
  }
  
  // Clear error when user starts typing
  if (errors.cardNumber) {
    errors.cardNumber = ''
  }
}

const detectCardType = (number) => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/
  }
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(number)) {
      cardType.value = type
      return
    }
  }
  cardType.value = ''
}

const getCardIcon = (type) => {
  const icons = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    discover: '💳'
  }
  return icons[type] || '💳'
}

const formatExpiryDate = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  paymentForm.expiryDate = value
  
  if (errors.expiryDate) {
    errors.expiryDate = ''
  }
}

const formatCVV = (event) => {
  paymentForm.cvv = event.target.value.replace(/\D/g, '')
  if (errors.cvv) {
    errors.cvv = ''
  }
}

// Validation functions
const validateCardNumber = () => {
  const cleanNumber = paymentForm.cardNumber.replace(/\s/g, '')
  
  if (!cleanNumber) {
    errors.cardNumber = 'Card number is required'
    return false
  }
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    errors.cardNumber = 'Please enter a valid card number'
    return false
  }
  
  // Luhn algorithm check
  if (!luhnCheck(cleanNumber)) {
    errors.cardNumber = 'Please enter a valid card number'
    return false
  }
  
  errors.cardNumber = ''
  return true
}

const validateExpiryDate = () => {
  if (!paymentForm.expiryDate) {
    errors.expiryDate = 'Expiry date is required'
    return false
  }
  
  const [month, year] = paymentForm.expiryDate.split('/')
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100
  const currentMonth = currentDate.getMonth() + 1
  
  if (!month || !year || month < 1 || month > 12) {
    errors.expiryDate = 'Please enter a valid expiry date (MM/YY)'
    return false
  }
  
  if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
    errors.expiryDate = 'Card has expired'
    return false
  }
  
  errors.expiryDate = ''
  return true
}

const validateCVV = () => {
  if (!paymentForm.cvv) {
    errors.cvv = 'CVV is required'
    return false
  }
  
  if (paymentForm.cvv.length < 3 || paymentForm.cvv.length > 4) {
    errors.cvv = 'Please enter a valid CVV'
    return false
  }
  
  errors.cvv = ''
  return true
}

const validateCardName = () => {
  if (!paymentForm.cardName.trim()) {
    errors.cardName = 'Name on card is required'
    return false
  }
  
  errors.cardName = ''
  return true
}

// Luhn algorithm for card validation
const luhnCheck = (num) => {
  let arr = (num + '')
    .split('')
    .reverse()
    .map(x => parseInt(x))
  let lastDigit = arr.splice(0, 1)[0]
  let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0)
  sum += lastDigit
  return sum % 10 === 0
}

// Form validation
const isPaymentFormValid = computed(() => {
  if (paymentForm.method === 'card') {
    return paymentForm.cardNumber && 
           paymentForm.expiryDate && 
           paymentForm.cvv && 
           paymentForm.cardName &&
           !errors.cardNumber && 
           !errors.expiryDate && 
           !errors.cvv && 
           !errors.cardName
  }
  return true // For other payment methods
})

// Helper functions
const resetPaymentErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

const toggleBillingAddress = () => {
  if (sameAsShipping.value) {
    Object.assign(billingForm, shippingForm)
  } else {
    Object.keys(billingForm).forEach(key => {
      billingForm[key] = ''
    })
  }
}

// Watch for same as shipping changes
watch(sameAsShipping, (newValue) => {
  if (newValue) {
    Object.assign(billingForm, shippingForm)
  }
})

// Order calculations
const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.product.price * item.quantity)
  }, 0)
})

const tax = computed(() => subtotal.value * 0.08) // 8% tax
const finalTotal = computed(() => subtotal.value + tax.value)

// Navigation
const nextStep = () => {
  if (step.value === 2 && paymentForm.method === 'card') {
    // Validate all card fields before proceeding
    const isCardValid = validateCardNumber() && 
                       validateExpiryDate() && 
                       validateCVV() && 
                       validateCardName()
    
    if (!isCardValid) {
      return
    }
  }
  
  if (step.value < 3) {
    step.value++
  }
}

const placeOrder = async () => {
  if (!termsAccepted.value) {
    return
  }
  
  isProcessingOrder.value = true
  
  try {
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Here you would normally send the order to your backend
    console.log('Order placed successfully!')
    
    // Clear cart and redirect to success page
    cartStore.clearCart()
    // In a real app: await navigateTo('/order-success')
    alert('Order placed successfully! (Demo mode)')
    
  } catch (error) {
    console.error('Error placing order:', error)
    alert('Error placing order. Please try again.')
  } finally {
    isProcessingOrder.value = false
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

.checkout-steps {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--border-color);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.step.active .step-number {
  background-color: var(--primary-color);
  color: white;
}

.step-label {
  font-weight: 500;
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

.checkout-step h2 {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

/* Payment Methods */
.payment-methods {
  margin-bottom: 2rem;
}

.payment-methods h3 {
  margin-bottom: 1rem;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.payment-option {
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
}

.payment-option:hover {
  border-color: var(--primary-color);
}

.payment-option.active {
  border-color: var(--primary-color);
  background-color: #f0f7ff;
}

.payment-option input[type="radio"] {
  display: none;
}

.payment-option-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Payment Method Icons Styling */
.payment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: 1.5rem;
  color: var(--primary-color);
  transition: color 0.2s ease;
}

.payment-option.active .payment-icon {
  color: var(--primary-color);
}

.payment-option:hover .payment-icon {
  color: var(--primary-color);
}

/* Specific icon colors for better brand recognition */
.payment-icon .fa-paypal {
  color: #0070ba; /* PayPal blue */
}

.payment-icon .fa-apple-pay {
  color: #000000; /* Apple black */
}

.payment-icon .fa-credit-card {
  color: var(--primary-color); /* Keep consistent with theme */
}

/* Credit Card Form */
.credit-card-form {
  margin-bottom: 2rem;
}

.credit-card-form h3 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.card-input-wrapper {
  position: relative;
}

.card-type-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
}

.form-error-input {
  border-color: var(--danger-color) !important;
}

/* Billing Address */
.billing-address {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.billing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.billing-header h3 {
  margin: 0;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.checkbox-wrapper input[type="checkbox"] {
  margin: 0;
  margin-right: 0.5rem;
}

.checkmark {
  display: inline-block;
}

.billing-form {
  margin-top: 1rem;
}

/* Payment Alternatives */
.payment-alternative {
  margin-bottom: 2rem;
}

.payment-placeholder {
  text-align: center;
  padding: 3rem 2rem;
  border: 2px dashed var(--border-color);
  border-radius: var(--border-radius);
  background-color: #f9fafb;
}

.payment-placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.payment-placeholder-icon .fa-paypal {
  color: #0070ba;
}

.payment-placeholder-icon .fa-apple-pay {
  color: #000000;
}

.payment-placeholder h3 {
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.payment-placeholder p {
  color: var(--text-light);
  margin-bottom: 1rem;
}

.paypal-demo-note,
.apple-pay-demo-note {
  background-color: var(--warning-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  display: inline-block;
}

/* Review Sections */
.review-sections {
  margin-bottom: 2rem;
}

.review-section {
  background-color: #f9fafb;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 1rem;
  position: relative;
}

.review-section h3 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.review-content {
  margin-bottom: 0.5rem;
}

.review-content p {
  margin: 0.25rem 0;
}

.btn-link {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--primary-color);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-link:hover {
  color: #1d4ed8;
}

.payment-summary {
  background-color: white;
  padding: 1rem;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.order-items {
  background-color: white;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.order-item:last-child {
  border-bottom: none;
}

.order-item .item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.order-item .item-details {
  flex: 1;
}

.order-item .item-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.order-item .item-details p {
  margin: 0;
  color: var(--text-light);
  font-size: 0.875rem;
}

.order-item .item-price {
  font-weight: 600;
  color: var(--primary-color);
}

.terms-section {
  background-color: #f0f7ff;
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1rem;
}

.terms-section .checkbox-wrapper {
  margin: 0;
}

.terms-link {
  color: var(--primary-color);
  text-decoration: underline;
}

.terms-link:hover {
  color: #1d4ed8;
}

/* Order Summary */
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

/* Responsive Design */
@media (max-width: 768px) {
  .checkout-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .checkout-steps {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    justify-content: center;
    flex-direction: column;
  }
  
  .payment-options {
    grid-template-columns: 1fr;
  }
  
  .billing-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .btn-link {
    position: static;
    margin-top: 1rem;
  }
  
  .order-summary {
    position: static;
  }
  
  .payment-icon {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 1.25rem;
  }
  
  .payment-placeholder-icon {
    font-size: 2.5rem;
  }
}
</style>