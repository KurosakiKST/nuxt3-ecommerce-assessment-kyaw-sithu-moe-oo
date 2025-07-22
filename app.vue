<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Initialize auth on app mount
const authStore = useAuthStore()

onMounted(async () => {
  try {
    await authStore.initAuth()
  } catch (e) {
    console.error('Auth init failed', e)
  }
})

// Initialize cart from localStorage
const cartStore = useCartStore()
onMounted(() => {
  try {
    cartStore.loadFromLocalStorage()
  } catch (e) {
    console.error('Cart load failed', e)
  }
})
</script>