export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    // Save the current path and redirect to login with it
    const redirectPath = encodeURIComponent(to.fullPath)
    return navigateTo(`/login?redirect=${redirectPath}`)
  }
})