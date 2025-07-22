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
                    <input id="firstName" v-model="formData.firstName" type="text" class="form-input"
                        :class="{ 'error': errors.firstName }" @blur="handleBlur('firstName')" required />
                    <div v-if="errors.firstName" class="error-message">{{ errors.firstName }}</div>
                </div>
                <div class="form-group">
                    <label for="lastName" class="form-label">Last Name *</label>
                    <input id="lastName" v-model="formData.lastName" type="text" class="form-input"
                        :class="{ 'error': errors.lastName }" @blur="handleBlur('lastName')" required />
                    <div v-if="errors.lastName" class="error-message">{{ errors.lastName }}</div>
                </div>
            </div>

            <div class="form-group">
                <label for="address" class="form-label">Street Address *</label>
                <input id="address" v-model="formData.address" type="text" class="form-input"
                    :class="{ 'error': errors.address }" placeholder="123 Main Street" @blur="handleBlur('address')"
                    required />
                <div v-if="errors.address" class="error-message">{{ errors.address }}</div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="city" class="form-label">City *</label>
                    <input id="city" v-model="formData.city" type="text" class="form-input"
                        :class="{ 'error': errors.city }" @blur="handleBlur('city')" required />
                    <div v-if="errors.city" class="error-message">{{ errors.city }}</div>
                </div>
                <div class="form-group">
                    <label for="state" class="form-label">State *</label>
                    <input id="state" v-model="formData.state" type="text" class="form-input"
                        :class="{ 'error': errors.state }" @blur="handleBlur('state')" required />
                    <div v-if="errors.state" class="error-message">{{ errors.state }}</div>
                </div>
                <div class="form-group">
                    <label for="zipCode" class="form-label">ZIP Code *</label>
                    <input id="zipCode" v-model="formData.zipCode" type="text" class="form-input"
                        :class="{ 'error': errors.zipCode }" placeholder="12345" @blur="handleBlur('zipCode')"
                        required />
                    <div v-if="errors.zipCode" class="error-message">{{ errors.zipCode }}</div>
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
import { reactive, watch, onMounted } from 'vue'
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

const formData = reactive<ShippingData>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
})

const errors = reactive({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
})

const isFormValid = computed(() => {
    return formData.firstName.trim() !== '' &&
        formData.lastName.trim() !== '' &&
        formData.address.trim() !== '' &&
        formData.city.trim() !== '' &&
        formData.state.trim() !== '' &&
        formData.zipCode.trim() !== '' &&
        isValidZipCode(formData.zipCode) &&
        Object.values(errors).every(error => error === '')
})

const isValidZipCode = (zipCode: string): boolean => {
    return /^\d{5}(-\d{4})?$/.test(zipCode)
}

const validateField = (field: keyof ShippingData) => {
    switch (field) {
        case 'firstName':
        case 'lastName':
        case 'city':
        case 'state':
            errors[field] = formData[field].trim() === '' ? 'This field is required' : ''
            break
        case 'address':
            errors.address = formData.address.trim() === '' ? 'Street address is required' : ''
            break
        case 'zipCode':
            if (formData.zipCode.trim() === '') {
                errors.zipCode = 'ZIP code is required'
            } else if (!isValidZipCode(formData.zipCode)) {
                errors.zipCode = 'Please enter a valid ZIP code (12345 or 12345-6789)'
            } else {
                errors.zipCode = ''
            }
            break
    }
}

watch(isFormValid, (valid) => {
    emit('validationChange', valid)
})

const handleBlur = (field: keyof ShippingData) => {
    validateField(field)
}

// Initialize form with existing data and pre-filled data
onMounted(() => {
    Object.assign(formData, props.modelValue, props.preFilledData)
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
    Object.assign(formData, newValue)
}, { deep: true })

// Watch for pre-filled data changes
watch(() => props.preFilledData, (newData) => {
    if (newData) {
        Object.assign(formData, newData)
    }
}, { deep: true, immediate: true })

// Emit changes to parent
watch(formData, (newData) => {
    emit('update:modelValue', { ...newData })
}, { deep: true })

const handleSubmit = () => {
    // Validate all fields
    Object.keys(formData).forEach(field => {
        validateField(field as keyof ShippingData)
    })

    if (isFormValid.value) {
        emit('submit')
    }
}

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