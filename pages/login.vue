<template>
  <div class="auth-form">
    <h2>Sign In</h2>
    <p class="auth-subtitle">Welcome back! Please login to your account.</p>

    <!-- Show checkout notice if coming from checkout -->
    <div v-if="isCheckoutFlow" class="checkout-notice">
      Please sign in to continue with your checkout
    </div>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username" class="form-label">Username</label>
        <input id="username" v-model="credentials.username" type="text" class="form-input"
          placeholder="Enter your username" required />
      </div>

      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <input id="password" v-model="credentials.password" type="password" class="form-input"
          placeholder="Enter your password" required />
      </div>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>

    <div class="demo-credentials">
      <h4>Demo Credentials:</h4>
      <div class="credential-item">
        <strong>Username:</strong> emilys
        <strong>Password:</strong> emilyspass
      </div>
      <div class="credential-item">
        <strong>Username:</strong> michaelw
        <strong>Password:</strong> michaelwpass
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginCredentials } from '~/types'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const route = useRoute()
const authStore = useAuthStore()

const credentials = reactive<LoginCredentials>({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref<string | null>(null)

const isCheckoutFlow = computed(() => {
  const redirect = route.query.redirect as string

  if (!redirect) return false

  // Decode the URL to handle %2F encoding
  const decodedRedirect = decodeURIComponent(redirect)
  console.log('Login page - decoded redirect:', decodedRedirect)

  const isCheckout = decodedRedirect.includes('/checkout')
  console.log('Login page - is checkout flow:', isCheckout)

  return isCheckout
})

const handleLogin = async () => {
  loading.value = true
  error.value = null

  try {
    await authStore.login(credentials)

    const redirectPath = route.query.redirect as string
    if (redirectPath) {
      await navigateTo(decodeURIComponent(redirectPath))
    } else {
      await navigateTo('/dashboard')
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
}

.auth-form h2 {
  text-align: center;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 2rem;
}

.checkout-notice {
  padding: 0.75rem 1rem;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: var(--border-radius);
  color: #1e40af;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
}

.auth-form form {
  margin-bottom: 1.5rem;
}

.auth-form .btn {
  width: 100%;
  padding: 0.875rem;
}

.auth-footer {
  text-align: center;
  color: var(--text-light);
}

.demo-credentials {
  margin-top: 2rem;
  padding: 1rem;
  background-color: var(--light-color);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.demo-credentials h4 {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-color);
}

.credential-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: var(--text-light);
}

.credential-item strong {
  font-weight: 500;
}
</style>