<template>
    <div class="order-success-page">
        <div class="container">
            <div class="success-card">
                <div class="success-icon">
                    <div class="checkmark-circle">
                        <div class="checkmark">✓</div>
                    </div>
                </div>

                <div class="success-content">
                    <h1>Order Placed Successfully!</h1>
                    <p class="order-confirmation">
                        Thank you for your purchase. Your order has been confirmed and will be shipped soon.
                    </p>

                    <div class="order-details" v-if="orderInfo">
                        <div class="detail-item">
                            <span class="label">Order Number:</span>
                            <span class="value">#{{ orderInfo.orderId }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Order Date:</span>
                            <span class="value">{{ formatDate(orderInfo.orderDate) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Total Amount:</span>
                            <span class="value">${{ orderInfo.total?.toFixed(2) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Email:</span>
                            <span class="value">{{ orderInfo.email || 'confirmation@example.com' }}</span>
                        </div>
                    </div>

                    <div class="next-steps">
                        <h3>What's Next?</h3>
                        <ul>
                            <li>You'll receive an email confirmation shortly</li>
                            <li>We'll send you tracking information once your order ships</li>
                            <li>Estimated delivery: 3-5 business days</li>
                        </ul>
                    </div>

                    <div class="action-buttons">
                        <NuxtLink to="/products" class="btn btn-primary">
                            Continue Shopping
                        </NuxtLink>
                        <NuxtLink to="/profile" class="btn btn-outline">
                            View Order History
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- Order Summary Card -->
            <div class="order-summary-card" v-if="orderItems?.length">
                <h3>Order Summary</h3>
                <div class="summary-items">
                    <div v-for="item in orderItems" :key="item.id" class="summary-item">
                        <img :src="item.product.thumbnail" :alt="item.product.title" class="item-image" />
                        <div class="item-details">
                            <h4>{{ item.product.title }}</h4>
                            <p>Quantity: {{ item.quantity }}</p>
                            <p class="item-price">${{ (item.product.price * item.quantity).toFixed(2) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'default'
})

interface OrderInfo {
    orderId: string
    orderDate: Date
    total: number
    email?: string
}

interface OrderItem {
    id: number
    product: {
        id: number
        title: string
        price: number
        thumbnail: string
    }
    quantity: number
}

// Get order information from route query or generate defaults
const route = useRoute()
const router = useRouter()

// Parse order info from query parameters or session storage
const orderInfo = ref<OrderInfo | null>(null)
const orderItems = ref<OrderItem[]>([])

onMounted(() => {
    // Try to get order info from query params first
    if (route.query.orderId) {
        orderInfo.value = {
            orderId: route.query.orderId as string,
            orderDate: new Date(),
            total: parseFloat(route.query.total as string) || 0,
            email: route.query.email as string
        }
    } else {
        // Try to get from session storage (if set during checkout)
        if (process.client) {
            const savedOrderInfo = sessionStorage.getItem('lastOrderInfo')
            const savedOrderItems = sessionStorage.getItem('lastOrderItems')

            if (savedOrderInfo) {
                orderInfo.value = JSON.parse(savedOrderInfo)
            }

            if (savedOrderItems) {
                orderItems.value = JSON.parse(savedOrderItems)
            }

            // Clean up session storage
            sessionStorage.removeItem('lastOrderInfo')
            sessionStorage.removeItem('lastOrderItems')
        }
    }

    // If no order info found, redirect to home
    if (!orderInfo.value) {
        console.warn('No order information found, redirecting to home')
        router.push('/')
    }
})

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date))
}

// Set page title
useHead({
    title: 'Order Confirmed - Thank You!'
})
</script>

<style scoped>
.order-success-page {
    padding: 2rem 0;
    min-height: 80vh;
    background-color: #f8fafc;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
}

.success-card {
    background: white;
    border-radius: var(--border-radius);
    padding: 3rem 2rem;
    text-align: center;
    box-shadow: var(--shadow-sm);
    margin-bottom: 2rem;
}

.success-icon {
    margin-bottom: 2rem;
}

.checkmark-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: var(--success-color);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    animation: scaleIn 0.5s ease-out;
}

.checkmark {
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
}

@keyframes scaleIn {
    from {
        transform: scale(0);
    }

    to {
        transform: scale(1);
    }
}

.success-content h1 {
    color: var(--success-color);
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

.order-confirmation {
    font-size: 1.125rem;
    color: var(--text-light);
    margin-bottom: 2rem;
}

.order-details {
    background-color: #f8fafc;
    border-radius: var(--border-radius);
    padding: 1.5rem;
    margin-bottom: 2rem;
    text-align: left;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
    border-bottom: none;
}

.detail-item .label {
    font-weight: 600;
    color: var(--text-color);
}

.detail-item .value {
    color: var(--text-light);
    font-family: monospace;
}

.next-steps {
    text-align: left;
    margin-bottom: 2rem;
}

.next-steps h3 {
    color: var(--text-color);
    margin-bottom: 1rem;
}

.next-steps ul {
    list-style: none;
    padding: 0;
}

.next-steps li {
    padding: 0.5rem 0;
    position: relative;
    padding-left: 1.5rem;
}

.next-steps li::before {
    content: "→";
    position: absolute;
    left: 0;
    color: var(--primary-color);
    font-weight: bold;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.order-summary-card {
    background: white;
    border-radius: var(--border-radius);
    padding: 2rem;
    box-shadow: var(--shadow-sm);
}

.order-summary-card h3 {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-color);
}

.summary-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.summary-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background-color: #f8fafc;
}

.item-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--border-radius);
    flex-shrink: 0;
}

.item-details {
    flex: 1;
}

.item-details h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: var(--text-color);
}

.item-details p {
    margin: 0.25rem 0;
    color: var(--text-light);
    font-size: 0.875rem;
}

.item-price {
    font-weight: 600;
    color: var(--primary-color) !important;
}

@media (max-width: 768px) {
    .success-card {
        padding: 2rem 1rem;
    }

    .success-content h1 {
        font-size: 2rem;
    }

    .action-buttons {
        flex-direction: column;
    }

    .detail-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
    }

    .summary-item {
        flex-direction: column;
        text-align: center;
    }

    .item-image {
        align-self: center;
    }
}
</style>