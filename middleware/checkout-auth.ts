export default defineNuxtRouteMiddleware((to) => {
    const authStore = useAuthStore();

    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
        // Save intended checkout destination and redirect to login
        const loginUrl = `/login?redirect=${encodeURIComponent(
            to.fullPath
        )}&message=checkout-login`;
        return navigateTo(loginUrl);
    }
});
