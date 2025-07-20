<template>
    <Teleport to="body">
        <div class="toast-container">
            <TransitionGroup name="toast" tag="div">
                <div v-for="toast in toasts" :key="toast.id" :class="['toast', `toast-${toast.type}`]"
                    @click="remove(toast.id)">
                    <div class="toast-icon">
                        <span v-if="toast.type === 'success'">✓</span>
                        <span v-else-if="toast.type === 'error'">✕</span>
                        <span v-else-if="toast.type === 'warning'">⚠</span>
                        <span v-else>ℹ</span>
                    </div>
                    <div class="toast-content">
                        <p class="toast-message">{{ toast.message }}</p>
                    </div>
                    <button class="toast-close" @click.stop="remove(toast.id)">
                        ✕
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)

const remove = (id: string) => {
    toastStore.remove(id)
}
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 400px;
    pointer-events: none;
}

.toast {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: white;
    border-radius: var(--border-radius, 8px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border-left: 4px solid;
    cursor: pointer;
    pointer-events: auto;
    min-width: 300px;
    transition: all 0.3s ease;
}

.toast:hover {
    transform: translateX(-4px);
}

.toast-success {
    border-left-color: #10b981;
    background-color: #f0fdf4;
}

.toast-error {
    border-left-color: #ef4444;
    background-color: #fef2f2;
}

.toast-warning {
    border-left-color: #f59e0b;
    background-color: #fffbeb;
}

.toast-info {
    border-left-color: #3b82f6;
    background-color: #eff6ff;
}

.toast-icon {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: bold;
    font-size: 0.875rem;
}

.toast-success .toast-icon {
    background-color: #10b981;
    color: white;
}

.toast-error .toast-icon {
    background-color: #ef4444;
    color: white;
}

.toast-warning .toast-icon {
    background-color: #f59e0b;
    color: white;
}

.toast-info .toast-icon {
    background-color: #3b82f6;
    color: white;
}

.toast-content {
    flex: 1;
}

.toast-message {
    margin: 0;
    color: #374151;
    font-size: 0.875rem;
    line-height: 1.4;
    font-weight: 500;
}

.toast-close {
    flex-shrink: 0;
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    transition: all 0.2s ease;
}

.toast-close:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: #374151;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

.toast-move {
    transition: transform 0.3s ease;
}

/* Mobile responsiveness */
@media (max-width: 480px) {
    .toast-container {
        top: 1rem;
        left: 1rem;
        right: 1rem;
        max-width: none;
    }

    .toast {
        min-width: auto;
    }
}
</style>