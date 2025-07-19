<template>
    <div class="checkout-step">
        <h2>Shipping Information</h2>

        <form @submit.prevent="handleSubmit">
            <div class="form-row">
                <div class="form-group">
                    <label for="firstName" class="form-label">First Name</label>
                    <input id="firstName" v-model="localForm.firstName" type="text" class="form-input" required />
                </div>
                <div class="form-group">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input id="lastName" v-model="localForm.lastName" type="text" class="form-input" required />
                </div>
            </div>

            <div class="form-group">
                <label for="address" class="form-label">Street Address</label>
                <input id="address" v-model="localForm.address" type="text" class="form-input" required />
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="city" class="form-label">City</label>
                    <input id="city" v-model="localForm.city" type="text" class="form-input" required />
                </div>
                <div class="form-group">
                    <label for="state" class="form-label">State</label>
                    <input id="state" v-model="localForm.state" type="text" class="form-input" required />
                </div>
                <div class="form-group">
                    <label for="zipCode" class="form-label">ZIP Code</label>
                    <input id="zipCode" v-model="localForm.zipCode" type="text" class="form-input" required />
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Continue to Payment</button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

interface ShippingFormData {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
}

interface Props {
    modelValue: ShippingFormData;
}

interface Emits {
    (e: 'update:modelValue', value: ShippingFormData): void;
    (e: 'submit'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const localForm = reactive<ShippingFormData>({ ...props.modelValue });

watch(localForm, (newValue) => {
    emit('update:modelValue', { ...newValue });
}, { deep: true });

const handleSubmit = () => {
    emit('submit');
};
</script>

<style scoped>
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

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr;
    }

    .form-actions {
        justify-content: center;
        flex-direction: column;
    }
}
</style>