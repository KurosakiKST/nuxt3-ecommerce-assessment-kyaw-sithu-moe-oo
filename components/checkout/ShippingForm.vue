<template>
    <div class="checkout-step">
        <div class="step-header">
            <h2>Shipping Information</h2>
            <div v-if="preFilledData.firstName" class="pre-fill-notice">
                <CheckIcon />
                <span>Information pre-filled from your account</span>
            </div>
        </div>

        <form @submit.prevent="handleSubmit" class="shipping-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="firstName" class="form-label">First Name *</label>
                    <input id="firstName" v-model="formState.data.firstName" type="text" class="form-input"
                        :class="{ 'error': hasFieldError('firstName') }" @blur="handleFieldBlur('firstName')"
                        required />
                    <div v-if="hasFieldError('firstName')" class="error-message">
                        {{ getFieldError('firstName') }}
                    </div>
                </div>
                <div class="form-group">
                    <label for="lastName" class="form-label">Last Name *</label>
                    <input id="lastName" v-model="formState.data.lastName" type="text" class="form-input"
                        :class="{ 'error': hasFieldError('lastName') }" @blur="handleFieldBlur('lastName')" required />
                    <div v-if="hasFieldError('lastName')" class="error-message">
                        {{ getFieldError('lastName') }}
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="address" class="form-label">Street Address *</label>
                <input id="address" v-model="formState.data.address" type="text" class="form-input"
                    :class="{ 'error': hasFieldError('address') }" placeholder="123 Main Street"
                    @blur="handleFieldBlur('address')" required />
                <div v-if="hasFieldError('address')" class="error-message">
                    {{ getFieldError('address') }}
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="city" class="form-label">City *</label>
                    <input id="city" v-model="formState.data.city" type="text" class="form-input"
                        :class="{ 'error': hasFieldError('city') }" @blur="handleFieldBlur('city')" required />
                    <div v-if="hasFieldError('city')" class="error-message">
                        {{ getFieldError('city') }}
                    </div>
                </div>
                <div class="form-group">
                    <label for="state" class="form-label">State *</label>
                    <input id="state" v-model="formState.data.state" type="text" class="form-input"
                        :class="{ 'error': hasFieldError('state') }" @blur="handleFieldBlur('state')" required />
                    <div v-if="hasFieldError('state')" class="error-message">
                        {{ getFieldError('state') }}
                    </div>
                </div>
                <div class="form-group">
                    <label for="zipCode" class="form-label">ZIP Code *</label>
                    <input id="zipCode" v-model="formState.data.zipCode" type="text" class="form-input"
                        :class="{ 'error': hasFieldError('zipCode') }" placeholder="12345"
                        @blur="handleFieldBlur('zipCode')" @input="handleZipCodeInput" required />
                    <div v-if="hasFieldError('zipCode')" class="error-message">
                        {{ getFieldError('zipCode') }}
                    </div>
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
                    Continue to Payment
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { watch, onMounted, h } from 'vue'
import { useFormValidation, createAddressValidationRules } from '~/composables/useFormValidation'
import { useFormFormatting } from '@/composables/useFormFormatting'
import type { ShippingData } from '~/types'

interface Props {
    modelValue: ShippingData
    preFilledData?: Partial<ShippingData>
}

interface Emits {
    (e: 'update:modelValue', value: ShippingData): void
    (e: 'submit'): void
    (e: 'validationChange', isValid: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
    preFilledData: () => ({})
})

const emit = defineEmits<Emits>()

// Initialize form validation
const initialData: ShippingData = {
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
}

const {
    formState,
    isFormValid,
    validateField,
    validateAllFields,
    setFormData,
    hasFieldError,
    getFieldError
} = useFormValidation(initialData, createAddressValidationRules())

const { formatZipCode } = useFormFormatting()

// Event handlers
const handleFieldBlur = (fieldName: string) => {
    validateField(fieldName)
}

const handleZipCodeInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    formState.data.zipCode = formatZipCode(target.value)
}

const handleSubmit = () => {
    if (validateAllFields()) {
        emit('submit')
    }
}

// Initialize form with existing data and pre-filled data
onMounted(() => {
    setFormData({ ...props.modelValue, ...props.preFilledData })
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
    setFormData(newValue)
}, { deep: true })

// Watch for pre-filled data changes
watch(() => props.preFilledData, (newData) => {
    if (newData) {
        setFormData(newData)
    }
}, { deep: true, immediate: true })

// Emit changes to parent
watch(() => formState.data, (newData) => {
    emit('update:modelValue', { ...newData } as ShippingData)
}, { deep: true })

// Emit validation changes
watch(isFormValid, (valid) => {
    emit('validationChange', valid)
})

// Icon component
const CheckIcon = () => h('svg', {
    width: '16',
    height: '16',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2'
}, [
    h('polyline', { points: '20,6 9,17 4,12' })
])
</script>

<style scoped>
.checkout-step {
    padding: 2rem;
}

.step-header {
    margin-bottom: 2rem;
}

.step-header h2 {
    margin-bottom: 1rem;
    font-size: 1.75rem;
    color: var(--text-color);
}

.pre-fill-notice {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background-color: #ecfdf5;
    border: 1px solid #d1fae5;
    border-radius: var(--border-radius);
    color: #065f46;
    font-size: 0.875rem;
    font-weight: 500;
}

.shipping-form {
    max-width: 600px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-row:has(.form-group:nth-child(3)) {
    grid-template-columns: 1fr 1fr 120px;
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

.form-actions {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border-color);
}

.form-input.error {
    border-color: var(--danger-color);
}

.error-message {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--danger-color);
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

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .checkout-step {
        padding: 1rem;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .form-row:has(.form-group:nth-child(3)) {
        grid-template-columns: 1fr;
    }
}
</style>