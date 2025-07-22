<template>
  <div class="checkout-step">
    <h2>Payment Information</h2>

    <form @submit.prevent="handleSubmit">
      <PaymentMethodSelector v-model="paymentMethod" @method-changed="resetPaymentErrors" />

      <CreditCardForm v-if="paymentMethod === 'card'" v-model="creditCardData"
        @validation-change="handleCardValidationChange" />

      <BillingAddressForm v-if="paymentMethod === 'card'" v-model="billingAddress" :shipping-address="shippingAddress"
        @same-as-shipping-change="handleSameAsShippingChange" />

      <PaymentPlaceholder v-else-if="paymentMethod === 'paypal'" payment-method="paypal" />

      <PaymentPlaceholder v-else-if="paymentMethod === 'apple-pay'" payment-method="apple-pay" />

      <div class="form-actions">
        <button @click="$emit('previousStep')" type="button" class="btn btn-outline">
          Back to Shipping
        </button>
        <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
          Continue to Review
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import PaymentMethodSelector from './PaymentMethodSelector.vue'
import CreditCardForm from './CreditCardForm.vue'
import BillingAddressForm from './BillingAddressForm.vue'
import PaymentPlaceholder from './PaymentPlaceholder.vue'
import type { CreditCardData, BillingAddress } from '~/types'

interface PaymentData {
  paymentMethod: string
  creditCardData?: CreditCardData
  billingAddress?: BillingAddress
}

interface Props {
  shippingAddress: BillingAddress
}

interface Emits {
  (e: 'submit', data: PaymentData): void
  (e: 'previousStep'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive state
const paymentMethod = ref('card')
const isCardValid = ref(false)
const isSameAsShipping = ref(true)

const creditCardData = ref<CreditCardData>({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardName: ''
})

const billingAddress = ref<BillingAddress>({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
})

// Computed properties
const isFormValid = computed(() => {
  switch (paymentMethod.value) {
    case 'card':
      return isCardValid.value
    case 'paypal':
    case 'apple-pay':
      return true
    default:
      return false
  }
})

// Event handlers
const handleCardValidationChange = (valid: boolean) => {
  isCardValid.value = valid
}

const handleSameAsShippingChange = (sameAsShipping: boolean) => {
  isSameAsShipping.value = sameAsShipping
  if (sameAsShipping) {
    Object.assign(billingAddress.value, props.shippingAddress)
  }
}

const resetPaymentErrors = () => {
  // Reset validation states when payment method changes
  isCardValid.value = false
}

const handleSubmit = () => {
  const paymentData: PaymentData = {
    paymentMethod: paymentMethod.value
  }

  if (paymentMethod.value === 'card') {
    paymentData.creditCardData = { ...creditCardData.value }
    paymentData.billingAddress = { ...billingAddress.value }
  }

  emit('submit', paymentData)
}

// Initialize billing address with shipping address
watch(() => props.shippingAddress, (newShippingAddress) => {
  if (isSameAsShipping.value) {
    Object.assign(billingAddress.value, newShippingAddress)
  }
}, { immediate: true, deep: true })
</script>

<style scoped>
.checkout-step h2 {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-outline {
  background-color: transparent;
  color: var(--text-color);
  border: 2px solid var(--border-color);
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-actions {
    justify-content: center;
    flex-direction: column;
  }
}
</style>