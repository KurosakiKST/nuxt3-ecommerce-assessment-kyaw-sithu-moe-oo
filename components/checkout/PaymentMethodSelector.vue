<template>
    <div class="payment-methods">
        <h3>Select Payment Method</h3>
        <div class="payment-options">
            <label v-for="method in methods" :key="method.value" class="payment-option"
                :class="{ active: selectedMethod === method.value }">
                <input v-model="selectedMethod" type="radio" :value="method.value" @change="handleMethodChange" />
                <div class="payment-option-content">
                    <div class="payment-icon">
                        <i :class="method.iconClass"></i>
                    </div>
                    <span>{{ method.label }}</span>
                </div>
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface PaymentMethod {
    value: string;
    label: string;
    iconClass: string;
}

interface Props {
    modelValue: string;
    methods?: PaymentMethod[];
}

interface Emits {
    (e: 'update:modelValue', value: string): void;
    (e: 'methodChanged', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
    methods: () => [
        { value: 'card', label: 'Credit/Debit Card', iconClass: 'fas fa-credit-card' },
        { value: 'paypal', label: 'PayPal', iconClass: 'fab fa-paypal' },
        { value: 'apple-pay', label: 'Apple Pay', iconClass: 'fab fa-apple-pay' }
    ]
});

const emit = defineEmits<Emits>();

const selectedMethod = ref(props.modelValue);

watch(selectedMethod, (newValue) => {
    emit('update:modelValue', newValue);
});

const handleMethodChange = () => {
    emit('methodChanged', selectedMethod.value);
};
</script>

<style scoped>
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

.payment-icon .fa-paypal {
    color: #0070ba;
}

.payment-icon .fa-apple-pay {
    color: #000000;
}

.payment-icon .fa-credit-card {
    color: var(--primary-color);
}

@media (max-width: 768px) {
    .payment-options {
        grid-template-columns: 1fr;
    }

    .payment-icon {
        width: 1.75rem;
        height: 1.75rem;
        font-size: 1.25rem;
    }
}
</style>
