<template>
    <div class="category-page">
        <section class="categories-section">
            <div class="container">
                <h2>Shop by Category</h2>

                <div v-if="categoriesLoading" class="loading-container">
                    <div class="spinner"></div>
                </div>

                <div v-else class="categories-grid">
                    <NuxtLink v-for="category in categories"
                        :key="typeof category === 'string' ? category : category.slug"
                        :to="`/products?category=${typeof category === 'string' ? category : category.slug}`"
                        class="category-card">
                        <div class="category-icon">📦</div>
                        <h3>{{ formatCategoryName(category) }}</h3>
                    </NuxtLink>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types'

const { getCategories } = useProducts()

const categories = ref<Category[]>([])
const categoriesLoading = ref(true)

// Fetch categories
onMounted(async () => {
    try {
        categories.value = await getCategories()
    } catch (err) {
        console.error('Failed to load categories:', err)
    } finally {
        categoriesLoading.value = false
    }
})

const formatCategoryName = (category: any) => {
    const categoryName = typeof category === 'string' ? category : (category?.slug || category?.name || 'unknown')

    return categoryName
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}
</script>

<style scoped>
.category-page {
    min-height: 100vh;
}

.categories-section {
    padding: 2em 0;
    background-color: var(--light-color);
}

.categories-section h2 {
    text-align: center;
    margin-bottom: 3rem;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
}

.category-card {
    background-color: white;
    padding: 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    text-align: center;
    transition: all 0.2s ease;
}

.category-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    color: var(--primary-color);
}

.category-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.category-card h3 {
    font-size: 1.125rem;
    margin: 0;
}

@media (max-width: 768px) {
    .categories-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .categories-grid {
        grid-template-columns: 1fr;
    }
}
</style>