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
import { ref, computed } from 'vue';
import PaymentMethodSelector from './PaymentMethodSelector.vue';
import CreditCardForm from './CreditCardForm.vue';
import BillingAddressForm from './BillingAddressForm.vue';
import PaymentPlaceholder from './PaymentPlaceholder.vue';

interface CreditCardData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

interface BillingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Props {
  shippingAddress: BillingAddress;
}

interface Emits {
  (e: 'submit', data: { paymentMethod: string; creditCardData?: CreditCardData; billingAddress?: BillingAddress }): void;
  (e: 'previousStep'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const paymentMethod = ref('card');
const isCardValid = ref(false);

const creditCardData = ref<CreditCardData>({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardName: ''
});

const billingAddress = ref<BillingAddress>({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zipCode: ''
});

const isFormValid = computed(() => {
  if (paymentMethod.value === 'card') {
    return isCardValid.value;
  }
  return true;
});

const handleCardValidationChange = (valid: boolean) => {
  isCardValid.value = valid;
};

const handleSameAsShippingChange = (sameAsShipping: boolean) => {
  if (sameAsShipping) {
    Object.assign(billingAddress.value, props.shippingAddress);
  }
};

const resetPaymentErrors = () => {
  isCardValid.value = false;
};

const handleSubmit = () => {
  const paymentData = {
    paymentMethod: paymentMethod.value,
    ...(paymentMethod.value === 'card' && {
      creditCardData: creditCardData.value,
      billingAddress: billingAddress.value
    })
  };

  emit('submit', paymentData);
};
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

@media (max-width: 768px) {
  .form-actions {
    justify-content: center;
    flex-direction: column;
  }
}
</style>