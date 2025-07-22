<template>
    <div class="payment-alternative">
        <div class="payment-placeholder">
            <div class="payment-placeholder-icon">
                <i :class="iconClass"></i>
            </div>
            <h3>{{ title }}</h3>
            <p>{{ description }}</p>
            <div class="demo-note">
                <small>{{ demoNote }}</small>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    paymentMethod: 'paypal' | 'apple-pay';
}

const props = defineProps<Props>();

// Dummy payment options
const config = {
    'paypal': {
        title: 'PayPal Payment',
        description: 'You will be redirected to PayPal to complete your payment securely.',
        iconClass: 'fab fa-paypal',
        demoNote: 'Demo Mode: PayPal integration would be implemented here'
    },
    'apple-pay': {
        title: 'Apple Pay',
        description: 'Use Touch ID or Face ID to pay with Apple Pay.',
        iconClass: 'fab fa-apple-pay',
        demoNote: 'Demo Mode: Apple Pay integration would be implemented here'
    }
};

const { title, description, iconClass, demoNote } = config[props.paymentMethod];
</script>

<style scoped>
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

.demo-note {
    background-color: var(--warning-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    display: inline-block;
}

@media (max-width: 768px) {
    .payment-placeholder-icon {
        font-size: 2.5rem;
    }
}
</style>