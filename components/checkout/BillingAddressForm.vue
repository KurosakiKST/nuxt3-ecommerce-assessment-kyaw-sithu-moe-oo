<template>
    <div class="billing-address">
        <div class="billing-header">
            <h3>Billing Address</h3>
            <label class="checkbox-wrapper">
                <input v-model="sameAsShipping" type="checkbox" @change="handleSameAsShippingChange" />
                <span class="checkmark"></span>
                Same as shipping address
            </label>
        </div>

        <div v-if="!sameAsShipping" class="billing-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="billingFirstName" class="form-label">First Name *</label>
                    <input id="billingFirstName" v-model="formState.data.firstName" type="text" class="form-input"
                        :class="{ 'error': hasFieldError('firstName') }" @blur="handleFieldBlur('firstName')"
                        required />
                    <div v-if="hasFieldError('firstName')" class="error-message">
                        {{ getFieldError('firstName') }}
                    </div>
                </div>
                <div class="form-group">
                    <label for="billingLastName" class="form-label">Last Name *</label>
                    <input id="billingLastName" v-model="formState.data.lastName" type="text" class="form-input"
                        :class="{ 'error': hasFieldError('lastName') }" @blur="handleFieldBlur('lastName')" required />
                    <div v-if="hasFieldError('lastName')" class="error-message">
                        {{ getFieldError('lastName') }}
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="billingAddress" class="form-label">Street Address *</label>
                <input id="billingAddress" v-model="formState.data.address" type="text" class="form-input"
                    :class="{ 'error': hasFieldError('address') }" @blur="handleFieldBlur('address')" required />
                <div v-if="hasFieldError('address')" class="error-message">
                    {{ getFieldError('address') }}
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="billingCity" class="form-label">City *</label>
                    <input id="billingCity" v-model="formState.data.city" type="text" class="form-input"
                        :class="{ 'error': hasFieldError('city') }" @blur="handleFieldBlur('city')" required />
                    <div v-if="hasFieldError('city')" class="error-message">
                        {{ getFieldError('city') }}
                    </div>
                </div>
                <div class="form-group">
                    <label for="billingState" class="form-label">State *</label>
                    <input id="billingState" v-model="formState.data.state" type="text" class="form-input"
                        :class="{ 'error': hasFieldError('state') }" @blur="handleFieldBlur('state')" required />
                    <div v-if="hasFieldError('state')" class="error-message">
                        {{ getFieldError('state') }}
                    </div>
                </div>
                <div class="form-group">
                    <label for="billingZipCode" class="form-label">ZIP Code *</label>
                    <input id="billingZipCode" v-model="formState.data.zipCode" type="text" class="form-input"
                        :class="{ 'error': hasFieldError('zipCode') }" @blur="handleFieldBlur('zipCode')"
                        @input="handleZipCodeInput" required />
                    <div v-if="hasFieldError('zipCode')" class="error-message">
                        {{ getFieldError('zipCode') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useFormValidation, createAddressValidationRules } from '~/composables/useFormValidation'
import { useFormFormatting } from '~/composables/useFormFormatting'
import type { BillingAddress } from '~/types'

interface Props {
    modelValue: BillingAddress
    shippingAddress: BillingAddress
}

interface Emits {
    (e: 'update:modelValue', value: BillingAddress): void
    (e: 'sameAsShippingChange', sameAsShipping: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Initialize form validation
const initialData: BillingAddress = {
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
}

const {
    formState,
    validateField,
    setFormData,
    resetForm,
    hasFieldError,
    getFieldError
} = useFormValidation(initialData, createAddressValidationRules())

const { formatZipCode } = useFormFormatting()

const sameAsShipping = ref(true)

// Event handlers
const handleFieldBlur = (fieldName: string) => {
    validateField(fieldName)
}

const handleZipCodeInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    formState.data.zipCode = formatZipCode(target.value)
}

const handleSameAsShippingChange = () => {
    if (sameAsShipping.value) {
        setFormData(props.shippingAddress)
    } else {
        resetForm()
    }
    emit('sameAsShippingChange', sameAsShipping.value)
}

// Initialize form with existing data
onMounted(() => {
    setFormData(props.modelValue)
})

// Watch for shipping address changes
watch(() => props.shippingAddress, (newShippingAddress) => {
    if (sameAsShipping.value) {
        setFormData(newShippingAddress)
    }
}, { deep: true })

// Emit changes to parent
watch(() => formState.data, (newData) => {
    emit('update:modelValue', { ...newData } as BillingAddress)
}, { deep: true })
</script>

<style scoped>
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

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
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

@media (max-width: 768px) {
    .billing-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>