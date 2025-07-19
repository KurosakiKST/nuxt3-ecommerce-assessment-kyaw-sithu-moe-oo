<template>
    <div class="checkout-steps">
        <div class="step" :class="{ active: currentStep >= 1 }">
            <span class="step-number">1</span>
            <span class="step-label">Shipping</span>
        </div>
        <div class="step" :class="{ active: currentStep >= 2 }">
            <span class="step-number">2</span>
            <span class="step-label">Payment</span>
        </div>
        <div class="step" :class="{ active: currentStep >= 3 }">
            <span class="step-number">3</span>
            <span class="step-label">Review</span>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    currentStep: number;
}

defineProps<Props>();
</script>

<style scoped>
.checkout-steps {
    display: flex;
    justify-content: center;
    gap: 2rem;
}

.step {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.5;
    transition: opacity 0.3s ease;
}

.step.active {
    opacity: 1;
}

.step-number {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: var(--border-color);
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
}

.step.active .step-number {
    background-color: var(--primary-color);
    color: white;
}

.step-label {
    font-weight: 500;
}

@media (max-width: 768px) {
    .checkout-steps {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
}
</style>