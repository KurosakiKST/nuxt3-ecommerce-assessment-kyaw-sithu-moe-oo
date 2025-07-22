<template>
    <div class="credit-card-form">
        <h3>Card Information</h3>

        <div class="form-group">
            <label for="cardNumber" class="form-label">Card Number *</label>
            <div class="card-input-wrapper">
                <input id="cardNumber" v-model="formState.data.cardNumber" type="text" class="form-input"
                    :class="{ 'error': hasFieldError('cardNumber') }" placeholder="1234 5678 9012 3456" maxlength="19"
                    @input="handleCardNumberInput" @blur="handleFieldBlur('cardNumber')" required />
                <div class="card-type-icon">
                    <img v-if="cardType" :src="getCardIcon(cardType)" :alt="cardType" class="card-icon" />
                </div>
            </div>
            <div v-if="hasFieldError('cardNumber')" class="error-message">
                {{ getFieldError('cardNumber') }}
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="expiryDate" class="form-label">Expiry Date *</label>
                <input id="expiryDate" v-model="formState.data.expiryDate" type="text" class="form-input"
                    :class="{ 'error': hasFieldError('expiryDate') }" placeholder="MM/YY" maxlength="5"
                    @input="handleExpiryDateInput" @blur="handleFieldBlur('expiryDate')" required />
                <div v-if="hasFieldError('expiryDate')" class="error-message">
                    {{ getFieldError('expiryDate') }}
                </div>
            </div>

            <div class="form-group">
                <label for="cvv" class="form-label">CVV *</label>
                <input id="cvv" v-model="formState.data.cvv" type="text" class="form-input"
                    :class="{ 'error': hasFieldError('cvv') }" placeholder="123" maxlength="4" @input="handleCvvInput"
                    @blur="handleFieldBlur('cvv')" required />
                <div v-if="hasFieldError('cvv')" class="error-message">
                    {{ getFieldError('cvv') }}
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="cardName" class="form-label">Name on Card *</label>
            <input id="cardName" v-model="formState.data.cardName" type="text" class="form-input"
                :class="{ 'error': hasFieldError('cardName') }" placeholder="John Doe"
                @blur="handleFieldBlur('cardName')" required />
            <div v-if="hasFieldError('cardName')" class="error-message">
                {{ getFieldError('cardName') }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, computed, onMounted } from 'vue'
import { useFormValidation, createCreditCardValidationRules } from '~/composables/useFormValidation'
import { useFormFormatting } from '~/composables/useFormFormatting'

interface CreditCardData {
    cardNumber: string
    expiryDate: string
    cvv: string
    cardName: string
}

interface Props {
    modelValue: CreditCardData
}

interface Emits {
    (e: 'update:modelValue', value: CreditCardData): void
    (e: 'validationChange', isValid: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Initialize form validation
const initialData: CreditCardData = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
}

const {
    formState,
    isFormValid,
    validateField,
    setFormData,
    hasFieldError,
    getFieldError
} = useFormValidation(initialData, createCreditCardValidationRules())

const {
    formatCardNumber,
    formatExpiryDate,
    formatCVV,
    getCardType,
    getCardIcon
} = useFormFormatting()

// Computed properties
const cardType = computed(() => getCardType(formState.data.cardNumber))

// Event handlers
const handleFieldBlur = (fieldName: string) => {
    validateField(fieldName)
}

const handleCardNumberInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    formState.data.cardNumber = formatCardNumber(target.value)
}

const handleExpiryDateInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    formState.data.expiryDate = formatExpiryDate(target.value)
}

const handleCvvInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    formState.data.cvv = formatCVV(target.value)
}

// Initialize form with existing data
onMounted(() => {
    setFormData(props.modelValue)
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
    setFormData(newValue)
}, { deep: true })

// Emit changes to parent
watch(() => formState.data, (newData) => {
    emit('update:modelValue', { ...newData } as CreditCardData)
}, { deep: true })

// Emit validation changes
watch(isFormValid, (valid) => {
    emit('validationChange', valid)
})
</script>

<style scoped>
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
    pointer-events: none;
}

.card-icon {
    width: 32px;
    height: 20px;
    object-fit: contain;
}


.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color);
}

.form-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 1rem;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary-color);
}

.form-input.error {
    border-color: var(--danger-color);
}

.error-message {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--danger-color);
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>