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
                    <label for="billingFirstName" class="form-label">First Name</label>
                    <input id="billingFirstName" v-model="localForm.firstName" type="text" class="form-input"
                        required />
                </div>
                <div class="form-group">
                    <label for="billingLastName" class="form-label">Last Name</label>
                    <input id="billingLastName" v-model="localForm.lastName" type="text" class="form-input" required />
                </div>
            </div>

            <div class="form-group">
                <label for="billingAddress" class="form-label">Street Address</label>
                <input id="billingAddress" v-model="localForm.address" type="text" class="form-input" required />
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="billingCity" class="form-label">City</label>
                    <input id="billingCity" v-model="localForm.city" type="text" class="form-input" required />
                </div>
                <div class="form-group">
                    <label for="billingState" class="form-label">State</label>
                    <input id="billingState" v-model="localForm.state" type="text" class="form-input" required />
                </div>
                <div class="form-group">
                    <label for="billingZipCode" class="form-label">ZIP Code</label>
                    <input id="billingZipCode" v-model="localForm.zipCode" type="text" class="form-input" required />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { BillingAddress } from '~/types';

interface Props {
    modelValue: BillingAddress;
    shippingAddress: BillingAddress;
}

interface Emits {
    (e: 'update:modelValue', value: BillingAddress): void;
    (e: 'sameAsShippingChange', sameAsShipping: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localForm = reactive<BillingAddress>({ ...props.modelValue });
const sameAsShipping = ref(true);

const handleSameAsShippingChange = () => {
    if (sameAsShipping.value) {
        Object.assign(localForm, props.shippingAddress);
    } else {
        Object.keys(localForm).forEach(key => {
            localForm[key as keyof BillingAddress] = '';
        });
    }
    emit('sameAsShippingChange', sameAsShipping.value);
};

watch(localForm, (newValue) => {
    emit('update:modelValue', { ...newValue });
}, { deep: true });

watch(() => props.shippingAddress, (newShippingAddress) => {
    if (sameAsShipping.value) {
        Object.assign(localForm, newShippingAddress);
    }
}, { deep: true });
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