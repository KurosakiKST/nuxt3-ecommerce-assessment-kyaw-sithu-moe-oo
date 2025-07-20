import { defineStore } from 'pinia'

export interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}

export const useToastStore = defineStore('toast', {
    state: () => ({
        toasts: [] as Toast[]
    }),

    actions: {
        show(message: string, type: Toast['type'] = 'info', duration: number = 3000) {
            const id = Math.random().toString(36).substr(2, 9)

            const toast: Toast = {
                id,
                message,
                type,
                duration
            }

            this.toasts.push(toast)

            // Auto remove after duration
            setTimeout(() => {
                this.remove(id)
            }, duration)

            return id
        },

        success(message: string, duration?: number) {
            return this.show(message, 'success', duration)
        },

        error(message: string, duration?: number) {
            return this.show(message, 'error', duration)
        },

        warning(message: string, duration?: number) {
            return this.show(message, 'warning', duration)
        },

        info(message: string, duration?: number) {
            return this.show(message, 'info', duration)
        },

        remove(id: string) {
            const index = this.toasts.findIndex(toast => toast.id === id)
            if (index > -1) {
                this.toasts.splice(index, 1)
            }
        },

        clear() {
            this.toasts = []
        }
    }
})