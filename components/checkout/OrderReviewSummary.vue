<template>
    <div class="checkout-step">
        <h2>Order Review</h2>

        <div class="review-sections">
            <!-- Shipping Summary -->
            <div class="review-section">
                <h3>Shipping Information</h3>
                <div class="review-content">
                    <p><strong>{{ shippingInfo.firstName }} {{ shippingInfo.lastName }}</strong></p>
                    <p>{{ shippingInfo.address }}</p>
                    <p>{{ shippingInfo.city }}, {{ shippingInfo.state }} {{ shippingInfo.zipCode }}</p>
                </div>
                <button @click="$emit('editShipping')" class="btn-link">Edit</button>
            </div>

            <!-- Payment Summary -->
            <div class="review-section">
                <h3>Payment Method</h3>
                <div class="review-content">
                    <div v-if="paymentInfo.method === 'card'" class="payment-summary">
                        <p><strong>Credit Card</strong></p>
                        <p>**** **** **** {{ paymentInfo.cardNumber?.slice(-4) }}</p>
                        <p>{{ paymentInfo.cardName }}</p>
                    </div>
                    <div v-else-if="paymentInfo.method === 'paypal'" class="payment-summary">
                        <p><strong>PayPal</strong></p>
                    </div>
                    <div v-else-if="paymentInfo.method === 'apple-pay'" class="payment-summary">
                        <p><strong>Apple Pay</strong></p>
                    </div>
                </div>
                <button @click="$emit('editPayment')" class="btn-link">Edit</button>
            </div>

            <!-- Order Items -->
            <div class="review-section">
                <h3>Order Items</h3>
                <div class="order-items">
                    <div v-for="item in orderItems" :key="item.id" class="order-item">
                        <img :src="item.product.thumbnail" :alt="item.product.title" class="item-image" />
                        <div class="item-details">
                            <h4>{{ item.product.title }}</h4>
                            <p>Quantity: {{ item.quantity }}</p>
                        </div>
                        <div class="item-price">${{ (item.product.price * item.quantity).toFixed(2) }}</div>
                    </div>
                </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="terms-section">
                <label class="checkbox-wrapper">
                    <input v-model="termsAccepted" type="checkbox" required />
                    <span class="checkmark"></span>
                    I agree to the <a href="/terms" class="terms-link" target="_blank" rel="noopener noreferrer">Terms
                        and Conditions</a> and <a href="/privacy" class="terms-link" target="_blank"
                        rel="noopener noreferrer">Privacy Policy</a>
                </label>
            </div>
        </div>

        <div class="form-actions">
            <button @click="$emit('previousStep')" type="button" class="btn btn-outline">
                Back to Payment
            </button>
            <button @click="handlePlaceOrder" class="btn btn-primary" :disabled="!termsAccepted || isProcessing">
                {{ isProcessing ? 'Processing...' : `Place Order - ${totalAmount.toFixed(2)}` }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Product {
    id: number;
    title: string;
    price: number;
    thumbnail: string;
}

interface OrderItem {
    id: number;
    product: Product;
    quantity: number;
}

interface ShippingInfo {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
}

interface PaymentInfo {
    method: string;
    cardNumber?: string;
    cardName?: string;
}

interface Props {
    shippingInfo: ShippingInfo;
    paymentInfo: PaymentInfo;
    orderItems: OrderItem[];
    totalAmount: number;
}

interface Emits {
    (e: 'editShipping'): void;
    (e: 'editPayment'): void;
    (e: 'previousStep'): void;
    (e: 'placeOrder'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const termsAccepted = ref(false);
const isProcessing = ref(false);

const handlePlaceOrder = async () => {
    if (!termsAccepted.value) {
        return;
    }

    isProcessing.value = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        emit('placeOrder');
    } catch (error) {
        console.error('Error placing order:', error);
    } finally {
        isProcessing.value = false;
    }
};
</script>

<style scoped>
.checkout-step h2 {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.review-sections {
    margin-bottom: 2rem;
}

.review-section {
    background-color: #f9fafb;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    margin-bottom: 1rem;
    position: relative;
}

.review-section h3 {
    margin-bottom: 1rem;
    color: var(--text-color);
}

.review-content {
    margin-bottom: 0.5rem;
}

.review-content p {
    margin: 0.25rem 0;
}

.btn-link {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: var(--primary-color);
    text-decoration: underline;
    cursor: pointer;
    font-size: 0.875rem;
}

.btn-link:hover {
    color: #1d4ed8;
}

.payment-summary {
    background-color: white;
    padding: 1rem;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
}

.order-items {
    background-color: white;
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    overflow: hidden;
}

.order-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.order-item:last-child {
    border-bottom: none;
}

.order-item .item-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--border-radius);
}

.order-item .item-details {
    flex: 1;
}

.order-item .item-details h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
}

.order-item .item-details p {
    margin: 0;
    color: var(--text-light);
    font-size: 0.875rem;
}

.order-item .item-price {
    font-weight: 600;
    color: var(--primary-color);
}

.terms-section {
    background-color: #f0f7ff;
    border: 1px solid var(--primary-color);
    border-radius: var(--border-radius);
    padding: 1rem;
    margin-bottom: 1rem;
}

.terms-section .checkbox-wrapper {
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

.terms-link {
    color: var(--primary-color);
    text-decoration: underline;
}

.terms-link:hover {
    color: #1d4ed8;
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
    .btn-link {
        position: static;
        margin-top: 1rem;
    }

    .form-actions {
        justify-content: center;
        flex-direction: column;
    }
}
</style>